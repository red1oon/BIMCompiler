# ⚠ DO NOT REMOVE
**Scope:** a SYNC + PLUGIN LAYER between a local-first SQLite UI (ERP kernel: ThaiGoldPawn Flutter first, any
later module after) and a LEGACY iDempiere server, talking ONLY through iDempiere's stock WebServices (§2 vocabulary), writing ONLY as documents + doc-actions
(reads for snapshots/log). **ARCHITECTURE DRAFT, HARDENED 2026-10-09 (§P principles, §Q pre-mortem). Built so far: change-log tracker only.**
READ FIRST for the POS flow (do not ask what these already answer): `docs/internal/POSLens.md` §1-4 and
`docs/internal/POS_ADDON_SPEC.md` §1-3 — the user's Unicenta⇄iDempiere concept. (The wiki pages 403 to WebFetch.)
Spec-first: every §Wx witness below is named before any implementation. Read the log after every run.
Never touch a real server without an explicit GO. EXTRACT/COMPILE ONLY — nothing here is invented; every
unknown is a ⛔ in §9, not a guess. Honour until DONE.

# SQLite ⇄ iDempiere — the Bridge

## §000 SCOPE (user, 2026-10-09) — the limit
**IN SCOPE (normal-user lane):** an ordinary user's work in the SQLite UI syncs to legacy as docs + doc-actions (§3 UP),
and legacy users' doc work comes back through the change log and is replayed locally (§4 DOWN). Role = a normal
WebService user. Built + witnessed so far: the §4 tracker (W10, §13). First reference flow = §16 (order lines up, ProductQty down);
the document-DOWN replay (§4.3) is for later plugins.
**Model sync happens ONCE, together, at handover (user 2026-10-09)** — the SQLite side and legacy start from the same
model. After handover the Bridge exchanges DATA only, like a layman's integration (user's prior art: Unicenta POS ⇄ iDempiere).
Any later model change is the superior-role extra below, not part of routine sync.
**OUT OF THE CORE (extra, SUPERIOR ROLE only — admin/SuperUser lane, built later, never needed for a user to sync):**
§14 model-drift sentinel (AD_Field/AD_Column, W11), §15 hard rule + backdoor register (W12/W13), §11 plugin example,
model (AD) sync itself. A normal user's sync never depends on them; they must not gate or slow it.
Only two lane-relevant facts from the extras apply to normal users: F1 (draft inserts invisible unless
`SYSTEM_INSERT_CHANGELOG=Y`) and the per-component list of logged columns.

## §P PRINCIPLES (invariants) — every section above and below must obey these; a PR that breaks one is rejected
Each principle: rule · where it comes from · how it is ENFORCED (not just stated) · witness.
| # | Principle | Source | Enforced by | Witness |
|---|---|---|---|---|
| P1 | **Legacy untouched.** Bridge uses only the 9 stock WS ops (§2) + AD config the admin chooses. No SQL, no schema/column, no custom table on legacy. | user D1, CLAUDE.md DB rule | transport has an allow-list of ops (anything else throws); Bridge code has no postgres client (grep gate) | W-P1 |
| P2 | **Look like a normal user; never write derived data.** Writes are documents + doc-actions only. Server owns numbering, posting, totals, stock. Never write `Fact_Acct`, `M_Storage`, `M_Cost*`, `GrandTotal`. | user §0 | descriptor validator rejects derived tables/columns as write targets | W6, W-P2 |
| P3 | **Layer is plugin-agnostic.** No plugin table/column names inside the layer; a plugin = descriptor + rules + UI. | user §00 | grep gate (no `C_Order`/`M_Product`… literals in layer code); W8 diff is descriptor-only | W8 |
| P4 | **Local-first.** UI never waits on the network; offline = fully working; sync is a background worker. | user §0 | UI path has no sync call; W5 with network killed | W5 |
| P5 | **Extract / never invent.** Context (Org, PriceList, warehouse, customer, doctype) comes from config inferred from the user's Unicenta project. Missing context ⇒ sync REFUSES (`BLOCKED_NO_CONTEXT`), never defaults. | PRIME RULE | context completeness check before first push | W-P5 |
| P6 | **Server is authority; no silent fix.** A mismatch becomes a visible state (`REJECTED` / `DIVERGED`), never an automatic correction or drop. | §6 | state machine has no auto-resolve transition | W4, W7 |
| P7 | **Idempotent + resumable.** Kill at any step ⇒ re-run gives no duplicate and no loss. An undecidable case PARKS, it does not guess. | user | W5 kill-points: before header / between header & lines / before CO / after CO | W5 |
| P8 | **No poison.** One bad ticket never blocks the others; it is parked with the server's reason and stays visible to a manager. | pre-mortem | queue is per-ticket, not per-batch | W4 |
| P9 | **Scope lock.** Only flows the user described (§16: order lines up, ProductQty down). A new flow needs a dated user quote in §9 first. | user 2026-10-09 ("do not drift") | review checklist; §16 is the only flow list | review |
| P10 | **Witnesses can fail.** Each names its falsifier, prints `INCONCLUSIVE` when nothing was judged, carries a negative control, and logs `§` lines read before conclusions. | CLAUDE.md WITNESS law | W10 is the template | all |
| P11 | **Credentials only in the Bridge, secure store, per device; no defaults in code for non-localhost.** | §7 | `cfgFromEnv` refuses missing creds unless base is localhost pilot | W-P11 |
| P12 | **Deterministic numbers.** Money as integer minor units, quantities as decimal strings; no float arithmetic on amounts. | feedback_numbers_via_bigdecimal | mappers unit-witnessed | W-P12 |
| P13 | **Bounded.** Every read pages (or fails loudly); every retry has a cap + backoff; auth faults stop immediately (no retry — account lockout). | pre-mortem G9/G15 | `§AD_PAGED` throw (exists); retry policy in outbox | W-P13 |
| P14 | **Claims cite evidence.** Any statement about iDempiere behaviour cites source `file:line` or a pilot measurement; unknown ⇒ ⛔ not a guess. | CLAUDE.md | review | review |
| P15 | **Dumb terminal, no free numbers.** POS sends orderlines (product ref, qty, station); price = PriceList master reference; stock/replenishment/backflush are ERP-side results the POS only receives. The layer never computes them for the POS. | POSLens §1-4, user 2026-10-09 | descriptor validator: a UP line may carry no price/amount field; unknown product ⇒ refuse | W-P15 |
| P16 | **Question protocol (user 2026-10-09).** Every question to the user states (a) the concept source it aligns to (POSLens / POS_ADDON_SPEC / a dated user quote) and (b) **IN** or **OUT** of that concept. OUT ⇒ do not ask: drop it or defer it to "infer from the Unicenta project later". Facts the concept already answers are never asked. | user | self-check before asking; open items below carry the tag | review |
Witness ids W-P1/P2/P5/P11/P12/P13/P15 are small structural/unit checks, to be written before the module they guard.

## §Q PRE-MORTEM — what we had missed (found 2026-10-09 by re-reading the spec against the pilot; each has an owner)
| # | Gap | Evidence | Resolution / status |
|---|---|---|---|
| G1 | **Idempotency vs F1.** After a timeout post-create, the change log cannot tell us whether the order exists (inserts unlogged by default). My earlier §3.5 relied on it. | W10 `§W10_INSERT_MODE` | Proposal: carry the POS ticket key in a standard free-text field a normal user also fills (e.g. order `POReference`/`Description`) and check existence with a read of that field. Zero schema change, but it IS a convention on legacy data IN concept (idempotent op, POSLens §3 'dupe refused'), but WHICH field = a Unicenta-project fact ⇒ DEFERRED to inference from that project, not asked now; until then ambiguous failure PARKS (P7). |
| G2 | **Partial documents.** Header and each line are separate `create_data` calls with no shared transaction ⇒ crash between them leaves an orphan DR header. | ModelADService: one op per call | Probe stock `composite` WS (CompositeInterface, present in pilot) as one transaction (W1); else compensate: find orphan by the G1 key and void/complete. Kill-point test in W5. |
| G3 | **Server effects are larger than "order lines" — MEASURED.** DocType 'POS Order' (WR) auto-creates shipment + invoice at CO; Store Central Oak Tree on-hand 4→3, shipments=1, invoices=1 on order 80005. A 'Standard Order' would NOT drop stock. | pilot probe 2026-10-09 | Context doctype must be the POS one; legacy users will see shipment+invoice appear ⇒ tell the admin. Confirms §16 rule 2 (stock falls at CO). |
| G4 | **Rejected sale.** POS already handed goods over; legacy CO may fail (stock/period/credit). A rejected sale cannot be "un-sold". | policy | Never dropped: stays `REJECTED` with reason, visible. The resolution policy is ERP-side business, OUT of the layer's concept (dumb terminal, P15) ⇒ not asked. |
| G5 | **Price must not be a keyed number.** My pilot probe sent a made-up `PriceActual=10` and the server accepted it (line 10, GrandTotal 10) — iDempiere does not stop a client from supplying price, so the discipline must live in the Bridge. | probe order 80005; POSLens §4 'no free numbers' | Bridge sends product ref + qty; price comes from the PriceList master row only (P15). Read-back compares local line amounts vs server `LineNetAmt`/`GrandTotal`; mismatch ⇒ DIVERGED (P6). The probe's price was a test artefact, not a design. |
| G6 | **Unknown product / master drift.** Product missing on server ⇒ the ticket rejects; new legacy products never reach POS (masters sync only at handover). | §000 | Per-ticket reject (P8). Product/price DOWN is NOT in the described flows ⇒ out of scope until user adds it (P9). |
| G7 | **Several POS devices, one warehouse.** Snapshot contains other devices' sales. | design | Rule 2 subtracts only THIS device's unconfirmed lines ⇒ correct; document it. |
| G8 | **Snapshot race.** A snapshot read mid-batch can double-count (line confirmed on server, not yet marked locally). | design | Apply a snapshot only when the outbox has no PUSHED-but-unconfirmed lines; otherwise defer to next cycle. Witness in W16. |
| G9 | **Account lockout.** Login is repeated on EVERY call; retrying a wrong password can lock the user (`USER_LOCKING_MAX_LOGIN_ATTEMPT`; pilot value 0 = off, real server unknown). | `ad_sysconfig` pilot; stateless auth §2 | Auth fault ⇒ stop, no retry (P13). Admin-handshake item (P1 list), IN concept as a legacy-side fact; not a user question. |
| G10 | **Session-table growth.** Every WS call creates an `AD_Session` row (pilot ids 1000105–107 for 3 calls) — a real footprint on legacy. | pilot `ad_session` | Batch via composite where possible; tell the admin; measure rows/ticket in W15. |
| G11 | **Sale date.** An offline sale synced next day gets the server's date unless `DateOrdered` is sent ⇒ wrong period / closed period rejects CO. | iDempiere period control (not yet probed) | IN concept (the orderline is a timestamped party-act). Technical: descriptor maps the act's date; W15 probes a past-dated order. Not a user question. |
| G12 | **Receipt numbers.** POS prints a ticket before server numbering. | §3.3 | OUT of the described cases (orderlines up, qty down) ⇒ dropped, not asked. |
| G13 | **Paging.** Tracker throws (`§AD_PAGED`) if server paginates; a large backlog would stall it. | `ad_client.js` | Must page by id range before any large log; build item (P13). |
| G14 | **Pilot credentials in code.** `cfgFromEnv` defaults to GardenAdmin/GardenAdmin. | `ad_client.js` | Fixed now: defaults only for a localhost base (P11). |
| G15 | **Org/warehouse consistency.** Login org must own the warehouse ("warehouse not allowed for this org" seen). | pilot probe | Context validated at setup (P5). |
| G16 | **Version drift.** Local source is 278 commits behind upstream; PO now batches change-log writes. | §15.1 | Re-run W10 on the target server version before relying on it. |
**Rule going forward:** a new gap goes into this table with evidence and an owner the same day it is found.

## §00 Principle (user, 2026-10-09)
The Bridge is the ONE place for all sync scaffolding — transport, change-log tracking, id map, replay, verify, outbox,
reconcile. A plugin/module (Fixed Assets, pawn, loans, …) contributes ONLY a descriptor (§5) + its local rules.
Nothing plugin-specific is allowed inside the Bridge; the next plugin must not redo any scaffolding. Build order is
therefore (superseded by §17 needed-now list): tracker built first; the POS-minimal flow (§16) drives what is built next.

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
 │  Transport    : ADInterface client (JSON, stateless login per call)     │
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
4. **Verify after push, per doc:** `readData` the doc → compare header/lines/docstatus/GrandTotal to local → (plugins that
   post locally) compare server Fact_Acct to the locally computed postings (§W3; not needed for POS-minimal §16). Mismatch = doc marked `SYNC_DIVERGED`, never silently fixed.
5. Idempotency: **no new column/marker structure on the server.** The Bridge keeps the op_uuid ⇄ server id map locally.
   ⚠ Re-sending after an AMBIGUOUS failure (timeout after create) cannot be decided from AD_ChangeLog in default config —
   inserts are not logged (F1). See §Q G1 for the proposed natural-key check; until ratified, an ambiguous failure PARKS the ticket. Our pushes appear in
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
First component: **POS-minimal** (§16, user's Unicenta pattern). Examples only: Fixed Assets (§11), then **core trade** (C_Order, M_InOut, C_Invoice,
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
| W9 PARALLEL-RUN (§11, extra) | local FA rules == server plugin == Fact_Acct, maxDiff 0; diffs → §FLASH | |
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
- ~~P2~~ ANSWERED 2026-10-09 on the pilot (§12): WS calls create an `AD_Session` (`WebSession='WebService'`) and every
  change-log row carries `TrxName = ws_<service>_<uuid>`. Own-echo = `CreatedBy` is the Bridge user AND trxname `ws_*`.
- ~~P3~~ pilot stack is up (§12).

## §10 Next
Start local vanilla iDempiere → W6/P2 probe (login via WS, create one doc, read the AD_ChangeLog rows) → descriptor schema
(§5) → UP/DOWN for ONE doc type → §11 Fixed Assets parallel run.

## §11 [EXTRA] Example component: Fixed Assets depreciation (illustration only — the Bridge is plugin-agnostic)
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

## §12 Pilot stack + first measured facts (2026-10-09, local vanilla copy — nothing on a real server)
- Postgres: docker `postgres` (5432), DB `idempiere_pilot` (copy). Server: `~/idempiere-pilot/start.sh|stop.sh`, http **:8088**.
- Proposal applied on the PILOT only: `scripts/bridge/pilot/ws_changelog_read.sql` — one read-only WS type `QueryChangeLog`
  (AD_ChangeLog, all 22 columns output, role 102 read-only; params TableName/Action constant, Filter/RecordID free).
  This file IS the proposal text for the legacy admin (§9 P1).
- Wire: JSON works at `/ADInterface/services/rest/model_adservice/query_data` (body `{"ModelCRUDRequest":{"ModelCRUD":{
  "serviceType":"QueryChangeLog","Filter":"AD_ChangeLog_ID > N"},"ADLoginRequest":{…,"OrgID":11,"WarehouseID":103}}}`).
  Do NOT send TableName/Action when the type fixes them as constants (server faults "invalid parameter"). XML with the
  namespace I tried returned null request; JSON is the working form — supersedes §3 of the BIM integration note.
- A WS type created in the DB after server start is NOT seen until the server is restarted / AD cache reset (cache hit
  of the failed first lookup). Bridge setup docs must say so.
- **Vanilla already logs a lot:** 723 tables `IsChangeLog=Y`, 23,185 columns `IsAllowLogging=Y` — the legacy admin may
  need to change little or nothing; P1 becomes "confirm which of the existing set we rely on", not "turn it all on".
- **Change-log shape (measured):** one `AD_ChangeLog_ID` covers ONE record save, with one row PER COLUMN → key is
  (AD_ChangeLog_ID, AD_Column_ID), not the id alone. Rows carry `Record_ID`, `OldValue/NewValue`, `EventChangeLog`
  (I/U/D), `AD_Session_ID`, `TrxName`. Seed rows 1000198–1000200: a WS `setDocAction` DR→CO on C_Order(318) record 1000005
  shows `DocStatus DR→CO`, `Processed`, `DocAction` in order — a doc-action IS reconstructable from the log.
- **Watermark risk to witness:** ids are allocated at save but rows commit with the transaction → a long transaction can
  commit a LOWER id after a higher one was already read. Reader must re-read a trailing window and dedupe by
  (id, column) (§W10).
- Remaining unseen: the log holds only changes on tables/columns with logging on; not witnessed yet for a given component.
- Also present in stock: `CompositeInterface` WS (`composite` method) — candidate for the UP batch (§3), not yet probed.
- New witness W10 CHANGELOG-TAIL: read since watermark, window re-read, no row lost/duplicated across an interleaved
  long transaction; prints INCONCLUSIVE when the window held zero rows.

## §13 BUILT + WITNESSED 2026-10-09 — change-log tracker (first Bridge module)
Code: `scripts/bridge/ad_client.js` (transport; throws on `IsError`), `changelog_tracker.js` (watermark + 200-id trailing
window + dedupe on (id,column) + per-save events + DocStatus transitions + own/foreign tag), witness
`witness_changelog_tail.js` (W10). Pilot fixtures: `pilot/ws_changelog_read.sql` (QueryChangeLog/QueryADColumn/QueryADTable),
`pilot/ws_test_access.sql` (role 102 on stock order WS types; deactivates leftover acct schema 'CP Copy Target' that made
CompleteOrder NPE). Run: `node scripts/bridge/witness_changelog_tail.js` → read the `§W10_*` lines.
Result (both modes): `§W10_VERDICT PASS` — COMPLETE (tracker rows == DB rows: 9 / 94), DOCACTION (real WS order created,
line added, `setDocAction CO` → event `DocStatus DR→CO` on the right record, trx `ws_modelSetDocAction_*`), OWN (own vs
foreign tagged), IDEMPOTENT (re-poll fresh=0), LATE (window=200 catches a lower id committing after a higher one;
window=0 negative control MISSES it — the witness can fail).
**Flashpoint F1 (for the legacy admin):** vanilla `SYSTEM_INSERT_CHANGELOG=N` → document/draft CREATION is invisible in the
log; only updates (DR→CO etc.) show. Measured: N → 0 insert events; Y → 2 (order + line). To see new drafts the admin must
set it to Y (an AD_SysConfig value, no code) — or we accept seeing a doc only when it is first updated/completed. Add to §9 P1.
**Flashpoint F2:** a WS type added in the DB is invisible until server restart / cache reset.
**Flashpoint F3:** the change log carries no line items' inserts when F1=N, so a completed doc's lines must be fetched
with `readData` after the DocStatus event (§4.2) — the log alone cannot rebuild a doc in default config.
**Window cost:** a 200-id window re-reads ~380 rows per poll on this small copy (dense ids) — fine here; tune per volume.
Not yet built: UP path (§3), local replay of DOWN events through the doc engine (§4.3), Id map, outbox.

## §14 [EXTRA — superior role] Model-drift sentinel (user idea, 2026-10-09) — spec only, not built
Goal: know "the model changed in a way that matters" from the change log alone, without tracking the whole dictionary.
- **AD_Field = the user-visible sentinel.** A field edit/insert means something a user sees changed. AD_Tab / AD_Menu /
  AD_Window changes alone are not usable signals (no field behind them) → NOT tracked.
- **AD_Column = the rule sentinel.** Mandatory, default, validation rule ref, reference type, length live on the column and
  can change with NO field edit. A new column with no field yet is invisible to users, but a rule change on an existing
  column is not → track AD_Column (user-confirmed).
- Candidate third (to decide by witness, not assume): `AD_Val_Rule` (its code is referenced by a column — the column row
  does not change when the rule's SQL does) and `AD_Process` params if a component uses them.
- Use: drift event ⇒ the Bridge does not rebuild the model from log rows; it raises `MODEL_DRIFT(table,column/field,old,new)`,
  blocks UP for the affected component, and the model is re-synced by the normal AD route (2Pack/AD export ⇄ local ad_seed).
  Detection from the log, payload from the dictionary.
- Falsifier W11 MODEL-DRIFT: on the pilot edit (a) an AD_Field attribute, (b) an AD_Column mandatory flag with no field
  change, (c) an AD_Val_Rule code only, (d) an AD_Tab name only. Expect events for a,b; for c only if AD_Val_Rule is in the
  set; none for d. Print INCONCLUSIVE if the log shows nothing for a/b (logging flags off).

**Hash/counter alternative (user, 2026-10-09): rejected as a server field** — a counter or hash column on legacy is an
"alien field" (schema change, admin impact). **Kept as a CLIENT-SIDE check instead:** the Bridge reads the sentinel tables
over the existing read-only WS types, hashes the rows locally (kernel side stores the same hash), and compares per sync.
Zero legacy footprint. It is the safety net for what the change log cannot see (direct SQL, logging flags off), and the
same hash is the `sentinel_hash` both sides can show to prove "model aligned". Change log = fast path; hash = audit.

## §15 [EXTRA — superior role] HARD RULE + backdoor register (user directive 2026-10-09; audited against source + pilot DB)
**HARD RULE: no direct SQL change on either side outside the framework.** Allowed write paths = (1) the doc/PO path
(UI, WebService, doc-action), (2) 2Pack, (3) a reviewed migration script (`migration/*.sql` / `AD_MigrationScript`).
Anything else is a defect to detect, not to tolerate.
**Correction to the "exceptions" premise:** only 2Pack is covered by the change log. A migration script is NOT.
| # | Path | Logged in AD_ChangeLog? | Evidence | Mitigation |
|---|---|---|---|---|
| B1 | **Migration scripts** (`ApplyMigrationScripts` / psql of `migration/*.sql`) | **NO** — raw SQL via JDBC, not PO | `ApplyMigrationScripts.java:60-95` | Every script must also be declared to the Bridge (name + hash); sentinel hash (§14) + table count/hash catch its effect; scripts that touch tracked tables = MODEL_DRIFT/RECONCILE event |
| B2 | 2Pack import | YES (`TrxName=PipoDS_*`, 198 rows on pilot) | pilot `ad_changelog` | none needed; classify `PipoDS_*` as "model change", not user traffic |
| B3 | **SQL Process form** (`WSQLProcess`) — in-app DML | **NO** | allowed keywords default `ALTER,…,DELETE,DROP,INSERT,UPDATE,TRUNCATE…` (`WSQLProcess.java:235`); granted to 1 role on pilot | legacy admin: remove role access or tighten `FORM_SQL_PROCESS_ALLOWED_KEYWORDS`; Bridge cannot see it |
| B4 | Direct DB (psql, restore, DB replication) | **NO** | nature | DB-admin policy; detection only via reconcile hash. pgaudit/`log_statement` is DB config, no schema change |
| B5 | Core code doing bulk SQL | **NO** | ~1,000 `DB.executeUpdate*` calls in 169 core files (602 + 399) — totals, storage, costing, posting | expected & legitimate; their RESULT is derived (GrandTotal, M_Storage, M_Cost). Never sync derived rows; reconcile them by recompute (W3) |
| B6 | Columns/tables with logging OFF | **NO** | `C_Order`: GrandTotal, ProcessedOn, DocAction unlogged; `Fact_Acct`, `M_Storage`, `M_Cost`, `M_CostDetail` tables `IsChangeLog=N`; 195 base tables N; secure columns forced off (`MColumn.java:524`) | per-component descriptor lists tracked cols; an unlogged col the component needs ⇒ F-flag to admin or hash-audit |
| B7 | Inserts when `SYSTEM_INSERT_CHANGELOG=N` (vanilla) | **NO** | W10 `§W10_INSERT_MODE` (N→0, Y→2) | F1: admin sets Y, else rely on first update + `readData` |
| B8 | **Scripted rules** (`AD_Rule`, beanshell/groovy; 4 on pilot; process `@script:beanshell:`) | their PO saves ARE logged; raw `DB.executeUpdate` inside script is NOT | `ad_rule` (4, EventType R), `M_Forecast Calculate` | review/inventory scripts on the legacy side; treat as B5 |
| B9 | **Change-log UnDo/ReDo process** (`ChangeLogProcess`) | rewrites values; the undo itself goes through PO (logged) — to witness | `AD_ChangeLog_UnDo` | treat as normal events; witness once |
| B10 | `Fact_Acct_Reset`, `C_Allocation_Reset(_Direct)` | **NO** (bulk) | processes in `ad_process` | derived data; Bridge reconciles postings (W3), never replays these |
| B11 | PO save with no session / `addSkipChangeLogForUpdate` | **NO** | `PO.java:3290-3294`; MSession skip list (used only by tests today) | server-side Java plugins can set it: plugin inventory is part of the admin handshake |
| B12 | **Hard DELETE** of children by DB cascade (FK ON DELETE CASCADE) | parent logged, cascaded children **NO** | PG behaviour; not yet witnessed on pilot | W12: delete a parent, compare child rows vs log |
| B13 | Postgres triggers on legacy | n/a | pilot has only 4 internal-purpose (replica sync verifier, 3 blob cleanup) — no business triggers | re-run this query against the real server before trusting |
| B14 | Cache lag (`CacheReset`) | n/a | server restart needed for WS type changes (F2) | not a data path; Bridge must not assume instant AD effect |
**Reading the register:** B1, B3, B4 are the true blind spots (legitimate-looking writes that leave no log). B5/B10 are
noise by design. The Bridge's answer to every blind spot is the SAME audit already specced (§14): client-side hash per
tracked table (rows + selected columns), compared each sync — any drift with no matching change-log event, no declared
script, and no `PipoDS_*` trx = **`OUT_OF_BAND`** alarm, component paused. That event is how the hard rule is enforced.
**Not claimed:** this list is from source + a vanilla pilot, not the real server. Open for the admin handshake (§9 P1):
who holds the SQL Process form role? which plugins/AD_Rule scripts exist? is pgaudit available? what migration scripts are pending?
New witnesses: W12 CASCADE-DELETE (B12), W13 OUT-OF-BAND (B1/B3: apply a raw UPDATE on the pilot to a tracked table →
alarm fires; the same change via WS → no alarm; INCONCLUSIVE if hash unchanged).

### §15.1 Re-audit against latest upstream (2026-10-09, read-only `git diff HEAD @{u}`)
- Local checkout `~/idempiere-dev-setup/idempiere` = master `87968daa73` (2026-01-16); upstream `770ec13ec2` is **278 commits ahead**.
  `git pull --ff-only` is BLOCKED by 3 locally modified eclipse files (`bundles.info` ×2, `server.product.launch`) — not
  stashed/discarded (stash is shared across worktrees). Read upstream via `git show @{u}:…` instead; no source was changed.
- Role fact (user): **SuperUser / System Administrator holds the SQL Process + SQL Query forms** (pilot: role 'System
  Administrator' on both). So B3 is by-design for the super user: policy = Bridge treats SuperUser DML as `OUT_OF_BAND`
  unless declared (§15 hard rule applies to SuperUser too).
- Unchanged upstream: change-log insert rule (`SYSTEM_INSERT_CHANGELOG` default N, `PO.java:3817`), per-column/skip rules,
  `ApplyMigrationScripts` (raw SQL), `WSQLProcess` allowed-keywords key. All B-rows stand.
- Changed upstream: PO now writes change-log rows in a **batch** (`BatchInsert<MChangeLog>`, `PO.java:3137-3142, 3758-3763`) —
  same transaction, same rows; the W10 late-commit window is still required. Re-run W10 after the pilot moves to this build.
- **NEW upstream hook — IDEMPIERE-6910 (migration `iD12/postgresql/202603261259`, backported to iD12 line): `AD_ChangeLog.ExternalTraceId`**
  (VARCHAR 100, indexed) filled from thread-local `AuditTraceContext` (`MSession.java:477-479`); also on `AD_PInstance`.
  This is an official place to stamp "this change came from the Bridge / op_uuid". **Core does not set it from WebService
  requests** (only `BackgroundJobCallable` propagates it) → using it needs a small server-side hook (request filter that
  sets `AuditTraceContext` from a header). That is a legacy change → proposal item for later, NOT a dependency. Until then:
  own-echo = `CreatedBy` + `TrxName ws_*` (W10-proven).
- 200 new migration scripts upstream (iD14 line). Only 6910 touches the change log. Migrations remain raw SQL (B1).

## §16 Reference scenario: POS, Unicenta-minimal (user's own prior integration; CORRECTED 2026-10-09 — earlier draft drifted)
**Concept digest (from POSLens.md / POS_ADDON_SPEC.md — read 2026-10-09, quote not paraphrase where it matters):**
- *"the POS should be dumb — record the sale, take payment, send the order; let the ERP hold the intelligence."*
- *"The terminal does not send a 'sale.' It sends **orderlines** — the irreducible facts: this item, this quantity, this
  station."* An order/invoice/movement/replenishment PO are **views computed** from orderlines (POSLens §2).
- **No free numbers (POSLens §4):** price is a *reference that resolves to a sealed master price* (never keyed at sale time);
  quantity from the scan; on-hand from the fold; replenishment from the fold. You key the master, never the sale.
- Station = `AD_Org` / POS locator config (`c_pos` row: doctype 135 'POS Order' WR, warehouse, pricelist, cash BP) — set up once.
- ERP side (the 2012 plugins) did the intelligence: AutoBOMOrder backflush, ReplenishReport → PO. The POS only receives the result
  as stock quantity.
**Exactly two flows, nothing else** (no payment, no requisition, no inventory-move, no receive step — those were my additions
and are withdrawn):
| Dir | What | Shape |
|---|---|---|
| UP | **Order lines** the POS sold | rows of (product, qty, price) arriving at iDempiere as order + lines under the fixed context |
| DOWN | **ProductQty** (stock per product) | current on-hand qty per product for the store's warehouse, written into the POS |
**Context, set up ONCE (not synced per sale):** Org, PriceList (and the rest the order needs — warehouse, customer, doctype).
Values to be INFERRED later from the user's Unicenta project; never invented here (§9 rule).
Design consequences to review (not decisions):
1. **DOWN is a snapshot read, not a change-log feed.** Stock on hand lives in `M_Storage`, which is `IsChangeLog=N` (derived,
   written by bulk SQL in doc completion). So ProductQty comes from a read-only WS query of stock (one more read WS type on the
   admin's list, same shape as `QueryChangeLog`), applied to the POS as an ABSOLUTE qty per product. The change-log tracker is
   NOT needed for this POS flow; it stays in the layer for plugins whose DOWN is documents (§4).
2. **Local qty rule (one rule, so sales between syncs don't flicker):** shown qty = last server qty − qty of lines still in the
   outbox (not yet confirmed). When a line is CONFIRMED, the next snapshot already includes it.
3. **UP unit = the orderline** (product ref, qty, station, ticket ref) — per POSLens §2, not a 'sale'. The Bridge ASSEMBLES the server
   order: lines sharing a ticket ref → one `C_Order` (doctype from the station's `c_pos`) + its lines + `CO`. The order is a view the
   server builds from orderlines; there is no separate 'sale' object to sync. **Price is never sent as a keyed value:** the line
   carries the product reference; price = the PriceList master row (context, set once) read on both sides. An unknown product or a
   product absent from the PriceList REFUSES (no invented price) — POS_ADDON_SPEC §P-1 falsifier.
Witnesses (spec): W15 POS-UP (N offline order lines drained in order, none lost/duplicated on retry, server line count/qty ==
local); W16 QTY-DOWN (server qty snapshot → POS qty equals server, outbox-pending subtracted per rule 2).

## §17 What the layer must give a plugin (the common base) — draft; ✂ = NEEDED NOW for §16 Unicenta-minimal, ◻ = later
**Principle:** the contract between a UI plugin and the Bridge is **SQLite tables + the kernel doc API**, not an RPC.
A Flutter (or any) UI already reads/writes the local SQLite; the Bridge is a separate worker that moves rows. So a plugin
UI needs no Bridge SDK to render sync state — it queries tables. (Fits local-first and AD-LAYER LAW: generic, no per-plugin code.)
**Layer provides (build once):**
| # | Service | Plugin sees it as | Status |
|---|---|---|---|
| 1 | ◻ Change-log tracker (watermark, window, dedupe, own-echo) — for document-DOWN plugins, not POS-minimal | feeds `inbox` | ✅ built, W10 |
| 2 | ✂ Transport (ADInterface, stateless login, errors → §-lines) | invisible | ✅ `ad_client.js` |
| 3 | ✂ **Outbox**: ordered, batched, idempotent, retry/backoff | kernel ops flagged `to_sync`; plugin just does normal doc ops | ⛔ not built |
| 4 | ✂ (simple) **Sync state** per doc: `LOCAL → QUEUED → PUSHED → CONFIRMED / REJECTED(msg) / DIVERGED` | table `sync_doc_state(doc,state,msg,server_id,server_docno)` — UI shows badges/“3 pending” | ⛔ |
| 5 | ✂ **Id map** local uuid/provisional no ⇄ server `C_*_ID`/DocumentNo | `sync_idmap`; helper `resolve()` | ⛔ |
| 6 | ◻ **Inbox + replay**: remote events replayed through the local doc engine (create+DocAction) | rows in normal doc tables + `inbox_event` log for UI notifications | ⛔ |
| 7 | ✂ **Descriptor loader/validator** (§5) + mapper helpers (field/enum maps, dependency order) + NEW: a descriptor may declare a DOWN as `snapshot` (read WS → absolute values) instead of `changelog` | a JSON file + small pure fns | ⛔ |
| 8 | ◻ **Reconcile runner**: runs component-declared checks (posting equals, stock recompute) and writes results | `sync_reconcile` rows; UI warns on mismatch | ⛔ |
| 9 | ✂ **Connection + settings + one-time CONTEXT (org, pricelist…)**: base URL, per-device login in secure store, test-connection, schedule, “Sync now”, offline detect | `sync_config`, `sync_run` rows | ⛔ |
| 10 | ◻ **Handover wizard** (one-time model sync, §000) | generic screen/command | ⛔ |
| 11 | ◻ **Generic UI parts**: sync status bar, Rejected/Diverged inbox, settings screen, run log — plugin embeds, never rewrites | embeddable widgets (reuse theme tokens) | ⛔ |
| 12 | ✂ **Witness kit**: mock ADInterface server, pilot fixtures, W1–W8 parametrised by the descriptor | plugin gets its tests by supplying a descriptor | partly (pilot SQL, W10) |
| 13 | ✂ Standard `§` log lines for every step | read the log | ✅ pattern set |
| 14 | ◻ Rule hook: local validation may only be stricter than legacy (§6) | plugin registers rules; layer checks | ⛔ |
**Plugin supplies (and ONLY this):** (a) a descriptor: tables, doc types + FSM map, directions UP/DOWN, field/enum mappers,
order, reconcile checks; (b) its local rules / decision tables; (c) its UI screens (POS: ticket, tender, receive-stock).
**Acceptance for "minimal":** W8 — a second plugin's diff contains a descriptor + rules + UI and **zero** change to the
layer. If a plugin needs a Bridge change, that item goes into this table (the layer was missing a common service).
**Plugin-facing commands (the only imperative API; everything else is table reads):** `sync.now()`, `sync.retry(doc)`,
`sync.discard(doc)` (REJECTED only, with reason), `sync.status()`; implemented as rows in a `sync_command` table so any UI tech
can issue them.
**Build order — NOT started; this section is design under review.**

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
