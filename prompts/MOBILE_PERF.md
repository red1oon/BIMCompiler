# ⚠ DO NOT REMOVE — Mobile: the phone as a SITE-MISSION tool (direction, state, build order, rules) — the ONE place
# SCOPE: everything the phone does — site missions (task cards, steps, checklists, Send to HQ), phone HMI, and phone speed.
#   A "resume mobile" session works FROM HERE. Full history (every spec, result and owner quote, 2026-05 → 2026-11-28):
#   prompts/archive/MOBILE_PERF_history_to_2026-11-28.md — the section index at the end of this file points into it.
# PRIME RULES: measure first, change one lever, re-measure on the same building; spec → witness that can fail → build →
#   READ THE LOG after every run (the exit code is not evidence). Desktop behaviour stays unchanged unless the owner says so.

## ▶▶ RESUME HERE — "resume mobile"

### ▶ ROLES (owner 2026-11-28: *"Tell Fable to be the designer as that requires heavy thinking and alot Sonnet sessions to carry out its instructions"*)
**Fable = the designer and reviewer of this lane; Sonnet sessions = the builders.** Fable does NOT build the bulk itself. It:
1. **Designs** — turns the direction into an architecture (phone axe mechanism, steps layer, mission model on WF/Request, arrival + freshness, sync, desktop designer) after reading the code and the iDempiere source, and records the decisions here.
2. **Writes WORK ORDERS** — one per bounded task (one PR each), appended below as `### WO-<n> <title>` with: status line (`OPEN` / `IN PROGRESS <session>` / `✅ DONE <PR> <witness verdict>` / `⛔ BLOCKED: <question>`); the goal in one sentence; the files and functions to touch with file:line at a named commit; what NOT to touch; the spec; the witness (issue it proves, checks, red control, the `§` lines to read); acceptance = the exact verdict line; the rules that apply (this file's Rules, CLAUDE.md, AD-LAYER/TWIN laws). A Sonnet session has no memory of this conversation — the work order must stand alone.
3. **Orders them** by dependency, so several Sonnet sessions can take independent ones (each in its own `/tmp/wt-*` worktree).
4. **Reviews each result** against its work order from the PR diff and the run LOG (not the session's summary); marks it ✅ or reopens it with the defect.
Sonnet sessions: "resume mobile" → take the top OPEN work order whose dependencies are ✅ → mark it IN PROGRESS → build → witness → read the log → PR → mark ✅ with the verdict → next. They do not redesign; a design question goes back as `⛔ BLOCKED: <question>` for Fable or the owner.

### ▶ FOR THE NEXT SESSION (Fable) — review first, then design and write the work orders (left by the 2026-11-28 Sonnet session)
The owner closed 2026-11-28 to continue under Fable "to give best work quality". Before building, review these with an independent read (code, not this summary):
1. **The phone-axe mechanism (build step 1) — design it before any code.** Proposed: a `phone:false` flag per module in `viewer/modules.json`, honoured by the page builder (`scripts/gen_manifest.js` owns `viewer.html`'s tags). Open question: HOW a generated static page keeps files off a phone (a gate script that writes desktop-only tags, a second generated phone page, or `APP.lazy` rows) — weigh parse/order guarantees, offline precache, and the C1–C31 claims of `scripts/tests/witness_manifest_roundtrip.js`. Census each axed group first (see "Silent guards" rule).
2. **`APP.lazy(name)` (bim-ootb #3499, `viewer/main.js` end of file):** is the table shape right for the film group and the phone axe (needs an `init` step that calls a module's `setupX(APP)`; ordering across rows; retry semantics)? The film-group design is in the archive §P3 STAGE 2 MOVE 2 ✅ block.
3. **The tasker mapping to legacy:** verify against the iDempiere SOURCE (`~/idempiere-dev-setup/idempiere/`: MWFProcess / MWFActivity / MWFNode / MRequest / MRequestUpdate) that a General workflow (type G) + User Form nodes + Role responsibles can drive a per-request run the way proposed (AD_WF_Process with `Record_ID` = the R_Request). The anchor is DECIDED (owner: ride on the Project Order item and its GUIDs, via `R_Request.AD_Table_ID/Record_ID` — see Open decisions 1); check the `Note` GUID-set twin gap and define arrival over a GUID SET.
4. **Witness quality of this session's PRs** (a fresh eye, can each fail for the right reason?): W-CLASH-COUNT-AGREE (#3491 — note the R-tree-not-ready fallback still counts with NO tolerance, unfixed), W-MOBILE-CLASH-SHEET (#3496 — C4 was rewritten after its first form could not fail), W-SEND-HQ-GITHUB-LIVE (#3495 — node + the maintainer's gh token, not a browser with a fine-grained trial token), W-BOOT-CHART-LAZY / W-BOOT-CPE-LAZY (#3497/#3499 — E4 is a static check; E6 opens the editor but no film was run).
5. **#3497 side effect:** `gen_manifest.js --write viewer` also refreshed 8 derived `uses` lists in `viewer/modules.json` (other modules) — confirm they are correct, not noise.

### Lead's design assessment (2026-11-28; owner: *"You got the sense right"*) — build these INTO the first version
Sound direction: it matches how sites work (office plans and analyses, the field executes and reports), plays to the phone's limits (memory + patchy network; boot ≈ 16 s → ≈ 5 s), makes offline natural (missions packaged before, reports queued — proven), keeps routes reviewable at HQ, and reuses one engine + legacy WF/Request (no new data model, twin rule kept). It stands or falls on two things:
1. **Arrival must be trustworthy.** Indoor GPS and counted steps drift by metres → always offer a QR tag at the spot and a manual "I'm here" next to the automatic card; a misfiring card kills trust.
2. **Missions must stay fresh.** Each mission records the model version it was planned on; the phone has a one-tap "can't proceed / not as planned" report straight back to HQ.
Also: don't over-cut — keep cheap lookups (measure, element info) unless a census shows a cost; start the designer small (templates + the CSV route; legacy iDempiere already has a graphic workflow editor for admins); mission progress syncs on its own whenever there is signal (today Send to HQ is a manual tap); close the `Note` GUID-set twin gap before the anchor relies on it.

### The direction (the owner's, consolidated 2026-11-28)
**The phone is for site missions, not a smaller copy of the desktop BIM.**
- A person on site walks the building. When they arrive where work is assigned to their role, that task's card comes up on its own.
- The card holds the job for that spot: what to do (steps), a checklist, photos, a signature. The result goes back to HQ — at once if there is signal, later by itself if not.
- The same engine runs every other phone job: warehouse pick and putaway, the POS device.
- Tasks are designed on desktop by an admin, like a workflow, and assigned to a role.
- The data follows legacy iDempiere — Workflow for the design, Request for each job on site — so the model stays consistent with the ERP and reusable.
- Desktop production tools stay on desktop: films (Alt+C), photoreal stills (Alt+S), 4D authoring, IFC import and export.
- **HQ computes, the phone receives.** Processing is done at the office on desktop. A site person is ASSIGNED a mission and REPORTS back — mostly snag and share. Even a clash reaches the site from HQ as a URL to sight the pair; the route to the clash point is computed at HQ with the room path that already exists, and the phone only follows it. The phone gets the 3D model plus a STEPS LAYER that carries the mission (where to go, what to do, what to report).

Owner's words (source, 2026-11-28, verbatim): *"We should drop stuff such as alt-c as it serves no real concern for a mobile user. It has to be mobile oriented."* · *"the 4D line is heavy so i rather we redo them to fit the phone? Even scrub it entirely and have a task manager instead which includes coords, steps, check list. And this goes well with other mobile work such as warehouse pick/putaway or POS device. The tasker can be editable in Desktop by admin designer like a workflow style, and deploy as dedicated to role etc."* · *"it can be a layer in the BIM space so that when user arrives via site-walk it flashes its task card?"* · *"Yes if u can align to legacy WF and Request that can make modelling more consistent and reusable"* · *"it seems we stumbling across a killer feature here, that on site missions are more needed rather than mobile copy of a desktop BIM"*. · *"on 2 and 3, in essence such process are mostly done back at office in a desktop. A site is usually assigned and reporting mission. The snag, share mostly. Even clash is conveyed from HQ to the user via URL to sight the pair. Thus an earlier idea was to align it with path to the clash point. That can make use of the present room path done and again all this heavy processing is done at HQ. Mobile merely receives 3D model, and steps layer that facilitates such activity."*

### State (2026-11-28)
- **Field ops shipped:** auto X-Ray on Walk, the walk recorded in the op-log, snag with stamped photo, Send to HQ (email, or the team folder — sealed, offline-safe), HQ's "Get from team" with walk replay. Proven against the real GitHub API (W-SEND-HQ-GITHUB-LIVE 6/0).
- **Phone HMI shipped:** one capability owner, phone-dead controls hidden, panels as bottom sheets in the top layer (swipe / Back / tap the model to close, one at a time), drawer rows, Issue Log route, clash list as a sheet.
- **Speed so far:** no shader freeze on phones (5.6 s → 0.6 s longest freeze); boot JS 10.29 → **9.78 MB** (Chart.js and the Alt+C editor load on first use through ONE loader, `APP.lazy(name)` in `viewer/main.js`). Typical phone (Lighthouse Moto G Power profile, 4× CPU, 1.6 Mbit/s): first-visit download ≈ 15.5 s at today's gzip ratio. Target ≤ 3 MB (≈ 5 s).
- **Film FILM-M1 rc4 is FINAL** (`~/Videos/Phone_fast_FILM-M1_EN_rc4.mp4`, 79 s, EN; owner: "Film is enough"). No other languages.
- **Nothing of the tasker is built yet.** Design below.

### Build order
1. **Phone axe** — files of desktop-only features never load on a phone (one `phone:false` flag per module in `viewer/modules.json`; the page builder keeps them off a phone's boot; every boot-time call into them guarded; their controls hidden). Measured 2026-11-28 (eager KB before compression):

   | group | files | KB | on a phone |
   |---|---|---|---|
   | film / Alt+C (camera paths, MaxQ, bake, tour) | 38 | 2,190 | axe |
   | photoreal still / Alt+S (lighting, GI, sky, glass) | 19 | 1,317 | axe |
   | film sound | 1 | 55 | axe |
   | IFC import + wizard | 6 | 123 | axe |
   | exports / print / BCF / IFC out | 7 | 161 | axe |
   | 4D/5D: Time Machine, Gantt, schedule, what-if | 30 | 1,564 | axe — replaced on phones by the tasker |
   | 2D drawing grid tools | 15 | 431 | owner call |
   | civil / road / earthworks | 9 | 320 | owner call |
   | rule checks / reports | 2 | 109 | owner call |
   | FM / HR lenses | 10 | 189 | likely keep (has a mobile layout) |
   | city view / warehouse pick walk | 2 | 124 | keep the warehouse walk (a phone job) |

   The axe rows alone (5,413 KB) leave 4,138 KB ≈ 4.0 MB; all rows out ≈ 2.96 MB. **Census first per group:** some files run in a normal load (`rates.js` is used by streaming; the effects pipeline draws the selection outline; `sourced_light.js` patches shaders at boot, `scene.js:46`; `main.js:15-16` names three film setup functions bare).
2. **The steps layer on the phone:** the task card on walk arrival (anchor = the Project Order item, decided) + the form sheet; the "go to the clash" mission follows an HQ-computed route.
3. **The desktop designer** (workflow-style, writes the same records).
4. The warehouse walk and the POS device on the same form engine.

### The tasker design (agreed shape; build order above)
- **Template = legacy `AD_Workflow` of type G (General)**; each step = an `AD_WF_Node` (Action X *User Form* → our JSON form, or C *User Choice* for a yes/no check); assignment = the node's `AD_WF_Responsible` of type R (*Role*); the designer's layout = the node's `XPosition/YPosition` (the same fields the legacy graphic workflow editor writes, so one design opens in both).
- **A job on site = one `R_Request`** (`AD_Role_ID`, `SalesRep_ID` assignee, `C_Project_ID` = the project whose `BIM_ViewerURL` opens the model, `DateStartPlan/DateCompletePlan`, `TaskStatus`); its run = `AD_WF_Process` + one `AD_WF_Activity` per step (`Record_ID` = the request); each finished step, photo or checklist answer = an `R_RequestUpdate`. HQ sees it in the usual Request windows.
- **Forms = the ADUI JSON format** of `red1oon/JSONFormMaker` (window → tabs → fields `{fieldId, name, component, sequence, validation, data, ui}`, the iDempiere AD shape; 66 component types incl. COORDINATE, LOCATION_HIERARCHY, WIZARD_STEP, REPEATING_GROUP, TASK_LIST, SAFETY_CHECKLIST, QR_CHECKLIST, INSPECTION_SCORE, CAMERA, MULTI_PHOTO, SIGNATURE, TIMER). Reuse the FORMAT and catalogue, not the code (Java desktop designer; React Native/TypeScript renderer `red1oon/ADUI` — against the no-install web viewer and EDITOR_MAINTAINABILITY §13). Phone renderer = small vanilla JS in a bottom sheet; desktop designer = a browser page (+ the CSV route `CSVtoJSON.py` already defines).
- **The arrival card:** the walk already samples where the user is (`walk.js:476-492 _walkTraceMark`: model position, heading and GPS/site reference at start, every 5th step, each turn ≥ 30°, stop; storey floors cached `walk.js:250-261`; elements tied to compiled rooms `location_axis.js`). A task's anchor on this storey within its radius (or this room) flashes its card once, re-armed after leaving; tap → the form sheet; done → the Send-to-HQ path (kept on the phone, team folder when online); HQ's pins change colour. Indoor GPS and counted steps drift by metres: the radius is set PER TASK, with an optional QR at the spot as the hard confirm (QR_CHECKLIST). No radius is assumed.
- **Ours already:** `erp/ad_workflow.js` ports iDempiere's workflow walk + routing (W-WF); Request rows + `erp/request_email.js` exist. The workflow DESIGN tables (`ad_workflow`, `ad_wf_node`, `ad_wf_responsible`) come from `erp/ad_full.db` (an OCI file, 0 bytes in a git checkout), not `ad_seed.db`.
- Oracle facts behind this (legacy `idempiere` db, read-only, 2026-11-28): archive §2026-11-28 MOBILE TASKER — backbone DECIDED.

### Open decisions (owner)
1. **The BIM anchor — DECIDED 2026-11-28 (owner, verbatim):** *"on your question where a task belongs to i think riding on the present Project Order bim tab or its item same GUID is good enough"*. So: NO new column. A task's place = the Project Order it rides on — `R_Request.C_Project_ID` (the project whose BIM tab / `BIM_ViewerURL` opens the model) + `R_Request.AD_Table_ID/Record_ID` → the Project Order ITEM (`C_ProjectLine`, or `C_ProjectTask` for a task-level job; the Project Order = `C_Project → C_ProjectPhase → C_ProjectTask → C_ProjectLine`, BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md:82) whose element GUID set (`Note`, read by §ZOOM-SAME-ITEM) gives the elements → the place in the model. Both fields exist in legacy `R_Request` today. **Caveat to check first:** that doc (:394, :435) says the GUID set in `Note` is still written only on the Kernel, not on legacy — a twin gap the tasker would inherit; and one item can carry MANY GUIDs, so "arrival" must be defined over the set (e.g. any element of the set within the task's radius).
2. **The "owner call" rows — DECIDED 2026-11-28 (owner, verbatim above): desktop.** 2D drawing grid tools, civil/road/earthworks and rule checks/reports are office work → axed from phones with Tier A and 4D. Keep on phones: the model, walk, X-Ray, snag + Site Camera, share, Issue Log + Send to HQ, opening a clash URL (`#clash=…`), FM lenses (own mobile layout), the warehouse pick walk. **Also desktop (owner 2026-11-28: *"yes perhaps even Section cut scissors too"*):** the section cut and the scissors (`section_cut.js` 34 KB, `grid_scissors.js` 28 KB — census before removing). **Re-examine with the census:** the clash MATRIX/list computing on a phone — the owner's model is that a clash arrives from HQ by URL, so the phone may only need the deep-link open + the pair view.
3. **Go for the phone axe — GIVEN 2026-11-28** (same answer).
4. **New mission type to design: "go to the clash"** — HQ computes the walking route to the clash point with the existing room path (`room_graph` + storey raster/footprint, loaded by `APP.loadNavigate`, `viewer/main.js:155`) and sends it in the mission's steps layer; the phone follows the steps (the walk trace confirms arrival) and reports. Phone does no routing.

### Rules for this lane (learned; keep)
- **Phone panels:** every phone panel is a sheet of the ONE sheet manager (`viewer/panels.js` `A.sheets`, ADAPTERS for non-`.bim-panel` systems). Never a second panel engine.
- **On-demand code:** ONE loader, `APP.lazy(name)` (`viewer/main.js`, a table of rows `{src: [coded literals], ready()}`); new modules add rows. A module leaves boot only after a census of its boot-time callers; the witness proves no boot request, the feature still works after the load, and a red control.
- **`viewer/modules.json` is the SOURCE of `viewer.html`'s tags** — editing the page by hand is undone by `scripts/bump.js`. Move procedure: remove the tag site from `order["viewer/viewer.html"]`; add the lazy site under `order["<loader>"]` (`as` relative to the loader); set the module's entry `"load":"lazy","lazyGroup":"<loader>"`; `node scripts/gen_manifest.js --write viewer`; `bump.js <file> --write`; `boot_weight.js --write` (the CI ratchet); then `gen_manifest --check` AND `node scripts/tests/witness_manifest_roundtrip.js --skip-c7 --skip-c9` (claim C10 checks the module entry); `npx eslint viewer modeller` (no-undef: use `window.X` in page callbacks).
- **Silent guards hide breakage:** code that does `if (typeof X === 'function')` keeps working without X but changes the result (the film path planner plans without the storey reveal). A move must load X before the FIRST call that reads it, and its witness compares results, not just "no error".
- **Twin rule:** task data matches legacy iDempiere (CLAUDE.md TWIN CARDINAL RULE); legacy is read from the oracle, never guessed.
- **Standing perf facts (verify against live code before relying on them):** r160 native BatchedMesh culling; no antialias; DPR 1 at rest / 0.75 while orbiting; on-demand render gate on phones only; tab pause; DLOD off; WebGL context-lost banner. NOT on phones (proven net-negative): InstancedMesh zero-scale, a custom BatchedMesh frustum tick, on-demand render on desktop. HARD: `InstancedMesh.frustumCulled` stays `false`.
- **Private data:** the public `common/comm/team_defaults.js` key stays empty; team trials stay private.

## Done so far (2026-11-26 → 2026-11-28) — one line each; detail in the archive
| item | what | bim-ootb PR | witness |
|---|---|---|---|
| P0 | phone cost measured (May vs HEAD, headless phone); GPU freeze settled in a sandbox | — | — |
| P1 | one capability owner; phone-dead controls hidden; panels on screen | #3458 | W-MOBILE-P1 23/0 |
| P2 | one way to close any panel; one at a time; spill-through fixed | #3459, #3462 | W-MOBILE-P2 63/0 |
| P3 stage 1 | no shader freeze on phones; silhouette refine off; SheetJS on demand; boot-weight ratchet in CI | #3460 | W-MOBILE-P3 9/0 |
| P5 F1+F2 | auto X-Ray on Walk; the walk in the op-log | #3461 | W-FIELD-OPS 8/0 |
| P5 F3 1–2 | Send to HQ: local bundle + email via the share sheet | #3468 | W-SEND-HQ 5/0 |
| P6 | panels as bottom sheets in the top layer | #3469 | W-MOBILE-PANELS 43/0 |
| P5 F3 3 | Send to HQ into the team folder, sealed + signed, offline queue | #3471 | W-SEND-HQ-TEAM 10/0 |
| P5 F3 4 | HQ view: Get from team, one Issue Log, walk replay | #3474 | W-HQ-VIEW 9/0 |
| HMI | drawer row closes its drawer; Issue Log on a phone; team panel wording | #3476, #3480, #3473 | DRAWER-ROW 24/0, ISSUE-LOG-ROUTE 12/0, TEAM-PILL 15/0 |
| clash | one tolerance per clash pair (matrix = list); clash list as a sheet | #3491, #3496 | CLASH-COUNT-AGREE 9/0, MOBILE-CLASH-SHEET 7/0 |
| Issue Log | the empty list names the route that exists | #3492 | ISSUES-EMPTY-ROUTE 4/0 |
| GitHub live | team-folder send/get against the real API | #3495 | SEND-HQ-GITHUB-LIVE 6/0 |
| P3 stage 2 | Chart.js, then the Alt+C editor, off boot via `APP.lazy` | #3497, #3499 | BOOT-CHART-LAZY 4/0, BOOT-CPE-LAZY 6/0 |
| film | FILM-M1 rc4 final (real offline scene); scripts | BIMCompiler #1336, #1353 | GUARD_CARDS 32/0, WITNESS_STAGE 141/0 |
| guide | BIM User Guide: Send to HQ, Get from team, walk replay | BIMCompiler #1352 | live `#send-to-hq` |

**Older open levers (2026-07, not re-checked since):** meta+geo DB split under-used (some `_meta.db` empty on OCI); OPFS-resident building DB for repeat opens; the restored mobile MergedMesh path (live since sw v873). See the archive's OPEN LEVERS and NEXT SESSION sections.

## Section index — every section of the old file, verbatim titles, now in prompts/archive/MOBILE_PERF_history_to_2026-11-28.md
(code comments cite these names; search the archive for the title)
- WHERE IT LIVES (code) · THE SHIPPED STACK · THE GPU FALLBACK · DELIBERATELY NOT ON MOBILE · HARD CONSTRAINT · OPEN LEVERS
- 2026-07-28 FINDING — the mobile MergedMesh low-draw path is DEAD CODE · SPEC (2026-07-28) — restoring the merged path WITH the GUID contract (Parts 1–4) · ✅ DONE 2026-07-28 — IMPLEMENTED · ✅ DEPLOYED LIVE 2026-07-28 — sw `v873` · NEXT SESSION — open items, ranked · TEST / WITNESS · SOURCES CONSOLIDATED HERE
- §2026-10-06 FINDING — two different `_isMobile` definitions
- §2026-11-26 REVIEW — mobile HMI + perf drift (A–D) · §2026-11-26 P0 RESULT
- §P1 SPEC (+ ✅ P1 DONE) · §P2 SPEC (+ ✅ P2 DONE) · §2026-11-27 P0 SANDBOX RESULT · §P3 SPEC (+ ✅ P3 STAGE 1 DONE) · §2026-11-27 LEVELS OF IMPROVEMENT
- §P5 SPEC (+ ✅ P5 F1 + F2 DONE) · §P5 F3 SPEC · §2026-11-27 PANELS · §2026-11-27 OWNER DECISIONS · ▶ NEXT SESSION FIRST — FILM-M1 · §FILM-M1 RECORDING SPEC (+ ✅ rc1)
- §P5 F3 STEPS 1–2 BUILD SPEC (+ ✅) · §P6 PANELS BUILD SPEC (+ ✅) · §P5 F3 STEP 3 BUILD SPEC (+ ✅) · §P5 F3 STEP 4 BUILD SPEC (+ ✅) · §2026-11-27 EVENING (+ ✅ FILM-M1 rc3)
- §2026-11-28 rc3 NOTES SETTLED + rc4 BUILD SPEC · §2026-11-28 CLASH COUNT SPEC · ✅ FILM-M1 rc4 · §2026-11-28 CHECKS (W-SEND-HQ-GITHUB-LIVE SPEC + ✅, ✅ CLASH LIST AS A PHONE SHEET)
- §P3 STAGE 2 SPEC (+ ✅ MOVE 1) · §P3 STAGE 2 MOVE 2 SPEC (+ ✅ MOVE 2) · §2026-11-28 MOBILE TASKER — PROPOSAL · §2026-11-28 MOBILE TASKER — backbone DECIDED
