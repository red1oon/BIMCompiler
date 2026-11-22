---
description: Developer guide for BIM Compiler and bim-ootb — what is unusual about this codebase and why, how to set up with no build, how the browser app loads, how to find, change and prove things, and what not to add.
---

# Developer Guide

*As of 2026-11-13 · for a developer who will read or change the code by hand · replaces the April 2026 guide (now in `docs/archive/DEVELOPER_GUIDE.md`)*

---

## 0. Read this first: what is unusual here

This codebase is different from most web projects, and the differences are on purpose. If you open it expecting a normal
JavaScript app, several things will look broken when they are not. Ten things to know before you change a line:

| # | What you will notice | Why it is like this | What it means for you |
|---|---|---|---|
| 1 | **No framework, no build step, no bundler.** The `.js` files you edit are the files the browser runs. | The app must work offline and air-gapped, from a static folder, for years. Nothing to compile means nothing to break. | Save the file, reload the page. There is no `npm run build`. Do not add one. |
| 2 | **No `import`/`export`.** One production file uses ES modules. Files are plain `<script>` tags. | Same reason: plain scripts load from any static host, with no tooling. | **The order of `<script>` tags in the HTML page is the dependency graph.** Move a tag above what it needs and the app breaks with an "undefined" error. `viewer/viewer.html` (247 tags) and `erp/idempiere.html` (205) are the closest thing to a build manifest. |
| 3 | **One shared object, two spellings.** Viewer modules are `function setupX(A) { A.camera = … }`; other code reads the same object as `APP.camera`. | Every module gets the app object handed in, no registry. | `grep "APP.camera ="` finds nothing. Look it up in `internal/APP_SURFACE.md` (bim-ootb): 1,676 fields, each with the `file:line` that defines it. |
| 4 | **Most files end with a UMD tail**: `if (typeof module …) module.exports = X`. | The same file runs in the browser *and* in Node, so witnesses can test it without a browser. | Do not remove the tail. Your editor sees these files as modules, so "go to definition" needs the generated `types/globals.gen.d.ts` (§4). |
| 5 | **The database is SQLite running inside the browser tab** (sql.js, WebAssembly). There is no server. | Local-first: the user's data lives with the user. | Reading and writing data is SQL against a file in memory. "The backend" is a `.db` file. |
| 6 | **A service worker caches files for offline use.** Precached files are served cache-first. | Air-gapped use. | **After you edit a precached file, the browser keeps serving the old one** until its `?v=` and the worker's `CACHE_VERSION` go up. Run `node scripts/bump.js <file> --write` (§5.1). |
| 7 | **Some parts load only when first used** (the viewer's Find/navigate parts, from a list in `viewer/main.js`). They are not precached, on purpose. | Fast start: no bytes spent on features you have not opened. | Keep it that way. Never add a lazy module to the precache list to "fix" a warning. `bump.js` handles lazy lists for you. |
| 8 | **Proof is a log line, not a screenshot.** Code prints `§TAG` lines (`console.log('§CLASH_FILM …')`); about 9,300 distinct tags. | A value you can read back is evidence; a picture is not. | When you claim something works, show the `§` line that proves it. Exit code 0 is not evidence. Read the log. |
| 9 | **Tests are called witnesses**, and each one names the issue it proves or disproves. About 1,350 witness files. | A test that passes without telling you whether the problem is solved is not a test. | A witness must be able to say FAIL and INCONCLUSIVE (nothing was judged), not only PASS. Start new ones from `witness_kit/contract.js`. |
| 10 | **Data changes ship as SQL, not as database files.** | A small text patch is reviewable and reaches a live user without a binary ever moving. | Never commit a `.db`. Write a patch (`migration/*.sql`, or `<app>/patches/*.sql`) **and** make sure the app's loader applies it on load (§5.3). |

Two more habits run through every file:

- **Spec before code.** Most important files open with a `# ⚠ DO NOT REMOVE — SPEC (W-NAME)` block: scope, rules R1..Rn, and the
  witness that proves each rule. Read the header and you know the file without reading the body. Example: `viewer/db_resolve.js`.
- **Extract, don't invent.** Values come from the source model (IFC), the database, or the legacy system being mirrored. No
  made-up numbers, no defaults dressed up as data.
- **It is free and open source (MIT), and changes go through the tracker.** Open an issue first, then a pull request that
  links it. See §10.

### 0.1 Witnesses: how the proof works, and why it costs the user nothing

A **witness** is this project's test: a plain Node script, `witness_*.js`, 1,403 of them. Each one is a **unit test of one item**: one
function, one rule, one bug. It names the issue it proves or disproves, and it can say **FAIL** and **INCONCLUSIVE** (nothing was judged),
not only PASS. Run one with `node <file>` from anywhere. It exits 0 (pass), 1 (fail) or 2 (inconclusive). There is no test runner and no build.

> **For developers only.** You run a witness while you change the item it covers, and CI runs a set of them on every pull request.
> **A normal user never calls one:** the app pages do not load them, so using the app runs no witness code (the table below shows how).

**How it can test the app without a browser.** Most app files end with a small tail (pattern 4 in the table above):
`if (typeof module !== 'undefined' && module.exports) module.exports = API; else global.ScheduleInject = API;`
(`viewer/schedule_inject.js:259`). So the **same file** the browser loads
can also be `require`d by Node. A witness loads the real file, feeds it a known input, and judges the output. Example:
`erp/tests/witness_core_timing.js` requires `viewer/schedule_inject.js` and `viewer/egress_sanity.js`, runs them under a fake clock, and
checks every `ms=` it prints. Nothing is copied, so the code that passes is the code the user gets.

**How it judges: the `§` line.** App code prints tagged lines, `console.log('§GEO_ORDER n=… orderMs=…')`. A witness catches those
lines and checks the values in them. A saved witness log starts with `§LOG_STAMP` (the commit that made it, §6).

**What is deployed, and what is not** (checked on the live site, 2026-11-16):

| Part | Reaches the user's browser? | Why |
|---|---|---|
| Witness files (`*/tests/`, `witness/`, `witness_kit/`) | **Never loaded.** No page has a `<script>` that points at them, and no service-worker precache list holds one, so a page load fetches 0 bytes of witness code. | They run in Node on a developer's machine, or in CI. |
| The same witness files, by URL | **They can be fetched, but only if someone asks for that URL.** The Pages deploy uploads the whole repository (`.github/workflows/deploy-pages.yml`, `path: '.'`), so `…/bim-ootb/erp/tests/witness_env_views.js` answers 200. The minifier skips `tests/` folders (`scripts/minify_pages.js`). | The repository is open source, and every tracked file is public anyway. |
| The `§` lines inside app code | **Yes, they ship and run.** They are ordinary `console.log` calls in the app files. The live `viewer/schedule_gate.js` holds `\xA7GEO_ORDER` (the minifier writes `§` as `\xA7`). | They are the evidence. The same line a witness checks also prints in a user's browser console, so a problem in the field leaves the same trail. The cost is a few bytes and a console call per line, and nothing shows on the page. |

So proof adds no weight to a page load: the witnesses sit beside the app, never inside it. The only part of the proof
that ships is the `§` lines, and those are part of the code anyway.

**The whole picture: the dev side beside the deployed side** (bim-ootb `main` @ `9b7d2f86`, 2026-11-16).

```mermaid
flowchart LR
  subgraph DEV["DEV SIDE: a developer's machine or CI (never loaded by a page)"]
    W["Witnesses<br/>1,403 witness_*.js<br/>2,112 JS files in test folders<br/>284,795 lines"]
    T["Dev tools<br/>devtools/ (VS Code Code Facts): 52 files, 5,385 lines<br/>scripts/: 133 files, 17,400 lines"]
    N["node witness_x.js<br/>exit 0 / 1 / 2<br/>log in logs/, line 1 = §LOG_STAMP"]
    W --> N
    T --> N
  end
  subgraph APP["THE SAME FILES: the app code"]
    C["App code<br/>1,004 JS files, 313,887 lines<br/>63 HTML pages<br/>22,429 lines carry a § tag"]
    V["Vendored libraries<br/>127 files, 30.1 MB"]
  end
  subgraph LIVE["DEPLOYED SIDE: github.io, then the user's browser"]
    D["Deploy (deploy-pages.yml)<br/>minifies its own JS: 644 files<br/>16.6 MB to 8.6 MB, gzip 5.4 MB to 2.8 MB"]
    P["Page load<br/>service-worker precache:<br/>viewer 268, ERP 403, Modeller 157 entries<br/>witness entries: 0<br/>the rest loads lazily, on use"]
    K["Browser console<br/>the § lines print here too"]
    D --> P --> K
  end
  N -- "require() the real file<br/>and read its § lines" --> C
  C --> D
  V --> D
```

| Number | Value | Where it comes from |
|---|---|---|
| Witness files | 1,403 named `witness_*.js`; 2,112 JS files in test folders (with helpers and fixtures), 284,795 lines, 23.4 MB | `git ls-files` at `9b7d2f86` |
| App code | 1,004 JS files, 313,887 lines, 23.6 MB, plus 63 HTML pages (38,399 lines) | the same, without test folders, `scripts/`, `devtools/`, `docs/`, `prompts/` and vendored `lib/` |
| What the deploy ships of its own JS | 644 files; 16,959 KB to 8,841 KB minified; 5,543 KB to 2,831 KB gzipped | the deploy's own log line, `§PAYLOAD-MIN-TOTAL`, run `43830642465` |
| What a page caches up front | viewer 268, ERP 403, Modeller 157 precache entries; **0** of them a witness | `PRECACHE_ASSETS` in the three `sw.js` |
| `§` lines that ship | 22,429 lines of app code contain `§` (a text count: comments that mention a tag count too) | grep over the app files |

The two sides share one set of files. A developer's witness runs that exact file in Node. A user's browser runs it from the site, minified,
with no witness beside it. Re-measure with `bim-compiler/scripts/code_arch/size_stack.sh <bim-ootb tree>`; it prints one `§STACK_SIZE` line per number.

**Why this shape.** (1) The proof runs on the exact file that ships, with no test copy that can drift. (2) No build step and no test
framework, which keeps the project's no-install rule (§3). (3) A test that cannot fail is not a test. Every new witness carries a
**red control**, a case that must FAIL, and it is run once against the old code to show that it does.

**Limits, said plainly.** A witness depends on the checkout: it `require`s files by path, and the ones built on `witness_kit/contract.js`
need `npm install` once. Many still hard-code the author's home folder (§8). Browser witnesses exist too (they say so in their header),
but the default is Node. How to write one: §6.

---

## 1. The picture: parts and patterns

### 1.1 The parts

```mermaid
flowchart LR
  subgraph Browser["One browser tab, no server"]
    P["HTML page<br/>viewer.html / idempiere.html / modeller.html<br/>(script order = dependency order)"]
    L["Lazy loader lists<br/>viewer/main.js modules[]"]
    V["Viewer modules<br/>function setupX(A)"]
    S["Shared services (UMD)<br/>erp/ common/ modeller/"]
    APP[("APP object<br/>(read APP.x, written A.x)")]
    DB[("SQLite in WASM (sql.js)<br/>building DB / ERP DB + op-log")]
    SW["Service worker<br/>offline cache"]
  end
  P --> V
  P --> S
  P -. "first use" .-> L --> V
  V <--> APP
  S <--> APP
  V --> DB
  S --> DB
  SW -. "serves files" .-> P
  W["Witnesses in Node<br/>load the same .js files"] -. "prove" .-> S
  C["BIMCompiler (Java/Python)<br/>extract IFC, mine rules, compile BOM"] -- ".db files + SQL patches" --> DB
```

**bim-ootb folders, by role** (file counts 2026-11-13):

| Folder | Role |
|---|---|
| `viewer/` (926) | The BIM viewer: scene, streaming, panels, tools, 4D schedule ("time machine", `tm_*`), film/camera (`cpe_*`, `fx_*`, `maxq_*`), Find (`nf_*`, lazy) |
| `erp/` (1,063) | Kernel-ERP: dictionary parser (`ad_*`), windows (`crud_*`), models (`model_*`), processes, posting, op-log (`kernel_ops.js`), migration readers |
| `modeller/` (717) | The Modeller (assemble and hand off): walkers, DXF to BIM (`dxf2bim/`), rules editor |
| `common/` (269) | Shared by more than one app: room graph, history bar, the relay layer (`common/comm/`), file store |
| `capex/`, `teams/`, `hr_bim_asset/` | Add-on apps and overlays: CAPEX dashboard, Teams collaboration overlay, HR/tenancy module |
| `bim/`, `geomapping/`, `readiness/`, `standards/`, `schema/` | Tools and data: IFC utility knife, IFC-to-BOM geomapping, readiness toolkit, jurisdiction packs, the building DB schema |
| `buildings/` | Building DB patches and analysis (the full DBs are served from object storage) |
| `witness/`, `witness_kit/`, `tests/`, `*/tests/` | Witnesses and the shared witness contract |
| `scripts/` | Developer tools: `bump.js`, generators, split tooling. Never loaded by a page |

### 1.2 The patterns: learn these eight and you can read any file

| # | Pattern | What it looks like (real code) | Example |
|---|---|---|---|
| 1 | **Viewer module**: a function that receives the shared object and hangs its parts on it | `async function setupScene(A) {` … `A.camera = camera;` | `viewer/scene.js:8`, `:163` |
| 2 | **Shared service (UMD)**: one closure, published to the browser *and* to Node | `(function (global) {` … `global.CpmSchedule = API;` `if (typeof module !== 'undefined' && module.exports) module.exports = API;` | `viewer/cpm_schedule.js:44`, `:935-937` |
| 3 | **Spec header**: the file's contract, with the witness that proves it | `// # ⚠ DO NOT REMOVE — SPEC (W-DB-404-OCI-RETRY)` `// SCOPE: one pure decision — …` `// WHY: …` | `viewer/db_resolve.js:6-14` |
| 4 | **`§` log line**: the proof that code ran, with the values | `console.log('§TAG key=value …')`, about 9,300 distinct tags | any production file |
| 5 | **Lazy loader list**: parts fetched on first use, not at boot | `var modules = [ 'find_erp_push.js?v=5', … 'nf_room.js?v=1', … 'navigate_find.js?v=65' ]` | `viewer/main.js` (Find/navigate) |
| 6 | **Dictionary-driven ERP**: windows, tabs and fields read from the iDempiere dictionary, not hand-coded | `// ad_parser.js — iDempiere Application Dictionary parser for SQLite` `// Reads AD_Menu, AD_Window, AD_Tab, AD_Field, AD_Column from SQLite.` | `erp/ad_parser.js`, then `erp/crud_*.js` |
| 7 | **Op-log**: every change is a hash-chained operation, so history can be replayed and checked | `function commitOp(db, opType, params, inputGuids, outputGuid, opUuid, ts) {` | `erp/kernel_ops.js:79` |
| 8 | **Self-heal patch**: a shipped DB is fixed by a SQL patch the page applies on load | `A._applyPendingPatch = async function(buf, url) {` + `buildings/patches/*.sql` | `viewer/scene.js:2111` |

Most files are pattern 1 or 2, with a 3 at the top, printing 4s.

### 1.3 Your iDempiere: how the BIM code talks to it

This guide assumes your administrator already runs iDempiere and its PostgreSQL database (for example in Docker); it does not cover
installing them. The BIM code never opens that database. It talks to iDempiere only through iDempiere's **stock web services**
(`/ADInterface/services/rest/model_adservice/…`, part of `org.idempiere.webservices`), with a user, a role and a password on every call,
and only through the **web-service types** your administrator installs. A type not installed is refused by the server
(`Service type … not configured`), never worked around.

There are two links, and they differ in where the code runs:

| Link | Code | Runs in | Needs on your iDempiere | State |
|---|---|---|---|---|
| **Read: iDempiere → CAPEX dashboard** | `capex/tools/legacy_snapshot.js` (reads), `capex/adapters.js` `loadLegacy` (the tables and columns) | **Node, beside the server**, so the browser never calls iDempiere | the read types of UAT Guide A2: `202611042300_CAPEX-WS-READ.sql` (required), the *Q4*, *chain*, *pacalc* scripts (optional), then a restart | In use: the UAT Guide's chapter D runs it |
| **Write: Viewer → iDempiere Project Order** | `viewer/erp_rest_push.js` (the calls), `viewer/erp_push_plan.js` (the plan), `viewer/find_erp_push.js` (**› ERP**, asks for the password once per tab) | **the browser** | the BIM OOTB plugin's `BIMOOTB_*` types and its role (`iDempiereOOTB/org.idempiere.bimootb/`); the Viewer served from iDempiere's own address (`/bimootb/…`) | Proof of concept, not packaged for a site |

**The read job.** Run it where Node can reach iDempiere:

```
BRIDGE_BASE=http://<your-idempiere>:<port> BRIDGE_USER=... BRIDGE_PASS=... BRIDGE_CLIENT=... BRIDGE_ROLE=... BRIDGE_ORG=... BRIDGE_WH=... \
  node capex/tools/legacy_snapshot.js
```

It writes `capex/legacy_snapshot.json`; open `capex/index.html?source=legacy` to see it. The password stays in the job. Read its last line:

| Last line | Meaning | What to do |
|---|---|---|
| `§DASH_LEGACY_READ_VERDICT PASS optional_missing=[…]` | Every table the dashboard needs was read. The listed optional ones (for example `bimdocs` without the BIM Document plugin) show as *no data (not installed)* | Nothing |
| `§DASH_LEGACY_READ_VERDICT FAIL required_missing=[…]`, exit 1 | The read types are not installed. Each `§DASH_LEGACY_UNAVAILABLE` line above it quotes the server's reason | Apply UAT Guide A2, restart iDempiere, run again |
| `§DASH_LEGACY_SNAPSHOT FAIL …` | Login refused or the server not reached | Check the address, user, role and password |

Measured 2026-11-19: on a pilot with the A2 types the job read 13 projects and every table but `bimdocs` (PASS); on a test instance without them
it named the 8 missing required types and exited 1.

**Why the browser cannot simply call your iDempiere.** A page on one address (GitHub Pages, or your own `:8080`) may read an answer from another
address only if that server allows it with an `Access-Control-Allow-Origin` header. Stock iDempiere sends none: measured 2026-11-19, both the
browser's pre-check (`OPTIONS`) and a real `POST` to `model_adservice` came back without it. So the read link runs in Node, and the Viewer's
**› ERP** push reaches a real iDempiere only when the Viewer itself is served by that iDempiere under `/bimootb/` (the plugin's web bundle,
the bundles `org.idempiere.bimootb` and `org.idempiere.bimootb.viewer` under `iDempiereOOTB/` in this repository, built by `iDempiereOOTB/org.idempiere.bimootb/tools/build_bundle_poc.sh`), or behind a reverse proxy that puts both on one address. Opened anywhere else,
**› ERP** folds the Project Order into the browser's own Kernel ERP only, which is what UAT Guide B4 tests. The plugin's state and its
open steps: `prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md` §8.

**Proving the write path without a server:** `node tests/poc_erp_rest_push.js` (bim-ootb) runs the push against a mock that enforces iDempiere's
own rules (no free `Filter`, keys bound as fields) and must print `§POC_ERP_REST_PUSH_VERDICT PASS`. It does not prove a real server accepts it;
`capex/tests/witness_viewer_push_legacy.js` does, and it creates a project on the server it is pointed at, so point it only at a test instance.

---

## 2. The two repositories

| Repo | What it is | Language | Where to start |
|---|---|---|---|
| **bim-ootb** | The browser app: **Viewer**, **Modeller**, and the **Kernel-ERP** (an iDempiere-compatible ERP). This is what users run. | Plain JavaScript, sql.js (SQLite WASM), Three.js | `viewer/viewer.html`, `erp/idempiere.html`, `modeller/modeller.html` |
| **BIMCompiler** (this repo) | The compiler and the lab: IFC extraction, rule mining, BOM compilation and the proof gates; specs (`prompts/`), docs (`docs/`), scripts. | Java 17, Python, SQLite, shell | `docs/ArchitectureOverview.md`, `prompts/` |

The browser app was split out of this repo in May 2026. Since then bim-ootb is where the product changes; this repo holds the
compiler, the specs and the docs site.

**Size, measured 2026-11-13 (bim-ootb):** 856 production `.js` files, 286,724 lines (vendored libraries, tests and witnesses
not counted). You will not read it all; §6 says what to read first.

**⚠ Copies.** This repo still holds old copies of many bim-ootb files (under `build/scriptor/*/_kw_old/`, `deploy/live/`,
`deploy/sandbox/`, `deploy/dev/`). 329 of them differ from the real file. **bim-ootb is the source.** The committed
`.vscode/settings.json` hides most of these copies from search, and makes `deploy/live/` (the production snapshot) read-only.

---

## 3. Start from scratch: download, run, set up VS Code

There is nothing to build, and you can do all of it from a terminal without visiting GitHub. One script, `scripts/setup.js`, takes a fresh download to a working setup: the dev
tools installed and checked, Code Facts installed, VS Code opened on the folder. It is proved by the witness `scripts/tests/witness_setup.js`
(W-SETUP: 20 checks on 2026-11-18, including a real VS Code that opens the folder with Code Facts active and the tasks listed) and by
`scripts/tests/witness_from_scratch.js` (W-FROM-SCRATCH, every step from an empty folder). Run either to check your own machine.

**What you need**

| Tool | Needed for | Ran with |
|---|---|---|
| Node.js 18 or newer | the setup script, the dev tools, the witnesses | 18.19 (CI uses 20) |
| curl, tar | step 0 (fetching) | any |
| Python 3 | serving the pages (`--serve`), or any static server you prefer | 3.12 |
| VS Code, with its `code` command on your PATH | the VS Code side (optional) | 1.146 |
| git | only to contribute a change (§10); setup does not need it | 2.43 |

**0. Fetch the code** (no git, no GitHub account; about 4,800 files, about 540 MB):

```
curl -L https://github.com/red1oon/bim-ootb/archive/refs/heads/main.tar.gz | tar xz
cd bim-ootb-main
```

Why the archive and not `git clone`: a GitHub archive carries no large-file (LFS) objects, while a clone on a machine with git-lfs installed tries to
download them, and this project's LFS bandwidth is used up. If you do need a clone: `GIT_LFS_SKIP_SMUDGE=1 git clone https://github.com/red1oon/bim-ootb.git`.
The folder has no `.git`: that is normal, every tool below works without it. (The browser's **Code ▸ Download ZIP** gives the same files.)

**1. Set up** (installs what the dev tools need, checks them, installs Code Facts, opens VS Code on the folder):

```
node scripts/setup.js --open
```

It prints one `§` line per step and ends with a verdict. Real output (2026-11-18, shortened):

```
§SETUP_PREREQ node=18.19.1 npm=Y python3=Y code=/snap/bin/code
§SETUP_DEPS npm_ci=ok espree=Y
§SETUP_TOOLS manifest=PASS proof_map=PASS bump=PASS
§SETUP_VSC code=/snap/bin/code codefacts=installed eslint=recommended tasks=6 snippets=3 launch=Y mode=throwaway ext_dir=<folder>/.setup/vscode-ext
§SETUP steps=4 ok=4 gaps=0 verdict=PASS
```

`npm ci` (about 10 seconds, the one step that needs the network) is needed by the manifest and bump tools (and gives you the lint check). The app itself needs nothing installed. A second run says `§SETUP_DEPS skipped=present` and changes nothing. A problem is a `§SETUP_GAP` line with the one-line
fix, never a silent skip, and `verdict=FAIL` (exit 1) only when something you asked for did not work.

| Flag | Does |
|---|---|
| `--open` | opens VS Code on the folder (in throwaway mode, with the Code Facts extensions folder setup made) |
| `--install` | the ONLY way your own VS Code profile is touched: Code Facts and the recommended extensions (ESLint) go into your normal extensions folder, the latter from the Marketplace |
| `--serve [port]` | serves the folder on `http://localhost:8000` (or your port) and prints the three app URLs; leave it running |
| `--no-code-facts` | skip packing and installing Code Facts |
| `--dry-run` | print what each step would do, change nothing (`verdict=DRY`) |

Without `--install`, VS Code runs from a throwaway extensions and settings folder under `<folder>/.setup/` (git-ignored): you see Code Facts and nothing else of yours,
and your own profile is untouched (W-SETUP T4 checks that nothing is created under your home).

**2. Serve it:** `node scripts/setup.js --serve` (or `python3 -m http.server 8000`, or the VS Code task **Serve repo**).

**3. Open the apps** in your browser:

| Page | What you see first | Network |
|---|---|---|
| `http://localhost:8000/erp/idempiere.html` | the Kernel-ERP sign-in, with its language list | none needed |
| `http://localhost:8000/modeller/modeller.html` | the Modeller, empty, "ready" | none needed |
| `http://localhost:8000/viewer/viewer.html` | the sample building (Duplex), all 1,118 elements | **the first time, internet** |

The viewer's building files are not in the repo (they are large and are not kept in git). On the first visit the viewer asks for
`viewer/buildings/Duplex_*.db` locally, gets "404 not found" (expected: the browser console shows these as errors), and then loads
the same building from the project's file store online. After that it is cached. So: the first viewer run needs a connection; ERP and
the Modeller do not.

**To work with buildings offline on your own machine:** open any building from the landing page (`http://localhost:8000/`, or the live
site), press **Save Building** (Ctrl+S) in the viewer: it writes one self-contained `.db` file. Put that file in `viewer/buildings/`
and open `http://localhost:8000/viewer/viewer.html?db=buildings/<name>.db`. With no `?db=`, the viewer looks for
`buildings/Duplex_extracted.db` (`viewer/config.js`), so a saved Duplex under that name opens with no network at all. `*.db` files are
ignored by git, so a saved building is never committed by accident (building data is not kept in git, §5.3).

The viewer page also loads a small visitor counter (GoatCounter, `gc.zgo.at`), as the live site does. To keep your own visits out
of the count, open it once with `?ignore-me` at the end of the address.

**4. The VS Code side: what `--open` gives you, and where to look.** The repo brings its own setup in `.vscode/` (and `jsconfig.json`, `types/`, `.editorconfig`); the script only installs the extension and opens the folder.

1. **The folder is open**, with the editor settings from `.vscode/settings.json`.
2. **Code Facts is in the Extensions view** (the repo's own add-on, §4.1). Hover a shared field such as `A.camera` in `viewer/grid_views.js`: every write and read is listed. Without VS Code, the same facts: `node devtools/code-facts/code-facts.js help`.
3. **Terminal ▸ Run Task** lists the tasks of `.vscode/tasks.json` (6 today, table below).
4. **Snippets:** type `witness`, `slog` or `spec` in a `.js` file and press Tab (table below).
5. **F5 / Run ▸ Start Debugging** offers **Viewer in Chrome**, ERP, Modeller, **This page in Chrome** (any `.html` page open in the editor) and **Node: this witness / script** (`.vscode/launch.json`).
6. **Recommended extensions:** ESLint is listed in `.vscode/extensions.json`; VS Code offers it on first open, and `--install` installs it.

**Editor tasks** (Terminal ▸ Run Task):

| Task | Does |
|---|---|
| Serve repo (http://localhost:8000) | `python3 -m http.server 8000` in the background |
| Lint viewer (no-undef gate) | `npx eslint viewer` |
| Lint as CI does (viewer + modeller) | `npx eslint viewer modeller`: the `no-undef` check that catches a missing global |
| Run this witness (full log → logs/) | `node <current file>` (a `.sh` file runs with `bash`); full output to `logs/<name>.log`, last 20 lines and the exit code on screen. Line 1 of the log is a `§LOG_STAMP` (§6) |
| Run viewer witness suite (full log → logs/) | the headless witness suite (also `npm test`) |
| Run Modeller witnesses (full log → logs/) | `modeller/tests/run_all_witnesses.js`; full output to `logs/modeller_witnesses.log` |
| red1 shell (ERP + BIM door) | the `red1` command line in the terminal panel |
| Set up this folder (node scripts/setup.js) | step 1 above, from inside VS Code |
| Regenerate editor indexes | the committed `internal/APP_SURFACE.md` and `types/globals.gen.d.ts`. Code Facts does not need this: it keeps its own fresh copy (§4.1) |

**Everything runnable is runnable from the folder you opened.** Every app page, command, runner and the setup script has a route above: a named
task or launch, or a generic one for the file open in the editor. `node scripts/tests/witness_vsc_operational.js` checks all of them (39 on
2026-11-19) and fails when a new one has no route, so a PR that adds a page, a command or a runner adds its route too.

**Editor snippets** (type the word, press Tab; `.vscode/witness.code-snippets`):

| Type | You get |
|---|---|
| `witness` | a new witness built on `witness_kit/contract.js`. Unedited it FAILs, so it cannot pass by accident |
| `slog` | one log line in the repo's form: `console.log('§TAG key=' + value);` |
| `spec` | the `⚠ DO NOT REMOVE — SPEC (W-NAME)` header a new script opens with (comment lines only) |

**If something fails.** `§NEED_DEPS espree is not installed: run node scripts/setup.js`: run step 1 (the tools need `npm ci`). `§SETUP_GAP … code command is not on PATH`:
in VS Code, Command Palette ▸ *Shell Command: Install 'code' command in PATH*, then run step 1 again (the tools part already worked). `npm ci failed`: check the network and run it again.
To run the browser witnesses you also need a Chromium (Playwright's copy is used by `npm test`).

---

## 4. Finding things

| You want | Do this |
|---|---|
| Where a function or global is defined | **F12** works for true globals (`setupScene` → `viewer/scene.js`) and, through `types/globals.gen.d.ts`, for about 6 in 10 UMD globals' members (`ADParser.init` → `erp/ad_parser.js`). The rest: search for `X = ` or `function X`. |
| Where an `APP.x` / `A.x` field is set | With Code Facts (§4.1): **F12** or hover on the field. Without it: `internal/APP_SURFACE.md`. Its "phantom" list (107 fields read in production but never written, counted 2026-11-14; 11 more are flagged "untied write" and are probably live) is a list of dead guards. Check before relying on one. |
| What a `§TAG` means | With Code Facts (§4.1): hover the tag. Without it: search the tag. The code that prints it is the definition, and its spec is usually named in the same file's header. |
| Which code built a body on the Modeller canvas, or runs on an ERP field | The provenance hover (§4.3): hover it, press a number to open that line in VS Code. |
| What a spec section says (`§S59`, `W-BUMP`) | Search `prompts/` in both repos for the section or witness name. |
| A file cited as `file:line` in an old prompt | Line numbers drift (the big files were split in 2026-10). **Search for the function name instead.** |
| Which page loads a file | Search the HTML pages for the file name; for lazy parts, `viewer/main.js` `modules[]`. |

Search hides vendored libraries and six generated one-line data files (`erp/genesis_dict.js`, `erp/fk_rules.js`, …). Those
files open read-only. Edit the generator named on their first line instead.

### 4.1 Code Facts: the repo's own VS Code extension and terminal command

Code Facts answers questions about this code from the repo's own indexes (where a name is written, what a tag means, how a file reaches users, what a change costs). Read-only, no network. Two forms: a VS Code extension (this section) and a terminal command (the end of this part, "The same facts in a terminal"). *Formerly X0 (a numbering label from the parked DEV_TOOLKIT_NO_AI's X1–X6); the screenshots below were taken before the rename and still show the old name.*

The extension lives in bim-ootb `devtools/vscode/code-facts/`. It is plain JavaScript with no dependencies and no build step, it never
calls an AI model, and no page loads it. Only *Fetch back* and *Deploy main now* talk to the network (GitHub). Everything else is
answered from the repo's own files (table below), so it keeps working with no AI assistant and no connection.

**Install it** (proven in VS Code 1.146.0 by `devtools/vscode/code-facts/tests/realvsc/install.js`):

1. In the bim-ootb folder: `node devtools/vscode/pack.js`. It writes `devtools/vscode/dist/code-facts-0.1.0.vsix` (plain node, no npm, no internet).
2. `code --install-extension devtools/vscode/dist/code-facts-0.1.0.vsix`. No `code` command? In VS Code: Extensions view ▸ `…` ▸
   **Install from VSIX…** and pick that file. (`node devtools/vscode/pack.js --install` does steps 1 and 2.)
3. Reload VS Code (**Developer: Reload Window**).
4. Check: open any `viewer/*.js` and hover a field such as `APP.db`. The hover starts with `written at`.

![The Extensions view after the install: "BIM DevTools: Code Facts", publisher bim-devtools](figs/x0/00_installed.png)

*After step 3, the Extensions view (filter `@installed Code Facts`) lists it.*

After you pull changes to the add-on, run steps 1–3 again (the installed copy is a copy). Remove it with
`code --uninstall-extension bim-devtools.code-facts`. **Do not symlink the folder into `~/.vscode/extensions/`:** VS Code ignores a
folder its `extensions.json` does not list, so nothing loads and nothing warns you (this guide said to symlink until 2026-11-13).


| You do | You get | Read from |
|---|---|---|
| **F12** on `APP.camera` (also `A.x` / `app.x` in a file that binds that name) | a jump to the line where the field is written | the APP field index made by `scripts/gen_app_surface.js` |
| Hover the same field | `written at <file:line> · N writes · N reads` | the same index |
| Hover a `§TAG` in any `.js` file | up to 5 places in `prompts/` and `docs/` of both repos that name the tag (headings first), then up to 5 lines of code that print it | the specs and the source |
| Explorer side bar ▸ **Run & Ship** (6 steps, also as commands) | *Run local*: the serve task plus each app's URL and cache version on disk. *Check*: `node --check` on the JS that differs from `origin/main`, the precache audit, and the bump rule. *Cost if deployed*: see next row. *Fetch back*: is the live site on `main`'s versions and commit? *Deploy main now*: publishes `main` to the live site with your own GitHub login (it asks first; see *Deploying from VS Code* below) | the repo's own scripts and git; Fetch back reads the live site and Deploy starts GitHub's Pages build (the only two steps that use the network) |
| Status bar, and command **Cost if deployed** | `viewer: start-up · 103 KB` for the open file; the command prints, per app, start-up and offline-cache bytes of your tree against `origin/main` | each `sw.js` cache list and the pages' script tags |
| Run & Ship ▸ **3m · Memory of the three pages** (command *Memory of the three pages*) | boots the viewer, ERP and Modeller pages headless, your tree and `origin/main` side by side, and prints the JS heap each holds after boot: `§HEAP_IMPACT_DELTA page=erp/idempiere.html jsMB=+0.0 … verdict=SAME`. The status bar keeps the last result, `MB V 18.4 · E 4.2 · M 10.9`, marked *(stale)* after a save. A few minutes; **runs only when you press it**; needs the Playwright that `tests/` installs | a headless Chromium on this machine (software GL, service worker off); the same building data on both sides, so the delta is the code's (§F.31) |
| **Shift+F12** (Find All References) on the same field | every place the field is written and read, under any of its spellings; VS Code's own JavaScript support cannot give this, because the object is written under one name and read under another | every site the repo's generator recorded, kept beside Code Facts' own fresh index (nothing added to the repo) |
| A warning on line 1 after you save an edited file the offline cache serves, with a quick fix (the light bulb, or **Ctrl+.**) | *Bump the cache version for this file* (one click: the repo's `scripts/bump.js --write`), or *Show what the bump would change* (the dry run). Never done silently. For an ERP file the quick fix starts the **Bump** button instead (next row), because its checks take minutes | the *Check* step's own bump rule, for this one file |
| Status bar ▸ **Bump** (press when your feature is complete) | one background check of every file your branch changed that a page loads: the legacy-parity check and each changed file's own witnesses. You can keep working. It shows `Bump: checking n/N`, then **Bump ✓** (press again: the cache bump is written in a second, nothing re-runs) or **Bump ✗** with the first failing check (its lines are in the *Code Facts* output). Saving a file after the check puts it back to plain **Bump** | `scripts/bump.js --changed --check`, then `--write` |
| A yellow underline on a clock, random or network call in a **core** file, when you open or save it | the reason (`… reads the clock itself, so a replay or a test gets a different value`) and what to call instead (`Env.edge().nowMs()`, `Env.edge().uuid()`, `Env.elapsed()` for a timing); CI fails the same call (W-CORE-PURE). A comment, a string or a file outside the core list gets no warning | the one scanner and core list in bim-ootb `scripts/lib/core_pure.js` (§5.6) |
| A grey line above code that prints a `§TAG` | `last: <the line a saved log holds for that tag> · <log> @ <commit>`; click it to open the log | `logs/*.log` whose first line is a `§LOG_STAMP` (§6) |
| Hover a `§TAG` on the line that prints it | the same hover, ending in `last value: <line> — <log>:<line> @ <commit>`, or `last value not shown: <reason>` (`no stamped log found` · `tag not in any stamped log` · `file changed since the log` · `file was dirty when the log was made`) | the same stamped logs; the grey line stays silent without proof, the hover says why |
| Command **Code Facts: Context for this file** | one block of markdown about the open file, opened beside the code and copied: its header comment, how it reaches a user and the bump command, the `APP` fields set in it, each `§TAG` it prints with its spec place and last provable value | all the indexes above. Code Facts calls no model: you paste the block where you like (§4.2) |

**It never guesses.** Each answer below is on purpose:

| It shows | Meaning | What to do |
|---|---|---|
| `PHANTOM — read, never written`, and F12 does nothing | no code sets this field: the guard can never be true, or its writer was removed | do not rely on the field; see §11 item 4 |
| `PHANTOM? — no writer the index can tie …`, with a `file:line` | the index found no writer it can prove, but that line assigns a field of this name through a local name it could not tie to the shared object | probably live: read that line. It is a gap in the index, not a dead field |
| nothing at all on an `APP.x` | the field is not in the index (new and unsaved, or `A` is an unrelated local in this file) | save the file and hover again |
| `index stale`, and F12 does nothing | the line the index points at no longer mentions the field | hover again in a few seconds, or run **Code Facts: Rebuild indexes** |
| `no spec found` on a `§TAG` | no file in `prompts/` or `docs/` names the tag | the code that prints it is all there is: read that |

#### What you see, step by step

Every picture below is the real editor (VS Code 1.146), recorded on this repo as shipped. Nothing is a mock-up.

**1. The plain editor.** The project opens like any folder: the tree on the left, the code on the right.

![VS Code with the bim-ootb folders in the Explorer and viewer/scene.js open](figs/x0/01_editor.png)

**2. Before: the editor cannot say where a field is set.** Go to Definition (F12) on `APP.db` answers "No definition found", because the
code writes that field as `A.db`.

![F12 on APP.db without the add-on: "No definition found for 'db'"](figs/x0/02_before_no_definition.png)

**3. With Code Facts: hover.** The same line now says where the field is written, and how often it is written and read.

![Hover on APP.db: written at viewer/city.js:717, 14 writes, 704 reads](figs/x0/03_hover_written_at.png)

**4. F12 jumps to that line.**

![After F12: viewer/city.js line 717, A.db = …](figs/x0/04_jumped_to_the_write.png)

**5. A field nothing sets says so.** `PHANTOM` means the field is read but never written: do not rely on it. Here line 357 copies a
function that no code ever defines.

![Hover on APP.closeSunglass: PHANTOM, read, never written (first read viewer/main.js:357)](figs/x0/05_phantom.png)

*Picture retaken 2026-11-14. Until that day the index missed files that had been split into parts, and called 130 of these fields
phantom when they were written (bim-ootb #2961, #2974). The count went from 281 to 171; where the index still cannot be sure it now says
`PHANTOM?` and names the line to read.*

**6. Hover a `§TAG`.** You get the spec pages that name it (headings first) and the code line that prints it.

![Hover on §HOSTED_BEFORE_HOST: five spec places in bim-compiler prompts, then "printed by: viewer/schedule_gate.js:1014"](figs/x0/06_tag_hover.png)

A tag that no spec names says `no spec found`:

![Hover on a made-up tag: "no spec found"](figs/x0/07_no_spec_found.png)

**7. The code moved? It refuses a wrong jump, then catches up.** A line was added above the write and the file saved. The next hover
says `index stale`; a few seconds later the same hover gives the new line.

![Right after the save: "index stale, hover again in a few seconds"](figs/x0/08_index_stale.png)

![A few seconds later: written at viewer/city.js:718](figs/x0/09_new_line.png)

**8. Which code made this log?** A log saved by *Run this witness* starts with a `§LOG_STAMP` line. Here it names the commit, and
`viewer/city.js` as the one file that had been edited.

![A saved witness log: line 1 is §LOG_STAMP with commit, dirty=1 and dirty_files=viewer/city.js](figs/x0/10_log_stamp.png)

**9. Run & Ship.** The list sits at the bottom of the Explorer side bar. *Check* prints its three steps in the *Code Facts* output.

![The Run & Ship list (Run local, Check, Cost if deployed, Fetch back) and the output of Check: syntax, audit, bump, verdict PASS](figs/x0/11_run_and_ship_check.png)

**10. Cost if deployed.** The output lists start-up and offline-cache bytes per app; the status bar (bottom right) says how the open
file reaches a user: `viewer: start-up · 234 KB`.

![Cost if deployed output, and the status bar note "viewer: start-up · 234 KB"](figs/x0/12_cost_if_deployed.png)

**11. The value beside the code.** The grey line above line 143 is what that line last printed, with the log and commit it came from.
It appears only when that can be proven.

![A grey line above console.log: "last: §APP_SURFACE files=… fields=1693 …", with the log name and commit](figs/x0/13_value_beside_code.png)

#### Deploying from VS Code: what you need

*Deploy main now* (step 5 of Run & Ship, added 2026-11-16) publishes the repo's `main` branch to the live site. It does not publish your
own branch: get your change merged first. Nothing else is needed, and no extra key or secret: it uses the login already on your machine.

1. **Write access** to the repo on GitHub (you can push to it or merge its pull requests).
2. **The GitHub CLI**, installed (<https://cli.github.com>) and logged in on this machine: run `gh auth login` once and pick the GitHub
   account that has that access. `gh auth status` should say *Logged in*.
3. **The Code Facts extension**, installed (§4.1) and on a current build (it warns when it is older than the source, §4.1).
4. Press **4 · Fetch back**. If it says the live site is behind `main` (a version or the commit differs), press **5 · Deploy main now**
   and confirm **Deploy**. The output prints `§SHIP_DEPLOY started=Y` and a link to the run on GitHub.
5. Wait one to two minutes, then press **Fetch back** again: it must say PASS.

If something is missing, the output says what to do, and nothing is started: *install the GitHub CLI*, *run gh auth login*, or *this
workflow has no workflow_dispatch*. **Why it is needed:** a pull request that CI's bot merges starts no deploy (GitHub runs no workflow
for a merge made with the workflow's own token), so the live site stays on the last deploy until someone publishes `main`.

**The last three rows are first versions (2026-11-13). What they do not do yet:** Run & Ship does not commit, open a PR or merge; it
deploys only when you press *Deploy main now*, and it runs no browser. Cost counts raw bytes (not minified), all of an app's pages together, with no budget. The grey value line appears only
when the log names its commit and the file that prints the tag is unchanged since; otherwise it shows nothing, so expect few at first.
It reads the checkout's `logs/` and the folders in the setting `bimDevtools.extraLogDirs` (default `~/.cache/bim4d`, where bake logs are
kept; read-only). A bake log counts from the first bake after 2026-11-14, when the bake script began writing the `§LOG_STAMP` line.
*Fetch back* answers INCONCLUSIVE when the live site carries no deploy stamp, and FAIL when a version or the commit differs: right after a
merge, wait a minute or two and press it again.

**The index looks after itself.** The committed `internal/APP_SURFACE.md` is only a snapshot: about two merges in three move its line
numbers (26 of 39, measured 2026-11-13). Code Facts runs the generator into VS Code's own storage folder when it starts, and again when
a lookup misses after you saved a file. One run takes about 4 seconds in the background. It never writes inside the repo, so there is
nothing to commit and nothing to conflict on. **Do not regenerate and commit `APP_SURFACE.md` in an unrelated PR** for Code Facts' sake.

For bim-compiler specs to show in a `§TAG` hover, keep the two clones side by side (`bim-ootb/` next to `bim-compiler/`), or set
`bimDevtools.compilerRoot`. Its witnesses (node only, no VS Code needed) are listed in its `README.md`.


**The same facts in a terminal: `code-facts`.** `node devtools/code-facts/code-facts.js help` lists its verbs: `where <field>`, `uses <field>`, `tag <§TAG>`,
`loaded <file>`, `cost [base]`, `last <file>`, `context <file>`, `check [base]`, `pure`, `bump …`. It runs the same code as Code Facts and the
code-facts server, so all three give the same answer (W-CODEFACTS-CLI checks each verb against the server). It is read-only except `bump`, which is
`scripts/bump.js`. No page loads it. A shorter way to type it, optional (the repo adds no alias and puts nothing on your PATH): from inside `devtools/code-facts/`, `node code-facts.js where camera`; or add `alias code-facts='node devtools/code-facts/code-facts.js'` to your shell.

### 4.2 Working with an AI assistant in VS Code (optional)

Nothing in this project needs an AI assistant, and Code Facts never calls one. If you choose to use one, this is how it fits. The facts
about Claude Code are from its documentation (code.claude.com/docs, read 2026-11-14).

**Two kinds of help, often used together.** An *autocomplete* assistant (GitHub Copilot's original style) suggests the next lines as grey
text while you type. An *agent* (Claude Code) has no grey-text completion: you describe a task, it reads files, runs commands and proposes
edits across files, and you approve them.

**Claude Code in VS Code, two ways.** (1) The *Claude Code* extension (Extensions view; VS Code 1.94 or later): a chat panel, your
selection and open file shared with it, `Alt+K` to insert a reference such as `@file.js#5-10`, proposed edits as side-by-side diffs with
Accept / Reject, a plan you can comment on, and "rewind code to here" on earlier messages. (2) The `claude` command in VS Code's own
terminal panel: with the extension installed it connects to the editor by itself, sees your selection and the Problems panel, and opens its
diffs in the editor. The terminal has every command; the panel has a subset.

**Staying in control: the habits that matter here.**

| Habit | Why |
|---|---|
| Ask for a plan before code on anything larger than a small fix, and read it | The cheapest place to stop a wrong approach |
| Read every diff before you accept it | The diff is the truth; the summary is a claim |
| One bounded task per session, on its own branch | A session that wanders is hard to review and hard to undo |
| Make it prove the change: a witness, a `§` line, the log read | "Done" without a log line is not done (§6) |
| Select the code, then say "this" | The selection travels with your message: no describing where |
| Keep project rules in `CLAUDE.md`, not in your head | Every new session reads it; a rule only said once is forgotten |
| Rewind instead of arguing | When an edit went wrong, go back to the checkpoint and restate the task |

**Writing the code yourself in VS Code, or letting the agent write it? An honest comparison.**

| | Mostly by agent ("vibe") | Mostly by hand in VS Code, agent as helper |
|---|---|---|
| Speed on a well-described task | Fast: many files, tests and docs in one go | Slower, one edit at a time |
| How well you know your own code | It fades: you approve more than you read | It grows: you learn where things are and why |
| Control over what changes | Only as good as your review of each diff | Direct: nothing changes that you did not type or accept |
| Cost | Paid per use, and long sessions cost the most | The editor and the add-on cost nothing to run |
| Same answer twice? | No. The same request can give different code | Yes for the tools here: an index lookup, a check, a byte count give the same answer every time |
| When it goes wrong | Plausible-looking mistakes, found late | Your own mistakes, usually found at once |
| Tedious, wide work (rename in 40 files, write a witness, draft a spec) | Its best use | Slow and error-prone by hand |

**The three worries, plainly.** *Losing control:* an agent does what it is allowed to do, so the limits are yours to set: it asks before
it edits, changes arrive as diffs, work stays on a branch and merges only through a pull request with checks. *Runaway cost:* cost follows
session length and the number of helpers started, so keep tasks small, start a new session for a new task, and let free deterministic
tools answer what they can (the facts server and Code Facts' commands cost nothing). *Results that vary:* true of the model, not of code. This
project's answer is to make the model's work checkable by things that do not vary: a parser, a witness with a red control, a `§` line in
a log, a commit hash. A result that passes those can be trusted on that evidence, whoever typed it.

**A path that keeps you in charge.** (1) Read and navigate in VS Code with Code Facts until you can find anything yourself. (2) Make
small edits by hand; run *Check* before every commit. (3) Give the agent the wide or tedious jobs, one at a time, with a plan first.
(4) Review every diff as if a new colleague wrote it. (5) Keep what you learn in `CLAUDE.md`, so the next session starts from it.

**Give the assistant this project's facts (off by default).** `devtools/mcp/code-facts/` is a small local server that answers from the same
code Code Facts uses: where an `APP` field is set, what a `§TAG` means, how a file is loaded, what a change costs, the last provable
logged value, the pre-ship check, and `context_for_file`: all of that for one file in a single answer (the same block as the editor command
*Context for this file*). It is read-only, calls no model and opens no network connection.

- On, from the bim-ootb folder: `claude mcp add code-facts --scope local -- node devtools/mcp/code-facts/server.js` (you, this project only).
- Off: `claude mcp remove code-facts --scope local`. Inside a session, `/mcp` shows it and switches it for that session.
- When no assistant starts it, no process runs. Code Facts works the same with it on or off.

**Seeing what a session uses** (Claude Code documentation, read 2026-11-14). In the VS Code panel: the prompt box shows how full the
context window is, and `/usage` opens an *Account & usage* dialog (plan users see usage bars; API-key users see the session's cost and
tokens). In the terminal: `/usage` (also typed `/cost`) shows session cost and plan limits, and `/context` shows what fills the context
window, item by item. A terminal status line can show cost and context percentage all the time (`statusLine` in the settings). Not
documented: a status line inside the VS Code panel.
---

### 4.3 The provenance hover: the code behind what you see on the page

Code Facts (§4.1) works inside the editor. The provenance hover works the other way round: you point at something on the page and it
tells you which code made it, then opens that line in VS Code. There are two: one for a body in the **Modeller**, one for a field in the **ERP**.
Both live in bim-ootb `devtools/hover/` (part of BIM DevTools).

**It is a developer tool.** You load it into one browser tab with a bookmark. No shipped page loads it, so users never see it. Reload the
tab and it is gone. Nothing is guessed: when the data does not name a line, the tooltip says so and opens nothing.

#### In the Modeller: a body's six layers

1. In bim-ootb, run `node devtools/hover/gen_trace_index.js`. It prints `§DXF_HOVER_INDEX keys=28 defaults=99` (counted 2026-11-15) and writes
   `devtools/hover/trace_index.json`. That file holds your machine's folder path, so it is git-ignored. Run it again after you edit a builder or
   `modeller/element_defaults.json`.
2. Serve the repo (VS Code task **Serve repo**, `http://localhost:8000`) and open `/modeller/modeller.html`.
3. Make a bookmark whose address is:
   `javascript:(function(){var s=document.createElement('script');s.src='/devtools/hover/dxf_hover.js?'+Date.now();document.head.appendChild(s)})()`
   Click it **before** you Convert. The console prints `§DXF_HOVER installed index_keys=28 defaults=99`.
4. Open the DXF sheets and press **Convert**.
5. Hover a body. The tooltip shows a title line (class, feature id, DXF handle, layer, sheet, provenance), then six numbered layers in the order
   they happened. Every layer is always listed; an empty one says `none`.
6. Press a number **1-6** to open that layer's first line in VS Code (**Alt+1-6** while you are typing in a field). **V** opens the builder line.

| Key | Layer | What it tells you |
|---|---|---|
| 1 | BUILDER | the line of code that built the body |
| 2 | PASS-THROUGH | any later code that touched it |
| 3 | SIZES | each size, its number, and where it came from (`label`, `drawn`, `schedule`, `inherited`, `default`, …). A default that records which one links its row in `modeller/element_defaults.json`, the setting a user can change |
| 4 | CUTS | the openings cut into it and the fill each one holds; for a door, the opening it fills |
| 5 | EDITS | moves, resizes and grid moves after Convert (an undone edit is not listed) |
| 6 | EVIDENCE | the DXF handle, layer, sheet and provenance, and each drawn note or schedule row the converter attached |

**A column whose top is a default.** Layer 3 says the top, 3.0988 m, is the default `column.top_under_beam`; key 3 opens
`modeller/element_defaults.json` at that row.

![The provenance hover on a column: six layers; in SIZES the top is a default, column.top_under_beam, element_defaults.json:5](figs/hover/01_column_sizes_default.png)

**A wall with two door openings.** Layer 4 lists the two door-gap cuts and the door each one holds. Layer 1 names the line that joined the
wall's two drawn pieces into one.

![The provenance hover on the north wall: layer 4 lists two GEOM_CUT door gaps, each holding its door](figs/hover/02_wall_cuts.png)

**When it does not know, it says so.** This truss bar's width is a default, but the body does not record which default. The tooltip says
*which default is not recorded on the body* and key 3 opens nothing. On the sample shed, 110 of 122 default sizes are like this (counted
2026-11-15); the DXF2BIM lane has the proposal to record them (bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` §D113).

![The provenance hover on a truss bar: its width is a default, "which default is not recorded on the body"](figs/hover/03_bar_default_not_recorded.png)

#### In the ERP: every layer of code behind a field

1. Run `node devtools/hover/gen_erp_index.js` (writes the git-ignored `devtools/hover/erp_index.json`).
2. Serve the repo, open `/erp/idempiere.html`, log in and open a window.
3. Bookmark: `javascript:(function(){var s=document.createElement('script');s.src='/devtools/hover/erp_hover.js?'+Date.now();document.head.appendChild(s)})()`
4. Hover a field. You get its layers in the order they fire: the field's dictionary row, then on change its callouts, then the picker's
   validation rule, then on save the model hooks, doc action and validators, then the button's process. Each layer shows its owner, the
   line that registered it, and the iDempiere Java file it was ported from. A layer with nothing registered says `UNPORTED`.
5. Keys **1-9** open that layer's line in VS Code (**Alt+1-9** in a text field).

#### If something looks wrong

| You see | It means | Do this |
|---|---|---|
| *convert again (the trace is on now)* | the body was converted before you clicked the bookmark | Convert again |
| *no trace key* | the code that built this body has no trace stamp | run `modeller/tests/witness_dxf_trace.js`; it lists such bodies |
| *line not in the index* | the index is older than your edit | run the index command (step 1) again |
| a number key does nothing | that layer names no line (data, or not recorded) | read the layer's text: it says why |
| VS Code does not open | your system has no handler for `vscode://` links | on Linux, check `xdg-mime query default x-scheme-handler/vscode` |

**What proves it** (bim-ootb, node unless marked): `devtools/hover/tests/witness_bim_layers.js` checks every body of the sample shed against a
separate converter run (W-BIM-LAYERS); `devtools/hover/tests/witness_dxf_hover.js` moves a real mouse over the real Modeller page, headless,
and checks the tooltip against the same answer and that it stays inside the window (W-DXF-HOVER); `devtools/hover/tests/witness_erp_hover.js`
covers every field of every active ERP window (W-ERP-HOVER). Spec: bim-compiler `prompts/CODE_ARCHITECTURE_DESIGN.md` §F.21–§F.23.

## 5. Changing things

### 5.1 Any edit to a file the browser loads

```
edit  →  node scripts/bump.js <file>           (dry run: shows what it will change)
      →  node scripts/bump.js <file> --write   (page ?v= +1, loader list ?v= +1 for lazy parts, CACHE_VERSION +1)
      →  node tests/audit_sw_precache.js        (precache list and pages agree)
      →  npx eslint viewer modeller             (no undefined globals)
      →  run the witness for what you changed, READ ITS LOG
```

There are three service workers, each with its own `CACHE_VERSION`: `viewer/sw.js`, `erp/sw.js`, `modeller/sw.js`. Put the
reason for a bump in the commit message, not in the `sw.js` line. The 4D schedule also has its own cache key,
`_GANTT_CACHE_VERSION` in `viewer/tm_dash.js`. If you change how a schedule is built, bump it by hand (`bump.js` does not).

**All three apps are written from their own `modules.json`: `modeller/` (since 2026-11-18), `erp/` and `viewer/` (since 2026-11-20).** `bump.js` raises the
module's version number in `modules.json` and the app's `CACHE_VERSION`, then writes the pages, the lazy lists and `sw.js` from it, including the `?v=` inside a page's
own scripts. In ERP and the Viewer a module can carry a different number on different pages; each goes up by one from its own number, and the two service-worker
register lines are never raised. Do not edit a script tag, a `?v=` (the lazy lists in `viewer/main.js` included) or a `PRECACHE_ASSETS` entry by hand in any of the three apps: CI (W-MANIFEST-ROUNDTRIP) fails with the
file, the line and the command to run. Comments between the tags stay yours.

**Pages outside the three apps (since 2026-11-22, B3-OUT):** the landing page `index.html` and its loader `import_own.js` are written from `viewer/modules.json`, and
`capex/index.html` from `erp/modules.json`, the same way. A bump of a file they load raises them too; a version number in a file no service worker serves (these three) does not
raise any `CACHE_VERSION`. `archive/gallery.html` is frozen: counted, never written, never bumped. `bump.js` no longer edits a page that no list names: CI (W-MANIFEST-ROUNDTRIP, C22)
fails on any file with a `?v=` that is in no list and not frozen, and names the command that adopts it: `node scripts/gen_manifest.js --adopt <app> <file>`.

### 5.2 Adding a new browser file

**On a page outside the three apps:** `index.html` and `capex/index.html` are in a list now (§5.1), so a new tag there goes in that list's `order` exactly as below
(`viewer` for `index.html`, `erp` for `capex/index.html`). A NEW page outside the apps that loads a file with `?v=` is first adopted into one list:
`node scripts/gen_manifest.js --adopt <app> <page>` (one time; it adds the marker lines and the page's sites, nothing else). Add any new shared global name to `eslint.globals.json`.

**In the three apps (Viewer, ERP, Modeller),** add the module's line to that app's `modules.json` instead (its `v`, `load`, `precache`; its tag in `order` at the place it
must load; its entry in `precacheOrder` unless it is lazy on purpose), then run `node scripts/gen_manifest.js --write <app>` (`viewer`, `erp` or `modeller`): it writes the
tag and the precache entry next to their neighbours. A page's tags sit between `§MANIFEST:BEGIN` / `§MANIFEST:END` marker lines; a tag outside them is refused. If the new file reads another module while it loads, `--check` lists that as an unreviewed
order edge (`§DEPS_UNREVIEWED`) until a person puts it in `deps`, `uses` or `notDeps`.

### 5.3 Changing data

- **Rules, patterns, schema** (small, regenerable DBs such as `duplex_rules.db`, `terminal_rules.db`): a `migration/*.sql` script
  (append-only; never edit an old migration), or regenerate with the mining scripts.
- **A fix to a shipped building DB:** a SQL patch plus the self-heal loader that applies it when the page loads
  (Viewer: `A._applyPendingPatch` in `viewer/scene.js` + `buildings/patches/*.sql`; Modeller: `str_walker_outliner.js`).
  **The patch and the loader are one task**: a patch nobody applies is not done.
- **A full rebuilt building DB** goes to object storage, never git.
- Never commit a `.db` file. Git LFS is switched off.

### 5.4 ERP windows: one generic engine, never per-window code

The ERP user interface is one engine driven by the iDempiere Application Dictionary (`ad_seed.db`), the way iDempiere itself works. A
fault on one window is fixed in the generic layer (with the iDempiere class it ports cited), never with `if (table === 'c_order')`.
"It works" means *X of N dictionary windows pass*, not one happy path. Where behaviour is in doubt, the real iDempiere is the
oracle. The SQLite kernel must behave like legacy iDempiere, look and feel included.

### 5.5 Big files

The largest viewer files were split in 2026-10 by a generator that keeps every statement byte-identical
(`scripts/split_closure.js`, checked by `scripts/split_verify.js`). The film/camera files (`effects`, `cinema_path_editor`,
`cinema_maxq` families) are a protected lane: only small helper extraction there. Still long and worth care: 29 functions of
400+ lines, for example `_cinemaPathPlan` (2,823 lines), `injectGantt`, `renderAtTime`, `computeSchedule`.

---

### 5.6 The clock rule: time, dates and ids in ERP code

**The rule (owner decisions A-2, A-3, A-4, 2026-11-14).** Code that calculates (ERP processes, callouts, posting, the op-log fold, the schedule maths) never asks the machine for the time. The **shell** (the page, the service worker, the web-service kernel) reads the clock once, and everything else asks the transaction's env. Replaying a recorded operation must give the same rows on any day, in any time zone; a hidden `new Date()` breaks that quietly.

| You need | Ask | Never |
|---|---|---|
| the session's day (what legacy calls `#Date`) | `trx.env.date` (the login context's `#Date` is the source) | `new Date().toISOString().slice(0, 10)` |
| a time stamp for a new row | `A.Env.nowStamp(trx.env)` (the local wall-clock string) | `new Date()` |
| milliseconds | `A.Env.nowMs(trx.env)` | `Date.now()` |
| the local day of an instant you were given | `A.Env.stamp(ms).day` (also `.now`, `.millis`) | cutting the day out of `toISOString()` |
| a transaction env, in the shell | `A.Env.modelEnv(loginContext, { nowMs, uuid, perfMs })` | building the object by hand |

`A` is `X.A` (`AdCallout`) inside a process. If the env has no clock the call **throws and logs `§ENV_NO_DATE`**: that is the design, the core never falls back to a wall clock.

**The day is the LOCAL day, never the UTC day.** Legacy dates by the server's local day (the reference: iDempiere's web-service login sets `#Date` from the JVM's local time). `toISOString()` is UTC, so between local midnight and the zone offset the date comes out as *yesterday*. That was bim-ootb #2996: the headless kernel dated an invoice made at 00:30 in a +08 zone the 12th instead of the 13th. Test any date change at **00:30 in a +08 zone**; a test that only runs in UTC proves nothing here.

**Prove it:** `node erp/tests/witness_core_clock_reads.js` scans the files already migrated for a clock call and must print `clockReads=0` on every line, ending `§WITNESS_CORE_CLOCK_READS … fail=0`; `node erp/tests/witness_env_views.js` checks the day in UTC and Asia/Kuala_Lumpur (`§ENV_VIEWS … same=Y`); `node erp/tests/witness_replay_clock.js` replays a journal three days later (`§REPLAY_CLOCK … match=Y`). Both new witnesses carry a red control: a planted clock read must make them fail.
**Where it stands (2026-11-17): done.** Every core file asks the installed edge; `node erp/tests/witness_core_pure.js` parses the whole core list (bim-ootb `scripts/lib/core_pure.js`, 125 files) and prints `§CORE_PURE … forbidden=0 … verdict=PASS`. CI runs it on every pull request, and Code Facts underlines the same call in the editor as you save (§4.1), so you hear about it before CI does.

## 6. Proving it

- **Witnesses** live in `viewer/tests/`, `erp/tests/`, `modeller/tests/`, `tests/`, `witness/` and `scripts/tests/`. Run one with
  `node <file>` (or the editor task) and **read the log**. `npm test` runs the headless suite (`tests/run_witness_suite.js`;
  browser witnesses only with `--browser`, report-only because they are timing-sensitive).
- **What a witness is.** A plain Node script: `node erp/tests/witness_env_views.js`. No test runner, no build, no browser unless the witness drives one (those say so in their header). It works from any directory, prints `§` lines, and exits **0** on pass, **1** on fail, **2** on INCONCLUSIVE (nothing was judged). Two honest limits: the files carry a `#!/usr/bin/env node` line but are **not marked executable** (run them with `node`, not `./file`), and they are **not independent of the repo**: they `require` files in the checkout, and every witness built on `witness_kit/contract.js` needs the `ajv` package (`npm install` once). A film or a demo that shows the command shows only the lines that matter; a real run prints more and can take minutes.
- **New witness:** start from `witness_kit/contract.js` and the example
  `viewer/tests/witness_tm_schedule_output_of_truth.js`. Name the issue. Make it able to print FAIL and INCONCLUSIVE. Add a
  red control (a case that must fail) so you know it can.
- **Visual behaviour** (camera paths, positions, motion) is proven from numbers read off the real objects and `§` lines, never from
  how a screenshot looks.
- **A saved log says which code made it.** The witness task and the suite runner (`npm test`) start every log with one line:
  `§LOG_STAMP commit=<hash> dirty=<n> branch=… at=<time> cmd=…`, plus `dirty_files=…` when 1 to 10 tracked files differ from the commit
  (`scripts/log_stamp.js`). **Before you trust a value in a saved log, read that line:** if the commit is old, or the file that prints
  the value is in `dirty_files`, re-run the witness instead. A log without the line (anything saved before 2026-11-13, or by another
  tool) cannot be tied to code. Measured that day: saved logs held about a quarter of the `§TAG`s the code prints, and almost none
  said which code produced them. When you save a log yourself, put the stamp first:
  `node scripts/log_stamp.js <what you ran> > logs/x.log; node <file> >> logs/x.log 2>&1`.

**First reading, about two evenings.** The first three are the reading path in bim-ootb `prompts/SESSION_OPENER_READ_AND_REVIEW.md` §B;
the last two are added here: `witness_kit/contract.js` → the op-log hash chain in `erp/kernel_ops.js` (`stableStringify` → `commitOp`) →
`erp/ad_parser.js` → `viewer/db_resolve.js` (a model spec header) → `viewer/main.js` (boot + lazy lists).
`internal/CodeScrapBook.md` is the long-form version of this section.

### 6.1 The logged-value rule (usable in any project)

A tool that shows "the value this line last printed" beside the code is useful only if the value still belongs to the code on screen.
A debugger knows that because the process is live. A saved log does not, so the rule has to supply it:

> **Show a logged value only when the code that printed it is unchanged since the commit the log names, and was not edited when the log
> was made. Otherwise show a named reason. Never a guess.**

What a project must emit to use it, and nothing more:

| Piece | Form here | Why |
|---|---|---|
| A stamp near the top of each saved log | `§LOG_STAMP commit=<hash> dirty=<n> … [dirty_files=a,b]` (`scripts/log_stamp.js`) | names the code, and says which tracked files differed from that commit |
| A tag on the line that prints | `console.log('§TAG …')` | ties a log line to one line of code |
| The log kept on disk | `logs/*.log`, or a folder named in a setting | the evidence itself |

The three proofs, in order, and what the reader is told when one fails:

| Proof | If it fails |
|---|---|
| A stamped log carries the tag | `no stamped log found`, or `tag not in any stamped log` |
| The printing file was not edited when the log was made (the stamp must list the edited files to prove it) | `file was dirty when the log was made`, or `stamp does not name its dirty files` |
| The printing file is unchanged since the stamp's commit (`git diff --quiet <commit> -- <file>`) | `file changed since the log` |

Two things the rule refuses on purpose. A line that names only a commit is not a stamp: without the edited-files count the second
proof cannot be made (this is why a bake's own commit line is not accepted, and the bake now writes the stamp). And a value is never
shown "probably current": the reason is shown instead.

**What is and is not new.** Showing run-time values in the editor is established (live-process tools do it), and so are frame-capture and
log viewers. Those tools get freshness for free from a running process, or do not claim it. The piece here is the provenance check on
an offline log. It is a few lines of code (`devtools/vscode/code-facts/lib/lens_index.js`: `parseStamp`, `whyNot`, `explain`), has
no dependency, and its witness (`witness_codefacts_lens.js`) holds a red control for every refusal above.

---

## 7. The compiler side (this repo)

What the April guide described is still here, and it is still the compiler. The details are in `docs/archive/DEVELOPER_GUIDE.md`:

| Part | Where | Run |
|---|---|---|
| Java modules: `DAGCompiler`, `BIM_COBOL` (verbs), `ORMSandbox`, `TopologyMaker`, `orm-core` | repo root, `pom.xml` | `mvn compile -q`, `./scripts/run_tests.sh` |
| Proof gates G1–G6 (compiler reconstruction truth) | `RosettaStoneGateTest.java` | `./scripts/run_RosettaStones.sh classify_sh.yaml`. **Local discipline: no CI runs these.** |
| Headless smoke subset | `.github/workflows/ci.yml` | `scripts/system_is_real.sh` |
| Pre-commit hook | `.git/hooks/pre-commit` | gates: block library · compile check · tamper seal · data integrity |
| Migrations | `migration/` (186 files) | append-only |
| Schema reference | `docs/internal/DATA_MODEL.md`, `docs/internal/SQLite3D_Schema.md` | |
| Walker rules (which rules DB a building class walks) | `docs/internal/WalkerDoctrine.md` | locked, read before walker work |

The core idea still holds: **a building is a Bill of Materials.** One parent, N children, each with a quantity, recursively
(building → floor → room → furniture). WHAT (orders, categories, products), HOW (BOMs, attribute sets, validation) and WHERE
(the output DB) are kept apart. Positions are computed by verbs, never typed in.

---

## 8. Traps that have cost real time

| Trap | What happens | Do instead |
|---|---|---|
| A date taken from `toISOString().slice(0, 10)` or `new Date()` in ERP code | The UTC day, or today's wall clock: wrong near midnight, and a replay on another day gives other rows (#2996) | `trx.env.date`, `A.Env.nowStamp(trx.env)` (§5.6); test at 00:30 in a +08 zone |
| Edited a precached file, reloaded, "nothing changed" | Service worker served the old file | `bump.js` (§5.1), or DevTools ▸ Application ▸ "Update on reload" while debugging |
| Opened the copy instead of the source | 329 stale copies in this repo | Edit in bim-ootb. Check the path before you save |
| Trusted a `file:line` from an old prompt | Lines moved in the 2026-10 splits | Search for the function name |
| A grep count that looked like a finding | Comments and words inside words match too (`TODO` inside *METODOLOGI*) | Check that the hits are code before acting |
| A green witness that judged nothing | Empty population reads as 0 = PASS | Make it print INCONCLUSIVE when nothing was judged |
| Two copies of one responsibility | Duplicates drift (`ERPKernel` is published by two files; `modeller/routewalker.js` vs `viewer/routewalker.js`) | Find the owner first. The 4D lane keeps an ownership table in `prompts/4D_MODEL_INTEGRITY.md` §I |
| History written into code comments | Slow to read (about 5% of comment lines are dated change stories; one `sw.js` comment had grown to 234,833 characters on one line) | History goes in the commit message and `prompts/`; comments say what the code does now |
| Witness paths assume one machine | Many witnesses hard-code the author's home folder | Expect to adjust paths on a new machine; a shared resolver is an open item |
| A saved log with no `§LOG_STAMP` line | Its values look current but may come from code that has since changed. Measured 2026-11-13: almost no saved log said which code made it | Read line 1 of the log (§6). No stamp, an old commit, or the printing file listed as dirty: re-run the witness |
| A copy of the tree inside the tree (an agent worktree under `.claude/worktrees/`, a nested clone) | A tool that walks folders reads the copy as source. `gen_app_surface.js` once put 1,082 rows pointing into such a copy, so F12 opened the stale file | A dev tool skips any sub-folder that holds a `.git` entry, and its witness also runs on a checkout that looks like a working one, not only a clean one |
| A PR auto-merged by CI's bot (bim-ootb) | The *Deploy to GitHub Pages* workflow does not start for a merge made with the workflow's own token, so the live site stays on the last deploy (seen 2026-11-13; 4 bot merges on 2026-11-16 started no deploy) | Press **Fetch back** (§4.1); if it says the site is behind, press **Deploy main now** and Fetch back again (*Deploying from VS Code*, §4.1). Or enable auto-merge yourself right after opening the PR (`gh pr merge <n> --auto --squash`): a merge you start does deploy |
| Two numbers in a squash title, `… (#issue) (#pr)` | Until 2026-11-13 the deploy wrote both into `erp/version.json` and the file was not valid JSON | Fixed in the workflow (it takes the last number). Put `Fixes #N` in the PR body, not in the title |

---

## 9. What not to add, and what breaks maintainability or speed

The app is deliberately small: pure SQLite WASM, local-first, air-gapped capable. Editor help is fine **only** where no page loads it.

| Fine (editor/dev only) | Not fine (reaches the app or adds a dependency) |
|---|---|
| `jsconfig.json`, `types/*.d.ts`, `.vscode/`, `.editorconfig` | `.ts` source files, a compile or bundle step |
| `// @ts-check` and JSDoc comments (the browser ignores them) | TypeScript, a framework, or any new library in `package.json` `dependencies` |
| Scripts under `scripts/` (bump, generators, witnesses) | A forked or extra runtime library |
| | Mass reformatting (one huge diff that collides with every open branch) |

The editor tools that need a TypeScript parser use the copy that ships inside VS Code (`scripts/lib/find_ts.js`), so nothing extra
is installed. ES modules are native to browsers, but switching to them changes load order at run time, so only file by file,
behind a witness, and only when asked.


### 9.1 Changes that break maintainability

| Change | Why it hurts | Do instead |
|---|---|---|
| A second implementation of something that already has an owner (a second schedule formula, a second master-detail engine, a "quick" copy of a helper) | The two drift apart and disagree; nobody knows which one runs | Find the owner and call it. The 4D ownership table (`prompts/4D_MODEL_INTEGRITY.md` §I) is the model |
| Per-window or per-table special cases in the ERP (`if (table === 'c_order')`) | Every new window needs new code; the generic engine rots | Fix the generic layer, cite the iDempiere class it ports, count *X of N* windows |
| A new shared global without adding it to `eslint.globals.json` | The `no-undef` gate goes red, or a typo becomes a silent `undefined` | Add the name in the same change; regenerate `types/globals.gen.d.ts` |
| Removing a file's UMD tail, or moving a `<script>` tag | The Node witnesses can no longer load the file / the page breaks on an undefined global | Keep the tail; respect load order (§0 #2) |
| Editing a generated file (`erp/genesis_dict.js`, `internal/APP_SURFACE.md`, `types/globals.gen.d.ts`, …) or a copy in this repo | Overwritten on the next regeneration / edits the wrong file | Edit the generator named on line 1 / edit bim-ootb |
| Writing change history into code comments | Slow to read; one comment grew to 234,833 characters on one line | Commit message and `prompts/`; comments say what the code does now |
| Growing an already long function (29 functions are 400+ lines) | Harder to read and to witness | Add a small named function beside it; split only with the byte-identical method (§5.5) |
| Hard-coded personal paths, invented values, defaults dressed up as data | Fails on another machine / breaks *extract, don't invent* | Paths from config; values from a named source |
| A witness that cannot fail (no red control, PASS on an empty set) | Green forever, proves nothing | INCONCLUSIVE when nothing was judged; one case that must fail |
| Mass reformat, rename sweep (e.g. `A` → `APP` across the tree), big multi-purpose PRs | One giant diff that collides with every open branch | One module at a time, behind its witness |

### 9.2 Changes that break speed or memory

Measured, not guessed (`docs/BrowserScaleBenchmark.md`): in one tab the limit is **memory, not drawing speed**. The heap grows about
**0.17 GB per million vertices** (fit over three large models). A render pass costs about 6 ms on a laptop GPU while the largest
model peaks at 3.4–3.8 GB. Phones have far less room per tab.

| Change | Why it hurts | Do instead |
|---|---|---|
| Adding a script to the page's boot list for a feature most users do not open | Every user pays for it on every start | Lazy-load it from the loader list on first use (the viewer's Find/navigate parts are the pattern) |
| Precaching a lazy module "to fix a warning" | Bigger install, slower first load, for a part that is lazy on purpose | Leave it out of `PRECACHE_ASSETS` unless it must work offline. `bump.js` only ever prints a NOTE for it |
| Anything that delays the first paint of the ERP shell | The shell must appear instantly from cache (`erp/sw.js` header: stale-while-revalidate for pages) | Do the work after first paint |
| Adding geometry (welds, clones, outlines, pre-warm meshes) without counting it | Memory is the limit, and it is measured per vertex, not per element | State the vertices / heap added in a `§` line at the end of the pass |
| Keeping a second copy of a big buffer in JavaScript (vertices, normals, a whole DB) | Doubles the memory for that data | Typed-array views and on-demand reads |
| Rewriting the whole database to save a small change | Cost grows with model size | Save deltas |
| Assuming "hidden" or "far away" frees memory | Level-of-detail and occlusion save drawing work, not memory: nothing is disposed | Design new geometry paths so off-screen parts can be released; streaming is the growth path, not more RAM |
| A heavy pass with no cost line | The next person cannot tell what it costs | End it with a `§` line: heap (`performance.memory`) and vertices |

---

## 10. Contributing: issue first, then a pull request

This is a FOSS project under the MIT licence, and it is *author-decided*: anyone may copy, change and redistribute it, and the
author decides what enters the main line (bim-ootb `GOVERNANCE.md`, after SQLite's "open-source but not open-contribution").
A change is considered only if every test still passes and **no test or check is removed or weakened**. A change that breaks a
principle (local first, the legacy-iDempiere twin including look and feel, one generic dictionary engine, a test before a claim)
is declined, whoever asks.

**The flow:**

1. **Open an issue on the tracker first**, in the repo you would change
   ([bim-ootb issues](https://github.com/red1oon/bim-ootb/issues) for the app, [BIMCompiler issues](https://github.com/red1oon/BIMCompiler/issues)
   for the compiler and docs). Say what is wrong or missing, how to reproduce it, and the **source** for any value (IFC file,
   legacy record, published rate). Paste the `§` log line that shows the problem. One issue, one problem.
2. **Wait for the author's go** on anything beyond a small fix. The issue is where scope is agreed, before code is written.
3. **Fork, and branch from the latest `main`/`master`:** `fix/<thing>`, `feat/<thing>`, `docs/<thing>`.
4. **Spec first.** For a new rule or behaviour, write the spec block (§0) and the witness claim before the code.
5. **One small change per pull request**, then run the witness for that area and read its log. Before you push, also run the
   gates in §5.1 (`bump.js` if you changed a browser file, `audit_sw_precache.js`, `eslint`).
6. **Open the pull request** with `Fixes #<issue>` in the body. Fill in the template: what changed, the source, the `§` log
   lines that prove it, and lines added/removed. Commit titles use the conventional types the release notes are built from:
   `feat:`, `fix:`, `perf:`, `docs:`, `refactor:`, `revert:`.
7. **CI must be green**, and the author reviews and merges. Do not merge your own change into the main line.

**Easy first contributions** need no engine knowledge: a rate template for your country, a test building, a product catalogue, a
locale. The list is in `CONTRIBUTING.md` (BIMCompiler). **Avoid:** invented data, pull requests that do several things,
touching `deploy/live/`, adding a dependency (§9). No CLA is needed.

---

## 11. Recommended refactoring (when you are in a file anyway)

None of these is a sweep. Each is one file or one module at a time, behind its witness, and none adds a dependency (§9). Ranked by
how much it helps a reader for how little risk. The full work order, written for a later session to carry out, is
`prompts/REFACTOR_FOR_READERS.md` (this repo).

| # | Refactor | What it buys | Risk | How to prove it |
|---|---|---|---|---|
| 1 | **`// @ts-check` + JSDoc** on the files you edit most (today 0 files have `@ts-check`, 54 have any JSDoc) | Autocomplete, hover docs and red squiggles in that file. Comments only: the browser sees nothing | None at run time | The file's witness unchanged; no unintended new red in VS Code |
| 2 | **Move the export to the top level** for the UMD globals F12 cannot follow (17 of 44 sampled, e.g. `Dxf2Bim`, `ScheduleEngine`): `var X = (function(){ … return api; })(); if (typeof module …) module.exports = X;` | F12 and find-references start working for that global | Low: same object, same name | `scripts/tests/witness_global_types.js` resolves one more; the file's own witness unchanged |
| 3 | **One owner per responsibility**: retire the duplicates the type generator lists (`ERPKernel` in two files; `Bonsai` ×3 and `ERP` ×4 publishers; `modeller/routewalker.js` vs `viewer/routewalker.js`) | One place to read and fix | Medium: callers may rely on a copy's differences | Diff the copies first; witness every caller; the deleted lines are part of the change |
| 4 | **Clear the phantom fields**: 107 `APP.x` fields read in production but never written (recounted 2026-11-14 after the index fix, bim-ootb #2974) (`internal/APP_SURFACE.md`) | Dead guards gone; fewer "where is this set?" hunts | Low per field | The phantom count goes down; the file's witness unchanged |
| 5 | **Split the longest functions** with the byte-identical method: `injectGantt` (992 lines), `renderAtTime` (961), `_getMaterial` (762), `computeSchedule` (654) | Readable units, each with a name | Medium: shared closure variables | `scripts/split_closure.js` + `split_verify.js` (every statement identical, in order); 4D: the cached run identical |
| 6 | **Rename `A` to `APP` in one module** (`viewer/scene.js` first, 606 sites) | grep finds definitions again | Low per module, high as a sweep | `APP_SURFACE.md` field and phantom counts identical before and after |
| 7 | **One path resolver for witnesses** instead of hard-coded home folders | Witnesses run on a second machine | Medium: touches the proof chain | Every converted witness gives the same verdict before and after |
| 8 | **A rule for where new witnesses go** (today six folders) | Fewer places to look | None for the rule; moving files is a change (CI and scripts name some files) | Every reference updated in the same change |

**Not recommended:** a framework, a bundler, `.ts` files, converting the tree to ES modules in one go, or a repo-wide reformat.
Each one either reaches the app or produces a diff nobody can review.

---

## 12. Where to read next

| If you will work on | Read |
|---|---|
| The whole system, as an outside reviewer | [Architecture Overview](ArchitectureOverview.md) |
| The ERP fold engine | [Fold Engine Black Book](FoldEngineBlackBook.html) |
| The viewer's module layout | [Viewer Component Model](ViewerComponentModel.html) |
| How the in-browser database works | [How the Database Works](SQLiteWasmArchitectureActual.html) |
| Code navigation, measured | `internal/CodeScrapBook.md`, `internal/APP_SURFACE.md` (bim-ootb) |
| Editor setup and why each piece exists | `prompts/EDITOR_MAINTAINABILITY_STUDY.md` (this repo) |

**Sources.** Every path above is in [BIMCompiler](https://github.com/red1oon/BIMCompiler) or [bim-ootb](https://github.com/red1oon/bim-ootb).
Counts were measured on 2026-11-13 (bim-ootb `main` @ `cc9988c2`, BIMCompiler `master` @ `90684efbe`).
