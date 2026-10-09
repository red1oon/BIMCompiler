# ⚠ DO NOT REMOVE
**Scope:** a SYNC + PLUGIN LAYER between a local-first SQLite UI (ERP kernel: ThaiGoldPawn Flutter first, any
later module after) and a LEGACY iDempiere server, talking ONLY through iDempiere's stock WebServices (§2 vocabulary), writing ONLY as documents + doc-actions
(reads for snapshots/log). **ARCHITECTURE DRAFT, HARDENED 2026-10-09 (§P principles, §Q pre-mortem). Built so far: change-log tracker only.**
READ FIRST for the POS flow (do not ask what these already answer): `docs/internal/POSLens.md` §1-4 and
`docs/internal/POS_ADDON_SPEC.md` §1-3 — the user's Unicenta⇄iDempiere concept. (The wiki pages 403 to WebFetch.)
Spec-first: every §Wx witness below is named before any implementation. Read the log after every run.
Never touch a real server without an explicit GO. EXTRACT/COMPILE ONLY — nothing here is invented; every
unknown is a ⛔ in §9, not a guess. Honour until DONE.

# ⚖ CARDINAL RULE (user, 2026-10-09 — outranks every other statement in this file; check it before ANY classification, fix, or question)
> **"SQLite cannot be diff from legacy ops, I thought you knew that."** · **"Even L&F — this is the whole idea for zero impact on users."** · **"Ensure this cardinal rule throughout."**
**SQLite must be INDISTINGUISHABLE from legacy: same operations, same results, same books, same look & feel. Zero impact on users.**
1. **No accepted divergence.** A difference is never "a quirk we choose not to copy". The default and only remedy is to change SQLite until it equals legacy. A `LEGACY-QUIRK` exclusion exists only if the USER exempts it in their own words (recorded with date in the `exemption` field; the runner REFUSES it otherwise — `§QUIRK_REFUSED`).
2. **Legacy defects/crashes are not a licence to differ.** If legacy refuses or errors on a reachable input, SQLite refuses too (same outcome, clearer message allowed); if legacy accepts, SQLite accepts.
3. **L&F is part of "same result".** What a user sees and can do (windows, tabs, fields, order, labels, read-only/mandatory/display logic, defaults, messages, doc-action buttons, validation timing) must equal legacy. The UI is generated from the dictionary (AD-LAYER LAW), so most L&F parity is DATA/SCHEMA class (`dict_diff` over AD_Window/AD_Tab/AD_Field/AD_Column/AD_Menu/AD_Message/AD_Ref_List/AD_Val_Rule/AD_Process…) — proven by witnesses and `§` values, never by eyeballing (PRIMAL LAW: witness replaces human visual check).
4. **UX is not "later = never".** The user parked UX for sequencing only (2026-10-09 "leave UX for now"); it stays on the ledger as a parity gap (F2 …) and is closed in turn.
5. **Never ask the user to approve a divergence** (Q-S7, Q-S13 were wrong questions; answered by this rule). Questions are for undecidable facts only (P16).
6. Every agent brief, witness, and report restates this rule; a witness that classifies a difference as acceptable without an `exemption` is itself a defect.

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
| P1 | **Legacy sees a normal client (§19): no SQLite-specific footprint — no plugin, table, column, protocol or marker on legacy.** (Mode B plugin = PARKED, §19.) Bridge uses only the 9 stock WS ops (§2) + AD config the admin chooses. No SQL, no schema/column, no custom table on legacy. | user D1, CLAUDE.md DB rule | transport has an allow-list of ops (anything else throws); Bridge code has no postgres client (grep gate) | W-P1 |
| P2 | **Look like a normal user; never write derived data.** Writes are documents + doc-actions only. Server owns numbering, posting, totals, stock. Never write `Fact_Acct`, `M_Storage`, `M_Cost*`, `GrandTotal`. | user §0 | descriptor validator rejects derived tables/columns as write targets | W6, W-P2 |
| P3 | **Layer is plugin-agnostic.** No plugin table/column names inside the layer; a plugin = descriptor + rules + UI. | user §00 | grep gate (no `C_Order`/`M_Product`… literals in layer code); W8 diff is descriptor-only | W8 |
| P4 | **Local-first.** UI never waits on the network; offline = fully working; sync is a background worker. | user §0 | UI path has no sync call; W5 with network killed | W5 |
| P5 | **Extract / never invent.** Context (Org, PriceList, warehouse, customer, doctype) comes from config inferred from the user's Unicenta project. Missing context ⇒ sync REFUSES (`BLOCKED_NO_CONTEXT`), never defaults. | PRIME RULE | context completeness check before first push | W-P5 |
| P6 | **Twin, no silent override (§21).** SQLite is the working world; legacy is its twin. When they disagree, neither side silently overrides the other: the mismatch becomes a visible state (`REJECTED` / `DIVERGED` / `§GAP`), never an automatic correction or drop. During the parallel run the default remedy is to fix the SQLite rule. | user 2026-10-09 | state machine has no auto-resolve transition | W4, W7 |
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
| P17 | **Legacy is the oracle (§23).** Every behaviour or defect observed on legacy while building becomes a scenario in the differential corpus the same day; both sides run it; the verdict is MATCH / SQLITE-GAP / LEGACY-QUIRK. | user 2026-10-09 | `scripts/bridge/oracle_corpus.md` (list) → M3 runner | M3 |
Witness ids W-P1/P2/P5/P11/P12/P13/P15 are small structural/unit checks, to be written before the module they guard.

## §Q PRE-MORTEM — what we had missed (found 2026-10-09 by re-reading the spec against the pilot; each has an owner)
| # | Gap | Evidence | Resolution / status |
|---|---|---|---|
| G1 | **Idempotency vs F1.** After a timeout post-create, the change log cannot tell us whether the order exists (inserts unlogged by default). My earlier §3.5 relied on it. | W10 `§W10_INSERT_MODE` | Proposal: carry the POS ticket key in a standard free-text field a normal user also fills (e.g. order `POReference`/`Description`) and check existence with a read of that field. Zero schema change, but it IS a convention on legacy data IN concept (idempotent op, POSLens §3 'dupe refused'), but WHICH field = a Unicenta-project fact ⇒ DEFERRED to inference from that project, not asked now; until then ambiguous failure PARKS (P7). |
| G2 ✅ RESOLVED 2026-10-09 | **Partial documents.** Header and each line are separate `create_data` calls with no shared transaction ⇒ crash between them leaves an orphan DR header. | ModelADService: one op per call | MEASURED: stock `composite_service/composite_operation` runs header+lines+DocAction in ONE transaction; a failing line returned `@IsRolledBack:true` and the pilot order count was unchanged (no orphan header). Header id is referenced by later ops as `@C_Order.C_Order_ID` / `recordIDVariable`. Needs a composite WS type + role access (pilot: stock type `SyncOrder`). Built into `doc_writer.js`/`pusher.js`. |
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
3. **Legacy issues its own identifiers** (DocumentNo, C_*_ID) for the docs it holds; they come back into the Id map. SQLite keeps its own numbers. "Same result" excludes identifiers (§21).
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
- **Masters:** aligned once at baseline (§19 C5); a later master change is a model/superior-role matter (§14), not routine sync. (Old line "server wins" withdrawn — twin model, §21.)
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

## §18 [PARTLY SUPERSEDED BY §19 — read §19 first] THE COMMON LAYER, two halves — app-agnostic (user 2026-10-09: "both are just common layers with no app in particular";
## DRAFT, still crystallising; IN concept). Earlier §18 text put POS functions inside the layer — withdrawn.
**Answer to "can a common layer be extracted?" — yes.** What the user's 2012 plugin + ActiveMQ did is, stripped of POS, a
**reliable message exchange with a handler registry**: carry an opaque payload from A to B exactly once, in order, authenticated,
acknowledged, and hand it to the application's handler. That part never mentions orders, products or stock. What stays app-specific
is only (1) the payload meaning and (2) the handler that applies it. Everything else is the layer.
```
 SQLite side (Half S)                                         Server side (Half V = OSGi plugin, optional)
 app handlers  ◀─ register(type) ─┐                      ┌─ register(type) ─▶  app handlers (call PO/doc-actions)
 ┌──────────────────────────────┐ │                      │ ┌──────────────────────────────────────┐
 │ outbox · inbox · state · ack │ │   ENVELOPES (signed) │ │ station registry · inbox · outbox ·  │
 │ idmap · config · retry       │◀┴──── transports ──────┴▶│ dedupe · dispatch · ack · scheduler  │
 └──────────────────────────────┘   WS push/pull · email    └──────────────────────────────────────┘
```
**The seams (the whole contract; nothing app-shaped crosses them):**
1. **Envelope:** `{station, stream, seq, id, type, ver, payload(opaque bytes), created, ackThrough, sig}`. `ackThrough` (down envelopes): the highest up-`seq` of that station the sender had already processed when it built this envelope — generic, found by the POS dry-run below. `type` is namespaced by the app
   (`pos.orderlines`, `fa.entry`, `pawn.ticket`…); the layer never parses `payload`.
2. **Guarantee:** at-least-once delivery + idempotent dispatch (record `(station,id)` + its result in the SAME transaction as the
   handler's writes) ⇒ effectively once. Order is per `(station, stream)` by `seq`; a gap parks the stream until filled.
3. **Ack:** per envelope `{id, status: OK|REJECTED|PARKED, refs{…opaque…}, message}`. The layer stores and returns it; the handler fills it.
3b. **Stream mode** (declared per stream): `queue` (every envelope delivered, in order — documents) or `latest` (a newer envelope supersedes older undelivered ones — state snapshots such as stock). Found by the POS dry-run below.
4. **Handler registry** (both halves): `register(type, ver, handler)`; handler = `handle(envelope, ctx) → result`. Same shape on S and V,
   so a message can flow either way (up = S→V, down = V→S).
5. **Station identity:** registry of stations + pinned public keys; sign on send, verify on receive; replay window by `seq`.
6. **Transport adapter interface:** `send(envelopes) → acks`, `poll(station, afterSeq) → envelopes`. Adapters: WS, email, loopback (tests).
7. **Scheduler hook:** `schedule(name, cron, handler)` — apps can ask the server half to run a job (e.g. a nightly process) with no scheduler code of their own.
8. **Config store (set once):** key→value per station/app (context such as Org, PriceList…). The layer stores and serves it; it never interprets it (P5: missing ⇒ refuse).
9. **State + observability:** per-envelope state `QUEUED→SENT→ACKED / REJECTED / PARKED`; tables the UI reads; `§` log line per transition.
10. **Faults are first-class:** retry with cap + backoff; auth failure stops (no lockout, P13); poison envelope parks, never blocks the stream's siblings in other streams (P8).
11. **Versioning:** `ver` per type; unknown type/ver ⇒ REJECTED with reason (never guessed).
**Built-in system ops (namespace `sys.`) — the early-on sync is just one of the ops (user 2026-10-09; IN concept: §000 "model sync ONCE, together, at handover"):**
the layer ships a few message types of its own, riding the same envelope/ack/dedupe/handler path as any app op — no separate mechanism.
| Type | When | What it does |
|---|---|---|
| `sys.hello` | first contact | enrol a station: id + public key → station registry; both sides record each other |
| `sys.handover` | ONCE, at start | the early-on sync: carries a **manifest** (what to align: model package id/version + hash, config keys, initial masters) — each side applies it with ITS OWN standard mechanism (server: 2Pack/AD already in place; SQLite: `ad_seed`), then acks with the hash it ended on. Equal hashes ⇒ `handover_done(hash)` stored in the config store; also sets the DOWN baseline (change-log watermark = current max, or snapshot epoch) so later sync is data-only |
| `sys.config` | set-once context | station/app key→value (P5: refuse to run app ops while required keys are missing) |
| `sys.resync` | superior role only, rare | re-run a handover step after a deliberate model change (§14/§15 extras) — never part of routine user sync |
| `sys.ping` | health | liveness + clock/seq check |
App ops cannot be dispatched until `handover_done` exists for the station (gate, W-L9). The model package itself is out-of-band content (a file the
admin already produces); the layer only transports its id/hash and records both sides' agreement — it does not interpret the model.
**Server half V** is the only half that touches iDempiere, and only through the OSGi/PO path (so everything it writes is a normal
logged change). Its own storage = AD-model tables (station registry, inbox/dedupe) installed by 2Pack — the sole legacy addition, and only
in Mode B. **Half V is optional** (Mode A below).
**Mode A / Mode B:**
- **Mode B (V present):** S speaks envelopes to V. App handlers on V write documents natively (atomic, deduped, server-side pricing).
- **Mode A (no V; legacy untouched):** S uses a different transport adapter: an **ADInterface adapter** that plays the *handler* role
  client-side — a stock, descriptor-driven handler turns an envelope into `create_data/set_docaction` calls (§3), and the **change-log
  tracker** (§4/§13) is the polling source for DOWN. Above the adapter line (outbox, state, idmap, ack, app handlers on S) nothing changes.
  Mode A is weaker only where §Q says (G1, G2, G10): V's single transaction and dedupe are what Mode A lacks.
**Stock handlers (shared library, still app-agnostic — what makes an app "smaller"):** a descriptor-driven `doc.write` handler
(header+lines+docaction from a descriptor, §5), a `doc.read`/`snapshot.read` handler (read named columns/aggregates for a station),
and an `ad.config` handler. An app that only moves documents/quantities writes **no handler code**, just a descriptor + type names.
**What an app supplies:** type names + payload schema, a descriptor (or custom handlers where the stock ones don't fit), its context
keys, its local rules, its UI. The three examples are exercises of this, not part of it:
| App | Up messages | Down messages | Needs beyond stock handlers |
|---|---|---|---|
| POS (Unicenta pattern, §16) | `pos.orderline` batches | `pos.qty` snapshot | grouping rule lines→order; price-from-master (P15); trigger a ReplenishReport run |
| Fixed Assets (§11) | `fa.entry` | status of the entry | its own rules/plugin on V (parallel run) |
| Pawn / loans | `pawn.ticket`, `pawn.payment` | ticket status | AD-model tables for the ticket (D3) |
**Honest limits of the common layer (where the user's doubt could be right):** (a) *semantic mapping* — turning a payload into the right
AD columns — cannot be generic beyond what a descriptor expresses; the stock `doc.write` covers header/lines/docaction, not bespoke
rules. (b) *verification* — "is the result right?" (totals, postings, stock) is the app's reconcile, the layer only schedules/records it.
(c) *exactly-once* needs the dedupe write to share the transaction with the handler's write — easy on V (same JDBC trx), only
approximated in Mode A (ambiguous failure PARKS, §Q G1). (d) email as a transport inherits reordering/duplication/spoofing — covered by
`seq` + signature, but latency is minutes.
**Mapping of earlier lists onto this design:** §17 items 2,3,4,5,9,12,13 = Half S core; 7 = descriptor for the stock handlers; 6 = S inbox
+ handler; 8 = app reconcile run by the layer; 1 = Mode A DOWN source; 10,11,14 = generic UI/rule hooks. §16/§Q POS statements are the
POS *example*; P15 ("no free numbers") is a POS-handler rule, not a layer rule.
### §18.1 POS dry-run on the common layer (can it carry the Unicenta-pattern info? — walked 2026-10-09)
| Step | Layer does (generic) | POS supplies | Fits? |
|---|---|---|---|
| Enrol | `sys.hello` (station = the `c_pos` terminal), `sys.handover` (masters/model hash aligned), `sys.config` {Org, PriceList, warehouse, doctype, cash BP — inferred from the Unicenta project} | the key list only | ✅ |
| Sell | kernel op → outbox envelope, stream `pos.up` (`queue`), **one envelope per ticket** (its orderlines = payload: product ref, qty, station, time; NO price) | the payload schema | ✅ |
| Merge | V: verify sig, dedupe `(station,id)`, dispatch `pos.orderline` handler in one trx: group → `C_Order`+lines, price from PriceList master, `CO`; ack `{c_order_id, documentno}` | the handler (≈ grouping + master price lookup) | ✅ Mode B. Mode A: stock `doc.write` from a descriptor; price is looked up from the sealed master on S (not keyed) and verified by read-back — weaker (G1/G2) |
| Unknown product | handler returns REJECTED + reason; ticket parked, other tickets flow | the check | ✅ (envelope = atomic unit, hence one per ticket) |
| Replenish | scheduler hook / handler continuation runs the ERP's own `ReplenishReport` | which process, when | ✅ Mode B hook; Mode A stock `process.run` via `runProcess` |
| Qty back | V producer enqueues `pos.qty` (stream `latest`) with `ackThrough` = last ticket merged; S pulls | the producer query | ✅ **needed two generic additions**: `latest` stream mode and `ackThrough` |
| Show stock | S applies snapshot; shown = snapshot − up-lines with `seq > ackThrough` still unconfirmed (replaces the G8 "defer" rule — precise, no deferral) | the display rule | ✅ |
**Verdict:** the layer carries the POS flow with NO POS words inside it. The dry-run exposed exactly two generic gaps (snapshot streams, `ackThrough`), now in the seams. POS-only parts are small: payload schema, two handlers (`pos.orderline`, `pos.qty` producer), config keys, display rule.

**Test of genericity (acceptance):** the layer's code + tests must contain NO app words (order, product, price, stock, asset, ticket);
`sys.hello` → `sys.handover` → `sys.config` run first on the same harness (W-L9: app op before handover is refused; mismatched hash ⇒ handover FAILS, no silent continue); a loopback harness runs a toy `echo`/`counter` app through every guarantee (dupes, reorder, drop, kill-points, forged signature, unknown
type) — if that passes, POS/FA/pawn only add handlers and descriptors. W-L1..W-L8 (spec only): dedupe · order+gap park · signature/replay ·
kill-point resume (before send / after send before ack / after handler before ack-store) · poison isolation · transport swap (WS↔email↔loopback
with identical results) · Mode A≡B above the adapter line · app-word grep gate.
**Not asked (user is drafting):** Mode B as target vs Mode A first; station key enrolment; naming/packaging.

## §19 HARDENING CUTS (user 2026-10-09: legacy is wary of SQLite replacing iDempiere; the SQLite UI is used, syncs behind the scenes, and
## when legacy checks, the work does not look like it came from the SQLite UI; the legacy-side plugins — Unicenta, Fixed Assets, … — are
## interacting plugins that the user prefers to MOVE onto the SQLite kernel; run PARALLEL side by side until the gaps show). IN concept.
**What the concept is, restated so every cut can be checked against it:**
1. SQLite UI = the daily tool. Legacy keeps running. Sync is invisible plumbing.
2. To legacy, SQLite work = **a normal user's documents** (real docs, real doc-actions, real numbers, real postings) via the stock WebServices.
3. The legacy-side plugins are NOT part of this layer. Each one is **re-implemented on the SQLite kernel and run in parallel** with the
   legacy plugin; the layer's job is to feed both the same facts and **surface every difference** (gap list).
4. So the layer is ONE thing: a **legacy-client emulator + parallel-run harness on the SQLite side.**
**Honest bound on "legacy does not know":** the admin must still create one integration user/role and register the WS types (§12 SQL is
exactly that) — so legacy cannot be literally unaware that *a client exists*. What the layer can guarantee is that the DATA is
indistinguishable from a hand-keyed document (W6) and that nothing special is installed. We do not forge identity; we add no markers.
Known tells in the data, measured on the pilot, to be listed to the admin, not hidden: one `AD_Session` row (`WebSession='WebService'`) per
call, a client-identifying string in `AD_Session.Description`, `CreatedBy` = the integration user.
| # | Item in the spec | Verdict | Why (against the restated concept) |
|---|---|---|---|
| C1 | **Half V — server OSGi plugin (Mode B)**, its inbox/station-registry AD tables | **PARK** (out of the core, kept only as a later option) | Installs a SQLite-specific bundle + schema on legacy ⇒ the opposite of "behind the scenes"; it is also exactly what a wary admin would reject. Revisit only if legacy later chooses to host it. |
| C2 | **Envelope wire protocol** (`seq`, `stream`, `ackThrough`, signatures, station keys, `sys.hello/handover/config/resync/ping` as WIRE messages) | **CUT from the wire; KEEP locally** | Legacy cannot parse or store them without Half V. Keep only as the LOCAL outbox record (id, order, state). `ackThrough`/`latest`-stream found in §18.1 exist only because of Half V ⇒ PARKED with it; Mode A uses the local rule instead (snapshot applied after the read-back confirms the lines; unconfirmed lines subtracted). |
| C3 | **Email transport** | **CUT** | Needs a mailbox reader on the server (none in core, §18) ⇒ footprint. Offline tolerance comes from the local outbox + retry over WS, which is enough ("remote offline POS" is the familiar pattern). |
| C4 | **Signing of batches sent to legacy** | **CUT from the wire; KEEP in the local op-log** | Legacy cannot verify it. Integrity of local truth stays (kernel chain); the wire is protected by the normal login. |
| C5 | **`sys.handover` as a wire op** | **REPLACE by a local procedure** | One-time baseline = load the same model package on both sides (each by its own route), compare the client-side sentinel hash through the read WS types (§14 hash), set the DOWN watermark. No wire message needed. |
| C6 | **ExternalTraceId hook** (§15.1) | **PARK** | Needs a server-side filter. Own-echo already works from user + `ws_*` trxname on a stock server (W10). |
| C7 | **Admin flipping `SYSTEM_INSERT_CHANGELOG=Y`** and broad logging flags | **MAKE OPTIONAL, not a dependency** | A global setting an admin would notice. Core DOWN must work on a **vanilla** config: completions are UPDATEs and are logged by default (W10 proves DR→CO is seen with the setting at N). Draft creation staying invisible is acceptable — drafts are not shared work. |
| C8 | **Posting-side/plugin assumptions inside the layer** (assemble orders, ReplenishReport, price rules, ProductQty producer on the server) | **OUT of the layer** — they are the *interacting plugins* | Per user: these are legacy plugins being re-implemented on the SQLite kernel, not layer features. The layer only supplies transport, outbox/state/idmap, descriptor-driven doc write, DOWN tracker + replay, snapshot read, reconcile, config. |
| C9 | **Superior-role extras** (§14 sentinel, §15 backdoor register) | **KEEP, narrowed** | Still the way we notice *drift* between the two sides during the parallel run; but run by the SQLite side only, read-only against legacy. |
| C10 | **Parallel-run reconcile (W3/W9, §FLASH list)** | **PROMOTE to the core purpose** (I had demoted it) | The user's stated aim: run side by side until the gaps are noticed. Every doc written/seen on both sides is compared: local result vs legacy result (docstatus, totals, Fact_Acct); every difference is a logged `§GAP` with the rule that differs. That list IS the product of the parallel run. |
**What remains in the core layer (all SQLite-side, nothing installed on legacy):**
`Transport` (ADInterface only, 9 ops) · `Outbox/State/IdMap` · `Descriptor-driven doc writer` (UP) · `Tracker` (DOWN, built, W10) ·
`Replay through the local doc engine` · `Snapshot reader` (read WS) · `Reconcile/GAP report` (parallel run) · `Config store` · `Baseline (C5)` ·
`Witness kit` (mock ADInterface server + pilot fixtures). Plugins (POS, FA, pawn, …) are the apps that sit ON this layer on the SQLite side,
each shadowing a legacy plugin during the parallel run.
**Residual risks to harden next (not solved by cutting):** G1 idempotency after an ambiguous failure and G2 partial documents remain
(no server dedupe/transaction now that Half V is parked) ⇒ rely on the `composite` WS probe (W1) and on parking + read-back; G10 session
growth stays a visible footprint ⇒ batch calls. These are the honest cost of "legacy installs nothing".

## §20 PROPOSAL (2026-10-09) — build the SQLite-side legacy-client emulator + parallel-run harness, in 6 witnessed steps
**Reading of the user's "your first part description is correct start":** the original SQLite-side design (§1–§4: documents + doc-actions
over stock WS, change log for DOWN) is the base; §19 cuts everything that needed a server install. Nothing below touches legacy beyond
the pilot fixtures already in §12/§13.
**Shape:** one SQLite-side layer, no app words inside it (P3). Modules: `transport` ✅ · `tracker` ✅ · `outbox+state+idmap` · `doc writer`
(descriptor-driven) · `replay` · `snapshot reader` · `reconcile/GAP report` · `config+baseline` · `witness kit`.
| Step | Build | Witness (pilot, real iDempiere) | Falsifier / guard |
|---|---|---|---|
| M0 ✅ | transport + change-log tracker | W10 PASS (both insert modes) | window=0 negative control |
| M1 | **outbox + state + idmap + descriptor doc writer**: one document type end to end (header, lines, DocAction) as a normal user; local rows `QUEUED→PUSHED→CONFIRMED/REJECTED/PARKED` | W1 (calls, order, 2nd run +0) · W5 kill-points (before header / between header & lines / before CO / after CO) · W4 server refusal shows REJECTED · W6 legacy-looks-native (field diff vs a doc already on legacy) | probe stock `composite` WS for one-transaction writes first; if absent, ambiguous failure PARKS (G1/G2). INCONCLUSIVE if nothing judged |
| M2 | **DOWN replay**: tracker events → `readData` → replay through the LOCAL doc engine; own-echo skipped | W2 (legacy-keyed doc appears locally, totals equal, nothing applied twice) | late-commit control from W10 |
| M3 | **Parallel-run reconcile + `§GAP` report** — the product: each doc seen on both sides is compared (docstatus, line/total amounts, stock effect, Fact_Acct); every difference is a logged `§GAP` naming the rule | W3: first target = **POS Order**: legacy measured on pilot (CO ⇒ 1 shipment + 1 invoice, store on-hand 4→3), SQLite side = existing `build/erp/pos_core.js` fold (W-POS-WR already green) ⇒ same orderlines to both ⇒ GAP list must be empty or itemised | seeded deliberate difference must be reported (witness can fail) |
| M4 | **snapshot reader + config store + local baseline** (handover §19 C5): qty read, context set once, sentinel hash compare, watermark | W16-lite: qty after sale == legacy; baseline hash equal or FAILS loudly | missing config ⇒ refuse (P5) |
| M5 | **first shadow plugin on the layer: POS** (descriptor + payload only, P15 no keyed price) — the Unicenta pattern, orderlines up, ProductQty down | W15/W16 against pilot | layer diff = descriptor-only (W8) |
| M6 | **second shadow: Fixed Assets** (§11) to prove the layer is not POS-shaped | W9 parallel run vs legacy depreciation code | genericity grep gate (no app words in layer) |
**Why this order:** M1–M2 make the SQLite UI usable "behind the scenes" (UP/DOWN as a normal user); M3 delivers the user's actual aim
(see the gaps while running side by side) as early as possible, using a legacy behaviour already measured; apps come last so the
layer is proven app-free first (M5 would otherwise bend it).
**Decisions this proposal assumes (all already in the record, none new):** stock WS only (§19 C1–C4); vanilla server config (C7); price never
keyed (P15); pilot only, reset by importiDempiere when needed. **Open, deferred to the Unicenta project (not asked):** the exact `c_pos`
defaults and the ticket-key field (G1).

## §21 TWIN PRINCIPLE (user 2026-10-09: "my world is actually just SQLite throughout; legacy is just a twin where it sees the same result")
**Statement.** SQLite is the working world and the place where rules live and change. Legacy iDempiere is a **twin**: it must end up showing
the **same result** for the same facts. During the parallel run both sides are live (legacy users still key documents there), so facts flow both
ways; but the *judge* of correctness is equivalence of results, not who wrote first.
**"Same result" — defined, not felt (compared per document by the reconcile, M3):**
| Compared (must be equal) | Excluded (may differ) |
|---|---|
| docstatus · line product and qty · line and header amounts in minor units · tax · Fact_Acct per account (debit/credit) · stock effect per product/warehouse · business dates | internal ids · DocumentNo · created/updated stamps · createdby/session · row order |
**Consequences (what changes in the design — and what does not):**
1. **Authority wording.** Earlier "server is authority / server wins" is withdrawn (P6, §3.3, §6 edited). Neither side silently overrides; a difference is a
   `§GAP` with the rule that produced it. While SQLite is still learning, the default remedy is to **fix the SQLite rule** (that is the stated purpose of the
   parallel run). Legacy data is never edited by the Bridge to "make it match".
2. **Direction.** UP = SQLite facts as normal docs (§3). DOWN = what legacy users keyed, absorbed as facts (§4) — until cutover. After cutover (legacy switched
   off) DOWN simply stops; nothing else changes — that is the reason the layer has no dependency on legacy-side installs.
3. **Identity.** The Id map links the twins' records; each keeps its own number. A printed document carries the SQLite number during the parallel run.
4. **Failure meaning.** A legacy REJECT of a doc SQLite accepted = a SQLite gap (a legacy rule SQLite lacks). Legacy accepts but totals differ = a calculation gap.
   Both are the *expected output* of the run, not errors in the layer.
5. **Not implied.** "Twin" does not mean legacy mirrors every table: only the documents/facts of the apps in play (M5, M6). Derived tables (Fact_Acct, M_Storage)
   are legacy's own computation and are *compared*, never written (P2).
**Exit criterion (what "convinced" can be measured by):** over a stated period and volume of real documents, the `§GAP` list is empty or contains only
accepted exclusions. That list is the evidence the legacy admin is shown.

## §22 M1 BUILT + WITNESSED 2026-10-09 (SQLite-side outbox · state · idmap · descriptor doc writer · pusher) — vs the local pilot
Code (all in `scripts/bridge/`, app-agnostic; `check_genericity.sh` = P3 gate, PASS): `store.js` (sql.js: outbox/state/idmap, crash recovery),
`doc_writer.js` (descriptor → composite operations), `pusher.js` (drain), `ad_client.js` (+`composite`, typed errors NOT_SENT/AMBIGUOUS/AUTH/FAULT),
witness `witness_m1_outbox.js` (descriptor there is TEST DATA). Pilot fixtures added: `QueryCOrder`/`QueryCOrderLine` read types, role access to `SyncOrder`.
Result `§M1_VERDICT PASS-with-INCONCLUSIVE` (0 fails; W6 INCONCLUSIVE by design):
| Line | Proved |
|---|---|
| `§M1_W1_ONECALL` | N documents ⇒ exactly N composite calls; server orders +N (psql oracle) |
| `§M1_W1_IDEMPOTENT` | second drain: 0 calls, 0 orders |
| `§M1_P15_PRICE` | payload carries no price; server priced the line from the PriceList master (61.75 == `M_ProductPrice` oracle) |
| `§M1_IDMAP` | header row carries legacy `DocumentNo`; each side keeps its own numbers (twin §21) |
| `§M1_W4_REJECT` | unknown product ⇒ REJECTED with the server's text, rolled back, later documents still flow (no poison) |
| `§M1_W5_BEFORE` | crash before send ⇒ resume sends exactly one |
| `§M1_W5_AFTER` | server committed, local store lost the answer ⇒ PARKED on recovery, 0 resends, 0 duplicates (G1 behaviour is now measured, not assumed) |
| `§M1_NOTSENT_*` | unreachable server ⇒ stays QUEUED, attempts capped then PARKED, nothing lost; reconnect sends once |
| `§M1_AUTH` | bad password ⇒ drain stops after ONE login attempt (no lockout loop) |
| `§M1_W6` | INCONCLUSIVE — the pilot has no hand-keyed POS document to diff against; needs one keyed in the ZK UI (not faked) |
Found while building (kept as facts): login failure text is `Error login - User invalid`; undici refuses "bad" ports like 1 (classified NOT_SENT);
composite JSON shape is `{CompositeRequest:{ADLoginRequest,serviceType,operations:{operation:[{TargetPort,ModelCRUD|ModelSetDocAction}]}}}`.
Still open in M1: G1 (an ambiguous PARKED ticket needs a way to be *resolved* — the ticket-key convention, deferred to the Unicenta project), W6 reference doc.
Next: M2 DOWN replay, then M3 parallel-run `§GAP` report.

## §23 LEGACY AS ORACLE — differential testing is the point (user 2026-10-09: "a good way to test the SQLite new system against the proven
## legacy… a better holy grail of perfecting our SQLite"). IN concept: it is the parallel run (§19/§21) seen as a test method.
**Method.** Same facts → both worlds → compare "same result" (§21 table). The legacy is decades-proven business logic, so each scenario is a
free oracle for the SQLite rule set. Every discrepancy is one of three verdicts — it must be classified, never just "different":
| Verdict | Meaning | Action |
|---|---|---|
| **MATCH** | equal under §21 | keep as a regression scenario |
| **SQLITE-GAP** | legacy is right, SQLite lacks/mis-implements a rule | fix the SQLite rule (default remedy), scenario stays as regression |
| **LEGACY-QUIRK** | legacy itself misbehaves (defect, config accident, or deliberate peculiarity) | ⚖ **SUPERSEDED by the CARDINAL RULE**: only with the user's explicit `exemption` (their words + date) AND evidence; otherwise it is a SQLITE-GAP and SQLite changes to match. |
**Seed corpus — behaviours already measured on the pilot this session (each becomes a runnable scenario in M3):**
| # | Scenario (facts) | Legacy result (measured) | First verdict to establish on SQLite |
|---|---|---|---|
| S1 | POS-type order, 1 line, complete | 1 shipment + 1 invoice auto-created; on-hand −1; priced from PriceList 61.75 | ✅ **MATCH** (M3, 2026-10-09: docstatus, line, total 6175c, 1 shipment CO, 1 invoice, stock −1 all equal) |
| S2 | product NOT on the PriceList (122) | document rejected: `Product is not on Price List` | ✅ **MATCH** (SQLite `ringLine` refuses `no-price`) |
| S3 | line with a price the client invented (10) | legacy ACCEPTED it (line 1000c) | ✅ **LEGACY-QUIRK** registered with evidence (SQLite 6175c by design, P15) |
| S4 | unknown product on a line | whole document rejected + rolled back: `Foreign ID 999999 not found in M_Product_ID` | ✅ **MATCH** (SQLite refuses the line, no document) |
| S5 | complete while an extra active accounting schema has no product-category acct ('CP Copy Target') | NPE `MProductCategoryAcct … pca is null`, CO fails | **LEGACY-QUIRK** (data accident + unguarded code): SQLite should fail *clearly* (named error), not NPE; record |
| S6 | Standard Order (132) complete | CO, no shipment, no invoice, no stock move | ✅ **MATCH after fix F1** (2026-10-09, §27): was SQLITE-GAP (SQLite also birthed a DR shipment at order time); `buildDeliverLaterGroup` is now the order half only. |
| S10 | POS sale **invoice postings** (Fact_Acct, primary schema) | Dr 518 6175 / Cr 758 6175 (receivable / revenue), no tax | ✅ **MATCH** (M3 `postings`, 2026-10-09): SQLite's own invoice folded by `doc_poster.derivePostings` equals the legacy books to the cent on a FRESH document |
| S11a | POS sale **shipment postings** on Oak Tree (COGS/Inventory) | legacy posting **errors** (`Posted=E`, `AverageCostingNegativeQtyException`: Oak Tree costed qty 0 although on-hand > 0; ~57 shipments on the pilot) — no legacy books | ⏸ **INCONCLUSIVE** (no oracle). SQLite side: `derivePostings` has no M_InOut class (basis `none`, source comment: "COGS leg is the §8 follow-up") ⇒ probable **MISSING** the day legacy produces books. Needs a pilot costing setup (a receipt giving Oak Tree a costed qty) before it can be judged. |
| S7 | order with stock below zero after completion | measured on purpose (§31): CO + shipment + invoice, stock −qty; shipment posting refused when the Average costed qty would go < 0 | ✅ S7b **MATCH**; S7a **LEGACY-QUIRK** on `postings_shipment` only (registered, §31), all other keys MATCH |
| S13 | order whose GrandTotal exceeds the customer's credit limit (§32) | REJECTED `over Credit Hold` (CreditManagerOrder.java:48-98) | ✅ **MATCH after F5** (§36.1); S13c control (no limit) completes both sides |
| S12 | void a completed POS sale (§33) | VO, shipment+invoice reversed (RE/RE), books net 0 with legacy's row form | ✅ **MATCH after F4** (§33.1), 14 keys |
| S8 | document keyed past-dated (period/date handling) | to be measured (G11) | unknown — measure first |
| S9 | login failure text / lockout behaviour | `Error login - User invalid`; lockout off on pilot | out of SQLite scope; transport only |
**Honesty note on what the "bugs" so far were:** the defects found this session were in the pilot data (S5), in my harness (price, stale text), and
in my assumptions (G1–G16) — none yet is a proven SQLite bug. The value is real but unrealised: they are the first inputs to the corpus. The first
true SQLITE-GAP will come from running S1/S2/S4/S6 on the SQLite side (M3), not from anything measured so far.
**Rule P17 in practice:** when a legacy behaviour surprises a session, the same session appends a row here (facts → legacy result → verdict) — the
`§GAP` report then runs the whole table every time, so the SQLite side only ever gets more correct.
**Exit tie-in (§21):** "convinced" = this corpus (grown by real documents too) runs to MATCH or LEGACY-QUIRK-with-evidence for the agreed period.

## §24 M2 BUILT + WITNESSED 2026-10-09 — DOWN replay (legacy-keyed documents → LOCAL engine)
Code: `replay.js` (app-agnostic; tracker events → read header+lines from legacy → `rules.apply(doc)` = the app's local-engine adapter),
`store.js` (+`bridge_inbox` exactly-once guard, `bridge_kv`), `changelog_tracker.js` (+`window` exposed). Witness `witness_m2_replay.js`
(a SECOND legacy login, GardenUser role 103, keys the document step by step — standing in for a ZK user). Gate `check_genericity.sh` (6 files) PASS.
`§M2_VERDICT PASS fails=0`: REPLAY (legacy doc applied once, lines intact) · ENGINE (`erp_engine.buildDoc` ops CREATE_DOCUMENT+CREATE_LINE+SET_STATUS,
not a row copy) · TOTAL (local fold 6175c == legacy TotalLines 6175c, psql oracle) · OWN (Bridge's own pushed doc not replayed back) ·
DEDUPE_RERUN (0) · DEDUPE_RESTART (fresh tracker, state from store ⇒ 0 re-applied) · FAIL (apply throws ⇒ FAILED row with message, sibling applied).
**Real defects the witness found in my first cut (kept as facts — P17):** (1) "baseline" ran `run()` and replayed 25 historical documents ⇒ added a true
`baseline()` (advance watermark, apply nothing); (2) after a restart the window re-read surfaced pre-baseline rows as new and re-applied 29 historical
documents ⇒ the `seen` keys inside the window must be persisted with the watermark (bounded: only ids > wm−window). Both would have silently
duplicated legacy history into SQLite in production.
Limits stated, not hidden: totals compared are LINES only (tax/GrandTotal and Fact_Acct are M3 `§GAP` territory); baseline reads the whole change log once
(server-side max-id read = G13/paging, not built); a document that reached CO and was later reversed is not replayed as a reversal yet (VO seen, skipped — `now VO, not replayed`).
Next: M3 parallel-run reconcile + `§GAP` report seeded with the §23 corpus (S1,S2,S4,S6 first).

## §25 M3 BUILT + WITNESSED 2026-10-09 — parallel-run reconcile + `§GAP` report (first differential run, legacy vs SQLite)
Code: `reconcile.js` (app-agnostic: normalised result diff, MATCH / SQLITE-GAP / LEGACY-QUIRK classification, quirk needs evidence, not-compared keys are LISTED),
witness `witness_m3_gap.js` (legacy side = Bridge push + read-back over read WS types; SQLite side = the EXISTING kernel verbs `pos_core.js` on `ad_seed_fullwidth.db`;
both adapters are test data). Pilot fixtures: 6 more read-only WS types (`QueryCInvoice(+Line)`, `QueryMInOut(+Line)`, `QueryStorage`, `QueryFactAcct`).
Gate `check_genericity.sh` (7 files) PASS; W10, M1, M2 re-run green.
**Two verdicts, kept apart:** `§M3_VERDICT HARNESS-PASS` (machinery works: no ERROR, not vacuous, negative control +1¢ caught as SQLITE-GAP, registered quirk classed
LEGACY-QUIRK, quirk without evidence refused) and `§M3_FINDINGS` (the product).
**Result of the first run — 5 scenarios, 8 keys each (outcome, docstatus, lines, total¢, shipments, shipments done, invoices, stock delta):**
`MATCH=3` (S1 POS sale · S2 product not on PriceList · S4 unknown product) · `LEGACY-QUIRK=1` (S3 client-keyed price) · `SQLITE-GAP=1` (S6).
S1 is the headline: a POS sale produced by the SQLite kernel verbs equals the legacy result to the cent, including the auto-created shipment/invoice and the stock move.
**First true SQLITE-GAP (finding F1, from S6 Standard Order):** SQLite's deliver-later path (`pos_core.buildDeliverLaterGroup`, POS_ADDON_SPEC §P-12 "the pickable shipment")
creates a DR `M_InOut` the moment the order completes; legacy creates none (a shipment appears only when generated later; `IsAutoGenerateInout='N'`). Default remedy per §21:
change SQLite — OR record it as an accepted exclusion with the §P-12 reason. That is an engine-lane decision (`pos_core.js` is the POS engine); NOT changed here. Needs the user's call.
**Bug found in my own fixture (P17):** a read WS type that lists a table's VIRTUAL (SQL) columns fails at query time (`The column name DocBaseType was not found in this ResultSet`);
the pilot SQL now excludes `ColumnSQL` columns. Anyone writing the admin proposal list must do the same.
**Not compared yet (listed in the log as `§SCN_NOT_COMPARED`):** `fact_acct` — legacy side is readable now; the SQLite posting fold (`doc_poster.derivePostings`) needs the new document rows
in a local db (next increment S10); GrandTotal/tax (legacy tax was 0 on these docs). Also unmeasured: S5 (stray accounting schema), S7 (negative stock), S8 (past-dated).
Run: `node scripts/bridge/witness_m3_gap.js` → read the `§GAP`, `§SCN`, `§RECON_SUMMARY`, `§M3_*` lines.

## §26 THE GAP-FIX LOOP — what can and cannot be automated (user 2026-10-09: "I expect a lot of gaps… is there a script that automatically patches the common parts?")
**Answer: no auto-patcher exists, and a code-patching one must not.** A diff says THAT SQLite differs, not WHY or what the right rule is; generating code from a diff
would be inventing (PRIME RULE). What IS mechanical is everything around the fix:
| Step | Automated? | Tool |
|---|---|---|
| run every witness + persist the log | ✅ now | `scripts/bridge/run_all.sh` (log → `~/.cache/bim_bridge/run_*.log`; prints verdicts + `§GAP`) |
| find the gaps | ✅ | M3 `§GAP` (reconcile) |
| classify each gap by *cause class* | semi — a human confirms | below |
| fix | **class DATA: automatable. class RULE/MISSING: human + witness first** | below |
| prove the fix and prevent regression | ✅ | the scenario that exposed it stays in the corpus; re-run `run_all.sh` |
**Cause classes (decide before touching anything):**
1. **DATA** — SQLite's dictionary/master rows differ from legacy (doctype flags, tax, price list, UoM, account config, sequences). Fix = a **patch script** for the SQLite seed
   (`patches/<db>.sql` + self-heal loader — the CLAUDE.md DB-change rule), generated by a **dictionary diff** (read the same dictionary rows from legacy over read WS types,
   compare to `ad_seed`, emit INSERT/UPDATE statements). This is the one family a script can safely generate, deterministically, with the legacy row as the source (EXTRACT, not invent).
   *Not built yet* (needs one read WS type per dictionary table, admin config); the pilot can use psql as a dev-only oracle.
2. **RULE** — the engine verb computes/decides differently (e.g. F1/S6: `buildDeliverLaterGroup` creates a DR shipment legacy does not). Human decision (fix vs accept), engine lane, with the
   scenario as the failing test first (Spec-First).
3. **MISSING** — a legacy behaviour SQLite does not implement at all (a doc-action, a validation, a posting account). Human spec first, then build.
4. **FANOUT/CALC** — counts or amounts differ because of a rule inside (2)/(3); fix the rule, not the number.
**Honest triage of today's single gap:** F1/S6 is class RULE (SQLite seed 132 already has `IsAutoGenerateInout='N'` like legacy — the data is equal; the code chooses to add a DR shipment).
So no script would have fixed it; the loop's job was to surface it with evidence and a repeatable test.
**Next tool (proposed, not built):** `dict_diff` — for a list of dictionary tables, legacy rows (WS) vs `ad_seed` rows → `§DICT_GAP` lines + a generated `patches/*.sql`
for review. Expect it to clear the DATA family in bulk as scenarios multiply; RULE/MISSING stay one-at-a-time.

### §26.1 DICT_DIFF BUILT + WITNESSED 2026-10-09 — the DATA class is now a script; what remains is RULE only (user: "nail it down to just RULE")
Code: `dict_diff.js` (app-agnostic: `discover` legacy rows over read WS types → `compare` with the SQLite seed → `toPatch` from LEGACY values; INSERT OR IGNORE + UPDATE, **never DELETE**),
spec data `dict_spec.json` (table, key, read type, keyBelow=1000000 so pilot test rows are ignored), witness `witness_dict_diff.js`, wired into `run_all.sh` with a `§TRIAGE` line.
Patches are written to `scripts/bridge/out/dict_patch_<table>.sql` for review and applied only to a SCRATCH copy in the witness; no shared seed is touched (patch + self-heal loader is the delivery path).
`§DD_VERDICT PASS`: DETECT (a corrupted cell and a deleted row both found — negative control) · PATCH_FIX (patch restores both from the legacy value; re-diff clean) · IDEMPOTENT (apply twice = no change) · NO_DELETE.
**Real finding (the pattern the user saw):** `c_doctype` (51 legacy rows), `c_tax` (6), `m_pricelist` (4) — **0 differing cells, 0 missing rows**; SQLite's dictionary equals legacy on every column both share
(41/27/15 columns). The only extra row is the SQLite null/system row `C_DocType_ID=0`. So today's whole gap list (S6) is **not data**: `§TRIAGE DATA_gaps=0 RULE_queue=[S6-standard-order]`.
**The reduced loop (consistent, no per-gap stitching):**
1. `scripts/bridge/run_all.sh` — runs everything, persists the log, prints `§TRIAGE`.
2. If `DATA_gaps > 0` → review + apply the generated `out/dict_patch_*.sql` (ship via patch + loader), re-run. This step is mechanical.
3. Whatever `SQLITE-GAP` remains with a clean dictionary is, by elimination, an engine **RULE** (MISSING behaviours are treated as RULE work too): failing scenario already exists (the gap IS the test) → decide fix vs accept → engine lane → re-run to MATCH.
Extending coverage = add rows to `dict_spec.json` (+ a read type per table on the legacy side) and scenarios to the corpus; no new code unless a NEW pattern appears (record it here).

## §27 DECISION RECORD F1 — fix S6 on the SQLite side (user 2026-10-09: "Of course fix this way i.e. SQLite. As long as you record everything we can always backtrack")
**Decision.** Per §21 (SQLite is the working world; default remedy = fix the SQLite rule) the deliver-later path now equals legacy: completing a Standard Order creates no shipment.
**Evidence it was wrong:** M3 `§GAP scenario=S6-standard-order key=shipments legacy=0 sqlite=1`; dict_diff clean (class RULE, not DATA).
**What changed (one commit; `git revert <sha>` restores the old behaviour):**
| File | Change |
|---|---|
| `build/erp/pos_core.js` | `buildDeliverLaterGroup` = ORDER HALF ONLY (`shipment:null`, `shipmentDeferred:true`); NEW `buildGenerateShipmentOps` (the "Generate Shipments" act — same `buildDoc` spec, ids, shipment-doctype link as before); NEW `buildDeliverLaterWithShipment` = the old output byte-for-byte (order half + generate in one group). Comment block with the reasoning is in the file. |
| `build/erp/pos_lens.js` | the one deliver-later call site switched to `buildDeliverLaterWithShipment` (UI behaviour unchanged) |
| `scripts/poc_pos_deliverlater.js`, `poc_wh_pos_pick.js`, `poc_kitchen_queue.js`, `poc_oplog_clipboard.js` | calls switched to the wrapper (mechanical rename) |
**Regression proof (logs kept in the session scratchpad, before/after):** all four witnesses stay green with identical counts — deliverlater 26🟢, wh_pos_pick 17🟢, kitchen_queue 15🟢,
oplog_clipboard 11🟢, 0🔴 — and their logs are identical after masking random group ids (the deliver-later `groupHash` of `poc_oplog_clipboard` is unchanged: `b1dbdd6e75ea`);
`poc_pos_wr/hold/register/edit/void/crud` still exit 0. M3: `S6-standard-order MATCH`, `RECON_SUMMARY MATCH=4 LEGACY-QUIRK=1 SQLITE-GAP=0`, `§TRIAGE RULE_queue=[]`.
**Honest residue (not hidden):** the kitchen / warehouse-pick / POS lens flows still create the DR shipment in the SAME group as the order (via the wrapper), because
"sent to kitchen" and "ready to pick" ARE that shipment. For those flows SQLite is still not twin-equal at the moment of sale. Closing it = those UIs commit the two halves as
two groups (order CO now; Generate Shipment when sent/picked) — a UX-lane follow-up that changes their witnesses' group shape. Not done here; listed as F2.
**Rule for future gaps (P17):** every fix gets a row like this — evidence, files, proof, residue, one-commit backtrack.

## §28 M3 POSTINGS INCREMENT BUILT + WITNESSED 2026-10-09 — Fact_Acct compared (SQLite fold vs legacy books)
Change: `witness_m3_gap.js` gains keys `postings` (invoice, primary schema) and `postings_shipment`; legacy side reads `QueryFactAcct` (waits for async posting, honours `Posted=E`);
SQLite side materialises ITS OWN computed invoice rows into a scratch copy of `glassbowl_data.db` and folds them with the product's `doc_poster.derivePostings` (test adapter; shared db untouched).
`reconcile.js` learns **INCONCLUSIVE keys** (`§SCN_INCONCLUSIVE`, scenario printed `PARTIAL`): a side that cannot produce its reference result is neither MATCH nor gap.
Result: `MATCH=4 LEGACY-QUIRK=1 SQLITE-GAP=0 inconclusive_keys=2`. **The headline:** invoice postings for a fresh POS sale — SQLite fold == legacy Fact_Acct, 518 Dr 6175 / 758 Cr 6175. Negative control (+1¢ on the invoice rows)
is caught on both `total_cents` and `postings`. S3's keyed price flows into the books on legacy (1000¢) — covered by the registered quirk.
**Honest limits:** the posting compared is the simple one (receivable/revenue, tax 0, one line, one currency, primary schema; the Euro schema is listed as not compared); the shipment/COGS leg is
UNJUDGED (S11) — legacy's own posting fails on the pilot's cost data, so the probable SQLite gap there (no M_InOut posting class) stays a hypothesis until a reference exists.
**Bug in my first cut (P17):** I first scored the shipment key as SQLITE-GAP from "no legacy rows"; the pilot's `Posted=E` + AD_Issue showed legacy had no books at all. Absence of a reference is INCONCLUSIVE, not a gap — now enforced by the runner.
Next candidates: give Oak Tree a costed quantity on the pilot (legacy material receipt) to unlock S11; more postings classes (payment, allocation); tax (a taxed product).

## §29 S11 — shipment COGS/Inventory posting: first real MISSING gap, and why it is data first (2026-10-09, user: "Oak Tree")
**What I did and where I deviated.** Oak Tree cannot be judged: legacy's costed quantity is 0 (so its shipment posting errors, S11a above). Fixing that needs a legacy material receipt / inventory document with
its own WS types and costing side effects — more fixture than the question warrants. The pilot already has costed products, so S11 now runs on **Fertilizer #50 (product 136; costed qty 40 @ 18.00, on PriceList 101 at 20.00,
in the SQLite seed at 20)**. Oak Tree stays an open fixture task if you specifically want it.
**Result `S11-pos-sale-costed-product`:** everything MATCHes (docstatus, line 136:1:2000¢, total, 1 shipment CO, 1 invoice, stock −1, **invoice postings 518 Dr 2000 / 758 Cr 2000**) EXCEPT
`postings_shipment`: legacy `430 Dr 1800 / 742 Cr 1800` (= Product CoGs / Product asset at cost 18.00 × 1), SQLite `none` ⇒ **SQLITE-GAP, class MISSING** (the SQLite posting fold has no `M_InOut` class;
`doc_poster.js` header says the COGS leg is "§8 follow-up, cost data named-deferred in seed").
**Blind spot found in my own tool (P17):** `dict_diff` compared only columns BOTH sides have, so a column legacy has and SQLite lacks was invisible. It now reports `§DD_COLUMNS … legacy-has-but-sqlite-lacks=[…]`.
Run on the posting tables it shows exactly what the missing rule needs and the SQLite seed (`glassbowl_data.db`) does not carry:
`m_product_category_acct`: **`costingmethod`, `costinglevel`**, p_costadjustment/ratevariance/landedcostclearing/invoicepricevariance/tradediscount accts ·
`m_costelement`: **`name`**, iscalculated · `m_cost`: **`currentqty`**, futurecostprice, iscostfrozen, … (list in the log).
**So the S11 fix is two steps, in this order (nothing built yet):**
1. **DATA/schema (scriptable):** extend `dict_diff` to emit `ALTER TABLE … ADD COLUMN` + the legacy values for those columns (patch + self-heal loader, never a binary commit) — composite-key tables need a key list in `dict_spec.json`
   (`m_product_category_acct`: category+schema; `m_cost`: product+schema+type+element).
2. **RULE (engine lane, spec first):** `doc_poster.deriveInOut` — Dr `{Product.Cogs}` / Cr `{Product.Asset}` = qty × current cost price of the cost element selected by the category's `CostingMethod`
   for the schema (resolver tokens already exist in `post_resolver.js`); sales-shipment polarity from `movementtype C-`. Acceptance = S11 `postings_shipment` MATCH to the cent; do NOT pick a cost element by guesswork
   before `costingmethod` is in the seed (that would be inventing).
**Other facts surfaced:** legacy lets on-hand go negative (S7); legacy shipment posting depends on the *costed* quantity, not on-hand (S11a) — a legacy trap SQLite should not replicate silently.
Run: `scripts/bridge/run_all.sh` (S11 shows as SQLITE-GAP; `§TRIAGE` will list it in the RULE queue once the data step is done).

## §30 F3 DONE — SQLite now posts the sales shipment (COGS / Inventory); S11 MATCH to the cent (2026-10-09, user: "yes" to §29 steps)
**Finding that reordered the plan:** step 1 (schema ALTER patch) is NOT a prerequisite. Reading the legacy source for the exact rule showed the cost method falls back to the schema's:
`MProduct.getCostingMethod(as)` (MProduct.java:1080-1088) = category `CostingMethod` if set, else `C_AcctSchema.CostingMethod`. Legacy has the category column **empty on every row** (checked on the pilot), the schema is `'A'`
(Average PO), and the SQLite posting db already carries `c_acctschema.costingmethod` + `m_costelement.costingmethod` + `m_cost.currentcostprice`. So the data needed existed; only the rule was missing.
**Rule added (engine lane, one commit, spec-first = §29 + the failing S11 scenario):** `scripts/doc_poster.js` — `deriveInOut` + `costingMethodOf` + `currentCost`, wired in `derivePostings` for `table:'M_InOut'`.
Extracted from `Doc_InOut.createFacts` "Sales - Shipment" (Doc_InOut.java:208-300): per line, costs = qty × current cost (element chosen by costing method; price from `m_cost` for product/schema/cost type/element);
**Dr `{Product.Cogs}` / Cr `{Product.Asset}`**; zero cost on a stocked item ⇒ reported absent ("No Costs for …", Doc_InOut.java:244-258), never invented; service skipped. Only IsSOTrx=Y, movementtype C- (sales shipment) is built.
**Proof:** `S11-pos-sale-costed-product` shipment postings legacy `430 Dr 1800 / 742 Cr 1800` == SQLite fold (was `none`). M3 `RECON_SUMMARY MATCH=5 LEGACY-QUIRK=1 SQLITE-GAP=0 errors=0`; `§TRIAGE RULE_queue=[]`.
Regression: the eight existing posting witnesses (`poc_doc_poster, post_harden, post_glcategory, post_b3, post_tail, postings, post_derive, post`) — green counts 7/4/7/15/12/7/5/3, **logs byte-identical to the pre-change run (diff = 0 lines)**. Logs kept in the session scratchpad. Backtrack = revert the one commit.
**Honest limits (not hidden):** reversals, returns/receipts, BatchLot costing level, org-specific cost rows, the "zero-cost vendor item is OK" exception (Doc_InOut.java:247-251) and the second (Euro) schema are NOT implemented/compared;
the SQLite posting db lacks `m_product.isstocked`, `m_cost.currentqty`, category `costingmethod` (the §29 schema gaps — now hygiene, not blockers): the code treats a missing `isstocked` as "item" and says so.
Oak Tree (costed qty 0) still posts an error on legacy — a legacy trap SQLite deliberately does not reproduce (it would post COGS from `m_cost` regardless of costed quantity; if a scenario ever needs "legacy refuses", record it as LEGACY-QUIRK).
**Harness hardening in the same pass (P17):** a crashed side is now `§SCN_ERROR` / verdict `ERROR`, never counted as a SQLite gap (an earlier run mislabelled one transient legacy error as SQLITE-GAP S2; three reruns were clean, cause unrecorded).
**Gap ledger so far (all numbered, all backtrackable):** F1 deliver-later shipment → fixed (§27) · F2 UI lanes still bundle the DR shipment (open, UX lane) · F3 shipment posting → fixed (§30) · S3 keyed price → LEGACY-QUIRK · S5/S7/S8 unmeasured on SQLite.

## §31 S7 — NEGATIVE STOCK, measured on purpose (2026-10-09, backlog item 1) — SPEC written before the scenario code
**Facts.** HQ warehouse 103 (`IsDisallowNegativeInv='N'` on legacy AND in `ad_seed_fullwidth.db`). Product **128 Azalea Bush** (not used by any other scenario; on PriceList 23.75 both sides;
legacy on-hand 5, Average-PO costed qty 5 @ 23.75 at spec time). Quantity = **legacy on-hand at run time (floored at 0) + 1**, read over `QueryStorage` just before the run, so every run sells beyond on-hand
(first run crosses 5 → −1; later runs sell into already-negative stock). Two variants: **S7a POS Order (135)**, **S7b Standard Order (132)**.
**Legacy rules read before measuring (P14):** on-hand may go negative unless the warehouse disallows it — `MStorageOnHand.addQtyOnHand` (MStorageOnHand.java:860-866, throws `NegativeInventoryDisallowedException` only when
`wh.isDisallowNegativeInv()`); a WR order forces delivery when negative stock is allowed (MOrder.java:2181-2185, `DELIVERYRULE_Force`); average costing refuses a costed quantity below zero —
`MCost.add`/`setWeightedAverage`/`setCurrentQty` (MCost.java:1670-1682, 1715-1722, 1919-1930: `AverageCostingNegativeQtyException`), which runs at POSTING time, not at completion.
**Expected (hypothesis only, to be measured):** S7a CO + shipment CO + invoice, stock −qty, invoice books normal; the SHIPMENT posting crosses the costed qty ⇒ legacy `Posted=E` (no COGS books).
S7b CO, no shipment, no stock move. SQLite verbs (`pos_core.buildSaleGroup` / `buildDeliverLaterGroup`) take no on-hand input at all (no stock check), so SQLite completes too.
**How measured:** corpus rows in `witness_m3_gap.js` (same 10 keys). For S7a the shipment posting key is judged with `judgePostingRefusal` = the legacy adapter re-reads the shipment's `Posted` until Y/E and reports
a refusal as the result `REFUSED:Posted=E` (here the refusal IS the rule under test; for S1/Oak Tree, whose costed-qty-0 state is a pilot accident, `Posted=E` stays INCONCLUSIVE — unchanged).
Reason text for a refusal is taken from the read-only psql oracle (`AD_Issue`), never guessed.

**RESULT (measured 2026-10-09, `witness_m3_gap.js`, log `~/.cache/bim_bridge/run_20261009_143948.log` + rerun):** `§S7_FACTS product=128 legacy_onhand_before=5 … qty=6` (first crossing), later runs `onhand_before=-1/-7, avg_costed_qty=5, qty=6`.
- **S7b Standard Order beyond on-hand: MATCH** (10/10 keys: CO, no shipment, no invoice, no stock move — neither side checks availability on an SO).
- **S7a POS sale beyond on-hand:** docstatus CO, 1 shipment CO, 1 invoice, `stock_delta {"128":-6}`, invoice books 518 Dr 14250 / 758 Cr 14250 — **all equal**. Negative stock itself is a MATCH: legacy allows it on a warehouse with
  `IsDisallowNegativeInv='N'`, SQLite's verbs never consult on-hand. **The one difference is the books of the shipment:** legacy `REFUSED:Posted=E` — AD_Issue 1000287 `AverageCostingNegativeQtyException: Product=Azalea Bush,
  Current Qty=5.0, New Current Qty=-1.0, CostElement=Average PO` (the WHOLE shipment is refused, not just the uncosted part); SQLite books `430 Dr 14250 / 742 Cr 14250` (6 × 23.75).
  **Verdict: LEGACY-QUIRK, registered with evidence** — per the §30 record ("a legacy trap SQLite deliberately does not reproduce … if a scenario ever needs 'legacy refuses', record it as LEGACY-QUIRK"): SQLite keeps no
  costed-quantity state (`m_cost.currentqty` absent, §29) so it cannot refuse on it without a costing ledger. Because this is a books difference the user may want closed instead, it is ALSO raised as question **Q-S7** (§34).
- **Not measured (stated):** a warehouse with `IsDisallowNegativeInv='Y'` — SQLite's POS verbs ignore that flag (only `ad_modelval.js:315-319` reads it, for the delivery-rule default). Measuring legacy needs a warehouse master change, which is
  admin configuration, not a normal user's document ⇒ INCONCLUSIVE, not a gap. Also: every S7a run leaves one more `Posted=E` shipment on the pilot (harmless; reset by importiDempiere).

## §32 FOUND WHILE MEASURING S7 (P17, 2026-10-09): CREDIT HOLD — a new legacy rule, and a harness that was drifting into it
**Fact (measured, run 2 of S7):** both S7 orders came back `REJECTED: Failed when processing document: Business Partner with this Order over Credit Hold - Open`. psql oracle: BP 118 Joe Block
`SO_CreditLimit=10000`, `TotalOpenBalance=9967.73`, `SOCreditStatus=W`. Every witness (W10, M1, M2, M3) sells to BP 118 and nothing ever pays those invoices, so the harness itself was
consuming the credit line: headroom is now 32.27, i.e. the NEXT run would have rejected every legacy order (S1, S3, S6, S11, M1, M2) and the corpus would have reported a wall of false gaps.
**Legacy rule (extracted):** `CreditManagerOrder.checkCreditStatus` (CreditManagerOrder.java:48-98) — on DocAction PR of an SO with GrandTotal > 0, bill-BP `SOCreditStatus` S (stop) or H (hold) ⇒ refuse;
and `bp.getSOCreditStatus(grandTotal)` = H ⇒ refuse `@BPartnerOverOCreditHold@`. `MBPartner.getSOCreditStatus(additionalAmt)` (MBPartner.java:826-850): no check when status X/S or `SO_CreditLimit=0`;
hold when `TotalOpenBalance > SO_CreditLimit − additionalAmt`. POS (WR) orders are checked too while sysconfig `CHECK_CREDIT_ON_CASH_POS_ORDER='Y'` (pilot value Y).
**SQLite:** no order credit check anywhere in the kernel/POS verbs (grep `creditlimit|creditstatus` in `build/erp` finds only a default in `ad_process.js:881`); the seed carries the data (BP 118 limit 10000, status O, balance 269.23 — a different STATE, same rule inputs).
**Decision (harness fault, not a verdict):** the routine corpus and the W10/M1/M2 witnesses move to BP **112 'Standard'** (location 108): `SO_CreditLimit=0` ⇒ the credit check is a no-op by the rule above
(MBPartner.java:833-836), receivable account 518 like 118 on both sides, so no scenario's meaning changes. BP 118 is KEPT as the deliberate credit-hold customer:
**S13a** POS Order / **S13b** Standard Order, BP 118, Oak Tree × 200 (GrandTotal 12350 > limit 10000 ⇒ hold whatever the open balance, as long as it is ≥ −2350; deterministic across runs).
Expected legacy: REJECTED (both). SQLite: COMPLETED ⇒ SQLITE-GAP, class MISSING. Fixing it changes what the POS counter does (a sale refused for credit) ⇒ that is a user call (brief rule 6), recorded as ⛔ below, not built.
**RESULT (measured 2026-10-09):** harness on BP 112: W10 PASS, M1 PASS-with-INCONCLUSIVE (W6 as before), M2 PASS, M3 S1/S2/S4/S6/S11 MATCH, S3 QUIRK — unchanged verdicts, receivable still 518 (the switch changed no meaning).
**S13a/S13b: legacy REJECTED** `Business Partner with this Order over Credit Hold - Open`; **SQLite COMPLETED** (POS: CO + shipment + invoice; SO: CO) ⇒ **SQLITE-GAP, class MISSING** (order credit check). Stays in `§TRIAGE RULE_queue`
as the failing regression until decided — question **Q-S13** (§34). Fix sketch for whoever builds it (not built): a `C_Order` prepare/complete validator reading bill-BP `socreditstatus`, `so_creditlimit`, `totalopenbalance`
(columns present in `ad_seed_fullwidth.db`) with the exact branches of CreditManagerOrder.java:52-95 incl. the two sysconfig exemptions; the SQLite open balance is its OWN state, so the S13 facts were chosen to hold whatever the balance.
**Pilot facts recorded (P17):** S11 consumes Fertilizer #50's Average-PO costed qty by 1 per run (28 left at 2026-10-09 14:40) — after ~28 more runs legacy will refuse S11's shipment posting (S7a's rule) and S11 turns into a
`postings_shipment` difference; a legacy material receipt (or importiDempiere) resets it. Same mechanism made Oak Tree (S1) INCONCLUSIVE.

## §33 S12 — VOID a completed POS sale (2026-10-09, backlog item 2) — SPEC written before the scenario code
**Facts.** POS Order (135), BP 112, product **136 Fertilizer #50 × 1** (costed, so the shipment books exist; the reversal gives the costed qty back, so the scenario is cost-neutral on the pilot) → CO → **VO** on the order.
**Legacy rule (read first):** `MOrder.voidIt` (MOrder.java:2680-2760): SO ⇒ `createReversals` (2766-2840): every CO shipment `reverseCorrectIt` ⇒ status RE, every CO invoice `reverseCorrectIt` ⇒ RE; then each order line
`setQty(0)` + `LineNetAmt 0` (2701-2713), reservations cleared, order `TotalLines=GrandTotal=0`, status VO. Legal: VO is offered on a CO order (DocumentEngine.getValidActions, ported in `ad_docfsm.legalActionsOrder`).
**Route on legacy:** stock `setDocAction` method with a FREE `docAction` parameter (the stock `CompleteOrder` type has docAction constant `CO`): bridge fixture `scripts/bridge/pilot/ws_docaction.sql` registers
`BridgeDocActionCOrder` (idempotent, role 102). A normal user voiding an order in the ZK window does the same doc-action.
**SQLite side (existing verbs only = the W-POS-VOID recipe, `scripts/poc_pos_void.js`):** sale = `pos_core.buildSaleGroup` (as S1); void = `ad_docfsm.dispatchOrder(CO,'VO')` for the order, `ad_docfsm.dispatchFor(319|318, CO,'VO')` for the shipment / invoice,
books = forward fold (`doc_poster.derivePostings`) + `erp_engine.reversePosting`, stock = the sale's C− legs negated.
**Keys compared (after the void):** order docstatus · order line qty · order TotalLines (¢) · shipment status(es) · invoice status(es) · count of shipment / invoice documents (original + reversal) · stock net delta (sale + void) ·
invoice books NET per account (original + reversal) · shipment books NET per account. Expected legacy: VO · 0 · 0 · RE · RE · 2 · 2 · {} · all 0 · all 0. Unknown before measuring: whether the reversal docs carry the order link.
**⏸ PAUSED 2026-10-09 (user pause request).** Done: spec above; fixture `scripts/bridge/pilot/ws_docaction.sql` written and APPLIED to the pilot (idempotent, applied twice, `BridgeDocActionCOrder|setDocAction|3 params`).
NOT done: server restart (the new type is not live until `~/idempiere-pilot/stop.sh; sleep 8; start.sh`, wait for /webui/ 200 + 10 s); no scenario code yet. **Resume:** restart the server → add an S12 adapter pair to `witness_m3_gap.js`
(legacy: push the S1-style sale for product 136, then `call(cfg,'set_docaction',{ModelSetDocAction:{serviceType:'BridgeDocActionCOrder',tableName:'C_Order',recordID:id,docAction:'VO'}})`, read back order/lines/M_InOut/C_Invoice/
storage/Fact_Acct for the original AND the reversal docs; SQLite: the W-POS-VOID recipe listed above) → measure legacy first → classify → run_all → decision record. Backlog items 3-8 not started.

**▶ RESUMED 2026-10-09 (server restarted, `BridgeDocActionCOrder` live).** Legacy MEASURED first (probe order 1000725, psql oracle read-only):
order `VO`, TotalLines 0, line `QtyOrdered 0 · LineNetAmt 0 · Description "** Voided (1)"` (AD_Message `Voided`='** Voided'); shipments 1000291 (orig, qty 1) + 1000292 (reversal, qty −1, SAME movementtype C−, carries C_Order_ID) both `RE`;
invoices 1000276 (20.00) + 1000277 (−20.00) both `RE`. Books (schema 101): invoice orig `518 Dr 20 / 758 Cr 20`, reversal `518 Dr −20 / 758 Cr −20` (NEGATIVE on the SAME side: the reversal invoice is negated and posted as-is,
FactLine.setAmtSource flips sides only when `IsAllowNegativePosting='N'` — FactLine.java:237-250; pilot schemas are 'Y'); shipment orig `430 Dr 18 / 742 Cr 18`, reversal `430 Cr 18 / 742 Dr 18` (sides SWAPPED: `FactLine.updateReverseLine`
FactLine.java:1357-1359 via Doc_InOut.java:288-296, 317-325). Costed qty of 136 went back +1 (cost-neutral as designed).
**SQLite before the fix:** `ad_docfsm` knows VO is legal and the outcome status, `reversePosting` swaps sides, `deriveInvoice` keeps negatives on their side — but NO verb performs the void: nothing zeroes the lines/totals, nothing creates the
reversal shipment/invoice or sets RE. ⇒ **SQLITE-GAP class MISSING.** Fix F4 = NEW pure verb `erp_engine.voidOrder` (port of MOrder.voidIt 2680-2760 + createReversals 2766-2840 + MInOut/MInvoice.reverseCorrectIt document shape), additive,
host supplies new ids and the `Voided` message text (read from the SQLite dictionary `ad_full.db` AD_Message — note: `ad_seed_fullwidth.db` has NO ad_message table; L&F item 7). Witnessed by S12 keys below.

### §33.1 DECISION RECORD F4 — S12 void: SQLite now voids a completed sale exactly like legacy (2026-10-09, cardinal rule: copy legacy)
**Evidence it was missing:** legacy measured above; SQLite had the legality (`ad_docfsm.dispatchOrder` CO→VO) but no verb that performs `MOrder.voidIt`. Reversal shipment books would also have come out as negative costs instead of legacy's swapped sides.
**What changed (one commit; `git revert <sha>` restores the old behaviour):**
| File | Change |
|---|---|
| `scripts/erp_engine.js` | NEW pure verb `voidOrder(sale, {voidedMsg,newId})` — port of MOrder.voidIt 2680-2760 / createReversals 2766-2840: per CO shipment/invoice a reversal doc (same type, same order link, negated qty/amount, `reversal_id` both ways), both `RE`; non-CO ⇒ `VO`; CL/RE/VO skipped; order lines qty 0 / LineNetAmt 0 / description `<Voided> (<old qty>)` (:2709, ' \| ' join MOrderLine.java:632-639); order description, TotalLines = GrandTotal = 0, status VO. Additive (new export only). |
| `scripts/doc_poster.js` | `deriveInOut` REVERSAL branch: header `reversal_id` + every line `reversalline_id` (Doc_InOut.isReversal :1143-1145) ⇒ the ORIGINAL shipment's books with Dr/Cr swapped (FactLine.updateReverseLine :1357-1359); original not derivable ⇒ absent "Original Shipment/Receipt not posted yet" (Doc_InOut.java:293). Column-guarded (`_hasCol`), so dbs without the columns behave as before. |
| `scripts/bridge/witness_m3_gap.js` | S12 scenario (legacy: sale → wait for shipment posting → `BridgeDocActionCOrder` VO → read back; SQLite: sale → `dispatchOrder` → `voidOrder` → fold every doc with `derivePostings`), 14 keys, + `§M3_VOID_NEGATIVE_CONTROL`. Message text read from `ad_full.db` AD_Message. |
| `scripts/bridge/run_all.sh` | triage excludes every `NEG-*` control (was only `NEG-control`) |
**Proof:** `§SCN S12-void-pos-sale MATCH compared=14 inconclusive=0` — VO · line qty 0 · "** Voided (1)" · total 0 · shipments RE,RE (qty 1,−1) · invoices RE,RE (2000,−2000) · stock net {} · invoice books orig `518 Dr 2000 / 758 Cr 2000`, reversal `518 Dr −2000 / 758 Cr −2000` ·
shipment books orig `430 Dr 1800 / 742 Cr 1800`, reversal `430 Cr 1800 / 742 Dr 1800` — equal to legacy to the cent and to the side. `§M3_VOID_NEGATIVE_CONTROL PASS` (+1¢ ⇒ SQLITE-GAP on post_inv_orig).
**Regression:** 99 non-browser witnesses that load erp_engine/pos_core/doc_poster/ad_docfsm/crud_overlay/ad_modelval run before (twice) and after: exit codes identical; logs identical after masking UUID/timestamps except the 5 that differ between two runs of the
UNCHANGED code (`poc_ad_oplog_distrib`, `poc_genesis_minimal`, `poc_opgroup`, `poc_oplog_clipboard` group ids; `poc_bench_fold_curve` timings). (Two browser-driven `*_live` witnesses ran once by mistake in the first baseline; excluded since.)
**Honest residue:** a void of an order whose shipment was never posted (legacy refuses: "Original Shipment/Receipt not posted yet") is only covered by the `absent` path, not by a scenario; `IsAllowNegativePosting='N'` schemas (legacy flips negative amounts to the other side,
FactLine.java:237-250) are not handled — the SQLite posting db lacks that column (pilot schemas are 'Y', so no scenario can expose it now); RC (reverse-correct) on an order = voidIt (MOrder.java:3016) — same verb, not separately scenario-tested; the POS lens UI does not call `voidOrder` yet (it still uses its own recipe) — UX lane, queued with F2.

## §34 OPEN QUESTIONS for the user (P16: each is IN concept §21 twin principle; the record does not settle it)
- **Q-S7** (§31): when stock goes below the Average-costed quantity, legacy refuses to book the shipment (it stays `Posted=E`), but SQLite books COGS at current cost. Keep this as an accepted LEGACY-QUIRK (that is how it is registered now, per §30),
  or have SQLite copy legacy? Copying it means SQLite would need a running costed-quantity ledger (MCost.currentqty upkeep), which it does not have today.
- **Q-S13** (§32): legacy refuses an order when the customer goes over their credit limit (CreditManagerOrder.java:48-98, including POS orders while `CHECK_CREDIT_ON_CASH_POS_ORDER=Y`). SQLite has no credit check.
  Should SQLite add it? That would mean the POS counter can refuse a sale for credit — a POS UX change, so it is your call (brief rule 6).

## §35 CARDINAL RULE APPLIED (2026-10-09) — what it changes, enforced in code, backlog for the resume
**Enforced structurally (not just written):** `reconcile.js` `classify()` honours a quirk only when it carries `evidence` AND `exemption` (user's words + date); otherwise logs `§QUIRK_REFUSED` and the diff stays SQLITE-GAP.
Witness control both ways: `§M3_QUIRK_NEEDS_EXEMPTION PASS` (no exemption ⇒ SQLITE-GAP, with exemption ⇒ LEGACY-QUIRK). The S7a quirk entry the agent had registered was REMOVED (commit below); S3's lacks an exemption and is refused.
**Re-classification of the open ledger under the rule:**
| Item | Was | Now |
|---|---|---|
| S3 client-keyed price | LEGACY-QUIRK (SQLite refuses by P15) | **SQLITE-GAP (provisional)** — and note P15/"no free numbers" is a POS-LENS-surface concept; the SQLite AD-window clone of the Sales Order line must accept a keyed price exactly like legacy. Measure on the CRUD/AD-window path (`crud_overlay`), not only the POS lens. |
| S5 stray accounting schema (legacy NPE) | LEGACY-QUIRK candidate | **same OUTCOME required**: legacy cannot complete ⇒ SQLite cannot complete (a named error is allowed). |
| S7a POS sale beyond on-hand, costed qty < 0 | LEGACY-QUIRK (Q-S7) | **SQLITE-GAP (RULE)** — SQLite must refuse the shipment posting when the Average-PO costed quantity would go below zero (MCost.java:1919-1930). Needs a running costed-qty (`m_cost.currentqty`, cost detail) in the SQLite model — the §29 schema gap becomes a prerequisite, not hygiene. **Q-S7 answered: copy legacy.** |
| S13 credit hold | SQLITE-GAP (Q-S13 asked) | **SQLITE-GAP (RULE/MISSING)** — implement `CreditManagerOrder` semantics (CreditManagerOrder.java:48-98; BP without a limit skips, MBPartner.java:833-836). **Q-S13 answered: yes, refuse like legacy** (the POS counter refusing for credit IS legacy behaviour). |
| F2 kitchen/pick/POS lens bundle the DR shipment with the order | parked UX | **parity gap, queued** (sequenced after the data/rule gaps, per the user's "leave UX for now") — not a permanent exemption. |
| LEGACY-QUIRK count in the corpus | 1-2 accepted | **0 until the user exempts something.** |
**New backlog item (L&F parity, the user's "even L&F"):** extend `dict_diff` (composite keys + the §29 ALTER generator first) to the UI metadata tables and compare legacy vs SQLite seed; then a structural UI witness in the style of `prompts/ERP_IDEMPIERE_UX_PARITY.md` ("X of N AD windows pass": for every AD window/tab/field the SQLite renderer's computed field list, order, labels, read-only/mandatory/display logic and default values equal the legacy window read via WS) — numbers and `§` lines, never screenshots.
**Resume brief for the paused agent (also usable by any session):** (1) restart pilot server, finish S12 void (resume point in §33); (2) S13 credit check in SQLite; (3) S7a costed-qty (schema patch first: `m_cost.currentqty` + cost detail semantics); (4) S3 on the AD-window path; (5) S8 past-dated, S5 same-outcome, tax, Euro schema; (6) dict_diff composite keys + ALTER generator; (7) L&F parity over the AD metadata tables; (8) F2 UX parity last. Every item: cardinal rule first, no exemption without the user's words.

## §36 F5 — S13 order credit check in SQLite (2026-10-09, cardinal rule: refuse like legacy) — SPEC before code
**Rule to port (verbatim branches):** called from `MOrder.prepareIt` (MOrder.java:1688-1697, also on the CO path) → `CreditManagerOrder.checkCreditStatus(PR)` (CreditManagerOrder.java:48-98):
SO only; skip when DocSubTypeSO=WR AND PaymentRule=B(cash) AND sysconfig `CHECK_CREDIT_ON_CASH_POS_ORDER`=N; skip when DocSubTypeSO=PR(prepay) AND `CHECK_CREDIT_ON_PREPAY_ORDER`=N (both default **true** when absent — `MSysConfig.getBooleanValue(…, true, …)`);
only when GrandTotal > 0: bill-BP status S ⇒ error `BPartnerCreditStop`; status H ⇒ `BPartnerCreditHold`; `getSOCreditStatus(grandTotal)` = H ⇒ `BPartnerOverOCreditHold`.
`MBPartner.getSOCreditStatus(add)` (MBPartner.java:826-850): add 0/null ⇒ stored status; status X or S, or `SO_CreditLimit`=0 ⇒ stored status; `SO_CreditLimit − add < TotalOpenBalance` ⇒ H; else watch/OK (not refusing).
**Where in SQLite:** a pure kernel verb `erp_engine.creditCheckOrder(order, bp, sys)` (generic, not POS words) + a gate in the three POS verbs that complete an SO (`buildSaleGroup`, `buildDeliverLaterGroup`, `buildRecallCompleteGroup`) that runs
when the host supplies `ctx.creditOf(bpId) → { bp row, sysconfig }`; refusal = `{ok:false, reason:'credit-<stop|hold|over-hold>'}` before any op is emitted (legacy: STATUS_Invalid, nothing completes). The POS lens host supplies `creditOf` from its own db
(`c_bpartner` + `ad_sysconfig` when present, legacy default otherwise). Callers that do not pass `creditOf` behave exactly as before (regression byte-identical) — the M3 adapter and the lens pass it.
**Data:** inputs present in `ad_seed_fullwidth.db` (`c_bpartner.socreditstatus/so_creditlimit/totalopenbalance`, `c_doctype.docsubtypeso`); sysconfig in `ad_full.db` (both 'Y', like the pilot). The BP open balance is each side's own STATE; S13's facts hold either way.
**Acceptance:** S13a + S13b MATCH (outcome REJECTED both sides); S1-S11 unchanged; a new control S13c = same order for BP 112 (limit 0 ⇒ no check) COMPLETES on both sides.
### §36.1 DECISION RECORD F5 — SQLite refuses an over-credit order like legacy (2026-10-09)
**Evidence:** `§SCN S13a/S13b … SQLITE-GAP` (legacy REJECTED `over Credit Hold`, SQLite COMPLETED). **Changed (one commit, backtrack = `git revert <sha>`):**
| File | Change |
|---|---|
| `scripts/erp_engine.js` | NEW pure verb `creditCheckOrder(order, bp, sys)` — branches of CreditManagerOrder.java:52-95 + MBPartner.getSOCreditStatus(add) :826-850, sysconfig default true. Additive. |
| `build/erp/pos_core.js` | `creditGate` in `buildSaleGroup`, `buildDeliverLaterGroup`, `buildRecallCompleteGroup` — runs only when the host passes `ctx.creditOf`; refusal `{ok:false, reason:'credit-…'}` before any op. Doc subtype: `ctx.docsubtypeso` (default 'WR' on the cash-and-carry verbs, which ARE the WR path) or the deliver-later doctype row. |
| `build/erp/pos_lens.js` | host supplies `creditOf` (bill-BP credit row from its db; `ad_sysconfig` when present, else legacy default). Existing refusal path shows `refused: credit-over-hold`. |
| `scripts/bridge/witness_m3_gap.js` | adapter passes `creditOf` (seed `c_bpartner` + `ad_full.db` sysconfig); control S13c. |
**Proof:** `§SCN S13a-pos-sale-over-credit-limit MATCH` · `§SCN S13b-standard-order-over-credit-limit MATCH` (both REJECTED both sides) · `§SCN S13c-pos-sale-large-no-credit-limit MATCH` (BP 112, limit 0 ⇒ completes both sides) · S1-S12 unchanged.
**Regression:** the 99 non-browser engine witnesses: exit codes identical, logs identical except the 4 known-nondeterministic ones (group ids).
**Honest residue:** the refusal TEXT differs (legacy `Business Partner with this Order over Credit Hold - Open …`, SQLite reason code) — message L&F belongs to item 7 (AD_Message parity); GrandTotal used = sum of line nets
(no tax on these documents — revisit with the tax item); currency conversion to base (`MConversionRate.convertBase`) is not done (same currency on the pilot); the lens does not pass the order's PaymentRule, so the cash-POS
exemption can only trigger with sysconfig N + PaymentRule B (both 'Y'/unset here); the browser lens path is not executed by any witness (no browsers in this lane) — its wiring is a 6-line host change reviewed by reading.

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
