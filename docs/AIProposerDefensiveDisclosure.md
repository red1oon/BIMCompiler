# Defensive Disclosure: an Outside AI Proposes, the Application's Own Checks Decide

**Redhuan D. Oon**<sup>1</sup> and **Claude Opus 5.5**<sup>2</sup>

<sup>1</sup> red1, Kuala Lumpur, Malaysia. Creator and architect of the BIM Intent Compiler.
<sup>2</sup> Anthropic. AI pair programmer for the specification, the witnesses and the prior-art search.

---

## Purpose

This is a **defensive publication**. The authors do not seek patents on the methods below. They publish them, with dates, working source code and tests, so that the methods are prior art and nobody can later patent them. The code is released under the **MIT License** in the public repositories [red1oon/bim-ootb](https://github.com/red1oon/bim-ootb) and [red1oon/BIMCompiler](https://github.com/red1oon/BIMCompiler).

**Disclosure date: 2026-11-09.** Each method was first published earlier, as merged source code, on the dates in the table below.

## Provenance

| Method | First public | Commit (bim-ootb) | Pull request |
|---|---|---|---|
| A command-line call that applies one grid edit and returns the app's own check report | 2026-11-07 01:42 UTC | `0a53cc98` | [#2678](https://github.com/red1oon/bim-ootb/pull/2678) |
| **M1** The stop: an outside call whose edit adds new findings is undone, with the report and the reason returned | 2026-11-07 21:20 UTC | `3ef4cd26` | [#2699](https://github.com/red1oon/bim-ootb/pull/2699) |
| The connector: the app's verbs as described tools (MCP), and **M2**'s byte-for-byte witness | 2026-11-08 07:25 UTC | `565ea51c` | [#2713](https://github.com/red1oon/bim-ootb/pull/2713) |
| The connector's call log | 2026-11-08 07:53 UTC | `86d58747` | [#2717](https://github.com/red1oon/bim-ootb/pull/2717) |
| **M3** The action inventory generated from the app's own tables (N = 64 Viewer actions, X = 0 verbs at first count) | 2026-11-08 19:50 UTC | `d49d885d` | [#2735](https://github.com/red1oon/bim-ootb/pull/2735) |
| **M4** The film-path visibility judge | 2026-11-08 20:13 UTC | `c43d5b72` | [#2736](https://github.com/red1oon/bim-ootb/pull/2736) |
| M4 minimum samples per band and the interior count | 2026-11-08 20:26 UTC | `7f08bdc5` | [#2737](https://github.com/red1oon/bim-ootb/pull/2737) |

The specification, every measured result and the history of each method are in [`prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md`](https://github.com/red1oon/BIMCompiler/blob/master/prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md) (§11, §15, §18, §19). An earlier paper by the same author, [Deterministic Spatial Compilation](SpatialCompilationPaper.md) (priority 2026-03-30), describes the compiler these methods sit on. That paper is not claimed to disclose the four methods here.

## The separation principle

All four methods keep one rule. **The AI is outside the application, and the application decides.**

- The AI may only call described verbs: a name, a plain description, and inputs with units. It never runs code inside the application.
- Each verb runs the application's own, unchanged engine: the same functions a person's click runs. There is no second implementation.
- The application's own deterministic checks judge the result. No AI runs inside the application, and the application does no repair.
- The AI's output is treated as untrusted. A pass never means safe; every report lists what it did not check.

## M1. Outside proposer, inside judge, stop on new findings

**Method.** An outside AI agent's only write access to a building model is a fixed set of described verbs. For each verb call:

1. The application opens a fresh copy of the building and records its findings before the edit: overlaps between elements, beam spans over the material's limit, an element driven into a wall it touches.
2. It applies the verb through its own engine.
3. It runs the same, unchanged checks again, and compares the findings with the set from before the edit.
4. If any finding is new or deeper, it **undoes the edit in the application itself**. It recounts to confirm the building is back to its before state.
5. It returns the check report to the agent: what changed, the findings before and after, the limit and the bay that broke it, what was not checked, and the reason for the stop. An example from the connector's own log: `stopped: Beam spans over limit: 91 -> 92 (limit 12 m, RC); bay gx5-gx6 newly over the limit: 13 m`.

The agent may then decline or try something else. The application never asks an AI anything.

**Implementation.** bim-ootb `modeller/tools/edit_cli.js` (the stop) and `modeller/tools/bim_mcp.js` (the connector, `tools/list` and `tools/call` over stdio JSON-RPC). Witnesses: `modeller/tests/witness_edit_cli.js` (W-EDIT-CLI) and `modeller/tests/witness_bim_mcp.js` (W-BIM-MCP).

**Closest prior art found, and the difference.**

- **AI repair loops.** Text2BIM ([arXiv 2408.08054](https://arxiv.org/abs/2408.08054)), [Sesterhenn et al., EC3 2026](https://tsesterh.github.io/papers/BIM-Verification.pdf) and [HarnessBIM](https://github.com/ReverseZoom2151/harnessbim) feed checker findings back so an AI revises the model. They do not undo the edit on new findings, and an AI is part of the loop.
- **General pattern.** LLM-Modulo ([arXiv 2402.01817](https://arxiv.org/abs/2402.01817)) pairs an LLM with external verifiers.
- **Rollback on host failures.** [bimwright rvt-mcp](https://github.com/bimwright/rvt-mcp/blob/master/docs/controlled-failures.md) rolls back an AI batch on Revit's own failures and warnings. Its failure-pipeline rollback does not compare design-check findings against the before state, and it also offers a code-execution tool. Its README also credits typed move and rotate tools with "placement checks after commit and rollback of the whole selection"; we did not inspect that code.
- **Undo left to the agent.** IfcOpenShell's `ifcmcp` keeps validation and clash as separate tools and leaves the undo to the agent.
- **KIR** ("A Building as a Repository", [arXiv 2609.14578](https://arxiv.org/abs/2609.14578), 2026-09-13) **predates M1.** It refuses a repair "by name if it opens a new conflict", using typed operations. The difference is when and where: KIR refuses **before writing, on a repository copy**. M1 lets the edit happen in the **live host**, judges it with the **host's own unchanged checks**, undoes it there, and returns the report to an **outside** agent.

**What is disclosed.** The combination in steps 1–5, under the separation principle. The proposer/judge split, feedback of a check report, and transactional rollback are each known separately and are not claimed alone.

## M2. Witnessed verb equivalence

**Method.** Each AI-callable verb has a witness test.

1. It runs the same action twice: once through the verb's connector, and once through a command-line driver that calls **the same application functions the user-interface handlers call** (for example the Modeller's `window.__gridShift`).
2. It asserts that the two answers are **byte-for-byte identical**, ignoring only the elapsed-time field.
3. A deliberate falsifier, an environment switch that perturbs the connector (`MCP_BREAK=1` halves the move), must make the witness fail. The witness is accepted only if it passes without the switch and fails with it.

The driver drives the application's functions; it does not replay mouse events.

**Implementation.** W-BIM-MCP cases M2 and M3 (`modeller/tests/witness_bim_mcp.js`). The first run returned 2,701 and 2,659 bytes, identical. With the falsifier, M2b and M3 fail.

**Closest prior art found.** [foundry-mcp](https://raw.githubusercontent.com/foundry-works/foundry-mcp/main/dev_docs/cli_best_practices/04-testing-parity.md) checks command-line versus MCP parity against golden outputs, with no falsifier. Spirent [US 12,013,777 B2](https://patents.google.com/patent/US12013777B2/en) runs one test script in API mode or UI mode. Tool-calling benchmarks such as BFCL and tau-bench compare against annotated ground truth, not against the application's own functions. Mutation testing is long established.

**What is disclosed.** The pairing: byte equality against the application's own functions, plus a mandatory falsifier that must make the witness fail.

## M3. A coverage denominator from the application's own action tables

**Method.**

1. A generator reads the application's source: its keyboard-shortcut dispatch table, its toolbar or button action table, and every other keydown listener. It keeps an explicit list of the files it scanned and the files it excluded, each exclusion with a reason.
2. It writes an inventory of every user entry point. For each one it records the functions it calls, where each function is defined (or **PHANTOM** if nothing defines it), and a harm class (view, leaves, writes, GPU) taken from a rule table that cites its source for every rule.
3. It reports pill labels that show a key nothing binds, or a key bound to a different action.
4. Progress toward AI control is then stated as **X of N actions offered as verbs**, with N taken from this inventory.
5. An independent witness re-counts the source tables by another method. It fails if any bound key, button or modifier-key line is missing. A planted key that calls an undefined function must be listed as PHANTOM, and a falsifier that drops one key must fail the re-count.

Comments are stripped by one tokenizer pass, so a `/*` inside a `//` comment cannot hide code.

**Implementation.** bim-ootb `scripts/gen_viewer_actions.js` → `internal/VIEWER_ACTIONS.md`; witness `tests/witness_viewer_actions.js` (W-VIEWER-ACTIONS). The first count found 96 entry points, 64 distinct actions, 0 offered as verbs, and 5 pill-key conflicts.

**Closest prior art found.** Tool-coverage ratios such as AgentAssay ([arXiv 2603.02601](https://arxiv.org/pdf/2603.02601)) take the agent's own tool list as the denominator. Command registries such as Blender operators, VS Code `contributes.commands` and AppleScript sdef are used for discovery. Static UI-handler extraction includes UICOMPASS (EMNLP 2025) and BACKSTAGE. MCP's `readOnlyHint` and `destructiveHint` are tool annotations.

**What is disclosed.** A source-derived denominator for AI-verb coverage that includes keyboard tables and listeners, a cited harm-class rule table, and an independent re-count witness that fails on any missing entry.

## M4. Film camera-path visibility judge

**Method.** A building walkthrough film stores its camera path as a list of rigid straight bands: a centre, a direction, a length and a hold time. A read-only verb:

1. opens the application headless on a CPU renderer, without baking and without writing;
2. stages the stored path with the application's own loader, and rebuilds the **film engine's own camera plan** at the bake's own duration rule (not a second camera model);
3. samples the plan's camera poses over the film. It assigns each sample to a band when the camera is within 0.5 m of the band **and** travelling along it, or holding still on it. Every other sample is `off-path` (the dive, the fly-out, and a connector hop that retraces a band the other way);
4. counts which annotated overlay items fall inside each sample's view frustum. The items are drawn duct lines (nine points per piece) and equipment markers, drawn without a depth test, so the frustum equals what is on screen;
5. reports each band's still samples separately from its moving ones. The engine turns 360° at the first band's start, so that point sees everything around it;
6. repeats with more samples until every band has a minimum (default 20), and reports the union over the bands alone beside the total;
7. prints SEES, BLIND, or INCONCLUSIVE when nothing was judged. It also prints what it did not check.

A separate proposer may rank candidate bands by these counts. A person chooses.

**Implementation.** bim-ootb `viewer/tools/film_path_vis.js`; witness `viewer/tests/witness_film_path_vis.js` (W-FILM-PATH-VIS 9/0, on the public Duplex model with written test rows):

- a forward band sees 3 of 3 items;
- the same band reversed sees 0, with the spin set to 0;
- with the default spin, the reversed band sees the items only from still samples;
- the stored bands are passed within 0.013 m, while the derived plan misses them by 1.4–3.9 m;
- with no drawn rows the verdict is INCONCLUSIVE, and the file's hash is unchanged after a run;
- the falsifier (`FPV_BREAK=1`) is caught.

**Closest prior art found.**

- **Visibility counting and planning.** Frustum visibility counting is standard in inspection planning (for example [arXiv 2408.01435](https://arxiv.org/pdf/2408.01435)). Unity's [US 12322131 B2](https://patents.google.com/patent/US12322131B2/en) picks a camera pose that sees the most objects. Occlusion-free camera paths are covered by [US 8576235](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8576235). Christie et al. survey camera control in computer graphics (CGF 2008).
- **Walkthrough paths.** Way-Finder (Eurographics 2004) generates guided tours of architectural models, and EP 3844724 A1 builds VR walkthroughs from BIM.
- **LLM camera proposers.** CinemaTraj ([arXiv 2607.26910](https://arxiv.org/abs/2607.26910)) proposes camera moves with an LLM.

**What is disclosed.** Reading back the film engine's own plan as rigid bands; attributing samples to a band by distance and direction of travel; counting overlay items drawn without depth test; reporting still and moving samples apart; the minimum per band; and the bands-only union. Frustum counting, path scoring and AI-proposed paths are each published and are not claimed alone.

## What this disclosure does not claim

- Structural safety, load capacity or code compliance. Nothing here checks them; a pass never means safe.
- That the overlap check uses real shapes. It counts boxes, and on a rotated building, boxes in the building's own frame.
- Any measured gain from AI use. One small test of our own (30 requests, one model) went from 15 to 24 right answers with the report. That shows a direction, not a proof.
- Novelty of any single element. Each method is disclosed as the combination described.

## Search basis

The prior art above comes from a search on 2026-11-09 of arXiv, GitHub and official documentation, and of patents through web search. The search was not exhaustive, and full-text patent databases were not queried directly. Corrections and earlier art are welcome as issues on [red1oon/BIMCompiler](https://github.com/red1oon/BIMCompiler/issues).
