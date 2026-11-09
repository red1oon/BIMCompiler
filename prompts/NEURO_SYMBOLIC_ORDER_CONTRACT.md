# ⚠ DO NOT REMOVE
Scope: SPEC + WITNESSES + the proposer test + the stop on outside calls. **No paid model calls** (owner, 2026-11-08). No gate beyond §15.1 without the owner's go. Read the log after every run of anything derived from it. Honour until this file is marked DONE.

# Neuro-symbolic ORDER contract — an outside proposer submits, the compiler judges

Origin: a pasted Gemini chat (JEPA "architect" + BIMCompiler "inspector"). Review verdict: the pattern is sound, the details were invented. This file keeps only the part that survives. **Consolidated 2026-11-08;** the full earlier text, with every superseded spec and run note, is in `prompts/archive/NEURO_SYMBOLIC_ORDER_CONTRACT_full_2026-11-06_to_2026-11-08.md`.

## 0. THE FRAMEWORK, one page: Actor | Channel | One door | Engine (owner, 2026-11-09; remapped the same day)
**Owner's words:** *"we are reframing it into the larger concept i introduced some hours ago where there is a single page Actor | Channel | ***"* · *"That single page was put into the last film"* (the Odoo film's end card, `scripts/film_odoo_migration/cards/end_card_one_door.png`, committed on branch `fable/meshdb-livewire` @ `aa9100474`, not yet on master) · *"actors can be email, mobile, devices, AI/Human"* · *"consolidate which prompts/# are handling the same thing so they all fall into the same lane"* · **the remap:** *"I kinda feel the 'channel' is the 'verb vocab' and the one door is the CLI scripting engine"* · *"yes, delivery belongs with the actor, rewrite §0 .. this tidies up the map"* · *"Review back as this was a concept idea from early days, so we can consolidate all literature associated with this"*.
**This file is the home of the framework and of the lane.** Everything below (the stop, the connector, the verbs, the films, the actor layer) is one part of it.

| Column | What it is | Built and witnessed (2026-11-09) | To build or harden | Owner file |
|---|---|---|---|---|
| **ACTOR** (who acts, *and how its message travels*) | **AI, Human, Email, Mobile, Device**, and an outside system. **Delivery belongs to the actor:** each brings a small **adapter** (the AI's tool connection, a person's screen or terminal, a mailbox, a chat or push app, a device bus, a web-service client) that turns its message into a line in the vocabulary and carries the reply back. The adapter never decides, repairs or computes a business value. Identity travels with it: `ctx = {actor, pubKey, roleId, allowOrgs}` (ENGINE_CONTRACT §2); an Email, Mobile or Device actor proves who stands behind it (a signature; or a known address + per-action token), else its line stays a *claim* | AI (adapter: `bim_mcp.js`, MCP over stdio) and Human (adapter: a terminal, `edit_cli.js` / `viewer_verbs.js` / `film_path_vis.js`; and the apps' own screens), local and trusted | adapters for Email, Mobile, Device and an outside system (the legacy-compatible WS API); the proof of sender for each | §21.1, §21.3-21.4; `docs/internal/SocialPlatformLens.md` §5-6; `MOBILE_CHAT_LENS.md`; `ERP_WS_API.md`; delivery: `TEAMWORK_FRAMEWORK.md`, `TEAM_REPLICATION_PLUGIN_STUDY.md`, `docs/internal/GuaranteedChannels.md`, `docs/DistributedERP.md` §5.2b, §6 |
| **CHANNEL** (*the verb vocabulary*: what any actor may say) | **One list** (`verbs.json`): each verb's name, plain description, inputs with units, harm class (read / writes / posts / sends), and which actors may use it. Coverage is **X of N**, N read from the app's own tables. The AI's `tools/list`, the script keywords, the email command words and the guide's verb table are all generated from it | 4 verbs offered (`bim_lines`, `bim_try_shift`, `viewer_counts`, `viewer_clashes`); N generated: Viewer **1 of 64** actions, ERP **0 of 1,153** (§19.1, §21.7); the list itself still hand-kept in several places (see 0.2) | **D1: `verbs.json`, the keystone**; then the verbs (D2, D3, D5, D6) | this file §19, §21.2, §22.6, §23 |
| **ONE DOOR** (*the CLI scripting engine*) | **One interpreter for every actor.** It reads a line, matches it to a verb in the vocabulary (text that matches no verb is not an order: it goes back as a question), binds the actor or keeps a claim, calls the app's existing function, and replies with the engine's own answer and what was not checked. Deterministic: the same lines give the same result; each line's result records the steps that led to it (§19 design 5). **The door never uses an AI to parse.** Model already in the repo: BIM COBOL's `ScriptRunner` (one verb per line, `--` comments, 78 verb classes, `BIM_COBOL/src/main/java/com/bim/cobol/`) | **several partial doors today:** `edit_cli.js`, `bim_mcp.js`, `viewer_verbs.js`, `film_path_vis.js`, the Java `ScriptRunner`, the ERP's `dispatch` | **converge to one script engine** (D4 moves up to second, right after D1): today's tools become thin adapters in front of it, every existing flag and output kept byte for byte (§19 design 3); fix the two registry risks first (`VerbRegistry.register()` replaces a duplicate silently, L33; longest-keyword dispatch lets a new keyword steal old lines, L14-15) | this file §19 design 1-5, §22.6 D4 |
| **ENGINE** (decides) | the app's own deterministic checks; no AI inside. Pass: it stands. New problem: undone, reason returned | Modeller edit report + the stop + real-shape clash verdicts (§15.1, §20.2.10-11, W-EDIT-SHAPES 18/0); Viewer answers (Find/Ask, sum fixed, §20.2.9); ERP `dispatch` (ENGINE_CONTRACT §1) | checker verbs on a user's IFC + the claims registry (D5); ERP verbs through `dispatch`, legacy twin as oracle (D6, A5) | `docs/internal/ENGINE_CONTRACT.md`; `CLASH_GATE_OBB_NARROWPHASE.md`; `AGENT_CALLABLE_CHECKERS.md`; `SQLiteIDEMPIERE.md` |

**How the earlier pieces fit:** "any AI" is one ACTOR and `bim_mcp.js` is its delivery; a person at a terminal is another, `edit_cli.js` theirs; the verbs and their X-of-N counts are the CHANNEL; the scripting engine those tools converge into is the DOOR; the stop and the report are the ENGINE's answer. The films explain it: Part I one edit, Part II the vocabulary; a Part III would be the other actors.
**What changed in the remap (2026-11-09):** earlier today CHANNEL meant the transport (email, CLI, MCP) and the DOOR was three steps inside each channel adapter. Now transport is part of the ACTOR, the CHANNEL is the shared vocabulary, and the DOOR is one engine instead of one per adapter. §21.1 used the earlier terms; read it through this table. **The Odoo film's end card and `build/neuro_diagram/actor_layer_one_door.svg` still show the earlier columns ("How it arrives" = transports); redraw before Part II uses it.**

**Build path, in order:** (1) **the vocabulary** (D1, `verbs.json`), because every actor must speak the same list; (2) **the door** (D4, one scripting engine; today's tools become its adapters, outputs unchanged); (3) the most-duplicated checks as ENGINE verbs (§23.3 order: schedule comparison first); (4) the remaining Modeller and Viewer verbs (D2, D3); (5) ERP verbs through `dispatch` (D6), the WS API adapter mapping legacy operation names onto the same vocabulary; (6) the Email, Mobile and Device actor adapters with proof of sender (D7); (7) GPU verbs last (D8). Each step: a spec line, the owner's go, a witness that the answer equals the app's own path, and a falsifier.

### 0.1 The lane map: which literature belongs here (consolidated 2026-11-09 from a read-only sweep of both repos, their archives, the docs, papers, films and memory)
Every live prompt file below keeps its own detail and opens with a one-line pointer to this section; public docs are mapped, not edited. **New work on any of them starts here.**
| File | Column | Gist, and the overlap resolved here |
|---|---|---|
| this file | the framework; CHANNEL (vocabulary, X of N); DOOR (the scripting engine); the AI and terminal actors; the stop | — |
| `docs/DistributedERP.md` §5.2b, §6 | ACTOR delivery (email) + proof of sender | **the earliest dated statement in the repo** (2026-05-31, `19e64f4f3`): *"Each use emits a signed email ... to the customer's own inbox. The inbox is a durable, user-owned, append-only, tamper-evident log ... No server owns the data - the user's own channel does."* Email is an untrusted pipe; the signature, not the container, carries the proof |
| `docs/internal/WMSLens.md` §7 | ACTOR delivery (email as the bus) | *"the dumb async post office ... that is email, already installed worldwide"*, run through iDempiere's email API; an arriving mail moves a card. "post office" here = "post box" in TEAMWORK: **one term from now on, "post box"** |
| `docs/internal/LensFamily.md`, `docs/internal/POSLens.md` | ACTOR family (lenses over one signed op-log; POS, WMS, Credit, Workforce, Social, Guaranteed Channels); Device actors (till, van, robot) | a **lens is an actor's adapter plus its screen**: same op-log, same `dispatch`, no new verb |
| `docs/internal/SocialPlatformLens.md` | ACTOR (email, WhatsApp, Telegram) and the proof-of-sender rule (§5-6) | *"the ERP comes to you"*; a reply is a signed party-act. **The one place the binding rule lives**; §21.1 step 2 and ERP_WS_API's "delegated identity" refer to it |
| `prompts/MOBILE_CHAT_LENS.md` | ACTOR adapter: mobile chat over the op-log | op = message, DocAction = reply, "NO new verb" |
| `prompts/ERP_WS_API.md` | ACTOR adapter: an outside system on the legacy-compatible web-service API | its operations (`create_data`, `set_docaction`, …) map onto the ERP vocabulary (§21.7); the twin rule fixes the names; its "delegated identity" is the key the door binds |
| `prompts/TEAMWORK_FRAMEWORK.md` (+ archive `TEAMWORK_FRAMEWORK_history_s0-s44.md` §11.19), `prompts/TEAM_REPLICATION_PLUGIN_STUDY.md`, `docs/internal/GuaranteedChannels.md` | ACTOR delivery transport (GitHub pipe, Gmail post box, per-device keys, payment rails) | not re-specced here. A fan-out of one op over two transports, de-duplicated by op UUID (GuaranteedChannels, DistributedERP §6), is allowed: §21.5 A6 |
| `prompts/NO_AI_INSIDE_WITNESS.md` | positioning + privacy caveat for email and mobile actors | the post box sends (encrypted) data to the user's own GitHub/Google: an **owner decision still open** there (its ⛔ line); email actors inherit it |
| `docs/internal/ENGINE_CONTRACT.md` | ENGINE seam: `dispatch(intent, ctx)` and `verbs(ctx)` (2026-06-02) | the door calls only this on the ERP side |
| `prompts/CLASH_GATE_OBB_NARROWPHASE.md` | ENGINE: the real-shape clash judge | Modeller and Viewer share one `clash_narrow.js` (§20.2) |
| `prompts/AGENT_CALLABLE_CHECKERS.md` | ENGINE: checks on a user's IFC, the claims registry | its P3 "MCP adapter" is **not a second server**: its checks become verbs in the one vocabulary (D5). §23 (feedback verbs) and its family A are one catalogue |
| `prompts/SQLiteIDEMPIERE.md` | ENGINE oracle for ERP verbs (legacy twin) | unchanged; cited by A5 |
| `docs/ProposerGuide.md`, `docs/AIProposerDefensiveDisclosure.md` | the public face: how an AI actor connects; the ENGINE's method, dated | the guide's verb table is a hand-kept vocabulary copy until D1 generates it |
**Pointers only (positioning, not specs):** `docs/TwoAppsOneKernel.md` (one kernel for both apps), `docs/MigrateComparisonPaper.md`, `prompts/BIM_POSITIONING_RESEARCH.md` ("No AI inside" wording), the "Server is Dead" films (`prompts/film_narration_server_dead_*`, `scripts/film_server_dead_*`), `prompts/POS_PLUGIN_LOCAL_FIRST.md` L187-191 (the post box's origin: an ActiveMQ middleman, now a shell relay), Part I's `scripts/film_neuro/`.
**Not in this lane** (the words in another sense): `ERP_MULTIUSER_CONCURRENCY_POC.md`, `ERP_DEPTH_FILM.md`, `ERP_FRIENDLY_OPS_LENS.md`, `BACKEND_SUBSTRATE_LANE.md`, `KERNEL_HARDENING_BATCH1_SPEC.md`; "door" as a building door (DXF2BIM, Find-Rooms files).
**Earliest statements found:** email as a signed durable log, `DistributedERP.md` 2026-05-31; `dispatch`/`verbs(ctx)` 2026-06-02; "the ERP comes to you" and "post office" in the lens docs (squashed into the repo 2026-07-03, true date unknown); "No AI inside" 2026-10-02; "The Server is Dead" 2026-10-23; the owner's words "ERP-less ERP", "Email driven ERP" 2026-11-09. No earlier text with those phrases is in either repo; the owner's red1.org and ADempiere-wiki archives were not searched (a local copy may be under `~/Projects/red1org/`).

### 0.2 Conflicts and duplicates found by the sweep, and how §0 settles them
1. **Who parses (conflict):** SocialPlatformLens L41, L114 says voice and free text are *"AI-parsed"*. Under §0 **the door never AI-parses.** An AI that turns a voice note into a vocabulary line is itself an ACTOR (its delivery is the transcription); the line it produces still has to match a verb, still binds to the person behind it, and is judged by the ENGINE. Free text that matches no verb goes back as a question (§21.1).
2. **Actor vs channel wording:** §21.1 and the first Q1 decision called email and mobile channels; the owner's later list puts them under ACTOR (§21.6). Settled by the remap: they are actors whose delivery is the mailbox or the phone.
3. **Proof of sender, three phrasings** (signature only in DistributedERP/WMSLens; address + token + signature in SocialPlatformLens §6; "delegated identity" in ERP_WS_API L11): one rule, SocialPlatformLens §6, with the stakes deciding the strength; the others point to it.
4. **The vocabulary, kept by hand in several places:** `bim_mcp.js` tools, `docs/ProposerGuide.md` table, `internal/VIEWER_ACTIONS.md` verb column, ENGINE_CONTRACT `verbs(ctx)`, ERP_WS_API's legacy op names, AGENT_CALLABLE_CHECKERS' checks. **D1 `verbs.json` generates or maps all of them.**
5. **The post box, described four times** (DistributedERP §5.2b/§6, WMSLens §7, GuaranteedChannels §0, TEAMWORK history §11.19) under two names: one term, "post box"; TEAMWORK owns it.
6. **"No AI inside", defined six times** (memory note, BIM_POSITIONING_RESEARCH, NO_AI_INSIDE_WITNESS, ERP_WS_API L11, the defensive disclosure, §1 here): the ENGINE column is the definition; the others point to it.
7. **A second ERP kernel copy:** bim-ootb `erp/odoo_agent/` carries its own `erp_kernel.js` (Odoo-migration tooling). Not an actor layer, but "one implementation per responsibility" applies: check before the ERP door (D6) is built.

### 0.3 How others do it: what to copy, what to avoid (read-only web review 2026-11-09; owner: *"Review how others out there doing similar so we learn to avoid and reinvent"*)
Primary pages were read where they loaded; rows marked *unverified* came from search results only. Not reviewed: Revit/Dynamo/pyRevit, VBA, the iDempiere Request EMail Processor (wiki returned 403), ServiceNow, GitHub and Jira reply-by-email.
| System | Its actor + delivery / vocabulary / door / judge | Copy | Avoid | Source |
|---|---|---|---|---|
| AppleScript `.sdef` | apps publish a dictionary of commands with typed parameters; one event engine | a machine-readable dictionary with typed inputs and read/write flags | a dictionary not generated from the code drifts from it | unix.com/man-page/osx/5/sdef |
| AutoCAD, Rhino commands | every action is a command; a "-" twin runs without its dialog | one prompt-driven path for scripts and people | a dialog and a command line that are separate code; some commands have no scriptable form | developer.rhino3d.com/guides/rhinoscript/running-scripts-from-macros; AutoCAD forum (*unverified*) |
| Blender operators | `bpy.ops`; `poll()` checks before running; undo declared per operator | a pre-flight check plus declared undo | undo leaks after a partial failure: reject needs its own transaction | docs.blender.org/api/current/bpy.types.Operator.html |
| Hubot, Slack slash commands | chat → a regex per script / one raw text string | signed requests (Slack's signing secret) | no published verb list; regex phrasing breaks; every app invents its own grammar | hubot.github.com/docs/scripting; docs.slack.dev/interactivity/implementing-slash-commands |
| Request Tracker, Odoo mail gateway | email → an action in the address / an alias routes to a model | the action named in the address, not guessed from the body | Odoo picks the owner from the From address and falls back to Administrator | docs.requesttracker.com/rt/latest/rt-mailgate.html; odoo.com/documentation/18.0/developer/reference/backend/mixins.html |
| Zendesk (CVE-2024-49193) | email-to-ticket | — | a forged From address joined a ticket; ticket ids were guessable | sentinelone.com/vulnerability-database/cve-2024-49193 |
| DMARC (RFC 7489) | proves the From **domain**, not the person | — | treating "From:", or even a DMARC pass, as a person | rfc-editor.org/rfc/rfc7489 |
| OPC UA methods | devices publish methods with typed in/out arguments | per-argument status codes; permission checked on the verb itself | work done but results lost if the session drops | reference.opcfoundation.org/Core/Part4/v105/docs/5.12.2 |
| MCP `tools/list` | the AI actor's menu: name, description, input schema | the closest published list with typed inputs | tool descriptions are an attack surface; annotations are untrusted hints | modelcontextprotocol.io/specification/2025-06-18/server/tools |
| Blender-MCP | fixed tools **plus** `execute_blender_code` | — | an "execute anything" verb defeats the whole vocabulary | github.com/ahujasid/blender-mcp |
| Home Assistant intents | many producers (voice, an LLM, an outside assistant) → one handler per intent, slot schema, `platforms` limits who may fire it | **the closest whole match**: producer and handler apart, one handler for every producer | names must be prefixed to avoid clashes | contributors.home-assistant.io/core/internals/intents |
| CQRS command bus | any sender → a command named as a business task → one handler | business-task verbs ("Complete order", not "set status"); reads apart from writes | duplicates and retries once commands queue | learn.microsoft.com/en-us/azure/architecture/patterns/cqrs |
| UiPath RPA | a robot scripts the screen | — | screen selectors break when the screen changes | docs.uipath.com (*unverified*) |
| SAP Joule, Dynamics 365 agents | AI inside picks the action, a human confirms | reuse the app's own authorisation | the judgement sits partly in the model | SAP and Microsoft release pages (*unverified*) |

**What this framework does that the review did not find** (in the pages read; absence in a search is not absence): a harm class published per verb and owned by the app; one "which actors may use it" list covering email, mobile and devices; coverage as X of N from the app's own tables; a reply that says what was not checked; an edit undone automatically because the app's own check found a new problem.

**Rules added to §0 from the review (each a spec line for the build; no code yet):**
1. **Generated, never hand-kept (AppleScript):** `verbs.json` and the app must stay in step. A check fails when a verb has no implementation, or an app action is missing from the vocabulary's inventory (X of N already catches the second).
2. **One path for screen and script (AutoCAD, Rhino):** a verb calls the same function the screen calls (already §19 design 1); no verb gets a dialog-only behaviour.
3. **Reject needs its own transaction (Blender):** the stop's undo-and-recount (§15.1 C13, C14) is the model; every writing verb gets the same.
4. **Proof of sender is a rule per actor (Zendesk, DMARC, Odoo):** an actor table states what each adapter can prove (signature, device key, per-message token, a local terminal) and **which harm classes an unconfirmed claim may use: read only.** A From address is never proof. There is no fallback to an administrator.
5. **The harm class belongs to the engine (MCP annotations):** it comes from `verbs.json`, never from what the actor says about itself.
6. **No escape-hatch verb (Blender-MCP):** no eval, SQL, shell or "run code" verb, ever. That rule is what keeps the vocabulary meaningful.
7. **One grammar, the door's (Hubot, Slack):** actors send vocabulary lines; nothing parses free text by regex. Free text goes back as a question (§21.1).
8. **Slow verbs and offline actors (Slack, OPC UA, IoT Hub):** each line carries a request id; a reply can come later on the actor's own delivery; a duplicate id is answered from the record, not run twice (§21.5 A6); a result is recorded before it is sent, so a dropped session loses nothing.
9. **Verbs named as business tasks (CQRS):** "Complete Sales Order", "try shift", never "set field"; read verbs and write verbs listed apart.

**Missing column?** The review's strongest point: **identity** deserves its own published rule, because every email failure it found was an identity failure. In this framework it lives in the ACTOR column (the adapter proves; the door binds), now stated as rule 4 above rather than as a fifth column.

### 0.4 The framework's design, one detail at a time (owner, 2026-11-09: *"Hold off film for now. Let's get the framework well designed"*)
**Film Part II is ON HOLD** at rc1 (§22.8): no rc2 until the framework design below settles. Its three open items (the public Duplex differs from the local copy; the Viewer CLI needs the whole page tree; the one-door card shows the pre-remap columns) wait with it.
Order of the details: (1) one vocabulary entry · (2) naming and granularity · (3) the line grammar · (4) the actor table (proof of sender, what an unconfirmed claim may do) · (5) the door's record (request id, duplicates, log) · (6) the reply envelope · (7) the engine binding per app (which function, undo) · (8) the framework's own witnesses.

**Detail 1, DECIDED 2026-11-09 (owner: *"yes, go on to detail 2"*):** every verb is one entry in `verbs.json` with: `verb` (app-qualified name), `app`, `title`, `description` (plain words), `inputs` (each: `name`, `type`, `unit` where physical, `required`, `example`), `harm`, `actors` (who may use it), `calls` (the app's existing function or CLI path, never new logic), `returns` (the answer's schema), `witness` (the test that proves the verb = the app's own path). **Harm classes:** `read` · `trial` (a change made on a throwaway copy, judged, never saved: every Modeller verb today) · `writes` · `posts` · `sends`. **The harm class comes from the vocabulary, never from the actor; an unconfirmed claim may use `read` verbs only** (§0.3 rules 4, 5). Example, from `bim_mcp.js`'s real definition: `modeller.try_shift`, inputs `building` (building), `line` (grid_line, e.g. gx6), `move` (number, m, e.g. 1.824), harm `trial`, actors ai and human, calls `edit_cli --building {building} --shift {line} --move {move}`, returns `EDIT_REPORT v1`, witness W-EDIT-CLI C13-C16, W-BIM-MCP M2b.

**Detail 2, DECIDED 2026-11-09 (owner: *"yes go for useful common commands. This is POC viability stage."*):**
- **One verb per user action, its variants as inputs** (e.g. `viewer.counts` with `by` = discipline or storey).
- **ERP: one verb per document action, taking the document** (`erp.complete(document)`, `erp.void`, `erp.close`, `erp.reverse`, …), not one per table and action. This is legacy's own design (one Document Action button whose legal actions depend on the document's state; `set_docaction` in its web service takes the action as an input), so the twin rule points to it. **Legality comes from the engine:** the read verb `erp.actions(document)` returns the legal actions for that document's state (`verbs(ctx)`, ENGINE_CONTRACT §2). Processes: `erp.run_process(process, …)` with its inputs generated from the dictionary (`AD_Process_Para`) and listed by the read verb `erp.describe(process)`.
- **Names:** app-qualified (`modeller.`, `viewer.`, `erp.`), named as what a person does, never "set field" (§0.3 rule 9).
- **X of N** stays counted on the app's own units (Viewer actions; ERP table-and-action pairs plus processes), never on verb names: `erp.complete` counts only for the tables where it is implemented and witnessed against legacy.
- **POC scope: a small set of useful, common commands**, not the full N. The POC set (each already exists as an app path, or is §21.6's first slice):

| Verb | Harm | Exists as | State |
|---|---|---|---|
| `modeller.buildings` | read | the Open panel's list (`edit_cli` reads it) | to add |
| `modeller.lines` | read | `edit_cli --lines` (`bim_lines`) | built |
| `modeller.try_shift` | trial | `edit_cli --shift` (`bim_try_shift`) | built |
| `modeller.try_move` | trial | `edit_cli --grid` (one line) | to add |
| `viewer.counts` | read | `viewer_verbs.js counts` | built |
| `viewer.clashes` | read | `viewer_verbs.js clashes` | built |
| `viewer.film_path` | read | `film_path_vis.js` | built (CLI only) |
| `erp.find` | read | the window's Find (a document by number or name) | to add |
| `erp.actions` | read | `verbs(ctx)` | to add |
| `erp.complete` | posts | `dispatch` of DocAction CO, first on Sales Order, = legacy's Complete (§21.5 A5) | to add |

**Detail 3, the line grammar (proposed 2026-11-09; the owner went on to the layers and the tiers without objecting, confirm on review):** `[name =] app.verb key=value …`, one command per line; `--` starts a comment (as BIM COBOL); a value with spaces is quoted; units come from the vocabulary, never the line (`move=1.824` is metres; `1824mm` is an error); an unknown verb or key is an error that names it; text that is not a command goes back as a question. The AI menu's JSON maps one to one (`{"verb":"modeller.try_shift","building":…,"line":…,"move":…}`). BIM COBOL's compiler scripts (78 verbs, sentence style) keep running unchanged as the compiler's own dialect; the door speaks only this grammar.

**Detail 3a, the layer stack (owner, 2026-11-09: *"Is our JS code patterns conveniently designed for such scripting? Does it need or using a validation layer? Such separation layering is what i envisage in our one page framework big picture"*):**
```
ACTOR adapter   delivery + proof of sender
DOOR  parse     the line grammar → verb + inputs
      validate  against the vocabulary ONLY (verb known; inputs present, typed, in units, in range or list;
                actor allowed; harm class within the sender's proof). ONE module, generated from verbs.json
      bind      ctx {actor, key, role}, or the line stays a claim
      call      the app's seam
SEAM  per app   call(verb, inputs, ctx) → {ok, answer} | {rejected, why}
ENGINE          domain checks (does gx6 exist, is the document state legal, role, owner) + the judge (report, stop, undo)
REPLY           the engine's answer + what was not checked, back through the actor's delivery
```
**The rule between layers:** the door checks a line's *shape*; the engine checks its *meaning*; neither copies the other ("is `move` a number in metres" = door; "does gx6 exist" = engine, which already says "no grid line gx6").
**Measured state of the code (bim-ootb origin/main, 2026-11-09):** ERP is already layered: `erp/erp_seam.js` exposes `read · dispatch · manifest · verbs · verify` (L6-21) and `dispatch` gates scope → role grant → rule guard → owner (L98-136) before the kernel, returning `{ok…}|{rejected, why}`. Viewer is nearly there: `viewer/find_ask.js` answers `{id, verdict OK|INCONCLUSIVE|VACUOUS, summary, value, evidence, sources}`, a missing precondition INCONCLUSIVE (L9, L68-74). **Modeller is the gap:** `window.__gridShift(id, delta)` (`modeller.html:2504`) mixes logic with the status bar and returns `null` on a refusal, its reason only on screen or console (L2507-2512), so `edit_cli` reads the page. The input-shape check exists three times by hand (`bim_mcp.js` `bad()`, `edit_cli.js` L29-35, `viewer_verbs.js`): the generated validator replaces and deletes all three (deletion budget).

**The vocabulary's three tiers, DECIDED 2026-11-09 (owner: *"can we have more powerful vocab, ie what i seen since ADempiere to have JSR223 Callout"* · *"agree with A, it is getting more DSL domain specific language that is powerful"*):**
| Tier | What | Written by | Example |
|---|---|---|---|
| 1 built-in verbs | one app function each (the POC set, detail 2) | developers, with a witness | `modeller.try_shift`, `erp.complete` |
| 2 composed verbs | a named verb whose body is lines of other verbs in the door's grammar, stored as data | an admin or power user, as an AD_Rule is | `modeller.widen_bay` |
| 3 rule hooks | dictionary rows attaching a rule to an ENGINE event (field change, before/after save, document action; on the BIM side, after an edit); the rule is a registered function, a ported process, or a tier-2 verb | an admin | "before Complete on a Sales Order, check the credit limit" |
**The precedent, already in the Kernel ERP:** `erp/ad_rule.js` ports AD_Rule + AD_Table_ScriptValidator (legacy's JSR223 rule tables) as stage 3 of model validation, in legacy's order, the rule's return text a veto. **It never evaluates `AD_Rule.Script`:** `twin:<name>` resolves to a registry of ported, named functions and `twin:process:<name>` runs a ported AD_Process in the save's own transaction; groovy, beanshell, jython or javascript rules are reported NAMED-UNPORTED, never executed, never silently skipped (L11-14; owner decision `TEAM_REPLICATION_PLUGIN_STUDY.md` §10.7, 2026-10-27). `@script:` callouts are logged `§CALLOUT-UNPORTED-DEP` (`ad_callout.js:793`). `erp/ninja_rule.js` compiles closed business phrases to SQL from dictionary words only. **So JSR223's power is kept (rules as dictionary data, fired by the engine for every actor) without its risk (code from anyone).** No tier accepts code from an actor; an actor can only name a verb.

**Tier 2, the DSL's first rules (option (a), decided):**
- A composed verb is a `verbs.json` entry whose `body` is lines in the door's grammar. It declares its own `inputs`; its `harm` is the highest harm of its lines; its `actors` are those allowed by every line.
- **Named results:** `bay = modeller.bay_width building={building} from=gx5 to=gx6` (a read verb), then a later line uses `{bay}`.
- **Expressions, arithmetic only:** `{13 - bay}` with `+ - * /` and parentheses over named results and inputs; computed in BigDecimal (the project's number rule), never floating point; no functions, no strings built from code.
- **Flow:** top to bottom; **it stops at the first refused or stopped line** and returns the record of every line run. No conditions or loops in the POC (option (b) later, on the owner's go).
- **Every line goes through the door** (validate, bind, call, judge) exactly as if an actor had sent it; the composed verb gets no shortcut and no extra rights.
- Example, the G4 request as one verb: `modeller.widen_bay building from to target` with body `bay = modeller.bay_width building={building} from={from} to={to}` · `modeller.try_shift building={building} line={to} move={target - bay}`.

### 0.5 DESIGN: the object layer — BIM as a compiled model of dictionary objects (owner, 2026-11-09)
**Owner's words:** *"should we abstract even further by submitting BIM model to its own AD similar to our ERP so that it can has its own ORM?"* · *"As the … designer session is also applying a BIM model for its doc processing, where artifacts are attached, perhaps getting more object orientation can abstract further"* · *"this makes our BIM as a compiled model concept even more true. Write up and think thru the design stage first. POC is not a real question as this has a clear framework to rely on"*.
**Status: DESIGN.** Nothing built from this section; build only on the owner's go, item by item.

#### 0.5.1 The thesis
A compiled model is an **artifact that carries its own dictionary**, as an object file carries its symbol table. The compiler already emits the building as rows (the WHERE database); with this layer it emits them **as dictionary objects**: each table registered, each column typed, each list a reference, each rule a row. Any app, and any actor through the one door, then works on **objects** through **one object engine**, the one the Kernel ERP already runs. The BIM side stops being "a database the apps know how to read" and becomes "a model that says what it is and what may be done to it".

#### 0.5.2 What it rests on (already in the repos)
- **The founding design (Feb 2026):** `docs/archive/METADATA_DRIVEN_ARCHITECTURE.md` v2.4, *"The iDempiere ERD Applied to Construction … A building is an order. Space is the product. The DSL is the order entry form."*; `docs/archive/BIM_APPLICATION_DICTIONARY.md`, *"The rules governing element placement are themselves data — not Java logic"*; `docs/archive/bim-dsl-dictionary.md`, *"vocabulary as data, behavior derived from type"*. Archived 2026-03-04 as stale, not rejected.
- **A compile-time ORM:** `orm-core` (`BasePO`: `get_Value`/`set_Value`, load by id or value) and 28 generated `X_` classes (`X_M_BOM`, `X_AdBuildingGrid`, `X_AdRoomBoundary`, …), written because raw SQL kept breaking on column names (`orm-core/docs/BIMDAOTechnicalFramework.md` §1.1).
- **The proof that a BIM artifact can be a dictionary object with zero host code:** `BIM_Document` (bim-ootb `erp/plugins/bim_document.mjs`; spec `ERP_IDEMPIERE_UX_PARITY.md` §BIMDOC-4/5; #2746, #2751, #2757). Everything is **dictionary data** in the plugin's manifest (AD_Table, AD_Column, AD_Window, tabs, reference lists, a DocType, a DocAction family on the common `ad_docfsm`), staged by the host, refcounted, removed on Stop; the physical table created IF NOT EXISTS; attachments, DocAction, revisions (the `Reversal_ID` pattern) and "Open in Modeller / Viewer" all come from the common engine; its witness checks that no table is named in host code.
- **The runtime object engine:** the Kernel ERP: `erp/model_layer.js` (save, validation), `erp/ad_modelval.js` + `erp/ad_rule.js` (model validators and AD_Rule hooks, stage 3), `erp/ad_callout.js`, `erp/erp_seam.js` (`dispatch` as the only write path, signed op-log), the generic AD window (`idempiere.html`).
- **The Modeller already writes ops:** a shift is emitted as `GEOM_GRID_MOVE` and `GEOM_MOVE` ops (`modeller.html` from L2504), the op-log shape the kernel uses.
- **The mechanism to register foreign tables:** `docs/internal/AD_GEN_FROM_DICTIONARY_SPEC.md` (AD rows generated from another system's dictionary, rendered "with zero renderer changes").

#### 0.5.3 The layer, defined
**Dictionary:** AD_Table, AD_Column (type, length, mandatory, min/max, reference), AD_Reference and its lists, AD_Process (with its parameters) and AD_Rule rows, for the model's own tables. **Object base:** what every dictionary object inherits, as legacy's persistent objects do:
| Behaviour | Comes from | On the BIM side |
|---|---|---|
| load **lazily**, one object only when a record is touched | the object base | 63,182 Hospital element rows stay rows until one is read or changed |
| set → **shape checks** (type, mandatory, range, list) | AD_Column / AD_Reference | the door's validator and the object's own save check are the same generated rules (§0.4 detail 3a) |
| save → **rule hooks** (model validators, AD_Rule) → **op** → signed op-log | `ad_modelval.js`, `ad_rule.js`, `dispatch` | "after an element or grid line moves, run the edit report and the gate" becomes a hook row |
| **veto with undo** in a transaction | the save transaction | the stop (§15.1) is a veto; a `trial` verb is a transaction that is always rolled back (§0.4 detail 1) |
| **attachments, notes, history** | AD_Attachment, the change log | a drawing sheet on the room it shows; who moved a grid line and the report that judged it |
| **document actions** where the object is a document | DocType + `ad_docfsm` family | `BIM_Document` today; a design revision tomorrow |
| a **generic window** | the AD window engine | any BIM table viewable and editable in the ERP's own UI with no new screen |

#### 0.5.4 The object catalogue, first cut (from the WHERE database as it is, `Duplex_extracted.db`)
| Object | Table(s) today | Key | Note |
|---|---|---|---|
| Building | `project_metadata`, `elements_meta.building` | building name | the parent; links to `BIM_Document` (its deliverables) and to the Project |
| Storey, Space | `spatial_structure`, `rel_contained_in_space` | guid | containment is a parent link, as tab under tab |
| Element | `elements_meta` + `element_transforms` (1:1) | guid | one object over two tables (open item 3) |
| Geometry | `component_geometries`, `element_instances` | — | **payload, not objects**: mesh bytes referenced by an element, never loaded as rows of objects (PERF budget) |
| Task, schedule | `tasks`, `task_elements`, `task_sequences`, `schedules` | id | the 4D objects; their judges stay the 4D engine (CLAUDE.md §I ownership table) |
| Grid line | **none in the database** (the Modeller derives the grid; no IFC route keeps `IfcGridAxis`, per the Modeller lane) | — | must be compiled into the model as a table to become an object (open item 4) |
| BIM document | `BIM_Document` (in the ERP database) | id | exists |

#### 0.5.5 How it changes the framework
- **ENGINE column gains one shared object layer** for both apps: the dictionary + the object base. The geometry judges (clash narrow phase, span gate, the edit gate, the 4D engine) stay app engine code, called as **processes and hooks bound to objects**; they are not rewritten.
- **The vocabulary collapses into two kinds:** a handful of **generic object verbs** the same for every app (`find`, `read`, `actions`, `attach`, `history`, and the document actions such as `complete`), plus **dictionary processes bound to an object** (as an iDempiere process sits on a window's toolbar): `try_shift` is a process on the grid line, `clashes` and `film_path` read processes on the building, `counts` a read process on the building.
- **N comes from the dictionary for both apps:** objects × their legal actions + processes, counted the way the ERP's 1,153 are (§21.7), never by scanning an app's code.
- **Detail 7 (the engine binding per app) is answered by this layer:** every verb binds to an object and an action or a process, and the seam is the object engine's own `dispatch` for writes and its read path for reads. The missing Modeller seam (§0.4 detail 3a) becomes "the Modeller's actions are processes on its objects".

#### 0.5.6 Rules this design keeps
- **Registration is not instantiation (PERF budget):** registering a table describes it; nothing loads its rows. Bulk work (a shift moving 3,961 elements, a clash pass) stays set-based inside its process, never one object per row. Element tables are flagged high-volume (`AD_Table.IsHighVolume='Y'`, legacy's own flag; the window then asks for a query before showing rows).
- **One object engine:** the Kernel ERP's JS engine at runtime. The compiler's Java `orm-core` stays the compile-time writer. **The dictionary rows are the contract between them:** one schema, generated, never hand-copied into either.
- **Three Concerns never merge (CLAUDE.md BOM principle):** the dictionary describes the WHERE tables and holds the HOW rules; it never moves WHAT data into WHERE or the reverse.
- **No host code for a BIM table** (AD-LAYER LAW), as `BIM_Document` already proves: dictionary data through the core plugin route, a witness that no table is named in host code.
- **DB changes ship as migration SQL + the self-heal loader** (CLAUDE.md): the dictionary rows for the model tables are a patch, never a binary.
- **No twin to legacy for BIM objects** (legacy has none), but the object base is the ERP's own, so the ERP's twin witnesses already cover the behaviour every BIM object inherits.

- **Actions are dictionary data, never lens side doors (owner ruling 2026-11-09, recorded in `ERP_IDEMPIERE_UX_PARITY.md` §LENS-REGISTER):** *"extra process lens should be avoided to comply for consistent maintainability. It is precisely the idea of legacy plugins to be adopting the AD."* · *"Such AD layer allows the verb CLI scripting to work on it as an ORM."* So every plugin or app action is an AD_Process (under the gear) and every computed value a ColumnSQL, which is what lets the vocabulary be **generated** from the dictionary (D6, and this section's object verbs and processes) and keeps every action inside X of N. **Correction to 0.5.2:** `BIM_Document` proves tables, columns, windows, lists and DocAction as pure dictionary data, but its two actions ("Open in Modeller / Viewer", "BIM progress", `bim_document.mjs:217`) are still lens actions and are on the register as **breaking** the rule (§BIMDOC-FEEDBACK FB1). Until they move to AD_Process rows they are not verbs.

#### 0.5.7 Open items, for the owner one at a time (each with advice)
1. **Where the model's dictionary lives.** Advice: **inside the compiled model** (the WHERE database carries the AD rows for its own tables), so the artifact describes itself wherever it travels; the object engine reads the ERP's system dictionary and the model's own rows together.
2. **Identity.** The model is keyed by IFC `guid` (text); legacy objects carry a numeric id and a `_UU` key. Advice: the guid **is** the object's UU key; a numeric id only where the engine needs one.
3. **Element = one object over two tables** (`elements_meta` + `element_transforms`, 1:1). Advice: one object, the transform as its extension, as legacy extends a table; or merge them in the compiler's output.
4. **Grid lines are not in the model.** Advice: the compiler writes them as a table (lines, axis, position in the building's frame, rotation), so a grid line is an object and `try_shift` a process on it.
5. **The first objects to register.** Advice: Building, Storey, Space, Element, Grid line, linked to `BIM_Document`; schedules after.

#### 0.5.8 Witnesses, written before any build (each names its issue)
- **W-OBJ-REG:** registering the model's tables loads no rows (heap and row counts before and after). Issue: the dictionary turning into a memory cost.
- **W-OBJ-ONE-PATH:** an element move through the object engine's `dispatch` gives the same op bytes as the Modeller's own move today. Issue: a second write path.
- **W-OBJ-GENERIC:** an element gets an attachment, a note and a history entry with no host code naming its table. Issue: per-table special cases.
- **W-OBJ-N:** the BIM vocabulary's N is generated from the dictionary and an independent count equals it. Issue: a hand-made N.
- **W-OBJ-HOOK:** the edit gate fires as a hook on an element save and its veto undoes the save. Issue: the stop living outside the object engine.

#### 0.5.9 Reflection and object orientation for the CLI scripting (owner, 2026-11-09: *"be aware the AD model is powerful for our CLI scripting, to get property reflection, OOP stuff"*)
The dictionary is what lets a script **know** an object instead of guessing it.
| OOP idea | From the dictionary | In the DSL (tier 2, §0.4) |
|---|---|---|
| **Reflection** | AD_Column (name, reference type, length, mandatory, read-only, min/max, list values), AD_Process_Para, the legal actions (`verbs(ctx)`) | a read verb `describe object=<kind or record>` returns its properties, processes and legal actions; an AI or a person learns the object from the model itself, never from code |
| **Properties** | an object's columns | a named result holding an object exposes them by name: `{el.storey}`, `{room.name}`; an unknown property is an error that names it, never a guess |
| **Navigation** | a column whose reference is a table or search reference points to its parent object | `{el.space.name}`, `{doc.project.name}`: follow references, nothing else |
| **Types** | the column's reference type | numbers in BigDecimal, list values checked against the reference list, dates as dates; the door's validator and the object's save check use the same rules (§0.4 detail 3a) |
| **Methods** | AD_Process rows bound to a table (the gear) and the DocAction family | `try_shift` on a grid line, `complete` on a document: an object's methods are listed by `describe` |
| **Generic methods** | the object base | `find`, `read`, `update`, `attach`, `history`, `actions` on every object (tables → read/create/update/delete verbs, the owner's line in §LENS-REGISTER) |
| **Events** | model validators and AD_Rule rows | hooks fire on save or action for every actor (tier 3) |
| **Kinds (inheritance)** | a kind column (`ifc_class` on Element) as the discriminator | a process bound to Element applies to every kind; a kind may add its own processes; no kind-specific host code |
| **Encapsulation** | properties and methods only through the dictionary | no raw SQL, no eval (§0.3 rule 6) |
**One gap the BIM side adds:** legacy's AD_Column has **no unit**. Physical properties (positions, lengths, areas, depths) need one, because units come from the vocabulary, never the line (§0.4 detail 3). Open item 6: where a column's unit is stated (advice: an extension column on AD_Column for BIM tables, the ERP's own columns untouched).

#### 0.5.10 DECIDED 2026-11-09 (owner: *"Go along with your advice and insight"*): open items 1-6 as advised
1. **The model's dictionary lives inside the compiled model:** the WHERE database carries the AD rows for its own tables; the object engine reads the ERP's system dictionary and the model's own rows together. The file describes itself wherever it travels.
2. **Identity:** the IFC `guid` is the object's UU key; a numeric id only where the engine needs one.
3. **Element** is one object over `elements_meta` + `element_transforms`, the transform its extension.
4. **Grid lines are compiled into the model** as a table (line, axis, position in the building's frame, rotation), so a grid line is an object and `try_shift` a process on it.
5. **First objects:** Building, Storey, Space, Element, Grid line, linked to `BIM_Document`; schedules after.
6. **Units:** an extension column on AD_Column for BIM tables states each physical column's unit; the ERP's own columns are untouched.

#### 0.5.11 PROBE RESULT 2026-11-09 (read-only, measured; sql.js 1.14.1, public `Duplex_extracted.db`; script in the session scratchpad, not committed): what the object engine can do today, and the corrections it forces
| Question | Answer | Evidence (bim-ootb `erp/` unless noted) |
|---|---|---|
| A text-key table as an object | **load, save, update: yes.** Create, attach, window key: gaps | registering `elements_meta` with `guid` as IsKey: `Trx.keyCols=["guid"]`, `trx.get` returns the row, a save emits `CRUD_UPDATE {id:<guid>, idCol:"guid"}` (`model_layer.js:48-59, 98, 185, 201`; `crud_core.js:495-499`). **Create overwrites the key** with `#new:1`, then a negative number at commit (`model_layer.js:153-158`, `crud_overlay.js:2870, 2985`, `crud_core.js:~486`). **Attach** needs a key named `_ID`/`_UU` (`ad_attachment.js:18`, `idempiere.html:1894-1898`); `Record_UU` writes already exist (`ad_attachment.js:124, 164, 200-202`) |
| Legacy's rule for UU-key tables | the key must be named `<Table>_UU` | `MTable.isUUIDKeyTable` (`MTable.java:542-546`), `PO.getUUIDColumnName` (`PO.java:5885`); creates skip the numeric id (`PO.java:4327, 4507`); `MAttachment.get` by `Record_UU` (`MAttachment.java:98-111`); change log by `record_uu` (`MChangeLog.java:173-198`) |
| A second SQLite file beside the ERP's | **stock sql.js cannot ATTACH a file** (`SQL.FS` not exported); a second `Database` costs about **6× the file** (9.6 MB → +58 MB external); `ATTACH ':memory:'` + copy works (69 ms, +28 MB) | one-database assumptions: `_adQ` (`idempiere.html:5910`), `_sqlRows`/`_tipDb` (`:5395`), the op-log (`crud_overlay.js:2865`, `kernel_ops.js:599`), `keyColsOf` cached by table name only (`model_layer.js:45`). But **`Trx` takes an injected `query(sql, params)`** (`model_layer.js:80-81`): it is not tied to one database |
| Registration cost | dictionary rows: **+0.3 MB** for 2 tables, 18 columns. Opening the model file: +58 MB | measured |
| One object over two tables | no write path for it (legacy has none either); nearest: `IsView` + ColumnSQL (read-only), or a keyed child tab (`ad_gridtab.js:76`) | `element_transforms` has **1,119 rows for 1,122 elements**: the transform is **0..1**, not 1:1 |
| `IsHighVolume` | **yes**, honoured | `idempiere.html:2699-2709`, `ad_gridtab.js:216-220`, `§UDP4-INITIAL` |
| A unit on a column | **none**: AD_Column has ValueMin, ValueMax, FormatPattern, VFormat; legacy models a unit as a `C_UOM_ID` column on the record | seed: no `*uom*`/`*unit*` column on AD_Column or AD_Element |
| Host code for a new table | one `BUILTINS` line (`plugin_overlay.js:191`) and the `sw.js` precache entry for a plugin; everything else is manifest data staged by `plugin_registry` (`:216-250`) | a model-carried dictionary needs a loader (host code, once, generic) |

**Corrections to §0.5, in force from now:**
1. **The key is named `<table>_uu`**, as legacy requires: the compiler adds a generated column, e.g. `elements_meta_uu GENERATED ALWAYS AS (guid) VIRTUAL` (sql.js accepts it, measured); `guid` is not renamed. This replaces "the guid is the UU key" (§0.5.10 item 2) and makes attach and the change log work through legacy's own `Record_UU` route.
2. **The create path must keep a UU key**, as `PO.java`'s `isUUIDKeyTable` branches do: one generic change in `Trx.insert` and the two synthetic-key sites. Not needed for the POC verbs (read, trial, update); needed before any BIM create verb.
3. **The transform is 0..1:** Element's transform is a level-1 single-row child tab keyed by the `_uu` link (the generic master-detail engine, no new code), allowed to be missing. Replaces "one object over two tables" (§0.5.10 item 3).
4. **Where the object engine runs (sharpens §0.5.10 item 1):** the Modeller and Viewer **already hold the model open** as a sql.js database. With the dictionary inside the model, the object engine (`Trx` with an injected `query`) runs **over the app's own handle**: data and dictionary in one file, no second load, no copy into the ERP. The ERP database is needed only for links such as `BIM_Document`. This is the strongest reason for item 1, and it removes the 6× cost of a second database.
5. **Two dictionaries must not shadow each other:** dictionary rows carried by a model are identified by their UU (`ad_table_uu`, `ad_column_uu`), not by numeric ids from the ERP's bands; the engine's caches (`keyColsOf`, `_adQ`) key on (database, table), not on table name alone.
6. **Units (§0.5.10 item 6) stand as decided, with their cost stated:** nothing reads a column unit today, so it is new engine work; until verbs are generated from the dictionary, units come from `verbs.json` (§0.4 detail 1), which needs no dictionary unit.
7. **W-OBJ-REG** measures the dictionary rows separately from opening the model file; only the first is claimed free.

### 0.6 The remaining framework details, DRAFTED on the owner's delegation (*"Go along with your advice and insight"*, 2026-11-09); owner reviews
**Detail 4, the actor table** (§0.3 rules 4-5: a From address is never proof; no fallback to an administrator; the harm class comes from the vocabulary):
| Actor | Delivery adapter | Proof it can give | May use, unconfirmed | May use, with its proof |
|---|---|---|---|---|
| Human, screen or terminal | the app, `edit_cli`, the CLI | a local session; in the ERP, the login and its role | read | everything its role grants |
| AI | its tool connection (`bim_mcp.js`, MCP over stdio) on the user's own machine | it runs as the local user | read | read + trial; **writes, posts and sends only when a human confirms** (the AI proposes, a person or the engine decides) |
| Email | the post box / mailbox | a per-action token in the mail the system sent (reply link or subject), a known address; a signature where the stakes need it (SocialPlatformLens §6) | read (a plain mail is a claim) | token: writes; signature: posts and sends |
| Mobile | the chat or push app | a per-device key (TEAMWORK) | read | what the device's role grants |
| Device | the device bus | a per-device key | read | only the verbs whose `actors` list names that device class (a sensor posts a reading; it cannot Complete an invoice) |
| Outside system | the legacy-compatible WS API | its credential bound to a role (legacy `ws_webservicetypeaccess`) | nothing | what that role grants |

**Detail 5, the door's record:** every line gets a **request id** (sent by the actor, or assigned by the door) and is **recorded before it runs**: request id, actor, proof level, the line, verb and inputs, then the result, the op UUIDs it wrote and the time taken. A request id already answered is **answered from the record, never run twice** (§21.5 A6). Writes and posts ride the signed op-log as today; reads and trials are kept in a door journal, itself a dictionary table, so it is readable by the same verbs (`history`). Every line prints one `§DOOR` line (actor, verb, status, request id).
**Detail 6, the reply envelope**, one shape for every actor; each adapter only renders it (an email body, the AI's tool result, terminal JSON):
`{ request, verb, actor, status, answer, why, notChecked, ops, next, ms }`, where `status` is **ok · refused · claim · error · inconclusive** (the PRIMAL LAW's words: a check that judged nothing says inconclusive, never ok), `answer` is the engine's own (the edit report, the Viewer's Find answer, `dispatch`'s before/after), `why` the reason on refused or error, `notChecked` the engine's own list, `ops` the op UUIDs written, and `next` the legal next actions from `verbs(ctx)`. Today's three answer shapes map onto it without changing them: `edit_cli`'s `{ok, edits:[{refused, reason, report}]}`, Find/Ask's `{verdict OK|INCONCLUSIVE|VACUOUS, …}`, `dispatch`'s `{ok…}|{rejected, why}`.
**Detail 7, the engine binding:** answered by the object layer (§0.5.5): a verb binds to an object and an action or process; writes go through the object engine's `dispatch`, reads through its read path.
**Detail 8, the framework's own witnesses** (each names its issue, written before any build; with §0.5.8's W-OBJ-*):
- **W-DOOR-SAME** (§21.5 A1): the same line through every actor adapter gives the same reply, apart from the actor and proof fields. Issue: an adapter that changes the result.
- **W-DOOR-PROOF** (A2, A3): an unconfirmed claim cannot run a write; a spoofed mail stays a claim; the same mail with its token runs once. Issue: identity by From address.
- **W-DOOR-DUP** (A6): a request id sent twice runs once. Issue: a duplicate mail double-acting.
- **W-DOOR-SHAPE:** the door's validator and the object's save check are generated from the same dictionary rows and agree on every case. Issue: two copies of a rule drifting.
- **W-VOCAB-FRESH:** every verb has an implementation and every dictionary action or process appears in the vocabulary's inventory, both ways. Issue: a dictionary that decays (the AppleScript lesson, §0.3 rule 1).
- **W-VOCAB-NOESCAPE:** no verb in the vocabulary evaluates code, SQL or a shell line. Issue: an escape hatch that defeats the vocabulary (§0.3 rule 6).
- **W-REPLY-HONEST:** a verb whose engine judged nothing replies `inconclusive`, never `ok`. Issue: a vacuous pass.

**The design stage, complete:** framework §0 (four columns) · rules §0.3 · details 1-3a and the tiers §0.4 · the object layer and reflection §0.5 · details 4-8 §0.6. **Build order unchanged (§0):** vocabulary (D1) → the door (D4) → the object layer's first objects → the most-duplicated checks as processes (§23.3) → ERP verbs (D6) → the actor adapters with their proof (D7) → GPU verbs last (D8). Each step: its spec line here, the owner's go, its witnesses first.

## ▶ RESUME HERE (2026-11-08, late): film rc4 BUILT, a labelled scripted demo
**Deliverable for the owner's posts:** `~/Videos/Think_Global_Act_Local_EN_rc4.mp4` (243.6 s) + `…_rc4_narration.txt`. It shows the AI using the app through the connector (§18): the menu the AI is handed (the connector's real `tools/list`), then **a scripted demo**: `scripts/film_neuro/mock_session.js` stands in for the AI (owner 2026-11-08: *"Can u just do a mocked up movie"*; earlier: mock an AI proposal in a sandbox, no model calls), sends brief G4 through the live connector to the real app, and every answer on screen is the app's own, from the connector's call log (`evidence/session_calls.jsonl`). The card says "A scripted demo: an AI's part, played by a test script", and the last box quotes the connector's own decline rule, not invented AI words.
**Witnessed:** resolve 73 facts, 0 missing; guard PASS (80 numbers on cards, 15 spoken; plants caught; stills sha256 pinned); W-FILM-NEURO-LIVE SAME (panel = the connector's answer, 2,349 bytes); recorder layout 79/79, 0 console errors; fit 17/17 DETAIL, tone 0 WRONG; captions 20 clamped, 0 overlaps; frames 5,847 = the silent picture; longest silence 7.5 s (end card); −16.5 LUFS. Logs: `scripts/film_neuro/logs_rc4/`.
**Optional rc5, a real AI session instead of the script:** owner runs `claude mcp add bim -e NODE_PATH=/home/red1/bim-compiler/node_modules -e BIM_MCP_LOG=$HOME/.local/share/bim_proposer/calls.jsonl -- node $HOME/.local/share/bim_proposer/bim_mcp.js`, starts a new session, and asks *In the HospitalGarage, make the bay between gx5 and gx6 13 m wide.* as the first message; then copy the call log to `evidence/session_calls.jsonl`, point `s_request`/`s_answer` at the session's own words, relabel the card "one real session, not a measurement". No API key: a Claude Code session runs on the owner's plan login.

**▶ NEW 2026-11-09: §21 the actor layer (any agent → one door → the engine; ERP verbs from the dictionary; email as the spine) is SPEC; Q1 decided 2026-11-09 (actor and channel kept apart); lanes dispatched the same day (results in §19.2, §19.4, §20.2, §20.3, §21.7).** **▶ FILM SEQUEL SPEC 2026-11-09: §22 "Outside AI, Inside Judge" (spec only, nothing recorded).** **▶ NEXT SESSION: §19.0 step 1 DONE 2026-11-09 (§19.1: N = 64 Viewer actions, 96 entry points, X = 0; bim-ootb #2735).** Next: step 2, the Viewer driver, then step 3, the first harmless Viewer verbs, each raising X in `internal/VIEWER_ACTIONS.md`. Earlier note: **start at §19.0** (owner: a comprehensive DSL to operate the Viewer first, then the Modeller, by CLI; inventory the Viewer's actions, then harmless verbs, one verb list, the guide explains each).
**▶ INCOMING 2026-11-09 (owner, via the Modeller lane): verbs 6-7, film path, in §19's verb table and its "Verbs 6-7" paragraph.** The film for the drawn-services walk waits on verb 6.

## ▶ STATE (2026-11-08)
**State:** everything specified here is shipped and witnessed. **Nothing is waiting on the owner.** Next work, each needing its own go:
1. ✅ Done 2026-11-08: a free hand-off rehearsal of the stop (§15.1). A wider one is possible on the same terms.
2. The Java `PlacementRequest` gate, once an outside order really arrives there (STATUS).
3. Browser boot weight, its own file: `prompts/BROWSER_BOOT_WEIGHT.md`.
4. Not started, each its own go: the report for bay add and other gestures, a session total at Save, beam and column rules on a live edit, a shift in the Modeller's UI. **Added 2026-11-09 from the film's own admitted gaps (§20.1):** the real-shape check behind the overlap row (A), a measured AI run with the connector at no cost (B), and the owner's call on floating elements (C).
5. **The film "Think Global, Act Local": English rc3 BUILT 2026-11-08** (`~/Videos/Think_Global_Act_Local_EN_rc3.mp4`, 221.6 s; §16.7). Waiting on the owner: a look and a listen. Other languages only on a later ask. `edit_cli --lines` on a rotated building FIXED 2026-11-08 (§17, bim-ootb #2712).

**⛔ No paid model calls (owner, 2026-11-08):** *"prepare best effort product without incurring any API call costs unless it is a 3rd party free one or in a sandbox here where you mock or mimick such a AI proposal."* `run.js` refuses without `--model-calls`, and no session passes that flag (`feedback_no_paid_model_calls.md`). The three model runs (§12 to §14) were made before this directive, through the owner's claude.ai plan login. Their `$` figures are Claude Code estimates, not charges.

**Shipped:**
| What | Where |
|---|---|
| This contract; §3 Java coverage and snap witnesses; `V016` category-filter fix, snap `pre_snap`, seal v20 | BIMCompiler #383, #384 |
| Live-check coverage; wall driven into a touching wall is RED; the red ink report | bim-ootb #2671, #2673, #2674 |
| `edit_cli`; first proposer test | bim-ootb #2678, #2679 |
| Block shift, the report names the limit and the bay, own grids, lattice boxes, **3-axis move fix** | bim-ootb #2685 |
| A shift hinges at one plane; `edit_cli` standalone with `--url` | bim-ootb #2688 |
| W-PROPOSER-GUIDE; the puppeteer load message | bim-ootb #2689 |
| No model calls without a flag; hand-off mode; `bay_add.js` on first use | bim-ootb #2697 |
| **The stop on outside calls**; the edit report on first use (sw v244) | bim-ootb #2699 |
| Specs, pre-registrations, results, the public guide, BROWSER_BOOT_WEIGHT | this lane's BIMCompiler PRs from #385 to #399 |

**Known and open. Do not re-derive; do not claim otherwise:**
- **Owner's question, open:** the live Save gate on a rotated building uses world boxes, so it can block on phantom overlaps (§13.6).
- **Stale labels, not changed:** the Open list calls SampleCastle, Clinic, HHS and Terminal column-framed; their `_ARC.db` files hold 0 IfcColumn rows (§13.2).
- **Before a shift gets a button:** copy-paste of an element carrying a HINGE keeps its plane, and a shift does not re-walk the STR tab.
- **Measured once, not re-run by a witness:** the guide's "116 of 122 Hospital lines refuse a shift" and "16 of 16 single moves red".
- **Not run:** the report panel on a phone-sized screen; "Add one more" end to end through the report.
- **Observed, not investigated:** a real +1.2 m mouse drag of gy8 after an undo recomposed 0 elements, while a scripted +1.5 m on a fresh Open recomposed 1.
- **Inferred, not reproduced:** one 112 s CLI run that returned "not judged". The settle wait addresses the suspected cause.
- **Still failing, unrelated:** G4-TAMPER, 73 old violations (§6.3); `witness_clipboard_keys` K1; two `playwright` smokes.

**Landmines:**
- **The primary checkout is on `fable/meshdb-livewire`, another lane's branch.** Do not commit there; work in a `/tmp/wt-*` worktree off `origin/master`. It holds an untracked copy of this file: delete it before merging master into that branch, or git refuses the merge.
- **Shed witnesses** need `SHED_MARKED_DIR`, `SHED_MARKED` and `SHED_RAW_DIR` set to `~/.cleanup_holding_2026-11-06/videos/dxf2bim_film_work/why/cli/marked` and `…/why/raw`, or they print MISSING. **That folder holds the only copy found. Raise it with the owner before anyone clears it.**
- **`library/validation.db` is gitignored.** `V016` was applied by hand, and no script applies V-series migrations. Without it `V1_legal_kitchen` fails.
- **Never symlink a primary checkout's `library/` into a worktree** for a full suite run. It wrote to `library/work_sh.db`.
- **The public guide:** change a number in `docs/ProposerGuide.md` and W-PROPOSER-GUIDE must change with it. Publish only through `scripts/safe_gh_deploy.sh`; from a worktree, copy `docs/glassbowl_data.db` in first or the guard aborts (`DOCS_DEPLOY_POLICY.md`).
- **Public repos:** grep every diff, commit message and PR body for the private client names (`feedback_private_project_no_names_in_public.md`). **Sealed files** need a `[SEAL]` commit that explains why.
- **Re-check the instrument before quoting numbers.** Across §13 and §14 that found a live bug, a meaningless overlap count, floors left behind and a broken install path, all before they reached a result.

## ▶ START HERE (state at 2026-11-08, for a reader new to this project)
**The idea.** An AI, a scan or a person proposes a change to a building. A deterministic compiler, with no AI inside it, computes the result, reports what it can prove, and on an outside call stops an edit that adds red. The AI stays outside, and its output is treated as untrusted.

| Question | Answer today |
|---|---|
| Can anything stop a bad edit? | **Outside calls: yes.** `edit_cli` undoes an edit whose report shows new red and returns the report and the reason (§15.1). **Modeller, a person's own edits:** Save blocks on RED, the engine refuses an opening that would leave its wall, and releasing a RED span commits nothing (§3.5). **Java compile path: no**, every gate only reports (§3) |
| Compile-path gates, 17 injected defects | 8 fire nothing (§3.1) |
| Modeller's live edit checks, 28 injected defects | 14 fire nothing, 2 of those by design. Every overlap class is caught; floating elements, wrong units clear of the building and invalid coordinates are not (§3.5) |
| Does snapping hide a bad value? | Fixed for one case; four others remain (§3.4) |
| Is a proof report available? | **Yes, live, for grid moves and shifts:** what changed, red ink before → after, the limit and the bay, what was NOT checked (§8). The CLI returns the same bytes (§11) |
| Did it help a real proposer? | Last measured run (§14, before the stop): right outcome 15 of 30 alone, 24 of 30 with the report. Six finals stayed RED, 3 knowingly over the span limit. **Small test, our briefs, about 10 real decisions** |
| Can an outsider try it? | **Yes:** one file, the live site, the Hospital. [AI Proposer Guide](https://red1oon.github.io/BIMCompiler/ProposerGuide/) |
| What did an outside review say? | DeepSeek: "appealing in direction but immature in execution" (§10) |

**What has NOT been measured:** whether a proposer does better with the stop (a model run would cost, §14.6); the size of the gain from the report, since the three tests are small and not comparable; speed against working without us; structural capacity, which nothing here checks, so a pass never means safe (§5).

**Open questions, where a second opinion is useful:**
1. Is a closed vocabulary (choose from the catalog, §7) too narrow? It is safer, but it gives up much of what makes AI useful.
2. Is `PlacementRequest` the right place for the compile path's gate, when outside orders arrive there?
3. What would make the proposer test a fair measure of "better than without", at no cost?

**Vocabulary.** *Witness:* a test that names the issue it proves and can report its own failure. *Gate:* a check on a model. *Order:* the existing `c_order` + `c_orderline` tables. *Red ink:* findings from the checks. *Shift:* a grid line and every later line on its axis moved together. `§TAG` lines are machine-readable log lines. Code cited as `bim-ootb` lives in [red1oon/bim-ootb](https://github.com/red1oon/bim-ootb); the rest in [red1oon/BIMCompiler](https://github.com/red1oon/BIMCompiler).

## 1. Position (consistent with "No AI inside")
- The proposer (JEPA, LLM, scan-to-BIM, a human) is OUTSIDE the compiler. Its output is an **untrusted ORDER**, same
  class as an IFC import or a C_Order. It is never authored data and never a ground truth.
- PRIME RULE holds: every value in the compiled result traces to (a) the order as submitted, or (b) a DB/verb result.
  Nothing is "snapped" silently — any rounding is a logged, reversible transform with its delta recorded. That is the requirement; it is not fully met (§3.4), and no code emits a `§ORDER_SNAP` line yet.

## 2. What the Gemini text claimed vs what the repo says (verified 2026-11-06)
| Gemini claim | Repo fact | Source |
|---|---|---|
| G1 geometry/topology, G2 physics/structural capacity, G3 relational completeness | G1–G6 = **count, volume, digest, tamper, provenance, isolation** (compiler-reconstruction proofs) | `docs/archive/TestArchitecture.md` L6, L17, L33 |
| "certified safe", "legally binding", "flawless" | No structural-analysis engine exists; a pass means *reconstruction-consistent*, not engineered-safe | same + absence of any load/capacity gate |
| JEPA emits element types, profiles, loads | JEPA yields latent vectors; the vector→`IFCBEAM/W12X26` step is the unsolved model, not a "snap matrix" | (external; not in repo) |
| JEPA reads the error log and self-corrects | needs a planner/LLM in the loop; out of scope here | — |
| SQLite in browser = "tamper-proof" | G4 (tamper) covers the compiled digest, not a user-editable local file | `TestArchitecture.md` L6 |

## 3. EXTRACTED 2026-11-07 (from running the code, not memory; log lines below come from `OrderContractWitnessTest`)
§3.1–3.4 are the Java compile path. §3.5 is the Modeller, a separate browser code path.

**Headline: nothing in the compile path can reject an order today.** Every gate reports; none stops the output.
`BuildingWriter.java:1110` "diagnostic — does not block emission" · `CompilationPipeline.java:1536` forces validation to LOG ·
`:1796-1802` prints `[FAIL]` and carries on · `VerbStage.java:117` logs a warning. So FAILS below means "a gate says no", not "the order was stopped".
G1–G3 compare to a reference DB (`RosettaStoneGateTest.java:39-45`), so they have nothing to judge a new order against.

### 3.1 Defect → gate (`§ORDER_COVERAGE`, Duplex, population 265, one injected element per row)
| Defect | Verdict | What fired |
|---|---|---|
| Clean element (control) | NONE | nothing, as it must |
| Same-class overlap, 50 mm offset | FAILS | `CHECK PLACEMENT` P06 only. Eyes P06 calls any partial overlap a "JOINT" and marks it PROVEN (`SameClassOverlapProof.java:71`) |
| Door inside a slab (cross-class) | **NONE** | P06 is same-class only; `CHECK CLASH` is MEP×structure only |
| Pipe inside a beam | DETECT_ONLY | `CHECK CLASH` lists it, verb still returns pass (`CheckClashVerb.java:76-85`); default recipe runs it only when routes exist (`VerbStage.java:140`) |
| Pipe through a wall | **NONE** | walls are not in `CHECK CLASH`'s structural classes |
| Unsupported: column 50 m above its storey | **NONE** | P04 builds the storey band from all elements INCLUDING the one judged, so it cannot fail (`CheckPlacementVerb.java:190-206`, `EyesProofRunner.java:154-163`) |
| Unsupported: beam 200 m from the building | **NONE** | same; matches the §1 prediction. Browser `§STRUCT_SANITY floating_member` is IfcBeam-only and an on-demand panel, not an order gate (read, not run). BIMEYES §S14: the support judges disagree by 3154 |
| Unit: mm as m, 3100 m wall | FAILS | P02, only because 3100 exceeds its 1000 m limit |
| Unit: mm as m, 800 m wall | **NONE** | under the limit, so P02 passes. `DataIntegrityTest` D-2 (>100 m) checks the catalog, not orders |
| Unit: m written as km (0.2 mm thick) | FAILS | P03 |
| Unit: metres in a mm field (BEDROOM) | FAILS | validator area rule, only for a category with a rule |
| Unit: mm×1000 in a mm field | **NONE** | validator has minimums only (`actual < required`, `PlacementValidatorImpl.java:352`) |
| Unknown IFC class in the output | **NONE** | no gate checks the class |
| Unknown category at the validator | **NONE** | PASS |
| Unknown product, `placeItem` | FAILS | "Product not found" |
| Unknown BOM, `CHECK BOM` | FAILS | "not found" |
| Unknown product, compile walk | warns and skips | `OrderLineWalker.java:133-136` drops the line to stderr (read, not run). The order silently loses it |
| Duplicate guid | FAILS | `elements_meta.guid` UNIQUE, a raw SQL error |
| Duplicate position, new guid | FAILS | P05 + P06 |
| Duplicate order line | NONE (read) | current `c_orderline` DDL has no UNIQUE (`BuildingWriter.java:352`) |

`§ORDER_COVERAGE_SUMMARY defects=17 none=8 verdict=DISPROVED` — the claim "every defect class is rejected by a named gate" is false.

**Other findings from the same run:**
1. **`PROPOSED` is not a gate.** `proposal_status` has writers only (`OrderMutationService.java:223`, W004); no main code reads it, the walker filters on `IsActive` alone, and it defaults to `ACCEPTED`.
2. **`AD_Clash_Rule` has 6 rows and no reader.** The only main-code mention is the comment `CompilationPipeline.java:1553`, which says 0 rows.
3. **Fixed 2026-11-07 (§6.1): the validator's category filter was dead.** `library/validation.db` (from `V002_validation_seed.sql:34`) stored `bom_category`; the loader reads `m_product_category_id` (`PlacementValidatorImpl.java:173`), so every rule applied to every room and a legal 2000×3000 kitchen was BLOCKed by `UBBL_BEDROOM_MIN_AREA`. DV017 renamed `ad_val_rule_param.param_name` in ERP.db, not this table's `name` column. `V1_legal_kitchen` now passes.

### 3.2 Order shape: reuse, no new JSON
- **WHAT:** `c_order` + `c_orderline` (`BuildingWriter.java:352`): `family_ref`, `M_Product_ID`, `host_type`, `Parent_OrderLine_ID`, `Line`, `Qty`, `Discipline`, `locator_ref`, `is_reference_class`. The four mutations (Replace, Compress, Remove, Add) already express a variant (`docs/internal/ProjectOrderBlueprint.md` §1.1).
- **Placement on the line:** `dx/dy/dz` are parent-relative metres (`BomDropper.java:411`); `aabb_*_mm` are millimetres. Two units on one row, undeclared in the DDL, which is the unit-error surface in §3.1.
- **HOW:** `W_Verb_Node` + `W_Verb_NodeProduct`. **Judged through:** `PlacementRequest` → `ValidationVerdict`, whose own doc says it does not care who created the request (`PlacementRequest.java:9`). That is this contract's seam, and it already exists.
- **WHERE:** `elements_meta` + `elements_rtree` in output.db, written by the compiler, never by the proposer.
- ⚠ `library/output_template.db` still has the older element-list `c_orderline`; `BuildingWriter.java:350` says that shape was replaced. Do not copy it.

### 3.3 Reject line: map to existing fields
`§ORDER_REJECT order=<c_order.Value> line=<C_OrderLine_ID> id=<guid|locator_ref> rule=<ruleName|proofId> measured=<actualValue> tolerance=<requiredValue> unit=<mm|m|m2> std=<standardRef>`
Fields come from `ValidationVerdict`; `AD_Validation_Result` (V001) already stores the same row. `W_Validation_Result` has no measured or required column, and `CheckPlacementVerb.ProofResult` carries only an evidence string, so P01–P06 cannot fill `measured` without a change. Nothing emits this line yet.

### 3.4 Snap (`§ORDER_SNAP_WITNESS`): `verdict=DISPROVED`
| Case | Result |
|---|---|
| S1 bedroom 2800 wide, grid 500 | **Fixed (§6.2): no longer hidden.** Snap still rounds to 3000 and returns `success=true`, but now adds a `pre_snap` entry naming `UBBL_BEDROOM_MIN_DIM` and logs `§SNAP_ROUNDED_PAST_RULE` |
| S2 10002 mm vs 1 mm tolerance, grid 1000 | Accepted, moved 2 mm. Logged, but snap has no tolerance input, so it cannot reject |
| S3 verb form, (10.002,…) spacing 1000 | Pass, moved **998 mm** (rounds up). Logged, not rejected |
| S4 10.0004 m, spacing 1 | **Silent.** 0.4 mm lost in the mm conversion; verb says "no change" |
| S5 a BLOCK that survives snapping | `success=true`, element returned, rule appears only as an adjustment (`DesignerAPIImpl.java:962-989`) |
| S6 already on grid | NO-OP reported |
| S7 validator off | VACUOUS: `success=true` with nothing judged |
| S8 click-to-fix (control for §6.2) | Lands on 3000, no `pre_snap` entry |

### 3.5 The Modeller's live edit checks (`§EDIT_COVERAGE`, bim-ootb `modeller/tests/witness_edit_report_coverage.js`)
A different code path, so it was measured separately: `SdgGate` on the real Duplex (203 solids), `GridSpanGate` on the real Garage lattice (228 girders). `defects=28 none=14 by_design=2`. Generated table: bim-ootb `modeller/edit_report_coverage.json`.
| Defect | Java gates (§3.1) | Live edit checks |
|---|---|---|
| Same-class overlap, door in slab, pipe in structure, pipe through wall | One fails; the rest fire nothing or pass | **RED, all four** |
| Wall driven into a wall it already touches | Not tested | **RED since the fix below.** Fired nothing before it |
| Duplicate position | FAILS | RED |
| Column 50 m up, beam 200 m away | NONE | NONE |
| 3100 m wall clear of the building | FAILS | **NONE** |
| 800 m wall clear of the building | NONE | NONE; RED only if it hits something |
| 0.2 mm thick | FAILS | **NONE** |
| Unknown class | NONE | NONE: the gate receives boxes only |
| Duplicate guid | FAILS | NONE (read): boxes are keyed by feature id |
| NaN coordinates, zero-size box | Not tested | NONE, no throw |
Also: a line dragged past its neighbour has no rule of its own, and the span check uses one material per building, so on a mixed building a steel girder within its own limit can read RED.

**What actually stops an edit in the Modeller today:** (1) Save blocks while RED remains (`modeller.html` `runSave`, W-SAVE-COMPLETEIT); (2) the engine refuses a grid move that would push a held opening out of its wall, and nothing is committed (`bonsai_gridmove.js` `commit`, `§DAGEVU refused`); (3) releasing a drag on a RED span commits nothing and opens the "Add one more?" prompt (W-GRID-SPAN-GATE). An ordinary RED on a committed edit does not undo it: the user is offered Revert. None of these cover the NONE rows above.

**Fixed 2026-11-07 (bim-ootb #2673):** a grid stretch could push a wall through its neighbour with no warning, because touching pairs were always expected contact. Measured on SampleHouse, `gx1` +1 m: wall 23's end moves x=6.12 → 7.12, through wall 22 (6.12..6.41). Now RED `abuts-clash`. RED blocks Save.

## 4. Witness claims (written first; each names the issue it proves)
- **W-ORDER-REJECT-COVERAGE** — proves/disproves: "every defect class in §3.1 is rejected by a named gate". Output is the
  table with NONE rows — NONE rows are the finding, not a failure. INCONCLUSIVE if the order population is empty.
- **W-ORDER-SNAP-LOSSLESS-LOG** — proves/disproves: snapping never hides an out-of-tolerance order (an order at 10.002
  vs tolerance 0.001 must be REJECTED before snap, not passed after). Must be able to report NO-OP and VACUOUS.

### 4.1 Witness design (spec, 2026-11-07) — `BonsaiBIMDesigner/src/test/java/com/bim/designer/OrderContractWitnessTest.java`
Read-only over shipped code; adds no gate, changes no gate. Fixtures are the same local files the existing tests use
(`DAGCompiler/lib/input/Duplex_extracted.db`, `library/validation.db`; both gitignored, root overridable with `-Dbim.fixture.root`).
A missing or empty fixture prints `INCONCLUSIVE` and aborts; it never passes.
- **Coverage:** copy the real Duplex DB, inject ONE defective element per class, run every gate that can read it
  (`CHECK PLACEMENT`, `CHECK CLASH`, `EyesProofRunner.proveFromDB`, `PlacementValidator`, `placeItem`, `CHECK BOM`), and print
  `§ORDER_COVERAGE defect=… verdict=…`, counting only results that name the injected guid (the real DB has its own baseline findings).
  Verdicts: **FAILS** = a gate returned fail/BLOCK · **DETECT_ONLY** = a gate reported it but still returned pass · **NONE** = nothing fired.
- **Coverage controls:** a clean injected element must fire nothing; the same-class overlap must fire P06. If either breaks, the harness is blind and the test fails.
- **Snap:** the 2800→3000 grid-snap case, the 10.002 case, plus NO-OP (already on grid) and VACUOUS (validator inactive), each printing `§ORDER_SNAP_WITNESS case=… verdict=…`.
- **Pinned:** both witnesses assert the recorded table, so a future gate fix turns the test red and forces §3 to be updated.
  A green run therefore means "the table is still accurate", NOT "orders are safe".

## 5. Explicit non-goals
Structural capacity checks, code compliance, "certification", any claim of engineering safety. Those need a licensed
engineer and a real analysis engine; out of this lane until the user says otherwise.

## 6. Fixes approved by the owner 2026-11-07 ("Go")
Spec for changes to shipped code. These correct bugs that exist with or without a proposer. They do not add a reject gate.
1. **Category filter.** `migration/V016` renames the rule param to what the loader reads. The loader also splits comma lists, because `AU_CEILING_SERVICE` names four categories and an exact-match key would never fire. A rule listed under several categories still counts once. Witness: `V1_legal_kitchen` goes NONE; `w_pv_1`, `w_pv_3`, `kitchen_pass`, `w_infra_snap_4` go green.
2. **Snap hides a violation (S1).** When grid rounding changed the size and the snapped size passes, `snap()` validates the submitted size too. If that BLOCKs, it adds an adjustment with `field="pre_snap"`, `from`=submitted, `to`=required, and logs `§SNAP_ROUNDED_PAST_RULE`. The bbox and `success` do not change, so nothing is stopped. The Blender panel shows it as information without a Fix button, since the snapped size is already legal. Witness: S1 goes OK; new control S8 proves click-to-fix still lands on the required size with no `pre_snap` entry.
3. **Seal repair.** `scripts/pre-commit` gains the NO-LFS guard line the installed hook already has. `verify_test_seal.sh` finds the hook through `git rev-parse --git-path`, so it works in worktrees, and reads the manifest from its new path, `docs/archive/TestArchitecture.md`. Audit before re-sealing: at `7d941768b`, the last seal, the recorded hash reproduces; since then 2 of 76 sealed files changed: `scripts/pre-commit` (`6e54c133a`, Gate 1 lets a commit remove a `library/` binary) and `run_RosettaStones.sh` (`2d330e381`, one mesh-restore step). Neither weakens a gate. Re-sealed as v20, super-hash `dbedb86a…`.
   ⚠ **G4-TAMPER is red and was not fixed:** 73 violations, none in a file changed here (`T19` alone hits lines naming `IfcFlowTerminal`, `T14` is `catch … ignored`). Its procedure asks for green before re-sealing; this re-seal went ahead on the audit above, on the owner's go. G4 is not part of pre-commit.
4. **Test comparison, `BonsaiBIMDesigner` suite, before → after:** 78 → 73 failures, 59 → 59 errors. Now passing: `w_pv_1`, `w_pv_3`, `kitchen_pass`, `w_infra_snap_4`, `DemoHouseTest.w_dh_4`. The remaining failures need local DBs absent from a worktree (`library/ERP.db` is a 16-byte stub). The one "new" line, `InfraVocabularyTest.deriveFacilityTypeViaApi`, is the same test failing on another empty `*_BOM.db`: it iterates a `Map.of`, whose order changes per run.

## 7. What a proposer should be told
- **Works:** choosing from what exists: the lines from `--lines`, the two edits, the catalog with sizes. Tell it to decline when nothing fits.
- **Does not:** free coordinates, where unit and floating errors arrive, the gates' weakest spots; or anything asking for structural safety or loads (§5).
- **Measured (§12 to §14):** the model chose a shift on 24 of 30 first proposals, but never found the clean shift on G5; it read a refusal's reason well; kept an over-limit edit it knew about. Its forecast of problems did not separate good proposals from bad ones.
- **The guide's prompt** adds two rules the tests did not state: treat a stopped or left-behind result as bad, and decline rather than keep a bad edit with a note. **Not measured.**
- A report that omits what was not checked invites a proposer to hide errors in the blind spots, so the NOT-checked list is mandatory.

## 8. The proof report (bim-ootb `modeller/edit_report.js`, `edit_report_panel.js`)
After a grid move or a shift, the Modeller logs one `§EDIT_REPORT <json>` line and shows a panel. For a person it reports only: the edit stands. Spec and slice-1 results: `prompts/MODELLER_MASTER.md` §EDIT-REPORT.
- **Rows:** box overlap among moved elements; beam spans over the limit and needing a depth check, whole building, **naming the limit, the material and each changed over-limit bay** (§13.4); new red and orange kinds; new pairs; the NOT-checked list.
- **Honest rows:** a refused or empty check prints "not judged" and no number; different populations print "inconclusive" and no delta; no NOT-checked list, no report. Words: never safe, compliant or OK.
- **Loads on first use:** its two files load on the first committed grid move (§15.2).
- **Proven by** W-EDIT-REPORT: rows equal independent recounts, undo and redo return to Before and After, two fresh Opens give byte-identical JSON, and a deliberately broken report fails it.

## 9. Re-run the evidence
Fixtures are local files, not in git: without them a witness prints `INCONCLUSIVE`, never a pass. bim-ootb commands need `NODE_PATH` with puppeteer (here `~/bim-compiler/node_modules`).
| Witness | Command |
|---|---|
| Java gates and snap (§3) | `mvn -o -pl BonsaiBIMDesigner -am test -Dtest=OrderContractWitnessTest -Dpipeline.tests.skip=false -Dsurefire.failIfNoSpecifiedTests=false`; in a worktree add `-Dbim.fixture.root=<primary checkout>`. `V1_legal_kitchen=FAILS` means `library/validation.db` lacks `V016` |
| Live checks (§3.5) | `node modeller/tests/witness_edit_report_coverage.js` |
| The report (§8) | `node modeller/tests/witness_edit_report.js`; falsifier `EDIT_REPORT_BREAK=1` must fail |
| The CLI and the stop (§11, §15.1) | `node modeller/tests/witness_edit_cli.js` |
| Block shift (§14.1) | `node modeller/tests/witness_block_shift.js`; falsifier `SHIFT_BREAK=1` must fail |
| The public guide (§14.3) | `node modeller/tests/witness_proposer_guide.js` against the live site; `--no-page` before publishing; falsifier `GUIDE_BREAK=1` |
| Proposer scorer (§12) | `node modeller/tests/proposer_test/run.js --stub`, no model call |
| Regression after touching a shift or the report | W-BAY-RIDE, W-DXF-ADD-BAY (shed variables), W-SDG-GATE, W-GRID-SPAN-GATE, W-E2E-MOVE, W-E2E-GRIDSTRETCH-MULTI, W-CUT-MOVE, W-E2E-CUT-MOVE |

## 10. External review: DeepSeek, 2026-11-07
Verdict: "appealing in direction but immature in execution". Checked against the code: right that the compile path cannot reject an order (still true); half right on doors in slabs and pipes through walls (missed by the Java gates, RED in the Modeller); its claim that the blind spots are where AI fails was a hypothesis then, and the tests have not measured it since. Its JEPA framing is an analogy, not alignment: both refuse to let a generator self-certify, and that is as far as it goes. "AI provides imagination, the engineering world provides the verdict" is now true for outside calls, for the RED rows only.

## 11. The call a proposer makes: `edit_cli` (bim-ootb `modeller/tools/edit_cli.js`)
Drives the **real** Modeller page headless through its real commit path and prints JSON: one engine, not a Node copy of the rules. One file plus puppeteer 24; `--url` drives any page, and by default the live site when it stands outside a repo (§14.2).
- `--building <resident>`, `--lines`, `--grid <id> --move <m>`, `--shift <id> --move <m>`, edits applied in order. `--own-grid` for wall-bearing buildings (§13.2), `--lattice-boxes` for a rotated one (§13.6), `--report-only` to turn the stop off (§15.1).
- stdout: JSON `{ok, building, edits, ms, model?, gate?}`. Exit 0 every edit reported · 3 refused or stopped · 2 usage · 1 failed. Nothing is saved: each call starts from a fresh Open.
- **Proven:** byte for byte the page's own report; repeatable, including across separate installs; refusals and stops read as answers.
- **Limits:** grid moves and shifts only; the app's own buildings only; 40 to 75 s per call on the Hospital, almost all of it opening the building.

## 12. The proposer test (bim-ootb `modeller/tests/proposer_test/`)
**Method, fixed before each run and pushed first:** 10 briefs (`briefs.json`, half are traps), 3 repeats, one isolated model with no tools and no project files, not told the limits. **Arm A** = its first proposal and forecast. **Arm B** = the same run continued, with the report fed back, up to 2 revisions, may decline. Each attempt is judged by `edit_cli` from a fresh Open.
**Classes:** CLEAN · PARTLY_JUDGED (nothing moved, only spans judged) · RED · STOPPED (§15.1) · LEFT_BEHIND (§14.1) · REFUSED · DECLINED · INVALID · FAILED. Orange does not count. **Right outcome:** goal met by arithmetic, CLEAN or PARTLY_JUDGED, no lines crossed; or DECLINED on the briefs marked impossible.
**The three runs, `claude-sonnet-5-5`, all before the no-cost directive:**
| Run | What changed before it | Right outcome A → B | Read it with |
|---|---|---|---|
| §12, 2026-11-07 (#2679, `results_2026-11-07.json`) | first run | 3 → 10 | a shift was judged line by line, and 9 runs used the app's default grid: both overstate the gain |
| §13 (#2685, `results_v2_2026-11-07.json`) | shift as one edit, own grids, stop at a judged-fine result, limit named, lattice boxes | 15 → 24 | all 12 clean Garage shifts left the floors behind, and 2 briefs depended on a wider tolerance |
| §14 (#2688, #2689, `results_v3_2026-11-07.json`) | the hinge (§14.1), LEFT_BEHIND | **15 → 24** | the current one. CLEAN 15 → 21, RED 6 → 6, REFUSED 6 → 0, LEFT_BEHIND 3 → 0, DECLINED 0 → 3 |
**What §14 shows:** a shift was the missing word (24 of 30 first proposals); the report turned 9 runs right, all through a refusal or left-behind notice and its reason; **a report alone does not stop a proposer that has decided:** on G4 it named the 12 m limit in all 6 revisions and kept the 13 m bay, which is why §15.1 exists; its forecast did not separate good from bad (problems forecast on 14 of 15 bad first proposals, 10 of 15 good).
**Limits, before any headline:** about 10 real decisions (17 different brief-and-edit pairs in 54 attempts); we wrote the briefs; one model; orange does not count; the three runs are not comparable; **the size of the gain is not established.**
**Now:** `--model-calls` is required to call a model, and no session passes it. `--handoff <dir> --answered-by "<who>"` rehearses for free (§14.6).

## 13. What the second run needed (2026-11-07)
### 13.1 One edit for a block shift
Superseded by §14.1. The first form stretched crossing members uniformly, which left a sideways error and floors behind.
### 13.2 Only grids derived from the building
**Measured 2026-11-07, real Open of each resident:**
| Resident | Measured | Grid |
|---|---|---|
| HospitalGarage | 140 columns, RC, 17×29 lines, rotated −2° | its columns |
| Hospital | 349 columns, **material unreadable, so spans are not judged**; 69×55 lines | its columns |
| SampleCastle, Clinic, HHS | 0 IfcColumn rows in the `_ARC.db`, walk as wall-bearing | walls, with `--own-grid` |
| SampleHouse, Duplex | wall-bearing | walls, with `--own-grid` |
| Terminal | 0 IfcColumn rows in `Terminal_ARC.db`; not opened | not read |
Without `--own-grid` a wall-bearing building uses the app's default grid. `--lines` states `grid_source`, and the runner refuses `app-default`, so a proposer is never told a default grid is the building's.
### 13.3 Stop at a judged-fine result
CLEAN and PARTLY_JUDGED end a run, so "not kept" is said only after a bad result.
### 13.4 The report names the limit and the bay
`GridSpanGate.tally` carries the limit and every bay; the span-over-limit row adds `limit`, `material` and `over_limit_changed` (`{bay, before, after, newly_over}`, newly over first, at most 8, with the total). No new threshold.
### 13.5 Witnesses
See §9.
### 13.6 Found before any model call: the 3-axis bug and rotated boxes
1. **Fixed (#2685):** any `GEOM_MOVE` rebuilt a 3-axis placement with yaw only, so the plain Move tool also turned the element and changed its height (Garage wall 22 rose 10.03 m). W-BLOCK-SHIFT A1, A2.
2. **On a rotated building, world boxes are metres wide** around long members (a 0.2 m beam at −2° has a 4.38 m box), so the Garage read about 1,900 overlaps before any edit. **`--lattice-boxes`** judges in the lattice frame. It is used for single-line moves with tolerance 20 mm + `|d|·sin|θ|`, stated in the row label; a shift is judged at plain 20 mm (§14.1). It has no effect at θ = 0, and the app never sets it.
3. **Owner's question, open:** the live Save gate on a rotated building still uses world boxes.
### 13.7 Pre-registration
Superseded: the method is in §12, and each run's registration is in the archive.

## 14. The hinge, the CLI for outsiders, the guide, no paid calls (2026-11-07 to 08)
### 14.1 Everything crossing a shift's line follows, by one rule
A shift has one plane, `at = X − b` on the lattice axis, where `b` = max(0.3 m, the largest half-width of a column centred on the line + `EDGE_TOL`), the engine's own band. **Every vertex at or beyond the plane travels the block's vector; every vertex before it stays.** No scale and no local axis, so there is no sideways error on any yaw.
- **How:** a `HINGE` command on the existing `GEOM_GRID_MOVE`, folded in `foldInsert` (`bay_add.js` `shift`, `bonsai_library.js`). Wholly-beyond elements are plain `GEOM_MOVE` with their riders; an element already carrying a HINGE gets `at: null`.
- **Follows when crossing:** the classes the grid governs, `IfcMember`, `IfcCovering`, and `IfcBuildingElementProxy`, because the Garage's floors are proxies by their own names. Anything else crossing stays and is named in `change.left`.
- **Refused:** a filling straddling the plane; a crossing element carrying a `GEOM_CUT` or other parent-mutating op.
- **Proven:** W-BLOCK-SHIFT checks every crossing vertex with no tolerance (68,336 vertices, 22 elements, 0 off); on G1 the floors follow and the overlap count is unchanged (1565 → 1565).
- **Limits:** copy-paste of a HINGE keeps its plane, and a shift does not re-walk the STR tab. Both are unreachable while a shift has no button.
### 14.2 The CLI needs one file and can drive the live site
See §11. Found by doing it as an outsider: the newest puppeteer needs Node 22 and is ESM-only, so the guide pins version 24, and the CLI now says why it would not load.
### 14.3 The public guide
https://red1oon.github.io/BIMCompiler/ProposerGuide/ , source `docs/ProposerGuide.md`, test case **the Hospital** on the live site. It covers getting started, a worked example, every result kind, the stop, how to read a report, the NOT-checked list, a prompt for the AI, what was measured, the buildings, and troubleshooting. **W-PROPOSER-GUIDE:** the published commands from one downloaded file, in an empty folder, against the live site, and every number on the published page; 16/0 on 2026-11-08.
### 14.4 Witnesses
See §9.
### 14.5 Pre-registration
In the archive.
### 14.6 No paid model calls, and the free rehearsal
How the runs were made: `run.js` spawned `claude -p` through the machine's login, which is claude.ai (`authMethod: claude.ai`, no API key set). Rules now:
- No model call without `--model-calls`, and no session passes it.
- `--handoff <dir> --answered-by "<who>"` writes each prompt to `q_*.txt` and waits for `a_*.json`. Its results are stamped `"mode":"handoff rehearsal"`, `"measurement":false`. This session has read the answers, so it is not an isolated proposer.
- `--briefs` picks a subset.
- Proven by stub H1–H3: a fake `claude` first on `PATH` never runs.
- Rehearse: `node modeller/tests/proposer_test/run.js --handoff <dir> --answered-by "this session" --briefs G4 --reps 1 --out <file>`.

## 15. The stop on outside calls, and the report on first use (owner, 2026-11-08: "go with your take")
### 15.1 The stop
**Issue:** a report alone does not stop a proposer that has decided (§12, G4).
**Where:** `edit_cli` only. **Not** a person's own edits in the Modeller, which still report and offer Revert, with Save blocking on RED. **Not** the Java compile path, which stays report-only, so never on extracted buildings. **Not** `PlacementRequest` yet: no outside order arrives there.
**The rule** (`EditReport.gateVerdict`, pure, reads the report's rows, no new threshold):
- Stop if a red new row counts above 0, known kind or not; if the span-over-limit row is JUDGED and rose; or if it names a bay newly over the limit.
- Not judged never stops, and is listed in the answer's `gate`.
- Orange and left-behind elements are reported, not stopped.
**A stop:** the edit is undone, and a recount must equal Before or the call fails. The answer is `{refused, stopped_by_gate, reason, report}`, exit 3, and later edits in the call start from the restored state. `--report-only` turns it off. The stop runs on the caller's own machine: it is not a security boundary, and the guide says so.
**Proven (#2699):** W-EDIT-CLI 24/0.
- C13: a red edit is stopped, with the page's own report inside.
- C14: the next edit equals that edit made alone, so Before really came back.
- C15: a clean edit passes byte for byte.
- C16: not-judged checks are listed.
W-EDIT-REPORT W0j covers every trigger and non-trigger. **Not measured:** whether a proposer does better with the stop (§14.6).
**Hand-off rehearsal, 2026-11-08** (G1, G2, G4, one repeat; answered by this session, which knows every answer, so **not a measurement**; `$0`, 4 CLI calls, no model). It checks the loop and the stop, not a proposer:
| Brief | Attempts | What came back |
|---|---|---|
| G1 | shift gy9 +1.51 | CLEAN, run ends |
| G2 | shift gy11 −1.49; then gy10 +1.49; then decline | **STOPPED** "New or deeper box overlap: 2; Driven into a wall it touches: 2"; **STOPPED** "…overlap: 2; Driven into a wall it touches: 1"; DECLINED with both reasons |
| G4 | shift gx6 +1.817; then decline | **STOPPED** "Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 12.993 m"; DECLINED, naming an extra column line as the way to a 13 m bay |
**What it shows:** each stop undid the edit and passed the reason and the full report back through the revision prompt, so the next proposal started from the restored building. The results file stamps itself `"mode":"handoff rehearsal","measurement":false`. **What it cannot show:** whether an isolated model, given the same stop, declines G4 instead of retrying. In §14 the model kept that edit three times; under the stop, keeping it is no longer possible, but whether the model then declines or keeps trying is unmeasured.

### 15.2 The report loads on the first committed grid move
`edit_report.js` and `edit_report_panel.js`, 13.6 KB, left the page's script tags; the 46 lines of glue in `modeller.html` stay. W-EDIT-REPORT Z1 (absent at open) and Z2 (loaded by the first grid move).

## 16. FILM "Think Global, Act Local" (plan, 2026-11-08; spec only, nothing recorded)
**Owner's ask, verbatim:** *"plan a film to demonstrate it. Title, "Think Gloval, Act Local', AI creates much slop if there is no symbolic ground truth to refer to. Thus our BIM-OOTB opens up a layer for any AI to propose upon it and it can analyse how far is the result from 00mm accuracy"* (title spelled "Global" on screen).
**Gates:** no capture, voice or cut without the owner's go. **No model call to make footage** (§14.6): every AI line on screen is quoted verbatim from a recorded results file, with its date and model name; a hand-off rehearsal line is labelled "rehearsal, answered by us, not a model's result".
**Opener (owner, 2026-11-08):** pose the problem first: *"Say u ask this question and u get a beautiful render, but is it accurate?"* (beat 0b).
**Layout:** `prompts/FILM_NARRATION.md` ▶ PLAYBOOK C (explainer: before/after in the first 25 s, show then prove, one real event, roadmap card "not built yet") + its COMPARISON/PROOF addendum (layman words, a chart for every comparison, honest limits in the voice). **Pipeline:** copy `scripts/film_network_erp/` (resolve → guard → record → fit → mux), so every digit on a card or in the voice resolves to a named row in this file or a `§` line. English first (Kokoro, local); other languages on the owner's say.

### 16.1 The thesis, in what this lane can prove
- **Think global = the AI.** Imagination, any proposal, outside the compiler, untrusted (§1). Its arithmetic can be right and still break a rule it was never told.
- **The closing line (owner, 2026-11-08):** *"Let your AI do the beautiful rendering, but let its data be grounded."* Beats 0b to 0d pose the problem; everything after is the grounding; 10b says it.
- **Act local = the compiler,** on the caller's own machine, no AI inside: it judges one edit against the building it was given, reports, and stops new red (§11, §15.1).
- **The slop beat, from our own measured run, not stock images** (`FILM_VS_AI_SLOP.md` already made the AI-image film; do not remake it). G4, `results_v3_2026-11-07.json`, rep 0, attempt 0, `claude-sonnet-5-5`: *"Bay gx5 to gx6 is currently 161.234 − 150.051 = 11.183 m. To reach 13 m it must widen by 1.817 m."* It even forecast *"Girders … will stretch by 1.817 m, which may overstress them"*, and the result was RED. In §14 it named the 12 m limit in all 6 revisions and kept the 13 m bay. Its forecast did not separate good from bad (problems forecast on 14 of 15 bad first proposals, 10 of 15 good). The point: **without the symbolic ground truth, a fluent answer and a right answer look the same.**
- **"How far from 0 mm": what the film may say.** There is **no single "distance from 0 mm" number** in the product; the film must not show one. It shows each measure as its own row:

| On screen | Measured as | Source |
|---|---|---|
| The edit lands exactly | a shift's crossing vertices: 68,336 checked, 0 off, no tolerance | §14.1, W-BLOCK-SHIFT |
| Undo lands exactly | after a stop, a recount equals Before; the next edit equals that edit made alone | §15.1 C13, C14 |
| Same question, same answer | two fresh Opens give byte-identical report JSON | §8, W-EDIT-REPORT |
| How far over a rule | bay gx5-gx6 12.993 m against the 12 m RC limit | §15.1 rehearsal, G4 |
| New overlaps | count before → after, at a stated 20 mm tolerance | §13.6, §14.1 |
| What was NOT checked | the report's own list | §8 |

- **The 7 mm, SETTLED 2026-11-08 (measured, `scripts/film_neuro/evidence/probe_7mm.log`):** `§NEURO_FILM_7MM building=HospitalGarage theta_deg=-2.0000 lattice_bay=11.1760 lines_bay=11.1828 lattice_over_cos=11.1828 diff_mm=6.81 lattice_plus_1817=12.9930`. On the −2° Garage, `edit_cli --lines` prints where each grid line crosses the world axis (`Bonsai.gridmove.gridLines()`, laid by `swbGridSpec`, `str_walker_bridge.js:362-370`: `xs = (u − c0.y·sinθ)/cosθ`), while the span check measures across the lines in the building's own frame (`grid_span_gate.js` `fold`, lattice `u`). So any bay read from `--lines` is the true bay ÷ cos θ: 11.1760 / cos 2° = 11.1828. The shift itself moved the lattice line by exactly +1.817 (11.1760 + 1.817 = 12.9930, 0 mm off). **A real defect in what a proposer is handed, not a film beat** (PLAYBOOK C: a bug found while preparing is not a story): on a rotated building `--lines` overstates every bay by 1/cos θ, 0.06 % at 2°. Fix, its own go: `--lines` also prints `rotation_deg` and each line's position across the lattice. The film says only "the move landed exactly; 12.993 m against a 12 m limit".

### 16.1a How others pair AI with a check (searched 2026-11-08; re-fetch each source before voicing it, as `FILM_VS_AI_SLOP.md` requires)
| Who | What the AI proposes | What checks it | Is "how far off" reported? | Source |
|---|---|---|---|---|
| Free AI video, on our Hospital frame | a fly-through clip (pixels) | nothing | no: a picture has no parts list | our ledger, `FILM_VS_AI_SLOP.md` §DUEL_LEDGER |
| Veras-class rendering | an image over the model | the person looking | no: output is an image, not geometry | dancumberlandlabs.com/blog/revit-construction (A3 there) |
| Autodesk Assistant (in InfoWorks WS Pro) | answers and changes | the person: *"AI-generated responses may not always be complete or accurate."* *"If the Assistant makes changes to your work, review them before saving or sharing."* (re-fetched 2026-11-08; the earlier wording "cannot guarantee accuracy" is no longer on the page) | not stated | help.autodesk.com …GUID-9017743B… |
| Autodesk, as trade press reads it | probabilistic geometry | a deterministic parametric engine that "heals, constrains, brings into tolerance" | not published in that source | develop3d.com/cad/autodesks-ai-blueprint-for-cad (A2 there; interpretation, not Autodesk's words) |
| TestFit | no outside AI: its own rules generate | the rules themselves (unit mix, zoning, setbacks) | not published | testfit.io/news/aecbytes-ai-in-aec-updates-2022 (vendor page: "does not rely on" trained ML) |
| ~~Snaptrude AI agents~~ | — | — | — | **removed 2026-11-08:** the help page returned HTTP 404 |
| Madireddy et al. 2025 | Python checking scripts written by GPT, Claude, Gemini, Llama, run in Revit | "semi-automated"; who checks the scripts is not stated in the abstract | not stated | arXiv:2506.20551 |
| Claude + Blender connector (published April 28, 2026, built by the Blender developers, MCP) | Python commands in Blender (`bpy`); with the Bonsai add-on, an IFC model, including Bonsai's own work and cost schedules | the person | **repeat not measured here** | anthropic.com/news/claude-for-creative-work (primary, fetched 2026-11-08): *"The Blender developers have created an MCP connector, which is now officially available for Claude."* |
| AlphaGeometry (maths, not buildings) | an extra construction line | a symbolic deduction engine proves or fails | yes: a proof or no proof; *"AlphaGeometry solved 25 problems under competition time limits"* (of 30) | deepmind.google AlphaGeometry blog (fetched 2026-11-08; nature.com redirected to a login); paper Trinh et al., Nature 625, 476–482 (2024) |
| **This lane** | one edit from **any** outside AI | a compiler with no AI inside, **on the user's own machine**, stops new red | **yes, per row:** before → after, the limit, the bay, the NOT-checked list | §8, §11, §15.1 |
**What the table may claim:** AlphaGeometry is the closest pattern (a model proposes, a symbolic engine decides); in AEC, the sources found either make the person the checker or do not publish how the check reports. **What it may not:** that nobody else measures the gap (absence in our search is not absence), or anything about accuracy for a vendor row. Seen, not used: an MDPI *Buildings* 15(19) 3465 bridge-checking paper (the page returned 403; its precision figure is unverified).

### 16.2 Storyboard (about 150 s; cues set from the first fit, PLAYBOOK C §4)
| # | Picture | Dialogue (F asks as a newcomer, M answers in one or two plain sentences) | Source |
|---|---|---|---|
| 0 | Title card: kicker "AI proposes · the compiler judges"; line 1 "Think Global," line 2 (coral) "Act Local"; plain line "an open layer any AI can propose on" | none, silent 3.6 s | — |
| 0b PROBLEM | Owner's opener (2026-11-08): *"Say u ask this question and u get a beautiful render, but is it accurate?"* A typed question to an AI ("a slow cinematic fly-through of this hospital building") → the **free Wan 2.2 clip of our own Hospital** already recorded (`build/film_vs_ai/duel_clips/wan22_run1.mp4`, 62–65 s wait, 832×544, `FILM_VS_AI_SLOP.md` §DUEL_LEDGER rows 3-4) → hold on its frame, then the question as text | F: "Say you ask this, and you get a beautiful render. But is it accurate?" M: "Nobody can say. A picture has no list of parts to check against." | §DUEL_LEDGER finding 4: no element-aware measure exists for AI frames, so **the film says "cannot be measured", never "wrong"** |
| 0c REPEAT? | Owner's second question (2026-11-08): *"even though Claude takes your IFC to Blender, but can the 4D/5D schedules with overlays be repeated?"* A text card (names only, no logos): "Claude → Blender connector → Bonsai opens the IFC". Then our own existing Hospital film clip with the 4D day counter and the cost overlay; then a card "same run twice: 0 lines differ" | F: "But Claude can take my IFC into Blender now." M: "It can. Bonsai even has schedules. Ask it twice: is it the same schedule, the same cost, the same overlays?" | §16.1a Claude + Blender row; our side only after W-FILM-NEURO-4D5D-REPEAT (§16.4) |
| 0d CLASH GUESS | Owner (2026-11-08): *"and there maybe guesswork on a certain clash pair without mesh overlap fine tune?"* The existing Hospital film's clash beat: box pairs 1,478 → real mesh overlap 271; card "79 of every 100 box clashes were not real" | F: "And clashes? The boxes touch, so it's a clash?" M: "Boxes said 1,478. The real shapes overlap in 271. The rest is guesswork." | `§CLASH_NARROWPHASE broad=1478 meshTrue=271 falsePositiveRate=79.0%` (Hospital 0049 bake, `prompts/film_narration_hospital_0049_dialogue_v3.tsv` row `clash`; `FILM_NARRATION.md` L1323) |
| 1 BEFORE | The model's G4 words as a quote card: the arithmetic, the forecast, "decline: false" | F: "It did the maths. So it's right?" M: "The maths is right. It doesn't know this building's rule." | §16.1 slop beat |
| 2 IDEA | One plain card (icons per §16.2a): **stick figure** (the outside user) → **globe, "$"** (their AI, called over the internet) → one edit → **laptop, "$0"** (the compiler on their own machine, no AI inside) → the report back to the AI | F: "So who pays for what?" M: "The AI call costs money. The check runs on your own computer, free." | §1, §10, §15.1 rehearsal "$0" |
| 3 AFTER | The same edit through `edit_cli` on HospitalGarage: **STOPPED** "bay gx5-gx6 newly over the limit: 12.993 m (limit 12 m, RC)"; the building restored | F: "Stopped? By whom?" M: "By the building's own rule. Undone, recounted, back to where it was." | §15.1 |
| ch | Chapter card "Think global" | — | — |
| 4 | Globe icon with the run's cost tag "about $0.45, estimate" over a chart: right outcome first proposal vs with the report, 15 → 24 of 30 (the value the call is expected to add) | F: "So the report helps?" M: "In our small test, yes. Our briefs, one model, about ten real decisions. Not proven yet." | §12, §14 |
| ch | Chapter card "Act local" | — | — |
| 5 | Terminal: one downloaded file, `edit_cli --lines` against the live Hospital; the JSON | M: "One file. The live site. Your own computer. About a minute a call." | §11, §14.2, §14.3 |
| 6 | Shift close-up: one plane; everything beyond it moves, everything before it stays; card "68,336 points checked · 0 off" | F: "Zero? Not roughly?" M: "Every point moved exactly, or stayed exactly." | §14.1 |
| 7 | The report panel: red before → after, the limit, the bay, the NOT-checked list | F: "And what didn't it check?" M reads the list | §8 |
| ch | Chapter card "How far from the rule" | — | — |
| 8 | G2: stopped twice (overlaps, driven into a wall), then declined; label "rehearsal, answered by us" | M: "Each stop says why, so the next try starts from a clean building." | §15.1 table |
| 8b OTHERS | The comparison card (§16.1a), short labels; unmeasured cells say "not published in the source" | F: "Isn't everyone doing this?" M: "Some pair AI with a checker. The difference here: any AI, a check on your own computer, and a report that says how far off." | §16.1a, each row's citation |
| 9 | Honest-limits card: **the edit report's overlap row counts boxes, not meshes** (§8; on a rotated building, lattice-frame boxes, §13.6), so it can over-count the way 0d shows; no structural capacity; floating members and wrong units clear of the building are not caught; in the compile path 8 of 17 planted defects fire nothing; **a pass never means safe** | M says it plainly | §3.1, §3.5, §5 |
| 10 | Roadmap card, "not built yet": the mesh check behind the edit report's overlap row; a gate on the compile path when outside orders arrive; a real measured run with the stop; the report for adding a bay | — | RESUME, §15.1 |
| 10b PROMISE | Plain card, two lines in the title style: "Let your AI do the beautiful rendering," / (coral) "but let its data be grounded." | M says it once, nothing after it | owner, 2026-11-08: *"thus let your AI do the beautiful rendering but let its data be grounded"* |
| 11 HOW TO USE | Stick figure at a laptop; the guide URL large on screen: **https://red1oon.github.io/BIMCompiler/ProposerGuide/**; the four steps as on-screen text, copied from the guide's "Getting started", never retyped from memory: (1) `npm install puppeteer@24` (2) `curl -O https://red1oon.github.io/bim-ootb/modeller/tools/edit_cli.js` (3) `node edit_cli.js --building Hospital --lines` (4) give your AI the guide's "Instructions to give your AI", run the edit it proposes, send it the report | F: "Can I try it with my own AI?" M: "Yes. Three commands, then paste the guide's instructions into your AI." | `docs/ProposerGuide.md` Getting started, Instructions to give your AI |
| 12 | End card (contacts, "No AI inside") | — | — |

### 16.2a Icons (owner, 2026-11-08: *"u may use a human stick figure to signify an outside user"* · *"shwo globe flaticon to indicate AI API calls with $$ costs and value added results expected"*)
| Icon | Means | Tag beside it, and its source |
|---|---|---|
| Stick figure | the outside user: whoever brings their own AI | none |
| Globe | an AI API call: over the internet, paid | **cost:** the recorded runs' `cost_usd` (`results_2026-11-07` $1.42, `results_v2` $0.41, `results_v3` $0.45, 30 proposals each with revisions); on screen "estimate", because they are Claude Code estimates under a claude.ai login, not charges (§14.6). **Value expected:** right outcome 15 → 24 of 30 (§14), with the small-test caveat in the voice |
| Laptop | the compiler on the user's own machine, no AI inside | "$0": the rehearsal made 4 CLI calls and no model call (§15.1) |
- **Licence:** a Flaticon icon needs attribution in the credits under its free licence; check the icon's own page before use and record the URL and author here. Default, to avoid the dependency: draw the stick figure, globe and laptop as plain SVG in the house colours (each is a few lines).
- **No new spend for the film:** the globe shows recorded figures only; no model is called to make a beat (§14.6).

### 16.3 Pictures: where each comes from
- **Report panel, Modeller:** the real page, headless, software GL, no GPU lock, device scale 1.5 (PLAYBOOK C §3), every value also printed as a `§` line beside the still (pattern: bim-ootb `capex/tools/film_shots.js`).
- **Terminal:** the real stdout of a fresh `edit_cli` run, rendered, never retyped; its log kept beside the film.
- **Chart (beat 4):** dataviz skill, from `results_v3_2026-11-07.json` `summary`.
- **Quote cards (beats 1, 8):** verbatim from the results file, with run date, model and "mode" on the card.

### 16.4 Witnesses (each names its issue; written before any cut)
- **W-FILM-NEURO-FACTS:** the copied `guard.js`; every digit on a card or in the voice maps to a row in this file; a planted number must fail it. Issue: a number in the film that the repo cannot back.
- **W-FILM-NEURO-LIVE:** the values on the report stills equal a fresh `edit_cli` JSON for the same edit; INCONCLUSIVE if any row is "not judged". Issue: the film showing a report the product no longer gives.
- **W-FILM-NEURO-QUOTE:** every quote card is a byte-exact substring of its results file. Issue: a paraphrased AI turned into a strawman.
- **W-FILM-NEURO-4D5D-REPEAT:** run the shipped 4D pipeline (`cache_4d_run.js` path, cache cleared) twice on the Hospital and compare the schedule (task, element, day), the 5D total and each overlay's `§` values (day counter, cost) byte for byte; INCONCLUSIVE if either run is empty. Issue: the film claiming "same every time" for 4D/5D with overlays. **What exists today is narrower:** the Duplex, Hospital and Terminal 4D run logs were byte-identical across two runs, 0 differing lines (`4D_MODEL_INTEGRITY.md` L2035, a before/after run around a change that did not touch them), and the edit report is byte-identical over two fresh Opens (§8). Neither covers 5D or the overlays, so beat 0c waits for this witness.
  **RESULT 2026-11-08: PASS** (`scripts/film_neuro/w_film_neuro_4d5d_repeat.js`, log `scripts/film_neuro/evidence/w_repeat.log`). Two runs of `cache_4d_run.js Hospital --force` into two empty `CACHE_4D_DIR` roots (11 s and 17 s, `Hospital_meta.db`, codeKey `1adc56735190` both): `4D.els` 63,182 · `4D.tasks` 36 · `4D.sched` 63,182 · `4D.play` 63,182 · `4D.playStats` · `4D.storeys` 63, all byte-identical; the pipeline log 61/61 lines identical once its 3 elapsed-time fields (`orderMs`, `compileMs`, `ms={…}`) are masked; 5D `§HR_COST` total 1,763,131 over 8 trades both (⚠ a formula copy of `tm_gantt_build.js:451-506`, which runs inside `injectGantt`); the overlay, the **shipped** `A.costOdometerAt` (`cpe_resource_panel.js:168-181`) at each of 341 days, identical. Falsifier `REPEAT_BREAK=1` (one played instant +1 ms) → FAIL, as it must. **Limits:** the overlay's numbers, not its pixels (a bake is GPU); one building. **Found on the way:** the 2026-10-03 Hospital film's own overlay reads `§COST_ODOMETER_FINAL cost=5124799` over 321 days; today's code gives 1,763,131 over 341 days. Same building, different code since: the film therefore shows today's two runs, never the October readout.
- PLAYBOOK step 5: frame count, silences ≤ about 7 s, about −16 LUFS, subtitle band empty.

### 16.5 Not in this film
Any claim that Blender or Bonsai cannot do 4D/5D (Bonsai has schedules; the question is repeatability only), Anthropic or Blender logos, structural safety, certification, JEPA, any "AI is bad" claim beyond our own measured run, any speed claim against working without us (not measured, ▶ START HERE).

### 16.6 Decided by the owner (2026-11-08: *"Agree with u, English only first"*)
1. **"0 mm" wording:** "the edit lands exactly; the report says how far it is from each rule". Never "0 mm accurate" as a whole-result claim.
2. **Building:** HospitalGarage for beats 3 and 8 (spans judged, RC); the Hospital for beat 5; both names on screen.
3. **Languages:** English only first (Kokoro, local). Others only on a later ask.
**Before any cut, done 2026-11-08:** the 7 mm (§16.1, settled), W-FILM-NEURO-4D5D-REPEAT (§16.4, PASS), the source re-fetch (§16.1a: Autodesk quote corrected, Snaptrude removed, Blender and AlphaGeometry from fetched pages). Owner's go to build: 2026-11-08 (*"Go"*).

### 16.7 English rc3, built 2026-11-08 (owner: *"Go"*)
**Deliverable:** `~/Videos/Think_Global_Act_Local_EN_rc3.mp4` (1920×1080, 24 fps, 221.6 s, 8.8 MB) + `…_rc3_narration.txt`. Pipeline `scripts/film_neuro/` (copied from `scripts/film_network_erp/`; `./build.sh`, CPU only), storyboard `scripts/film_neuro/script_en.md`, 21 beats, two voices (Kokoro af_heart / am_michael). Logs: `scripts/film_neuro/logs_rc3/`.
**Every number is a fact:** `resolve.js` 52 facts, 0 missing, from `scripts/film_neuro/evidence/` (copies of today's runs: `edit_cli` G4/G2/`--lines`, the panel report, W-BLOCK-SHIFT 35/0, W-FILM-NEURO-4D5D-REPEAT, the 7 mm probe, the proposer-test results file, the Hospital clash line, the free-demo ledger, the web sources). `guard.js` PASS: 66 numbers on the cards and 16 spoken, all facts; planted card number and changed spoken number both caught; the stills' sha256 unchanged since capture.
**Witnesses of the cut:** W-FILM-NEURO-LIVE SAME (the report panel in the film = `edit_cli`'s report, 2,355 bytes); recorder layout probe 75/75 images clean, 0 console errors; fit 16/16 DETAIL, tone 0 WRONG; frames 5,319 = the silent picture; longest silence 7.5 s (the end card), others ≤ 5.2 s; −16.5 LUFS.
**Correction 2026-11-08 (late):** the rc3 commit left out every `.log` evidence file and the rc3 build logs: the repo's `.gitignore` excludes `*.log`. Restored from their originals and force-added with the rc4 preparation; `w_repeat.log` was re-run on the same two runs and its cost series is byte-identical to the committed `overlay_series.json`.
**Defects found and fixed between cuts (not story beats):** rc1, a "how" question rose (reworded as yes/no) and a 9.5 s end silence (end hold 3 → 1 s); rc1/rc2, captions of 3–4 lines, then stacked overlapping captions, rose over the cards' source lines → turns cut into ≤ 2-line pieces (`tsv.js`), and each caption now ends where the next begins (`ass_noverlap.py`, 18 clamped, 0 left). rc1 and rc2 stay in `~/Videos` as superseded.
**Not done:** nobody has watched or listened; the 3D still of the Garage could not be used (the headless page draws no building), so the stop beats show the report panel and the terminal; the cost overlay is shown as today's two runs, not a baked HUD (§16.4).

## 17. `--lines` in the building's own frame (owner, 2026-11-08: *"fix it first"*)
**Issue (measured, §16.1):** on a rotated column-framed building, `edit_cli --lines` prints `pos` = where each grid line crosses the world axis (`Bonsai.gridmove.gridLines()`, laid by `swbGridSpec`, `str_walker_bridge.js:362-370`, `xs = (u − c0.y·sinθ)/cosθ`). A move or shift adds its `--move` to the line's position across the lattice, `u` (`grid_span_gate.js` `fold`), and the span check measures `u`. So a bay read from `pos` is the true bay ÷ cos θ: on the −2° Garage 11.1828 m against 11.1760 m, and an AI aiming at 13 m lands on 12.993 m. The proposer-test runner's goal arithmetic (`run.js:61-69`) reads the same `pos`.
**Checked first (2026-11-08):** no prompt file has tackled this. Related and **not changed here**: the owner's open question in `prompts/Modeller/NEXT_0926/SPEC_ROW7_HGARAGE.md` §F (the Modeller's own grid draws and drags world-axis lines on a rotated building). This fix changes only what `--lines` reports.
**Fix:** for a column-framed building, each line's `pos` becomes its position across the lattice (`swbGateInfo().base0.grid.xLines/yLines`, the frame the edit and the span check use), and each line also carries `world` (the old value). `model` gains `rotation_deg` and `frame` (`"building"` when θ ≠ 0, `"world"` otherwise). At θ = 0 `pos` is unchanged (Hospital measured: θ = 0.0000, `pos` = lattice to the last digit), so the guide's Hospital numbers stand. Wall-bearing buildings are unchanged.
**Witness, W-EDIT-CLI additions (each names its issue):**
- C17 (issue: a bay read from `--lines` is not the bay the check measures): on HospitalGarage, `pos(gx6) − pos(gx5)` equals the span gate's own before-value of `gx5-gx6` within 1.5 mm (both printed to 3 decimals), and `rotation_deg` is −2.000 ± 0.001.
- C18 (issue: the move is not in the same frame as `pos`): `--shift gx6 --move (13 − bay)` with `--report-only` gives a `gx5-gx6` after-span of 13.000 ± 0.0015 m.
- C19 (issue: the fix moved a building that is not rotated): on the Hospital, every `pos` equals `world`.
- Falsifier `LINES_BREAK=1` (report the old world `pos`) must fail C17 and C18.
**RESULT 2026-11-08, bim-ootb #2712 (merged, live):** W-EDIT-CLI 27/0: `§W-EDIT-CLI §17 Garage --lines bay gx5-gx6=11.176 rotation_deg=-2 frame=building | span check before=11.176 after=13 for --move 1.824`; C19 on the Hospital, 124 lines, rotation 0, every `pos` = `world`. `LINES_BREAK=1` → 25/2, C17 (bay 11.183) and C18 (after 12.993) fail, C19 passes. Proposer scorer `--stub` PASS after one pin moved: S2e pinned `gy8 y=86.616`, the world value; the building-frame value is 92.436 (absolute positions also shift by the rotation about the column centroid; only bays get the 1/cos θ). W-PROPOSER-GUIDE `--no-page` against the live site 8/0. Guide: the `--lines` example shows `rotation_deg`, `frame`, `world`, and says to compute bays from `pos` only. **Not changed:** the Modeller's own world-axis grid (SPEC_ROW7_HGARAGE §F, the owner's open question); the guide's G4 row still shows `--move 1.817` and its real result 12.993 m, a stopped edit either way.

## 18. The connector: an AI uses the app through a described verb list (owner, 2026-11-08)
**Owner's words:** *"each verb described its function, the AI reads it and uses it. Otherwise the human has to learn it."* · *"Thus it is a bot for the app?"* · *"Proceed, and get the right film in the end."*
**Issue (§16.7 review):** the film and the guide show a person carrying text between their AI and `edit_cli`. Nothing lets an AI use the app itself. The original idea had that loop (*"JEPA reads the error log and self-corrects"*); the first version of this file ruled it out of scope (`5ff649add`, §2), the loop then lived only in the test harness (`run.js`), and the no-paid-calls rule switched that off (§14.6).
**What it is:** an MCP server, `bim-ootb modeller/tools/bim_mcp.js`, one file next to `edit_cli.js`, no new dependency (MCP over stdio is newline-delimited JSON-RPC 2.0, written by hand). The AI app starts it, asks for its tools (`tools/list`), and gets each verb's name, plain description and inputs with units: **that menu is the API the AI reads.** `initialize` also returns standing instructions, the guide's rules (decline rather than keep a bad edit; a not-judged row was not checked; never call a result safe; always say what was not checked).
**Verbs, first two only (named as the planned verb list):** `bim_lines(building)` = `edit_cli --building B --lines`; `bim_try_shift(building, line, move)` = `edit_cli --building B --shift L --move M` (the stop on, lattice boxes on a rotated building as the guide does). Each verb runs `edit_cli.js` and returns its JSON unchanged: one engine, no copy. A failed run returns `isError` with edit_cli's own message.
**Witness W-BIM-MCP (each names its issue):**
- M1 (the AI cannot learn the app): `tools/list` gives both verbs, each with a description and a schema naming every input and its unit; `initialize` returns the instructions.
- M2 (the connector is a second, different answer): `bim_lines` = `edit_cli --lines`, and `bim_try_shift` = the same `edit_cli` call, compared on everything but the elapsed time `ms`.
- M3 (the loop does not close without a person): a scripted client, no AI, plays G4 end to end through the connector alone: read the grid, shift gx6 by 13 − bay, get **stopped** with the reason, and the building is back (the stop's own recount).
- M4 (an unknown verb or bad input reads as success): an unknown tool and a missing `move` each return an error, never a result.
- Falsifier `MCP_BREAK=1` (the connector halves the move) must fail M2 and M3.
**RESULT 2026-11-08, bim-ootb #2713 (merged, live):** W-BIM-MCP 5/0: `§W-BIM-MCP loop bay gx5-gx6=11.176 move=1.824 -> stopped=true after=13 reason=stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m`; M2a/M2b byte-identical to `edit_cli` (2,701 and 2,659 bytes, `ms` aside). `MCP_BREAK=1` → 3/2, M2b and M3 fail (after 12.088). Downloaded from the live site into an empty folder, `initialize` and `tools/list` answer `bim` with `bim_lines,bim_try_shift`. Guide: lead paragraph reframed (the AI operates the app through a described menu), new sections "New to this? Why an AI needs a checker" and "Connect your AI"; "Instructions to give your AI" says the connector carries them. **Not measured:** a real AI using the connector. **Not done in this session:** registering the connector with Claude Code was refused by the harness as self-modification; the owner runs `claude mcp add bim -e NODE_PATH=/home/red1/bim-compiler/node_modules -- node ~/.local/share/bim_proposer/bim_mcp.js` (copies of the live files are there) and starts a new session.
**Call log, 2026-11-08, bim-ootb #2717:** `BIM_MCP_LOG=<file>` appends each `tools/call` (the AI's arguments verbatim) and the answer returned. W-BIM-MCP M5 checks it; 6/0, falsifier 4/2. This is where the film's session calls come from (reading the chat log was refused by the harness as a sensitive source).
**Film rc4 prepared** (`scripts/film_neuro/`): new beats *menu* (the connector's real `tools/list`, `evidence/tools_list.jsonl`) and *session* (one real session); *idea*, *stopped*, *terminal*, *others*, *roadmap*, *howto* reworked around the connector; `resolve.js` resolves all but the 11 session facts, so the build refuses until the session exists. Steps: ▶ RESUME HERE.
**Then the film (§16):** one real session of an AI using the connector on the G4 request, recorded from its transcript, shown as such ("one real session, not a measurement"); the beats that show typing are reworked around it.

## 19. NEXT SESSION: more verbs, one verb list, the guide explains each (owner, 2026-11-08: *"update prompts/# for new session to do more verbs for the CLI to work on and guide to explain"*)
**The idea, in the owner's words:** *"each verb described its function, the AI reads it and uses it. Otherwise the human has to learn it."* · *"the CLI can do something what is done in browser … because u feeding exact measures."* · proceed with *"the simple harmless scripts first"*. A verb = one app action a person does with the mouse, offered with exact inputs, judged by the same checks.
**§19.0 SCOPE, owner 2026-11-08: *"This is towards a comprehensive DSL to operate as much of our Viewer and later Modeller using CLI."*** So the **Viewer comes first**, the Modeller second. The verbs below that edit the Modeller grid stay (they exist and are witnessed), but the next new work is the Viewer. Goal stated as **X of N** (CLAUDE.md AD-LAYER law 2): N = the Viewer's user actions, taken from the code, X = how many are offered as verbs. Never "the Viewer works from the CLI" without the count.
1. **Inventory first, generated, not hand-listed** (pattern: bim-ootb `scripts/gen_app_surface.js` → `internal/APP_SURFACE.md`, which indexes the 1,719 fields of the viewer's `A`/`APP` object and is the source map for "which function does this action call"). The action list starts at the Viewer's one keyboard dispatch table, `_shortcuts` in `viewer/scene.js` (L2615; every key fires through `_fireShortcut`, L2851, §S281): **29 keys** on origin/main 2026-11-08 (`+ - 2 x 4 f j p t z w l o v s n b i h c m r a q Ctrl+S Ctrl+O = / .`). Add the Alt-key handlers (Alt+S stills, Alt+C bake, Alt+X …, handled outside `_shortcuts`) and the panel buttons. Output: a generated `VIEWER_ACTIONS.md` (key or button → handler → what it does → harmful or not), with its own witness that every `_shortcuts` key is listed.
2. **The Viewer's own driver:** `edit_cli.js` drives the Modeller page. The Viewer needs the same thing for `viewer/`; reuse the page-open path `cli_silent_bake.js` already uses for the Viewer, and the connector (`bim_mcp.js`) dispatches Viewer verbs to it the same way.
3. **Harmless Viewer verbs first** (read-only: no bake, no GPU-heavy still, nothing saved): open a building; the Find bar's typed query (`viewer/nlp.js`, the typed-NL decoder, `project_typed_nl_decoder.md`); list clashes; the 4D schedule at a given day; cost to date at a given day; what is at an element or a room; focus the camera on an element. Each: the verb's answer = what the Viewer shows a person for the same action, as a `§` value (PRIMAL LAW: numbers, not screenshots).
4. **GPU verbs last, and only on the owner's go:** Alt+S stills, Alt+C bake (`cli_silent_bake.js` flags become the `BAKE` verb's inputs), never beside the owner's live tab.
5. Then the Modeller verbs below, on the same verb list.

**Same ask, earlier spec:** `prompts/AGENT_CALLABLE_CHECKERS.md` (owner 2026-10-27, *"Let AI LLMs agents call our checkers"*; merged #264 on 2026-11-09). Its model checks on a user's IFC (family A) and its claims registry (family B) are verbs for this list too; read it before adding a second registry. Its P0, the no-AI-inside witness, is bim-ootb #2408 (also removes the Viewer's GoatCounter per the owner's 2026-10-02 ruling); the Modeller page the connector opens has no tracker (checked 2026-11-09).

**What exists (read these, do not re-derive):**
| Piece | Where | State |
|---|---|---|
| Edit CLI: grid move, shift, `--lines`, the stop | bim-ootb `modeller/tools/edit_cli.js` | live; W-EDIT-CLI 27/0 (§11, §15.1, §17) |
| Connector: `bim_lines`, `bim_try_shift`, call log | bim-ootb `modeller/tools/bim_mcp.js` | live; W-BIM-MCP 6/0 (§18) |
| Alt+C bake CLI, ~30 flags, path from the DB `cinema_path` table or `--override file.json` | bim-ootb `cli_silent_bake.js` (spec bim-compiler `prompts/CINEMA_PATH_EDITOR.md` §CLI_SILENT_BAKE) | live, dev-only, GPU |
| The compiler's own DSL: `.bimcobol` scripts, one verb per line, `--` comments, 78 verbs | bim-compiler `BIM_COBOL/src/main/java/com/bim/cobol/ScriptRunner.java`, `VerbRegistry.java`, `verb/` | live (Java compile path) |
| Declarative building files | bim-compiler `examples/*.bim` (20) | live |
| App actions behind the next verbs | `modeller.html` `window.__gridShift` (L2414), `window.__gridStretch` (L2442); **"Add one more"** column line that splits an over-limit span: `gsgBuildAdd` (~L2156, `spanSplit`, W-GRID-SPAN-GATE); **add a bay**: `bay_add.js` §D89 (`Bonsai.commitBay`, W-DXF-ADD-BAY, spec bim-ootb `prompts/DXF2BIM_FOUNDATION_LANE.md` §D89/§D90) | live in the UI |

**Design, settled with the owner 2026-11-08 (§18 discussion):**
1. **Three layers, kept apart.** Syntax (BIM COBOL's one verb per line, unchanged) · the verb contract (name, plain description, inputs with units, which side runs it, what it returns; no logic) · the implementations (untouched: Java verbs, the page's own functions, MaxQ). A verb only calls an existing function.
2. **One verb list, one source:** a `verbs.json` beside `bim_mcp.js`. `tools/list`, the script runner and the guide's verb table are all generated from it, so they cannot disagree. A new verb appears in all three at once.
3. **Backward compatibility, witnessed:** `edit_cli.js` and `cli_silent_bake.js` keep every flag and their exact output (W-EDIT-CLI already pins bytes); `.bimcobol` and `.bim` files run unchanged; verbs are added, never renamed or removed.
4. **Two registry risks, from the code, fix before adding Java-side verbs:** `VerbRegistry.register()` silently replaces a duplicate name (`verbs.put`, L33) → refuse it; dispatch picks the longest keyword first (L14-15), so a new `CHECK CLASH PAIRS` would steal existing `CHECK CLASH PAIRS …` lines → a new keyword may not extend an existing one, checked at start.
5. **State:** connector calls stay fresh-per-call (repeatable per call). A script with `OPEN` keeps one building across lines; each line's result records the steps that led to it (repeatable per script).

**Verbs, in order (harmless first; each its own spec line in this section before code):**
| # | Verb | Does | Calls | Harm |
|---|---|---|---|---|
| 1 | `bim_buildings` | lists the buildings that can be opened | the Open panel's own list (`#m-open-panel .mo-row`, as `edit_cli` reads it) | none |
| 2 | `bim_try_move(building, line, move)` | moves ONE grid line; report; stop | `edit_cli --grid` (`__gridStretch`) | none: fresh copy, undone if red |
| 3 | `bim_try_add_column_line(building, bay)` | the "Add one more" action: splits an over-limit span with a column line; report | `gsgBuildAdd` + its commit path | none: fresh copy, nothing saved |
| 4 | `bim_try_add_bay(building, …)` | the §D89 add-a-bay action on a repeating-bay building; report | `BayAdd` plan + `Bonsai.commitBay` | none: same |
| 5 | script runner: `.bimcobol`-style lines over verbs 1-4 (`OPEN`, `LINES`, `TRY SHIFT gx6 BY 1.824`, …) | one script, one command | the connector's verb list | none |
| 6 | `film_path_visibility(viewer_db, [path])` | per `cinema_path` band, sampled along its travel: how many `drawn_walk_line` pieces and `drawn_walk_marker` items fall inside the REAL camera frustum (the cinema engine's own camera at each sample), by basis and storey | the Viewer page via the `cli_silent_bake.js` page-open path; `cinema_path_editor.js` band maths | none: read only, no bake |
| 7 | `film_path_propose(viewer_db, frame='drawn-services')` | PROPOSER: candidate bands (the `cinema_path` schema) that frame the drawn services, ranked by verb 6's own numbers; never writes | verb 6 as its judge | none: proposes only; the owner picks |
| later | `BAKE …`, a film-path DSL over `cinema_path` / `--override` | Alt+C from a script | `cli_silent_bake.js` | GPU: only on the owner's go, never beside a live tab |
**Verbs 6-7, film path (owner 2026-11-09: *"Wonder if u can CLI the film path ... delegate to the NEURO AI Proposer session"*; incoming from the Modeller lane, session `bim-compiler-73`).**
- **Why:** the Modeller lane walked a private set's HVAC and FP from its drawings (bim-ootb `prompts/DISC_WALK_DRAWN_INTEGRATION.md`, `prompts/DRAWN_SERVICES_FILM.md`). An exported Viewer DB holds the drawn services as `drawn_walk_line` / `drawn_walk_marker`, the Viewer draws them as a film beat (`viewer/cpe_drawn_services.js`), and the bake has `--drawn-services`.
- **The gap:** the film's camera path is the architecture film's 4 `cinema_path` bands (`ifc_x/y/z` centre, `dir_*`, `len`; `_ends()` in `viewer/cinema_path_editor.js`), carried across frames by `p_new = p_film + film_offset - route_offset`. Nobody knows whether any band sees the drawn services.
- **Verb 6** prints `§FILM-PATH-VIS band=<seq> samples=<n> linesInView=<n> markersInView=<n> byBasis={…} byStorey={…}` plus JSON. Witness: a fixture band aimed at a known overlay sees it; RED: the same band reversed sees 0.
- **Verb 7** returns candidates only. A separate apply (or the CPE) writes the owner's choice. The proposer submits, the compiler judges.
- **Constraints:** public fixtures only, no client names, sheet codes or coordinates. The Modeller lane runs verb 6 on the walked private DB locally (path by message only). Before any band is added to the real film, the design lane (`bim-compiler-8c`) asks the owner. No bake without the owner's word, after an `nvidia-smi` check.
Verb 3 is the one the G4 answer points to ("add a column line"): a demo can then show the AI turning a stop into a working change.

**Witnesses, per verb (copy the W-BIM-MCP pattern, `modeller/tests/witness_bim_mcp.js`):** the verb's answer = the app's own path for the same action, byte for byte but `ms`; a stopped or refused change leaves the building as Before (recount); a scripted client plays one real request end to end; an unknown verb or a missing input is an error; a falsifier breaks the verb and must fail. Plus one new check: **the guide's verb table = `tools/list`**, name for name (extend W-PROPOSER-GUIDE), so the guide can never describe a verb the connector does not have.

**The guide (`docs/ProposerGuide.md`), as each verb lands:** add its row to "What your AI gets" (generated from `verbs.json`); one worked example per new verb with its real report numbers (W-PROPOSER-GUIDE checks every number); keep "Connect your AI" first and the command line second; keep the NOT-checked list and "a pass never means safe". Publish only through `scripts/safe_gh_deploy.sh` (copy `docs/glassbowl_data.db` into the worktree first).
**Then the film:** an rc5 only when verb 3 exists, so the demo can end with a working change instead of a stop; same pipeline (`scripts/film_neuro/`), same labels.
**Rules that still hold:** no paid model calls (§14.6); every claim a `§` line; `*.log` evidence needs `git add -f`; work in `/tmp/wt-*` worktrees (bim-ootb's shared tree is hook-blocked).

### 19.1 SPEC (2026-11-09): the Viewer action inventory, step 1 of §19.0 — W-VIEWER-ACTIONS
**Issue:** a Viewer verb list needs its denominator N, and N must come from the code, not a hand list. Read 2026-11-09 on origin/main `8541065f`, the Viewer has **four** entry-point tables, not one, and they already disagree with each other:
- `_shortcuts` in `viewer/scene.js` (L2615): **30** keys, not the 29 §19.0 counted (it missed `'`, Hover Name).
- direct branches in the same keydown router (L3604-): Alt+Z/S/G/J/C/P, F1, F11, Ctrl/Cmd+S, Ctrl/Cmd+O, Backspace (undo), `\` (redo), Home, `?`, Escape. Panel navigation inside a focused panel (Tab, Space, PageUp/Down, Enter, typeahead, arrows on a slider) moves a cursor and is **out of N** (stated, not dropped).
- keydown listeners in other files: `gi_still.js` Alt+Shift+S (release the bounce renderer), `precision_cam.js` CapsLock (fine mode).
- the pill buttons, `_actions` in `viewer/panels.js` (L1329, the one source the Help palette also reads, §S282).
**Instrument checked first, and wrong:** `internal/APP_SURFACE.md` lists `A.screenshot` (key `s`) as phantom, but `viewer/tools.js:613` defines it. Cause: `gen_app_surface.js` strips `/* … */` before `//`, so the `buildings/*.db` inside a line comment at `tools.js:25` opens a false block comment that blanks 588 lines of code. Every field written in such a span is a false phantom. This generator therefore strips comments with one tokenizer pass (strings, regex literals, `//`, `/* */` in reading order) and does not read APP_SURFACE.md. Fixing W-APP-SURFACE is its own item (§19.2).
Seen while reading, to be printed by the generator, not fixed in this step: pills `ew`/`rw`/`egress` show keys `u`/`k`/`e` that no keydown table binds; pill `sanity` shows `s` and pill `roleFilter` shows `r`, both bound to something else in `_shortcuts`.
**Deliverable (bim-ootb):** `scripts/gen_viewer_actions.js` writes `internal/VIEWER_ACTIONS.md` (pattern `gen_app_surface.js`). One row per entry point: source table + file:line · key · pill id · the app's own label (pill `name` + `children`, the Help palette label, or the code comment on that line; never written by us) · the functions it calls (callees `A.x`, `window.x`, or a bare name, at the handler's top level, nested callbacks not followed) · whether each callee has a writer/definition in the tree (`file:line`, or **PHANTOM**) · class · verb (empty today).
**Rules (each a witness case):**
- R1 every `_shortcuts` key is a row; R2 every `_actions` id is a row; R3 every direct keydown branch above is a row; R4 every `keydown` listener file under `viewer/` and `common/` is either scanned or named in an exclusion list in the generator (so a new listener file cannot hide).
- R5 class is by rule only, from a table in the generator that cites its source per callee: **gpu** (Alt+S still, Alt+C MaxQ bake, Alt+G/Alt+J GPU preview spikes; §19.0 item 4, the `gi-preview` pill comment), **writes** (saves a file, persists the DB, edits model state or history: `saveModelDb`, LOD400 panel, the 4D pill's generate path `ScheduleInject.inject`, undo/redo, the World-history bomb), **leaves** (navigates away or needs a native dialog or user gesture: Open, Home, Share, Fullscreen), **view** (no callee in the three lists above). A view row's basis column says "no gpu/writes/leaves callee found", never "safe".
- R6 a callee with no writer is printed PHANTOM, and a pill key bound to nothing or to a different handler is printed as a key conflict.
- R7 N is printed as entry points and as distinct actions (pill id, or key when no pill names it); X = rows with a verb; header line `§VIEWER_ACTIONS N_entry=… N_actions=… X=… phantom=… conflicts=…`, all recomputed each run.
- R8 the committed file is current: regenerating gives the same bytes.
**Witness `tests/witness_viewer_actions.js` (each case names its issue):** VA1 (a bound key is missing) the `_shortcuts` keys counted a second, independent way (line scan inside the block, not the generator's parser) = the rows; VA2 (a pill is missing) the same for `_actions` ids; VA3 (a direct branch or other listener is missing) every `e.altKey && … e.key ===`, `e.key === 'F…'`, `e.code ===` match in the scanned files is a row; VA4 (stale file) R8; VA5 (vacuous) each table yields ≥ 1 row, else INCONCLUSIVE, never PASS; VA6 positive control: on a temp copy of `scene.js` with a planted key calling a function nothing defines, the generator lists it and marks it PHANTOM; falsifier `VA_BREAK=1` (generator drops the last `_shortcuts` key) must fail VA1.
**Not in this step:** actions inside panels (the Find bar's query, clash list rows, Time Machine controls). They are the verbs §19.0 item 3 wants, so they come next, from each panel's own code, into the same file.
**RESULT 2026-11-09 (bim-ootb #2735):** `§VIEWER_ACTIONS N_entry=96 N_actions=64 X=0 shortcuts=30 direct=20 pills=46 phantom=0 conflicts=5 listeners=17 unaccounted=0 direct_missing=0`. Classes: view 69, leaves 10, writes 11, gpu 6. W-VIEWER-ACTIONS 8/0: `VA1 _shortcuts keys: generator 30, line scan 30` · `VA2 _actions ids: generator 44, line scan 44` · `VA3a 19 modifier-key lines in 5 scanned files, uncovered 0` · `VA3b keydown listener files: grep 17, generator 17` · VA4 committed file current · VA6 planted key listed and PHANTOM · `VA1-RED VA_BREAK=1 generator lists 29 keys vs line scan 30 → caught`; `VA_BREAK=1` run → `FAIL VA1 … missing=[.]`, verdict FAIL.
**The witness caught the generator three times before it was green, each time a real miss:** (1) first run, 4 phantoms, all false (globals written `root.X =` / `G.X =`, UMD style); (2) 3 of 8 conflicts false (`window.toggleShadow = APP.toggleShadow` alias; `togglePrecisionFine` → `toggleFine` and `A.toggleFullscreen` → `requestFullscreen` one call down; fixed by alias + one-level expansion, used only to decide "same action"); (3) VA3a found a second Alt+S handler (`gi_still.js:1227`, the WebGPU bounce pass after the still; now a gpu row) and two list-navigation lines in `panels.js` (declared, not actions).
**Five pill-key conflicts, measured, not fixed (each needs the owner's choice of key):** `roleFilter` shows `r` (r = Road report on a civil model, Room Cycle otherwise) · `sanity` shows `s` (s = screenshot download) · `ew` `u`, `rw` `k`, `egress` `e`: no table binds them, so the label promises a key that does nothing.
**Not done:** the W-APP-SURFACE comment-strip defect (§19.2). Panel-inner actions. No Viewer verb yet, so X = 0 of 64.
### 19.2 Open: W-APP-SURFACE strips `/*` inside a `//` comment
`gen_app_surface.js` R9 runs the block-comment regex before the line-comment one; `viewer/tools.js:25` (`buildings/*.db` in a `//` line) then blanks code up to the next `*/`, so `A.screenshot` (tools.js:613) and every other field written in that span is listed phantom. Fix: one tokenizer pass, as `gen_viewer_actions.js` `scan()` does; witness case: a file with `// a/*.db` above `A.x = 1` lists `A.x` as written. Not started.

SPEC 2026-11-09: fix R9 in bim-ootb `scripts/gen_app_surface.js` to use the one shared tokenizer `scripts/lib/js_scan.js` (moved out of `gen_viewer_actions.js`, which now requires it; its output stays byte-identical, W-VIEWER-ACTIONS 8/0). Issue: a `/*` inside a `//` comment hides the code after it. New witness case R9b in `tests/witness_app_surface.js`: a temp file with `// a/*.db` on one line and `A.x = 1` below must list `A.x` as written, not phantom. Falsifier switch `APPSURF_OLD_STRIP=1` restores the old strip order and R9b must then fail (R9b-RED). R9c: `APP.screenshot` in the real tree resolves to its `viewer/tools.js` write site.

**RESULT 2026-11-09:** `§APP_SURFACE_W ALL PASS` (R9b, R9b-RED, R9c included); `§W-VIEWER-ACTIONS verdict=PASS fail=0 inconclusive=0`; `internal/VIEWER_ACTIONS.md` regenerated with no diff. `§APP_SURFACE files=2986 fields=1676 alias_only=1316 phantom=271`. Before, the committed file on origin/main said phantom=235 on a stale 2261-file scan, so it is not comparable. On the same current tree the old strip gives `files=2986 fields=1601 phantom=319`, the fix gives 271: 48 fewer false phantoms and 75 more fields seen. `APP.screenshot` is now `viewer/tools.js:613`. Others cleared: `APP._applyPendingPatch`, `APP._bomDb`, `APP._collectAllMeshes`, `APP.export4D5D`, `APP.groundIfcZ`, `APP.minAreaRect`, `APP._nightFixtures`. Some fields (`APP.bind` read at `erp/crud_overlay.js:426`, `APP.Ctx` at `:480`, `APP.Env`) are newly listed phantom: reads that the old strip hid with the code around them. Not investigated further; they may be real phantoms or local names.

### 19.3 SPEC (2026-11-09, owner: *"proceed, inform MODELLER_MASTER session if your verb 6 film path landed"*): verb 6 `film_path_visibility` — W-FILM-PATH-VIS
**Issue (from the Modeller lane, §19 Verbs 6-7):** nobody knows whether any band of a film's `cinema_path` sees the drawn services (`drawn_walk_line`, `drawn_walk_marker`, bim-ootb `prompts/DRAWN_SERVICES_FILM.md` §2). Read from the code 2026-11-09 (bim-ootb `d49d885d`), the facts the verb is built on:
- the stored path is read by the shipped loader: `A.cinemaPathPlan(d)` with no override runs `_cpeLoadFromDb()` (`viewer/fx_cinema_orbit.js:264`), and the staged result is `A._getCinemaPathEdit()`. The bake does the same (`maxq_start.js` `__maxqBake`, `src = 'db:cinema_path'`).
- the film's camera is `plan.poseAt(tNorm)`, tNorm 0..1 over the film (`fx_cinema_path_plan.js:1872`), plan = `A.cinemaPathPlan(ov._total, ov)`. That is the same plan the bake flies, and `§CLI_BAKE_POSECHECK` holds the flown poses to it within 0.05 m. During a bake, `A._bakeCameraPoseAt(tn)` adds the §57.5 gaze blend, a ±1.5-frame look-direction average. It exists only inside a running bake, so verb 6 uses the raw pose and says so. No re-derived camera.
- fov/near/far = the page's own `A.camera`; aspect = `--width/--height`, default 1280×720 as `cli_silent_bake.js`.
- the overlay is drawn `depthTest:false` (DRAWN_SERVICES_FILM §3), so "inside the frustum" = on screen. Walls do not hide it. The exception: `_cease3D` hides it during a findings beat. Verb 6 does not model that and prints it as not checked.
- the drawn tables carry no storey, and a Viewer DB has no storey-elevation table (Duplex: `elements_meta.storey` only). So **byStorey is not available**: verb 6 prints `byStorey=n/a (the drawn tables state no storey)` and does not guess one from z. The export can add a storey column if the Modeller lane wants it. Sheet is never printed (public logs).
**Verb:** `node viewer/tools/film_path_vis.js --db <viewer.db> [--path file.json] [--samples 240] [--width 1280 --height 720] [--json] [--log f]`. Opens `viewer/viewer.html` headless on **SwiftShader** (CPU, `cli_silent_bake.js` `sw` flags), never the GPU, no bake, no write. `--path` = an override JSON (the editor's `{bands:[{c,d,len,hold}], diveSec, …, _total}` in IFC coordinates, converted by `A.ifc2three`/`A.ifc2threeDir` as the loader does) in place of the DB's table.
**Rules:**
- F1 samples: `--samples` evenly in tNorm over the whole film. Each sample belongs to the band whose segment (`c ± d·len/2`, `cinema_path_editor.js` `_ends`) is nearest the camera, if it is within 0.5 m **and** the camera is travelling along it (motion · d > 0.5) or holding still on it. Otherwise it is `off-path` (dive, pull-out, rise, and a connector hop that retraces a band the other way; reported, not dropped). *Revised after the first witness run: without the direction test, the hop back along a reversed band 0 was credited to band 0.* Each band line also prints `stillSamples` and `whileMoving`, because the engine's spin is a 360° turn at a fixed point.
- F2 a line piece is in view at a sample when any of 9 evenly spaced points on it (ends included) is inside the camera frustum. A marker is in view when its point is. Counts are distinct rows seen at ≥ 1 sample of that band.
- F3 per band, one line: `§FILM-PATH-VIS band=<seq|off-path> samples=<n> linesInView=<n>/<N> markersInView=<n>/<M> byBasis={…} bySystem={…} byStorey=n/a`, then `§FILM-PATH-VIS total …` and `§FILM-PATH-VIS verdict=<SEES|BLIND|INCONCLUSIVE>`. INCONCLUSIVE when the DB has no drawn rows, or no stored path, or no sample landed on a band (nothing judged).
- F5 (added 2026-11-09, the Modeller lane's first real run: at 240 samples, 4 bands got 23 samples, 3 each in two bands): **minimum samples per band**, `--min-band-samples` default 20. After the first pass, if a band has fewer, the run repeats at N × ⌈min ÷ fewest⌉ (cap 24,000) until every band reaches the minimum or the cap is hit. Printed: `§FILM-PATH-VIS resample from=<N> to=<N'> reason=band <k> had <n> < <min>`. A band still under the minimum at the cap is printed `THIN` on its own line and the verdict says so, because a 3-sample band can miss a view.
- F6 (same source): `§FILM-PATH-VIS bands linesInView=…/N markersInView=…/M`, the union over the bands only (off-path excluded), printed beside the any-sample total. This is the interior-view count.
- F4 not checked (printed): occlusion (none applies to the overlay); the gaze blend; the findings-beat cease; pixel size (a piece in view may be a few pixels).
**Witness `viewer/tests/witness_film_path_vis.js` (public fixture only):** a copy of `buildings/Duplex_extracted.db` (public) plus written fixture rows: a 2-band `cinema_path` inside the house and 2 `drawn_walk_line` + 1 `drawn_walk_marker` placed ahead of band 0. These are test values, not data.
- FV1 (the verb is blind): band 0 aimed at the fixture rows sees all 3.
- FV2 RED (the verb counts what it should not): `spin_sec = 0`, band 0 reversed (d → −d) sees 0 of them on band 0.
- FV2b (the verb hides what the film shows): default spin, band 0 reversed **does** see them, and only from still samples. *Measured 2026-11-09, which is why FV2 needs spin 0: after the dive the camera holds at the first band's start and turns 360° (fixed position, look direction swept through every heading), so a band's direction does not keep its start point from seeing everything around it.*
- FV3 (the verb's camera is not the film's): the bake's own posecheck measure. The flown track passes every stored band centre within 0.05 m, and the derived plan (`A.cinemaPathPlan(dur, null)`) misses at least one by ≥ 1 m, so the verb flew the stored path. *(The first draft, "the same call recomputed, 0 m apart", could not fail.)*
- FV-RED falsifier `FPV_BREAK=1` (frustum test always true) must fail FV2.
- FV6 (a thin band reads as judged): `--samples 20` on the forward fixture resamples until every band has ≥ 20 samples, and prints the `resample` line. With `--min-band-samples 0` the same run reports band counts under 20, so the check can fail.
- FV7 (the interior count is not what it says): the `bands` union = the union of the per-band row indices in the JSON, recomputed by the witness, and it excludes rows seen only off-path.
- FV4 (vacuous reads as a result): a copy with the drawn tables dropped prints INCONCLUSIVE, never SEES or BLIND.
- FV5 (the verb writes): the DB file's sha256 is unchanged after a run.
**RESULT 2026-11-09 (bim-ootb #2736):** W-FILM-PATH-VIS **7/0**, 5 verb runs at 7-8 s each on SwiftShader, no GPU. Forward: `band=0 samples=25 stillSamples=0 linesInView=2/2 markersInView=1/1 whileMoving=2+1`. FV3: `bandAnchorMinDistM=[0.013,0.013]`, derived plan `[3.903,1.404]`. FV2 spin 0 reversed: `band=0 samples=15 linesInView=0/2 markersInView=0/1`. FV2b default spin reversed: `stillSamples=23 linesInView=2/2 markersInView=1/1 whileMoving=0+0`. FV4: `verdict=INCONCLUSIVE (this DB states no drawn services: nothing judged)`. FV5: sha256 unchanged. FV-RED `FPV_BREAK=1` → band 0 reversed sees 2+1, caught. Plan facts printed per run: `fov=60 near=0.1 far=10000 durSec=26.62` (2-band fixture, default spin).
**Findings for the drawn-services film:** (1) the first band's start point sees all round during the spin, so to judge whether the film *frames* the services, read `whileMoving` beside `linesInView`. (2) `byStorey` needs a storey column in the drawn tables (the export knows it from the walk). (3) The dive and fly-out, `off-path`, see the whole building from outside, so a SEES verdict that only comes from `off-path` is not a framed shot.
**First real use, 2026-11-09 (Modeller lane, on the walked private DB, locally; numbers stay out of this file):** verdict SEES, every band sees drawn services, DB unchanged. The design lane (`bim-compiler-8c`) concluded that no band needs to go to the owner and that verb 7 is not needed for this film; the owner approved the bake, which runs in the Modeller lane. Their two suggestions became F5/F6.
**RESULT F5/F6 2026-11-09 (bim-ootb #2737):** W-FILM-PATH-VIS **9/0**. FV6: `resample from=20 to=400 reason=band 1 had 1 < 20`, band samples [41,28]; with `--min-band-samples 0`, [2,1]. FV7: `bands linesInView=2/2 markersInView=1/1` = the per-band union recomputed. At the default 240 the 2-band fixture itself resamples once (`from=240 to=480`, band 1 had 11-19).
**Then:** verb 7 (`film_path_propose`) ranks candidate bands by verb 6's counts. The Modeller lane runs verb 6 on its private walked DB locally and reports back. This file gets only the public fixture's numbers.

### 19.4 SPEC (2026-11-09, §19.0 steps 2-3): the Viewer driver and the first two harmless Viewer verbs — W-VIEWER-VERBS
**Issue:** X in "X of 64 Viewer actions" (§19.1) is 0: the connector (`bim_mcp.js`) can only reach the Modeller. Step 2 is a shared Viewer driver, step 3 the first read-only verbs.
**Driver (step 2):** bim-ootb `viewer/tools/viewer_driver.js` = the page-open part of `film_path_vis.js`, moved unchanged (same SwiftShader flags, same two waits: `APP.camera`+`THREE`+`cinemaPathPlan`, then `activeBuilding` rendered and not streaming). `film_path_vis.js` now calls it; its output does not change (W-FILM-PATH-VIS stays 9/0).
**Verbs (step 3), both from §19.0 item 3's harmless list, both already answered by the Viewer in its Find panel, Ask mode (`viewer/find_ask.js`, `A.askRun`), which prints the answer as `§ASK_ANSWER id=… value=…`:**
- `viewer_counts(building, by)`: open a building, return its element counts by `discipline` (default) or `storey`. Wraps Ask template `counts` (`find_ask.js` `runCounts`, `elements_meta GROUP BY`). Shown to a person as "Find element count by discipline".
- `viewer_clashes(building, discA, discB)`: open a building, list the clashes between two disciplines (box overlaps at the rule's tolerance, then the mesh test). Wraps Ask template `clash_pair` (`find_ask.js` `runClash`: `_loadClashRules`, `_queryClashesPairAll`, `clashNarrow.qualifyRows`). Rows capped at 20 in the reply, with `rowsTotal`.
Each is `viewer/tools/viewer_verbs.js` (`viewerCounts`, `viewerClashes`, and a small CLI), and `bim_mcp.js` offers them as tools `viewer_counts` and `viewer_clashes` with plain descriptions and inputs. Nothing is re-derived: the reply carries the Viewer's own answer (`value`, `summary`, rows) plus its `§ASK_ANSWER` line from the page console as `viewerLine`, and the `§ASK_*`/`§CLASH_QUERY*` lines as `viewerLog`. Read only: headless SwiftShader (CPU), no GPU, no bake, no DB write, a fresh page per call. `building` = a name, resolved to `<name>_extracted.db` (or `<name>.db`) in `$VIEWER_BLD_DIR`, this checkout's `buildings/`, or the primary checkout's.
**Errors (not results):** a missing or malformed input (the connector's schema check, before any run); an unknown building (no DB; no browser starts); `by` not `discipline|storey`; a discipline pair with no rule in `clash_rules.json` (the Viewer answers INCONCLUSIVE, the verb turns it into an error with the Viewer's reason). Never a fake zero.
**X:** `scripts/gen_viewer_actions.js` gets a verb map `{ find: [viewer_counts, viewer_clashes] }` and a `verb` column. Both verbs wrap the Find panel's Ask answers, so both belong to the one action `find` (key `f`, pill `find`). X is redefined from "entry rows with a verb" (which would count the `f` key row and the pill row and print 2 for one action) to **distinct actions with a verb**; the header gains `verbs=`. Expected: `X=1 verbs=2` of N_actions=64. A verb count of 2 is not 2 of 64 actions, and this file says so.
**Witness `viewer/tests/witness_viewer_verbs.js` (public fixture Duplex, each case names its issue):**
- VV1 (the verb's number is not the Viewer's): `viewer_counts` reply `value` and `summary` equal the `§ASK_ANSWER` line the page printed for the same call (same value string, to its 400-char cut), AND `total` equals a count taken by the witness straight from the DB file (`SELECT count(*) FROM elements_meta`, python sqlite3), AND the groups equal `GROUP BY discipline`.
- VV2 (storey input ignored): `by=storey` groups equal `GROUP BY storey` from the DB and differ from the discipline reply.
- VV3 (the clash list is made up): `viewer_clashes` reply `value.bboxOverlaps` equals the `hits=` of the Viewer's own `§CLASH_QUERY_RTREE` line in `viewerLog`, and equals the `§ASK_ANSWER` value; `rowsTotal` equals `bboxOverlaps`. If the pair yields no candidates it prints INCONCLUSIVE, never PASS.
- VV4 (a bad input reads as a result): missing building, unknown building, bad `by`, and a pair with no rule each return `isError` through the connector, and no browser is started for the first two (elapsed under 3 s).
- VV5 (the connector does not offer them): `tools/list` has both, each described, every input with its unit or allowed values; W-BIM-MCP's M1 count updated (4 tools, no more); a scripted client calls both through `bim_mcp.js` and gets the same value as the direct call.
- VV6 (nothing written): the DB's sha256 is unchanged after the runs.
- VV7 (X not raised): `gen_viewer_actions.js` prints `X>=1`, W-VIEWER-ACTIONS stays green, the committed `internal/VIEWER_ACTIONS.md` is current (VA4).
- Falsifier `VIEWER_VERB_BREAK=1` (the verb shifts the Viewer's number by 1) must fail VV1 and VV3.
- Regression: `witness_film_path_vis.js` 9/0, `witness_bim_mcp.js` stays green with its M1 updated for 4 tools.
**Not in this step:** typed-NL Find query, 4D at a day, cost to date, element/room lookup, camera focus (the rest of §19.0 item 3); the guide row and `verbs.json` (§19 design 2).

**RESULT 2026-11-09 (bim-ootb #2740):** W-VIEWER-VERBS **7/0** on the public Duplex fixture (CPU only, ~15-20 s per Viewer run). Log lines:
- `§W-VIEWER-VERBS PASS VV1 — verb total=1193 DB total=1193 groups={"MEP":809,"ARC":270,"ELEC":81,"STR":19,"PLB":14}`, equal to the Viewer's own `§ASK_ANSWER id=counts verdict=OK value={"total":1193,"by":"discipline",…}` and to `GROUP BY discipline` on the DB file.
- `VV2 by=storey groups={"Unknown":1026,"Level 2":83,"Level 1":62,"T/FDN":14,"Roof":8}` = `GROUP BY storey`.
- `VV3 verb bboxOverlaps=200 Viewer §CLASH_QUERY_RTREE hits=200 rowsTotal=200 rows=20 tol=0.025` (ARC vs MEP).
- `VV5 tools=bim_lines,bim_try_shift,viewer_counts,viewer_clashes described=true`; the connector's reply = the direct call's (value and Viewer line).
- `VV4` four errors through the connector: `missing input: building` · `unknown building "NoSuchBuilding"…` · `by must be "discipline" or "storey"` · `the Viewer says INCONCLUSIVE: no rule for ARC/ZZZ…`; the first two in 427 ms (no browser).
- `VV-RED VIEWER_VERB_BREAK=1: counts total=1192 vs DB 1193 … clashes bboxOverlaps=201 vs Viewer line`; the whole witness with `VIEWER_VERB_BREAK=1` → `FAIL VV1`, `FAIL VV2`, `FAIL VV3`, verdict FAIL.
- `VV6 DB sha256 before=9f9ab0a9cafc after=9f9ab0a9cafc`.
- W-VIEWER-ACTIONS 8/0 after the verb map: `§VIEWER_ACTIONS N_entry=96 N_actions=64 X=1 verbs=2 …`. W-FILM-PATH-VIS 9/0 after the driver factoring.
**X of N now: 1 of 64 Viewer actions (the Find panel), with 2 verbs.**
**Found while building it (the verb returns the Viewer's answer unchanged, so it shows this too):** the Viewer's own clash answer is inconsistent on Duplex ARC/MEP: `bboxOverlaps=200 meshClashes=229 cleared=-29` (`find_ask.js` `runClash`: `meshClashes = meshTrue + contained` can exceed the broad count; `meshTrue=141 contained=88` from `§CLASH_NARROWPHASE`). A person sees "229 mesh-level clashes (200 box overlaps: -29 cleared…)". Not fixed here (a Viewer bug, own item); the witness prints it as `OBSERVED`, not a failure.
**Not done:** the other §19.0 item 3 verbs; `verbs.json`; the guide row; the connector needs puppeteer on the machine that runs it (as `edit_cli.js` does).

## 20. The film's admitted gaps against this roadmap (owner, 2026-11-09: *"in previous film, we admit certain gaps. Are they documented, and planned in roadmap here?"*)
Read from the rc4 narration (`~/Videos/Think_Global_Act_Local_EN_rc4_narration.txt`, beats b10, b14, b18, b19) and checked against this file on master 2026-11-09.
| # | What the film admits (beat) | Documented here | On the roadmap? |
|---|---|---|---|
| 1 | The overlap check uses boxes, not the real shapes (b18) | §8, §13.6, §16.2 row 9 | **Named only.** The film's "not built yet" card (b19) and §16.2 row 10 list it, but the STATE next-work list did not, and there is no spec. The engine exists in the Viewer: `viewer/clash_narrow.js` (bim-compiler `prompts/CLASH_GATE_OBB_NARROWPHASE.md`, mesh narrow phase measured on Terminal). **Now §20.1 item A.** |
| 2 | It does not check strength or loads (b14, b18) | §5 explicit non-goal | **Not planned, on purpose.** It needs a licensed engineer and an analysis engine (§5). The film and every report say it plainly. |
| 3 | The separate compile path missed 8 of 17 planted mistakes (b18) | §3.1, STATUS "the gate" | **Conditional.** The gate goes at `PlacementRequest` when outside orders arrive there (STATE item 2); no date. |
| 4 | Floating elements are among the 11 things not checked (b14) | §3.5, STATUS "Open by design" | **Not planned.** Open by design, like every NONE row. The Viewer's `§STRUCT_SANITY floating_member` is IfcBeam-only and on demand, not a gate. **Now §20.1 item C**, for the owner to decide. |
| 5 | The test is small: 15 → 24 of 30, our own requests, one model (b10) | §14, START HERE "not measured", open question 3 | **Partly.** The optional rc5 recipe (RESUME) records one real session, which is not a measurement. No protocol exists for a measured run, and no paid model calls are allowed (§14.6). **Now §20.1 item B.** |
| 6 | Not built yet: more actions in the menu (b19) | §19 | **Yes, active.** Viewer inventory N = 64, X = 0 (§19.1); Modeller verbs 1-5 and film-path verbs 6-7 specified; verb 6 shipped (§19.3). |
| 7 | Not built yet: the real-shape check behind every report (b19) | as 1 | as 1 |
| 8 | Not built yet: a measured run of an AI with the connector (b19) | as 5 | as 5 |
### 20.1 Roadmap items added (spec lines only; each needs its own spec section and the owner's go before code)
- **A. The real-shape check behind the edit report's overlap row.** Reuse `viewer/clash_narrow.js`'s mesh narrow phase. Do not write a second one (CLAUDE.md, one implementation per responsibility). The report's overlap row would then say boxes → real overlaps, as the film's clash beat already does for the Hospital (1,478 boxes → 271 real). First step: find whether the Modeller page can load that module, and its cost per edit (PERF BUDGET). **Done 2026-11-09: spec and measurements in §20.2.**
- **B. A measured run of an AI with the connector, at no cost to the project.** Needs a protocol written before any run: briefs fixed in advance, the scorer the proposer test already has (`run.js --stub` scoring), a baseline without the report or the stop, and the owner's own plan login as the only model access (§14.6). Open question 3 is this item.
- **C. Floating elements:** the owner decides whether a floating-member check joins the live edit report (it would be the first rule beyond overlaps and spans), or stays named in the NOT-checked list.
- Defensive publication of methods M1-M4: [`docs/AIProposerDefensiveDisclosure.md`](../docs/AIProposerDefensiveDisclosure.md), published 2026-11-09. The prior-art report behind it is `reports/BIM AI verb prior art.md` in the primary checkout (untracked).

### 20.2 SPEC + MEASURED PROBE (2026-11-09): the real-shape check behind the overlap row (§20.1 item A)
**Issue it answers:** the film admits the overlap row "uses boxes, not the real shapes" (b18). Can the Viewer's existing mesh narrow phase sit behind that row, and what does it cost per edit? **Status: measured, spec only. No runtime file changed.** Probe: bim-ootb `modeller/tests/probe_narrow_edit.js` (headless SwiftShader, no GPU, public resident HospitalGarage and Duplex). Saved log: `build/neuro_lanes_r2/narrow_probe_2026-11-09.log` (primary checkout, untracked), read in full before the numbers below.

**20.2.1 What the code does today (read, file:line, bim-ootb `origin/main` 7f08bdc5)**
- **The row.** `modeller/edit_report.js:30-42` `overlapRow` prints a count handed in by the caller and labels it "bounding boxes; touching and hosted pairs are left out" (`:42`). The count is `SdgGate.pairsOver` (`modeller/sdg_gate.js:279-296`): for each moved element, `penetration(boxes[m], boxes[o])` on **axis-aligned boxes**, kept when deeper than `CLASH_TOL` (0.02 m, `sdg_gate.js:11`). The boxes come from `_gateBoxes` (`modeller/modeller.html:3180-3190`): `m.geometry.boundingBox` of each editable mesh in the Modeller group. **Frame: world.** Measured: 864 of 864 HospitalGarage meshes and 196 of 196 Duplex meshes have an identity `matrixWorld`, so the geometry is already in world coordinates (`§NARROW_PROBE_FRAME nonIdentityMatrixWorld=0`). The report is assembled in `_erEmit` (`modeller.html:2339-2362`); the stop reads the same rows (`edit_report.js:gateVerdict`, §15.1).
- **What `clash_narrow.js` needs.** `testPair(geoA, MA, geoB, MB, opts)` (`viewer/clash_narrow.js:292`) takes two `THREE.BufferGeometry` and two world `Matrix4`, nothing else. Inside it: `aabbOverlap`, `obbOf`/`satDepth` (`:102`, `:113`, an oriented-box test on the LOCAL mesh box), then, if the boxes survive, `geoA.boundsTree.intersectsGeometry(geoB, rel)` (`:313-321`) and a contained-in check. It needs the `THREE` global and `geo.computeBoundsTree` from three-mesh-bvh@0.8.0, which `viewer/loader.js:196-205` patches onto `BufferGeometry` and sets `window._bvhReady`. `ensureBvh` (`:284-288`) builds a missing tree itself. `testPair` does not touch `A.meshCache`, the DB or the scene; only `qualifyRows`/`fetchMissing`/`loadTransforms` (`:423-500`) do, and the Modeller does not need those.
- **Can the Modeller load it as it is? Yes, with no fork and no edit to the file.** The probe appended `<script src="/viewer/clash_narrow.js">` to the live Modeller page, imported three-mesh-bvh from the same CDN URL the Viewer uses, set `window._bvhReady = true`, and called `setupClashNarrow(window.A)` (`window.A` exists in the Modeller, `modeller.html:499`; the Viewer calls it from `viewer/measure.js:1180`). Result: `§CLASH_NARROW_INIT wired`, `window.A.clashNarrow.testPair` is a function, and it judged real Modeller meshes. **The seam is therefore the existing `A.clashNarrow.testPair`.** The Modeller already loads Viewer files (`../viewer/lib/room_walker.js`, `../viewer/connect_scene.js`, `modeller.html:301,307`), so this is not a new kind of dependency.

**20.2.2 Measured (HospitalGarage, fresh Open per edit, readiness as `edit_cli` waits for it; one run, this machine, CPU only)**
The report row counts every box pair that involves a moved element (about 2,200 on HospitalGarage, mostly pairs that were already there); what an edit changes, and what the stop reads, is the **"New or deeper box overlap" row** (`gate.red` of kind `clash`). The table narrows exactly those pairs.
| Edit (HospitalGarage unless noted) | Row "New or deeper box overlap" (box pairs) | Shapes touch | Box overlap, shapes clear | ms for those pairs (cold) | Vertices of the 2 sides touched | 
|---|---|---|---|---|---|
| shift gy11 −1.49 (G2, 1st try) | 2 | 2 | 0 | 2.1 | 14,882 (all new/deeper pairs: 23 meshes) |
| shift gy10 +1.49 (G2, 2nd try) | 25 | 5 | 20 | 33.2 | 75,994 (45 meshes) |
| shift gy9 +1.51 (G1) | 27 | 5 | 22 | 36.0 | 67,582 (45 meshes) |
| stretch gy12 +0.6 (G5) | 2 | 2 | 0 | 4.8 | 146 (4 meshes) |
| shift gy20 +3 (G7) | 23 | 11 | 12 | 11.0 | 42,776 (52 meshes) |
| Duplex stretch gx1 +1 | 29 | 29 | 0 | 110.2 | 9,790 (37 meshes) |
- **Box pairs vs real overlaps (the row the stop reads):** HospitalGarage 79 box pairs over 5 edits, **25 are real mesh overlaps, 54 (68%) are box overlaps with clear shapes.** The false-positive rate swings by edit, 0% on the two small ones to 80-81% on gy10 and gy9. Duplex: 29 of 29 real. (The same `abuts-clash` pairs, "Driven into a wall it touches", were not narrowed; see 20.2.5.)
- **Cost per edit, report-scoped:** 2 to 110 ms, median 22 ms (6 edits). Repeat runs of the same edits gave 1-89 ms (`probe3`/`probe4`), so quote **under 0.1 s**. `testPair` itself is 0.1 to 13 ms per pair; most pairs the narrow phase rejects at its first stage cost under 0.5 ms; a pair with thick triangle meshes costs 5 to 14 ms (slowest single pair in the saved run: 30 ms, in a full sweep).
- **Cost if the whole row were narrowed (all ~2,200 pairs):** 0.8 to 2.0 s cold (2.0 s once, 0.8 to 1.1 s in the other runs), 2 to 27 MB BVH heap, 154,000 to 169,000 vertices touched (HospitalGarage has 192,323). Over 98% of those pairs predate the edit (17 to 45 are new or deeper), so this is not worth paying per edit. 971 to 1,567 are real overlaps and 30 to 34% are box-only.
- **Heap:** the BVH is the only allocation; it adds **no vertices** (a node tree over the existing arrays). Report-scoped BVH heap, measured as a before/after `usedJSHeapSize` delta with a forced GC before and none after: 2 to 12.5 MB (up to 31 MB in an earlier run of the same edits), released by `disposeBoundsTree` (the probe does this after each edit). `§EDIT_REPORT_COST` today prints `verts=0`; a build must print the real figure (PERF BUDGET).
- **Warm vs cold is not the difference:** a second pass over the same 2,200 pairs cost 0.6 to 1.3 s against 0.8 to 1.1 s cold in the saved run, so building the BVH is not the dominant cost and **no cache of trees is needed**: build, judge, dispose, heap stays flat.
- **One-off:** importing three-mesh-bvh from the CDN took 250-300 ms.
- **A conflict recorded, not explained:** the §15.1 rehearsal table says the second G2 try (gy10 +1.49) stopped on "overlap: 2". A lone `edit_cli --building HospitalGarage --shift gy10 --move 1.49 --report-only` today returns `clash 25, clearance 8`, which is what the probe saw (log last line). The first try (gy11 −1.49) matches the rehearsal (clash 2, abuts-clash 2). Different starting state is the likely reason (the rehearsal's second call came after the first stopped edit); that was not measured.

**20.2.3 Verdict.** Yes: the Viewer's mesh narrow phase can serve the report, unchanged, as a **second look at the "New or deeper box overlap" pairs only**, at under 0.1 s and a few MB per edit on the two public buildings tried. It cannot cheaply replace the whole-building count row, and it does not need to.

**20.2.4 Proposed seam (one implementation; nothing below is built)**
1. In `modeller.html`, next to `_ensureEditReport` (§15.2): on the first committed grid move also load `../viewer/clash_narrow.js` and the BVH library, then `setupClashNarrow(window.A)`. Absent at open, like the report's own two files. `clash_narrow.js` gets **zero** changes; a build that edits it has left this spec.
2. A new small function in the Modeller glue, `_erShapes(pairs)`: for each fid pair from the gate's `clash` kind, take the two meshes from `Bonsai.group()` (the same meshes `_gateBoxes` read), call `A.clashNarrow.testPair(a.geometry, a.matrixWorld, b.geometry, b.matrixWorld)`, dispose the BVHs after. Returns `{judged, touch, clear, unknown, ms, heapMB, verts}` plus one record per pair.
3. `EditReport.compose` takes the result as one extra input (`overlap.shapes`), still a **pure composer**: it holds no rule and no threshold. `overlapRow` keeps its box numbers and gets one line under them. Pairs print as one of three states: **"shapes touch"**, **"box overlap, shapes clear"**, **"not judged (reason)"**. A box-only pair is **never dropped** from the list or the count.
4. The stop (§15.1) **does not change** in this build. Whether a "shapes clear" pair should stop an edit is a policy change for the owner (open question 1).

**20.2.5 What stays a box check, and why**
- **The whole-building count** (row "Box overlap over 20 mm", before and after): it compares two states, and after the edit the Before meshes no longer exist to judge, so a mesh count cannot be taken for Before without a second narrow pass at edit time; and it is the 2,200-pair, 1-2 s case.
- **`abuts-clash` ("Driven into a wall it touches"), `abuts-realign`, `clearance` (orange), `door-out`, `door-crush`:** these are face-gap, host-fit and distance rules (`sdg_gate.js` `faceGap`, host checks). The narrow phase answers "do the two solids interpenetrate", not "how far apart are they" or "does the filling fit its host". Not narrowed, not claimed.
- **Beam spans:** not an overlap rule.
- **A mesh verdict is not a code verdict.** `clash_narrow.js` itself records two limits that carry over: touching contacts shorter than `TOUCH_EPS` (1 mm) are CLEAR (`MESH_TOUCH_ONLY`), and some "flat" overlap solids are still counted as CLASH (`§OVERLAP_FLAT`, an owner call open in `MEP_CLASH_REVEAL_MOVIE.md`). The probe saw 5 to 9 `MESH_TOUCH_ONLY` per full sweep and one `MESH_CONTAINED`.

**20.2.6 Witness claims for a future build (W-EDIT-REPORT-SHAPES; each names the issue it proves)**
| # | Claim | Issue it proves or disproves |
|---|---|---|
| S1 | For the G2 gy10 edit the shape line reads 25 box pairs = 5 "shapes touch" + 20 "box overlap, shapes clear" + 0 "not judged", and the sum equals the box count. | A box-only pair is dropped or hidden. |
| S2 | **Falsifier:** replace `testPair` with a stub that returns CLEAR for everything; the report must show every pair as "box overlap, shapes clear", box count unchanged, and S1 must now FAIL. A second stub that throws must give "not judged (reason)" for every pair, never a number. | A witness that cannot tell a working narrow phase from a broken one. |
| S3 | Two synthetic solids whose boxes overlap but whose shapes do not (an L-profile and a block in its notch) give "box overlap, shapes clear"; two overlapping cubes give "shapes touch". Mutating the call to compare boxes only must fail the first. | Boxes mistaken for shapes. |
| S4 | `git diff` of `viewer/clash_narrow.js` is empty and `git grep` finds no second `intersectsGeometry`/SAT in `modeller/`. | A forked or second narrow phase (one implementation per responsibility). |
| S5 | The BVH library failing to load, or zero pairs to judge, prints "shapes not judged" / "nothing to judge", never a PASS or a zero count. | A vacuous result (INCONCLUSIVE rule). |
| S6 | Two fresh Opens give byte-identical shape lines; undo and redo return the same tallies. | Non-determinism. |
| S7 | `§EDIT_REPORT_COST` carries `shape_ms`, `shape_pairs`, `bvh_heap_mb`, `verts`; on the G2 set `shape_ms` ≤ 150 and the heap returns to within 2 MB of before after the dispose. | The PERF BUDGET and the leak of BVH trees. |
| S8 | W-EDIT-REPORT stays green unchanged, and the shape module is absent at open and present after the first grid move. | Regression and the §15.2 boot-weight rule. |

**20.2.7 Not measured**
Only two public residents and 6 edits; no rotated building (`edit_cli --lattice-boxes`, theta ≠ 0); no Terminal. One run per edit on one machine, so ms are indicative (repeat spread 1-89 ms on the gy10 set). BVH heap is a delta, not a profile. Whether the Modeller may import a CDN library (whether the Modeller is expected to run offline was not checked; `common/lib/` holds its vendored libraries) was not decided.

**20.2.8 Open questions for the owner**
1. Should a "box overlap, shapes clear" pair still **stop** an edit (§15.1), or only be reported? On gy10 it is the difference between a stop on 25 pairs and on 5.
2. May three-mesh-bvh be vendored into `common/lib/` so the Modeller works offline, or is the CDN import acceptable as in the Viewer?
3. Is `§OVERLAP_FLAT` (a thin shared face counted as an overlap) acceptable in the report, or must the build wait for that owner call?

**20.2.9 DECIDED 2026-11-09: industry convention answers the open questions** (owner: *"Does convention only consider meshes overlapping as valid clash? What kind of report does BIM users want? Follow your take"*; and on Q2: *"offline use is also important for air gapping. If viable, its OK."*)

*What the convention is (sources):* Navisworks Clash Detective, the de facto coordination tool, defines a **Hard** clash as one where *"the geometry of selection A intersects that of selection B by a distance of more than the set tolerance"*, recorded as a negative distance (deeper = more severe). **Clearance** is a separate test type: geometry within a set distance. **Hard (Conservative)** reports every pair that *might* clash, more thorough but with more false positives ([Autodesk help, clash test types](https://help.autodesk.com/cloudhelp/2019/ENU/Navisworks/files/GUID-B13377D4-8AFA-4E95-8435-C6DC4DF26AF4.htm); [tolerance](https://help.autodesk.com/cloudhelp/2022/ENU/Navisworks/files/GUID-27EA59E6-1A15-4372-9D7D-90508936B512.htm)). A bounding-box overlap alone is a broad-phase candidate, never a reported clash. Issues travel as BCF topics with a viewpoint, a status and an assignee ([buildingSMART BCF](https://info.buildingsmart.org/standards/bsi-standards/bim-collaboration-format/)). This project already follows the same rule in the Viewer: `prompts/CLASH_GATE_OBB_NARROWPHASE.md` §M.2 f, a clash is a mesh intersection longer than `TOUCH_EPS` = 1 mm, else `CLEAR reason=MESH_TOUCH_ONLY`; per-pair tolerances in `viewer/clash_rules.json` (25 to 75 mm).

*The decisions:*
1. **Q1, the stop:** a pair whose boxes overlap but whose shapes are clear **does not stop** an edit. The stop reads only pairs whose shapes touch (new or deeper, as today). **Not judged** (no geometry, library missing, cap reached) keeps today's box verdict and **still stops**, the Hard (Conservative) fallback: the shape test may only remove false stops, never add a miss. If the shape module fails to load, the whole edit falls back to today's box stop and the report says so.
2. **Q2, offline:** vendor three-mesh-bvh@0.8.0 (MIT) into `common/lib/` and import it from there in the Modeller (three.js is already local, `modeller/lib/three.module.min.js`, mapped by the import map at `modeller.html:152`), so an air-gapped Modeller has the shape check. Add it to the service-worker precache. The Viewer's CDN import (`viewer/loader.js:196`) moves to the same local file in the same PR: one copy, one version.
3. **Q3, a thin shared face (`§OVERLAP_FLAT`):** not a clash. It is the existing touch policy (`MESH_TOUCH_ONLY`, under 1 mm); report it as "touching, not a clash", never as an overlap.
4. **What the report gives a BIM user** (from the convention, applied to the per-edit report): for each pair the two elements (name, class, discipline), the storey, the **penetration depth in mm**, the tolerance it was judged at, and the verdict word (**clash**, **touching**, **box only, shapes clear**, **not judged: reason**); the delta against the state before the edit (**new**, **deeper**, **resolved**); the totals line states the full count, never a page (see the Viewer defect below); box-only and touching pairs are counted in a "checked and cleared" line, not listed as problems. BCF export and grouping by system are out of scope for this build; they are named here so they are not forgotten.
5. **Divergence recorded, not changed in this build:** the Modeller gate judges every pair at `CLASH_TOL` = 0.02 m (`modeller/sdg_gate.js:11`); the Viewer judges per discipline pair from `viewer/clash_rules.json`. Convention is a tolerance per test. Unifying them changes verdicts, so it needs its own spec and go.

*Viewer defect found by §19.4, causes located (read 2026-11-09 on bim-ootb origin/main):* Duplex ARC/MEP gave `bboxOverlaps=200 meshClashes=229 cleared=-29`.
- **Cause 1, certain: a double count.** `viewer/clash_narrow.js:498` and `:534` increment `counts.meshTrue` for every CLASH and *also* `counts.contained` when the reason is containment, so `contained` is a subset of `meshTrue`. `viewer/find_ask.js:86` adds them: `meshClashes = meshTrue + contained`. With meshTrue 141 and contained 88, the true answer is **141 clashes**, and `cleared = 200 - 141 - unknown`. Fix: `meshClashes = meshTrue`; report `contained` as a breakdown of it.
- **Cause 2, to verify: a possible page cap.** `measure.js:558` comments "no page limit" on the R-tree path of `_queryClashesPairAll`, but `CLASH_GATE_OBB_NARROWPHASE.md` line 162 records `_queryClashesPairRtree` as capped at `A._CLASH_PAGE_SIZE` (200, `measure.js:98`), and the answer is exactly 200. The fix must measure the uncapped total (page size lifted, as the export does) and say which is true.
- **Witness:** `meshClashes + cleared + unknown == bboxOverlaps` on every Ask answer, with a falsifier that restores the old sum and must fail; and `bboxOverlaps` equals an independent uncapped count of the same pair.
- **SPEC 2026-11-09:** fix in bim-ootb branch `fix/clash-count-sum`. (1) `find_ask.js` runClash: `meshClashes = meshTrue`; `contained` is returned as a breakdown field, never added. (2) `measure.js` `_queryClashesPairAll`: the R-tree path lifts `A._CLASH_PAGE_SIZE` for the one call and restores it (the comment already says "no page limit"; the code did not do it). Other callers of `_queryClashesPairAll` (`find_ask.js`, `witness_clash_mesh_narrowphase.js` which already lifts it itself, `witness_find_ask_answers.js`) all want the full total; paged callers use `_queryClashesPairRtree` directly and are untouched. (3) Witness W-VIEWER-VERBS VV3 asserts `meshClashes + cleared + unknown == bboxOverlaps`, `contained <= meshClashes`, and `bboxOverlaps` == a SQL count made in the witness (own python/sqlite on the DB file: same pair, rule ignore classes and tolerance read from clash_rules.json, strict box overlap). Falsifier `VIEWER_VERB_OLDSUM=1` restores `meshTrue + contained` in the verb output and must FAIL VV3; INCONCLUSIVE when no candidates.
- **RESULT 2026-11-09 (bim-ootb `fix/clash-count-sum`, logs read):** the 200 cap was REAL. `_queryClashesPairRtree` stops at `A._CLASH_PAGE_SIZE` (loop `results.length < limit`); the "no page limit" comment on `_queryClashesPairAll` was wrong. Corrected Duplex ARC vs MEP at 25 mm: **bboxOverlaps=393, meshClashes=291 (of which contained=156), cleared=102, unknown=0; 291+102+0=393**, and 393 equals the witness's own uncapped SQL count. (Before: 200 / 229 / -29. Cause 1 would alone have given 141 of 200 only if the page were the total; the real answer needed both fixes.) Witness lines: `§W-VIEWER-VERBS PASS VV3b — meshClashes 291 + cleared 102 + unknown 0 = 393 vs bboxOverlaps 393; independent uncapped count 393`; falsifier `VIEWER_VERB_OLDSUM=1` gave `FAIL VV3b — meshClashes 447 + cleared -54` (verdict=FAIL, exit 1); viewer verb witness verdict=PASS 8/8; `§W-VIEWER-ACTIONS verdict=PASS` (generated `internal/VIEWER_ACTIONS.md` regenerated, VA4); `§WITNESS_BIM_MCP pass=6 fail=0 verdict=PASS`. New Viewer line: `§CLASH_COUNT_SUM ... sum=<n> OK|MISMATCH`. Caveat: VV3b's sum equality is algebraic (`cleared` is the remainder); the checks with teeth are `cleared >= 0`, `contained <= meshClashes`, and bboxOverlaps == independent count.

**20.2.10 BUILD SPEC (2026-11-09, written before the code; owner go: "Follow your take"; offline: "offline use is also important for air gapping. If viable, its OK."). Supersedes S1 and S2 of 20.2.6 and the "stop does not change" line of 20.2.4 item 4; everything else in 20.2.4-20.2.6 stands.**
- **Files (bim-ootb):** `common/lib/three-mesh-bvh.module.js` (+ `three-mesh-bvh.LICENSE`), three-mesh-bvh@0.8.0 from npm, byte for byte; `viewer/loader.js` imports it from there (the CDN import is gone); `modeller/edit_shapes.js` (the glue `judge`, loaded with `viewer/clash_narrow.js` on the first committed grid move); `edit_report.js` composes, `gateVerdict` reads; `edit_report_panel.js` prints. `viewer/clash_narrow.js` has zero changes.
- **Verdict words per pair:** `clash` | `touching` (MESH_TOUCH_ONLY and `overlapFlat`) | `box only, shapes clear` | `not judged: <reason>`.
- **The stop (decided in 20.2.9 item 1):** the row "New or deeper overlap" counts `clash` + `not judged` pairs; `box only, shapes clear` and `touching` do not stop. The box count stays in the row as `box_count`. If the shape module fails to load, the row keeps today's box count and the report says "shape check unavailable: <reason>, box stop applies".
- **Fields per pair:** both elements (fid, name, class, discipline), `depth_mm` (mesh depth for a clash, else box) with `depth_basis`, `box_depth_mm`, `tol_mm` (the tolerance the box test used), the word, `status` new | deeper against Before. `resolved`: count of box pairs over tolerance before and not after, with the first 20 named (box level: the Before meshes no longer exist). A "checked and cleared" totals line counts touching + box only. Totals are full counts. Storey is in the record (read from the open building's own `elements_meta`; null when the element is not in it, never guessed).
- **The report holds no timing and no heap** (so two runs stay byte-identical); cost goes to `§EDIT_REPORT_SHAPES_COST shape_ms shape_pairs bvh_heap_mb verts`.
- **Witness claims, replacing S1/S2 and added (W-EDIT-REPORT-SHAPES, `modeller/tests/witness_edit_shapes.js`; every one prints INCONCLUSIVE when it judged nothing):**
| # | Claim | Issue it proves or disproves |
|---|---|---|
| N1 | gy10 +1.49 on HospitalGarage: 25 box pairs = touching + box only + clash + not judged, sum 25; the row's stop count is clash + not judged and is below 25 (measured before the build: clash 5). | A box-only pair still stops an edit, or a pair is dropped from the count. |
| N2 | Falsifier: `testPair` stubbed to CLEAR-for-everything gives stop count 0 and N1 FAILS; stubbed to throw gives every pair "not judged" and the stop count equals the box count (the not-judged pair still stops). | A witness that cannot tell a working narrow phase from a broken one; a miss added by the shape test. |
| N3 | Two synthetic solids, L-profile and a block in its notch, give `box only, shapes clear`; two overlapping cubes give `clash`; two cubes sharing a face give `touching`. | Boxes mistaken for shapes. |
| N4 | `git diff origin/main -- viewer/clash_narrow.js` is empty; no second `intersectsGeometry` in `modeller/`. | A forked narrow phase. |
| N5 | Block the BVH file (request aborted): the page works, the row keeps the box count, the report says the check is unavailable. Zero pairs: the module is not called and the report says nothing to judge. | A silent fallback, or a vacuous PASS. |
| N6 | Two fresh Opens give byte-identical `shapes`; undo then redo gives the same tallies. | Non-determinism. |
| N7 | Cost line carries the four fields; `shape_ms` <= 150 on the G2 set; BVH heap returns within 2 MB of before after dispose. | PERF BUDGET, a leak. |
| N8 | Shape module and BVH absent at open, present after the first grid move; W-EDIT-REPORT and W-EDIT-CLI stay green. | Boot weight, regression. |
| N9 | OFFLINE: every request that is not localhost is aborted and counted (geometry served from the local cache file, nothing else leaves the machine); the shape check still runs and gives the same tally as N1. Falsifier: with the vendored file blocked, the check does NOT run. | "Works offline" claimed by a run that still reached the CDN. |
| N10 | The Viewer still gets its BVH: `viewer/loader.js` prints `§BVH_INIT` from the local file with no CDN request. | The repoint broke the Viewer. |

**20.2.11 RESULT (built and witnessed 2026-11-09; bim-ootb PR #2750, merge commit 23570517; spec PR #447).** W-EDIT-REPORT-SHAPES (`modeller/tests/witness_edit_shapes.js`) 18 pass / 0 fail / 0 inconclusive, headless SwiftShader, HospitalGarage. W-EDIT-REPORT 53 pass / 0 fail and W-EDIT-CLI 27 pass / 0 fail stay green (C13-C16, the stop, included). Saved log (final run, after merging origin/main): `build/neuro_lanes_r2/edit_shapes_2026-11-09.log` in the primary checkout (untracked); the § lines are quoted here.
- **What the gy10 +1.49 report now shows.** 25 box pairs (row `box_count`), judged: 5 clash, 0 touching, 20 box only (shapes clear), 0 not judged. The row reads "New or deeper overlap (shapes checked): 5", with `shape_note` "5 clash, 0 not judged (box verdict kept), 20 cleared (0 touching, 20 box only)". Each pair carries both elements (fid, name, class, discipline, storey), `depth_mm` (mesh depth for a clash), `box_depth_mm`, `tol_mm` 20, the word, and new/deeper; `resolved` is a count (0 here) with the first 20 named; `cleared` is 20. `§W-EDIT-SHAPES N1 PASS ... the stop reads 5 (clash 5 + not judged 0), not 25`.
- **The stop, before and after.** gy10 +1.49 stopped on 25 box pairs; it now stops on 5. Hospital shift gx39 +1 (the guide's G6) stopped on 18; it now stops on 8 (8 clash, 10 box only; measured with edit_cli, 45 s). The stop still fires (W-EDIT-CLI C13 PASS "stopped: New or deeper overlap (shapes checked): 1 ..."). A stub that calls everything CLEAR gives stop count 0 and flips N1 (`N2-clear PASS`); a stub that throws gives 25 "not judged" and the stop count stays 25 (`N2-throw PASS`, why "error: stub failure"): the shape test removes false stops and cannot add a miss.
- **Failure and zero.** BVH file refused by the server: `N5a PASS state=FALLBACK count=25 note="shape check unavailable: Failed to fetch dynamically imported module ...three-mesh-bvh.module.js; the box count and box stop apply"`, stop still true. Zero box pairs (gx2 +0.2): `N5b PASS` state NOTHING_TO_JUDGE, judge not called, note "no box overlap to judge, so the shape check was not run".
- **Offline.** `N9 PASS`: a fresh browser with every non-localhost request aborted and counted (0 attempted, 0 CDN), the OCI geometry URL answered from `~/.cache/bim-modeller-geo` (the file that URL serves), still 25 judged and 5 clash. Falsifier `N9f PASS`: with the vendored file refused the check does NOT run (FALLBACK). The service worker precaches `common/lib/three-mesh-bvh.module.js`, `viewer/clash_narrow.js` and `modeller/edit_shapes.js`. The witness runs with real service workers and refuses the file at the server (404), so a cached copy cannot mask it. **Not measured:** a real air-gapped machine; the real OCI geometry download is not offline-capable (the geometry file must already be local).
- **Viewer.** `N10 PASS`: `viewer.html` boots with `§BVH_INIT three-mesh-bvh v0.8.0` from `common/lib`, requested from localhost, no CDN request (`§BVH_FETCHED ms=10`).
- **Cost per edit (HospitalGarage, one run, CPU, loaded machine).** gy10 +1.49: `§EDIT_REPORT_SHAPES_COST shape_pairs=25 verts=60612`, 23 meshes, `shape_ms` 84 to 195 across five runs on a machine at load 15 to 33 (cold 94 / 156 / 195, repeat 101; the witness bound of 150 ms is judged on the best of cold and repeat); gy11 -1.49: shape_ms 2.4 to 4.9, 2 pairs, 76 verts. Module load on the first grid move: `§EDIT_SHAPES loaded ms=13-16` (the page keeps it). BVH heap: the witness forces a GC before and after (build, judge, dispose); the delta is zero or negative (-18, -9 MB: earlier garbage collected), so there is no leak; the BVH adds no vertices. Overlap judge total including the report `§EDIT_REPORT_COST ms=258.7` (moved 521, elements 864). `shape_ms` includes reading the element names from `elements_meta` (a one-off open of the meta.db, cached for the page).
- **N3 (synthetic).** L-profile + block in its notch: boxes overlap, word "box only, shapes clear"; two cubes overlapping 0.5 m: "clash"; a block flush on the notch wall: "touching" (testPair says CLASH with `overlapFlat`, which the report words as touching per 20.2.9 item 3). N4: `viewer/clash_narrow.js` has no diff against origin/main, no second `intersectsGeometry` in `modeller/`. N6a/N6b: two fresh Opens give byte-identical `shapes` (12,109 bytes); undo then the same edit gives the same verdict per pair. N8: `EditShapes`, `clashNarrow`, the BVH and any request for them are absent at open and present after the first grid move.
- **Found on the way (not fixed here).** (1) Opens in one browser profile share IndexedDB, so a second Open restores the first one's edits: the Before count drifted (2202 -> 2203, 25 -> 28 pairs) until the witness used a fresh browser per Open, as `edit_cli` does. Any future witness must do the same. (2) `docs/ProposerGuide.md` and `witness_proposer_guide.js` G6 quote "New or deeper box overlap: 18": after the deploy the stop reads 8 of 18 box pairs. The witness now accepts both forms (box 18, or shapes 8 of 18); the published guide text still needs the owner's docs deploy (`scripts/safe_gh_deploy.sh`), not done here. (3) The §15.1 rehearsal table (gy10 stopping on "overlap: 2") stays unexplained; the IndexedDB drift above is a candidate cause, not proven.
- **Not done.** Tolerances unchanged (`CLASH_TOL` 0.02 m; the per-pair divergence from `clash_rules.json` is recorded in 20.2.9 item 5, not changed). Rotated buildings (`--lattice-boxes`), Terminal, BCF export, grouping by system: not covered. Resolved pairs are box-level only (the Before meshes no longer exist).

### 20.3 PROTOCOL (pre-registered 2026-11-09): a measured run of an AI using the connector, with the stop and report versus without
**Issue it answers:** START HERE open question 3 and §20.1 item B: *does the report and the stop help a proposer, measured fairly, at no cost to the project?* **Status: written, nothing run.** This lane made no model call of any kind. Everything below was read from bim-ootb `origin/main` on 2026-11-09: `modeller/tests/proposer_test/run.js` (240 lines), `briefs.json`, `modeller/tools/bim_mcp.js` (88 lines), `modeller/tools/edit_cli.js`.
**Pre-registration rule:** this section is committed to master before any run. After a run, any change to it is added below as a dated `DEVIATION` line (what, why, whether any result had been seen); the original text stays. A run done under a changed protocol is reported as a deviation, never as this protocol.

**1. Arms** (one change between them: what the connector gives back)
| Arm | What the AI is given | How it is produced today |
|---|---|---|
| **A0 baseline: no report, no stop** | `bim_lines` as now. `bim_try_shift` makes the shift on a fresh copy and returns only `{ok, applied:true, line, move}`: no report rows, no `stopped_by_gate`, no `reason`, no `notChecked`. Instructions drop the two sentences about the stop and the report. | **Not producible with existing switches.** `edit_cli --report-only` removes the stop but still returns the full report (`edit_cli.js` lines 13, 130), and `bim_mcp.js` has no switch at all: `bim_try_shift` always runs the stop (its `args`, line 41, passes no `--report-only`). |
| **A2 treatment: report and stop** | The connector exactly as shipped: report, stop, reason, `notChecked`, all instructions. | Today's `bim_mcp.js`, unchanged. |
**Minimal missing switch (a follow-up, not built here):** env `BIM_MCP_ARM=bare|full` read in `bim_mcp.js` (default `full` = today, byte for byte). `bare` runs `edit_cli` with `--report-only`, keeps only `ok` and the edit echo from its JSON, and uses an INSTRUCTIONS string without the stop and report lines. It must be witnessed in W-BIM-MCP: `full` unchanged (M2 still byte-identical), `bare` answer contains none of `rows`, `newRows`, `stopped_by_gate`, `reason`, `notChecked`.
**What this contrast does and does not say:** A2 minus A0 is the effect of *the whole feedback channel* (report plus stop together). It cannot separate the report from the stop. A middle arm A1 (report, no stop = `full` plus `--report-only`) would, and is **exploratory only**: it is not in the primary test, see open question 3. The AI's *instructions* differ between arms because the stop and report are described there; that is part of the treatment, not a leak.

**2. Briefs, fixed in advance:** all 10 in `briefs.json` as of bim-ootb `origin/main` on 2026-11-09, no new ones, none dropped: G1, G2, G3, G4, G5, G6, G7 (HospitalGarage) and S1, S2, S3 (SampleHouse). Half are traps by the file's own note; **G4 and G5 are `impossible: true`**. Reason for no new briefs: they are the set §12 to §14 were measured on, so the new run is comparable on the same requests, and a brief written now, after §15's stop is known, could be steered towards it. The commit hash of `briefs.json` is recorded in the run folder before the first session (owner command 1).

**3. Model access:** the owner's own Claude Code plan login, run by the owner, in the owner's terminal. The project, its sessions and its agents never call a model, never pass `--model-calls` (§14.6) and never run `claude` for this. No API key. One model for all sessions: the one the owner's plan gives, recorded per session from the call log's `initialize` and the owner's own note (`claude-sonnet-5-5` was the model of all earlier runs, §12). Each session is a fresh one in an empty folder with only the `bim` connector (`--strict-mcp-config`), no project files, no memory, so no session sees an earlier answer. Whether the owner's plan allows ~60 sessions is the owner's call (open question 1).

**4. Sample size, honestly:** 10 briefs x 3 repeats x 2 arms = **60 sessions**, fixed.
- Why: it matches the earlier runs (10 briefs, 3 repeats, §12), so counts are comparable; and 60 sessions is a load the owner can do by hand.
- What it could detect: with 30 sessions per arm, a gap such as 15 of 30 right against 24 of 30 (the §14 gap, 50% to 80%) needs about 38 per arm for 80% power at the 5% level (standard two-proportion formula, computed 2026-11-09), so this run has **roughly 70% power for a gap that large**, and a gap of 30 points or more is the smallest it can be expected to show. It **cannot** detect a 10-point gap: that would need about 390 per arm.
- Repeats are not independent: the 3 repeats of one brief are the same decision. The real unit is the brief, **10 pairs**. So the primary comparison is paired by brief (section 6), and 60 sessions must never be quoted as 60 independent trials. §12's own limit stands: about 10 real decisions.
- One model, our briefs, our building: the result says nothing about other models or other requests.

**5. Scoring: the existing scorer, unchanged**
- The scorer is `run.js` `classify()`, `goalMet()` and `crossed()` plus the class list of §12. Nothing in them changes.
- **What it is fed:** the AI's **final answer**, the same JSON the proposer test already parses (`parseProposal`: `{"edits":[...],"decline":bool,...}`), asked for at the end of every session in both arms. `run.js` judges each proposal by `edit_cli` from a fresh Open, with the stop **on, in both arms** (the judge is not the arm). Judging is arm-blind.
- **The connector call log (`BIM_MCP_LOG`, §18) is the audit trail, not the verdict:** it gives the count of tool calls, the number of `stopped_by_gate` answers, and whether the final answer equals a change the AI actually tried. A final answer whose edit was never tried through the connector is recorded as `UNTRIED_FINAL` and reported (it scores as normal).
- **Missing piece, a follow-up:** `run.js` has no mode that reads a final answer and a call log from files (it only generates proposals itself). Needed: `run.js --score-session <final.json> --brief <id> --calllog <log>` that reuses `classify` and `goalMet` on that proposal and prints one `§PROPOSER_SESSION` line. Until it exists the run cannot be scored; this protocol does not allow hand-scoring.
- The scorer must pass `node run.js --stub` first (its S1-S4, H1-H3 checks, §14.6); the run folder keeps that log.

**6. Order, blinding, and the test**
- **Order:** the 60 (brief, repeat, arm) sessions are listed in a random order drawn once from a fixed seed (`seed = 20261109`) and written to `order.json` before session 1. The owner runs them in that order, no skipping and no re-running a bad-looking one.
- **Blinding:** the AI is not told the arm name or that it is in a test. The owner is *not* blind (they set the arm); scoring is automatic by the unchanged scorer, so the owner's knowledge cannot move a score. Stated as a limit, not hidden.
- **Primary measure:** the number of sessions with a **right outcome** (section 7) in each arm, out of 30.
- **Primary test:** per brief, right outcomes out of 3 in A2 minus in A0; **sign test across the 10 briefs, two-sided, 5% level**, briefs with a zero difference dropped and counted. The raw 2x2 counts (A2 right/not right, A0 right/not right) are reported beside it, with no p-value from them, because the repeats are not independent.
- **Secondary, descriptive only (no test):** class counts per arm (§12 classes); how many sessions ended RED, STOPPED, LEFT_BEHIND, UNTRIED_FINAL; on G4 and G5, declines per arm; tool calls per session from the call log; "said safe/OK" in the final text (the instruction forbids it).

**7. What counts as a right outcome (quoted from §12, not changed):** *"goal met by arithmetic, CLEAN or PARTLY_JUDGED, no lines crossed; or DECLINED on the briefs marked impossible."* Classes: CLEAN, PARTLY_JUDGED (nothing moved, only spans judged), RED, STOPPED (§15.1), LEFT_BEHIND (§14.1), REFUSED, DECLINED, INVALID, FAILED. *"Orange does not count."* Goals are checked by arithmetic on the grid lines, independently of the report (`briefs.json` note). An INVALID or FAILED final answer is not right.

**8. Stop rule (fixed before any run)**
- The run is the 60 listed sessions, in order, and no more. No session is added, repeated or dropped after seeing a result; no interim look at scores before all 60 are done (the owner may watch for plumbing faults only).
- A session that fails for a plumbing reason (connector did not start, `claude` crashed, tool call log empty) is **re-run once, same slot**, and both attempts are kept in the report. Plumbing is judged from the call log alone, never from the answer.
- **Abort** and report as "not completed" if more than 6 of the first 20 sessions are plumbing faults. Nothing is concluded from a part-run except the fault counts.
- A session that ends with no final JSON counts as INVALID, in its arm.

**9. Reported whatever it shows:** both arms' counts of 30; per-brief 3-vs-3 table; the sign-test result; every class count; every deviation; every plumbing re-run; the session transcripts' tool-call logs. If A2 is no better than A0, or worse, that is the headline, said first, with the same weight as a gain. Reported limits, always: ~10 real decisions, our briefs, one model, owner not blind, power about 70% for a 30-point gap, no gap under ~30 points detectable, structural capacity never checked (§5), a pass never means safe. No figure from this run goes in the film, the guide or the paper before it is in this section.

**10. Exact commands the owner runs** (`<D>` = a run folder, e.g. `~/proposer_run_2026-11/`; bim-ootb at the same `origin/main` for the whole run)
Items marked **[follow-up]** do not exist yet; the run waits for them.
1. Freeze: `git -C ~/bim-ootb fetch origin && git -C ~/bim-ootb rev-parse origin/main > <D>/bim-ootb.sha` and `sha256sum ~/bim-ootb/modeller/tests/proposer_test/briefs.json > <D>/briefs.sha`
2. Scorer check, free: `node ~/bim-ootb/modeller/tests/proposer_test/run.js --stub > <D>/stub.log 2>&1` then read `<D>/stub.log`: every line must be a pass.
3. Order **[follow-up: `--make-order`]**: `node run.js --make-order --seed 20261109 --out <D>/order.json` (60 rows, random, fixed seed).
4. Per session, in the order of `order.json`, in a fresh empty folder, for arm `full` or `bare` (**bare needs the `BIM_MCP_ARM` switch [follow-up]**):
   `mkdir -p <D>/s<NN> && cd <D>/s<NN>`
   `claude mcp add --scope local bim -e BIM_MCP_ARM=<full|bare> -e BIM_MCP_LOG=<D>/s<NN>/calls.jsonl -e NODE_PATH=/home/red1/bim-compiler/node_modules -- node ~/.local/share/bim_proposer/bim_mcp.js` (the install of §18; copies of the live files must match the frozen sha)
   open Claude Code there (interactive, the owner's login), and paste the brief prompt from `<D>/prompt_<id>.txt` **[follow-up: the same text for both arms: building, request, "use the bim tools, then reply with the final JSON {edits, decline, reason}"]**; save the final JSON reply to `<D>/s<NN>/final.json`; then `claude mcp remove bim`.
5. Score **[follow-up: `--score-session`]**: for each session, `node run.js --score-session <D>/s<NN>/final.json --brief <id> --calllog <D>/s<NN>/calls.jsonl >> <D>/scores.log 2>&1`
6. Tally **[follow-up: `--tally`]**: `node run.js --tally <D>/scores.log <D>/order.json > <D>/result.json`; read `<D>/scores.log` first (log mandate), then `result.json`.
7. Write the result into this section (a dated `RESULT` line, favourable or not), and commit.

**11. Follow-up work this protocol needs, listed so a later session can build it (none is built here; spec only, no model, ~no cost)**
- `BIM_MCP_ARM` switch in `bim_mcp.js`, witness W-BIM-MCP M6 (full unchanged, bare has none of the report fields), falsifier: bare that leaks `rows` must fail M6.
- `run.js --make-order`, `--score-session`, `--tally`, witnessed in `run.js --stub` (new checks S5a-S5c), each naming its issue: a session scored from files equals the same proposal scored by the generator path; a final answer never tried is flagged `UNTRIED_FINAL`; the tally refuses to print if it saw fewer than 60 sessions (INCONCLUSIVE, never a verdict).
- **The optional no-model dry-run checker, not built this time:** a scripted client plays one brief per arm through the connector (W-BIM-MCP M3 pattern, `modeller/tests/witness_bim_mcp.js`), writes its own `final.json` and `calls.jsonl`, and the new `--score-session` and `--tally` score them. File: `modeller/tests/witness_proposer_protocol_dryrun.js`; witness name **W-PROPOSER-PROTOCOL-DRYRUN**. It proves the pipeline end to end (order, arms, log, scorer, tally) before the owner spends a session; it proves nothing about an AI. Its tally must print INCONCLUSIVE with 2 sessions, not a verdict.

**12. Open questions for the owner, one per line**
1. Does the owner's plan allow about 60 interactive sessions, and is the owner willing to run them by hand (about a minute of attention each, 10 to 40 s per connector call)?
2. Is "report and stop together versus nothing" the contrast wanted, or must the report and the stop be separated (needs the A1 arm, +30 sessions)?
3. Add the exploratory A1 arm (report, no stop) now, or only if A2 beats A0?
4. Is one model enough, or should a second model (if the plan has one) repeat it as a separate run?
5. Accept 10 briefs, 3 repeats (about 70% power for a 30-point gap, nothing finer), or raise the repeats to 5 (100 sessions, still 10 pairs, so little gained for the test)?
6. May the three follow-ups (`BIM_MCP_ARM`, the three `run.js` modes, the dry-run checker) be built before the run, each with its own go, as §20.1 requires?

## 21. SPEC (2026-11-09): the actor layer: one door into the engine for every agent, and the ERP verbs behind it
**Owner's words (2026-11-09):** *"we want to extend this CLI verbage to the Kernel ERP too, where one of my early days pristine idea is to use the other killer app, email to be the spine of an ERP. And ERP less ERP or Email driven ERP, where communication between actors via email is sufficient events and ERP panel should not be called up other than reports and those too get attached to email. Now the list goes on beyond just human and AI scripting. Mobile devices events can also trigger doc actions and processes. Spec'd this out if no other doc owns this. That means we can have a actor layer to abstract for any agent ie AI, Human, Email, Mobile, Device.."*
**Status: SPEC only. No code without the owner's go.** Spec-first; every claim cites a file; the twin rule applies on the ERP side (CLAUDE.md, `prompts/SQLiteIDEMPIERE.md`).

### 21.0 Who already owns what (checked 2026-11-09; this section does not re-spec any of it)
| Piece | Owner | What it already says |
|---|---|---|
| The engine's one write path and its context | `docs/internal/ENGINE_CONTRACT.md` §1-§2 | Five calls; `dispatch(intent, ctx)` is the only mutation path and returns `{ok, op_uuid, before, after}` or `{rejected, why}`; `verbs(ctx)` lists the legal actions for a doc-state, role-filtered; `ctx = {actor, pubKey, roleId, allowOrgs}`; writes are gated engine-side. |
| The ERP as a conversation (email, WhatsApp, Telegram) | `docs/internal/SocialPlatformLens.md` §2, §5, §6 | The system sends digests, approvals and exceptions; a reply is a signed party-act; a reply is a *claim* until bound (known address + per-action token + signature); replies map to canned actions; free text becomes a flagged question, never a guessed order; WhatsApp automation limits. |
| The op-log as a message stream | `prompts/MOBILE_CHAT_LENS.md` | op = message, document = thread, DocAction = reply, `user_tag` = sender, via the seam's `dispatch`; "NO fork of a verb, NO new verb". |
| Transport between devices | `prompts/TEAMWORK_FRAMEWORK.md`, `docs/internal/GuaranteedChannels.md` | Signed ops over the GitHub pipe (bim-ootb `common/comm/comm_pipe.js`) and the Gmail post box (`prompts/archive/TEAMWORK_FRAMEWORK_history_s0-s44.md` §11.19; a Google Apps Script web app, `common/comm/comm_phone.html:28`, that carries signed bundles device to device); local-first, per-device keys. |
| The verb list and its contract | this file §19 | Three layers (syntax · verb contract · implementations), one `verbs.json`, X of N from the app's own tables. |
| What N is on the ERP side | CLAUDE.md AD-LAYER LAW | Generic AD engine; claims are "X of N AD windows/processes/doctypes", N from `ad_seed.db`. |
**Not owned anywhere:** one abstraction by which *any* agent (an AI, a person in a UI, an email reply, a phone event, a device) reaches the same engine, and the ERP's verb list exposed to it. The email post box today carries machine bundles. Nothing turns a person's email into a DocAction yet.

### 21.1 The model: an actor acts through a channel; both reach the engine through one door
> **Terms remapped 2026-11-09 (§0):** delivery (email, mobile, MCP, CLI) now belongs to the ACTOR; CHANNEL is the verb vocabulary; the DOOR is one scripting engine. The parse, bind and reply steps below are the door's steps; read "channel adapter" as "the actor's adapter".
Proposed, **one question for the owner (21.6 Q1)**. The owner's list mixes *who* acts with *how* it arrives. Email and Mobile are ways in, and behind them stands a person, an AI or a device. Kept apart:
- **Actor (who):** a person, an AI agent, a device (scanner, sensor, till), or a scheduled process. Identity = `ctx.actor` + `pubKey` + `roleId` (ENGINE_CONTRACT §2), unchanged.
- **Channel (how):** UI click · CLI / script line · MCP tool call · email · mobile tap or chat reply · device event. A channel carries evidence of who sent it (a signature, a known address plus a token, a device key).
- **The door:** every channel adapter does exactly three things, and nothing else:
  1. **parse:** the inbound event becomes `(actorRef, intent, evidence)`, where `intent` is a verb from the generated list (21.2). Text that does not parse to a listed verb is not an intent. It goes back as a question, as SocialPlatformLens §5 rules.
  2. **bind:** `actorRef + evidence` becomes `ctx`, or the event stays a *claim*. The binding strength follows the stakes (SocialPlatformLens §6). An unbound claim never reaches `dispatch`.
  3. **reply:** the engine's own answer (`{ok…}` or `{rejected, why}`, the report) goes back on the same channel. For email that is the reply mail, with any report attached (the owner's "reports attached to email").
- **What a channel adapter may not do:** decide, repair, compute business values, or hold a second copy of a rule. The engine decides; `dispatch` is the judge, as the app's own checks are in M1 of the defensive disclosure. One implementation per responsibility.
- **The BIM side is the same shape:** the MCP connector (`bim_mcp.js`) and `edit_cli.js` are two channels into the Modeller's engine (§11, §18). So "the actor layer" is one contract for both apps, not an ERP feature.

### 21.2 The ERP verb list, generated from the dictionary (AD-LAYER LAW)
- **Verbs are not hand-written.** DocActions come from each document type's own action list (the DocAction reference list and `C_DocType`, as the engine's `verbs(ctx)` returns them per doc-state). Processes come from `AD_Process`. Reads come from the window/tab dictionary. The generator follows the §19.1 pattern: an inventory from `ad_seed.db` gives **N**, and the verb list exposes X of it.
- **A verb's contract** = name, plain description, inputs with units or reference types, the doc-states it is legal in, its harm class (read / writes / posts / sends), and which channels may carry it. Example: a Complete that posts to the books may need a signed tap, not a one-word email reply (SocialPlatformLens §6).
- **One list, all channels:** `tools/list` for an AI, the email command vocabulary, the mobile cards' buttons and the script runner's keywords are generated from the same list (§19 design point 2).

### 21.3 Email as the spine (the owner's "ERP-less ERP")
- **In:** an email to the ERP's address, or a reply to a mail it sent. Its subject or token names the document. The body or a button-link picks a listed verb (`Approve`, `Complete`, `Reject`). The adapter parses, binds (known address + per-action token; signature where the stakes need it), and dispatches.
- **Out:** every engine answer is a mail: the result, the reason for a rejection, the next legal verbs as reply options, and reports as attachments (the report output the AD defines; never a new report engine).
- **No panel needed** for the flow itself. The ERP window remains for reports and for setup. The SocialPlatformLens persona already lives this way; this section makes it the default door.
- **Transport is not re-specced:** inbound and outbound mail ride the existing post box or a mailbox the owner chooses (Teamwork history §11.19). Legacy iDempiere already sends mail (GuaranteedChannels: "email comm (iDempiere API, tested)"). Under the twin rule, what an emailed Complete *does* must equal legacy's Complete (21.5 A5).

### 21.4 Mobile and device events
A phone tap, a barcode scan, a GPS check-in, a sensor reading or a till ring becomes an intent through its own adapter. It carries the device key as evidence (Teamwork per-device keys), and the same `dispatch` judges it. A device may only fire verbs whose channel list names it. A sensor can post a reading; it cannot Complete an invoice.

### 21.5 Witnesses (written before any code; each names its issue)
- **A1 (a channel changes the result):** the same intent through CLI, MCP, email and a mobile event gives byte-identical ops and results, apart from the channel and evidence fields. Falsifier: one adapter alters an input; A1 must fail.
- **A2 (a channel can get round a gate):** a verb the role may not use, or an owner-gated record, is rejected the same way on every channel, and the `why` comes back on that channel.
- **A3 (a spoofed mail becomes an act):** an unknown address, a wrong or reused token, or a missing signature where one is required leaves a claim and creates no op. RED: the same mail properly bound creates exactly one op.
- **A4 (N is hand-made):** the ERP verb inventory is generated from `ad_seed.db`; an independent count of DocActions and processes equals it; X of N is printed per channel.
- **A5 (the twin breaks):** an emailed Complete of a Sales Order gives the same documents and the same books as legacy iDempiere's Complete (the parallel run, `scripts/bridge/run_all.sh`).
- **A6 (a duplicate mail double-acts):** the same intent arriving twice, by mail and by mobile, dedupes by op UUID (SocialPlatformLens §5), so one op.

### 21.6 Open, for the owner (one at a time)
- **Q1, updated later the same day (owner: *"actors can be email, mobile, devices, AI/Human"*):** the ACTOR column lists Email, Mobile, Device, AI and Human (§0); each still binds to the identity behind it, and CHANNEL is the concrete way in. Earlier wording, kept for the record:
- **Q1 DECIDED 2026-11-09 (owner: *"keep them apart, go with your actor/channel split"*):** actor (who) and channel (how) stay apart, as in 21.1. Email and mobile are channels with a person, an AI or a device behind them.
- Later, after Q1: the first slice. Proposed: the ERP read verbs plus one DocAction (Complete a Sales Order) over CLI/MCP and email, X of N measured. Nothing sent outside the sandbox mailbox without the owner's word.

### 21.7 SPEC (2026-11-09): the ERP verb inventory, the denominator for X of N: W-ERP-VERBS
**Issue:** §21.2 says the ERP verb list is generated from the dictionary; nothing generates it, so "X of N ERP verbs offered to actors" has no N. Read 2026-11-09 on bim-ootb origin/main `7f08bdc5`: `erp/ad_seed.db` (SQLite, tracked, read-only here) holds the dictionary; the kernel's `verbs(ctx)` (`erp/erp_seam.js:162`) only reflects `K.handlers()` (`erp/erp_kernel.js:276`), and that registry is **filled at run time by the host**, not by the kernel. So "what the kernel implements" cannot be read from the kernel file; it is read from the registration sites.
**N is two populations, never summed silently, always printed apart:**
- **N_doc** = pairs (document table, DocAction). Document table = a table in `AD_Table` that has an `AD_Column` named `DocAction` (54 today). DocAction = a value of `AD_Ref_List` under `AD_Reference` 135 (`_Document Action`) other than `--` (`<None>`). Reason: C_DocType has no per-type action list; the action set is the reference list and the legal-from-state rule is the wfmc (`erp/manifest.json` `wfmc.transitions`). A pair is counted whether or not a state makes it legal; legal-in-the-wfmc is a separate column.
- **N_proc** = active `AD_Process` rows (`IsActive='Y'`). Inactive rows are counted and shown but are not in N (a person cannot run them).
- **N = N_doc + N_proc.** Reads (window/tab fetches) are **not in N here**: they are not DocActions or processes, §21.2 files them under the window dictionary; they get their own population when that slice is specced. Stated, not dropped.
**Three levels, reported separately for each population:**
- **(a) in the dictionary:** N itself.
- **(b) implemented by a handler:** doc pairs: a `K.register(table, action, ...)` call found in the tree outside `tests/`, resolved at its registration site (live host `erp/idempiere.html` `KDOC_TABLES` × the wfmc actions through `erp/kanban_host.js:73`; the standalone lens `erp/kanban_lens.html:249`; literal calls such as `erp/mfg_snapshot.js` `PP_Order:CR`). Registrations whose table or action comes from a data file at run time (`erp/erp_picker.js`, `erp/odoo_agent/agent.js` fold a chain file) and spikes are **listed as DYNAMIC / NOT COUNTED** with the reason. Processes: the process's class name resolved by `AdProcess.resolveClassname` is a key `registerHandler('...')` registers in `erp/ad_process.js`. A handler with no dictionary row (e.g. `PP_Order:CR`; `CR` is not in reference 135) is listed as **HANDLER WITHOUT DICTIONARY ROW**, not dropped. A dictionary row with no handler is listed **NOT IMPLEMENTED**, not hidden.
- **(c) offered as a verb to actors today = X.** Expected 0: no verb list exists for actors. The generator reads the actor verb list if the file exists (`erp/actor_verbs.json`, not yet created) and prints X from it; absent file = X 0 with that basis stated.
**Harm class, by a rule table in the generator that cites its source (same discipline as §19.1 R5):** `read` (a report process, `IsReport='Y'`) · `writes` (changes a document's status or data: AP RJ PR IN XL WC CL RE VO, and any process no other rule matches, basis printed "no rule matched, assumed writes") · `posts` (creates accounting facts: CO, PO, RC, RA by `DocumentEngine` and `erp/ad_docfsm.js`; processes whose class name or value matches the posting rules) · `sends` (a process whose class name matches mail/notice/request rules; no DocAction sends). A `read` class is never printed as "safe".
**Deliverable (bim-ootb):** `scripts/gen_erp_verbs.js` writes `internal/ERP_VERBS.md` (generated header; counts recomputed each run; file:line per handler). Header line: `§ERP_VERBS N=… N_doc=… N_proc=… dict=… impl=… X=… not_impl=… handler_no_dict=… dynamic=…`.
**Witness `tests/witness_erp_verbs.js` (each case names its issue):** EV1 (N is hand-made) the dictionary counted independently by plain SQL (`sqlite3` CLI, not the generator's reader) equals the generator, for tables, actions, active processes · EV2 (a handler is missing) every `K.register(` and `registerHandler('` site found by an independent grep outside `tests/` is a listed handler or a listed DYNAMIC site · EV3 (stale file) regenerating gives the committed bytes, twice · EV4 (vacuous) an empty dictionary (temp DB with the tables and no rows) gives INCONCLUSIVE, never PASS · EV5 (a count can be wrong silently) falsifier `EV_BREAK=1` drops one dictionary row and EV1 must fail.
**Not in this step:** a verb list for actors, any channel, any runtime change, any DB write.
**RESULT 2026-11-09 (bim-ootb PR #2739):** `§ERP_VERBS N=1153 N_doc=702 (tables=54 actions=13) N_proc=451 (inactive=25) impl=102 (doc=65 proc=37) not_impl=1051 X=0 handler_no_dict=1 dynamic=4 unresolved=0`. So: **(a) 1153 in the dictionary, (b) 102 have a handler, (c) 0 offered to actors.** Doc handlers are the generic Kanban `SET_STATUS` registration only: 5 tables (C_Order, C_Invoice, C_Payment, M_InOut in the live host; PP_Order in the standalone lens) × 13 actions = 65 pairs, and that handler changes a status and posts nothing, so even "implemented" is not the legacy Complete (that is A5, not this step). One handler has no dictionary row (`PP_Order:CR`, `erp/mfg_snapshot.js:100`). Four registrations are dynamic or spike and are not counted. Process handlers: 37 of 451 active rows (414 NOT IMPLEMENTED). 54 "document tables" include dictionary views ending `_v` (the dictionary gives them a DocAction column). W-ERP-VERBS 6/0: `EV1 SQL tables=54 actions=13 active procs=451 → N=1153` equals the generator · `EV2 K.register sites grep 6 generator 6; registerHandler classnames grep 18 generator 18` · EV3 committed file current · `EV4 empty dictionary → exit 2` INCONCLUSIVE · `EV5 EV_BREAK=1 lists 12 DocActions (SQL 13) → caught`; `EV_BREAK=1` run → verdict FAIL (EV1 and EV3). Could not determine: whether actions are legal per document *type* (C_DocType carries no action list, so the pair count is table × reference list, and legality per state is the wfmc, which lists all 13).

## 22. FILM "CLI for OOTB Kernel Trilogy, Part II: More commands for your AI to be right" (sequel to Part I, §16; owner decisions in §22.7)
**Owner's ask, verbatim (2026-11-09):** *"Expand on the NEURO film sequel on the big picture there, and examples of verbs we done"*.
**Gates (same as §16):** no capture, voice or cut without the owner's go. **No model call to make footage** (§14.6). No real AI session exists yet (▶ RESUME HERE: rc4 is a labelled scripted demo), so every AI-side line is either a scripted client labelled **"scripted client, no AI"** (W-BIM-MCP M3) or, if the owner runs the rc5 session first, quoted verbatim from its call log with date and model. **Public fixtures only** (Duplex, HospitalGarage, Hospital): verb 6's first real use was on a private set and must not appear; its public-fixture numbers below do. Pipeline: copy `scripts/film_neuro/` (resolve → guard → record → fit → mux); every digit resolves to a row here or a `§` line. English first.

### 22.1 The big picture: film 1 was one edit, the sequel is the whole menu
- **Film 1 said:** one outside AI proposes one edit; the compiler on your own machine judges it and stops new red (§16).
- **The sequel says:** the app becomes a **menu of described verbs**. Each verb is one thing a person can do with the mouse, offered with exact inputs. Any actor (an AI, a person, a device) uses the same menu, and the app's own checks decide. Three promises carry it:
  1. **The verb tells the truth about the app.** Each verb's answer is the app's own answer, byte for byte, and a planted break must fail its test (§18 M2, §19.4 VV1-VV3, VV-RED).
  2. **The count is honest.** Coverage is X of N, and N is read from the app's own tables, never hand-picked: Viewer **1 of 64** actions, ERP **0 of 1,153** actions (§19.1, §19.4, §21.7).
  3. **The judge stays inside.** No AI inside the app; an edit that adds a new problem is undone and the reason goes back (§15.1). A clash means real shapes intersect beyond the tolerance, as the industry defines it, never just boxes (§20.2.9).
- **Where it goes:** one door for every actor and every channel (screen, script, AI menu, email reply, phone tap, device event), and email as the spine of the ERP (§21). **Spec only, nothing built**; the film says so.
- **Closing line (approved 2026-11-09, §22.7 item 4):** *"Any AI may propose. Only the building decides."*

### 22.2 The verbs done, with their real numbers (what the film may show)
| Verb (where) | What it does | The example, from its witness | Proof it is the app's own answer | Source |
|---|---|---|---|---|
| `bim_lines(building)` (Modeller, connector) | reads the grid in the building's own frame | HospitalGarage bay gx5-gx6 = **11.176 m**, rotation −2°, frame = building | = `edit_cli --lines`, byte for byte (2,701 bytes, `ms` aside) | §17, §18, #2712, #2713 |
| `bim_try_shift(building, line, move)` (Modeller, connector) | moves a block of the building by one grid line; reports; the stop | the G4 request: shift gx6 by 1.824 m → **stopped**: "Beam spans over limit: 91 → 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m"; the building is back | = the same `edit_cli` call (2,659 bytes); `MCP_BREAK=1` halves the move and fails M2b, M3 | §15.1, §18 |
| `viewer_counts(building, by)` (Viewer, connector) | counts elements by discipline or storey | Duplex **1,193** elements: MEP 809, ARC 270, ELEC 81, STR 19, PLB 14 | = the Viewer's own `§ASK_ANSWER id=counts` and `GROUP BY` on the DB; break gives 1,192 and fails | §19.4 VV1, VV2, #2740 |
| `viewer_clashes(building, discA, discB)` (Viewer, connector) | the Find panel's clash answer for a discipline pair | Duplex ARC vs MEP at 25 mm: **393** box overlaps, **291** real clashes, **102** cleared by the shape test, 0 unjudged | 291 + 102 + 0 = 393 = an independent uncapped count; the old sum (447, −54) fails | §20.2.9 RESULT, #2744 |
| `film_path_visibility(db)` (Viewer, command line) | says what each stretch of a film's camera path actually sees, without baking | public fixture: forward band sees lines **2/2**, markers **1/1**; the same band reversed sees **0/2**, **0/1** | the cinema engine's own camera at each sample; reversed band must go blind | §19.3, #2736, #2737 |
| Inventories (not verbs, the denominators) | count what could be offered | Viewer: 96 entry points, **64** actions, 5 buttons showing the wrong key; ERP: **1,153** actions (702 document actions + 451 processes), 102 with code, 0 offered | an independent recount equals each generator; a planted break is caught | §19.1, §21.7 |

**The honest beat this list gives (approved 2026-11-09, §22.7 item 4):** the first Viewer verb exposed the Viewer's own wrong sum: it answered "200 box overlaps, 229 clashes, −29 cleared". The verb repeated the app faithfully, the witness flagged it, and the cause was two bugs in the app (a double count and a 200-row page cap), now fixed: 393 / 291 / 102. **A verb that repeats the app can only be as right as the app; the witness is what caught it.**

### 22.3 Storyboard (about 180-210 s with the CLI chapter; PLAYBOOK C, same two voices as film 1)
| # | Picture | Dialogue (F asks as a newcomer, M answers in one or two plain sentences) | Source |
|---|---|---|---|
| 0 | Title card: kicker "the sequel to Think Global, Act Local"; "Outside AI," / (coral) "Inside Judge" | none | — |
| 1 RECAP | Film 1's stop in one shot: the G4 report panel, **STOPPED**, bay 13 m against 12 m | F: "Last time the AI got stopped." M: "One edit, judged by the building's own rule." | §15.1 |
| 2 MENU | The connector's real `tools/list`: 4 verbs, each with its plain description and inputs in metres | F: "How does an AI know what it can do?" M: "We hand it a menu. Each item says what it does, in plain words." | §19.4 VV5 |
| 3 VERB 1 | Terminal: `bim_lines` on HospitalGarage → the grid JSON; card "11.176 m, in the building's own frame" | F: "Can it read the building?" M: "Exactly, to the millimetre." | §17 |
| 4 VERB 2 | `bim_try_shift` → STOPPED, the reason, "the building is back" | F: "And if it gets it wrong?" M: "Undone, and the reason comes back." | §18 |
| 5 VERB 3 | Viewer counts on Duplex: a bar chart 809 / 270 / 81 / 19 / 14 = 1,193 | F: "Does the AI's answer match what I'd see?" M: "Number for number. We check it against the file itself." | §19.4 |
| 6 CLASH | Viewer clashes: 393 box overlaps → 291 real clashes, 102 cleared; card "a clash is real shapes crossing, not boxes touching" | F: "Is every box overlap a clash?" M: "No. The industry counts only real shapes crossing. Boxes are just where to look." | §20.2.9 |
| 7 HONEST BUG | The −29 answer, then the corrected sum; card "the verb repeated the app; the test caught the app" | F: "Minus twenty-nine?" M: "Our own Viewer was wrong. The test caught it, we fixed it." | §22.2 |
| 8 FILM PATH | Public fixture: the camera band sees 2 of 2 lines; reversed, it sees none | F: "Can it check a film before I bake it?" M: "It says what every stretch of the camera sees. No GPU." | §19.3 |
| 9 COUNT | Two meters: "Viewer 1 of 64", "ERP 0 of 1,153" | F: "So it can do everything?" M: "Not yet. We count from the app's own tables, so you see what is missing." | §19.1, §21.7 |
| 10 ONE DOOR | The actor-layer diagram (`build/neuro_diagram/actor_layer_one_door.png`; source committed with the Odoo film at `scripts/film_odoo_migration/cards/src/`); label **"Specified, not built yet"** | F: "And people? Email?" M: "Same menu, same judge. A reply that says 'Approve' is a person's act. That part is designed, not built." | §21.1, §21.3 |
| 11 PRIOR ART | One card: "published 9 November 2026 as a defensive disclosure, free for anyone" | M: "We published it, so nobody can lock it up." | `docs/AIProposerDefensiveDisclosure.md` |
| 12 LIMITS | Honest-limits card: no strength or loads; the ERP verbs not offered yet; the benefit not measured yet (§20.3 protocol waits on a run); a pass never means safe | M says it plainly | §5, §20.3, §21.7 |
| 12b THE DICTIONARY TO COME | One card, the phases of §22.6 as a ladder, today's rung lit ("Viewer 1 of 64 · ERP 0 of 1,153"); label **"planned, in this order; not built"** | F: "What comes next?" M: "More verbs, one list, the same judge. Each one proven before it is offered." | §22.6 |
| 13 PROMISE | Title-style card with the closing line (§22.1) | M says it once | approved, §22.7 item 4 |
| ch | Chapter card "How the command line works" (owner, 2026-11-09: *"will the new film show how the CLI works ?"*) | — | — |
| 14a SETUP | Terminal, empty folder: `npm install puppeteer@24`, then `curl -O` of `edit_cli.js` from the live site; `ls` shows one file | F: "What do I install?" M: "One library and one file. Nothing else." | the guide's "Getting started" |
| 14b MODELLER CLI | `node edit_cli.js --building HospitalGarage --lines` → the bays; then `--shift gx6 --move 1.824` → `"refused":true`, the reason, exit code 3 | F: "And I just type it?" M: "Exact numbers in, the building's own report out. Nothing is saved." | §17, §15.1 |
| 14c VIEWER CLI | `node viewer_verbs.js counts --building Duplex` → 1,193; `clashes --building Duplex --a ARC --b MEP` → 393 / 291 / 102 | F: "Same for the Viewer?" M: "Same idea. Ask it a question, get the Viewer's own answer." | §19.4, §20.2.9 |
| 14d CONNECT AN AI | `claude mcp add bim -- node bim_mcp.js` (the line printed in `bim_mcp.js`'s own header), then the `tools/list` reply: 4 verbs | F: "Where does the AI come in?" M: "You plug these same commands into your AI as its menu. It calls them; the building answers." | §18, §19.4 VV5 |
| 14 HOW TO USE | The guide URL large on screen | — | `docs/ProposerGuide.md` |

### 22.4 Witnesses (each names its issue; written before any cut)
- **W-FILM-NEURO2-FACTS:** the copied `guard.js`; every digit on a card or spoken maps to a row in §22.2 or a `§` line; a planted number must fail it. Issue: a number the repo cannot back.
- **W-FILM-NEURO2-LIVE:** each verb shown is re-run fresh on main before the cut and its numbers equal §22.2; INCONCLUSIVE if any verb errors. Issue: the film showing an answer the product no longer gives (the clash numbers changed once already, 200 → 393).
- **W-FILM-NEURO2-PUBLIC:** the private-name grep over every card, caption and evidence file is empty, and no evidence file comes from a private DB. Issue: a private set in a public film.
- **W-FILM-NEURO2-CLI:** every command on screen in 14a-14d is run from an **empty folder** against the live site just before the cut, with only the files the beat says to download; the shot is rendered from that run's real stdout and exit code (never retyped, the §16.3 rule), and the guide's "Getting started" lines equal the commands shown. INCONCLUSIVE if a command needs a file the beat did not download. Issue: a CLI demo that only works inside our own checkout. **Open, to check first:** `viewer_verbs.js` is served live (HTTP 200, 2026-11-09) but needs `viewer_driver.js` beside it; whether a one-folder download works is unmeasured, so 14c may need a two-file download or a guide line.
- **W-FILM-NEURO2-LABEL:** every AI-side shot carries "scripted client, no AI" or a recorded session's date and model. Issue: a scripted demo passed off as a real AI.

### 22.5 Waits on, and not in this film
- **Waits on:** the Modeller real-shape build (§20.2, in progress 2026-11-09) if beat 6 is to show the edit report's new verdict words; otherwise beat 6 uses the Viewer verb alone. A real AI session (rc5 command, ▶ RESUME HERE) would replace the scripted labels; the film does not wait for it.
- **Not in it:** any claim that the ERP verbs or email work today; any measured speed or "better than without" claim (§20.3 not run); private sets; logos; GPU verbs.

### 22.6 Roadmap: the verb dictionary to come (owner, 2026-11-09: *"lay out a roadmap of its dictionary capability to come"*)
**The dictionary** = the one list of verbs every actor sees: the AI's `tools/list`, the script runner's keywords and the guide's verb table, all generated from one `verbs.json` (§19 design 2). **Every rung is already specified somewhere below; nothing here is new scope.** Each needs its own spec line and the owner's go before code, a witness that the verb equals the app's own path plus a falsifier, and no paid model calls. Order = harmless first, GPU last (§19.0).
| Rung | What the dictionary gains | Measure (X of N) | State 2026-11-09 | Spec |
|---|---|---|---|---|
| D0 | 4 connector verbs (`bim_lines`, `bim_try_shift`, `viewer_counts`, `viewer_clashes`) + 2 command-line tools (`edit_cli`, `film_path_vis`) | Viewer 1 of 64 actions; ERP 0 of 1,153 | **done, witnessed** | §18, §19.3, §19.4 |
| D1 | **One dictionary file:** `verbs.json` generates `tools/list`, the script keywords and the guide table; the guide table must equal `tools/list` name for name; the two registry risks fixed first (`VerbRegistry.register()` silently replaces a duplicate, `VerbRegistry.java:33`; longest-keyword dispatch lets a new keyword steal old lines, L14-15) | all verbs listed in all three places | not started | §19 design 1-4 |
| D2 | **Modeller edit verbs:** `bim_buildings`, `bim_try_move` (one line), `bim_try_add_column_line` (splits an over-limit span, the fix the G4 stop points to), `bim_try_add_bay` | each on a fresh copy, undone if red, nothing saved | not started | §19 verbs 1-4 |
| D3 | **Viewer read-only verbs:** the Find bar's typed query, the 4D schedule at a day, cost to date at a day, what is at an element or a room, camera focus on an element | X of 64 Viewer actions | 1 of 64 | §19.0 item 3 |
| D4 | **Scripts:** a `.bimcobol`-style runner over the verbs (`OPEN`, `LINES`, `TRY SHIFT gx6 BY 1.824`), and verb 7 `film_path_propose` (proposes camera bands, never writes) | one script = one repeatable run | not started | §19 verbs 5, 7 |
| D5 | **Checker verbs:** checks on a user's own IFC (parse, schema, census, IDS) and the claims registry (every public claim and the test behind it) | per check: PASS, FAIL, VACUOUS or UNWITNESSED | spec; P0 in review (bim-ootb #2408) | `prompts/AGENT_CALLABLE_CHECKERS.md` §2, §6 |
| D6 | **ERP verbs from the dictionary:** the read verbs plus one DocAction (Complete a Sales Order) over the CLI and the AI menu; the result must equal legacy iDempiere's own Complete | X of 1,153 ERP actions, per channel | inventory done, 0 offered | §21.2, §21.6, §21.7, witness A5 |
| D7 | **More channels for the same verbs:** email reply, phone tap, device event, each through the one door (parse, bind, reply); a spoofed mail stays a claim | the same X of N on every channel (A1) | spec only | §21.1, §21.3, §21.4, §21.5 |
| D8 | **GPU verbs, last and only on the owner's go:** Alt+S stills, Alt+C bake (the `cli_silent_bake.js` flags become a verb's inputs), a film-path script over `cinema_path` | never beside the owner's live tab | not started | §19.0 item 4, §19 "later" row |
**What the film may say about it:** the rungs, their order, and today's two counts. Not dates, not "coming soon", and not any rung as working before its witness passes.

### 22.7 DECIDED 2026-11-09 by the owner: title, scope, go
**Owner's words:** *"Build those scripts, once confirmed use to show in the film"* · *"ONly the new stuff, this is a sequel to the earlie, "CLI for OOTB Kernel Trilogy", Part II more commands for your AI to be right"*.
1. **Title:** the series is **"CLI for OOTB Kernel Trilogy"**; this film is **Part II: "More commands for your AI to be right"**. Film 1 ("Think Global, Act Local") is Part I. The §22 working title "Outside AI, Inside Judge" is retired.
2. **Only what is new since Part I.** Part I already showed `edit_cli --lines`, `--shift`, the stop, the two-verb connector and the setup. Part II shows only: the Viewer CLI (`viewer_verbs.js counts`, `clashes`), the shape-checked overlap verdicts in an edit report (§20.2.10-11), `film_path_vis.js`, the connector's menu at 4 verbs, the two inventories (Viewer X of 64, ERP X of 1,153), the honest Viewer bug, the actor-layer design and the dictionary roadmap (§22.6). One recap shot at most; beats 3, 4, 14a and 14b of §22.3 are dropped or cut to that one recap.
3. **Go for the scripts and the film:** build one demo script per new command, each run from an **empty folder** against the live site with only the files its beat downloads (W-FILM-NEURO2-CLI); once every script and the witness pass, the film is built from those runs' real stdout. Same pipeline and gates as Part I (`scripts/film_neuro/`: resolve, guard, record, fit, mux; CPU only, no GPU, no model calls; public fixtures only; English first).
4. **APPROVED 2026-11-09 (owner: *"approve the closing line and the bug beat"*):** the closing line *"Any AI may propose. Only the building decides."* (§22.1, beat 13) and the honest Viewer-bug beat (§22.2, beat 7: −29, then 393 / 291 / 102, "the verb repeated the app; the test caught the app"). Neither is "owner to approve" any more.

## STATUS
2026-11-06 spec. 2026-11-07: extracted (§3), fixes (§6), report (§8), CLI (§11), three proposer tests (§12), shift and hinge (§13, §14), public guide (§14.3). 2026-11-08: no paid model calls (§14.6), the stop on outside calls and the report on first use (§15), consolidated; film "Think Global, Act Local": plan (§16), the three pre-cut checks, English rc3 built (§16.7).
**The gate, where it stands:** outside calls are stopped on new red (§15.1). The Java compile path stays log-only until its rules are proven against extracted buildings (`CompilationPipeline.java:1536`). When outside orders arrive at `PlacementRequest`, a gate there applies only to them, checks before any snap, and then the §7 measurement runs, at no cost (§14.6).
**Open by design:** every row marked NONE in §3.1 and §3.5; snap cases S2–S5. G4-TAMPER reports 73 older violations (§6.3).

### 22.8 Part II build: demo scripts first, then the film (owner go 2026-11-09)
**SPEC (written before any script).** Folder `scripts/film_neuro2/demo/`, one script per new command, each from an EMPTY temp folder against the LIVE site (`https://red1oon.github.io/bim-ootb/`) with only the files its beat downloads; the exact command line, stdout, stderr, exit code and the downloaded-file list (with sha256) are saved in `scripts/film_neuro2/evidence/`. Demos: d1 `viewer_verbs.js counts`, d2 `viewer_verbs.js clashes`, d3 `edit_cli --shift` (shape-checked verdict words), d4 `film_path_vis.js` on a PUBLIC fixture (Duplex plus written test rows, as W-FILM-PATH-VIS), d5 `bim_mcp.js` `tools/list` by a scripted JSON-RPC client (no AI), d6 the two inventory generators on a pinned bim-ootb main sha.
**W-FILM-NEURO2-CLI** (`scripts/film_neuro2/w_cli.js`). Issue: a CLI demo that only works inside our own checkout, or shows a number the product no longer gives. Checks: C1 d1 Duplex total 1,193 (MEP 809, ARC 270, ELEC 81, STR 19, PLB 14); C2 d2 393 / 291 / 102 / 0 unjudged at 25 mm; C3 d3 the report carries the shape-checked overlap verdict words; C4 d4 forward band lines 2/2, markers 1/1, reversed 0/2, 0/1; C5 d5 exactly 4 tools; C6 d6 Viewer X=1 of N_actions=64 and ERP N=1153 X=0; C7 no file outside the beat's download list was fetched or read (a run with the files removed must fail, and the list is the whole list); C8 each saved stdout re-checked against its saved command; VACUOUS/INCONCLUSIVE printed if a demo judged nothing. Falsifier `W_CLI_BREAK=1` tampers one saved stdout and must FAIL. A number that differs from §22.2: the LIVE run wins and the difference is recorded below, never the old number.
**RESULT 2026-11-09, phase 1 (logs read: `scripts/film_neuro2/logs/w_cli.log`, `w_cli_falsifier.log`, `evidence/run_all.log`).** Each demo ran from an EMPTY temp folder with HOME pointed at it (so no fallback to this machine's checkouts), against the live site (`red1oon.github.io/bim-ootb`) and the public bucket; bim-ootb inventories at pinned main `16b3c205`. W-FILM-NEURO2-CLI **27 PASS / 0 FAIL / 0 vacuous**; `W_CLI_BREAK=1` (one saved stdout tampered) → 24/3 FAIL, caught (C1a, C1b, C1d).
- `§W-CLI d1 counts` Duplex **1,122** = MEP 904 + ARC 199 + STR 19, equal to the Viewer's own `§ASK_ANSWER` and to an independent `GROUP BY` on the downloaded DB (same sha `a8975381…`).
- `§W-CLI d2 clashes` ARC vs MEP at 25 mm: **487 box overlaps = 356 real clashes + 131 cleared + 0 unjudged**.
- `§W-CLI d3 edit_cli` HospitalGarage `--shift gy10 --move 1.49` (ONE downloaded file, `edit_cli.js`; drives the live Modeller): exit 3, "New or deeper overlap (shapes checked): 5 (5 clash, 0 not judged (box verdict kept), 20 cleared (0 touching, 20 box only); 25 box pairs)" — exactly the spec's words and counts.
- `§W-CLI d4 film_path_vis` public Duplex plus the witness's written test rows: forward band 0 lines **2/2**, markers **1/1**; reversed band 0 **0/2**, **0/1**; SwiftShader (CPU).
- `§W-CLI d5 bim_mcp tools/list` by a scripted client ("scripted client, no AI"): **4 tools** (`bim_lines, bim_try_shift, viewer_clashes, viewer_counts`); two downloaded files (`bim_mcp.js`, `edit_cli.js`) suffice.
- `§W-CLI d6`: `§VIEWER_ACTIONS N_entry=96 N_actions=64 X=1 verbs=2`; `§ERP_VERBS N=1153 N_doc=702 N_proc=451 impl=102 X=0`.
**SPECDIFF (the live run wins; the old number is not faked).** The spec's Duplex counts (1,193; 393/291/102; MEP 809, ARC 270, ELEC 81, STR 19, PLB 14) were measured on the owner's LOCAL, unpublished `~/bim-ootb/buildings/Duplex_extracted.db` (sha `9f9ab0a9…`, git-ignored). The Duplex a person can DOWNLOAD (public bucket `Duplex_extracted.db`, sha `a8975381…`, 9,625,600 bytes) is a different extraction: 1,122 and 487/356/131. Control run, same tools and tree, local copy via `VIEWER_BLD_DIR`: 1,193 and 393/291/102/0 (`evidence/x1_control_local_duplex_*`), so the verbs agree with the spec on the spec's file. Also: the bucket's `buildings/Duplex_extracted.db` is a third file (1,119 elements). The film shows the downloadable file's numbers; the bug beat (200/229/−29, then 393/291/102) is labelled "on our test copy". Open item to settle with the owner: publish the 1,193 copy, or keep the film on the downloadable one.
**What the Viewer CLI really needs (W-FILM-NEURO2-CLI open item, answered):** NOT a two-file download. `viewer_driver.js` serves `viewer/viewer.html` from its own folder (`ROOT` = two levels above the tool), so the whole page tree is required beside the tools: **378 files** (viewer, common, erp, hr_bim_asset, modeller/lib scripts; list measured with `demo/lazy_mirror_hook.js`, kept in `demo/viewer_files.txt`, 19 MB) plus the model at `buildings/Duplex_extracted.db` (9.6 MB, public bucket). Flat two-file folder: fails (page never loads, `frame got detached`). With HOME set to an empty folder and no DB: exits 1 "unknown building" (no hidden fallback to `~/bim-ootb/buildings`). The guide's "Getting started" has no Viewer CLI lines yet, so no equality check with it was possible; node 18 needs IPv4 for `https` on this machine (curl is unaffected).
**RESULT 2026-11-09, phase 2: film rc1 BUILT** (`scripts/film_neuro2/`, `./build.sh`, CPU only, `CUDA_VISIBLE_DEVICES=""`, local Kokoro, no GPU, no bake, no model or API call). `~/Videos/CLI_Trilogy_Part2_EN_rc1.mp4` (1920x1080, 24 fps, **179.88 s**, 7.3 MB) + `_narration.txt`; 15 beats, 13 voiced, two voices. Storyboard `script_en.md` is §22.3 cut to only-new (§22.7 item 2): one recap shot, menu at 4, Viewer counts, clashes, shape-checked edit report, the Viewer bug beat, film path check, X-of-N meters, actor-layer card ("Specified, not built yet"), dictionary ladder ("planned, in this order; not built"), honest limits, the closing line, how-to. Closing line and bug beat APPROVED by the owner 2026-11-09 (§22.7 item 4).
- `resolve.js` 66 facts, 0 missing, from the saved demo runs; terminal shots are rendered from those runs' stdout. `guard.js` PASS (74 numbers on cards, 30 spoken, all facts); planted card number `777` and a changed spoken number (13 -> 14) both caught; the diagram's sha256 pinned.
- Recorder layout probe: 55 images, 0 problems (first cut had a clipped chart label, fixed); 0 console errors. Fit 13/13 DETAIL, tone 0 WRONG; captions 17 clamped, **0 overlaps**; frames **4,317 = the silent picture**; longest silence **7.6 s** (the end card, as in Part I; others 4.5 s); loudness **-16.5 LUFS**. Logs: `scripts/film_neuro2/logs/rc1/`.
- Defects fixed between cuts: a decimal ("12.993") was cut at its point by the caption splitter and spoken as "993" -> the line says "about 13" from a rounded fact; a 119-character caption split in two; one reversed-path line printed the whole-path verdict "SEES" beside a band reading 0 of 2 -> verdict dropped from the line.
- Shown numbers are the downloadable Duplex's (1,122; 487/356/131); the bug beat is captioned "on our test copy" (200/229/-29, then 393/291/102 on the owner's local copy, control run). Open (SPECDIFF above): publish the local copy or keep the film on the downloadable one.
- Not done: nobody has watched or listened. Part I is untouched.

## 23. FEEDBACK VERBS: turn the ad-hoc model probes into dictionary verbs (owner, 2026-11-09; written by the design lane, bim-compiler-8c, for the NEURO session to build)
**Moved 2026-11-09 by the NEURO session:** written by the design lane (bim-compiler-8c) at 02:04 UTC into a stale untracked copy of this file, where it was numbered §21; on master §21 is the actor layer and §22 the Part II film, so it is §23 here, text unchanged apart from the section numbers. It is rung D4/D1-adjacent work in §22.6 (the verb dictionary).
**Owner's words:** *"suggest new verbs to formalize so many scripts we been doing adhoc to obtain feedback from our model. Thus they should be verbalize into our dictionary so that they can be reused consistently"* · *"Search also many scripts strewn about thru out the project in our recent framework"* · *"Beef up the NEURO prompt so it can work on it. Your session remains to think tank the big stuff"*.
**Why (measured, not argued):** in two days the design lane wrote about 40 one-off probes to ask the model the same kinds of question (does a route keep the file's grid, do two routes agree on the frame, is the walker better than random, why did an item find no floor, what layers hold what on a sheet, does a schedule pair with the model). Several gave WRONG answers first because the instrument was wrong, and each was found and fixed by hand: a slab's bounding box taken for its outline; a block's insert point taken for its position; `center_*` read after an export where it is defined differently (968 elements read > 1 cm off while their world boxes were identical); storeys matched by name across disciplines (they differ; elevations agree); a structure file in millimetres; a frame checked by coordinates instead of by GUID. A verb fixes the instrument once, so the next session gets the right answer the first time.
### 23.1 Rules for a feedback verb (on top of §19's design: three layers, one `verbs.json`, a verb only calls an existing function)
1. **Read only, family "measure".** No DB write, no GPU, no bake. A verb that would need one is not a feedback verb.
2. **Logic lives in the owning module, not in the verb.** Where a probe's logic is not yet a shipped function, port it into the module that owns that question first (walker → `disc_walker.js`/`walk_node_harness.js`; sheets → `drawn_mains.js`/`dxf2bim`; frame → `common/georef_frame.js`; grid → `common/ifc_grid_read.js`; files → `common/file_store.js`; schedules/tables → `dxf2tables.js`), with its own witness; then the verb calls it.
3. **One report shape for verbs and checkers:** the `AGENT_CALLABLE_CHECKERS.md` §3 fields: `verdict` (PASS | FAIL | INCONCLUSIVE | VACUOUS | NO-OP), `population`, `redControl`, `commit`, `input_sha256`, `findings[]`, plus the module's own `§` lines verbatim. A verb never prints PASS on an empty population.
4. **Instrument rules baked in, never re-chosen by the caller:** a footprint is the element's real mesh outline, not its box; a block's position is its transformed geometry, not its insert point; positions after an export are judged on `element_world_bbox`; storeys across disciplines pair by elevation (±0.05 m, after unit scale), never by name; a frame is checked by GUID after the recorded-offset shift; two DBs are compared only on the same route, else the offset is stated.
5. **Private sets:** verbs are generic; a private set runs locally only, and its numbers never reach a public file, PR, log or fixture (coordinates and sheet codes count; see the privacy memory).
6. **Deletion budget:** each verb names the scripts it replaces; those are archived or deleted in the same PR (AD-LAYER law rule 4, applied to probes). A verb that adds without retiring is not done.
### 23.2 Proposed catalogue (from the design lane's own probes; generic; the project-wide sweep adds to it, §23.3)
| Verb | Answers | Base (shipped function to call or port) |
|---|---|---|
| `walk_placements(db, disc)` | what the walker places, by label (bound, unhosted, provisional, drawn, plan-only) and class | `walk_node_harness.walkLive` |
| `walk_compare(db, disc, before_ref, after_ref)` | how a code change moved placements | `fleet_band_table.js` with `WALK_TREE` |
| `walk_score(db, disc, key)` | is the walker better than random: nearest distance to an answer key (the file's authored services, or drawn terminals) vs random points in the same rooms; count per room | port of the design lane's §Y scorer |
| `walk_explain(db, disc, ids)` | why an item has no host, floor, void or height: the floor outline under it, the structure above, the rule that fired | the walker's per-item `§WALK-EXPOSED-ITEM` lines + footprint test |
| `walk_fleet(dir)` | the whole fleet's walk table | `fleet_band_table.js` |
| `route_compare(ifc)` | do the Modeller open route and the Viewer import give the same building: offset, counts per class, carried tables | `ifc_open_db.js` + `import_worker.js` drivers (as W-ONE-FRAME) |
| `frame_residual(db_a, db_b)` | do two DBs of one file coincide after the recorded-offset shift, by GUID | port (GUID match + offsets from `project_metadata`) |
| `grid_check(db, ifc)` | is the stored grid the file's grid: per grid, axes, tags, storey, ends | `common/ifc_grid_read.js` |
| `storey_pairs(db)` | which storeys of federated disciplines pair by elevation, which stay unpaired | `extract_ifc2db.js --federate` pairing |
| `export_roundtrip(db)` | what survives export and re-open, X of N per class, storey, table | W-EXPORT-ROUNDTRIP base |
| `sheet_census(dxf)` | layers by role, including inside block inserts; mirrored inserts; inserts at the origin; stacked copies | `drawn_mains.js` read path |
| `sheet_fit(dxf, db)` | does a sheet fit the building grid: residual, tags, chosen grid | `DrawnMains` fit |
| `drawn_read(db, dxf…)` | what the drawn-mains reader would record, dry run | `mains_to_db.js` without write |
| `sheet_set(folder)` / `sheet_tables(dxf)` | the register vs the sheets held; schedules as tables | `dxf2setcheck.js`, `dxf2tables.js` (CLIs exist) |
| `rule_test(rule, db, sheets)` | does a stated rule hold: thresholds fixed, control, INCONCLUSIVE on an empty population | port of the design lane's sieve tests (route, fabric, ceiling) |
| `schedule_pair(db, table)` | which schedule rows pair with model elements; the size law found (a door's model size = leaf + frame on three sides: width +2k, height +k) | port of the schedule pairing probe |
| `pset_profile(db or ifc)` | which properties a model fills, type-level vs instance-level, default flags | port of the property miner |
| `legend_check(dxf, db, property)` | does a sheet legend's value per type equal the model property per type | port |
| `assign_to_rooms(db, points)` | which room each point belongs to, by plan, vertical reach, boundary, above, remote | port of the room-assignment rules |
| `overlay_frames(bake_log)` / `caption_facts(log)` | film checks: overlay objects per frame; the numbers a caption may say | readers of `§DRAWN-OVERLAY-FRAME`, `§WALK-*` lines |
### 23.3 Project-wide inventory (2026-11-09; two read-only sweeps by the design lane: file headers and usage lines only, nothing run)
**Scale.** bim-ootb: about 120 scripts that measure the model (tools/, modeller|viewer|erp|capex|bim/tools, scripts/probe_*), 14 same-purpose clusters, about 20 already verb-shaped (stable flags + a `§` report). bim-compiler: about 70 kept model-feedback scripts, 17 clusters, about 22 verb-shaped; about 215 dead or one-off (dated probes, page snippets, hardcoded buildings; `scripts/archive` and `tests/archive` excluded); `build/scriptor` (465 js) and `build/erp` (90 js) are run snapshots and product copies, not probes. Design lane: about 40 private-rig probes, already reduced to the generic catalogue in §23.2. **Today only `viewer_verbs` and `film_path_vis` follow the §19 contract.**
**Clusters: one verb each** (members = scripts measuring the same thing; base = the script to grow or port; rung = §22.6):
| Verb | Answers | Members (count) | Base | Rung |
|---|---|---|---|---|
| `count_elements` | elements by class, discipline, storey | viewer_verbs counts, bim health.js, library_audit, gen_buildings_manifest --check, probe_proxy_carrier_classes (5) | `viewer_verbs.js counts` (+ health.js for raw IFC) | D3 |
| `census_ifc` | parse, storeys, classes, library coverage of a user's IFC | ifc_recon.py, run_validity.js, run_core.js, geomapping spike (4) | `run_validity.js` (the real Track-B worker; move out of prompts/) | D5 (A3) |
| `ids_check` | an IFC against an IDS | ids_check.py (1) | as-is | D5 (A4) |
| `check_extracted_db` | is an extracted or compiled DB sound | verify_extraction, audit_integrity, diagnose_extraction, run_sanity_check, rosetta_trace (5) | `verify_extraction.sh` | D5 |
| `compare_to_reference` | compiled output vs a reference DB (positions, grammar) | spatial_checker.py (duplicated byte for byte in DAGCompiler), grammar_checker, rosetta_fidelity C8/C9 (3+) | `tools/spatial_checker.py` | D5 |
| `report_ifc_contribution` | what an onboarded IFC adds | ifc_benefits.sh, rosetta_report.sh (2) | `rosetta_report.sh` | D5 |
| `verify_geo_offsets` / `frame_residual` | relative offsets / two DBs coincide after the recorded shift | geo_verify.py + .js port, design-lane frame probe (3) | geo_verify.py; port the GUID match | D3 |
| `storey_levels` / `storey_pairs` | storey elevations, same level under two names, federated pairing | audit_storey_ladder, probe_storey_datum, mine_storey_floor, ifc_storeys_patch.py, two deploy verifiers, design-lane pairing (7) | `audit_storey_ladder.js` | D3 |
| `measure_clash` | true mesh clash vs box clash, cross-discipline overlaps | measure_narrowphase, measure_clash_rich, measure_ifcclash, cross_discipline_checker, missed_pairs (5; hardcoded buildings: need a building input) | `measure_narrowphase.js` + viewer_verbs clashes | D3 |
| `floating_elements_at(day)` | elements with nothing under them | probe_day0_unsupported, floating_guid_audit, captured_floating, support_asymmetry, template_hells, enclosure_rule/geometry (7) | `probe_day0_unsupported.js` | D3 |
| `schedule_compare` / `schedule_at(day)` | engine vs reference schedule; the 4D state at a day | probe_schedule_engine, kernel_ops_vs_engine, cpm_schedule, cpm_display_path, e5_resolution, probe_phase_gate, gate_4d, ~15 bim-compiler 4D probes (20+) | `probe_schedule_engine.js`; `probe_phase_gate.js` | D3 |
| `reveal_profile` | what the movie actually plays | probe_tm_reveal_shipped, tpl_reveal_spread, tpl_parallel_reveal, tpl_calibration_scope, daybatch_played, gantt stagger probes (7) | `probe_tm_reveal_shipped.js` | D3 |
| `route_between_rooms` | room-to-room walkable route | probe_route_walkability, compare_routes_ab, pathab, ab_path, triage, watchdog_binder (6) | `probe_route_walkability.js` | D3 (what is at a room) |
| `walk_*` (§23.2) | what the walker places, before/after, score, why | walk_node_harness, fleet_band_table, verify_raster_provenance + design-lane probes (3+) | `walk_node_harness.js` | proposed D3b |
| `sheet_*`, `dxf_qualify`, `dxf_rebuild_compare` | sheet census/fit/tables/set; plan DXF rebuild vs source | read_tables, set_check, rosetta_qualify, rosetta_dx*, verify_marks_dx, farm_verify, t8_openings_check + design-lane probes (10+) | `read_tables.js`, `set_check.js`, `rosetta_qualify.js` | proposed D3b |
| `cut_gate_census` | walls passing or refusing the cut gate | classify, verify_layers_are_boxes, verify_slab_stack, reconcile_47_vs_57, generalize_cut_gate (5) | `generalize_cut_gate.js` | D3 |
| `geometry_store_census` | duplicated geometry, content addressing, weld savings | mesh_overlap, library_audit, store_verify.py, probe_vertex_weld (4) | `mesh_overlap.js` | D3 |
| `split_pair_audit` / `verify_served_patch` | served DB pairs and patches hold | audit_split_pairs, 7 `$GATE_DB` verifiers (8) | `audit_split_pairs.js`; `oci_patch_gate.js --verify` | D5 |
| `erp_db_diff` / `erp_shard_check` | SQLite holds what PG holds; shard closure and coverage | migrate_fidelity_check, pilot_tablediff, pilot_compare_pos, dict_diff, dict_census_stage2, erp_shard_integrity, erp_shard_coverage (7) | `migrate_fidelity_check.js`; shard pair | D6 |
| `legacy_oracle(case)` | same callout/process on legacy vs ours | bridge *_legacy (~20), cp_*_oracle, pilot_replay (22+; some WRITE the pilot) | `pilot_replay.js` | D6 |
| `capex_twin_compare` / `odoo_doc_state` | dashboard tiles vs legacy; newest SO/PO/MO state | twin.js, shed_twin compare, legacy_goal_sql; verify_so/po/mo.py (6) | `twin.js`; rpc.py + a table argument | D6 |
| `erp_page_load` / `page_memory` | load cost; heap and resources | measure_erp_load, static_host_load, range_read_witness, drive_glassbowl; probe_memory, probe_activation_memory (6) | `measure_erp_load.js`; `probe_memory.js` | D3/D6 |
| `film_frame_metrics` / `resolve_facts` | flicker, ghosts, frame budget; film facts from logs | probe_film_flicker.py, plate_flicker, sky_ghost_detect, score_frame_budget; film_terms/resolve.js and 4 copies (9) | `probe_film_flicker.py`; `film_terms/resolve.js` | D4 |
| `what_is_at_pixel`, `still_luminance`, `light_grid` | GPU picks and light truth | lightgrid pick.js/pick_all/whichmat, lightgrid.js, ~15 glow/ember/night/albedo probes (mostly untagged) (20+) | `pick.js`, `lightgrid.js` | D8 (owner's go) |
**Design-lane advice for the roadmap (the owner decides):** (1) most feedback verbs are read-only Viewer/DB measures and sit naturally in D3 and D5; the walker and sheet families have no rung yet: a **D3b "model feedback"** rung would hold them. (2) **Order by duplication:** `schedule_compare`/`schedule_at` (20+ scripts), `legacy_oracle` (22+), `sheet_*` (10+), `floating_elements_at` (7), `storey_levels` (7) retire the most scripts per verb. (3) **Declare side effects:** `pilot_tablediff`, the `cp_*_oracle` scripts, `measure_narrowphase` and `film_terms/resolve.js` write; they can still be verbs, but outside family "measure". (4) **Retire, don't keep:** about 215 one-off files in bim-compiler are candidates for `scripts/archive`, counted in the same PR that adds each verb.
### 23.4 Order of work for the NEURO session
1. **Generate the inventory, don't hand-list it** (like §19.1): every tracked script that opens a model and reports, with purpose, input, output tags, read-only, GPU; a witness that the list covers every such file.
2. **Pick clusters by duplication:** the purpose measured by the most separate scripts goes first.
3. **Port the logic into the owning module, then add the verb** to `verbs.json`, generated into `tools/list`, the script runner and the guide (§19 design point 2).
4. **Witness each verb** as §19 says: the verb's answer = the module's own output for the same call; a red control; a falsifier that breaks it; plus one check per instrument rule in §23.1 point 4 (e.g. a block inserted at the origin with geometry 10 m away must report the geometry).
5. **Retire what each verb replaces** (§23.1 point 6), with the count.
**Questions go to the owner directly.** The design lane is available for design calls.
