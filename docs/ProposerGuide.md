# AI Proposer Guide

**Let your AI operate a real BIM app, with exact numbers. The app makes each change, checks it, and tells your AI what changed, what was checked, and what was not.**

Our BIM app, the Modeller, offers its actions as a short menu, each one described in plain words. Connect your AI to it, and the AI reads the menu, picks an action, fills in exact numbers, and gets the app's own verdict back. The app has no AI in it. **A change that adds new red is stopped:** it is undone and comes back with its report and the reason. Everything runs on your computer: no account, no server, nothing uploaded. Prefer to script it yourself? The same actions are a [command-line tool](#getting-started).

!!! warning "What a good report does not mean"
    The report checks a short list of things, listed in [What is not checked](#what-is-not-checked). A report with no red **never means safe, compliant or good**. Nothing here checks load capacity, and a structural engineer has the last word.

## New to this? Why an AI needs a checker

**Two kinds of computer answer.**

- **Probabilistic: an AI model.** It writes the most likely answer, word by word, from patterns it learned. The answer is often useful and sometimes wrong, and it sounds just as sure either way. Ask twice and you may get a different answer. Autodesk says the same of its own assistant: *"AI-generated responses are based on patterns and probabilities."* ([Autodesk Assistant help](https://help.autodesk.com/cloudhelp/2027/ENU/WSPro-Help/files/GUID-9017743B-6B2E-41D1-BF66-EF3FEFEFCAB2.htm))
- **Deterministic: this app.** It follows fixed rules on the real model. The same building and the same change give the same answer every time, and it shows its working. Think of a calculator: 11.176 + 1.824 is always 13.

| | An AI model | This app |
|---|---|---|
| How it answers | the most likely answer | by fixed rules, on the real building |
| Same question twice | may differ | the same, byte for byte |
| Shows its working | it explains, but cannot prove | before and after, the limit, the bay |
| Good at | ideas, plain-language requests | exact changes and checks |
| Weak at | knowing when it is wrong | coming up with ideas |

**So each does its own part.** Your AI turns a plain request into an exact change and explains the answer. The app makes the change and judges it. Your AI never touches the model: it only asks, and the app does the work.

**A real example.** Asked for a 13 m bay between lines gx5 and gx6 on the HospitalGarage:

1. The AI reads the grid: gx5 is at 145.987 m and gx6 at 157.163 m, so the bay is 11.176 m.
2. It asks the app to shift gx6, and every line after it, by 1.824 m.
3. The app makes the change and checks it: **Stopped.** *"Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m."* The change is undone.
4. The AI tells the user that a concrete beam there may span at most 12 m, and that 13 m needs another column line.

The AI's sums were right. What it did not know is this building's 12 m span limit; the app knows it, because it comes from the building itself. In our earlier test, an AI that only got a written report named that limit and still kept the 13 m bay ([What we measured](#what-we-measured)). That is why the app, not the AI, has the last word.

## Connect your AI

This makes the app's actions a menu your AI can use by itself. It works with any AI app that supports MCP, the open standard that Claude, among others, uses to connect to tools.

**1. Make a folder, install the browser engine, and download the two files.**

```bash
mkdir proposer && cd proposer
npm init -y
npm install puppeteer@24
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/bim_mcp.js
```

**2. Add it to your AI app.**

- **Claude Code:** `claude mcp add bim -- node "$PWD/bim_mcp.js"`, then start a new session.
- **Claude Desktop**, and most other MCP apps: add this to the app's MCP settings, with the full path to the file, then restart the app.

```json
{ "mcpServers": { "bim": { "command": "node", "args": ["/full/path/to/proposer/bim_mcp.js"] } } }
```

**3. Ask in plain words**, for example: *"In the HospitalGarage, make the bay between gx5 and gx6 13 m wide."*

**What your AI gets.** When your AI app starts the connector, the connector hands it this menu, and the standing rules from [Instructions to give your AI](#instructions-to-give-your-ai), so you paste nothing:

| Action | What it does |
|---|---|
| `bim_lines(building)` | reads the grid: every line's id and position in metres, the structural system, the material, the rotation. Changes nothing. |
| `bim_try_shift(building, line, move)` | shifts a line, and every later line on its axis, by `move` metres. The app makes the change, checks it, and returns its report; a change that adds new problems is undone, with the reason. Nothing is saved. |

Each action runs the same [command-line tool](#getting-started) underneath and returns its answer unchanged. A call takes about 10 to 40 seconds, because each one opens a fresh copy of the building.

**What has and has not been tested.** A scripted client, with no AI, played the 13 m example through the connector alone: it read the grid, computed the shift, and got the stop above, and each action's answer matched the command-line tool's, byte for byte. A real AI using the connector has not been measured yet. Two actions only, so far: moving one line is still command-line only.

## Getting started

You need Node 18 or newer. These steps were run on Node 18.19.

**1. Make an empty folder and install the browser engine.**

```bash
mkdir proposer && cd proposer
npm init -y
npm install puppeteer@24
```

Puppeteer downloads its own copy of Chrome the first time. Version 24 matters: the newest version needs Node 22.

**2. Download the one file you need.**

```bash
curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js
```

**3. Ask the Hospital for its grid.**

```bash
node edit_cli.js --building Hospital --lines
```

This opens the [live Modeller](https://red1oon.github.io/bim-ootb/modeller/modeller.html) with no window, opens the Hospital, and prints JSON. It took about 40 seconds here.

You will see 124 grid lines, `gx0` to `gx68` and `gy0` to `gy54`, with their positions in metres:

```json
{"ok":true,"building":"Hospital","edits":[],"ms":38414,
 "model":{"grid_source":"column-derived","system":"column-framed","material":null,"mixed":false,"girders":84,
          "rotation_deg":0,"frame":"world",
          "lines":[{"id":"gx0","axis":"x","pos":-11.655,"world":-11.655}, "..."]}}
```

`grid_source` says where the lines came from. Here they were measured from the building's own columns.

`pos` is each line's position across the building's own grid, the frame a `--move` uses, so a bay is simply the difference of two positions. On a rotated building `rotation_deg` says by how much (the HospitalGarage: −2) and `frame` is `"building"`. `world` is where the line meets the world axis, as the Modeller draws it; on a rotated building it reads every bay slightly long (about 0.06 % at 2°), so do not compute bays from it. On a rotated building the two numbers also differ by a fixed offset, because the building's grid turns about its columns' centre; only differences between positions matter.

**4. Propose an edit.** Now try the worked example below.

## Worked example: the Hospital

**The request:** *"Widen the bay between lines gx37 and gx38 to 6.5 m."* The lines say that bay is 5.707 m now, so it needs +0.793 m.

### First try: shift the line and everything after it

```bash
node edit_cli.js --building Hospital --shift gx38 --move 0.793
```

It comes back with exit code 3:

```json
{"refused":true,"grid":"gx38","move":0.793,
 "reason":"filling #5531 straddles the line in #2212: it has a fixed shape and cannot stretch","shift":true}
```

A door sits across the line, in a wall that would stretch. A refusal is an answer: nothing was applied, and the reason tells your AI why.

### Second try: move only that line

```bash
node edit_cli.js --building Hospital --grid gx38 --move 0.793
```

This one is **stopped**, with exit code 3. The edit was made, judged and then undone, and the answer carries the full report:

```json
{"refused":true,"stopped_by_gate":true,"grid":"gx38","move":0.793,
 "reason":"stopped: Driven into a wall it touches: 1",
 "report":{"change":{"kind":"grid-move","grid":"gx38","recomposed":8, "...":"..."}, "rows":["..."]}}
```

The report inside says:

| Row | Result |
|---|---|
| Moved | 8 elements |
| Box overlaps over 20 mm, among those moved | 57 before, 46 after |
| **Driven into a wall it touches** | **1, red** |
| New clearance under the limit | 2, orange |
| Gap opened at a touching element | 1, orange |
| Beam spans | Not judged: the material could not be read |

One wall was driven into another, so it was stopped.

### What your AI should do now

Neither edit works as asked. The honest answer to the requester is: *"I could not do this cleanly. A door blocks the shift, and moving the line alone drives a wall into another. Here are the two reports."* Declining is a right answer. Keeping the edit and adding a note is not: see [What we measured](#what-we-measured).

## What each result looks like

All of these are real results from the Hospital, except the last.

| Command | Result | Read it as |
|---|---|---|
| `node edit_cli.js --building Hospital --grid gx0 --move -0.5` | No red. 2 orange. 6 moved | Nothing the report checks went wrong |
| `node edit_cli.js --building Hospital --shift gx67 --move 1` | No red. 254 moved, 51 stretched, 3 carried along, **19 left behind** (18 plates, 1 window) | **Not clean.** Those 19 crossed the line and did not follow |
| `node edit_cli.js --building Hospital --shift gx39 --move 1` | **Stopped:** 18 new overlaps, and 34 left behind | Red, undone |
| `node edit_cli.js --building Hospital --shift gx38 --move 0.793` | Refused | An answer, with its reason |
| `node edit_cli.js --building HospitalGarage --lattice-boxes --shift gx6 --move 1.817` | **Stopped:** beam spans over limit 91 → 92. Limit 12 m, RC. `gx5-gx6` goes 11.176 → 12.993 m: "bay gx5-gx6 newly over the limit: 12.993 m" | Red, undone. This is the Garage, where the material can be read |

**Expect stops and refusals on the Hospital.** It is a dense building. On a scan of its lines, a shift was refused on 116 of 122, and the other 6 each left something behind. All 16 single-line moves tried at +0.5 m came back red. That makes it a good test: an AI that reports success every time is not reading the report.

## The stop

An edit is **stopped** when its report shows new red: a red row with a count above 0, more beam spans over the limit, or a bay newly over it. The edit is undone, a recount checks that the building is back to how it was, and the answer is `{"refused":true,"stopped_by_gate":true,"reason":…,"report":…}` with exit code 3. Later edits in the same call start from the restored building.

**Not stopped:** orange rows, elements a shift left behind, and anything **not judged**. A not-judged check is listed in the answer's `gate` field, for example `"not_judged":["span_red","span_orange"]` on the Hospital. It is not a pass.

`--report-only` turns the stop off, so every edit stands and is reported:

```bash
node edit_cli.js --building Hospital --report-only --grid gx38 --move 0.793
```

**The stop runs on your machine and your AI can turn it off.** It protects a proposer from its own mistakes. It is not a security boundary. A person editing in the Modeller is never stopped this way: they see the same report and decide.

## The two edits

| Edit | Command | What it does |
|---|---|---|
| Move one line | `--grid gx38 --move 0.793` | Elements attached to the line follow. The bays on **both** sides change |
| Shift | `--shift gx38 --move 0.793` | That line and every later line on its axis move together. Elements beyond travel unchanged, and elements crossing stretch only inside the bay before it. **Only that one bay changes width** |

Moves are signed metres along the line's axis. To widen one bay, a shift is usually what you mean. You can give several edits in one call, and they apply in order:

```bash
node edit_cli.js --building Hospital --grid gx0 --move -0.5 --grid gx1 --move -0.1
```

Each call starts from a fresh copy. **Nothing is ever saved**, so proposing costs nothing and cannot damage anything.

## Reading a report

Each edit gives one report. This is the real one for `--grid gx0 --move -0.5`, shortened:

```json
{"change":{"kind":"grid-move","grid":"gx0","delta":-0.5,"recomposed":6,"riders":0,"verify":true},
 "rows":[
  {"id":"overlap","label":"Box overlap over 20 mm","scope":"6 moved elements against 7362","state":"JUDGED","before":127,"after":125,"delta":-2},
  {"id":"span_red","label":"Beam spans over limit","scope":"whole building","state":"NOT_JUDGED","before":null,"after":null,
   "note":"the material could not be read from the building, and is not guessed"}],
 "newRows":[
  {"id":"clash","label":"New or deeper box overlap","level":"red","state":"JUDGED","count":0},
  {"id":"clearance","label":"New clearance under the limit","level":"orange","state":"JUDGED","count":2}],
 "newPairs":[],
 "notChecked":["duplicate ids","...","load capacity"]}
```

**Read it in this order:**

1. **`refused: true`** (exit code 3): nothing was kept. Read `reason`. With `stopped_by_gate: true` the edit added red and was undone, and the full report is in `report`.
2. **`newRows` with `level: "red"` and `count` above 0:** the edit made something worse. Also red: `span_red` with `delta` above 0.
3. **`change.left.count` above 0**, on a shift: elements crossed the line and did not follow. **Treat it as not clean.**
4. **`state: "NOT_JUDGED"`:** that check did not run, and `note` says why. **A not-judged row is not a pass and not a zero.** On the Hospital the span rows are always not judged.
5. **`level: "orange"`:** worth telling the requester. Not a failure.
6. **`notChecked`:** always tell the requester what was not checked.

**A count before is not your fault.** `before` shows what the building already had. Compare it with `after`. The Garage, for example, already has 91 spans over the limit.

| Exit code | Meaning |
|---|---|
| 0 | Every edit was reported. Read the reports |
| 3 | An edit was refused or stopped. Read `reason` |
| 2 | The command was wrong |
| 1 | The run failed. See [Troubleshooting](#troubleshooting) |

## What is not checked

The report prints this list every time, and it comes from a test of what the checks actually catch:

- duplicate ids
- elements changed outside the edit's own list
- floating or unsupported elements
- grid lines placed on top of each other
- invalid coordinates
- real beams: only girders walked from columns are span-checked
- unknown element types
- wrong units or absurd sizes, unless they hit something
- zero-size elements
- load capacity
- beam and column rules (Regulatory Report only)

Overlaps are also **bounding boxes**, not exact shapes, and they cover only the elements that moved, so a count can disagree with a full clash check.

**An AI told to reduce red ink will find these gaps.** Zero red can just mean the errors moved to where nothing looks.

## Instructions to give your AI

**With the [connector](#connect-your-ai), your AI gets these automatically.** Without it, paste this as the system prompt, then add the lines from `--lines` and the request. A tool-using AI can run the commands itself.

```text
You propose edits to a building model. You are given its grid lines and a request.
An edit is {"grid":"<line id>","move":<metres>} or {"shift":"<line id>","move":<metres>}.
"grid" moves that one line; the bays on both sides change.
"shift" moves that line and every later line on its axis together; only the bay just before it changes width.
After each proposal you receive the compiler's report.
Treat it as bad if it was refused or stopped, if any red row has a count above 0, if a span-over-limit delta is above 0, or if change.left.count is above 0.
You may revise up to 2 times. If the request cannot be met without a bad result, decline and say why. Do not keep a bad edit and add a note.
A row marked NOT_JUDGED was not checked. Say so. Never call a result safe, compliant or OK.
Always tell the requester what the report did not check.
```

**This exact prompt has not been measured.** The rule against keeping a bad edit, and the rule that a left-behind shift is bad, were added because of the results below. The test's own prompt did not state them, so we do not know yet how much they change what an AI does.

## What we measured

We ran one AI model (`claude-sonnet-5-5`) through 10 requests, 3 times each, isolated, without telling it the limits. The rules were written down and published before each run. **These runs came before the stop:** red edits then came back as reports, not stops.

| | The AI alone, first proposal | With the report, final |
|---|---|---|
| Right outcome | 15 of 30 | 24 of 30 |
| Refused or left behind | 9 | 0 |
| Red | 6 | 6 |

**What it does and does not show:**

- **The report helped most by explaining refusals.** Told why an edit was refused, the model found a working edit or declined.
- **A report does not stop an AI that has decided.** Asked for a 13 m bay over a 12 m limit, it named the limit correctly in every revision, kept the edit anyway, and left it to the engineer. That is why the prompt above says what it says.
- **Its own forecast does not tell good from bad.** It forecast problems on 14 of 15 bad first proposals, and on 10 of 15 good ones.
- **This is a small test.** We wrote the requests, and half are traps. It is one model, and the repeats nearly match, so read it as about 10 decisions. "Clean" means only that nothing the report checks went wrong, not that the design is good. **The size of the gain is not established.**

Full method, raw results and every limit: [the contract](https://github.com/red1oon/BIMCompiler/blob/master/prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md), §12 to §14.

## Under the hood

- **There is one engine.** `edit_cli.js` drives the real Modeller page through its real commit path. It is not a copy of the rules, and a test confirms it returns the same bytes as the page.
- **It is repeatable.** The same call gives the same `edits`, byte for byte, including across separate installs.
- **Everything runs on your machine.** The page and the building are downloaded, and your edits stay in a browser that closes when the call ends.
- **The proposals are untrusted.** Nothing your AI sends becomes data until the compiler has worked it out.

### Which buildings

`--building` takes one of the buildings the app offers. **You cannot open your own model this way yet.**

| Building | Grid | Span check | Flags |
|---|---|---|---|
| **Hospital** | Its own columns, 69 × 55 lines | Not judged: material unreadable | none |
| **HospitalGarage** | Its own columns, 17 × 29 lines, rotated 2° | Judged: RC, 12 m | `--lattice-boxes` |
| **SampleHouse**, **Duplex** | Derived from walls | Not judged: no column frame | `--own-grid` |
| SampleCastle, Clinic, HHS | Derived from walls | Not judged | `--own-grid`, not tested here |
| Terminal | Not read | Not read | Not tested here |

- **`--own-grid`** matters: without it, a building with no columns uses the app's default grid, and those lines are not the building's own. `--lines` always states the source, as `app-default` in that case. Do not tell an AI those lines belong to the building.
- **`--lattice-boxes`** matters on a rotated building: ordinary boxes around long members at 2° are metres wide and report overlaps that are not there.

## Troubleshooting

| What you see | What to do |
|---|---|
| `puppeteer not found` or `puppeteer would not load` | Run `npm install puppeteer@24` in the same folder as `edit_cli.js` |
| Chrome fails to start on Linux | Chrome's system libraries are missing. Puppeteer's own troubleshooting page lists them |
| `no building X` | The message lists the names you can use |
| `no grid line gx99` | Ask `--lines` first. Line ids differ per building, and `--own-grid` changes them |
| `the building did not finish opening within 240 s` | The Hospital needs about a minute on a laptop. Check your connection, as the geometry is downloaded each time |
| A report says "not judged" everywhere | Nothing moved, so there was nothing to judge. Try a different line |

**Limits to plan for:** this is a measuring tool, not a service with uptime. Each call opens the whole building, about 40 to 75 seconds on the Hospital. Grid moves and shifts are the only edits so far. A shift has no button in the Modeller yet.
