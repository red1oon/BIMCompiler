# ⚠ DO NOT REMOVE
Scope: **SPEC and phase ledger** for ONE vocabulary the CLI and the guides both read: a keyed message catalog and a help catalog over the Application Dictionary, with a short/long level and a locale. Read the log after every run (exit code is not evidence). Spec first, witness with a falsifier next, code last; honour until this file is marked DONE.
Background, measurements and prior art are in `prompts/DOCS_I18N.md` §4b-§4d (owner ideas of 2026-11-16: shared vocabulary for CLI and guides, a `Student` level = the long text, reuse the legacy element/message model, remove the copied Help). This file owns the BUILD; that file keeps the findings.

## ▶▶▶ RESUME HERE (trigger: "resume Help", formerly "resume message"; read the ▶▶ 2026-11-24 CLOSE block first)
**▶▶▶ 2026-11-24 LATER (read first): §19.21 SPEC, the help PEEKS AHEAD** (owner: on `?`, check the document on screen, mark the fields red, list every blocker, match Business Central, fix where the data gives one value). It **supersedes items 2 and 3 below**; item 1 (guide) now describes the peek (S4). Owner decided: easiest value + undo (Back-Date → today); legacy links at record level only (see §19.21 OWNER DECISIONS). **S1 + S2 BUILT** (§19.21 S1 / S2 RESULT, bim-ootb #3433 #3435 #3437). Next = S3 (background check), then S4 (guide + film v3).

**▶▶ 2026-11-24 CLOSE — FILM v3 BRIEF (read first; supersedes the v2 lines below). Owner decisions, verbatim where quoted:**
- **Why v2/v2b are hard to follow (owner):** they show OUR WORKINGS (a code line typed, a run log, ticks, sales vs purchase) instead of what the user gets. *"Show what it does, not what happens internally."* The ticks / recorded runs are internal testing: *"it is admin report card just show once. It is not part of the show"*.
- **THE WAY TO EXPLAIN (owner: "See? Now it is clear... that is the way to explain work"):** the SAME screen twice, quoted from the real page: **Now** = legacy's Sales Order How To panel shows only its tab text *"Order · Order Header · The Order Header Tab defines the parameters of an Order. Changing the Organization, Business Partner, Warehouse, Date Promised, etc. changes these values on all the lines."* (AD_Tab 186, read from the pilot) · **Ours** = the same text first, then: Before you start (each a link), Do it, What Complete does (per order type), the reasons Complete can stop (legacy's own words), a link to the guide section. Legacy's Context Help has NOTHING about Period Closed (checked: AD_CtxHelpMsg, AD_Tab 186, AD_Window 143).
- **The opening card (owner: "1. What is now. 2 What is added 3. What Kernel has more. Technicalities leave to the credits cards"):** 1 Now: iDempiere ships 1 help topic · 2 Added: 130 help topics, one for every core window (incl. the reasons Complete can stop, listed in advance: ADDED content, it reaches legacy by the script too) · 3 Kernel ERP has more: click a window name in the help to open it; ask "How do I…?" and get the window and action; the same at the command line. One plain spoken sentence over it. **No comparison table.**
- **Last card (house style, owner: "with prior art reference and credentials as always advised"):** prior art READ (iDempiere HelpController.renderCtxHelp / MCtxHelpMsg; the DocAction classes MOrder / MInOut / MInvoice …; the help-pattern survey in §4d / §19 tables, re-checked before printing), credentials (bim-ootb #3412 #3415 #3416 #3421 + witness verdicts from the build log), the technicalities (rows only, no code; 126 tabs + 4 processes; how it was tested, ONCE), key-sound credit, the live guide link.
- **v3 beats (proposed, owner OK needed before recording):** cover · the 1/2/3 card · Sales Order Now vs Ours (same panel twice) · follow a window link (Business Partner, then Shipment) · the guide link opens the same section online · ask a question (typed, real keys) · Purchase Order · the same help inside real iDempiere (apply, shoot, remove, witnessed) · admin report card (tested, once, silent) · last card. DROPPED: the code-line / run-log typing, all tick talk, the stale "twenty-five" (live count 21 after #3421).
- **PENDING CONTENT to finish BEFORE the cut (next session, in order):**
  1. **A guide section** describing this panel (Now vs Ours) in the ERP user guide, published via `scripts/safe_gh_deploy.sh`: the guide-link house rule needs a live page (none describes the panel today).
  2. **The stop-reasons part becomes a "Make sure" list (owner 2026-11-24, settled):** *"'When it refuses' is erroneous statement. It is concrete. Be abstract. iDempiere does not give info on ... we do"* · *"Isn't that the right way guides are done? Give the principle first. And need not even say 'not complete'"* · *"Now isn't that much clearer?"*. **Principle: a guide tells you what must be in place before you act.** The panel says **"Make sure:"** then the conditions, e.g. *the period is open · each product is on the price list · the customer is within their credit · the order has lines*; no "refuses", no "not complete". Each check is our wording of one legacy message (the message stays the trace; ask the owner ONCE whether it is also shown in small print beside the check, e.g. "the period is open (*Period Closed*)"). Only messages a user can act on become checks; internal faults ("Could not create Shipment Line", "Error calculating tax") are left out. The film / card statement: *"iDempiere does not tell you this in advance; Kernel ERP does."* Build in `build_help_pack.js` (a reviewed table message key -> check wording, each row citing its AD_Message / source line), rebuild, witnesses (D2c judges the checks against that table), bump.
  3. **Fix tips under the stop reasons: owner's word needed, NOT in v3 unless asked.** Possible without inventing: only reasons a user can fix, each pointing to the window that fixes it, read from the check before the message in legacy's code (Period Closed -> the period window; Product not on Price List -> Price List). Internal faults get none.
  4. **A guide link on EVERY topic (owner 2026-11-24: "Yes, add to pending list"; branding toward legacy users):** today only the 8 topics cut at the 2000 limit end with a "…" link to our guide (16 links over 2 languages on the pilot, W-CTXHELP-LEGACY L7); the other 122 carry none. Build: every topic ends with one line "More, and questions: Kernel ERP User Guide →" to the guide section of step 1 (the window's own section when one exists); witnesses + legacy script + bump.
  5. **A feedback box on every guide page (owner: "Need no counter. Allow anon readers. Feedback is good enough option"):** keep the mkdocs Material guide on GitHub Pages (the help text is extracted from it and witnessed; a wiki would let edits drift from the in-app help, and needs a server); turn ON GitHub Discussions on red1oon/BIMCompiler (off today) and add **giscus** (MIT, static, no server) to the theme: anyone reads the threads, posting needs a GitHub login. **No visit counter / analytics.** Publish via `scripts/safe_gh_deploy.sh` only.
  6. **Language throughout (owner 2026-11-24: *"make language thruout be as clear. State principles and abstract terms before giving concrete examples. Spare the technicalities"*):** review EVERY part of the derived topics (Before you start, Do it, What Complete does, the Make sure list), the guide page and the v3 narration: each part opens with its principle in plain words, then the concrete items; no internal terms (DocAction, subtype codes, table names, ticks). Same rule as the memory note on explaining work.
  7. Then the storyboard v3 for the owner's OK, then record (pipeline `scripts/film_ctxhelp_derived/`, `insert_card.js` pattern for stills).
- **Left from this session:** the legacy pilot server still shows our Shipment text from legacy's cache (MCtxHelpMsg.java:51) until a restart (owner's call; DB clean 1/0/0). v2 and v2b films kept in ~/Videos.

**▶ 2026-11-24 FILM v2 MADE (read first):** `~/Videos/Knowledge_CMS_ERP_EN_AFTER_2026-11-24_v2.mp4` (§19.20 RESULT). Open: the pilot server still shows our Shipment text from legacy's cache until a restart (owner's call); a guide page for the panel; the owner's notes on v2.

**▶ 2026-11-23 FILM v2 (read first):** §19.20 storyboard v2 "Read from legacy's own code" written; record only on the owner's OK (beat 8 needs the owner's word again: apply, shoot, remove on the shared pilot). Pipeline = v1's `scripts/film_ctxhelp_cms/` copied. The standard Purchase Order line is done (#3416).

**▶ 2026-11-23 FULL PASS (read first):** every core window has a derived topic (bim-ootb #3415, §19.19 FULL PASS RESULT). **Next (owner's call):** (1) a standard Purchase Order line (its reserveStock path, not yet cited); (2) proofs for the effects still without ✓ (needs scenarios on the purchase side and for confirmations); (3) the VS Code link idea (noted only); (4) translations stay frozen.

**▶ 2026-11-23 PILOT BUILT (read first):** §19.19 AMENDED (owner: legacy's DocAction source is the rule source, the run is the proof) and the PILOT built: Sales Order + Payment Term topics, W-CTXHELP-DERIVED 7 PASS + D6 INCONCLUSIVE until this file's sibling commit (`§SCN_META` in scripts/bridge) is on master, 6 reds FAIL as claimed. bim-ootb #3412 (merged, erp sw v1130). **Next:** the other document classes (each its own cited effects, never "the rest"), §SCN_META for the other corpora, then the setup windows; the VS Code link idea is noted only (owner: don't prep yet).

**▶ 2026-11-23 NEW SOURCE (owner: *"I can't look into wiki now. Better infer or think anew from own research and learning to design content thereof"*):** the wiki item is set aside. **§19.19 SPEC** written: a four-part topic per core window (before you start / do it / what Complete does / when it refuses), from `ad_seed.db` and legacy's own `§SCN_DETAIL` results in the parallel-run log, MATCH scenarios only. Measured: 15 of 124 core windows have a topic today. **Next: the pilot (Sales Order + Price List) once the owner says go.**

**▶ 2026-11-23 LICENCE DECIDED (owner, verbatim):** *"I as among the founders of ADempiere and iDempiere, have determined that we are fiercely open source and accepted CC 3.0 at least. Perhaps that notice has gone obscured, but sufficient to cite source from the iDempiere project and contributors"*. **Rule from this:** wiki text copied in is CC 3.0 (attribution), cited per topic as *"Source: iDempiere project and contributors, <wiki page URL>"* (in AD_CtxHelp.Description or the message), kept apart from our MIT text. Item 1 is ✅ DONE. **Item 2 (measure HOW-TO pages against `ManPageW_*`) is ⛔ BLOCKED on access, not licence:** wiki.idempiere.org still returns 403 to this machine, `api.php` included (2026-11-23, plain curl with an honest agent string; no spoofing), and no public dump or mirror exists (web search). It needs one of: the page list from Special:AllPages saved by the owner from a browser, a Special:Export XML of the candidate pages, or a dump from the wiki's maintainers.

**▶ 2026-11-22 resume check (later session):** #3398 F6.2 is MERGED (verified, 11:28Z). Next item 1 is **⛔ BLOCKED: the owner reads the licence line at the foot of any wiki.idempiere.org page ("Content is available under …") and gives the exact variant.** Two web searches found no footer text. They did turn up: the wiki's extensions (WikiMarkdown, Slack Notifications) are MIT, the software is GPLv2+, and Wikipedia's iDempiere article is CC BY-SA, and none of these is the wiki's content licence. Item 2 (count real HOW-TO pages against `ManPageW_*`) also needs the wiki itself, so it waits on the same answer. No direct fetch was tried again (403 is recorded below). The lane is at zero until the owner answers or sends notes on film v1.

**▶ 2026-11-22 CLOSE (read this first; the lines below it are the day's history):**
- **DONE today, all merged unless noted:** F4 the panel follows the tab / process / Home (#3380) · F2 the tab's own legacy text first (#3384) · F7 every message fits MsgText's 2000 with a guide link (#3387) · F6 the legacy migration script `erp/legacy/` (#3388) · F6.1 no dead links in it + README links (#3391) · F6.2 the guide-link label names the section (#3398, auto-merge on: **verify it merged**) · §19.18 film v1 made (`~/Videos/Knowledge_CMS_ERP_EN_AFTER_2026-11-22_v1.mp4`, 165 s, scripts `scripts/film_ctxhelp_cms/`). Witnesses: W-CTXHELP-OVERLAY 9 claims (K1-K11), W-CTXHELP-LEGACY 7/0 (L1-L7, on the pilot, rolled back).
- **Owner, 2026-11-22 (verbatim):** *"iDempiere's wiki is Creative Commons. if it is not really lots of extra content, then wrap up, so future session can follow up"*.
- **NEXT (in order):**
  1. **Legacy's wiki as a content source.** Licence: Creative Commons per the owner; **confirm the exact variant** (BY, BY-SA, BY-NC…) from the wiki's footer, read in a real browser by the owner or a route that is not blocked (wiki.idempiere.org answers automated fetches with 403; an archive fetch was refused by this session's permissions: do not work around it). A share-alike variant means the copied text keeps that licence and its attribution, so record per topic its page URL + licence in AD_CtxHelp.Description or the message, and never mix it into MIT text silently.
  2. **Measure before writing anything:** how many wiki pages are real HOW-TO for a core window (trade cycle + accounting) versus the generated `ManPageW_*` pages (those repeat the dictionary text the panel already shows first, F2: no gain). Owner's condition: only worth a step if it is "lots of extra content"; otherwise leave it.
  3. The owner's notes on film v1 (none yet).
  4. Nothing else is open in this lane. Our own guides are used whole (a survey of 8 more guides, 163 sections, found no core how-to). docs.idempiere.org states no licence ("Copyright © 2026 iDempiere" only).
- **Environment left running:** docker `postgres` and the legacy pilot (:8088, `~/idempiere-pilot/start.sh`); the pilot is verified back to its snapshot (1 help, 0 links) after every legacy run.

**▶ 2026-11-22 film:** **§19.18 FILM MADE** (`~/Videos/Knowledge_CMS_ERP_EN_AFTER_2026-11-22_v1.mp4`, 165 s, K2 + captions PASS, legacy pilot restored). Both defects named in §19.18 RESULT are FIXED (F6.1 #3391, F6.2 #3398). Next: the owner's notes on v1; more topics need a source. More topics: our guides are exhausted, legacy's docs have no licence (owner's word needed).
**▶ 2026-11-22 latest:** **F6 BUILT** (bim-ootb #3388): the legacy migration script, W-CTXHELP-LEGACY 6/0 on the pilot DB. F2, F4, F5, F6, F7 done. **Next:** more English topics (Sonnet agents allowed, owner 2026-11-19), then the film for legacy users (zh_CN, de_DE, es_ES); it can now show the SAME topics inside real iDempiere.
**▶ 2026-11-22 later:** **F7 BUILT** (bim-ootb #3387, 2000-char fit with a guide link). **F6 ANSWERED** (copy the site's own text in, at apply time): build it next, its SPEC + measured facts under §19.17.
**▶ 2026-11-22 late:** **F2 BUILT** (bim-ootb #3384): the record's own text first, then our message (owner "go F2"). **F6 DECIDED** (owner): our content offered to legacy users as a migration script in our GitHub, legacy's core untouched; F6 SPEC written under §19.17, its one owner question asked in the session (record the answer there).
**▶ 2026-11-22 (read first):** **F4 BUILT (bim-ootb #3380, F4 RESULT under §19.17):** the How To panel follows the selected tab, a menu process and Home, as legacy's renderCtxHelp; a tab with no help shows its own Name / Description / Help (translated from AD_Tab_Trl). W-CTXHELP-OVERLAY 8/0 (K10 89/89 en + de). **Next:** F2 needs the owner's word (dictionary Help shown together WITH our message); otherwise more English topics (Sonnet agents allowed, owner 2026-11-19), then the film for legacy users (zh_CN, de_DE, es_ES).
**▶ 2026-11-19 (read first):** §19.12 closed (#3301). §19.14 built (bim-ootb #3324): forms, workflows, info windows, tasks in the help box; the menu hides F / I entries the role cannot open. **Owner chose step 3 = legacy's context-help tables in the ERP DB (§19.15), shape rule: "same shape as legacy, extend only kernel-side".** Spec = §19.16 C1-C5. **C1 BUILT 2026-11-19 (#3336), C2 BUILT 2026-11-19 (#3338, C2 RESULT: our 4 how-tos as AD_CtxHelp T + AD_CtxHelpMsg, linked from each window's first tab, in a second generated file `erp/ad_ctxhelp_app_rows.js` written by `build_help_pack.js`). C3 BUILT 2026-11-19 (#3340, C3 RESULT: translations in `ad_ctxhelpmsg_trl`, published first, machine XML; title = MsgText's first paragraph). C4 BUILT 2026-11-19 (#3343, C4 RESULT). **F5 BUILT 2026-11-20 (bim-ootb #3371, F5 RESULT under §19.17: the first-setup guide at TAB level, 20 sections in 17 helps on 21 tabs / processes).** **C5 BUILT 2026-11-20 (bim-ootb #3374, C5 RESULT in §19.16).** Next = F4 (the panel follows the selected TAB), F2 (owner word needed: dictionary Help first in the twin's panel), then **§19.17 F1-F4 (fill the 8 standard-flow topics; Sonnet agents may add more topics, owner 2026-11-19) and the film for legacy users (language beat: zh_CN, de_DE, es_ES; no Japanese, no French)**. Item 8 is DONE; the BIM-side and Korean field gaps stay in `TRL_TRILOGY_STANDARD.md`.
**▶ STATE (read first):** §19.11 step 1 (#3281) and step 2 pt_BR + id_ID (#3283, `ea604d7a`, erp sw v1107) are MERGED: the ERP has 11 screen + help languages. Korean: no published pack is reachable (channels searched, §19.11 step 2). **Owner decisions 2026-11-18 (§19.13):** legacy's translation XML is the project's one format, AI rows sit in a lowest-priority `machine/` folder, and the 18 come first. The cross-app work (Viewer + Modeller in the same shape, a TERMINOLOGY category, one language choice across the Trilogy, and the ERP's own strings + the rest of the 18) is now its own lane: **`prompts/TRL_TRILOGY_STANDARD.md`** (T1-T5, run by an agent). Left HERE: step 3 is folded into that file's T5; item 8 part 2 (forms/workflows/info/tasks); §19.12 (Modeller `b-lodup`).
**Start:** (1) read this block; (2) `git fetch origin` in `~/bim-compiler` and `~/bim-ootb` (ff-only, clean tree) and `git worktree list` BEFORE any `git worktree add`; (3) say in one line what you will do; spec before code, a witness with a falsifier, read the log not the exit code.
**State (all MERGED, each with a §-RESULT in this file):**
- **The one query core is COMPLETE** (§18 design `prompts/HELP_QUERY_CORE_DESIGN.md`, §19.1-§19.6): grammar #3189, core + ERP index #3192, ERP box + `erp.ask` #3197, Viewer/Modeller panels #3203, Did-you-mean #3211, `#<number>`/New/GlobalId #3212. Witnesses: W-PREFIX, W-HQ-GENERIC/SELF/WORDS/BM25/RANK-TWIN/COST/LEGACY-SUPERSET/BOX/DYM/DOC/NEW/GUID, H-SUPERSET.
- **Viewer i18n 0 leaks in all 18 locales** (§14.8 #3190, §14.8.1 #3193): `§W-VIEWER-I18N PASS 91/0`.
- Owner decisions 2026-11-17: Q1 `#` for documents (legacy `/` only in a GlobalSearch port); Q2 superseded → `#` + GlobalId prefix in the BIM apps; Q3 default Thai after packed languages; **films EN only, other languages ad hoc on request** (item 5 closed).
**Open, advised order:**
1. ~~"Table" ranking~~ **DONE 2026-11-18** (owner "agree" to (b); §19.7 RESULT, bim-ootb #3233): legacy's label order inside tiers 1 and 2, alias-only hits after; first window = legacy's on 1,800 of 1,800 starts-with probes (was 951).
2. ~~Hand to the ERP parity lane~~ **DONE 2026-11-18**: written into `ERP_IDEMPIERE_UX_PARITY.md` ▶ START HERE, Open not blocked (toolbar New ignores `winSet[w].rw`; the seed grants every role read-write).
3. ~~Waiting on the CLI session~~ **DONE 2026-11-18**: §42 S3 landed (bim-ootb #3240), and the guard was removed (§19.8 RESULT, #3257): 184 of 184 short names are offered again, with no flood. Still the CLI session's own: the shell side of `#` (§41).
4. Thai help pack (Q3 default): **now §19.11 step 1** (a Thai source IS pinned for the screen, `x_th_TH.350`; only the help builder's own 4-language copy of the list left it out). Old text: when a Thai ERP help pack exists (`erp/i18n/help/` has de fr ja zh + en). ~~The §19.3 caveat (processes hidden)~~ **DONE 2026-11-18** (§19.9 RESULT, bim-ootb #3263).
7. ~~W-FIELD-HELP red on main~~ **DONE 2026-11-18** (§7.1 RESULT, bim-ootb #3264): the witness's oracle read the purchase window's field for a sales window (a seqno tie). Fixed in the witness, 14/0; the page was right.
8. **From §19.9:** ~~process names into the help packs~~ **DONE 2026-11-18** (§19.10 RESULT, bim-ootb #3275 merged; the ERP index also ships its header only, owner's choice). ~~Tell the CLI session about `processIds`~~ **DONE** (a note at the top of `CLI_ERP_IVR.md` RESUME HERE). **Left:** record kinds for forms (24), workflows (12), info windows (4), tasks (3). The twin's menu opens forms (`openAdForm`) but only prints a status line for F/I/T (`idempiere.html` renderNode), so the box can list those three but not open them until the parity lane makes the menu open them.
9. **NEW 2026-11-18, §19.11 (owner: every legacy pack inside the 18):** step 1 = one source list, so help packs come for all 8 screen languages (Thai = item 4's default). Step 2 = fetch ko_KR, pt_BR, id_ID. Step 3 = our own content in legacy's per-table shape.
10. **NEW 2026-11-18, §19.12:** W-HELP-SUPERSET H4 red on main, the Modeller's `b-lodup` button has no help record (since #3238); a rebuild does not fix it.
5. ~~Modeller guide PARAGRAPHS~~ **CLOSED 2026-11-18, skipped** (owner "agree"). ~~§14.5 drag-witness gap~~ **DONE 2026-11-18** (§14.5.3 RESULT, bim-ootb #3246): W-DRAG-SWEEP 12 of 12 judged callers drag; it found and fixed 2 drag defects (a translated panel jumped, the Sunglass panel never dragged).
6. ~~Witness defect named in §14.8 RESULT~~ **DONE 2026-11-18** (§14.8.2 RESULT, bim-ootb #3220): the contract's lines now reach the witness's own .log via `run(sink)`; the 25 bare callers and the W-ERP-I18N failures on main are handed to their lanes.
**Lesson (2026-11-18), (a) broken again:** §19.3 gave the owner a legacy example ("Table and Column first") that was never checked against legacy's comparator or the role's menu. Before an owner's call, run the legacy rule (`HelpQuery.legacyFilter`) on the example first.
**Lessons (2026-11-17):** (a) a spec premise stated to the owner must be checked in the DATA first (Q2 assumed IFC numbers were stored; they are not); (b) `sw.js` conflicts on every PR in a busy day: merge `origin/main` right before push, take max+1; (c) a bot may enable auto-merge on an agent's PR: verify before, not after, it can land.

## ▶▶ (earlier on 2026-11-17) the state list and the AGREED design — superseded by the block above, kept for the design and decisions
**Owner, 2026-11-16 (verbatim, binding):** *"Agree. Update prompt to resume new session. We check (a) and agree your b and c."*
**Next task: the BIM help panel (Viewer + Modeller), §14.** Spec before code; the design below is AGREED, the one open item is (a).
**STATE 2026-11-17 (read first):**
- (a) decided: bSI's official bSDD text, verbatim (§14 (a) DECIDED).
- Step 1 'This element' was already built in `#info-panel` (§14 FINDING).
- Step 3, class text in the info panel: BUILT and live, bim-ootb #3150, W-CLASS-HELP PASS (§14.1 RESULT).
- Step 2, How To in the `?` palette: BUILT, bim-ootb #3156, W-HOWTO PASS (§14.3 RESULT).
- The help panel itself (left, stays open, amber, draggable, reopens as left): BUILT, bim-ootb #3160, W-HELP-DOCK PASS (§14.4 RESULT).
- §14.5 step 1 (shared panel + drag helper in `common/`): BUILT, bim-ootb #3165.
- §14.5 step 2, the Modeller adapter: BUILT, bim-ootb #3171, W-HELP-DOCK-M PASS (§14.5 RESULT step 2).
- §17 film: **v3 MADE 2026-11-17** (`~/Videos/Help_that_answers_Viewer_EN_AFTER_2026-11-17_v3.mp4`, framed bigger, new Jakob Nielsen quote, §17.3 RESULT; v2 kept). Other languages on the owner's word.
- **W-HOWTO H1 failure on main FIXED 2026-11-17** (bim-ootb #3172 merged, §14.3.2 RESULT): a tie in the guide-link choice now goes to the heading sharing a word with the tool, not the first section in the page.
- BIM User Guide: a basic Help section (Viewer, Modeller, and what the command line does and does not have) added 2026-11-17 (BIMCompiler docs/bim-help-basic).
- **NEXT:** (1) DONE 2026-11-17: the Modeller guide titles (§14.5.1, bim-ootb #3173) and the ten older uncatalogued strings (§14.5.2, bim-ootb #3174): W-MODELLER-I18N PASS 15/0. DONE the same day: the 8 missing Viewer guide sections (§14.6). Left: the Modeller guide PARAGRAPHS (owner's call, ~830 translations); then the prefixes, box side (§16 item 7: owner agreed `?` / `#<number>`; the CLI session specs the shell side as CLI_ERP_IVR §41).
- The three §14.1 owner items were ANSWERED in §14.2 (ISO note kept; type classes via their cited occurrence class; our sentence in 15 languages, all built, #3152).
- **ANSWERED 2026-11-17 (owner: yes):** the 8 Viewer tools now have guide sections (§14.6 RESULT, deployed) and palette links (43 of 44). **The S/E key question was answered "yes, real keys" and done** (§14.7 RESULT: Sanity Y, Egress E, Role View D, Earthworks U, Roadworks K; W-PILL-KEYS; the stale action inventory fixed).
- **Waiting on the CLI session (no action here):** §42 S3, the short-name limit fix in `assist_core.nearest()` (§16 item 1). It will message when merged. After that, the help box calls `nearest()` (no second edit-distance function).
- **Known gap:** §14.5 step 1 dragged only 2 of the 13 `A._makeDraggable` callers in a witness (§14.5 RESULT step 1).
- **Research kept:** §16. The licence copies and the bSDD fetch live in `~/bim-compiler/build/bim_help_prior/` (not tracked).
1. **(a) CHECKED 2026-11-17, see §14 (a) RESULT:** CC BY-ND 4.0. Verbatim English with attribution is usable. A translation needs bSI's written consent. **DECIDED 2026-11-17: use bSI's own official translations from bSDD, verbatim; coverage measured, see §14 (a) DECIDED.** Original task: may buildingSMART's IFC class definitions (the IFC4 / IFC4.3 documentation text) be shown, translated and redistributed inside our pages?
   - Read the actual licence or terms on buildingSMART's own site, save the copy into the session's prior folder, and cite the clause.
   - If the terms are unclear, say "not usable yet". Never assume.
2. **AGREED (b):** our own small element dictionary: a Description and a Help per IFC class / element kind, written once and owned by us.
   - Translated through the Viewer's existing 18-locale AD_Message pipeline (`viewer/i18n/`, `locale_loader.js`), never a second loader.
   - Shaped like the ERP's AD rows, so the same `field_help.js` reads it.
3. **AGREED (c):** what we already know per element, with no prose: its rule, its source (sheet / IFC / LOD), its cost line. Shown in the panel's "This element" part. Ready today from existing data.

**The agreed design (owner "Agree" to the proposal in this session):**
- **Where:** open it from the EXISTING `?` pill (Viewer `{id:'help', key:'F1'}`, `viewer/panels.js:1355`; Modeller `#m-help`), NOT the Find panel. An answer may OFFER a Find query as a link.
- **Parts, as the ERP panel:**
  - **This element:** on select / hover, from (b) + (c).
  - **How To:** for the current tool / pill, from `common/door/verbs.json` descriptions + examples and the BIM guide sections.
  - **The question box:** the existing command palette (`showCommandPalette`, `viewer/scene.js:2907`) becomes it. One search, not two.
- **One shared module:** move `erp/field_help.js` and `erp/help_search.js` to `common/help/`, with one adapter per app (ERP: its dictionary; Viewer: pills + verbs + classes; Modeller: tools + verbs + rules).
  - The Modeller's two hard-coded overlays (`#m-help-panel` and `#m-guide-panel`) merge into it.
  - `ask` at the CLI covers every app.
- **Layout:** a right dock on desktop; a full-height sheet on mobile (the Viewer's right side is tight; the Modeller has no mobile layout).
- **Facts already surveyed (do not redo):** see §14 below.

---

## ▶ RESUME HERE (2026-11-16, end of session bim-compiler-75; DONE since: P1b, §10-§13; kept for its decisions D1-D4)
**Owner, 2026-11-16 (verbatim):** *"New session 'resume message' will continue organise Help and tooltip content, but see if it can be in a help-pack_(language).zip loaded during login choice to lazy load its large content. Then we can pack lots of useful content. Note that in legacy the Help is on the right panel thus in twin it shold be so too. Look at improving the search function in it perhaps combination of words or a sentence ie 'How do i close a Sales Order?' it should give more useful info, auto hyperlink to jump more easily."*
**DECIDED by the owner, 2026-11-16 (verbatim, binding):** *"Yes i agree not to fold into first loaded ad_seed.db but a separate upon login or lazy and cached or on machine. For app languges we already set a number as in BIM chooser, let's stick to that, but for initial pilot poc, accept as u said of the 4 already with guide and ERP screen. We do it in kernel ERP twin not legacy to avoid confusion when we need to compare with original. Extra how-to will be your lane's big task as HELP is major boost."*
- **D1 Storage:** §9 is accepted. Help content is NOT in `ad_seed.db`. It is a separate store, loaded at login or lazily, then cached or kept on the machine.
  - It goes through the ERP screen's ONE language loader, `ErpI18n.loadPack` (`erp/erp_i18n.js:49-52`, fetches `erp/i18n/<code>.json`), extended to `erp/i18n/help/<code>/…`. No second loader.
- **D2 Languages:**
  - Target = the BIM Viewer chooser's set (`viewer/locale_loader.js` `AVAILABLE_LOCALES`, 18): en_MY, en_US, en_GB, en_AU, ms_MY, de_DE, fr_FR, es_ES, zh_CN, th_TH, ja_JP, ko_KR, ar_SA, pt_BR, id_ID, bn_BD, bl_BD, af_ZA.
  - **Pilot PoC = 4: fr_FR, de_DE, ja_JP, zh_CN.** Each already has a translated guide and an ERP screen pack.
- **D3 Twin kernel only, never legacy:** help packs and the extra content live in the ERP twin's kernel only. They are never installed into the legacy iDempiere, which stays the untouched original for parity comparisons.
  - This is the owner's own exemption: the twin may show MORE help than legacy.
  - The SHAPE stays legacy's: tooltip = Description (§7), and the extra content appears in the right panel where legacy shows Context Help.
  - It supersedes the "ship it to a real iDempiere as a 2Pack" lines in §8 and §9.
- **D4 Extra how-to content = this lane's big task** ("HELP is major boost"). Writing it is this lane's job, not an open question.
**State (2026-11-16, session after bim-compiler-75):** P2b DONE (§6). **Film "Help that answers" EN v4 made (§11 RESULT).** **§10 showcase slice BUILT, W-HELP-SHOWCASE 13/0** (bim-ootb #3128: help pack per language, question search, auto-links, 4 how-to rows; §10 RESULT). **P1b BUILT, W-FIELD-HELP 13/0** (bim-ootb #3126 `feat/field-help-twin`, §7 RESULT): tooltip = the field's own Description, one setter `erp/field_help.js`, the East Tool Tip panel. **Next = the help pack format and loader (step 5 below)**, through `ErpI18n.loadPack` (D1), pilot fr/de/ja/zh (D2).
**Facts measured this session (cite them, do not re-derive):**
- Legacy tooltip = Description (`WEditor.java:247/333/339-340`). Help goes to the RIGHT panel on focus (`ADTabpanel.java:840`, `GridTabRowRenderer.java:637-641`, `HelpController.renderToolTip:186-230`).
- Live `adempiere.ad_field_v` = `f.name, f.description, f.help` (the field's own text only).
- Legacy DBs (docker `postgres`, schema `adempiere`): `idempiere`/`_pilot`/`_test` have 21,432 fields; `ad_field_trl` 21,432 rows, system language `es_CO`. The twin seed has 20,988 fields (it also has plugin ids) and NO `_trl` rows.
- **Legacy already has the content store this asks for:** `AD_CtxHelp` (bound to tab / process / form / info window / workflow / task / table; `ctxtype`) → `AD_CtxHelpMsg` (the text) → `AD_CtxHelpMsg_Trl` (per language), plus `AD_CtxHelpSuggestion` (a user's proposed text). `HelpController.renderCtxHelp` shows it in the same right panel (`HelpController.java:169`, the Home help).
  - The local legacy holds 1 row of each, so the store exists and is nearly empty.
**Design to take forward (this session's analysis; the owner asked for it to be discussed, not built):**
1. **Help pack = Context Help rows, per language, lazy.**
   - `help-pack_<lang>.zip` carries:
     - (a) the dictionary's own translations (`AD_Field_Trl`, `AD_Element_Trl`, `AD_Process_Para_Trl`), from published iDempiere language packs;
     - (b) the "lots of useful content" as `AD_CtxHelp` + `AD_CtxHelpMsg(_Trl)` rows;
     - (c) a prebuilt search index.
   - It is fetched once, after the login has chosen the language. The language rule is the CLI session's (`CLI_ERP_IVR.md`): `AD_Preference` 'Language' → LANG / browser → System client.
   - The pack is cached by the service worker and applied as a READ overlay, like the patches. The seed is never rewritten.
   - Context Help gives the content legacy's own shape and place (the right panel). D3: it lives in the twin kernel only. (Superseded by D3: twin kernel only, never installed into legacy.)
   - Help text that is not a legacy record would be a divergence (CARDINAL rule), so it never goes there.
2. **The right panel in the twin** = a port of `HelpController`: field help on focus, plus the Context Help of the tab, window or process in view. One panel, generic (AD-LAYER LAW), witnessed X of N windows.
3. **Search ("How do I close a Sales Order?") is knowledge retrieval, deterministic, with no AI inside** (positioning rule):
   - **Parse:** lowercase, drop the stop words ("how do i … ?"). Match phrases against dictionary names longest-first: window "Sales Order", document action "Close" = `CL` from the DocAction list, process names, field names, plus guide headings.
   - **Rank:** an inverted index (BM25-like) over Context Help text, field help, window and process descriptions, guide sections, and `words.json` / `verbs.json`, built when the pack is made.
   - **Answer card**, each part extracted, not written:
     - "Sales Order" → open the window (zoom link);
     - "Close" → the document action, with its preconditions from the doc-action table (`ad_docfsm`);
     - the CLI line: `erp.close kind=Order number=<n>`;
     - the guide section anchor.
   - **Auto-hyperlink:** inside any help text, a term equal to a window, process or field name becomes a link (window → open, field → its help, guide term → its section). One linker, run when the pack is built, not at display time.
   - **Witness:** a question set of real phrasings (EN + each pack language) → expected top hit (X of N). A falsifier drops the phrase matcher and must FAIL.
4. **Research §8 (what leading apps do) is the input for the open question below; read it before speccing the content. §9 is the storage advice (text sources per language, a separate in-browser help DB, legacy table shapes; not folded into the seed).**
5. **Order of work:** ~~finish P1b~~ DONE (§7 RESULT). Next: the pack format and loader. Then the search index and linker. The content itself comes last, and it is just data.
**Owned elsewhere, don't redo:**
- The locale/login rule: the CLI session.
- The FastScriptGuide translations: the CLI session; the rule is in DOCS_I18N §6g.
- The ERP order blocks that need their own op-log: the CLI session.
- The status@erp witness failures on main: reported to the CLI session.

## 0. Rules (owner, 2026-11-16; binding)
- **Student is a LEVEL beside the language** (`ja` + student), not a language value. Short text = `AD_Message.MsgText` / `AD_Element.Description`; long = `MsgTip` / `Help` (legacy `Msg.java` L169-232, L375-398).
- **English is byte-identical by default.** The door's envelope, journal, `verbs.json` and what an AI or script receives never change; only text meant for a person is looked up, and only when a level or locale is set.
- **AD tables are never changed** (TWIN rule). The catalog is a READ layer: text lives once on the element; a column or field resolves to it unless it stores its own override.
- **Never invent.** A tip is the written text, or a tip DERIVED only from dictionary facts and labelled `derived`; where there is neither, the answer is empty and counted.
- **No collision with the CLI session:** nothing here edits `common/door/*` or `words.json` until the CLI session's `feat/mis-lookup` has merged (§P2 freeze). `tip` goes into `words.json` as a NEW key per word, no existing key rewritten.

## 1. Phases (one PR each; WORK-TO-ZERO)
| Phase | What | Touches | Status |
|---|---|---|---|
| P0 | Inventory and measurement (CLI strings ~235 in 10 files; Help duplication; derived-tip candidates) | docs only | DONE 2026-11-16, DOCS_I18N §4b-§4c |
| **P1** | **Help read layer** over the dictionary: resolve Help/Description by level through element → column → field, derive a tip where none is written | new files in bim-ootb `erp/` only | BUILT 2026-11-16, W-HELP-CATALOG 5/0 (bim-ootb `feat/help-catalog`), see P1 RESULT |
| P1b | Field tooltips + the Help panel in twin windows = legacy (`WEditor`, `HelpController`, `AD_Field_v`); one setter, one panel | `erp/field_help.js`, the field-render paths | **BUILT 2026-11-16**, W-FIELD-HELP 13/0, bim-ootb #3126 (§7 RESULT) |
| P2 | `Msg` pass-through for CLI strings (no behavior change), then file by file; stable key per message; `explain <key>` | `common/door/*` | **P2a BUILT 2026-11-16** (`words_core.js`, W-MSG-CATALOG 4/0, §3); **P2b DONE 2026-11-16** (`door.js`, W-MSG-DOOR 5/0, §6; MERGED bim-ootb #3108 `f18ae08c` after the guides listed six files, bim-compiler #798, deployed) |
| P3 | Student level for `help <word>` from the vocabulary (P3a); hint lines on the most-hit refusals (person's terminal, level set) (P3b) | `words_core.js`, `red1.js`, door render | **P3a BUILT 2026-11-16** (W-HELP-STUDENT 5/0, §4 RESULT; no `words.json` edit was needed); P3b after P2b |
| P4 | Guides pull terms from the same keys at build time | `docs/`, MkDocs | after P2 |
| P5 | Translations (six languages, `DOCS_I18N.md`), reviewer banner | catalog + docs | after P4 |

## 2. P1 spec: the Help read layer (module `erp/help_catalog.js`, witness `erp/tests/witness_help_catalog.js` in bim-ootb)
**Issue it removes:** the seed stores the same Help text on the element, again on each column, again on each field (measured, DOCS_I18N §4b: 18,617 of 18,639 column Helps and 15,735 of 16,062 field Helps are copies; removing the copies from a throwaway copy made the file 23% smaller raw, 18% gzipped), and 2,857 of 16,144 displayed fields have no Help at any level.
**API (pure; it takes a `q(sql) -> rows` function, so the door, the page and a test can each supply their own handle):**
- `makeResolver(q)` → `{ help(level, {fieldId|columnId|elementId}) -> {text, source, derived} }` with `level` `short` (Description chain) or `student` (Help chain, then the Description chain, then a derived tip); `source` is `field | column | element | derived | none`.
- The chain is field → column → element; the first NON-BLANK stored text wins (blank = NULL or whitespace). `derived` is built only when no written text exists at any level, only from the column's own dictionary facts (type name; Required; the list's values with their names; the table a lookup refers to; the default), and only when at least one fact beyond the type exists; otherwise `none`.
**Claims (witness W-HELP-CATALOG; each names its issue; each can say VACUOUS / INCONCLUSIVE; falsifier `HELP_BREAK=`):**
- **H1 lossless.** Issue: removing copies loses text. On a throwaway copy where every field/column Help and Description equal to its parent's is set NULL, the resolver returns for EVERY column and field with a written text exactly the ORIGINAL stored string (X of N, stated per kind: column help, field help, column description, field description). Falsifier `dropoverride` (the copy also drops one real override): H1 FAILS naming the count.
- **H2 the copies really went.** Issue: a no-op that proves nothing. The throwaway copy stores fewer help bytes than the original (stated); VACUOUS if equal. The log reports raw and gzip sizes; not pass/fail.
- **H3 the levels.** `short` returns the Description chain; `student` the Help chain, else the Description chain, else derived; a field with an override returns its own text; `source` names the level it came from. Independent SQL decides the expected text. Falsifier `swaplevel` FAILS it.
- **H4 derived tips are facts.** Issue: an invented tip. For every field whose written text is absent at every level, a derived tip is built; each fact in it equals an independent query (list values with names, lookup table, mandatory, default), none is built where written text exists, and every one is labelled `derived`. Falsifier `derivealways` (derive even when text exists) FAILS it. VACUOUS if no field qualifies.
- **H5 population stated, nothing hidden.** Of the displayed fields (N): written / derived / still empty, three counts summing to N; the still-empty ones are listed by name in the log, not counted as a pass. A field that GAINS a text it did not have before (original blank, parent written) is counted and named, not hidden (it is a change in what a person sees; the twin's window path is not touched by P1).
**Not in P1:** the door and `words.json` (frozen, §0); translations; the `Msg` class; any change to `ad_seed.db`. The throwaway copy is never shipped.

**P1 RESULT (2026-11-16, bim-ootb branch `feat/help-catalog`, log read; the seed is the worktree's `erp/ad_seed.db`):** W-HELP-CATALOG **5 pass / 0 fail**. H1 lossless: column Help 18,639 of 18,639, field Help 16,059 of 16,059, column Description 20,381 of 20,381, field Description 17,641 of 17,641 resolve to the exact stored text from the copy-free database. H2: help characters stored in column+field 4,567,967 -> 50,575; file raw 27,193,344 -> 20,819,968 (-23%), gzip 7,132,779 -> 5,787,118 (-19%). H3: 14,518 of 14,518 displayed fields with written text answer as an independent CHAIN query says. H4: 997 derived tips, all match independent queries; none built for a field that has written text. H5: of 16,144 displayed fields 14,518 written + 997 derived + 629 still empty. Falsifiers: `swaplevel` FAILs H1 and H3; `derivealways` FAILs H1, H3 and H4 (10,306 fields got a derived tip over written text); `dropoverride` FAILs H1 (16,058 of 16,059).
**Instrument errors found by reading the log (not data defects), fixed:** (1) SQLite `trim()` strips only spaces, JS `trim()` strips newlines; three fields ("Set Project Type", ids 6548, 7401, 7676) store a lone newline as Help, so the two disagreed on "blank". One definition now: blank = the whitespace JS trims, and the SQL passes `char(32,9,10,11,12,13)`. (2) the H4 check expected a list sentence for 18 columns typed List or Search that name no list or table in the dictionary; the layer correctly states nothing there. (3) the first `dropoverride` dropped a one-character whitespace "override", so the falsifier was VACUOUS and did not fail H1; it now picks a real text override.
**Findings for the owner:** 18 displayed fields have a List or Search column with no reference value in the dictionary (e.g. Auction Type, Package Imp., Context Help); 94 displayed fields have no Help of their own but resolve to their column's or element's (named in the log); 629 displayed fields still have no text and no derivable fact (e.g. Is MPS, Group1, Process Now). The throwaway copy is not shipped; P1 changes no AD row.
**Not done in P1:** the door and `words.json` (frozen until `feat/mis-lookup` merges), translations, the CLI `Msg` class (P2).

## 3. P2a spec: the pass-through message catalog, first file `words_core.js` (bim-ootb `feat/msg-passthrough`)
**Freeze lifted 2026-11-16:** `feat/mis-lookup` merged as bim-ootb #3080 (`1cc4f2cd`). The CLI session (`bim-compiler-06`) was told which files this touches. It agreed not to edit `words_core.js` text until this merges; its next items are in `assist_core.js`, `erp_cli.js` and the assist/report parts of `red1.js`.
**Issue it removes:** the text a person reads lives as literals inside code, so the CLI cannot get a Student level or a language, and the guides cannot share the words (DOCS_I18N §4b). P2a moves the literals of ONE file to a keyed catalog and changes no byte that a person, a script or an AI sees. **Why `words_core.js` first:** it is the red1 shell's screen text (meant for a person, never the envelope). It is PURE and already takes its table (`words.json`) as data. It is not in the door's flat download (`door.js`, `verbs.json`, `bim_mcp.js`), so that contract is not touched. `door.js` comes later and needs the download list extended. That is a separate step.
**Files:**
- new `common/door/msg_core.js`: PURE, the same shape as `words_core.js` (no require, process or fs; runs unchanged in Node and in the page).
- new `common/door/vocab/messages.json`, beside `words.json` (the store DOCS_I18N §4b recommends).
- `words_core.js` takes `o.msg`, a created `MsgCore` (a pure file cannot require one; it is handed in the same way as `menuCore`). `create()` throws if it is missing: no built-in English kept as a silent fallback.
- the five `create()` callers hand it in: `red1.js` three times (one helper, `msgCore()`), `witness_red1_words.js`, `witness_red1_help.js`.
**API:** `MsgCore.create(catalog)` returns `{ t(key, ...args), keys(), used() }`.
- A template uses legacy `MessageFormat` positions, `{0}`, `{1}` … (`Msg.java` L436-462).
- A literal `{` or `}` is not allowed in a template.
- `t` of an unknown key throws `msg: no message <key>`. A placeholder with no argument also throws. A wrong key is never printed blank.
- P2a has no level or locale: it is English only. `used()` counts the keys used, for the witness.
**Catalog shape:** `{ "_": "<what this file is>", "messages": { "<file>.<name>": { "en": "…" } } }`.
- Where the code prints a whole sentence, the key holds the whole sentence.
- A conditional tail is a second whole-sentence key (`words.cd_unknown`, `words.cd_unknown_buildings`), never a fragment glued on.
- Fragments that code joins into a list (the place names) are their own keys and say so in the name (`words.place.kind`).
- Data passed through untouched (an envelope's `why`, a word's `help` from `words.json`, menu lines) is NOT a message and stays as it is.
**Claims, witness W-MSG-CATALOG (`common/door/tests/witness_msg_catalog.js`; falsifier `MSG_BREAK=`):**
- **M1 byte-identical.** Issue: moving text changes what a person sees or what a replay prints. The pre-change `words_core.js` (from git, pinned `MSG_BASE`, default `1cc4f2cd`) and the new one get the SAME corpus of states and inputs. Every screen line, effect, error and `helpText` output must match byte for byte (X of N steps). Git cannot give the baseline → INCONCLUSIVE. Falsifier `edittemplate` (one character changed in one template, in a copy of the catalog) → M1 FAILS naming the key. Scope: a migration claim. After this merges, the existing message witnesses (W-RED1-WORDS/-CD/-HELP/-RUN/-MENU) pin the bytes. `MSG_BASE` moves when the next file converts.
- **M2 every key reached.** Issue: a key the corpus never reached was not proven byte-identical. Keys reached: X of N. Any unreached key → INCONCLUSIVE naming it, never PASS.
- **M3 keys both ways.** Issue: a key renamed in code alone throws at a person's terminal. Every `M('…')` key in `words_core.js` is in the catalog, and every `words.*` catalog key is used in code (X of N both ways). Every template's placeholders are `{0}..{n-1}` with no gap. Falsifier `renamekey` (one key renamed in a code copy only) → FAIL.
- **M4 no literal left (deletion budget).** Issue: half-moved text. Counts the person-facing literals in `words_core.js` (`screen.push('…`, `error: '…`, the `helpText` sentences), before and after. After must be 0. A literal left over → FAIL naming the line.
- The witnesses that assert this text are run and their logs read, unchanged: W-RED1-WORDS, W-RED1-CD, W-RED1-HELP, W-RED1-RUN, W-RED1-MENU, W-RED1-SHELL.
**Not in P2a:** `door.js`, `erp_cli.js`, the other cores, `words.json`, `verbs.json`, a level, a locale, `explain <key>`, and `match(text)` (finding a key from the English `why` of an envelope; it comes with the first envelope-text file so the envelope never needs a new field).

**P2a RESULT (2026-11-16, bim-ootb #3082 `feat/msg-passthrough`; logs read: `common/door/tests/logs/msg_catalog*.log`):** W-MSG-CATALOG **4 pass / 0 fail**.
- M1: the pre-change `words_core.js` (`1cc4f2cd`) and the new one answer 2,185 of 2,185 corpus steps byte for byte. 96 of the steps are `helpText`. Three core variants: with buildings, without, interactive.
- M2: 59 of 59 `words.*` keys reached.
- M3: 59 of 59 keys both ways. No template has a gap or a stray brace. No call passes an argument that its template drops.
- M4: person-facing literals 28 before, 0 after. The log lists every two-word literal still in the file: `use strict`, the create() guard and a W-RED1-HELP falsifier string. The guard is a named exemption because it is thrown when the catalog itself is missing.
- Falsifiers: `edittemplate` FAILs M1 and prints the changed text (`cd; no building…` against `cd: no building…`). `renamekey` FAILs M1 (`THROW msg: no message words.not_donee`) and M3 (58 of 59 both ways); M2 says INCONCLUSIVE for the unreached key.
- Unchanged witnesses, run after merging `origin/main` (#3081), logs read: W-RED1-API/-ASSIST/-CD/-DRAW/-HELP/-LS/-MENU/-PAGE/-REPORT/-RUN/-SHELL/-WARM/-WELCOME/-WORDS, W-DOOR-HELP and W-MIS-LOOKUP all PASS.
- **Instrument errors found by reading the log, fixed:**
  1. One key was built at run time (`works_place.` + a place). M3 reads literal keys only, so the four keys became literal.
  2. M4 first flagged the create() guard. That is a developer's wiring error and cannot come from a missing catalog, so it is now a named exemption.
  3. The reader's literal list used a broken regex escape and matched across lines. It now pulls out whole string literals.
  4. The first M1 DIFF line was cut off before the change, so the falsifier did not show the text. It now prints the first place that differs.
- Found on the way, not this lane: W-RED1-RUN R5 and W-RED1-REPORT P1-P4 failed on main. #3078 had ported Close Project, the process they used as the one with no port. The CLI session had already fixed this in #3081.
- Deletion budget: `words_core.js` + `red1.js` +43/-37 lines; 59 English literals moved from the code to `vocab/messages.json`.
**Next (P2b):** `door.js`, which holds the most-hit refusals: missing input, `is not key=value`, unknown verb.
- `msg_core.js` and `messages.json` must join the door's flat download: `FILES`, `bim_mcp.js` `DL`, W-MCP-DOWNLOAD.
- It also needs `match(text)`, so a person's terminal can find the key from the envelope's English `why` without a new envelope field.

## 4. P3a spec: a Student level for `help <word>`, built from the vocabulary (bim-ootb `feat/help-student`)
**Owner order 2026-11-16:** "Proceed" on the item ranked first in §4c: a tip and a worked example per word.
**Issue it removes:** `help clash` gives one dry line (`clash: clash two disciplines …`) and a bare verb name. A learner is not told what the word does, what to type, what is taken from where they are, or which full line it becomes.
**Source, never invented:** every fact in the Student block is already in the vocabulary.
- `verbs.json` holds the verb's `description` and each input's `description`. It is the same text the AI connector reads, so a person and an AI get one vocabulary.
- The word's own example (`ex` in `words.json`) is expanded by the expander itself into the line it runs. W-RED1-HELP H3 already runs every example.
- Only the labels are new, and they go in the catalog as `words.student.*` keys.
- No word, verb or input text is written by this lane, and `words.json` and `verbs.json` are not edited. The tip per word that §4c proposed as a new `words.json` key is NOT needed: the verb's description is the tip.
**What a person sees at the Student level** (`help <word>` only; groups, the overview and the door's help are unchanged). After each form line of the short help, four lines are added:
```
clash: <the short help, unchanged>
  in a building: clash ARC MEP   → viewer.clashes
    what it does: <the verb's description from verbs.json>
    you type: discA (<its description>) · discB (<its description>)
    taken from where you are: building
    e.g. in Duplex: viewer.clashes building=Duplex discA=ARC discB=MEP
```
- **"you type"** lists the form's own values in order. A form that needs none says so (a catalog key).
- **"taken from where you are"** lists the inputs the place fills (building, kind, role), as the expander puts them on the line. Nothing → the line is left out.
- **The sample place** is the one W-RED1-HELP already uses: Duplex for a building, Duplex/Element for a kind, Order for an ERP kind, none for anywhere.
- **The worked line** is the example expanded in that place without a session. That needs one new option, `expand(st, toks, {plain: true})`, which skips the interactive pick and ask branches. An example the expander refuses gets no worked line and is counted.
**The level is a person's setting, beside the language (§0):**
- In a session, `level student` and `level short` (or `level` alone) set it. It is handled like `role` and kept in the session state. The prompt is unchanged.
- `level xyz` is refused, with the legal values named.
- One shot: `red1 --level student help clash`.
- With no level set, every byte is as today. Help never goes through the door, so the envelope and the journal are untouched.
**Files:** `words_core.js` (`helpText(topic, level)`, the `level` setting, the `plain` expand option), `vocab/messages.json` (new keys), `red1.js` (`helpOf` passes the level; the `--level` flag).
**Claims, witness W-HELP-STUDENT (`common/door/tests/witness_help_student.js`; falsifier `STUDENT_BREAK=`):**
- **S1 short unchanged.** Issue: the new level leaks into the default. For every topic (the overview, each group, each word, an unknown word), `helpText(t)` and `helpText(t, 'short')` equal the pre-change core (pinned `MSG_BASE`) byte for byte. W-RED1-HELP stays green unchanged.
- **S2 every fact is sourced.** Issue: an invented or wrong tip. For every word form, recomputed independently from `verbs.json`:
  - "what it does" is exactly the description of the verb the example expands to;
  - "you type" names the form's values in order, each with exactly its input description;
  - "taken from where you are" is exactly the verb's inputs among building, kind and role that the sample place supplies.
  - Falsifier `swapdesc` (another verb's description) FAILS it.
- **S3 the worked line replays.** Issue: an example that does not run. Each worked line passes the door's own validator and equals the line the session prints (`→ …`) for the same example in the same place. Falsifier `dropctx` (the building left off) FAILS it.
- **S4 coverage stated.** X of N word forms have a block. Any form with no example, no description, or an example the expander refuses is named in the log, never counted as a pass. VACUOUS if N = 0.
- **S5 the setting.** Issue: the level does not reach the person, or sticks. In one session, `level student`, `help clash`, `level`, `help clash` print the Student block and then the short text. A one-shot `--level student help clash` prints the same bytes as the session's Student block. `level xyz` is refused.
**P3a RESULT (2026-11-16, bim-ootb #3083 `feat/help-student`; logs read):** W-HELP-STUDENT **5 pass / 0 fail**.
- S1: default and `short` help equal the pre-change core (`78aa51b6`) on 30 of 30 topics.
- S2: every fact of the 31 Student blocks equals `verbs.json`, recomputed apart from the core.
- S3: 31 of 31 worked lines pass the door's validator and equal the line the shell prints for that example in that place.
- S4: 31 of 31 forms have a block.
- S5: `level student` then `help clash` in a session prints the one-shot `--level student` bytes (891 against 104 short); `level` goes back; `level xyz` is refused in the session and in a one shot (exit 2).
- Falsifiers: `swapdesc` FAILs S2 (31 of 31 wrong); `dropctx` FAILs S2 and S3 (19 of 31).
- Also green after merging `origin/main`: W-MSG-CATALOG 4/0, W-RED1-API/-ASSIST/-CD/-DRAW/-HELP/-LS/-MENU/-PAGE/-REPORT/-RUN/-SHELL/-WARM/-WELCOME/-WORDS and W-DOOR-HELP.
- **Found by reading the logs, fixed:**
  1. The `new` word's example is a placeholder, `new <Column>=<value>`, which the expander refuses as too many values. W-RED1-HELP H3 already rewrites such placeholders before running them. The rule now: a pair `<Key>=<value>` is read as `Key=value`, the shape the word's own help line shows (`new Column=value …`). The witness applies the same rule apart from the core.
  2. W-MSG-CATALOG M3 caught `M(cond ? 'a' : 'b')`, where a key was chosen by a ternary and was invisible to the literal check. It is now two literal calls.
  3. W-MSG-CATALOG M2 counted the 12 new keys as unreached. M2's scope is the P2a move, so the `words.level_*` and `words.student.*` keys are now named as handed to W-HELP-STUDENT.
- Deletion budget: `words_core.js` + `red1.js` +38/-13. No literal was added, and `words.json` and `verbs.json` are untouched.
- The CLI session cleared `red1.js` (help, argv) and `words_core.js` before the edit.
**Decided by the owner, 2026-11-16 (P3a-1):** asked whether the greeting or the help should mention `level student`, the owner said *"Yes it should"*.
- **What changes:** one catalog entry, `words.help_footer`, the last line of `help`. `… · help <word> for one word · …` becomes `… · help <word> for one word (level student first for the full explanation) · …`. No code changes.
- **What does not change:** the greeting (`words.json` `welcome`) and the `everywhere` line. Both are the CLI session's data in `words.json`, and no existing `words.json` key is rewritten (§0). The footer is enough to make `level student` visible.
- **The witness rule for a deliberate wording change:** W-MSG-CATALOG M1 proves the CODE is byte-identical. From now on it runs the new core with the catalog as it was at P2a: today's catalog with each ledgered change reverted. A ledger in the witness names each deliberate change (key, old text, new text, the owner's words, date).
- **New claim M5 (the ledger is the only drift):** the live catalog differs from the P2a catalog only in ledgered keys, and each ledgered key holds exactly its new text. Falsifier `unledgered` (a second key changed in a copy of the catalog, with no ledger entry) → M5 FAILS naming it.
- W-HELP-STUDENT S1 is not affected: its old and new cores read the same live catalog.
- **The opening tip, with the usual don't-repeat convention.** The owner added mid-turn: *"with a 'do not repeat' usual convention ie when opening 'red1' with a 'fast' flag"*.
  - On opening a terminal session, one tip line follows the greeting: new key `words.tip_level`, `Tip: type level student for fuller help on each word (red1 --fast opens without tips).`
  - `red1 --fast` opens without tips. The greeting itself stays, because it is the CLI session's §26.
  - A pipe, a one-shot line and `-f` never show the greeting, so they never show the tip either.
  - **A flag, not "shown once, then remembered":** remembering needs a state file and makes the opening differ from one run to the next. A flag keeps every run deterministic.
  - `red1 -h` names `--fast` and `--level student`.
  - New claim **W-HELP-STUDENT S6:** on a terminal (a `script` pseudo-terminal, the W-RED1-WELCOME method), the tip follows the greeting and comes before the prompt. `--fast` drops the tip and keeps the greeting. A pipe shows no tip.
- **P3a-1 RESULT (2026-11-16, bim-ootb #3084 `feat/help-footer-level`; logs read):**
  - W-MSG-CATALOG 5/0: M1 2,185 of 2,185 steps on the P2a wording. M5 shows no drift from the P2a catalog (`78aa51b6`) beyond the one ledgered change, and 13 keys added since, which are additions.
  - W-HELP-STUDENT 6/0: S6 found the tip after the greeting and before the prompt; with `--fast` the tip is gone and the greeting is kept; a pipe shows no tip.
  - Falsifiers: `unledgered` FAILs M5, `edittemplate` FAILs M1, `renamekey` FAILs M1 and M3.
  - W-RED1-* (14), W-DOOR-HELP and W-RED1-WELCOME are green after merging `origin/main`.
  - **Found by reading the log, fixed:** M3 scanned `words_core.js` only, so the tip key (read in `red1.js`) looked unused. M3 now reads `red1.js` `.t('…')` calls too, and M2 hands `words.tip_*` to S6 by name.
**Not in P3a:** hint lines on refusals (P3b, needs P2b), Student text for groups and the overview, the ERP field Help (the P1 layer, separate), translations, and any mention of `level` in the greeting or the short help (that would change today's bytes; the owner decides).

## 5. P2a-1 spec: ONE key scanner, `common/door/msg_keys.js` (2026-11-16)
**Why:** the owner approved F-19, the X0 Navigator. It is a dev-side hover, jump and check on message keys in `CODE_ARCHITECTURE_DESIGN.md` (code-design session, `bim-compiler-2c`). It must read keys through THIS lane's scanner, not a copy. Until now, W-MSG-CATALOG M3 held the scan inline.
**Module (pure: no require, fs or process; it runs in Node, the witness and the VS Code extension):**
- `scan(sourceText, fileRel)` → `[{ key, line, col, args, file }]` for every call `M('key', …)` or `.t('key', …)`.
  - The key must be a literal string; a computed key is reported as `key: null` with its line, never skipped.
  - `args` is the number of top-level arguments after the key, counted through nested brackets and strings.
- `check(catalog, uses, opts)` → `findings[]`, each `{ kind, key, file, line, col, detail }`:
  - `unknown-key`: used, not in the catalog.
  - `unused-key`: in the catalog under the scanned prefixes, never used.
  - `template`: a placeholder gap or a stray brace.
  - `arg-count`: the call passes a different number of arguments than the template takes. This is now a static check; before, only a missing argument threw, at run time.
  - `computed-key`: a key that is not a literal string.
**W-MSG-CATALOG M3 uses it,** with the same verdicts as before, plus the static `arg-count`. New falsifiers:
- `MSG_BREAK=extraarg`: one call passes one argument too many. M3 must FAIL with `arg-count`.
- `MSG_BREAK=computedkey`: one key is built at run time. M3 must FAIL with `computed-key`.
**P2a-1 RESULT (2026-11-16, bim-ootb #3097; logs read):**
- `msg_keys.js` on the real code: 73 uses (`words_core.js` + `red1.js`), 72 keys, 0 findings.
- W-MSG-CATALOG 5/0: M1 2,260 of 2,260 steps, and M3 through the module.
- Falsifiers:
  - `extraarg` FAILs M3: `arg-count words.not_done words_core.js:142 passes 2, the template takes 1`.
  - `computedkey` FAILs M3: `computed-key words_core.js:153`.
  - `renamekey`, `unledgered` and `edittemplate` still FAIL their claims.
- W-HELP-STUDENT 6/0, W-RED1-HELP 5/0 and W-RED1-WORDS 3/0 stay green.
- The code-design session (X0 Navigator, F-19) requires it unchanged.

## 6. P2b spec: `door.js` to the catalog (bim-ootb `feat/msg-door`, 2026-11-16; owner: "do message for door.js to catalog only this session")
**Scope of this session: the move only.** `match(text)`, a level, a locale and the P3b hint lines are NOT in P2b; they are the next items.
**Issue it removes:** the door's refusals (missing input, `is not key=value`, unknown verb, the claim and confirm answers, the `{expr}` errors) are literals in `door.js`. A person's terminal cannot show them at a level or in a language. These are the most-read refusals of the CLI.
**What moves (person-facing text):** every literal sentence that reaches a person or an AI as an ANSWER:
- the envelope's `why` (validator, line grammar, `{expr}`, `decide`, `composed`, `engineResult`, confirm),
- the `question` text of a line that is not a command,
- the `what` words of the input types,
- the `verbs.json:` load errors (the vocabulary author reads them),
- the usage line, the `--dry` refusal and the three `§DOOR FAIL` sentences: the sentence moves, the `§DOOR FAIL` tag stays in the code.
- Fallback words (`no output`, `refused`, `none`, `the app`, `field`, `never answered`, `nothing was judged`) are keys too.
**What stays in code, by rule:** the `§DOOR <event> key=value` log lines (the witness instrument, grepped by W-DOOR-*). Also the regexes that read other programs' stderr (they read data), the punctuation that joins lists (`, ` `; ` ` > `) and the `curl -O` lines (commands).
**The envelope stays English, always.** The door's catalog reader is pinned to `en`, now and after a locale exists. Translating a `why` is the person's terminal's job, through `match(text)`, so the envelope, the journal and what an AI receives never change (§0).
**Braces:** a template may not hold `{` or `}` (`msg_core.js`). Where the text shows the person's own expression (`in {a+b}`) or the `{` character itself, the brace is DATA and is passed as an argument.
**Conditional tails:** each is a second whole-sentence key (§3 rule). Example: `door.plain_number`, `_unit`, `_hint`, `_unit_hint`.
**Loading, no silent fallback:** `door.js` reads `msg_core.js` and `messages.json` through its ONE resolver (`locate`): beside `door.js` first, then the repo layout. `FILES` gains `msg_core.js` (`common/door/msg_core.js`) and `messages.json` (`common/door/vocab/messages.json`). The catalog is read once, on the first message. When either file is missing:
- the CLI stops at start and names the file with its `curl` line (the `render.js` pattern);
- `bim_mcp.js` adds both to `DL` and to its start check;
- the one literal left is the guard that says the catalog is missing. It is a named exemption, as in P2a.
**Public download consequence (needs the owner):** the guides' "four files" (FastScriptGuide in 7 languages, ProposerGuide) become six. Both files are already served live (P2a), so updating the guides first is harmless. W-MCP-DOWNLOAD `LISTED` and its D3 loop, and `gen_fast_script_guide.js` `FLAT`, gain the two files.
**Claims, witness W-MSG-DOOR (`common/door/tests/witness_msg_door.js`; falsifier `MSG_BREAK=`):**
- **D1 byte-identical.** Issue: moving text changes an envelope, the journal or a replay. The pre-change `door.js` (git `DOOR_BASE`, the `origin/main` this branch starts from) and the new one, sibling copies in `common/door/`, get the SAME corpus. Every result must match byte for byte (X of N steps), with `ms` and the request ids normalised:
  - the exported `validate`, `coerce`, `parseLine`, `tokenize` and `evalExpr` over typed and bad inputs;
  - `createDoor().runLine` and `confirm` with stub programs, for every `decide` and `engineResult` branch;
  - `loadVocab` and `checkComposed` on broken vocabularies;
  - the CLI usage and `--dry` refusal, spawned.
  - No baseline from git → INCONCLUSIVE.
  - Falsifier `edittemplate`: one character changed in one `door.*` template in a catalog copy → D1 FAILS, naming the key.
- **D2 every key reached.** `door.*` keys reached X of N; an unreached key → INCONCLUSIVE naming it.
- **D3 keys both ways** through `msg_keys.js` (prefix `door.`): unknown, unused, template, arg-count and computed-key findings all 0. Falsifier `renamekey`: one key renamed in a copy of `door.js` only → D3 FAILS.
- **D4 no literal left (deletion budget).** The person-facing literal patterns (`why:` sentences, `throw new Error('…`, `return '…`, `what: '…`, `question: '…`, `fail('…`, `|| '…` fallbacks, `usage:`) counted before and after; after = 0 except the named guard. The `§DOOR` log sentences left by rule are listed in the log, not counted.
- **D5 the flat download.** A folder holding only the listed files (now six) runs a door line. With `msg_core.js` or `messages.json` removed, `door.js` exits 1 and names the file with its `curl` line. (W-MCP-DOWNLOAD `--local` D1-D3 run as well.)
- Unchanged witnesses run and logs read: W-DOOR-* (all), W-DSL, W-REPLY-HONEST, W-MSG-CATALOG, W-HELP-STUDENT, W-RED1-*, W-ERP-VERBS-DOOR, W-VOCAB-COMPOSE, W-X0-CATALOG.

**P2b RESULT (2026-11-16, bim-ootb `feat/msg-door` @ `9272d6c3`; logs read: `common/door/tests/logs/msg_door*.log`, `p2b_*.log`, `cmp_*.log`):** W-MSG-DOOR **5 pass / 0 fail**.
- D1: the pre-change `door.js` (`f541cde7`) and the new one answer 151 of 151 steps byte for byte. The steps cover the functions, broken vocabularies, every engine branch, confirm, the journal, the § say lines and 10 CLI runs from a flat folder.
- D2: 85 of 85 `door.*` keys reached. D3: 101 uses, 0 findings. D4: person-facing literals 98 before, 0 after. The guard `catalogMissing` is named; 16 `§DOOR` log lines stay by rule.
- D5: the 6-file folder runs a line, and the connector lists its 4 tools. Without `msg_core.js` or `messages.json`, `door.js` and `bim_mcp.js` each exit 1 and print that file's curl line.
- Falsifiers: `edittemplate` FAILs D1 (`given twice` against `given twise`, 4 steps). `renamekey` FAILs D1 and D3 (`unknown-key door.input_twicee`, `unused-key door.input_twice`).
- **Instrument errors found by reading the log, fixed:**
  1. Claim timestamps (`t`) were not normalised.
  2. D4 counted the status code `'error'` and the actor id `'human'` as words. Codes are now excluded.
  3. The spawned CLI exits inside its main, so a key-count hook appended at the file's end never registered. It now sits at the top.
  4. `--dry` alone reaches usage first, and a script needs `render.js` first. So the CLI corpus has a second flat folder with `render.js`.
- Unchanged witnesses green: W-DOOR-CONFIRM/-HELP/-LIST/-OUT/-PLUGINS/-ROWS/-SCRIPT/-STAMP/-DUP/-HONEST/-SAME/-STATIC, W-DSL 21/0, W-MCP-DOWNLOAD `--local` 7/0 (now 5 D3 files), W-ERP-VERBS-DOOR 46/0, W-VOCAB-COMPOSE, W-MSG-CATALOG 5/0, W-HELP-STUDENT 6/0, W-RED1-*, W-MIS-LOOKUP, W-X0-CATALOG (174 key hovers).
- **Failing on `main` too, not this lane** (base `f541cde7` and branch give identical failing lines):
  - W-LEGACY-PLUGIN P5b: the in-server witness is 12/0, the check wants 8/0.
  - W-MIS-TAB P1: C_ProjectPhase/C_ProjectTask displayed fields 22/19 and 20/14.
  - W-MIS-TAB P3: `object_cli.js:85` orders tabs beside `tabsOf`.
  - W-NINJA-EXEC E11a: tab placement in the Business Partner window.
- **Run environment:** a fresh worktree has no `node_modules`. Witnesses ran with `NODE_PATH=~/bim-ootb/node_modules:~/bim-compiler/node_modules`, because puppeteer is installed only in bim-compiler. Without that path, 3 witnesses crash with `puppeteer not found` / `sql.js` not found. That is not a defect.
- **Found, not fixed (flat-download hole, older than P2b):** `validate` requires `./assist_core.js` when a missing input has a near-miss key. `assist_core.js` is not in the download, so that case throws `Cannot find module` in a flat folder.
- **Open (⛔ owner):** the guides' "four files" become six (FastScriptGuide ×7 languages, ProposerGuide). Hold the bim-ootb merge until the guides list the six, or merge first. Both files are already live (200), so updating the guides first is harmless.
**Next:** `match(text)` (envelope `why` → key) and P3b hint lines.

## 7. P1b spec: field tooltips and the Help panel in the twin windows, the same as legacy (owner 2026-11-16: *"Your focus is more on the bad HELP tool tip construct to improve further"*)
**Issue it removes (measured on bim-ootb `origin/main`, read against the local iDempiere source):** the twin's field help is a developer construct, not legacy's. That breaks the TWIN rule (look and feel included).
1. **Read-only form:** each value's tooltip is `ColumnName · referenceType` (`erp/idempiere.html:5323`).
   - Legacy shows the field's **Description** on both the label and the editor (`WEditor.java:247`, `:333`, `:339-340`).
2. **Inline editor:** the editing surface (`erp/crud_overlay.js` `renderInline` `:1553`) sets **no** tooltip at all.
3. **Process parameters:** the tooltip is `ColumnName · type · mandatory` (`erp/idempiere.html:4829`).
   - Legacy builds each parameter with the same `WEditor` (`ProcessParameterPanel.java:443`), so it also shows its Description.
4. **No Help panel.** Legacy fills its Help panel when a field gets focus, in the form (`ADTabpanel.java:840`) and in the grid (`GridTabRowRenderer.java:637-641`).
   - It shows the header, the Description and the Help, each line only when not blank (`HelpController.renderToolTip`, `HelpController.java:186-230`).
   - The entity type is shown only when "show technical info on help" is on.
   - With no field focused it shows the message `PlaceCursorIntoField`.
5. **The P1 resolver does not answer legacy's rule.** P1 falls back field → column → element.
   - Legacy reads the FIELD's own text only: `AD_Field_v` selects `f.description, f.help` (`migration/i8.2/postgresql/202106031340_IDEMPIERE-4479.sql:84-85`).
   - In another language it reads `AD_Field_Trl` (`:166-167`).
   - So the 94 displayed fields P1 found with no Help of their own (§2 RESULT) show nothing in legacy, and P1 would show the column's text.
- **Already the same as legacy, keep:** the grid's row indicator says `Edit Record` (`idempiere.html:3185` = `GridTabRowRenderer.java:608`). A grid cell's tooltip is its full text only when it is cut short (`GridTabRowRenderer.setLabelText` `:431-441`); this is to be checked, not assumed.
**Fix (AD-LAYER LAW: one generic implementation, no per-window code):**
- `erp/help_catalog.js` gains the level `legacy` for a field. It returns `{header, description, help}` exactly as `AD_Field_v` gives them: the field's own columns, no fallback.
  - When the UI language is not the base language, they come from `AD_Field_Trl`. When the seed has no `_Trl` rows (measured: it has none), it falls back to the base text, as legacy does.
  - `short` and `student` (the inheritance and the derived tips) stay for the CLI and the guides only.
- **One tooltip setter** used by every field-render path: the read-only form, the inline editor, process parameters, and the grid editors on focus.
  - It sets `title` = the Description, or no `title` when the Description is blank.
  - The two developer strings are DELETED (deletion budget).
- **One Help panel** (a port of `HelpController`), filled when a field gets focus. Same rules: header, description, help, each only when not blank; entity type only with "show technical info"; `PlaceCursorIntoField` when nothing is focused.
- The developer's view of `ColumnName · referenceType` moves to the § log line (`§FIELD_HELP`), never to the person's tooltip.
- **Not in P1b:** rewriting any Help text, or showing derived tips or a Student level in a twin window. A twin window shows exactly legacy's text. Better text reaches people through the CLI (`help <word>`, level student) and the guides, never by changing an AD row.
**Claims, witness W-FIELD-HELP (bim-ootb `erp/tests/witness_field_help.js`; X of N, with N from `ad_seed.db`; falsifier `FH_BREAK=`):**
- **F1 the tooltip is the Description.** For every displayed field of every window the role can open, the label's and the editor's tooltip equals `AD_Field.Description`, and there is none when it is blank.
  - Rendered headless through the real form and inline-editor paths. X of N fields; N = the displayed fields counted from the dictionary.
  - VACUOUS if no field is rendered.
- **F2 no developer tooltip left.** 0 rendered tooltips have the form `<ColumnName> · …`, across form, inline editor, process parameters and grid. Falsifier `devtitle` (the old string restored) FAILS F1 and F2.
- **F3 the Help panel answers like `HelpController`.** On focus of each rendered field the panel shows header / description / help with the blank-line rules, and `PlaceCursorIntoField` with no focus. Falsifier `nohelp` FAILS F3.
- **F4 the legacy oracle.** For every displayed field, the twin resolver's `{description, help}` equals the real iDempiere `AD_Field_v` row, read from the local legacy postgres. X of N.
  - INCONCLUSIVE when legacy is not running, never PASS.
  - Falsifier `fallback` (field → column inheritance in the window) FAILS F4, naming the count (about 94 Help fields).
- **F5 process parameters.** Every parameter of every process the role can run has the tooltip `AD_Process_Para.Description` (X of N).

### §7 RESULT (2026-11-16, bim-ootb #3126 `feat/field-help-twin`; log `erp/tests/logs/witness_field_help.log`)
**W-FIELD-HELP 13 pass / 0 fail / 0 inconclusive** (GardenAdmin, real page, the real render functions through `window.__idmpFieldHelp`):
- **F4:** 15,849 of 15,849 displayed fields (1,120 tabs) have description AND help equal to the live legacy `adempiere.ad_field_v` (docker `postgres`). 0 twin-only ids among displayed fields.
- **F1:**
  - read-only form: 11,052 of 11,052 displayed non-key fields over 294 menu windows / 745 tabs, label and value; rendered = the dictionary count;
  - inline editor (`renderInline`, windows 143/169/167/195): 234 of 234 rows, editor and label.
- **F3:** idle panel = `(Place your cursor into a field on the screen)` from AD_Message, panel titled `Tool Tip`, shown (HelpCollapsed default N). Focus → panel = HelpController markup: 11,052 of 11,052 form fields, 88 of 88 focusable inline editors.
- **F5:** 545 of 545 parameters of 131 menu processes with parameters (137 on the menu), editor and label.
- **F2:** 0 developer tooltips out of 21,280 seen.
- **Falsifiers, each FAILs as claimed:** `devtitle` F1+F2 (0/11052, 23,662 of 23,662 developer tooltips); `nohelp` F3 (0/11052, 0/88, idle); `fallback` F4 (help 93 wrong, description 56 wrong; the spec guessed about 94).

**Built:** `erp/field_help.js` (tooltip setter + HelpController port), wired into `_appendReadonlyFields`, `renderProcParamForm`, `crud_overlay.renderInline` and `editCell` (through `opts.fieldFor` → the tab's AD field model), the East `<aside id="idmp-help">`. `ad_parser.getFields` now reads `f.Help, f.EntityType`; `ad_process.readProcess` reads the parameter's `description, help, entitytype`. sw v1088.
**Deleted (budget +364 / −13):** `ColumnName · referenceType`, `ColumnName · type · mandatory`, and `derived — read-only` tooltips.
**Changed from the spec, with the reason:** no `help_catalog` level `legacy` / `legacyField`. `ad_parser.getFields` already IS the twin window's `AD_Field_v` reader (field's own Description, now Help). A second reader would break AD-LAYER LAW rule 5. The WIP commit's `legacyField` was dropped. F4 judges the window's own reader, and its falsifier mutates a throwaway in-memory copy (as W-HELP-CATALOG's `dropoverride` does), not the code.
**Measured facts:**
- Legacy writes panel text RAW (`HelpController.java:136-150`), so does the twin; 372 field Helps contain `<`, e.g. `DocumentNo_<TableName>`, which the browser swallows in both.
- Inline-row labels differ from `AD_Field.Name` on 5 of 234 rows (a curated crud label); the panel header follows legacy (`GridField.getHeader` = the field name).
**Open, named (not claimed):**
- (a) The grid cell editor (`editCell`) is wired to the same setter but W-FIELD-HELP does not drive it yet.
- (b) The twin's read-only inline editors are `disabled` (47 of 234 rows), so they take no focus and the panel cannot follow them. Legacy's read-only Textbox is `readonly` and still focusable; combos are disabled in both. A divergence to close on the crud side (TWIN rule), not here.
- (c) QuickInfo and HowTo (Context Help) panels of the legacy East region: HowTo is the help-pack step.
- (d) Already failing on main, unchanged by this PR (run on main `bbb7dfb2`): `poc_parity_fieldset_live` (timeout opening the c_invoice row), `witness_erp_i18n` 7/4, `poc_ad_folded_crud` 27/29.

### 7.1 SPEC: W-FIELD-HELP's inline-editor oracle read the wrong window (2026-11-18, RESUME item 7)
**Issue it removes:** W-FIELD-HELP is red on main: F1 inline-editor tooltip and label 226/234, F3 81/88. Every miss has the same shape. On Sales Order (143), Shipment (Customer) (169) and the Sales Invoice (167), the witness expects the PURCHASE-side text ("Identifies the (ship from) address…", "Purchase or Company Agent", "Purchase Order"), while the page shows the sales-side field's own Description. **The page is right; the witness is wrong.**
- The oracle's first query finds the field by `tb.ad_tab_id = <#idmp-tabstrip .active[data-tab-id]>`, but the page has never set `data-tab-id` (`git log -S"data-tab-id"`: only #3126, and only in the witness). So that query asks for tab 0 and finds nothing.
- The fallback takes the first header tab of ANY window on that table (`tb.tablevel=0 ORDER BY tb.seqno LIMIT 1`). For `c_order`, `m_inout` and `c_invoice`, that can be the purchase window's field (181 / 184 / 183), so the expected text comes from a window that is not open.
**Fix (witness only, no product change):** the oracle scopes to the window actually open, `window.__idmpHowto.state().win` (the page's own state, §19.6). The field is the one on that window's tab whose table is the row's `data-ad-table`, lowest tab level first. Without an open window the row is counted as not judged, never guessed. The dead `data-tab-id` query is deleted.
**Claims:** F1 inline editor and label = the OPEN window's `AD_Field.Description`, X of N, with N the same rows as before; F3 likewise. Added: **F1-scope**, every judged row's expected text comes from a field whose `ad_window_id` equals the open window (0 rows from another window). Falsifier `FH_BREAK=anywindow` restores the old fallback (first header tab of any window), and F1 must FAIL again on the shared tables.

### 7.1 RESULT (2026-11-18): MERGED, bim-ootb #3264 (`2a6371e2`), witness only
- **`§WITNESS_FIELD_HELP pass=14 fail=0`** (main was 10/3). F1 inline editor 234/234 and label 234/234 (were 226/234); F3 green (was 81/88); F1-scope: 0 rows from another window, and the open window was the driven one in all 4 (143, 169, 167, 195).
- Falsifier `FH_BREAK=anywindow`: F1-scope 141 rows from another window, F1 226/234, F3 81/88, verdict FAIL 10/4. The old red is exactly the oracle's choice of window.
- Measured cause: Sales Order (143) and Purchase Order (181) header tabs both have seqno 10, so `ORDER BY tb.seqno LIMIT 1` was a tie. In the page (sql.js) the expected texts were the purchase window's (181); the sqlite3 CLI returns 143 first for the same query. Why it passed at #3126 was not measured.
- Still printed, not a claim: `label != AD_Field.Name` counts 1-2 per window (the inline label text against the field's Name), the same on main.

## 8. Help as knowledge: what leading apps do, and what we take (research 2026-11-16, 9 web searches; owner: *"Exlore what powerful help function advanced apps have that we can learn from"*; the open question below is the one the owner wants this prompt to spec and tackle)
**What the leaders do** (vendor docs unless marked; vendor-marketing claims excluded):
| App | Help function | The idea worth taking |
|---|---|---|
| Microsoft Office "Tell me" / Search | type what you want to do, get the matching commands and run one from the list; also "Get Help on <phrase>" | a search box that **does**, not only finds |
| macOS Help menu | search lists menu items AND help topics; hovering a menu item opens the menu and **points an arrow at the command** | **show me where** it is, on the real UI |
| JetBrains Find Action / Search Everywhere | one box over actions, settings, files and symbols; **synonyms** ("toggle presentation mode" finds Enter Presentation Mode); `/` scopes to settings | synonyms + scopes, one box |
| SAP Fiori Web Assistant (now SAP Companion) | **hotspots** mark elements that have help; context help + **guided tours**; content kept apart, tied to the app by metadata; SAP's own rule: help is not a crutch for a weak screen | help keyed to elements, stored apart from the app |
| Business Central | each tooltip ends with **Learn more** → the Help pane on this page's topic; Ctrl+F1; **teaching tips** and tours (a tour = a sequence of tips); rule: a tip says the **outcome**, not the steps; falls back to a landing page when no mapping exists | tooltip → deeper help in one key; outcome-first wording |
| Dynamics 365 custom help panes | a side pane per app, entity, form and **language**; balloons / coach marks point at elements; known weakness: they break when the page changes | per-language panes, and a lesson: anchor by a stable key, not by position |
| Salesforce In-App Guidance | prompts and walkthroughs (up to 10 steps) per page, user and time; the Help menu takes your own links; **completion metrics** | measure whether help is used |
| Oracle Guided Learning | **Smart Tips** on fields and buttons, process guides, beacons; views and drop-off reporting | per-field tips beside the process view |
| Odoo | technical tooltip (field name, type, model, relation) in **debug mode** only | the developer view is separate from the person's |
**What we already have that maps onto these, and where each can live without breaking the TWIN rule (look and feel = legacy):**
- **Content store = legacy Context Help** (`AD_CtxHelp` per tab, process, form, info window, workflow, task or table; `AD_CtxHelpMsg` + `_Trl`). It is shown by legacy's own right panel (`HelpController.renderCtxHelp`). This is SAP's "content kept apart, tied by metadata" and Dynamics' "pane per form and language", and legacy already has it.
- **Feedback loop = legacy `AD_CtxHelpSuggestion`** (a user proposes help text; an admin accepts it). That is the authoring answer Salesforce and Oracle sell as a separate product.
- **Developer view apart:** Odoo's debug tooltip = legacy's "show technical info on help" (entity type in the panel) + our `§FIELD_HELP` log line. The person's tooltip stays the Description (§7).
- **Stable anchors:** our hooks are keyed (`data-ad-table` / `data-ad-column`, `help_overlay.js` "attaches by KEY"), so Dynamics' "balloons break when the page changes" does not apply.
- **Proven examples:** every worked example can be a door line replayed by a witness, as W-HELP-STUDENT S3 already does. Help that cannot go stale is something none of the leaders above claim.
- **Show me / tours:** `help_overlay.js` (ReadMe / ShowMe: reveal, pulse, steps from a keyed store) is an opt-in overlay. When it is off, the twin is byte for byte the legacy screen.
**Search ("How do I close a Sales Order?"):** the leaders combine (1) phrase → action matching with synonyms, (2) show-where, and (3) run-it. Ours, deterministic, no AI:
- Match dictionary names (window "Sales Order"; document action "Close" = `CL`) plus a synonym table kept as data.
- The answer card carries:
  - open the window;
  - **show where**: pulse the document-action button, via ShowMe;
  - **when it is allowed**: preconditions from `ad_docfsm`;
  - **do it from the CLI**: `erp.close kind=Order number=<n>`;
  - **learn more**: the guide anchor.
- **Open design point (the next session reads the legacy source first, then decides):** where the search box lives.
  - Legacy has a global search (menus and documents) but no how-to search.
  - A how-to box in the twin's chrome would differ from legacy. Answers shown as Context Help content in the right panel would not.
**THE OPEN QUESTION this prompt is to spec and tackle (owner): who writes the extra help content, and in which languages first.** Facts for the decision:
- **Writable with no author (extract, never invent):**
  - (a) legacy's own text, plus the published iDempiere language packs for `AD_*_Trl` (the seed has none today; the legacy DB holds 21,432 field translations for `es_CO`);
  - (b) derived tips from dictionary facts (P1: 997 fields);
  - (c) worked examples from witness-replayed door lines;
  - (d) links to the existing guide sections (7 languages live).
- **Needs a person:** outcome-first "what is this window for" texts, and how-to answers that no table holds. Legacy's own channel for that is `AD_CtxHelpSuggestion` → accepted → `AD_CtxHelpMsg`.
- **Languages already paid for:** the guides (en, id, zh, fr, ja, es-419, de) and the ERP UI packs (en, fr, es_ES, de, ar, zh_CN, ja, ms_MY, th). The overlap is fr, de, ja, zh (+ es variants).
- **Decided 2026-11-16 (D2, D4 in ▶ RESUME HERE):** this lane writes the content; pilot languages fr_FR, de_DE, ja_JP, zh_CN; target = the BIM chooser's 18.
Sources: [SAP Web Assistant](https://www.sap.com/design-system/fiori-design-web/v1-96/foundations/writing-and-wording/web-assistant) · [Office Tell Me](https://support.microsoft.com/en-au/office/d6b60e8f-0530-43bf-b688-e99d36cf5663) · [macOS Help menu](https://support.apple.com/en-asia/guide/mac-help/hlpvw003/10.15/mac) · [JetBrains Search Everywhere](https://jetbrains.com/help/idea/searching-everywhere.html) · [Business Central user assistance](https://learn.microsoft.com/id-id/dynamics365/business-central/dev-itpro/user-assistance) · [BC teaching tips](https://learn.microsoft.com/en-ca/dynamics365/business-central/dev-itpro/administration/onboarding-teaching-tips-tours) · [Dynamics 365 guided help](https://learn.microsoft.com/en-us/powerapps/maker/data-platform/create-custom-help-pages) · [Salesforce In-App Guidance](https://trailhead.salesforce.com/content/learn/modules/user-engagement/create-in-app-prompts) · [Oracle Guided Learning](https://docs.oracle.com/en/education/customer-success/guided-learning/user-guide/introduction-overview-oracle-guided-learning.html) · [Odoo debug tooltip (3rd party)](https://deploymonkey.com/blog/odoo-debug-developer-mode-guide)

## 9. Storage: how help content grows without breaking the DB and NO-LFS rules (advice 2026-11-16; owner: *"as we grow will it be 'folded' into (same or new SQLite DB) as migration scripts and organised without breaking the LFS rule in GIthub? Do advice if u have better idea how the DB is organised."*)
**Measured:**
- One language's field translations in legacy (`es_CO`): 21,432 rows, **2,860,334 characters**; element translations: 6,026 rows, 411,933 characters. About **3.3 MB of text per language**, before any Context Help.
- The seed `ad_seed.db` is 27 MB (P1, §2).
- Pages for bim-ootb publishes the **tracked** files; a merge made by the CI token starts only the branch build (`deploy-pages.yml` comment). So anything a browser fetches must be a committed file, not a deploy-time build product.
**Advice: do NOT fold help content into `ad_seed.db`, and do not ship it as ledger migrations.**
- Folding it in grows the one DB every user downloads by about 3.3 MB per language, plus Context Help.
- Ledger migrations (append-only) would replay every past edit of every text forever.
- Help is content that is regenerated and translated, like the guides. It is not schema.
**Instead (text sources in git, a separate per-language DB in the browser, legacy table shapes):**
1. **Source of truth = text, one record per line, in git** (no binary, so NO-LFS is untouched):
   - `erp/help/<lang>/ad_field_trl.jsonl`, `ad_element_trl.jsonl`, `ad_process_para_trl.jsonl`, `ad_ctxhelp.jsonl`, `ad_ctxhelpmsg.jsonl`;
   - sorted by the record's UU (stable key), so a change is a small reviewable diff.
   - English Context Help lives under `erp/help/en/`. Each translated record carries the `source_sha` of the English it was made from, so staleness shows. This is the i18n_sync idea (DOCS_I18N §6f) applied to records, not lines.
2. **Legacy table names and columns,** so the twin reads them the way legacy does. They are never installed into legacy (D3: the original stays untouched for comparison). Origin: the published iDempiere language packs for `*_Trl` (extracted, never typed). Context Help comes from accepted suggestions and owner-approved text.
3. **A separate DB in the browser, not the seed:**
   - After the login has chosen the language (CLI session's rule), the page fetches that language's files once. They are compressed on the wire by the web server, so a zip adds nothing: the "help-pack" is one folder per language.
   - The page loads them into its own `help_<lang>` SQLite (in-browser storage) and `ATTACH`es it beside the seed. The seed is never rewritten.
   - The service worker caches the folder. A `manifest.json` per language (file list + sha) lets the client refetch only what changed: the same self-heal idea as `patches/*.sql`.
4. **The search index is built from the same sources and committed** (`erp/help/<lang>/index.json`), and a witness checks it equals a rebuild. This is the rule the guide's verb table follows (generated, committed, checked).
5. **Writes by users** (a help suggestion) go through the door as `AD_CtxHelpSuggestion` ops in the op-log, like any record. Accepting one is the step that copies it into `erp/help/<lang>/ad_ctxhelpmsg.jsonl` (a reviewed PR).
6. **The CLI reads the same files** (Node, no browser): `help <word>` and the how-to search use one index, one loader.
**Why this is better than one growing DB:**
- The download is per language and only on demand.
- Every change is a text diff.
- No binary is ever committed.
- Translations show their staleness.
- Legacy and the twin read the same records.
- Help content can never corrupt the business data.
**Decided (owner, 2026-11-16):** D1-D4 in ▶ RESUME HERE. Storage accepted; pilot languages fr_FR, de_DE, ja_JP, zh_CN; twin kernel only; the how-to content is this lane's task.

## 10. Help showcase: a thin slice of all four (owner 2026-11-16: *"Try to do all 4 at least a thin slice just to showcase"*)
**Issue it removes:** P1b made the twin's help equal to legacy's, but there is nothing to show beyond that. The four pieces the RESUME HERE design names (help pack per language, question search, auto-links, how-to content) do not exist, so a film has no story. This slice builds each one end to end, small, on real data, so it can be shown and witnessed. It is not the full build; the full build stays in RESUME HERE order.
**Sources (extracted, never invented):**
- Translated field help: the published language packs already used by `erp/tools/build_i18n.py` (cache `~/.cache/erp_trl`, same pinned SOURCES).
  - Measured 2026-11-16, translated element Description / Help (text present and not equal to the English original): de_DE 2,528 / 1,690; fr_FR 1,939 / 1,482 (ADempiere 3.5.2 pack) + 354 / 247 (iDempiere 12 pack); zh_CN 754 / 222; ja_JP 17 / 23.
  - Field resolution = legacy's: a centrally maintained field takes its column's AD_Element translation (SynchronizeTerminology, the rule `erp_i18n.js` already applies to names); otherwise its own AD_Field_Trl row. A field whose translation is missing shows the English text, as legacy does.
- How-to text: `docs/ERPUserGuide.md` "The standard flow" §1-§4 (Sales Order, Shipment, Customer Invoice, Receipt), the sentences copied, the proof asides left out, each row carrying its guide section link.
- Document actions: AD_Ref_List 135 (name, description); statuses: AD_Ref_List 131; when an action is allowed: `AdDocFsm.TRANSITION[action]` (the DocumentEngine port); the CLI line: `common/door/verbs.json`, the verb whose description says `Runs DocAction <code>`, with its own input names.
**What is built (bim-ootb):**
- **H1 help pack + loader.** `erp/tools/build_help_pack.js` writes `erp/i18n/help/<lang>/help.json` for the pilot languages (fr_FR, de_DE, ja_JP, zh_CN) and `en_US` (the how-to rows). Loaded through `ErpI18n` (one loader, D1): `ErpI18n.loadHelp(lang)` when the language is chosen, cached by the service worker. `ErpI18n.applyWindow` puts the translated Description/Help on each field model, keeping the English on `_enDesc`/`_enHelp`, so the P1b setter and panel show them unchanged.
- **H2 question search.** `erp/help_search.js` (pure, page + node): lowercase, drop stop words, match phrases longest-first against the menu's window names and the DocAction names, then rank the how-to rows by term overlap (BM25-like). Answer card: open the window (link), the action (name, description, "allowed when the document is …" from the FSM), the CLI line, the guide section, the best how-to.
- **H3 auto-links.** At pack build time, a window name in how-to text becomes a link to that window (longest name first, whole words). One linker. Legacy dictionary text in the Tool Tip panel is NOT linked (it stays legacy's).
- **H4 how-to content.** `AD_CtxHelp`-shaped rows (`ctxtype` W, `ad_window_id`, name, text, source) for the four trade-cycle windows (143 Sales Order, 169 Shipment, 167 Invoice, 195 Payment). Shown in a second East widget titled AD_Message `HowTo`, where legacy shows Context Help (`HelpController.renderCtxHelp`), for the window in view; the question box sits at its top (a twin extra, allowed by D3). English only in this slice: another language shows the English row marked as English.
**Claims, witness W-HELP-SHOWCASE (bim-ootb `erp/tests/witness_help_showcase.js`; falsifier `HS_BREAK=`):**
- **S1 the pack is extracted.** Every translated text in every pilot pack equals the source pack's text for that row, re-read from the XML by the witness (X of N per language). VACUOUS if a pack is empty. Falsifier `tamper` (one pack value changed in memory) FAILS S1.
- **S2 the language reaches the help.** In the real page, after switching to de_DE, each field of the Sales Order header tab that has a German pack entry shows the German Description as tooltip and in the Tool Tip panel (X of N); a field without one shows the English text. Back to English: byte-identical to before.
- **S3 the search answers.** A fixed question set of real phrasings (e.g. "How do I close a Sales Order?", "complete an invoice", "void a payment") → expected window and action (X of N). Falsifier `nophrase` (no phrase matching) FAILS S3.
- **S4 the links work.** Every link in the how-to text points at a window on the role's menu (X of N); clicking the answer card's window link opens that window (`§IDEMPIERE window=` log). Falsifier `deadlink` FAILS S4.
- **S5 the how-to text is traceable.** Each how-to row names its source, and its guide sentences occur in the guide file (X of N rows).
### §10 RESULT (2026-11-16, bim-ootb #3128 `feat/help-showcase`; logs `erp/tests/logs/witness_help_showcase*.log`, `build_help_pack.log`)
**W-HELP-SHOWCASE 13 pass / 0 fail / 0 inconclusive** (real page served from the repo root, GardenAdmin, 0 page errors):
- **S1:** every pack text found in the published XML by the witness's own reader: de_DE 28,176/28,176 · fr_FR 26,208/26,208 · zh_CN 12,336/12,336 · ja_JP 3,656/3,656.
- **S2:** de_DE on the Sales Order header (tab 186, 60 fields): tooltip 54/54 and Tool Tip panel 54/54 German; 6/6 without a German text show English; back to English byte-identical (60 fields).
- **S3:** 8/8 questions → expected window + action. E.g. "How do I close a Sales Order?" → 143 / CL / `erp.close kind=Order number=<Document No>`; "complete an invoice" → 167 / CO, CLI note "erp.complete is offered for Order (C_Order), not for Invoice".
- **S4:** 9/9 rendered links on the role's menu. Clicking the card link opens window 195 (`§IDEMPIERE window=Payment and Receipt(195)`), and the How To widget follows it (`§HELP_CTX window=195 howto=4`).
- **S5:** 4/4 how-to rows = their guide section word for word.
- **Falsifiers FAIL as claimed:** `tamper` S1 in all 4 languages; `nophrase` S3 0/8 (and S4); `deadlink` S4 4/9.
- **Regressions:** W-FIELD-HELP still 13/0; W-ERP-I18N 7/4, identical to main before this PR.

**Pack (`build_help_pack.log`):**

| Language | Fields with a translation | Distinct texts | Bytes | Stale English original |
|---|---|---|---|---|
| de_DE | 14,961 of 18,153 | 3,374 | 523 KB | 251 |
| fr_FR | 14,262 | 2,860 | 452 KB | 3,494 |
| zh_CN | 9,315 | 835 | 189 KB | 3,256 |
| ja_JP | 3,537 | 81 | 60 KB | 2,020 |

- en_US: 4 how-to rows, 5 links, 13 actions.
- Each text is stored once (the first format was 6.5 MB).
- "Stale English original" = the pack's English source differs from today's English. The translation is applied by id, as legacy does. French and Chinese packs are old (3.5.2), so many are stale.

**Measured / decided while building:**
- `sqlite3 -json` keeps a column's own case when an alias equals the column name (`name` came back as `Name`): use distinct aliases.
- The linker is case-sensitive: lowercase "menu"/"product"/"customer" are words, not windows. A table term links only as a whole bold/code guide term, never to a System-only table ("Process" button ≠ AD_Process).
- Search: several window phrases → the LAST wins (English head noun: "customer payment"); "Re-activate" also matches "reactivate" (hyphen dropped, no synonym); "reverse" names both Reverse actions.
- **Film:** de_DE is the strongest pilot (2,528 element Descriptions). Japanese is too thin.

**Not in this slice (named):** process-parameter translations; the prebuilt search index (built at load here, small); how-to text in other languages; how-to beyond the four windows; Japanese is too thin to film (17 Descriptions).

## 11. Film: "Help that answers" (owner 2026-11-16: *"Do the film, if in foreign language, give English subtitles. Remember the closing card credentials"* · *"Closing card also give a citation how important good Help screens are in an app"* · *"Or as opening card, single quote, cite with stats be good, perhaps from a McKinsey level"*)
**Issue it removes:** the help work of §7 and §10 is live but nobody can see it without being walked through it. A short film shows each piece once, on the real page, with nothing claimed that a log does not say.
**Form:**
- House style (prompts/FILM_NARRATION.md):
  - two frames: above, the typed line and the page's own § log lines; below, the REAL ERP page (headless on the CPU) with the help panel cut from the same pixels, enlarged and labelled;
  - real key sounds on the typing, the voice after the return key (K2);
  - English voice (Kokoro, local), English subtitles.
  - The German screen text is shown beside its English original from the dictionary, so a viewer without German reads both.
- Pipeline: `scripts/film_help_showcase/` (copied from `film_immersive_software`). `shots.js` takes the pictures and the facts from bim-ootb main; `guard.js` fails the build if a spoken fact, a picture or a cited source is not as stated. Films are never pushed; the scripts and logs are.
**Beats:**
1. Cover.
2. **Opening card, one quote with a statistic:** McKinsey Global Institute, *The social economy* (July 2012), *"The average interaction worker spends an estimated 28 percent of the workweek managing e-mail and nearly 20 percent looking for internal information or tracking down colleagues who can help with specific tasks."* The words are checked in the copy fetched from mckinsey.com (Wayback, `out/prior/`); the year is shown.
3. Before → after: the old tooltip line (`ColumnName · referenceType`, from git), then the field's own Description and the Tool Tip panel (W-FIELD-HELP F4 15,849/15,849).
4. Typed question "How do I close a Sales Order?" → the answer card (`§HELP_SEARCH`).
5. The card's window link opens Sales Order with its how-to beside it (`§HELP_LINK`, `§HELP_CTX`).
6. Typed question "How can I void a payment?" → Payment, Void, and the honest CLI note.
7. Deutsch: the same field's Description in German (`§HELP_PACK loaded lang=de_DE fields=14961`), its longer Help still English where the pack has none.
8. **Last card** (HOUSE STYLE):
   - prior art read (legacy `WEditor.java:333`, `HelpController.java:146`, `SynchronizeTerminology.java:166`, the published de_DE pack, the McKinsey report);
   - credentials (#3126, #3128 merged, W-FIELD-HELP 13/0 and W-HELP-SHOWCASE 13/0 on main, MIT, the paper's priority date);
   - measured cost (help pack bytes; heap with / without the German pack after a forced GC);
   - the key-sound credit.
**Not said:** no "AI", "live", "faster", "every language"; Japanese is not shown (too thin).
### §11 RESULT (2026-11-16): `~/Videos/Help_that_answers_ERP_EN_AFTER_2026-11-16_v4.mp4` (117.2 s, 2,813 frames, −16.6 LUFS; not pushed, films stay on the machine)
- **Pictures and facts:** `shots.js` on bim-ootb main `216a3607` drove the real page headless (CPU, 1280×720 at 1.5× scale), 0 page errors; `facts.js` VERDICT PASS (the quote found in the saved McKinsey page; title, authors and date on the saved report's title pages; #3126 and #3128 MERGED; MIT; paper priority date 2026-03-30).
- **Witnessed on that tree:** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 13/0 (logs in `scripts/film_help_showcase/out/`).
- **Checks of the build** (logs in `out/`):

  | Check | Result |
  |---|---|
  | guard (18 spoken facts, 6 musts, 5 prior-art rows, 4 not-said) | PASS |
  | cards (no overflow) | 0 too tall |
  | voice fit | 6/6 question tones OK, 0 SHORT / SKIP |
  | K2 (no voice over the typing, keys audible) | PASS, keys 19 dB under the voice |
  | keys | 54/54 typed + 2/2 returns |
  | frames | planned = encoded |
  | **C, captions stay in the bottom 170 px** (`capcheck.py`) | PASS 24/24 cues; falsifier `CAP_Y=960` FAILs 23/24 |

- **Measured cost on the last card:** heap of a German session with the help pack 47.1 MB vs 46.5 MB without (+629 KB, forced GC, one run each).
- **Defects found and fixed while building (each a rule for the next film):**
  - (1) a *wh*-question rose at its end (§NARR_TONE WRONG): reworded;
  - (2) the voice's letter-spelling ("A I", "E R P") showed in the subtitles: `written.js` writes the caption as "AI" / "ERP", times untouched;
  - (3) a long answer became a four-line subtitle over the picture: every turn ≤ about 95 characters (two lines at 46 px), and check C added;
  - (4) `performance.memory` is rounded to the same bucket without `--enable-precise-memory-info` (both sessions read 50,400,000).


### §11 RESULT, Mandarin cut (2026-11-16): `~/Videos/Help_that_answers_ERP_ZH_AFTER_2026-11-16_v4.mp4` (119.3 s, 2,864 frames, −16.6 LUFS), sent to the owner's phone (Remote Control file card)
- **Form:**
  - Mandarin voice (Edge TTS, zh-CN Xiaoxiao / Yunxi; the text goes to Microsoft, free, cached);
  - Chinese subtitles with the English line under each (owner: *"if in foreign language, give English subtitles"*);
  - the language beat is 中文 (zh_CN) on the Sales Order **Description** field: the pack has its description and its help. Document No has no Chinese text and is shown falling back to English (measured, guard `lb.fallback`).
- **The same pipeline serves both cuts:** `LB_LANG` / `LB_COL` / `OUTD` / `FILM_LANG`. The cards carry a string table (Chinese labels, source names and code unchanged); prior-art rows carry `does_zh` / `took_zh`, and a `lang` row per language pack. The last card says the Chinese words are the build session's, not a native speaker's.
- **Witnessed on the tree the film shows (main `bd5b543c`):** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 13/0.
- **Checks:**

  | Check | Result |
  |---|---|
  | guard | PASS (the English cut's guard re-run after the refactor: PASS) |
  | K2 | PASS |
  | keys | 54/54 + 2/2 |
  | gloss | 23/23 turns carry their English |
  | ass_noverlap | 27 events clamped, 0 overlaps left |
  | check C | 34/34; falsifier `CAP_Y=960` FAILs 33/34 |
  | heap | +682 KB with the zh_CN pack |

- **Defects found and fixed (rules for the next cut):**
  - (1) a Chinese line and its English as TWO events: libass stacks overlapping events and one lands on the picture (C failed 24, then 39 cues). One event per piece, `中文\N{\fs26}English`, fixes it.
  - (2) the fitter's turns overlap by up to 0.13 s, and libass keeps a pushed-up event there for its whole life. The Mandarin path now runs `ass_noverlap.py` like the English one.
  - (3) the guard compared raw dictionary text with the panel. The panel shows it as the browser does (`<TableName>` dropped, whitespace collapsed), so the guard compares after that same step (`asShown`).
  - (4) the narration named Document No as 单据号, but the screen says 文档号: the voice now uses the on-screen name.

## 12. The help in the chosen language: names, questions, how-to (owner 2026-11-16: *"Isn't there a Mandarin version of the Help content? The Mandarin should show in Mandarin on the app too"*)
**Issue it removes:** with the screen in 中文, the field help is Chinese (§10), but the How To widget is not:
- the question box matches English names only, and a Chinese question finds nothing;
- the answer card's labels and the how-to rows are English.

**Sources (extracted):**
- the same published packs as §10: AD_Window_Trl, AD_Table_Trl, AD_Ref_List_Trl (DocAction 135, DocStatus 131), names only;
- the descriptions in the zh_CN pack are untranslated English (measured: the Close row's Description equals its original), so the English description shows, as legacy shows it;
- labels: the dictionary's own element names where one exists (AD_Window_ID 窗口, DocAction 文档动作), otherwise a labelled machine entry in `i18n/chrome.json` (the existing convention).

**Measured pack quality, said and not hidden:**
- the zh_CN pack (ADempiere 3.5.2, 2008) names Close 结束, Void 空白, Post 职位, Prepare 程序, Reverse-Correct untranslated;
- its statuses are Closed 关闭, Completed 完成, Voided 空虚.

These are legacy's own words in that language; the twin shows them unchanged.

**Built (bim-ootb):**
- **H1b, per-language names in the help pack:**
  - `names.windows`, `names.tables`, `names.actions` (code → name), `names.statuses` (code → name), each from that language's XML;
  - `howto` rows for zh_CN: the four §10 rows translated by the build session (source `erp/tools/help_howto_zh_CN.json`, each row `translated: build session, not reviewed`, its English source sentences kept), window names linked by the same linker with the Chinese names.
- **H2b, the search in the screen language:**
  - the index takes the language's names beside the English ones;
  - a question containing CJK text is matched on characters (phrase = substring, longest first), not on spaces;
  - a status name also finds the action that reaches it (`AdDocFsm.TRANSITION`: Closed ← Close, Voided ← Void, Completed ← Complete), a dictionary relation, not a synonym list;
  - no exact window phrase: the window sharing the most character pairs (ties as before).
- **H4b:** the How To widget shows the screen language's how-to row when the pack has one, otherwise the English row marked "(English)". The card's labels follow the language. The index is rebuilt when the language changes.

**Claims, W-HELP-SHOWCASE S6-S7 (falsifier `HS_BREAK=nocjk` → S6 FAILs):**
- **S6:** a fixed set of Chinese questions → expected window + action (X of N).
- **S7:** with zh_CN chosen, the How To widget of Sales Order shows the zh_CN row, and every link in it points at a window on the menu.
- **S1 extended:** every name in a pack occurs in its published XML.

### §11 RESULT, Mandarin cut v2 (2026-11-16): `~/Videos/Help_that_answers_ERP_ZH_AFTER_2026-11-16_v5.mp4` (119.2 s, 2,861 frames, −16.5 LUFS), sent to the owner's phone
- **Owner's corrections it answers:** *"The Mandarin should show in Mandarin on the app too"* · *"can its CLI also asks in Mandarin"*.
  - The screen is 中文 from login (`UI_LANG=zh_CN`). The questions are typed in Chinese: 「如何关闭销售订单？」 → 销售订单 / 结束 / 完成, 等候付款; 「怎样完成一张发票？」 → 发票(客户/公司) / 完成.
  - The Sales Order how-to is the zh_CN row, with its translated-by-the-build note.
  - The before beat is the Description field in Chinese.
  - A new last beat types `cd Order; ask 如何关闭销售订单？` at the red1 prompt. Its output is red1's own real answer (LANG=zh_CN, by=LANG): the Chinese card.
- **Witnessed on the tree the film shows (main `f79058ee`):** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 20/0, W-ERP-ASK 10/0.
- **Checks:**

  | Check | Result |
  |---|---|
  | guard | PASS (CLI facts: window 143, CL, zh_CN/LANG, harm read) |
  | K2 | PASS, 3 typed beats |
  | keys | PASS |
  | gloss | PASS |
  | ass_noverlap | 0 left |
  | check C | 33/33 |
  | frames | 2,861/2,861 |
  | heap with the zh_CN pack | +835 KB |

- **Seen on the frame, fixed after:** the panel's own words (Tool Tip, How To, the idle *Place your cursor…*) were English. The zh_CN pack holds none of the three, so the film is legacy-faithful. But the de/fr packs DO hold *Place your cursor…*, and the page ignored them; fixed in bim-ootb #3137 (S2c, falsifier `nomsgtrl`).
- **Measured cost of the language immersion** (owner: *"is this costly to do"*), this machine (i5-13500HX), the page's own code on an in-memory seed:

  | Measure | Value |
  |---|---|
  | download, the chosen language once, then cached (gzip) | de 152 KB, fr 133 KB, zh 60 KB, ja 19 KB, en how-to 2 KB |
  | heap after a forced GC | +0.6–0.8 MB on ~48 MB |
  | parse + index build on a switch | 4–8 ms |
  | one question | median 0.3–0.8 ms, p95 ≤ 2.1 ms |
  | `erp.ask` at the terminal | ~1 s, the engine boot |

  The cost that remains is content: how-to translations per language, and old packs' words.

### §11 RESULT, German cut (2026-11-16): `~/Videos/Help_that_answers_ERP_DE_AFTER_2026-11-16_v1.mp4` (132.3 s, 3,176 frames, −16.3 LUFS), sent to the owner's phone
- **Owner:** *"Do a German version"*.
  - Deutsch from login; Edge TTS de-DE Katja / Conrad; German captions with the English line under each (one event per turn; each German turn is one line, ≤ 68 characters).
  - Questions: *Wie kann ich einen Auftrag schließen?* → Auftrag / Schließen / Fertiggestellt, Zurückgehaltene Zahlung; *Wie kann ich eine Rechnung fertigstellen?* → Rechnung (Kunde) / Fertigstellen.
  - The Sales Order how-to in German; the Description field in German, both lines translated.
  - The red1 beat `cd Order; ask "Wie kann ich einen Auftrag schließen?"` gives the real German card (LANG=de_DE).
- **App side first** (bim-ootb #3138): the de_DE how-to rows, German card labels, the German question set in both witnesses.
  - W-HELP-SHOWCASE 23/0 (S6de 5/5, S7de); W-ERP-ASK 11/0 (A2de 5/5).
  - A translated row links a window name only as a whole bold term, in every language.
  - #3137 made the panel's own words come from the pack's AD_Message_Trl, so the idle line reads *Setzen Sie den Mauszeiger in ein Feld auf dem Bildschirm*.
- **Witnessed on the tree the film shows (main `f869e430`):** W-FIELD-HELP 13/0, W-HELP-SHOWCASE 23/0, W-ERP-ASK 11/0. Credentials: #3126 #3128 #3133 #3136 #3138, all MERGED.
- **Checks:**

  | Check | Result |
  |---|---|
  | guard | PASS |
  | K2 | PASS, 3 typed beats |
  | keys | PASS |
  | gloss | PASS |
  | ass_noverlap | 0 left |
  | check C | 31/31 |
  | frames | 3,176/3,176 |

- **Heap of a German session with the pack: +1.29 MB** (forced GC, one run). The pack now also carries names and how-to rows; the earlier +629 KB was before those.
- **Pipeline:** `gloss.js` serves any non-English cut (`FILM_LANG`); `build.sh` runs gloss → ass_noverlap for it; `cards.js` has a de string table; `priorart.json` has `does_de` / `took_de`; a CLI question with spaces is quoted.

### §12 RESULT (2026-11-16, bim-ootb #3133 MERGED): W-HELP-SHOWCASE 20/0
- **Names per language, from each language's XML:** fr 254 windows / 453 tables / 13 actions / 12 statuses; de 349 / 0 / 13 / 12; ja 288 / 0 / 13 / 12; zh 250 / 5 / 11 / 12.
- **S1 extended to names:** fr 732/732, de 374/374, ja 313/313, zh 278/278.
- **zh_CN how-to:** 4 rows (`erp/tools/help_howto_zh_CN.json`), each marked as the build session's translation, with 4 links, all bold window names.
- **S6** 7/7 Chinese questions (one English question asked with 中文 chosen). **S7** the Sales Order row in zh_CN, links 1/1.
- **Falsifiers:** `nocjk` FAILs S6 (1/7); `tamper` FAILs S1 and the names in all 4 languages; `nophrase` and `deadlink` FAIL as before.
- **Regressions:** W-FIELD-HELP 13/0; W-ERP-I18N 7/4, the same failures and numbers as main.

**Measured / decided:**
- CJK has no case, so a CJK window name links only as a whole bold term. 菜单 ('menu') and 产品 ('product') are words; they matched the Menu and Product windows before this rule.
- A status name finds the action that reaches it through `AdDocFsm.TRANSITION`: 关闭 (the status Closed) → Close, whose pack name is 结束. This is the dictionary's own relation, not a synonym.
- The zh_CN pack's action descriptions are untranslated English, so the English shows, as legacy shows it.
- **Known gap, not hidden:** the zh_CN pack has no word for "void" (Void = 空白, Voided = 空虚). 「作废」 finds the window but no action; it is left out of the fixture.

## 13. The CLI asks in the chosen language: `erp.ask` (owner 2026-11-16: *"can its CLI also asks in Mandarin or local chosen language?"* · *"u can take it on after informing the CLI session, as it be resting"*)
**Issue it removes:** the question box exists only in the page; a person at the terminal (or `red1`) cannot ask "How do I close a Sales Order?" or 「如何关闭销售订单？」.
**Design:**
- the door gets one read verb, `erp.ask question=<text>`, that calls the SAME `erp/help_search.js` over the same dictionary and the same help pack of the CLI's chosen language;
- the language follows the CLI's own rule (owned by the CLI session, `CLI_ERP_IVR.md`: AD_Preference Language → LANG → System);
- the answer prints the card as lines: window, action and when it is allowed, the CLI line, the guide link, the how-to text (tags stripped);
- English output stays byte-identical for every other verb.

**Coordination:** the CLI session owns `common/door`. It is resting (not running, 2026-11-16), so it is informed by a dated note in its own prompt file `prompts/CLI_ERP_IVR.md` before any door file is touched (owner's instruction above).
**Claims, witness W-ERP-ASK:**
- A1: the English question set gives the same window and action as the page's S3;
- A2: the Chinese set (LANG=zh_CN) gives S6's answers;
- A3: verbs.json lists the verb and the door's download includes help_search.js.
- Falsifier `ASK_BREAK=nolang` (the pack's names ignored): A2 FAILs.

### §13 RESULT (2026-11-16, bim-ootb #3136): W-ERP-ASK 10/0
- **Built:** `erp_cli.js ask` over `help_search.js indexFrom` (the page's own index builder); `common/door/lang_rule.js`, the §30 order written once.
  - Measured: the seed has no client 0 row, so step (3) falls to the role's client, then en_US, and the answer names the step.
  - `erp.ask` lives in `vocab/hand.json`; `verbs.json` is composed from it (compose `--check`: CURRENT).
  - The red1 word `ask` is in the ERP context (W-RED1-WORDS R2: an anywhere-word reaches only model/ninja), used as `red1 'cd Order; ask …'`.
  - The answer's `summary` is the card red1 prints, with the page's `help.*` labels resolved as `ErpI18n.t` resolves them.
- **Checks:**
  - A1 8/8 English questions through the door; A2 7/7 Chinese; the L order (flag, LANG, fallback, preference on the rule); A4 the zh/en cards; A3 a read, an AI gets the answer.
  - Falsifier `ERP_BREAK=nolang` FAILs A2 and L (named `ERP_BREAK`, not `ASK_BREAK`: `erp_cli`'s one falsifier switch).
  - Corrected claim: the door's flat download does NOT need `help_search.js`, because `erp_cli` already runs from the repo (it loads the ERP engine). A3 checks the verb's harm and actors instead.
- **Door witnesses on the branch:**
  - pass: W-ERP-VERBS 46/0 (its explicit verb list and subcommand regex gain `erp.ask` / `ask`, as each new verb does), W-RED1-WORDS 3/0, W-VOCAB-COMPOSE 7/0, door static / honest / help, msg-door, red1 api / help / shell / welcome / post, help-student, msg-catalog, W-HELP-SHOWCASE 20/0;
  - fail identically on main `14ade155` (local setup): W-MCP-DOWNLOAD (puppeteer), W-RED1-REPORT (`sql.js`).
- **Defect found and fixed:** a JSON rewrite of `words.json` reflowed the CLI session's hand-aligned file (+572 / −71). It was reverted, and the entry inserted as text in the file's own style (+3 / −1).

## 14. The BIM help panel (Viewer + Modeller): SPEC STUB, owner-agreed design, (a) to check (2026-11-16)
**Issue it removes:** the ERP now has field help, How To, a question box and languages (§7, §10-§13). The BIM apps have only:
- a pill palette (Viewer);
- an English-only toolbar sheet and a hard-coded English guide overlay (Modeller);
- no description of any element class at all.

**Surveyed facts (read-only survey of bim-ootb origin/main, 2026-11-16; cite, do not re-derive):**
- **Viewer:**
  - Help pill `{id:'help', key:'F1'}` (`viewer/panels.js:1355`) opens the command palette (`viewer/scene.js:2907`), a search over pill actions (`_mainPillActions` about `scene.js:2985`) with a guide link (`scene.js:2952`). F1 and `?` both open it (`scene.js:3635`, `:3734`).
  - Pill bullets `children:[{name}]` (`panels.js:1340-1365`), translated as `pillc_<id>_<n>` (`panels.js:1580-1583`).
  - Tooltips `data-trl-title` (`viewer.html:576-586`, keys `ui_tt_*`).
  - `#info-panel` shows the selection: class, name, GUID, storey, discipline, material (`viewer.html:515-535`, filled by `nf_panel_search.js:680`). It sits at bottom 50px / right 70px; on mobile it is 120-180 px wide (`viewer.html:157-166`, `:408`, `:461`).
  - `viewer/hover_name.js`: an opt-in hover label (`'` key).
  - 18 locales (`viewer/locale_loader.js` `AVAILABLE_LOCALES`), labels in `viewer/i18n/<code>.json`, built from AD_Message base + `AD_Message_Trl_<lang>.xml`; `window._trl`.
- **Modeller:**
  - `#m-help` / `#m-help-panel` (`modeller.html:74-87`, `:6571-6617`): the toolbar registry + hard-coded `SHORTCUTS` (`:6572`).
  - `#b-guide` / `#m-guide-panel` (`:181`, `:6365-6420`): about 11 hard-coded `SECTIONS`.
  - `modeller/props_panel.js` `#pp-panel` shows the selection.
  - Hover fires `dagevu:hover {fid}` (`modeller.html:1723-1731`); its only consumer is `edit_delta_ui.js:82`.
  - The right side is crowded (`right:70px`: pp-panel, help, guide, hist). No mobile media queries.
  - Translates by exact-string match through the Viewer's dictionary (`modeller.html:325-326`, `locale_loader.js:439+`), no `_trl()` calls.
- **No help-grade element / class description data exists** in viewer/, modeller/, common/ or erp/ (`dagevu_catalog.json` has labels only).
  - Real descriptions exist only in: `common/door/verbs.json` (title, description, input descriptions, examples), `vocab/words.json`, `modeller/element_defaults.json` labels and notes, and the pill bullets.
- **Reuse:**
  - `erp/field_help.js` (`window.FieldHelp`, no deps; `attach(el, f)` is generic, `attachIn` is ERP-crud markup) and `erp/help_search.js` (`makeIndex` / `indexFrom`, no DOM) are portable logic.
  - The panel DOM, pack loading and card rendering live in `erp/idempiere.html` and would be extracted.
  - A new JS file must be added to `viewer/sw.js` and `modeller/sw.js` shell lists.

**(a) RESULT, licence checked 2026-11-17 (reported to the owner; nothing built on it yet):**
- **The terms.** buildingSMART's own IFC documentation cover page (`content/cover.md` in `buildingSMART/IFC4.x-development`, last changed 2026-10-01, `23bea5e6d0`; same text on the IFC4.3 HTML cover page): *"The Industry Foundation Classes are published under Creative Commons Attribution-NoDerivatives 4.0 International (CC BY-ND 4.0)."* and *"Prior written consent is required if you want to use IFC and/or the documentation in situations that are not covered by the CC BY-ND 4.0 license."* The IFC4.3 repo README says the same for the formal releases.
- **CC BY-ND 4.0, the clauses that decide it:** §1(a) *"Adapted Material … in which the Licensed Material is **translated**, altered, arranged, transformed, or otherwise modified"*; §2(a)(1) we may *"reproduce and Share the Licensed Material, in whole or in part; and produce and reproduce, but **not Share, Adapted Material**"*; §3 *"You do not have permission under this Public License to Share Adapted Material."*
- **Verdict:**
  - **Shown in English, word for word, in whole or in part: USABLE**, with attribution (buildingSMART International, CC BY-ND 4.0, licence link, link to the source page; IFC™ credited as a trademark).
  - **Translated into any of our languages: NOT USABLE** without buildingSMART's prior written consent (contact@buildingsmart.org). A translation is Adapted Material, and we may not share it.
  - **Reworded or shortened into our own sentences: NOT USABLE** as their text. That is (b): we write our own.
  - **Not covered:** the parts the cover page marks as based on other standards are outside buildingSMART's copyright; their own terms apply.
- **Not read (gap, said plainly):** the bSI IP Policy PDF the cover page refers to. The CDN gave 403 and the web archive gave 429. The verdict rests on the licence text alone; read the IP Policy before relying on anything beyond verbatim English.
- **What it means for the design (an owner choice, not decided):** (b) is the only route to a translated class text. (a) can at most be an English-only "IFC definition" quote, or just a link to the class's bSI page. A link is always allowed.
- **Saved copies:** `~/bim-compiler/build/bim_help_prior/` (not tracked): the cover page in two copies (repo `cover.md` + archived IFC4.3 HTML), the dev repo's LICENSE.md + README, the CC BY-ND 4.0 legal code (html + txt), and `fetched_at.txt`.

**(a) DECIDED (owner, 2026-11-17, verbatim):** *"We proceed with community licensed IFC info as we are a FOSS non commercial prototype. https://forums.buildingsmart.org/t/proper-way-to-access-translations-of-ifc-entities/4092"*
- **The thread's answer** (post 4, buildingSMART 2022-02-09): official translations are made on `translations.buildingsmart.org` and published on GitHub, in bSDD and through an API. We therefore COPY buildingSMART's own published translations, word for word. We never translate IFC text ourselves. This keeps both the Prime Rule (extract) and ND (we share their material, not an adaptation).
- **Source = bSDD IFC 4.3**, `https://identifier.buildingsmart.org/uri/buildingsmart/ifc/4.3`, licence `CC BY-ND 4.0` per the API, status `Preview`, released 2024-01-11. It lists 18 languages: EN de-DE es-ES ja-JP nl-NL no-NO pt-PT ru-RU zh-CN it-IT pl-PL da-DK cs-CZ pt-BR sv-SE hr-HR is-IS tr-TR. Fetch: `GET api.bsdd.buildingsmart.org/api/Class/v1?Uri=…/class/<IfcClass>&languageCode=<code>`. A missing language comes back as the English text, so "translated" = it differs from EN.
- **MEASURED 2026-11-17** (`build/bim_help_prior/bsdd_cov.log`, data `bsdd_ifc43_shipped_classes.json`; population = 51 distinct `ifc_class` over the 11 shipped `viewer/buildings/*_extracted.db`, list in `shipped_ifc_classes_distinct.txt`):
  - In bSDD 4.3: 48/51. Missing: `IfcWallStandardCase` (removed from IFC 4.3), plus `IfcFlowInstrumentType` and `IfcSensorType`. **Corrected 2026-11-17:** those two are not old names; bSDD leaves out every `…Type` class (`IfcWallType`, `IfcBeamType` and `IfcSensorType` all return 400; `IfcSensor` and `IfcFlowInstrument` return 200). Mapping a type to its occurrence class needs a cited rule, never a guess.
  - Definition translated, of 48: **pt-BR 46, es-ES 31, de-DE 9, ja-JP 9, zh-CN 0, fr-FR 0** (fr is not in bSDD's list; zh-CN is listed but empty for all 48).
  - Viewer locales that bSDD covers at all: de, es, zh, ja, pt_BR. Not covered: fr, ms, th, ko, ar, id, bn, bl, af.
- **Consequence for the panel:** the class text shows in the chosen language where bSI has it; otherwise in English, with a visible "English (no official translation)" label. It is never machine-translated. Attribution line on every card. (b) stays for our own Help, the things IFC does not say.
- **Next to spec:** the cached pack (the bSDD rows written once into a file per language at build time, never fetched live by the page); the label rule; the witness (X of N shipped classes with a text; per language: X translated; falsifier = a zh-CN card that claims to be translated).

**Build order (owner "Agree", 2026-11-17):** 1 "This element" (c) → 2 How To → 3 class text = our own (b) on top, bSI's official (a) beneath (chosen language where bSI has it, else English labelled).
**FINDING 2026-11-17: step 1 (c) is ALREADY BUILT, in the Viewer's `#info-panel` (bim-ootb `origin/main` `ed092608`). Do not build a second one.**
- Base rows: class, name, GUID, building, storey, discipline, material (`viewer.html:521-527`), plus a `· provisional` mark (`ProvTotals`, `nf_panel_search.js:687`, `picking.js:628`).
- Sibling blocks, each with ONE renderer that both picks call, and each hidden when there is no row:
  - `#info-cost`: the cost line (`NF._showClassCost`, §FIND_INFO_COST);
  - `#info-4d`: the 4D task window (`info_4d_panel.js` via `NF._show4DWindow`);
  - `#info-dxf2bim`: drawing provenance drawn / derived / assumed, source sheet and handle, size basis (`info_dxf2bim.js`; callers `picking.js:652`, `find_erp_push.js:248`).
- So (c) = this panel. A help-dock "This element" part that copied it would be a second implementation of one responsibility.
- **Proposed instead (for the owner):** the class text (b)+(a) becomes one more sibling block, `#info-class-help`, with its renderer in the `info_dxf2bim.js` convention (dual-mode, both picks delegate, hidden when there is no row). The `?` dock keeps How To + the question box and refers to the selection instead of repeating it.

**Decisions:** the design in RESUME HERE FIRST (owner "Agree", 2026-11-16).
- (b) our own element dictionary — AGREED;
- (c) per-element provenance — AGREED;
- (a) IFC documentation text — CHECK THE LICENCE FIRST and report.

**To spec next (before code):**
- the element dictionary's shape (rows keyed by IFC class, PredefinedType where it matters; Description, Help; source per row; written once);
- its first content (the classes the shipped buildings actually hold, counted from their DBs);
- the adapters;
- the move to `common/help/` without changing the ERP's witnessed behaviour (W-FIELD-HELP 13/0, W-HELP-SHOWCASE 23/0, W-ERP-ASK 11/0 must stay green);
- the witness: X of N pills with How To text; X of N element classes in the shipped buildings with a (b) entry; (c) shown for a sample of selected elements; the question set per app; the mobile sheet.

## 14.1 SPEC: the class-text block in the Viewer info panel (owner 2026-11-17: chose "Info panel" for the class text)
**Issue it removes:** clicking an element tells you WHERE it is, WHAT it costs and WHEN it is built (`#info-panel`, §14 FINDING), but never what this KIND of element is. No class description exists anywhere in viewer/, modeller/, common/ or erp/ (§14 survey).

**Where:** a new sibling block `#info-class-help` in `#info-panel`, right under the base rows. ONE renderer `viewer/info_class_help.js`, in the `info_dxf2bim.js` convention:
- dual-mode (browser global `InfoClassHelp` + `require()`);
- called by BOTH picks, next to `InfoDxf2Bim.render` (`picking.js:652`, `find_erp_push.js:248`);
- hidden when the class has no row, never an empty box.
- Viewer only. The Modeller has no info panel; it comes with the `?` dock.

**Data: rows in the ONE existing label pipeline, no second loader, no loader change.** Rows are added with `viewer/tools/trl_add_batch.js` to `ad_message_base.csv` + `AD_Message_Trl_<lang>.xml`, then `build_trl.js` builds the packs. Per IFC class `<C>`:
| key | text | translated rows (`trl="Y"`) |
|---|---|---|
| `ifccls_<C>` | (b) OUR one or two plain sentences: what this kind of element is, for a site or office user | pilot fr_FR de_DE ja_JP zh_CN (machine, Claude, labelled in the XML header as every Viewer batch is); other locales `trl="N"` = English, counted |
| `ifcdef_<C>` | (a) buildingSMART's definition, VERBATIM from bSDD IFC 4.3 | ONLY where bSDD has an official text differing from EN (measured: de 9, es 31, ja 9, pt_BR 46, zh 0, fr 0); every other locale `trl="N"` |
| `ifcdef_<C>_lang` | the bSDD language code of the shown (a) text: base `EN`; `de-DE` etc. where the official text is used | same rows as `ifcdef_<C>` |

UI words (ours, translated like any label): the heading for (b), the heading "IFC definition", the line "English: no official translation in your language", the credit line "buildingSMART IFC 4.3 (bSDD), CC BY-ND 4.0" with the class's bSDD link.

**Population:** the 51 distinct `ifc_class` of the 11 shipped `viewer/buildings/*_extracted.db` (`build/bim_help_prior/shipped_ifc_classes_distinct.txt`). (a) exists for 48: `IfcWallStandardCase`, `IfcFlowInstrumentType` and `IfcSensorType` are not in bSDD 4.3 and get (b) only. A class outside the 51 (an imported IFC) gets no block and logs `skip reason=no_row`.

**The label rule (one place, in the renderer):**
- (a) is shown with the "English: no official translation…" line iff `_trl('ifcdef_<C>_lang')` is `EN` and the chosen locale is not English.
- The credit line is always shown under (a).
- (a) is never reworded, shortened or machine-translated.

**Size:** (a) English is 10.8 kB for 48 classes (longest 588 chars). It goes into each label pack, about 45 kB today.

**Log:** `§CLASS_HELP guid=… class=… ours=Y|N ifc=Y|N ifc_lang=<code> locale=<code>`, one line per render.

**Witness W-CLASS-HELP (`viewer/tests/witness_class_help.js`), each check naming the issue it proves:**
1. **Coverage:** X of N shipped classes have `ifccls_` (expect 51/51) and `ifcdef_` (expect 48/51). N is counted from the DBs at run time, never typed in. N = 0 → INCONCLUSIVE.
2. **Verbatim (a):** every `ifcdef_<C>` text in every pack equals bSDD's text for that class and language, byte for byte. Oracle: `bsdd_ifc43_shipped_classes.json`, copied into the repo as the batch's source. Falsifier: change one character and the check must FAIL.
3. **Honest coverage:** per locale, the count of `trl="Y"` `ifcdef_` rows equals the bSDD measured count.
4. **Label rule, rendered in node with a fake DOM:**
   - IfcWall in de_DE → German text, no fallback line;
   - IfcWall in zh_CN → English text + the fallback line;
   - IfcWallStandardCase → (b) only, no (a);
   - an unknown class → hidden.
   - Falsifier: a zh card without the fallback line must FAIL.
5. **Both picks call the renderer:** the two call sites are present, and a live page pick logs `§CLASS_HELP`.
6. **No regression:** `build_trl.js --check` and W-VIEWER-I18N stay green.

### 14.1 RESULT (2026-11-17): BUILT, bim-ootb #3150 (`feat/class-help-info`)
- **Files:**
  - `viewer/info_class_help.js` (renderer, `model()` / `html()` exported for the witness);
  - `#info-class-help` in `viewer.html`;
  - calls in `picking.js` and `find_erp_push.js`;
  - batches `viewer/tools/trl_batch_2026-11-17_ifcdef.js` (generated from `ifc_class_help/bsdd_ifc43_shipped_classes.json`, the bSDD copy, which is also the witness's oracle) and `trl_batch_2026-11-17_ifccls.js` (our 51 sentences, fr/de/ja/zh + 3 panel words in 14 languages);
  - LOCALE_VERSION 8→9, sw v1715→v1716.
- **(a) is folded** (`<details>`, closed): the bSI texts run up to 588 chars, and the info panel is 120-180 px wide on mobile.
- **W-CLASS-HELP PASS** (`viewer/tests/witness_class_help.js`):
  - contract kit 7/0 over 918 rows (51 classes × 18 packs), red control caught (one character changed in the German IfcWall text; a zh card without its fallback line);
  - `§CLASS_HELP_COV`: de 9 official / 39 fallback, es 31/17, ja 9/39, pt_BR 46/2, zh 0/48, fr 0/48;
  - C4a-d named cases;
  - C5 real Find pick on Duplex: de_DE shows the German bSI text, no fallback line; zh_CN shows our Chinese sentence + English bSI text + fallback line. Credit is shown in both.
  - The pick loop clicks results until `#info-class` reads `IfcWall`, because the Find list mixes in IfcWallStandardCase.
- **Found on main, fixed in the same PR:** bim-ootb #1937 added 4 `pill_roadstd` rows to `ad_message_base.csv` but to no `AD_Message_Trl_*.xml`, so `build_trl.js` threw on main since 2026-10-07. They were added as `trl="N"`.
- **W-VIEWER-I18N** (de_DE, zh_CN): clean main fail=5, branch fail=3. Leaks are unchanged (23/308, 23/310). The 3 left pre-exist and are other lanes':
  - (3b) unknown keys `ui_export_bcf`, `wi_store_changed`;
  - (3c) `pillc_lod400_*` not in the CSV;
  - erp9-zero-leaks (roadstd untranslated + 19 uncatalogued).
- **Open (owner):**
  - (i) The German bSI IfcWall text cites ISO 6707-1 (1 of 48 × 6 languages mentions ISO). The cover page's Copyright Exclusion Notice says such parts sit outside bSI's copyright. Shown verbatim for now.
  - (ii) Type classes (`IfcSensorType`, `IfcFlowInstrumentType`): map to their occurrence class only with a cited rule.
  - (iii) (b) in the 13 non-pilot languages: on the owner's word.
- **Next in the agreed order:** step 2, How To in the `?` panel.

## 14.2 SPEC + RESULT: type classes and the other 10 languages (owner 2026-11-17: *"Your advice on all 3."* then *"proceed"*)
**Owner answers on the three §14.1 open items:**
- (i) The ISO 6707-1 note in the German IfcWall text: KEEP, verbatim. No change.
- (ii) Type classes: borrow the occurrence class's bSDD text, and SAY SO on screen.
- (iii) Our sentence in the other languages: translate now, machine, no human review (the guides rule).

The written spec follows the agreement made in chat and comes before the merge; it records what was agreed.

**(ii) Type classes.**
- **Rule (cited, not guessed):** each type's own IFC 4.3 page says *"Occurrences of **IfcSensorType** are represented by instances of _IfcSensor_"*, and the same for `IfcFlowInstrumentType` → `IfcFlowInstrument` (`docs/schemas/domain/IfcBuildingControlsDomain/Entities/<Type>.md` in buildingSMART/IFC4.3.x-development, copies saved in `viewer/tools/ifc_class_help/`).
- The mapping lives in `type_of.json`: type → occurrence class + cited sentence + saved file. The batch refuses to build if the sentence is missing from the saved page.
- **Rows:** `ifcdef_<Type>` = the occurrence class's bSDD text, verbatim (`bsdd_ifc43_type_of_classes.json`). `ifcdef_<Type>_lang` = its language. `ifcdef_<Type>_of` = the occurrence class.
- **Panel:** the heading is "IFC definition of {cls}" (new word `ui_cls_ifcdef_of`, 14 languages), and the bSDD link goes to the occurrence class.
- **bSDD measured:** IfcSensor and IfcFlowInstrument are official in pt-BR only.
- `IfcWallStandardCase` stays (b) only: it was removed from IFC 4.3 and bSDD has no row for it.

**(iii) Ten more languages.** ms_MY es_ES th_TH ko_KR ar_SA pt_BR id_ID bn_BD bl_BD af_ZA, one Sonnet agent per language.
- The agents read the English, looked up building words in each language's existing Viewer XML, and wrote JSON verified at 51/51 keys.
- English synonym pairs such as "lift (elevator)" are not carried into translations.
- **New tool `viewer/tools/trl_fill_batch.js`:** it fills `trl="N"` rows of EXISTING keys. `trl_add_batch.js` only adds new keys. The fill tool:
  - is idempotent;
  - REFUSES to overwrite an existing translation (edit the XML for that);
  - keeps untouched rows byte-identical;
  - adds a source line to the XML header.

**Witness W-CLASS-HELP, extended:**
- C1-C3 are type-aware.
- **C6:** a type shows its cited occurrence class, named in the heading and the link.
- **C7:** `ifccls_` rows are trl=Y for all shipped classes in every non-English XML, and in none of the en_* XMLs.
- **C8:** a fill re-run fills 0, and an overwrite is REFUSED with every XML hash unchanged.
- Red control: also a type card hiding its source class.

**RESULT 2026-11-17 (bim-ootb `feat/class-help-types-langs`):**
- **W-CLASS-HELP PASS:** contract 8/0 over 918 rows, red control caught; C4a-d, C6a, C7, C8 pass; C5 real Find pick de_DE + zh_CN.
- **Coverage:**
  - `§CLASS_HELP_COV`: (a) 50/51 (was 48); official: pt_BR 48, es 31, de 9, ja 9, zh 0, fr 0.
  - `§CLASS_HELP_TRL`: our sentence 51/51 in all 15 non-English locales.
- **W-VIEWER-I18N** (th_TH, pt_BR): fail=3, the same 3 that pre-exist on main (§14.1 RESULT). Format passes. Leaks 23/309 and 23/312.
- **Pack sizes** (`§TRL_PACK_SIZE`, owner asked 2026-11-17):

  | locale | raw | gzip |
  |---|---|---|
  | en_MY | 63.6 kB | 20.7 kB |
  | de_DE | 68.6 kB | 23.2 kB |
  | th_TH | 102 kB | 24.5 kB |
  | bn_BD | 104 kB | 25.0 kB |

  - Before §14.1 a pack was about 42-50 kB raw and 15-17 kB gzip.
  - The site serves gzip (live de_DE content-length 23302).
  - A pack is fetched once per language, then cached 7 days + by the SW.
  - Negligible beside a building's MB of DBs. A lazy class-text file would need a second loader (ruled out).
- LOCALE_VERSION 9→10, sw v1716→v1717.

## 14.3 SPEC: step 2, How To in the Viewer's `?` palette (owner 2026-11-17: *"Proceed"*)
**Issue it removes:** the `?` / F1 palette (`viewer/scene.js` `showCommandPalette`) lists every pill with its key and its short bullets (`children`, translated `pillc_*`). It links only to the WHOLE user guide (`#cmd-docs`). It never says where in the guide a tool is explained, or what the same answer is at the CLI. Its search matches only names and keys, so a word that is only in a bullet ("distance") finds nothing.

**Slice (the dock is later):** the palette IS the agreed question box (§14 design). This slice adds the How To content INSIDE each palette entry. The right dock / mobile sheet and the move to `common/help/` come later and are not part of this slice.

**Data, generated, never hand-typed: `viewer/help/howto.json`, built by `viewer/tools/build_howto.js`:**
- **Guide link:** for each pill in `panels.js` (`{ id, name }` of the main pill actions, 38 today), the BIM User Guide section (h2-h4 of the LIVE page `red1oon.github.io/BIMCompiler/BIMUserGuide/`, the page the palette already links) whose body names the pill's English name most often; ties go to the first.
  - Measured 2026-11-17: 31/38 have one.
  - No section names `lod400`, `sanity`, `egress`, `sched4d`, `dlodnav` or `issues`. These are guide gaps, listed, not linked.
  - `walk` (the mobile Walk pill) only matches the FILM's walk-mode sections. That is a different feature, so it is excluded, with the reason stored in the file.
- **CLI lines:** a door verb attaches to a pill only by a phrase quoted from the verb's OWN `description` in `common/door/verbs.json`:
  - `find` ← `viewer.counts`, `viewer.clashes` ("the same answer the Viewer's Find panel gives"), `viewer.cost` ("as the Viewer's Find panel does");
  - `tm` ← `viewer.schedule_at` ("the Time Machine scrubber").
  - The line is `<verb> <required input>=<input>`, the ERP help's form (`erp/help_search.js`). Verbs and lines stay English (§0 rule).
  - The tool refuses to build if a quoted phrase is missing.
- **Size:** a few kB. Fetched once when the palette first opens. `verbs.json` (154 kB) is never loaded by the page.

**Palette (`scene.js`):**
- An entry with a How To record becomes expandable (the existing +/− child block). Under its bullets it shows:
  - "Guide" + the section link (labelled "(English)" on a non-English page, since the guide is English only);
  - "Same at the CLI" + the line(s).
- The search also matches bullet text and verb titles.
- New words `ui_howto_guide`, `ui_howto_guide_en`, `ui_howto_cli`, translated in the 14 non-English languages (machine, labelled).
- Log: `§HOWTO_PALETTE entries=… guide=… cli=… filter="…"`.

**Witness W-HOWTO (`viewer/tests/witness_howto.js`), each check naming the issue it proves:**
1. **H1 drift:** `howto.json` == the generator's output on today's inputs (live guide, `panels.js`, `verbs.json`). A guide edit that moves a section fails here. Live guide unreachable → INCONCLUSIVE, not PASS.
2. **H2 links are true:** every anchor exists on the live guide, and its section names the pill. Falsifier: a made-up anchor, or a section that does not name the pill, must FAIL.
3. **H3 CLI lines are true:**
   - each quoted phrase is in that verb's description;
   - the line's inputs are exactly the verb's required inputs.
   - Falsifier: a phrase that is not there.
4. **H4 page:** on `viewer.html` + Duplex, F1 opens the palette:
   - X of N entries have a guide link (N = the page's own `_mainPillActions`, compared with the file's pill count);
   - typing a word that appears only in a bullet finds that pill;
   - the `find` entry shows the 3 CLI lines;
   - in de_DE the bullets are German and the guide label says it is English.
5. **Coverage printed:** guide X/N, CLI pills, guide gaps by id.

### 14.3 RESULT (2026-11-17): BUILT, bim-ootb #3156 (`feat/howto-palette`)
- **Coverage** (`§HOWTO_BUILD`): 44 pills (the spec said 38: the first pattern missed ids with capitals or hyphens, `roleFilter` `cam-reset` …; W-HOWTO H4a caught it).
  - 35/44 have a guide link.
  - **Guide gaps** (no section names them): `lod400`, `hbaFM` (the section says "HR_BIM_Asset", not "Human-Asset"), `sanity`, `egress`, `sched4d`, `gi-preview`, `dlodnav`, `issues`.
  - `walk` is excluded.
  - CLI on 2 pills (find: 3 lines, tm: 1). `howto.json` is 11 kB.
- **Rule refined while building:** a section whose HEADING names the pill wins; otherwise the body with most mentions. Body-only counting sent "Settings" to the 4D-rates section and missed "Pick Walk".
- **W-HOWTO PASS** (`viewer/tests/witness_howto.js`):
  - H1 `--check` same;
  - H2/H3 contract 5/0 over 44 rows, red control caught;
  - H4a: page pill list == file pill list (44);
  - H4b: 35 guide links shown, hrefs into the live guide;
  - H4c: "native" (only in a Save bullet) finds Save, opened;
  - H4d: Find shows its 3 CLI lines;
  - H4e: de_DE label "Handbuch (Englisch)", bullets German.
- **W-VIEWER-I18N** (de_DE): fail=3, the same 3 that pre-exist on main. Leaks 23/310, unchanged.
  - The first run counted 8 new leaks: the 4 CLI lines and their 4 English verb titles. The CLI line is a pinned command, English by the §0 rule; it gets its own class `cmd-howto-cli-line`, added to the witness's skip list with that reason.
  - The English verb titles were dropped from the page.
- **Owner items (guide content, not this lane's code):** the 8 tools above have no guide section. Adding sections to `docs/BIMUserGuide.md` would raise the count; `build_howto.js` picks them up on its next run (W-HOWTO H1 fails until it is re-run, by design).
- **Next:** the dock (right panel on desktop, sheet on mobile) + the move of `field_help.js` / `help_search.js` to `common/help/` (§14 design), or the Modeller's two overlays.

### 14.3.2 SPEC: the How To guide link, tie rule (2026-11-17, owner: *"proceed on open item"*; found while making the §17.3 film)
**Issue it removes:** W-HOWTO H1 FAILS on clean bim-ootb `main` (`2989f8f5`, log `scripts/film_help_viewer/out/witness_howto_main.log`): the live BIM User Guide gained "Help — F1, the info panel, and the command line (LIVE)", and `build_howto.js` (`score = heading match 1e6 + mentions`, strict `>`, so a tie goes to the FIRST section in the page) now links **Save Building and Open Building to that Help section** instead of "Save & Open a building" (each is named once in both). The same rule would send any future tie to whatever section happens to come first.
**Rule (change):** `score = (name in heading ? 1e6 : 0) + mentions x 1000 + shared`, where `shared` = the number of words (3+ letters, case-folded, split on non-letters/digits) that are in BOTH the section heading and the pill's English name. Mentions still dominate (`shared` is always < 1000), a heading that holds the whole name still wins; only EQUAL-mention ties change. A tie that also shares no word keeps the old order (first in the page). No section text is invented: the choice stays a count over the live page.
**Claims (W-HOWTO H5, new, offline, no guide fetch):**
- H5a a synthetic page with two sections naming a pill once each, the SECOND sharing a word with the pill's name, links the second;
- H5b the same page with the sections swapped still links the sharing section (order does not decide);
- H5c a section naming the pill twice beats a sharing section naming it once (mentions dominate);
- H5d two ties with no shared word keep the first in the page (the old behaviour, written down);
- red control: the OLD rule (re-implemented inline in the witness, `1e6 + n`, first wins) must FAIL H5a, or H5 proves nothing.
**Expected diff of `howto.json` on today's guide** (checked against the generator's own `--check` before and after): Save Building and Open Building back to `save-open-a-building`; the `Help` pill to the new Help section (`in_heading: true`, it is named there). Any other pill moving = stop and read why.
**Then:** H1 PASS again on a clean `main` run; the rest of W-HOWTO unchanged.

### 14.3.2 RESULT (2026-11-17): BUILT, bim-ootb #3172 MERGED (`a62d401b`)
- `build_howto.js`: `score = heading 1e6 + mentions x 1000 + shared words`; **one thing the spec did not foresee, found by its own "any other pill moving = stop" clause:** the first cut gave two pills with ZERO mentions (`hbaFM`, `gi-preview`) a link, because a shared word alone made the score positive. Fixed: a section must name the pill (heading or body) to be a candidate; claim H5f pins it. Final `howto.json` diff on today's guide = only the `Help` pill (now its own Help section, `in_heading: true`); Save Building and Open Building stay on `save-open-a-building`; 35 guide links, as before.
- Witnessed on the branch (read in the logs, not the exit code): **W-HOWTO PASS** incl. `§PASS H1 howto.json == generator output on today's inputs` and the new `H5a`-`H5f` (H5-red: the old rule picks `help` where the new one picks `save-open`, so H5a can fail); **W-HELP-DOCK PASS** (its D4 count of guide links in the panel == `howto.json` still holds).
- The §17.3 film's card says "W-HOWTO H2 H3 H4a-H4e PASS" because H1 failed the day it was made; a future film on a tree with #3172 can say "W-HOWTO PASS".

## 14.4 SPEC: the help panel's place, look and drag (owner 2026-11-17)
**Owner, verbatim:**
- *"Discuss how best to position that extra help panel?"* → *"Agree to all."* (left side, stays open, phone = full sheet);
- *"May i add for aesthetic feel, that a different colored translucent feel when it is used? But only if u agree it is attractive to users"* → amber, measured contrast: *"Agreed."*;
- *"If it is draggable, the user can move it to proper contrasting spot to read output clearly."*

This REPLACES the §14 design's "right dock".

**Measured layout (bim-ootb origin/main):**
- The Viewer's right edge is the tool rail. The column beside it holds Find (`top:54px; right:70px`), Issues (`top:60px; right:70px; width:340px`) and `#info-panel` (`bottom:50px; right:70px`).
- The left holds only `#hud` (`top:16px; left:16px`).
- The Modeller's right is fuller still (pp-panel, its two help overlays, history).
- Phone (`max-width:600px`): Find takes the top half; info is a 180 px box bottom-right.

**Decisions:**
1. **Place:**
   - Desktop: a column on the LEFT, below `#hud`, about 320 px wide, with a close button.
   - It never covers Find / Issues / info, so help and the selected element are read side by side.
   - Phone: a full-screen sheet with a close button, not draggable.
   - The Modeller uses the same side, and its two right-side overlays move into it (later step).
2. **Behaviour:** the `?` / F1 popup BECOMES this panel: same search box, same entries with How To (§14.3), same `renderList`.
   - F1 / `?` toggle it.
   - It STAYS OPEN while the user works: a click in the 3D view does not close it. Esc or × closes it.
3. **Look:**
   - The same frosted glass as the other panels, tinted warm AMBER (the data panels are cool blue), so help reads as guidance, not model data.
   - Amber headings/links, white text.
   - Less see-through than `#info-panel` (0.50), because it holds paragraphs.
4. **Drag:** by its header, through the Viewer's ONE drag helper `A._makeDraggable` (`viewer/measure.js`; also used by Issues, Clash Matrix, CPE, grid, HBA). The helper today neither remembers a position nor keeps a panel on screen. It gains two OPT-IN switches beside its existing `el._dragStrip`:
   - `el._dragRemember = '<key>'`: save left/top on drop (browser storage, a per-viewer convenience; read in try/catch);
   - `el._dragClamp = true`: keep the WHOLE panel inside the window when it fits (else its top-left at 0,0), on drop and on resize. Built first as "the header inside"; W-HELP-DOCK showed that a panel pushed to the corner then hung its list below the window, so it was changed.
   - Panels that do not set them behave exactly as today.

**Witness W-HELP-DOCK (`viewer/tests/witness_help_dock.js`):**
1. **D1 place:** on a 1600×900 page, F1 opens `#help-dock`. Its box is left of the centre and does not overlap `#find-panel`, `#issues-panel` or `#info-panel` (each shown first). A click on the 3D canvas leaves it open; Esc closes it.
2. **D2 contrast** (the readability standard, WCAG 2.x contrast ratio ≥ 4.5:1 for body text):
   - the panel's text colour against its effective background, composited from its rgba over the page's dark AND light background colours (the Background toggle's two values, read from the page), both ≥ 4.5;
   - falsifier: the same maths on a 0.10-alpha copy must FAIL on the light background.
3. **D3 drag:**
   - a pointer drag on the header by (+200, +120) px moves the panel by that amount ±1 px;
   - the position is saved; after a reload + F1 it opens there;
   - a drag far off-screen ends with the header fully inside the window;
   - a panel WITHOUT the switches (Issues) is not saved (no key written).
4. **D4 content:** the How To entries are the same as the §14.3 palette (W-HOWTO H4 assertions re-run against `#help-dock`).
5. **D5 phone** (390×844, mobile flag): the panel fills the width and height, and does not move when dragged.
7. **D6 reopen as left** (owner 2026-11-17: no Back/Forward, no recent list, no timeline entries; *"Agreed"*): an entry the user opened by hand, and the typed search text, are both back after × + F1, within the page session.
6. **Regression:** W-HOWTO, W-CLASS-HELP and W-VIEWER-I18N (no new leaks) stay as they are.

### 14.4 RESULT (2026-11-17): BUILT, bim-ootb #3160 (`feat/help-dock`)
- **What changed:** `#cmd-palette` (scene.js) is now:
  - a left column below `#hud` (desktop; 320 px wide, the window's height less margins), or a full-screen sheet on a phone;
  - open until Esc / F1 / ? / × (new `#cmd-close`). A 3D click no longer closes it, and running a tool from it keeps it open.
- **Keyboard:** the viewer's shortcuts now work beside it. `§KBD_ROUTE` passes keys to the panel only while focus is INSIDE it. Before, every shortcut was off whenever the popup existed.
- **Look:** amber glass `rgba(48,30,6,0.85)`; text #e0e0e0 / #d0d0d0; links #ffb74d. 85% is the lowest of the alphas computed (0.50 / 0.72 / 0.80 / 0.85) at which white text passes 4.5:1 over the white background; #aaa / #888 fail on white even at 0.85.
- **Drag:** `measure.js` `A._makeDraggable` gained `_dragRemember` / `_dragClamp` (logs `§DRAG_SAVE`, `§DRAG_RESTORE`, `§DRAG_CLAMP`).
- **Reopen state:** module memory `_helpState { filter, open }`.
- **W-HELP-DOCK PASS 14/14** (`viewer/tests/witness_help_dock.js`):
  - D1a: left 16, 320×868, overlaps none of Find, info, Issues. D1b: stays open after a 3D click. D1c: Esc closes.
  - D2: min contrast 6.31 dark / 5.26 white over 90 text nodes. Falsifier at alpha 0.10: 1.01.
  - D3a: (+200, +16); 16 is the clamp room, since the panel is nearly full height.
  - D3b: `#info-panel` dragged −120 px, no key written.
  - D3c: clamped at (1280, 32)–(1600, 900).
  - D3d: dragged back to 300; it reopens there after a reload.
  - D4: 35 guide links. D5: phone 390×844, does not move. D6a / D6b: reopens as left.
- **Witness finding (not a product change):** `A._makeDraggable` arms on pointerdown but captures the pointer only on its first ≥4 px move seen ON the element, so a tap still reaches header controls. A drag whose first step lands off the panel is lost. A hand stays on it; the witness's coarse 98-px first step did not, and "D3d" passed vacuously until the drag was made hand-like and a D3d-move check was added.
- **Regressions:** W-HOWTO PASS, W-CLASS-HELP PASS, W-ABOUT-HELP-RESTORE 9/9. W-VIEWER-I18N de_DE fail=3 (the same 3 as main), leaks 23/310. Lint 0 errors. sw v1719.
- **CI note (merged as `9f7e88c6`):** the first CI run failed W-X0-APPDEF (the code-design lane's X0 Navigator). It samples `internal/APP_SURFACE.md` "written at" lines, and the scene.js / measure.js edits shifted two of them. The fix was a regenerate, not a hand edit: `node scripts/gen_app_surface.js`, then verdict=PASS. The index had last been generated on 2026-11-14 (3251 files; 3374 now). Any edit that moves lines in a viewer file holding `A.x =` writes can trip this gate the same way.
- **Next:** the Modeller gets the same panel (its `#m-help-panel` + `#m-guide-panel` merge into it), and the help code moves to `common/help/` (§14 design). Spec first.

## 14.5 SPEC: the same help panel in the Modeller (owner 2026-11-17)
**Owner, verbatim:**
- *"u proceed with your lane"*;
- on where to put it: *"I think collapsing another temporarily can be considered if the user does not need to pay attnetion to others while seeking Help or querying. But why not let its panel be draggable so user decides?"*

**Correction recorded:** §14.4 said the Modeller's left is free. MEASURED, it is not (bim-ootb origin/main):
- **Left:** `#bonsai-outliner` (`bonsai_outliner.js:108`, `position:fixed; left:0; width:240px; height:100vh`, collapsible via `body.ol-collapsed`). Beside it at `left:252px`: `#bar` (`modeller.html:14`), `#ins-panel` (`top:60px`, 244 px wide) and `#stat`.
- **Right:** the rail; `#pp-panel` (`props_panel.js:85`, `top:60px; right:70px; width:300px`); `#hist`; and the two help overlays (`#m-help-panel` `modeller.html:75`, and `#m-guide-panel`).

**Decision (the owner's two ideas together):**
1. Help opens by default IN THE OUTLINER'S PLACE (left edge), and the outliner collapses while it is open.
2. The panel is draggable and remembered (the §14.4 switches). Dragged off the outliner's strip (its left edge ≥ 240 px), the outliner comes back. Dragged back onto it, the outliner collapses again.
3. Closing help restores the outliner's OWN prior state (a user who had collapsed it keeps it collapsed).
4. Phone: full-screen sheet (the Modeller has no phone layout yet; the sheet does not depend on one).

**Build: one panel, two apps (§14 "one shared module"):**
- **`common/help/help_panel.js`**, moved out of `viewer/scene.js` `showCommandPalette`. It owns:
  - the dock (amber glass, stays open, × / Esc, reopen-as-left state, search over names + bullets + CLI titles, How To blocks);
  - and NOTHING app-specific.
  - Each app gives an adapter: `entries()`, `howto` (optional), placement, drag function, storage key.
  - The Viewer keeps `#cmd-palette` and every id, so W-HELP-DOCK and W-HOWTO run unchanged.
- **The drag helper moves to `common/drag.js`**, from `viewer/measure.js` `A._makeDraggable`. The Viewer's `A._makeDraggable` becomes that same function, so there is ONE implementation; its 13 viewer callers are unchanged. The Modeller has no drag helper today.
- **Modeller adapter:**
  - entries = the live `#bar` buttons (icon, name, `SHORTCUTS`) + the keyboard-only rows that `buildHelp()` lists today;
  - the 11 guide `SECTIONS` become How To text under their entries, or a "Guide" group. They stay English until translated, like any untranslated row (the Modeller translates by exact string through the Viewer dictionary).
  - `#m-help-panel` and `#m-guide-panel` are deleted; `?` and `#b-guide` open the new panel.
  - The PR states its lines +/−.

**Witness:**
- **W-HELP-DOCK-M** (`modeller/tests/witness_help_dock_m.js`):
  - M1: `?` opens it at the left, outliner collapsed, `#pp-panel` not covered;
  - M2: drag right past 240 px → outliner back; drag back → collapsed;
  - M3: close → the outliner's prior state (both cases: it was open; it was collapsed by the user);
  - M4: contrast ≥ 4.5 on the Modeller's background(s), with the 0.10 falsifier;
  - M5: every `#bar` tool and every keyboard row that `buildHelp()` listed is in the panel (X of N, N from the live `#bar`);
  - M6: the 11 guide sections are present;
  - M7: position remembered across a reload;
  - M8: phone sheet.
- **Regression:** W-HELP-DOCK, W-HOWTO, W-CLASS-HELP and W-VIEWER-I18N unchanged. Every viewer caller of `A._makeDraggable` still drags: a sweep drags each one that the witness can open and reports X of N. W-X0-APPDEF: regenerate `APP_SURFACE.md`.

### 14.5 RESULT step 1 (2026-11-17): shared panel + drag helper, bim-ootb #3165 (`feat/help-panel-common`)
- **`common/drag.js`:** `A._makeDraggable` moved VERBATIM. The viewer name delegates, so its 13 callers are unchanged. It gains the opt-in `_dragOnDrop(rect)`.
- **`common/help/help_panel.js`:** the dock moved out of `viewer/scene.js` (`HelpPanel.toggle(cfg)`). It adds a `howto.text` block for in-app guide paragraphs.
- **`scene.js` `showCommandPalette`** is now the Viewer adapter: same ids (`#cmd-palette` …), same log lines.
- **Size:** 5 files, +144 / −404 lines, plus the two new common files.
- **Witnesses on the moved code:**
  - W-HELP-DOCK 14/14, W-HOWTO PASS, W-ABOUT-HELP-RESTORE 9/9;
  - W-X0 appdef / isolation / lens PASS (`APP_SURFACE.md` regenerated);
  - W-VIEWER-I18N de_DE: the same 3 failures as main, leaks 23/310;
  - lint 0 errors.
- **Drag-caller sweep:** 2 of 13 callers were judged (the help panel; `#info-panel` in W-HELP-DOCK D3b). The other 11 run the same moved function, but were NOT individually dragged by a witness.

**▶ STEP 2 for the next session (the Modeller), facts already measured:**
- **`modeller/modeller.html`:**
  - the `?` overlay is built at about lines 6580-6617 (`const help` … `hpanel` … `buildHelp()` … outside-click close);
  - the keyboard rows are Undo Ctrl+Z, Redo Ctrl+⇧Z, Cancel current mode Esc, Copy Ctrl+C, Paste (click to place) Ctrl+V, Drawing metadata Shift+D, This help ?, Snap-to-geometry on/off (while moving) G, Arm rotate ring (turn, in Move) T, Arm scale cubes (in Move) S;
  - the guide is `initGuide()` (`#b-guide`, 11 `SECTIONS` as [title, html]).
  - Load `../common/drag.js` + `../common/help/help_panel.js`.
- **Adapter:**
  - entries = live `#bar` buttons (icon `.ic` outerHTML, name span, `SHORTCUTS[id]`, action = button click) + the 10 keyboard rows + the 11 guide sections as entries with `howto.text`;
  - place = the outliner's strip `{ left: 0, top: 0, width: 240, height: innerHeight }`. 240 so it does not cover `#bar` at `left: 252px`.
  - **HIDE the outliner with `visibility: hidden`, NOT `body.ol-collapsed`:** that class also moves `#hist`, `#stat`, `#ins-panel` and `#dim-row` to `left: 12px` (`modeller.html` about line 104), under the panel.
  - `onDrop(rect)`: left ≥ 240 → outliner visible, else hidden. `onOpen`: the same test on the restored position. `onClose`: visible.
  - Background `#14161c` (`modeller.html:459`).
- **Six tests read the old overlays and must move to the new panel** (selectors only, claims unchanged):
  - `modeller/tests/witness_modeller_pill_verbs.js:66-75` (D5: the guide count == the source `SECTIONS` count);
  - `modeller/tests/witness_clipboard_keys.js:118` (`#m-help-panel .hp-row` Copy / Paste);
  - `modeller/tests/pill_declutter_live.js:47`;
  - `modeller/tests/witness_dxf_panel_pill.js:59` (`?` → `#m-help-panel` `display === 'block'`; the new panel is `display: flex`);
  - `modeller/tests/witness_guide_text_updates.js:36` (`#m-guide-panel` innerHTML);
  - `viewer/tests/witness_modeller_i18n.js:148` (judges `#m-help-panel` in de_DE).
- Then W-HELP-DOCK-M as specced (M1-M8), and the PR states lines +/−.

### 14.5 RESULT step 2 (2026-11-17): the Modeller adapter, bim-ootb #3171 (`feat/help-panel-modeller`)
- **Built as specced:** `?` and the Guide pill open `common/help/help_panel.js` (`#cmd-palette`) on the outliner's strip (0–240 px, width − its 1 px border). Entries = live `#bar` pills + the 10 keyboard rows + the 11 guide `SECTIONS`. Outliner hidden with `visibility` (never `ol-collapsed`); dragged off the strip it returns; closing restores the user's own state. `#m-help-panel`, `#m-guide-panel` and their CSS deleted. +116 −94 in 12 files + the witness.
- **Two decisions made while building (each witnessed):**
  - `cfg.noAutoFocus` (opt-in, shared panel): the Viewer focuses the search box on open; in the Modeller that swallowed `?` / `O` / `E` / `D` (W-DXF-PANEL-PILL P6c went red). With it, `?` toggles as before and a click in the box searches. Typing `?` IN the box stays possible, so the agreed `?` prefix (§16 item 7) is not blocked. W-HELP-DOCK-M M9.
  - A folded guide section is its title row alone; its paragraph enters the page only when opened or searched (W-HELP-DOCK-M M6d). Without it, W-MODELLER-I18N counted 60 hidden English paragraphs as leaks (10 → 70).
  - Search also reads `howto.text` (M6c: "turns green" finds only 3D Grid; falsifier finds 0).
- **Witnesses (logs read):** W-HELP-DOCK-M PASS (M0–M9, 20 checks) · W-UX-VERBS 9/0 · W-GUIDE-TEXT-UPDATES 5/0 · W-DXF-PANEL-PILL 18/0 · W-HELP-DOCK, W-HOWTO, W-CLASS-HELP PASS · W-ABOUT-HELP-RESTORE 9/9 · W-X0 appdef/isolation/lens PASS · eslint 0 errors (the repo's eslint; `npx eslint` pulls v10, which crashes on Node 18 — a tool error, not a result).
- **Same as main, not this change:** W-CLIPBOARD-KEYS K1 "no empty ground point in view" (so its K7 help check is never reached; M5b covers Copy/Paste); `pill_declutter_live` "initSqlJs is not a function".
- **Open (named, not hidden):** W-MODELLER-I18N de_DE was FAIL on main (10 leaks); now 16. The +6 are guide section titles not in the Viewer dictionary: "2D drawings → model", "Outliner — ARC leads, ONE Disc tab", "Disc = walker", "Conformity Gate", "Author", "Move & Manipulate". Translating them (and the paragraphs) is the next item for this panel.

### 14.5.1 SPEC: the Modeller guide titles into the dictionary (2026-11-17, owner: *"go"* to the advised order, item 1)
**Issue it removes:** W-MODELLER-I18N de_DE FAILS on clean bim-ootb `main` (`a62d401b`) with 16 uncatalogued English strings on the trailer screens (log read 2026-11-17: `§MDL_LEAK locale=de_DE leaks=16 slots=124 translated=117 wiring=0 gap=0 uncat=16`); it was 10 before #3171. The +6 are the Modeller help panel's guide section TITLES (a new offline witness, W-MODELLER-GUIDE-TITLES, then found TWO MORE the leak witness never walks: *3D Grid* and *Save / Export*, so the batch holds 8), which the panel now shows and the dictionary does not hold: *2D drawings → model*, *Outliner — ARC leads, ONE Disc tab*, *Disc = walker*, *Conformity Gate*, *Author*, *Move & Manipulate*. The other 10 (*Rules*, *2D Drawings: show or hide the panel (D)*, *Team — click to start or join a team*, *Walker rules (JSON)…*, *Copy*, *Paste (click to place)*, *Drawing metadata*, *This help*, *Open 2D drawings (.dxf)…*, *Open 2D drawings from PDF drawing (.pdf)…*) were already uncatalogued before #3171 and are NOT this item.
**Change:** one batch file `viewer/tools/trl_batch_2026-11-17_modeller_guide_titles.js` in the established form (`NEW` keys `mdl_m_guide_title_*` + `TRL` for the 14 non-English locales, machine translations by Claude, labelled), applied by `trl_add_batch.js` then `build_trl.js`. The Modeller already translates by exact on-screen English (`__TRL_DICT_PAGE`), so no Modeller code changes.
**Claims (the witness, read in its log):**
- T1 de_DE `§MDL_LEAK` goes 16 → 10, and the 6 titles are NOT in its uncatalogued list (the other 10 still are, named);
- T2 W-MODELLER-GUIDE-TITLES (`viewer/tests/witness_modeller_guide_titles.js`, offline, N read from the live `SECTIONS`): G1 every guide title has a base row; G2 every title x the 14 non-English locales is a `trl="Y"` row with text (11 x 14 = 154); red control: a title with no row and a `trl="N"` row must FAIL;
- T3 the existing control (de_DE with its json aborted must count leaks > 0) still PASSES, so the counter can still fail;
- no other base row, id or translation changes (ids append above 1001027; `trl_add_batch.js` itself refuses to touch existing rows).
**Not in this item (named):** the guide PARAGRAPHS. Measured: 11 sections, 59 text nodes, 5,648 characters (`2D drawings → model` alone is 41 nodes of list steps, `Teams` 9); each node would be a key x 14 locales and the paragraphs only appear when a section is opened (W-HELP-DOCK-M M6d), so they are not in the leak count. Written up as the next step; the owner's call whether the Modeller guide body is worth ~830 machine translations.

### 14.5.1 RESULT (2026-11-17): BUILT, bim-ootb #3173 MERGED (`fa00554e`)
- **Batch:** `viewer/tools/trl_batch_2026-11-17_modeller_guide_titles.js`: 8 titles (the 6 named + *3D Grid*, *Save / Export*) x 14 locales, ids 1001028-1001035, append-only, machine translations by Claude (labelled in each XML header; NO speaker review). Terms kept as the product's tokens: ARC, Disc, walker. No Modeller code changed.
- **Witnessed (logs read):** W-MODELLER-GUIDE-TITLES PASS 5/0 (`G1`, `G2` 154 rows, red control detected; before the 2 extra titles it FAILED G1 on *3D Grid | Save / Export*, which is how they were found). W-MODELLER-I18N: de_DE leaks **16 → 10**, ja_JP 10; the uncatalogued list is exactly the 10 pre-#3171 strings and none of the 8 titles; "Help built after the switch" leaks 11 → 5 (translated 26 → 34). W-VIEWER-I18N unchanged (de_DE 23/310, as main).
- **Still FAILS on main, not this item (named):** W-MODELLER-I18N (2) de_DE/ja_JP 10 leaks each: *Rules*, *2D Drawings: show or hide the panel (D)*, *Team — click to start or join a team*, *Walker rules (JSON)…*, *Copy*, *Paste (click to place)*, *Drawing metadata*, *This help*, *Open 2D drawings (.dxf)…*, *Open 2D drawings from PDF drawing (.pdf)…*; and (4) the in-place flag switch (leaks=4, `retranslated=-1`). Same mechanism (batch + XML), so a single follow-up batch of 10 strings x 14 would turn (2) green; (4) needs a look at the in-place switch first.
- **Paragraphs (the second half of the RESUME item):** NOT done, a decision for the owner: 59 text nodes, 5,648 characters, ~830 machine translations, not in the leak count (they appear only when a section is opened).

### 14.5.2 SPEC: the ten older uncatalogued Modeller strings (2026-11-17, owner: *"follow your advice"* = this batch, not the guide paragraphs)
**Issue it removes:** after §14.5.1 W-MODELLER-I18N (2) still FAILS on `main` (`fa00554e`) with 10 uncatalogued English strings per locale (de_DE 10/132, ja_JP 10/126; logged 2026-11-17): *Rules* · *2D Drawings: show or hide the panel (D)* · *Team — click to start or join a team* · *Walker rules (JSON): read and edit the rules the walker uses for this building type* · *Copy* · *Paste (click to place)* · *Drawing metadata* · *This help* · *Open 2D drawings (.dxf)…* · *Open 2D drawings from PDF drawing (.pdf)…*. They were uncatalogued before #3171 (the leak witness has failed on this since the Modeller trailer work), so the Modeller shows these in English to every user of another language.
**Change:** one batch `viewer/tools/trl_batch_2026-11-17_modeller_uncat10.js` (the same form as §14.5.1: `NEW` keys `mdl_m_*`, `TRL` for the 14 non-English locales, machine translations by Claude, labelled, no speaker review; words already translated in the dictionary keep that translation, e.g. de_DE "2D-Pläne", "Walker"). The exact English strings are the witness's own list, so the Modeller matches them on screen with no code change.
**Claims (read in the logs):**
- T1 W-MODELLER-I18N de_DE and ja_JP: `§MDL_LEAK` uncatalogued **10 → 0** and (2) PASSES; no string that was translated before turns English;
- T2 W-MODELLER-GUIDE-TITLES gains **G3**: every base row added by this lane's 2026-11-17 Modeller batches (ids ≥ 1001028) is a `trl="Y"` row with text in the 14 non-English locales (X of N printed, N from the base file); the red control must still fail;
- T3 (4), the in-place flag switch (leaks=4, `retranslated=-1`) is NOT claimed fixed; its count is recorded before and after, so a change is visible either way.

### 14.5.2 RESULT (2026-11-17): BUILT, bim-ootb #3174 MERGED (`f9e2c6cf`)
- **Batch:** `viewer/tools/trl_batch_2026-11-17_modeller_uncat10.js`: the 10 strings x 14 locales, ids 1001036-1001045, append-only, machine translations by Claude (labelled; NO speaker review). No Modeller code changed.
- **Witnessed (logs read): W-MODELLER-I18N PASS 15/0 for the first time since the Modeller trailer work** — `§MDL_LEAK` de_DE 0/142, ja_JP 0/136, ar_SA 0/143 (uncat 10 → 0, T1); W-MODELLER-GUIDE-TITLES PASS with the new **G3** (18 batch rows x 14 locales = 252 cells, red control detected, T2); W-VIEWER-I18N unchanged (de_DE 23/310, the same 3 failures as `main`).
- **T3 came out better than claimed:** the in-place flag switch (4) went `leaks=4` → `leaks=0` and the Help built after the switch `leaks=11 (5 after §14.5.1)` → `0`: those leaks were the same ten strings, not a separate switch fault, so there was nothing to fix in the switch (`retranslated=-1` is still printed and was never the cause).
- **Left:** the guide PARAGRAPHS (59 nodes, ~830 translations, owner's call) and the 23 W-VIEWER-I18N leaks on `main` (the Viewer's own, not this lane's Modeller work).

## 14.5.3 SPEC: drag every caller of the one drag helper (2026-11-18, RESUME item 5's remaining gap)
**Issue it removes:** §14.5 RESULT step 1 moved `A._makeDraggable` into `common/drag.js` verbatim, but only 2 of its 13 callers were ever dragged by a witness. A caller whose panel no longer drags (a header covered by a control, a strip set to 0, a panel registered while hidden) would pass every current witness.
**Denominator, from the code:** every `_makeDraggable(` / `CommonDrag.make(` call in `viewer/` and `common/`, minus definitions and tests; a static scan, printed with file:line. Today 13 (the first scan said 14; see D3): `cinema_path_editor.js:1216`, `clash_matrix.js:249`, `grid_overlay.js:1229`, `hba_lens.js:1058`, `issues.js:253`, `measure.js:922`, `measure.js:1641`, `nf_ui_history.js:269`, `panels.js:255`, `panels.js:471`, `panels.js:2685`, `print_sheet.js:541`, `common/help/help_panel.js:259`.
**Instrument:** before any page script runs, the witness traps the assignment of `window.CommonDrag` and wraps `make`, recording each element with its caller's file:line from the stack. Nothing in the app changes.
**Openers (real paths, measured 2026-11-18 by a census on Duplex):** load (setup panels, the info panel); each pill action fired one at a time through `window._mainPillActions` (Find, Help, HBA family drawer, Clash, Issues, Settings, Navigate / Inspect / Camera drawers); a clash-matrix cell click (the clash list, `_revealClashes`); the Measure pill and then a right-click on the model (the measure card); `PrintSheet.capture(APP)` (the print preview, nothing downloaded); `A.toggleGridOverlay()` (the grid panel, only when the building has grids). **Not fired, with reasons:** save / open / share (file dialogs and downloads), home (leaves the page), fullscreen, gi-preview (a GI render), lod400 (mesh load), sched4d (generates a programme), walk / whwalk / fly (camera modes that take the pointer). **CPE is not driven:** its panel opens only inside the Alt+C bake flow with a waypoint plan (no-bake rule), so it is named as unreached.
**Claims (W-DRAG-SWEEP, `viewer/tests/witness_drag_sweep.js`, headless SwiftShader, no GPU; log `viewer/tests/logs/witness_drag_sweep.log`):**
- **G1 each reached site drags.** For each registered element shown on screen, a hand-like pointer drag on its top strip, toward the viewport centre, moves it by the dragged amount (within 2 px). X of the reached sites, each named. A site whose element is never shown counts as reached-not-judged and is named.
- **G2 the denominator, stated:** N sites from the scan; reached / judged / dragged / unreached, with the reason for each unreached one. Not a pass/fail on its own; VACUOUS (INCONCLUSIVE) if no site is judged.
- **G3 no stray caller:** every call site seen in a stack is one of the scanned N (a call the scan missed FAILS, so the denominator cannot drift).
- **Falsifier `DRAG_BREAK=nostrip`:** the instrument sets the element's `_dragStrip` to -1 before the real `make`, so no drag can start; G1 must FAIL on every judged site.
**Not in this item:** the Modeller (its only caller is the shared help panel, through `cfg.makeDraggable`, which `W-HELP-DOCK-M` drags).
**§14.5.3a FOUND by the first runs (2026-11-18), fixed in the owner (spec before the fix):**
- **D1 a transformed panel jumps.** The HBA family drawer is centred with `transform: translateY(-50%)` (`hba_lens.js:1031`). The helper reads the on-screen rect and writes `style.top` while the transform still applies, so on the first move the drawer jumps up by half its height (measured: dragged +60, moved −147). **Fix in `common/drag.js`:** on the first real move (not on a tap), if the computed transform is a pure translation (`matrix(1, 0, 0, 1, x, y)`), set `transform: none`. The panel then stays exactly where it was seen and follows the pointer. Logged as `§DRAG_UNTRANSFORM`. A scale or rotate transform is left alone.
- **D2 a setup-time panel is never draggable.** `panels.js:471` (the Sunglass panel) runs in `setupPanels`, 3rd in `main.js`'s `_mods`, while `A._makeDraggable` is defined in `setupMeasure`, 32nd. So `if (A._makeDraggable)` is false and the panel silently never drags. **Fix:** that call falls back to `window.CommonDrag.make` (the same one implementation; `common/drag.js` loads before `main.js`).
- **D3 a second drag implementation.** `tm_panel.js:664` keeps its own `function makeDraggable` (a copy of the old helper), so `tm_panel.js:367` is not a caller of the shared one. The scan lists such files separately (`§DRAG_OWN_IMPL`), not in N. Handed to the TM lane (AD-LAYER LAW 5, one implementation per responsibility); not changed here.
- Also noted for the HBA lane, not changed: `A._placePanel` gives the drawer `top = rect.top` at open while the transform still applies, so it opens half its height higher than placed.
- **Witness changes:** the scan excludes calls of a file's own `makeDraggable` (D3). The grab point is searched over the whole strip height, since Find's strip is 64 px and its first row is all controls. G1 then also holds for D1 and D2.

### 14.5.3 RESULT (2026-11-18): BUILT + MERGED, bim-ootb #3246 (`40c166db`)
- **W-DRAG-SWEEP (logs read): `§DRAG_SWEEP N=13 reached=12 judged=12 dragged=12`, G1 PASS 12 of 12, G3 PASS (0 stray), `verdict=PASS`.**
  - Reached by: load (the info panel, the Sunglass panel); the pills Find, Help, HBA, Measure (then the canvas's right-click handler, `picking.js:155`), Clash (then a matrix cell, giving the clash list), Issues and Settings; `PrintSheet.capture`; `toggleGridOverlay`.
  - Unreached: `cinema_path_editor.js:1216` (the Alt+C bake flow, no-bake rule).
  - Falsifier `DRAG_BREAK=nostrip`: G1 FAIL 0 of 9. G3 caught a real miss during the build (the first D2 fix wrote a call the scan could not see).
- **D1 fixed** (`common/drag.js`, `§DRAG_UNTRANSFORM`): the HBA family drawer moved −147 for +60 before, and now moves −90,+60 for −90,+60. **D2 fixed** (`panels.js`): the Sunglass panel, never draggable before, now drags. **D3 handed** to `CODE_HYGIENE_REVIEW_2026-11.md`; the HBA open-placement offset went to `RESUME_HBA_ERP_GOVERNED_DISPLAY.md`.
- **Regressions, identical on branch and main:** W-HELP-DOCK 14/0, W-HELP-DOCK-M 21/0, W-HOWTO 16/0; eslint 0. `drag.js?v=2`, `panels.js?v=52`, sw viewer v1746, modeller v293.
- **Observed, environment:** two long SwiftShader runs ended with the renderer closing late in the session ("Target closed"). The witness logs `§DRAG_RUN_STOPPED`, keeps the sites already judged, and runs the tail openers on a fresh page. The red run hit its timeout after writing its verdict.
- **Run:** `NODE_PATH=~/bim-compiler/node_modules node viewer/tests/witness_drag_sweep.js` (puppeteer comes from bim-compiler), ~10 min.

## 14.6 SPEC: guide sections for the 8 Viewer tools that have none (owner 2026-11-17: *"yes"* to writing them, derived and labelled)
**Issue it removes:** W-HOWTO / `build_howto.js` report `gaps=lod400,hbaFM,sanity,egress,sched4d,gi-preview,dlodnav,issues` (bim-ootb `main`, 2026-11-17): 8 of 44 palette entries have no Guide link because the live BIM User Guide never names them as the palette does (35 of 44 linked). Some are in the guide under another wording (GI Preview, Nav LOD, "Issue log", the FM / Operate drawer); *Sanity*, *Egress* and *4D Window* are nowhere. A user who asks the help "what is Sanity" gets a row with no Guide link.
**Method (no invention):** every sentence in a new section is one of: (a) the tool's own palette bullets (`viewer/panels.js` `children`), (b) its key / drawer as `panels.js` defines them, (c) a statement in the tool's own source header or panel markup, (d) a sentence the guide already says about it. Each section ends with an italic line *"Written from the tool's own help text and code header, 2026-11-17."* The witness below checks (a), (c) mechanically.
**Where / names:** in *Viewer Features*, before "Save & Open a building". Headings that CONTAIN the palette's exact name, so the generator links by heading (`build_howto.js`): `### LOD400 Upgrade` · `### Sanity and Egress — rule checks` (one section, both names) · `### 4D Window` · `### Issues` · `#### GI Preview (AO)` · `#### Nav LOD (large bldgs)`; **Human-Asset** gets no new section: the existing "FM / Operate lenses" section already describes it, so one sentence there names its palette label. Existing anchors are not renamed.
**Claims (read in the logs):**
- V1 `scripts/guide/witness_guide_viewer8.js` (offline): every row of `scripts/guide/viewer8_sources.json` has its guide phrase in `docs/BIMUserGuide.md` AND its source phrase in the named bim-ootb file (X of N printed, N = the table); each of the 8 palette names is a heading (7) or a body mention in the FM / Operate section (1); red control: a planted phrase not in its source FAILS;
- V2 after the docs deploy, `node viewer/tools/build_howto.js --check` on the LIVE guide reports `gaps=` empty (35 → 43 linked), and W-HOWTO PASSES incl. H1 (after regenerating `howto.json`, a bim-ootb PR) and H2 (each section names its pill);
- V3 the deploy guard (`scripts/safe_gh_deploy.sh`) PASSES with no page deleted or shrunk.
**Not in this item:** screenshots (the guide's older sections have them; these have none yet, said here, not hidden); the 6 translated guide languages (the BIM User Guide is English-only today).

### 14.6 RESULT (2026-11-17): guide sections WRITTEN + DEPLOYED, palette links regenerated (bim-ootb #3175 MERGED `16e44c1c`)
- **Guide (BIMCompiler #880, docs deploy `safe_gh_deploy.sh`: guard PASS 988/988, canaries 200, live page fetched after Pages caught up):** `LOD400 Upgrade`, `Sanity and Egress — rule checks`, `4D Window`, `Issues` (h3), `GI Preview (AO)`, `Nav LOD (large bldgs)` (h4); the existing FM / Operate section now names the **Human-Asset** label. Each new section ends *"Written from the tool's own help text and code header, 2026-11-17."* No screenshots yet (said in the section, not hidden). The count "35 of the 44" was removed from the Help section rather than changed (it would have been false between the deploy and the `howto.json` PR).
- **V1 W-GUIDE-VIEWER8 PASS** (`scripts/guide/witness_guide_viewer8.js <bim-ootb tree> --live`, log read): 46 rows, each guide phrase found in `BIMUserGuide.md` and its source phrase found in the named bim-ootb file (`panels.js`, `lod400_upgrade.js`, `egress_sanity.js`, `scene.js`, `viewer.html`, `issues.js`); red control detected; 8 of 8 palette names are a heading (7) or a body mention (Human-Asset). **V4 live, real Viewer + Duplex:** F1, type *Sanity*, Enter opens the checklist titled *Structural Sanity*; same for *Egress*; key **I** opens the Issues panel; 0 page errors. (The first source table had one wrong-case phrase; the witness failed it, which is how it was fixed.)
- **V2 palette links:** `build_howto.js` on the LIVE guide: `gaps=` empty, 43 of 44 linked (walk stays excluded), and exactly those 8 pills changed, no other. W-HOWTO PASS incl. H1, H2, H4b (43/44); W-HELP-DOCK PASS (D4 43 == 43). bim-ootb #3175.
- **Found, reported, NOT claimed and NOT fixed (a product question for the owner):** the help panel prints key **S** for Sanity and **E** for Egress (`panels.js` `key:`), but `scene.js` binds **S** to screenshot (`A.screenshot`) and has no **E**; Sanity and Egress are `pill:false` and in no drawer, so the only working path is F1 + name + Enter. The guide says exactly that and quotes no key for them. The startup `§SHORTCUT_AUDIT` does not catch the S case because it only checks that a key exists in `_shortcuts`, not that it runs the same tool.

## 14.7 SPEC: real keys for the five tools whose printed key was not real (owner 2026-11-17: *"Yes give real keys and solve any admin issue related."*)
**Issue it removes:** the F1 help prints a key for every tool (`panels.js` `key:`), and for five of them the keyboard does not do that. Measured 2026-11-17 by a static cross-check of `viewer/panels.js` pill keys against `viewer/scene.js` `_shortcuts` and the pill's own tool (bim-ootb `16e44c1c`):
- **Sanity** `s` runs `A.screenshot` (a different tool); **Egress** `e`, **Earthworks** `u`, **Roadworks** `k`: no handler at all;
- **Role View** `r`: two pills declare `r` (Role View and Road report); the handler runs Road report (civil model) or the room cycle, never Role View.
Neither existing audit sees it: `§SHORTCUT_AUDIT` in `panels.js` only asks "is the key in `_shortcuts`" (true for `s`), and `InputReg.checkShortcuts` only asks "does the handler's target function exist" (`A.screenshot` does).
**Change:**
1. `scene.js` `_shortcuts`: new entries `y`, `e`, `d`, `u`, `k`, each a `_pillKey(id)` handler that calls THE PILL'S OWN `fn` from `window._mainPillActions` (one source of truth: the key, the pill and the F1 chip cannot diverge). `s` stays the screenshot; `r` stays Road report / room cycle.
2. `panels.js`: Sanity's key `s` → **`y`**, Role View's key `r` → **`d`** (free letters; `d`, `e`, `y`, `u`, `k` are bound nowhere else in the Viewer, grep read 2026-11-17). Egress `e`, Earthworks `u`, Roadworks `k` keep their keys, which become real.
3. Audit that sees the class: `InputReg.checkPillKeys()` (log-only, run after the pills are built) prints `§PILLKEY id= key= status=ok|missing|clash|other-tool` per keyed pill and a `§PILLKEY_AUDIT` summary: `clash` = two pills share a key, `missing` = no handler, `other-tool` = the handler is neither a `_pillKey` of that pill nor shares a called tool name with the pill's `fn` (the same name extraction as `checkShortcuts`).
4. Guide: the Sanity and Egress section and the Cheat-Sheet table state the keys; the `viewer8_sources.json` rows follow.
**Claims (read in the logs): W-PILL-KEYS** (`viewer/tests/witness_pill_keys.js`):
- K1 static, over every keyed pill (N read from `panels.js`): no two pills share a key; each key has a handler; the handler is the pill's tool (the §14.7 rule). Red control: the OLD `panels.js` (Sanity `s`, Role View `r`) FAILS it, with the 5 findings named — so K1 can fail;
- K2 live, real Viewer + Duplex: `y` opens *Structural Sanity*, `e` opens *Egress*, `d` changes the Role View, `u` and `k` each call `toggleEarthworksPanel` / `toggleRoadworksPanel`; `s` still calls `A.screenshot` exactly once and `r` still runs Road report / room cycle (unchanged);
- K3 `§PILLKEY_AUDIT` at page load prints `ok` for all keyed pills, `missing=0 clash=0 other-tool=0`, and 0 page errors;
- W-GUIDE-VIEWER8 and W-HOWTO, W-HELP-DOCK unchanged PASS.
**Not in this item:** the Alt+key pills with no `_shortcuts` entry (`xray` Alt+Z, `gi-preview` Alt+G, `fullscreen` F11, `precision` Caps Lock, `help` F1) are handled by their own listeners, not `_shortcuts`: K1 lists them as `own-listener` and does not judge them (named, not hidden).

### 14.7 RESULT (2026-11-17): BUILT, bim-ootb #3176 MERGED (`92b7019a`)
- **Keys:** Sanity **Y**, Egress **E**, Role View **D**, Earthworks **U**, Roadworks **K**; `S` stays the screenshot, `R` stays Road report / room cycle. Each is `function() { A._pillRun('<id>'); }` in `scene.js` `_shortcuts` (`A._pillRun` calls the pill's own `fn` at press time). **One change to the spec as written:** the first cut used a `_pillKey()` factory returning a tagged closure; the repo's own inventory generator (`scripts/gen_viewer_actions.js`) could not parse it, and `InputReg.checkShortcuts` read the local helper as dead, so the handlers became plain `function() { A._pillRun(...) }` entries on `A`, which both tools already understand. `InputReg.checkPillKeys` + `§PILLKEY_AUDIT` added (log-only).
- **The admin issue was already on file:** `internal/VIEWER_ACTIONS.md` (W-VIEWER-ACTIONS R6, "pill key conflicts") listed these five exactly (Role View `r` DIFFERENT, Earthworks `u` / Roadworks `k` / Egress `e` UNBOUND, Sanity `s` DIFFERENT) and `W-VIEWER-ACTIONS` VA3b + VA4 were FAILING on clean `main` (an unaccounted keydown listener, `common/help/help_panel.js`, moved there by #3165; and a stale committed inventory). Now: conflicts 5 → 0, unaccounted 1 → 0, the listener excluded with its reason (panel-local keys in its own search box), the inventory regenerated, W-VIEWER-ACTIONS **PASS** (it did not before this change).
- **Witnessed (logs read):** W-PILL-KEYS PASS: K1 static over 34 keyed pills (27 plain + 7 modifier/function-key pills judged `own-listener`, named), its red control (Sanity back on `s`, Role View on `r`, the `e` handler removed) names `sanity=other-tool roleFilter=clash egress=missing`; K2 live in the real Viewer + Duplex: Y opens Structural Sanity, E opens Egress, D moves the Role View (-1 → 0), U and K each call their toggle, `s` still calls `A.screenshot` exactly once, `r` still runs the room cycle; K3 the page's `§PILLKEY_AUDIT keyed=34 ok=27 missing=0 clash=0 other-tool=0 own-listener=7`, 0 page errors. Also: role-filter witness ALL PASS, `tests/audit_input_registry.js` 9/0, W-HOWTO PASS, W-HELP-DOCK PASS. W-GUIDE-VIEWER8 now has 55 rows (the Sanity row it had for `s` failed until corrected, which is what that table is for) and its live step presses Y and E as well as F1 + name.
- **Guide:** the Sanity and Egress section says *press Y or E, or F1 + name + Enter*; the Cheat-Sheet gains Y / E, D, U / K rows ("civil-works models only": `showRoadworksPanel` logs `VACUOUS not a civil model` otherwise).
- **Not in this item:** the 7 modifier/function-key pills (Ctrl+S, Ctrl+O, F1, Alt+Z, Alt+G, F11, Caps Lock) have their own listeners; `checkPillKeys` lists them and does not judge them. The Playwright spec `tests/specs/42-pill-shortcuts.spec.js` was not run (the repo's whitebox witnesses are the evidence here).

## 14.8 SPEC: the 23 W-VIEWER-I18N leaks on `main` (2026-11-17 session, RESUME item 2; read the log first, as the item said)
**Issue it removes:** W-VIEWER-I18N FAILS on clean bim-ootb `main` (`0add6f60`), log read 2026-11-17 (`--locales de_DE`): `§W-VIEWER-I18N FAIL pass=24 fail=3`, `§TRL_LEAK locale=de_DE leaks=23 of 310 wiring=0 gap=4 uncat=19`. A German (or any non-English) user sees these in English. The three failures, read from the log, are ONE cause, not three: pills and one button were added after S226 without dictionary rows.
- **(2) leaks, viewer page:** GAP 4 = `pill_roadstd`, `pillc_roadstd_1..3` (rows exist, `trl="N"` in all 17 locales). UNCAT 19 = the pills `lod400` *LOD400 Upgrade* (+ its `<title>`), `roadreport` *Road report*, `ew` *Earthworks*, `rw` *Roadworks*, `gi-preview` *GI Preview (AO)*, their 13 Help sub-rows (`panels.js:1337,1411,1415,1418,1516`), and *Export BCF* (`viewer.html:557`).
- **(3b) UNKNOWN-KEY:** `ui_export_bcf` (`viewer.html:557`) and `wi_store_changed` (`whatif_panel.js:181`, the What-if stale note) are used in code with no base row.
- **(3c) MISMATCH:** the `pillc_lod400_*` and `pillc_roadreport_*` rows do not exist (`panels.js:1583` keys sub-rows by position).
**Change:** two batch files in the established form, no Viewer code change (`panels.js:1579-1583` already looks up `pill_<id>` / `pillc_<id>_<n>`, `viewer.html` its `data-trl`, What-if `_wiTrl`):
- `viewer/tools/trl_batch_2026-11-17_viewer_uncat.js` (`trl_add_batch.js`): 20 NEW keys = `pill_lod400`, `pillc_lod400_1..3`, `pill_roadreport`, `pillc_roadreport_1..5`, `pill_ew`, `pillc_ew_1..2`, `pill_rw`, `pillc_rw_1`, `pill_gi_preview`, `pillc_gi_preview_1..2`, `ui_export_bcf`, `wi_store_changed`; English = the code's string byte for byte; TRL for the 14 non-English locales.
- `viewer/tools/trl_batch_2026-11-17_roadstd_fill.js` (`trl_fill_batch.js`): the 4 `roadstd` rows x 14 locales.
- Machine translations by Claude, labelled in each XML header, NO speaker review (owner's standing rule for this lane). Kept as tokens: LOD400, BCF, AO, N8AO, ATJ 2A/85, OK / UNKNOWN / MISSING, .txt, PDF.
**Claims (read in the logs):**
- V1 W-VIEWER-I18N de_DE: `§TRL_LEAK` viewer page 23 → 0 and the overall line `leaks=0`; (3b) and (3c) PASS; the full 18-locale run ends `§W-VIEWER-I18N PASS`.
- V2 the control (4) still counts leaks > 0 and the in-place control (6) still fails when the pass is off, so the counter can still fail.
- V3 ids append above the current highest; no existing base row, id or translation changes (the two tools refuse otherwise, `§TRL_ADD` / `§TRL_FILL` lines read).
**Not in this item (named):** `road_report.js:19` section titles (emoji + *Alignment & Drift* …) inside the Road report panel itself; the witness opens no road model, so they are not judged, and their translation is a separate item.

### 14.8 RESULT (2026-11-17): BUILT, bim-ootb #3190 (`fix/viewer-i18n-leaks`)
- **Batches:** `viewer/tools/trl_batch_2026-11-17_viewer_uncat.js` (20 NEW keys x 14 locales, ids 1001046-1001065, append-only, `§TRL_ADD done added=20`) + `trl_batch_2026-11-17_roadstd_fill.js` (4 rows x 14, `§TRL_FILL filled=4` per locale). Machine translations by Claude, labelled, NO speaker review. No Viewer code changed. `sw.js` bumped (the packs are precached cache-first; the two earlier dictionary batches #3173/#3174 skipped this and were rescued only by a later bump).
- **Witnessed (18 locales, log read):** V1 de_DE `§TRL_LEAK` **23 → 0** (310 slots); ms es zh th ja ko ar pt id bn bl af all 0; (3b) and (3c) PASS. V2 controls still fail when broken: (4) `leaks=6 of 6`, (6) `leaks=15 of 136`. V3 base CSV: 0 lines removed, 20 appended.
- **V1 only PARTLY met:** `§W-VIEWER-I18N FAIL pass=90 fail=1`. The one fail is `erp9-zero-leaks`: fr_FR and en_US/en_GB/en_AU show 13 each, all the How To guide-link tooltip `Guide: <English heading>` (`common/help/help_panel.js:118`, headings from `viewer/help/howto.json`). Pre-existing (neither file is in this diff); it hides in de/ja/etc. only because their word for "Guide" differs, while French "Guide" equals the English. §14.8.1 below.
- **Witness defect found (named, not fixed):** the `FAIL erp9-zero-leaks` line is printed to stdout only and is missing from `witness_viewer_i18n.log`, so a reader of the log sees `fail=1` with no FAIL line. The stdout copy is kept locally (logs are git-ignored).

## 14.8.1 SPEC: the How To guide headings into the dictionary (2026-11-17, follows §14.8)
**Issue it removes:** W-VIEWER-I18N `erp9-zero-leaks` FAILS: fr_FR + en_* show 13 uncatalogued strings each, every one the tooltip `Guide: <heading>` of a How To guide link (`help_panel.js:118` writes `ht.guide.heading` raw). A French user hovering the link reads the English section name; the same leak exists in every locale but is only COUNTED where "Guide" is spelled the same.
**Change (the §14.5.1 precedent: the Modeller guide titles joined the dictionary the same way):**
- `help_panel.js` (shared, one line): the heading goes through the dictionary, `T('howto_gh_' + key(anchor), heading)`, `key` = the anchor with every non `[a-z0-9]` run as `_`. English fallback unchanged; the Modeller (no `ht.guide`) is unaffected. `?v=2 → 3` in `viewer.html` + `modeller.html`; `sw.js` bump.
- One batch `viewer/tools/trl_batch_2026-11-17_howto_headings.js`: one `howto_gh_*` key per DISTINCT anchor of `viewer/help/howto.json` (N = 20 measured today: 43 pills with a guide, 20 sections), English = the heading byte for byte, x 14 locales; words already in the dictionary keep their translation.
- **W-HOWTO gains H6 DICT (H4, H5 exist):** every distinct `guide.anchor` in `howto.json` has a base row `howto_gh_<key>` whose msgtext == its heading (X of N, N read from the file); red control: a heading changed in a copy of the file must FAIL. So a regenerated `howto.json` with a new section fails until its row exists.
**Claims:** T1 W-VIEWER-I18N full run ends `§W-VIEWER-I18N PASS` (fr_FR and en_* 0 uncatalogued); T2 W-HOWTO H6 20/20 + red control; T3 W-HELP-DOCK and W-HELP-DOCK-M stay green (logs read).

### 14.8.1 RESULT (2026-11-17): BUILT, bim-ootb #3193 (`fix/howto-heading-trl`)
- `help_panel.js` looks the heading up as `howto_gh_<anchor>` (`ghKey`, one rule shared with W-HOWTO H6 and the batch); `?v=3` in viewer.html + modeller.html; `sw.js` v1726. Batch `viewer/tools/trl_batch_2026-11-17_howto_headings.js`: 20 keys, ids 1001066-1001085; 13 machine-translated by Claude (labelled, no speaker review, composed from the pills' own dictionary words), 7 reuse an existing row verbatim.
- **Witnessed (logs read):** T1 `§W-VIEWER-I18N PASS pass=91 fail=0`, all 18 locales 0 leaks, controls (4) 6/6 and (6) 15/136 still fail when broken — **the first full green of this witness since the pills added after S226**. T2 W-HOWTO H6: before the batch `§FAIL H6a 0 of 20`, after `20 of 20`, H6b `280 of 280`, red (renamed heading) `19 of 20`; `§W-HOWTO PASS` with the page. T3 `§W-HELP-DOCK PASS`, `§W-HELP-DOCK-M PASS`.

## 14.8.2 SPEC: a contract verdict that never reaches the witness's own log (2026-11-18, RESUME item 6)
**Issue it removes:** §14.8 RESULT found `witness_viewer_i18n.log` reading `fail=1` with no FAIL line. **Root cause measured, it is not this witness:** `witness_kit/contract.js` `run()` prints every PASS/FAIL line and its `§WITNESS_<NAME>` summary with `console.log` only (`contract.js:77-78,108,136`) and returns counts only. A witness that keeps its own log file (a buffer, an append, or a write stream) never sees those lines. Of the 33 witnesses on `main` that call `.run()` and write a file, 27 have no console patch (a first grep; S4 below gives the real count), so their logs can show a total with no line naming what failed. That is a witness that cannot report its own failure in its own log (PRIMAL LAW 4).
**Fix, in the owner of the question (one place):** `run(sink)` takes an optional line sink. When it is left out, `console.log` is used, so the output of every current caller stays byte-identical. Every line `run()` prints goes to the sink, and the returned object also carries `lines` (additive). No second print path.
**This PR moves the two witnesses of this lane:** `viewer/tests/witness_viewer_i18n.js` and `erp/tests/witness_erp_i18n.js` pass their own `say` to `.run()`, so the contract lines enter `OUT` and the `.log`, and no longer go to stdout only. The other callers are listed by name in the RESULT for their lanes (a one-word change each). This lane does not edit other lanes' witnesses.
**Claims (W-CONTRACT-SINK, `witness_kit/tests/witness_contract_sink.js`, node only, no browser; log `witness_kit/tests/logs/witness_contract_sink.log`):**
- **S1 the FAIL line reaches the sink.** A population that fails one invariant, run with a sink: the sink holds `FAIL <label>` and the summary `fail=1`. Falsifier `SINK_BREAK=drop` (the contract ignores the sink) FAILS S1.
- **S2 no sink = byte-identical.** The same run with no sink prints to stdout exactly the lines S1's sink got, in the same order (child process, stdout compared).
- **S3 `lines` returned** equals the sink's lines.
- **S4 the denominator, stated:** a static count of the callers on the tree: of the N that call `.run()` and write their own file, K pass a sink. This is printed, not a pass/fail, and the K callers are named. VACUOUS if N=0.
- **End of chain (T1):** re-run `witness_viewer_i18n.js`, and its `.log` holds `PASS erp9-zero-leaks` and the `§WITNESS_VIEWER_I18N` line (before the fix: absent). Re-run `witness_erp_i18n.js` the same way.

### 14.8.2 RESULT (2026-11-18): BUILT and MERGED, bim-ootb #3220 (`9026b21b`)
- `witness_kit/contract.js` `run(sink)`: every line goes to the sink (default `console.log`), returned as `lines`. `witness_viewer_i18n.js` and `witness_erp_i18n.js` call `.run(say)`.
- **Witnessed (logs read):** `§W-CONTRACT-SINK PASS pass=3 fail=0`. Falsifier `SINK_BREAK=drop`: `FAIL pass=1 fail=2` (S1 sink=0 past=5, S3). S2: with no sink, stdout equals origin/main's contract byte for byte (171 B). **T1:** `witness_viewer_i18n.log` now ends with the 10 contract lines (incl. `PASS erp9-zero-leaks`) + `§WITNESS_VIEWER_I18N pass=10 fail=0 ran=18`, `§W-VIEWER-I18N PASS pass=91 fail=0`. `witness_erp_i18n.log` has 0 contract lines when run from main's copy and 11 with the fix.
- **S4 denominator:** N=33 callers write their own file. 2 pass a sink, 6 patch `console.log` (gridtab_live, replay_clock, chainage_grid, road_report, sign_check, speed_zones), and 25 are bare (named in the W-CONTRACT-SINK log). Handed to the witness lane (`WITNESS_INTERFACE_FRAMEWORK.md`, note 2026-11-18).
- **Found, pre-existing on main, NOT this item:** W-ERP-I18N FAILS 7/4 on main's unchanged copy, with the same 4 as after the fix (`login-steps HARNESS Cannot read properties of undefined (reading '0')`, session mismatches=3 in every locale, en_US packRows=0, record not kept on 4 switches). Handed to `ERP_UI_LOCALES.md` (note 2026-11-18).
- **CI unblocked on the way:** `ubuntu-latest` is rolling to 26.04, where `npx playwright install chromium` fails ("Playwright does not support chromium on ubuntu26.04-x64"). The e2e job is now pinned to `ubuntu-24.04` (bim-ootb #3221 `c6a1631c`; e2e passed on it). Every PR whose e2e landed on 26.04 failed before this.

## 15. NOT URGENT, to think about (owner 2026-11-16: *"You mean we can mis.<translated verb>? Note in prompt then we shall think about it not urgent."*)
Two terminal ideas. Neither is built and nothing is decided.
1. **Field help at the terminal.** The browser's per-field tooltip / Tool Tip panel has no terminal equivalent: today only `mis.describe` (a kind's fields) and `help <word>` exist.
   - Idea: the field's own Description / Help answered from the SAME help pack in the chosen language (`lang_rule.js`).
   - E.g. `erp.ask` given a column, or `help <column>` inside `cd Order`.
   - Spec it here when picked up.
   - **How it would work in CLI form** (owner 2026-11-16: *"How would it work in CLI form? Note in prompt."*). There is no panel; the same text comes up where the browser shows it:
     - **(i) Asking about a field, by the LEVEL the CLI already has (§0: Student is a level beside the language; owner: *"i thot longer msg is 'student' mode?"*).**
       - default (`short`): `cd Order; help DocumentNo` prints the header and the Description, the tooltip;
       - `level student` adds the Help and the dictionary facts (mandatory, type, list values), the Tool Tip panel, with `HelpController`'s blank-line rules.
       - It is the field of the kind's window header tab, its own text as AD_Field_v (no inheritance, §7 F4), translated from the help pack.
     - **(ii) Being asked for a value.** When red1 prompts for a column (`new`, `run` parameters, the `"ask": "params"` forms), the field's Description shows as the one-line hint under the prompt (short level). In student level the Help shows too. `?` typed at that prompt prints the full Help at any level.
     - **(iii) Optional:** `mis.describe` adds each property's Description, read only.
   - **Why it is a small step:**
     - the data exists: AD_Field description / help, already read by `ad_parser.getFields`;
     - the translations exist: `erp/i18n/help/<lang>/help.json` `fields`;
     - the language rule exists: `common/door/lang_rule.js`;
     - the label rule exists: `erp_cli.js ask`'s `T()`.

     Only the read subcommand and the prompt hint are new.
   - **Witness idea:** for N fields of the shipped windows, the CLI's text equals the browser panel's (W-FIELD-HELP's oracle, so the terminal is a third reader of the same row), in en and one pack language. Falsifier: the column's text used instead of the field's.
   - **Ownership:** `help <word>` and the prompts are the CLI session's (`words_core.js`, `red1.js`). Agree the word with it first; `help <column>` must not collide with `help <word>` (a column name vs a word name).
2. **Verbs / words in the person's own language** (the question asked: "mis.<translated verb>"). Today every verb and red1 word is English; only the answers translate.
   - The idea is already a STUB in the CLI session's `prompts/CLI_ERP_IVR.md` (line ~78: "red1 words in the person's own language … a localized word expands to the SAME printed door line").
   - The door verbs themselves (`mis.describe`, …) stay English: they are the envelope and the journal, pinned for AI and scripts (§0 rule).
   - What could be translated is the red1 WORD a person types. The CLI session owns `words.json` and decides; this lane would supply the names from the packs.
   - Open questions: where the localized word lives (a per-language word table vs the help pack), and whether a word may collide with a dictionary name.

## 16. RESEARCH: help and search methods to learn from (owner 2026-11-17, relayed by the CLI session bim-compiler-ef)
**Owner, verbatim (in the CLI session):** *"research if there are cutting edge search and help methods to learn from"*, then *"help and search belongs to another session. So pose to it there to segregate."*
**Split agreed with the CLI session:** this lane = help and search (`erp.ask`, `erp/help_search.js`, `help_catalog.js`, help text, the `?` panels). The CLI lane = type assist (whole-line completion, next-command / intent prediction; `CLI_ERP_IVR.md` §1d). So fish/zsh autosuggest, PowerShell predictors, Warp/Fig specs and atuin/McFly are NOT judged here. Anything on the line (a did-you-mean that hands over to help) is agreed with the CLI session first.

**Judged against:** (1) no AI inside; (2) offline; (3) pure SQLite; (4) nothing new in the browser; (5) vocabulary from the dictionary; (6) the 6 guide languages, with CJK / Thai.

**Measured here first (2026-11-17):**
- The BROWSER's SQLite (`common/lib/sql-wasm.wasm`, sql.js) is 3.38.5 with `ENABLE_FTS3`, `FTS3_PARENTHESIS`, `RTREE`. **FTS4 yes, FTS5 NO** ("no such module: fts5"), so no trigram tokenizer.
- The CLI's Node SQLite (better-sqlite3) is 3.53.1, with FTS5 + trigram.
- So any SQLite-FTS answer would differ between the CLI and the browser.
- `Intl.Segmenter` (built into Node and the browsers, no model, ICU dictionaries) splits words with no spaces:
  - Thai: `ผนังรับน้ำหนัก` → `ผนัง|รับ|น้ำ|หนัก`;
  - Chinese: `如何创建销售订单` → `如何|创建|销售|订单`.
- Today `help_search.js` reads CJK as characters / character pairs (§12) and ranks how-to rows "BM25-like" by shared words.

| Method (source) | What it does | Verdict here |
|---|---|---|
| **Did-you-mean by edit distance** (git `help.autocorrect`: weighted edit distance, suggest / prompt / never; SymSpell: precomputed DELETES of dictionary terms, Damerau / OSA distance) | A mistyped word suggests the nearest dictionary word | **ADOPT.** All 6 pass: the deletes are built from the dictionary's own names at build time into the help pack; the lookup is plain JS. Suggest, never auto-run (git's `prompt`, not its timer). Write our own from the algorithm (SymSpell code is LGPL-3.0). Where the CLI hands an unknown word to help, agree it with the CLI session. |
| **Example-first help** (tldr pages: a one-line description, then a few concrete runnable examples with `{{placeholders}}`; a linter enforces the shape) | The answer leads with the line to type | **ADOPT** for the card shape: the CLI line + what it does first, then the reference. Examples only from `verbs.json` `examples` and the how-to rows (never written for the card). A witness can lint the shape (tldr-lint idea). |
| **Search names + descriptions + search terms** (nushell `help --find`: matches command names, descriptions and "search terms") | Finds a command by what it does, not only its name | **ADOPT.** Index the AD Description / Help and the verb descriptions too, not only names. Search terms = the element's names in all 6 languages (AD_Element_Trl), so a word typed in one language finds the entry. |
| **One box for everything** (Frappe Awesome Bar: type a DocType → its list, a record name → the record, "new task" → create, shown only with create permission) | Navigate, open a record and act from one search | **ADOPT, in steps.** The card already gives window + action. Next: a document number opens that record, and "new <window>" creates, both through the existing role access gate. The witness counts X of N windows. |
| **Typed prefixes** (Odoo Ctrl+K palette: `/` menus/apps, `@` users, `#` channels, `?` knowledge articles) | One character says what kind of thing you want | **ASK OWNER.** Deterministic and cheap, but it is a UI choice. A proposal: `?` help, `/` windows/menus, `#` document number. |
| **Word segmentation without a model** (`Intl.Segmenter`: Baseline 2024, Firefox 125+, Safari 14.1+, Chromium 87+) | Real words for zh / ja / th | **ADOPT, with a guard.** It is built in (nothing new loaded). Risk: different browsers ship different ICU dictionaries, so the same text may split differently. Plan: segment the DICTIONARY terms once at build time (Node, pinned) and keep the character-pair match as the fallback; the witness pins the expected splits. Thai is measured in Node only; Firefox Thai is unverified. |
| **Proper BM25** (FTS4 `matchinfo(t,'pcnalx')` + a ranking function, k1 = 1.2, b = 0.75) | Better ranking of the how-to rows | **ADOPT the formula, not SQLite FTS.** FTS4 exists in both, but its tokenizers cannot split CJK / Thai, and FTS5 exists only in the CLI. One JS BM25 over our own tokens (field weights: name > description > help) gives the browser and the CLI the SAME answer (one implementation). The corpus is small (thousands of rows): an in-memory index is enough. |
| **SQLite FTS5 trigram** (substring search, LIKE/GLOB acceleration, since about 3.34) | Substring search | **REJECT here:** CLI-only (the browser build has no FTS5), so the two would answer differently. |
| **MiniSearch / Lunr / Pagefind** (client search libraries / static indexes) | Ready-made search | **REJECT:** each is a new library in the browser. (The MkDocs guides keep their own built-in search; that is not this box.) |

**Proposed order (for the owner; nothing is built):**
1. Did-you-mean over the dictionary, ERP box + BIM panel. **ON HOLD (CLI session, 2026-11-17):** the shell already has its own typo policy (`CLI_ERP_IVR.md` §25 D14, `words_core.js`). Two indexes for one job would break AD-LAYER LAW 5, so it must be ONE suggester over ONE name index, used by both the shell and help. This lane's design (built at build time, suggest only, never auto-run) matches the shell's rule and may become the shared one. The CLI session puts the choice to the owner and messages the answer. Build neither until then.
   - **DECIDED (owner "Agree on all", 2026-11-17, via the CLI session):** ONE suggester, the existing `common/door/assist_core.js` `nearest(typed, names, n)` (CLI_ERP_IVR §42, BIMCompiler #866). The help box passes its own names (help pack windows / actions / statuses for the language) and shows the top n. There is no second edit-distance function in erp/.
   - **Checked 2026-11-17 on the packs** (a one-character substitution mid-name):
     - names of 3+ characters: top-1 de 354/354, zh 214/216, ja 292/293; mean 1.1-1.6 suggestions; `rule` never fires (names have no `_`). No segmenter is needed for names: an IME homophone slip is a one-character substitution.
     - **2-character names:** lim = 2 matches every short name (zh: mean 51 suggestions; ja: 15). Top-1 is still right (46/49, 14/15), but the rest is noise.
     - Proposed to the CLI session: lim = min(max(2, ⌊len/3⌋), len−1). Its change, its witness. Thai not tested (no th pack).
2. The index also covers descriptions and the 6-language names (cross-language find).
3. `Intl.Segmenter` terms at build time + character-pair fallback.
4. One exact BM25 with field weights.
5. The example-first card shape, with a shape linter.
6. Awesome-bar steps (open a document number; "new <window>").
7. Prefixes. **OWNER AGREED 2026-11-17:** *"Agree with the leading char idea. Wonder if it is applicable to CLI too?"*
   - **Shell facts (bim-ootb origin/main):**
     - `?` already means help at the start of a red1 line (`common/door/red1.js:40`, `/^\s*(help|\?)/`), the same meaning as proposed;
     - `#` has no meaning in red1, but is a bash comment in an unquoted `red1 '…'` one-liner;
     - `/` already separates location segments (`erp/Order/…`, `building/kind`, `words_core.js:30-31`), so a leading `/` may read as a path;
     - `@` is unused.
   - **Rule proposed:** one character, one meaning, in the help panel, the ERP box and the shell, defined ONCE in the shared vocabulary.
   - The shell line is the CLI session's: it decides `/` and `#` there. Sent to bim-compiler-ef 2026-11-17.
   - Spec the box side (W-PREFIX, with falsifiers) when picked up.

Every step gets a witness with a falsifier (e.g. did-you-mean: N misspellings derived from dictionary names, each must return its source word; a made-up word must return nothing).

**Sources:**
- [Frappe Awesomebar](https://docs.frappe.io/erpnext/awesomebar-global-search), [Frappe Desk](https://docs.frappe.io/framework/user/en/desk)
- [Odoo 17 keyboard shortcuts / command palette](https://www.odoo.com/documentation/17.0/applications/essentials/keyboard_shortcuts.html)
- [SymSpell](https://github.com/tablesmit/symspell), [symspell_rs (OSA vs Damerau)](https://docs.rs/symspell_rs)
- [tldr style guide](https://github.com/jvns/tldr/blob/main/contributing-guides/style-guide.md), [tldr client spec](https://github.com/tldr-pages/tldr/blob/v1.3/CLIENT-SPECIFICATION.md)
- [sqlite-fts4 BM25 over matchinfo](https://github.com/simonw/sqlite-fts4)
- [Intl.Segmenter Baseline](https://web.dev/blog/intl-segmenter), [MDN Intl.Segmenter](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter)
- [nushell help](https://www.nushell.sh/commands/docs/help.html), [nushell help commands](https://www.nushell.sh/commands/docs/help_commands.html)
- [git autocorrect](https://adamj.eu/tech/2022/10/26/git-how-to-enable-autocorrect/), [help.autocorrect=prompt patch](https://code.googlesource.com/git/+/dc66e3c799cd5d8f3e664e26899bca200ffdfd7b%5E%21/)
- [SQLite trigram forum](https://sqlite.org/forum/forumpost/76b444bebe?t=c)

## 17. FILM STUB: "Help that answers" sequel, in the Viewer (EN) (owner 2026-11-17: *"before exiting sufficient to make a EN flim sequel to show Help in Viewer?"* → outline → *"ok"* to note it)
**Not made yet; make it in a fresh session.** Everything shown is live and witnessed (§14.1-§14.5).

**Story** (about 2 min, house style per feedback memory: split screen, typed terminal strip above + the real Viewer below, REAL key sounds, voice after the return key):
1. Click a wall (Duplex). The info panel shows "What this is" and the folded IFC definition with the bSI credit (W-CLASS-HELP C5).
2. Switch to de_DE: the official German bSI text. Switch to zh_CN: our Chinese sentence + the English bSI text + the "no official translation" line (the honesty beat).
3. F1: the amber panel on the left, beside the info panel. Type "native": Save is found from a bullet word, opened (W-HOWTO H4c).
4. Open Find: its Guide link (the exact section), and "Same at the CLI" `viewer.counts building=<building>`, typed and run in the terminal strip. This is the CLI beat.
5. Drag the panel to a darker spot, close, reopen: it comes back as left (W-HELP-DOCK D3 / D6).

**Make it from:**
- **`scripts/film_cli_in_action/`** (house style; real samples only, `~/.local/share/film_narration/keys_eklee/`, credit on the end card; check K2 must pass).
- **The shot / caption checks of `scripts/film_help_showcase/`** (`capcheck.py`; keep turns ≤ about 95 chars). Its `shots.js` drives only `erp/idempiere.html`: new shots are needed for `viewer.html?db=…`, captured on the CPU (swiftshader, as the witnesses do), never the GPU.
- **Opening / closing cards** as §11 (credentials; the McKinsey quote may be reused or replaced, on the owner's word).

**Rules:**
- Leave out what is not built: the Modeller help, the `?` / `#` prefixes, did-you-mean, and the 8 tools with no guide section.
- EN only; other languages on the owner's word.
- The film is never pushed, only its scripts.
- Read `prompts/FILM_NARRATION.md` ▶ PLAYBOOK first.

### 17.1 BUILD SPEC (2026-11-17, owner: *"proceed as you plan"* — the plan said: finish §14.5 step 2, then make the §17 film in this session)
**Issue it removes:** the Viewer's help (§14.1-§14.4) is live and witnessed, but nothing shows it; the first film (§11) is ERP only.
**Pipeline:** `scripts/film_help_viewer/`, copied from `scripts/film_help_showcase/` (same build.sh steps: shots → facts → guard → cards → voice measure → beat lengths → silent picture → fit → two-pass mux → key sounds → K2 → C). Work folder `~/Videos/help_viewer_film_work/out` (never in git). EN only, Kokoro voice (local CPU).
**Pictures (`shots.js`):** the REAL `viewer/viewer.html?db=…Duplex…` from a bim-ootb `origin/main` tree, headless Chromium on the CPU (swiftshader, as the witnesses), 1280x720 at device scale 1.5. Every rectangle the cards crop is read from the page (`getBoundingClientRect`), never placed by hand. The same steps the witnesses use: Find `IfcWall` and click results until `#info-class` reads IfcWall (W-CLASS-HELP C5); F1 (W-HELP-DOCK); the search box filled (W-HOWTO H4c); the header dragged (W-HELP-DOCK D3).
**Beats (narr.js; F asks, M answers, short):**
| id | top strip (real lines only) | lower frame | facts the voice speaks |
|---|---|---|---|
| cover | — | title card | — |
| quote | — | the §11 McKinsey card, same saved copies | `quote.found` |
| klass | the page's `§CLASS_HELP guid=… class=IfcWall ours=Y ifc=Y` line | info panel, `#info-class-help` opened | our sentence shown; bSI text + credit shown |
| lang | `§TRL_LABELS locale=de_DE` + `§CLASS_HELP` lines of both sessions | de_DE block, then zh_CN block | German text is bSDD's de-DE (byte-equal to the saved `bsdd_IfcWall_de-DE.json`); zh shows the fallback line |
| ask | `native` TYPED into the help box (key sounds), then `§HOWTO_PALETTE … filter="native"` | the panel before, then Save Building opened | the word is in no pill name; the entry found is Save |
| cli | `viewer.counts building=Duplex` TYPED at the `red1 ❯` prompt, then its real envelope (total, per discipline) | the panel's Find entry opened: its Guide link + "Same at the CLI" lines | the count = the envelope's number; the CLI line in the panel = `howto.json`'s |
| dock | the page's `§DRAG_SAVE` / `§KBD_HELP close` / `§HELP_DOCK open` lines | moved, closed, reopened in the same place | reopen place == saved place (±1 px) |
| close | — | cost (measured), prior art (only sources this lane read), credentials (PRs + verdict lines run on the same tree), the bSI attribution (CC BY-ND 4.0, §14 (a)), key-sound credit | — |
**Guard (`guard.js`, fails the build):** every `says` fact resolved from facts.json / the witness logs / saved copies; no page error; every picture present; every PR on the card MERGED; the verdicts on the card are PASS lines of W-CLASS-HELP, W-HOWTO, W-HELP-DOCK run on the same tree; prior-art rows' text found where cited (check P); **not-said list:** live/real-time, faster/speed, first/novel/unique, the Modeller, prefixes, did-you-mean, any language but German and Chinese.
**Checks after the mux (numbers, not a viewing):** K2 (no voice over typing, keys audible), C (captions in the bottom 170 px), frames = the silent picture's, longest silence ≤ ~7 s, ≈ −16 LUFS. Output `~/Videos/Help_that_answers_Viewer_EN_AFTER_<date>_v1.mp4`, never overwritten; not pushed.

### 17.1 RESULT (2026-11-17): `~/Videos/Help_that_answers_Viewer_EN_AFTER_2026-11-17_v2.mp4` (111.4 s, 2,674 frames, −16.6 LUFS; not pushed, films stay on the machine)
- **Pictures and facts:** `shots.js` on bim-ootb main `d68e0f71` (after #3171) drove the real Viewer + Duplex headless on the CPU, 0 page errors. `red1 'viewer.counts building=Duplex'` answered `1193 elements: MEP 809, ARC 270, ELEC 81, STR 19, PLB 14` (10.8 s). `facts.js` VERDICT PASS.
- **Witnessed on that same tree:** W-CLASS-HELP PASS, W-HOWTO PASS, W-HELP-DOCK PASS (logs in `scripts/film_help_viewer/out/`).
- **Checks of the build** (logs in `out/`):

  | Check | Result |
  |---|---|
  | guard (25 spoken facts, 7 musts incl. a planted-count red control, 3 prior-art rows, 7 not-said) | PASS |
  | cards (no overflow) | 48 stills, 0 too tall |
  | voice fit | 6/6 DETAIL, 6/6 question tones OK |
  | K2 (no voice over the typing, keys audible) | PASS, keys 18.6 dB under the voice |
  | keys | 35/35 typed + 2/2 returns |
  | frames | planned = encoded (2,674) |
  | C, captions in the bottom 170 px | PASS 22/22; falsifier `CAP_Y=960` FAILs 21/22 |
  | silences ≥ 4 s | the silent cover 4.8 s and the silent end card 19.1 s only (the §11 film's end card measures the same 19.1 s) |

- **Defects found and fixed while building (each a rule for the next film):**
  - (1) "native" finds TWO entries (Save Building and Open Building, W-HOWTO H4c `rows=2`): the voice names both, and the guard checks the rows shown are exactly the entries holding the word;
  - (2) at 1280×720 the Find panel covers the info panel's top, so the class text was hidden in the crop. Shot at the witnesses' 1600×900 (scale 1.2, still 1920×1080 pixels); the guard checks Find covers neither the info panel nor the help panel's place;
  - (3) a WH question rose ("What if I do not know what a tool is called?", §NARR_TONE WRONG): reworded as a yes/no question;
  - (4) the card overflow check counted a crop's clipped picture as overflow: a crop is judged by its box only.
- **Observed, not this lane's (Find panel lane):** at 1280×720 a mouse drag inside the Find panel's 64 px drag strip (`nf_ui_history.js:268`) did not move it, while the same drag moves `#info-panel` (W-HELP-DOCK D3b). Its `pointerdown` handler stops propagation (`:271`). Not diagnosed further; not claimed as a bug.
- v1 (same day) had defect (3); kept on the machine, superseded by v2.

### 17.2 REDO SPEC (owner 2026-11-17, for a NEW session): frame it bigger
**Owner, verbatim:** *"The film update the prompt in new session to redo because the canvas for Duplex is not large enough. Both building on canvas and the left panel should zoom in and fill up much empty space on sides to frame visibly."*
**Issue:** in v2 the subject is small. Measured from `scripts/film_help_viewer/cards.js` + `out/shots.log`:
- the lower band shows the WHOLE page scaled to 620 px tall (1,102 px wide, x 30–1132), with a crop on the right (at most 718 px wide); below 1,080 px, only the bottom 170 px are for captions;
- the Duplex sits small in the middle of the 3D canvas (shot as the page opens, no framing step);
- the help panel crop is reduced 0.76× (palette 576 px wide, top 760 px); the info-panel crops 1.03–1.49×.
**Redo (v3), keep everything else** (beats, voice TSV, guard, K2, C, the main tree rule):
1. **The building fills its canvas:** before each shot, frame the model with the Viewer's OWN fit/zoom (find the call in the next session; never hand-placed camera numbers). Log, per shot, the model's projected box height / canvas height and the box's left/right edges against the open panels.
2. **The panel and the building fill the frame:** drop the "whole page small + crop" layout. Each still = ONE cropped region of the page (the panel + the building beside it, or the info panel + the building), scaled to fill the 1920 width and the band height, with no wide empty side margins.
3. **Witness it with numbers, not a look:** per still, (a) the share of the lower band that is page pixels (not the `#0f172a` background) and (b) the building's box height / band height. Set the two bars from a first measurement of v2 vs a v3 trial, print both, and FAIL a still below the bar. Text in the crop must stay ≥ the §11 film's smallest legible glyph (measure it).
4. Output `~/Videos/Help_that_answers_Viewer_EN_AFTER_<date>_v3.mp4`; v2 stays on the machine.
5. **A new opening quote (owner, verbatim):** *"need not use the 20% stats in start of film, try another quote perhaps from media expert of forum feedback about need for good Help in apps"*.
   - Drop the McKinsey 20 % card (and its `quote` beat's words).
   - Find ONE real quote on why good in-app help matters: from a recognised UX / media expert, or real user feedback in a public forum. Fetch the page, save the copy in `out/prior/` (as §11 did), and keep the exact words, the author, the date and the URL.
   - `facts.js` must find the quote verbatim in the saved copy, or the build fails. Never paraphrase, never write one. If no fetched source holds a usable sentence, say so and ask the owner; no card is made up.
   - The narration beat and the end card's credit change with it (the guard's `quote.*` facts too).

### 17.3 BUILD SPEC v3 (2026-11-17, new session, owner order: *"resume message, do film only"* = do §17.2)
**Issue it removes:** v2's subject is small (§17.2 Issue). **Claims to prove (each a log line, never a look):**
- **F1 the model fills its canvas.** Every still's page picture is taken after the Viewer's OWN fit (the `Home` key, `scene.js _homeFillFrame`, "§ROOM_HOME reset=cycle+frame"); no camera number is typed by hand. Per shot `shots.js` logs `§FILM_FRAME name= canvas= box= box_h/canvas_h= box_x= panels_x=`: the model's projected box (every visible mesh's AABB corners through `A.camera`) against the canvas and against each open panel's left/right edge.
- **F2 one crop per still, full-bleed.** A card's lower band (1920 x 620, y 290-910, bottom 170 px stay for captions) is ONE region of the page: the union of its subject rectangles (panel and/or info panel, plus the model's box), scaled up by `z` (band px per CSS px) = min(ZMAX, 1920/union.w, 620/union.h), centred on the union. No whole-page thumbnail, no side margins. Pictures are shot at device scale 2.4 so that the zoom stays sharp.
- **F3 numbers.** `cards.js` measures the PNG it wrote: (a) share of the band's pixels that are not the film background `#0f172a` (bar: 99 %), (b) the model's box height inside the band / band height, (c) share of the band's width spanned by the subject (panel and model box, x-extents united), (d) the smallest font size of the visible text in the subject x z. The same four are measured on a v2-layout render of the same shots (function `lowerV2`, kept only to calibrate) and the bars are set below, from that first measurement; a still under a bar FAILS the build (`§FRAME_BAR`, `TOO-SMALL`).
- **F4 the opening quote** (owner, 2026-11-17) is Jakob Nielsen's heuristic 10 'Help and documentation', two sentences, verbatim in the saved copy of nngroup.com/articles/ten-usability-heuristics/ (fetched 2026-11-17, `~/Videos/help_viewer_film_work/prior/`, copied to `out/prior/`); `facts.js` fails if the sentences are not in it; the McKinsey card, its words and its end-card credit are gone; the guard's `quote.*` facts follow.
**Output:** `~/Videos/Help_that_answers_Viewer_EN_AFTER_<date>_v3.mp4`; v2 stays. The film is not pushed, only its scripts and the logs of `out/`.

### 17.3 RESULT (2026-11-17): `~/Videos/Help_that_answers_Viewer_EN_AFTER_2026-11-17_v3.mp4` (113.0 s, 2,711 frames, −16.6 LUFS; not pushed, films stay on the machine; v2 kept)
- **Tree and pictures:** bim-ootb `main` `2989f8f5`, real Viewer + Duplex, headless on the CPU at device scale 2.4, 0 page errors. `red1 'viewer.counts building=Duplex'` again `1193 elements: MEP 809, ARC 270, ELEC 81, STR 19, PLB 14`. Pipeline `scripts/film_help_viewer/` (logs in `out/`).
- **F4, the quote:** Jakob Nielsen, heuristic 10 "Help and documentation", *"Help and documentation content should be easy to search and focused on the user's task. Keep it concise, and list concrete steps that need to be carried out."* — nngroup.com/articles/ten-usability-heuristics/, page dated April 24, 1994, last reviewed Jan. 30, 2024, copy fetched 2026-11-17 (`~/Videos/help_viewer_film_work/prior/`). `facts.js` found both sentences verbatim, the title and the dates on the same copy, and heuristic 10 as their heading. McKinsey card, its words and credit removed; narration beat and guard facts (`quote.source/h10/found/steps`) follow. The owner asked for "a media expert or forum feedback": this is the expert; no forum quote was searched.
- **F1, the model fills its canvas** — the Viewer's own `Home` fit alone is NOT enough: `§ROOM_HOME` has an 80 m floor, so Duplex (9x22x8 m) stayed at box 235x198 of the 1600x900 canvas (0.22 high). The framing is the user's own gestures, measured: mouse wheel (OrbitControls dolly) and a right-button drag (pan), looped until the projected box (all 91 meshes' AABB through `A.camera`, waiting for the damped camera to stop) hit the target; every step is a `§FILM_FIT` line. Class-text stills: box 545,394,461x446 (0.50 of canvas height) beside the info panel. Help stills: box 486,37,578x439 (0.49), top inside the canvas, level with the help panel's first rows.
- **F3, numbers** (`framecheck.py`, `out/framecheck.log`; bars set from the v2 measurement, listed in the file):

  | metric | v2 (measured) | v3 (45 band stills) | bar |
  |---|---|---|---|
  | (a) band pixels that are page, not film background | 0.57-0.82 (frames of the v2 mp4 at 18-90 s) | 1.00 | 0.99 |
  | (b) model box height / band height | 0.19 (box 169 of 900 css px at page open, probe) | 0.86-0.99 | 0.80 |
  | (c) subject width / band width | 0.57 (a 1102 px page thumbnail) | 0.62-1.00 | 0.60 |
  | (d) smallest text, band px | 8.2 (9 css px x 0.76 x 1.2) | 11.0-13.6 | 10.5 |

  Zoom z (band px per css px): 1.22-1.40 (v2: 0.69 thumbnail, 0.91 panel crop). Red controls: an empty band FAILS 45/45; v2's own numbers FAIL all four bars (`framecheck_v2.log`).
- **Honest limits:** (c) is only 0.62-0.70 on the three class-text stills: the model fills the band's height, so the width cannot grow without cutting the model; ~30-38 % of their width is empty canvas (the help stills 0.81-1.00). (d) glyphs are the Viewer's own 9-10 css px text enlarged 1.2-1.4x; the §11 film's smallest glyph was not re-measured, so "≥ §11" is NOT claimed. The dock drag is now +200 px (was +560, which would have covered the larger model); the guard's moved-by threshold went 300 → 150 px.
- **Other checks** (logs in `out/`): guard 46 OK / VERDICT PASS (25+ spoken facts incl. the 4 quote facts, a red control, 3 prior-art rows, 7 not-said); cards 48 stills, 0 too tall; voice fit 6/6 DETAIL, all question tones OK (the opening question is yes/no); K2 PASS (keys 18.6 dB under the voice); keys 35/35 + 2/2; frames planned = encoded (2,711); C captions PASS 23/23, falsifier `CAP_Y=960` FAILs 22/23; silences ≥ 4 s: the cover 4.8 s and the end card 19.2 s only; −16.6 LUFS.
- **Found on `main`, not fixed here (film only): W-HOWTO H1 FAILS on clean main 2026-11-17** — `viewer/help/howto.json` ≠ `build_howto.js` run on today's live guide. The BIM User Guide gained a "Help — F1, the info panel, and the command line (LIVE)" section; the generator rule "most mentions, ties: first in the page" now sends **Save Building and Open Building to that Help section instead of "Save & Open a building"** (a wrong link; the `Help` pill's own link moved there correctly). The film shows neither link, so its card names the checks it uses (`W-HOWTO H2 H3 H4a-H4e PASS`), never "W-HOWTO PASS". Fix = the generator's tie rule (prefer a heading sharing a word with the pill name), then regenerate; a separate bim-ootb PR.
- **Rules learnt:** (1) a build script's `grep` of its own log matched a progress line (`§FRAME_BARS_RECORDED` vs `§FRAME_BAR`) and killed a good build: match the full tag plus a space; (2) the Viewer's `Home` is not a fit for a small model, and `BOX` over only the *visible* meshes flickers with DLOD: measure all meshes and wait until the box stops; (3) a Find panel stays open and sits over the info panel's header once the class text opens (19 px): the guard now checks it against the class text, measured at the shot.

## 18. FABLE BRIEF: the one query core (the lane's hardest design challenge; written 2026-11-17 so the agent's tokens are bounded)
**Use:** the Opus session copies THIS section into ONE `Agent` call (`model: fable`, fresh agent, not a fork). The agent sees nothing else, so do not paraphrase it. One dispatch only; no second round without the owner. This is the case `feedback_agent_model_sonnet_only.md` allows (2026-11-17, owner: *"if u hit a code design or spec problem use a well scoped Fable agent to resolve"*): a narrow brief, not routine building. If the call returns HTTP 429 (the Fable rate limit that hit two dispatches on 2026-09-05), do NOT retry in a loop: tell the owner and carry on with item 2. Why Fable and why only this: it is the one decision in the lane that many later builds depend on and that is cheap to get wrong (two apps and the shell must give the SAME answer, across scripts the code cannot split). Everything after it (building, translating, witnessing) is Sonnet work.

**Goal.** Design, on paper, the ONE deterministic retrieval core that the Viewer help panel, the Modeller help panel, the ERP help box and the `red1` shell all call: what is indexed, how a query is split into words, how results are ranked, what a leading character means, how a misspelling is handled, how "open this document number" and "new <window>" are answered. **Output is a design document, not code.** No AI inside, offline, nothing new loaded in the browser, vocabulary from the dictionary, the ERP twin identical to legacy iDempiere where legacy has the behaviour, and no per-window code (CLAUDE.md AD-LAYER LAW: one generic engine; "X of N" claims with N from the dictionary).

**Already measured: do NOT re-measure (cite them).**
- The browser's SQLite (`common/lib/sql-wasm.wasm`) is 3.38.5: FTS4 yes, **FTS5 no**; the CLI's Node SQLite is 3.53.1 with FTS5 + trigram. So SQLite FTS cannot be the shared ranker. Libraries (MiniSearch, Lunr, Pagefind) are rejected: each is new code in the browser.
- `Intl.Segmenter` (no model, built in) splits Thai and Chinese into words, but browsers ship different ICU dictionaries. Today `erp/help_search.js` reads CJK as characters and character pairs (§12).
- `AssistCore.nearest(typed, names, n)` (`common/door/assist_core.js`) is the one suggester (CLI_ERP_IVR §42, owner decided). On names of 3+ characters its top-1 is right: de 354/354, zh 214/216, ja 292/293. On 2-character names its limit `max(2, floor(len/3))` matches every short name (zh mean 51 suggestions); fix queued as §42 S3 (`lim = min(max(2, floor(len/3)), len-1)`), the CLI session's change. Suggest only, never auto-run.
- Shell facts: `?` already means help at the start of a red1 line (`common/door/red1.js:40`); `#` is unused in red1 but is a bash comment in an unquoted `red1 '…'`; `/` separates path segments; `@` is unused. Owner agreed one character = one meaning in the panel, the box and the shell (§16 item 7; CLI_ERP_IVR §41 = `?` help, `#<number>` a document).
- The help pack is ~1.3 MB for 4 languages (`erp/i18n/help/<lang>/help.json`); the Viewer chooser has 18 locales; guides have 6 languages (id, zh-CN, fr, ja, es-419, de); Arabic is right-to-left.

**Read only these (slices, not whole files; stop reading at 12 files).**
`prompts/VOCAB_MESSAGE_CATALOG.md` §16 and the block "▶▶ (earlier) … AGREED design" · `prompts/CLI_ERP_IVR.md` §25 D14, §41, §42 · bim-ootb (`git show origin/main:<path>`, never check out): `erp/help_search.js` (111 lines), `erp/tools/build_help_pack.js`, `erp/erp_i18n.js` (`loadHelp`), `common/help/help_panel.js`, `common/door/assist_core.js`, `common/door/red1.js` lines 30-60, `viewer/help/howto.json` (shape only, `head`). Legacy oracle (AD-LAYER LAW 7): `~/idempiere-dev-setup/idempiere/`, at most 3 greps, to find whether legacy has a global "search the menu / windows" mechanism; cite its file:line or write "none found".

**Decide each, with the evidence the line asks for (this is the deliverable's core):**
- **D1 Index.** What one record shape serves ERP windows/processes/doctypes/statuses/actions, Viewer pills + how-to + IFC class text, Modeller pills + guide sections. Fields and weights (name > description > help). Where it is built (build time, Node, pinned) and where it lives (the help pack). Evidence: the record is generic, no table or window named.
- **D2 Words.** How a query becomes terms for en/ms/de/fr/es/id and zh/ja/th, so the browser and Node agree. Options: build-time `Intl.Segmenter` on dictionary terms only + character pairs for the query; or character n-grams for CJK/Thai only. Evidence: a falsifier that FAILS if the two environments split one real term differently.
- **D3 Rank.** One exact BM25 in plain JS (k1 = 1.2, b = 0.75 as §16 proposes, or argue otherwise) shared by browser and CLI; a total tie-break order so two runs and two environments give the byte-identical list. Evidence: how a witness proves browser == Node over N queries (N derived from the dictionary, e.g. every window name in 3 languages).
- **D4 Grammar.** The leading characters as a grammar of at most 15 lines (`?`, `#<number>`, plain text; `/` and `@` stay out), with a collision table (bash `#`, a literal `?` in a question, URLs, the Modeller's `?` toggle which the shared panel must keep working, §14.5 `noAutoFocus`). Where the parser lives (one file in `common/`), what the shell and the box each add.
- **D5 Did you mean.** How `nearest()` results join the ranked list (merged, or a separate line), the top-n, and the rule for 2-character names until S3 lands. Never auto-run.
- **D6 Actions.** "open document <number>" and "new <window>": the exact rule, through the existing role access gate, and the X-of-N witness (N = the dictionary's windows/doctypes). What it must NOT do (no write without the gate).
- **D7 Twin and legacy.** What legacy iDempiere does for the same need, or "none found"; for each place the design differs from legacy, say so and why the twin may show MORE (CLAUDE.md TWIN rule; owner's D3: shape stays legacy's).
- **D8 Cost.** Pack size per language (extra bytes for terms/postings), build time, per-query milliseconds and heap on a phone-class budget; one number each, with how it will be measured (do not measure now).

**Deliver exactly one file:** `prompts/HELP_QUERY_CORE_DESIGN.md` (create it; edit nothing else; no code except a pseudo-code tie-break of at most 40 lines), at most **450 lines**, in this order: (1) one-paragraph summary; (2) the decision table D1-D8: options (at most 3), chosen, why with a measured fact or `file:line`, and the falsifier that would fail if the choice is wrong; (3) the grammar and collision table; (4) the record shape (JSON) and pack layout; (5) the witness list (name, claim, N source, red control); (6) a build order of at most 6 steps, each one PR; (7) at most **3** owner questions, only decisions that are the owner's and not derivable. Mark every statement as MEASURED (with source) or PROPOSED. Never write a number you did not read.

**Budget (hard).** At most **45 tool calls** and **12 files read**; no sub-agents; no web search (the §16 sources are enough; at most 2 `WebFetch` of a URL named in §16 if a decision truly needs it); no writing outside the one file; no running of witnesses, builds or browsers. **Reply to the Opus session in at most 300 words:** the file path, the 8 chosen options in one line each, the 3 questions. If a decision cannot be made from what is in the brief, write it as an owner question, do not explore further. If you reach 45 tool calls, stop and deliver what you have, marking unfinished decisions UNDECIDED.

**What the Opus session does with it (acceptance, before anything is built).**
1. Spot-check **at least 5** `file:line` / measured claims in the file against the source (a Fable result arrives in the same confident voice as a wrong one); reject the whole file if 2 fail.
2. Show the owner the summary and the questions, one design detail at a time (`feedback_design_discussion_one_detail_at_a_time.md`); do not decide topology alone.
3. Only then write the witness specs (§19, spec before code) and hand the build steps to Sonnet agents, one PR each. Message the CLI session about D4/D5 before the shared parts are built.

### §18 RESULT (2026-11-17): design DELIVERED, ACCEPTED on spot-check, owner questions OPEN
- **File:** `prompts/HELP_QUERY_CORE_DESIGN.md` (263 lines; Fable agent, one dispatch, 14 tool calls, 9 files read, nothing built). Branch `prompts/help-query-core`.
- **Acceptance (step 1): 7 of 7 claims checked against the source, all hold:** `GlobalSearch.java:44` (the class) and `:62` (`PREFIX_DOCUMENT_SEARCH = "/"`); `MenuSearchController.java:586-607` (startsWith under 3 characters, else contains, after `Util.deleteAccents`); `:435-451` (`onSelect(selected, newRecord)`); `DocumentSearchController.java` `/TransactionCode text`; `common/door/red1.js:40` (`/^\s*(help|\?)/`); `erp/erp_i18n.js:58` (`loadHelp`).
- **Chosen (PROPOSED):** D1 one generic record + a thin adapter per app, lazy `index.json` beside the help pack, weights 3/2/1 · D2 `Intl.Segmenter` at build time only, longest match + character pairs at run time · D3 BM25 k1 1.2 b 0.75, integer scores, legacy's menu filter as tiers ahead of the score, total order tier/score/kind/name by code unit/id · D4 `?` help, `#<number>` document, `@` refused, `/` no meaning, one parser `common/help/help_grammar.js` · D5 separate "Did you mean" line, n = 3, drop `nearest` hits for names of 2 characters or fewer until §42 S3 · D6 open only, through the existing gate · D7 legacy HAS a global search; the core exports its filter exactly · D8 budgets only (not measured).
- **Finding that changes an agreed point:** legacy's document prefix is `/`, not the agreed `#` (§16 item 7). The twin has no port of legacy's global search (one grep); that gap goes to the ERP parity lane.
- **Owner questions (step 2, one at a time):** Q1 `#` or `/` (or both) for an ERP document; Q2 does `#<number>` in the Viewer/Modeller select the IFC element `#123`; Q3 Thai in the first build or after the packed languages.
- **Q1 DECIDED (owner 2026-11-17: *"agree with you"* to advice (a)):** `#<number>` opens a document in the help box and the shell (one character, one meaning); legacy's `/TransactionCode` stays ONLY inside a port of legacy's global search box, byte-for-byte legacy. The help box does not read `/`.
- **Q2 DECIDED (owner 2026-11-17: *"agree with all, proceed to implement"* to advice (a)):** in the Viewer and Modeller `#<number>` selects + frames the element whose IFC id is that number in the open model; a model with no IFC ids answers "no element #<number>", never a guess.
- **Q3 DEFAULT (no advice was shown before "agree with all", so the safe default is taken and named, owner may reverse):** Thai comes AFTER the languages that have a help pack (fr de ja zh + en_US); no Thai pack exists to index.
- **Next:** §19 build specs, then the six steps of the design's §6, Sonnet one PR each → witness specs (§19) → Sonnet build steps, one PR each; message the CLI session about D4/D5 first.

## 19. BUILD SPECS for the query core (owner 2026-11-17: *"agree with all, proceed to implement"*; design = `prompts/HELP_QUERY_CORE_DESIGN.md`, BIMCompiler #889)
The design is the spec of record; each step below names only its scope, its files, its claims and what it must not touch. One PR each in bim-ootb, built by a Sonnet agent in its own `/tmp/wt-*` worktree; this session reads the logs and merges. `common/door/*` and `CLI_ERP_IVR.md` belong to the CLI session (notified 2026-11-17 of D4/D5): never edited here.

### 19.1 Step 1: the grammar (`common/help/help_grammar.js`), not wired
**Issue it removes:** three surfaces (help box, Modeller panel, shell) would each read a leading `?`/`#`/`@` their own way; the owner agreed one character = one meaning (§16 item 7, Q1, Q2).
**Change:** one PURE file (no require/process/fs/DOM; runs unchanged in Node and in the page, the `assist_core.js` shape): `parse(line) -> {kind:'help'|'doc'|'reserved'|'text', rest, number}` exactly as the design's §3 grammar (NFKC on the first character, so `？`/`＃` count; `#` + a run without spaces and nothing after = `doc`; `#` alone = `doc` with an empty number, the caller prints a usage line; `@` = `reserved`; `/` = text). It reads the input VALUE only, never a key event. Nothing calls it in this step.
**Claims, witness W-PREFIX (`common/help/tests/witness_help_grammar.js`, log `common/help/tests/logs/witness_help_grammar.log`):** P1 every row of the design's §3 collision table that names an input (URL fragment, `# heading`, `#1 priority today`, `#SO-1001`, `#` alone, `@name`, `¿Cómo…?`, a mid-line `?`, full-width `？`/`＃`, a leading `/` path) parses to the kind the table states, X of N printed, N = the rows read FROM the design file's §3 table at run time (a row the witness cannot map = FAIL, not skip); P2 the same cases give the byte-identical JSON in Node and in headless chromium (`--disable-gpu`); red control `HQ_BREAK=anyhash` (every leading `#` = doc) must make P1 FAIL; 0 cases judged = INCONCLUSIVE.

### 19.2 Step 2: the core + the ERP index (`common/help/help_query.js`), not wired
**Issue it removes:** `erp/help_search.js` ranks with an ad-hoc score (`+100` bonus, a STOP list, character pairs) that only the ERP page runs; the shell's `erp.ask` and the BIM panels cannot give the SAME list, and nothing proves a browser and Node agree.
**Change (design §2 D1-D3, §4):** `common/help/help_query.js` (PURE: fold, words, index made on first use, BM25 k1 1.2 b 0.75 as INTEGERS with no `Math.log` at query time, tiers 0-3, the total tie-break of §4, `legacyFilter` = `MenuSearchController.java:586-607` exactly); `common/help/tools/build_help_index.js` (Node; the only place `Intl.Segmenter` runs, to make the `vocab` word list; prints node + ICU versions into the header); `erp/tools/help_records.js` (the ERP adapter: windows, processes, doctypes, actions, statuses, how-to rows from the existing help pack + `ad_seed.db`, generic records, no table named in the core); output `erp/i18n/help/<lang>/index.json` for en_US, fr_FR, de_DE, ja_JP, zh_CN (Thai later, Q3). `erp/help_search.js` is NOT changed in this step (step 3 wires and deletes).
**Claims (witnesses in `common/help/tests/`, each with its log):** W-HQ-GENERIC (the core's source names no table/window id of `ad_seed.db` and has no branch on a kind; red: a `c_order` string added), W-HQ-SELF (every record found by its own name at tier 0, X of N per pack; red `HQ_BREAK=noname`), W-HQ-WORDS (browser and Node split every record name into the same terms, every built language; red `HQ_BREAK=nodict` in one environment), W-HQ-BM25 (integer score == a float BM25 recomputed in the witness within 1e-6 relative; red `HQ_BREAK=k1`), W-HQ-RANK-TWIN (browser list == Node list byte for byte over every window/process/action/status name x built languages + each first word alone + each how-to title; N printed; red `HQ_BREAK=revtie` in one environment; a run with no tie group = INCONCLUSIVE), W-HQ-COST build half (`§HQ_BUILD lang= records= bytes= ms=`; index.json <= 100 KB per language or the line says OVER, design D8). Existing W-HELP-SHOWCASE and W-ERP-ASK stay green (re-run, logs read).
**Not in this step:** wiring any box, the Viewer/Modeller adapters (step 4), Did-you-mean (step 5), `#` actions (step 6).

### 19.1 RESULT (2026-11-17): BUILT + MERGED, bim-ootb #3189 (`feat/help-grammar`, Sonnet agent)
`common/help/help_grammar.js` (31 lines, PURE) + W-PREFIX. Re-run here, log read: `§W-PREFIX PASS pass=21 fail=0` (14 of 14 rows of the design's §3 table read at run time + 6 extras; Node == headless chromium over 24 cases); red `HQ_BREAK=anyhash` → `FAIL pass=18 fail=3`. Four rows describe caller behaviour (bash `#`, Modeller `?` key, Viewer focus, legacy `/`); each is mapped to a representative input AND must find a phrase of the row's own result cell, so a rewritten row fails instead of being skipped. Not wired.

### 19.2 RESULT (2026-11-17): BUILT, bim-ootb #3192 (`feat/help-query-core`, Sonnet agent; auto-merge on)
`common/help/help_query.js` (151 lines, PURE, own `ln()`, code-unit compare) + `common/help/tools/build_help_index.js` + `erp/tools/help_records.js` + `erp/i18n/help/<lang>/index.json`. Not wired; `help_search.js`, `common/door/*`, pages, `sw.js` untouched.
- **Witnesses (agent's logs; GENERIC, SELF, RANK-TWIN + red `revtie` and `c_order` re-run here, same lines):** GENERIC 4/0 (red c_order, kindbranch FAIL) · SELF 10/0, 4,525 of 4,525 records at tier 0 (red noname FAIL) · WORDS 6/0, 8,352 of 8,352 names page == Node (red nodict FAIL) · BM25 6/0, 5,464 of 5,464, worst 1.55e-10 (red k1 FAIL) · RANK-TWIN 6/0, 5,466 queries, 125,887 hits, 2,515 pairs decided by id alone (red revtie `pass=1 fail=5`) · COST build half 21/0 (red eager, bloat FAIL). W-HELP-SHOWCASE 23/0 and W-ERP-ASK 11/0 before and after.
- **Sizes:** index.json en_US 85,268 B · fr_FR 98,951 · de_DE 93,893 · ja_JP 97,643 · zh_CN 94,340 (budget 100 KB; fr within 3%). Index made in memory 18-57 ms.
- **Deviations from the design (named, accepted):** (1) fold = NFKD, lower, strip U+0300-U+036F, NFC (design's NFKC was wrong, corrected in the design file; `Util.deleteAccents` uses the same range); (2) BM25 integer scale 1e9, not 1e6 (1e6 rounding broke the 1e-6 test on common-word top hits); (3) `allowed(gate, rec)` also gets the record; (4) window descriptions not indexed (no pack holds them; processes/doctypes English-only, action descriptions English in every language); (5) COST build-half red controls `eager` + `bloat`.
- **Left for later steps:** query half of COST (p95, heap), Thai (Q3).

### 19.3 Step 3: wire the ERP box and `erp.ask` to the core (design §6 step 3)
**Issue it removes:** after #3192 the core exists but the ERP How To box (`erp/idempiere.html:3107-3130`) and the shell's `erp.ask` (`common/door/erp_cli.js:427` requires `erp/help_search.js`) still rank with `help_search.js`'s own loop, so two rankers answer the same question.
**Change:**
- `erp/help_search.js` keeps its PUBLIC API (`indexFrom`, the card it returns, the module/`root.HelpSearch` export) so `erp_cli.js` (the CLI session's file) is NOT edited; inside, ranking goes to `HelpQuery` (`common/help/help_query.js`, `require` in Node, `window.HelpQuery` in the page; `idempiere.html` loads it before `help_search.js`, both `?v=` bumped, `erp/sw.js` precache + version bump).
- **One record builder:** the runtime `indexFrom` and the build-time `erp/tools/help_records.js` must make records with the SAME pure function (move it where both can call it, e.g. `erp/help_records_core.js`); no second record shape.
- **Deletion budget (AD-LAYER LAW 4):** from `help_search.js` remove the ranking loop, `pairs()`, the `STOP` list, the shared-word window fallback and the `+100` bonus; PR states lines + / -.
- The role gate stays the existing one (`windowIds` from the role's menu), applied AFTER ranking (design D3).
**Claims:** W-HQ-LEGACY-SUPERSET (what legacy's menu filter shows for a probe is inside our list; `legacyFilter` gives legacy's set and order; N = the role's menu windows x 2 probes; red `HQ_BREAK=nolegacytier`); W-HQ-COST query half (`§HQ_QUERY` p95 ms and heap delta over the RANK-TWIN query set, budgets of design D8, OVER printed not hidden; red `HQ_BREAK=eager`); W-HQ-BOX (new: the box's top-5 for every RANK-TWIN query == `HelpQuery` top-5 directly, page and Node via `erp.ask`; red: a reversed list in one place); W-HELP-SHOWCASE and W-ERP-ASK green (any changed expected answer is listed with old and new, never silently re-baselined).
**Not in this step:** Viewer/Modeller (step 4), Did-you-mean (step 5), `#` actions (step 6).

### 19.4 Step 4: the Viewer and Modeller help panels search through the core (design §6 step 4)
**Issue it removes:** `common/help/help_panel.js` `renderList` (`:57-67`) filters with a plain lower-case `indexOf` over name, key, children, CLI titles and guide text: no ranking, no CJK word split, no accent fold, and not the ERP/shell ranker, so the same question gets a different answer per app.
**Change (design §4 layout):** `viewer/tools/help_records.js` (pills + their sub-rows + how-to rows + IFC class text, in each Viewer locale's own words from `viewer/i18n/<code>.json`) and `modeller/tools/help_records.js` (Modeller pills + guide sections), built by the ONE builder `common/help/tools/build_help_index.js` into `viewer/help/index/<locale>.json` / `modeller/help/index/<locale>.json` (lazy, fetched on the first query, cached; `sw.js` entries if precached). `renderList` calls `HelpQuery` and its substring filter is DELETED (lines + / − stated); the entry rendering, `noAutoFocus`, the `?` toggle and the drag stay as they are. Fields the old filter read (sub-row names, CLI titles, guide text) are indexed as description/help, so nothing that was findable is lost.
**Claims:** H-SUPERSET (new, the falsifier for "nothing lost"): for every entry and every word of 3+ characters of its name, sub-rows and CLI titles (N printed, from the live entries), the entry the OLD filter returned is in the core's list; red: drop the sub-row field → FAIL. W-HQ-SELF and W-HQ-RANK-TWIN extended to the Viewer/Modeller packs (every BIM record found by its own name at tier 0; page == Node). W-HOWTO, W-HELP-DOCK, W-HELP-DOCK-M, W-VIEWER-I18N, W-MODELLER-I18N stay green (logs read). Pack size per locale in a `§HQ_BUILD` line.
**Not in this step:** Did-you-mean (step 5), `#<number>` (step 6: in the BIM apps it selects the IFC element, owner Q2).

### 19.3 RESULT (2026-11-17): BUILT + MERGED, bim-ootb #3197 (`feat/help-wire-erp`, Sonnet agent)
`erp/help_search.js` ranks through `HelpQuery` with its public API kept (`common/door/erp_cli.js` NOT edited); ONE pure record builder `erp/help_records_core.js` for runtime `indexFrom` and build-time `help_records.js` (the five index.json regenerate byte-identical); `idempiere.html` loads the core first. Named logic deleted (ranking loop, `pairs()`, `STOP`, the shared-word fallback, `+100`); totals +155/−120 (the new shared builder), so not net-negative. Re-run here, logs read: `§WITNESS_HQ_LEGACY_SUPERSET pass=2 fail=0` (3,297 probes, 22,860 legacy hits inside ours), red `nolegacytier` FAIL; `§WITNESS_HQ_BOX pass=4 fail=0` (5,466 queries page == Node, 20 real door lines); `§WITNESS_HELP_SHOWCASE pass=23 fail=0`. Agent: W-ERP-ASK 11/0, COST 37/0 (query p95 0.9-1.4 ms at 4x CPU, index ready 26-34 ms, heap +0.5 to +0.95 MB, 0 builds at page load). The legacy witness found two real gaps (dakuten kana, NFD length), fixed in `help_query.js` tiers 1/2 to legacy's NFD semantics.
- **Changed answers (not in any witness's expected set):** 980 of 5,526 name queries change a card element, e.g. "Table" 100 *Table and Column* → 200157 *Table Attribute Instance*. Legacy sorts its menu search by label (`MenuSearchController.java:187`) so legacy shows *Table and Column* first; ours orders tier 1 by score. **OPEN for the owner:** (a) keep, or (b) legacy's label order within tiers 1/2, the score only for tier 3 (advice b).
- **Caveat:** process and doctype records are indexed but the existing window-only role gate does not admit them, so the box does not show them (as before).

### 19.4 RESULT (2026-11-17): BUILT + MERGED, bim-ootb #3203 (`feat/help-query-bim`, Sonnet agent)
`viewer/tools/help_records.js` + `modeller/tools/help_records.js` → `viewer/help/index/<locale>.json` (13,017-27,082 B) and `modeller/help/index/<locale>.json` (10,620-13,582 B), 18 locales each, through the ONE builder; `help_panel.js` `renderList` calls `HelpQuery`, its substring filter DELETED (+54/−16; PR total +403/−40); a live entry with no record is indexed from itself (a missing pack loses nothing). Re-run here, logs read: `§WITNESS_H_SUPERSET pass=46 fail=0` (7,202 probes, Viewer + Modeller x 7 locales), red `HB_BREAK=nosub` FAIL; `§W-HELP-DOCK PASS`; `§W-HELP-DOCK-M PASS`. Agent: HQ_SELF 82/0 (BIM 2,574 of 2,574), RANK_TWIN 42/0 (8,220 queries page == Node; red revtie FAIL on the Viewer packs, the Modeller packs have no id-only tie), W-HOWTO, W-VIEWER-I18N 91/0, W-MODELLER-I18N 57/0 all PASS.
- **Changed by design (named):** body text matches WHOLE words (design D2): the old filter also matched "open" inside "openings" (Modeller en_US: 140 of 154 such inside-a-word hits not kept, printed each run). W-HELP-DOCK-M M6c re-baselined: "turns green" was exactly [3D Grid], now [3D Grid, Teams] with 3D Grid first (any-term ranking; Teams holds "turns"). IFC class text is NOT indexed (the panel has no row to open for a class).

### 19.5 Step 5: "Did you mean" (design D5)
**Issue it removes:** a misspelled query ("Sales Ordr", "Rechnug") returns nothing or noise in the box and panels; the shell already suggests through `AssistCore.nearest` but the boxes do not, so the three surfaces disagree on a typo.
**Change:** `HelpQuery` callers (ERP box via `help_search.js`, the shared `help_panel.js`) show ONE separate line *Did you mean: A · B · C* under the list, from `AssistCore.nearest(typed, names, 3)` over the pack's record names (the language's names + the English ones), shown only when the top result is not tier 0. A click puts the name in the box and searches; NOTHING runs on its own. **2-character guard:** `assist_core.js:29` still has `max(2, floor(len/3))` (§42 S3 not landed, read 2026-11-17), so names of 2 or fewer characters are dropped from the suggestions until S3 lands; a one-line follow-up removes the guard. No second edit-distance function; `assist_core.js` is the CLI session's file and is NOT edited (load it in the page if it is not already).
**Claims, W-HQ-DYM:** D1 for every pack name of 3+ characters, the name with one character deleted shows that name in the line (X of N, N = names per pack, per language); D2 a made-up word (8 random letters, seeded) shows no line or names nothing that the witness's own edit distance > the limit; D3 no 2-character name is suggested while the guard is on; D4 nothing runs (0 window opens, 0 ops); D5 `git grep` finds no second Levenshtein/edit-distance in `common/help` or `erp/`. Red `HQ_BREAK=nodym` → D1 FAIL. W-HELP-SHOWCASE, W-HQ-BOX, W-HELP-DOCK, W-HELP-DOCK-M stay green.

### 19.5 RESULT (2026-11-17): BUILT, bim-ootb #3211 (`feat/help-dym`, Sonnet agent + one witness refinement here)
ONE shared `common/help/help_dym.js` over `AssistCore.nearest(typed, names, 3)` (`assist_core.js` untouched, loaded by script tag); the line shows only when the top result is not tier 0; a click fills the box and searches, nothing runs; `GUARD_MIN_CHARS` drops names of 2 or fewer characters until §42 S3. Wired into the ERP box (`help_search.js` `card.dym`, `idempiere.html`) and `help_panel.js` (`#cmd-dym`). Label from the catalogs: ERP `chrome.json` `help.dym`, Viewer `ui_help_dym` (batch, machine-labelled).
- **Witnessed (logs read here):** `§WITNESS_HQ_DYM PASS pass=24 fail=0` (D1 ERP 7,946 judged names in 5 languages, Viewer 1,066, Modeller 719, every typo shows its source; D2 1,640 made-up words; D3 0 short names in 12,058 lists; D5 no second edit distance); red `HQ_BREAK=nodym` `pass=3 fail=14 inconclusive=6 FAIL`. Agent: SHOWCASE 23/0, HQ_BOX 4/0, HELP-DOCK, HELP-DOCK-M, H-SUPERSET 46/0, W-VIEWER-I18N 18 locales, W-MODELLER-I18N 57/0.
- **Spec refined (D1c), named:** the agent's run FAILED D1 on one name: fr_FR "Node" typed "Noe" shows three "Noeud…" names, because `nearest()` puts prefix completions before edit-distance hits by design and the typo itself starts 3+ other names (in French "Noeud" is the word for node, so those are fair). Such ambiguous typos are now counted apart as D1c and printed per pack (ERP en 1, fr 3, de 1, ja 1, zh 1), the same way "typo is itself a name" already was; nothing else changed and the red control still fails.
- **Seen, not this lane's:** `erp/tests/witness_erp_i18n.js` fails `pass=7 fail=4` on `origin/main`, identical with and without this PR (agent's two runs).

### 19.6 Step 6: `#<number>` and New (design D6; owner Q1, Q2)
**6a ERP (build):** the box reads its input through `HelpGrammar.parse`. `doc` → search the DocumentNo of every table that has a DocumentNo column AND a window in `ad_seed.db` (N from the dictionary, not a hand list), only on windows the role's menu holds (the existing gate); one hit opens that record in its window, read-only open, 0 writes; several hits are listed (window name + number); none → "no document #<number>" naming the number; `#` alone → a usage line from the catalog. `help` → the `?` is dropped and the rest is searched. `reserved` (`@`) → the catalog's refusal. Every window result also offers **New**, only where the role has read-write, opening an UNSAVED row (0 ops). Claims: W-HQ-DOC (per DocumentNo table with a window: a real number from the seed opens it; a table the role cannot reach is not shown; an unknown number is refused naming it; 0 ops), W-HQ-NEW (New offered exactly on read-write windows, X of N active windows; opens an unsaved row; 0 ops). Red `HQ_BREAK=nogate` FAILS both. The shell side of `#` is the CLI session's §41, not this step.
**6b Viewer/Modeller: DECIDED (owner 2026-11-17, chose "Match GlobalId (Recommended)" = (ii) below; supersedes Q2 (a)).** `doc` in the BIM panels matches the element's GlobalId (`elements_meta.guid`): the typed run is a case-sensitive PREFIX of the 22-character GlobalId (IFC GlobalIds are case-sensitive base64); at least 4 characters, else the usage line; one hit selects + frames that element through the Viewer's/Modeller's existing select path (no second selection code); several hits are listed (class + name + the GlobalId), at most 20 with "N more"; none → "no element #<typed>". Claims W-HQ-GUID: for every element of a shipped building (N = its `elements_meta` rows, Duplex at least), `#` + its first 8 GlobalId characters finds it in the list and a unique prefix selects it (the selection's guid == the typed one, read from state, not a screenshot); a 3-character prefix gives the usage line; a made-up prefix answers "no element"; red `HQ_BREAK=caseless` (lower-case compare) must FAIL on a building where two GlobalIds differ only by case, or print INCONCLUSIVE if no such pair exists. Original finding kept below.
**6b (finding, 2026-11-17):** Q2 (a) said `#123` selects the element whose IFC id is 123, but the shipped building DBs do NOT keep that number: `import_worker.js` uses `expressID` only during import (`:327`, `:434`), and `elements_meta` holds `guid ifc_class element_name storey discipline material_name material_rgba building` (Duplex, read 2026-11-17). So (a) as decided would answer "no element" in every shipped building. The choice: (i) keep the IFC number from now on (a new column written at import + an extractor change + a patch per shipped building, the §DB CHANGES route; a lane of its own), (ii) `#` in the BIM apps matches the element's GlobalId (`guid`) prefix instead, or (iii) `#` means nothing in the BIM apps (text). Until answered, the BIM panels treat `doc` as text.

### 19.6 RESULT (2026-11-17): BUILT + MERGED, bim-ootb #3212 (`feat/help-actions`, Sonnet agent; it was merged by auto-merge while this session's re-runs were still going: the merged head is the one re-run)
Both boxes read input through `HelpGrammar.parse`. **6a ERP:** `#<number>` searches DocumentNo over the dictionary's tables that have a DocumentNo column and a window (45 pairs; 28 reachable by the role; 8 unreachable not shown), read-only open, a list when several, a refusal naming the number when none; New only where the role has read-write AND the header tab can insert (`_foldableTab` + `AdGridTab.canInsert`, the toolbar's own test), opening an UNSAVED row. **6b BIM:** `#` + a case-sensitive GlobalId prefix (4+ chars); one hit selects + frames through the existing path (Modeller: `Bonsai.selectByGuid` composes the Outliner's select/frame calls, its handler being inline), several are listed (max 20 + "N more"), none answers "no element". Enter or a click selects; typing never does. Strings from the catalogs (chrome.json 8 languages, Viewer dictionary 14, machine-labelled). +315/−22 code.
- **Witnessed (re-run here, logs read):** `§WITNESS_HQ_DOC pass=5 fail=0`, red `nogate` `pass=2 fail=3 FAIL`; `§WITNESS_HQ_NEW pass=4 fail=0` (374 active windows, 283 judged, 127 clicked); `§WITNESS_HQ_GUID pass=12 fail=0` (Viewer Duplex 1,122 elements with 37 case-only GlobalId pairs; Modeller Duplex_ARC 218). Agent: red `nogate` FAILS W-HQ-NEW, red `caseless` FAILS W-HQ-GUID; W-PREFIX, W-HQ-BOX, W-HQ-DYM 24/0, W-HELP-SHOWCASE 23/0, H-SUPERSET 46/0, W-HELP-DOCK, W-HELP-DOCK-M, W-VIEWER-I18N 91/0 (18 locales), W-MODELLER-I18N 57/0 all PASS. **"0 writes" MEASURED:** kernel_ops 5→5, Viewer `total_changes()` 1→1, Modeller op-log 196→196.
- **Narrowed (named):** 348 of 1,122 Viewer elements share their first 8 GlobalId characters with more than 20 others (IFC exports cluster GlobalIds), so the witness checks the 20 listed + the right "N more" there; the Viewer's G2/G3 select checks are sampled (16 and 12 elements; ~5 s per select under software GL); 3 Modeller elements have no `element_transforms` row, so select gives no pick (as the Outliner).
- **Found for the ERP parity lane (NOT fixed here, twin rule):** (1) the TOOLBAR's New ignores `winSet[w].rw` (the help box's New does not); (2) the shipped `ad_seed.db` grants every role read-write on every window, so the role gate is vacuous on shipped data: W-HQ-DOC/NEW prove it on a role-patched copy.

**THE QUERY CORE IS COMPLETE (design §6 steps 1-6 all merged: #3189, #3192, #3197, #3203, #3211, #3212).**

### 19.7 Step 7: legacy's label order inside tiers 1 and 2 (owner 2026-11-18: *"agree"* to RESUME item 1 (b) and item 5 skip)
**Issue it removes:** inside tiers 1 and 2 the core orders by BM25 score, while legacy's menu search orders the same names by label (`MenuSearchController.java:186-191`, `o1.getLabel().compareTo(o2.getLabel())`). (§19.3 RESULT: 980 of 5,526 name queries changed their top card when the core went in.) **CORRECTED 2026-11-18, measured before code, lesson (a) again:** §19.3's example was wrong. Java's `compareTo` is case-sensitive and `'A'` (0x41) sorts before `'a'` (0x61), so legacy also lists *Table Attribute Instance* before *Table and Column*. For 3+ characters legacy's first card is a "contains" hit: over all windows it is *Depreciation Tables*, and window 100 is not in role 102's menu at all. The measured gap is the one below (§HQ_FIRST_VS_LEGACY): before this step the box's first window equals legacy's first on 951 of 1,800 starts-with probes.
**Rule (agreed (b)):** tier first, as now. **Inside tier 1 and inside tier 2, the rows whose tier comes from their own label come first, ordered by the label `n` (raw text, before folding) by UTF-16 code unit** (`lt`, which is Java's `String.compareTo`). These are exactly legacy's rows. **Rows lifted into the tier only by an alias come after them, by score** (legacy would not show them, so legacy has no order for them; MEASURED: sorting them by label too put *Bill of Materials and Formula* first for "ma", by its alias "Manufacturing Order BOM"). After that come kind order, then id, as now. Tier 0 and tier 3 keep the score order. One comparator in `common/help/help_query.js`, so the ERP box, `erp.ask`, and the Viewer and Modeller panels all change together (generic, no app branch).
**Known differences from legacy, stated and not hidden:** (1) for 3+ characters legacy mixes "starts with" and "contains" in one label-sorted list, and we keep tier 1 (starts) before tier 2 (contains), as the agreed tiers of design D3 say. (2) Legacy then moves the user's recent items to the top (`moveRecentItems()`, :180); the twin has no recent-items list, so this is not ported. (3) We also match aliases and descriptions; the order applies to whatever lands in tiers 1 and 2.
**Claims (extend W-HQ-LEGACY-SUPERSET; falsifier `HQ_BREAK=scoretier` = the score order back inside tiers 1 and 2):**
- **L3 the order is legacy's.** For every probe (N = the role's menu windows x 2 probes x the built languages, as for L2), and for each of tiers 1 and 2: the box's windows that legacy also shows and whose OWN label puts them in that tier (the witness's own reading), in the box's order, equal legacy's order of the same windows. The result is X of N judged tiers (a tier holding 2+ such windows), and the first mismatch is named. `scoretier` FAILS L3. If no tier is judged, the verdict is INCONCLUSIVE.
- **L4 the first card.** For every probe that legacy filters by "starts with" (accent-deleted length under 3 UTF-16 units), the box's first window is legacy's first window, X of N. A tier-0 exact name is excepted and counted. `scoretier` FAILS L4.
- **L5 changed answers, stated (printed, not pass/fail):** first-window agreement with legacy, now vs `scoretier` (= main's order), split into starts-with and contains probes; plus en_US "Table" both ways.
- **Regressions:** W-HQ-RANK-TWIN (browser == Node), W-HQ-SELF, W-HQ-BOX, W-HQ-DYM, W-HQ-DOC, W-HQ-NEW, W-HELP-SHOWCASE and W-ERP-ASK are re-run. Any changed expected answer is listed with the old and the new answer, never re-baselined silently.
**Item 5 (Modeller guide paragraphs, ~830 translations): CLOSED, skipped** (owner 2026-11-18 *"agree"* to the advice).

### 19.7 RESULT (2026-11-18): BUILT + MERGED, bim-ootb #3233 (`d7816022`)
- `common/help/help_query.js`: `tierOf` also says whether the tier came from the label itself. Inside tiers 1 and 2: label hits first by raw label (`lt`), then alias-only hits by score. Falsifier `HQ_BREAK=scoretier`. `help_query.js?v=2`; sw erp v1102, modeller v287, viewer v1743.
- **Witnessed (logs read), W-HQ-LEGACY-SUPERSET `pass=4 fail=0`:**
  - L1 3,297/3,297 and L2 3,297/3,297 (22,860 legacy hits inside).
  - **L3 label order: 2,476 of 2,476 judged tiers.**
  - **L4 first window = legacy's first on starts-with probes: 1,800 of 1,800 (before: 951).**
  - L5: contains probes 1,185 vs 958 of 1,345 (they differ by design, the tier split). Role 102 "Table": now *Depreciation Tables* = legacy's first (before: *Print Table Format*).
  - Red `scoretier`: L3 1,763/2,476 and L4 951/1,800 FAIL. Red `nolegacytier`: L2 and L4 FAIL.
- **Regressions, branch vs main, 16 witnesses, all green on the branch; no expected answer changed:**
  - HQ_SELF 82, RANK_TWIN 42, BOX 4, DYM 24, DOC 5, NEW 4, GUID 12, COST 37, BM25 6, WORDS 6, GENERIC 4.
  - W-PREFIX 21; H_SUPERSET 46 (main gave 43 + 1 INCONCLUSIVE, a zh page timeout); HELP_SHOWCASE 23; ERP_ASK 11; W-HOWTO 5 + page H4a-e.
- **Named, not fixed:** W-HOWTO's page half needs `NODE_PATH=~/bim-compiler/node_modules` (puppeteer), on main too; with the bim-ootb path only it prints `§FAIL W-HOWTO Error: Cannot find module 'puppeteer'` and exits 1 while its summary line reads `pass=5 fail=0`.
- **Owner's call made on a wrong example:** the owner said "agree" to (b) after §19.3's claim that legacy shows *Table and Column* first. The data says it does not (case-sensitive compareTo, and the window is not in role 102's menu). The rule built is still (b), and the measured gain is L4 above.

### 19.8 Step 8: remove the Did-you-mean guard now that §42 S3 has landed (2026-11-18; RESUME item 3; agreed in design D5: "the guard is one named constant, removed in the PR that follows S3's merge")
**Issue it removes:** `common/help/help_dym.js` drops every name of 1-2 characters from the suggestion pool (`GUARD_MIN_CHARS = 3`). It did that because `assist_core.js` allowed 2 edits even for a 1-2 character typed text, so a short name matched almost anything. S3 (bim-ootb #3240 `3f4f4c43`, CLI_ERP_IVR §42) caps the limit at `min(max(2, floor(len/3)), len - 1)`. The guard now only hides real short names: a person who types `订单x` or `IDx` is never offered `订单` / `ID`.
**Change:** delete the constant and its filter in `help_dym.js` (the pool goes to `AssistCore.nearest` whole). Keep a falsifier `HQ_BREAK=guard`, which puts the old filter back. No edit to `common/door/*` (the CLI session's files).
**Claims (W-HQ-DYM, updated):**
- **D2** checks against S3's limit (`min(max(2, floor(len/3)), len - 1)`, read from `assist_core.js` after #3240), by the witness's own edit distance.
- **D3 (new) a short name is offered again.** For every name of 1-2 characters in every pack, typing it with one extra letter (`s + 'x'`) shows it in the line. X of N; a probe whose typed text is itself a name, or starts 3+ other names (the D1c rule), is counted apart. VACUOUS if no pack has a short name. `HQ_BREAK=guard` FAILS D3.
- **D3b no flood:** across every list any check produced, every name of 1-2 characters shown is within S3's limit of its typed text (own edit distance). Printed: short names per list, before (the guard on) vs after.
- **Regressions:** W-HQ-DYM D1, D1b (now expected to rise, since a 2-character typo of a 3-character name gets limit 1), D4, D5, and the page checks; W-ASSIST-NEAREST (the CLI session's) unchanged; W-HQ-BOX and W-HELP-SHOWCASE re-run.

### 19.8 RESULT (2026-11-18): BUILT + MERGED, bim-ootb #3257 (`0a5f2d3f`)
- `common/help/help_dym.js`: `GUARD_MIN_CHARS` and its filter are deleted; the pool goes to `AssistCore.nearest` whole. Falsifier `HQ_BREAK=guard`. Bumped with `scripts/bump.js` (the Modeller manifest of bim-ootb #3250): erp v1103, viewer v1749, modeller v297; `gen_manifest.js --check` verdict=PASS.
- **Witnessed (logs read), W-HQ-DYM `pass=25 fail=0` with pages** (main: 24; D3b is new):
  - **D3: 184 of 184 short names offered for a one-letter typo.** Red `guard` gives 0 of 184. Under the guard, ja `職責x` was offered "Tax".
  - **D3b: 299 short names shown across 11,683 lists, 0 beyond S3's limit.**
  - D2 1,640/1,640 against S3's limit; D1 unchanged.
- **The one trade, stated:** D1b erp 48/49 (was 49/49). zh `批制` (typo of `批控制`) is at distance 1 from four names; `批` now takes a slot, and `nearest()`'s code-unit tie-break puts `批控制` 4th. D1b is report-only. The tie-break is the CLI session's (`assist_core.js`), not changed here.
- **Regressions green:** W-HQ-BOX 4/0, W-HELP-SHOWCASE 23/0, W-ASSIST-NEAREST 5/0, W-HQ-SELF 82/0, W-ERP-ASK 11/0; eslint 0.
- Tooling note: a bim-ootb worktree has no `node_modules`; `scripts/bump.js` needs `espree` by path, so link `~/bim-ootb/node_modules` into the worktree (git-ignored).

### 19.9 Step 9: the role's menu processes and reports in the ERP help box (2026-11-18; owner: "proceed" after the §19.3 caveat was named as pending)
**Issue it removes:** legacy's menu search lists EVERY leaf of the role's menu tree (`MenuSearchController.java:160-176` walks the tree, `addTreeItem` skips only folders; the kinds are set in `AbstractMenuPanel.java:204-228`: window, report, process, workflow, form, info, task). The twin's help box admits windows only: `help_search.js` `indexFrom`'s gate is `gate[0] === 'window'`, and the card shows only a Window row. So a person typing "Generate Invoices" gets no process at all, although the process records are built and ranked (`help_records_core.js:44`). Under the CARDINAL rule this is a divergence, fixed on the twin side.
**Measured (seed, 2026-11-18):** active menu leaves are W 332, P 90, R 69, X (form) 24, F (workflow) 12, I (info) 4, T (task) 3. Role 102 has 406 process-access rows. The page already knows the role's menu processes and reports: `window.__idmpFieldHelp.menu().processes` (`idempiere.html:3249`, filled at :1675 from the P/R leaves). It opens them through the menu's own `openProcess(id, name)` (:4677).
**Change (generic, no window or process named):**
- `indexFrom({ …, processIds })`: the gate admits `['process', id]` when `id` is in `processIds`. It is optional; without it the gate is windows-only as today, so `common/door/erp_cli.js` (`erp.ask`, the CLI session's file) is unchanged until that session opts in.
- The card gains `process`: the best-ranked admitted process in the top 5 hits, `{id, name, report}`. The page shows a "Process" row (or "Report" when `isreport='Y'`, the menu's own kind) whose link calls the menu's `openProcess`. Nothing runs until the person presses the process dialog's own button, as from the menu.
- Falsifier `HS_BREAK=winonly` (the file's own `HS_BREAK` switch, like `nophrase`): the gate goes back to windows only.
- The row labels are dictionary elements, like Window (`help.window` = `el:143`): `help.process` = `el:117` (AD_Process_ID "Process"), `help.report` = `el:1022` (IsReport "Report"), in `erp/i18n/chrome.json`.
**Not in this step, counted and stated:** forms (24), workflows (12), info windows (4) and tasks (3) are not indexed at all (no record kind); process names are English in every help pack (CORRECTED at build: the ERP screen packs DO carry `AD_Process_Trl` and `AD_Menu_Trl` (`erp/i18n/fr_FR.json` …), but `build_help_pack.js` writes only window, table, action and status names, so the help box shows the record's English name; adding processes to the help pack is a follow-up); the CLI's `erp.ask` until the CLI session passes `processIds`.
**Claims (extend W-HQ-LEGACY-SUPERSET; falsifier `HS_BREAK=winonly`):**
- **L6 processes are inside the box's list.** For each process or report of role 102's menu (N from the dictionary: active P/R menu leaves whose process the role can access) x 2 probes x the built languages, every one legacy's filter shows is in the box's list. X of N probes. `winonly` FAILS.
- **L7 the card names it.** For each such process, asking its exact name gives `card.process.id` = it. X of N.
- **L8 the gate holds:** a process NOT in the role's menu never appears in any list of L6 (0 expected), and a process asked by name that the role lacks gives no Process row. Printed population; VACUOUS if every process is in the menu.
- **Page (W-HELP-SHOWCASE or W-HQ-BOX):** in the real page, the box's Process row for one menu process calls `openProcess` (the `§AD-PROC` log line of the menu path), and `menu().processes` equals the witness's SQL set.

### 19.9 RESULT (2026-11-18): BUILT + MERGED, bim-ootb #3263 (`06cdc893`)
- `erp/help_search.js`: `indexFrom({processIds})` admits the role's menu processes and reports; `card.process` gives a Process / Report row (`help.process` = `el:117`, `help.report` = `el:1022`) that opens through the menu's `openProcess`. Falsifier `HS_BREAK=winonly`. `idempiere.html` passes `menu().processes`. erp sw v1104 (via `scripts/bump.js`).
- **Witnessed (logs read):**
  - **W-HQ-LEGACY-SUPERSET 7/0:** L6 1,370/1,370 probes (7,855 legacy hits inside); L7 685/685; L8 0 off-menu listed and 0 rows for 300 off-menu names. Red `winonly`: L6 and L7 FAIL.
  - **W-HQ-BOX 7/0:** B2 5,466/5,466 (its page gate now includes the menu's processes); B4a `menu().processes` == the SQL reading, 137 = 137; B4b 137/137 rows; B4c a click gives `§AD-PROC-LIVE open proc=115 "Vendor Selection" report=Y`. Red: B4b 0/137.
- Regressions green: SHOWCASE 23/0, DYM 25/0, DOC 5/0, NEW 4/0, COST 37/0, ERP_ASK 11/0.
- **Found, pre-existing on main (this lane's own witness):** W-FIELD-HELP fails 3, the same 3 on main's unchanged copy:
  - F1 inline editor tooltip 226/234 and label 226/234, e.g. `c_order.c_bpartner_location_id`; also `label != AD_Field.Name`, with `m_inout.c_order_id` showing "Order" where the dictionary has another name;
  - F3 81/88.
- **Left, stated:** forms (24), workflows (12), info windows (4) and tasks (3) have no record kind. Process names are English in other languages (the screen packs have `AD_Process_Trl`; `build_help_pack.js` does not write process names). `erp.ask` is windows-only until the CLI session passes `processIds`.

### 19.10 Step 10: process names in the screen language, and the ERP index ships its header only (2026-11-18; RESUME item 8, first part; owner chose "Ship header only")
**Issue it removes:** a French, German, Japanese or Chinese user who types a process name in their own language does not find it. The process record's name is the English `AD_Process.Name` in every language (`erp/help_records_core.js`, the `process` query), because `build_help_pack.js` `buildNames` writes window, table, action and status names but not process names. Legacy's menu in that language shows the translated name. Under the CARDINAL rule this is a divergence, fixed on the twin side.
**Measured (2026-11-18, prototype in `/tmp/wt-help-procnames`, logs read):**
- Every pilot source has `AD_Process_Trl_<lang>.xml` in `~/.cache/erp_trl` (the same SOURCES, first wins). Translated (present and not equal to English) of the 451 active processes: fr_FR 299, de_DE 429, ja_JP 288, zh_CN 113.
- A rebuild with the change differs from the committed packs ONLY by `names.processes` (checked by JSON compare, fr/de/ja/zh). The en_US pack drifts on `actions` (the verbs file moved since it was built); not this step's, left unchanged.
- **Budget (design D8, index.json <= 100 KB raw):** with the translated names (English kept as the other name `a`, as for windows) the index is fr_FR 108,618, de_DE 108,038, ja_JP 110,083 (OVER), zh_CN 97,409, en_US 85,268. Of fr_FR's bytes, the records are 107,660 and the header under 1 KB.
- **The ERP page never reads those records.** `erp/erp_i18n.js` `loadHelpIndex` fetches index.json and `erp/help_search.js` reads only its header (bm25, weights, nospace, vocab); the records are rebuilt at run time by `HelpRecords.build` from the live dictionary (`indexFrom`). No runtime reader of the ERP index's records exists (grep of erp/ and common/door/). The Viewer and Modeller have no dictionary in the page and DO need their records.
**Owner decision (2026-11-18, verbatim choice):** *"Ship header only (Recommended)"*.
**Change (generic, no app named in the core):**
- `build_help_pack.js` `buildNames`: `names.processes[id]` from `AD_Process_Trl` (Name), read like the window names. The `§HELP_PACK` line prints `processes=`.
- `help_records_core.js`: a process record's `n` = the language's name when the pack has one, the dictionary's English name an other name `a` (the window rule).
- `build_help_index.js`: an adapter that says `runtimeRecords: true` (its page rebuilds the records from its own dictionary) gets an index file WITHOUT `records`; `build()` still returns the records in memory (the vocab is made from them, the witnesses read them). The budget is judged on the bytes written. `§HQ_BUILD` prints `records=<n> shipped=<header|records>`. Only `erp/tools/help_records.js` says it; the Viewer and Modeller adapters do not.
- `common/help/tests/_hq.js` `pack(lang)`: when the committed file has no records, they come from the adapter's own `load(lang)` (the same pure builder the page runs). No witness reads a second copy.
**Claims (falsifier for each):**
- **P1 the names are in the pack.** For each pilot language, `names.processes` holds exactly the processes whose `AD_Process_Trl` Name is present and not the English (X of N, N = active processes with a translation, by the witness's own XML reading). Red `HS_BREAK`-free control: drop `names.processes` from the pack in memory → P2 FAILS.
- **P2 the record shows it.** Each such process's record has `n` = that name and `a` holds the English name; asking the translated name gives the card's Process row for a menu process (X of N, extends W-HQ-LEGACY-SUPERSET L6/L7, whose probes already come from the record's name in the screen language).
- **P3 the budget holds and the page lost nothing.** W-HQ-COST C1 <= 100 KB on every language (bytes shipped); C2 the committed file equals a fresh build. W-HQ-BOX B0/B2 stay green with the records from the adapter: the page's run-time records equal the build tool's.
- Regressions (logs read): W-HQ-SELF, BM25, WORDS, RANK-TWIN, DYM, GENERIC, LEGACY-SUPERSET, BOX, SHOWCASE, ERP_ASK, `common/door` W-ASSIST-NEAREST.
**Not in this step:** forms, workflows, info windows, tasks (item 8 second part: their `_Trl` files exist in every pilot source, measured); `erp.ask processIds` (item 8 third part, a message to the CLI session).

### 19.10 RESULT (2026-11-18): BUILT + MERGED, bim-ootb #3275 (`c12aeda4`)
- As specced. Also: `build_help_pack.js` exports `SOURCES` / `CACHE` when required (the witness reads the same list, no copy); the page's `§HELP_PACK index loaded` line prints `records=header-only`; erp sw v1105 (`scripts/bump.js`, precache audit 296/0).
- **Witnessed (logs read):**
  - **W-HQ-PROC-NAMES 12/0** (new; P1 the pack == the witness's own XML reading, P2 the record, P2b the card): fr 299/299 (menu 106/106), de 429/429 (135/135), ja 288/288 (99/99), zh 113/113 (36/36). Red `HS_BREAK=noprocnames`: P2 and P2b FAIL in all 4 (8 fails).
  - **W-HQ-COST 37/0:** `§HQ_BUILD … shipped=header` en 425, fr 428, de 428, ja 5,456, zh 3,189 bytes (it was 85-99 KB; 108-110 KB with the names). New red `HQ_BREAK=shiprecords` (records back in the file): C1 OVER fr +6,218, de +5,638, ja +7,683. **The `bloat` red is RETIRED:** it doubled the measured size, and a 5 KB header doubled stays under 100 KB, so it PASSED 37/0, a falsifier that could no longer fail.
  - W-HQ-LEGACY-SUPERSET 7/0 (L6 1,370/1,370 with the names now translated; L7 685/685); W-HQ-BOX 7/0 (B0's label now says "the build tool's records"); SELF 82/0, BM25 6/0, WORDS 6/0, RANK-TWIN 42/0, DYM 25/0, GENERIC 4/0, DOC 5/0, NEW 4/0, GUID 12/0. GUID's first run lost its Modeller page in the middle and then hung past its timeout; it was killed by PID, and the re-run passed. HELP-SHOWCASE 23/0, FIELD-HELP 14/0, ERP_ASK 11/0, W-ASSIST-NEAREST 5/0 (re-run without the 600 s cutoff; the first run was cut before its verdict on a busy machine). After the merge of `origin/main`: PROC-NAMES, LEGACY-SUPERSET, SELF, GENERIC re-run green; the merge touched no help input.
- **Red on main, not this step's:** W-HELP-SUPERSET H4 (§19.12).

### 19.11 PLAN: every legacy language pack inside the 18, one source list (owner 2026-11-18)
**Owner, 2026-11-18 (verbatim):** *"Is it just Thai, or we can organise for all the language packs that legacy iDempiere already has? I assume such packs shape are important to build our part in OOTB too"*; then, asked whether to add the 5 legacy packs outside the 18: *"Stay at the 18 (Recommended)"*.
**Measured:**
- The ERP screen packs (`erp/tools/build_i18n.py` SOURCES) cover 8 languages from legacy's published packs: fr_FR, es_ES (served from es_CO), de_DE, ar, zh_CN, ja_JP, ms_MY, th_TH.
- `build_help_pack.js` keeps its OWN copy of that list, for the 4 pilot languages only (its comment: "the build_i18n.py SOURCES for the four pilot languages"). That copy is why es, ar, ms and th have no help pack. One responsibility, two lists: a defect.
- Wiki Translations page, as surveyed in `ERP_UI_LOCALES.md` §L2 (2026-10-03; the page returns 403 to a fetch today, not re-checked): de, it, zh_CN, ja, ko, pt_BR, sk, ru, fr, in_ID, ar_DZ, zh_TW, cs. Inside the 18 and not fetched yet: ko_KR, pt_BR, id_ID (in_ID). Outside the 18, NOT to be added (owner): it, sk, ru, zh_TW, cs.
- Shape: every legacy pack is the Translation export (`<Table>_Trl_<lang>.xml`, rows keyed by ID with the English `original`). Both builders read that form, so a new pack needs no new code.
**Steps (each spec, witness with a falsifier, log read):**
1. ONE source list: `build_help_pack.js` reads `build_i18n.py`'s SOURCES (no copy); the help packs for all 8 screen languages (adds es_ES, ar, ms_MY, th_TH; Thai = the Q3 default, RESUME item 4). The help box's language set follows (`erp_i18n.js` HELP_LANGS, `help_records.js` LANGS, the witnesses' `H.LANGS`).
   **Step 1 SPEC (2026-11-18):**
   - **Issue it removes:** es_ES, ar, ms_MY and th_TH users have the screen in their language but no help pack, so the help box shows English names and no translated field help. The cause is three lists for one fact: `build_i18n.py` SOURCES (8), `build_help_pack.js` SOURCES (a 4-language copy), `erp_i18n.js` HELP_LANGS (4). A fourth (`help_records.js` LANGS) feeds the witnesses.
   - **Measured:** the screen builder finds a source's files by `glob(<dir>/<Table>_Trl_*.xml)` (`build_i18n.py:117`); the help builder by the exact name `<Table>_Trl_<lang>.xml` (`findFile`). Their files are named by the pack's own code: es_ES's source holds `*_es_CO.xml`, ar's `*_ar_DZ.xml` and `*_ar_TN.xml`. So sharing the list alone is not enough; the file finding must be the same too.
   - **Change:** (a) `erp/tools/i18n_sources.json` = the one list (lang → ordered `[{dir, from}]`). `build_i18n.py` and `build_help_pack.js` both read it, and neither keeps a copy. (b) `build_help_pack.js` finds files as the screen builder does (glob, sorted, every match). (c) `erp_i18n.js`: help is offered for every screen locale (its LOCALES); HELP_LANGS is deleted. (d) `help_records.js` LANGS = en_US + the list's languages, and the witnesses' `H.LANGS` reads that.
   - **Claims:**
     - S1: the screen packs rebuilt from the JSON list are byte-identical to the committed `erp/i18n/<lang>.json` (proves the move changed nothing).
     - S2: the help pack set equals the screen pack set: `erp/i18n/help/*` minus en_US equals `erp/i18n/index.json` locales minus en_US, 8 of 8. Falsifier: a language dropped from the help build makes S2 FAIL.
     - S3: W-HQ-PROC-NAMES P1/P2/P2b, W-HQ-LEGACY-SUPERSET and W-HQ-BOX run over all 9 languages, with no INCONCLUSIVE for the new 4.
     - S4: W-HQ-COST holds on all 9 (the index under budget, C2 fresh = committed).
     - S5: the page, in th_TH, logs `§HELP_PACK loaded lang=th_TH` with fields > 0 (W-HQ-BOX B2 covers it through H.LANGS).
   **Step 1 RESULT (2026-11-18): BUILT + MERGED, bim-ootb #3281 (`1747b7b0`), erp sw v1106.** Logs read:
     - S1: `build_i18n.py` from the JSON list: 9 screen packs, git shows no change (byte-identical).
     - Help packs added: es_ES 14,829 fields / 444 process names; ar 11,981 / 0; ms_MY 502 / 59; th_TH 13,432 / 191. The 4 older packs are unchanged. Thai index vocab = 385 words (Intl.Segmenter th).
     - S2 = SHOWCASE **S0** 8 of 8 (red `HS_BREAK=droplang` FAILs). S5 = BOX **B5** (new): each screen language's `§HELP_PACK loaded lang= fields=` equals the committed count, 8 of 8. Red `BOX_OLD_I18N=<main's erp_i18n.js>`: 4 of 8, es/ar/ms/th "logged no §HELP_PACK line". B2 S5's first wording ("B2 covers it") was wrong: B2 does not read the page's log, hence B5.
     - **Arabic, judged, not skipped:** its sources publish no AD_Window / AD_Table / AD_Ref_List / AD_Process file (djoudi ar_DZ: elements + a few; Najeh ar_TN: element/menu/message/doctype…). PROC-NAMES P1 ar: "the pack holds none and every record keeps its English name: 451 of 451"; SHOWCASE S1n ar: "0 such files". Both were INCONCLUSIVE before the fix, which hid a judgeable claim.
     - S3/S4 over 9 languages: PROC-NAMES 22/0 (red 14 FAIL), LEGACY-SUPERSET 7/0 (5,969/5,969 window probes; 2,466/2,466 process probes; 1,233/1,233 cards), BOX 8/0 (B0 8,145 records; B2 9,722 queries), COST 65/0, SELF 90/0, BM25 10/0, WORDS 10/0, RANK-TWIN 46/0, DYM 25/0 (all 9 ERP packs in its log), GENERIC 4/0, DOC 5/0, NEW 4/0, SHOWCASE 32/0, FIELD-HELP 14/0, ERP_ASK 11/0. W-ERP-I18N 7/4 = main's known 4 (§14.8.2).
2. Fetch ko_KR, pt_BR, id_ID through `erp/tools/fetch_i18n_packs.sh`, pinned by URL + commit; each gets its screen pack and its help pack together.
   **Step 2 SPEC (2026-11-18; owner: "carry on, then do Korean, Portuguese, Indonesian next"):**
   - **Sources found (MEASURED):**
     - pt_BR = `github.com/devcoffee/idempiere-pt_br@10231021` (an iDempiere 11 export, "COF #1259 - v11 review", 2023-05-15; 66 `_Trl` files). AD_Window Name translated 305 of 438 (143 "Ordem de Venda").
     - id_ID = `github.com/uthadehikaru/idempiere-indonesia-localization@b9273a80`, folder `in_ID` (an iDempiere 13 export, 2026-02-12; 67 files; the pack's code is Java's legacy `in_ID`, the screen code is `id_ID`). AD_Window 337 of 355 (143 "Order Penjualan").
     - Neither repo states a licence (GitHub API: none). They are used as the other packs are: extracted per row with provenance, never redistributed as files.
   - **⛔ ko_KR BLOCKED: the one question is the pack's URL.** The only trace is the wiki Translations entry (search result: maintainer User:sisjoo, "Bitbucket iDempiere Korean Translation", `ko_KR.zip`, 2019-10-13, "On going work"). There is no GitHub repo and no SourceForge folder (`Language Packs/` lists no Korean). The wiki page returns 403 to a fetch, and the Bitbucket workspace `sisjoo` does not exist (API 404). The owner can paste the link from the wiki page. **Searched 2026-11-18 (owner: "research and obtain those resources online"), none found:** web search (EN + KO); GitHub repos and code for `ko_KR` / `AD_*_Trl_ko_KR.xml` / `language="ko_KR"` (only our own `viewer/i18n/AD_Message_Trl_ko_KR.xml`); SourceForge ADempiere `Language Packs/` (no Korean folder); Launchpad idempiere-localize (Korean untranslated, 2018); the mailing-list thread "More languages on test server" (de, es_CO, ja, zh, pt_BR, sk only); Bitbucket (workspace `sisjoo` 404, no public search API). Reaching the wiki page through a browser user-agent or the Internet Archive was refused by the session's permission guard as circumvention, and not retried.
   - **Change:** (a) `i18n_sources.json` gains pt_BR and id_ID, and each entry also carries its META (`dir`, `native`, `html`), so META leaves `build_i18n.py`. (b) `fetch_i18n_packs.sh` pins both (`gh_pin`). (c) The page's static `LOCALES` (`erp_i18n.js`, static so the pickers render with no fetch) gains both. (d) `witness_erp_i18n.js` LOCALES reads `erp/i18n/index.json`, not a copy.
   - **Claims:** T1 the new screen packs build (`§I18N-BUILD lang=pt_BR / id_ID` kept rows > 0 per table, read from the log); the 8 existing packs are byte-identical. T2 the page's static LOCALES == `erp/i18n/index.json` locales (code, dir, native), and a missing one FAILs (a new check in W-ERP-I18N, red = drop one in memory). T3 every §19.11 step 1 claim (S0-S4) now over 11 languages.
   **Step 2 RESULT (2026-11-18): BUILT, PUSHED on bim-ootb `feat/i18n-pt-id`, no PR yet (owner paused).** Logs read:
     - T1: pt_BR screen pack window 305/443, tab 856, element 3,436, process 342, ref list 1,014, message 1,187; id_ID 341/359, 946, 3,120, 394, 1,088, 1,664. The 9 existing packs are byte-identical. Help packs: pt_BR 14,571 fields, 337 process names; id_ID 14,753 and 388. Indexes 428 bytes each.
     - T2 = SHOWCASE T2 (new): page LOCALES == built locales, 11 of 11. Red `HS_BREAK=droplocale` FAILs (36/1).
     - T3 over 11 languages: SHOWCASE 37/0 (S0 10/10; S1 pt 27,590/27,590 and id 28,165/28,165 texts; names 663/663 and 750/750), BOX 8/0 (B5 10/10, B0 9,955, B2 11,930), PROC-NAMES 28/0 (pt 337/337, 127 menu asked; id 388/388, 127), LEGACY-SUPERSET 7/0, COST 79/0, SELF 94/0, RANK-TWIN 48/0, DYM 25/0, BM25 12/0, WORDS 12/0, GENERIC 4/0, DOC 5/0, NEW 4/0, FIELD-HELP 14/0, ERP_ASK 11/0.
     - W-ERP-I18N 7/4: main's same 4 checks (session mismatches=3 in every locale). It now reads its locales from `erp/i18n/index.json`. pt_BR login 11/17 and id_ID 12/17 labels translated: the rest are app-own chrome keys with machine text for 8 languages only (46 keys; follow-up in RESUME).
3. Our own content (how-to rows, chrome, the BIM element dictionary) kept in legacy's per-table shape as well, so it reads like a language pack. It is still never installed into legacy (D3).

### 19.12 FOUND (2026-11-18, while running §19.10's regressions): W-HELP-SUPERSET H4 red on main, the Modeller's `b-lodup` button
- `§WITNESS_H_SUPERSET pass=39 fail=7`: H4 "every live entry has a record in the index file", 45 of 46, `no record for b-lodup`, in all 7 Modeller locales judged.
- The button came in with bim-ootb #3238 (`cb2e31af`, LOD Upgrade pill P1). That PR did not touch the Modeller help index.
- A rebuild does NOT fix it (`build_help_index.js --app modeller --out <scratch>`: 51 records, none for `lodup`). The Modeller adapter (`modeller/tools/help_records.js`) does not list this button, so the gap is in the adapter's source or the button's registry entry.
- This lane's own witness, so this lane's fix. Next step: read where the adapter lists its tools, then spec it. The LOD Upgrade lane is active in `/tmp/wt-lodup-p*`, so check its open PRs for the same button first.

### 19.13 DECIDED (owner, 2026-11-18): one translation format for the Trilogy; AI fills, published packs win
- *"is it better we reenact those language packs as we have better capabilities with our AI here? Their translation xml schema is good enough to adopt as our project standard method to separate concern"*. Asked, the owner chose **"Yes, as proposed"** (legacy XML = the one format; AI rows in their own lowest-priority source folder; published packs always win) and **"Finish the 18 first"**.
- Then: *"spec out for our BIM and Modeller to follow such translation usage, in its prompts/# so u can use an agent to handle it separately. A separate category of terminology be added to them"* and *"so that when any of the Trilogy chooses a language, it persists thru-out"*.
- The build spec is **`prompts/TRL_TRILOGY_STANDARD.md`** (its own lane, T1-T5). This file keeps the ERP help packs.

### 19.12 CLOSED (2026-11-19): fixed on main by bim-ootb #3301 (`c38f4c34`, another session)
- `modeller/tools/help_records.js` `barButtons` names a glyph-only pill by its `title`, then `aria-label`. Re-run on main `d04188e1`: `§WITNESS_H_SUPERSET pass=46 fail=0 inconclusive=0 verdict=PASS` (log read).

### 19.14 Step 11: forms, workflows, info windows and tasks in the ERP help box (2026-11-19; RESUME item 8, second part)
**Issue it removes:** legacy's menu search lists every leaf of the role's menu, of all 7 kinds (§19.9). The twin's help box lists windows, processes and reports only. A person who types "Product Setup" (a workflow) or "Generate Shipments (manual)" (an info window) gets nothing. Under the CARDINAL rule this is a divergence, fixed on the twin side.
**Measured (seed `erp/ad_seed.db`, role 102, legacy source):**
- Active menu leaves: X (form) 24, F (workflow) 12, I (info) 4, T (task) 3.
- Legacy hides a leaf the role cannot open, for every kind: `MTree.java:663-670` (form `getFormAccess`, workflow `getWorkflowAccess`, task `getTaskAccess`, info `getInfoAccess`). The twin's `IdmpSession.scopeMenu` (`erp/idmp_session.js:251`) checks W, P/R and X only. Its comment (:248-249) says the seed "carries no workflow/task/info id column". **That is no longer true:** `AD_Menu` has `AD_Workflow_ID`, `AD_Task_ID` and `AD_InfoWindow_ID`. Only `getMenuTree` (`erp/ad_parser.js:152`) does not select them.
- So the twin's menu shows 2 leaves that legacy hides from role 102: workflow 103 "Language Setup" (no `ad_workflow_access` row) and info 200014 "Support Users vs Roles" (no `ad_infowindow_access` row).
- **Tasks cannot be judged:** the seed has no `AD_Task` and no `AD_Task_Access` table. ⛔ The 3 task leaves stay as today (shown) until the seed carries those two tables. That is a seed migration from legacy, handed to the parity lane. Legacy's database was not read: this session has no login to it.
- The twin's menu opens forms (`openAdForm`, `idempiere.html:1683`). For F, I and T it prints a status line only (:1684).
**Change (generic, no form, workflow or menu entry named):**
- (a) **Menu scope, port of `MTree.java:663-670`:** `getMenuTree` selects the three ids. `scopeMenu` drops an F leaf whose workflow is not in `ad_workflow_access`, and an I leaf whose info window is not in `ad_infowindow_access` (active rows, the role's). They are read like the form set (`ad_access.js`, the RoleContext). The stale comment is replaced by the task residual.
- (b) **One menu-name rule:** the body of `ErpI18n.menuName` moves to a pure function in a new `erp/menu_name.js` (UMD, no `document`). `erp_i18n.js` calls it and keeps no copy. `build_help_pack.js` requires it.
- (c) **Help pack names:** `names.menus[AD_Menu_ID]` for every active X/F/I/T leaf. It is the name the menu shows in that language (rule (b), read from the committed screen pack `erp/i18n/<lang>.json`). `§HELP_PACK` prints `menus=`.
- (d) **Records:** `help_records_core.js` gains the kinds `form`, `workflow`, `info`, `task`, one record per active leaf. Record id = `menu/<AD_Menu_ID>`; `n` = `names.menus` or `AD_Menu.Name`; the English name is the other name `a` when translated (the window rule). `gate = ['menu', AD_Menu_ID]`.
- (e) **Gate and card:** `indexFrom({ menuIds })` admits a `menu` gate when the id is on the role's scoped menu; `__idmpFieldHelp.menu()` gains `leaves` (the X/F/I/T menu ids). The card gains `leaf` = the best-ranked admitted leaf in the top 5 `{menuId, kind, name}`. The page shows a row labelled by a dictionary element: Special Form `el:1298`, Workflow `el:144`, Info Window `el:3068`, OS Task `el:128`. Its link clicks that menu row (`.idmp-row.leaf[data-menu-id]`). That is the menu's own handler, so the box opens exactly what the menu opens, and it follows when the parity lane makes F/I/T open. Falsifier `HS_BREAK=noleaf`: the gate drops `menu` records.
- `erp.ask` (CLI) is unchanged until the CLI session passes `menuIds`, as with `processIds`.
**Claims (falsifier for each; logs read):**
- **M1 the menu matches legacy's rule.** For role 102, the F and I leaves shown == the leaves whose workflow or info window has an active access row (X of N, N from SQL). It holds for each role in the seed that has a menu. Red: the old `scopeMenu` shows 12 F and 4 I to role 102 (2 extra).
- **M2 the names are the menu's.** For each language, each admitted leaf's record name == the text of its menu row in the real page (Playwright reads `.nm`). X of N per language. Red: `names.menus` dropped → FAIL wherever a translation exists.
- **M3 the box lists them.** For each admitted leaf × 2 probes (its name, and its first word when that is 4 letters or more) × the 11 languages, a leaf that legacy's filter (`HelpQuery.legacyFilter`) shows is in the box's list (extends W-HQ-LEGACY-SUPERSET L6). Red `noleaf` FAILs.
- **M4 the card names it and opens it as the menu does.** Asking a leaf's exact name gives `card.leaf.menuId` = it (X of N). In the page, a click on the row of one form gives the menu's `§AD-FORM-LIVE` line, and one workflow gives the menu's status line.
- **M5 the gate holds.** A leaf hidden by M1 is never in any M3 list, and asking its name gives no row (0 expected; INCONCLUSIVE when no leaf is hidden).
- Regressions: W-HQ-SELF, BM25, WORDS, RANK-TWIN, DYM, GENERIC, LEGACY-SUPERSET, BOX, COST (C2 fresh == committed), PROC-NAMES, SHOWCASE, FIELD-HELP, ERP_ASK, W-ERP-I18N (main's known 4), `test_idempiere_login.js`.

### 19.14 RESULT (2026-11-19): BUILT, bim-ootb #3324 (`feat/help-menu-leaves`, auto-merge on), erp sw v1113 (`bump.js --write`, parity gate: new_fail=[] against legacy; precache audit 301 found, 0 missing, 0 unlisted)
- As specced (a)-(e). Also: the page's three menu id sets (`_winByName`, `_procMenuIds`, `_leafMenuIds`) are reset when the menu is rebuilt. Before, they were never cleared, so after a role switch the help box still admitted the previous role's windows and processes.
- Measured on role 102: 43 entries, 38 admitted (form 21/24, workflow 11/12, info 3/4, task 3/3 not judged); hidden: F 224 "Language Setup", I 200171 "Support Users vs Roles" (both new), X 351 / 200177 / 200218 (already hidden). Page `§IDMP-SESSION scopeMenu … visibleWorkflows=11/12 visibleInfos=3/4`.
- Help packs differ from main only by `names.menus` (JSON compare, 11 of 11): fr 34, es 23, de 22, ar 25, zh 33, ja 20, ms 19, th 30, pt 20, id 19, ko 43. Index headers rebuilt: records 948, all under budget.
- **W-HQ-MENU-LEAVES 6/0** (new, `common/help/tests/witness_hq_menu_leaves.js`): M1 38 shown = 38 by SQL; M2 456 of 456 (266 translated); M3 809 of 809 probes (1,884 legacy hits; 103 probes at a space, which legacy trims to nothing, not judged and counted); M4 456 of 456, and page 4 of 4 kinds open the same from the box as from the menu (form `§AD-FORM-LIVE open form=101`, F / I / T the menu's status line); M5 0 listed, 0 of 60 rows. **Reds:** `MENU_OLD_SESSION=origin/main` M1 FAIL (extra 224, 200171); `HQ_BREAK=nomenunames` M2 190 of 456 FAIL; `HS_BREAK=noleaf` M3 0 of 809 and M4 0 of 456 FAIL.
- **Regressions (logs read):** SELF 96/0, BM25 13/0, WORDS 13/0, RANK-TWIN 49/0, DYM 25/0, GENERIC 4/0, LEGACY-SUPERSET 7/0, PROC-NAMES 29/0, COST 86/0, BOX 8/0 (its gate now includes `menu().leaves`; first run 11,067 of 12,988 before that), SHOWCASE 39/0, FIELD-HELP 14/0, DOC 5/0, NEW 4/0, ERP_ASK 11/0, CHROME-FILL 7/0, MACHINE-SRC 7/0 (S1 now skips keys added after its reference commit and prints them: the 4 new labels), W-ERP-I18N 7/4 (main's known 4).
- **Red on main, not this step's:** W-ERP-KO-SCREEN K2 "46 of 50 ids reused" fails the same on untouched `d04188e1` (handed to `TRL_TRILOGY_STANDARD.md`); `erp/tests/test_idempiere_login.js` 4 FAIL on main (hard-coded 8 users; seed has 20; handed to the parity lane).
- Korean labels for the 4 new keys: `erp/tools/trl_batch_2026-11-19_ko_chrome_help_kinds.py` (machine, appended, the 58 rows kept).

### 19.15 DECIDED (owner, 2026-11-19): step 3, the how-to content in legacy's own tables
- Owner: *"do step 3, move how-to content into legacy shape - if u recommend such"*; asked where it lives, chose **"Legacy tables (Recommended)"**: legacy's AD_CtxHelp / AD_CtxHelpMsg / AD_CtxHelpMsg_Trl / AD_CtxHelpSuggestion added to the ERP database by migration SQL + the self-heal loader, edited in legacy's own Context Help window by the generic AD engine. **This amends D1 for how-to content only**; the field-help packs stay lazy.
- Owner, 2026-11-19 (verbatim, binding): *"We maintain the same shape policy with legacy as it has matured. We only extend where better in Kernel side in logical progression"*. So: legacy's tables, columns and codes unchanged; any extension is kernel-side only, one step at a time, each named as an extension.
- Measured before the question: legacy's model = AD_CtxHelp (Name, CtxType, Description) linked from AD_Tab / AD_Process / AD_Form / AD_InfoWindow / AD_Workflow / AD_Task / AD_WF_Node by `AD_CtxHelp_ID`; text in AD_CtxHelpMsg, the tenant's / org's row first (`MCtxHelpMsg.java` get: `AD_Client_ID DESC, AD_Org_ID DESC`); CtxType codes A F H I K N P T W (`X_AD_CtxHelp.java:146-162`, W = Workflow, T = Tab). The twin's dictionary already has the windows (200034 "Context Help": Context Help / Message / Translation tabs; 200088 "Context Help Suggestion") and 56 columns; `ad_seed.db` has none of the 4 tables. Legacy's packs carry 2 context-help rows in all (es_CO, fr_FR: the Home welcome, id 200000).
- **Defect found:** our 4 how-to rows say `ctxtype: 'W'` with a window id. In legacy W is Workflow; window help is T on the window's tab (`AD_Tab.AD_CtxHelp_ID`). Fixed in step 3.

### 19.16 SPEC: step 3, the how-to content in legacy's context-help tables (2026-11-19; owner decision §19.15)
**Issue it removes:** the twin's how-to content lives in a shape legacy does not have: 4 English rows rebuilt from the user guide into `help.json` `howto`, translations in `erp/tools/help_howto_<lang>.json` (de_DE, zh_CN only), tagged `ctxtype: 'W'` (legacy W = Workflow). It cannot be edited in the app, a tenant cannot override it, and its translations are not in legacy's format.
**Measured (legacy Postgres via `docker exec postgres`, the path `erp/patches/build_ad_seed_patch.sh` already uses):** `ad_ctxhelp` 1 row (CtxType H, the Home welcome), `ad_ctxhelpmsg` 1, `ad_ctxhelpmsg_trl` 1, `ad_ctxhelpsuggestion` 0, `ad_tab` rows with `ad_ctxhelp_id` 0. Access level: AD_CtxHelp / AD_CtxHelpMsg / AD_CtxHelpMsg_Trl 7 (System + Client + Org: a tenant may edit), AD_CtxHelpSuggestion 4 (System). **Also: `ad_task_access` for role 102 = 0 rows, so legacy hides all 3 task entries from role 102; the twin shows them (§19.14 residual, now judgeable).**
**Shape rule (owner, §19.15):** legacy's tables, columns and codes as they are. The twin's own additions are kernel-side only, named as extensions.
**Steps (each a PR, spec → witness with a falsifier → code; logs read):**
- **C1 tables + the task gate.** `build_ad_seed_patch.sh` adds the DDL of `ad_ctxhelp`, `ad_ctxhelpmsg`, `ad_ctxhelpmsg_trl`, `ad_ctxhelpsuggestion`, `ad_task`, `ad_task_access` from the live schema, and legacy's own rows (`INSERT OR IGNORE` on the key). `ad_access.js` reads task grants; `scopeMenu` `leafGate` gains T. Claims: the Context Help window (200034) opens with legacy's 1 row; role 102 sees 0 task entries (W-HQ-MENU-LEAVES M1 extended to T; red: the patch without `ad_task_access`).
  - **C1 FOUND (2026-11-19, before any edit):** `erp/patches/build_ad_seed_patch.sh` cannot be re-run as it stands. Under `set -euo pipefail`, `Q … | grep -v '^SET$'` exits 1 when a query returns no rows. Today legacy's `pa_dashboardpreference` is empty, so the script stops there with exit 1 and no message, and the 3.2 MB patch is left with 11,664 lines cut off (restored, nothing committed). The live DB has changed since the patch was built, so a full rebuild would also change unrelated rows. **So C1 does not rebuild the whole file:** a separate builder (`erp/patches/build_ctxhelp_patch.sh`) writes one marked block (the 6 tables' DDL + legacy's rows), `build_ad_seed_patch.sh` calls it, and the block is spliced into the committed file between its markers. Also fix the empty-result stop (`grep -v … || true` inside `Q`), so a missing row prints a `§` line instead of cutting the file.
  - **C1 SPEC AMENDED (2026-11-19, read the code before the first edit):** the FOUND note's "splice into the patch" is withdrawn. `patches/ad_seed.db.sql` is hashed into the Team BASE (`erp/team_sync.js:170-176` hashBase, by position + text), and "moving it re-founds every team = an owner decision" (`erp/patches/build_docvalue_overlay.py:3`, TEAMWORK §48.11b). The project's precedent for new dictionary-side tables is a **boot overlay outside the hash** (`ad_import_tables.js`, `ad_rule.js`, `ad_docvalue_overlay.js` + its generated rows file). So C1 = (a) `erp/patches/build_ctxhelp_overlay.py` reads legacy Postgres (read-only) and writes `erp/ad_ctxhelp_rows.js` (generated, reviewable text): the DDL of the 4 context-help tables (information_schema, the project's NUMERIC/TEXT affinity rule, the live primary key) and legacy's own rows of each (the task tables and link columns are already in seed + patch, see the corrected note below); (b) `erp/ad_ctxhelp_overlay.js` `ensure(db)` applies them idempotently (`CREATE TABLE` only when absent, `INSERT OR IGNORE` on the key), wired where the other overlays are (`idempiere.html`, `ws_server.js`, `sw.js` precache), and logs `§CTXHELP_OVERLAY ensure tables= rows= skipped= ms=`. The empty-result stop in `build_ad_seed_patch.sh` `Q()` is still fixed (`|| true`), because it truncates the file silently.
  - **Measured for C1 (2026-11-19), corrected the same session:** a first reading said 4 seed tables lacked the `ad_ctxhelp_id` column. **Wrong:** the query compared names case-sensitively and the seed spells it `AD_CtxHelp_ID`. With the seed + the hashed patch applied (what the page runs), all 6 legacy tables that have the column carry it, and `ad_task` (3 rows) + `ad_task_access` (3 rows, all role 0) already come from the patch's G-DICT block. §19.14's "the seed has no AD_Task_Access" measured the raw seed file, not seed + patch: only the CODE never read it. So the overlay carries the 4 context-help tables only (rows: ad_ctxhelp 1, ad_ctxhelpmsg 1, ad_ctxhelpmsg_trl 1, ad_ctxhelpsuggestion 0) and adds no column. Lesson: judge the DB the page runs (seed + patches + overlays), never the raw seed file.
  - **C1 task gate (port of `MRole.getTaskAccess`, `MRole.java:1798-1880`; `MTree.java:667-668`):** `ad_access.js` buildRole reads `ad_task_access` (active, direct rows) into `task`, null when the table is absent (not judged), the same simplifications as the workflow port already made (no included roles, no ASP filter, no access-level check: named, not new). `IdmpSession.accessibleLeaves` returns `task`; `scopeMenu` `leafGate` gains `T: ['taskId', ls.task]`; the `§IDMP-SESSION scopeMenu` line prints `visibleTasks=`.
  - **C1 claims (falsifier each; logs read):** **K1** the twin's DB is legacy's: after seed + patch + `ensure`, each of the 6 tables' column list == legacy's information_schema list (X of 6), each row count == legacy's (X of 6), each legacy link column present (X of N). Oracle = legacy Postgres read by the witness itself; unreachable → INCONCLUSIVE, never PASS. Red `CTX_BREAK=nomsg`: the rows file without its `ad_ctxhelpmsg` row → K1 FAIL. **K2** idempotent: a second `ensure` on the same db adds 0 rows and no duplicate (`count(*)` == `count(distinct key)`). **K3** the Context Help window opens on the twin: in the real page, the menu entry opens window 200034; as in legacy (a high-volume table, `§UDP4-INITIAL findFirst=true`) the Find window comes first with `Records = 1`; OK shows legacy's row (name == legacy's `ad_ctxhelp.name`). Red `CTX_BREAK=nooverlay` → K3 FAIL. **K4** the task gate: W-HQ-MENU-LEAVES M1 now judges T with legacy's own grants (read from legacy Postgres by the witness): role 102 sees 0 of 3 task entries. Red: `MENU_OLD_SESSION=origin/main` → M1 FAIL with the 3 task entries extra. **K5** the Team BASE hash does not move: the hashBase manifest (`team_sync.js:173-176`, rebuilt in node) of this tree == origin/main's. Red `CTX_BREAK=patch` (one line appended) → K5 FAIL.
  - **C1 RESULT (2026-11-19): BUILT, bim-ootb #3336 (`feat/ctxhelp-c1`, auto-merge on), erp sw v1116.** As amended: `erp/ad_ctxhelp_overlay.js` + generated `erp/ad_ctxhelp_rows.js` (`patches/build_ctxhelp_overlay.py`, 4 tables, 3 rows), wired in `idempiere.html` / `ws_server.js` / `sw.js`; page line `§CTXHELP_OVERLAY ensure tables=4/4 rows=3/3`. Task gate in `ad_access.js` + `scopeMenu`; page `§IDMP-SESSION scopeMenu … visibleTasks=0/3`. `Q()` fix tested in isolation (empty → § line on stderr and continues; SQL error → still stops).
    - **W-CTXHELP-OVERLAY 4/0** (`erp/tests/witness_ctxhelp_overlay.js`): K1 6 of 6 tables' columns and counts == legacy, link columns 6 of 6; K2 a second ensure adds 0; K3 the real page: menu → window 200034, Find window `Records = 1`, OK → "Home - Getting Started" on screen; K5 base `be91a5c9f897` == main. **Reds:** `nomsg` K1 FAIL (ad_ctxhelpmsg 0 ≠ 1), `patch` K5 FAIL, `nooverlay` K3 FAIL.
    - **W-HQ-MENU-LEAVES 6/0** with T judged from legacy's `ad_task_access` (role 102: 0 grants): M1 35 = 35 (was 38: the 3 tasks are now hidden), M2 420/420, M3 745/745, M4 420/420 + page 3 of 3 kinds (no task left to click), M5 0 of 96. **Red** `MENU_OLD_SESSION=origin/main`: M1 FAIL extra 220, 289, 302.
    - **Regressions (logs read):** SELF 96/0, BM25 13/0, WORDS 13/0, RANK-TWIN 49/0, DYM 25/0, GENERIC 4/0, LEGACY-SUPERSET 7/0, BOX 8/0, COST 86/0, PROC-NAMES 29/0, DOC 5/0, NEW 4/0, GUID 12/0, H-SUPERSET 46/0, FIELD-HELP 14/0, PLUGIN-ROLE-ACCESS PASS. **These fail the same way on clean main (re-run there), not this step's:** W-ERP-I18N 7/4 (main's known 4), `test_idempiere_login` 4 FAIL (known), `witness_role_access_update` 6 of 9 FAIL ("Cannot read properties of null"), `poc_access_gate_live` 1 FAIL (page errors). The last two are new to this list: handed to the parity lane (`ERP_IDEMPIERE_UX_PARITY.md`).
    - bump.js parity gate `new_fail=[]` (known M3:HARNESS-FAIL); precache audit 302 found, 0 missing, 0 unlisted.
- **C2 our content as rows.** Each how-to becomes one AD_CtxHelp (CtxType **T**) + one AD_CtxHelpMsg (MsgText = the row's HTML), linked from the window's first tab (`AD_Tab.AD_CtxHelp_ID`, set only when empty). Ids in the app-own range 1000000+ (as the chrome AD_Message ids). English still extracted from `docs/ERPUserGuide.md` by the same builder, written into the patch (System client 0), so a tenant's edit (client 11) wins by legacy's own order and a re-applied patch never overwrites it (`INSERT OR IGNORE`).
  - **C2 SPEC (2026-11-19, read the code first: `build_help_pack.js` HOWTO/buildHowto, `ad_ctxhelp_overlay.js`, legacy `MCtxHelpMsg.java` get/getCtxHelpID, `ADWindowContent.java:164`).** Amends the line above in two places: (1) the rows go into a **boot overlay rows file**, not the hashed patch (C1 precedent, Team BASE hash); (2) a second generated file, because the source is different: legacy's rows come from Postgres (`build_ctxhelp_overlay.py` → `ad_ctxhelp_rows.js`, unchanged), ours from the user guide (`build_help_pack.js`, which already owns the guide reader and the window linker → `erp/ad_ctxhelp_app_rows.js`, `AD_CTXHELP_APP_ROWS`). ONE overlay (`AdCtxHelpOverlay.ensure`) applies both, legacy's first; its § line adds `app=<inserted>/<statements>`.
  - **Measured, legacy's lookup:** the window calls `updateHelpContext(CTXTYPE_Tab, selectedTab.AD_Tab_ID)` (`ADWindowContent.java:164`, `AbstractADWindowContent.java:470,1564`); `getCtxHelpID` reads `AD_Tab.AD_CtxHelp_ID` joined to an active AD_CtxHelp of client 0 or the login's; then the message = the active AD_CtxHelpMsg of that help, `AD_Client_ID IN (0, ?) AND AD_Org_ID IN (0, ?)`, ordered `AD_Client_ID DESC, AD_Org_ID DESC, AD_CtxHelpMsg_ID DESC`. The physical columns `ad_ctxhelp.ad_tab_id / ad_process_id / …` have NO AD_Column in legacy's dictionary (12 columns only), so they stay NULL; the link is `AD_Tab.AD_CtxHelp_ID` only. Legacy's AD_Sequence: AD_CtxHelp / AD_CtxHelpMsg CurrentNextSys 200001, CurrentNext 1000000; the twin gives a new record `-opId` (`crud_overlay.js:835`), so app-own ids 1000000+ meet no twin record.
  - **The rows (each how-to of HOWTO, 4 today; F1 makes it 8):** AD_CtxHelp id 1000000+k, client 0, org 0, CtxType **T**, Name = the guide heading ("1 · Sales Order"), Description = the section's guide URL (the source, read by C4 for the guide link), IsActive Y; AD_CtxHelpMsg id 1000000+k, same help, MsgText = the same HTML `help.json` `howto[k].html` carries today (the same buildHowto call, so the two cannot differ until C4 deletes the json one); `_UU` = a name-based UUID of `<table>|<id>` (stable on rebuild); Created / Updated = the guide's commit time, CreatedBy / UpdatedBy 100 (as legacy's own row); then `UPDATE ad_tab SET ad_ctxhelp_id=<help> WHERE ad_tab_id=<the window's first tab: tablevel 0, active, lowest seqno> AND ad_ctxhelp_id IS NULL` (143→186, 169→257, 167→263, 195→330). All `INSERT OR IGNORE`: a re-applied overlay never overwrites an edited row.
  - **C2 claims (W-CTXHELP-OVERLAY extended; a falsifier each; log read):** **K1 amended** legacy's rows are kept as they are: columns 6 of 6 == legacy; each legacy row is in the twin with equal values (X of N, by key); the twin's other rows are exactly the app file's (count twin == legacy + app, every extra id >= 1000000, client 0). **K2 amended** a second ensure adds 0, and an edited app MsgText survives it. **K6 (new)** the how-to as legacy's rows, judged by LEGACY's lookup ported as SQL (getCtxHelpID for T + the message query, client 11, org 0): each HOWTO window's first tab returns a message, X of 4; its text == the guide section's own paragraphs read by the witness from the guide (tags stripped, proof asides absent), X of 4; CtxType T, 4 of 4. Reds: `CTX_BREAK=nolink` (the app file without its AD_Tab updates) → K6 FAIL; `CTX_BREAK=dropsec` (one row dropped) → K6 3 of 4 FAIL. **K3 amended** the real page: Find window `Records = 5` (legacy's 1 + 4), OK → all 5 names on screen. **K5** unchanged (the base hash does not move).
  - **C2 RESULT (2026-11-19): BUILT, bim-ootb #3338 (`feat/ctxhelp-c2`, auto-merge on), erp sw v1117.** As specced. `build_help_pack.js` `buildCtxHelpRows` → `erp/ad_ctxhelp_app_rows.js` (4 helps, 12 statements, links 143>186 169>257 167>263 195>330, time = the guide's last commit 2026-11-16 19:33:33); `ad_ctxhelp_overlay.js` applies it after legacy's; page line `§CTXHELP_OVERLAY ensure tables=4/4 rows=3/3 app=12/12 skipped=0`.
    - **W-CTXHELP-OVERLAY 5/0:** K1 columns 6/6, counts (legacy + app) 6/6, legacy rows equal by value 3/3, twin-only rows app-own 8/8; K2 second ensure adds 0 (app 0), an edited message 1000000 kept; **K6** legacy's lookup (ported SQL, client 11) 4/4 on the first tab, text == the guide 4/4, CtxType T 4/4; K3 real page: Find `Records = 5`, Grid Toggle, 5 of 5 names on screen (the tab opens on the first record as a form, as legacy; the witness toggles to grid as a user would); K5 base `be91a5c9f897` == main. **Reds:** `nolink` K6 0/4 FAIL, `dropsec` K6 3/4 FAIL, `nomsg` K1 FAIL, `patch` K5 FAIL, `nooverlay` K3 FAIL.
    - **Regressions (logs read):** HQ-MENU-LEAVES 6/0, HQ-BOX 8/0, HQ-SELF 96/0, H-SUPERSET 46/0, HELP-SHOWCASE 39/0, FIELD-HELP 14/0, HQ-LEGACY-SUPERSET 7/0. bump.js parity `new_fail=[]` (known M3:HARNESS-FAIL); precache audit 0 missing, 0 unlisted.
    - **Found, not this step's:** a full `build_help_pack.js` run on main changes `en_US/help.json` `actions` PR and RE (the CLI added `erp.prepare` / `erp.reactivate` to verbs.json since the last pack build), so the committed pack is stale for those 2 actions. Left out of this PR (restored); C4 rebuilds the pack anyway and takes it then.
    - Worktree note: a `/tmp/wt-*` of bim-ootb has no `node_modules`; `ln -s ~/bim-ootb/node_modules node_modules` (git-excluded) lets the witnesses and `bump.js` run (sql.js under node 18 cannot load `erp/sqljs/sql-wasm.wasm` by path).
- **C3 translations in legacy's format.** `machine/AD_CtxHelpMsg_Trl_<lang>.xml` (the project's one format, §19.13) replaces `help_howto_<lang>.json`; published packs' AD_CtxHelpMsg_Trl come first through `i18n_sources.json`. The build writes the `ad_ctxhelpmsg_trl` rows into the patch.
  - **C3 SPEC (2026-11-19; read first: legacy `HelpController.renderCtxHelp:280-307`, the published packs' `AD_CtxHelpMsg_Trl_*.xml`, `build_help_pack.js` buildHowtoLang, `trl_xml.py`).**
  - **Measured:** legacy's panel title is the message "HowTo" (Home: "GettingStarted"); the body is `MsgText` in the login language (`get_Translation`), nothing else: `AD_CtxHelp.Name` is never shown and has no `_Trl`. When a tab has NO context help, legacy builds the body from the tab's own Name / Description / Help as `<p><strong>Name</strong></p><p><em>Description</em></p><p>Help</p>` (`:321-365`) — so **once C2 links a context help to a tab, legacy would show only that message and no longer the tab's dictionary Help** (F2's "dictionary Help first" is therefore a named kernel-side extension, not legacy behaviour). Published packs: `AD_CtxHelpMsg_Trl` has only row 200000 (the Home welcome): de_DE (bxservice) and es_CO (gq, served as es_ES) translated (`trl="Y"`), fr_FR (nmicoud) `trl="N"` = English; ja / ar / pt_BR / in_ID files empty. Values are CDATA with `xml:space="preserve"`, which `build_help_pack.js` parseTrl does not read (its regex stops at the attribute). Our translations: `erp/tools/help_howto_de_DE.json`, `_zh_CN.json` (4 rows each, read only by the builder), each with a TRANSLATED TITLE ("1 · Auftrag") that cannot be derived from the pack's window names (169: "2 · Lieferung" vs the window "Lieferung (Kunde)").
  - **Decided by the shape rule (no new column):** the title goes INTO MsgText as its first paragraph `<p><strong>TITLE</strong></p>`, legacy's own convention for the tab name in the fallback body. So the English MsgText (C2) also starts with `<p><strong>1 · Sales Order</strong></p>` (the guide heading, extracted); `help.json` keeps `name` + `html` apart until C4.
  - **Build:** `erp/i18n/machine/AD_CtxHelpMsg_Trl_<lang>.xml` (de_DE, zh_CN; written once from the two JSON files by `erp/tools/trl_move_ctxhelp_2026-11-19.js`, then the JSON files and their reader are DELETED): legacy's Translation XML, one row per message id, `<value column="MsgText" original="<the English MsgText>">` = the translator's HTML before linking (title paragraph + paragraphs). `build_help_pack.js` per language: for each English message (legacy's 200000 + our 1000000+k) the FIRST translated row wins (text present and not the original): published sources in `i18n_sources.json` order, then `machine/`; a published row is copied as it is, a machine row goes through that language's window linker. Written to `ad_ctxhelp_app_rows.js` as `INSERT OR IGNORE INTO ad_ctxhelpmsg_trl` (client 0, org 0, `ad_language` = the twin's language code, IsTranslated = the published row's `trl`, machine rows 'N' = not reviewed). `help.json` `howto` per language is built from the same machine rows (title paragraph → `name`, the rest → `html`).
  - **C3 claims (W-CTXHELP-OVERLAY K1 still green with the new rows; K6 text == heading + paragraphs):** **K7** per language of `i18n_sources.json`: every translated published `AD_CtxHelpMsg_Trl` row of the packs is a twin row with the pack's text (X of N; today de_DE + es_ES = 2); every machine row is a twin row, linked (X of 8); shadowed = 0 (no machine row where a published translated row exists); the per-language `help.json` `howto` is unchanged against origin/main (name + html, X of 8: the JSON → XML move lost nothing). Reds: `CTX_BREAK=nomachine` (rows file without the machine trl rows) → K7 FAIL; `CTX_BREAK=pubtext` (the de_DE 200000 row given the English original) → K7 FAIL.
  - **C3 RESULT (2026-11-19): BUILT, bim-ootb #3340 (`feat/ctxhelp-c3`, auto-merge on), erp sw v1118.** As specced: `erp/i18n/machine/AD_CtxHelpMsg_Trl_de_DE.xml` / `_zh_CN.xml` (4 rows each, moved by `trl_move_ctxhelp_2026-11-19.js`, read back 4/4; `trl_xml.py` reads/writes the AD_CtxHelpMsg shape, Python round trip identical), the two JSON files and their reader deleted. Builder line `§CTXHELP_APP_ROWS helps=4 statements=22 trl=10 {"es_ES:published":1,"de_DE:published":1,"de_DE:machine":4,"zh_CN:machine":4}`; page `ensure … app=22/22`. All 11 `help.json` packs byte-identical to main (`source.translation` kept as the translator's markdown by reversing `md()`).
    - **W-CTXHELP-OVERLAY 6/0:** K1 (twin-only rows: client 0 18 of 18, counts legacy + app 6/6), K2, K6 text == heading + guide 4/4, **K7** published 2 of 2, machine 8 of 8 (linked, IsTranslated N), shadowed 0, help.json how-to unchanged 8 of 8, K3 page 5 of 5, K5. **Reds:** `nomachine` K7 FAIL (machine 0 of 8), `pubtext` K7 FAIL (published 1 of 2), and the C1/C2 reds still FAIL.
    - **Regressions (logs read):** HQ-MENU-LEAVES 6/0, HQ-BOX 8/0, HQ-SELF 96/0, H-SUPERSET 46/0, HELP-SHOWCASE 39/0, FIELD-HELP 14/0, HQ-LEGACY-SUPERSET 7/0; bump.js parity `new_fail=[]`; precache audit 0 missing, 0 unlisted.
    - **For C4 / F2 (measured, named):** legacy, once a tab has a context help, shows ONLY that message, not the tab's dictionary Help (`renderCtxHelp:305-307` vs the fallback `:317-365`). The twin's reader in C4 follows that; F2 (dictionary Help first) is a kernel-side extension and needs its own owner word.
- **C4 the reader.** One port of `MCtxHelpMsg.get(ctxType, recordId)` (client / org order, `_Trl` in the screen language) in `erp/ctx_help.js`; the help box's how-to records and the right panel read it; `help.json` `howto` and `help_howto_<lang>.json` are deleted (deletion budget).
  - **C4 MEASURED (2026-11-19, before any code; the next session starts here).** Who reads `howto` today: (1) `erp/help_search.js` indexFrom `:112` and `localHowto` `:119`; (2) `erp/help_records_core.js` rowsOf `:15`, howtoText `:14` (search text = `source.translation` or `source.sentences`), the record `howto/<id>` `:57`; (3) the page `idempiere.html:3151` `_howtoRows` (from the pack JSON) and `_howtoCtx :3163`, keyed on the WINDOW (`_activeWin`), where legacy keys on the selected TAB (`ADWindowContent.java:164`): that move is F4, not C4; (4) the CLI `common/door/erp_cli.js` ask `:490-499` reads `help.json` from disk, and its booted DB runs only the index and search-definition overlays (`:64-69`), NOT `AdCtxHelpOverlay`. **The blocker:** every node-side help tool reads the RAW seed through the `sqlite3` CLI: the index header builder `erp/tools/help_records.js:11` (index.json bm25 / vocab are built from the how-to texts) and the witnesses' `common/help/tests/_hq.js:22`. None of them sees the boot overlay, so moving the how-to into the DB silently empties it for the header and ~10 witnesses (C1 lesson: judge the DB the page runs).
  - **C4 design (proposed, one PR, deletion budget stated):** (a) `erp/ctx_help.js` (UMD): `msg(q, ctxType, recordId, {client, org, lang})` = `MCtxHelpMsg.get` + `get_Translation(MsgText)` (the trl row of the language when present, else the base row); `howto(q, lang)` = the rows in today's `help.json` `howto` shape (title paragraph → `name`, rest → `html`, `source.url` = AD_CtxHelp.Description, `translated` = the machine label when the trl row is IsTranslated N, `source.translation`/`sentences` = the paragraphs as plain text). (b) ONE node opener of the page's DB, `erp/tools/erp_page_db.js` (seed + the hashed patches + the boot overlays, in the page's order, as W-CTXHELP-OVERLAY already does by hand) and `help_records.js` + `_hq.js` `q` read it; re-baseline index.json once (the how-to search text changes from markdown to plain words; measure the bm25 / record counts before and after, name every witness number that moves). (c) `indexFrom` takes the how-to from `CtxHelp.howto(c.q, lang)`; the page uses `idx.howtoRows`. (d) erp_cli.js ask: `AdCtxHelpOverlay.ensure` on the booted DB (one line; both live sessions told 2026-11-19, no reply needed). (e) `build_help_pack.js` stops writing `howto` into help.json (the 11 packs lose it; the stale en_US actions PR/RE are rebuilt in the same PR, C2 RESULT). Claims: W-CTXHELP-OVERLAY K8 the reader's rows == today's help.json howto (name, html, url; X of 4 English + 8 translated) on the page DB; a red that reads the raw seed → 0 rows FAIL; W-HELP-SHOWCASE, W-ERP-ASK, W-HQ-SELF/BM25/COST/BOX/RANK-TWIN green after the re-baseline, every moved number named.
  - **C4 RESULT (2026-11-19): BUILT, bim-ootb #3343 (`feat/ctxhelp-c4`, auto-merge on), erp sw v1120.** As designed, with these specifics: `erp/ctx_help.js` (msg + howto; per-row fallback `english`; `source.guide` / `heading` derived from the stored guide URL); `erp/tools/help_db.js` (cached SQLite = seed + hashed patches + the context-help overlay; first build 19.7 s, then cached by content); `indexFrom` takes `howtoQ` / `client` / `org`, publishes `idx.howtoRows`; gates of kind `any`; tie-break = the window whose how-to is its own (1 / number of windows); help.json packs carry no `howto` (buildHowtoLang deleted); index.json headers rebuild byte-identical; CLI `erp_cli.js ask` applies the overlay and prints "(English)" per row (noted at the top of `CLI_ERP_IVR.md`, owner: "U may touch CLI and notify its prompt").
    - **W-CTXHELP-OVERLAY 6/0**, K8 the reader == the last help.json how-to (F1 `c7beb3e6`) **88 of 88** (11 languages × 8; zh_CN rows 5-8 English, marked); red `rawseed` 0 of 88 FAIL. W-HQ-BOX 8/0 (its gate taught `any`), W-ERP-ASK 15/0, W-HELP-SHOWCASE 39/0 (S5 reads the reader), HQ-MENU-LEAVES 6/0, HQ-SELF 96/0, HQ-BM25 13/0, HQ-COST 86/0, HQ-RANK-TWIN 49/0, H-SUPERSET 46/0, HQ-LEGACY-SUPERSET 7/0, HQ-PROC-NAMES 29/0, FIELD-HELP 14/0. bump.js parity `new_fail=[]`.
    - **Defects found while verifying, fixed:** the page threw on every language switch and on window activation (both mine: a `//` comment that hid the rest of a line, and a field the reader did not yet supply); W-ERP-ASK A2de answered Purchase Invoice for "Rechnung fertigstellen" once §6 linked 183 (fixed by the tie-break rule above, not by unlinking).
    - **LESSON (4 times in one session): never append an inline `//` comment by string replacement inside a long one-line statement.** It hides everything after it on that line, and `node --check` passes. After any scripted edit run: `git diff -U0 origin/main | grep "^+" | grep -E "// .*[;{] *(var |const |let |if |idx\\.|return |lines\\.)"` — it must print nothing.
- **C5 the end of the chain.** In the real page: open Context Help (200034), edit a message, Save; the help box and the right panel show the new text; a re-load keeps it. Red: the reader that ignores the client order shows the old text.
  - **C5 SPEC + RESULT (2026-11-20): BUILT, bim-ootb #3374 (`feat/ctxhelp-c5`, auto-merge on), erp cacheVersion v1123. Lines +66 / -5.**
    - **Measured first (a probe of the real page, GardenAdmin):** the Message tab of a System help takes New; the save is the tenant's own row (client 11, a signed `CRUD_CREATE`, `verifyChain=ok`), as legacy means it (access level 7). But the help box kept System's text: the help index is built once at login.
    - **Fix 1, shown at once:** the page rebuilds the help index when a context-help table commits (`overlay:committed`, table `ad_ctxhelp*`; page line `§HELP_CTX rebuild after save table=`). Legacy's mechanism: `MCtxHelpMsg` keeps its messages in a cache named by the table (`MCtxHelpMsg.java:51`), reset when a row of it is saved.
    - **Fix 2, found by the witness's reload step:** after a reload the tenant's row WAS in the database but the box showed System's text. The saved changes (the signed op-log) load after the page, and the index was built before them. `_howtoBuild` now waits for them (`__crud.withSidecar`).
    - **W-CTXHELP-OVERLAY 7/0, new K9** (the real page: menu → Find OK → the Sales Order help's row → Message tab → New → MsgText → Save): (a) saved as client 11, signed, System's row unchanged; (b) with NO reload the reader's row, the How To panel on Sales Order and the answer card of "how do I complete a sales order" show the new text; (c) the same after a reload, and still one tenant row. **Reds:** `nolisten` (page without the rebuild) → (b) FAIL; `nowait` (index built without waiting) → (c) FAIL; `noclientorder` (a reader that ignores legacy's client order) → (b) and (c) FAIL. `ONLYEDIT=1` runs K9 alone.
    - **Regressions (logs read):** HQ-BOX 8/0, HELP-SHOWCASE 38/0, FIELD-HELP 14/0, ERP-ASK 15/0, HQ-DOC 5/0, HQ-NEW 4/0; `gen_manifest --check` PASS; precache 0 missing, 0 unlisted. **Not run: the bump parity gate.** `bump.js` refuses a page as a target (`not_loaded_by_any_page_or_loader=erp/idempiere.html`), so cacheVersion was raised in `erp/modules.json` + `gen_manifest --write erp` (the code-design session's rule since #3373).
    - **Found, handed to the parity lane (not fixed here):** (1) as a tenant, the Message tab opens System's own row (client 0) as an editable form, and Save prints `§CRUD validate key=ad_ctxhelpmsg verb=update ok` with no persist line; the row is NOT changed, but nothing tells the user why. Legacy shows another tenant's / System's record read-only. (2) `MsgText` renders as a one-line input; in legacy it is a multi-line text field.
- **Later, kernel-side extensions (not in C1-C5, each its own decision):** how-to for more windows; the Suggestion flow for tenant users (legacy's table is System-only); help for processes / forms / workflows (CtxType P / F / W).

### 19.17 PLAN: fill legacy's container, then a film for legacy users (owner 2026-11-19)
**Owner (verbatim):** *"Yes, i am glad the way u put it that legacy given the container but we filling it up. I am excited of really seeing it filled, making it useful for best user experience. Do get some important sections filled up so we can have a dedicated film to show which idempiere legacy users will appreciate to consider Kernel ERP"*.
**Order of work (after §19.16 C1-C5; each its own PR, witness with a falsifier, log read):**
- **F1 the 8 standard-flow topics.** EXTRACTED, not written: the user guide's "The standard flow" §1-§8 (`docs/ERPUserGuide.md`: 1 Sales Order, 2 Shipment, 3 Customer Invoice → AR, 4 Receipt & Allocation, 5 Replenishment, 6 Purchase Order → Receipt → Vendor Invoice → Match, 7 Final accounts, 8 Financial reporting). Today only §1-§4 are how-to rows (`build_help_pack.js` HOWTO). Each becomes one AD_CtxHelp (CtxType T on the window's first tab, or P for a process topic such as Replenish) + its AD_CtxHelpMsg, the guide section linked. Claim: 8 of 8 sections have a row, and each row's text == the guide's sentences (proof asides left out, as today). Red: drop one section → FAIL.
  - **F1 SPEC (2026-11-19, owner: "More content to put in? Do as much"; built BEFORE C4 because it only adds rows to C2's path).** Measured targets (seed, first active tab of tablevel 0): §5 Replenishment = the process **53267 "Replenish Report"** (menu 53354, no window: CtxType **P**, `AD_Process.AD_CtxHelp_ID`); §6 = windows **181** Purchase Order (tab 294 C_Order), **184** Material Receipt (296 M_InOut), **183** Purchase Invoice (290 C_Invoice), **107** Matched Invoices (408 M_MatchInv), the four nouns the section walks; §7 = **200005** GL Journal (200007) and **194** Bank/Cash Statement (328); §8 = **216** Financial Report (372 PA_Report) and the report **310** Trial Balance. ONE AD_CtxHelp per section, linked from every target (legacy's FK is on the tab / process, so one help may serve several, `getCtxHelpID` does not filter CtxType); CtxType T when the section has a window, P otherwise. `help.json` keeps one row per section (its first window; §5: `ad_window_id` null + `ad_process_id`, gated on the process in `help_records_core`). **Translations:** §5-§8 in de_DE and zh_CN appended to the machine XML (written by this session, labelled machine, IsTranslated N), so the two packs keep 8 of 8 (`rowsOf` takes the pack's rows whole when it has any: a partly translated pack would hide §5-§8).
  - **F1 claims (W-CTXHELP-OVERLAY K6 / K7 widened):** K6 every target of every section finds its help by legacy's lookup (T: 13 tabs... measured count printed; P: 2 processes), text == the guide 8 of 8, CtxType right 8 of 8; K7 machine 16 of 16, published unchanged. Red `CTX_BREAK=dropsec` → 7 of 8 FAIL; new red `CTX_BREAK=noproc` (the app file without its AD_Process updates) → the P targets FAIL. K3: Find `Records = 9`.
  - **Owner, 2026-11-19 (verbatim, binding, supersedes F3 and the film's three languages for now):** *"when pushing for more content, need not translate further, get rich content thruout first"* · *"as we arent sure of the full shape of our CMS.. once that has matured, then we can freeze for translations"* · *"if to test translation shape then just one other language"*. So: **translations are FROZEN** until the content shape matures (then the owner freezes it and translation starts); the one test language is **de_DE**; new topics are English only. Consequence for C4: a pack with some translated rows must still show the English rows it lacks (per-row fallback), or new topics vanish for de/zh users.
  - **F1 RESULT (2026-11-19): BUILT, bim-ootb #3341 (`feat/ctxhelp-f1`, auto-merge on), erp sw v1119.** 8 sections, 13 targets (`§CTXHELP_APP_ROWS helps=8 statements=43 trl=14` = es_ES + de_DE published 1 each, de_DE machine 8, zh_CN machine 4). Also: a guide bullet list renders `<ul><li>`; a buy-side section (HOWTO `sotrx: 'N'`) links a table term to `AD_Table.PO_Window_ID` (legacy's zoom by IsSOTrx: `M_InOut` → 184 Material Receipt, not 169); help.json rows carry `windows` + `ad_process_id`; the How To widget shows a section on any of its windows; a process-only how-to is gated on its process (`help_records_core`). de_DE §5-§8 by `erp/tools/trl_batch_2026-11-19_ctxhelp_f1.js` (machine, labelled). A Spanish batch and Chinese §5-§8 were written, then dropped on the owner's word before commit.
    - **W-CTXHELP-OVERLAY 6/0:** K6 13 of 13 targets, text == the guide 13/13, CtxType right 13/13; K7 published 2/2, machine 12/12, shadowed 0, help.json unchanged 8/8; K3 `Records = 9`, 9 of 9 names. Reds: `noproc` (new) K6 11/13 FAIL, `nolink` K6 2/13, `dropsec` K6+K7, `nomachine`, `pubtext`, `nomsg`, `patch`, `nooverlay` each FAIL.
    - **W-HELP-SHOWCASE 39/0** after S5 was widened to the list shape (a block end is a word break, the guide's `- ` marker dropped; still word for word: it failed 7/8 on §6 before). **Regressions (logs read):** HQ-MENU-LEAVES 6/0, HQ-BOX 8/0, HQ-SELF 96/0, HQ-BM25 13/0, HQ-COST 86/0, HQ-RANK-TWIN 49/0, H-SUPERSET 46/0, FIELD-HELP 14/0, HQ-LEGACY-SUPERSET 7/0, ERP-ASK 15/0. bump.js parity `new_fail=[]`; precache 0 missing / 0 unlisted. The en_US pack's actions PR / RE now carry the CLI verbs (the C2 staleness, taken here).
    - **Two witness defects of my own, found and fixed the same hour:** an inline `//` comment appended to a one-line `if … else …` swallowed the `else` (twice: K7 and S5). Lesson: put a comment on its own line in a dense one-liner, and re-run the red after any witness edit.
- **F2 the dictionary's own Help as the opening line.** Each core window's `AD_Window.Help` / the tab's `AD_Tab.Help` (legacy's text, already in the seed and translated in the packs) is shown first, then our how-to. Nothing copied: the row refers to it. Measured on the seed: Business Partner 400 characters, Product 210, Purchase Order 184, Material Receipt 183, Shipment 174, Payment 271, Bank Statement 441; tabs with Help e.g. Product 11 of 17, Business Partner 8 of 9.
  - **F2 DECIDED (owner, 2026-11-22, verbatim):** *"go F2.. our CMS is to extend for Kernel ERP based on legacy model. Legacy itself at the core is not touched."* So F2 is a kernel-side extension (D3: the twin may show MORE help, shape stays legacy's).
  - **F2 SPEC (2026-11-22): the dictionary text first, then our message.**
    - **Measured:** the 17 tabs that carry one of our helps: 15 have dictionary Help (62 to 859 characters; Payment 330 = 859), Financial Report 372 has none, Journal 200007 has a Description only. The 4 processes: Aging 238, Trial Balance 310 and Replenish Report 53267 have Help; Initial Tenant Setup 53161 has none. Since F4, legacy's `renderCtxHelp` (HelpController.java:305-307 vs :338-364) shows our message INSTEAD of that text on these 17 tabs and 4 processes, so a legacy user loses words they know.
    - **Build:** in `_howtoCtx`, for T and P with a message: legacy's no-message block (`_ctxDict`, the same renderer F4 ported, same language rule) first, then a thin rule (`<hr class="hs-sep">`), then the message as today. H unchanged (Home has no record text). A tab / process with no message is unchanged (dictionary text only, legacy's own output). `§HELP_CTX ... shown=dict+msg` when both are shown.
    - **Claims, W-CTXHELP-OVERLAY K10 widened:** for every place with a message whose record has a Name / Description / Help, the panel holds the dictionary part FIRST and the message's title AFTER it (order checked by text position), en_US and de_DE; the no-message places and Home unchanged (89 of 89 each). **Red:** `CTX_BREAK=nodictfirst` (the message alone, the F4 page) → the dictionary-first places FAIL.
  - **F2 RESULT (2026-11-22): BUILT, bim-ootb #3384 (`feat/ctxhelp-f2`, auto-merge on), erp sw v1125.** `_howtoCtx`: legacy's own block (`_ctxDict`) first, `<hr class="hs-sep">`, then the message; `shown=dict+msg`. **W-CTXHELP-OVERLAY 8/0** (log read): K10 en_US 89/89, de_DE 89/89, own text before the message's title 40 of 40 (17 tabs + 3 processes × 2 languages); red `nodictfirst` 0 of 40 FAIL. Regressions: HELP-SHOWCASE 38/0, FIELD-HELP 14/0, ERP-ASK 15/0, HQ-BOX 8/0, HQ-MENU-LEAVES 6/0. A page-only change: `bump.js` bumps nothing (`not_loaded_by_any_page_or_loader`), so `cacheVersion` was moved by hand in BOTH `erp/modules.json` and `erp/sw.js` (`gen_manifest.js --check` PASS 55/55).
- **F3 translations in legacy's format.** The 8 topics in the 12 ERP languages as `machine/AD_CtxHelpMsg_Trl_<lang>.xml` (AI, lowest priority, labelled, as T5); published rows always win. Claim per language X of 8, shadowed = 0.
- **F4 the right panel.** Legacy shows Context Help on the right for the current tab; the twin's right help panel shows the tab's context help when a window opens (no question needed). Claim in the real page: opening each of the 8 windows shows its topic, X of 8, in each language.
  - **F4 SPEC (2026-11-21, session "resume message"): the How To panel follows the place in view, as legacy's `renderCtxHelp`.**
    - **Measured (the twin today):** `_howtoCtx` (`erp/idempiere.html:3170`) takes the FIRST how-to row whose `windows` holds the active window. It runs from `renderWinTabs` (:1791) and after the index build (:3161), never on a tab change. So Order Line (tab 187) and a partner's Location (tab 222) show their header tab's help, the 4 process helps (P) are reached by the question box only, a tab with no help shows an empty box, and the Home welcome (legacy's only row, 200000, CtxType H) is shown nowhere.
    - **Legacy (the oracle, `org.adempiere.ui.zk`):** `updateHelpContext(T, selectedGridTab.AD_Tab_ID)` when a window opens (`AbstractADWindowContent.java:470`), when the tab selection changes (`:1564`, the `ON_SELECTION_CHANGED_EVENT` handler) and when the window is re-selected (`ADWindowContent.java:164`); `(P, AD_Process_ID)` when a process dialog opens (`ProcessDialog.java:234`); `(H, 0)` with no window (`WindowContainer.java:436`). `HelpController.renderCtxHelp` (:280-470): the message by `MCtxHelpMsg.get` (our ONE reader, `erp/ctx_help.js` `msg()`); **when there is no message**, for T / P the record's own `<p><strong>Name</strong></p><p><em>Description</em></p><p>Help</p>`, the translated columns when the language is not the base one (legacy's `_Trl` rows copy the English where untranslated, so per column = the translation, else English); the entity type only when `IsShowTechnicalInfOnHelp` (default N, `X_AD_UserPreference.java:45`: not shown); title `GettingStarted` for H, else `HowTo`.
    - **Build (ONE place, deletes the window-keyed search):** `_howtoCtx` becomes the port of `renderCtxHelp`: place = (T, the selected tab's id) when a window is in view, (P, id) while a menu-launched process pane is open, (H, 0) with none; message via `CtxHelp.msg(_sqlRows, type, id, {client, org, lang})`; else the record's dictionary text. Called from `renderActiveTab` (every tab change passes through it: the tab strip, `goTab`, zoom, `_selectTabByTable`) and `_openProcessNow`. The translated tab / process Description + Help come from the help pack: `build_help_pack.js` adds `tabs` and `processes` = [descIndex, helpIndex] from `AD_Tab_Trl` / `AD_Process_Trl`, read as `fields` is (texts stored once). Names: the screen pack already translates tab names; process names are `names.processes`.
    - **Claims, W-CTXHELP-OVERLAY K10 (the REAL page, GardenAdmin), en_US and de_DE:** for every tab of every window that holds a linked tab, and every linked process on the role's menu (N printed): select it, then `§HELP_CTX type=<T|P|H> id=<record> ctxhelp=<id|none>` and the panel equal legacy's answer: the help id == legacy's lookup (the K6 SQL, run in node), the panel holds the message's title; a tab with no help shows its own Name, and its Help's opening words when it has Help (in de_DE the translated ones where the pack has them). Home: with no window the panel shows help 200000 under the `GettingStarted` title.
    - **Reds:** `CTX_BREAK=winkey` (the old window-keyed `_howtoCtx`) → K10 FAIL on the sub-tab targets and the no-help tabs; `CTX_BREAK=nodict` (no dictionary fallback) → FAIL on the no-help tabs; `CTX_BREAK=notabtrl` (the de_DE pack without `tabs`) → the de_DE fallback FAIL.
    - **Not in F4 (named):** F2 (dictionary Help shown together WITH a message) waits for the owner's word; forms / info windows / workflows (F, I, W) keep no panel call until the twin's menu opens them as legacy does (§19.14).
  - **F4 RESULT (2026-11-22): BUILT, bim-ootb #3380 (`feat/ctxhelp-f4`, auto-merge on), erp sw v1124. Code + witness +173 / -23 (the window-keyed `_howtoRows` search deleted).**
    - **What was built.** `_howtoCtx` (`erp/idempiere.html`) is the port of `renderCtxHelp`: the place (T selected tab / P menu process / H no window), the message by `CtxHelp.msg`, else the record's own Name / Description / Help. Called from `renderActiveTab` (every tab change) and `_openProcessNow` (menu launch only; a button's ProcessModalDialog does not, as legacy). It renders and logs on every call (a skip-if-same-place cost W-HELP-SHOWCASE S7de its `§HELP_CTX` evidence, so it was removed). `§HELP_CTX window=<w> type=<T|P|H> id=<record> howto=<help|none> shown=<msg|dict|none> lang=<text's language>`.
    - **Help packs:** `tabs` / `processes` = [descIndex, helpIndex] from AD_Tab_Trl / AD_Process_Trl (`build_help_pack.js buildRecTrl`, the fields' rule, texts stored once). Fields unchanged byte for byte. de_DE 549 → 695 KB (lazy, per language; e.g. de_DE tabs 753, processes 344). `erp_i18n.js` applies the tab texts to the window's tabs (English kept on `_enDesc` / `_enHelp`) and exposes `ErpI18n.recHelp(kind, id)`. index.json: only the `ntexts` header moves (records are rebuilt by the page).
    - **W-CTXHELP-OVERLAY 8/0 (log read). New K10** in the real page (GardenAdmin): Home help 200000 under "Getting Started" ✓; **en_US 89 of 89, de_DE 89 of 89** places (86 tabs of the 15 windows holding a linked tab + 3 linked processes; 53161 not on the role's menu, printed). All 17 linked tabs show their own help (Order Line 187, Location 222 included). Oracle in node: legacy's lookup SQL + MCtxHelpMsg order over the twin DB, the seed's AD_Tab text, legacy's published AD_Tab_Trl XML. **Reds:** `winkey` 18 of 89, `nodict` 20 of 89, `notabtrl` de_DE 39 of 89: each FAIL.
    - **Regressions (logs read):** HELP-SHOWCASE 38/0, FIELD-HELP 14/0, HQ-BOX 8/0, HQ-SELF 96/0, HQ-BM25 13/0, HQ-RANK-TWIN 49/0, H-SUPERSET 46/0, HQ-LEGACY-SUPERSET 7/0, HQ-MENU-LEAVES 6/0, HQ-PROC-NAMES 29/0, HQ-COST 86/0 (after the index rebuild), ERP-ASK 15/0. **W-ERP-I18N 4 FAILs are pre-existing:** identical on clean main `e4fa52fe`, 12 of 12 locale verdict lines equal (timings aside). bump.js parity `new=[]` (LF PASS; M3 known HARNESS-FAIL); precache 303 / 0 missing / 0 unlisted.
    - **Lesson:** the first parity-gate run said `LF:FAIL` = `fetch failed`: the legacy pilot (:8088) was down, only postgres up. The gate counts an unreachable oracle as FAIL, not HARNESS-FAIL. Restart per SQLiteIDEMPIERE.md:45 (`~/idempiere-pilot/start.sh`), never `--no-parity`.
    - **Left (named):** F2 (dictionary Help shown WITH a message) waits for the owner's word. After Cancel on a menu process the panel keeps the process help until the next window or tab. F / I / W get no panel call until the twin's menu opens them.
- **F6 DECIDED (owner, 2026-11-22, verbatim): our content offered to legacy users as migration scripts.** *"I reckoned we can let legacy hsa the harmless CMS if able via migration scripts. We upkeep that as our contribution to legacy users at our Github"*. This AMENDS D3's "never installed into legacy" for the CONTENT only: legacy's code and tables stay untouched; what ships is DATA in legacy's own tables (AD_CtxHelp, AD_CtxHelpMsg, AD_CtxHelpMsg_Trl + the AD_CtxHelp_ID link on AD_Tab / AD_Process), as a migration a legacy admin may apply or not, kept up to date in our GitHub.
  - **To measure before the spec (not done yet):** legacy's migration format (`migration/` SQL per release, postgresql + oracle folders) and whether a 2Pack is the better carrier; the id range (our 1000000+ ids may collide with a legacy site's own rows: legacy's official range is < 1000000 for dictionary, ≥ 1000000 is the site's own); EntityType (our rows need a registered EntityType, not 'D'); how legacy shows a help on a tab that has dictionary Help (it shows ours INSTEAD, HelpController.java:305 — the F2 extension is kernel-side only, so a legacy user would lose the tab's text on those 17 tabs).
  - **Measured 2026-11-22 (read-only, legacy source + the oracle DB):** legacy's own carrier for a site's scripts is `migration/local_sql/postgresql/yyyymmddHHMM_<Description>.sql` (and `oracle/`), applied by RUN_SyncDB in timestamp order after the core folders (`migration/local_sql/README.txt`); a 2Pack would go in `migration/zip_2pack/` as `yyyymmddHHMM_<ClientValue>_<Description>.zip` (`zip_2pack/README.txt`). ID collision is real: `AD_Sequence` for AD_CtxHelp and AD_CtxHelpMsg has CurrentNext = 1000000 (a site's own first id) and CurrentNextSys = 200001, so our twin's fixed ids 1000000+ would collide on a real site. Legacy has `nextidfunc` and `toRecordId(table, uuid)`, so the script keys every row on its UUID (our rows already carry deterministic `_uu` values) and takes ids from the sequence; a second apply finds the UUID and does nothing.
  - **The one owner question for F6 (asked when the spec is written, not before):** in legacy, our help replaces the tab's own Help in the panel; accept that, or link only the tabs whose dictionary Help is empty, or carry a copy of the dictionary text inside the shipped message (a copy goes stale)?
  - **F6 ANSWERED (owner, 2026-11-22, chosen from the options):** *"Copy own text in"*: the shipped message starts with the tab's / process's own Name / Description / Help, then our topic. **Built at APPLY time in SQL from the site's own AD_Tab / AD_Tab_Trl (AD_Process / _Trl)**, so each site gets its own dictionary words in every language it has, and a re-applied release refreshes them (a copy generated at build time would carry OUR dictionary, not the site's).
  - **F6 RESULT (2026-11-22): BUILT, bim-ootb #3388 (`feat/ctxhelp-f6`, auto-merge on).** `build_help_pack.js buildLegacySql` writes `erp/legacy/local_sql/postgresql/202611161933_KernelERP_ContextHelp.sql` (214 KB, 21 targets = 17 tabs + 4 processes, 84 statements, languages en + de_DE + zh_CN machine) + `erp/legacy/ctxhelp_targets.json` (the witness's denominator) + `erp/legacy/README.md`. Spec changes on measurement: **no EntityType** (AD_CtxHelp / Msg have no such column); the own text is built **at apply time in SQL** (site's dictionary, every site language) instead of copied at build time; one AD_CtxHelp PER TARGET (the twin shares one help over several tabs, but a copied own text differs per tab); Name = the twin's name + " (<tab / process name>)" when a help serves several targets (≤ 120, the build stops otherwise).
    - **W-CTXHELP-LEGACY 6/0** (new, `erp/tests/witness_ctxhelp_legacy.js`, log read): on `idempiere_pilot` in ONE rolled-back transaction (the pilot verified unchanged after: 1 help, 1 message, sequences 1000000, 0 links). L1 legacy's lookup finds our help on 20 of 20 targets (tab 187 is L5's), message == the site's own block + `<hr>` + the twin's message (2 cut, ending in the guide link); L2 20 of 20 es_CO rows (own text in Spanish first); L3 second apply 84 of 84 statements 0 rows, sequences still; L4 40 of 40 ids from the site's sequences; L5 tab 187 keeps the site's help 200000; L6 all ≤ 2000. Reds: `noconflict` L3 FAIL (duplicate key), `nodict` L1 + L2 FAIL, `nolinkguard` L3 + L5 FAIL.
    - **Not in F6 (named):** an Oracle script (no Oracle DB to test); de_DE / zh_CN rows on a real site (the pilot has es_CO only); applying it to a real legacy install through RUN_SyncDB itself (the witness runs the same SQL through psql).
  - **F7 FOUND + DECIDED (2026-11-22): every message must fit AD_CtxHelpMsg.MsgText's FieldLength (2000, `AD_Column`, the same in legacy and in the twin's dictionary).** Measured: 4 twin rows were over (help 1000010 Initial Tenant Setup 3,047; 1000000 Sales Order 2,450; de_DE 2,493; zh_CN 2,287): legacy refuses them (varchar(2000)) and the twin's own Context Help window would fail its field check on Save. SQLite never enforced the length. **Owner (chosen):** *"Whole paragraphs + link"*: keep whole blocks in order up to the limit, end with ONE link to the guide section where the text stops (that section's own title + " …"). **Owner, verbatim:** *"The idea of linking to a complete user guide is great, because user can choose to read it separately or interactively from the app. This is good immersion too and not confusing that there maybe 2 versions of the same guide"*.
  - **F7 SPEC:** `build_help_pack.js` `fitParts`: the limit read from the seed's AD_Column (never a number in code); blocks = `<p>` / `<ul>` / `<ol>` (a section that is not whole blocks stops the build); each language fitted on its own text; `§CTXHELP_FIT help= lang= full= kept= cut_at= max=`. **Claims:** W-CTXHELP-OVERLAY K6 widened (a cut message is a whole-word start of the guides' text, ends with the link to the section where it stops); K7 widened (a cut translation: its machine sections + the English guide sections, word for word); **new K11** every AD_CtxHelpMsg and _Trl row <= its column's FieldLength (X of N). **Red:** `CTX_BREAK=nofit` (the rows file before F7) → K11 FAIL. For F6 the same rule runs IN SQL: the site's dictionary block + `<hr>` + our blocks while they fit, then the link.
  - **F7 RESULT (2026-11-22): BUILT, bim-ootb #3387 (`feat/ctxhelp-f7`, auto-merge on), erp sw v1126.** `§CTXHELP_FIT`: 1000000 en_US 2450→1635 (cut at FS9), 1000010 3047→1072 (cut at FS3: its next block is one long numbered list), de_DE 2493→1678, zh_CN 2287→1868. **W-CTXHELP-OVERLAY 9/0** (log read): K6 21/21 (2 cut), K7 14/14 (2 cut; the oracle for a cut row is the GUIDE in word space, since the English message is itself cut), K11 18/18 + 17/17 ≤ 2000; red `nofit` K11 FAIL on exactly the 4 old rows. Regressions 12 of 12 PASS (HQ-COST 86/0, HQ-SELF 96/0, ...); parity `new=[]`; gen_manifest 58/58. **Known gap:** no claim checks that a message is cut ONLY when it would not fit (the builder's rule, not judged).
  - **F6 SPEC (2026-11-22): the legacy migration script.**
    - **Carrier:** `erp/legacy/local_sql/postgresql/<yyyymmddHHMM>_KernelERP_ContextHelp.sql` in bim-ootb (our GitHub), copied by a legacy admin into their `migration/local_sql/postgresql/` and applied by RUN_SyncDB. Generated by `build_help_pack.js` from the same rows as `erp/ad_ctxhelp_app_rows.js` (ONE source), never hand-written. Oracle folder: not built (no Oracle oracle to test against; named).
    - **Rows:** AD_CtxHelp, AD_CtxHelpMsg, AD_CtxHelpMsg_Trl (published + machine, IsTranslated as in the twin), then `UPDATE AD_Tab / AD_Process SET AD_CtxHelp_ID` for each target. Every row keyed on its UUID: `INSERT ... SELECT nextidfunc(<seq>,'N'), ... WHERE NOT EXISTS (SELECT 1 FROM <t> WHERE <t>_UU=...)`, links by `toRecordId('AD_CtxHelp', uuid)`; a link is set only where the target's AD_CtxHelp_ID is NULL (a site's own help is never replaced). AD_Client_ID 0, EntityType of our own (registered by the same script if absent), never 'D'.
    - **Claims (new witness W-CTXHELP-LEGACY):** applied to the local PILOT DB `idempiere_pilot` (never the oracle DB `idempiere`) inside a transaction that is rolled back: legacy's own lookup there (MCtxHelpMsg.getCtxHelpID SQL) finds, for every one of the twin's K6 targets, a help whose message == the twin's (X of N, N = K6's 21); a second apply inserts 0 rows; no row has id < 1000000 or a site id taken from a fixed number; a target that already has a site help keeps it. Reds: the script without its `NOT EXISTS` guard → second apply FAIL; fixed ids → the collision check FAIL.
    - **Not in F6:** F2's dictionary-first is kernel code, so legacy shows our message alone (HelpController.java:305). The owner question below decides what the message carries.
  - **Witness idea:** apply the migration to the local pilot (`idempiere_pilot`, never the oracle DB `idempiere`), read legacy's own lookup there, and compare with the twin's K6 answer for every target; a second apply changes nothing.
- **F5 SPEC (2026-11-19, owner: *"get rich content thruout first"*): the second source, `docs/ERP_FirstSetup.md`, at TAB level.** Measured: a read-only Sonnet survey of `docs/ERPUserGuide.md` (`guide_targets.json`) found only 3 more sections that name a dictionary target, all already linked or borderline: the user guide is exhausted. `docs/ERP_FirstSetup.md` (427 lines) is a step-by-step guide that names its windows (often with the window id) and its TABS. Mapping (each from the doc's own words; ids checked in the seed): Step 3 Initial Tenant Setup → process **53161**; Steps 4 + 5 customer / vendor → Business Partner header tab **220**; Step 6a address → Business Partner **Location tab 222**; Step 6 products, prices, tax, payment terms → Product tab **180** + Warehouse tab **177**; Step 6b → Price List **146** first tab; Steps 7 + 9 order header / complete → Sales Order tab **186**; Step 8 add a line → **Order Line tab 187**; Part D first purchase order → Purchase Order tab **294**; Step 11 Trial Balance → report **310**; Step 11b Aging → report **238**. Steps 10, 12, 13 name no dictionary target (left out).
  - **Shape (legacy):** a tab or process has ONE AD_CtxHelp and legacy shows ONE message (`MCtxHelpMsg.get` `.first()`), so a target served by several sections gets ONE message holding them in source order (the standard flow first, then the setup guide), each section under its own `<p><strong>heading</strong></p>`; the first is the title (C3 rule). Targets with the same section list share one AD_CtxHelp. The `(Verified: …)` asides are proof, left out as the guide's `> Proven by` lines are.
  - **Claims (W-CTXHELP-OVERLAY K6 widened to both sources):** every target of every section finds a message by legacy's lookup that contains the section's text == the source doc's paragraphs (X of N, N printed); every section of both sources that names a target is linked (X of N); red: drop the setup guide → its targets FAIL. English only (translations frozen).
  - **F5 RESULT (2026-11-20): BUILT, bim-ootb #3371 (`feat/ctxhelp-f5`, auto-merge on), erp sw v1121. Lines +238 / -122.**
    - **What was built.** `build_help_pack.js` `SECTIONS` = the user guide's 8 sections (keys UG1-UG8) + 12 steps of the setup guide (FS3, FS4, FS5, FS6, FS6a, FS6b, FS7, FS8, FS9, FSD, FS11, FS11b). Every tab / process gets the list of sections that name it, in source order; each distinct list is ONE AD_CtxHelp + ONE message (each section under its own `<p><strong>heading</strong></p>`). Builder line: `§CTXHELP_APP_ROWS helps=17 sections=22 statements=71 trl=16`. New helps: 1000008 [UG6+FSD] Purchase Order tab 294, 1000009 [UG8+FS11] Trial Balance P310, 1000010 [FS3] P53161, 1000011 [FS4+FS5] tab 220, 1000012 [FS6] tabs 180 + 177, 1000013 [FS6a] Location tab 222, 1000014 [FS6b] Price List tab 191, 1000015 [FS8] Order Line tab 187, 1000016 [FS11b] Aging P238. Help 1000000 grew to [UG1+FS7+FS9] and kept its id.
    - **Ids are kept by a committed register**, `erp/tools/ctxhelp_ids.json` (id → section keys): the same sections = the same id; a help that gained sections keeps the id it grew from; an id is never reused. AD_CtxHelp.Name = the section titles joined with " + " (the column is 120 long; the builder stops if a name is longer), so two helps never share a name in the Context Help window.
    - **Setup-guide text rules (extracted, nothing written):** the `*(Verified …)*` asides, the pictures and the `---` rules are left out; a numbered list keeps its own numbers (`<li value=N>`), bullets under an item nest, a `####` sub-heading is a bold paragraph. In this guide a name links only as a WHOLE bold term (so "Oak Tree" and "Initial Tenant Setup" do not link to the Tree / Tenant windows); the user guide's rows are byte-identical to before.
    - **Translations (frozen, shape only).** A machine row translates ONE section (its `trlId` = the message id it had when translated). The twin's `_Trl` row of a help is built section by section: the machine text where there is one, the English section where there is none. So German Sales Order shows section 1 in German and Steps 7 and 9 in English, nothing vanishes. de_DE 10 helps, zh_CN 4.
    - **Reader (`erp/ctx_help.js`):** a help that sits only on a SUB tab is returned (it was skipped: the tab query asked for tablevel 0); `windows` = header tabs first; numbered lists reach the search text.
    - **W-CTXHELP-OVERLAY 6/0** (log read): K1 twin-only rows client 0 50 of 50; K2; **K6 21 of 21 targets** (tabs + processes named by 20 sections) found by legacy's lookup, text == both guides' own text in source order 21 of 21, CtxType 21 of 21, sections whole 20 of 20 (user guide 8 of 8, setup guide 12 of 12); **K7** published 2 of 2, helps with a machine section 14 of 14, machine rows in use 12 of 12, shadowed 0; **K8 re-based** (it compared against the old help.json, which F5 outgrew): the reader == the page DB's helps (title, html, language, windows incl. sub tabs, processes, guide URL) 187 of 187 (11 languages × 17); K3 the real page: Find `Records = 18`, 18 of 18 names; K5 base `be91a5c9f897` == main. **Reds:** `nosetup` (new: the rows file before the setup guide) K6 11 of 21 FAIL; `nolink` 4 of 21; `noproc` 17 of 21; `dropsec` 20 of 21; `nomachine` K7 0 of 14; `pubtext`; `rawseed` K8 0 of 187; `nomsg` K1; `patch` K5: each FAIL.
    - **Regressions (logs read):** HQ-BOX 8/0, HQ-SELF 96/0, HQ-BM25 13/0, HQ-RANK-TWIN 49/0, H-SUPERSET 46/0, HQ-LEGACY-SUPERSET 7/0, HQ-MENU-LEAVES 6/0, HQ-PROC-NAMES 29/0, FIELD-HELP 14/0, ERP-ASK 15/0. **W-HELP-SHOWCASE 38/0: S5 deleted** (it re-did K6 for one guide and had no red; K6 now owns "row == guide, word for word"). bump.js parity `new_fail=[]` (known M3:HARNESS-FAIL); precache 0 missing, 0 unlisted. index.json headers unchanged.
    - **CORRECTED 2026-11-20 (same day): W-HQ-COST C1b was THIS step's.** First written here as "fails the same way on clean main, machine load". Wrong: main was measured on a loaded machine with a cold help-DB cache (27 s), and the two reds were taken for one cause. Measured after: every help-DB query is one sqlite3 process and the reader repeats the same ones per language, so 17 helps (was 8) took the 12-language build from under 10 s to 15 s (1.3 s per language). **Fixed, bim-ootb #3376:** `erp/tools/help_db.js` keeps each statement's answer (the file never changes under its key): 0.4 s per language, C1b 4,713 ms, W-HQ-COST 86/0. Build tool only. Lesson: a red seen on main too is not proof of another cause; find where the time goes before naming one.
    - **Left for F4 (named):** the How To panel is still keyed on the WINDOW and shows the first help of the window (the header tab's, by id order). The helps on sub tabs (Order Line 187, Location 222) are reached today by the question box only; F4 (the panel follows the selected TAB) shows them in place. The panel's guide link names the help's FIRST section only (AD_CtxHelp.Description holds one URL).
  - **Note for F2 / F4:** linking a context help to a SUB tab (222, 187) means legacy's panel there shows our message instead of the tab's dictionary Help (`renderCtxHelp:305-307`). The twin's panel should show both (dictionary Help first): that is F2, still waiting for the owner's word.
**Owner, 2026-11-19 close (verbatim, binding):** *"close, will resume new session, u may use Sonnet agents to put in more content so we quickly browse its wealth. Also pick Mandarin, French and Spanish. No Japanese for this film."* So: (a) Sonnet agents may fill MORE topics after F1 (each topic still EXTRACTED from a cited source: the user guide, legacy's dictionary Help, or legacy's own docs; every agent's rows go through the same witness, nothing merged on an agent's word); (b) the film's language beat shows **zh_CN, de_DE, es_ES**, not ja_JP (owner, minutes later: *"Hm, replace French with German"*).
**Film (EN narration; owner rules: split screen + real key sounds, voice after the return key; never pushed, script only):** working title *"The container legacy gave us, filled"*. Beats: (1) legacy's own Context Help window: 1 topic, the Home welcome; (2) the twin: the same window, the same columns, now 8 topics; (3) open Sales Order, the right panel already explains the next step; (4) ask "how do I close a sales order", the answer card; (5) switch to Mandarin, German and Spanish (owner: no Japanese, French replaced by German), the same help, translated, marked machine; (6) a tenant admin edits a sentence in the Context Help window, Save, the panel shows it (their own row wins, legacy's order); (7) close: same shape as legacy, nothing to relearn. Film only after F1-F4 are witnessed; every on-screen claim is a `§` line in the film's log.

### 19.18 FILM STORYBOARD v1: "The container legacy gave us, filled" (2026-11-22; owner: *"if it is substantial, then prepare a film to higlight what is specail with our knowledge CMS"*)
**Is it substantial (measured, the answer to the owner's "if"):** 20 guide sections in 17 helps on 21 tabs / processes (W-CTXHELP-OVERLAY K6 21/21); the tab's own legacy text first on every place (K10 172 places over en + de, F2 40/40); long topics hand over to the guide (F7, K11 35/35 rows ≤ 2000); a tenant's own text wins at once (K9); the same content inside REAL iDempiere by a migration script (W-CTXHELP-LEGACY 6/0). Legacy ships ONE topic (the Home welcome, id 200000). **Content sources measured as exhausted (2026-11-22):** our two guides are used whole; a Sonnet survey of 8 more guides (163 sections) found no core how-to (CapexUATGuide C1-C3 are a client UAT test script in tables, corrected by its own "Changes since" page: not help text); legacy's docs.idempiere.org states no licence ("Copyright © 2026 iDempiere" only) and wiki.idempiere.org refused the fetch (403): **not usable** until the owner confirms a licence.
**Shape:** PLAYBOOK C (FILM_NARRATION.md: before / after in the first 25 s, show then prove, one real event at the end, plain dark chapter cards with no voice) + the HOUSE STYLE (split screen, typed terminal strip above with REAL key sounds, voice after the return key) on the beats that type: the CLI `ask` and the legacy install. EN narration, F asks / M answers. Pictures: the REAL page headless (software GL), every value also printed as a `§FILM_SHOT` line; never pushed (script + log + spec only).
**Beats (each on-screen claim -> its proof):**
1. **Before / after (≤ 25 s).** Legacy's own Context Help window: 1 topic, the Home welcome (K1 legacy rows) · the twin, the same window, the same columns: 18 topics (K3 `Records = 18`). F: *"Same window?"* M: *"Same window, same tables. Legacy gave the container; we filled it."*
2. **Open Sales Order.** The right panel, unasked: the tab's OWN text first (legacy's words), a thin rule, then the steps (F2; `§HELP_CTX type=T id=186 shown=dict+msg`). Click **Order Line**: the panel follows the tab (F4; `id=187`), its own step. Click a tab with no topic: legacy's own text alone, as legacy does.
3. **One guide, not two.** Sales Order's topic ends with "Step 9 · Complete the order …" -> the guide opens at that step (F7; `§CTXHELP_FIT help=1000000 full=2450 kept=1635`). The owner's line, voiced: read it in the app, or the whole guide; it is the same text.
4. **Ask.** The question box: "How do I close a sales order?" -> the answer card (window, action, allowed-from) · split screen: the same question typed at the CLI (`red1`, `cd Order; ask "…"`), real key sounds (W-ERP-ASK).
5. **Languages: 中文, Deutsch, Español** (owner 2026-11-19). The tab's own text in that language (legacy's published packs); our topic in German / Chinese marked as the build session's translation, in Spanish still English (translations are FROZEN while the content grows; said in the voice, not hidden). Proof: K10 de_DE 89/89; the es row shape from W-CTXHELP-LEGACY L2.
6. **Your own words win.** A tenant admin edits a sentence in the Context Help window, Save: the panel shows it at once, System's row untouched (K9).
7. **Back to legacy users.** Split screen: the script copied into legacy's `migration/local_sql/postgresql/`, `RUN_SyncDB` typed; below, REAL iDempiere's own How To panel on Sales Order: the site's own text, then our topic (W-CTXHELP-LEGACY L1). F: *"In real iDempiere?"* M: *"Rows in its own tables. No code."*
8. **Close card:** same shape as legacy, nothing to relearn; offered to legacy users on our GitHub; roadmap card "not built yet": more topics (needs a cited source or the owner's licence word on legacy's docs), Oracle script, translations after the content freeze.
**⛔ ONE owner question before recording beat 7:** showing REAL iDempiere's panel needs the script APPLIED to a running legacy database and its ZK page shot. The only running one is the shared pilot (`idempiere_pilot`, :8088), which the parity bridge compares against our seed (W-LF): leaving our rows in it would show as a dictionary difference there. Options: (a) apply, shoot, then remove our rows by their UUIDs and reset the 21 links, witnessed (pilot back to 1 help / 0 links, LF PASS); (b) a separate throwaway copy of the pilot database with its own server; (c) drop the live shot and show the witness's numbers on a card.
**Gate:** record only on the owner's OK of this storyboard (FILM_NARRATION.md practice); numbers voiced from the run's own § lines, never from this file.
**OWNER OK (2026-11-22, chosen):** storyboard **"Record as is"**; beat 7 **"Apply, shoot, remove"**: apply the script to the pilot, take the shots, then remove our rows by their UUIDs (`erp/legacy/ctxhelp_targets.json` lists every `huu` / `muu`) and reset the 21 links (only those that hold OUR help), witnessed after: pilot back to 1 help / 1 message / 0 links, and `scripts/bridge/witness_lf_parity.js` PASS.
**§19.18 RESULT (2026-11-22): FILM MADE, `~/Videos/Knowledge_CMS_ERP_EN_AFTER_2026-11-22_v1.mp4` (165.4 s, 3,970 frames, EN voice + EN captions; never pushed). Scripts + logs: `scripts/film_ctxhelp_cms/` (copied from `film_help_showcase`, same pipeline).**
- **Pictures:** `shots.js` on bim-ootb main `eb389e01` (twin page, headless CPU): Context Help window Records = 18; Sales Order `§HELP_CTX id=186 howto=1000000 shown=dict+msg`, Order Line `id=187 howto=1000015 shown=dict+msg`, Order Tax `id=236 howto=none shown=dict`; the cut link "Step 9 · Complete the order …" and the guide's own page at that heading; the ask card (143 / CL); red1 `cd Order; ask` (ok, 143 / CL); zh_CN / de_DE / es_ES panels; a tenant's message saved as client 11 and shown at once (System's row 1,635 chars kept). `legacy_shot.js` (beat 7, owner: apply, shoot, remove): pilot clean before (1 / 1 / 0 links), script applied in one committed transaction (22 helps, 21 links), legacy's own lookup on tab 186 = our UUID, **legacy's ZK How To panel on order 82161 shows the tab's own text then "1 · Sales Order"**; then our rows removed by UUID, sequences and the 21 targets' `Updated` restored: **pilot back to its snapshot = true** (`§LEGACY_VERDICT PASS`).
- **Facts:** witnesses on the same tree: W-CTXHELP-OVERLAY 9/0, W-CTXHELP-LEGACY 6/0, W-ERP-ASK 15/0; PRs #3374 #3380 #3384 #3387 #3388 MERGED; MIT. `guard.js` VERDICT PASS (every spoken fact resolved; not-said list: no "live", no speed, no other languages, no "reviewed", no RUN_SyncDB claim).
- **Build checks (logs read):** `§FILM_DONE frames=3970 planned=3970`; every beat's voice fits with ~0.9 s slack (`§NARR_FIT`), question tones rise; **K2 PASS** 5 of 5 typed beats (voice after the return key, voice silent while typing, keys 19 dB under the voice); **captions C PASS** 32 cues; 253 key cues + 5 returns (real eklee / qubodup samples).
- **Defects found by the shots (not fixed here, named):** (1) the twin's guide link under a TENANT's message reads "docs/ERPUserGuide.md · Our own Sales Order rule" (the label takes the message's first heading, not the guide section's); (2) in legacy, our window-name links (`<a data-help-win>`, e.g. "Sales Order") render as links that do nothing (legacy has no handler); the F6 script should drop the attribute or carry a plain bold term.
**F6.1 SPEC (2026-11-22, owner: "yes fix the dead links"): no dead links in the legacy script.** Measured on main's script: the twin's window links `<a href="#" data-help-win="N">Name</a>` (36 × 181, 20 × 143, 16 × 184, …) reach legacy as links to `#` that do nothing (legacy has no handler); the guide links (`https://…` `target="_blank"`) work in legacy and stay. **Build:** `buildLegacySql` writes each `data-help-win` / `data-help-proc` link as a plain bold term (`<b>Name</b>`), the twin's own rows unchanged; the fit in SQL uses the new lengths (they are in the VALUES). **Claim (W-CTXHELP-LEGACY new L7):** after the apply, 0 of N messages and translations on the pilot hold a `data-help-` attribute or an `href="#"`, and every guide link is kept (count > 0). **Red:** `LEG_BREAK=oldscript` (main's script before F6.1) → L7 FAIL.
**F6.1 RESULT (2026-11-22): BUILT, bim-ootb #3391 (auto-merge on).** `buildLegacySql` `unlink`: window / process links become `<b>Name</b>` in the legacy script only (script: 0 `data-help-`, 256 guide links kept; the twin's rows file unchanged). README now links the script (view / download / folder), both guides, `ctxhelp_targets.json`, the witness and this spec (owner: *"put the links in the README, which can include the guides URLs too"*). **W-CTXHELP-LEGACY 7/0** on the pilot (L7 40 of 40 without a dead link; L1/L2's oracle = the twin's message with its window links as bold terms, the spec's rule); red `oldscript` L7 FAIL (34 of 40 dead), `nodict` L1 + L2 FAIL; pilot verified back to 1 help after each run. W-CTXHELP-OVERLAY node part 6/0. This closes the film's defect (2); defect (1), the twin's guide-link label under a tenant's message, stays open.
**F6.2 SPEC (2026-11-22, the film's defect (1)): the guide link's label names the guide SECTION, not the message's heading.** Measured (film shots): under a tenant's own message on Sales Order the link reads "docs/ERPUserGuide.md · Our own Sales Order rule": `_howtoCtx` labels it with the base message's first heading (`E.title`), which is the TENANT's text when their row wins. The link's URL is the help's `AD_CtxHelp.Description` (the first section's guide URL, F5), and the help's `Name` is its section titles joined with " + " (F5, System's row, a tenant edits only the message). **Build:** the label = guide file + " · " + the help's Name up to its first " + " (the section the URL points at). **Claim (W-CTXHELP-OVERLAY K9 widened):** after the tenant's save, the panel's guide link reads the help's first section title ("1 · Sales Order"), never the tenant's title; before the save it reads the same. **Red:** `CTX_BREAK=labelmsg` (the label from the message heading again) → K9 FAIL.
**F6.2 RESULT (2026-11-22): BUILT, bim-ootb #3398 (auto-merge on), erp sw v1127.** Label = `AD_CtxHelp.Name` up to its first " + ". **K9** (log read): the link reads "docs/ERPUserGuide.md · 1 · Sales Order" before the edit, after the save and after a reload; red `labelmsg` K9 FAIL ("· Our own Sales Order rule"). HELP-SHOWCASE 38/0; gen_manifest 58/58; precache 303/0. **Both film defects are now closed.**
**BUILD BRIEF for the recording session ("resume message, do film"):**
1. Read FILM_NARRATION.md `▶ PLAYBOOK C` + `HOUSE STYLE FOR ALL FUTURE FILMS`; copy `scripts/film_help_showcase/` (the EN v4 help film, §11) for the twin's page shots and `scripts/film_cli_in_action/` for the split-screen typed strip (real key samples `~/.local/share/film_narration/keys_eklee/`, check K2). New folder `scripts/film_ctxhelp_cms/`; work dir `~/Videos/ctxhelp_film_work/`; output `~/Videos/Knowledge_CMS_ERP_EN_AFTER_<date>_v1.mp4`. Never pushed: scripts, TSV, logs and this spec only.
2. Twin shots (headless, software GL, GardenAdmin, `idempiere.html?seed=ad_seed.db&login=GardenAdmin`): beats 1-6, each value printed as `§FILM_SHOT` (Records = 18; `§HELP_CTX ... shown=dict+msg`; the Order Line switch; the cut link; the ask card; zh_CN / de_DE / es_ES screens; the K9 edit). Legacy's own "1 topic" shot = the pilot's Context Help window BEFORE the apply.
3. Beat 7 on the pilot: legacy pilot up (`~/idempiere-pilot/start.sh`, :8088), apply the script with psql in its OWN transaction committed, restart is not needed for rows read per request (check: if the panel does not show them, restart the server, say so in the log), shoot the ZK How To panel on Sales Order (a headless browser on :8088; login as in the bridge scripts), then the removal SQL + its witness (pilot counts + LF PASS) BEFORE anything else. A failed removal stops the session and is reported.
4. Narration TSV EN (F asks / M answers), cues from measured segment starts; chapter cards silent 3.6 s; subtitles inside the bottom 230 px (capcheck); every number voiced from the run's own § lines.

### 19.19 SPEC: how-to content made from the dictionary and legacy's own recorded runs (2026-11-23; owner: *"I can't look into wiki now. Better infer or think anew from own research and learning to design content thereof"*)
**Issue it removes:** only **15 of the 124 core menu windows** have a how-to topic. Measured 2026-11-23 over the `ad_seed.db` menu subtrees Quote-to-Invoice 166, Requisition-to-Invoice 203, Open Items 236, Material Management and Pricing 183, Performance Analysis and Accounting 278, Financial Reporting 280 and the Accounting / BP / Material Rules 164 165 167, against the links in `erp/ad_ctxhelp_app_rows.js`. Legacy's own text does not fill the gap: 95 of the 124 windows have an `AD_Window.Help`, averaging about 170 characters, and only 29 go past 200. That text says WHAT a window is, never how to do the job or what it does to stock and books. Our guides are used up (§19.17), and the wiki is not reachable from here (403).
**Design (think anew, but every sentence traces to a row or a recorded legacy result; the wording is a template, the facts are extracted):** one topic per core window, up to four parts, each with ONE named source:
1. **Before you start.** The header tab's mandatory, editable reference fields with no default (AD_Reference 18 / 19 / 30), each naming the window that makes that record (`AD_Table.AD_Window_ID`, or `PO_Window_ID` for a buy-side window: legacy's zoom rule). For a setup window, the reverse: *"Needed by"* = the core document windows whose header has a mandatory reference to this table. Source: `ad_seed.db`. Rule measured on Sales Order (tab 186): the raw query also returns DocumentNo, TotalLines, GrandTotal and the Yes/No boxes, so read-only, computed, Yes/No (20) and sequence-numbered columns are left out. What remains is Target Document Type, Business Partner, Partner Location, Warehouse, Price List, Sales Representative and Payment Term.
2. **Do it.** The tab order (header, then lines), the line tab's mandatory fields by the same rule, then the Document Action that completes it (`AD_Ref_List` 135 names). Source: `ad_seed.db`. Documents only: **22 of the 124** core windows have a first tab whose table has a DocAction column (C_Order 2, C_Invoice 3, M_InOut 2, M_Inventory 3, then one each: C_Payment, C_AllocationHdr, C_BankStatement, C_BankTransfer, C_DepositBatch, GL_Journal, GL_JournalBatch, M_Movement, M_MovementConfirm, M_InOutConfirm, M_Requisition, C_DocTypeCounter).
3. **What Complete does.** Legacy's own outcome from the parallel run (`scripts/bridge/run_all.sh`, lines `§SCN_DETAIL <scenario> legacy={...}`). The newest log is `~/.cache/bim_bridge/run_20261117_021326.log`: 105 scenarios, 80 MATCH, 78 detail lines. A topic states which documents Complete makes, the change in stock / reserved, credit and open balance, and the postings with account value + name (`C_ElementValue` id → Value, Name; the log carries ids, e.g. `509:DR300/CR0`). **Only from a scenario whose verdict is MATCH**, so the twin is proved to do the same. No such scenario = the part is left out and counted, never guessed. The run covers 9 of the 16 document tables (C_Order, C_Invoice, M_InOut, M_Inventory, C_Payment, C_AllocationHdr, C_BankStatement, M_Movement, M_Requisition).
4. **When it refuses.** Legacy's own refusal text, verbatim from `legacy.reason` in the `§SCN_DETAIL` line of a REJECTED scenario on that table (e.g. S13b: *"Business Partner with this Order over Credit Hold"*). It names the window from part 1 that fixes it when the reason names a field or record. **Measured trap:** a scenario's NAME is not its cause. S8b is named "pos-sale-date-without-period", but legacy's reason is *"Product is not on Price List"*. So the text comes from legacy's reason only, never from the scenario label.
- Footer: the guide section link when one exists (F7 fit), and *"From the dictionary and a recorded legacy run of <date>"*. This is our MIT text; no wiki text is mixed in (the 2026-11-23 licence rule in RESUME applies only if wiki text is ever copied).
- **Shape and size:** one AD_CtxHelp per window (CtxType T on the first tab), the parts as paragraphs of ONE AD_CtxHelpMsg, inside MsgText's 2000 (F7). An existing hand topic (the 15) keeps its text first and gains only the parts 3-4 it lacks. Translations stay FROZEN (owner 2026-11-19); English first.
**Claims (witness W-CTXHELP-DERIVED, each with a falsifier):**
- D1 coverage, X of N: parts 1-2 on N = 124 core windows (part 2 on N = 22), part 3 on the documents with a MATCH scenario, part 4 on the tables with a REJECTED one. Every gap is printed as `VACUOUS <window> <part> no-source`, never hidden.
- D2 trace: every field name, window name and account in a topic equals its dictionary row, and every part 3-4 fact equals the `§SCN_DETAIL legacy` value it cites (scenario id + run log name). Falsifier: change one posting amount in a copy of the log → FAIL.
- D3 MATCH only: a SQLITE-GAP scenario contributes nothing. Falsifier: admit a SQLITE-GAP scenario (the 2026-11-17 log has 25) → FAIL.
- D4 reason, not label: part 4 text never contains a scenario name. Falsifier: use the label → FAIL on S8b.
- D5 fit: every message is at most 2000 characters (K11 already checks this).
- D6 the run is fresh: the log is newer than the last change to `scripts/bridge/cycle_*.js`, or the build refuses (`STALE-RUN`).
**Pilot first:** Sales Order (143) and Price List (a setup window, part 1 "Needed by"). Then the rest in one generator pass. The built topics reach legacy users through the F6 legacy script unchanged.
**Not in this item:** the 102 setup windows get parts 1-2 only. A deeper "why" text per setup window has no extractable source and stays out.

### 19.19 AMENDED (2026-11-23, owner mid-build: *"U be drawing from the rich info in the source code that governs each DocAction?"*): legacy's DocAction source is the RULE source, the recorded run is the PROOF
- **Why:** the run only shows what a scenario happened to exercise (9 of the 16 document tables); legacy's model class holds every rule. Measured on `MOrder.prepareIt()` / `completeIt()` (iDempiere `87968daa73`): 9 refusal messages with words of their own, 11 dynamic ones (a validator, a StringBuilder, the credit manager), and the Complete effects per document subtype.
- **Part 3 (what Complete does)** = `erp/tools/legacy_effects.json`: each effect read from the source BY HAND, cited by file + line + token; `legacy_rules.js` refuses the build when a cited line no longer holds its token (`§LEGACY_RULES_DRIFT`). Subtypes are AD_Ref_List 148 names, flags AD_Element names, read from the legacy DB. **Never "the rest":** a first draft said every other subtype reserves stock; the code says Proposal reserves nothing (`MOrder.java:1931`), Quotation completes early and reserves (`:2124`, `:2129`), Prepay waits for payment (`:2141`, `:2145`). Each is its own cited effect.
- **Part 4 (when it refuses)** = every `m_processMsg = …` with a literal in the class's `prepareIt` / `completeIt` (legacy_rules.js, Msg.translate's rule: AD_Message, else AD_Element, `Msg.java:670-690`), then the messages a legacy run showed that the class has no literal for (the credit manager's). A legacy reason is matched to legacy's own AD_Message: the LAST of the largest messages found inside it (legacy writes `<wrapper>: <cause>`; the longest match was the wrapper "Failed when processing document" for S8c, whose cause is "Period Closed").
- **✓ = seen in a legacy run:** an effect or message gets the mark when a MATCH scenario of that subtype shows it (`shipments_completed >= 1`, `invoices >= 1`, order-line `reserved = ordered`). "No shipment was made" was rejected as a proof of reservation; `ol_qty` (O2C1-SO, 2/2/0/0) is the proof.
- **Order in a message:** the derived section comes first in English (it has no other home; a guide section cut at the limit keeps its guide link, F7). In a TRANSLATED row the reader's-language sections come first, then the English ones: new English content must never push out text already translated (W-HELP-SHOWCASE S7 / S7de caught exactly that on the first build).
- **Run facts** (`run_facts.js`): only scenarios whose log names their table + document type (`§SCN_META`, new in `witness_m3_gap.js` / `cycle_o2c.js`, read from the descriptor the legacy push used). The sha256 of those two files is recorded; D6 is INCONCLUSIVE (STALE) until bim-compiler master holds the same code.

### 19.19 PILOT RESULT (2026-11-23): BUILT, bim-ootb #3412 (merged), Sales Order (143) + Payment Term (141)
- **Run:** `witness_m3_gap.js` with §SCN_META on the legacy pilot, log `~/.cache/bim_bridge/run_20261123_124747_m3meta.log`: 83 scenarios (66 MATCH, 17 SQLITE-GAP), 24 with §SCN_META. Its one harness FAIL (`§F9_NEGATIVE_CONTROL`) is the same on the 2026-11-17 log: not from this change, left to the parallel-run lane.
- **Facts:** `§RUN_FACTS kept=24` (C_Order 12 COMPLETED + 8 REJECTED MATCH, 1 SQLITE-GAP; one each M_InOut / C_Invoice / C_Payment); refusals matched to legacy messages 7, none for S4 (a synthetic product id: no message, so no text).
- **Rules:** `§LEGACY_RULES C_Order refusals=9 dynamic=11`, 7 effects, 13 cited lines, all token-ok.
- **Sales Order topic (help 1000000, 1,971 of 2,000 chars):** Before you start (Target Document Type, Business Partner, Partner Location, Warehouse, Price List, Sales Representative, Payment Term, each linked to the window that makes it) · Do it (Order, Order Line, Order Tax, Payment Schedule, POS Payment; then Complete) · What Complete does, 7 lines, 3 with ✓ (shipment: 8 POS runs; invoice: 8 POS runs; Standard Order reserves: O2C1-SO) · When it refuses, 11 legacy messages, 3 with ✓ (Period Closed, Product is not on Price List, Business Partner with this Order over Credit Hold). The guide sections that followed (1 · Sales Order, Step 7, Step 9) now end in the guide link (cut at UG1); in de_DE / zh_CN the translated guide text stays first and the English derived part is cut instead.
- **Payment Term topic (help 1000017, new, tab 184):** Needed by Sales Order, Invoice Payment Schedule, Purchase Order, Purchase Invoice and Credit/Debit Note, Sales Invoice and Credit/Debit Note · Do it (Payment Term, Schedule, Translation). Part 1 "before you start" is VACUOUS (no mandatory reference on its header), logged.
- **Witnessed (logs read):** W-CTXHELP-DERIVED D1 D2a D2b D2c D3 D4 D5 PASS, D6 INCONCLUSIVE (STALE until the §SCN_META commit is on master); its 6 reds each FAIL their own claim (facts→D2a, srcline→D2b, quote→D2c, nogate→D3, label→D4, long→D5). W-CTXHELP-OVERLAY K1-K11 PASS after teaching it the derived sections (K6/K7 expected text, K7 order); reds dropsec→K6, nodictfirst→K10, nofit→K6/K7/K11 still FAIL. Two witness misreads fixed: K10 "a before b" found a title equal to the tab's own name at the top (Payment Term); K7 judged links in the section where a cut row stops. W-CTXHELP-LEGACY 7/0 on the pilot (21 judged + L5's tab), pilot back to its snapshot (1 help, 0 links). W-HELP-SHOWCASE 38/0.
- **Next:** (1) the rest of the 124 core windows in one pass: every document table's class (22 windows, 16 tables), each needs its own cited effects read from its `completeIt` (no "the rest"); the setup windows get parts 1-2; (2) §SCN_META for the other corpora (MV, PAY, INV, PI, REQ, CASH, GLJ, BS) so their runs can prove; (3) the VS Code link idea (owner, "just thinking, don't prep yet"): a source cite could open `vscode://file/<path>:<line>` when a dev setting names the local source, legacy's line and the twin's own.

### 19.19 FULL PASS RESULT (2026-11-23): bim-ootb #3415, all 124 core windows, 21 documents (owner: "Go")
- **Run:** every scenario's legacy push now logs `§SCN_META` (BIMCompiler #1206: a `createLink` wrapper records table + doc type from the descriptor and payload; the scenario's document = its LAST push). Log `run_20261123_142109_m3metaall.log`: 55 of 83 scenarios carry it (was 24), 12 tables; verdicts unchanged (66 MATCH / 17 SQLITE-GAP), `§F9_NEGATIVE_CONTROL` the same pre-existing harness FAIL. The run needs `BRIDGE_OOTB=<a bim-ootb tree at origin/main>` (`§OOTB_STALE` otherwise).
- **Rules:** `legacy_rules.js` over the 16 document tables of the core menu: refusals C_Order 9, C_Invoice 12, M_InOut 18, M_Inventory 9, C_Payment 10, C_AllocationHdr 3, C_BankStatement 1, C_DepositBatch 1, GL_Journal 8, GL_JournalBatch 3, M_Movement 11, M_MovementConfirm 5, M_InOutConfirm 3, C_BankTransfer 0, M_Requisition 0; C_DocTypeCounter has no DocAction methods, so its window is a setup window (`docaction` in the rules file decides, not the DocAction column).
- **Effects (77, 129 cited lines, all token-checked):** read by three Sonnet agents (finance, material, GL + requisition: 67 + 62 + 53 candidates, each token script-checked), then CURATED here to what a user notices (documents made, stock / reservation / delivered / invoiced, balances, matching, reconciliation, the next action); internal steps, duplicates of part-4 messages and one that depends on a system setting (CASH_AS_PAYMENT) were dropped. Conditions are any column `{column, table, values}`; names from that column's AD_Ref_List (Yes/No = element + Yes/No; an _ID column = with / without; another table's column is prefixed with that table's name). Line-quantity conditions (scrap / difference inventories of the confirmations) are not document-level and were left out, named.
- **Side:** an effect shows on a window when some doc type with that value has the window's IsSOTrx (an IsSOTrx condition: its value). Legacy's own data has purchase doc types with DocSubTypeSO WP / WR ("Warehouse Purchase Order", "Point of Purchase Order"), so the auto-shipment / auto-invoice lines rightly show on Purchase Order. **A ✓ comes only from a run on the window's own side** (the first build put POS sales proofs on Purchase Order).
- **✓ = seen in a legacy run:** 24 marks (16 effect lines + refusals), proofs added for delivered = ordered, reserved = 0, invoiced = ordered, BP open balance / credit used up, receipt-invoice match, PO match, stock out / in of a movement, physical inventory stock change, bank balance change, requisition total.
- **Found and fixed by the witness:** legacy's message `* Not found * Invoice` was turned into italics by markdown; quotes are now HTML-escaped only (D2c). A run reason matched the label "Error:" (a wrapper ending in ':'); such messages are no longer causes. AD_CtxHelp.Name past 120 characters now keeps whole names + " + N more" (never shown; the title is MsgText's first paragraph).
- **Size:** each derived section fits MsgText (2000) less 200 for its title and one guide link; a long refusal list keeps the run-proven ones first and ends "and N more in <Class>.java" (Shipment 9 of 18, Material Receipt 10 of 18). Rows file 224 KB (was 51 KB), legacy script 966 KB (was 233 KB).
- **Trade-off, unchanged from the pilot:** where a guide topic exists, the English message now starts with the derived section and the guide text ends in its link (cut at the guide section); a translated row keeps its translated sections first.
- **Witnessed (logs read):** W-CTXHELP-DERIVED 8/0 over 124 windows (D1 124 of 124, D2a 55 of 55, D2b 129 of 129, D2c 151 quotes + 188 links, D3 24 ✓ → 0 when every verdict is flipped, D6 same code as master after #1206); reds facts→D2a, srcline→D2b, quote→D2c, nogate→D3, label→D4, long→D5 (the reds now break the LONGEST message: doubling a short setup window still fit). OVERLAY / LEGACY / SHOWCASE: see the PR.
- **Gaps, named:** standard Purchase Orders (no DocSubTypeSO) get no Complete line (their `reserveStock` path updates ordered stock; not yet cited); scenarios without a document push (NEG controls) carry no META; C_Cash / DD_Order / C_ProjectIssue runs are outside the core menu.
- **Search ranking kept (W-HELP-SHOWCASE S6 / S6de caught it):** `help_search.js` breaks a tie inside a tier in favour of "a window whose how-to covers it", then the one whose how-to is its OWN. With a derived topic on every core window that signal said nothing: "complete an invoice" went to Invoice Schedule, then (after the first fix) to Purchase Invoice / Matched Invoices. Now only a how-to that links a WRITTEN guide counts (a derived-only help's AD_CtxHelp.Description is NULL: it has no guide), and "own" = how many windows share the same guide section (its URL), not how many tabs the help is linked from (a help is now one per window). Showcase 38/0 again.
- **Speed kept (W-HQ-COST C1b caught it):** 130 helps made the ERP help index build 25 s for all languages (main 4.3 s, budget 10 s): `ctx_help.howto` read each help's message and translation with its own queries. `msgsAll` reads them in two queries with legacy's same order rule; all languages now build in 1.6 s.
- **Pre-existing on main, not from this work:** W-HQ-DYM D4 (a pick opens window 1000000 in the ERP; the Viewer half also fails on main), `§F9_NEGATIVE_CONTROL` in the parallel run.

### 19.19 PO LINE RESULT (2026-11-23): bim-ootb #3416 (merged), erp sw v1132
- The standard Purchase Order (DocBaseType POO, no SO Sub Type) now says what Complete does: adds the ordered quantity to the warehouse's ordered stock (MOrder.java:1656 `!evalAutoGenerateInOutRule`, :2008 `MStorageReservation.add(... isSOTrx ...)`), ✓ from F9-PO and P2P1-PO (line ordered = reserved). Conditions take `{and: [...]}` and an empty value ('' = "no <element>"). 78 effects, 25 ✓. W-CTXHELP-DERIVED 8/0, OVERLAY 9/9, LEGACY 7/0, SHOWCASE 38/0, HQ-COST 86/0 (a run under load timed 24.9 s once; alone 1.2 s).

### 19.20 FILM STORYBOARD v2: "Read from legacy's own code" (2026-11-23; owner: *"How much more before we can make a film showing this new stuff off?"*)
**Is it substantial (measured):** 124 of 124 core windows have a topic (W-CTXHELP-DERIVED D1); 21 documents say what Complete does from 78 effects read in legacy's DocAction source, each cited by file + line and token-checked (D2b); legacy's own refusal messages quoted exactly (D2c); 25 marks ✓ = a MATCH legacy run on the same side showed it (D3: 0 when the verdicts are flipped). v1 showed the container filled from our guides (18 topics); v2 shows every core window filled from LEGACY ITSELF.
**Shape:** as v1: PLAYBOOK C (before / after in the first 25 s, show then prove, one real event at the end, silent chapter cards) + HOUSE STYLE (split screen, typed strip with REAL key sounds, voice after the return key). EN only, F asks / M answers. Pictures from the real twin page headless (software GL), every on-screen value also a `§FILM_SHOT` line. Pipeline = `scripts/film_ctxhelp_cms/` (v1), copied to `scripts/film_ctxhelp_derived/`. Never pushed: scripts, TSV, logs and this spec only.
**Beats (claim -> its proof):**
1. **Before / after (≤ 25 s).** Legacy's Context Help window: 1 topic · the twin's: `Records = 130` (K3). F: *"All of them?"* M: *"Every window of the trade cycle and the books: 124."*
2. **Sales Order, unasked.** The panel: Before you start (each record links to the window that makes it), Do it, What Complete does per order type, When it refuses. (`§HELP_CTX id=186`, the section text = `derivedSections` output.)
3. **"Who wrote this?"** Split screen: typed `sed -n 2178p MOrder.java` (real keys) shows `evalAutoGenerateInOutRule(DocSubTypeSO…)` beside the panel line "POS Order: also creates and completes the shipment ✓". M: *"Legacy did. We read its code and cite the line; a moved line fails the build."* (`§LEGACY_EFFECT C_Order.CO.shipment MOrder.java:2178 token-ok`.)
4. **"And the tick?"** Typed `grep S1-pos-sale run.log`: legacy's own result `shipments_completed:1`. M: *"A tick only where real iDempiere did it in a recorded run, and our twin did the same."* (D3.)
5. **Refusals in legacy's words.** The refusal list on Sales Order: "Period Closed ✓", "Business Partner with this Order over Credit Hold ✓"; the run's line for S13b typed. M: *"Its own message, word for word."* (D2c.)
6. **Honest about the other side.** Purchase Order: the same lines, one ✓ (the standard purchase order, from purchase runs); the sales-only ticks are not borrowed. F: *"Why fewer ticks?"* M: *"A tick needs a run on that side."*
7. **Any window.** Business Partner (a setup window): "Needed by" lists the documents that ask for one; a click goes there. Shipment: stock out, reserved down, delivered = ordered ✓, "and 9 more in MInOut.java".
8. **Back to legacy users (one real event).** As v1 beat 7: the script applied to the legacy pilot, REAL iDempiere's How To panel on Shipment (Customer) shot, then our rows removed by UUID and witnessed (pilot back to 1 help / 0 links, LF PASS).
9. **Close card:** 124 windows, 78 cited effects, 25 ✓; not built yet: ticks for the rest (more recorded runs, purchase side, confirmations), translations of the new text (frozen), the VS Code link (idea only).
**Gate:** record only on the owner's OK; beat 8 needs the owner's word again (apply, shoot, remove on the shared pilot, as for v1). Numbers voiced from the build's own § lines at recording time, never from this file.

**§19.20 OWNER OK (2026-11-24, verbatim):** *"Yes"* (the storyboard as written, and beat 8: apply, shoot, remove on the shared pilot).
**§19.20 RESULT (2026-11-24): FILM v2 MADE, `~/Videos/Knowledge_CMS_ERP_EN_AFTER_2026-11-24_v2.mp4` (171.2 s, 4,108 frames, EN voice + captions, -16.5 LUFS; never pushed). Scripts + logs: `scripts/film_ctxhelp_derived/` (v1's pipeline; shots, cards, narration, guard, legacy shot rewritten; `pilot_witness.sh` new). Built by a Sonnet agent on the owner's OK; the checks below were re-read by the parent session.**
- **Shown (each from the page's DOM, a real command or a log):** legacy's Context Help 1 topic vs the twin's `Records = 131` (130 ours + legacy's Home topic; the brief said 130, the film says what the page says); Sales Order's four parts (7 prerequisites linked, 7 Complete lines with 3 ✓, refusals with 3 ✓); typed `sed -n 2178p MOrder.java` = the cited line of `C_Order.CO.shipment`; typed `grep S1-pos-sale` = legacy `shipments_completed:1`, MATCH; typed `grep S13b` = legacy's own credit-hold reason, the same quote ✓ in the panel; Purchase Order 4 lines, 1 ✓; Business Partner "Needed by" 8 documents, a click to Shipment (Customer) "and 9 more in MInOut.java"; REAL iDempiere's ZK panel on a shipment: the tab's own text, then ours (script applied: 131 helps / 130 links).
- **Checks (logs read):** `§FILM_GUARD VERDICT PASS`; `§FILM_DONE dur=171.167 frames=4108 planned=4108`; `§K2_VERDICT PASS beats=5 bad=0`; `§CAPTION_VERDICT PASS cues=35`; W-CTXHELP-DERIVED 8/0 at recording time. **Pilot after the removal:** ad_ctxhelp 1, tab links 0, process links 0 (`§PILOT_VERDICT PASS 1/0/0`, re-checked by the parent session), `§LF_VERDICT PASS fails=0` (the LF witness reads `BRIDGE_UI_DB`, not `BRIDGE_OOTB`; its rewritten tracked `scripts/bridge/out/lf_patch_ad_ref_list.sql` was reverted).
- **Found by the film (named):** (1) **FIXED** (bim-ootb #3421, merged, erp sw v1133): Purchase Order's refusal list carried ✓ from SALES runs; the same-side rule now applies to refusals too, and W-CTXHELP-DERIVED **D7** (every cited run on the window's own side) guards it: 42 of 42, red `side` FAIL, and it FAILS on main's builder (8 sales runs on window 181). (2) Legacy's `MCtxHelpMsg` cache (MCtxHelpMsg.java:51, no expiry) keeps a tab's help text after our rows are removed: the pilot's ZK page still shows our Shipment text with the DB clean until the pilot server restarts (not restarted: shared; owner's call). The voice never says "fresh". (3) The guides do not describe this panel yet (close card names the gap).

**§19.20 v2b (2026-11-24), owner (verbatim):** *"The film is not that clear what belongs to legacy, and what is added to it from the Kernel. Can u just add a card with table, after opening card, 'CtxHelp Content Added to Legacy from Kernel ERP'. Thus need not redo film. Just insert that card in table also shows pending"*.
**RESULT: `~/Videos/Knowledge_CMS_ERP_EN_AFTER_2026-11-24_v2b.mp4` (183.2 s, 4,396 frames; v2 kept).** `scripts/film_ctxhelp_derived/insert_card.js`: ONE silent 12 s table card (Legacy iDempiere | Added from Kernel ERP, nine rows + Pending) spliced after the cover (t = 4.5 s, measured silent, -91 dB); every figure from the film's own `out/facts.json` (1 legacy topic; +130, 126 tabs + 4 processes, 131 after the script; 0 table changes; 124 of 124 windows; 78 effects, 131 of 131 cited lines). `§INSERT_CARD_VERDICT PASS`: frames 4,108 + 288 = 4,396 as planned, the card -91 dB, and at three later windows the peak and mean level equal v2's 12 s earlier (within 0.5 dB, re-encoded). The card prints no tick count on purpose: the close voices "twenty-five ticks", true at recording; after the refusal-side fix (#3421) the live product has **21** (the 4 were Purchase Order's borrowed refusal ticks). Correcting the voice needs only the close beat re-voiced (owner's call).

### 19.21 SPEC: the help PEEKS AHEAD: press `?` and it checks the document on screen, marks the fields, lists every blocker, and fixes what it can (2026-11-24)
**Owner, verbatim:** *"Why not the Help 'peeks ahead'? Can it do on screen checking and mark red on the fields and the Help panel giving details? This is when ? is pressed."* · *"And this be abstract? Is there prior art for this?"* · *"Yes, write the spec and i wana match Business Central. Also recommend fix, can we do further by fixing it (done abstractly)?"* · *"then list down how many windows and fields are affected and how many fixme also. Let's see the big picture"*.
**Supersedes RESUME items 2 and 3** (the "Make sure" list and the fix tips). A static list only moves legacy's message earlier (owner: *"I still don't see big diff"*). The peek judges THIS document and points at the field.
**Twin rule:** this is an ADDED, kernel-side behaviour in the owner's own words. Legacy's look stays unchanged until `?` is pressed, and Complete itself does not change. Field marks reuse the twin's existing field style for an invalid or mandatory value (found at S1 build time and cited). No new visual language.

**Prior art (read 2026-11-24, re-check before printing in a film):**
- Microsoft Dynamics 365 Business Central, **Journal Check FactBox** (2020 wave 2; documents and journals 2022 wave 1). It checks in the background on load and when you change lines, gives an issue count, lists the issues, has **Show Lines with Issues**, and still checks again at posting. Its rationale: *"based on product telemetry that shows where people often experience issues … validations that can help prevent issues with posting before they happen"*. Source: learn.microsoft.com, dynamics365-release-plan/2020wave2/…/check-financial-journals-background and 2022wave1/…/check-documents-journals-background.
- Business Central, **actionable errors** (2023 wave 1): the Error Messages page has a **Recommended action** column, and **Accept recommended action** fixes the selected issues. A fixed issue shows *Fixed*, and one failed fix does not stop the others. Its rule: *fix-it actions are recommended where the system knows the correct value*; other errors get **Show-it** (a link to the page that fixes it). Sources: release-plan 2023wave1/…/get-unblocked-using-actionable-error-messages; dev-itpro devenv-actionable-errors.
- Business Central **Test Report** before posting (lists the errors in a sales or purchase document). SAP ME21N **Check** button (runs the save checks on demand; BAdI ME_PROCESS_PO_CUST~CHECK runs on save and on Check).
- iDempiere: none found. A refusal surfaces only when Complete runs (`DocumentEngine.processIt`, `m_processMsg`).
- **What ours adds:** the peek runs the SAME ported Complete code in a trial that is thrown away, so the peek and Complete cannot disagree (BC runs separate checks). It also marks the field on screen.

**Mechanism (ONE generic module, no table names: AD-LAYER LAW):**
1. **Which windows:** a window whose first tab's table has a DocAction class (`model_layer.js` `docImpl(table)`, the same rule `legacy_rules.js` uses). N = **21 core document windows over 15 tables** (C_DocTypeCounter has no DocAction methods). A Ninja-staged document gets the peek with zero code (its generic M class, `model_layer.js:662`).
2. **The trial:** a fresh `Trx` (`model_layer.js:88`, an in-memory unit of work: `ops` + `pend`). It applies the form's unsaved values through the normal save path, then `processIt(trx, table, id, 'CO')` (`model_layer.js:715`, legacy `DocumentEngine.processIt` :301-360). The Trx is never committed: it is dropped, and observers are queued only on commit (`model_layer.js:928`). Posting runs inside the trial too (`env.noPost` is NOT set), so the posting-time refusals are seen.
3. **Which message:** the class returns legacy's message with its keys (`'@BPartnerCreditHold@ - …'`, `model_order.js:431`), so the key is read directly. It is never matched from translated text.
4. **Every blocker, not only the first (BC parity):** legacy stops at the first refusal. The peek then applies that message's **trial assumption** (a data row: "assume <table.column> = <value>", e.g. "assume the period is open") inside the same throwaway Trx and runs again, until Complete passes or a blocker has no assumption row. The assumptions are used only to look further and are never applied for real. When the list stops at a blocker without one, the panel says so: *"fix this first; more checks follow it"* (the honest gap, counted).
5. **Which field:** (a) the message names it itself (`@FillMandatory@@M_Shipper_ID@`, a line number → that line); (b) otherwise one row in a reviewed table, message key → `{table, column}`, the column the check reads, cited by legacy file:line + token (the `legacy_effects.json` pattern, refused on drift as `§LEGACY_RULES_DRIFT`); (c) "No Document Lines found" marks the Lines TAB; (d) an internal fault marks nothing.
6. **Show-it (every blocker that names a field or record):** open the window that fixes it, with that record: the column → its table → `AD_Table.AD_Window_ID` / `PO_Window_ID` (legacy's zoom rule, already used by "Before you start"). Gated by the role's window access, as the menu is.
7. **Fix-it (BC's rule = the PRIME RULE: only where the data gives ONE correct value):** a row `{message key, column of THIS document or line, value = <expression over the document's own data>}`, cited to the legacy line that defines "correct" (e.g. GL Journal: Control Amount differs from Balance → Control Amount := the balance the check computed). The fix is applied through the normal field-change path (callouts run, as if typed). It never saves (the user saves) and never changes another record. **Accept recommended action** applies every offered fix, marks each *Fixed* or *Failed*, and peeks again. A value with two or more candidates is never a fix; it is a Show-it.
8. **Panel text, principle first (owner: "be abstract"):** heading *"Ready to complete"* or *"Before you complete: N to fix"*; each item = our plain wording of the check + the document's own values from the message (e.g. open balance and limit), then the Show-it link and, where one exists, the Fix button. No "refuses", no "not complete" (owner 2026-11-24). Legacy's message stays as the trace in the wording table (whether it is shown in small print: asked once, unanswered; default not shown).
9. **When:** on `?` (owner). The background check while you work (BC parity: on load and after each save or line change, a count on the help button, *Show lines with issues* filtering the line grid) comes after `?` works, with its cost measured first (a `§HELP_PEEK ms= heap=` line per run, PERF BUDGET).

**Big picture (measured 2026-11-24 from `erp/tools/legacy_rules.json` + `ad_seed.db`; the classification is a FIRST PASS from the message text, each row confirmed against its source line in the build):**
| Group | Checks | What the peek does |
|---|---|---|
| A. Fixable on THIS document, a field to mark (15 on a line, 18 on the header) | 33 | red field + Show-it; Fix-it where one value |
| B. Fixable in another window (6 × Period Closed, accounting / doc-type setup, open confirmation, stock coverage, cash book, payment processor) | 16 | Show-it to that window (role-gated) |
| C. "No Document Lines found" (one per class but Payment) | 12 | mark the Lines tab |
| D. Internal faults (could not create / update / insert, tax / stock errors) | 32 | listed, no field, no fix |
| **Literal checks over 15 tables (Bank/Cash Transfer and Requisition have none)** | **93** | |
| Computed messages (validators 47 = plugins' own checks, no fixed text; 57 others, e.g. credit hold, product not on price list) | 104 | the peek RUNS them all (same code); field/fix rows only for the ones a recorded run showed (credit, price list), more as found |
- **Fix-it, first pass: 4 likely** (GL Journal and GL Journal Batch: Control Amount := balance; Payment: Payment Amount := sum of allocations; Allocation: date := the latest of the allocated documents' dates), **2 conditional** (Shipper; Payment document type, only when exactly one valid value exists), **3 owner questions** (Back-Date transaction not allowed on Shipment, Inventory Move, Move Confirmation: is "today" the correct value?), and **1 to read** (order line Date Promised). Everything else is Show-it: BC's own split.
- Windows: Sales Order, Purchase Order · Sales Invoice, Purchase Invoice, Invoice Payment Schedule · Shipment (Customer), Material Receipt · Inventory Decrease/Increase, Physical Inventory, Cost Adjustment · Payment and Receipt · View Allocation · Bank/Cash Statement · Bank/Cash Transfer (0 literal checks) · Payments into Batch · GL Journal · GL Journal Batch · Inventory Move · Move Confirmation · Ship/Receipt Confirm · Requisition (0 literal checks).

**Steps (one PR each, WORK-TO-ZERO):**
- **S1** the peek on `?`, every blocker found by the trial-assumption loop, field / line / tab marks, the panel, Show-it. All 21 windows at once (it is generic), X of N printed.
- **S2** Fix-it + Accept recommended action (the 4 likely + 2 conditional; the 3 Back-Date rows only on the owner's word).
- **S3** the background check (count on the help button, Show lines with issues), after the cost is measured.
- **S4** the guide section (RESUME item 1) describes the peek; film v3 rebuilt around it (Now: legacy stops at Complete · Ours: `?` shows every blocker with the field marked, one click to fix).

**Claims (witness W-HELP-PEEK, each with a falsifier):**
- **P1 nothing changes:** after a peek on every document window's sample record, the ERP DB, op log and DocStatus are byte-equal (hash before / after). Red `commit` (commit the trial) → FAIL.
- **P2 the peek = Complete = legacy:** for every recorded REJECTED MATCH scenario (run facts), the peek's FIRST blocker key = the key the real Complete returns = legacy's reason (AD_Message); for every COMPLETED MATCH scenario the peek says Ready. Red `stale` (peek from a copy of one class with a check removed) → FAIL.
- **P3 all blockers:** a record seeded with k known problems (period closed + product not on price list + credit hold) lists k, in legacy's order. Red `noassume` (assumption rows off) → lists 1 → FAIL.
- **P4 assumptions stay in the trial:** each assumption row cites a legacy line (token-checked), and P1 holds with all of them used. Red `leak` → FAIL.
- **P5 the mark:** every blocker with a field row marks that field in the DOM (field, line row or tab), X of N rows; an empty population prints VACUOUS. Red `nomark` → FAIL.
- **P6 Show-it:** each link opens the window and record of the zoom rule, X of N. Red `wrongwin` → FAIL.
- **P7 Fix-it:** offered only when the value's expression gives exactly one value; after Accept, a new peek no longer lists it; nothing is saved until Save. Red `multi` (offer a fix with two candidates) → FAIL; red `autosave` → FAIL.
- **P8 generic:** the peek module holds no table-name literal (scan), and a Ninja-staged document type gets the peek with zero code. Red `branch` (a `'c_order'` branch) → FAIL.
- **P9 cost:** `§HELP_PEEK ms= heap=` on every run; S3 needs a budget set from the S1 measurement.
**§19.21 OWNER DECISIONS (2026-11-24, verbatim):** *"Automatic should default to easiest as it is user's choice. If wrong, user can undo and give desired value and this time user knows."* · *"I assume that any window panel tab is easy to call by URL. In our kernel we should not have issue. Legacy?"*
- **Fix-it rule AMENDED (replaces "a value with two or more candidates is never a fix"):** a Fix-it may set the EASIEST valid value of a field on THIS document (e.g. Back-Date transaction not allowed → today; a mandatory lookup → its first valid value in legacy's own lookup order). Each row names its rule, cited. Safety stays in the data: a fix is offered only when the trial, with that value applied, no longer hits that check (proved before it is shown). The panel names the value it set (*"Date set to 2026-11-24"*), so the user knows. Undo = legacy's own toolbar **Ignore / Undo Changes** (`idempiere.html:2027`), or the user types another value. Still never another record and never a save. P7 changes: red `multi` is replaced by red `unproven` (a fix whose trial still hits the check is offered → FAIL). The Back-Date rows (3) are fixes now; the fix-it count is recounted at S2 under this rule.
- **Links by URL, measured:** *Kernel:* `idempiere.html?window=<id>&record=<pk>` opens a record after login (`idempiere.html:1278-1281`, `_zoom`), `?process=<id>` a process; inside the page the panel needs no URL (`_zoom(w, null, rid)`, `goTab(idx)`, `:2182`). A tab or field in the URL does not exist yet: S1 adds `&tab=<AD_Tab_ID>&field=<column>` in the same generic handler (one place, every window). *Legacy:* iDempiere opens a record by URL after login, `webui/index.zul?Action=Zoom&AD_Table_ID=<id>&Record_ID=<id>` (or `TableName=`, `Record_UU=`) (`AdempiereWebUI.java:403-430` processParameters, called at :397 after login; `AEnv.zoom` picks the window by legacy's zoom rule). It takes no tab and no field. So the legacy migration script (F6) can carry Show-it links at record level. The PEEK itself (trial, red fields, every blocker) does not exist in legacy: bringing it there means a legacy plugin (an OSGi bundle in the ZK UI), a separate lane on the owner's word, not part of S1-S4.

- **Owner, 2026-11-24 (verbatim):** *"Nothing further that needs code for legacy, other than CtxHelp text. What i mean by '?' is it is the CtxHelp shortcut key which opens the panel that has the peeking. To run those will need a simple > play button there."* **So: (1) WHEN = a ▶ button in the How To (CtxHelp) panel** (`idempiere.html` ~:3120, the panel `?` opens); opening the panel runs nothing, the user presses ▶ to peek. This replaces mechanism step 9's "on `?`". Step S3's background check stays a later, separate step. **(2) Legacy = CtxHelp text only**, via the F6 script (with record-level Action=Zoom links where they help); no legacy code, and the plugin line above is closed. At S1, locate and cite the key that opens the panel: a grep found no `'?'` handler in `idempiere.html`; legacy's toolbar Help is Alt+H (`ADWindowToolbar.java:241-242, :509`). If the key is missing, S1 adds it in the one key map. No new key is invented.

- **Owner, 2026-11-24 (verbatim):** *"I reckoned it is just a panel on the right to open it. In our Kernel we supposed to have the ? that goes to guide. It can then opens that panel and from there onwards"* · *"That ? or the light bulb icon"* · *"yes ? for Help as universal, and deprecate the lightbulb as it is quite moot"*. **Measured before the answer:** the side-strip `?` pill (`showme`, Lucide circleHelp) only toggles the ShowMe tour (`idempiere.html:7565` toggleShowMe; the header `?` was removed, `:8152`); the lightbulb pill (`erpdoc`) opens `migrate_compare.html` (`:7533` openReadCompare, `erp/pills_idmp.json:59`, also `erp/pills.json` / `erp.html`); the East panel `#idmp-help` (Tool Tip + How To) shows unless the HelpCollapsed preference is set and folds on a title click (`:3106-3117`); no pill opens it. **S1 scope, added:** (1) **`?` = Help, the one universal door**: the `showme` pill opens and unfolds the East panel and scrolls it to How To; the panel carries the guide link for the window in view, the ▶ peek, and a *ShowMe tour* button (the tour keeps its wiring, `#needHelpCk`, now one click deeper). Same icon and same meaning as the Viewer / Modeller `?` help (§14.3). (2) **The lightbulb `erpdoc` pill is deprecated:** removed from `pills_idmp.json` and `pills.json` with its `ONBOARD_HELP_OPS.compare` step (`idempiere.html:7554`, which names the pill); `migrate_compare.html` stays reachable from the guide. The deletion budget counts both.

- **Owner, 2026-11-24 (verbatim):** *"perhaps use lightbulb in the panel when need to peek. Then > to execute"* · *"It should just fix small light single field values and not doing Complete and Process etc which has other handling."* **Settled panel controls:** **💡 (lightbulb, the deprecated pill's icon, reused inside the panel) = peek**: it runs the trial and lists every blocker with the fields marked. **▶ = apply the fixes**: only single-field values on THIS document or its line (the Fix-it rows), as typed, nothing saved, then a fresh peek. ▶ NEVER runs Complete, a Process or any DocAction (they keep their own toolbar handling). P7 gains red `docaction` (▶ triggers processIt or a process → FAIL).

- **Owner, 2026-11-24 (verbatim):** *"remember we have ERPNext style or Friendly plugin that does such auto too"*. **Read:** the opt-in operations lens `org.kernel.friendly-ops` (`erp/plugins/friendly_ops.mjs`, spec `prompts/ERP_FRIENDLY_OPS_LENS.md`) is drawn ONLY while the bundle is registered, so with it stopped the screen is the plain legacy twin (`idempiere.html:2085-2087` §OPS-LENS; §31: NOT auto-installed, only OFFERED, under the TWIN CARDINAL RULE). The host already hands it the two seams the peek needs in a weaker form: **FO-M1 Preview** = `previewSave` → `__crud.previewInline`, *"the same Save chain, never committed"* (`idempiere.html:2118`, `friendly_ops.mjs:105-109`), and **FO-A4** = open a record with fields preset *"as if the user had picked them … the callouts run in order"* (`idempiere.html` _lensApi, §39). **Placement, therefore:** the 💡 peek and the ▶ fix are LENS actions of `org.kernel.friendly-ops`, drawn in the Help panel while the lens is on; with the lens stopped the panel is the legacy CtxHelp text (twin). The host gains exactly two generic seams beside the existing ones: `previewComplete()` (the trial: a dropped Trx, `processIt(…,'CO')`, mechanism 2-4) and `setField(column, value)` (on the record in view, the form's own change path, as FO-A4 does for a new record). The assumption, field and fix rows are the bundle's DATA (its manifest), not host code. P8 adds: with the bundle stopped, no 💡 / ▶ and no peek code runs (red `lensoff`).

**Deletion budget:** S1-S2 retire the planned "Make sure" table (item 2, never built) and, once the peek is live, the static "When it refuses" paragraph in `build_help_pack.js` (`p4`, line 412) on the 21 windows. The panel shows live blockers instead of a list of everything that could go wrong.


### §19.21 S1 RESULT (2026-11-24): BUILT, bim-ootb #3433 (S1a engine, merged) + #3435 (S1b page, auto-merge on: verify it landed), erp sw v1134
- **Engine** `erp/doc_peek.js` (the host seam previewComplete): the document's own ported Complete (`processIt(…,'CO')`) in a never-committed Trx inside **BEGIN … ROLLBACK**. Legacy's message key read from the returned message OR a thrown one (MPeriod.testPeriodOpen throws: m_inventory 200000 showed it). Each blocker's assumption row (SQL, only inside the rolled-back transaction) looks past it, then Complete runs again. `no-class` when the twin has no DocAction class (said, not faked).
- **Found by P1 (named in the code):** a SAVEPOINT released after ROLLBACK TO commits an empty transaction that still moves SQLite's header change counter (no table changed, the bytes did). Hence BEGIN … ROLLBACK.
- **Found by P5p:** DateAcct is not displayed on Sales Order (AD_Field tab 186 IsDisplayed=N); DateOrdered sets it (callout CalloutEngine.dateAcct). The field row carries a cited `via: DateOrdered`; the mark goes there.
- **Lens data** `erp/plugins/friendly_ops_peek.json`: assume rows PeriodClosed (2) and credit (3 keys); field rows for PeriodClosed on 7 document tables, credit (3), NoLines (tab). 16 of 16 cited.
- **Page:** `ad_lens.js` panel(api); `crud_overlay.js` peekRun (the model-transaction setup, the db handed to the trial); `idempiere.html` previewComplete / markFields / panelShow / zoomTable, the panel strip, the marks (read-only form `.idmp-fld` and in-place editor `.cfrow`, the twin's field-error red #c0392b), and the `?` door (`_openHelpDoor`: guide · tour · about). `friendly_ops.mjs`: the lightbulb **Check** on a saved document, *Before you complete: N to fix*, **Open** (Show-it, legacy zoom rule). The lightbulb pill (`erpdoc`) and its onboard step are removed; `modules.json` declares the two new files.
- **W-HELP-PEEK PASS** (`erp/tests/logs/witness_help_peek.log`): P1 8/8 byte-equal, P2 8/8 peek = real Complete, P3 two blockers in legacy order, P4 16/16 cited, P5 fields, D1 door, D2 lightbulb gone, P8 lens off / on, PP listed and nothing written, P5p 2 of 2 marked on screen (`DateAcct>DateOrdered:Y`, `C_BPartner_ID:Y`), P6 `§ZOOM window=123 C_BPartner.C_BPartner_ID=118 landed=true`. Reds commit→P1, stale→P2, noassume→P3, nomark→P5p each FAIL. Cost: 19-29 ms headless, 78 ms in the page (3 rounds, heap 51 MB).
- **Regressions read:** W-FRIENDLY-OPS GREEN 6/0, W-CTXHELP-OVERLAY 9/0, W-HELP-SHOWCASE 38/0, W-FIELD-HELP 14/0, SW audit 0 missing, manifest PASS.
- **Named gaps (X of N):** the sweep judges the 4 of 15 document tables that have a GardenWorld draft (c_order, m_inventory, c_bankstatement, m_inoutconfirm); the other 11 need a made draft each. The twin has **no DocAction class for M_InOutConfirm** (a parity-lane gap). `poc_onboard_front_door.js` stops at W5 on clean main (IdmpPills.builder null), so D2 judges the lightbulb removal. Marks are drawn once per Check; an unsaved form says "Save first, then check" (the spec's apply-unsaved-values step is not built).
- **Next:** S2 = ▶ fixes (owner: single-field values only, easiest valid value, never Complete / Process) + a made draft per document table so the sweep reaches 15 of 15; then S3 background check, S4 guide section + film v3.


### §19.21 S2 RESULT (2026-11-24): BUILT, bim-ootb #3437 (auto-merge on: verify it landed), erp sw v1135
- **The rule, from the data:** a fix row = ONE field of THIS document + its easiest valid value (`{today}` or another column of the same document), cited. `doc_peek.js` offers it ONLY when the same trial, with that value written, no longer stops at that check (`proved: cleared | completes`). Otherwise it is counted `unproved` and never shown. `set` = the form's unsaved values, written into every trial (the check after ▶).
- **Rows (9, cited):** PeriodClosed → the date the check reads on Sales Order (DateOrdered, with DateAcct following it through CalloutEngine.dateAcct), Invoice / Shipment / Payment (DateAcct), Inventory / Inventory Move (MovementDate); BackDateTrxNotAllowed on Inventory Move (MovementDate); ControlAmtError on GL Journal and GL Journal Batch (ControlAmt := TotalDr).
- **Page:** `setField` types the value into the in-place editor's own input and fires its change event, so callouts run (as FO-A4 does for a new record). The lens shows *▶ Fix N: Date Ordered → 2026-11-24* (the AD_Field name), then *Fixed: Date Ordered (not saved yet: Save to keep, Undo Changes to go back)* and a fresh check. ▶ never runs a DocAction or a process (red `fixdocaction`).
- **W-HELP-PEEK PASS** (log `erp/tests/logs/witness_help_peek.log`): F1 today's period closed → no fix (unproved=1); F2 a past closed period → `DateOrdered := 2026-11-24`, proved `completes`; F3 that value saved → the real Complete passes. Page: PF1 offered, PF2 `set col=dateordered ok=true`, then the new check `keys=["BPartnerCreditHold"]`, DB date still 2026-10-15, 0 DocAction lines; PF3 Undo Changes → 2026-10-15. **Sweep 12 of 15 document tables** (drafts cloned from Completed GardenWorld documents, legacy CopyFrom's state), P1 byte-equal + P2 peek = real Complete on each. Reds commit, stale, noassume, unproven, nomark, fixdocaction each FAIL.
- **Named gaps:** Bank / Cash Transfer has no physical table in the seed; Payments into Batch and Move Confirmation have no completed document to copy. Ship/Receipt Confirm and Requisition have no twin DocAction class (parity lane). Fix rows are proved only where a run hits them: the back-date and GL control rows are cited but not yet exercised (no document in the sweep stops there).
- **Next:** S3 = the background check (BC parity: on load and after each save, a count on the help button, Show lines with issues), with a budget from the measured cost (page: 36 ms first check, 11 ms after ▶; heap 98 MB). Then S4 = the guide section (RESUME item 1) + film v3.

## STATUS
2026-11-24 (late): §19.21 S2 built (bim-ootb #3437): ▶ Fix, proved before offered; sweep 12 of 15. Next S3 (background check).
2026-11-24 (later): §19.21 S1 built (bim-ootb #3433 + #3435): the lightbulb Check in the Help panel, marks, Show-it, ? door, lightbulb pill gone; W-HELP-PEEK PASS. Next S2 (▶ fixes).
2026-11-24 (later): §19.21 SPEC the help peeks ahead (owner: match Business Central, fix where it can); big picture measured (21 windows, 93 literal checks, 33 field-level, 4 likely fix-its); supersedes RESUME items 2-3.
2026-11-24 (close): film v3 brief written (Now vs Ours; 1/2/3 card; internals to the last card); pending before the cut: guide section, heading wording (owner), fix tips (owner).
2026-11-24: §19.20 v2b: the Legacy vs Kernel table card inserted (owner), 183 s, PASS; v2 kept.
2026-11-24: §19.20 film v2 made (171 s, checks PASS, pilot restored in the DB); refusal ✓ side rule fixed + D7.
2026-11-23: §19.19 PO line (bim-ootb #3416); §19.20 film storyboard v2 written, waiting on the owner's OK (and beat 8: apply, shoot, remove on the pilot).
2026-11-23: §19.19 full pass: all 124 core windows (21 documents, 77 cited effects, 24 ✓), bim-ootb #3415 + BIMCompiler #1206; search tie-break and index speed kept.
2026-11-23: §19.19 amended (DocAction source = rules, run = proof) + pilot built (Sales Order, Payment Term; bim-ootb feat/ctxhelp-derived); §SCN_META added to the bridge (witness_m3_gap.js, cycle_o2c.js).
2026-11-23: §19.19 SPEC written (owner: think anew, no wiki): topics from the dictionary + legacy's recorded run outcomes; 15 of 124 core windows covered today. Pilot = Sales Order + Price List, waiting on the owner's go.
2026-11-22 (close): lane at zero except owner items; wiki = Creative Commons (owner), variant + amount of real how-to to measure next; F6.2 #3398 to verify merged.
2026-11-22 (late): F6.2 built (bim-ootb #3398): the guide link names the section, not a tenant's heading; K9 + red labelmsg. Both film defects closed.
2026-11-22 (late): F6.1 built (bim-ootb #3391): no dead links in the legacy script, README links to the script and the guides; W-CTXHELP-LEGACY 7/0 + red oldscript.
2026-11-22 (film): §19.18 film v1 made (165 s, EN); beat 7 shot on the legacy pilot and the pilot restored to its snapshot; K2 PASS, captions PASS; two small defects named.
2026-11-22 (close): content sources measured exhausted (8 more guides surveyed; legacy docs have no licence). §19.18 film storyboard v1 written and OK'd by the owner (record as is; beat 7 apply, shoot, remove on the pilot). Next: record it (BUILD BRIEF).
2026-11-22 (latest): §19.17 F6 built (bim-ootb #3388): the how-to topics as a legacy migration script (local_sql, UUID keys, own text first at apply time, 2000 fit in SQL); W-CTXHELP-LEGACY 6/0 + 3 reds on the pilot DB. Next: more topics, the film.
2026-11-22 (late): §19.17 F7 built (bim-ootb #3387): every context-help row fits MsgText's 2000 (owner: whole paragraphs + a link to the guide); K11 + red nofit. F6 answered (copy the site's own text in, at apply time). Next: F6 build.
2026-11-22 (late): §19.17 F2 built (bim-ootb #3384): own text first, then our message; K10 40/40, red nodictfirst. F6 decided + specced: the legacy migration script (local_sql, UUID keys, nextidfunc, pilot DB witness).
2026-11-22: §19.17 F4 built (bim-ootb #3380): the How To panel follows the tab / process / Home in view (legacy renderCtxHelp), dictionary text when no message; W-CTXHELP-OVERLAY 8/0 (K10 89/89 en_US + de_DE, 3 reds). W-ERP-I18N's 4 FAILs are pre-existing on main. Next: F2 (owner word), more topics, the film.
2026-11-20: §19.16 C5 built (bim-ootb #3374): a tenant's own help message shows at once and after a reload; W-CTXHELP-OVERLAY 7/0 (K9, 3 new reds). C1-C5 are all done. Next: F4, then F2 on the owner's word.
2026-11-20: §19.17 F5 built (bim-ootb #3371): the first-setup guide at TAB level, 20 sections in 17 helps on 21 tabs / processes; W-CTXHELP-OVERLAY 6/0 (9 reds); help ids kept by erp/tools/ctxhelp_ids.json. Next: C5, then F2 (owner word), F4.
2026-11-19: §19.16 C4 built (#3343): ONE reader (erp/ctx_help.js), help.json holds no how-to, per-row English fallback, CLI reads the same; W-CTXHELP-OVERLAY K8 88/88. F5 specced (ERP_FirstSetup.md, tab level). Lesson: inline // comments in one-liners (4 times).
2026-11-19: §19.17 F1 built (#3341): 8 standard-flow topics, 13 targets (2 processes). Owner: translations FROZEN until the content shape matures, de_DE the one test language; rich English content first. Next: C4 (with per-row fallback), then more topics.
2026-11-19: §19.16 C4 measured + designed (not built): the node help tools read the raw seed via sqlite3, so the how-to overlay is invisible to the index header and ~10 witnesses; C4 starts with one opener of the page's DB.
2026-11-19: §19.16 C3 built (#3340): translations in legacy's AD_CtxHelpMsg_Trl, W-CTXHELP-OVERLAY 6/0 (7 reds). Next: C4.
2026-11-19: §19.16 C2 built (#3338): the how-to as legacy's context-help rows (CtxType T, AD_Tab link), W-CTXHELP-OVERLAY 5/0 (5 reds). Next: C3.
2026-11-19: §19.16 C1 built (#3336): context-help tables as a boot overlay, task menu gate; W-CTXHELP-OVERLAY 4/0 (3 reds), W-HQ-MENU-LEAVES 6/0 with T. Spec corrected: the overlay, not a patch splice; link columns + task tables were already in seed + patch. Next: C2.
2026-11-19 (close): owner: Sonnet agents may add more content; film languages zh_CN / de_DE / es_ES (French replaced by German), no Japanese. Next session: C1.
2026-11-19: §19.17 planned (owner): fill the container with the 8 standard-flow topics, then a film for legacy users.
2026-11-19: §19.16 specced (step 3 as C1-C5); legacy hides role 102's 3 task entries (0 ad_task_access rows), taken in C1.
2026-11-19: §19.14 built (W-HQ-MENU-LEAVES 6/0, 3 reds). §19.15 decided: step 3 = legacy's context-help tables in the ERP DB.
2026-11-19: §19.12 closed (fixed by #3301, witness 46/0 on main). §19.14 specced: forms, workflows, info windows, tasks in the ERP help box, plus the menu scope for F/I (legacy MTree rule). Tasks ⛔ (seed has no AD_Task_Access).
2026-11-18 (late): §19.10 built (#3275): process names translated, the ERP help index ships its header only. §19.11 planned (owner: every legacy pack inside the 18). §19.12 found (Modeller `b-lodup`).
2026-11-18: query core COMPLETE (§19.6 #3212); RESUME block rewritten.
2026-11-17 (night): owner: films are EN only, other languages ad hoc on request (RESUME item 5 closed).
2026-11-17 (night): §18 design accepted (7/7 checks), 3 owner questions open; §14.8 the 23 W-VIEWER-I18N leaks built (result below once the witness is read).
2026-11-17 (late): RESUME block rewritten for an Opus session; §18 = the Fable brief (one query core, hard budget). Session work: film v3, tie rule, Modeller + guide dictionary, 8 guide sections, real keys.
2026-11-17 (tie rule): bim-ootb #3172 merged, W-HOWTO H1 passes again (§14.3.2 RESULT).
2026-11-17 (film v3): `Help_that_answers_Viewer_EN_AFTER_2026-11-17_v3.mp4` made, framed bigger, new Nielsen quote (§17.3 RESULT). Found: W-HOWTO H1 fails on main (guide's new Help section wins the Save/Open tie). Next unchanged: the 6 Modeller guide titles, then prefixes.
2026-11-17 (close): BIM User Guide Help section added; §17.2 film REDO specced for a new session (owner: frame the building and the panel bigger).
2026-11-17: §14.5 step 2 (Modeller help in the shared panel) built + merged, bim-ootb #3171 (W-HELP-DOCK-M PASS). §17 film made: `Help_that_answers_Viewer_EN_AFTER_2026-11-17_v2.mp4` (§17.1 RESULT), pipeline `scripts/film_help_viewer/`. Next: the 6 Modeller guide titles into the dictionary, then the prefixes (box side).
2026-11-16 (session bim-compiler-41): P1b, §10-§13 built and merged; films EN v4 / ZH v5 / DE v1 made (not pushed); ERP User Guide help section LIVE. Next: §14 (BIM help panel), check (a) first.
2026-11-16: P1 built and witnessed (5/0), merged as bim-ootb #3079. P2a built and witnessed (W-MSG-CATALOG 4/0), merged as bim-ootb #3082. P3a built and witnessed (W-HELP-STUDENT 5/0), merged as bim-ootb #3083. P3a-1 (help footer + opening tip, `red1 --fast`), bim-ootb #3084. P2b (W-MSG-DOOR 5/0) #3108. P1b (W-FIELD-HELP 13/0) #3126. Depends on `prompts/DOCS_I18N.md`, `prompts/CLI_ERP_IVR.md` (CLI session owns), `prompts/ERP_UI_LOCALES.md`.

## Note from the code-design lane (2026-11-16): `msg_keys.scan` also reads calls inside comments
Found while building F-19 (`prompts/CODE_ARCHITECTURE_DESIGN.md` §F.28, bim-ootb #3103). `scan()` matched `M('key', …)` written in a
header COMMENT and reported a use of the key `key`. That gave a false unknown-key once the file was tracked. X0 now blanks comments
first with the repo's one tokenizer, `scripts/lib/js_scan.js` (`scan(src).code`, same length and lines), and only then calls `scan`. **No
effect on W-MSG-CATALOG M3 today:** it scans only `words_core.js` and `red1.js`, which have no such comments. If M3's file list widens,
the same `js_scan` step keeps it from counting prose. Left for this lane to decide; nothing in `common/door` was changed.
2026-11-16 (P2b closed): bim-ootb #3108 merged (`f18ae08c`). The guides list the six-file download in 7 languages + ProposerGuide (#798, deployed, all 8 pages checked live). W-MSG-DOOR baseline moved to the `main` it merged (`304a30a0`); D4 treats `say()` as the § log. Merges with the CLI session's work were unions of `messages.json` only. W-RED1-WORDS R1 / W-HELP-STUDENT S4 on `status@erp` fail on clean main since #3117 (reported to the CLI session). Locale (login language from `AD_Preference`, then LANG, then the System client) handed to the CLI session (`CLI_ERP_IVR.md`). Next: P1b (§7).
