<!-- ARCHIVE. The complete prompts/CODE_ARCHITECTURE_DESIGN.md as it stood on 2026-11-18 (master after BIMCompiler #909), before the
     second cut. Every Part A step, §F.21 to §F.35, the dated resume entries 0 to 0u and the STATUS table are here in full.
     The live file keeps one line per finished section (Part A RESULT INDEX, §F index). -->

# ⚠ DO NOT REMOVE — SCOPE: the higher-level code design for bim-ootb (parts A–F below): turn implicit structure into declared, generated, checked structure, WITHOUT a build step, TypeScript in the app, a framework or a new runtime dependency, and keeping lazy loading. Design first: every open decision goes to the owner ONE AT A TIME, then spec, then witness-led migration in small PRs. Read the log after every run — exit code is not evidence. Honour this block until every part is ✅ or ⛔.

**Written 2026-11-13** under BIMCompiler #599 (closed by the write-up PR #600). **Vetted 2026-11-13** under #602: every claim re-checked
against bim-ootb `main` @ `a7c329e5`, corrected in place, evidence in §VET. **Each part opens its own tracker issue when it starts** (START HERE 5).
Owner, in order:
*"i wonder if we need to design the code at a higher level? Give your take again what can be a better design"* →
*"Why not write it out fully in the prompts/# spec'd so that a new session will tackle it fresh"* →
*"also look at how VSC can have a plugin or addon that specifically handles this codebase elegantly and dev help really"*.
Background and every measurement this file cites: `prompts/EDITOR_MAINTAINABILITY_STUDY.md` (§3, §7, §12–§15), `docs/DeveloperGuide.md`
(§0, §1 patterns, §9 breakers, §11 refactors), `prompts/REFACTOR_FOR_READERS.md` (the small, readability-only list).
**Which repo a path means:** code paths (`erp/…`, `viewer/…`, `modeller/…`, `common/…`, `capex/…`, `tests/…`, `witness_kit/…`, `types/…`,
`.vscode/…`, `.github/…`, `scripts/` in §M) and `GOVERNANCE.md` are **bim-ootb**. `prompts/…`, `docs/…`, `scripts/bridge/…`, `scripts/code_arch/…`,
`deploy/…` are **bim-compiler**, unless marked "bim-ootb".

---

## ▶▶ RESUME HERE FIRST (rewritten 2026-11-15 at the close of the third session; **"resume software" and "resume VSC" land here**)

Owner, closing 2026-11-15: *"get it well documented in the prompts/# consolidate, so new session when 'resume VSC' or 'resume software' gets the full context"* · *"update prompt also that new sesion will do up BIM side"*. This block is the whole hand-over; each section it names holds the evidence (older history: the archive, START HERE 7). If a line here and a `§` section disagree, the section wins. **Standing rules:** "ERP" = the Kernel ERP JavaScript in bim-ootb `erp/`; legacy iDempiere Java is a read-only oracle (cite file:line, never copy it in). Owner design talk: ONE detail per message, with a recommendation; record his answer in his words. Workers run on Sonnet. One heavy job at a time on this machine, `nice -n 19 ionice -c3` (two suites in parallel saturated it, a peer session asked to throttle, 2026-11-15).

**0. ✅ DONE 2026-11-15 (fourth session): F-18 answered, the provenance hover built and merged — §F.23 (bim-ootb #3064 + tooltip-in-window fix #3069); FILM 3 built (`prompts/FILM_IMMERSIVE_SOFTWARE.md` FILM 3 STATUS, awaiting the owner's review); the default-key + truss findings handed to the DXF2BIM lane (bim-ootb `prompts/DXF2BIM_ARCHITECT_REVIEW.md` §D113, #3070). NEXT = the X0 "New witness for this file" command (§F.21 OPEN), or Part A's remaining A2 (item 2).** The text below is the original hand-over.

**0u. 2026-11-18 (ninth session) — START HERE: B-1 ANSWERED, ask B-2 next.** The session opened with a dangling-work check: every VSC-lane branch in both repos is pushed, no VSC PR is open, no VSC worktree is left. (A stale 2026-11-14 copy of this file sat uncommitted in the shared `~/bim-compiler` checkout on an unrelated branch; nothing in it was missing from master, so it was backed up and reverted.) B-1 was put to the owner as the 0t message wrote it (numbers: 17 sites change, still hand-bumped; hashes: all 715 change once, one full re-download) with the recommendation "content hashes, as its own announced step on a quiet day"; owner: *"proceed"* → recorded in Part B DECISIONS. **NEXT, in order:** ask **B-2**, then B-5, B-3, B-4 (one per message). B1 (modeller first) may start once B-2 is answered; it stays byte-identical on today's numbers, and the hash switch is its own step after B3.

**0t. 2026-11-17 (eighth session, later) — START HERE: B0 IS BUILT (bim-ootb #3200), Part B now waits on the owner.** `§MANIFEST_ROUNDTRIP apps=3 files=54 sites=788 … identical=54/54 driven=715/715 sw_vm=3/3 claims=7/7 red=5/5 order_check=NOT-JUDGED verdict=PASS`, and it runs in CI fast-checks (Part B, B0 BUILD SPEC + B0 RESULT). The design problem it hit (27 files with different `?v=` in different referrers, no declared dependencies) went to one scoped Fable agent, as the owner said. **NEXT, in order:** (1) **ask B-1** (one message, with B0's counts: unify numbers = 17 sites change inside the apps, content hashes = all 715 once), then B-2, B-5 (new: who declares deps), B-3, B-4; (2) the core-purity warning in X0 is BUILT (§F.35, bim-ootb #3209; reinstall X0 to get it) (the bump defect C7 found, bim-ootb #3201, where the Bump button stopped when a loader and a lazy module it lists changed together, is FIXED: #3204); (3) E's `witness_kit/paths.js` (§READY). F-2 ceilings due 2026-11-30.

**0s. 2026-11-17 (eighth session): PART A IS DONE.** (1) bim-ootb #3168 (A3-CLOCK-2) was already MERGED when this session opened: the github-actions bot turned auto-merge on and merged it 4 minutes after the last push (`2989f8f5`, 00:13Z), before the gate check 0r asked for. The check was run after the fact on `main` @ `b732d923` and PASSES (A3-CLOCK-2 POST-MERGE CHECK). **Lesson: "auto-merge off" does not hold in bim-ootb, the bot re-enables it; to hold a PR back, open it as a DRAFT.** (2) **W-CORE-PURE built and merged (bim-ootb #3180 / PR #3181, `7c26856d`), and it runs in CI fast-checks**: `§CORE_PURE files=125 parse_fail=0 forbidden=0 red_control=detected verdict=PASS` (A3 W-CORE-PURE RESULT). **NEXT: Part B, B0** (the manifest generator in check mode, no decision needed, no file changes; write its build spec first), then ask B-1. Also unblocked, small: the core-purity squiggle in X0 (Part F table row; reuse `witness_core_pure.js`'s scan, do not write a second scanner). F-2 ceilings due 2026-11-30. Owner, this session: *"if u hit a code design or spec problem use a well scoped Fable agent to resolve"* (workers otherwise stay on Sonnet).

**0r. 2026-11-17 (seventh session, CLOSE):** A3-CLOCK-2 is built and witnessed, **PR bim-ootb #3168 open, auto-merge off**: step 1 is the gate check of its last merged tree, then merge (A3-CLOCK-2 RESULT says exactly how). Also done this session: the real-VS-Code witness presses the Bump button (#3163, PASS with `--compiler-root` at a current bim-compiler; the default `~/bim-compiler` on another branch fails the unrelated tag-spec row). **Then W-CORE-PURE** (spec written; `forbidden=0` is already true: `calls=0`), which closes Part A; then B0. F-2 ceilings due 2026-11-30.

**0q. 2026-11-17 (seventh session, end):** §F.34 the Bump button built (bim-ootb #3162, merged): press when the feature is done, background check, ✓ then press to write; the VS Code ERP bump works again. **NEXT: A3-CLOCK-2** (spec drafted; tell the live sessions before merging, it makes `ad_callout.js` hosts install an edge), **then W-CORE-PURE** (closes Part A), then B0.

**0p. 2026-11-17 (seventh session, last):** §F.33 (the changed file's own witnesses, F-23 + F-23b 10-min budget) built and measured; **F-24 decided: the Bump button (§F.34)**, which also fixes the VS Code bump that has failed on every ERP file since F-16 (60 s `spawnSync`). NEXT: merge §F.33, build §F.34, then A3-CLOCK-2, then W-CORE-PURE.

**0o. 2026-11-17 (seventh session, later):** §F.32 built (bim-ootb #3154): the parity gate runs the 5 bridge witnesses that read the bumped tree (~5.5 min, was a 25-min timeout); FA out, M3 (sales/purchase cycle + books) in. **Open with the owner: F-23** (the gate also runs the witnesses of the exact file touched; §F.32 RESULT has the counts). NEXT unchanged: A3-CLOCK-2, then W-CORE-PURE.

**0n. 2026-11-17 (seventh session):** A3 PRE-MEASURE: 6 clock/RNG calls left in the A-1 list, and a probe proved the process-path SYSDATE was UTC and froze the page clock → **A3-CLOCK-1 built (bim-ootb #3149, merged)**, which also fixed InventoryCountCreate's scrambled INSERT … SELECT rows (#3146). **A-7 answered** (*"Values only (Recommended)"*). Owners of the open items: table OWNERS OF THE OPEN ITEMS. **NEXT: A3-CLOCK-2** (spec drafted; `ws_kernel.js` is `ERP_WS_API.md`'s, ask first), **then A3 W-CORE-PURE** (spec written). The parity gate times out on the 25-min full bridge (A3-CLOCK-1 RESULT finding).

**0m. 2026-11-16 (sixth session, close):** owner asked for advice on the `pipo_packin.js` UTC fallback, advice "fix it, legacy first", owner *"ok"* → legacy read (`PO.java:1985/:3341`, `DB_PostgreSQL.TO_DATE`: LOCAL clock) → **A2-PIPO built (bim-ootb #3143)**: bundle Pack In stamps local time. **NEXT: A3 W-CORE-PURE.**

**0l. 2026-11-16 (sixth session, end):** owner "proceed" → **A2-EDGE-2 built (bim-ootb #3140)**: `crud_overlay._modelEnv` and `plugin_overlay`'s env are views of the one edge clock; `genesis.js` already pure. **A2 is complete. NEXT: A3 W-CORE-PURE**, then ask the owner about the `pipo_packin.js` UTC fallback (A2-EDGE-2 SPEC finding).

**0k. 2026-11-16 (sixth session, last):** owner "proceed" → **A2-VALUE-1 built (bim-ootb #3135)**: the viewer core's last clock/RNG reads (baseline `set_at`, cache recency stamp, tab id) go through `CoreEdge`; 4D cache identical. **NEXT:** the EDGE producers (`crud_overlay._modelEnv`, `plugin_overlay._localNow`, `genesis.js:729` LAST), then A3 W-CORE-PURE.

**0j. 2026-11-16 (sixth session, later):** owner asked again for the browser-memory monitor of the three pages in VS Code → **§F.31** decided (F-20 code only, F-21 button only, F-22 X0 panel + PR body, all as recommended) and **built (bim-ootb #3131, W-HEAP-IMPACT 12/0, red control +5.00 MB on ERP only)**. From now on an X0-lane PR pastes its `§HEAP_IMPACT_DELTA` lines beside `§PERF_IMPACT` (F-2 observation to 2026-11-30). Guide §0.1 now says plainly that a witness is a unit test of one item, for developers, never called by a user. Part A's next item (the value reads) is unchanged.

**0i. 2026-11-16 (sixth session):** **A2-TIMING-3 built (bim-ootb #3124)**: `common/room_graph.js` + `viewer/schedule_inject.js` time through `CoreEdge`, the Modeller page installs the edge too; all timing reads of RESUME 2 are done. **NEXT:** the VALUE reads `schedule_author.js` / `schedule_sync.js` (A2-TIMING-3 RESULT names the lines), then the EDGE producers, then A3. Also this session, at the owner's request: `docs/DeveloperGuide.md` **§0.1 Witnesses** (how a witness tests the shipped file, and what is and is not deployed, checked on the live site).

**0h. 2026-11-16 (fifth session):** A-6 asked and answered (*"Option 1 (Recommended)"*: one global `CoreEdge`, Part A DECISIONS) and **A2-TIMING-2 built (bim-ootb #3122)**: the 4D pair times through the viewer's new edge, 4D cache identical. **NEXT:** `common/room_graph.js` + `viewer/schedule_inject.js` (timing), then `schedule_author.js` / `schedule_sync.js` (values), then the EDGE producers, then A3 (A2-TIMING-2 RESULT lists the traps).

**0g. 2026-11-16, the owner's go for the NEXT session:** *"U can do browser run for those items new session"* (to: the parked items that need a browser: the F-1 headless Fetch back button and Part A's browser witnesses). That covers headless-browser runs for those items: one at a time, `nice -n 19`, never beside a live bake or GPU work. A witness that needs a legacy server another lane uses (W-DASH-SYNC writes into the 8088 pilot) still waits until that lane is asked. The local servers were cleaned up the same day: 3 orphaned till-film relays and 2 orphaned W-MODEL-SAVE daemons with their headless Chromes (source folders deleted, parent systemd); the iDempiere pilot and bimdoc servers were left running.

**0f. 2026-11-16, owner "proceed" (Part A):** A2-TIMING-1 (#3110, the ERP pair through `Env.elapsed`) and §F.30 (#3112, the parity gate now judges the tree it bumps) built. **NEXT:** the viewer/4D timing items of RESUME 2. They touch the 4D lane's files and the 4D cache key (`schedule_gate.js`), so check `ListAgents` and the 4D lane first and re-run `cache_4d_run.js` once. Then the EDGE producers, then A3 W-CORE-PURE.

**0e. 2026-11-16, the owner's decisions round:** F-1 *"Agree with you"*, F-2 *"agreed"* (observe Cost if deployed until **2026-11-30**, then propose ceilings), F-7 *"agreed"*. F-12 step 2 was **withdrawn by the owner** for a Deploy button on this machine (§F.29, built and run end to end), with the guide note `docs/DeveloperGuide.md` §4.1 *Deploying from VS Code*. **Nothing is open in Part F** except the F-2 follow-up on 2026-11-30. NEXT stays Part A (0d).

**0d. 2026-11-16, owner "Go" (to: the New-witness command, F-19 as recommended, headless-browser runs for Part A):** built and merged §F.26 New witness for this file (#3100), §F.27 the § tag grammar fix found on the way (#3099: 3,847 hyphenated + 50 digit-first tags were misread by every X0 tag feature), and §F.28 F-19, message-key and door-verb hover/F12/warnings (#3103). **NEXT:** Part A's remaining timing items (RESUME 2), whose witnesses are headless-browser (W-GOAL-STORE, W-DASH-SYNC, W-TEAM-SO), on that go, one heavy job at a time under `nice`. Still open with the owner: F-1, F-2, F-7, the F-12 token.

**0c. 2026-11-16 (same session), after the owner said *"Focus on your VSC side, let the others handle as your info"*:** the door stamp fix (0b, first bullet) is the **CLI lane's** to do. It was handed back to bim-compiler-06 as information, and this lane will not open that PR. **ADVICE C is DONE (all three):** C1 X0 witnesses in CI (§F.24, #3090) · C2 stale-copy warning (§F.25, #3092) · C3 the "138" corrections (comments on #2974/#2975). **NEXT for this lane:** the X0 "New witness for this file" command (§F.21 OPEN) · F-19 waits for the owner (and for the message lane's `msg_keys.js`) · Part A's remaining timing items need headless-browser witnesses (W-GOAL-STORE, W-DASH-SYNC, W-TEAM-SO), which run only on the owner's go.

**0b. 2026-11-16 SYNC with the CLI lane (`prompts/CLI_ERP_IVR.md`, the `red1` shell) and the message lane (`prompts/VOCAB_MESSAGE_CATALOG.md`).** Owner: *"with much happening on the CLI side and a new session doing translation messaging, do your 'resume VSC' to see if it needs updating besides continuing its pending roadmap"*. Since 2026-11-15, bim-ootb `main` (`8c3f0af6`) gained the `red1` shell (#3060-#3088), `vocab/words.json` + `vocab/messages.json` + `msg_core.js` (#3082) and the Student level (#3083/#3084). The VS Code tools knew none of it: `git grep` over `devtools/` finds 0 hits for `verbs.json`, `messages.json`, `words.json`, `vocab` or `msg_core`. What changes here:
- **Part A, a real defect (CLI owner agreed, 2026-11-16: *"please do it from the code-design lane … object_cli's UTC is the defect"*):** `common/door/object_cli.js:212` stamps the model Trx `now` in **UTC** (`new Date().toISOString()`), but `common/door/erp_cli.js:26` stamps **LOCAL** time (the §20 rule, W-DOOR-STAMP, #2953). So `object.update` and `mis.update` write `Updated` on two different clocks. `erp_cli.js:26` is also a second local-day helper beside `crud_core.localDay` (`erp/crud_core.js:64`, which says it is "the ONE implementation"). Measured: `clock_probe.js <bim-ootb> 'common/door/*.js'` → `§CLOCK_PROBE files=18 with_calls=7 calls=58 parse_fail=0`. Most are ms timers or log-file names (fine at an edge). **Fix (handed to the CLI lane, 0c), one PR touching only those lines:** object_cli takes the one stamp, and erp_cli's `stamp()`/`today()` are built on `crud_core.localDay(Date.now())` plus the time. Its agent was editing `erp_cli.js` (§29.6 P3a/P3b) at the time. Witnesses the CLI lane named: W-DOOR-STAMP, a NEW claim that `object.update` and `mis.update` stamp the same clock (with a falsifier: put the UTC line back and it must FAIL), W-MIS-CRUD, W-ERP-VERBS, W-OBJ-COUNT.
- **Part A3 scope:** `common/door/` is an EDGE: it reads the clock and hands `env` in, which is the Part A pattern. Its `*_core.js` files (`assist_core`, `draw_core`, `menu_core`, `msg_core`, `report_core`, `mis_core`) have zero clock reads (same probe) and are pure. W-CORE-PURE should list them as core and `door.js`/`*_cli.js`/`red1.js` as edge, and it should flag a second local-day implementation anywhere.
- **Part F, a new decision F-19 (ask the owner, one message):** X0 Navigator support for the catalog and the verbs, dev-side only, nothing reaches the browser (§13 guard). Hovering a `t('key', …)` shows the English (and later the Student and other-language) text; F12 jumps to its `messages.json` line; while you edit, it warns about an unknown key or a `{n}` with no argument. Today `msg_core.js` throws only when the code runs. The same for a verb name, opening its `common/door/verbs.json` entry. **Recommendation: yes, built as one more X0 index (`lib/catalog_index.js`) that reads the JSON files, plus a witness with a red control (a made-up key must be flagged, a real key must not).** **Message lane's answer (2026-11-16):** a key checker already exists, so REUSE it and don't copy it: W-MSG-CATALOG M3 (bim-ootb `common/door/tests/witness_msg_catalog.js`) checks every literal `M('key'` / `.t('key'` both ways against `messages.json`, checks that placeholders run {0}..{n-1}, and catches calls that pass too many arguments. Keys must stay LITERAL strings (M3 caught one chosen by a ternary). The message lane offers to pull that scan out into one shared module (e.g. `common/door/msg_keys.js`) when P2b starts, used by both the witness and X0. The shape `{"_", "messages": {"<file>.<name>": {"en": …}}}` is stable: `en` stays, and later phases ADD fields beside it (Student text, per-language texts such as `ja`), never a new top level. `msg_core.js` is pure, so X0 can require it to render the hover. **So the F-19 recommendation becomes:** X0 reads the catalog through the shared `msg_keys.js` and `msg_core.js`, with no scanner of its own; it is built after the message lane extracts `msg_keys.js`.

**0. THE NEXT SESSION'S JOB (owner 2026-11-15): the BIM side.** The ERP field hover shows a STACK of layers (§F.22); the BIM hover (§F.21 slice 2) shows only the builder line. Do for BIM what F.22 did for ERP, then remake the BIM film with layers (`prompts/FILM_IMMERSIVE_SOFTWARE.md` FILM 3).
- **Ask the owner first, one message (F-18), with this recommendation:** a body's layers, in the order they happened, each from data the body or the op already carries, never guessed: (1) the BUILDER (the trace key → its line, `devtools/hover/dxf_hover.js`) · (2) PASS-THROUGH stamps (the `a > b` chain the trace already keeps) · (3) each SIZE and its source (`size.*.source` on the body: `drawn` / `schedule` / `label` / `default` / `user` / `inherited`; `height_source`, `thick_source`), a `default` linked to its `dxf2defaults.js` row (the yellow default a user can change) · (4) CUTS that opened it (the `GEOM_CUT` ops whose provenance names this body) · (5) EDITS after Convert (the op log: moves / resizes of that fid) · (6) the evidence the converter attached (handle, layer, sheet, prov). Number keys / V open each layer's line, as the ERP hover does.
- **Witness the same way F.22 was:** a denominator (every body of the shed: 512 bodies / 511 inserts), a red control per claim, and a check that each claim agrees with an independent source (the lesson of §F.22's two defects below). Then the film: same recipe as FILM 2.
- **The accuracy item for the DXF→BIM lane (found by the trace, not yet raised there):** the truss is drawn once at cut AA and copied to 13 stations (`modeller/dxf2section.js:42-44`): 144/156 bars + 108/117 plates (252 bodies, ~half the model) are `assumed`, spaced by ONE default, `section.spacing` (= the column pitch) unless stated. The "64 synthesized columns" are NOT an issue (below-grade parts from the column schedule, §L29; corrected in §F.21).

**1. The hover family, built 2026-11-15 (all merged in bim-ootb, witnessed red → green, re-run on `main`; how to use: bim-ootb `devtools/hover/README.md`).**
| What | PRs | Witness, line on `main` |
|---|---|---|
| `dxf2bim_cli.js --trace`: which line built each body (`Dxf2Prep.trace`, 27 stamps; model bytes unchanged) | #3043, #3047 | W-DXF-TRACE `VERDICT PASS bodies=512 keys=12` (T2b inserts 511/511) |
| BIM canvas hover (Modeller): body → its builder line, **V** opens VS Code | #3047 | W-DXF-HOVER `VERDICT PASS` (real mouse sweep, red control) |
| ERP field hover: every layer in firing order (dictionary → callouts → picker rule → model hooks / doc action / validators → process), owner@rank, Java origin; **Alt+1-9** opens a layer | #3055, #3057, #3059 | W-ERP-HOVER `VERDICT PASS`: `fields=12323 lines_resolved=6590 wrong_line=0 unported=199`, E2b `false_unported=0`, E4 `keys tried=112 wrong_or_dead=0` |
| ERP legacy-parity gate in `scripts/bump.js` (F-16: block on a NEW mismatch, `scripts/bump_parity.json` mode block/warn/off, `--no-parity "<reason>"`) | #3050 | W-BUMP-PARITY `PASS judged=14 failed=0 real_row=run` |
**Two defects the films found in merged code (keep the lessons):** (a) #3057: the ERP hover read only the layered registry's `describe()`, which misses classes put in directly (`erp/ad_callout.js:512` CalloutEngine) and called real callouts UNPORTED (213 claimed, 199 true); presence must be the ENGINE's own lookup (`getCallout :442`; processes JAVA + `registerHandler :76`). (b) #3059: the tooltip's key map wiped a number after a layer without a line. Both witnesses' first checks were BLIND (one read the hover's own field, one pressed only key 1 on one field): a check must judge from an independent source and over every case, and its red run must FAIL. **Parity-gate caveat:** its default bridge path is the shared `~/bim-compiler` checkout (usually on another branch); point `BUMP_PARITY_BRIDGE` at a worktree on `origin/master` (`/tmp/wt-bridge` exists for it). Today's known parity failures: `DD:FAIL`, `CTX:FAIL`, `DDS:HARNESS-FAIL`.

**2. Part A (the pure core).** A-1..A-5 answered (Part A DECISIONS). Built and merged: `Env.stamp/modelEnv/nowStamp/nowMs` (#3007) · session day = local day (#2996 → #3010) · `Import*` x7 + `ClientAcctProcessor` (#3013) · `InvoiceGenerate` + `InOutGenerate` (#3016) · `model_asi` + `doc_poster` (#3021) · `crud_core.localDay` + report handlers (#3026) · **A-5 `Env.setEdge`**: `rule_fold.js` (#3030, W-RULE-FOLD-EDGE) + `processes/PackIn.js` (#3033). **Remaining A2, one PR each:** timing reads via `Env.elapsed` (`ad_callout.js:995`, `model_pa.js:23`, `viewer/cpm_schedule.js:862-918`, `viewer/schedule_gate.js:849/1007` (4D cache key: re-run `scripts/cache_4d_run.js` once), `common/room_graph.js:1692/1773`, `viewer/schedule_inject.js:55`) · viewer `schedule_author.js:3115/3448`, `schedule_sync.js:36` · the EDGE producers `crud_overlay._modelEnv`, `plugin_overlay._localNow`, `genesis.js:729` LAST · then **A3 `W-CORE-PURE`** (an AST scan replacing the hand list in `erp/tests/witness_core_clock_reads.js`, which now lists 15 files). **Method that worked (keep):** baseline the touching witnesses BEFORE editing (a second detached worktree), edit, compare, investigate every diff; `poc_gated_complete.js` / `poc_i4_reconcile.js` are stale (wait for `#pill-kanban`, fail on `main`): do not use them as before/after.

**3. Where each part stands.**
| Part | State | Next step |
|---|---|---|
| A | ✅ DONE 2026-11-17: A0, A-1..A-7, A1, A2, A3 (W-CORE-PURE PASS, `forbidden=0`, in CI) | none; the door stamp is the CLI lane's (0c) |
| B | **B0 ✅ 2026-11-17** (#3200, W-MANIFEST-ROUNDTRIP in CI) · **B-1 answered 2026-11-18** (content hashes, own step) | ask B-2, then B-5, B-3, B-4; B1 waits on B-2 |
| C, D | not started; wait on B | — |
| E | not started | `witness_kit/paths.js` needs no decision (§READY), then ask E-1 |
| F | §F index rows + §F.21 (BIM trace + hover) + §F.22 (ERP hover) + F-16 gate built | **the BIM layered hover (0)**, then the X0 "New witness for this file" command (§F.21 OPEN; a skeleton pre-filled from facts the index has, population + red control left empty so it FAILs until a person fills them) |

**4. Part F's other tools (bim-ootb `devtools/`; Developer Guide §4.1, §4.2, §5.6, §6, §6.1 live).** X0 Navigator: F12 / hover / Find All References on shared-object fields, `§TAG` hover with the last provable value, *Context for this file*, Run & Ship, one-click cache bump, snippets `witness` / `slog` / `spec`; facts server `devtools/mcp/x0-facts/` (OFF by default). A saved edit does NOT show on a plain reload (service worker; measured 2026-11-14); the hot server is parked at `~/.cache/bim_film3/hot_server_parked/`.

**5. Films (never committed; scripts + logs are).** CH 0 · Immersive Software (`prompts/FILM_IMMERSIVE_SOFTWARE.md`, scripts `scripts/film_immersive_software/`, `scripts/film_erp_layers/`): film 1 the BIM hover `~/Videos/Immersive_Software_CH0_EN_AFTER_2026-11-15_v1.mp4` · film 2 the ERP field `~/Videos/Immersive_Software_CH0_ERP_Field_EN_AFTER_2026-11-15_v1.mp4` + Mandarin `_ZH_` (see the film file's status) · film 3 = BIM with layers (after 0). Both EN films were sent to the owner's phone (SendUserFile). Earlier CH 0 "VSC Hot Edit" films: `prompts/FILM_IDE_ERP_DEBUG.md`. Rebuild recipes are in each film file (removing a film worktree deletes its ignored pictures; the recipe recreates them).

**6. Open with the owner.** F-18 ✅ (§F.23) · F-19 ✅ "Go" 2026-11-16 (§F.28) · F-1 ✅ *"Agree with you"* (plain by default, headless only as a separate button) · F-2 ✅ *"agreed"* (observe to 2026-11-30, then set) · F-7 ✅ *"agreed"* (no preview host) · F-12 step 2 withdrawn → §F.29 Deploy button · a status-bar Bump button (suggested, not built) · the parity gate's default bridge path (above) · his hands-on dry run (`~/VSCcheatsheet.txt`, 29 steps; `~/bim-ootb-dryrun` not created) · a bake on his go (check a "last:" line after #2977).

**7. Open, no owner needed.** ~~15 of 51 `ws_kernel.js` witnesses fail on unedited `main`~~ (no source) → **re-measured 2026-11-17 (§F.33 first run): 9 of the 51 node witnesses that load `ad_callout.js` fail on main** (list in §F.33) · the Modeller runner on this machine: `§ALLWITNESS PASS=106 FAIL=10 SKIP=5 ENV=12 of 133` before the shed inputs were restored; inputs RESTORED 2026-11-15 to `~/Videos/dxf2bim_film_work/why/{raw,cli/marked}` (README there), and some witnesses need `SHED_RAW_DIR=~/Videos/dxf2bim_film_work/why/raw` set · 11 `PHANTOM?` fields (§F.17, a Part C question) · the 4D cache's `witness.log` has no `§LOG_STAMP` · bim-ootb #2974/#2975 texts still say "138 of 281" (true: 130).

**8. Traps this lane has paid for.**
- **A registry's own summary is not the truth:** `describe()` missed directly-put classes (§F.22 defect a). Ask the code path that RUNS (the engine's lookup), and give the witness an independent source.
- **A witness that reads the tool's own output to judge the tool is blind** (E2b v1); **a witness that tries one case is scope-blind** (E4 v1 key 1 only). Red-run every new check against the OLD code: it must FAIL.
- **A text grep that globs a file twice inflates counts** (`erp/*.js` + `erp/model_*.js`); the parser count is the number.
- **A devtools file that spells the shared object's access in a string becomes a fake field** in the X0 index: run `devtools/vscode/x0-navigator/tests/witness_x0_appdef.js` before a devtools PR.
- **Headless pages:** wait for the field you read; a fresh browser context per session (a shared one timed out at Convert); the camera of the Modeller is inside a module (sweep with real mouse moves instead).
- **`rm` with a relative glob after a `cd` is blocked by the safety check** (the whole command does not run, edits included): never chain a removal onto an edit.
- `< /dev/null` on every `node` in a loop; wait on processes, not on a log marker from the previous run; `*.log` is gitignored (`git add -f` the logs a spec commits); bim-compiler has no auto-merge (merge by hand), bim-ootb does (`--auto --squash`, wait for MERGED, re-run on `main`); the bim-compiler checkout is on another branch (read `git show origin/master:…`, edit in a `/tmp/wt-*` worktree); never `git stash` (shared), never `--force` a worktree path.
- **Measure before quoting** (a `§` line and its command); check the visible effect before choosing a film example.
- **The parity gate's full bridge takes ~25 min, its limit is 15** (`bump.js:185`): it times out with `verdicts=0`. 6 of its 16 witnesses load the bumped tree (M3 among them: check by `grep BRIDGE_OOTB`, never from memory, this lane got it wrong once). Link all 39 untracked `build/erp/*.db` into a fresh bridge worktree and DD/DDS judge (and pass).

## ▶ START HERE (fresh session)

1. **Read, in order:** this file to the end · `docs/DeveloperGuide.md` §0, §1, §5, §9 · `prompts/EDITOR_MAINTAINABILITY_STUDY.md` §13 (minimalism
   guard) · bim-ootb `GOVERNANCE.md` · `CLAUDE.md` §TWIN CARDINAL RULE, §AD-LAYER LAW, §PERF BUDGET, §DB CHANGES.
2. **This is a DESIGN lane before it is a coding lane.** The owner's rule for design talk: *one detail at a time, never decide topology
   alone* (memory `feedback_design_discussion_one_detail_at_a_time`). Each part below lists its **OPEN DECISIONS**, named `<part>-<n>` (A-1 is part A's first). Bring them to the owner
   one per message, with a recommendation, and record the answer **in the owner's words** in that part's `DECISIONS` block. Do not
   code a part whose decisions are open.
3. **Re-measure the baselines** (commands in §M) before quoting any number. They drift daily.
4. **Coordinate:** `ListAgents`, then ask live sessions before touching their files (owner: *"be careful not to break ongoing sessions work,
   ask the other session what it thinks first"*). `gh pr list --state open` for overlapping paths. Work in a `/tmp/wt-*` worktree off fresh
   `origin/main` (bim-ootb shared checkout is hook-blocked). Run `git worktree list` first and reuse one if it fits.
5. **FOSS flow per PR:** a tracker issue (what, baseline, witness), then branch, one small PR `Fixes #N`, conventional title, CI green, merged
   and verified on `main` before the next (`docs/DeveloperGuide.md` §10; own sessions may merge their own verified PRs).
6. **Order:** A → B → D → E → F → C (reasons in §ORDER). **F ran first on the owner's word and its unblocked rows are built**; the
   design itself continues at Part A. What to do next is in ▶▶ RESUME HERE FIRST, nowhere else.
7. **History:** every build spec, result and finding of 2026-11-13/14 is in
   `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-13_to_2026-11-14.md` under the same `§F.n` names. Read a section there
   before changing the code it describes. This file keeps one line per section (the §F index).

## RULES (any break = stop that part)

- **Minimalism (owner, 2026-11-13):** *"pure SQLite WASM resisting any forks, or TS that can overload its lightweight kernel local first
  air gapped handling"*. Nothing new may reach the browser except the code a part explicitly moves, and **no new runtime dependency**. Generators,
  manifests, `types/`, `.vscode/` and the VS Code extension are dev-side only. The extension is plain JS with no npm dependencies.
- **Lazy loading kept** (owner: *"retain its fast perf lazy loading strategy"*): nothing lazy becomes boot-loaded or precached as a side effect.
- **Twin rule:** the SQLite ERP stays the twin of legacy iDempiere, look and feel included. A difference found is fixed on the SQLite side.
- **AD-layer law:** ERP behaviour lives in the one generic dictionary engine, never per window.
- **No behaviour change without a before/after witness** that shows identical results (or, where a part fixes a real bug, an owner-approved
  issue that states the intended change, with the witness updated in the same PR).
- **Protected lane:** film/camera families (`fx_*`/`effects`, `cinema_path_editor`, `maxq_*`/`cinema_maxq`): no structural change unless the
  owner lifts `prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` §S59.
- **No browser/GPU runs, no bakes, no paid model calls** without the owner's explicit go. Headless node witnesses are fine.
- **Instrument honesty:** code scans use a parser (espree or VS Code's TypeScript via `scripts/lib/find_ts.js`), never regex over raw source.
  Comments and strings are not code (`EDITOR_MAINTAINABILITY_STUDY.md` §9: this error was made twice in one session). A witness that judged nothing
  prints INCONCLUSIVE. Every witness has a red control.
- Status, findings and decisions go in THIS file (dated lines in each part), not in `MEMORY.md`.

---

## THE PROBLEM, in one table (measured 2026-11-13 @ `cc9988c2`, re-measured the same day @ `a7c329e5`, §VET)

| # | Structural problem | Evidence | Who it hurts |
|---|---|---|---|
| P1 | Dependencies are implicit | page-loaded app code is classic `<script>` globals; load order = `<script>` order (`viewer/viewer.html` 247, `erp/idempiere.html` 206, `modeller/modeller.html` 59). The ES-module exceptions are the ERP plugins and migrate engine: **53 `.mjs` files** under `erp/` and `capex/`, loaded by `import()` (`erp/plugin_overlay.js:78`, `erp/plugin_registry.js:114`). A shared object of 1,688 fields, 1,321 written only as `A.x`, **172 read in production but never written** | anyone reading or moving code |
| P2 | The same lists are kept by hand in several places | page `<script>` lists · lazy list `viewer/main.js:170` `modules[]` · three `PRECACHE_ASSETS` (`viewer/`, `erp/`, `modeller/sw.js`) · `?v=` tags (245 viewer, 213 erp, 67 modeller) · three `CACHE_VERSION` · `_GANTT_CACHE_VERSION` (`viewer/tm_dash.js:688`) · ERP plugin lists `BUILTINS`/`INSTALL_ONLY` (`erp/plugin_overlay.js:230-232`) and 29 `plugins/*.mjs` entries in `erp/sw.js` | every edit; stale-file bugs |
| P3 | Side effects are mixed into core logic | AST scan (`scripts/code_arch/clock_probe.js`, §M) of 301 ERP production files (vendored sql.js excluded): 58 files / 160 calls to clock, random, network. The proposed ERP core set (decision A-1) has 18 files / 25 calls, plus 7 in `erp/kernel_ops.js` where ops are minted. Most are "today, with a wall-clock fallback", written differently each time (`ad_callout.js:157`, `doc_poster.js:203`, `model_asi.js:70`, `processes/InvoiceGenerate.js:38`, `processes/ImportOrder.js:68`, the other 9 `processes/*.js`). *(The first draft's 299/59/181 and "15 files / 26 calls" came from an uncommitted probe and cannot be reproduced. The committed probe is the baseline now.)* | correctness of replay; testability |
| P4 | No app-wide owner list | duplicates found by accident: `ERPKernel` in `erp/erp_kernel.js` and `erp/odoo_agent/erp_kernel.js`; `modeller/routewalker.js` vs `viewer/routewalker.js`; `Bonsai` ×3 and `ERP` ×4 publishers (`types/globals.gen.d.ts` header); the clock reads of P3, written a dozen different ways; `erp/kernel_ops.js` vs bim-compiler `build/erp/kernel_ops.js` (different bytes; the bim-compiler copy last changed 2026-10-04 and is hidden from the editor by BIMCompiler #596). Only the 4D lane has an owner table (`prompts/4D_MODEL_INTEGRITY.md` §I) | anyone fixing a bug in "the" implementation |
| P5 | Proof is scattered | witnesses in `modeller/tests` 368 · `viewer/tests` 317 · `erp/tests` 305 · `witness/` 183 · `capex/tests` 45 · `hr_bim_asset/tests` 45 · `tests/` 27 · `common/door` 26 · 8 smaller folders 41 (1,357 in all); 65 files use `witness_kit/contract.js`; 665 tracked files contain the author's home-folder path; no lookup "which witness proves this file / rule" | reviewers; a second machine |

**Re-measured 2026-11-14 after the index fix (archive §F.17):** P1's shared object has 1,856 fields, 1,595 written only under the short
name, **107** read in production and never written (the 172 above was an index fault: 130 of the 281 "phantoms" had a writer), plus 11 the
index flags as not sure.

Each item in `REFACTOR_FOR_READERS.md` patches one symptom. This design removes the causes.

---

## PART A — A pure core with one Env handed in   (fixes P3, half of P4)

**Design.** Split code into two kinds:
- **Core:** ERP verbs, posting, processes, callouts, the op-log fold, schedule/CPM maths, geometry maths. Plain calculation: data in, results out.
  **No** `Date`, `Math.random`, `crypto.randomUUID`, `fetch`, `window`, `document`, storage, or `console` outside a `§` log helper.
- **Edge (shell):** UI, Three.js, panels, service worker, IndexedDB/OPFS, network.

Everything core needs from outside arrives through **one Env object**: `now()`, `today()`, `newId()`, `fetchSource()` (if any), `log(§…)`.
The edge mints each value **once** and records it in the op, so a replay reads the recorded value and never asks the clock again. This is
iDempiere's own pattern: the working date lives in the session context (`Env.java:110` `DATE = "#Date"`; 39 iDempiere source files read it with
`Env.getContextAsDate(ctx, Env.DATE)`), and the twin already carries `#Date` (`erp/ad_callout.js:116`). So the twin rule is honoured, not bent.
It also makes `docs/DistributedERP.md` §7 (*"nondeterministic values … generated at the edge and recorded as inputs … kernel only reads"*) true by
construction and checkable, which closes the DeepSeek review's point "we have a rule vs we enforce a rule".

**Facts the design must respect (vetted 2026-11-13):**
- **Three env objects exist today, not one.** (1) `AdCallout`'s `Env` with the context keys, incl. `DATE: '#Date'` (`erp/ad_callout.js:116`) and
  `Env.now()` (`:840`); (2) the transaction's `trx.env` (`erp/model_layer.js:91` `this.env = env || {}`), read as `trx.env.now` / `nowMillis` by
  `processes/ImportOrder.js:68` and 21 other ERP files (`git grep -lE 'env\.(now|nowMillis|today)\b' -- erp`); (3) the genesis seed env
  (`erp/genesis.js:729`, `{date, now, nowMillis}` at a fixed 09:00). Decision A-2 chooses how these become one.
- **Local day, never the UTC day (a fixed bug that A must not undo).** `Env.now()` (`erp/ad_callout.js:836-840`) shifts to local time on purpose:
  with a UTC clock the login date and SQL SYSDATE were *yesterday* just after local midnight at +08 (the comment cites W-LOCAL-TIME). `SESSION_START`
  records `ts: new Date().toISOString()` (`erp/kernel_ops.js:941`), a UTC instant. So `today()` returns the **local calendar day**, and whatever
  records the session date records that local day (or the instant plus its timezone offset). It never cuts the day out of the UTC string.
- **Value reads vs timing reads.** Some calls only time a pass for its `§` line and never change a result (`viewer/cpm_schedule.js:862`
  `var t0 = Date.now()`, `viewer/schedule_gate.js:849`, `common/room_graph.js:1692`). Others are not maths at all: `viewer/tm_core.js` has 19
  calls, most of them `Math.random()` for visual scatter (`:547` a random angle, `:1024` "5-10 points"). The probe counts both kinds. Decision A-4 sets
  how W-CORE-PURE treats timing, and decision A-1 must split or drop files like `tm_core.js`.
- **4D cache + 4D owners.** `viewer/schedule_gate.js` and `schedule_author.js` are part of the `~/.cache/bim4d` key (CLAUDE.md PRIMAL LAW 5), so an
  A2 PR that touches them invalidates that cache (expected; re-run `scripts/cache_4d_run.js` once, bim-ootb). Their owners are in
  `prompts/4D_MODEL_INTEGRITY.md` §I. Read it before moving any 4D function.

**Owner file:** the determinism rule is already owned by `prompts/BACKEND_SUBSTRATE_LANE.md` (scope block: *"deterministic on every fold/replay
path (ids/ts/balances are recorded INPUTS, no Date.now()/Math.random())"*). Part A is carried out under that lane's rules. Record progress here and
add one dated pointer line there.

**Step A0 — settle the open fact first (witness, no code change):** when the op-log replays, does it RE-RUN a process (which would pick up a new
"today" on a later day) or replay the ROWS the process wrote? Witness `W-REPLAY-CLOCK`: run a dated process (e.g. InvoiceGenerate) with a fixed
injected date, replay the log under a different wall clock (fake `Date`), compare the replay hash with the live hash. Equal → the fallbacks are tidy-up
(A2). Different → a real bug. Open an issue that states it, and fix it in A1 before anything else.
- **Code-read lead (not the answer):** ERP writes are recorded as ROW ops, not as process runs: `AD_SAVE`/`AD_DELETE` (`erp/ad_data.js:121`, `:263`),
  `CRUD_CREATE`/`CRUD_UPDATE`/`CRUD_DELETE` carrying field values (`erp/ad_process.js:773-774`, `erp/borrower.js:35-37`), and `replayOps` returns the
  recorded `parameters` and re-reads `op_uuid` (`erp/kernel_ops.js:849-866`). So "rows are replayed" is the expected answer. The witness still has to
  prove it, on the path a process writes through (`ModelLayer.run` with `timing: 'PROCESS'`).
- **W-REPLAY-CLOCK spec.** File `erp/tests/witness_replay_clock.js` (bim-ootb), node only, built from `witness_kit/contract.js`. Load the kernel the
  way `erp/tests/witness_migration_trade.js:29-31` does (`ws_kernel.js` `K.load()`, register the `processes/*.js`), then:
  1. run `InvoiceGenerate` and one `Import*` process with `#Date` = a fixed day D;
  2. keep the op log and the live hash;
  3. replay the log into a fresh db with `Date` stubbed to D + 3 days, at 00:30 local, once with `TZ=UTC` and once with a +08 zone;
  4. print `§REPLAY_CLOCK ops= liveHash= replayHash= tz= match=Y|N`.
  **Red control:** a planted op that re-runs the process on replay must give `match=N`. **INCONCLUSIVE** if the process wrote 0 rows.
  Reuse, don't rewrite: the `replay-hash == live-hash` path in `prompts/RESUME_PROVE_BOOKS_MONITOR.md` (bim-compiler `scripts/erp_kernel.js`,
  `poc_kernel.js`, `poc_longtail.js`) and `prompts/KERNEL_COMMITGROUP.md` item F. The witness runs against **bim-ootb's** `erp/kernel_ops.js`,
  not the older bim-compiler `build/erp/` copy (P4).

**A0 RESULT 2026-11-14 — bim-ootb #2995 / PR #2997. ✅ DONE (witness): the rows are replayed, not the process.** (owner, 2026-11-14: *"Proceed"*)
- **Run:** seed company (client 11), shipped paths only (`ML.newPO/save/processIt`, `AP.runInTrx`, the kernel's own `inTrx` → commit → journal),
  clock fixed at 2026-11-10 10:00 local in a child process: a new order completed (7 ops), shipped by process 118 (29), invoiced by process 119
  with NO DateInvoiced (10: it took the session's date), and one undated `I_Order` row imported by process 206 (8). 4 journal groups, 54 ops,
  22 tables, 1,991 rows hashed. A second child with the clock at 2026-11-13 00:30 local loads a fresh kernel and applies the journal with the
  kernel's own `replay()` (`erp/ws_kernel.js:99`).
- `§REPLAY_CLOCK ops=54 liveHash=4f32f7549452eda5 replayHash=4f32f7549452eda5 tz=UTC match=Y` ·
  `§REPLAY_CLOCK ops=54 liveHash=48b1cd5ebacad0ad replayHash=48b1cd5ebacad0ad tz=Asia/Kuala_Lumpur match=Y` ·
  `§WITNESS_REPLAY_CLOCK pass=4 fail=0 ran=2` (through `witness_kit/contract.js`).
- **Red control, real:** the same replay with the invoice group RE-RUN instead of applied: `invoice={"dateinvoiced":"2026-11-13 …"}`, 7 tables
  differ (`ad_sequence, c_bpartner, c_invoice, c_invoiceline, c_invoicetax, c_orderline, fact_acct`), match=N, `redControl-detected`.
  The first run of the witness, whose order set-up was broken, printed `§REPLAY_CLOCK_VERDICT INCONCLUSIVE`, not PASS.
- **So:** the wall-clock fallbacks in the processes are **tidy-up (A2), not a replay bug**. No A1 "fix first" is needed for replay.
  Scope of the claim: the headless kernel's journal and `replay()` (`ws_kernel.js`), the path a process writes through. The page's own op
  log fold (`erp/kernel_ops.js` `replayOps`) was read (§A0 code-read lead) but not driven by this witness.
- **Two things the run showed that the spec did not ask about:**
  1. **The session day is the UTC day (bim-ootb #2996, open, not fixed).** `§REPLAY_CLOCK_SESSION_DAY tz=Asia/Kuala_Lumpur local_clock=2026-11-13
     00:30 session_day=2026-11-12 same=N` (UTC: `same=Y`). `erp/ws_kernel.js:80` cuts the day from `toISOString()`. In the red-control run the
     invoice made at 00:30 local on the 13th was dated the 12th. This is the "local day, never the UTC day" fact above, still true of the
     headless kernel; legacy dates by the server's local day. It is decision **A-3**'s subject. Not checked against the legacy oracle yet.
  2. **The hash differs from run to run** (`bc95…` then `4f32…` for UTC): the kernel's `uuid()` is `crypto.randomUUID()` (`ws_kernel.js:82`), so
     two live runs never give the same rows. Live == replay holds inside a run because the ids are recorded in the ops. This is the P3 "IDs
     minted in many places" item, for the Env's `newId()`, not a replay fault.
- Merged; re-run on bim-ootb `main` @ `abecbbb8`: match=Y in both zones, `pass=4 fail=0`. Not in CI (needs the local `sql.js` path the other ERP witnesses use). Run: `node erp/tests/witness_replay_clock.js`.

**Steps:** A1 the Env object (one owner file; name per decision A-2), taking its date from the login context the way legacy does · A2 move
each core file's clock/ID reads onto it, one file per PR, posting/parity witnesses identical before/after · A3 **scan witness `W-CORE-PURE`**: an
AST scan of the core file list that fails on any forbidden call outside the Env owner and the `§` log helper. **Red control:** a copied core verb
with a planted `Date.now()` must make it FAIL. Prints `§CORE_PURE files= forbidden= verdict=`.

**A1 SPEC (2026-11-14; decisions A-2/A-3/A-4 answered; additive, NO caller changes, so no behaviour change).** Measured producers of the trx env /
"now" in bim-ootb `main` (`git grep -n` on `nowMillis`, `toISOString`, `getTimezoneOffset`): (1) `erp/ws_kernel.js:78-82` `env(s)`: clock +1000 ms per call, day = `toISOString().slice(0,10)`
= **UTC day** (#2996); (2) `erp/crud_overlay.js:1902` `_modelEnv()`: local day, local stamp, `nowMillis = Date.now()`; (3) `erp/genesis.js:729`: fixed
`D` at 09:00, deterministic `uuid`; (4) `erp/plugin_overlay.js:114` `_localNow()`: local stamp; (5) `erp/ad_callout.js:840` `RUNTIME.now`: local wall clock as
UTC ms. **Build (all in `erp/ad_callout.js` `Env`, the login context, per A-2):**
- `Env.stamp(ms)` → `{ day:'YYYY-MM-DD', now:'YYYY-MM-DD HH:MM:SS', millis }` from LOCAL calendar fields (one implementation of what (2), (4), (5) each spell out).
- `Env.modelEnv(ctx, edge)` → the trx env object `{client, org, user, role, date, now, nowMillis, uuid, elapsed, …}`. `ctx` is the login context (`#AD_Client_ID`,
  `#AD_Org_ID`, `#AD_User_ID`, `#AD_Role_ID`, `#Date`); `edge` is what the shell injects once: `{ nowMs(), uuid(), perfMs() }` (the ONLY places a clock/RNG may be called).
  `date` = ctx `#Date` when set (A-3: legacy's session date), else the edge's local day; if neither exists it **throws** and prints `§ENV_NO_DATE` (A-3: core never falls back).
- `env.elapsed(t0)` / `env.perfMs()` = A-4's timing seam (reads `edge.perfMs`).
**Witness W-ENV-VIEWS** (`erp/tests/witness_env_views.js`, node, `witness_kit/contract.js`): with a fixed injected clock, for `TZ=UTC` and `TZ=Asia/Kuala_Lumpur` at 00:30
local, compare `Env.modelEnv` field by field with `_modelEnv()` (2), the genesis env (3) and `ws_kernel env()` (1). Prints `§ENV_VIEWS producer= field= same=Y|N`.
(1) is EXPECTED `same=N` on `date` in +08 (#2996, the UTC-day defect) and is reported as `KNOWN-DIFF #2996`, not PASS; A2 fixes it after a legacy-oracle check.
**Red control:** a copy of `_modelEnv` with `toISOString()` must give `same=N` at +08. **INCONCLUSIVE** if fewer than 3 producers were compared. Not-a-test warning: equality
on UTC only proves nothing, which is why +08 00:30 is mandatory.

**OPEN DECISIONS (ask one at a time):**
1. Which files are "core"? Proposal (measured in §VET): ERP `erp/processes/*.js`, `erp/callouts/*.js`, `ad_callout.js`, `doc_poster.js`,
   `model_*.js`, `rule_fold.js`, `crud_core.js` (112 files, 18 with calls, 25 calls), with `erp/kernel_ops.js` as the **minting point** (it records
   edge values into ops, so it is the Env side, not core); plus viewer `cpm_schedule.js`, `schedule_*.js` and `common/room_graph.js`.
   `viewer/tm_core.js` stays **out** unless it is split (19 calls, mostly visual `Math.random`). Other geometry maths: the owner names the files,
   or they wait. Owner confirms the list.
2. Three env objects exist (above). Does Env extend the twin's existing context (`AdCallout`'s `Env`/`#Date`), with `trx.env` and the genesis env
   becoming views of it, or is it a new small object that all three feed? Proposal: extend the existing one, because legacy has one context.
3. What happens when no date was injected (today: wall-clock fallback)? Proposal: the EDGE records the session's **local calendar day** (plus the
   instant and the timezone offset) in `SESSION_START`, and `today()` reads that day. Core never falls back. Today `SESSION_START` stores only a UTC
   instant (`erp/kernel_ops.js:941`), so this adds a field, under `BACKEND_SUBSTRATE_LANE.md` rules.
4. Timing reads (elapsed ms that only feed a `§` line): allowed as `performance.now()` inside a `§` call, or routed through `Env.elapsed()`?
   Proposal: `Env.elapsed()`, so W-CORE-PURE stays a plain ban on calls and needs no data-flow analysis.

**Witnesses:** W-REPLAY-CLOCK (A0) · W-CORE-PURE (A3, red control) · per migrated file: its posting/parity witnesses identical · ERP parallel run
(`scripts/bridge/run_all.sh`) unchanged.
**Done when:** W-REPLAY-CLOCK `match=Y` on both time zones (or its bug fixed), W-CORE-PURE PASS on the agreed core list, `forbidden=0`, red control
FAILs as it should.
**DECISIONS:**
- 2026-11-14, owner, on **A-1** (which files are "core"; recommendation: the list measured in §VET — ERP `erp/processes/*.js`,
  `erp/callouts/*.js`, `ad_callout.js`, `doc_poster.js`, `model_*.js`, `rule_fold.js`, `crud_core.js` (112 files, 18 with calls); viewer
  `cpm_schedule.js`, `schedule_*.js` and `common/room_graph.js`; `viewer/tm_core.js` left out; `erp/kernel_ops.js` left out as the place
  that records the values): *"Yes"*. → **A-1 = that list.** Other geometry maths is not in it until the owner names files. A3's
  `W-CORE-PURE` scans exactly this list. A-2 asked next.
- 2026-11-14, owner, on **A-2** (one source for "now"/"today"; recommendation: Option 1, extend the login context): *"U git admin, manage
  commits question. On question, advice me as u know better."* → delegated to the recommendation (rule at the end of this file: "follow the
  advice" is his answer). **A-2 = Option 1: the login context (carries legacy's `#Date`) is the one source; the transaction's `env` and the
  fixed-time object used at company birth become views of it.** A1 may start. A-3 answered below.
- 2026-11-14, owner, on **A-3** (no date injected; advice given: core fails loudly with a `§` line, never falls back to the UTC day): *"Agreed"*.
  → **A-3 = core never falls back; a missing date fails loudly (`§` line). The EDGE records the session's local calendar day + instant + timezone
  offset in `SESSION_START` (the proposal in item 3 above, adds a field at `erp/kernel_ops.js:941`) and `today()` reads that day.** Settles bim-ootb
  **#2996** (fix lands with A2; `erp/ws_kernel.js` is the ERP lane's file: ask that lane first). A-4 answered below.
- 2026-11-14, owner, on **A-4** (timing reads; advice given: Option 1, `Env.elapsed()`): standing delegation *"On question, advice me as u know better."*,
  then *"continue what is pending"*. → **A-4 = Env.elapsed(); `performance.now()`/`Date.now()` are banned in core even inside a `§` call**, so
  W-CORE-PURE stays a plain call ban with no data-flow analysis. All of Part A's decisions are now answered: A1, A2, A3 may proceed.
- 2026-11-15, owner, on **A-5** (how a standalone core module with no transaction, `rule_fold.js` and `processes/PackIn.js`, gets its clock and id;
  advice given: Option 1, the shell installs the edge once): *"Go with your advice on Option 1."* → **A-5 = `Env.setEdge({nowMs, uuid, perfMs})`,
  installed once by the page; core modules ask `Env.edge()`; no edge installed = `§ENV_NO_DATE` + throw (A-3).** Spec: A2-EDGE below.
- 2026-11-16, owner, on **A-6** (the viewer and `common/` files never load `erp/ad_callout.js`, so they have no `Env.edge()`; where does their edge come from?
  advice given: Option 1, one shared global edge): chose *"Option 1 (Recommended)"*. → **A-6 = one global `CoreEdge` `{nowMs, uuid, perfMs}`, installed
  once by each shell: `viewer/viewer.html` with a small inline `<script>` (no new file, so no precache / `?v=` list grows), `erp/ad_callout.js`
  `Env.setEdge` stores into that same global (one holder), and Node runners (`scripts/cache_4d_run.js`, probes) install it the same way. Core reads it
  at call time. No edge: a timing prints `ms=?`; a missing date or id fails loudly (A-3).** Rejected: loading the ERP file in the viewer (a big file on
  every boot, against lazy loading); passing `opts.edge` through every call (every caller changes). Spec: A2-TIMING-2 below.
- 2026-11-17, owner, on **A-7** (what W-CORE-PURE fails on; measured on `main` @ `249fb934` over the 125 A-1 files: clock/RNG 6, network 0, storage 2
  (`schedule_author.js` IndexedDB cache), `window` 330 = the UMD wrapper, `console` 246 = the `§` lines, `document` 26 in 3 files; a literal ban fails
  ~600 lines, none a determinism bug; advice: values only): chose *"Values only (Recommended)"*. → **A-7 = W-CORE-PURE FAILS on clock, random and network
  calls (goal `forbidden=0`); storage, `document` and `console` are printed as per-file INFO counts for Part C; the wrapper's `window` is not counted.**

**A2-EDGE SPEC (2026-11-15, decision A-5; bim-ootb tracker issue opened with the PR).** Measured on bim-ootb `main` @ `27ac46cc`:
`erp/rule_fold.js:94` `commitEdit` mints the op uuid with `crypto.randomUUID()`, else `'rule:'+nextTs()` (a fallback that can collide across
sessions); its 4 callers are all in that file (`:116 :135 :145 :155`). `erp/processes/PackIn.js:39` builds DateProcessed from `new Date()`.
Both load only on `erp/idempiere.html` (`rule_fold.js` at line 647, `ad_callout.js` at 679; `capex/index.html` loads `ad_callout.js` but neither file).
**Build (one PR per file, `ad_callout.js` change rides with the first):**
- `Env.setEdge(edge)` in `erp/ad_callout.js`: `edge.nowMs` and `edge.uuid` must be functions (`perfMs` optional), else throw; stores it; logs
  `§ENV_EDGE set nowMs=Y uuid=Y perfMs=Y|N replaced=Y|N`. `Env.edge()` returns it, or logs `§ENV_NO_DATE no edge installed` and throws. Core code
  never calls a clock: `ad_callout.js` itself stays clock-free on this path. `Env.modelEnv(ctx, edge)` is NOT changed (callers pass their edge).
- The installer is EDGE code: one inline `<script>` in `erp/idempiere.html` right after `ad_callout.js`: `nowMs` = `Date.now`, `perfMs` =
  `performance.now`, `uuid` = `crypto.randomUUID` when present, else an RFC 4122 v4 id from `crypto.getRandomValues` (available outside a secure
  context too), so the id stays unique where the old `'rule:'+N` fallback did not. No new file, so no precache / `?v=` list grows (P2).
- `rule_fold.js` `commitEdit`: `uuid = Env.edge().uuid()`; the `'rule:'` fallback is removed (A-3). `nextTs()` stays: it is already a
  deterministic counter, not a clock.
- `PackIn.js` (second PR): `now = Env.stamp(Env.edge().nowMs()).now` (the same local stamp the hand-written line made; legacy
  `new Timestamp(System.currentTimeMillis())`, the server's local time).
**Witnesses.** Before/after, unchanged verdict lines: `erp/tests/poc_gated_complete.js` and `erp/tests/poc_i4_reconcile.js` (the real page drives
`RuleFold.setT` / `runGesture`), `capex/tests/witness_td_packin_window.js` (W-TD-PACKIN-WINDOW, the Pack In button), `erp/tests/witness_env_views.js`.
`erp/tests/witness_core_clock_reads.js` gains `rule_fold.js` (then `processes/PackIn.js`) in its list (`clockReads=0`), plus behaviour rows:
`§ENV_EDGE_HELPER` (a) a fixed edge in → `Env.edge().uuid()` returns it; (b) no edge → `§ENV_NO_DATE` + throw (red control: the old silent
fallback would return a value and FAIL this row); (c) an edge without `uuid` is refused. **Issue proved:** a core module reached the wall clock
and the RNG directly, and silently fell back to a colliding id; after: one edge, installed once, and a missing edge fails loudly.
**A2-EDGE RESULT (2026-11-15).** Built and merged: **bim-ootb #3030** (`Fixes #3029`: `Env.setEdge`/`Env.edge()` in `erp/ad_callout.js`, the
inline installer in `erp/idempiere.html`, `rule_fold.js` `commitEdit`) and **#3033** (`processes/PackIn.js`). **Spec deviations, said here:** (1) the
behaviour rows went into a NEW witness `erp/tests/witness_rule_fold_edge.js` (**W-RULE-FOLD-EDGE**), not into `witness_core_clock_reads.js`, which
only gained the two file names; (2) `poc_gated_complete.js` / `poc_i4_reconcile.js` could not serve as before/after: they wait for `#pill-kanban`,
which no longer exists, and FAIL on unedited `main` (left to the ERP lane, not fixed here). Evidence (logs read):
- W-RULE-FOLD-EDGE on unedited `main`: `§RFE VERDICT FAIL rows=4 fail=4`, R3 `outcome=returned id="rule:5001"` (the colliding fallback, live; every
  gesture op was `rule:500x`). After, and re-run on `main` @ `58376fe3`: `§RFE VERDICT PASS rows=5 fail=0` (PackIn re-run on `main` @ `51438e7e`: WTW PASS 4/4, `clockReads=0`); R2 on the real seed DB (GardenWorld 11,
  N=114) `edge_ids_minted=3 reversible=Y oracle=Y`; R5 the real page (headless, no GPU) `§ENV_EDGE_lines=1 §ENV_NO_DATE=0 setT_uuid=<v4> chainOk=Y`.
- W-TD-PACKIN-WINDOW: `VERDICT PASS judged=4` before, after #3030 and after the PackIn edit (W3 = DateProcessed on the local day). Under a load
  average of 22 it timed out at `page.goto` (load, not code): run it alone.
- `witness_core_clock_reads`: `ran=19` → `ran=21`, `rule_fold.js` and `processes/PackIn.js` `clockReads=0`; `witness_env_views` § lines identical.

**A2-TIMING-1 SPEC (2026-11-16, decision A-4; bim-ootb tracker issue with the PR).** The first two timing reads of RESUME 2's list, the ERP pair: `erp/ad_callout.js` `sessionContext` (`var t0 = Date.now()` for the `§LOGINCTX build … ms=` line; the list said `:995`, it is now `:1023`) and `erp/model_pa.js` `storeDue` (`:23` t0, `:27` the `§GOAL_STORE … ms=` line). Both times only a `§` line, and A-4 says that still goes through the edge.
- **Measured:** the edge is installed only by `erp/idempiere.html:686` (`Env.setEdge({nowMs, uuid, perfMs: performance.now})`). `sessionContext` also runs in **Node with no edge** (`common/door/erp_cli.js:490/566`, `erp/ad_process.js:1096`). No code parses either `ms=` value (`git grep` of `LOGINCTX…ms` / `GOAL_STORE…ms=` outside the two files finds 0).
- **Build:** `Env.perfMs()` returns the installed edge's `perfMs()`, or `null` when there is no edge or it has no `perfMs`. `Env.elapsed(t0)` returns that minus `t0`, or `null`. Neither throws, because timing is not a date: A-3's throw is for a missing DATE, while a missing timer just means the line cannot say how long it took. The two sites print `ms=<rounded>` from `Env.elapsed`, or **`ms=?`** with no edge (never a wall clock). `model_pa.js` reads `root.AdCallout.Env` at call time (the page loads it before `ad_callout.js`). `model_pa.js` then has no clock read left and joins `witness_core_clock_reads.js`'s MIGRATED list (16 files). `ad_callout.js` does not, since it still has `getDay(null)` and the `Env.now` fallback, both outside this item.
- **Consequence for the CLI door (the CLI lane's file, so told, not edited):** in Node, `§LOGINCTX` prints `ms=?` until the door installs an edge once (`A.Env.setEdge({ nowMs: Date.now, uuid: crypto.randomUUID, perfMs: performance.now })`, the A-5 pattern).
- **Witness W-CORE-TIMING** (`erp/tests/witness_core_timing.js`, node, no browser):
  - T1: with no edge, `Env.perfMs()` and `Env.elapsed(5)` are `null` and the call does not throw.
  - T2: with a fake edge whose `perfMs` returns 1000 and then 1042, `sessionContext` prints `§LOGINCTX build … ms=42`.
  - T3: `model_pa.js`, run in a `vm` sandbox with stub `ModelLayer`/`GoalEngine`/`__crud` and the same fake edge, prints `§GOAL_STORE … ms=42`; with no edge it prints `ms=?`.
  - **Red control:** the OLD `model_pa.js` / `ad_callout.js` under the same fake edge do NOT print `ms=42` (their wall-clock reading is unrelated to the fake). Run against `main`'s files, it must FAIL.
  - Before/after: `witness_core_clock_reads` (15 → 16 files, `clockReads=0`) and `witness_rule_fold_edge` stay PASS. **The browser witnesses are not run:** W-GOAL-STORE needs the 8098 legacy instance (down) and W-DASH-SYNC writes into the 8088 pilot another lane is using. This item changes only which clock times a log line, and T2/T3 prove that exactly.

**A2-TIMING-1 RESULT (2026-11-16): ✅ DONE (witness), bim-ootb #3109 / PR #3110.** `§CORE_TIMING checks=6 failed=0 verdict=PASS`: no edge gives `ms=?` and nulls with no throw; the fake edge gives `§LOGINCTX … ms=42` and `§GOAL_STORE … ms=42`. **Red run on main's files: 6/6 FAIL** (wall-clock `ms=1`, `ms=2`). `witness_core_clock_reads` `pass=4 fail=0`, ran 21 → 22 (`model_pa.js clockReads=0`); `witness_rule_fold_edge` `VERDICT PASS rows=4`. Cache bump `erp/sw.js` v1084 → v1085, parity gate `verdicts=14 new=[] verdict=PASS`. Doing that bump found **§F.30** (the gate judged `~/bim-ootb`, not the bumped tree) and the `sql.js` instrument trap. The CLI lane was told the door can install an edge for its timings. **Remaining A2 (RESUME 2):** `viewer/cpm_schedule.js`, `viewer/schedule_gate.js` (4D cache key: re-run `scripts/cache_4d_run.js` once), `common/room_graph.js`, `viewer/schedule_inject.js`, `viewer/schedule_author.js`, `viewer/schedule_sync.js`, then the EDGE producers, then A3.

**A2-TIMING-2 SPEC (2026-11-16, decisions A-4 + A-6; bim-ootb tracker issue with the PR).** The 4D pair of RESUME 2, both in the 4D cache key, so one
cache re-run covers them. Measured on bim-ootb `main` @ `8f2dc6b5`:
- `viewer/cpm_schedule.js` `run()`: `t0 :965`, `t1 :967`, `t2c :990`, `t2 :1019`, `t3 :1021`, all `Date.now()`. They feed `§CELL_RUN … ms={contact,axis+solve,total}`,
  `§CPM_RUN … ms={contact,build,solve,total}` and the returned `ms` object, whose only reader is `scripts/probe_cpm_schedule.js:337/347` (a `§CPM_TIMING`
  line). `viewer/schedule_gate.js` `:849` `_t0` → `:1007` `§GEO_ORDER … orderMs=`. No code parses any of these values (`git grep`). Loaded by
  `viewer/viewer.html:1062/1070` (`?v=4`, `?v=3`); in Node by `scripts/cache_4d_run.js:206/209` (`require`, globals on `globalThis`) and ~20 probes.
- The ERP edge lives in a closure (`erp/ad_callout.js:113` `var _edge`), so a viewer file cannot reach it.
**Build (one PR):**
1. `erp/ad_callout.js` `Env`: `setEdge` keeps its checks and its `§ENV_EDGE` line, and stores the edge in `global.CoreEdge`; `edge()` and `perfMs()` read
   `global.CoreEdge`. The `_edge` closure goes. Same behaviour for every ERP caller; the door's `setEdge` (#3113) now also serves `common/` code in Node.
2. `viewer/viewer.html`: an inline `<script>` before `schedule_gate.js` sets `window.CoreEdge = { nowMs, uuid, perfMs }` (the same three as
   `erp/idempiere.html:686`, `uuid` = `crypto.randomUUID` or a v4 from `getRandomValues`) and logs `§CORE_EDGE set by=viewer.html`. It does not overwrite
   an edge already installed.
3. `cpm_schedule.js` / `schedule_gate.js`: a file-local `_perf()` = `global.CoreEdge.perfMs()` or `null`. The `§` lines print each ms, or `?` when
   there is no timer; the returned `ms` fields are numbers or `null`. Nothing else in either file changes.
4. `scripts/cache_4d_run.js` and `scripts/probe_cpm_schedule.js` install `globalThis.CoreEdge` (Node `Date.now`, `crypto.randomUUID`,
   `performance.now`) before they load the pipeline; they are edges. Other probes print `ms=?` until they install one.
5. Bumps: `viewer.html` `?v=` for the two files, `viewer/sw.js` and `erp/sw.js` `CACHE_VERSION` through `scripts/bump.js` (parity gate on, §F.30).
**Witness W-CORE-TIMING, extended** (`erp/tests/witness_core_timing.js`; the viewer copies come from `CORE_TIMING_VIEWER_DIR` for the red run):
- T4 one holder: `Env.setEdge(fake)` → `globalThis.CoreEdge === fake`; with `CoreEdge` set directly, `Env.perfMs()` reads it.
- T5 `CpmSchedule.run` on a small item set: under the +42 fake edge, every `§CPM_RUN` ms is a multiple of 42 and `total` = 3×42; with no edge every ms is `?`
  and `res.ms.total === null`.
- T6 the gate's `§GEO_ORDER`: `orderMs=42` under the fake, `orderMs=?` with no edge.
- T7 neither viewer file has a `Date.now`/`performance.now` call left (`witness_core_clock_reads.js` gains both names, parser-based, `clockReads=0`).
- **Red control:** main's `cpm_schedule.js` / `schedule_gate.js` under the same fake do not print 42s: `CORE_TIMING_VIEWER_DIR=<main>/viewer` must FAIL T5-T7.
- **Before/after, 4D:** `scripts/cache_4d_run.js` on the 4 buildings, re-run once under `nice -n 19 ionice -c3`. The `witness.log` of each must equal
  the cached `main` run (`9098b76bb1ef_*`, 2026-11-14) line for line once ms values are masked, and `run.json` must be byte-identical apart from timings.
  Any other difference is investigated before merge. **Issue proved:** the 4D core timed its own § lines with the wall clock and the viewer had no
  edge; after, the timer comes from one installed edge, and schedules are unchanged.

**A2-TIMING-2 RESULT (2026-11-16): ✅ DONE (witness), bim-ootb #3121 / PR #3122, merged as `80397d69` (CI fast-checks + e2e pass); re-run on `main`: W-CORE-TIMING 14/0 PASS, W-CORE-CLOCK-READS 4/0, W-ENV-VIEWS 7/0.** +94 / −23, 12 files. Logs read:
- W-CORE-TIMING `§CORE_TIMING checks=14 failed=0 verdict=PASS`: the fake edge gives `§CPM_RUN … ms={contact:42,build:42,solve:42,total:126}`, `res.ms.total=126` and
  `§GEO_ORDER … orderMs=42`; no edge gives `ms={contact:?,build:?,solve:?,total:?}`, `res.ms.total=null`, `orderMs=?`. **Red:** main's viewer copies FAIL 6
  (T5-T7: `ms={1,4,2,7}`, `orderMs=2`, 5 + 2 clock calls); main's `ad_callout.js` FAILs T4 2/2 (the closure is not the global).
- W-CORE-CLOCK-READS `pass=4 fail=0 ran=24` (both viewer files `clockReads=0`) · W-ENV-VIEWS `pass=7 fail=0` · W-RULE-FOLD-EDGE `VERDICT PASS rows=5`, R5 on the
  real ERP page (headless, on the owner's 0g go; needs `PW=~/bim-ootb/tests/node_modules/playwright` in a worktree): `§ENV_EDGE_lines=1 §ENV_NO_DATE=0 chainOk=Y`.
- **4D cache, one re-run** (`7fa3d835d478_*` vs main's `9098b76bb1ef_*`, same db keys, 119,568 elements): `witness.log` identical once ms are masked
  (Duplex 55, HHS 51, Hospital 65, Terminal 75 lines); `run.json` differs ONLY in `builtAt` + `codeKey`. Timings print real values through the Node edge
  (Hospital `orderMs=1161`, `§CELL_RUN ms={contact:910,axis+solve:1078,total:1988}`).
- `scripts/bump.js` (erp v1086 → v1087, viewer v1709 → v1710, `ad_callout.js` 7 → 8 in `idempiere.html` + `capex/index.html`, gate 4 → 5, cpm 3 → 4):
  `§BUMP_PARITY mode=block verdicts=13 new=[] tree=/tmp/wt-a6 scoped=partial verdict=PASS`, the same verdict set as the #3112 run (A2-TIMING-1's "14" was the
  unscoped count). `audit_sw_precache` 268/268, 0 unlisted.
- **Not covered by T5:** the CELL path's `§CELL_RUN` line (needs a building db + `LocationAxis`); the 4D cache run covers it (Hospital/Terminal take that path).
- The CLI lane was told its door's `setEdge` now also fills the shared holder (no door edit). **Remaining A2:** `common/room_graph.js` (its
  `_legalizeStats.ms` is read by `viewer/egress_sanity.js:552` with `.toFixed`, so a no-edge `null` must be handled there too), `viewer/schedule_inject.js`
  (`materializeMs`/`persistMs`, read by `viewer/tests/witness_s7_inject_persist.js:166`), then the VALUE reads `schedule_author.js:3115/3448`,
  `schedule_sync.js:36` (they need `CoreEdge.nowMs`/`uuid`, the viewer edge now exists), then the EDGE producers, then A3.

**A2-TIMING-3 SPEC (2026-11-16, decisions A-4 + A-6; bim-ootb tracker issue with the PR).** The last two TIMING reads of RESUME 2. Measured on bim-ootb
`main` @ `bbb7dfb2`:
- `common/room_graph.js` `_legalizePath`: `_legT0 = Date.now()` (`:1692`) and `_legSt.ms += Date.now() - _legT0` (`:1773`), accumulated on
  `graph._legalizeStats`. Its one reader is `viewer/egress_sanity.js:552-557`, which prints `§PATH_LEGAL_NO_RASTER … ms=` + `_lgSt.ms.toFixed(1)` only when the
  building has no `storey_walkable_raster` (Duplex/Clinic/LTU_AHouse `_meta.db` have none; Hospital/Terminal do). The file is loaded lazily by the viewer
  (`viewer/main.js:205`) **and by the Modeller** (`modeller/reg_report_ui.js:16`), and in Node by `tests/test_egress_sanity_rules.js`, `modeller/dxf2bim_cli.js`,
  three `witness/witness_egress_*.js`. In Node `ROOT` is `{}`, so the edge is read from `globalThis.CoreEdge`.
- `viewer/schedule_inject.js` `_now()` (`:55`, `performance.now` else `Date.now`) → `materializeMs` (`:147`) and `persistMs` (`:179`), printed by
  `§SCHED_INJECT_FAIL ms=`, `§SCHED_INJECT materialized … ms=`, `§SCHED_INJECT_RESULT materializeMs= persistMs=`, and returned. Readers: only
  `viewer/tests/witness_s7_inject_persist.js:166-167`, which already guards both (`|| 0`, `!= null`). `viewer/panels.js:1484` does not read them.
  Loaded by `viewer/viewer.html:1122`, after the A-6 installer (`:1062`).
**Build (one PR):**
1. `room_graph.js`: a file-local `_perf()` = `(globalThis or ROOT).CoreEdge.perfMs()` or `null`. A call with no timer at start or end makes
   `_legalizeStats.ms` `null` from then on (an unknown part makes the sum unknown; never a wall clock). Nothing else in the file changes.
2. `egress_sanity.js`: prints `ms=?` when `_lgSt.ms` is `null` (today it would throw `null.toFixed`).
3. `schedule_inject.js`: `_now()` is replaced by the same `_perf()`; each `ms` prints its rounded value or `?`; the returned fields are numbers or `null`.
4. **`modeller/modeller.html`: the same inline installer as `viewer/viewer.html`** (A-6: "installed once by each shell"; the Modeller is a shell that loads
   `room_graph.js`), logging `§CORE_EDGE set by=modeller.html`. No new file. Without it the Modeller's report would print `ms=?`.
5. Bumps through `scripts/bump.js`: `room_graph.js?v=13` → 14 in `viewer/main.js`, `schedule_inject.js?v=3` → 4 and `egress_sanity.js` in `viewer.html`,
   `viewer/sw.js` + `modeller/sw.js` `CACHE_VERSION` (parity gate on, §F.30).
**Witness W-CORE-TIMING, extended** (`erp/tests/witness_core_timing.js`; red copies from `CORE_TIMING_VIEWER_DIR` / `CORE_TIMING_COMMON_DIR`):
- T8 `RoomGraph.shortestPath` on a 2-room graph, 3 calls, under the +42 fake edge: `_legalizeStats = {calls:3, ms:126}`; with no edge `ms === null`.
- T9 the REAL reader: `EgressSanity.evaluate` on `buildings/Duplex_meta.db` (no raster): under the fake edge the `§PATH_LEGAL_NO_RASTER` line says
  `ms=` exactly `42 × calls` (calls is on the same line, so the check has an independent count); with no edge it says `ms=?` and does not throw.
  INCONCLUSIVE when the db is absent or the line does not appear (nothing judged).
- T10 `ScheduleInject.inject` with stub `A` / `scheduleAuthor` / `progress`: fake edge → `§SCHED_INJECT materialized … ms=42`,
  `§SCHED_INJECT_RESULT materializeMs=42 persistMs=42`, `res.materializeMs === 42`; no edge → `ms=?` and `null`s.
- T11 neither `room_graph.js` nor `schedule_inject.js` has a `Date.now`/`performance.now` call left; `witness_core_clock_reads.js` gains both (parser-based).
- **Red controls:** main's `room_graph.js` / `schedule_inject.js` under the fake must FAIL T8, T9, T10, T11; the NEW `room_graph.js` with main's
  `egress_sanity.js` and no edge must throw (that is why step 2 exists).
- **Before/after, unchanged verdicts:** `tests/test_egress_sanity_rules.js` (baseline on `main`: `6 passed, 0 failed`, Hospital counts 440/7/136/136),
  `viewer/tests/witness_s7_inject.js`, `viewer/tests/witness_s7_inject_guard.js`, `witness_core_clock_reads`, `witness_env_views`. `room_graph.js` is not in
  the 4D cache key (`scripts/cache_4d_run.js`), so no 4D re-run. **Issue proved:** the room router and the 4D inject still timed their § lines with
  the wall clock, and the Modeller had no edge; after, both read the one installed edge and say `?` without it, and every route and schedule is unchanged.

**A2-TIMING-3 RESULT (2026-11-16): ✅ DONE (witness), bim-ootb #3123 / PR #3124.** +119 / −19, 10 files. Logs read:
- W-CORE-TIMING `§CORE_TIMING checks=22 failed=0 verdict=PASS`: T8 `{calls:3, ms:126}` / no edge `ms=null`; T9 Clinic egress `legalizations=14901 calls=2636
  ms=110712.0` (= 42 × 2636) / no edge `ms=?`, no throw; T10 `ms=42`, `materializeMs=42 persistMs=42`, `res 42/42` / no edge `?` and `null/null`; T11 0 clock calls.
- **Red:** main's copies FAIL 8 (`ms:0`, Clinic `ms=90849.0`, inject `ms=7`, 2 + 2 clock calls). New router + main's `egress_sanity.js`, no edge:
  `Cannot read properties of null (reading 'toFixed')`, so step 2 is needed.
- **Spec deviations, said here:** (1) T9 uses `Clinic_meta.db`: `Duplex_meta.db` is a 0-byte stub (no `element_transforms`). (2) T10's first run found a defect
  in the edit itself: `schedule_inject.js`'s wrapper passes `this` = `module.exports` as `global` in Node, so `global.CoreEdge` missed; `_perf` reads `globalThis` first.
- Before/after on a detached `main` worktree: W-EGRESS-SANITY 6/0, log identical with ms masked · W-S7-INJECT 24/0 (now `ms=?`: it runs in Node with no edge, as
  the spec allows) · W-S7-INJECT-GUARD 17/0 (its row hash differs run to run on BOTH sides: `§GANTT_SET_BASELINE setAt=` is a wall-clock value, the next item,
  `schedule_author.js`) · W-CORE-CLOCK-READS 4/0, ran 24 → 26 · W-ENV-VIEWS 7/0 · `audit_sw_precache` 268/268, 0 unlisted.
- Headless (owner's 0g go, no GPU, SW blocked): `§CORE_EDGE set by=modeller.html nowMs=Y uuid=Y perfMs=Y` and `by=viewer.html`, `CoreEdge.uuid()` a v4.
- Bumps: `scripts/bump.js` (viewer v1710 → v1711, `room_graph.js` 13 → 14 in `main.js`, `schedule_inject.js` + `egress_sanity.js` 3 → 4, `main.js` 61 → 62);
  `modeller/sw.js` v277 → v278 by hand (`bump.js` takes loaded files, not a page). Not ERP, so no parity gate.
- **Remaining A2:** the VALUE reads `schedule_author.js:3115/3448` (incl. the baseline `setAt`), `schedule_sync.js:36`, then the EDGE producers
  (`crud_overlay._modelEnv`, `plugin_overlay._localNow`, `genesis.js:729` LAST), then A3 W-CORE-PURE.

**A2-VALUE-1 SPEC (2026-11-16, owner "proceed"; decisions A-3 + A-6; bim-ootb tracker issue with the PR).** The last clock/RNG reads in the viewer core
files of A-1. Measured on bim-ootb `main` @ `bd5b543c` (parser-free `grep` first, then each line read): `schedule_author.js` `:533` and `:2838` are
`new Date(<number>)` (arithmetic on a given day, no clock read, unchanged). Three real reads:
- `schedule_author.js:3115` `setBaseline` `setAt = new Date().toISOString()`: a VALUE stored in `task_baseline.set_at` and printed by
  `§GANTT_SET_BASELINE … setAt=`. Callers: `viewer/tm_gantt_edit.js:1149` (⚑ Set Baseline, viewer page) and two Node witnesses
  (`viewer/tests/witness_gantt_baseline.js:36/66`, `viewer/tests/witness_s7_inject_guard.js:130`). No code reads `set_at` back (`git grep`).
- `schedule_author.js:3448` `persistDb`: `tx.objectStore('timestamps').put(Date.now(), key)`, the LRU recency stamp that keeps edited work from being
  evicted (§SCHED_PERSIST_LRU_TOUCH). IndexedDB, so it only runs on a page; every `persistDb` caller is a viewer-page file. Only a browser probe touches it.
- `schedule_sync.js:36` `newTabId` `'tab_' + Math.random()…`, with a colliding `'tab_x'` fallback; used only when `create()` gets no `tabId`. In
  production `create()` is never called (`git grep`); the one caller (`erp/tests/schedule_sync_witness.js:80`) passes `tabId: 'tabA'`.
- Pages that load `schedule_author.js`: `viewer/viewer.html` (edge installed, A-6) and `viewer/boq_charts.html` (no edge; it only reads, `activeSchedule`,
  and calls neither `setBaseline` nor `persistDb`, so it needs no installer).
**Build (one PR):**
1. `setBaseline(db, scheduleId, opts)`: `setAt` = `opts.setAt` when the caller recorded one, else `new Date(CoreEdge.nowMs()).toISOString()` (the same
   UTC ISO text as today). No edge and no `opts.setAt`: `§ENV_NO_DATE setBaseline` and `{ ok:false, reason:'no_clock' }`, **nothing written** (checked before
   `BEGIN`; A-3, and the function's own failure shape, like `no_tasks`).
2. `persistDb`: the stamp is `CoreEdge.nowMs()`. No edge: `§ENV_NO_DATE persistDb timestamps` and the blob is still saved without a new stamp (failing the
   save would lose the user's edit, which is worse than an old recency stamp; no wall clock either way).
3. `newTabId`: `'tab_' + CoreEdge.uuid()`. No edge: `§ENV_NO_DATE newTabId` and a throw (A-3: an id is never guessed; the `'tab_x'` fallback goes, as
   `rule_fold.js`'s `'rule:'` did in A2-EDGE). `create({ tabId })` needs no edge.
4. The two Node witnesses that call `setBaseline` install `globalThis.CoreEdge` (Node `Date.now`, `crypto.randomUUID`, `performance.now`) before they load
   the file: they are edges (A-6 item 4).
5. Bumps through `scripts/bump.js`: `schedule_author.js` in `viewer.html` (19 → 20) and `boq_charts.html` (11 → 12), `schedule_sync.js` 3 → 4, `viewer/sw.js`.
**Witness W-CORE-TIMING, extended** (name kept; it is the core-edge witness), T12–T14, plus `witness_core_clock_reads.js` gaining `schedule_sync.js`
(`schedule_author.js` is listed when its count is 0):
- T12 `setBaseline` on a real in-memory `sql.js` db with 3 tasks: fake edge (`nowMs` = 2026-11-16 03:00 UTC) → `setAt=2026-11-16T03:00:00.000Z` on the
  `§` line and in all 3 `set_at`; `opts.setAt` wins over the edge; no edge → `ok:false reason=no_clock`, `§ENV_NO_DATE`, 0 baseline rows.
- T13 `persistDb` through the `APP.openCacheDB` seam with a fake IndexedDB: the `timestamps` put is the edge's `nowMs`; no edge → the blob is put, no
  timestamp put, `§ENV_NO_DATE`, resolves `true`.
- T14 `ScheduleSync.create()`: fake edge → `tabId = 'tab_' + <the edge's uuid>`; no edge → throws with `§ENV_NO_DATE`; `create({ tabId:'tabA' })` works with no edge.
- **Red control:** main's `schedule_author.js` / `schedule_sync.js` (`CORE_TIMING_VIEWER_DIR`) must FAIL T12–T14 (wall-clock `setAt`, `Date.now` stamp,
  `Math.random` id, no throw).
- **Before/after:** `witness_gantt_baseline`, `witness_s7_inject_guard`, `witness_s7_inject`, `erp/tests/schedule_sync_witness.js`, W-CORE-CLOCK-READS,
  W-ENV-VIEWS unchanged; **4D cache:** `schedule_author.js` is in the cache key, so `scripts/cache_4d_run.js` re-runs once on the 4 buildings
  (`nice -n 19 ionice -c3`): `witness.log` identical with ms masked, `run.json` differing only in `builtAt` + `codeKey` (the A2-TIMING-2 method).
**Issue proved:** the 4D core still stamped a stored baseline and the cache with the wall clock and minted a tab id with `Math.random` (with a colliding
fallback); after, all three come from the one installed edge, and a missing edge says so instead of guessing.

**A2-VALUE-1 RESULT (2026-11-16): ✅ DONE (witness), bim-ootb #3134 / PR #3135.** +97 / −14, 12 files. Logs read:
- W-CORE-TIMING `§CORE_TIMING checks=31 failed=0 verdict=PASS`: T12 `setAt=2026-11-16T03:00:00.000Z` on the `§` line and all 3 `set_at`, `opts.setAt` wins,
  no edge `{"ok":false,"reason":"no_clock"}` with 0 rows · T13 the `timestamps` put = the edge's ms (`1794798000000`), no edge = blob put, 0 stamps, `§ENV_NO_DATE`,
  resolves `true` · T14 `tab_11111111-2222-4333-8444-555555555555`, no edge throws, `create({tabId:'tabA'})` works · T15 0 clock/RNG calls in both files.
- **Red:** main's copies FAIL 9 (wall-clock `setAt=2026-11-16T10:41:39.867Z`, `Date.now` stamp, `tab_tqwdvyb`, no failure with no edge, 2 + 1 calls).
- Before/after (detached `main` worktree): W-BASELINE 11/0 · W-S7-INJECT · W-S7-INJECT-GUARD · W-SCHED-SYNC 11/11, all logs identical with timestamps
  masked · W-CORE-CLOCK-READS 4/0, ran 26 → 28 · W-ENV-VIEWS 7/0 · `audit_sw_precache` 268/268.
- **4D cache, one re-run** (`6cb996db41e8_*` vs main's `7fa3d835d478_*`, same db keys): `witness.log` 0 differing lines on Duplex 55, HHS 51, Hospital 65,
  Terminal 75 lines (ms fields masked); `run.json` differs ONLY in `builtAt` + `codeKey`.
- **Spec corrections, said here:** (1) a THIRD loader exists: `modeller/edit_delta_ui.js:10` lazy-loads `../viewer/schedule_author.js` (read-only use; the
  Modeller page has had the edge since A2-TIMING-3), found by `scripts/bump.js`; bumps were viewer v1712 → v1713, modeller v279 → v280, `edit_delta_ui.js`
  14 → 15. (2) The witness's first run never exited: `ScheduleSync.create()` opens a real `BroadcastChannel` in Node; T14 closes every handle it makes.
- **Remaining A2:** the EDGE producers (`crud_overlay._modelEnv`, `plugin_overlay._localNow`, `genesis.js:729` LAST), then A3 W-CORE-PURE.

**A2-EDGE-2 SPEC (2026-11-16, owner "proceed"; decisions A-2 + A-6; bim-ootb tracker issue with the PR).** The env PRODUCERS: edge code that builds the
transaction env with its own copy of the local-stamp code. A-2 says the trx env is a VIEW of the one login-context clock, so each producer keeps its fields
and its behaviour but takes the instant from the installed edge and the text from `Env.stamp` (one implementation). Measured on bim-ootb `main` @ `1d2acabd`:
- `erp/crud_overlay.js:1904` `_modelEnv()`: `new Date()` + a hand `pad`, `uuid` = `crypto.randomUUID` or `null`. Callers: 6, every one behind a `ModelLayer`
  check (`:1951 :1988 :2686 :2739 :2882 :3388`). Pages: `erp/idempiere.html:842` (edge installed at `:708`) and `erp/glassbowl.html:882` (no edge, but it loads
  no `ModelLayer`, so `_modelEnv` is never reached there). In Node, `require('crud_overlay.js')` returns the pure core only; `_modelEnv` is not loaded.
- `erp/plugin_overlay.js:114` `_localNow()` (a second copy of the same stamp) and `:115` `_clientEnv(r)`, which reads the clock TWICE (`_localNow()` and
  `Date.now()`), so `now` and `nowMillis` can disagree. Used by `packInClient` (`:132`, the `AD_Package_Imp` row's `created`/`updated`) and the client-pack
  replay (`:162`). Loaded by `erp/idempiere.html:637` only.
- `erp/genesis.js:729`: **reads no clock and no RNG** (a fixed 09:00 on the posting date, a counter for ids): already pure. **No change.** Folding it into
  `Env.modelEnv` would change what it returns: `Env.stamp` gives the LOCAL text of an instant, while this env pairs `now = 'D 09:00:00'` with
  `nowMillis = Date.parse('DT09:00:00Z')` (09:00 UTC). That pair disagrees by the zone offset: a finding, recorded here, not changed.
- **Probe on `main` (real page, headless, Asia/Kuala_Lumpur, a fake `CoreEdge` set before the call):** `__crud.withModelTrx` hands the env
  `{"date":"2026-11-16 00:00:00","now":"2026-11-16 19:42:00","nowMillis":1794829320100,"id":"93315523-…"}`: the wall clock and `crypto`, not the edge.
- **Finding, NOT in this item (not in A-1's list):** `erp/pipo_packin.js:55` and `:270` fall back to a **UTC** stamp (`new Date().toISOString()…`) when a caller
  passes no `now`, and the bundle Pack In path does not pass one (`:308` `recordImport(db, bundle, p.version, st)`). Same defect class as the door stamp (0b).
  Ask the owner before changing it.
**Build (one PR):**
1. `_modelEnv()`: `var E = AdCallout.Env, edge = E.edge(), ms = edge.nowMs(), st = E.stamp(ms)` → `date: st.day + ' 00:00:00'`, `now: st.now`, `nowMillis: ms`,
   `uuid: edge.uuid`. Every other field unchanged. No `AdCallout` or no edge: `§ENV_NO_DATE` + throw (A-3; unreachable on both pages, measured above).
2. `_localNow()` = `Env.stamp(Env.edge().nowMs()).now`; `_clientEnv(r)` reads the edge ONCE (`now` and `nowMillis` from the same instant) and `uuid: edge.uuid`.
3. Bumps through `scripts/bump.js` (ERP: the parity gate runs, `BUMP_PARITY_BRIDGE` at a bim-compiler `origin/master` worktree, §F.30).
**Witness W-EDGE-PRODUCERS** (`erp/tests/witness_edge_producers.js`, the real `erp/idempiere.html`, headless, no GPU, `timezoneId: Asia/Kuala_Lumpur`; served from
`EP_REPO`, default this checkout):
- E1 `__crud.withModelTrx` under a fake `CoreEdge` (`nowMs` = 2026-11-20 10:15:00 local, a fixed uuid): `date = '2026-11-20 00:00:00'`, `now = '2026-11-20 10:15:00'`,
  `nowMillis` = the fake's ms, `uuid()` = the fake's id.
- E2 `PluginEngine.packInClient` with the CAPEX test 2Pack (`capex/plugin/testdata_2pack/*_GardenWorld_CAPEXTestData.zip`, client 11) under the same fake:
  the new `AD_Package_Imp` row has `created = updated = '2026-11-20 10:15:00'`, and `ok` is true.
- E3 the producers have no `new Date()` / `Date.now()` / `randomUUID` left (the function bodies, parsed by name from the file).
- **Red control:** `EP_REPO=<a main worktree>` must FAIL E1–E3 (the probe above already shows E1's wall clock).
- **Before/after:** W-TD-PACKIN-WINDOW (the Pack In button, `capex/tests/witness_td_packin_window.js`) `VERDICT PASS`, W-RULE-FOLD-EDGE, W-CORE-TIMING,
  W-CORE-CLOCK-READS, W-ENV-VIEWS unchanged; the parity gate verdict set unchanged.
**Issue proved:** two edge producers each kept their own copy of the local-stamp code, read the wall clock and the RNG directly, and one read the clock twice;
after, both are views of the one edge clock through `Env.stamp`, so a page's model env follows the installed edge.

**A2-EDGE-2 RESULT (2026-11-16): ✅ DONE (witness), bim-ootb #3139 / PR #3140.** +114 / −13, 6 files (+15 / −9 in the two producers). Logs read:
- W-EDGE-PRODUCERS `§EDGE_PRODUCERS checks=5 failed=0 verdict=PASS` on the real page: E1 env `{"date":"2026-11-20 00:00:00","now":"2026-11-20 10:15:00","nowMillis":1795140900000,
  "id":"11111111-…"}` = the fake edge · E2 a real `packInClient` (`§PACKIN-CLIENT … ok=true processed=225 unresolved=0`), `AD_Package_Imp` created/updated =
  `2026-11-20 10:15:00` · E3 (espree, by function name) 0 clock calls in `_modelEnv`, `_localNow`, `_clientEnv`.
- **Red:** `EP_REPO=<main worktree>` 5/5 FAIL (`now=2026-11-16 19:44:40`, a crypto id, Pack In stamped `2026-11-16 19:44:46`, 2 + 1 + 2 calls).
- Before/after (detached `main` worktree): W-TD-PACKIN-WINDOW `VERDICT PASS judged=4` both sides · W-RULE-FOLD-EDGE 4/0 both, and 5/0 with the page row on the
  branch (`§ENV_EDGE_lines=1 §ENV_NO_DATE=0 chainOk=Y`) · W-ENV-VIEWS 7/0 · W-CORE-CLOCK-READS 4/0 · `audit_sw_precache` 268/268.
- Parity gate (`scripts/bump.js`, erp/sw.js v1091 → v1092, `crud_overlay.js` 44 → 45 and 20 → 21 in `glassbowl.html`, `plugin_overlay.js` 10 → 11):
  `§BUMP_PARITY mode=block verdicts=13 new=[] known=[DD:FAIL,CTX:FAIL,DDS:HARNESS-FAIL] tree=/tmp/wt-a2e scoped=partial verdict=PASS`; log: 0 `sql.js`
  errors (a `node_modules` symlink into the fresh bridge worktree), every witness on `ootb=/tmp/wt-a2e`.
- **New instrument trap (for §8):** in a FRESH bim-compiler bridge worktree, DD and DDS fail on `ENOENT … copyfile '<bridge>/build/erp/ad_seed_fullwidth.db'`:
  that DB is untracked and exists only in the shared `~/bim-compiler`. Both are on the gate's known list, so the verdict holds, but in such a run they judged
  nothing. Copy or link that DB into the bridge worktree before a gate run that must judge DD/DDS.
- **Remaining A2:** none in the A-1 list (`genesis.js` needs no change). **NEXT: A3 W-CORE-PURE** (the AST scan over the A-1 list that replaces
  `witness_core_clock_reads.js`'s hand list), then the `pipo_packin.js` UTC finding to the owner (one message).

**A2-PIPO SPEC (2026-11-16; owner, asked for advice on the `pipo_packin.js` UTC fallback: advice given "fix it, legacy source first, stop if legacy
disagrees", owner *"ok"*; bim-ootb tracker issue with the PR).**
- **Legacy, read first (the oracle):** `PO.java:1985` gives a new record `Created`/`Updated` = `new Timestamp(System.currentTimeMillis())`, `:3341` the same for
  `Updated` on save, written through `DB.TO_DATE(now, false)`; `DB_PostgreSQL.java` `TO_DATE` writes `time.toString()`, which Java prints in the JVM's DEFAULT
  zone. **So legacy stamps the server's LOCAL wall clock**; the twin's UTC fallback is a divergence (twin rule), not a quirk. `PackInHandler.java:171` creates
  the `AD_Package_Imp` row through that PO path.
- **The twin, measured on bim-ootb `main` @ `fa5b942c`:** `erp/pipo_packin.js:55` (`apply`) and `:270` (`recordImport`) default `now` to
  `new Date().toISOString()…` = **UTC**; `:148` mints ids with `crypto.randomUUID` (or `null`) when no `opts.uuid` is given. The bundle path
  (`plugin_overlay._packApply` → `PipoPackIn.incremental` `:307-308`) passes no `now`, so every bundle Pack In row and its `AD_Package_Imp` row are stamped in UTC:
  in +08 eight hours behind, and the previous DAY between 00:00 and 08:00. The client path passes `_localNow()`, so `AD_Package_Imp` mixes two clocks.
  `erp/plugin_overlay.js:71` `_packOpts().uuid` is also `crypto.randomUUID` (an RNG read A2-EDGE-2 missed). Loaded by `erp/idempiere.html:635` only; no Node
  caller (`git grep`).
**Build (one PR):** `pipo_packin.js` `now` defaults to `AdCallout.Env.stamp(Env.edge().nowMs()).now` (local, the one stamp), `uuid()` defaults to
`Env.edge().uuid()`; no `AdCallout` or no edge = `§ENV_NO_DATE` + throw (A-3). `plugin_overlay._packOpts().uuid` = the edge's uuid. Bump through `scripts/bump.js`
(parity gate on, the fresh-bridge DD/DDS trap handled by linking `build/erp/ad_seed_fullwidth.db`).
**Witness W-PIPO-LOCAL** (`erp/tests/witness_pipo_local.js`, the real `erp/idempiere.html`, headless, `timezoneId: Asia/Kuala_Lumpur`, the page clock fixed at
2026-11-13 00:30 local with Playwright's `page.clock.setFixedTime`, so the old and the new code see the SAME instant and only the zone differs):
- P1 a bundle Pack In through `PipoPackIn.incremental` with no `now` (the CAPEX test 2Pack, as a bundle): its `AD_Package_Imp` row and the
  `ad_package_uuid_map` rows it wrote say `created = updated = '2026-11-13 00:30:00'` (local), not `2026-11-12 16:30:00` (UTC).
- P2 the ids it minted come from the installed edge (a counting wrapper on `CoreEdge.uuid`): count > 0 and each `ad_package_uuid_map` uuid is one the wrapper returned.
- P3 parser: no `new Date()` / `Date.now()` / `randomUUID` left in `pipo_packin.js` or in `plugin_overlay._packOpts`.
- **Red control:** `PL_REPO=<main worktree>` must FAIL P1 (the UTC day `2026-11-12`), P2 (count 0) and P3.
- **Before/after:** W-PACKIN (`erp/tests/witness_packin.js`), W-TD-PACKIN-WINDOW, W-EDGE-PRODUCERS, the parity gate.
**Issue proved:** bundle Pack In stamped every row in UTC (yesterday's date before 08:00 at +08) while legacy and the client path stamp local time; after, one
local clock from the installed edge, and the ids from the edge too.

**A2-PIPO RESULT (2026-11-16): ✅ DONE (witness), bim-ootb #3142 / PR #3143.** +98 / −7, 5 files (+12 / −4 in the two files). Logs read:
- W-PIPO-LOCAL `§PIPO_LOCAL checks=4 failed=0 verdict=PASS`, page clock `Fri Nov 13 2026 00:30:00 GMT+0800`, walk `[{"ok":true,"processed":225}]`: P1
  `AD_Package_Imp` `["2026-11-13 00:30:00","2026-11-13 00:30:00"]` · P1b 12 `C_Project` rows at `2026-11-13 00:30:00`, 0 at the UTC stamp · P3 0 clock/RNG calls.
- **Red (main's files): 4/4 FAIL**, the defect shown: `AD_Package_Imp` `["2026-11-12 16:30:00", …]` and 12 `C_Project` rows at `2026-11-12 16:30:00` (UTC, the
  previous day); 3 calls in `pipo_packin.js`, 1 in `_packOpts`.
- **Spec deviation, said here:** P2 (ids from the edge) has no behavioural population: the CAPEX test pack carries its own UUs, so 0 ids were minted (measured).
  The id default is proven by P3 (parser) only. A pack with records lacking UUs would make P2 real.
- Before/after (detached `main` worktree): W-PACKIN `§WPK_VERDICT GREEN judged=6 failed=0` both · W-TD-PACKIN-WINDOW 4/0 both · W-EDGE-PRODUCERS 5/0 both · precache 268/268.
- Parity gate: `§BUMP_PARITY mode=block verdicts=13 new=[] tree=/tmp/wt-pipo scoped=partial verdict=PASS`, 0 `sql.js` errors (erp/sw.js v1092 → v1093,
  `pipo_packin.js` 4 → 5, `plugin_overlay.js` 11 → 12).
- **Trap correction (supersedes the A2-EDGE-2 note):** linking `build/erp/ad_seed_fullwidth.db` is not enough; DD and DDS then fail on `build/erp/glassbowl_data.db`.
  The shared `~/bim-compiler` holds **39 untracked `build/erp/*.db`** (`git ls-files --others --ignored -- 'build/erp/*.db'`) and the bridge reaches them
  indirectly. Link ALL of them into a fresh bridge worktree before a gate run that must judge DD/DDS. In this run DD/DDS judged nothing (both on the known list).

**A3 PRE-MEASURE (2026-11-17, seventh session, bim-ootb `main` @ `249fb934`).** Before W-CORE-PURE can say `forbidden=0`, the A-1 list must have no
clock/RNG call left. `clock_probe.js` over the A-1 pathspecs: `§CLOCK_PROBE files=125 with_calls=2 calls=6 parse_fail=0`:
`erp/ad_callout.js` `Date.now@51` (`TimeUtil.getDay(null)`), `Date.now@208` (`Env.getContextAsDate` empty-context fallback), `new Date()@896` (`RUNTIME.now`,
the ERP's SQL clock: `getdate()`/`SYSDATE` `callouts/sqlfn.js:19,:269`, `@SysDate@` `:718`, the login `#Date` `:984`) · `erp/callouts/sqlfn.js` `Date.now@440`,
`crypto.getRandomValues@442`, `Math.random@442` (`generate_uuid()`). Legacy, read: `TimeUtil.java:61-62` `getDay(null)` and `Env.java:989-990`
`getContextAsDate` empty both use `System.currentTimeMillis()` in the JVM's zone (LOCAL).
**Defect found by the code read and proved by a probe** (`TZ=Asia/Kuala_Lumpur`, clock fixed at 2026-11-13 00:30 local, `A.bind` as the page and as
`ad_process.js:1091` `runJava` call it): `§PROBE_SYSDATE phase=page_default runtimeNow=2026-11-13 00:30:00` ·
`phase=inside_runJava(env.nowMillis) runtimeNow=2026-11-12 16:30:00` · `phase=page_after_rebind_no_now runtimeNow=2026-11-12 16:30:00` (UTC: all three
`2026-11-13 00:30:00`). Two faults: (1) `runJava` binds the SQL clock to `env.nowMillis`, a true epoch, while the twin's `Timestamp` holds LOCAL wall-clock
fields as UTC ms (`ad_callout.js:22-41`, `:890-896`), so inside a Java process `getdate()` is the UTC wall clock: 8 h behind at +08, the previous day
before 08:00; (2) it puts the clock back only when it ran in a caller's trx (`:1095` `if (kept)`), so after a stand-alone process the page's SQL clock
stays frozen at that process's instant (`crud_overlay.js:428` rebinds without `now`). A twin divergence (legacy SYSDATE = the DB server's local clock),
fixed on the SQLite side; no owner decision (CARDINAL RULE; A-3 local day).
**Plan, three PRs:** A3-CLOCK-1 (this defect + the two UTC fallbacks) · A3-CLOCK-2 (`RUNTIME.now` and `generate_uuid` read the installed edge; every
host that loads `ad_callout.js` installs one, per A-3/A-6) · A3 W-CORE-PURE (the scan; its ban list needs owner decision **A-7**, below A3-CLOCK-2).

**A3-CLOCK-1 SPEC (2026-11-17; twin rule + A-3; bim-ootb tracker issue with the PR).**
**Build:** (a) `erp/ad_process.js` `runJava`: the process's SQL clock is the env's LOCAL stamp, `new A.Timestamp(A.Env.nowStamp(env)).ms`
(`nowStamp` prefers `env.now`, the local text every producer sets: `Env.modelEnv`, `crud_overlay._modelEnv`, `ws_kernel env()`, `plugin_overlay._clientEnv`,
genesis), and the binding it replaced is put back in `finally` in BOTH cases (`now` + `Env.now`; `DB`/`PO`/`log` keep today's behaviour). An env
with no clock keeps the page's clock (no `now` passed), as today. (b) `ad_callout.js:51` `getDay(null)` and `:208` `getContextAsDate` empty both take
`RUNTIME.now()` (the local wall clock, legacy's), not `Date.now()` (UTC). Callers: `callouts/currency.js:84` (ConvDate null = today),
`InOutGenerate.js:37`, `InvoiceGenerate.js:37`, `OrderLineCreateShipment.js:20`.
(c) **Found by the first S1 run (added to this spec before the fix, 2026-11-17):** the 63 `M_StorageOnHand` rows a real InventoryCountCreate (`QtyRange '='`)
inserted had `ad_client_id=0`, `created='Y'`, `isactive=50000`, `updated=50008`, `m_locator_id=null`, `m_product_id='2026-11-16 00:00:00'`, on `main` too.
`ad_process.js:1034` maps an `INSERT … SELECT` by `Object.keys(row)`: the SELECT list `l.AD_CLIENT_ID, l.AD_ORG_ID, 'Y', getDate(), 0, getDate(), 0, …`
has duplicate result names (`0` x4, `getDate()` x2), which collapse in a row object, and `0` is an integer-like key that JavaScript orders first. Every
value after that lands in the wrong column. Fix: alias each top-level SELECT expression `(<e>) AS __vN`, the way the VALUES branch already does (`:1033`)
and the `UPDATE … SET (…) = (SELECT …)` branch splits its list (`:1014` `_topIdx` + `_splitTop`); a leading `DISTINCT` is kept outside the aliases. Own
tracker issue. Legacy runs the SQL in PostgreSQL, which maps by position.
**Witness W-PROC-SYSDATE** (`erp/tests/witness_proc_sysdate.js`, node, `witness_kit/contract.js`, `TZ=Asia/Kuala_Lumpur`, clock fixed at
2026-11-13 00:30 local before the kernel loads, as W-REPLAY-CLOCK does), population from the seed company (client 11, `ws_kernel` `K.load()`):
- S1 a REAL process run through `AP.runInTrx`: InventoryCountCreate (process 105, `QtyRange '='`, the "null storage" INSERT with `getDate()` and
  `trunc(getdate())`, `InventoryCountCreate.js:44`) on a new `M_Inventory`: every `M_StorageOnHand` row it inserted has `created`/`updated` =
  `2026-11-13 00:30:..` and `datematerialpolicy` (= `trunc(getdate())`) day `2026-11-13` *(spec said `datelastinventory`; the SQL sets that NULL, as legacy's does: corrected after the first run)*. **INCONCLUSIVE** if it inserted 0 rows.
- S0 (part c) every inserted row's columns are the SELECT's, by position: `ad_client_id=11`, `isactive='Y'`, `m_locator_id` = a default locator of that
  warehouse, `m_product_id` = a stocked item product, `qtyonhand=0`, `m_storageonhand_uu` a v7 uuid; plus a unit row: `INSERT INTO t (a,b,c) SELECT 0, 0, 'x'`
  through the process DB gives `a=0, b=0, c='x'`.
- S2 after that process, the page's SQL clock (`getdate()` through the bound runtime) is the live clock again, not the process's instant (tick the fake
  clock by 1 h between the run and the read: must read 01:30).
- S3 `TimeUtil.getDay(null)` = day `2026-11-13`; `Env.getContextAsDate(emptyCtx, '#Date')` = `2026-11-13 00:30:..`.
- **Red control:** the same run with `OOTB=<main worktree>` must FAIL S1 (`2026-11-12 16:30`), S2 (frozen) and S3 (`2026-11-12`). Also UTC: S1–S3 pass on
  both trees (equality on UTC proves nothing; +08 00:30 is the test).
- **Before/after (detached main worktree):** W-REPLAY-CLOCK, W-LOCAL-TIME, W-ENV-VIEWS, W-FN-PARITY, W-CORE-CLOCK-READS, W-CORE-TIMING; the parity gate on the bump.
**Issue proved:** inside a Java process the twin's SYSDATE was the UTC wall clock and stayed frozen afterwards, and two "today" fallbacks took the UTC day;
after, one local clock, legacy's.

**A3-CLOCK-1 RESULT (2026-11-17): ✅ DONE (witness), bim-ootb #3145 + #3146 / PR #3149, merged `674cdf72`.** +29 / −6 in `ad_process.js` + `ad_callout.js`. Logs read:
- W-PROC-SYSDATE (`erp/tests/witness_proc_sysdate.js`, a real InventoryCountCreate on client 11, 63 rows): `§PROC_SYSDATE checks=4 failed=0 inserted=63 verdict=PASS`
  at +08 and at UTC, on the branch AND re-run on merged `main` @ `674cdf72`. **Red (main before):** +08 4/4 FAIL (S0 `ad_client_id=0, created='Y', isactive=50000`,
  S1 `2026-11-12 16:30`, S2 frozen at `2026-11-12 16:30:00`, S3 `2026-11-12`); UTC 3/4 FAIL (S3 cannot show at UTC, as the spec says).
- Before/after, same verdicts: W-FN-PARITY 48/48 PASS (incl. `generate_uuid`) · W-LOCAL-TIME 4/4 · W-ENV-VIEWS 7/0 · W-REPLAY-CLOCK 4/0 `match=Y` both zones
  (hashes differ run to run, A0 finding 2) · W-CORE-CLOCK-READS 4/0 · W-CORE-TIMING 31/0 · `audit_sw_precache` 268/268. Bump erp/sw.js v1093 → v1094,
  `ad_process.js` 22 → 23, `ad_callout.js` 8 → 9 (also in `capex/index.html`, which has no sw).
- **Spec deviations, said here:** S0's unit row (`INSERT … SELECT 0, 0, 'x'`) was dropped: `processDB` is not exported; S0 judges the 63 real rows against the
  locators/products read independently. S1 judges `datematerialpolicy` (corrected above). INSERT … SELECT has ONE user in the ported processes (`git grep`).
- **Parity gate: OVERRIDE with reason** (`--no-parity`, F-16's own exception path). The gate's first run gave `verdicts=0 … why=bridge_error(spawnSync bash
  ETIMEDOUT)`: the full bridge now takes **25 min** (`~/.cache/bim_bridge/run_20261117_021326.log`; `witness_fa_gap` alone ~25 min of it), the gate's limit is
  15 min (`scripts/bump.js:185`). The full run on the branch: DD PASS, DDS PASS (both were known FAILs: the 39 linked `build/erp/*.db` made them judge),
  CTX FAIL (known), M3 HARNESS-FAIL and FA FAIL. ~~Both load only bim-compiler's own engine~~ **CORRECTION (same day, after merge): FA does
  (`witness_fa_gap.js:13-14`), but M3 ALSO loads the bumped tree** on its AD-window path (`witness_m3_gap.js:166-171`, `BRIDGE_OOTB` → `erp/model_order.js`).
  M3 re-run before (`ed092608`) and after (`674cdf72`): identical `§M3_VERDICT HARNESS-FAIL fails=1 inconclusive=1 findings=18`, the same 88 `§GAP` lines
  (4 differ only in values that drift with the pilot's accumulated data: NEG-bs ending 57535 → 59089, NEG-pi stock −38 → −43). So this PR changed nothing M3 judges.
  Of the 16 bridge witnesses in `run_all.sh`, 6 load the bumped tree (attachment_parity, lf_parity, m3_gap, product_icons, soda_parity, soda_receipt_parity). **Finding for this lane (F-16 / §F.30):** the gate should run only
  the witnesses that load the bumped tree (`BRIDGE_OOTB`/`OOTB`), or carry a longer limit; until then a full-bridge gate on an ERP file times out every time.

**OWNERS OF THE OPEN ITEMS (checked 2026-11-17, owner asked "which prompts/# owns those issues"):**
| Item | Owner file | Note |
|---|---|---|
| `witness_fa_gap` slow (~25 min) / FA FAIL, M3 HARNESS-FAIL | bim-compiler `prompts/SQLiteIDEMPIERE.md` (FA scenarios `:1361`, D7/D8; FA = extra, not core) | FA judges bim-compiler's engine only; M3 also loads bim-ootb (unchanged by #3149). Cause of the slowness + reset advice: that file's 2026-11-17 notes |
| `erp/ws_kernel.js` (A3-CLOCK-2 must install the edge there) | bim-compiler `prompts/ERP_WS_API.md` (S2 built it; last touched 2026-11-09) | recent edits by the CLI + Project-process work: ask the live session first, record in `ERP_WS_API.md` |
| "15 of 51 `ws_kernel.js` witnesses fail on unedited main" (RESUME 7) | **none: no source.** The archive holds no such list and no prompts file in either repo names it | RESUME 7 corrected: re-measure before quoting |
| 4D cache `witness.log` has no `§LOG_STAMP` | split: `§LOG_STAMP` is this lane's (§F.7, F-11); `scripts/cache_4d_run.js` is `prompts/4D_MODEL_INTEGRITY.md`'s (PRIMAL LAW 5, §I) | the 4D lane's file and cache key: hand over as information |
| F-2 cost ceilings, due 2026-11-30 | this file, §F.3 | — |

**A3-CLOCK-2 SPEC (2026-11-17, draft; decisions A-3 + A-5 + A-6; not built).** The last two clock owners in the A-1 list read the wall clock instead of the
installed edge, so a page with a fake or replayed edge still gets the real clock for SQL `SYSDATE`, `@SysDate@` and the login `#Date`:
`ad_callout.js:896` `RUNTIME.now` (`new Date()`) and `callouts/sqlfn.js:440-442` `generate_uuid()` (`Date.now()`, `crypto.getRandomValues`, `Math.random`).
**Build:** `RUNTIME.now` = the local wall-clock form of `Env.edge().nowMs()` (`ms - new Date(ms).getTimezoneOffset()*60000`; `new Date(ms)` with an argument
reads no clock); `generate_uuid(null)` takes its ms from `Env.edge().nowMs()` and its 10 random bytes from the hex of `Env.edge().uuid()` (a v4 id: hex
0-11 + 18-25, the random positions). No edge = `§ENV_NO_DATE` + throw (A-3). **Hosts that load `ad_callout.js` and must install the edge first (A-6),
measured on `main` @ `249fb934`:** pages `erp/idempiere.html` (has it, `:708`), `viewer/viewer.html` (has `CoreEdge`), `capex/index.html` (NONE); Node
`common/door/erp_cli.js:43` (has it), `erp/ws_kernel.js` (NONE: the ERP lane's file, ask first), `common/door/door_plugins.js`, `capex/tools/migration_apply.js`,
`devtools/hover/erp_*.js`, bim-compiler `scripts/bridge/ad_shipped_fixture.js` (each to be checked), and 57 `*/tests/*.js` that require it.
**Method:** run every Node witness that requires `ad_callout.js` before/after; any new `§ENV_NO_DATE` is a host that must install the edge (one shared
Node helper, not 57 copies). **Witness:** W-PROC-SYSDATE gains S4 (`getdate()` under a fake `CoreEdge` = the fake's local stamp) and S5 (`generate_uuid()`
under the fake = its ms prefix, random part from its uuid); red control = main.

**A3-CLOCK-2 RESULT (2026-11-17, seventh session): BUILT + WITNESSED, PR bim-ootb #3168 OPEN (Fixes #3167), auto-merge OFF on purpose — the next session finishes it.**
- Change: `RUNTIME.now` and `generate_uuid()` read the edge; new pure `Env.hasEdge()` (the ONE holder is `window.CoreEdge` when a window exists, else
  `globalThis.CoreEdge`: a Node script that defines `global.window` puts it on that object — the first host checks used `globalThis.CoreEdge` and
  missed it; W-PROC-SYSDATE S4/S5 caught it). Hosts install it: `erp/ws_kernel.js`, `capex/index.html`, `erp/tests/dd_common.js`, `witness_fn_parity`,
  `witness_docno_till`. `§CLOCK_PROBE files=125 with_calls=0 calls=0` (was 6). The viewer does NOT load `ad_callout.js` (its mention is a comment).
- Measured with the §F.33 gate (all 51): first `new_fail=[witness_fn_parity,witness_docno_till,witness_pa_ctx]` (each `Env.edge: no edge installed`),
  after the installs `new_fail=[]`; bridge `new=[] known=[M3:HARNESS-FAIL]`. W-PROC-SYSDATE 6/0 (S4 `getdate()` under a fake edge `2026-11-20 10:15:00`,
  S5 uuid = edge ms + edge id hex); red main 2 FAIL (`2026-11-13 00:30:55`). Headless: capex + ERP `hasEdge=true`, local time, 0 no-edge lines.
  W-ERP-ASK 11/0 both sides (help lane asked) · W-X0-APPDEF PASS. Live lanes asked first; CLI lane overlap agreed (keep both, higher `?v=`).
- **Two merges of a moving main:** after the first, re-check of the merged tree PASS (bridge new=[], 47/51 + 4 unrun by budget, new_fail=[]),
  re-bump `ad_callout.js` 10 → 11, sw v1096 → v1097 (main's own `?v=10` held other content). Main then reached v1097 itself; the second merge
  (`origin/main` @ `d68e0f71`, CLI legacy-indexes + door containers + modeller help) was resolved by hand: pages keep `?v=11` / sqlfn `?v=3` + the
  edge block, **sw `v1098`**. **That last merged tree has NOT been through the gates.**
- **NEXT SESSION, step 1:** in a worktree of `fix/a3-clock-2` run `BUMP_PARITY_BRIDGE=<bim-compiler origin/master worktree>/scripts/bridge/run_all.sh
  node scripts/bump.js erp/ad_callout.js --check` (~16 min; link the 39 `build/erp/*.db` into a fresh bridge worktree, §8 trap). PASS → re-run
  W-PROC-SYSDATE, `gh pr merge 3168 --auto --squash`, wait MERGED, re-run it on `main`. If main moved again: merge it, and if its `sw.js` or
  `ad_callout.js ?v=` caught up, bump again (`bump.js --changed --write` after a `--check`). A new failure → fix, never `--no-parity`.

**A3 W-CORE-PURE SPEC (2026-11-17; decisions A-1 + A-4 + A-7; lands AFTER A3-CLOCK-2, whose fix is what makes `forbidden=0` true).**
File `erp/tests/witness_core_pure.js` (bim-ootb), node only, espree AST from bim-ootb's own `node_modules` (a port of bim-compiler `scripts/code_arch/clock_probe.js`:
comments and strings never count).
- **Population = the A-1 list, by pathspec, so a new file in it is judged with no edit:** `erp/processes/*.js`, `erp/callouts/*.js`, `erp/ad_callout.js`,
  `erp/doc_poster.js`, `erp/model_*.js`, `erp/rule_fold.js`, `erp/crud_core.js`, `viewer/cpm_schedule.js`, `viewer/schedule_*.js`, `common/room_graph.js`
  (`git ls-files`, tests excluded). 125 files on `249fb934`. No exemption list: after A3-CLOCK-2 even the Env owner (`ad_callout.js`) reads only the edge.
- **FAILS on (A-7, values only):** clock `Date.now()`, `new Date()` / `new Date` with no argument, `Date()` called, `performance.now()` (A-4); random
  `Math.random()`, `crypto.randomUUID()`, `crypto.getRandomValues()`; network `fetch()`, `new XMLHttpRequest`, `new WebSocket`, `new EventSource`,
  `navigator.sendBeacon()`. One `§CORE_PURE_HIT file= line= call=` per hit.
- **INFO only (A-7):** per file `§CORE_PURE_INFO file= storage= document= console=` (`localStorage`/`sessionStorage`/`indexedDB` references, `document`,
  `console`), for Part C. The UMD wrapper's `window` is not counted.
- **Verdict:** `§CORE_PURE files= parse_fail= forbidden= verdict=PASS|FAIL|INCONCLUSIVE`; INCONCLUSIVE when `files=0` or any file fails to parse (it is
  listed, never dropped).
- **Red control (in the same run):** a copy of a real core file (`erp/processes/InvoiceGenerate.js`) with a planted `Date.now()` → 1 hit, a planted
  `performance.now()` → 1 hit, the same text inside a comment and inside a string → 0 hits. The red control must FAIL for the verdict to count.
- **Deletion budget:** `erp/tests/witness_core_clock_reads.js` loses its hand list (`MIGRATED`, 22 files) and its regex scan; it keeps only its Env helper
  checks (`nowStamp`/`nowMs` and `§ENV_NO_DATE`). One scanner, one list.
**Issue proved:** "a core file reads a clock, random numbers or the network itself instead of the installed edge", judged over the whole A-1 list by
pathspec, not a hand list that a new file can miss.

**A3-CLOCK-2 POST-MERGE CHECK (2026-11-17, eighth session; bim-ootb `main` @ `b732d923`, which holds #3168 as `2989f8f5`).** The PR merged before its
last tree was gated (RESUME 0s), so the gate ran on `main` itself: `BUMP_PARITY_BRIDGE=/tmp/wt-bridge-a3/scripts/bridge/run_all.sh node scripts/bump.js
erp/ad_callout.js --check`, log read:
- `§BUMP_PARITY mode=block verdicts=4 new=[] known=[M3:HARNESS-FAIL] … witnesses=5 skipped=11 verdict=PASS`
- `§BUMP_TOUCH files=erp/ad_callout.js witnesses=51 browser_skipped=2 new_fail=[] pre_fail=[8] unjudged=[] unrun=[witness_period_status,witness_core_timing,witness_docno]
  budget_s=600 base=b732d9234f34 secs=644 verdict=PASS` · `§BUMP_CHECK verdict=PASS`.
- **That `new_fail=[]` judges nothing about #3168** (tree = base, so change and base are the same commit). What does judge it: the 8 `pre_fail` names are
  the §F.33 first-run list of 9 from BEFORE #3168, minus `witness_docno` (unrun here; it was on that list). No name is new. The three unrun, run alone:
  `§PS_VERDICT PASS cases=32`, `§CORE_TIMING checks=31 failed=0 verdict=PASS`, `§DOCNO-VERDICT PASS judged=20 failed=0` (it FAILED on the pre-#3168 list; not traced to a cause here, ~10 min alone).
- W-PROC-SYSDATE on `main`: `§PROC_SYSDATE checks=6 failed=0 inserted=63 verdict=PASS` at +08 and at UTC.
- No re-bump needed: `main` carries `ad_callout.js ?v=11`, sw `v1098`, as the PR's last merge set them. Issue #3167 stayed open after the bot's merge; closed by hand with these lines.

**A3 W-CORE-PURE RESULT (2026-11-17, eighth session): ✅ DONE (witness), bim-ootb #3180 / PR #3181, merged `7c26856d`. PART A IS DONE.** +130 / −16, no shipped file, no bump. Logs read:
- `main` (re-run after the merge, @ `c22ba2c2`): `§CORE_PURE files=125 parse_fail=0 forbidden=0 red_control=detected verdict=PASS` · `§WITNESS_CORE_PURE pass=5 fail=0 ran=125`; the same line in the PR's CI log.
- **Red control, same run** (`§CORE_PURE_RED`, a copy of the real `InvoiceGenerate.js`): planted `Date.now()` +1 · planted `performance.now()` +1 · the same text in a
  comment 0 · in a string 0 · a method named like `Object.prototype` 0.
- **Red run on real code** (`OOTB=<tree>`, three trees from before #3168, `~/.cache/bim_bridge/touch_base/{5caf16f5,776375d9,e9951727}`): each
  `forbidden=4 verdict=FAIL`: `erp/ad_callout.js:896 new Date()`, `erp/callouts/sqlfn.js:440 Date.now()`, `:442 crypto.getRandomValues()`, `:442 Math.random()`,
  the four lines the A3 PRE-MEASURE named as left after A3-CLOCK-1.
- **Independent agreement:** INFO totals `document=26 console=246` equal A-7's earlier measure made with another script; `storage=3` (A-7 said 2: this scan
  counts each reference, all in `viewer/schedule_author.js`).
- **A defect of the first draft, caught by that agreement:** the lookup tables were plain objects, so `constructor`/`toString`/`valueOf` counted as storage
  (`storage=163`). Now `Set`s, with a red case that keeps it from coming back.
- **Deletion budget:** `witness_core_clock_reads.js` lost its hand list (`MIGRATED`, 22 files) and its regex; it keeps the 6 Env helper checks: `pass=4 fail=0 ran=6`.
- **Added to the spec (said here):** (1) **CI**: fast-checks runs it and requires `verdict=PASS`, so a PR that puts `Date.now()` in a core file fails. That is the
  "we enforce a rule" half of Part A. (2) `OOTB=<tree>` scans another tree with this scanner (the red run above). (3) `window.` / `globalThis.` / `self.` / `global.`
  in front of a banned call is the same call. (4) `git ls-files` means an untracked new core file is judged once it is added.
- **Scope of the claim:** direct calls in the 125 files. A core file that calls a helper outside the list which itself reads the clock is not seen (no data-flow, A-4).

---

## PART B — One manifest per app   (fixes P2, declares half of P1)

**Design.** Each app (`viewer/`, `erp/`, `modeller/`) gets one small JSON manifest listing every module it loads, in order:
`{ "file", "deps": [...], "load": "boot" | "lazy", "lazyGroup": "find", "precache": true | false, "v": 5 }`.
A generator script (dev-side, like `scripts/gen_global_types.js`) **writes** the derived parts that are hand-kept today: the page's
`<script>` block between two marker comments, the lazy list in `viewer/main.js`, each `PRECACHE_ASSETS`, every `?v=`, and the `CACHE_VERSION` bump
when anything it covers changed. The page stays a static file. **No build step at run time:** the generated text is committed, exactly as today.
- Load order becomes **declared** (`deps`), and the generator refuses a manifest whose order breaks a dependency.
- Lazy loading becomes an explicit flag. The generator refuses `load:"lazy"` + `precache:true` unless the owner allowed it (ERP/modeller lazy
  parts ARE precached for the air gap on purpose, `erp/sw.js:408-421`, so the rule is per app: decision B-2).
- `scripts/bump.js` becomes one line: change a module's `v` (or the generator bumps it from the content hash).

**Facts the design must respect (vetted 2026-11-13):**
- **ERP plugins are not listed in the manifest by hand.** By the AD-layer law a plugin arrives with zero host code. Plugin lists exist today
  (`BUILTINS`/`INSTALL_ONLY`, `erp/plugin_overlay.js:230-232`, and 29 `plugins/*.mjs` precache entries in `erp/sw.js`). Each plugin `.mjs` exports a
  `manifest` (read that way by `erp/tools/gen_2pack.js:22`). Decision B-4 says what B does with them.
- **What users download is minified.** A push to `main` runs `.github/workflows/deploy-pages.yml`: it stamps `erp/version.json`, builds the agent
  zips (`erp/tools/build_agent_zips.js`), and minifies own JS in `erp/ viewer/ common/` (`scripts/minify_pages.js`, esbuild 0.23.0, whitespace and
  syntax only, never identifiers; `modeller/` is not minified). Git keeps readable source. B generates SOURCE, so the round trip compares against git.
  Size budgets (F.3) are measured on the minified output, because that is what users pay for.
- **Concurrent sessions.** Today's `sw.js` merge rule (keep both precache additions, take the higher `CACHE_VERSION`, CLAUDE.md WORK-TO-ZERO)
  becomes: merge the manifest JSON, then regenerate. The generator must be stable (same manifest in, same bytes out, fixed order), so two sessions
  that regenerate after a merge get the same file.

**Migration:** B0 generator in **check mode only**: build the manifest FROM today's files (pages, `main.js`, `sw.js`) and prove that regenerating
them from it is **byte-identical** to what is committed. No file changes. B1 switch one app (smallest first: modeller, 59 tags) to "manifest is the
source", generated sections between markers, byte-identical again. B2 erp, B3 viewer. `tests/audit_sw_precache.js` stays green throughout.

**OPEN DECISIONS:** 1. versions: hand-kept `v` numbers, or content hashes (`?v=<8 hex>`)? Proposal: content hash. Nobody bumps by hand, and a
stale file is impossible. But it changes every `?v=` once, so every user downloads every tagged file again on the next visit, offline installs on
slow links included. That needs owner sign-off. 2. Lazy + precache per app: viewer lazy = not precached
(today's rule), erp/modeller lazy = precached (today's rule). Confirm, or make one rule. 3. Should the manifest also carry each module's
**owner** and **witnesses**? Proposal: yes, that is how D and E get their data for free. 4. ERP plugins (above): does B leave the plugin lists
alone, or derive the plugin precache entries from the `.mjs` files on disk? Proposal: derive the precache entries only, and leave `BUILTINS` as the
host's one list (B must not become a second plugin registry).

**Witnesses:** W-MANIFEST-ROUNDTRIP (manifest → generated text byte-identical to committed; red control: swap two dependent modules → generator
refuses) · `audit_sw_precache.js` · page boot witnesses unchanged.
**Done when:** all three apps generated from their manifests, round-trip identical, `bump.js` retired or reduced to "edit `v`", and the Pages
deploy workflow still green on the first merge after each switch (fetch `erp/version.json`, §F.2 Fetch back).
**DECISIONS:**
- **B-1 (2026-11-18): content hashes, as their own announced step.** Asked with B0's counts (unify numbers inside the apps = 17 sites change, still hand-bumped, 42 inline literals `bump.js` cannot see; content hashes = all 715 versioned sites change once, every user re-downloads every tagged file once, offline installs on slow links included) and the recommendation "content hashes, done as its own announced step on a quiet day". Owner: *"proceed"*. **What it means for the plan:** B1 to B3 keep today's numbers and stay byte-identical (the manifest is introduced alone, so a break points at one cause); then one separate step, B4-HASH, switches every `?v=` to an 8-hex content hash, announced to the owner beforehand with its date, and `bump.js` is retired. The hash step's spec (which bytes are hashed: git source or the minified deploy output; how `CACHE_VERSION` follows) is written before B4-HASH, not now.

**B0 BUILD SPEC (2026-11-17, eighth session; bim-ootb #3195; no owner decision).** Owner, this session: *"if u hit a code design or spec problem use a well
scoped Fable agent to resolve"* → the measuring and the design below came from one such agent (read-only), then checked here. Measured on bim-ootb `main` @ `695d16fe`:
- **Tags** (a tag reader, comments and inline bodies skipped): viewer.html 252 (249 with `?v=`), idempiere.html 226 (224), modeller.html 62 (59). `grep -c` counts LINES
  (250/212/61, the numbers P2 quotes). Two shapes only: `<script src="X"></script>`, and the same with one `onerror="…"`. The tags are not one block: the first-to-last
  span holds 27/70/32 comments and 6/7/4 inline scripts. A raw regex also hits a `document.write('<script src=…` inside an inline script (idempiere.html:847, modeller.html:360).
- **Versions `bump.js` cannot see:** inline page scripts hold whole `'file?v=N'` literals (at least 1 viewer, 17 erp, 7 modeller).
- **Service workers:** `PRECACHE_ASSETS` 272 / 405 / 159 entries, all plain string literals, no `?v=`; modeller has 1 duplicate; one `CACHE_VERSION` each. Running each
  `sw.js` in a Node `vm` with stubs returns the same list a parser extracts. erp precaches 29 `plugins/*.mjs` of 36 tracked. Only the viewer has a precache audit.
- **Versions disagree:** 582 files are referenced with `?v=`, 81 from more than one place, **27 with different numbers in different referrers (11 inside one app, 16 only
  across apps)**; 34 sites sit below their file's highest number. So "one `v` per module" cannot reproduce today's bytes. 11 referenced targets do not exist, all from referrers outside the three apps.
- **Nothing records a dependency today.** Load order is tag order.

**Decisions taken inside B0 (each with the alternative rejected):**
| # | Decision | Rejected |
|---|---|---|
| D1 | An **app** = a folder with a tracked `sw.js` named in Part B (`viewer/`, `erp/`, `modeller/`); its pages are every tracked `.html` under it; its loaders the `.js` under it that hold a whole `'file?v=N'` literal. Everything else is counted as outside, never owned | only the three main pages (hides the 11 same-app disagreements; `bump.js` could never retire) |
| D2 | A module is keyed by repo-relative file and listed in every app that references it | one global manifest |
| D3 | The unit is the **site** (one reference in one referrer). A module's `v` is set only when all the app's sites agree, else `null` and each site keeps its own. Any B-1 answer turns every `null` into a value | "take the highest" (a decision, and not byte-identical) |
| D4 | The generator owns **whole sites** (the whole tag with its `onerror`, the whole string literal, the whole `CACHE_VERSION` literal) and writes each from manifest fields by one fixed template per kind. The rest of the file is the frame. No markers in B0 | digits only (a tautology); whole blocks (impossible today, see the span fact) |
| D5 | `deps` is `[]` everywhere, `"depsDeclared": false`; the order check prints `order_check=NOT-JUDGED`, never PASS | deriving deps from "reads a global another file publishes" (precision unmeasured; a false edge would later refuse a legal reorder) |
| D6 | The manifest stays in memory; `--out <file>` writes it outside the tree on request; no `--write` in B0 | a committed manifest nothing reads yet (P2 again) |
| D7 | `bump.js` and the audits are not touched: their parsers are the independent second readers. The new readers live once in `scripts/lib/page_refs.js`; bump and the audits move onto it in the B-step that makes the manifest the source | refactoring bump now |
| D8 | Plugin `.mjs` precache entries are counted, never interpreted (B-4 is open) | reading each plugin's `manifest` export |

**Manifest (in memory, ajv-checked):** `{ app, sw, cacheVersion, depsDeclared:false, pages[], modules[], precacheOrder[] }`; a module is
`{ file, deps:[], load:"boot"|"lazy", lazyGroup, precache, v, sites[] }`; a site is `{ in, at, kind:"tag"|"asset"|"inline"|"lazy", as, v, onerror?, q? }`
(`at` = its place in the file `in`; `load` is `boot` when any site is a `tag`; `lazyGroup` in B0 is the loader file; `precache` = the file is in that app's `PRECACHE_ASSETS`).
**Readers (`scripts/lib/page_refs.js`):** HTML by a small state machine (comments skipped whole, `script`/`style`/`textarea`/`title` bodies raw to the closing tag, quoted
attributes, byte ranges); inline script bodies, loaders and `sw.js` by espree only; a site is a string literal whose WHOLE value is `path.(js|css|json|wasm|mjs)?v=digits`;
any other `?v=` literal is counted as partial, never owned. **Generator (`scripts/gen_manifest.js --check`):** regenerate = frame + each site rendered from the manifest
after a JSON round trip; exit 1 on a file that differs from the committed bytes (file, line, the canonical spelling), a non-literal `PRECACHE_ASSETS` element, a schema
failure, or two runs giving different manifest bytes.
**Witness W-MANIFEST-ROUNDTRIP (`scripts/tests/witness_manifest_roundtrip.js`):** population = every owned file of the three apps by `git ls-files`; denominator = sites per kind per app. Claims, each with its own source:
C1 every script tag is a site (raw `<script[^>]+src=` count on the page minus on the frame; the hits left must lie in inline bodies; bump's PAGE_REF hits) ·
C2 the precache list and `CACHE_VERSION` (the `vm` run of the committed `sw.js`) · C3 loader sites (bump's JS_REF hits against the parser's literals) ·
C4 the frame holds no module data (frame re-read: 0 sites) · C5 the manifest drives the output (for EVERY versioned site: +1 in the manifest, regenerate, the bytes differ in that site's range only) ·
C6 the viewer counts equal `tests/audit_sw_precache.js`'s own summary · C7 the sites equal what a `bump.js` dry run of every target prints.
**Red controls, same run, each must FAIL:** R1 swap the places of two adjacent tags in the manifest · R2 drop one precache entry · R3 change `CACHE_VERSION` ·
R4 reader fixtures on a copy of the real modeller.html (a tag in a comment and in an inline string adds 0 sites, a planted real tag adds 1, a non-canonical tag is refused) ·
R5 the order checker on a synthetic edge between two adjacent real modules, then swapped (`synthetic=Y`: it proves the refusal code, not any dependency).
**The lane's red control "swap two dependent modules" becomes real only when deps are declared** (new decision **B-5**, to ask after B-1: who declares `deps`? advice: a tool-derived candidate list, confirmed by hand per app in B1 to B3).
**INCONCLUSIVE** when any app has 0 sites, any parse fails, any red control does not fail, the `vm` run throws, the bump dry run or the audit prints no summary, or C5 judged 0 sites.
`§MANIFEST_ROUNDTRIP apps=3 files= sites= tag= asset= inline= lazy= precache= identical=N/N driven=N/N sw_vm=3/3 red=5/5 order_check=NOT-JUDGED verdict=`.
**Findings printed, never a failure (they feed B-1, B-2, B-4):** `§MANIFEST_VERSIONS` (disagreements, sites below max) · `§MANIFEST_UNVERSIONED` · `§MANIFEST_INLINE_SITES` ·
`§MANIFEST_MISSING` · `§MANIFEST_LAZY_PRECACHE` (lazy+precached, boot not precached, duplicates) · `§MANIFEST_PLUGINS` · `§MANIFEST_OUTSIDE`.
**Not in B0:** any write to a page, loader or `sw.js`; markers; a committed manifest; dependency data; owner/witness fields (B-3); plugin reading (B-4); unifying versions or hashes (B-1);
a lazy+precache rule (B-2); pages outside the three apps, `oplogpic/`, importmaps, `_GANTT_CACHE_VERSION`. **CI:** one fast-checks step, beside W-CORE-PURE.
**Issue proved:** "the module lists kept by hand in pages, lazy lists and service workers cannot be rebuilt from one manifest per app without losing or changing a byte".

**B0 RESULT (2026-11-17, eighth session): ✅ DONE (witness), bim-ootb #3195 / PR #3200, merged `7ee6a108`.** +568 lines, 0 removed; no page, loader, `sw.js` or `bump.js` changed. Logs read:
- Full run on `main` @ `695d16fe`: `§MANIFEST_ROUNDTRIP apps=3 files=54 sites=788 tag=667 asset=0 inline=42 lazy=79 precache=836 identical=54/54 driven=715/715
  sw_vm=3/3 claims=7/7 red=5/5 order_check=NOT-JUDGED verdict=PASS` (`§WITNESS_MANIFEST_ROUNDTRIP pass=5 fail=0 ran=54`). CI (`--skip-c7`): `claims=6/6 c7=NOT-RUN … verdict=PASS`. Re-run on merged `main` @ `7ee6a108` (which had moved): `sites=790 … identical=54/54 driven=717/717 … verdict=PASS`.
- Claims: C1 raw tag hits 669, 2 left in frames (the two inline `document.write` texts), tag sites 667 · C2 `vm` run of each `sw.js` same list, order and version 3/3 ·
  C3 JS_REF hits 79 = lazy sites 79 · C4 every frame re-read holds 0 sites · C5 driven 715/715 · C6 audit 272 / 247 / 214 = manifest 272 / 247 / 214 ·
  C7 bump dry run: 666 lines in owned files = 666 manifest sites, 0 missing, 0 extra.
- Red controls R1 to R5 all detected (`§MANIFEST_RED`). **Red on real files** (edit, run, revert): two spaces before `src` → `§MANIFEST_FAIL modeller/modeller.html:224
  differs from what the manifest writes …` `identical=53/54 verdict=FAIL`; a non-literal precache entry → `§MANIFEST_FAIL modeller/sw.js: 1 PRECACHE_ASSETS element(s) are not plain string literals`.
- Per app (`§MANIFEST_APP`): viewer 5 pages, 15 loaders, 302 modules (261 boot, 41 lazy), 337 sites, precache 272 · erp 13 / 5 / 283 (260, 23) / 352 / 405 ·
  modeller 2 / 11 / 94 (63, 31) / 99 / 159.
- **Findings for the open decisions (printed on every run, never a failure):**
  - **B-1** `§MANIFEST_VERSIONS`: inside an app, viewer 3 modules disagree (3 sites below the highest), erp 10 (14 sites), modeller 0. So unifying numbers inside the apps
    would change 17 sites; content hashes change all 715 versioned sites once.
  - **B-1** `§MANIFEST_INLINE_SITES`: 42 versioned literals sit in inline page scripts (viewer 2, erp 23, modeller 17), which `bump.js` cannot see; tags with no `?v=`: 13 / 56 / 4.
  - **B-2** `§MANIFEST_LAZY_PRECACHE`: lazy AND precached viewer 15, erp 22, modeller 21 · lazy, not precached 26 / 1 / 10 · boot but NOT precached 43 / 13 / 7 ·
    precached but referenced by no site 39 / 136 / 81 · duplicate entries 0 / 0 / 1. Part B's "viewer lazy = not precached (today's rule)" does not match the files: 15 viewer modules that no page loads by a tag are precached (not looked at one by one here).
  - **B-4** `§MANIFEST_PLUGINS precached_mjs=29 on_disk=36`.
- **A defect in today's bump, found by C7 (bim-ootb #3201; ✅ FIXED the same session, PR #3204, merged `c5bdc601`, see below):** `node scripts/bump.js viewer/main.js viewer/nf_room.js` → `§BUMP_ERR
  not_loaded_by_any_page_or_loader=viewer/nf_room.js written=0`, although `viewer/main.js:240` lists it. `bump.js` skips a WHOLE loader in the round where the loader is
  itself a target, so the Bump button stops (exit 2, nothing written) when a PR changes a loader and a lazy module it lists. Fix: skip only the literal that points at the loader itself; W-BUMP gains the case.
- **#3201 fix (PR #3204, +2 / −2 in `scripts/bump.js`):** only the literal that points at the loader itself is skipped. W-BUMP new case C6, red on the old code
  (`§BUMP_W C6-loader-with-its-lazy-module FAIL … exit=2 list_line=0 page_line=1 err=true`), then `PASS … exit=0 list_line=1 page_line=1 err=false`,
  `§BUMP_W_VERDICT PASS judged=6 failed=0` (re-run on merged `main`). W-MANIFEST-ROUNDTRIP C7 lost its batching workaround: one dry run, `668 = 668`, `claims=7/7 verdict=PASS`.
  `§X0_BUMP_BUTTON checks=6 failed=0 verdict=PASS`; W-X0-SHIP all `Y`.
- **Deviations from the spec, said here:** (1) order lives in each site's `at` (its place in its file), so R1 swaps two `at` values, not two array rows: one module order cannot
  serve several pages. (2) a page with no site is not owned (54 files, not 60). (3) a CDN URL is keyed by the URL, not counted missing (2 sites, `viewer/clash_report.html`).
  (4) C7 takes ~57 s (bump re-reads 1,208 loader files per target), so CI passes `--skip-c7` and prints `c7=NOT-RUN`; run the full witness before a merge that touches the generator.
  (5) `libs` / `assets` rows were left out of the manifest (nothing in B0 reads them); `§MANIFEST_BLOCK` (comment runs inside the tag span) is not printed: B1 measures it when it places markers.
- **Scope of the claim:** the three apps' own pages, loaders and service workers. Not judged: load order (no deps declared), the 46 pages outside the apps, `oplogpic/`,
  lazy list entries with no `?v=`, `_GANTT_CACHE_VERSION`.
- **NEXT in Part B:** ask the owner **B-1** (numbers or content hashes) with the counts above, one message; then B-2, B-5 (who declares deps), B-3, B-4. B1 (modeller first) may not start before B-1.

---

## PART C — Named APP parts, each with one owner   (fixes the rest of P1; slow, background)

**Design.** Instead of 1,688 loose fields on one object: named parts, `APP.scene`, `APP.stream`, `APP.panels`, `APP.schedule`, `APP.film`,
`APP.find`, `APP.erp`, …, each **owned by one module** that declares its fields in a JSDoc `@typedef` (in `types/`, editor-only). A field nobody
owns is visible at once, so phantoms cannot exist, and "where is this set?" has one answer (F12 works through the typedef).
Compatibility during migration: the old flat name stays as an alias that forwards to the new place, and the alias is deleted when its last reader
moves. **How the alias forwards:** a plain copy does not forward (a later `A.x = …` splits the two), so the alias is an accessor
(`Object.defineProperty(A, 'x', { get, set })`). A getter on a field read every frame (e.g. `A.camera`) is a call per read: measure it on one hot
field before migrating `scene`, and log the cost in a `§` line (PERF BUDGET). **Protected lane:** a field read by `fx_*`/`effects`,
`cinema_path_editor` or `maxq_*`/`cinema_maxq` keeps its alias until the owner lifts §S59, so C can delete only the aliases those files do not read.
**Migration:** one part at a time, `scene` first (it creates `APP.camera`, `viewer/scene.js:163`). This replaces
`REFACTOR_FOR_READERS.md` item 6 (`A` → `APP` rename) and absorbs item 4 (phantoms).
**OPEN DECISIONS:** 1. The list of part names and which module owns each (proposal drawn from the folder roles in `docs/DeveloperGuide.md` §1.1). 2.
Keep `A` as the parameter name inside `setupX(A)` (less churn), or rename to `APP` while moving (greppable)? Proposal: rename while moving.
**Witnesses:** `scripts/gen_app_surface.js` counts: phantoms → 0 for migrated parts; total reads unchanged; each module's witnesses identical.
**Done when:** every agreed part has its owner module and typedef, phantoms 0 for migrated parts, and every alias deleted except those the protected
lane reads (listed by name in this file).
**DECISIONS:** *(none yet)*

---

## PART D — App-wide owner table, generated   (fixes P4)

**Design.** Generalise `prompts/4D_MODEL_INTEGRITY.md` §I to the whole app: a table *question → owner file* ("what is today", "is this element
supported", "post a document", "route a pipe", …). It is generated from the manifest (B, `owner` field) plus a small hand-kept list of questions.
The generator **flags a second implementation**: a global published by two files (already detected by `scripts/gen_global_types.js`'s multi-publisher
list) or a function with the same normalised body in two files. That turns duplicates from an accident into a red check.
**OPEN DECISIONS:** 1. Where the questions list lives (proposal: next to the manifests, one JSON per app). 2. Is a namespace extended by several
files on purpose (`Bonsai.x = …` from 3 files) allowed? Proposal: yes, if the manifest marks it `"extends": "Bonsai"`.
**Witnesses:** W-OWNER-UNIQUE (every question one owner; red control: register a second owner → FAIL).
**Done when:** the owner table is generated for all three apps, W-OWNER-UNIQUE PASS, its red control FAILs, and each duplicate found today
(`ERPKernel`, `routewalker.js`, the `Bonsai`/`ERP` publishers) is either marked `"extends"` or has its own tracker issue.
**DECISIONS:** *(none yet)*

---

## PART E — A proof map   (fixes P5)

**Design.** Every witness declares, in its spec header, the module(s) and spec rule(s) it proves (`PROVES: viewer/db_resolve.js R1-R4`). One
generator writes the map *module → witnesses → last verdict* and *rule → witness*, from the headers plus the suite log. One runner
(`tests/run_witness_suite.js`) and one path resolver (`witness_kit/paths.js`, replacing hard-coded home folders) serve every folder. New witnesses go
in `<app>/tests/`. Existing ones are moved later, mechanically, using the map. `witness_kit/paths.js` does not exist yet; E creates it.
**Owner of the witness contract:** bim-compiler `prompts/WITNESS_INTERFACE_FRAMEWORK.md` (read §CRISIS first) and bim-ootb `witness_kit/contract.js`.
E builds the map on that contract and must not define a second one. The map stores **PASS / FAIL / INCONCLUSIVE** (and VACUOUS where the contract
emits it) and never counts INCONCLUSIVE as PASS (CLAUDE.md PRIMAL LAW 4).
**OPEN DECISIONS:** 1. The header keyword (`PROVES:`) and format. 2. Does the suite log persist (like `~/.cache/bim4d/`) so the map can show last
verdicts? Proposal: yes, a small JSON per run.
**Witnesses:** W-PROOF-MAP (every production module has ≥1 witness or is listed as unproven; red control: a header naming a missing module → FAIL).
**Done when:** the map is generated from headers plus the suite log, W-PROOF-MAP PASS, red control FAILs, and no hard-coded home folder is left
in a witness that the map lists.
**DECISIONS:** *(none yet)*

---

## PART F — A VS Code extension for this codebase   (owner: *"a plugin or addon that specifically handles this codebase elegantly and dev help really"*)

**Prior art, do not re-triage:** bim-ootb `prompts/DEV_TOOLKIT_NO_AI.md`, PARKED 2026-10-06, spec complete enough to build: 26 tools → 6 extensions
(X1 §-Lens, X2 Live Doctor, X3 Maps, X4 Rules, X5 Workflow, X6 Witness & Ship) on 3 engines (E1 log parser, E2 live-tab bridge, E3 static parser), a
symptom playbook (§3), first slice (§6), admin decisions (§10). It is about **runtime debugging** without AI. Its spikes S0/S2 come first.

**Decisions already taken there, binding here (do not re-ask):** §8 layout: source in `bim-ootb/devtools/vscode/`, one folder per extension
(`x1-slens/` … `x6-witness-ship/`, shared `engines/`), and `pack/` = an Extension Pack. §10: name *BIM DevTools*, pack id `bim-devtools`,
distributed as a `.vsix` attached to GitHub Releases (Open VSX / Marketplace only after the first slice is witnessed). So X0 is one more folder,
`x0-navigator/`, inside that pack.

**What this design adds: a code-structure extension, "X0 Navigator"**, built on the data parts A–E produce. It holds **no knowledge of the codebase
itself**: it only reads the generated files, so it cannot drift from the code.

| Feature | Dev's question | Reads | Available after |
|---|---|---|---|
| F12 / hover / find-references for `APP.x` and `A.x` fields (a DefinitionProvider) | "Where is this field set?" | `internal/APP_SURFACE.md` (today), named parts (C) | **now** (APP_SURFACE exists) |
| `§TAG` hover → the spec paragraph + the code that prints it | "What rule is this tag?" | prompts/docs + source (= DEV_TOOLKIT T4) | now |
| CodeLens on line 1 of every file: `boot · precache · v5 · owner: … · 3 witnesses (last: PASS)` | "How is this file loaded, who owns it, what proves it?" | manifest (B) + owner table (D) + proof map (E) | B, D, E |
| Bump on save (or a quick-fix "this precached file changed: bump?") | "Did I forget the cache bump?" | `scripts/bump.js` today, manifest (B) later | now |
| "Run the witnesses for this file", with the verdict in the Testing panel | "Did I break it?" | proof map (E), suite runner | E |
| Owner warning: "a second implementation of *what is today*" | "Am I duplicating an owner?" | owner table (D) | D (also unparks DEV_TOOLKIT T6 Owner Trace) |
| Core-purity squiggle: `Date.now()` in a core file | "Am I breaking determinism?" | W-CORE-PURE rule (A3) | A ✅ · **built 2026-11-17, §F.35 (bim-ootb #3209)**; the scan lives in bim-ootb `scripts/lib/core_pure.js` |
| Lazy/boot badge in the status bar for the open file | "Will this load at start?" | manifest (B) | B |

### F.2 Run & Ship: localhost, commit, deploy, fetch back from github.io   (owner: *"The VSC tool aid can help control launch in localhost or deploy and fetch etc"* · *"helps commit to github and run from the standard project URL github.io/"*)

The full loop a developer runs by hand today, as a panel of stepped commands. Each step prints a `§` line and stops on the first failure.
**It calls the project's existing scripts and never re-implements them** (DEV_TOOLKIT T26 Ship Runner's own rule).

| Step | What the panel does | Uses (existing) | Facts it relies on (measured 2026-11-13) |
|---|---|---|---|
| **Run local** | start the static server, open the chosen app (Viewer / ERP / Modeller) in Chrome with the debugger attached; show which `CACHE_VERSION` the tab is running vs the disk | `.vscode/tasks.json` *Serve repo*, `.vscode/launch.json`; DEV_TOOLKIT T2 Version Doctor for the tab version | precached files are cache-first, so the panel warns "tab is on v1709, disk is v1710: reload / Update on reload" |
| **Check** | lint, precache audit, the witnesses for the changed files (proof map, part E), bump if a precached file changed | `npx eslint viewer modeller`, `tests/audit_sw_precache.js`, `scripts/bump.js`, `npm test -- --filter …` | |
| **Issue + commit + PR** | FOSS flow: pick or open the tracker issue, branch from fresh `main` in a worktree, commit with a conventional title, push, open the PR with `Fixes #N` and the `§` evidence pasted in | `git`, `gh` (the developer's own login) | `docs/DeveloperGuide.md` §10. Push and PR steps always stop and ask first. The PUSH PAUSE rule (`CLAUDE.md`) is prose the extension cannot read, so the developer answers it at that prompt. A machine-readable switch would be a new owner decision, not assumed |
| **Deploy** | bim-ootb: merge the PR. A push to `main` runs `.github/workflows/deploy-pages.yml` (stamp `erp/version.json`, build agent zips, minify `erp/ viewer/ common/` JS with `scripts/minify_pages.js`, upload the tree), so merged = deployed **once that workflow succeeds**. The repo's Pages setting also shows a legacy branch build (both ran for the same push on 2026-11-13; live was the minified artifact). Docs site (BIMCompiler): `scripts/safe_gh_deploy.sh` only, dry run first. Building DBs: object storage per `deploy/OCI_UPLOAD.md` §RULES (every upload with `--content-type`) | `gh pr merge`, `scripts/safe_gh_deploy.sh`, `oci` | never bare `mkdocs gh-deploy` (`CLAUDE.md` §Docs deploy) |
| **Fetch back** | wait for Pages, then fetch from the **project URL** (`https://red1oon.github.io/bim-ootb/<app>/…`, docs `https://red1oon.github.io/BIMCompiler/…`): HTTP 200 for each changed file; live `erp/version.json` `sha` == the merged commit; live `CACHE_VERSION` == `main`; live bytes == the bytes `scripts/minify_pages.js` makes from that commit (run on a throwaway copy, as the workflow does), or == committed bytes for `modeller/` (not minified); and the page's boot `§` lines from a headless check if the owner allows | `curl`/fetch; the DEV_TOOLKIT T26 steps 7–10 | 2026-11-13: live `CACHE_VERSION` viewer v1709, erp v1068, modeller v272. Modeller `sw.js` live == committed bytes; viewer and erp `sw.js` live are minified, so a raw byte compare FAILs by design. A green pipeline is not a deployed feature: always fetch (`prompts/AGENT_QUEUE.md`, this repo) |
| **Open live** | open the github.io URL of the app being worked on, the same way users reach it | | |

Rules for F.2: no step runs without the developer pressing it. Deploy and push steps show what they will do and ask first. Headless browser checks only
with the owner's go (GPU/VRAM contention with a live session is a known crash, memory `feedback_gpu_vram_contention_crashes_user_tab`).
Witness `W-SHIP-PANEL` (node, fixtures): a sandbox repo where (a) a planted syntax error stops at Check, (b) a precached file changed without a bump stops
at Check, (c) a fake "live" server returning an old `CACHE_VERSION` makes Fetch back FAIL, (d) a live `version.json` whose `sha` is not the merged commit makes
Fetch back FAIL. **Red control:** compare against a wrong hash, which must FAIL.
DECIDED F-1 (2026-11-16, *"Agree with you"*): does Fetch back run a headless browser for the boot `§` lines, or only HTTP + version + hash? Proposal: HTTP + version + hash by
default. Headless is a button the owner enables.

### F.3 What advanced teams built, adapted here + a "what will this cost if deployed" monitor   (owner: *"suggest things that advanced devs have done in tools that can help here"* · *"with monitors that can tell its perf impact if deployed"*)

Well-known tools, named as **prior art to copy the idea from, not to install** (each would be a new dependency; the adaptation is a small
dev-side script or an X0 feature). The descriptions are general knowledge, not measured here.

| Prior art (what it does there) | The idea | Adapted here |
|---|---|---|
| **size-limit / bundlesize**: fail a PR whose JS grows past a budget, and comment the delta | a size budget per entry point | **boot-bytes and precache-bytes per app**, measured on the minified output (`scripts/minify_pages.js`, what users download), from the manifest (B) or, until then, from page tags + `PRECACHE_ASSETS`. The PR shows `viewer boot +12 KB · precache +0`. Over budget = red |
| **Import Cost** (VS Code: size shown next to each import) | see the cost while typing | CodeLens on line 1: `boot · 84 KB · every user pays this at start` vs `lazy (find) · 0 at start` |
| **bundle analyzer treemaps** | see where the bytes are | treemap of each app's boot bytes by folder/family (viewer `fx_*`, `tm_*`, …) |
| **Chrome DevTools Coverage** (JS loaded but never run) | find code that should not be at boot | a headless boot of each app (owner's go) lists boot files that ran **zero** functions, as candidates for the lazy list |
| **Lighthouse CI**: run a page per PR, assert budgets (load time, blocking time), keep history | measured budgets per PR | for the ERP shell (no WebGL, cheap): time to `§INIT`, using the browser's built-in `performance.mark/measure` (today **0** files use them; add marks, no library) |
| **continuous benchmarking with bisect** (e.g. the Rust compiler's perf site, Chromium's perf dashboard): run fixed benchmarks on each commit, flag regressions, bisect to the commit | a perf history per commit | the `§` heap/verts lines the PERF BUDGET already asks for, collected per commit for fixed reference buildings into a JSON history (DEV_TOOLKIT T21 Perf-budget history); a jump flags and names the commit range |
| **Danger.js / PR bots**: rules that comment on a PR ("changed X without Y") | project laws as PR checks | a plain-node CI step: `sw.js` changed without `CACHE_VERSION` · lazy module added to precache · `Date.now` in a core file · new global missing from `eslint.globals.json`. Reuses W-CORE-PURE, `audit_sw_precache.js`, the manifest checks |
| **CODEOWNERS** (GitHub asks the owner to review paths they own) | route a change to its owner | generated from the owner table (D): each lane's files list the session/person to ask, so the X0 panel says "ask <owner> before editing" |
| **mutation testing (Stryker)**: change the code on purpose, check that a test fails | prove tests can fail | automated red controls: flip one comparison in the module a witness PROVES (E) and check the witness goes red (DEV_TOOLKIT T14/T25) |
| **preview/canary deploys** (a per-PR preview URL before production) | see it live before users do | **Not adopted yet: bim-ootb has no preview host.** Pages serves only `main` (§F.2 Deploy). `deploy/dev/` is bim-compiler's own object-storage dev tree, not a bim-ootb preview. Until the owner picks one, the preview is **Run local** on the PR branch. A hosted preview was OPEN DECISION F-7: **DECIDED 2026-11-16, owner *"agreed"*** (to: no preview host for now; Run local on the PR branch is the preview; revisit only if a PR needs someone else to see it) |
| **real-user monitoring** | perf from real users | **not adopted: the app is local-first and air-gapped, so no phone-home.** Instead a local *flight recorder*: the user can export their own `§PERF` lines on request |

**The perf-impact monitor ("what will this cost if deployed"):** shown in the PR and in the X0 panel *before* merge, in three tiers:
1. **Static, always (no browser, deterministic):** boot bytes and precache bytes per app, diff vs `main`; files moved between boot and lazy;
   new geometry passes without a cost `§` line.
2. **Model estimate, always:** for a change that adds geometry, the vertex delta on the reference buildings (from the cached runs, like
   `~/.cache/bim4d/`) times the measured fit **heap ≈ 0.173 GB per million vertices** (`docs/BrowserScaleBenchmark.md`, r = 0.997 over 3 buildings, "treat as
   indicative"). Shown as an estimated peak heap per building, against a phone line (the PERF BUDGET's *unverified* ~0.6 GB / ~4 M verts per tab).
3. **Measured, only with the owner's go:** headless boot of the reference pages on the PR build vs `main`: time to `§INIT`, `performance.memory` heap,
   draw calls, verts. A regression beyond the threshold (OPEN DECISION F-2) flags the PR, and the history (above) bisects it. Never run beside a live
   session's GPU work.
**Witness `W-PERF-IMPACT`:** fixture PRs where (a) a boot script is added → boot bytes rise by exactly that file's size, (b) a lazy module is moved to
boot → flagged, (c) a planted +1 M-vertex pass → estimate rises by ≈ 0.17 GB. **Red control:** a change with no cost must show zero delta.
**DECIDED F-2 (2026-11-16, owner *"agreed"*,** to: pick no numbers now; every X0-lane PR prints its "Cost if deployed" for two weeks, **until 2026-11-30**, then each ceiling = the observed level plus a small margin; the reference buildings are the three in `BrowserScaleBenchmark.md`, named by role). **How the numbers are collected:** CI cannot measure it, because `deploy_cost` needs VS Code's TypeScript, and on the runner it is INCONCLUSIVE (§F.24 FINDING). So the PR author runs `node -e` `deploy_cost.measure` (or *X0: Cost if deployed*) locally against `main` and pastes the `§PERF_IMPACT` lines into the PR body. On 2026-11-30, read those PR bodies and propose the ceilings to the owner. **The original question:** the budgets: per-app boot-bytes ceiling, allowed heap growth per PR, `§INIT` time regression threshold, and which reference
buildings (proposal: the three in `BrowserScaleBenchmark.md`, named by role, not by client).

**AI assistance is the developer's choice, never required** (owner: *"it can allow code-assist on user choice as there are those plugins for
that, but at least make it resourceful"*). Every feature above works with no AI, no network and no account. That is the point of the
extension: the project's knowledge (patterns, owners, rules, proofs) is **in the tool, not in an assistant's head**. For a developer who *chooses*
an AI assistant plugin (any of the existing ones), X0 makes that assistant better informed, without the extension itself ever calling a model:
- **"Context for this file"** command: assembles, from the generated data only, the file's spec header, owner, load mode (boot/lazy, precache),
  witnesses and last verdicts, the `§` tags it prints, and the project rules that apply (minimalism, twin, AD-layer, no `Date.now` in core) into a
  markdown block. It is copied to the clipboard or opened beside the code, ready to paste into whatever assistant the developer uses.
- **Optional assistant tools:** where the developer's assistant supports VS Code's own extension points for chat participants/tools (e.g. a
  `@bim` participant, or tools such as "who owns X", "which witness proves this file"), X0 registers them, **off by default** and switched on in
  settings. They answer from the same generated files, so the assistant gets facts, not guesses.
- **Never:** the extension does not call a model, send code anywhere, or need an API key. No paid calls (standing rule). Anything an assistant does
  is the developer's own plugin, on their own account, by their own choice.
DECISION F-3 (ANSWERED: (b) built first, then (a); (c) dropped. Archive §F.14, §F.16). The question was: which assistant help? (a) the "Context for this file" command only; (b) plus a **local MCP fact
server** that answers the same questions from the same generated files for ANY assistant (Claude Code, Copilot, Cursor, Continue …), never
calling a model; (c) VS Code's own chat-participant API, which only VS Code's chat uses. Proposal: (a) now, (b) next, drop (c).

**Shape:** per DEV_TOOLKIT §8/§10 (above): one Extension Pack of separate extensions, plain JavaScript using only the `vscode` API (no npm
dependencies, no compile step), in `bim-ootb/devtools/vscode/`. **Install:** `node devtools/vscode/pack.js` writes a real `.vsix` (plain
node, no npm), then `code --install-extension devtools/vscode/dist/x0-navigator-0.1.0.vsix`. **Never a symlink into
`~/.vscode/extensions/`:** VS Code ignores a folder its `extensions.json` does not list (archive §F.10).
**Witnesses:** each feature has a lib function witnessed in node on a fixture with a red control, a check through a stub of the `vscode`
calls, and a check in the real editor (`tests/realvsc/`). The list is in `devtools/vscode/x0-navigator/README.md`.
**Open decisions in F:** F-1 (§F.2), F-2 and F-7 (§F.3). Everything else is answered (below).

### F.22 Hover an ERP field, see every layer of code behind it   (owner 2026-11-15; decision **F-17**)
- 2026-11-15, owner: *"Can we do one when we hover an ERP panel item? But i reckon, similar to BIM, there maybe other layers of code at that spot?"* → advice: yes, a STACK, not
  one line (AD-LAYER LAW: one generic engine + named layers registered per table/column); show every registered layer in firing order (recommended) or only what ran on
  the last edit. Owner: *"So BIM has no layers? Go with your layering tool tip idea"*. → **F-17 = every registered layer, in firing order.** (BIM answer given: it has
  layers too — the size sources, the pass-through stamps, the door cuts, the edits after Convert; a layered BIM tooltip may follow, not now.)
- **Measured 2026-11-15 (bim-ootb `main`):** form fields carry `data-ad-table` + `data-ad-column` (`erp/crud_overlay.js:1553`), so no stamp is needed: the ERP's own
  registries are the index. Each keeps its layers with owner and rank (`erp/layered_registry.js:32-35`) and says so in `describe()`: callouts `erp/ad_callout.js:1051`
  (classes + legacy handlers; per-column callouts `findColumnCallouts` `:437`), model hooks + doc actions `erp/model_layer.js:643`, processes `erp/ad_process.js:1176`.
  Every registration is a call with a literal first name: `ML.registerModel` 72 + `MLo.registerModel` 4, `P.defineProcess` 56, `ML.registerDocAction` 26,
  `A.defineCallout` 17, `A.defineColumnCallout` 4. The node kernel loads all of them (`erp/ws_kernel.js:20-31`).

**F.22 SPEC (dev-only, the same pattern as §F.21 slice 2; nothing shipped changes).**
- **Index, generated:** `devtools/hover/erp_sites.js` (espree over `erp/**/*.js`, vendored and `tests/` excluded) → every registration call
  `{kind: callout|column-callout|process|model|docaction, name, file:line}` plus, per file, the iDempiere Java file:line its comments cite (comments read through the
  parser's comment list, not by text search over code). `node devtools/hover/gen_erp_index.js` → `devtools/hover/erp_index.json` (git-ignored: absolute root).
- **The stack for (table, column), in firing order** (`stackFor()`, pure, used by the page AND the node witness): 1 the dictionary row (`AD_Column`: reference,
  default, mandatory / read-only logic) · 2 ON CHANGE: each `Class.method` of `AD_Column.Callout`, then the per-column callouts, each with owner@rank and file:line, or
  `UNPORTED` when nothing is registered (never a guessed file) · 3 PICKER: the `AD_Val_Rule` (name + its SQL; it is data, it has no file) · 4 ON SAVE: the table's model
  hooks (owner@rank: beforeSave / afterSave / …) and its doc action · 5 BUTTON: the column's `AD_Process` Classname → the registered process · 6 per layer, the legacy Java
  file:line its file cites. Keys **1-9** open that layer's line in VS Code (`vscode://file/<root>/<file>:<line>`).
- **Overlay:** `devtools/hover/erp_hover.js`, bookmarklet-loaded into `erp/idempiere.html` on localhost; reads `window.__idmpDb` and the registries' `describe()`;
  prints `§ERP_HOVER installed index_entries=N` and per new field `§ERP_HOVER table= column= layers=K [kind:name@file:line …]`.
- **Witness W-ERP-HOVER** (`devtools/hover/tests/witness_erp_hover.js`): E1 index = a fresh parse, and every registered name the registries report has its line ·
  **E2 the denominator (AD-LAYER LAW, "X of N"):** node kernel + `erp/ad_seed.db`: for EVERY column shown on an AD window (`AD_Field`→`AD_Tab`→`AD_Window`, active), the
  stack is built; prints `§ERP_HOVER_W fields=N with_layers=K callouts_named=a resolved=b unported=c models=…`; FAILS on any layer whose file:line does not resolve
  (UNPORTED is reported, not failed: it is a coverage fact) · E3 red control: one index entry removed → the judge counts that layer as unresolved · E4 THE PAGE (headless,
  CPU, ONE session, `nice`): GardenWorld login, the Sales Order window, the overlay, REAL mouse hovers on fields with layers → the tooltip's stack = E2's for that column;
  key 1 records the `vscode://` link. INCONCLUSIVE if E4 hovered 0 fields with layers.
- **Issue proved:** *"what code runs when I touch this field?"* needed reading the dictionary and four registries by hand; after: hover it, the whole stack in order.

**F.22 RESULT (2026-11-15): built and merged, bim-ootb #3055 + fixes #3057, #3059; re-run on `main` @ `b71c15fe`: `§ERP_HOVER_W VERDICT PASS fail=0`.** E2 over every active AD window field:
`fields=12323 with_layers=3311 lines_resolved=6590 wrong_line=0 unresolved=0 unported=199 (distinct 169)`; E2b `false_unported=0`; E4 (Sales Order, real page) `same_as_node=33`, `keys tried=112
wrong_or_dead=0`. Built beyond the spec: model validators are listed from the index before the page's first save (`crud_overlay.js:1968` installs them lazily); Alt+1-9 for a focused field;
the Java citation is the one ON/just above a registration, or the file's own only when the class names match (v0 put `PO.java` on model hooks). **Corrections, said to the owner:** #3055's
`unported=213` was wrong (real callouts called UNPORTED: CalloutEngine is put in directly); a dead key in the tooltip (#3059). Prior art and the film: `prompts/FILM_IMMERSIVE_SOFTWARE.md` FILM 2.

### §F index — what is built (one line each; the full section is in the archive under the same name)

| § | What | bim-ootb PR | The line that proves it |
|---|---|---|---|
| F.0 | Zero-code editor wins: workspace file, clickable witness failures, snippets `witness` / `slog` / `spec` | #2919, #2963 | `§EZC checks=4 verdict=PASS` |
| F.4 | X0 Navigator slice 1: F12 + hover on a field of the shared object, `§TAG` hover | #2922 | `§X0_APPDEF … verdict=PASS` |
| F.5 | X0 keeps its own fresh index in VS Code's storage (F-10) | #2925 | `§X0_FRESH … verdict=PASS` |
| F.6 | Measurement: values beside the code were not worth building before logs name their code (F-9 closed) | — | 26.8% coverage, in the archive |
| F.7 | Every saved log starts with a `§LOG_STAMP` (F-11) | #2928 | `§LOG_STAMP_W` |
| F.8 | Finding + fix: a nested checkout was indexed as source | #2931 | rule R10 |
| F.9 | X0 in a real VS Code (`tests/realvsc/`) + the first film | #2933 | `§X0_REALVSC … verdict=PASS` |
| F.10 | Finding + fix: the documented install did not load; `pack.js` makes a real `.vsix` | #2939 | `§X0_INSTALL` |
| F.11 | Film 1 "Editing Real Code", recut v5. The owner: fine as it is, no recut | — | `~/Videos/Editing_Real_Code_EN_AFTER_2026-11-14_v5.mp4` |
| F.12 | First versions: Cost if deployed · values beside the code · Run & Ship | #2944, #2946, #2948 | `§PERF_IMPACT`, `§LENS`, `§SHIP_PANEL` |
| F.13 | Pages findings: the stamp fixed; the source is the workflow build (F-12 step 1). Step 2 waits for a token | #2951 | `§SHIP_FETCH … verdict=PASS` |
| F.14 | Local facts server for an assistant (MCP), OFF by default (F-3 (b)) | #2955 | `§X0_MCP tools=8 … verdict=PASS` |
| F.15 | Values beside the code, three steps (F-13): reads `~/.cache/bim4d` and the bake writes the stamp · the hover names the reason · the rule as Developer Guide §6.1 | #2977, #2970, #2981 | `§LENS … extra_dir=Y bake_env_not_a_stamp=Y … verdict=PASS` |
| F.16 | *Context for this file* (F-3 (a)): command + facts-server tool | #2966, #2968 | `§X0_CONTEXT … verdict=PASS` |
| F.17 | The index called 130 live fields dead: gate widened, `PHANTOM?` for what it cannot tie; new guide picture; docs redeployed | #2964, #2972, #2975 | `§APP_SURFACE … phantom=171 untied=11` |
| F.18 | Film 2 "It said dead. It was alive." (scripts `scripts/film_ide_x0_2/`) | — | `§FILM_GUARD … verdict=PASS`; `~/Videos/Editing_Real_Code_2_EN_AFTER_2026-11-14_v1.mp4` |
| F.19 | Find All References (generator rule R12) + facts-server `where_is_field_used` | #2985 | `§X0_REFS … verdict=PASS` |
| F.20 | One-click cache bump on save (F-6) | #2988 | `§SHIP_PANEL … one_file_needs=Y applied=Y`, `realvsc bump=Y` |

**Not built, and why (do not start these without what they wait for):** the lazy/boot badge, the line-1 summary, "run the witnesses for
this file", the owner warning and the determinism squiggle wait for the data of parts B, D, E, A. Complete Run & Ship (issue, commit,
PR, deploy), budgets and a hosted preview wait for F-1, F-2, F-7. DEV_TOOLKIT's runtime-debug slice needs a browser run (owner's go).

**F decisions answered, in the owner's words (the full exchanges are in the archive):** F-3 *"Both."* → the facts server, OFF by default;
later (a) too · F-4, F-5 by DEV_TOOLKIT §8/§10 · F-6 *"go for one click"* · F-8 *"advice me and proceed"* → own providers, no TypeScript
plugin · F-9 closed "not next", then built as F.12b once logs were stamped · F-10 and F-11 *"Go with your advice."* · F-12 *"Both."* (step 1
applied on *"yes do it"*) · F-13 *"ok"*, then *"Follow your yes advice."* · film 1 *"Past film is OK as it delivers the idea."* · film 2
*"This one again is a conceptual idea. Proceed."* · F-18 and F-19 (§F.23, §F.28) · **F-1, 2026-11-16: *"Agree with you"*** (to: plain HTTP + version + commit by default, the headless-browser check only as a separate button the owner presses). The default is already built (§F.2); the button is unbuilt and needs a browser run to witness, so it waits for the owner's go for that run. · **F-2, 2026-11-16: *"agreed"*** (observe until 2026-11-30, then ceilings = observed + margin; §F.3). · **F-7, 2026-11-16: *"agreed"*** (no preview host; Run local is the preview). **F-12 step 2 WITHDRAWN 2026-11-16 by the owner (§F.29): deploy from this machine with a button instead of a stored token. Nothing open in F.** Re-measured 2026-11-16: of the day's PRs, the CI-bot merges #3092 `186d80ae`, #3099 `2c6e65d4`, #3100 `9d4f81d6` and #3103 `f541cde7` started **no** Deploy-to-Pages run, while the hand merge #3090 `234a6dc1` did. Live caught up only at the next hand-merged push (`5843aa8e`). `gh secret list` is still empty. Asked the owner for the token (name `AUTOMERGE_TOKEN`) the same day.

### F.21 Hover in the app, jump VS Code to the code   (owner idea 2026-11-14; decision **F-14**; not built)
- 2026-11-15, owner, on **F-14** (which surface first; advice given: the ERP window): *"About experimental browser hover, let's go for Modeller
  canvas first as we try to debug the 2D processing accuracy, and then BIM to ERP."* → **F-14 = the Modeller canvas first (DXF → BIM accuracy
  debugging), then BIM → ERP.** Still a DEV-ONLY overlay on localhost (advice 3 of the 2026-11-14 idea, minimalism §13).
- **Measured 2026-11-15 (read-only, bim-ootb `main` @ `27ac46cc`, all paths `modeller/`):** a DXF element on the canvas is a `THREE.Mesh` with only
  `userData.featureId` = the `kernel_ops` id (`bonsai_kernel.js:285-286`). Hover already exists: `pointermove` → `setHover` → `CustomEvent('dagevu:hover',
  {detail:{fid}})` (`modeller.html:1710-1728`); a tooltip precedent listens to it (`edit_delta_ui.js:77-83`). The op's `parameters.provenance` holds
  `{dxf_handle, layer, sheet, run_id, prov_kind, ifc}` (`dxf2bim_import.js:593-598`, `:623`), readable after reload by `Bonsai.oplog._geomOps()`
  (`bonsai_oplog.js:300-305`). **The gap:** nothing records WHICH rule or code made an element (no gate / verb / function anywhere in the element or
  the op; producers are `dxf2bodies.js` `:389`, `:422`, `dxf2bim_import.js` `toOps` steps 1, 2, 2b, 3, and `dxf2bim/dxf2shell.js`); merged walls keep
  a `+`-joined handle list with no rule per piece; no `§` line prints element + handle + rule.
- **OPEN F-15 (ask next): where is "which code made this element" recorded?** (a) a field added to `provenance` in the op (changes op bytes and
  every pinned op hash / sha; shipped data grows); (b) a trace switch, OFF by default: when on (localhost dev only), each producer site records
  `handle → producer name` in a side map the overlay reads; ops and their hashes stay identical. **Recommendation: (b)**, the producer recorded as a
  NAME (e.g. `dxf2bodies.wallFromLines`) that the X0 index turns into file:line, so line numbers never go stale in data.
- 2026-11-15, owner, on **F-15**: *"go with (b)"*. → **F-15 = a trace switch, OFF by default; producer recorded by NAME in a side map; ops unchanged.**

**F.21 SLICE 1 SPEC — the trace (2026-11-15; no browser, no UI; the hover is slice 2).**
- **One helper, no new file:** `Dxf2Prep.trace(key, el)` in `modeller/dxf2prep.js` (the module almost every producer already loads; it is on the
  Modeller's lazy list `dxf_import_ui.js:14`, so nothing new is boot-loaded or precached). It returns `el`. When `globalThis.__DXF_TRACE` is a `Map`
  it records `guid → key`; otherwise it does nothing (the OFF path is one `typeof` test). Producers wrap the object they push:
  `els.push(P.trace('dxf2walls:wall', {...}))`. The key is a string literal `'<module>:<what>'`, so a parser finds the one line that made the element.
  `dxf2bim/` (the shared library) is not edited: its elements are stamped where `dxf2bim_import.js` takes them in.
- **CLI `--trace`** (`modeller/dxf2bim_cli.js`): sets the map before the run, writes `trace.json` `{guid: key}` beside `bodies.json`, and prints
  `§DXF_TRACE elements=N traced=T untraced=U keys=K`, plus `§DXF_TRACE_UNTRACED guid= class= kind= handle=` for each element no producer claimed
  (the gap list that says which site still needs a stamp). `bodies.json`, `ops.json`, `verdict.json` are NOT changed by the switch.
- **Witness W-DXF-TRACE** (`modeller/tests/witness_dxf_trace.js`, node), on the CLI-marked shed set (`SHED_MARKED`; missing = INCONCLUSIVE):
  T1 the switch changes no data: `bodies.json` + `ops.json` sha-256 identical with `--trace` off and on · T2 coverage: `untraced=0` over every
  body (the shed: 512) · T3 every key resolves: an espree parse of `modeller/*.js` finds exactly ONE `trace('<key>', …)` call per key, printed as
  `§DXF_TRACE_KEY key= bodies= at=<file>:<line>` (the resolver slice 2's hover uses) · T4 red control: the T2 judge run on the map with one key's
  entries removed must report `untraced>0` · OFF run: `globalThis.__DXF_TRACE` stays undefined. **Issue proved:** an element on the canvas cannot
  be traced to the code that built it; after: every body names one source line, and the switch leaves the model byte-identical.
- **Input found 2026-11-15:** `~/Videos/dxf2bim_film_work/why/cli/marked` (the default of **39** `modeller/tests` witnesses) no longer exists, so those
  witnesses SKIP / INCONCLUSIVE today. A leftover `/tmp/w_reg_report_2156169_b/marked` (2026-10-31, re-marked sheets) reproduces the known fact
  `gate STRUCTURE ok=true bodies=512` (`--complete --pack pwd2024_bd`). Slice 1 runs on a copy of it; restoring the default folder is the owner's call.

**F.21 SLICE 1 RESULT (2026-11-15): built and merged, bim-ootb #3043 (`Fixes #3042`), re-run on `main` @ `f7cb6425`: `§DXF_TRACE_W VERDICT PASS bodies=512 keys=11 fail=0`.**
- 27 builder lines in 14 modules stamped; `dxf2bim/` untouched (`dxf2bim_import.js` stamps what it takes in, through `_trace` → `Dxf2Prep.trace`). First key = the
  builder; a later pass-through stamp is appended (`a > b`), never replaces it (0 such chains on the shed).
- Model untouched: `bodies.json` / `ops.json` / `verdict.json` sha-256 identical on unedited main, the branch with the switch off, and on (`e4bca8a8…`, `62d4bc7b…`, `10591e3e…`).
- Full runner before → after (same machine, same input): `§ALLWITNESS PASS=106 FAIL=10 SKIP=5 ENV=12 of 133` → `PASS=107 FAIL=10 SKIP=5 ENV=12 of 134`; every verdict and
  FAIL line identical, +1 = `witness_dxf_trace`. The 10 FAILs and the ENV/SKIP-set drift are on unedited `main` (missing inputs; not this lane's).
- **What it showed (shed):** 96 columns = 32 from `dxf2bodies.js:422` (20 drawn, 12 derived) + **64 synthesized by `dxf2synth.js:62`**; 144 of 168 members
  (`dxf2section.js:89`) and 108 of 117 plates (`dxf2section.js:103`) are `assumed`. `dxf2bodies.js:422` alone builds 99 bodies (footings, 32 columns, beams): the
  trace names that line, not the branch inside it (coarse there, by design; finer only when a real accuracy bug needs it).
- **Machine load:** two runner suites in parallel saturated the machine (a peer session asked to throttle, 2026-11-15). Run ONE suite at a time, under `nice -n 19 ionice -c3`.
- 2026-11-15, owner, after the advice "next: the hover (slice 2), witness-led; then use it on the 64 synthesized columns; the X0 witness stub after": *"WITNESS, go
  with your recommendation."* → **slice 2 is GO, witness first.** The X0 "New witness for this file" command waits until slice 2 is done (not asked again).
- **Inputs restored 2026-11-15 (owner: *"Restore what is needed"*):** `~/Videos/dxf2bim_film_work/why/raw` = the 9 raw sheets from
  `~/Projects/SYSNOVA/DXF2BIM/ShedDrawing/sheets/`; `…/why/cli/marked` = the 9 marked sheets from `~/.cache/capex_uat_dryrun/shed_cli/marked/` (2026-11-14, original file
  names; its `bodies.json` = the `/tmp` copy's byte for byte once the sheet names are normalised; `bodies=512`). A `README.txt` there says where each came from. Some
  witnesses read the raw set ONLY through `SHED_RAW_DIR` (no default): run the runner with `SHED_RAW_DIR=~/Videos/dxf2bim_film_work/why/raw`.

**F.21 SLICE 2 SPEC — hover a body on the Modeller canvas, see the line that built it, open it in VS Code (2026-11-15; dev-only).**
- **Nothing shipped changes.** The overlay is `devtools/hover/dxf_hover.js` (a classic script), loaded into an open Modeller tab by a bookmarklet from the same
  localhost server (the "Serve repo" task serves the repo root; the Modeller service worker's scope is `/modeller/`, so `/devtools/` is not cached):
  `javascript:(function(){var s=document.createElement('script');s.src='/devtools/hover/dxf_hover.js?'+Date.now();document.head.appendChild(s)})()`.
  `modeller.html`, `sw.js` and the precache lists are untouched.
- **The key → line index is generated, never typed:** `node devtools/hover/gen_trace_index.js` writes `devtools/hover/trace_index.json`
  `{format, root, keys: {key: 'modeller/<file>.js:<line>'}}` from an espree parse. The scan lives in ONE module, `devtools/hover/trace_sites.js`, which W-DXF-TRACE T3 also
  uses (one implementation). The file holds this machine's absolute repo path (for the `vscode://` link), so it is git-ignored, not committed.
- **Overlay behaviour:** on load it installs the trace map (`globalThis.__DXF_TRACE`) if absent and prints `§DXF_HOVER installed index_keys=N`; a body converted
  BEFORE that has no key, and the tooltip says *convert again (the trace is on now)*, never a guessed line. It listens to the page's own `dagevu:hover` event
  (`modeller.html` `setHover`), resolves fid → guid (`__arcGuidByFid`) → key (the map) → `file:line` (the index), and shows a small fixed tooltip: key, `file:line`,
  class, DXF handle / layer / sheet, provenance. **V** opens `vscode://file/<root>/<file>:<line>` for the body under the cursor. Each new hover prints
  `§DXF_HOVER fid= guid= key= at=` (the witness reads these, not pixels).
- **Witness W-DXF-HOVER** (`devtools/hover/tests/witness_dxf_hover.js`; headless Chromium with SwiftShader as `witness_dxf_props_panel.js` does, ONE page, run under
  `nice -n 19 ionice -c3`): H1 the generated index = a fresh parse (every stamp site, one line per key) · H2 THE PAGE: open the marked shed, Complete, load the overlay,
  Convert, then REAL mouse moves over a grid of canvas points: for every body the page's own pick hovered, the tooltip's key = the page's trace map = the Node CLI's
  `trace.json` for that guid (an independent run), and its `file:line` = the index · H3 RED CONTROL: a second tab converts BEFORE the overlay loads → every hovered body
  shows *convert again*, 0 lines claimed · INCONCLUSIVE if the sweep hovered 0 bodies. **Not proven by the witness:** that the operating system hands `vscode://` to
  VS Code (no desktop in a headless run); the witness checks the link text and the session reports whether a `vscode` URL handler is registered (`xdg-mime`).
- **Issue proved:** *"I see a wrong body on the canvas; which code made it?"* had no answer without reading the pipeline; after: hover it, read the line, press V.

**F.21 SLICE 2 RESULT (2026-11-15): built and merged, bim-ootb #3047 (`Fixes #3046`), re-run on `main` @ `460c6eea`: W-DXF-HOVER `VERDICT PASS` (H2 15 bodies / 8 keys
`wrong=0`, H3 red control `claimed_a_line=0`), W-DXF-TRACE `VERDICT PASS bodies=512 keys=12`.** How to use it: bim-ootb `devtools/hover/README.md`.
- **Gap the witness found (its first run FAILED):** `toOps` joins wall pieces into NEW bodies that exist only as inserts (shed: 512 bodies → 511 inserts; `CC-L0`+`CC-L1`
  became one). Slice 1 judged `R.els` only. Fixed: stamped at `dxf2bim_import.js:716` (`dxf2bim_import:wall-line`); the CLI keeps the trace on through `write()` and
  judges inserts too (`§DXF_TRACE inserts=511 inserts_untraced=0`, W-DXF-TRACE T2b). Model bytes unchanged (T1 off == on == main).
- Deviations from the spec: the overlay reads handle / layer / sheet from the op (`Bonsai.oplog._geomOps()`, survives a reload) first, `R.els` second; a body with a
  trace map on but no key says *no stamp* (UNSTAMPED), not *convert again*. Each witness page gets its own browser context (the shared one timed out at Convert).
- Not proven: the OS handing `vscode://` to VS Code (headless). This machine has `code_code-url-handler.desktop` registered.
- **Correction (2026-11-15), said to the owner:** slice 1's result called "64 synthesized columns" the place to start. Wrong: they are 32 below-grade parts (14", from
  the column SCHEDULE, `source: schedule`) + 32 grade-to-base stubs (12", inherited), one pair per drawn column (§L29, `dxf2synth.js:52-62`). The real assumption is the
  truss: drawn once at cut AA, copied to 13 stations (`dxf2section.js:42-44`), so 144/156 bars and 108/117 plates (252 bodies, ~half the model) are `assumed`, and their
  spacing is ONE default, `section.spacing` (= column pitch) unless the user states it. That is the accuracy item to raise with the DXF2BIM lane.
- **Handed to this lane 2026-11-15 by bim-compiler-8e (owner's words, typed into that session): an ERP legacy-parity check before the bump.** *"atm, the main user of VSC
  will be me, so having an auto legacy parity validation while working on the ERP can be set here as i eventually get to learning it up"* · *"That means we should have a
  parity check button before the bump, but do advice"*. NOT decided. Facts measured there: legacy stack up (docker postgres :5432 `idempiere_pilot`, pilot :8088); the full
  run `scripts/bridge/run_all.sh` ≈ 70 s, writes throwaway clients to the pilot, last run 2026-11-04 had 2 FAIL + 1 HARNESS-FAIL (a zero-failure gate would block every bump
  today); repeat-safe parity witnesses exist (e.g. bim-ootb `common/door/tests/witness_valrule_parity.js`, #3041). Their advice: one VS Code task; the gate inside
  `bump.js --write` for `erp/` files keyed on a parity PASS log for the current commit + dirty set; "no NEW failure vs a stored baseline"; not on save; no parity witness =
  INCONCLUSIVE; a logged `--no-parity` override. **Open question to put to the owner (F-16): a new parity failure BLOCKS the bump (with the logged override) or only WARNS?**
- 2026-11-15, owner, on **F-16**: *"About bump, yes block note mismatch for now, but a config setting for such be good"*. → **F-16 = BLOCK on a new parity
  mismatch (logged override), with a config setting (block / warn / off).** Also asked: *"So such hover can be toggled on and off by the dev outside so not impact
  normal non dev users?"* (answered: yes; on = the bookmarklet in that tab, off = reload; nothing loads it for other users).

**F-16 BUILD SPEC — the ERP parity gate in `scripts/bump.js` (2026-11-15).** Measured today: the parallel run (bim-compiler `scripts/bridge/run_all.sh`, run on
`origin/master`, pilot up: `/webui/` 200) took ~70 s and printed one `§<TAG>_VERDICT <WORD>` line per witness; log
`~/.cache/bim_bridge/run_20261115_110513.log`. Its non-passing verdicts are the same 3 as on 2026-11-04: `DD FAIL`, `CTX FAIL`, `DDS HARNESS-FAIL`
(`ATTACH_PARITY` / `PRODUCT_ICONS` are `NOT-RUN` without their env).
- **Config (tracked):** bim-ootb `scripts/bump_parity.json` `{ "mode": "block", "applies_to": ["erp/"], "bridge": "~/bim-compiler/scripts/bridge/run_all.sh",
  "known": ["DD:FAIL", "CTX:FAIL", "DDS:HARNESS-FAIL"] }`. `BUMP_PARITY=block|warn|off` overrides `mode` for one run (a VS Code task can set it).
- **When:** `bump.js … --write` and at least one target under `applies_to`. A dry run never runs it; a non-ERP bump never runs it.
- **What:** run the bridge (its own log under `~/.cache/bim_bridge/`), parse every `§<TAG>_VERDICT <WORD>`; NEW = a `FAIL`/`HARNESS-FAIL` whose `TAG:WORD` is not in
  `known`. Prints `§BUMP_PARITY mode= verdicts=N new=[...] known=[...] log=<path> verdict=PASS|BLOCKED|WARN|INCONCLUSIVE|OFF`.
- **Block:** NEW non-empty, or INCONCLUSIVE (the bridge printed 0 verdicts, e.g. the pilot is down: the line says how to start it), in `block` mode → nothing written,
  exit 3. `warn` → written, the line says WARN. `off` → not run, the line says OFF.
- **Override:** `--no-parity "<reason>"` writes and prints `§BUMP_PARITY verdict=OVERRIDE reason="…"` (the reason is required; the commit message should carry it).
- **No re-run for the same tree:** a PASS is cached under `~/.cache/bim_bridge/bump_parity/<sha256 of HEAD + git diff>.json`; same tree = reused (printed `cached=Y`).
- **Witness W-BUMP-PARITY** (bim-ootb `tests/witness_bump_parity.js`, node): a stub bridge (`BUMP_PARITY_BRIDGE=<script>`) printing chosen verdict lines drives:
  P1 new FAIL → BLOCKED, file and `?v=` unchanged · P2 only known FAILs → PASS, written · P3 `warn` → written + WARN · P4 `off` → not run · P5 non-ERP target → not run ·
  P6 `--no-parity` without a reason → refused; with one → OVERRIDE, written · P7 0 verdicts → INCONCLUSIVE, blocked · P8 same tree twice → second `cached=Y`.
  Every row on a temp copy (`--root`, as W-BUMP does). One REAL row (opt-in `BUMP_PARITY_REAL=1`): the real bridge on this machine gives `verdict=PASS` with today's
  `known`. **Issue proved:** an ERP edit could be bumped (shipped to users) with no check that it still matches legacy iDempiere; after: a new mismatch stops it, visibly.
**F-16 RESULT (2026-11-15): built and merged, bim-ootb #3050 (`Fixes #3049`, `f5367092`), by a Sonnet worker; its logs checked here.** W-BUMP-PARITY on main: `§BUMP_PARITY_W_VERDICT PASS judged=14
failed=0 real_row=run`; the real row: `mode=block verdicts=14 new=[] known=[DD:FAIL,CTX:FAIL,DDS:HARNESS-FAIL] verdict=PASS`. Red controls: gate no-op'd → 11 rows FAIL; `known` ignored → 4 rows FAIL. The
existing W-BUMP unchanged (`PASS judged=5 failed=0`). Added beyond the spec: `BUMP_PARITY_BRIDGE` / `BUMP_PARITY_HOME` env (the witness's stub bridge), a copy of the bridge output in the cache folder,
`--no-parity` without a reason = usage error (exit 1). **Caveat:** the config's default bridge path is the shared `~/bim-compiler` checkout, which is usually on another branch; point `BUMP_PARITY_BRIDGE`
at a worktree on `origin/master` (e.g. `/tmp/wt-bridge`) until the default is decided. Film of the hover: `prompts/FILM_IMMERSIVE_SOFTWARE.md`.


### F.23 Hover a BIM body, see every layer behind it (the provenance hover)   (owner 2026-11-15; decision **F-18**)
- 2026-11-15, asked F-18 with the recommendation (six layers in the order they happened, each from data the body or the op already carries; number keys / V open each
  layer's line). Owner: *"Go with your take, on how coders will usually wish it"*. → **F-18 = the six layers, in that order, laid out the way a coder expects a hover:**
  an identity title line first (class · fid · handle · layer · sheet · provenance), then the six numbered layers, **every layer row always shown** (an empty one says
  `none`, so key 3 is always the sizes), each item with its `file:line` when one exists and NOTHING when none exists (never a guessed line). Keys **1-6** open the first
  line of that layer (Alt+1-6 in a text field); **V** stays = the builder line (slice 2 behaviour kept).
- Owner, same day, asked what such an IDE feature is called. Answer given: no one standard name; it is **origin tracking / provenance** (database "why-provenance"),
  shown as **output-to-code navigation** (the Whyline, Ko & Myers 2008), closest to a graphics debugger's **pixel history** (RenderDoc / PIX), and the edits layer is a
  small **omniscient (time-travel) debugging**. Working name in this file: **the provenance hover**.
- **Measured 2026-11-15 (bim-ootb `main` @ `1b291137`, CLI `--complete --pack pwd2024_bd --trace` on the marked shed; `§DXF_TRACE elements=512 traced=512`, `inserts=511`):**
  - Every body's `size` is an object of sides; a side is EITHER an object with a `source` (445 `{number,source}`, 170+18 `{drawn,number,class,rule,source[,align]}`,
    41 `{number,source,text}`, 12 `{value,source,key,drawn}`) OR a plain value with no source (345 numbers, 74 strings, 39 nested: `profile`, `run`). Both `number` and
    `value` name the number (`dxf2beams.js:84` `value`, `dxf2doors.js:78` `number`): the hover reads both and shows a side without a source as `(no source recorded)`.
  - Sources seen: `label` 499, `default` 139, `inherited` 99, `schedule` 64, `drawn` 38. Every body also has `height_source` (`section` 285, `elevation` 110, `derived` 67,
    `stated` 50). The source is free text in code (`dxf2beams.js:84` also writes `TOC label` / `plan level` / `split at the midpoint …`): shown as written, never bucketed.
  - **Only ONE default-sourced kind records WHICH default it used:** `column.top` (12, `key: column.top_under_beam`). The other 127 `source: default` sides (`bar.w` 91,
    `fan.depth` 13, `net.t` 3, `slab.t` 1, `roof.t` 2, …) carry no key: the hover says `default (which default is not recorded on the body)` for them and links nothing.
    **Finding for the DXF2BIM lane (raise there, not fixed here: it changes the model files):** stamping the `key` where a builder calls `DF.use(<key>)` would let the
    hover link every yellow default.
  - The op (`GEOM_INSERT` parameters, survives a reload) carries `provenance.ifc.props.SizeBasis` (`"x:label y:label"`, 511/511) = the sides + sources, written by a second
    code path (the IFC props writer); on the shed it agrees with `bodies.json` on 510/510 bodies that have one (the 511th insert is the joined wall line, which exists only
    as an insert). The props also carry `NoteSource_*` (457) / `SchedSource_*` (128) = `sheet#handle` of each drawn note / schedule row the converter attached.
  - Cuts: `toOps` returns `cuts` (`GEOM_CUT`, `dxf2bim_import.js:653`, `:727`); the page commits them with `parent = nextId + index` and `slide.fillingFid` = the fill's fid
    (`dxf_import_ui.js:951-952`). The CLI's `ops.json` does not write them (inserts only).
  - Edits: the ONE definition of "which ops edit fid X" is `EditDelta.netEdits` (`viewer/edit_delta.js:23`: `GEOM_MOVE`/`GEOM_SCALE`/`GEOM_ROTATE` `parent`, `GEOM_GRID_MOVE`
    `commands[].featureId`). The hover calls it per op (`netEdits([op]).has(fid)`) rather than re-deriving it; a cut's own edits are `GEOM_CUT_MOVE` / `GEOM_CUT_RESIZE`
    with `parent` = the host (`modeller/cut_move.js`). Only ops before the op-log cursor count (an undone edit is not shown).
  - Pass-through (`a > b` in the trace map, `dxf2prep.js:222`): **0 chains on the shed.** The layer is built and judged on a synthetic chain; on the shed it is VACUOUS
    and the witness says so.
- **The six layers (`layersFor(fid, ctx)`, pure, the page and the node witness call the same function):**
  1 **BUILDER** — the trace key's first part → its `file:line` (slice 2's `resolve`, reused, not copied).
  2 **PASS-THROUGH** — each later key of the chain → its `file:line`.
  3 **SIZES** — each side `name number source` (+ `text` / `rule` when present) from the body (`R.els`), else the op's `SizeBasis` (side + source, number from nothing:
    not shown); `height  <height_source>`; a `default` side with a `key` → `modeller/element_defaults.json:<line of that key>` (the yellow row a user can change).
  4 **CUTS** — every active `GEOM_CUT` whose `parent` is this fid (opening, its rule, the fill it holds) + every `GEOM_CUT_MOVE`/`RESIZE` on them; and, for a fill, the cut
    whose `slide.fillingFid` is this fid (`fills the opening of #<host>`).
  5 **EDITS** — every op before the cursor that `EditDelta.netEdits` says touches this fid: `#<op index> <op_type> <dx,dy,dz | fx,fy,fz | grid command>`.
  6 **EVIDENCE** — `handle · layer · sheet · prov · run` + each `NoteSource_*` / `SchedSource_*` the converter attached (data, no code line).
- **Index:** `gen_trace_index.js` also writes `defaults: {key: 'modeller/element_defaults.json:<line>'}`, from an espree parse of the JSON as an expression (a parser, not a
  text search). One file, still git-ignored.
- **Overlay:** `devtools/hover/dxf_hover.js` grows the layered tooltip (same bookmarklet; nothing shipped changes). If `window.EditDelta` is absent it loads
  `/viewer/edit_delta.js` once (dev overlay only). Per new body: `§DXF_HOVER fid= guid= key= at= layers=b,p,s,c,e,v` (the count per layer).
- **Witness W-BIM-LAYERS** (`devtools/hover/tests/witness_bim_layers.js`, node, no browser), on the marked shed in-process (`dxf2bim_cli.run`) + `toOps` + the page's
  commit mapping, and the CLI `--trace` run in a SEPARATE process as the independent oracle:
  L1 builder: for EVERY insert (denominator 511), layer 1 key = the oracle's `trace.json`, line = a fresh parse · L2 pass-through: synthetic `a > b > c` → 2 items, each
  line = the parse; shed population printed (`chains=0 → VACUOUS`, not PASS) · L3 sizes: for every insert, layer 3's `side:source` list = the op's `SizeBasis` (second code
  path) AND each number = the oracle's `bodies.json`; every `default` side with a key links a line of `element_defaults.json` that holds that key (read back), every one
  without a key links nothing; counts printed by source · L4 cuts: over all inserts, Σ host cuts listed = `cuts.length` and each cut appears under exactly its host; each
  fill names its host · L5 edits: synthetic ops appended (a `GEOM_MOVE` on A, a `GEOM_GRID_MOVE` command on B, a `GEOM_SCALE` on C, a fourth op past the cursor): A, B, C each
  list exactly theirs, no other body lists any, the past-cursor op is listed nowhere · L6 evidence: handle / layer / sheet = the oracle's `bodies.json` for that guid ·
  K keys: for every insert and key 1-6, the link is `vscode://file/<root>/<file>:<line>` of an existing line or absent, never a dangling one ·
  **RED controls:** R1 slice 2's single-line `resolve` judged as if it were the layered hover → L3-L6 FAIL; R2 a corrupted `SizeBasis` on one op → L3 catches exactly that
  body; R3 the cursor moved before the edits → L5 lists 0. INCONCLUSIVE (exit 2) if the shed is missing or 0 inserts were judged.
  **Page check (W-DXF-HOVER, extended, ONE headless CPU page, `nice -n 19 ionice -c3`):** H2 also asserts, for every hovered body, the tooltip's six layer counts = the node
  `layersFor` for that fid.
- **Issue proved:** *"why is this body this size, here, with this hole?"* needed reading six places by hand (the builder, the trace, the size record, the defaults file,
  the op log, the converter's props); after: hover it, the whole history in order, a key per layer.

**F.23 RESULT (2026-11-15): built and merged, bim-ootb #3064 (`Fixes #3063`); re-run on `main` @ `ba7c880a`: `§BIM_LAYERS_W VERDICT PASS fail=0 inserts=511 cuts=2`.**
- **Page check (owner's go 2026-11-15: *"yes, run hover check"*), on the branch:** W-DXF-HOVER `§DXF_HOVER_W VERDICT PASS fail=0`: H1 `keys=28 defaults=99 same=Y` · H2
  `hovered=15 wrong=0 page_errors=0` · **H2b `nextId=1 hovered=15 counts_differ=0`** (the tooltip's six counts = Node `layersFor`; the sweep hit the joined north wall `#100`,
  the one host with cuts) · H3 red control `claimed_a_line=0`. Not exercised on the page: layer 5 with a real edit (the sweep makes none; L5 judges it in Node) and the
  OS handing `vscode://` to VS Code. CI on #3064: fast-checks + e2e-tests pass.
- W-BIM-LAYERS on the branch: `§BIM_LAYERS_W VERDICT PASS fail=0 inserts=511 cuts=2`. L1 `inserts=511 wrong=0` · L2 synthetic chain `items=2`, `shed_chains=0 -> VACUOUS` ·
  L3 `wrong=0 by_source={"label":376,"default":122,"inherited":98,"drawn":25,"schedule":64}`, `default_sides linked=12 not_recorded=110` · L4 `cuts=2 listed_under_hosts=2` (the two
  D88B door gaps in the joined north wall `#100`, holding `#158`/`#159`) · L5 A/B/C exactly theirs · L6 `wrong=0` · K `keys_tried=3066 links=523 dangling=0` · red controls R1
  `L3_wrong=511 L4_wrong=511 L6_wrong=511`, R2 catches exactly the corrupted body, R3 `wrong=3`. `bodies_with_layer {"builder":511,"pass":0,"sizes":511,"cuts":3,"edits":0,"evidence":511}`.
- Its first run FAILED L6 `wrong=510`: the judge read `layer` from `bodies.json`, which has no top-level layer (the hover was right). The judge now reads the oracle's
  `ifc.props.SourceLayer`. Kept as a lesson: check the oracle's shape before trusting a 510-of-511 failure.
- Unchanged neighbours on the branch: W-DXF-TRACE `VERDICT PASS bodies=512 keys=12`, W-X0-APPDEF `verdict=PASS`.
- Deviation from the spec: the page-shaped setup lives in ONE helper, `devtools/hover/tests/shed_ctx.js`, used by both witnesses (not a second copy of the commit mapping).
- **Next: FILM 3** (BIM with layers, `prompts/FILM_IMMERSIVE_SOFTWARE.md`, same recipe as FILM 2) · raise the 110 unrecorded default keys with the DXF2BIM lane. *(Both done 2026-11-15: FILM 3 STATUS; bim-ootb #3070 §D113.)*
- **Developer Guide §4.3 "The provenance hover"** (2026-11-15, owner: *"Software Guide updated?"* — it was not: §F.21 / §F.22 / §F.23 had never reached the guide): numbered steps for both hovers, the six
  layers, three figures clipped from ONE real Modeller session (`scripts/film_bim_layers/modeller_shot.js` `MS_DPR=2 MS_CLIP=1`, `errors=[]`, every tooltip `tipInView`), a troubleshooting table, the
  witnesses. Name used: **BIM DevTools** for the set, **the provenance hover** for the feature (owner asked whether it is an "SDK": advised no — an SDK is what outside developers build ON; this is
  developer tooling, an inspector).

---

### F.24 The X0 witnesses in CI's fast checks (ADVICE C1; no decision needed; spec 2026-11-16)
- **Issue proved:** CI passes a change that breaks an X0 witness. That happened twice: archive §F.15 (#2954) and §F.19, the "fake field in the index" class that `witness_x0_appdef` catches, and both times it was caught before the PR only by luck. Today `.github/workflows/ci.yml` runs no `devtools/` witness (`git grep x0 .github/workflows` = 0 hits).
- **Measured 2026-11-16** on a fresh `git clone --depth 1` of bim-ootb `main` @ `8c3f0af6`, with no `../bim-compiler` beside it (the CI runner's view; `node_modules` from `npm ci`):

| witness | exit | seconds | verdict |
|---|---|---|---|
| `witness_x0_isolation` | 0 | 0.7 | PASS |
| `witness_x0_lens` | 0 | 1.3 | PASS |
| `witness_x0_deploy_cost` | 0 | 1.3 | PASS |
| `witness_x0_appdef` | 0 | 2.6 | PASS |
| `witness_x0_context` | 0 | 2.8 | PASS |
| `witness_x0_refs` | 0 | 13.9 | PASS |
| `witness_x0_ship` | 0 | 17.8 | PASS |
| `witness_x0_fresh` | 0 | 18.2 | PASS |
| `witness_x0_mcp` | 0 | 28.0 | PASS |
| `witness_x0_activate` | 0 | 28.3 | PASS |
| `witness_x0_taghover` | **0** | 0.2 | **INCONCLUSIVE** (it needs the bim-compiler repo) |

- **Build:** one step in `ci.yml` `fast-checks`, **"X0 Navigator witnesses (node only)"**, first planned for the five that take under 3 s (isolation, lens, deploy_cost, appdef, context), and cut to three after the FINDING below. The step **fails unless each witness exits 0 AND prints a `verdict=PASS` line**: `taghover` shows that an exit code of 0 can mean INCONCLUSIVE (PRIMAL LAW 4), and a CI step that judged nothing must not be green. `taghover` stays out (it would be vacuous on a runner). The five slower ones (14 to 28 s each, about 106 s together) stay local, run with "Run this witness" as before. Moving them into CI is a later choice, if the cost is worth it.
- **Witness of the step itself (red control):** the step's `run:` script, read from `ci.yml` and run by `bash` in the clean clone, must exit 0. In a copy with a planted defect, it must exit 1 and name the witness that failed. **Done when:** both local runs behave, and the PR's own CI run shows the step green on GitHub.
- **Not in this PR:** ADVICE C2 (the version stamp at pack time) and C3 (the stale "138" texts), one PR each after this.
- **FINDING on the PR's first CI run (2026-11-16):** on GitHub's runner, `deploy_cost` printed `§PERF_IMPACT parser=N verdict=INCONCLUSIVE` and `context` printed `load=?`, **both with exit 0**. The verdict check failed the step (`§X0_CI verdict=FAIL failed=deploy_cost context`), which is the vacuous-green case it exists to catch. Cause: both parse with the TypeScript **inside VS Code** (`scripts/lib/find_ts.js`, the no-install rule of `EDITOR_MAINTAINABILITY_STUDY.md` §14), and a runner has no VS Code. My local "CI-like" clone borrowed the shared checkout's `node_modules` and ran on a machine with VS Code installed, so it hid this: a local imitation of CI is not CI. **Fix:** the step runs the three that judge without that parser (`isolation`, `lens`, `appdef`), so `appdef`, the one that catches the past breaks, stays in. `deploy_cost` and `context` stay local. Installing TypeScript in CI only for them was not done, since it would go against the §13 minimalism guard.
- **RESULT 2026-11-16: ✅ DONE (witness), bim-ootb #3089 / PR #3090, merged `234a6dc1`.** GitHub run 43778395254: `§X0_CI isolation … verdict=PASS` · `lens … PASS` · `appdef rows=1856 … verdict=PASS` · `§X0_CI checked=3 verdict=PASS`. The step's own script under `bash -eo pipefail` (GitHub's shell; my first local test used plain `bash`, under which a failing node would have aborted the loop before naming it, now fixed with `rc=0; node … || rc=$?`): clean clone, exit 0. Red: a devtools path planted in `erp/sw.js` PRECACHE gives `failed=isolation`; an exit-0 INCONCLUSIVE stub gives `failed=context`; a log with no verdict gives `failed=lens`. All witnesses are still reported each time.

### F.25 The installed X0 copy knows when it is stale (ADVICE C2; no decision needed; spec 2026-11-16)
- **Issue proved:** `package.json` says `0.1.0` for every build, so an installed X0 cannot tell that the source changed after a pull (or an edit), and the developer runs old hovers without knowing.
- **Why a content hash and not the commit:** `pack.js` is deterministic (same input, same bytes, kept by W-X0-INSTALL). A hash of the packed files keeps that, catches uncommitted edits, and needs no git. Bumping the version number would also change the file name and the install list for no reason.
- **Build:**
  - `x0-navigator/lib/build_stamp.js` (packed, node only): `listFiles` moves here from `pack.js` (ONE listing rule: no `tests/`, `node_modules/` or dot-folders). `sourceHash(dir)` is the sha-256 of each relative path plus its bytes, in sorted order, leaving out `built.json`. `compare(extensionPath, sourceRoot)` → `{ state: 'same' | 'stale' | 'unknown', built, source, reason }`. `unknown` comes with a reason (no `built.json` = a build from before this change; no `devtools/vscode/x0-navigator` in the open folder) and never says `same` when nothing was compared.
  - `pack.js` adds `extension/built.json` = `{ "sourceHash": … }`.
  - `extension.js` `activate`: one output line `§X0_STAMP state= built= source=`. Only on `stale`, one warning: *"X0 Navigator is older than devtools/vscode/x0-navigator in this folder: run node devtools/vscode/pack.js --install, then reload the window."* Nothing is shown on `same` or `unknown` (ADVICE D: keep it quiet).
  - The `vscode` stub moves from `witness_x0_activate.js` into `tests/vscode_stub.js`, shared by both witnesses (one stub, not two).
- **Witness W-X0-STAMP** (`tests/witness_x0_stamp.js`, node):
  - S1: a packed temp copy carries `extension/built.json`, whose hash equals `sourceHash` of that copy.
  - S2: two packs of the same input give the same bytes.
  - S3: an unpacked copy compared with the same source gives `same`. Editing one packed file in the source gives `stale` (the red control: the judge must flip). An edit under `tests/` stays `same`, since tests are not packed, so there is no false alarm.
  - S4: no `built.json` gives `unknown`, and so does no source folder. Neither gives `same`.
  - S5 (wiring, through the shared stub): `activate` with a stale `extensionPath` shows the warning once; with a matching one it shows none.
  - Before/after: `witness_x0_activate` and the realvsc install suite keep their verdicts.
- **RESULT 2026-11-16: ✅ DONE (witness), bim-ootb #3091 / PR #3092, merged `186d80ae`.** On `main`: `§X0_STAMP_W files=13 stamp=1c3372cfee90 deterministic=Y checks=10 failed=0 verdict=PASS`. S5 activates the PACKED `extension.js`: stale gives `§X0_STAMP state=stale built=1c3372cfee90 source=4ed593f6e739 warnings=1`, restored gives `state=same … warnings=0`. **Red run on the old code** (the new witness with `main`'s old `pack.js`/`extension.js`): exit 1, S1 `null = f56ea15ddad5`, S3 `state=unknown`. The stub refactor is neutral: `witness_x0_activate` gives the same 30 PASS checks and the same `§X0_ACTIVATE definition=1 hover=2 commands=8 fresh=Y checks_failed=0 verdict=PASS`. Also PASS on the branch and on `main`: isolation (`deps=0`), lens, appdef, deploy_cost, context. `pack.js` prints `source=<hash12>`. **Not run:** the realvsc install suite (it starts a real VS Code; owner's go first). **For the owner's own copy:** the next `node devtools/vscode/pack.js --install` is the first build that carries a stamp. Copies installed before it report `unknown` and show no warning.

### F.32 The parity gate runs only the bridge witnesses that read the bumped tree (found 2026-11-17 by A3-CLOCK-1; a defect in F-16, no decision; owner: *"Go with your plan to sort it out"*)
- **Measured:** the gate (`scripts/bump.js` `parityGate`) runs the whole `run_all.sh` with a 15-min limit (`:185`). The full bridge now takes ~25 min
  (W-FA alone grows every run: bim-compiler `prompts/SQLiteIDEMPIERE.md` 2026-11-17 notes), so every ERP bump ends `verdicts=0 … ETIMEDOUT`, blocked.
  The gate hands the bridge three settings (`OOTB`, `BRIDGE_OOTB`, `BRIDGE_UI_DB`, `:184`). Of the 16 witnesses `run_all.sh` names, **5** read one of them,
  directly or through a local `require` (transitive): `witness_lf_parity`, `witness_m3_gap`, `witness_product_icons`, `witness_soda_parity`,
  `witness_soda_receipt_parity`. The other 11 (incl. FA, and DD/DDS/CTX behind the 3 `known` FAILs) judge bim-compiler's own engine and DBs: a bim-ootb
  change cannot move them, so the gate gains nothing from them and pays ~20 min.
- **Build (bump.js only; `run_all.sh` stays the parity lane's and stays the list of record):** read the witness names from the configured bridge script
  (`witness_[a-z0-9_]+`, files that exist beside it), keep those whose source or local requires read a tree setting, run each as `run_all.sh` does
  (`node <w>.js`, cwd = the bridge folder, the same env), 10 min each. One `§BUMP_PARITY_RUN w= secs= verdicts=` line per witness, and the `§BUMP_PARITY`
  line says `scoped=tree witnesses=5 skipped=11` instead of `scoped=partial`. A bridge script that names no witness file (a stub, a custom runner) is run
  whole, as before (`scoped=script`). The cache key is unchanged (tree identity); `known` is unchanged (the 3 entries simply no longer occur).
- **Witness W-BUMP-PARITY gains rows (red control: main's `bump.js`):** S1 a stub bridge folder whose `run_all.sh` names two stub witnesses, one reading
  `BRIDGE_OOTB` and printing `§SA_VERDICT FAIL`, one not reading it and printing `§SB_VERDICT FAIL`: the gate runs ONLY the first (marker file) and blocks on
  `SA:FAIL`. S2 the same with SA passing: verdict PASS, `SB` never ran. Main's gate runs the whole script, so S2 blocks on `SB:FAIL` (red). The existing rows
  (stub with no witness files) must pass unchanged.
**Issue proved:** an ERP bump's parity gate timed out on 11 witnesses that cannot judge the bumped tree; after, it runs the 5 that can, and says which.
- **RESULT 2026-11-17: ✅ DONE (witness), bim-ootb #3153 / PR #3154, merged `7e4d163c`.** +80 / −15, 3 files. `§BUMP_PARITY_W_VERDICT PASS judged=17 failed=0
  real_row=run`: `§BUMP_PARITY_RUN w=witness_m3_gap secs=265` · `lf_parity 38` · `soda_parity 10` · `soda_receipt_parity 11` · `product_icons 12` (~5.5 min);
  R `verdicts=4 new=[] known=[M3:HARNESS-FAIL] scoped=tree witnesses=5 skipped=11 verdict=PASS`. Re-run on `main` @ `5caf16f5`: 16/0 (R opt-in, skipped).
  **Red (main's bump.js + the new witness):** P10 ran `[sa,sb]`, P11 blocked by `SB:FAIL` (3 FAIL, P9 only its `partial`→`script` label).
  **Known list:** `["M3:HARNESS-FAIL"]` (measured identical before/after #3149); DD/CTX/DDS dropped (their witnesses never read this tree).
  **Instrument defect found and fixed in the witness:** its real row bumped a 6-file temp copy, so the tree-reading witnesses crashed in 0 s
  (`Cannot find module …/erp/tests/dd_common.js`, SODAP/SODAR FAIL, product_icons 0 verdicts). It now bumps an OVERLAY (edited files copied, the rest linked).
- **Owner, 2026-11-17, during this item:** *"Must FA be the choice of regression? Conventionally devs usually check a Sales Order cycle and posting. Besides
  parity on the exact item that is touched."* → FA is no longer run by the gate (it never read bim-ootb). M3, which the gate keeps, IS the sales/purchase
  cycle with books compared (O2C1-SO … O2C4-PAY, P2P, POS, payments, invoices, inventory, 50+ scenarios). **"The exact item touched" is NOT done yet:**
  the gate does not pick checks by the changed file. Measured: `ad_process.js` / `ad_callout.js` are each required by 53 `erp/tests` witnesses,
  `model_order.js` by 1, `crud_overlay.js` by 2 (of 303). Open as decision **F-23** (ask the owner, one message).
- **DECISION F-23 (2026-11-17, owner):** asked whether the gate also runs the witnesses of the exact file changed (recommendation: yes, a new-fail rule):
  chose *"Yes, new-fail rule (Recommended)"*. → **F-23 = the gate also runs every node witness under `*/tests/` that loads a changed file, on the change
  and on main; it blocks only on pass-on-main / fail-on-change; main's results are cached per main commit; browser witnesses are left out.** Spec: §F.33.

### F.33 The gate also runs the changed file's own witnesses, new failures only (decision F-23; spec 2026-11-17)
- **Changed files** = the bump's targets under `applies_to` (`erp/`), the files whose `?v=` it raises (the author names them; the same set the gate already uses).
- **Their witnesses** = `git ls-files '*/tests/witness_*.js'` in the bumped tree whose source has `require(` … `'<name>.js'` / `'./<name>'` for a changed
  file, minus browser ones (`playwright|chromium|puppeteer` in the source). Measured 2026-11-17: `ad_process.js` 53 (1 browser), `ad_callout.js` 53 (1),
  `model_order.js` 1, `crud_overlay.js` 2.
- **Run** each with `node <tests>/<w>.js`, cwd = the folder above `tests/` (the convention the ERP witnesses document, e.g. `witness_local_time.js`),
  `< /dev/null`, 5 min each, on the bumped tree and on the BASE = `git merge-base HEAD origin/main`, checked out once as a detached worktree under
  `~/.cache/bim_bridge/touch_base/<sha>` (reused; its `node_modules` linked to the bumped tree's). The base result per (sha, witness) is cached in JSON.
- **Judged by exit code** (0 = pass), the one signal all 303 witnesses share; each witness's last `§…VERDICT…`/`verdict=` line is printed beside it so the
  reader reads the log, not the code. **New fail** = base exit 0 and change non-0, re-run once on the change to rule out a flake (both must fail).
- **Lines:** `§BUMP_TOUCH_RUN w= base=0|1 change=0|1 secs= last="…"` per witness, then `§BUMP_TOUCH files= witnesses= browser_skipped= new_fail=[…]
  pre_fail=[…] secs= verdict=PASS|BLOCKED|WARN|INCONCLUSIVE`. Mode, `--no-parity "<reason>"` and `BUMP_PARITY=warn|off` apply as for the bridge.
  INCONCLUSIVE (blocks in block mode) if the base cannot be checked out. 0 witnesses for a file = said (`witnesses=0`), not a failure.
- **Witness W-BUMP-PARITY rows:** T1 a stub tree whose `erp/tests` holds a witness that requires the changed file and FAILS only on the change (the base
  passes): BLOCKED, `new_fail=[that]`. T2 one that fails on both: `pre_fail`, PASS. T3 one that does not require the file: never run. T4 a flaky one (fails
  once, then passes): not a new fail. Red control: main's `bump.js` gives no `§BUMP_TOUCH` line at all.
- **Cost to measure on the first real run** (the owner's recommendation said so): the 53-witness core files, both trees, cold cache.
**Issue proved:** a bump could ship a change that breaks the changed file's own witness while every bridge check passed; after, that witness is run and a
new failure blocks.
- **First real run (2026-11-17, `erp/ad_callout.js`, base `5caf16f501d3`):** `§BUMP_TOUCH files=erp/ad_callout.js witnesses=51 browser_skipped=2 new_fail=[]
  pre_fail=[witness_docno,witness_master_save_rules,witness_post_error,witness_post_invoice_diff,witness_post_matchinv_diff,witness_post_movement_diff,
  witness_script_validator,witness_shopday_model_path,witness_views_parity] secs=2053 verdict=PASS` (+ the bridge, 2373 s in all). **So 9 of the 51
  `ad_callout.js` witnesses fail on main** (this replaces RESUME 7's struck-out "15 of 51"). Time: 34 under 10 s, 12 at 10-60 s, 5 at 74-300 s
  (`witness_docno` hits the 5-min limit on both trees); passing ones 813 s, the 9 failing ones 413 s per pass, and the spec's re-run-then-base order ran them
  three times (~20 of the 34 min). **Changed (no verdict changes): base FIRST, re-run only on pass-on-base** (a witness failing on the base cannot be a new fail).
- **DECISION F-23b (2026-11-17, owner)**, asked with the measured cost (~20 min warm / 27 cold for a core file, against the "several minutes" estimate given
  for F-23; recommendation: a 10-min budget): chose *"10-min budget (Recommended)"*. → **The changed file's witnesses run fastest-first by their recorded
  durations (`~/.cache/bim_bridge/touch_durations.json`, written every run, seeded from this first run: 49 of 51 fit), never-measured ones first; no new
  witness starts after 10 min (`BUMP_TOUCH_BUDGET_S`); every one not reached is NAMED (`unrun=[…]`), not failed.** W-BUMP-PARITY T6.
- **RESULT 2026-11-17: ✅ DONE (witness), bim-ootb #3158 / PR #3159, merged `7b1f668b`.** W-BUMP-PARITY `PASS judged=21 failed=0` (T1 new fail blocks · T2
  pre-fail does not · T4 flake · T5 no base = INCONCLUSIVE · T6 budget); red: main's `bump.js` fails T1-T5. **Real run with the budget** (`ad_callout.js`, warm base):
  `witnesses=51 browser_skipped=2 new_fail=[] pre_fail=[8] unrun=[witness_core_timing,witness_docno] budget_s=600 secs=784 verdict=PASS`, 1,089 s with the bridge
  (was 2,373 s). The budget is a START limit: the last witness started inside 600 s finishes after (784 s). Spec deviation: base is run only for a witness
  that failed on the change (a pass cannot be a new fail), so "on both trees" holds for every failure, not every witness.

### F.35 The core-purity warning in the editor (Part F table row "Core-purity squiggle"; unblocked by A3; no decision; spec 2026-11-17, bim-ootb #3207)

**Problem.** W-CORE-PURE fails a PR in CI when a core file calls a clock, random numbers or the network itself. The developer learns it from CI, minutes later.
**Build (dev-side only, nothing reaches the browser):**
- **One scanner, one list.** The scan and the A-1 list move out of `erp/tests/witness_core_pure.js` into `scripts/lib/core_pure.js`: `CORE` (the pathspecs),
  `isCore(relPath)`, `scan(src)` → hits with line AND column. The witness keeps its population, red controls and verdict and calls the module.
- **X0 Navigator:** on open and on save of a core file, one `x0-core-pure` Warning per hit, on the call, saying what was called and what to use instead
  (`Env.edge()` / `CoreEdge`, `Env.elapsed()` for a timing). X0 loads the module from the checkout, as it loads `msg_keys.js` (§F.28). No parser there
  (no `node_modules`) → no warning and one `§X0_CORE_PURE unavailable` line in the output channel, never a guess.
**Witness W-X0-CORE-PURE** (`devtools/vscode/x0-navigator/tests/witness_x0_core_pure.js`, node, the `vscode` stub):
- C1 every core file (by `git ls-files <pathspecs>`, the independent list) opened as it is committed: 0 warnings.
- C2 `isCore(f)` equals membership in that `git ls-files` list for EVERY tracked `.js` (a list that drifts from the witness's is the defect to catch).
- C3 RED: a planted `Date.now()` in a real core file → exactly 1 warning, on that line and column; restoring the text clears it.
- C4 the same text in a comment → 0; the same planted call in a file OUTSIDE the list (`erp/kernel_ops.js`, the minting point) → 0.
- INCONCLUSIVE when the list is empty or the parser is missing. Line: `§X0_CORE_PURE_W core_files= judged= failed= verdict=`. In CI with the other node-only X0 witnesses.
**Issue proved:** "a forbidden call in a core file says nothing in the editor until CI runs".

**F.35 RESULT (2026-11-17/18, eighth session): ✅ DONE (witness), bim-ootb #3207 / PR #3209, merged `3095c8be`.** Dev-side only, no bump. Logs read (also in the PR's CI log):
- `§X0_CORE_PURE_W core_files=125 tracked_js=3395 judged=9 failed=0 verdict=PASS`: C1 125 core files clean · C2 `isCore()` = `git ls-files <pathspecs>` for every tracked
  `.js`, 0 differ · C3 red: a planted `Date.now()` in `InvoiceGenerate.js` → one warning at its line and column (`Date.now()@192:24`), plus a planted `fetch()` → two, the
  second `network`; restoring clears it · C4 a comment, a string, a file that does not parse → none; the same call in `erp/kernel_ops.js` (outside the list; the bare scan
  finds 8 there) → none.
- **One scanner:** `scripts/lib/core_pure.js` now holds the scan and the list; `erp/tests/witness_core_pure.js` calls it (106 → 60 lines), same verdict
  (`files=125 forbidden=0 PASS`; a pre-#3168 tree still `forbidden=4 FAIL`).
- Other X0 witnesses re-run PASS: activate (its save-handler count 4 → 5, updated), appdef, catalog, isolation, lens, stamp, refs, newwit, fresh, context, bump_button.
  CI's X0 step now checks 4 (`§X0_CI checked=4 verdict=PASS`).
- **For the owner's machine:** the installed X0 copy is now older than the source; its stale-copy note (§F.25) says so. Reinstall to get the warning.
- Not proven: how VS Code draws it (the witness runs on the `vscode` stub; the real-VS-Code suite was not extended).

### F.34 The Bump button: check in the background, solid when it passes, one press to write (owner idea 2026-11-17; decision F-24; not built)
- **Owner:** *"I thot we have a bump button, perhaps after the budget time, it appears solid for user to press it?"* · on when the check starts, asked with
  the recommendation "on first press": chose *"On first press (Recommended)"*, then added *"or after sufficient feature completion"*.
  → **DECISION F-24: nothing heavy starts by itself. The author presses Bump when the feature is complete; that press starts ONE background check of every
  changed file of the branch (the diff against the merge-base with `origin/main`), and a press on the solid button writes.** Editing after the check makes it
  hollow again (the result is keyed on the exact tree).
- **Defect this also fixes (measured 2026-11-17):** `devtools/vscode/x0-navigator/lib/ship.js:129` runs `scripts/bump.js` with `spawnSync` and a 60 s
  timeout, inside the extension host. Every `erp/` bump runs the parity gate (F-16: ~70 s when built, ~5.5 min after §F.32, up to ~16 min with §F.33), so
  since F-16 the VS Code bump of an ERP file freezes the extension for 60 s and then fails. The terminal path works.
- **Shape (to spec in full when built):** `bump.js --check` runs both gates with no write and stores the verdict by tree identity (the bridge part already
  caches its PASS by tree, `parityGate`; §F.33 gains the same) · the extension runs it with `spawn` (async), status bar: hollow `Bump: checking… n/N`,
  solid `Bump ✓`, red `Bump ✗ <witness>` (click opens the log) · a press on solid runs `--write`, which reads the stored PASS and writes in a second.
- **BUILD SPEC (2026-11-17, owner "yes"):**
  1. `scripts/bump.js --changed`: the targets = every file changed against the merge-base with `origin/main` (committed + working tree + untracked) that a
     page or loader references with `?v=` (the files a bump can raise); the rest (prompts, tests, tools) are skipped and counted. `--check`: run both gates,
     write nothing, `§BUMP_CHECK verdict=PASS|BLOCKED key=<tree key>`, exit 0 / 3. Both gates print a plan line first (`§BUMP_PARITY_PLAN witnesses=`,
     `§BUMP_TOUCH_PLAN witnesses= budget_s=`) so a caller can show progress. The touch gate caches a PASS by tree key + changed set, as the bridge does, so
     `--write` right after a passing `--check` on the same tree re-runs nothing.
  2. Extension (`extension.js`), one status-bar item made at activation, text only (no timer, no listener but the save one already pinned): idle
     `$(circle-outline) Bump` → press: `$(sync~spin) Bump: bridge n/N` then `witnesses n/N` (an async `spawn` of `bump.js --changed --check`, never
     `spawnSync`) → exit 0: `$(pass-filled) Bump ✓` · exit 3: `$(error) Bump ✗ <first new_fail or verdict>` · press on ✓: `bump.js --changed --write`,
     then back to idle. A save of a file in the source root while ✓/✗ puts it back to idle (tooltip "changed since the check"). The ERP quick fix
     (`bumpThisFile`, `ship.bump` = `spawnSync` 60 s) for a file under the gate's `applies_to` starts the button instead.
  3. **Witnesses:** W-BUMP-PARITY gains C1 (`--check` writes nothing; `--write` after it re-runs neither gate: bridge marker 1, touch marker 1) · C2 (an
     edit between check and write re-runs both) · C3 (`--changed` in a temp git repo picks the changed referenced file and skips a changed `.md`).
     NEW `witness_x0_bump_button.js` (vscode stub, a fixture `scripts/bump.js` that prints the plan/run lines and exits by env): B1 idle text · B2 a press
     shows progress and ends ✓, the fixture saw `--changed --check` · B3 a press on ✓ runs `--write` · B4 exit 3 → ✗ with the witness name · B5 a save resets
     to idle · B6 the ERP quick fix starts the button, not `ship.bump`. Red control: main's extension has no `x0Navigator.bumpButton` command (B1-B6 FAIL).
- **RESULT 2026-11-17: ✅ DONE (witness), bim-ootb #3161 / PR #3162, merged `0cc03ed6`.** +224 / −22, 7 files. Re-run on `main` @ `0cc03ed6`:
  `§X0_BUMP_BUTTON checks=6 failed=0 verdict=PASS` · `§BUMP_PARITY_W_VERDICT PASS judged=24 failed=0`. B2's log: progress `bridge 0/2 … 2/2 | witnesses 0/1 …`, the
  press returned while `Bump: checking`, the fixture saw `--changed --check --root …`. **Red:** main's extension → `FAIL B1 … (no button)`. Neighbours PASS:
  W-X0-ACTIVATE (commands 11 → 12), ship, isolation, fresh, newwit, deploy. **Two bugs the witnesses caught while building:** C2 (the touch cache of C1
  matched C2's identical start: the test cleared it per row) and C3 (`--changed` alone hit the "no targets" usage error). **Not in CI's X0 list:**
  it activates the whole extension, like W-X0-ACTIVATE, which that list also leaves out. **Not yet done:** a real press in a real VS Code (the stub proves
  wiring, not drawing; `devtools/vscode/x0-navigator/tests/realvsc/` exists for that kind of run, on the owner's go).

### F.31 Browser memory of the three pages, shown in VS Code (owner 2026-11-16; tier 3 of §F.3; decisions **F-20..F-22**; not built)
Owner, 2026-11-16: *"reminder, i did suggest before that we have some monitor in the VSC showing what is the mem load on browser of the differing
URL trilogy so dev knows if code is getting bulky"*. This is tier 3 of the perf-impact monitor (§F.3, "Measured, only with the owner's go"). Tier 1
is built (§F.12a `devtools/vscode/x0-navigator/lib/deploy_cost.js`: static start-up and offline-cache **bytes** per app, working tree vs a git ref,
no browser). **Nothing in VS Code shows browser memory today.**
- **The trilogy:** `viewer/viewer.html`, `erp/idempiere.html`, `modeller/modeller.html`, the three apps with a `sw.js`, the same set `deploy_cost.js`
  finds from the files.
- **What exists to reuse (bim-ootb `main` @ `9b7d2f86`):** `scripts/probe_activation_memory.js` reads Chrome's own `JSHeapUsedSize` (`page.metrics()`,
  the DevTools Performance domain) at named points; `scripts/probe_memory.js` breaks a live scene's memory down (JS heap, three.js geometry bytes,
  textures, the sql.js WASM heap). Both are probes for one building, run by hand; neither compares two trees or reaches VS Code.
- **Shape proposed:** a headless run of each page, working tree vs `main` (two local servers, the X0 "Run local" pattern), software GL, service worker
  blocked. It reads at the page's ready point: JS heap (`JSHeapUsedSize`), the WASM heap, the script bytes actually fetched, and the boot time. It
  prints `§HEAP_IMPACT page= tree= jsMB= wasmMB= scriptKB= bootMs=` and a `delta` line per page. X0 shows one row per page: *Viewer 84 MB (+3 vs main)*.
  **Witness W-HEAP-IMPACT:** a planted 5 MB array in a boot script raises that page's jsMB by about 5 and leaves the other two unchanged (red control:
  an unchanged tree gives |delta| within the measured run-to-run noise, measured first, not assumed); INCONCLUSIVE if a page never reaches its ready point.
- **Thresholds are NOT set here:** F-2 already decided to observe until 2026-11-30 and then propose ceilings. This tool adds the memory column to that.
**OPEN DECISIONS (ask one at a time):**
- **F-20 — what the number measures.** (1) Each page booted with **no model**, or with the one smallest fixed sample, so the number is the weight of
  the CODE (what "getting bulky" means), steady from run to run. (2) With a reference building loaded: real user load, but geometry dominates it
  (the heap fit is ≈ 0.17 GB per million vertices and the largest reference building peaks at 3.4–3.8 GB, `docs/BrowserScaleBenchmark.md`;
  the code's own share has never been measured, which is what this tool would add) and the bake logs already track it. **Recommendation: (1);
  (2) stays the bake logs' and BrowserScaleBenchmark's job.**
- **F-21 — when it runs.** A button only (F-1's rule: a headless browser only when the owner presses it), or also on every save/commit. **Recommendation:
  a button (*X0: Memory of the three pages*), plus the last result kept in the status bar until the code changes; never beside a live bake or GPU work.**
- **F-22 — where it shows.** **Recommendation:** the X0 panel row under "Cost if deployed" (bytes and memory side by side), and the `§HEAP_IMPACT` lines
  pasted into the PR body as F-2 already asks for the bytes.
**DECISIONS:**
- 2026-11-16, owner, on **F-20** (what the number measures): chose *"Code only (Recommended)"*. → each page boots with no building or the one small
  fixed sample; big-building memory stays the bake logs' job.
- 2026-11-16, owner, on **F-21** (when it runs): chose *"Button only (Recommended)"*. → a command the developer presses; the last result stays in the
  status bar until the code changes; never runs on its own.
- 2026-11-16, owner, on **F-22** (where it shows): chose *"X0 panel + PR body (Recommended)"*. → a Run & Ship row beside Cost if deployed, the status
  bar line, and the `§HEAP_IMPACT` lines pasted into the PR body (F-2's observation until 2026-11-30).

**FACTS measured before the build (2026-11-16, bim-ootb `main` @ `9b7d2f86`, headless shell, software GL, service worker blocked, GC forced before reading;
probe kept at the session scratchpad, its lines quoted here):** 3 runs per page, `JSHeapUsedSize` after load + network idle + 3 s:
viewer **18.1 / 18.4 / 18.5 MB** (scripts fetched 12,587 KB raw, 320 requests, load 13.8–18.3 s) · ERP **4.2 / 4.2 / 4.2 MB** (4,780 KB, 257) ·
Modeller **10.9 / 10.9 / 10.9 MB** (8,487 KB, 74). So run-to-run noise is ≤ 0.4 MB, and a few-MB growth is visible.
- **The bare viewer URL is already "the small fixed sample":** it loads `Duplex_extracted.db` (14,608 KB) by default. Its 9 × 404 are all building DATA
  the viewer tries and skips (7 git-ignored `.db`/`.bin`, 2 optional patches that do not exist), 0 page errors. **Consequence:** data files are
  untracked, so both trees must serve the SAME data, or the delta would measure data, not code.

**BUILD SPEC (F-20/F-21/F-22 decided; bim-ootb tracker issue with the PR).** Dev side only (§13 guard): nothing new reaches the browser.
1. `devtools/vscode/x0-navigator/lib/find_browser.js`: Playwright's `chromium` from `$PLAYWRIGHT`, else `<root>/tests/node_modules/playwright` (already in
   `tests/package.json`, via `@playwright/test`), else `null`. Never downloads, never installs (the `scripts/lib/find_ts.js` pattern). The extension keeps 0 npm deps.
2. `devtools/vscode/x0-navigator/lib/heap_impact.js` (pure node, no `vscode` import; also a CLI: `node lib/heap_impact.js <root> [ref]`):
   - two local servers. **work** = the files on disk. **base** = each TRACKED file as it is at `ref` (`git cat-file --batch`, one process); an untracked
     file (building data) comes from disk, the same bytes as **work**.
   - pages = setting `bimDevtools.heapPages`, default `viewer/viewer.html`, `erp/idempiere.html`, `modeller/modeller.html` (the trilogy, named by the owner).
   - per page and tree, `runs` (default 3) fresh contexts: SW blocked, `--use-gl=swiftshader`; `load`, network idle (60 s cap), 3 s, `HeapProfiler.collectGarbage`,
     `Performance.getMetrics` → `JSHeapUsedSize`; plus script bytes fetched, requests, load ms.
   - prints `§HEAP_IMPACT page= tree=work|<ref> jsMB=<median> spreadMB=<max−min> scriptKB= requests= loadMs=` and
     `§HEAP_IMPACT_DELTA page= jsMB=±x.x scriptKB=±n noiseMB= verdict=SAME|GREW|SHRANK|INCONCLUSIVE`, where noise = the larger spread + 0.2 MB (a noise band,
     not a budget: F-2 sets budgets on 2026-11-30). INCONCLUSIVE when no browser was found or a page did not load; then `§HEAP_IMPACT verdict=INCONCLUSIVE reason=`.
   - an `overlay` option (path → text) replaces a work file's bytes in memory: for the witness only, so a test never edits the tree.
3. `extension.js`: command `x0Navigator.heapImpact` (*X0 Navigator: Memory of the three pages (headless, vs main)*), run as a child `node` process,
   lines streamed to the X0 output channel; Run & Ship row `3m · Memory of the three pages`; a status-bar item `$(pulse) MB V 18.3 · E 4.2 · M 10.9`
   (deltas when not SAME) kept until a file in the tree is saved, then marked `(stale)`. The ref is the existing `bimDevtools.costBaseRef`.
4. **Witness W-HEAP-IMPACT** (`devtools/vscode/x0-navigator/tests/witness_x0_heap_impact.js`):
   - H1 base server: a tracked file answers its `ref` bytes (equal to `git show`), an untracked data file answers the disk bytes.
   - H2 unchanged tree vs `HEAD`: all three pages `verdict=SAME`.
   - H3 **red control:** an overlay appending a 5 MB packed-double array to one ERP boot script: ERP `jsMB` rises by 4–6.5 and says GREW; viewer and
     Modeller say SAME.
   - H4 no browser (`$PLAYWRIGHT` pointing nowhere, fallbacks off) → `verdict=INCONCLUSIVE reason=…`, exit 2, nothing thrown.
   - H5 the extension: the command and the Run & Ship row are registered (`witness_x0_activate` pattern); `witness_x0_isolation` stays `deps=0`.
   Headless runs only under `nice -n 19`, one at a time, never beside a bake (F-21 / 0g).

**RESULT 2026-11-16: ✅ BUILT (witness), bim-ootb #3130 / PR #3131.** ~+250 / −4, devtools only. Logs read:
- W-HEAP-IMPACT `§HEAP_W checks=12 failed=0 runs=3 verdict=PASS`: H1 a changed tracked file answers its HEAD bytes (29,827 = 29,827), an ignored data
  file the disk bytes · H2 unchanged code SAME on all three (`jsMB` +0.04 / 0.00 / 0.00) · **H3 red control: 5 MB planted in `erp/ad_callout.js` (in
  memory) → ERP `jsMB=+5.00 verdict=GREW`, viewer SAME, Modeller SAME, the file unchanged on disk** · H4 no browser → `verdict=INCONCLUSIVE reason=…`
  · H5 command + row `3m · Memory of the three pages` + status `MB V 18.4 · E 4.2 · M 10.9`.
- Other X0 witnesses PASS: activate (commands 10 → 11; Run & Ship rows 5 → 6, both counts updated in that witness and in `witness_x0_deploy` D3),
  isolation `deps=0`, appdef, catalog, context, deploy_cost, fresh, lens, newwit, refs, ship, stamp; taghover PASS with `--compiler-root ~/bim-compiler`
  (INCONCLUSIVE without it in a `/tmp` worktree: its default looks for `../bim-compiler`, an instrument path, not this change).
- **Spec deviations, said here:** the status-bar item and its save listener are created on the FIRST run, not at activation, so `witness_x0_activate`'s
  other counts (4 save listeners, the one status item it reads) stay as they were. Not added to CI: its X0 list is explicit, and F-21 is button only.
- **Known limit, measured:** with no options the viewer downloads its default Duplex sample (14,608 KB) from the project's object-storage bucket, so
  the viewer row needs the network; both sides fetch the same bytes, so the delta is still the code's. ERP and Modeller fetched no database.

### F.30 The parity gate judged the shared checkout, not the tree it bumps (found 2026-11-16 by A2-TIMING-1; a defect in F-16, no decision)
- **Issue proved:** `scripts/bump.js` (F-16) caches its verdict under the BUMPED tree (`HEAD` plus `git diff`), but spawns the bridge (`bash run_all.sh`) with no tree setting, so every bridge witness falls back to `~/bim-ootb`. The bridge log of the A2-TIMING-1 bump says `§SODAP_CTX ootb=/home/red1/bim-ootb` while the bump ran in `/tmp/wt-a2t`. **A PASS is therefore filed under a tree that was never judged (scope-blind, PRIMAL LAW 4).** It also showed a second instrument trap: a fresh bim-compiler worktree has no `node_modules`, so five bridge witnesses printed `Cannot find module 'sql.js'`. The gate counted those as five NEW FAILs, which were the instrument's fault, not real mismatches.
- **Measured (bim-compiler `scripts/bridge`):** the witnesses read their bim-ootb tree from `BRIDGE_OOTB` (`witness_erp_complete_parity`, `witness_m3_gap`, `witness_rv_unposted_list`, `witness_product_icons`), from `OOTB` (`witness_soda_parity`, `witness_soda_receipt_parity`), from `BRIDGE_UI_DB` (`witness_lf_parity`, the UI seed), from `argv[2]` (`fn_census_legacy`), or only from `~/bim-ootb` / a fixed path (`dict_census_stage2`, `run_erp_witnesses.sh`, and the others).
- **Fix (bim-ootb `scripts/bump.js`):** the bridge gets `OOTB`, `BRIDGE_OOTB` = the bumped repo root and `BRIDGE_UI_DB` = `<root>/erp/ad_seed.db`. The `§BUMP_PARITY` line gains `tree=<root>`, and gains `scoped=partial` because some witnesses honour no setting (the list above). The verdict wording stays the same.
- **Not fixed here (the parity lane's files, bim-compiler `scripts/bridge`):** the witnesses that honour no setting. The note is in `prompts/SQLiteIDEMPIERE.md`.
- **Witness:** a row **P9** in `tests/witness_bump_parity.js`: the stub bridge records `$OOTB`, `$BRIDGE_OOTB` and `$BRIDGE_UI_DB` in its marker file, and each must equal the bumped root (or its `erp/ad_seed.db`). The `§BUMP_PARITY` line must name `tree=`. Red: the old `bump.js` leaves them empty. Plus one real gate run.
- **RESULT 2026-11-16: ✅ DONE (witness + a real scoped bridge run), bim-ootb #3111 / PR #3112.** `W-BUMP-PARITY judged=14 failed=0` (P1–P8 unchanged). P9: the stub saw `OOTB=<root>|BRIDGE_OOTB=<root>|BRIDGE_UI_DB=<root>/erp/ad_seed.db`. Red with main's `bump.js`: P9 FAIL (`OOTB=|BRIDGE_OOTB=|BRIDGE_UI_DB=`). The real bridge run with those settings logged `§SODAP_CTX ootb=/tmp/wt-bpt`; only the known DD/CTX/DDS fail, and `W-ICON-PARITY`, NOT-RUN until now, ran and gave MATCH (imported=27). **Bridge trap:** point `BUMP_PARITY_BRIDGE` at a bim-compiler checkout WITH `node_modules` (or symlink `~/bim-compiler/node_modules` into the worktree); otherwise 5 witnesses fail on `Cannot find module 'sql.js'` and look like new mismatches.

### F.29 Deploy from this machine: "5 · Deploy main now" (F-12 step 2 replaced by the owner, 2026-11-16; spec 2026-11-16)
- **Owner, 2026-11-16:** *"VSC needs another deploy key different from what we got in this machine? What if i use it to practice and also deploying still sticks to this machine"* → recommendation: drop the token, add a Deploy button that uses this machine's own `gh` login → *"yes build what u agreed"*, plus *"make a note in the guide that if users want to deploy from the VSC what they have to do"*. **So F-12 step 2 (the `AUTOMERGE_TOKEN`) is withdrawn: no key is stored on GitHub.** The CI bot keeps auto-merging; its merges still start no Pages deploy (re-measured: 4 of the day's), and the person presses Deploy from VS Code when Fetch back says the live site is behind.
- **Issue proved:** a bot-merged change is not live until a later hand merge happens to push `main`, and nothing in the editor can publish `main` on its own.
- **Build (bim-ootb):**
  - `.github/workflows/deploy-pages.yml`: add `workflow_dispatch:` beside `push: branches: [main]`. The build is unchanged and always builds `main`.
  - `lib/ship.js` `deployMain(root, opts)`: preconditions, each with a plain reason when it fails: `gh` is installed (*"install the GitHub CLI"*), `gh auth status` is logged in (*"run gh auth login"*), the origin is a GitHub repo, and the workflow file has `workflow_dispatch` (read from the file, never assumed). Then it runs `gh workflow run deploy-pages.yml --ref main -R <owner>/<repo>` and prints `§SHIP_DEPLOY started=Y repo= ref=main` plus the run's link (`gh run list --workflow deploy-pages.yml --limit 1`), and says to press Fetch back when the run finishes (1 to 2 minutes). The `gh` binary comes from `opts.gh || 'gh'` (the witness hands in a fake).
  - `extension.js`: command `x0Navigator.shipDeploy` (*"X0 Navigator: Deploy main now (GitHub Pages, with your gh login on this machine)"*). It asks first (*"Deploy main to the live site now?"* with a **Deploy** button), and nothing runs without that click (the bump's rule). Run & Ship gets step **"5 · Deploy main now"**.
- **Witness W-X0-DEPLOY** (`tests/witness_x0_deploy.js`, node, a fake `gh` that records its arguments; it never touches GitHub):
  - D1: logged in, with dispatch present, it runs exactly `workflow run deploy-pages.yml --ref main -R red1oon/bim-ootb` and prints `started=Y`.
  - D2 RED: no `gh` gives *install the GitHub CLI*; not logged in gives *gh auth login*; a workflow file without `workflow_dispatch` gives a refusal naming the file. Nothing is run in any of these (the fake's log is empty).
  - D3 (stub wiring): the command is registered (commands 9 → 10); without the **Deploy** click nothing runs; with it, it runs once; Run & Ship lists 5 steps.
  - **Real check after the merge (owner's go, this session):** press it once on this machine, then see a Deploy-to-Pages run with event `workflow_dispatch` succeed and Fetch back report `verdict=PASS`.
- **RESULT 2026-11-16: ✅ DONE (witness + real end-to-end), bim-ootb #3105 / PR #3106, merged `c41cdd78` by the CI bot (so it was itself the case being fixed).** `§X0_DEPLOY_W checks=10 failed=0 verdict=PASS` (a fake gh; exactly `workflow run deploy-pages.yml --ref main -R red1oon/bim-ootb`; the four refusals run nothing; no click, nothing runs). Red run on the old code: exit 1. `witness_x0_activate` commands 9 → 10 and Run & Ship steps 4 → 5, 30/30 PASS. **Real run on this machine, the same lib calls the buttons make:** Fetch back `live_sha=490fe3c2 main_sha=c41cdd788e5a match=N verdict=FAIL` (the bot merge had deployed nothing) → `deployMain` `§SHIP_DEPLOY started=Y … run=…/actions/runs/43789243952` → that run, event `workflow_dispatch` on `c41cdd78`: `completed success` → Fetch back `live_sha=c41cdd78 … match=Y … verdict=PASS`. Not exercised: the click inside a real VS Code window (the stub proves the wiring; the lib call is the same).
- **Guide:** `docs/DeveloperGuide.md` (Run & Ship section) says what a person needs to deploy from VS Code: write access to the repo, the GitHub CLI logged in on their machine (`gh auth login`), the X0 extension installed, then Fetch back → Deploy main now → Fetch back. No other key.

### F.28 F-19 built: hover, F12 and warnings for message keys and door verbs (owner "Go" 2026-11-16; spec 2026-11-16)
- **Decision F-19, owner 2026-11-16: *"Go"*** (in reply to the recommendation "yes, built after the message lane extracts `msg_keys.js`"). `common/door/msg_keys.js` was merged by the message lane (bim-ootb #3097, BIMCompiler #790, `VOCAB_MESSAGE_CATALOG.md` §5): `scan(text, file) → [{key, line, col, args, file}]`, `check(catalog, uses, opts) → [{kind, key, file, line, col, detail}]`, `shape(template) → {takes, bad}`.
- **Scope (measured on bim-ootb `main`, 2026-11-16):** the scanner's call pattern (`M('…'`, `.t('…'`) matches 6 files. Only 3 reference `msg_core`/`MsgCore`, and of those one is a test with deliberate bad fixtures (8 findings). The 3 that don't, `erp/processes/OrderLineCreate{Production,Shipment}.js` (another `.t(` API) and the scanner itself, would give 12 **false** findings. **So a file is a catalog user only if it references `msg_core` or `MsgCore`, is not under `tests/`, and is not `msg_keys.js`.** Today that is `common/door/words_core.js` (71 uses) and `common/door/red1.js` (2): 73 uses, 0 findings, which agrees with the message lane's own count.
- **Build (X0, dev-side only, nothing reaches a page):** `lib/catalog_index.js` (node). It reads the open folder's `common/door/vocab/messages.json` and `common/door/verbs.json` and uses the open folder's own `common/door/msg_keys.js`, so there is one scanner and no copy. It is re-read when a file's mtime changes, and it keeps each key's and verb's line in its JSON file.
  - **hover** on a key use: the key, the number of `{n}` values it takes (`shape`), `en`, and every field beside `en` as the catalog gains them (Student text, languages), plus a link to `messages.json:<line>`. An unknown key says *"not in the catalog: msg_core throws here when this line runs"*.
  - **hover** on a string literal that is a verb name (`'mis.lookup'`): title, harm, input names, and a link to `verbs.json:<line>`.
  - **F12** on either jumps to that line.
  - **Warnings** (one diagnostic collection, `x0-catalog`, refreshed on open and save, catalog users only): `unknown-key`, `arg-count`, `computed-key`, as `check` names them. `unused-key` and `template` are catalog-wide, so they stay with W-MSG-CATALOG.
  - The two paths are named once in `catalog_index.js` (until Part B's manifest declares them, ADVICE D).
- **Witness W-X0-CATALOG** (`tests/witness_x0_catalog.js`, node, through the shared stub on the real checkout, read-only):
  - C1 the denominator: every use in the catalog users (73 today) hovers to text equal to `messages.json`'s `en` for that key, read independently with `JSON.parse`. F12 lands on a line that holds `"<key>":`.
  - C2 every verb in `verbs.json` (its own count) found as a string literal in a temp file hovers to its title, and F12 lands on its `"verb":` line.
  - C3 RED (a temp copy of `red1.js` in a temp folder that mirrors the repo's paths): a made-up key gives exactly one `unknown-key` warning at that line, and an extra argument gives one `arg-count`. Unchanged files give 0. An `erp/processes` file gives no warning (the scope rule's red).
  - C4 the hover and definition counts in `witness_x0_activate` go 2 → 3 and 1 → 2, with nothing else changed.
  - Red run on the old code: no provider, so FAIL.
- **RESULT 2026-11-16, PR bim-ootb #3103 (Fixes #3101; merge state is in the STATUS row).** `§X0_CATALOG_W users=5 uses=73 hover_ok=73 def_ok=73 verbs=72 verb_hover_ok=72 verb_def_ok=72 checks=11 failed=0 verdict=PASS`. Red run on old code: FAIL (0/73, 0/72). **Two findings while building:** (1) the scope rule as specced ("references msg_core") also matched a COMMENT. Once `catalog_index.js` was tracked, its header's `M('key', …)` counted as a use and gave 3 false warnings (the witness caught it). The fix blanks comments with the repo's one tokenizer, `scripts/lib/js_scan.js` (`scan(src).code`, same length and lines), before both the rule and the scan, and a new check makes a key spelled in a comment give nothing. The rule now matches 5 files (`msg_core.js`, `extension.js` and `catalog_index.js` name it in code strings) and still only 73 uses, all in `words_core.js` + `red1.js`. The message lane's session had ended, so the note is in `prompts/VOCAB_MESSAGE_CATALOG.md` (2026-11-16 note at the end); M3 scans only those two files today. (2) `witness_x0_activate` caught a save handler that threw on a document without text, which in VS Code breaks the save listeners after it; it is guarded now. Pinned counts: definitions 1 → 2, hovers 2 → 3, save listeners 3 → 4.

### F.27 The § tag grammar drops everything after a hyphen (found 2026-11-16 by §F.26; a defect, no decision)
- **Issue proved:** `devtools/vscode/x0-navigator/lib/tag_index.js:14` `TAG_RE = /§[A-Z][A-Z0-9_]+/g` stops at `-`. So `§CRUD-PERSIST` is read as `§CRUD`, and the §TAG hover, the grey "last:" line (lens), *Context for this file* and the facts server all look up the wrong tag. Measured on bim-ootb `main` @ `234a6dc1`: **3,847 distinct hyphenated tags, 11,418 uses** in `.js` (`git grep -o -E "§[A-Z][A-Z0-9_]*(-[A-Z0-9_]+)+" -- '*.js'`). Found when §F.26's stub for `erp/model_pa.js` listed `§MODEL` for the line that prints `§MODEL-PA`.
- **Second gap, same grammar:** a tag that starts with a digit is not read at all: **50 distinct** such tags are printed in `console.log('§…` (`§4D_RECV` x7, `§4D_REAL_TASKS`, `§5D_SIDECAR` …). Section numbers (`§5.24`, `§4b`, `§12.3`) must stay non-tags, so the digit-first form needs an underscore.
- **Fix:** the ONE grammar, `TAG_RE = /§(?:[A-Z](?:[A-Z0-9_]+(?:-[A-Z0-9_]+)*|(?:-[A-Z0-9_]+)+)|[0-9]+[A-Z][A-Z0-9]*_[A-Z0-9_]+(?:-[A-Z0-9_]+)*)/g`. It allows hyphen-joined parts and keeps the 2-character minimum (`§W-EMPTY-POP` is read; a lone `§W` is not). A trailing `-` is not part of a tag. A digit-first tag is read only in the `§4D_X` form.
- **Witness:** a check added to `witness_x0_taghover.js` (§DEVTK_SPEC): `tagsInLine` reads `§CRUD-PERSIST`, `§W-EMPTY-POP`, `§4D_RECV` and `§MODEL-PA` whole, and gives none for `§F.24`, `§5.24`, `§4b`, `§4D`, `§W` or `§ x`. Red control: the old regex must fail that check. Before/after: the `tags=` count of `§DEVTK_SPEC` and the lens, context, activate and mcp verdicts, every change explained.
- **RESULT 2026-11-16: ✅ DONE (witness), bim-ootb #3098 / PR #3099, merged `2c6e65d4`.** `PASS tag grammar reads §CRUD-PERSIST §W-EMPTY-POP §4D_RECV §MODEL-PA §GOAL_STORE whole; nothing for §F.24 §5.24 §4b §4D §W § x` · `PASS red control: the old grammar … fails the same judge`. Before → after: `spec_tags` 4189 → 5437 and `printer_tags` 9708 → 13250 (truncated prefixes had folded many tags into one; digit-first tags were missing); Context's real file `viewer/schedule_gate.js` tags 9 → 10 (`§4D_BAND_MONOTONIC`, a tag CLAUDE.md itself names, is now read). lens, context, activate and mcp: PASS; their other diff lines are temp-fixture names and commit hashes only. **Not changed:** bim-compiler `scripts/code_arch/lens_precheck.js` and any other copy outside X0; check them before quoting a tag count from them.

### F.26 X0 "New witness for this file" (§F.21 OPEN; no decision needed, owner "Go" 2026-11-16; spec 2026-11-16)
- **Issue proved:** a new witness starts from a blank `witness` snippet, so the writer must look up by hand what the index already knows about the file: the spec its header cites, the `§` tags it prints with their last values, and the APP fields it writes. The archive's rule still holds: **never pre-fill tests from the file's functions** (that is a guess). Pre-fill only FACTS, and leave the claim, the population and the red control to a person.
- **Build (bim-ootb `devtools/vscode/x0-navigator`):**
  - `lib/witness_stub.js`, pure node. `make(root, rel, facts)` → `{ path, text }` or `{ refused: reason }`.
    - **Template:** ONE template, the `witness` body in `.vscode/witness.code-snippets`, read and expanded here. `${n:default}` gets the values below, `${RELATIVE_FILEPATH}` the new path, `$0` nothing. No second copy of the skeleton.
    - **Values:** NAME is `W-` plus the basename, upper-case, `_` → `-`. Spec is the first `prompts/…md §…` citation found in the file's own header (`file_context.headerOf`); with none, it says `NO SPEC in this file's header: write it first (Spec-First)` and does not invent one. The contract path is `witness_kit/contract` relative to the new file. ISSUE, POPULATION and RED CONTROL stay as the snippet's placeholder words.
    - **A comment block `FACTS FROM X0`:** the `§` tags the file prints, each with its spec (`tag_index`) and last value (`lens_index`), or the reason it is not shown; the APP fields it writes; and the line *"which witnesses already prove this file: not indexed yet (Part E)"*. All of it comes from `file_context.build(...).facts` and the same lookups, so there is nothing new to keep in sync.
    - **Where:** `<first folder>/tests/witness_<basename>.js`. If that exists, `_2`, `_3` … are added: **never overwrite**. A file already under a `tests/` folder, or not a `.js`, is refused with a reason.
  - `extension.js`: command `x0Navigator.newWitnessForFile` (*"X0 Navigator: New witness for this file (facts pre-filled; FAILs until you fill it)"*). It writes the file and opens it, and says why when refused. `package.json` lists it.
- **Witness W-X0-NEWWIT** (`tests/witness_x0_newwit.js`, node):
  - N1: for `erp/model_pa.js` (it prints `§GOAL_STORE`), the stub names the file and lists exactly the tags an independent regex finds in the file's `console.log('§…` literals. Its spec line equals the header's citation, or says NO SPEC.
  - N2: the generated file, run with the real `witness_kit`, exits non-zero and prints `population-nonempty` (it can never PASS unedited). Red control: the same file with ONE real row and a real red control filled in must PASS, proving the run can see a PASS.
  - N3: a second `make` while the first file exists gives `_2`, and the first file's bytes are unchanged.
  - N4: a file with no header gives NO SPEC, not an invented one. A `tests/` file and a `.json` are refused.
  - N5 (wiring, shared stub): `activate` registers the command (the count in `witness_x0_activate` goes 8 → 9). Running it on an active editor writes the file and opens it once.
  - Red run on the old code: no command, no lib, so N5 FAILs.
- **RESULT 2026-11-16: ✅ DONE (witness), bim-ootb #3096 / PR #3100, merged `9d4f81d6`.** `§X0_NEWWIT_W subject=erp/model_pa.js tags=2 spec=Y checks=12 failed=0 verdict=PASS`: tags `§MODEL-PA §GOAL_STORE` = the independent regex; spec `bim-ootb prompts/CAPEX_DASHBOARD.md §5.24`; the unedited stub exits 1 (population-nonempty) and a filled copy exits 0; the second run gives `_2` with the first file's bytes unchanged; refusals hold; through the stub, `§X0_NEWWIT file=erp/model_pa.js witness=erp/tests/witness_model_pa_2.js spec=Y tags=4`, opened once. Red run on old code: 3 FAIL, exit 1. `witness_x0_activate` commands 8 → 9. **Found on the way:** the § grammar defect, §F.27.

## ADVICE — from the session that built Part F, for the owner and the sessions that follow (2026-11-14)

Owner: *"Put in your advice as you know VSC and software better"*. **These are recommendations, not decisions.** A decision is only
what the owner answers; when he says "follow the advice" on an item, record that as his answer in that part's DECISIONS block.

**A. What to answer on each open decision, and why.**

| Decision | Advice | Why |
|---|---|---|
| A-2 one source for "now" | Extend the login context; the transaction's `env` and the genesis env become views of it | legacy has one context; a fourth object would have no twin |
| A-3 no date injected | The edge records the session's LOCAL calendar day, the instant and the timezone offset in `SESSION_START`; core never falls back | it is the same fix bim-ootb #2996 needs: today the headless kernel dates by the UTC day |
| A-4 timing reads | Route them through `Env.elapsed()` | the purity check stays a plain ban on calls, with no judgement about "does this result feed the answer" |
| B-1 `?v=` numbers or content hashes | Content hashes, but as its own announced step | nobody bumps by hand again and a stale file becomes impossible; the price is one full re-download for every user, so do it once, on a quiet day |
| B-2 lazy and precache rule | Keep today's per-app rules; write them in the manifest | changing load behaviour and introducing the manifest in one step hides which one broke something |
| B-3 owner and witnesses in the manifest | Yes | parts D and E then get their data for free, and three F rows unblock at once |
| B-4 ERP plugin lists | Derive only the precache entries; leave the host's one list alone | B must not become a second plugin registry |
| C-2 rename `A` to `APP` while moving | Yes, one module per PR | it removes the whole class of index faults that §F.17 found: the index has to GUESS which local name is the shared object |
| D-2 a namespace extended by several files | Allowed when the manifest marks it | forbidding it would force a refactor nobody asked for |
| E-2 keep the suite's verdicts | Yes, a small JSON per run, stamped like any log | the proof map can then show "last verdict" under the same provenance rule as values beside the code |
| F-1 headless step in Fetch back | No by default; a separate button the owner presses | a browser run beside a live bake has crashed tabs; HTTP + version + commit already caught both real deploy faults |
| F-2 budgets | Do not pick numbers. Print "Cost if deployed" in every PR for two weeks, then set each ceiling at the observed level plus a small margin | a guessed budget is either ignored or blocks honest work |
| F-7 hosted preview per PR | None for now | *Run local* on the PR branch is the preview; a host is a new thing to keep alive |

**B. The order I would work in.** B0 next, in parallel with the A decisions. The manifest (part B) is the highest-value step left: it
removes the hand-kept lists that cause the stale-file bugs (P2), and it is what four of F's unbuilt rows wait for. In part A, build A1 (the
Env) and A3 (the purity check with its red control) early, then let A2 (moving each file's clock reads) run as a long tail, a file at a
time when someone is in that file anyway. A0 showed nothing is broken, so A2 is not urgent. Part C last, as written.

**C. Three small things worth doing soon (none needs a decision; each is one PR).**
1. ✅ 2026-11-16 (§F.24, #3090: isolation, lens, appdef; deploy_cost + context need VS Code's TypeScript) **Put the node-only X0 witnesses into CI's fast checks**, `witness_x0_appdef.js` first. CI passed two changes that broke `main`'s own
   witnesses (archive §F.16, §F.19 "caught before the PR" was luck the second time). They need no browser and run in seconds.
2. ✅ 2026-11-16 (§F.25, #3092, as a content hash, not the version) **Stamp the extension's version at pack time.** `package.json` says `0.1.0` for every build, so an installed copy cannot tell that it is
   stale after a pull. Let `pack.js` write the commit into the version (or a visible "built from" line in a command's output).
3. ✅ 2026-11-16 (correction comments: bim-ootb #2974 issuecomment-6903656757, #2975 issuecomment-6903657121) **Fix the two stale GitHub texts** (bim-ootb issue #2974, PR #2975: "138" should read 130) with a comment, not an edit of history.

**D. How to keep the editor tooling healthy (the rules that made it trustworthy).**
- **It never guesses.** Every answer is a lookup in something the repo generated, or a named reason why there is none. A new feature that
  cannot say "I do not know" is not ready.
- **No knowledge of the codebase in the extension.** If a feature needs to read one file by name, the missing piece is a generated
  declaration (usually the manifest), not an exception in the extension.
- **One implementation per rule.** The bump rule is `lib/ship.js`; the stamp proof is `lib/lens_index.js`; the index is
  `scripts/gen_app_surface.js`. Extend the owner; do not write a second one next to it.
- **Three levels of proof, in this order:** the lib function on a fixture with a red control → the registered provider through the stub →
  the real editor (`tests/realvsc/`). The real-editor run found faults the first two could not (archive §F.10, §F.17, §F.18).
- **Text patterns have a ceiling.** The index's binding gate was widened twice and still leaves 11 fields unsure. The next widening should
  be the parser (which name holds the shared object), not a fifth pattern.
- **Keep it quiet.** One warning per real rule, one grey line only where a value is proven. A tool that shows something on every line is
  switched off within a week.
- **Plain JavaScript, no dependencies, nothing a page loads.** `§X0_ISOLATION … deps=0` is the check; keep it green.

**E. For a session that is not Fable.** Take ONE row of the RESUME table per session. Read its section in the archive first. Write the
spec lines, then the witness with its red control, then the code. Quote only `§` lines you have just produced. When a check fails,
suspect the instrument before the product (it was the instrument about half the time here). When unsure whether something is yours to
change (an ERP file, the film and camera family), file the issue and leave the code.

---

## §ORDER — why A → B → D → E → F → C

A is the only part tied to correctness (replay, posting dates), and A0 is cheap and settles a real question. B removes a whole class of stale-file
mistakes and is the data source for D, E and half of F. D and E are small once B exists. F's first features need nothing. **Owner, 2026-11-13: they go
first, as §F.4, the next session's bounded task**; A0 runs in parallel if a second session is free. C is long and best done slowly, module by module, after B/D make ownership visible.

## §READY — what a session can start with no owner decision (as of 2026-11-16)

| Part | Starts with no decision | Next decision to ask | Why that one |
|---|---|---|---|
| A | ✅ done 2026-11-17 (W-CORE-PURE in CI) | none | — |
| B | B0 ✅ done 2026-11-17; B-1 answered 2026-11-18 (hashes, own step) | B-2 lazy + precache rule | B1 writes each module's precache flag; B0 measured that the viewer has no single rule today (B0 RESULT, `§MANIFEST_LAZY_PRECACHE`) |
| C | nothing; waits on B and D | C-1 part names + owners | |
| D | nothing new; the multi-publisher list already exists (`types/globals.gen.d.ts`) | D-1 where the questions list lives | needs B's `owner` field |
| E | `witness_kit/paths.js` (no behaviour change; witness: the same suite verdicts before and after) | E-1 the `PROVES:` header format | |
| F | nothing left without a decision (ADVICE C, §F.26, F-19 ✅ 2026-11-16) | F-1, F-2, F-7 | F-18 ✅ 2026-11-15; F-19 follows the CLI + message lanes (2026-11-16) |

Ask the owner **one decision per message, with the recommendation** (START HERE 2). The recommendations are in each part and in ADVICE A.

## §M — re-measure before quoting

| Number | Command (bim-ootb root) |
|---|---|
| APP fields / phantoms | `node scripts/gen_app_surface.js` → header of `internal/APP_SURFACE.md` |
| script tags per page | `grep -cE '<script[^>]+src=' viewer/viewer.html erp/idempiere.html modeller/modeller.html` |
| dev side vs deployed side (DeveloperGuide §0.1 diagram) | `bash <bim-compiler>/scripts/code_arch/size_stack.sh <bim-ootb tree>` → `§STACK_SIZE` lines. @`9b7d2f86` 2026-11-16: app_js 1,004 / 313,887 lines · witness_js 2,112 / 284,795 · witness_named 1,403 · precache viewer 268 / erp 403 / modeller 157, tests 0. Shipped-JS bytes: the deploy log's `§PAYLOAD-MIN-TOTAL` (`gh run view <id> --log`) |
| module lists per app (sites, versions that disagree, lazy vs precache) | `node scripts/gen_manifest.js --check` → `§MANIFEST_*` lines (2 s); the witness: `node scripts/tests/witness_manifest_roundtrip.js` (~1 min) |
| core purity (A-1 list) | `node erp/tests/witness_core_pure.js` → `§CORE_PURE files= forbidden= verdict=` (2026-11-17: 125 / 0 / PASS) |
| clock/random/network calls | `node <bim-compiler>/scripts/code_arch/clock_probe.js <bim-ootb root> [pathspec …]` (committed 2026-11-13, #602; espree AST, comments never count; needs bim-ootb `node_modules`). Baseline @`a7c329e5`: default `erp/*.js` → `files=301 with_calls=58 calls=160`; the A-1 core pathspecs (`'erp/processes/*.js' 'erp/callouts/*.js' erp/ad_callout.js erp/doc_poster.js 'erp/model_*.js' erp/rule_fold.js erp/crud_core.js erp/kernel_ops.js`) → `112 / 19 / 32` (7 of them in `kernel_ops.js`); the viewer/4D set (`viewer/cpm_schedule.js 'viewer/schedule_*.js' viewer/tm_core.js common/room_graph.js`) → `11 / 7 / 32`. A3's W-CORE-PURE ports this probe into bim-ootb |
| printed `§TAG`s found in saved logs; logs with a code stamp (§F.6) | `node <bim-compiler>/scripts/code_arch/lens_precheck.js [<bim-ootb root>] [<bim-compiler root>]` (read-only, ~1 min; needs bim-ootb `node_modules` for espree) |
| UMD globals F12 can follow | `node scripts/tests/witness_global_types.js` |
| multi-publisher globals | header of `types/globals.gen.d.ts` (`node scripts/gen_global_types.js`) |
| witnesses per folder | `git ls-files \| grep -E 'witness[^/]*\.js$' \| awk -F/ '{print (NF>2)? $1"/"$2 : $1}' \| sort \| uniq -c \| sort -rn` (the first draft's `cut -d/ -f1-2` splits top-level `witness/` into one line per file) |
| ES-module files | `git ls-files '*.mjs' \| grep -cE '^(erp\|capex)/'` (53) |
| home-folder paths | `git ls-files -z \| xargs -0 grep -l "$HOME" \| wc -l` (665; slow on this tree) |
| live version | `curl -s https://red1oon.github.io/bim-ootb/erp/version.json` (`sha`, `build`) and each app's `sw.js` `CACHE_VERSION` |

## Relation to other files

- `prompts/REFACTOR_FOR_READERS.md`: the small, readability-only items. Items 4 and 6 are absorbed by part C, item 3 by D, items 7 and 8 by E.
  Items 1, 2 and 5 stay there.
- `prompts/BACKEND_SUBSTRATE_LANE.md`: owns determinism. Part A runs under its rules.
- bim-ootb `prompts/DEV_TOOLKIT_NO_AI.md`: owns the runtime-debugging extensions. Part F adds X0 Navigator on top.
- `docs/DeveloperGuide.md`: update §1 (patterns) and §5 (change flow) as each part lands.
- `prompts/WITNESS_INTERFACE_FRAMEWORK.md` + bim-ootb `witness_kit/contract.js`: own the witness contract. Part E builds on them.
- `prompts/4D_MODEL_INTEGRITY.md` §I: owns the 4D questions. Part A moves 4D files only under it, and part D folds it in rather than redoing it.
- bim-ootb `.github/workflows/deploy-pages.yml` + `scripts/minify_pages.js`: the real deploy (minified artifact). Parts B and F measure against it.
- `prompts/archive/CODE_ARCHITECTURE_DESIGN_full_history_2026-11-13_to_2026-11-14.md`: this file before it was cut down. Every §F.n
  section, the §VET pass and all owner exchanges in full.

## STATUS (2026-11-16; the RESUME block above is current)

| Part | What | State |
|---|---|---|
| A | pure core + Env | **A0 ✅** · **A-1..A-5 ✅** · **A1 ✅** (#3007) · **A2** done for 15 files (#3010 #3013 #3016 #3021 #3026 #3030 #3033) + A2-TIMING-1 (#3110) + A-6 / A2-TIMING-2 (#3122) + A2-TIMING-3 (bim-ootb #3124) + A2-VALUE-1 (#3135) + A2-EDGE-2 (#3140) + A2-PIPO (#3143): **A2 complete** · **A3 ✅** A3-CLOCK-1 (#3149), A3-CLOCK-2 (#3168), W-CORE-PURE (#3181, in CI): **PART A DONE 2026-11-17** |
| B | manifest per app | **B0 ✅** (#3200: `scripts/gen_manifest.js --check`, W-MANIFEST-ROUNDTRIP in CI) · open: B-1 to B-5 |
| C | named APP parts | not started · open: C-1, C-2 |
| D | owner table | not started · open: D-1, D-2 |
| E | proof map | not started · `paths.js` ready · open: E-1, E-2 |
| F | VS Code extension + facts server + the hovers | every unblocked row built (§F index) · §F.21 BIM trace + hover (#3043 #3047) · §F.22 ERP hover (#3055 #3057 #3059) · F-16 parity gate (#3050) · §F.23 BIM layered hover (#3064 #3069) · §F.24 X0 in CI (#3090) · §F.25 stale-copy stamp (#3092) · §F.26 New witness (#3100) · §F.27 tag grammar (#3099) · §F.28 F-19 catalog hover (#3103) · next: the X0 "New witness" command · open: F-19 (RESUME 0b), F-1, F-2, F-7, the F-12 step 2 token |

**§VET** (the 2026-11-13 vetting pass of every claim in this file) is in the archive.
