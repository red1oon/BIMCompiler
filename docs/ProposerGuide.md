# AI Proposer Guide

**Propose a change to a real building. Get back what it changed, what was checked, and what was not.**

Your AI stays outside and proposes. A deterministic compiler, with no AI in it, works out the result and reports it. You need one file and a browser engine: no account, no server, nothing uploaded.

!!! warning "What a good report does not mean"
    The report checks a short list of things, listed in [What is not checked](#what-is-not-checked). A report with no red **never means safe, compliant or good**. Nothing here checks load capacity, and a structural engineer has the last word.

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
          "lines":[{"id":"gx0","axis":"x","pos":-11.655}, "..."]}}
```

`grid_source` says where the lines came from. Here they were measured from the building's own columns.

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

This one is reported, with exit code 0. **Exit code 0 only means a report came back. It does not mean the edit is fine.** Read the rows:

| Row | Result |
|---|---|
| Moved | 8 elements |
| Box overlaps over 20 mm, among those moved | 57 before, 46 after |
| **Driven into a wall it touches** | **1, red** |
| New clearance under the limit | 2, orange |
| Gap opened at a touching element | 1, orange |
| Beam spans | Not judged: the material could not be read |

One wall was driven into another, so this is red.

### What your AI should do now

Neither edit works as asked. The honest answer to the requester is: *"I could not do this cleanly. A door blocks the shift, and moving the line alone drives a wall into another. Here are the two reports."* Declining is a right answer. Keeping the edit and adding a note is not: see [What we measured](#what-we-measured).

## What each result looks like

All of these are real results from the Hospital, except the last.

| Command | Result | Read it as |
|---|---|---|
| `node edit_cli.js --building Hospital --grid gx0 --move -0.5` | No red. 2 orange. 6 moved | Nothing the report checks went wrong |
| `node edit_cli.js --building Hospital --shift gx67 --move 1` | No red. 254 moved, 51 stretched, 3 carried along, **19 left behind** (18 plates, 1 window) | **Not clean.** Those 19 crossed the line and did not follow |
| `node edit_cli.js --building Hospital --shift gx39 --move 1` | **18 new overlaps**, and 34 left behind | Red |
| `node edit_cli.js --building Hospital --shift gx38 --move 0.793` | Refused | An answer, with its reason |
| `node edit_cli.js --building HospitalGarage --lattice-boxes --shift gx6 --move 1.817` | **Beam spans over limit 91 → 92.** Limit 12 m, RC. `gx5-gx6` goes 11.176 → 12.993 m | Red. This is the Garage, where the material can be read |

**Expect red and refusals on the Hospital.** It is a dense building. On a scan of its lines, a shift was refused on 116 of 122, and the other 6 each left something behind. All 16 single-line moves tried at +0.5 m came back red. That makes it a good test: an AI that reports success every time is not reading the report.

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

1. **`refused: true`** (exit code 3): nothing was applied. Read `reason`.
2. **`newRows` with `level: "red"` and `count` above 0:** the edit made something worse. Also red: `span_red` with `delta` above 0.
3. **`change.left.count` above 0**, on a shift: elements crossed the line and did not follow. **Treat it as not clean.**
4. **`state: "NOT_JUDGED"`:** that check did not run, and `note` says why. **A not-judged row is not a pass and not a zero.** On the Hospital the span rows are always not judged.
5. **`level: "orange"`:** worth telling the requester. Not a failure.
6. **`notChecked`:** always tell the requester what was not checked.

**A count before is not your fault.** `before` shows what the building already had. Compare it with `after`. The Garage, for example, already has 91 spans over the limit.

| Exit code | Meaning |
|---|---|
| 0 | Every edit was reported. Read the reports |
| 3 | An edit was refused. Read `reason` |
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

Paste this as the system prompt, then add the lines from `--lines` and the request. A tool-using AI can run the commands itself.

```text
You propose edits to a building model. You are given its grid lines and a request.
An edit is {"grid":"<line id>","move":<metres>} or {"shift":"<line id>","move":<metres>}.
"grid" moves that one line; the bays on both sides change.
"shift" moves that line and every later line on its axis together; only the bay just before it changes width.
After each proposal you receive the compiler's report.
Treat it as bad if it was refused, if any red row has a count above 0, if a span-over-limit delta is above 0, or if change.left.count is above 0.
You may revise up to 2 times. If the request cannot be met without a bad result, decline and say why. Do not keep a bad edit and add a note.
A row marked NOT_JUDGED was not checked. Say so. Never call a result safe, compliant or OK.
Always tell the requester what the report did not check.
```

**This exact prompt has not been measured.** The rule against keeping a bad edit, and the rule that a left-behind shift is bad, were added because of the results below. The test's own prompt did not state them, so we do not know yet how much they change what an AI does.

## What we measured

We ran one AI model (`claude-sonnet-5-5`) through 10 requests, 3 times each, isolated, without telling it the limits. The rules were written down and published before each run.

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
