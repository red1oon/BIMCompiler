<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ERP OOTB ↔ iDempiere UX PARITY — operational integrity in DocType + AD UI behaviour

```
# ⚠ DO NOT REMOVE
SCOPE: the shipped ERP app (bim-ootb `erp/`) judged against ONE bar — an iDempiere user opens a
window and says "this works as well as, or better than, I expected." Engine/witness code lives in
bim-compiler `scripts/` + `build/erp/`; bim-ootb only hosts the app.
NORTH STAR (user, 2026-09-02, quoted): "Our ERP must give exactly the user experience in iDempiere,
improved where we added in the pills such as the graphs page and red pill back to Viewer... Priority
is that an iDempiere user can say ERP OOTB works as well or better than thought."
So: PARITY is the floor, the pills are the surplus. A pill never excuses a missing AD behaviour.
RULES: Spec-first. Log Mandate — read the log, exit code is not evidence. Every § below carries its
own witness claim BEFORE code. Never full-regenerate `erp/ad_seed.db` (bake additively). `erp/sw.js`
CACHE_VERSION bump in the SAME PR as any shipped erp/ change.
```


> **This file was cut down on 2026-11-10** (owner: *"review the specs, remove stale"*). Every finished spec, result and old resume block, 2026-09-02 → 2026-11-10, is verbatim in `prompts/archive/ERP_IDEMPIERE_UX_PARITY_history_2026-09-02_to_2026-11-10.md`. What stays here: where to start, the rules that still bind, what is open. A section name below (§P4-OPEN, §FS-QUEUED …) is a heading in that archive.

## ▶ START HERE — ERP / BIM Document lane (state at 2026-11-10, bim-ootb main, erp sw v1043)
**Merged and live in the last stint:**
| Item | What it does | PR | Witness |
|---|---|---|---|
| FB3 | a row made in the session shows in a transaction window opened by URL (the New-record decision waits for the op-log fold) | bim-ootb #2796 | `erp/tests/witness_autonew_tip.js` 4/0 |
| FB4 | the toolbar Delete on ticked grid rows deletes the selection (legacy `onDeleteSelected`) | #2816 | `witness_delete_po.js` 19/0 |
| Register export | BIM Document register as JSON under the gear; one process download seam (`AdProcess.download`); the BIM Document plugin starts again | #2813 | `witness_bimdoc_live.js` 35/0 |
| FB7 | an IFC document opens in the Viewer by its sha256 (witness arm) | #2818 | same, arm O-2 |
| User guide | "Getting plugins running" (which start themselves, which to switch on, which need Ninja data migration) | BIMCompiler #521 | live page fetched back |
**⛔ Blocked on the owner, one question each:**
- **FB6** (BIM document types). RULED 2026-11-10 (design lane, owner may override): four `C_DocType` rows under DocBaseType `BIM`: **Drawing, Model, Specification, Report**, each with its own number sequence; the default type follows the file kind as a data row (DXF or PDF → Drawing, IFC → Model). **Not ruled:** what becomes of the existing single "BIM Document" type and the documents that carry it: (a) it becomes "Drawing"; (b) it stays as a fifth, general type; (c) existing documents are re-typed by file kind (advice: c). Then, one at a time: where the file-kind default lives as data, the number format per type, the per-client id scheme (today `9541500 + AD_Client_ID`, which leaves the plugin's id band for a born tenant). The mechanism exists (`model_layer.js saveNewNumbers` numbers a table that has a `DocumentNo` column by its type's sequence).
- **FB5** (the N and O record-delete rules of `PO_Record`): needs clearance to query the legacy pilot. Its database answered a read-only query on 2026-11-10.
**Open, not blocked:**
- One end-to-end run of the register hand-over (ERP export → `modeller/tools/project_inputs.js --register` → walk): `MODELLER_MASTER.md` ▶ START HERE item 2.
- Not witnessed: delete-selected's refusal branch and its attachment sweep; the export's "another project stays out" arm (EX-3).
- W-PACKOUT arm O6 fails on untouched main (form fields absent in the Pack Out window): untraced.
- For the MIGRATE_INSTALL_TENANT lane: the three "Migrate from …" bundles need "Ninja data migration" started but declare nothing (`requires: {}`); and a bundle that ships a window must not also insert its own access rows (the host stages them since bim-ootb `b305c211`; that collision stopped BIM Document from starting).
- Tell the NEURO lane: N_proc moved by 1 (the export process); Open now declares `harm: 'writes'`, the export `read`.

## Rules that still bind this lane
- **CLAUDE.md §AD-LAYER LAW and §TWIN CARDINAL RULE**: generic, no table named in the host; legacy is the oracle.
- **Header rules of this file** (top block): spec first, read the log, never full-regenerate `erp/ad_seed.db`, bump `erp/sw.js` in the same PR as any shipped `erp/` change.
- **Owner's clearance rules for a Fable stint (2026-11-10, still standing):** always ask first for any film, bake, screencast or GPU use; for starting the legacy pilot (a read-only "is it up?" is fine); for deep research or a fan-out of agents; for more than 2 Sonnet agents at once or any agent that is not Sonnet. Never: paid model calls, publishing or re-cutting the BIM Document films (final, local only), binary DB commits, `--no-verify`. Stop when an item costs about twice its estimate or fails the same way twice.
- **Method, learned the hard way in this file's history:** run a new witness on untouched main first (a sweep that passes there is scope-blind); drive the real toolbar and read the state after a reload (three "CRUD ok" witnesses clicked a button no user could see); a plugin can pass every headless check and still fail to start in the page; fetch the live file back before saying "live".


## §LENS-REGISTER — action lenses against the AD rule (owner, 2026-11-09)
*"extra process lens should be avoided to comply for consistent maintainability. It is precisely the idea of legacy plugins to be adopting the AD."* · *"I know some earlier lens adoption broke that rule, but now is the opportunity to begin getting it right."*
**Why it matters beyond maintenance (owner, 2026-11-09):** *"Such AD layer allows the verb CLI scripting to work on it as an ORM."* What the dictionary defines, the verb layer can generate (tables → read/create/update/delete verbs; each `AD_Process` → a verb with its parameters; each DocAction → a verb with its legal WfMC transitions; computed columns → readable values), so it reaches the CLI, the AI menu and every channel at once and is counted in the NEURO roadmap's "X of 1,153 ERP actions" (`NEURO_SYMBOLIC_ORDER_CONTRACT.md` §22.6 D6). A lens action is invisible to all of that and needs a hand-made verb: one more reason it must move into the AD.
**Standing instruction:** any session that comes across a lens that registers record ACTIONS (`ctx.lens.register`, `AdLens.register`, a ⋯-rail action) adds a row here and a ⚠ AD-LAYER NOTE in that lens's own prompt file. View lenses (Graph/Kanban/Pivot/Chat dashboards, film overlays) re-present data, not processes, and are out of scope. Fix direction for every row: behaviour into the dictionary (`AD_Process` on the table/tab via the generic gear; computed values as `ColumnSQL` columns), the lens kept only as a shortcut to it or deleted. Generic guard to build once: a staged plugin's user actions are all enumerable from the AD (§BIMDOC-FEEDBACK).
| Lens | File (bim-ootb) | Actions | State against the rule | Note placed |
|---|---|---|---|---|
| bimdoc | `erp/plugins/bim_document.mjs` | Open in Modeller / Viewer; BIM progress; Export Register | **fixed 2026-11-09/10**: the lens is deleted; Open and Export are AD processes under the gear, progress is virtual columns (bim-ootb #2769, #2813). W-PLUGIN-AD-ACTIONS: 4 AD actions, 0 side doors | archive §BIMDOC-ADPASS |
| friendly-ops | `erp/plugins/friendly_ops.mjs:453` (host `erp/ad_lens.js`) | Save & Complete, Add child / Save & back, Next step, related counts, Preview, Receive payment | mostly shortcuts to AD paths; **Preview and Receive payment to be checked** | `ERP_FRIENDLY_OPS_LENS.md`, `POS_PLUGIN_LOCAL_FIRST.md` |


## Open items carried from the history — as written at their date, NOT re-verified on 2026-11-10
Each line is a pointer, not a claim that it is still open: other lanes have worked in the same code since. **Check the code or re-run the named witness before acting on any of them.**
| From (archive section, date) | What it named as open |
|---|---|
| §P4-OPEN / §STATUS-2026-09-03 | DocAction bodies for 20 of 23 document tables; `legalDocActions` dead code; the DocStatus cell edit path not FSM-gated; the second-layer ReActivate check; `AD_Val_Rule_Lookup_ID`; 5 uninterpretable validation rules; the `ad_modelval` three-way copy drift; undeclared `post_resolver` / `doc_poster` twin pairs. **⛔ owner question never answered:** should Complete hard-reject a document whose `DateAcct` is in a closed period, or log and allow? |
| §FS-QUEUED (2026-10-02) | FS-1 … FS-11, the first-setup gaps of a born tenant (document types, 12 periods, currency list, tax category and payment term, cross-client FK picker rows, order line pricing on a new order, fan-out on a session order, a duplicated grid id, process parameter pickers, I_* import tables, Backup/Restore on the ERP page). Several were later worked by the genesis and migration lanes (`MIGRATE_INSTALL_TENANT.md`): verify each there first. |
| §GT-RESULT (2026-10-04) | window 201 Request: no create form within 20 s in the sweep, not diagnosed |
| §GT.9 (2026-10-04) | engines proven headless in bim-compiler `build/erp/` and never wired into the shipped app (VFormat, `ad_workflow.js`, others listed there) |
| §CP-EDITOR / §CP-NEW (2026-10-04/05) | a callout-set value outside the validated dropdown (witness exists; its live re-run was blocked by a stale `pilot_ours.openWin` selector); New does not inherit the current row's window context; the Order form's `M_PriceList_ID` is a curated number input, not the AD lookup; CalloutCashJournal's window 198 never mounts in the pilot witness |
| §MD-UPSTREAM (2026-10-07) | the trigger of the unscoped detail tab was never reproduced; the fail-closed hardening is merged (bim-ootb #2641) and logs `§GT-OPEN-DEGRADED` / `§GT-OPEN-NOLINK` if it recurs |
| §ATT-NEXT (2026-11-08) | one attachment made on the legacy side for a live parity run; the Session Audit window's Attachment button disabled until Refresh; 91 tabs the attachment witness could not open; `scripts/poc_*` witnesses that read the stale `build/erp/` copy. (Its item 2, attachments following a record's delete, is done: bim-ootb #2757.) |
| §DEL-RESULT (2026-11-05, archive Part 2) | the old `poc_*_live` witnesses serve `erp/` as the root and nothing runs them; `ModelLayer.remove` called from a process port applies no FK rules; grid cells evaluate DisplayLogic in the login context only; `getLimitPrice` needs `IProductPricing`; the Hospital demo's Committed values collapse when a line is saved; a row created in the ERP does not reach the viewer's push store; `scripts/poc_crud_ownergate.js` judges a stale copy. (Its "multi-select delete not ported" is done: FB4.) |
| §GRID-CLICK-2-RESULT (2026-11-05, archive Part 2) | film scripts and row-clicking witnesses that expect a form after one real click now only select; a script's `tr.click()` still opens the record on purpose |

## What is in the archive (finished; one line each)
- **2026-09-02/03, the first parity pass:** §MEASURED, §P1–§P11 with their §IMPL and RESULT sections, §TWIN-WIDENED / §TWIN-CLASSIFIED. The curated five-table field list retired; List, Yes-No, validation-rule and table-reference editors; mandatory-on-create; GL category; DocNo control.
- **2026-10-02 → 10-07:** §FS first-setup journey, §MD master-detail, §GT the GridTab layer (one tab contract for every window), §GT-NINJA, §CP core callouts and processes verbatim, §MD-UPSTREAM + §BIM-CRUD, §PROJ-VARIANCE.
- **2026-10-17 → 11-05:** §GRID-CLICK, §FIND-LF, §DEL (toolbar Delete = `GridTable.dataDelete` + `PO.delete`, FK rules, MProjectLine), §GRID-CLICK-2.
- **2026-11-08 → 11-10, the BIM Document:** §ATT attachments, §BIMDOC … §BIMDOC-5 design and rulings (states Draft → Issued for review → Issued for construction → Superseded), §PROJ-CAT, §BIMDOC-FILM, build results, §BIMDOC-OPEN, §BIMDOC-FEEDBACK (FB1–FB7), §BIMDOC-ADPASS, the Fable stint block, §FB3, §FB4, §REGISTER-EXPORT, §FB7, §BIMDOC-START-BROKEN, §PLUGIN-GUIDE.
