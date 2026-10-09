# ⚠ DO NOT REMOVE
**Scope:** a SYNC + PLUGIN LAYER between a local-first SQLite UI (ERP kernel: ThaiGoldPawn Flutter first, any
later module after) and a LEGACY iDempiere server, talking ONLY through iDempiere's stock WebServices, ONLY in
documents + doc-actions. **HIGH-LEVEL ARCHITECTURE DRAFT (2026-10-09) — no code. Iterate from here.**
Spec-first: every §Wx witness below is named before any implementation. Read the log after every run.
Never touch a real server without an explicit GO. EXTRACT/COMPILE ONLY — nothing here is invented; every
unknown is a ⛔ in §9, not a guess. Honour until DONE.

# SQLite ⇄ iDempiere — the Bridge

## §0 Why (user directive, 2026-10-09)
- New UI = SQLite, local first (Flutter desktop/mobile). New addons, changes, validation rules are tried HERE.
- Legacy iDempiere stays until everyone is convinced it is redundant. So both must live side by side, possibly years.
- Legacy users must see the SQLite UI's work as if it were a normal user: real documents, real doc-actions,
  real DocumentNo, real Fact_Acct. **No direct SQL into legacy, ever — no loophole.**
- Same rule coming down: legacy changes arrive as docs + doc-actions, replayed through the LOCAL doc engine —
  not as row copies. That also proves the local UI can run the usual doc-actions.

## §1 One picture
```
 Flutter UI (pawn, POS, …)           legacy iDempiere (v12, ZK, Postgres)
        │ local-first                         ▲  │
        ▼                                     │  │  stock WebServices only
 ┌───────────────────────── BRIDGE ───────────┴──┴─────────────────────────┐
 │  Component registry  (descriptor per module: tables, WS types, order)   │
 │  UP   pusher  : outbox op-log → create_data / set_docaction (batched)   │
 │  DOWN folder  : query_data since watermark → local doc engine replay    │
 │  Id map       : local uuid/provisional DocNo ⇄ server C_*_ID/DocumentNo │
 │  Verifier     : per-doc round-trip check + periodic reconcile           │
 │  Transport    : ADInterface client (XML, stateless login per call)      │
 └──────────────────────────────────────────────────────────────────────────┘
        │
 ERP kernel (SQLite): docstatus FSM · op-log · posting engine · rules DB
```
The kernel already owns: op-log + chain (`kernel_ops`), sync FSM + idempotent sequencer + rebase
(`build/erp/erp_sync_fsm.js`, `erp_sequencer.js`, `erp_relay_*`), signed checkpoints (`erp_period_close.js`).
The Bridge REUSES these; the "remote" is just iDempiere instead of our dumb relay. (Memory: project_erp_sync_fsm.)
Wire contract + stateless auth + WS_WebServiceType whitelist already VERIFIED from source in
`prompts/BIM_OOTB_LEGACY_IDEMPIERE_INTEGRATION.md §3/§5` — reuse, don't re-derive.

## §2 Transport (verified 2026-10-09 from `org.idempiere.webservices/.../ModelADService.java`)
Ops available: `createData · updateData · deleteData · readData · queryData · createUpdateData · getList ·
setDocAction · runProcess`. That is the entire vocabulary the Bridge may use. Doc-actions go through
`setDocAction`; anything else (posting, allocation) goes through `runProcess` or happens as a server-side
consequence of the doc-action — never by writing the result rows.
Newer REST (`/api/v1`) exists only if the target runs the REST plugin — NOT assumed; ADInterface is the baseline.

## §3 UP path — local → legacy ("as if a user typed it")
1. Local action = kernel op (create doc, edit lines, `DocAction`). Appended to the **outbox** (existing op-log,
   `synced=0`). Local posting happens immediately so the UI works offline.
2. Pusher replays per document, in causal order: `createData(header)` → `createData(lines)` → `setDocAction(DR→CO…)`.
   Batch = many docs per sync run; order across docs follows the component's declared dependency order.
3. **Server is the authority for numbering + posting.** DocumentNo, C_*_ID come back and go to the Id map.
   Local provisional numbers (own prefix) are shown until mapped; printed documents wait for the real number.
4. **Verify after push, per doc:** `readData` the doc → compare header/lines/docstatus to local → compare
   server Fact_Acct to the locally computed postings (§W3). Mismatch = doc marked `SYNC_DIVERGED`, never silently fixed.
5. Idempotency: **no marker on the server** (nothing disturbed). The Bridge keeps the op_uuid ⇄ server id map locally and
   confirms via AD_ChangeLog (§4) that a doc exists before re-sending after an ambiguous failure. Our pushes appear in
   the change log as a normal WS session = "another legitimate client posting work" (verify §W6: session attribution).
6. Failure of a doc-action (e.g. server validation rejects CO) = the op is REJECTED on the server's say-so:
   local doc rolls to a visible `REJECTED` state with the server's message. Local rule must then be fixed or the
   server rule mirrored — that is exactly the signal §0 wants.

## §4 DOWN path — legacy → local ("fold since last update")
**Decision 2026-10-09 (user): infer server state from `AD_ChangeLog`, not from `Updated` timestamps.**
1. Per component: watermark = max `AD_ChangeLog_ID` seen. `queryData` on the AD_ChangeLog table (read-only WS type)
   with `AD_ChangeLog_ID > :wm`, paged. Each row = one column change: table, record id/UUID, column, old, new,
   event (insert/update/delete), `AD_Session_ID`. (`PO.java:3288-3312` update, `:3655` insert, `:4394-4420` delete path.)
2. Group rows by (table, record, transaction) → rebuild the doc event: header/lines changes + `DocStatus`/`DocAction`
   transitions. Then `readData` the touched docs for the full picture where the log only carries deltas.
3. **Docs, not rows:** a completed server doc arrives as a local `create + DocAction(CO)` run by the LOCAL doc engine.
   Result must equal the server's (posting reconcile §W3). Masters arrive as upserts through the same descriptor.
4. Own echo: changes whose `AD_Session_ID` / record is in the Id map as ours → skip (never double-apply).
5. Deletes ARE visible (delete path writes the log) — closes old Q2 — but only for tables/columns where logging is on.
**Cost on legacy = AD configuration only (no code, no schema):** `AD_Table.IsChangeLog=Y` + `AD_Column.IsAllowLogging=Y`
on the tracked tables (incl. `DocStatus`), plus one read-only WS type for `AD_ChangeLog`. This is the **proposal to the
legacy admin** (§9 P1) — on the pilot copy first. Log growth is the admin's concern: list tracked tables explicitly.
Limits to witness, not assume: change log is skipped for encrypted/virtual columns and when no session exists
(`PO.java:3290-3296`); a table not logged is invisible → fall back to per-table count+hash reconcile for those.

## §5 Plug-in contract — "any component can plug in"
One **descriptor** per module, data not code (same spirit as AD-LAYER LAW: generic engine, no per-window branches):
```
component  : id, version
tables     : [{ local, remote(AD table), keyCols, parent/child, WS serviceType, field whitelist }]
docTypes   : [{ remote C_DocType, local docType, docActions allowed, FSM map }]
order      : dependency order for UP and DOWN
masters    : which tables are server-owned (down only) vs local-authored (up)
mappers    : field/enum maps (pure, deterministic, unit-witnessed)
verify     : which postings/totals must reconcile
```
First components: **Fixed Assets depreciation** (§11, the pilot), then **core trade** (C_Order, M_InOut, C_Invoice,
C_Payment — CORE per AD-LAYER LAW §6). Pawn/loan-installment = AD-model tables per D3, after the pilot. Everything else = later descriptors, zero Bridge change.
Check before designing further: `feat/erp-odoo-descriptor` in bim-ootb and `prompts/PLUGIN_SYSTEM_LANE.md` —
existing descriptor/plugin work that may already fix the shape.

## §6 Conflict + ownership rules (draft, to be ratified)
- **Masters:** server wins (legacy still the book of record).
- **Docs:** immutable once CO. A change = reverse/new doc, never an edit — this is what makes sync conflict-free
  for completed docs. Only DR docs can conflict; local-authored drafts are never touched by DOWN.
- **Same-doc race** (both sides acted): the server's docstatus wins; local doc becomes `REJECTED/DIVERGED` with both
  versions kept in the op-log. No merge heuristics.
- **Numbering:** server DocumentNo is final; local provisional never leaves the device.
- **Model (AD) changes** are authored once as normal AD changes and applied to BOTH sides by each side's own standard
  mechanism (server: 2Pack/AD by its admin; SQLite: `ad_seed`). Legacy gets them only on the admin's say-so.
- **New validation rules** live local; they may only be STRICTER than legacy until a rule is deliberately promoted,
  so a locally-valid doc is never refused by legacy for a rule we forgot.

## §7 Trust + security
Each device holds its own iDempiere login (role-scoped, WS-whitelisted tables only), not a shared key. Stateless
per-call login fields live in the platform secure store. Chain gate + schema-manifest gate from `erp_sync_fsm.js`
apply before any push. Bridge is the ONLY component that holds server credentials; the UI never sees them.

## §8 Witnesses (name before code) — each says what issue it proves
| W | Proves / disproves | Falsifier |
|---|---|---|
| W1 mock-server UP | right calls, right order, idempotent re-send | mock = same ADInterface XML contract; 2nd run = +0 |
| W2 mock-server DOWN | fold since watermark, own-echo dedupe, no double apply | seeded server docs → local state equal |
| W3 POSTING RECONCILE | local doc-engine result == server Fact_Acct (maxDiff = 0 cents) | the REAL oracle: run against real iDempiere postgres (`idempiere` DB local) |
| W4 REJECT | server refuses a CO → local shows REJECTED with message | NO-OP/VACUOUS guard: must print INCONCLUSIVE if nothing judged |
| W5 OFFLINE→ONLINE | N docs created offline, drained in order, ids mapped, count equal | kill network mid-batch, resume = no dup |
| W6 LEGACY-LOOKS-NATIVE | a legacy user's view (windows/records via query) of pushed docs == a hand-keyed doc | field-by-field diff vs a doc created through the ZK UI |
| W7 DIVERGENCE | both sides act on same draft → DIVERGED, nothing lost | |
| W9 PARALLEL-RUN (§11) | local FA rules == server plugin == Fact_Acct, maxDiff 0; diffs → §FLASH | |
| W8 COMPONENT-PLUG | a second descriptor (non-pawn) plugs in with zero Bridge code change | diff shows descriptor-only |
Real server for W3/W6 = the local iDempiere dev setup (`~/idempiere-dev-setup`, postgres `idempiere`), never a client box.

## §9 Decisions + open items
**Settled (user, 2026-10-09):**
- D1 Nothing disturbed on legacy. Server state inferred from `AD_ChangeLog` (§4); no op_uuid column, no schema change.
- D2 Pushes look like another legitimate client; legacy-side behaviour change comes only from the traditional
  plugin the server already runs (parallel-run, §11). Deletes/edits traceable through the same log.
- D3 Everything built ON the AD model (custom pawn/loan tables = AD tables, not side stores) so integration and
  extension are the same mechanism as any module. Pawn is the example of the rule, not the focus.
- D4 Pilot on a LOCAL VANILLA iDempiere (copy of the admin's test server later). Record diffs + flashpoints before any outbound step.
- D5 Hub-and-spoke: mobile → SQLite hub → Bridge → iDempiere. Hub is the only thing that talks to legacy.
**Open (⛔):**
- P1 Proposal list to the legacy admin: which tables get `IsChangeLog` + which columns `IsAllowLogging`; confirm the
  `AD_ChangeLog` WS type is acceptable. (Derive the minimum list from the pilot's flashpoint notes, §11.)
- P2 Does a WebService login create an `AD_Session` whose id lands on change-log rows? Decides own-echo dedupe (§4.4).
  Answer by running it on the local server — W6.
- P3 Local postgres `idempiere` is DOWN right now (port 5432 refused); starting it is a user call (no autonomous starts).

## §10 Next
Start local vanilla iDempiere → W6/P2 probe (login via WS, create one doc, read the AD_ChangeLog rows) → descriptor schema
(§5) → UP/DOWN for ONE doc type → §11 Fixed Assets parallel run.

## §11 Pilot: Fixed Assets depreciation (the first component)
Why: a real feature that on iDempiere normally needs a **new plugin** (DocValidator + event/process). Parallel run:
- Legacy side: the traditional plugin is installed on the pilot server (DocValidate/ModelValidator hooks fire in
  `MDepreciationEntry.prepareIt/completeIt` — `MDepreciationEntry.java:254,264,343`; posting in
  `org.compiere.acct.Doc_DepreciationEntry`). Server believes the plugin is the logic.
- SQLite side: the same rules implemented as a local rule/decision-table + doc engine version. Users work ONLY here.
- Bridge pushes `A_Depreciation_Entry` docs (+ lines) and `setDocAction`; the plugin runs on the server as if a user did it.
- Descriptor tables: `A_Asset`, `A_Asset_Group(_Acct)`, `A_Depreciation_Workfile`, `A_Depreciation_Entry`, `A_Depreciation_Exp`
  (names from `org.adempiere.base/.../model/`; verify the exact set + which are doc vs master from the AD, not memory).
Witnesses: W9 PARALLEL-RUN — same asset/period inputs → local computed expense/workfile == server plugin result == server
Fact_Acct, maxDiff 0. Any difference is logged as a FLASHPOINT (rule differs, rounding, period/calendar, account
resolution) into a `§FLASH` list — that list is the deliverable to the legacy admin before going out (D4).
Needs first: read the stock FA code path (`MDepreciationEntry`, `MDepreciationExp`, `MDepreciationWorkfile`, `Doc_DepreciationEntry`)
and write the local rule spec from it. Which "new rules" (user: "whatever it may be") is NOT assumed — to be supplied.

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
