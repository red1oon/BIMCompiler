# Fast Script Reference

Every command of the [Fast Script Guide](FastScriptGuide.md) with its real output, for developers who want the shape of each answer. Start with the guide: it explains the words you use most. This page follows the guide's map: the door itself first, then **bim**, **mis** and **erp**, then the tools for developers. Each block here was run and its output pasted; the guide's test runs both pages.

## The door: lines, answers, scripts

How the door reads a line, what an answer carries, and how to run several lines. These blocks call `door.js`, the program red1 hands each line to.

### Your first command

One line, one verb, `key=value` pairs with no spaces around the `=`. Ask the HospitalGarage for its grid:

<!-- run: lines cut=700 -->
```text
$ node door.js 'modeller.lines building=HospitalGarage'
{"request":"d-mwiqhn1b-3186337-1","verb":"modeller.lines","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[],"ms":15019,"model":{"grid_source":"column-derived","system":"column-framed","material":"RC","mixed":true,"girders":228,"rotation_deg":-2,"frame":"building","lines":[{"id":"gx0","axis":"x","pos":128.131,"world":132.184},{"id":"gx1","axis":"x","pos":129.223,"world":133.277},{"id":"gx2","axis":"x","pos":133.277,"world":137.334},{"id":"gx3","axis":"x","pos":133.795,"world":137.851},{"id":"gx4","axis":"x","pos":134.811,"world":138.868},{"id":"gx5","axis":"x","pos":145.987,"world":150.051},{"id":"gx6","axis":"x","pos":157.163,"world":161.234},{"id":"gx7…
```

It opens the Modeller and the building, so it takes 10 to 40 seconds. What you see is one line of JSON, an **envelope**. Only the start is shown here; the grid has more lines than fit. The answer is the app's own, unchanged, inside `answer`. Here `gx5` is at 145.987 m and `gx6` at 157.163 m on the building's own grid. `status` is `ok`.

!!! note "Where does the 'request' come from?"
    Every line gets a request id (`"request":"d-…"`) and is written to a journal before it runs, in `~/.cache/bim_door/journal.jsonl`. Send the same id twice and you get the first answer back, so a retry never repeats a change. The door also prints one `§DOOR …` line on the error stream; this guide shows only the standard output.

### One verb for a whole request

A request such as *"make the bay between gx5 and gx6 13 m wide"* is several steps: read the grid, work out the move, try the shift. The verb `modeller.widen_bay` does all three. Its inputs are the two lines and the width you want:

<!-- run: widen -->
```text
$ node door.js 'modeller.widen_bay building=HospitalGarage from=gx5 to=gx6 target=13' > widen.json; echo "exit $?"
exit 3
```

The exit code is the first answer: `0` means ok, `3` means the app gave an answer that is not a plain yes (refused, held or inconclusive), `1` means an error and `2` means a wrong command. Now look inside the file. The whole request comes first, then its two steps, each with its own envelope:

<!-- run: widen_steps cut=200 -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' widen.json
"request":"d-mwiqhyza-3186904-1","verb":"modeller.widen_bay","actor":"human","status":"refused"
"request":"d-mwiqhyza-3186904-1.1","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwiqhyza-3186904-1.2","verb":"modeller.try_shift","actor":"human","status":"refused"
```

The first step read the grid. It found the bay now:

<!-- run: widen_read -->
```text
$ grep -o '"id":"gx[56]","axis":"x","pos":[0-9.]*' widen.json
"id":"gx5","axis":"x","pos":145.987
"id":"gx6","axis":"x","pos":157.163
```

So the bay is 157.163 − 145.987 = **11.176 m**. To reach 13 m the line `gx6`, and every line after it, must move **1.824 m**. The door worked that out, and the second step passed it on:

<!-- run: widen_move -->
```text
$ grep -o '"move":[0-9.]*' widen.json | head -1
"move":1.824
```

The app tried the shift, checked it, and **stopped it**:

<!-- run: widen_why -->
```text
$ grep -o '"why":"[^"]*"' widen.json | tail -1
"why":"line 2 (modeller.try_shift): stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"
```

The change was made, judged and undone. Nothing is ever saved. The numbers behind the stop are in the app's report:

<!-- run: widen_bay -->
```text
$ grep -o '"bay":"gx5-gx6"[^}]*' widen.json
"bay":"gx5-gx6","before":11.176,"after":13,"newly_over":true
```

The bay went from 11.176 m to 13 m, over this building's 12 m limit for a concrete beam (`limit` and `material` come from the building itself). That is the whole story of the Garage request: a 13 m bay needs another column line.

### A script: several lines, a named result

A script is a text file with one command per line. A line may start with a **name** and an `=`, which keeps its answer for the lines below. Anything after `--` is a comment. Save this as `bay.door`:

<!-- file: bay.door -->
```text
-- read the grid, then widen the bay between gx5 and gx6 to exactly 12 m
lines = modeller.lines building=HospitalGarage
modeller.try_shift building=HospitalGarage line=gx6 move={12 - (lines.model.lines[gx6].pos - lines.model.lines[gx5].pos)}
```

Run it with `--script`:

<!-- run: script -->
```text
$ node door.js --script bay.door > bay.json; echo "exit $?"
exit 0
```

Text inside `{ }` is arithmetic. It may use numbers, `+ - * /`, brackets, and fields of a named result. `lines.model.lines[gx6].pos` means: in the answer named `lines`, under `model`, the entry of `lines` whose id is `gx6`, its `pos`. Only fields the verb declares can be read; any other name is an error that says so.

The arithmetic is **exact decimal**, not floating point. A computer using floating point gets `12 - 11.176 = 0.8239999999999998`. The door gets this:

<!-- run: script_move -->
```text
$ grep -o '"change":{"kind":"[^"]*","grid":"[^"]*","through":"[^"]*","lines":[0-9]*,"delta":[0-9.]*' bay.json
"change":{"kind":"block-shift","grid":"gx6","through":"gx16","lines":11,"delta":0.824
```

A script runs top to bottom and **stops at the first line that is not ok**. Here both answer `ok`:

<!-- run: script_status -->
```text
$ grep -o '"request":"[^"]*","verb":"[^"]*","actor":"[^"]*","status":"[^"]*"' bay.json
"request":"d-mwiqis8z-3188092-2","verb":"modeller.lines","actor":"human","status":"ok"
"request":"d-mwiqj50r-3188092-3","verb":"modeller.try_shift","actor":"human","status":"ok"
```

At exactly 12 m the app finds no new problem: the count of beam spans over the limit stays where it was.

<!-- run: script_span -->
```text
$ grep -o '"label":"Beam spans over limit","scope":"[^"]*","state":"JUDGED","before":[0-9]*,"after":[0-9]*,"delta":[0-9]*' bay.json
"label":"Beam spans over limit","scope":"228 walked girders, RC (mixed building)","state":"JUDGED","before":91,"after":91,"delta":0
```

So the same building, asked for 13 m, is stopped, and asked for 12 m, stands. An `ok` is not a promise that the building is good: the same [list of what is not checked](#what-is-not-checked) applies.

#### The line grammar

| Part | Rule |
|---|---|
| A command | `app.verb key=value key=value`, one per line |
| A value with spaces | put it in double quotes: `text="a note"` |
| A named result | `name = app.verb …`; later lines read `name.field` |
| Arithmetic | `{ … }` with numbers, `+ - * /`, brackets and result fields; exact decimals |
| A comment | `--` and the rest of the line |
| Units | never written on the line; the verb says metres, hours or days |
| Anything else | not a command: it comes back as a question, not as an action |

The last row is deliberate. Text that matches no verb is **never guessed at**:

<!-- run: question -->
```text
$ node door.js 'please widen the bay'
{"request":"d-mwlct5gy-1533105-1","verb":null,"actor":"human","status":"refused","answer":{"question":"I could not read that as a command. A command is app.verb key=value … Which one do you mean? Type help.","verbs":["modeller.lines","modeller.try_shift","viewer.counts","viewer.clashes","viewer.film_path","viewer.schedule_at","viewer.schedule_compare","modeller.widen_bay","modeller.walk","object.describe","object.read","object.history","object.update","object.attach","object.count","object.list","object.sum","object.group","witness.run","witness.last","legacy.status","legacy.query","mis.column","legacy.compare","idempiere.where","mis.pack","legacy.up","legacy.refresh","legacy.witness","legacy.check","legacy.plugin","model.open","model.convert","model.addbay","model.undo","model.save","model.close","erp.process","erp.order_state","erp.project_status","erp.ask","mis.lookup","viewer.cost","erp.find","erp.search","erp.actions","erp.complete","erp.void","erp.close","erp.reverse","erp.prepare","erp.reactivate","mis.describe","mis.read","mis.list","mis.sum","mis.group","mis.new","mis.update","mis.delete","mis.load","mis.add_window","ninja.exec","ninja.workflow","mis.diff","mis.menu","ninja.rollback","ninja.export","erp.column","erp.compare","erp.pack","erp.legacy_plugin","erp.describe","erp.read","erp.list","erp.sum","erp.group","erp.new"]},"why":"not a command: \"please widen the bay\"","notChecked":[],"ops":[],"next":[],"ms":4}
```

### Reading the reply

Every line, from every actor, gets the same envelope. Read these in order.

| Field | Meaning |
|---|---|
| `status` | `ok`, `refused`, `claim`, `error` or `inconclusive`. Read this first |
| `why` | the reason, when the status is not `ok` |
| `answer` | the app's own answer, unchanged |
| `notChecked` | what the check did not cover. Always pass it on |
| `request`, `verb`, `actor` | which line, which verb, who asked |
| `ops` | what was written, for a verb that writes |
| `next` | reserved; empty today |
| `ms` | how long it took |

The five statuses, each from a real run:

**ok.** The app answered and nothing was held back. The first command on this page is one. Even then, read `notChecked`.

**refused.** The app gave an answer that is not a yes. The 13 m request above is one: it was tried, judged and undone, and `why` says why. A refusal is an answer, not a failure. Text that is not a command is also `refused` (the question above).

**error.** The line itself is wrong: a missing input, an unknown verb, a value of the wrong kind. Nothing ran.

<!-- run: error -->
```text
$ node door.js 'modeller.lines'
{"request":"d-mwiqjlky-3189400-1","verb":"modeller.lines","actor":"human","status":"error","answer":null,"why":"missing input: building","notChecked":[],"ops":[],"next":[],"ms":6}
```

**claim.** The line is understood, but the actor has no proof that allows it, so the door **holds it and does not run it**. This is the safety rule for an AI, and it comes from the verb, not from the actor. See [What is a claim](#what-is-a-claim).

<!-- run: claim -->
```text
$ node door.js --actor ai --request ai-1 'object.update building=Duplex kind=Element uu=abc column=Name value=x'
{"request":"ai-1","verb":"object.update","actor":"ai","status":"claim","answer":null,"why":"actor ai has proof \"local-user\", which allows read/trial verbs; object.update is writes. Held as a claim, not run. A person confirms it with: door.js --confirm ai-1","notChecked":[],"ops":[],"next":[],"ms":11}
```

**inconclusive.** The app could not judge, and says so. It is never turned into an `ok`. Here the Viewer has no clash rule for the pair ARC and ZZZ. This one needs a checkout:

<!-- run: inconclusive -->
```text
$ node common/door/door.js 'viewer.clashes building=Duplex discA=ARC discB=ZZZ'
{"request":"d-mwiqjly7-3189440-1","verb":"viewer.clashes","actor":"human","status":"inconclusive","answer":null,"why":"the Viewer could not answer (exit 1): the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ in clash_rules.json","notChecked":[],"ops":[],"next":[],"ms":19539}
```

#### What is a claim

Each verb has a **harm class**: `read` (changes nothing), `trial` (a change made on a throwaway copy, judged, never saved), `writes`, `posts` or `sends`. The class is written once, in the verb list, so no actor can talk its way around it.

Each actor has a proof. A person at the terminal is trusted for every class. An **AI** is trusted for `read` and `trial` only: it may look and it may try, but a `writes`, `posts` or `sends` verb from an AI is held as a claim, as the `object.update` line above was. An actor with no proof at all, such as a mail from an unknown sender, may read and nothing else:

<!-- run: claim_email -->
```text
$ node door.js --actor email --request mail-0 'modeller.try_shift building=HospitalGarage line=gx6 move=1.824'
{"request":"mail-0","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-0","notChecked":[],"ops":[],"next":[],"ms":7}
```

A held claim is not run, not queued and not lost: it is in the journal, under its request id. The door does not confirm anything on anyone's behalf.

#### Confirm a claim

A person lets a held claim through **by its request id**, so the line that runs is exactly the line that was proposed. Nobody re-types it. Here a mail asks for a trial move and is held:

<!-- run: confirm_claim -->
```text
$ node door.js --journal claims.jsonl --actor email --request mail-1 'modeller.try_shift building=HospitalGarage line=gx6 move=0.824'
{"request":"mail-1","verb":"modeller.try_shift","actor":"email","status":"claim","answer":null,"why":"actor email has proof \"none\", which allows read verbs; modeller.try_shift is trial. Held as a claim, not run. A person confirms it with: door.js --confirm mail-1","notChecked":[],"ops":[],"next":[],"ms":7}
```

`--claims` lists what is being held:

<!-- run: confirm_list -->
```text
$ node door.js --journal claims.jsonl --claims | grep -o '"actor":"[a-z]*","line":"[^"]*","verb":"[^"]*","harm":"[a-z]*"'
"actor":"email","line":"modeller.try_shift building=HospitalGarage line=gx6 move=0.824","verb":"modeller.try_shift","harm":"trial"
```

`--confirm` runs the recorded line, as you, once:

<!-- run: confirm_run cut=200 -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1
{"request":"mail-1#confirmed","verb":"modeller.try_shift","actor":"human","status":"ok","answer":{"ok":true,"building":"HospitalGarage","edits":[{"tag":"EDIT_REPORT","version":1,"change":{"kind":"bloc…
```

The reply is the ordinary one, and it names the claim it confirmed. Asking again runs nothing: the door answers from its record.

<!-- run: confirm_again -->
```text
$ node door.js --journal claims.jsonl --confirm mail-1 | grep -o '"confirms":"[^"]*"'
"confirms":"mail-1"
```

Three rules hold. Only a person at the terminal may confirm: `--actor ai --confirm …` is refused and the claim stays held. The app still decides at the moment of confirming, so a line that has become wrong since it was proposed is refused with the app's reason. And an AI's tool connection has no confirm command at all.

**What this does not prove.** The door trusts whoever is at the local terminal. An AI that is allowed to run shell commands on your machine could type `--confirm` itself, just as it could type a line as you. Keep an AI's access to its tool connection if that matters.

### Use the door from a script of your own

Everything above is `door.js`, the same file the AI connection uses. From your own program, call it as a command and read its JSON: the exit code (`0`, `3`, `1`, `2`) says whether to read an answer or a problem, and `status` says which. `--actor human` is the default; `--actor ai` makes the door treat the line as an AI's.

### Choose how the answer is shown, and keep it

The reply is the JSON envelope unless you ask otherwise. Three switches show the rows of an answer as something a person or a spreadsheet can read; the envelope is still what the door records:

- `--list`: an aligned table, ending `shown N of TOTAL`. A reply that is one record shows `field: value` lines.
- `--csv`: the rows as CSV (RFC 4180: a cell with a comma, a quote or a new line is quoted; numbers are exactly as the engine returned them).
- `--out FILE` writes the chosen form to a file in the current folder instead of the screen. A line that is refused, held or inconclusive writes no file and says so.

<!-- run: csv_orders -->
```text
$ node common/door/door.js --csv 'mis.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo,DocStatus,GrandTotal
80001,CO,100.7
80001,CO,100.7
800002,CO,2160
```

In a script, end a line with `> file` to send that line's answer to a file in the script's folder (`>> file` adds to it). The form follows the name: `.csv` is CSV, `.json` is the envelope, anything else is the list. A path that leaves the script's folder is refused.

These switches live in a fifth file, `render.js`; put it beside `door.js` when you use them from a download:

```text
curl -O https://red1oon.github.io/bim-ootb/common/door/render.js
```

### Ask the door: `help`

The door has a `help` of its own, over the door verbs (red1's `help` shows the short words in their groups instead). `door.js help` shows the common commands, each as a line you can run. `door.js help erp` lists every `erp.*` door verb, which is not red1's `help erp` word group; `help erp.find` shows one verb whole (what it does, each input, what it may change, who may run it), and `help all` lists everything. Help is generated from the same verb list as the table below, reads nothing, runs nothing and is not recorded in the journal.

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

### Grey suggestions while you type

At the prompt of a terminal, grey text after the cursor suggests what comes next. The source is the dictionary, chosen by where you are in the line: the first word (the red1 words and the door verbs); after `cd`, the buildings and the ERP kinds (`cd Busi` suggests `cd "Business Partner"`); after `do`, the DocAction codes; then the column names of the kind you are in; after `key=`, the legal values. **Tab** or **→** takes the suggestion; typing on ignores it; **Return always runs what you typed**, never the suggestion. A misspelt name gets a hint (`▸ Value`) that Tab can take, never a silent fix. In a one-shot line, a script or an AI there is no suggestion, and a wrong column is a refusal that names the nearest ones:

<!-- run: red1_typo -->
```text
$ printf 'cd Project\nls Valu=Hospital\n' | node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Project
Project: 48 properties; ls shows C_Project_ID, Value, Name, Processed, SalesRep_ID
→ mis.list kind=Project columns=C_Project_ID,Value,Name,Processed,SalesRep_ID limit=20 names=Y Valu=Hospital
refused · mis.list · kind Project has no property "Valu"; nearest: Value
```

## bim: buildings and models

Reading a building's model, the walker, a Modeller kept open between lines, and the Viewer's questions.

### Ask what a thing is: `object.describe`

A verb can also ask the model itself what it holds. `object.describe` is **reflection**: it reads the model's own dictionary and says which properties a kind of object has, which child tabs, and which generic methods are legal for it. It reads dictionary rows only; no element is opened. It needs a checkout, and a building whose model carries its own dictionary (the Duplex does).

<!-- run: describe cut=520 -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element'
{"request":"d-mwkfv24n-390633-1","verb":"object.describe","actor":"human","status":"ok","answer":{"kind":"Element","table":"elements_meta","uu":"3027c2ed-8cb6-5ccb-ae8c-fd7df2eca264","key":"elements_meta_uu","highVolume":true,"properties":[{"name":"guid","label":"GUID","type":"string","mandatory":true,"updateable":false,"key":false,"parent":false,"length":255,"displayed":true,"seq":10,"fieldReadOnly":true,"allowCopy":false},{"name":"ifc_class","label":"IFC Class","type":"list","mandatory":false,"updateable":true,"k…
```

Which methods may an `Element` use?

<!-- run: describe_methods -->
```text
$ node common/door/door.js 'object.describe building=Duplex kind=Element' | grep -o '"methods":\[[^]]*\]'
"methods":["read","update","attach","history"]
```

An unknown kind is an error that lists the kinds the model has, so a wrong guess teaches the right name.

### Count things: `object.count`

`object.count` answers "how many": how many records of a kind the model holds. The Duplex names its rooms as the kind `Room`. It needs a checkout.

<!-- run: count_rooms -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room'
{"request":"d-mwiqkfde-3190996-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[],"count":5,"population":5,"verdict":"OK","summary":"5 Room"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":614}
```

Add `column=value` to narrow the count. The column must be a property of the kind (`object.describe` lists them), and the answer keeps the **population**, the number before narrowing:

<!-- run: count_storey -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room storey="Level 1"'
{"request":"d-mwiqkg0w-3191055-1","verb":"object.count","actor":"human","status":"ok","answer":{"kind":"Room","table":"model_room","filters":[{"column":"storey","value":"Level 1"}],"count":2,"population":5,"verdict":"OK","summary":"2 Room where storey = Level 1 (of 5)"},"why":null,"notChecked":[],"ops":[],"next":[],"ms":714}
```

A column the kind does not have is refused, and the answer names it and lists the real ones. It is never read as "no match":

<!-- run: count_badcol cut=330 -->
```text
$ node common/door/door.js 'object.count building=Duplex kind=Room floor=1'
{"request":"d-mwkfv2ko-390671-1","verb":"object.count","actor":"human","status":"refused","answer":{"refused":true,"reason":"kind Room has no property \"floor\"; none is close, its properties: guid, type, name, parent_guid, object_type, predefined_type, center_x, center_y, center_z, size_x, size_y, size_z, room_guid, elevation, …
```

A model with no room at all does not answer `0`. It answers `inconclusive`, because nothing was counted. A zero you can trust is a narrowed count inside a population that is not empty.

### What the walker would place: `modeller.walk`

The Modeller has a *walker* that places the fittings of one discipline (sprinklers, lights, outlets) by rules measured from real buildings. `modeller.walk` is a **dry run** of it: it says what the walker would place and changes nothing. The model file is the same, byte for byte, afterwards, and the answer says so. It needs a checkout. The full reply is long, so this shows its main numbers:

<!-- run: walk_fp -->
```text
$ node common/door/door.js 'modeller.walk building=Duplex discipline=FP' | grep -o '"rules":"[^"]*"\|"count":[0-9]*,"placed":[0-9]*,"provisional":[0-9]*\|"byClass":{[^}]*}\|"modelUnchanged":[a-z]*'
"rules":"duplex_rules.db"
"count":46,"placed":0,"provisional":46
"byClass":{"IfcFireSuppressionTerminal":45,"IfcAlarm":1}
"modelUnchanged":true
```

`count` is everything the walk would place. `provisional` are positions the walker itself marks as not final, for example a fitting with no ceiling found above it. `rules` is the rule set the building's class uses: a house walks the residential rules. A walk that places nothing answers `inconclusive` with the walker's reason.

### Keep a Modeller open between lines: `model.open`, `model.convert`, `model.addbay`, `model.undo`, `model.save`, `model.close`

These lines drive ONE Modeller page kept open in the background (headless, on the CPU, no graphics card), so each line acts on what the line before left. `model.open sheets=<folder or a.dxf,b.dxf> type="Farming Shed"` opens the 2D sheets, `model.convert` makes the 3D model (the page's own Convert), `model.addbay end=high|low` adds one bay at that end of a repeating-bay building, `model.undo` takes the last change back, and `model.close` stops the page. The page does all the work with its own functions; the line presses what a person presses and prints the page's own answer. The model lives in that page until you save it: `model.save` writes it to a `.db` file in this folder, and `model.close` saves first when the model changed and a save file is known. They need a `bim-ootb` checkout, and the folder you run them from holds the session (a file `.model_session.json`; the port listens on this machine only and every request carries a one-time token).

Rules you will meet: a line before `model.open` is refused ("no session: model.open first"), and so is a second `model.open`, a second `model.convert`, and `model.addbay` before Convert. A bay is offered only when the building type declares one (Farming Shed does); with no `type=` the bay is refused, saying the type declares no rule. The sheets must carry their markings: plain sheets of a drawing do not pass the gate. Each line takes a few seconds (here: open about 6 s, convert 3 s, a bay 3 s; on a bigger set of sheets convert took up to 15 s). **Saving:** name the file once, on `model.open … file=shed.db` or on the first `model.save file=shed.db`. A save runs the page's own Save: the clash check first (a RED clash blocks the save, as it does on screen, and nothing is written), then the model is written as a native `.db`. On this shed a save takes about half a second, and the answer gives the time of each step. `model.close` with unsaved changes and no file is refused and the session stays open: save, or `model.close discard=Y` to drop the changes on purpose. A save before anything is made is refused, in the page's words.

The block below copies a folder of 9 marked sheets of a shed, named by `SHED_SHEETS`, into `shed/`, and runs the lines one after the other; set `SHED_SHEETS` to your own folder of marked `.dxf` sheets.

<!-- run: model_ses cut=200 -->
```text
$ rm -rf shed shed.db; mkdir shed; cp "$SHED_SHEETS"/*.dxf shed/; D='node common/door/door.js --list'; eval "$D 'model.convert'" | grep -E '^error:'; eval "$D 'model.open sheets=shed type=\"Farming Shed\" file=shed.db'" | grep -E '^summary:'; eval "$D model.save" | grep -E '^error:'; eval "$D model.convert" | grep -E '^summary:'; eval "$D model.save" | grep -E '^(file|bytes|elements):'; eval "$D 'model.addbay end=high'" | grep -E '^(copies_by_class|summary):'; eval "$D model.undo" | grep -E '^summary:'; eval "$D model.close" | grep -E '^closed:'; ls -l shed.db | awk '{print "shed.db bytes: " $5}'; eval "$D model.undo" | grep -E '^error:'; rm -rf shed shed.db .model_session.log
error: no session in this folder: model.open first
error: nothing is open: model.open first
closed: true
error: no session in this folder: model.open first
```

`model.addbay end=low` adds the bay at the other end (a different hinge, the same 29 copies). Not checked by these lines: the cost against an independent count (a separate test does that), and more than one session in one folder.

### Viewer questions from a plain download

Two Viewer verbs, `viewer.counts` and `viewer.clashes`, also work without a checkout. Put two more files beside the six:

```text
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_verbs.js
curl -O https://red1oon.github.io/bim-ootb/viewer/tools/viewer_driver.js
```

With no page files on your disk, the tool opens the live Viewer page with the building the site serves, in a hidden browser on the processor, and asks the Viewer's own Find panel. `page` in the answer says which page was used:

<!-- run: viewer_flat -->
```text
$ node door.js 'viewer.counts building=Duplex' | grep -o '"summary":"[^"]*"\|"page":"[a-z]*"'
"summary":"1119 elements: MEP 904, ARC 196, STR 19"
"page":"live"
```

It takes about half a minute. The numbers are the served building's, so they can differ from an older copy in a checkout. The schedule verbs, `viewer.film_path`, the object verbs and `modeller.walk` still need a checkout; the table says which.

## mis: records, tables, files, Ninja

Any table of the dictionary: list, create, change, delete and load records; tables of your own; Ninja workbooks; the terminal screen.

### Lists, sums and groups: `mis.list`, `mis.sum`, `mis.group`

`count` answers "how many". Three more read-only verbs answer "which ones", "how much" and "how many of each". They take any kind of the ERP's dictionary (and the same three exist for a building's model as `object.list`, `object.sum`, `object.group`). They need a checkout.

`mis.list` shows rows. Every column, filter and sort is checked against the dictionary, so a wrong name is an error that lists the real ones. Add `column=value` to narrow the list. The list shows at most 50 rows unless `limit` says otherwise (up to 1000), and the answer always carries the **total**, so a short list is never mistaken for the whole. Page through a long one with `offset`:

<!-- run: list_orders -->
```text
$ node common/door/door.js --list 'mis.list kind=Order docstatus=CO limit=3 columns=DocumentNo,DocStatus,GrandTotal sort=-DocumentNo'
DocumentNo  DocStatus  GrandTotal
80001       CO         100.7
80001       CO         100.7
800002      CO         2160
shown 3 of 14
```

`mis.sum` adds a number column up exactly. Decimals are added as decimals, never as floating point, so money does not drift. A money column (an Amount or a Price) of a table that has a currency is added per currency: two currencies are never added, so a sum over orders in USD and EUR answers one total for each. `mis.group` counts the records for each value of a column, most common first:

<!-- run: sum_orders -->
```text
$ node common/door/door.js --list 'mis.sum kind=Order column=GrandTotal docstatus=CO'
kind: Order
table: C_Order
column: GrandTotal
filters: [{"column":"DocStatus","value":"CO"}]
n: 14
sum: 
byCurrency: [{"currency":100,"iso":"USD","n":12,"sum":"19048.2"},{"currency":102,"iso":"EUR","n":2,"sum":"457.7"}]
population: 44
verdict: OK
summary: amounts in 2 currencies are not added: USD 19048.2 (12) · EUR 457.7 (2); one currency: add C_Currency_ID=<id>
```

<!-- run: group_orders -->
```text
$ node common/door/door.js --list 'mis.group kind=Order by=DocStatus'
DocStatus  count
IP         22
CO         14
DR         6
CL         2
shown 4 of 4
```

A kind with no records at all does not answer `0` or an empty list. It answers `inconclusive`, because nothing was judged.

### Create a record: `mis.new`

`mis.new` makes a record the way the ERP's own window makes it. You name the kind and the columns you know; the engine fills the rest the way the window does (defaults, the choices a partner brings with it, the Document No from the sequence). A column the dictionary does not have is refused and the reply lists the real ones. A mandatory column still empty after that is refused by name, and nothing is written. The reply starts with `number`: the Document No, which is what you use next.

A Sales or Purchase document needs `issotrx=Y` or `N`. A partner or product may be given by name; a name that matches no record, or more than one, is refused. A line names its document by number:

<!-- run: new_order -->
```text
$ rm -f /tmp/fast_guide_new.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'mis.new kind=Order issotrx=Y c_doctypetarget_id=132 c_bpartner_id=112 salesrep_id=101' | sed -E 's/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9:]{8}/T/g; s/"([a-z_]+_uu)":"[^"]*"/"\1":"U"/g'
{"request":"d-mwlp21mc-2051286-1","verb":"mis.new","actor":"human","status":"ok","answer":{"number":"50000","kind":"Order","table":"c_order","id":1500004,"docStatus":"DR","given":["IsSOTrx","C_DocTypeTarget_ID","C_BPartner_ID","SalesRep_ID"],"defaulted":52,"filled":["ad_client_id","ad_org_id","documentno","isselfservice","dateordered","datepromised","bill_bpartner_id","c_bpartner_location_id","bill_location_id","deliveryrule","priorityrule","m_warehouse_id","isdropship","deliveryviarule","freightcostrule","freightamt","ispriviledgedrate","shippingrateinquiry","invoicerule","m_pricelist_id","c_currency_id","c_conversiontype_id","isdiscountprinted","chargeamt","paymentrule","c_paymentterm_id","totallines","grandtotal","docstatus","c_doctype_id","ispayschedulevalid","copyfrom","docaction","posted","isactive","isapproved","iscreditapproved","isdelivered","isinvoiced","isprinted","istransferred","dateacct","processing","processed","istaxincluded","isselected","sendemail","amountrefunded","amounttendered","processedon","volume","weight"],"record":{"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"T","createdby":101,"updated":"T","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"T","datepromised":"T","dateprinted":null,"dateacct":"T","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":0,"grandtotal":0,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"U","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_UPDATE","table":"ad_sequence"},{"op_type":"CRUD_CREATE","table":"c_order"}],"next":[],"ms":889}
```

<!-- run: new_line -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js 'mis.new kind=C_OrderLine order=50000 m_product_id=137 qtyentered=2' | sed -E 's/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9:]{8}/T/g; s/"([a-z_]+_uu)":"[^"]*"/"\1":"U"/g'
{"request":"d-mwlp22fb-2051330-1","verb":"mis.new","actor":"human","status":"ok","answer":{"kind":"Sales Order Line","table":"c_orderline","id":120002710,"docStatus":null,"given":["M_Product_ID","QtyEntered","C_Order_ID"],"defaulted":31,"filled":["ad_client_id","ad_org_id","c_bpartner_id","c_bpartner_location_id","datepromised","dateordered","line","m_warehouse_id","m_attributesetinstance_id","c_uom_id","qtyordered","qtydelivered","qtyreserved","qtyinvoiced","priceentered","priceactual","pricelist","freightamt","c_tax_id","discount","linenetamt","qtylostsales","processed","createshipment","createproduction","isactive","c_currency_id","pricelimit","isdescription","pricecost","rramt"],"record":{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"T","createdby":101,"updated":"T","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"T","datepromised":"T","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"U","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null},"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}]},"why":null,"notChecked":[],"ops":[{"op_type":"CRUD_CREATE","table":"c_orderline"},{"op_type":"CRUD_UPDATE","table":"c_order"}],"next":[],"ms":856}
```

The order is a draft until someone completes it. Because the line was given the order's number, the order's totals follow without a second step: `totallines` and `grandtotal` in the record below are the line's amount (6). `mis.read` hands back the order's own lines as well: the `children` list below holds the Sales Order Line just made (and the order's tax, payment schedule and POS payment lists, empty here).

<!-- run: new_read -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_new.ops node common/door/door.js --list 'mis.read kind=Order number=50000' | sed -E 's/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9:]{8}/T/g; s/"([a-z_]+_uu)":"[^"]*"/"\1":"U"/g'
kind: Order
uu: 1500004
record: {"c_order_id":1500004,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"T","createdby":101,"updated":"T","updatedby":101,"issotrx":"Y","documentno":"50000","docstatus":"DR","docaction":"CO","processing":"N","processed":"N","c_doctype_id":0,"c_doctypetarget_id":132,"description":null,"isapproved":"N","iscreditapproved":"N","isdelivered":"N","isinvoiced":"N","isprinted":"N","istransferred":"N","isselected":"N","salesrep_id":101,"dateordered":"T","datepromised":"T","dateprinted":null,"dateacct":"T","c_bpartner_id":112,"c_bpartner_location_id":108,"poreference":null,"isdiscountprinted":"Y","c_currency_id":100,"paymentrule":"P","c_paymentterm_id":105,"invoicerule":"D","deliveryrule":"A","freightcostrule":"I","freightamt":0,"deliveryviarule":"P","m_shipper_id":null,"c_charge_id":null,"chargeamt":0,"priorityrule":"5","totallines":6,"grandtotal":6,"m_warehouse_id":103,"m_pricelist_id":101,"istaxincluded":"N","c_campaign_id":null,"c_project_id":null,"c_activity_id":null,"posted":"N","c_payment_id":null,"c_cashline_id":null,"sendemail":"N","ad_user_id":null,"copyfrom":"N","isselfservice":"N","ad_orgtrx_id":null,"user1_id":null,"user2_id":null,"c_conversiontype_id":114,"bill_bpartner_id":112,"bill_location_id":108,"bill_user_id":null,"pay_bpartner_id":null,"pay_location_id":null,"ref_order_id":null,"isdropship":"N","volume":0,"weight":0,"ordertype":null,"c_pos_id":null,"amounttendered":0,"amountrefunded":0,"link_order_id":null,"m_freightcategory_id":null,"dropship_bpartner_id":null,"dropship_location_id":null,"dropship_user_id":null,"promotioncode":null,"c_ordersource_id":null,"processedon":0,"ispayschedulevalid":"N","c_cashplanline_id":null,"c_order_uu":"U","shippingrateinquiry":"N","ispriviledgedrate":"N","c_opportunity_id":null,"quotationorder_id":null,"c_department_id":null,"c_costcenter_id":null}
children: [{"kind":"Sales Order Line","rows":[{"c_orderline_id":120002710,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"T","createdby":101,"updated":"T","updatedby":101,"c_order_id":1500004,"line":10,"c_bpartner_id":112,"c_bpartner_location_id":108,"dateordered":"T","datepromised":"T","datedelivered":null,"dateinvoiced":null,"description":null,"m_product_id":137,"m_warehouse_id":103,"c_uom_id":100,"qtyordered":2,"qtyreserved":0,"qtydelivered":0,"qtyinvoiced":0,"m_shipper_id":null,"c_currency_id":100,"pricelist":3,"priceactual":3,"pricelimit":2.7,"linenetamt":6,"discount":0,"freightamt":0,"c_charge_id":null,"c_tax_id":104,"s_resourceassignment_id":null,"ref_orderline_id":null,"m_attributesetinstance_id":0,"isdescription":"N","processed":"N","qtyentered":2,"priceentered":3,"c_project_id":null,"pricecost":0,"qtylostsales":0,"c_projectphase_id":null,"c_projecttask_id":null,"rrstartdate":null,"rramt":0,"c_campaign_id":null,"c_activity_id":null,"user1_id":null,"user2_id":null,"ad_orgtrx_id":null,"link_orderline_id":null,"pp_cost_collector_id":null,"m_promotion_id":null,"c_orderline_uu":"U","createshipment":"N","createproduction":"N","c_department_id":null,"c_costcenter_id":null}]},{"kind":"Order Tax","rows":[]},{"kind":"Order Payment Schedule","rows":[]},{"kind":"POS Payment","rows":[]}]
```

`mis.new` is a `writes` verb. A person at the terminal runs it. An AI's `mis.new` is held as a claim and nothing is written until a person confirms it (see "What is a claim"). These blocks use a scratch op-log (`/tmp/fast_guide_new.ops`, emptied first), so running them does not touch your own data. Dates and times (`T`) and the `_uu` keys (`U`) change on every run, so the three blocks print them as those letters.

### Work with any table: the `mis.*` verbs

**MIS is the base. ERP is MIS plus a document's life.** Listing, reading, creating, changing, deleting and loading records is the same on every table of the dictionary, a customer, a product, a table you made yourself. Those verbs are called `mis.*`. What only a document has (complete, void, close, reverse) stays `erp.*`. The older names `erp.list`, `erp.read`, `erp.describe`, `erp.sum`, `erp.group` and `erp.new` still work: each is an old name for its `mis.*` verb and gives the same answer, so a script you wrote earlier does not change.

Every `mis.*` verb that writes does what the ERP's own window does. It does not edit the database underneath. Defaults and callouts run, the checks run, a refusal says why, and nothing is written when anything is refused.

**What is still missing?** `mis.new … dry=Y` runs everything but the save and writes nothing. It answers which mandatory columns are still empty after the defaults, so you know what to give:

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

**Create, change, read.** A column that holds another record may be given by its name. `mis.list … names=Y` shows such columns as names, the way the window's grid does:

<!-- run: mis_new cut=330 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.new kind=C_BPartner Value=GD100 Name="Guide Partner One"' | sed -E 's/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9:]{8}/T/g; s/"([a-z_]+_uu)":"[^"]*"/"\1":"U"/g'
number: Guide Partner One
kind: Business Partner
table: c_bpartner
id: 1600010
docStatus: 
given: ["Value","Name"]
defaulted: 32
filled: ["ad_client_id","ad_org_id","c_bp_group_id","iscustomer","isvendor","isemployee","isprospect","issalesrep","so_creditlimit","totalopenbalance","istaxexempt","ispotaxexempt","issummary","isactive","c_paymentterm_id","m_pricelist_id","flatdiscount","c_dunning_id","shelflifeminpct","ismanufacturer","is1099vendor","documentc…
record: {"c_bpartner_id":1600010,"ad_client_id":11,"ad_org_id":11,"isactive":"Y","created":"T","createdby":101,"updated":"T","updatedby":101,"value":"GD100","name":"Guide Partner One","name2":null,"description":null,"issummary":"N","c_bp_group_id":103,"isonetime":"N","isprospect":"N","isvendor":"N","iscustomer":"N","isemployee":…
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

`mis.update` sends only the columns you give; giving the values a record already has changes nothing and the answer says `noop`. A column the window would not let a person edit (a read-only field, or any column of a completed document) is refused, and the answer names the rule. Clear a column with the value `<null>`.

**A column that points at another record** (a business partner, a product, a warehouse) must name a record that exists and that your company may use. `mis.new` checks every such column and `mis.update` the ones you change, and a wrong one is refused with the legacy ERP's own words, for example `Cannot save record in C_Order: Foreign ID 999999 not found in C_BPartner_ID`, or `Cross tenant ID … not allowed in …` for a record of another company. A value outside a lookup's validation rule (the list a window would offer) is NOT refused: the legacy ERP saves it too, since the rule only decides what the window offers.

**Delete.** `mis.delete` is the window's Delete. It refuses what the window refuses, with the engine's own words, and writes nothing. The standard partner is used by other records:

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

**Load many from a CSV.** `mis.load` reads a `.csv` (the first line is the column names, one record per line) and runs the ERP's own Migrate Excel Data process on it. That process is all or nothing, so `mis.load` first **checks** (`dry=Y`, the default) and writes nothing: it counts the lines and names each bad one. Next to your file it writes `….rejected.csv` (the bad lines and why) and `….ok.csv` (the good ones):

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

Loading the original with `dry=N` is refused while any line is bad. Fix the bad lines, or load the good ones, which is a separate all-or-nothing load:

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

An AI's `mis.new`, `mis.update`, `mis.delete` or `mis.load` is held as a claim, like any `writes` verb: nothing is written until a person confirms it. Updating existing records in bulk is not offered; use `mis.update` for each, so the window's checks run.

#### See and change records as a role

Every `mis.*` verb takes `role=`, the id of a role of the ERP. **Without a role nothing is filtered:** you see every record of every client. With a role you get what that role gets in the window it is granted: the records of its own client and organisations, and only the records and columns its access rows allow. The totals count only those records. The role is stated on the line. It is not a sign-in.

<!-- run: mis_role -->
```text
$ for r in '' ' role=103' ' role=12000'; do BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list "mis.sum kind=C_Order column=GrandTotal$r" | grep -E '^summary:'; done
summary: amounts in 2 currencies are not added: USD 74479.06 (41) · EUR 457.7 (2); one currency: add C_Currency_ID=<id>
summary: amounts in 2 currencies are not added: USD 9685.22 (7) · EUR 228.85 (1); one currency: add C_Currency_ID=<id>
summary: 55108.62 USD = sum of GrandTotal over 27 Order
```

A record outside the role's records answers exactly as a record that does not exist. A column the role may only read cannot be changed. A kind the role has no window for is refused; role 103 has no window that shows Tax:

<!-- run: mis_role_refuse cut=200 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/door.js --list 'mis.list kind=C_Tax role=103'
refused: true
reason: role 103 (GardenWorld User) is not granted a window that shows Tax (AD_Window_Access)
```

Five rules are not judged yet, and a role that uses one of them is refused instead of half-checked: a personal lock on a record, a table validation rule, a role whose organisations come from the user, a role with a summary organisation in an organisation tree, and "dependent entities" record access. `mis.load` takes no role.

### Make a table of your own: `mis.add_window`

A table you keep in a spreadsheet can become a real window: a table, a form, a menu entry and role access, with no code written for it. Describe its columns in a small `.csv`, one line per column. Only `Column` is required. The key, the client and organisation, the active flag and the audit columns are added for you:

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

One line makes the window (the sheet is written again here so the line can be run on its own, from the folder that holds `common/`). The table is named after the file. `dry=Y` checks the sheet and writes nothing. A faulty sheet is refused with every fault and its line, and nothing is written:

<!-- run: win_add cut=200 -->
```text
$ printf 'Column,Type,Length,Mandatory,Default,List,Help\nName,String,60,Y,,,Its name\nPurchaseDate,Date,,,,,When it was bought\nCost,Amount,,,,,\nCondition,List,,,GOOD,"GOOD=Good,FAIR=Fair,POOR=Poor",\nIsInsured,,,,,,\n' > AST_Asset.csv; rm -f /tmp/fast_guide_win.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list 'mis.add_window file=AST_Asset.csv' | grep -E '^(table|window|columns|lists|ops):'
table: AST_Asset
window: {"id":7100001,"name":"AST Asset"}
columns: ["Name","PurchaseDate","Cost","Condition","IsInsured"]
lists: [{"column":"Condition","values":["GOOD","FAIR","POOR"]}]
ops: 47
```

The new kind works with every `mis.*` verb at once, and with `mis.js`. A mandatory column is asked for, a default is filled, and a value outside the sheet's list is refused:

<!-- run: win_use cut=200 -->
```text
$ D='BIM_OBJECT_OPLOG=/tmp/fast_guide_win.ops node common/door/door.js --list'; eval "$D 'mis.new kind=AST_Asset Name=Tractor Cost=1200.5'" | grep -E '^(number|filled):'; eval "$D 'mis.new kind=AST_Asset Cost=5'" | grep reason; eval "$D 'mis.new kind=AST_Asset Name=Plough Condition=BAD'" | grep reason; eval "$D 'mis.list kind=AST_Asset columns=Name,Cost,Condition'"; rm -f AST_Asset.csv
number: Tractor
filled: ["ad_client_id","ad_org_id","isactive","condition","isinsured"]
reason: mandatory and still empty after the defaults and callouts: Name (give them as column=value)
reason: Condition Invalid value - BAD - Reference_ID=9541005 - FAIR - GOOD - POOR; nothing was written
Name     Cost    Condition
Tractor  1200.5  GOOD
shown 1 of 1
```

The types are String, Quantity, Amount, YesNo, Date, DateTime, Text and List. A column whose name ends in `_ID` is a lookup to that table, and one that starts with `Is` is a yes/no. A detail table under a master comes with a workbook: the next section.

### A whole workbook in one line: `ninja.exec`

One table from a `.csv` is the small case. A **Ninja workbook** holds many tables at once, says which table sits under which, and can carry their first rows. One line makes all of it.

The workbook is an ordinary spreadsheet file (`.xlsx` or `.xls`):

| Sheet | What it holds |
|---|---|
| `1_RO_ModelHeader` | the name of the whole set, in the first cell under `Name` |
| `2_RO_ModelMaker` | one row per table: `Master` (the table it sits under, or empty), `Name` (the table), `ColumnSet` (its columns, separated by commas) |
| a sheet named exactly after a table | rows to load: row 1 holds the column names |

In `ColumnSet` a plain name is text. A prefix gives another type: `D#` a date, `A#` an amount, `Q#` a quantity, `T#` a long text, `Y#` a yes/no, and `L#Name=a/b/c` a list of fixed values. A table whose `Master` is another table of the workbook becomes a tab of that table's window.

A practice workbook ships with the door: `common/door/samples/Ninja_Practice.xlsx` (a patient, the patient's visits, the medicines of a visit, a room, and a referral that sits under Business Partner). `dry=Y` reads it, says what it would make and writes nothing:

<!-- run: nx_dry cut=230 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_ninja.ops; BIM_OBJECT_OPLOG=/tmp/fast_guide_ninja.ops node common/door/door.js --list 'ninja.exec file=Ninja_Practice.xlsx dry=Y' | grep -E '^(bundle|tables|dataSheets|skipped|dry):'
bundle: Practice
tables: [{"table":"PR_Patient","master":null,"columns":4,"lists":["BloodGroup"]},{"table":"PR_Visit","master":"PR_Patient","columns":5,"lists":[]},{"table":"PR_Medicine","master":"PR_Visit","columns":3,"lists":[]},{"table":"PR_Roo…
dataSheets: [{"sheet":"PR_Patient","rows":3},{"sheet":"PR_Room","rows":2}]
skipped: []
dry: true
```

Without `dry=Y` the same line makes it: the windows, the tabs, the list, the menu entries, the role access, and then the rows of the data sheets. Run it a second time and it writes nothing:

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

Every table works with the `mis.*` verbs at once. A record under a master names the master's id (`mis.read` of the master then shows what sits under it), and a value outside a list is refused:

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
reason: BloodGroup Invalid value - Z - Reference_ID=9541005 - A - AB - B - O; nothing was written
```

**A table that is already there.** When the workbook names a table the system already has, nothing is made twice. If the sheet gives that table a `Master`, the table is reused: the sheet's columns are added to it and it becomes a tab under that master. If the sheet gives it no `Master`, the row is left alone. The answer lists both (`reused`, `leftAlone`). This is what the Ninja of iDempiere does. A reused table keeps its own rules, so a record of it must still fill that table's own mandatory columns.

A table shown in two windows is written through its own window unless you name the other one with `window=` (its name or its id). A refusal for a column that belongs to the other window tells you which window to name.

**A tab on a window that is already there.** A `Master` does not have to be a table of the workbook. Name a table the system already has and your table becomes a tab of THAT table's window, after the tabs that are there, with no window or menu entry of its own. The practice workbook does it with one row: `PR_Referral`, whose `Master` is `C_BPartner`, so a referral is a tab of the Business Partner window. This is the Ninja of iDempiere's rule too:

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

What it refuses, with nothing written: a second workbook that names tables another workbook made, a workbook whose tables are all already there with no master, a `Master` that is neither in the workbook nor a table with a window here, and a `ColumnSet` with a prefix it does not know. A sheet whose name is not exactly a table's name is skipped and named in the answer. The answer's `notChecked` lists what was not judged.

#### One table from a plain CSV: `ninja.exec file=<Table>.csv`

A `.csv` instead of a workbook is ONE table whose header is the model, read the way the older Ninja reads one. The table is the file's name (`table=` names another). Each header cell takes its type from its name, by the first rule that fits: it contains `Date` → a date; `Qty` → a quantity; `Amount` → an amount; it starts with `Is` or `In` → Yes/No (so `Income` is Yes/No too, as in the older Ninja); it ends with `_ID` → a lookup, whose cells are the Name of the record; it holds `=` and `/` (`Plan=Basic/Gold`) → a list; anything else → text. A cell such as `C_BPartner_ID>Value` or `Code=X` makes the column before the `>` or `=`. The lines are the rows. The table and its rows are made together: if one line does not load, nothing is made and the answer names the line. A line whose first two columns are there already is skipped, so the same file run again writes nothing, and a file with more lines adds only the new ones. On a table that is there already, the file only adds lines, and a header that is not a column of it is refused.

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

#### Give a table the document columns: `ninja.workflow`

A feature can be switched on later, for one table, without touching the workbook. `ninja.workflow` gives a table the five document columns (`DocStatus`, `DocAction`, `Processed`, `DocumentNo`, `IsApproved`) with their lists and defaults, shows them on its tabs, and fills the records that are already there. It looks first and adds only what is missing, so a second run writes nothing:

<!-- run: nx_wf cut=200 -->
```text
$ cp common/door/samples/Ninja_Practice.xlsx . ; rm -f /tmp/fast_guide_wf.ops; D='BIM_OBJECT_OPLOG=/tmp/fast_guide_wf.ops node common/door/door.js --list'; eval "$D 'ninja.exec file=Ninja_Practice.xlsx'" | grep -E '^ops:'; eval "$D 'mis.new kind=PR_Visit Name=Before PR_Patient_ID=1'" | grep -E '^number:'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(added|fields|rowsFilled|ops):'; eval "$D 'ninja.workflow table=PR_Visit'" | grep -E '^(alreadyDone|ops):'; eval "$D 'mis.new kind=PR_Visit Name=After PR_Patient_ID=1'" | grep -E '^docStatus:'; eval "$D 'mis.list kind=PR_Visit columns=Name,DocStatus,DocAction,Processed'"; eval "$D 'erp.complete kind=PR_Visit id=1'" | grep -E '^after:'; rm -f Ninja_Practice.xlsx
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
after: {"docStatus":"CO","docAction":"CL","processed":"Y","grandTotal":null}
```

*Complete* on such a table runs the generic document class, the one the older Ninja's Code Maker writes for a table with a DocAction column: Prepare, Complete, Close and Void work as the system's simple documents do, Reverse and Re-activate are refused. The answer's `notMade` names what is still missing (the workflow rows). A table that came with the system is refused.

#### Undo a bundle, and write one back as a workbook: `ninja.rollback`, `ninja.export`

Two lines close the loop on a workbook. `ninja.rollback bundle=<name>` switches off everything one workbook made (its windows, tabs, fields, columns, tables and menu entries, and the bundle's own menu node) in one group of the log. As in the older Ninja, a table that holds records blocks it, and it names the table and its record count; `dry=Y` says what would go off. A table that came with the system keeps itself and loses only what the bundle added to it (a tab on Business Partner goes, Business Partner stays). Run twice, the second writes nothing; `ninja.exec` on the same workbook afterwards brings the bundle back. `ninja.export` writes a bundle, a window or a table back as a workbook that `ninja.exec` reads: tables, `Master` links, columns with their types and the values of each list. Edit the sheet and run it again, or carry the model to another machine as a file. It writes the model only, never rows; a file that exists is never overwritten; one selector (`bundle=`, `window=` or `table=`) is required.

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

Not carried by the export: validation rules and callouts (the stager never wrote them into the model). A rollback switches rows off, it does not delete them, so the log keeps its history.

### The records under one record, and a sheet against the table: `master=`, `mis.diff`

`master=Table/record` on `mis.list`, `mis.sum` or `mis.group` keeps only the rows under that record, the rows a tab under it shows: `mis.list kind=PR_Visit master=PR_Patient/Aminah` is the visits of Aminah. The record after the slash is an id, or a Document No, Name or Value, read as `mis.update number=` reads it. The answer is the same as the plain filter `PR_Patient_ID=1`. A table that is not a tab under the master is refused with the reason, and so is a record that does not exist or a name two records share (then give the id). A record with nothing under it is a true zero, not an empty question.

`mis.diff kind=<table> file=<sheet.csv>` compares a sheet with the table before you load it, and writes nothing. Each line of the sheet is matched by its Document No, else Name, else Value (`key=` names another column), and the answer sorts them: `new` (no record has that key), `changed` (a column differs; the stored value and the sheet's are both shown), `same`, and `missing` (active records the sheet does not mention). A key repeated in the sheet, a key that matches several records and a line with no key are named apart and not compared. A number is equal as a number (a trailing zero changes nothing), a date equals the stored date, and a lookup cell is compared by the name of the record the stored id points at. Whether `mis.load` would find that name is not asked here: `mis.load dry=Y` does that.

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

Not compared by `mis.diff`: a column of the table that the sheet does not name. The key is one column. A master two levels up (the patient of a medicine) is refused: it is not the medicine's tab parent.

#### A file of MIS lines, tried first: `--script … --dry`

A set-up you want to repeat (a workbook, its first records, a check) is a file of lines run with `--script`, as in [A script](#a-script-several-lines-a-named-result): it stops at the first line that is not ok, and the lines after it are not run. Add `--dry` to try the whole file first. The file then runs on a throw-away copy of your op-log (`BIM_OBJECT_OPLOG` must name it) and of the files of this folder, so a later line sees what an earlier line made, exactly as in the real run, and gets the real run's answer. At the end the copy is deleted: your op-log, your files and the journal are as before. Files in subfolders are not copied. A line that acts outside the op-log (a Modeller session, a legacy server, a pack) cannot be held back, so in a dry run it is refused and the file stops there.

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

### Cheatsheet: practise the MIS lines

Everything here is practice on **your own copy**: the first line names a file that keeps what you do, and nothing reaches a real company's books. Delete that file to start again from nothing. Run the lines from the folder that holds `common/` (a `bim-ootb` checkout).

| Step | Type this | What you get |
|---|---|---|
| Set up | `export BIM_OBJECT_OPLOG=~/practice.ops` | every line below now keeps its work in that file |
| Start over | `rm -f ~/practice.ops` | an empty practice again |
| Shorten the typing | `alias d='node common/door/door.js --list'` | then a line is `d '<verb> <inputs>'` |
| Ask what exists | `d 'help all'` | every verb with its inputs |
| Make five tables | `cp common/door/samples/Ninja_Practice.xlsx . ; d 'ninja.exec file=Ninja_Practice.xlsx'` | patients, visits, medicines, rooms and referrals, with 3 patients and 2 rooms loaded |
| Try before making | `d 'ninja.exec file=Ninja_Practice.xlsx dry=Y'` | what it would make; nothing written |
| Make one table | `d 'mis.add_window file=AST_Asset.csv'` | one window from a `.csv` of its columns (section above) |
| List | `d 'mis.list kind=PR_Patient'` | the rows |
| List some columns | `d 'mis.list kind=PR_Visit columns=Name,Fee'` | only those columns |
| What can it hold | `d 'mis.describe kind=PR_Patient'` | its columns, types and lists |
| Add | `d 'mis.new kind=PR_Patient Name=Devi BloodGroup=O'` | a new record and its id |
| Add under a master | `d 'mis.new kind=PR_Visit Name=Checkup PR_Patient_ID=1 Fee=50'` | a visit of patient 1 |
| Add one level further | `d 'mis.new kind=PR_Medicine Name=Paracetamol PR_Visit_ID=1 Qty=10'` | a medicine of visit 1 |
| Read one with what is under it | `d 'mis.read kind=PR_Patient id=1'` | the patient and the visits |
| Change | `d 'mis.update kind=PR_Patient id=1 BloodGroup=AB'` | the changed record |
| See a refusal | `d 'mis.update kind=PR_Patient id=1 BloodGroup=Z'` | refused: `Z` is not in the list |
| Delete | `d 'mis.delete kind=PR_Room id=2'` | the record is gone |
| Add up | `d 'mis.sum kind=PR_Visit column=Fee'` | the total |
| Count by a column | `d 'mis.group kind=PR_Patient by=BloodGroup'` | a count per value |
| Load many rows | `d 'mis.load kind=PR_Room file=rooms.csv'` | a preview; add `dry=N` to load |
| Work on a screen | `node common/door/mis.js kind=PR_Patient` | a list you move in with the keys; `+` adds, Enter edits |
| As another role | add `role=102` to a line | what that role may see and do |
| Add under a table of the system | `d 'mis.new kind=PR_Referral Name=Checkup C_BPartner_ID=112'` | a referral on business partner 112 (a tab of the Business Partner window) |
| Give a table the document columns | `d 'ninja.workflow table=PR_Visit'` | a status on every visit (`DR`), old and new |
| Undo a workbook's bundle | `d 'ninja.rollback bundle=Practice'` | everything it made is off (blocked while a table holds records); `dry=Y` first |
| Write a bundle back as a workbook | `d 'ninja.export bundle=Practice file=Practice_out.xlsx'` | the model, to edit and run again |
| Under one record | `d 'mis.list kind=PR_Visit master=PR_Patient/1'` | the visits of patient 1 only; also on `mis.sum` and `mis.group` |
| Compare a sheet before loading | `d 'mis.diff kind=PR_Patient file=patients.csv'` | new, changed, same and missing lines; nothing written |
| Keep a Modeller open | `d 'model.open sheets=shed type="Farming Shed" file=shed.db'` then `d model.convert`, `d 'model.addbay end=high'`, `d model.undo`, `d model.close` | the 2D sheets made 3D, one bay added and taken back; each line a few seconds; close saves to shed.db |
| Save the model now | `d model.save` (or `d 'model.save file=shed.db'` the first time) | the clash check, then shed.db written; refused while a RED clash stands |
| Close without saving | `d 'model.close discard=Y'` | the changes dropped on purpose (a plain close refuses when there is no save file) |
| Try a whole file first | `node common/door/door.js --list --script setup.door --dry` | every line's real answer; nothing kept (needs `BIM_OBJECT_OPLOG`) |
| One table from a CSV | `d 'ninja.exec file=CL_Client.csv'` | the table from the header, its lines loaded; run again, only new lines load |
| The menu on a screen | `d menu` (or `d 'menu role=102'`) | the ERP menu; Enter opens a window's list, Esc goes back, `/` finds |
| Find a menu entry | `d 'mis.menu role=102 find=partner'` | the entries whose name has "partner", with their folders |
| Work in another window | add `window=<name or id>` to `mis.new`, `mis.update` or `mis.delete` | the fields of that window's tab, for a table shown in two windows |

**Speed.** After a big workbook the door keeps an image of what the op-log has made, so a later line does not apply every op again; it is used only while your op-log file still begins exactly as it did, and `ERP_OPIMAGE=off` switches it off.

A workbook of your own: copy the practice file, change the rows of `2_RO_ModelMaker` to your tables (a prefix of your own, such as `MY_`, keeps them apart from the tables that are already there; a name the system already has is reused, not made twice), and run `ninja.exec` on it with `dry=Y` first. The lines of this table are the verbs shown run in the sections above; the table itself is not re-run by this page's test, the grey blocks are.

### Work at the terminal: `mis.js`

If you would rather pick than type, `mis.js` shows a list with a pointer. It is a front end only: every key compiles into **one** of the door lines above, runs through the same door (journalled, claim-checked), and the screen prints the line before it runs. Up and Down move the pointer. Left and Right move along the buttons on the pointed row (`[U Edit] [D Delete] [C Copy]` for a record; for a document, the actions the engine allows now, such as `[C Complete] [V Void]`, and no Delete once it is completed). Enter runs the highlighted button. `+` starts a new record, Delete asks `y/N`, and Esc backs out and writes nothing.

At a terminal it draws with arrow keys. With `--plain` it reads key names from a pipe, so a script, a screen reader and an AI see exactly what a person sees:

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

Add `role=103` to the command and every line the screen sends carries that role; the head line names it. With no role the head line says that nothing is filtered.

A form asks only for what the engine cannot fill (the dry run above). Typing fills the field, Tab or Enter moves on, and Enter on the last field shows the one line it will run. A line that starts with `=` is typed text. Here the whole session, reduced to the door lines it ran:

<!-- run: mis_form cut=200 -->
```text
$ printf '+\n=GD300\nTab\n=Guide Four\nEnter\ny\nEsc\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_mis.ops node common/door/mis.js kind=C_BPartner value=GD300 --plain 2>/dev/null | grep '^->'
-> mis.describe kind=C_BPartner
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
-> mis.new kind=C_BPartner dry=Y
-> mis.new kind=C_BPartner Value=GD300 Name="Guide Four"
-> mis.list kind=C_BPartner columns=C_BPartner_ID,Value,Name,Logo_ID,C_BP_Group_ID names=Y limit=10 offset=0 value=GD300
```

Edit works the same way: it shows only the columns the window lets a person edit, with lookups as names, and sends only what you changed. Copy starts a new record from the pointed one, so you must change what must be unique (a duplicate is refused and your typing is kept). Set `MIS_SESSION_FILE=session.door` and a terminal session records the lines it ran, one per line, as a script you can read and run again.

#### The menu on a screen: `menu` and `mis.menu`

`node common/door/door.js menu` (with the cheatsheet's alias, `d menu`; in the red1 shell, `menu`) opens the ERP menu on the terminal, the same menu the browser ERP shows, with the same folders in the same order. Add a role (`d 'menu role=102'`) and you see only what that role may open. Up and Down, or a number, pick an entry; Enter opens a folder, or a window's list screen (the `mis.js` screen above, on the table of the window's first tab); Esc goes back up, and from the top it quits; `/` finds an entry by name; `?` shows the keys. A process, report or form says that it opens in the browser ERP, and runs nothing. As everywhere on this page, the screen only types door lines for you, and it prints each one before it runs it (the `->` lines), so what you do on the screen you can also type, or put in a script.

The menu itself is a door line, `mis.menu [role=] [find=]`. Here the screen is driven with typed keys (`--plain` reads them from the input), finding "partner" and opening the third match:

<!-- run: menu_screen cut=200 -->
```text
$ rm -f /tmp/fast_guide_menu.ops; printf '/\n=partner\nEnter\n3\nEsc\nEsc\nq\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_menu.ops node common/door/door.js 'menu role=102' --plain | grep -E '^(-> |key |Menu|find|> )'
-> mis.menu role=102
Menu   (role 102)   295 windows
> 1  ▸ System Admin
key /
Menu   (role 102)   295 windows
> 1  ▸ System Admin
find: _   (Enter search, Esc cancel)
key =partner
Menu   (role 102)   295 windows
> 1  ▸ System Admin
find: partner_   (Enter search, Esc cancel)
key Enter
-> mis.menu find=partner role=102
find "partner"   (role 102)   295 windows
> 1    System Admin > Data > Data Import > Import Business Partner
key 3
-> (open Business Partner Group: the list screen on C_BP_Group)
-> mis.describe kind=C_BP_Group role=102
-> mis.list kind=C_BP_Group columns=C_BP_Group_ID,Value,Name,Description names=Y limit=10 offset=0 role=102
key Esc
find "partner"   (role 102)   295 windows
> 3    Partner Relations > Business Partner Rules > Business Partner Group
key Esc
Menu   (role 102)   295 windows
> 1  ▸ System Admin
key q
Menu   (role 102)   295 windows
> 1  ▸ System Admin
```

### The legal values of a column: `mis.lookup`

`mis.lookup` answers what a column may hold, the way the legacy window's drop-down does: the rows of the table the column points to, narrowed by the column's validation rule and by the role. A rule that needs a value you have not given (`@C_Project_ID@`) answers no rows and names the missing value; it never shows the unfiltered list. The process `Generate PO from Project` asks for a Project Phase; with a project given, only that project's phases come back, and the rule's own text is in the answer:

<!-- run: red1_lookup cut=700 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_empty.ops node common/door/door.js 'mis.lookup process="Generate PO from Project" column=C_ProjectPhase_ID C_Project_ID=990000'
{"request":"d-mwir4ben-3223761-1","verb":"mis.lookup","actor":"human","status":"ok","answer":{"column":"C_ProjectPhase_ID","reference":19,"valRule":{"id":165,"code":"C_ProjectPhase.C_Project_ID=@C_Project_ID@","sql":"C_ProjectPhase.C_Project_ID=990000"},"refWhere":null,"unresolved":[],"table":"C_ProjectPhase","rows":[{"value":990000,"name":"1 · Substructure"},{"value":990001,"name":"2 · Superstructure"},{"value":990002,"name":"5 · MEP Rough-in"},{"value":990003,"name":"6 · Architecture"},{"value":990004,"name":"9 · MEP Final"},{"value":990005,"name":"10 · Finishes"},{"value":990006,"name":"99 · Unsequenced"}],"shown":7,"total":7},"why":null,"notChecked":[],"ops":[],"next":[],"ms":1351}
```

## erp: documents and processes

The chain from a building to its ERP Project Order, after the guide's `cost` and `post`.

### More of the building-to-order chain

Posting a building that is already in its order changes nothing, and the purchase side runs on the new project.

Posting a building that is already in its order changes nothing:

<!-- run: chain_post_again -->
```text
$ printf 'cd Duplex\npost\ny\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_chain.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_chain.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
building Duplex
erp.process name="Fold from BIM" Building=Duplex   run it? y/N
→ erp.process name="Fold from BIM" Building=Duplex
ok · erp.process
Nothing to post: Duplex is already in its Project Order (model ce1f9d6454f0) · no document made
Open the project? y/N → cd project
```

Now the purchase side. In the ERP kind `Project`, `run "Generate PO from Project"` asks its parameters in the dictionary's order: the project, an optional phase (the pick list holds only that project's phases), an optional project line, and whether to consolidate into one document (default `Y`). The session below types the project and answers the other three with Return (leave out, leave out, keep `Y`):

<!-- run: chain_po -->
```text
$ printf 'cd Project\nrun "Generate PO from Project" C_Project_ID=990001\n\n\n\n' | BIM_OBJECT_OPLOG=/tmp/fast_guide_chain.ops BIM_DOOR_JOURNAL=/tmp/fast_guide_chain.journal node common/door/red1.js 2>/dev/null | sed 's/ · [0-9]* ms//'
→ mis.describe kind=Project
Project: 48 properties; ls shows C_Project_ID, Value, Name, Processed, SalesRep_ID
→ mis.list kind=AD_Process_Para columns=ColumnName,Name,IsMandatory,DefaultValue,SeqNo,AD_Reference_ID sort=SeqNo limit=50 master="Process/Generate PO from Project"
→ mis.lookup column=C_ProjectPhase_ID process="Generate PO from Project" limit=50 C_Project_ID=990001
run: pick Project Phase (C_ProjectPhase_ID, 8)
> 1    (leave it out)
  2    1 · Substructure · 990007
  3    2 · Superstructure · 990008
  4    5 · Architecture Envelope · 990009
  5    7 · MEP Rough-in · 990010
  6    8 · Architecture Closeup · 990011
  7    9 · MEP Final · 990012
  8    10 · Finishes · 990013
  9    99 · Unsequenced · 990014
Up/Down or 1-9 pick · Enter choose · Esc cancel
C_ProjectPhase_ID: left out
→ mis.lookup column=C_ProjectLine_ID process="Generate PO from Project" limit=50 C_Project_ID=990001
run: pick Project Line (C_ProjectLine_ID, 43)
> 1    (leave it out)
  2    10 · 990000 · 990028
  3    10 · 990002 · 990031
  4    10 · 990017 · 990040
  5    10 · 1600228 · 990047
  6    10 · 990013 · 990057
  7    10 · 1600231 · 990059
  8    10 · 1600232 · 990062
  9    10 · 1600233 · 990069
       20 · 990004 · 990029
       20 · 990017 · 990032
       20 · 990014 · 990041
       20 · 1600229 · 990048
       20 · 990013 · 990058
       20 · 1600231 · 990060
  1-15 of 44  (PageDown / PageUp)
Up/Down or 1-9 pick · Enter choose · Esc cancel
C_ProjectLine_ID: left out
Consolidate to one Document (ConsolidateDocument)? [Y]
→ erp.process name="Generate PO from Project" kind=Project C_Project_ID=990001 ConsolidateDocument=Y
ok · erp.process
Generate PO from Project: done · no document made
  Product has no PO record  (×43)
```

**The honest answer is that no purchase order is made.** The products the post created carry no vendor price (no "PO record"), and the process says so for each of the 43 lines instead of answering a bare `ok`. With vendor prices on the products it would make the orders and list their numbers. The seed's own Hospital project is in the same state until it is given a warehouse, a customer, a payment term, a price list and lines of products that have vendors. The film "Fast Script ERP" ran six setup lines into a scratch op-log first (`mis.update` on the project, four `mis.new kind="Project Line"`), and the same `run` then made three purchase orders from four lines. Those lines are the film's, not part of this guide.

### The door starts the core plugins

The BIM Document window, with the process `Fold from BIM` that `post` runs, belongs to a core plugin. The door starts the core plugins itself, from the same list the browser reads (`erp/plugins/builtins.json`), and keeps their dictionary in memory only: nothing of it reaches your op-log or the seed. So a plugin's window answers at the door like any other:

<!-- run: door_bimdoc cut=420 -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_empty.ops node common/door/door.js 'mis.describe kind=BIM_Document'
{"request":"d-mwkfv4i4-390775-1","verb":"mis.describe","actor":"human","status":"ok","answer":{"kind":"BIM Document","table":"BIM_Document","uu":"bimdoc-table-9541001","key":"BIM_Document_ID","highVolume":false,"properties":[{"name":"BIM_Document_ID","label":"BIM Document","type":"id","mandatory":true,"updateable":false,"key":true,"parent":false,"length":22,"displayed":false,"seq":10},{"name":"AD_Client_ID","label":"…
```

`erp.order_state` is the read behind the offer: for a building and a selection it says whether its ERP order is generated, what the engine allows next (`generate`, or a Variation Order when the model has changed under a committed order) and the exact line that does it. It changes nothing. Here it reads against an empty scratch op-log, so the building has no order yet:

<!-- run: door_order_state -->
```text
$ BIM_OBJECT_OPLOG=/tmp/fast_guide_empty.ops node common/door/door.js 'erp.order_state building=Duplex'
{"request":"d-mwizct3m-3399173-1","verb":"erp.order_state","actor":"human","status":"ok","answer":{"building":"Duplex","key":"Ifc2x3_Duplex_Federated","state":{"generated":false,"projectId":null,"plannedAmt":null},"decision":{"kind":"not-generated","actions":["generate"]},"delta":null,"offer":{"key":"generate","line":"erp.process name=\"Fold from BIM\" Building=Duplex"}},"why":null,"notChecked":[],"ops":[],"next":[],"ms":589}
```

## For developers

Keeping the ERP twin equal to the real iDempiere, and making a plugin for a legacy iDempiere.

### Check the twin against legacy

These verbs are for the person who keeps the ERP twin equal to the real iDempiere. They need a bim-ootb checkout, and for the first four the legacy test stack running (a docker Postgres and the pilot server) and the iDempiere source beside it. When a part is missing they answer `inconclusive` and say which part: they never answer an empty list or "same" for something they could not look at.

`legacy.status` asks whether the stack is up. It starts nothing; when something is down it prints the commands that start it:

<!-- run: legacy_status -->
```text
$ node common/door/door.js --list 'legacy.status'
verdict: UP
postgres: {"container":"postgres","database":"idempiere_pilot","state":"ready"}
pilot: {"url":"http://localhost:8088/webui/","http":200,"state":"up"}
summary: legacy UP: postgres ready, pilot up
next: []
```

`erp.column` answers "who fills this column", from the twin's dictionary and legacy's side by side: the column default, the validation rule, the field default, and the login default (iDempiere puts the `IsDefault` row of a referenced table into the context at login). When the two sides disagree it says `DIFFERENT` and which part:

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

`idempiere.where` finds a name in the iDempiere source and answers the file, the line and the line's text, so a claim about legacy behaviour can quote where it comes from. It shows 25 lines unless `limit` says otherwise and always gives the total; `in=callout` keeps only files whose path contains that text:

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

Three more verbs sit beside these. `legacy.query table=c_order ad_client_id=11 limit=5` reads rows from a legacy table (read only; the table and every column are checked against legacy's dictionary, and the total is always given). `erp.compare kind=Order number=50000 legacy=50981` reads one record on the twin and the matching one on legacy and compares them cell for cell; a cell where legacy is empty and the twin holds a default is labelled `NULL-VS-DEFAULT` and nothing is said about why. `witness.run name=erp_new` runs a witness from the tree, keeps its whole log, and answers its own verdict line (PASS, FAIL or INCONCLUSIVE); a witness that prints no verdict line is an error, because an exit code is not evidence, and `witness.last` reads the last recorded run without running it again.

#### Make a plugin for a legacy iDempiere (OSGi and 2Pack)

For the person who puts an ERP data model on a real iDempiere server. The data model is a workbook (Excel): one sheet per Application Dictionary table (`AD_Table`, `AD_Column`, `AD_Window`, `AD_Tab`, `AD_Field`, `AD_Menu`, and so on), one row per record, the first row the AD column names, and a `Key` column that names each row. A cell that points at another row of the workbook reads `ref:<Key>`; one that points at a row the server already has reads `existing:AD_Table:C_ProjectTask`. A sheet `Plugin` carries the plugin id, version and description. The worked example is the BIM Document model, `erp/plugins/models/BIM_Document.xlsx` in the `bim-ootb` repository.

Two things are made from the one workbook, and they are kept apart:

| Made | What it holds | Where it goes |
|---|---|---|
| **The 2Pack zip** | Metadata only: the dictionary rows, and the class *names* of any process. No program code. A pack version is applied once and never changed, so the same version with different rows is refused | The plugin's `META-INF` folder, where iDempiere's own pack activator picks it up when the plugin starts |
| **The Java model classes** | `I_<Table>` and `X_<Table>` for each table the workbook creates, in the shape iDempiere's own generator writes | The plugin's `src` folder |

What the workbook cannot make is the rules: the document action of the table, and any process's code. Those are written by hand in the plugin's `src` folder, as in any iDempiere plugin.

The door verb `erp.pack book=<workbook.xlsx> version=<x.y.z> out=<plugin>/META-INF` writes just the zip, and answers its sha256, the rows per dictionary table and the names of the process classes it points at. Run again with the same version and the same rows it answers `unchanged`; the same version with an edited workbook is refused, because a released pack is never changed. Add `java=<plugin>/src package=<java package>` and the Java model classes are written too. A person runs it; an AI's call is held as a claim until a person confirms. The script underneath is still `node erp/tools/xlsx_pack.js`, which prints a `§XLSX-PACK` line for each file it writes. The second verb, `erp.legacy_plugin book=<workbook.xlsx> version=<x.y.z>`, is the whole route on the local legacy test instance in one line. It runs five lines, and the first one that is not ok stops it: `legacy.up` (start the shared docker Postgres if it is stopped), `erp.pack` (make the zip), `legacy.refresh` (rebuild the test database from the base seed, install the plugin, start the server and wait until the pack is installed, about two minutes), `legacy.check` (read every row of the workbook back from the test database by SQL) and `legacy.witness` (run the in-server check over the server's console and answer its verdict and counts). Every step can be run alone. The instance, its database and the scripts are fixed: nothing is taken from the caller, and the pilot's databases are refused. A person runs it; an AI's call is held as a claim until a person confirms.

`legacy.check` is the read-only one, and it answers how many rows of each kind were found against how many the workbook holds:

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

Give it `version=<x.y.z>` as well and it compares the 2Pack installed in the plugin with the pack just made from the workbook, and says plainly when they differ: the refresh installs the plugin bundle as it is committed, so the two can drift apart until the bundle is rebuilt.

## What is not checked

A reply lists what its check did not cover. For the Modeller's edit report the list is:

<!-- run: notchecked cut=520 -->
```text
$ grep -o '"notChecked":\[[^]]*\]' widen.json | tail -1
"notChecked":["duplicate ids","elements changed outside the edit's own list","floating or unsupported elements","grid lines placed on top of each other","invalid coordinates","real beams: only girders walked from columns are span-checked","unknown element types","wrong units or absurd sizes, unless they hit something","zero-size elements","load capacity","beam and column rules (Regulatory Report only)"]
```

The same words apply to any answer: overlaps are bounding boxes first, a check covers only what moved, and **load capacity is never checked**. A reply with no red never means safe.

