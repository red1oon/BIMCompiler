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
| P1 | **Legacy sees a normal client (§19, D6 §51): the only legacy-side setup is WebService configuration (WS types, whitelists, role access) — the legal door; no plugin, table, column, protocol or marker.** (Mode B plugin = PARKED, §19.) Bridge uses only the 9 stock WS ops (§2) + AD config the admin chooses. No SQL, no schema/column, no custom table on legacy. | user D1, CLAUDE.md DB rule | transport has an allow-list of ops (anything else throws); Bridge code has no postgres client (grep gate) | W-P1 |
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
| S5 | complete while an extra active accounting schema has no product-category acct ('CP Copy Target') | NPE `MProductCategoryAcct … pca is null`, CO fails | ✅ **MATCH after F10** (§43.1): SQLite refuses with a named error; one-shot witness |
| S6 | Standard Order (132) complete | CO, no shipment, no invoice, no stock move | ✅ **MATCH after fix F1** (2026-10-09, §27): was SQLITE-GAP (SQLite also birthed a DR shipment at order time); `buildDeliverLaterGroup` is now the order half only. |
| S10 | POS sale **invoice postings** (Fact_Acct, primary schema) | Dr 518 6175 / Cr 758 6175 (receivable / revenue), no tax | ✅ **MATCH** (M3 `postings`, 2026-10-09): SQLite's own invoice folded by `doc_poster.derivePostings` equals the legacy books to the cent on a FRESH document |
| S11a | POS sale **shipment postings** on Oak Tree (COGS/Inventory) | legacy posting **errors** (`Posted=E`, `AverageCostingNegativeQtyException`: Oak Tree costed qty 0 although on-hand > 0; ~57 shipments on the pilot) — no legacy books | ⏸ **INCONCLUSIVE** (no oracle). SQLite side: `derivePostings` has no M_InOut class (basis `none`, source comment: "COGS leg is the §8 follow-up") ⇒ probable **MISSING** the day legacy produces books. Needs a pilot costing setup (a receipt giving Oak Tree a costed qty) before it can be judged. |
| S7 | order with stock below zero after completion | measured on purpose (§31): CO + shipment + invoice, stock −qty; shipment posting refused when the Average costed qty would go < 0 | ✅ S7b **MATCH**; S7a **MATCH after F6** (§38.1) |
| S13 | order whose GrandTotal exceeds the customer's credit limit (§32) | REJECTED `over Credit Hold` (CreditManagerOrder.java:48-98) | ✅ **MATCH after F5** (§36.1); S13c control (no limit) completes both sides |
| S12 | void a completed POS sale (§33) | VO, shipment+invoice reversed (RE/RE), books net 0 with legacy's row form | ✅ **MATCH after F4** (§33.1); S12b taxed void MATCH after F14 (§48.1), 16 keys |
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

## §34 OPEN QUESTIONS for the user (P16)
- ~~Q-S7~~ / ~~Q-S13~~ — answered by the CARDINAL RULE (copy legacy); closed by F6 (§38.1) and F5 (§36.1).
- **Q-OOTB (concept source: CLAUDE.md AD-LAYER LAW + CARDINAL RULE; this lane's brief forbids touching ~/bim-ootb):** the shipped ERP lives in `~/bim-ootb/erp/` with its own copies of the kernel files (§50 DELIVERY) — none of F4-F14 reaches a user until ported there. Also the SQLite Sales Order WINDOW runs `~/bim-ootb/erp/model_order.js`, where these legacy rules are missing:
  S2b price-list check on save (MOrderLine.java:842-849), server-side default pricing (MOrderLine.java:824-827), the void reversals of shipments/invoices (MOrder.java:2766-2840; F4 ported it into `scripts/erp_engine.js voidOrder`, not into that layer),
  the invented `MOrderLine/MInvoiceLine.qtyPositive` validators (legacy accepts 0 and negative quantities, S14 §47), and loading the L&F dictionary patches (`scripts/bridge/out/lf_patch_*.sql`, 350→370 of 370 windows, §49)
  plus the posting-db patch `build/erp/patches/glassbowl_data.db.sql` (§46.1) through a self-heal loader in the ERP host.
  **May this lane edit `~/bim-ootb/erp/model_order.js` (in a /tmp/wt-* worktree, PR not pushed), or will another session own it?** Everything is measured and specified (§33, §39); only the permission is missing.

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

## §37 dict_diff HARDENING — composite keys + SCHEMA (ALTER) patch generator + loader-guarded apply (2026-10-09, backlog item 6; prerequisite of F6/S7a) — SPEC before code
**Why now:** S7a (copy legacy's costed-qty refusal) needs `m_cost.currentqty` in the SQLite posting db; §29 listed it as a SCHEMA gap the DATA patch cannot fix.
**Spec (data, `dict_spec.json`):** `key` may be an ARRAY (composite) — rows are matched on the joined key; `addColumns: [...]` = legacy columns the SQLite table lacks that the patch must ADD (explicit, reviewable list; every other missing column
is still reported by `§DD_COLUMNS`); `where` narrows the legacy read (e.g. `AD_Org_ID=0 AND M_AttributeSetInstance_ID=0` for m_cost: the SQLite table has no org/ASI columns, so only client-level cost rows map 1:1).
**Generator (`dict_diff.toSchemaPatch`):** for each `addColumns` entry absent locally: `ALTER TABLE t ADD COLUMN c;` (untyped, like the seed tables) followed by `UPDATE t SET c=<legacy value> WHERE <all key cols>` for every legacy row present locally,
and `INSERT OR IGNORE` (common + added columns) for legacy rows missing locally. Values ONLY from legacy. Never DELETE, never DROP.
**Loader-guarded apply (`dict_diff.applyPatch(db, sqlText)`):** executes statement by statement; an `ALTER TABLE … ADD COLUMN` is skipped when `PRAGMA table_info` already lists the column (so the patch is idempotent and safe on a db that already
has it); everything else runs inside one transaction (all-or-nothing). This is the SQLite self-heal pattern (patch text + guarded loader), applied in this lane to SCRATCH copies only.
**Witness additions (`witness_dict_diff.js`):** `§DD_SCHEMA_PATCH` (after apply on a scratch copy the added columns exist and a re-diff reports 0 missing for them and 0 differing cells on the composite-key tables), `§DD_SCHEMA_IDEMPOTENT`
(second apply = no change, no error), `§DD_COMPOSITE_DETECT` (negative control: a corrupted `m_cost.currentqty` cell on the scratch copy is found by the composite-key compare and repaired by the patch).
**Tables in scope now:** `m_cost` [M_Product_ID, C_AcctSchema_ID, M_CostType_ID, M_CostElement_ID] +currentqty · `m_product_category_acct` [M_Product_Category_ID, C_AcctSchema_ID] +costingmethod,costinglevel ·
`m_costelement` [M_CostElement_ID] +name · `m_product` [M_Product_ID] +isstocked (glassbowl posting db, §29 list).
**RESULT §37 (built + witnessed 2026-10-09):** `§DD_SCHEMA_PATCH PASS` (scratch glassbowl: m_product_category_acct +2 cols/28 stmts, m_costelement +1/9, m_cost +1/382, m_product +1/55; re-diff 0 missing / 0 changed / 0 legacy-only) · `§DD_SCHEMA_IDEMPOTENT PASS`
(second apply: 0 ALTERs run, all skipped by the PRAGMA guard, rows unchanged) · `§DD_COMPOSITE_DETECT PASS` (corrupted `m_cost[125|101|100|100].currentqty` found on the 4-part key and repaired) · DETECT/PATCH_FIX/IDEMPOTENT/NO_DELETE still PASS.
Reviewable patches: `scripts/bridge/out/dict_schema_<table>.sql` + `dict_patch_<table>.sql`. Pilot fixture: 21 more read-only WS types (product, acct schema, periods, sysconfig, conversion rates, order/invoice tax, BP, tax category, and the AD metadata tables
Window/Tab/Field/Column(all)/Menu/Message/Ref_List/Val_Rule/Process/Process_Para for L&F parity) — all answered a smoke read, incl. System-client AD rows.
**Real finding (P17, DATA/state):** `m_cost` 20 cells differ — legacy cost STATE moved since the SQLite snapshot (e.g. Oak Tree Average PO 38.78 legacy vs 51.45 SQLite; Fertilizer cumulated qty 46 vs 40). That is a handover-state gap, not a rule: the parallel run
must start both sides from the same state (C5). The M3 runner now loads these generated patches into its scratch posting db before comparing (F6 below), which is the patch+loader delivery path in miniature. Shared seeds untouched.
**Not done here (stated):** the self-heal LOADER in the browser host that would apply `dict_schema_*.sql` to a user's IndexedDB copy of `glassbowl_data.db` (the Viewer/Modeller `_applyPendingPatch` pattern) — the ERP host has no such loader yet; queued with the L&F item.

## §38 F6 — S7a: SQLite refuses the shipment posting when an Average costed qty would go below 0, exactly like legacy (2026-10-09) — SPEC before code
**Legacy rule (read):** posting a sales shipment line of a STOCKED product runs cost detail processing for every client costing-method element (`MCostElement.getCostingMethods`: active, CostElementType=M, CostingMethod set — MCostElement.java:148-159; stocked check
MCostDetail.java:1356-1364) in every accounting schema; each element's `CurrentQty += qty` (qty negative for a shipment); for Average PO / Average Invoice `MCost.setCurrentQty` throws `AverageCostingNegativeQtyException` when the result is < 0
(MCost.java:1919-1930) — except for a REVERSAL shipment (`setSkipAverageCostingQtyCheck`, MCostDetail.java:1482-1485) and drop-ship. A missing cost row is created at 0 (so 0 − qty < 0 ⇒ refuse). Any failure ⇒ the whole document stays `Posted=E`, no books.
Pilot evidence that every costing element moves together: 136's elements 100(S)/102(F)/103(A) all at CurrentQty 28.0 after the S11 runs.
**SQLite change:** `doc_poster.deriveInOut` — when `m_cost.currentqty` exists (schema patch §37): for each non-reversal line of a stocked product (`m_product.isstocked`, column-guarded), for every schema in `c_acctschema` and every active costing element
with method A or I: `currentqty(product, schema, schema.costtype, element) − movementqty < 0` ⇒ the whole document is refused (`absent` = `AverageCostingNegativeQty …`, nothing posted). NEW pure helper `doc_poster.costQtyUpdates(db, inoutId)` = the
`CurrentQty += signed qty` deltas for every active costing element × schema (shipment −, reversal +) that a committing host applies after a successful post (legacy does it in the same transaction). Column absent ⇒ behaviour unchanged.
**Harness:** M3 loads the §37 patches (schema + data) into its scratch posting db at start (same state as legacy = C5 handover), applies `costQtyUpdates` after every SQLite shipment that posted, and the legacy adapter reports `Posted=E` as `REFUSED:Posted=E`
for EVERY scenario (the old Oak-Tree INCONCLUSIVE excuse goes: legacy refuses ⇒ SQLite must refuse). SQLite reports any refused fold as `REFUSED:Posted=E` (legacy has one state for every posting error), reason logged in `§SCN_DETAIL`.
**Acceptance:** S7a MATCH; S1 (Oak Tree, costed qty 0) judged and MATCH; S11/S12 unchanged MATCH; regression byte-identical (the shared glassbowl has no `currentqty` ⇒ unchanged path).
### §38.1 DECISION RECORD F6 — costed-qty refusal copied from legacy; S7a and S1 MATCH (2026-10-09)
**Evidence:** `§GAP scenario=S7a … postings_shipment legacy="REFUSED:Posted=E" sqlite="430:DR14250…"` (pilot AD_Issue 1000287). **Changed (one commit, backtrack = `git revert <sha>`):**
| File | Change |
|---|---|
| `scripts/doc_poster.js` | `deriveInOut` refuses the whole shipment (`absent: AverageCostingNegativeQty …`) when any Average (A/I) costing element × schema would go below 0 (`costQtyRefusal`); NEW `costQtyUpdates(db, inoutId)` = the CurrentQty deltas for every active costing element × schema. Both column-guarded (`m_cost.currentqty`). |
| `scripts/bridge/dict_spec.json` | `m_costelement` also brings `isactive` (104 Average Invoice is inactive on legacy; without it SQLite would check a dead element) |
| `scripts/bridge/witness_m3_gap.js` | `§M3_STATE_SYNC` (load §37 patches into the scratch posting db at start), `applyCostQty` after every SQLite shipment that posted, `Posted=E` ⇒ `REFUSED:Posted=E` on BOTH sides for every scenario (the S1 INCONCLUSIVE excuse removed) |
**Proof:** `§M3_STATE_SYNC m_cost:+1col,382stmt,left=0 …` · `§SCN S7a-pos-sale-beyond-onhand MATCH compared=10` · `§SCN S1-pos-sale MATCH compared=10 inconclusive=0` (was PARTIAL) · S11 (posts) and S12 (void, reversal skips the check) still MATCH ·
`§RECON_SUMMARY scenarios=11 MATCH=10 SQLITE-GAP=1 (S3) inconclusive_keys=0` · `§M3_VERDICT HARNESS-PASS fails=0 inconclusive=0`.
**Regression:** 99 engine witnesses — exit codes identical, logs identical except the 4 known-nondeterministic ones (the shared glassbowl has no `currentqty`, so their path is unchanged).
**Honest residue:** the drop-ship exemption (MCostDetail.java:1487-1494) is not ported (no drop-ship in SQLite POS); costing level Organization/BatchLot rows are not modelled (SQLite m_cost has no org/ASI — client level only, like the pilot);
the cost-qty WRITE happens in the harness (`applyCostQty`) because no SQLite host commits postings yet — a committing host must apply `costQtyUpdates` in the same group as the posting (same as legacy) — queued with the loader item;
the cost PRICE update of average costing on receipts/invoices (weighted average) is not ported (no purchase scenario yet). S11 keeps consuming 136's costed qty by 1 per run on both sides; at 0 both sides refuse (still MATCH, but the COGS amount stops being exercised) — pick another costed product then.

## §39 S3 / S2b on the AD-WINDOW path (2026-10-09, backlog item 4) — SPEC + measurement
**Which SQLite engine is the twin of a keyed-price order?** A WS order (S3) is what a normal user keys in the Sales Order WINDOW, not the POS lens (P15 "no free numbers" is the POS-lens surface: the lens has no price field). The SQLite Sales Order window
runs the AD model layer `~/bim-ootb/erp/model_order.js` (`MOrderLine.beforeSave`, loaded as `global.ModelLayer` by `build/erp/crud_overlay.js:1642-1646`) — a SECOND SQLite implementation, separate from this repo's POS kernel verbs. This lane may READ it
(node `require`, no edits) but not change it (brief: do not touch ~/bim-ootb).
**Measured (read-only, scratch copy of `ad_seed_demo.db`, draft order 990001):** a line with keyed PriceEntered=PriceActual=10, qty 1 ⇒ `ok, linenetamt=10`, PriceList untouched, no discount — equal to the legacy line (oracle: PriceEntered 10, PriceActual 10,
PriceList 0, PriceLimit 0, Discount null, LineNetAmt 10). ⇒ **S3 on the AD path: MATCH at line level.** S3 in the M3 corpus is re-pointed: SQLite side = AD-model-layer `beforeSave` for the line + the kernel completion/posting fold for the documents
(`localRunAD`); the old POS-lens adapter for S3 compared the wrong surface.
**Gaps found on the AD path (they live in `~/bim-ootb`, so this lane cannot fix them → ⛔ with one question, §34):**
- **S2b — product NOT on the price list with a keyed price:** legacy refuses (`ProductNotOnPriceListException`, MOrderLine.java:842-849 runs even when the price is keyed); the AD model layer has no price-list check in `beforeSave` (its own comment: "Pricing … stays with the callout
  layer"), so a non-UI save (import, process, sync) accepts it. Scenario S2b added (legacy measured; SQLite AD side measured via the same read-only require).
- **Default pricing:** legacy prices an unpriced line server-side (`setPrice` when PriceActual = PriceList = 0, MOrderLine.java:824-827); the AD model layer leaves it to the UI callout ⇒ a line saved without the callout keeps price 0.
- **S12 on the AD path:** `model_order.js` `voidIt` refuses an order that has shipments/invoices ("createReversals … not ported"); legacy reverses them (§33). F4 fixed the kernel verb (`erp_engine.voidOrder`), not this layer.
- **`MOrderLine.qtyPositive`** (this repo's `build/erp/ad_modelval.js:50-57`) refuses qty ≤ 0; legacy `MOrderLine.beforeSave` (790-917) has no such rule ⇒ measure S14 (negative-qty line) before deciding.
**RESULT §39 (M3, 2026-10-09):** `§SCN S3-client-keyed-price MATCH compared=10` (AD path: line 123:1:1000, total 1000, 1 shipment CO, 1 invoice, invoice books 518 Dr 1000 / 758 Cr 1000, shipment REFUSED both sides on Oak Tree's costed qty 0) — the S3 quirk entries are deleted, LEGACY-QUIRK count 0.
`§SCN S2b-keyed-price-product-not-on-pricelist SQLITE-GAP` (legacy `Cannot save record in C_OrderLine: Product is not on Price List`; SQLite AD layer COMPLETED) — stays in `§TRIAGE RULE_queue` as the failing regression; fix location `~/bim-ootb/erp/model_order.js` ⇒ ⛔ Q-OOTB (§34).

## §40 S8 — PAST/FUTURE-DATED document, period control (G11) (2026-10-09, backlog item 5a) — SPEC before code
**Legacy rule (read):** `MOrder.prepareIt` (MOrder.java:1544-1548) refuses with `@PeriodClosed@` unless `MPeriod.isOpen(DateAcct, DocBaseType, Org)` (MPeriod.java:291-314): a period must exist for the date in the org's calendar, it must be active, and
under **Automatic Period Control** of the client's primary schema (MPeriod.java:735-770, pilot schema 101: `AutoPeriodControl=Y`, `Period_OpenHistory=10000`, `Period_OpenFuture=100` days) the date must lie in [today − history, today + future];
without auto control the period's `C_PeriodControl` status for the DocBaseType decides (MPeriod.java:772-785). "today" = the server's clock.
**Facts (POS order 135 = DocBaseType SOO, BP 112, Oak Tree × 1, DateOrdered = DateAcct = the date):** S8a 2026-09-15 (past, inside window) · S8b 2000-06-01 (inside the history window but NO period: periods start 2001-01-01) ·
S8c today + 200 days (beyond Period_OpenFuture) · S8d 1999-01-15 (before the history window). Expected legacy: S8a CO; S8b/S8c/S8d REJECTED `Period Closed`.
**SQLite before:** the POS verbs carry no date at all and never test a period ⇒ S8b-d expected SQLITE-GAP. Fix F7 (if measured so): pure `erp_engine.periodOpen(data, dateAcct, docBaseType, today)` (port of the two methods above; data = primary schema row + the calendar's
periods with their control rows, host-read) + a gate in the POS completion verbs when the host supplies `ctx.periodData` and the order carries `opts.dateAcct`; the order op then also carries `dateordered`/`dateacct` (business dates are a §21 compared item).
Today for both sides = the legacy server date (read from a legacy read; the SQLite host's own clock in production).
**MEASURED S8 (legacy first, 2026-10-09; route fixed first — see below):** S8a 2026-09-15 ⇒ CO, books like a today-dated sale EXCEPT the shipment: legacy POSTED `430 Dr 4869 / 742 Cr 4869` for Oak Tree although today its costed qty is 0
(back-date costing: a cost detail dated before the product's last processed one is `IsBackDate`, MCostDetail.java:1241-1267, and is costed/re-processed through cost history, DocManager.java:620-700, MCost.java:113-146);
S8b 2000-06-01 and S8d 1999-01-15 ⇒ REJECTED **`Product is not on Price List`** (no price-list VERSION valid at that date — the version is chosen by DateOrdered, before any period test); S8c today+200 ⇒ REJECTED **`Period Closed`**.
SQLite: COMPLETED for all four ⇒ three rules are missing: F8 price-list version by date (S8b/S8d), F7 period control (S8c), F9 back-date costing (S8a shipment books).
**Harness defect found and fixed (P17):** the stock `createOrderRecord` type refuses `DateOrdered` as input ("input column DateOrdered not allowed"); the first S8 run therefore scored a WS-configuration refusal as a legacy REJECTED. Now (a) a WS-config refusal throws ⇒ `§SCN_ERROR`, never a verdict;
(b) bridge fixture type `BridgeCreateOrder` (= the stock type's 3 parameters + its 10 input columns + DateOrdered + DateAcct; `scripts/bridge/pilot/ws_docaction.sql`) is used for dated scenarios.

## §41 F8 — price-list VERSION chosen by the order date, like legacy (2026-10-09) — SPEC before code
**Rule:** `MProductPricing.calculatePL` (MProductPricing.java:236-300): rows = active versions of the order's price list that hold an active price for the product, ordered `ValidFrom DESC`; the first with `ValidFrom ≤ PriceDate` (the order's DateOrdered;
today when absent, :262-263) gives PriceStd/PriceList/PriceLimit; none ⇒ not calculated ⇒ `ProductNotOnPriceListException` (MOrderLine.java:846-849).
**SQLite change:** pure `erp_engine.priceAt(rows, date)` (that loop); `pos_core.ringLine` passes `ctx.priceDate` as a second argument to the host's `ctx.priceOf(productId, date)` (hosts that ignore it behave as before); the M3 adapter's `priceOf` reads every
version row and calls `priceAt`. The lens host keeps its single-version lookup until it is given a date (it has no date field today — L&F item) — stated, not hidden.
**Acceptance:** S8b and S8d outcome MATCH (REJECTED both sides); all today-dated scenarios unchanged.
### §41.1 DECISION RECORD F8 — price-list version by date (2026-10-09)
**Evidence:** S8b/S8d legacy `Product is not on Price List`, SQLite COMPLETED. **Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW pure `priceAt(rows, date)` (MProductPricing.java:236-300);
`build/erp/pos_core.js` `ringLine` passes `ctx.priceDate` to `ctx.priceOf(productId, date)` (2nd arg ignored by existing hosts); `scripts/bridge/witness_m3_gap.js` adapter prices with `priceAt` over every active version (date = scenario date or today).
**Proof:** `§SCN S8b-pos-sale-date-without-period MATCH` · `§SCN S8d-pos-sale-before-open-history MATCH` (REJECTED both sides); every today-dated scenario unchanged. Regression: 99 engine witnesses — exits identical, logs identical except the 4 known-nondeterministic ones.
**Residue:** the POS lens host still prices from one version (it has no order-date field) — a lens sale is always "today", where `priceAt` and the single version agree on this seed; the BPL (base price list) and vendor-break branches of MProductPricing are not ported (no scenario).
**Harness hardening in the same commit (P17):** new compared key **`cost_qty_delta`** (Average-PO costed qty change of each product, primary schema, read before/after on both sides). Reason: the start-of-run cost-state sync (§38) had made S8a look like a MATCH
although legacy's back-dated shipment re-processed Oak Tree's cost history (costed qty 0 → 24 between runs; AD_Issue "Oak Tree, Current Qty=24.0, New Current Qty=-176.0"). With the key, S8a shows `legacy {"123":2} sqlite {"123":-1}` ⇒ **F9 back-date costing = open SQLITE-GAP (MISSING)**.

## §42 F7 — period control on the sale, like legacy (S8c) (2026-10-09) — SPEC before code
**Rule (ported verbatim):** `MPeriod.get(DateAcct, Org)` = the STANDARD period (`PeriodType='S'`) of the org's calendar whose `[TRUNC(StartDate), TRUNC(EndDate)]` contains the date (MPeriod.java:115-195, calendar via `getC_Calendar_ID(org)` → client calendar);
none or inactive ⇒ closed; Automatic Period Control on the client's primary schema ⇒ open iff today − `Period_OpenHistory` ≤ date ≤ today + `Period_OpenFuture` (MPeriod.java:735-770); otherwise `C_PeriodControl` of the DocBaseType with `PeriodStatus='O'`
(MPeriodControl.isOpen, :157-164; `forPosting` not used by prepareIt). Order: the period test runs BEFORE the credit test (MOrder.java:1544 vs :1689).
**SQLite change:** pure `erp_engine.periodOpen(data, dateAcct, docBaseType, today)` (data = primary schema row + the calendar's periods with `{docbasetype: status}`), and a `periodGate` in the three POS completion verbs that runs when the host supplies `ctx.periodCheck(dateAcct, docBaseType)`
and the order carries `opts.dateAcct`; refusal `{ok:false, reason:'period-closed'}`; the order op carries `dateordered`/`dateacct` when given. The M3 adapter builds `periodCheck` from `ad_seed_fullwidth.db` (c_acctschema, ad_clientinfo, c_year, c_period, c_periodcontrol).
**Acceptance:** S8c MATCH (REJECTED both); S8a still completes on both sides (its open key is F9 cost state only).
### §42.1 DECISION RECORD F7 — period control on the sale (2026-10-09)
**Evidence:** S8c legacy `Failed when processing document: Period Closed`, SQLite COMPLETED. **Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW pure `periodOpen` (MPeriod.java:180-195, 291-314, 726-785; MPeriodControl.java:157-164);
`build/erp/pos_core.js` `periodGate` before `creditGate` in buildSaleGroup / buildDeliverLaterGroup / buildRecallCompleteGroup (host `ctx.periodCheck` + `opts.dateAcct`), order header carries `dateordered`/`dateacct` when given;
M3 adapter builds `periodCheck` from the seed (ad_clientinfo → primary schema + calendar → c_year/c_period/c_periodcontrol).
**Proof:** `§SCN S8c-pos-sale-beyond-open-future MATCH` (REJECTED both) · `§M3_PERIOD_RULE PASS noPeriod=false beforeHistory=false today=true today+200=false standardControl(open?/status)=false/N` (the branches S8b/S8d cannot reach because both sides stop at the price rule first) ·
all other scenarios unchanged. Regression: exits identical, logs identical except the 4 known-nondeterministic ones.
**Residue:** org-specific calendars (AD_OrgInfo.C_Calendar_ID) are not read (client calendar only; GardenWorld has one); the lens host passes no date (always today ⇒ open); the SQLite seed's periods end 2030-12-31 vs legacy 2042 (DATA difference, irrelevant inside the 100-day window, reported for dict_diff).

## §43 S5 — stray active accounting schema without product-category accounting: SAME OUTCOME (2026-10-09, cardinal rule 2) — SPEC before code
**Legacy path (read):** `MOrder.prepareIt` "Mandatory Product Attribute Set Instance" loop (MOrder.java:1633-1637) → `MProduct.isASIMandatoryFor` iterates EVERY active client schema (MProduct.java:1028-1037) → `getCostingLevel(as)` →
`MProductCategoryAcct.get(category, schema)` = null for 'CP Copy Target' (1009800) → `pca.getCostingLevel()` NPE (MProduct.java:1066-1067) ⇒ any SO with a product line (no ASI) cannot be prepared/completed while that schema is active.
**Measurement route:** the schema toggle is admin configuration, not a document, and the server caches accounting schemas ⇒ a one-shot witness `scripts/bridge/witness_s5_stray_schema.js` (NOT in the routine run): pilot fixture `pilot/s5_schema_on.sql` → restart →
legacy POS sale → SQLite sale on a state-synced scratch posting db → pilot fixture `pilot/s5_schema_off.sql` (the same statement `ws_test_access.sql` already carries) → restart → control sale must complete again (pilot never left broken; restore runs in `finally`).
**SQLite rule (F10):** pure `erp_engine.acctSetupGap(categoryId, activeSchemaIds, categoryAcctRows)` → the schemas with no category-accounting row; a gate in the POS completion verbs (after the period gate, before the credit gate — MOrder.java order :1544 → :1633 → :1689) when the host supplies
`ctx.acctSetupOf(productId)`; refusal `{ok:false, reason:'no-product-category-acct', schemas:[…]}` — a NAMED error where legacy throws an NPE (cardinal rule 2: same outcome, clearer message allowed).
**Data:** `c_acctschema` joins dict_spec (glassbowl, +`isactive`), so the scratch posting db carries the legacy schema rows and their active flag; `doc_poster` cost-qty helpers then consider ACTIVE schemas only (an inactive schema is not posted by legacy either).
**Acceptance:** `§S5_LEGACY` REJECTED (NPE text recorded) and `§S5_SQLITE` REJECTED (named) ⇒ `§S5_VERDICT MATCH`; `§S5_RESTORED` the control sale completes after the restore; routine M3 unchanged.
**dict_diff bug found by §DD_SCHEMA_IDEMPOTENT (P17, 2026-10-09):** many SQLite seed tables (glassbowl `c_acctschema`, …) have no PRIMARY KEY, so the generated `INSERT OR IGNORE` never ignored — a legacy-only row was inserted twice (once by the schema patch, once by the data patch)
and every re-apply added another copy. Fixed: inserts are generated as `INSERT … SELECT … WHERE NOT EXISTS (<key match>)`; DETECT/PATCH_FIX/IDEMPOTENT/SCHEMA_PATCH/SCHEMA_IDEMPOTENT/COMPOSITE_DETECT all PASS again.
### §43.1 DECISION RECORD F10 — stray active schema: SQLite refuses like legacy (named, not an NPE) (2026-10-09)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW pure `acctSetupGap` (MOrder.java:1633-1637 → MProduct.java:1028-1037, 1066-1067); `build/erp/pos_core.js` `acctGate` between period and credit gates (host `ctx.acctSetupOf`);
`scripts/doc_poster.js` cost-qty helpers use ACTIVE schemas only; `scripts/bridge/dict_spec.json` + `c_acctschema` (isactive, name, costinglevel, isallownegativeposting, autoperiodcontrol, period_openhistory/future, backdateday);
`scripts/bridge/witness_m3_gap.js` `acctSetupOf` + `M3_ONLY` filter; NEW one-shot `scripts/bridge/witness_s5_stray_schema.js` + fixtures `pilot/s5_schema_on.sql` / `pilot/s5_schema_off.sql`.
**Proof:** `§S5_LEGACY PASS` (legacy `java.lang.NullPointerException: Cannot invoke "org.compiere.model.MProductCategoryAcct.get…`) · `§S5_SQLITE PASS` (`no-product-category-acct`) · `§S5_VERDICT PASS` (`§SCN S5-pos-sale-stray-acct-schema MATCH compared=11`) ·
`§S5_RESTORED PASS` (schema back to N, control sale MATCH) · `§S5_WITNESS_VERDICT PASS`. Routine run_all unchanged (the synced schema row is inactive). Regression: 99 engine witnesses, exits identical, logs identical except the 4 known-nondeterministic ones.
**Residue:** the gate checks the product's category accounting row only; legacy fails the same way for any other `getCostingLevel/Method` caller (movements, inventory) — those documents have no SQLite twin scenario yet. `ws_test_access.sql` keeps the schema inactive for every routine witness.

## §44 TAX — determination, order tax, invoice tax, Tax.Due books (2026-10-09, backlog item 5c) — SPEC before code
**Found without inventing data:** every legacy SO line carries a tax and every order an Order-Tax row; with org 11 (Portland, region 142) the lookup falls to `104 Standard 0%`, but **org 12 Store Central is in Connecticut (region 102)** like BP 112 (Monroe CT) ⇒ legacy's own rule
gives `105 CT Sales 6%` for a POS sale from org 12 / warehouse 104 — a normal user's sale, no data change.
**Legacy rules (read):** line tax when `C_Tax_ID=0` (MOrderLine.java:866-867) via `Tax.getProduct` (Tax.java:475-600: product tax category; bill-from = `AD_OrgInfo.C_Location_ID` of the line's org, bill-to = the BP bill location; BP `IsTaxExempt` ⇒ exempt tax)
→ `Tax.get` (Tax.java:723-840): taxes of the client ordered `C_CountryGroupFrom_ID, C_Country_ID, C_Region_ID, C_CountryGroupTo_ID, To_Country_ID, To_Region_ID, ValidFrom DESC` (MTax.java:78-80; NULLs last), first ACTIVE non-child tax of the category, right SO/PO type, whose
from/to country/region match (0 = any) and `ValidFrom ≤ billDate` (postal ranges when `IsPostal`); else the category's DEFAULT tax. Amount: `MTax.calculateTax` (MTax.java:340-367) per tax (summary ⇒ children), `base × rate/100` rounded HALF_UP to the currency precision
(tax-included variant). Order tax = per tax id: base = Σ LineNetAmt, amount = Σ per-line tax (non-document-level), GrandTotal = TotalLines + Σ tax (StandardTaxProvider). Invoice: same on the invoice lines; books Dr Receivable GrandTotal / Cr Revenue per line / Cr `{Tax.Due}` per tax (Doc_Invoice).
**Facts:** T1 = POS order 135, org 12, warehouse 104, BP 112 (loc 108), Oak Tree × 1. Expected legacy: line tax 105, OrderTax `105:6175:371` (6.175% → 3.705 → 3.71), GrandTotal 6546, invoice tax equal, books 518 Dr 6546 / 758 Cr 6175 / Tax-Due Cr 371.
**New compared keys (all scenarios):** `line_tax` (C_Tax_ID per line), `order_tax` (`taxid:base¢:amt¢` per C_OrderTax row), `grand_total_cents`, `invoice_tax` (per C_InvoiceTax row).
**SQLite before:** the kernel POS verbs set no tax, write no order/invoice tax, GrandTotal = TotalLines ⇒ expected SQLITE-GAP on the new keys for EVERY scenario (an honest wall: the Order-Tax tab of every SQLite order differs from legacy today). Fix F11 follows the measurement.
**MEASURED T1 (legacy first):** first attempt gave tax 104 Standard — explained by the rule, not a defect: the orders default to `DeliveryViaRule='P'` (Pickup) and for Pickup the tax bill-to is the WAREHOUSE location (Tax.java:550-553); warehouse 104 is in MA.
With `DeliveryViaRule='D'` (a header field the user sets; `BridgeCreateOrder` now accepts it — fixture, idempotent): line tax **105**, OrderTax **`105:6175:371`**, GrandTotal **6546**, InvoiceTax `105:6175:371`, books **518 Dr 6546 / 596 Cr 371 / 758 Cr 6175** — exactly as predicted.
Every other scenario (org 11, Pickup): line tax 104, OrderTax `104:<base>:0`, GrandTotal = TotalLines.

## §45 F11 — SQLite tax: determination + order tax + invoice tax + GrandTotal (2026-10-09) — SPEC before code
**Port:** `erp_engine.taxLookup` = Tax.getProduct + Tax.get (Tax.java:475-600, 723-840: exempt BP ⇒ `getExemptTax` :679-697 = highest-rate active `IsTaxExempt` tax; SO + Pickup ⇒ bill-to = warehouse location; ordered loop + default fallback);
`erp_engine.calcTax` = MTax.calculateTax (MTax.java:340-367; integer-exact, HALF_UP at the currency precision; summary ⇒ children; tax-included variant); `erp_engine.orderTaxes` = StandardTaxProvider.calculateOrderTaxTotal (StandardTaxProvider.java:38-110) + MOrderTax.calculateTaxFromLines
(MOrderTax.java:312-372): per tax id base = Σ LineNetAmt (a child line also counts for its parent), amount = Σ per-line tax unless document-level; summary rows are replaced by one row per child; GrandTotal = TotalLines + Σ tax (not when tax-included).
**Wiring:** POS verbs, when the host supplies `ctx.taxOf(productId)` (+ `ctx.taxById`, `ctx.taxIncluded`): each line carries `c_tax_id`, the group gets `C_OrderTax` rows + order GrandTotal and, when the invoice is in the group, `C_InvoiceTax` rows + invoice GrandTotal (same lines, same amounts).
Without `taxOf` nothing changes (regression byte-identical). M3 adapter: `taxOf` from the seed (c_tax, m_product.c_taxcategory_id, ad_orginfo/m_warehouse/c_bpartner_location → c_location), with the order's org, warehouse, BP location, date and DeliveryViaRule; books folded with `c_invoicetax` rows (deriveInvoice already credits `{Tax.Due}`).
**Acceptance:** T1 MATCH on all 15 keys incl. books; every other scenario's tax keys MATCH (104 / 0).
### §45.1 DECISION RECORD F11 — SQLite taxes a sale exactly like legacy (2026-10-09)
**Evidence:** T1 legacy `line_tax 123:105 · order_tax 105:6175:371 · grand_total 6546 · invoice_tax 105:6175:371 · books 518 Dr 6546 / 596 Cr 371 / 758 Cr 6175`; SQLite had no tax at all (and no Order-Tax row on ANY order).
**Changed (one commit, backtrack = `git revert <sha>`):**
| File | Change |
|---|---|
| `scripts/erp_engine.js` | NEW pure `taxLookup` (Tax.java:475-600, 679-697, 723-840), `calcTax` (MTax.java:340-367, BigInt-exact HALF_UP), `orderTaxes` (StandardTaxProvider.java:38-110 + MOrderTax.java:312-372). Additive. |
| `build/erp/pos_core.js` | `applyTax` on buildSaleGroup / buildDeliverLaterGroup / buildRecallCompleteGroup when the host passes `ctx.taxOf`: line `c_tax_id` (order + invoice lines), `C_OrderTax` / `C_InvoiceTax` rows, GrandTotal updates; no tax found ⇒ refused `tax-not-found` (legacy TaxNotFound). |
| `build/erp/pos_lens.js` | per-sale `lensTaxOf(bp)` from its own db + `taxById/taxChildren/taxIncluded`; `§POS-TAX` log line per lookup |
| `scripts/bridge/witness_m3_gap.js` | four tax keys on every scenario, T1 (org 12 / wh 104 / Delivery), adapter tax inputs from the seed, invoice tax rows folded into the books |
**Proof:** `§SCN T1-pos-sale-taxed-org12-ct MATCH compared=15` and every other scenario MATCH on `line_tax/order_tax/grand_total_cents/invoice_tax` (104 / base / 0); `§RECON_SUMMARY scenarios=17 MATCH=15 SQLITE-GAP=2` (S2b ⛔ Q-OOTB, S8a F9).
Regression: 99 engine witnesses — exits identical, logs identical except the 4 known-nondeterministic ones (no existing caller passes `taxOf`).
**Residue (stated):** country-group taxes need a host `groupHas` (none on the pilot); tax postal ranges: the seed has no `c_taxpostal` table (legacy has 0 rows); external tax providers refused by name; the lens path is reviewed by reading only (no browser in this lane);
the S12 void key set does not include tax keys yet (void of a TAXED sale not scenario-tested); org-12 sale stock comes from warehouse 104 (stock key compares deltas only).

## §46 F12 — second accounting schema (Euro 200000): currency conversion of the books (2026-10-09, backlog item 6) — SPEC before code
**Measured (legacy first; new keys `postings_euro`, `postings_shipment_euro` on every scenario, the "secondary schema not compared" exclusion is deleted):** invoice books are CONVERTED: S1 `518 Dr 5249 / 758 Cr 5249` (61.75 × 0.85 = 52.4875 → 52.49), S11 1700, T1 `518 Dr 5564 / 596 Cr 315 / 758 Cr 5249`;
SQLite posted the USD amounts unconverted ⇒ SQLITE-GAP. Shipment books already MATCH (costs are per schema: m_cost of schema 200000).
**Legacy rule (read):** `FactLine.convert` (FactLine.java:819-900): document without currency ⇒ schema currency (no conversion, :821-823); same currency ⇒ copy; else each line's Dr and Cr separately × `MConversionRate.getRate(from, to, DateAcct, ConversionType, client, org)`
(MConversionRate.java:237-252: type = the document's, else the client's default type; `? BETWEEN ValidFrom AND ValidTo`, client/org 0 or own, active, ORDER BY client DESC, org DESC, ValidFrom DESC) rounded HALF_UP to the schema currency's StdPrecision (:126-147).
If the converted fact does not balance, `Fact.balanceAccounting` (Fact.java:548-630) books a currency-balancing line or corrects the biggest balance-sheet line.
**SQLite change:** `doc_poster.deriveInvoice` converts when the invoice row carries `c_currency_id` ≠ the schema currency (rate from `c_conversion_rate`, default type from `c_conversiontype`, precision from `c_currency` — column/table-guarded); no rate ⇒ absent `NoCurrencyConversion`;
an unbalanced converted fact ⇒ absent `currency balancing not ported` (stated, not invented). The kernel invoice carries the price-list currency (MOrder.currencyFromPriceList :1292-1300, copied to the invoice) and DateAcct.
**Acceptance:** `postings_euro` MATCH on S1, S3, S11, T1, S7a, S8a … (every completed scenario); shipment Euro books stay MATCH.
### §46.1 DECISION RECORD F12 — books converted into the second (Euro) schema like legacy (2026-10-09)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/doc_poster.js` `convertToSchema` called by `deriveInvoice` (FactLine.java:819-900 + MConversionRate.java:126-147, 237-252), table/column-guarded (no `c_currency` / `c_conversion_rate` / `c_acctschema.c_currency_id` ⇒ old unconverted fold);
NEW patch text `build/erp/patches/glassbowl_data.db.sql` (C_Currency id/ISO/StdPrecision from the SQLite seed, 163 rows, CREATE IF NOT EXISTS + INSERT WHERE NOT EXISTS); `scripts/bridge/witness_m3_gap.js`: Euro keys, the invoice carries price-list currency/DateAcct/org, the patch applied twice to the scratch db, `§M3_F12_ORACLE2`.
**Proof:** every completed scenario `postings_euro` MATCH (S1 5249, S11 1700, T1 `518 Dr 5564 / 596 Cr 315 / 758 Cr 5249`, …), shipment Euro books MATCH, `§RECON_SUMMARY … notCompared=0` (the secondary-schema exclusion is gone);
**second, independent oracle:** `§M3_F12_ORACLE2 PASS` — the captured legacy books of EUR invoice 109 inside the shared posting db equal the fold on BOTH schemas (101: 518 Dr 269.24 / 596 Cr 15.24 / 758 Cr 254.00; 200000: 228.85 / 12.95 / 215.90).
That also explains the long-standing `poc_doc_poster` `maxDiff=4039c(AMT-DRIFT)` on order 108: it is this missing conversion; it disappears once the patch is loaded into the shared db (not done here — shared binaries are never modified; loader = open item).
**Regression:** 99 engine witnesses — exits identical, logs identical except the 4 known-nondeterministic ones (the shared db has no `c_currency`, so their fold is unchanged). (A first cut without the table guard broke 6 witnesses on dbs that lack `c_acctschema` — caught by this check, fixed before commit.)
**Residue:** `Fact.balanceAccounting` (currency balancing line / biggest-line correction) not ported — an unbalanced converted fact is reported absent by name; per-line `CurrencyRate` overrides (`IsOverrideCurrencyRate`) not ported; shipment/other doc classes post in schema currency (cost) — no conversion needed there; currency precision ≠ 2 reported absent.

## §47 S14 — NEGATIVE quantity on an order line (2026-10-09, found in §39) — SPEC before code
**Facts:** S14a POS Order 135 / S14b Standard Order 132, BP 112, Oak Tree × −1. **SQLite today:** `pos_core.ringLine` refuses `qty ≤ 0` (`bad-qty`); `build/erp/ad_modelval.js:50-57` `MOrderLine.qtyPositive` refuses on the AD path.
**Legacy (read):** `MOrderLine.beforeSave` (MOrderLine.java:790-917) has no sign check. Outcome at completion unknown ⇒ MEASURE first (no assumption).
**MEASURED S14 (legacy first):** S14a POS qty −1 ⇒ CO, shipment CO qty −1 (stock **+1**), invoice −61.75, books `518 Dr −6175 / 758 Cr −6175`, shipment `430 Dr −4869 / 742 Cr −4869`, costed qty +1, Euro converted, OrderTax `104:-6175:0`;
S14b Standard qty −1 ⇒ CO, no shipment/invoice, OrderTax `104:-6175:0`; **S14c POS qty 0 ⇒ CO** (zero shipment + zero invoice, no fact lines). SQLite refused all three ⇒ SQLITE-GAP (RULE: an invented sign check).
**F13 (spec):** `pos_core.ringLine` refuses only a non-numeric quantity (legacy would fail to parse it), accepts 0 and negatives with LineNetAmt = qty × price; `poc_pos_ring.js`'s assertion "qty=0 refused" encoded the invented rule ⇒ its expectation becomes
"qty=0 rings (legacy S14c)" + a new falsifier "non-numeric qty refused". Harness normalisation (both sides one token): a legacy document that is POSTED with no fact lines = `none` (= SQLite's empty fold); unposted stays `NO_FACT_ACCT_ROWS`.
The drifted copy `build/erp/ad_modelval.js` and the SHIPPED `~/bim-ootb/erp/ad_modelval.js` both register `MOrderLine.qtyPositive` / `MInvoiceLine.qtyPositive` (no legacy counterpart) ⇒ added to Q-OOTB.
### §47.1 DECISION RECORD F13 — quantities: 0 and negative accepted like legacy (2026-10-09)
**Changed (one commit, backtrack = `git revert <sha>`):** `build/erp/pos_core.js` `ringLine` refuses only a non-numeric qty; `scripts/doc_poster.js` `deriveInOut` skips lines without product or with MovementQty 0 (Doc_InOut.loadLines :126-134);
`scripts/poc_pos_ring.js` expectation changed WITH evidence (was "qty=0 refused", a rule legacy does not have) + new falsifier "non-numeric qty refused"; `scripts/bridge/witness_m3_gap.js` S14a/b/c + harness normalisation (posted-without-lines = `none`; zero stock move = no move).
**Proof:** `§SCN S14a-pos-order-negative-qty MATCH` · `§SCN S14b-standard-order-negative-qty MATCH` · `§SCN S14c-pos-order-zero-qty MATCH` (17 keys each, incl. books, costed qty, tax, Euro); `§RECON_SUMMARY scenarios=20 MATCH=18 SQLITE-GAP=2` (S2b ⛔ Q-OOTB, S8a F9).
**Regression:** 99 engine witnesses — exits identical; logs identical except the 4 known-nondeterministic ones and `poc_pos_ring` (exactly the changed assertion: −1 line, +2 lines, shown in the session log).
**Residue:** the zero-cost-purchase exception of Doc_InOut (:247-251, needs M_CostDetail) still not ported; the AD-path copies of `qtyPositive` (this repo's drifted `build/erp/ad_modelval.js` and the shipped `~/bim-ootb` one) are on Q-OOTB; the POS lens UI does not offer a 0/negative entry (UX lane).

## §48 S12b — VOID of a TAXED sale (2026-10-09; residue of F4 × F11) — SPEC before code
**Facts:** as S12 but sold from org 12 / warehouse 104 with DeliveryViaRule D to BP 112 (CT Sales 6%, T1), product 136 × 1. **Expected legacy (rule):** the reversal invoice is the original negated INCLUDING its tax lines (MInvoice.reverseCorrectIt copies the document and
negates quantities; its taxes are recalculated from the negated lines ⇒ negative tax), books = negated on the same side. **SQLite today:** `voidOrder` emits the reversal invoice lines but no `C_InvoiceTax` rows ⇒ expected gap on `post_inv_rev` (missing Tax-Due leg).
Keys: the S12 set + `invoice_tax_rev`. Fix F14 (if measured so): `voidOrder` takes the original invoice's tax rows and emits them negated on the reversal invoice (additive).
**MEASURED S12b (legacy first):** reversal invoice `-2120`, books `518 Dr −2120 / 596 Cr −120 / 758 Cr −2000`, reversal InvoiceTax `105:-2000:-120` (and even an untaxed void carries `104:-2000:0`). SQLite: no reversal tax rows ⇒ Tax-Due leg missing (F14).
**Also found (P17):** (a) a defect in F6×F4: deriving a REVERSAL shipment re-derived the original through the costed-qty check, against the quantity the original's own posting had already consumed ⇒ refused. Legacy copies the original's POSTED books
(FactLine.updateReverseLine) and skips the qty check for reversals (MCostDetail.java:1482-1485) ⇒ the reversal branch now derives the original's AMOUNTS without the check. (b) Fertilizer #50 (136) costed qty is down to 1 on the pilot (S11 consumed it, as forecast in §32) ⇒
S11/S12/S12b move to **137 Mulch 10#** (costed qty 50 @ 2.70, price 3.00, already on the pilot; no data change).
**F14 (spec):** `erp_engine.voidOrder` emits, for each reversed invoice, its tax rows NEGATED on the reversal invoice (`sale.invoices[].taxes`), additive.
### §48.1 DECISION RECORD F14 — reversal invoice tax rows + reversal-shipment re-derive fix (2026-10-09)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` `voidOrder` emits the original invoice's tax rows negated on the reversal invoice; `scripts/doc_poster.js` reversal branch derives the original's amounts with `{amountsOnly:true}` (no costed-qty re-check);
`scripts/bridge/witness_m3_gap.js` S12b, `invoice_tax_rev` + `order_desc` keys (void key set now has NO not-compared item), tax-aware void adapter, S11/S12/S12b on product 137.
**Proof:** `§SCN S12-void-pos-sale MATCH compared=16` · `§SCN S12b-void-taxed-pos-sale MATCH compared=16` (reversal books `518 Dr −2120 / 596 Cr −120 / 758 Cr −2000`, reversal tax `105:-2000:-120`, shipment reversal swapped, description `** Voided`) · `§M3_VOID_NEGATIVE_CONTROL PASS`.
**Regression:** 99 engine witnesses identical to the F13 run (exits and logs, except the known-nondeterministic ones).

## §49 LOOK & FEEL PARITY — AD metadata dict_diff + "X of N windows" (2026-10-09, backlog item 7, cardinal rule 3) — SPEC before code
**What the user sees is generated from the dictionary (AD-LAYER LAW).** The live SQLite window engine reads `~/bim-ootb/erp/ad_seed.db` (`erp/idempiere.html`); this repo's `build/erp/ad_seed.db` is an empty LFS stub. Measurement uses a SCRATCH COPY of the shipped file (read-only; nothing in ~/bim-ootb changes).
**Step 1 — dict_diff over the UI dictionary:** AD_Window, AD_Tab, AD_Field, AD_Column, AD_Menu, AD_Message, AD_Ref_List, AD_Val_Rule, AD_Process, AD_Process_Para — legacy over the read types registered in §37 (whole tables in one read each; AD_Field 21,432 rows in 5.3 s), keys = the table ids,
`keyBelow 1000000` (pilot customisations excluded). Output: per table `§DD_TABLE` + `§DICT_GAP` samples + reviewable `out/lf_patch_<table>.sql` / `lf_schema_<table>.sql` (legacy values, never delete). Columns legacy has and the SQLite UI lacks are SCHEMA gaps (reported).
**Step 2 — structural witness `witness_lf_windows.js` ("X of N windows", ERP_IDEMPIERE_UX_PARITY.md style, numbers only):** N = legacy windows (dictionary denominator, not hand-picked). A window PASSES when, on both sides: the same tabs (ordered by SeqNo: name, TabLevel, AD_Table_ID, IsReadOnly,
WhereClause) and, per tab, the same fields in the same order (SeqNo, Name, IsDisplayed, IsReadOnly, DisplayLogic, IsSameLine, AD_Column_ID → ColumnName, column IsMandatory, AD_Reference_ID, DefaultValue). Prints `§LF_WINDOWS pass=X of N`, the worst windows with the first differing attribute, and a
NEGATIVE CONTROL (one field label changed on the scratch copy must turn its window to FAIL). Honest bound: this is DICTIONARY-level parity — what the renderer COMPUTES from it (callouts, display-logic evaluation, defaults at runtime) is the next layer and is not claimed.
**RESULT §49 (2026-10-09, `scripts/bridge/witness_lf_parity.js`, in `run_all.sh`):** `§LF_WINDOWS pass=350 of N=370` legacy (active) windows have an identical dictionary structure in the SQLite UI today; `§LF_PATCHED … pass=370 of N=370` after the generated patches
are applied to the scratch copy (`§LF_PATCH_EFFECT PASS`) — i.e. the whole look-and-feel gap at dictionary level is DATA/SCHEMA class, closable mechanically. `§LF_NEG PASS` (a relabelled field fails its window). Table findings:
AD_Window 85 missing (+3 isactive cells), AD_Tab 38, AD_Field 521 (+49 help texts: legacy EMPTY where SQLite carries old text), AD_Column 375 (+41 help), AD_Menu 239, **AD_Message missing entirely (2,099 rows: every message text/translation key the UI shows)**, AD_Ref_List 46,
AD_Val_Rule 0, AD_Process 0 (+2 help; run counters `statistic_*` excluded as runtime data), AD_Process_Para 0. The 20 failing windows fail on fields whose AD_Column is missing in SQLite (e.g. GL Category → DocBaseType, the four processor windows → Frequency/FrequencyType).
SQLite-only rows (reported, never deleted): windows 7100000 "C Attendance", 7800000 "Construction" + 6 tabs + 3 menus — SQLite add-on modules (AD-LAYER LAW 6: non-core arrives as plugins).
**Harness defect found (P17):** `keyBelow 1000000` (meant for pilot TEST documents) also hid real dictionary rows with ids ≥ 1,000,000 on the legacy side only (Asset ▸ Meter Log looked like 9 vs 11 fields) — removed for the AD specs.
**Delivery (not done here):** the patches `scripts/bridge/out/lf_patch_*.sql` target the SHIPPED UI dictionary `~/bim-ootb/erp/ad_seed.db` ⇒ applying them = a loader / patch in ~/bim-ootb ⇒ part of Q-OOTB (§34). Renderer-level parity (runtime display logic, callouts, defaults) is the next layer, not claimed.

## §50 LEDGER + STATE at the end of the 2026-10-09 resume run (work-to-zero; cardinal rule applied to every item)
| # | Item | State | Proof / record |
|---|---|---|---|
| F4 | void a completed sale (reversals, lines 0, description) | ✅ MATCH | §33.1, S12 16 keys |
| F5 | order credit check | ✅ MATCH | §36.1, S13a/b (+S13c control) |
| F6 | Average costed-qty refusal + cost-qty updates + state sync | ✅ MATCH | §38.1, S7a, S1 fully judged |
| F7 | period control | ✅ MATCH | §42.1, S8c + `§M3_PERIOD_RULE` |
| F8 | price-list version by date | ✅ MATCH | §41.1, S8b/S8d |
| F10 | stray active schema ⇒ named refusal (legacy NPE) | ✅ MATCH | §43.1, one-shot S5 witness with restore |
| F11 | tax determination / order+invoice tax / GrandTotal | ✅ MATCH | §45.1, T1 + tax keys on all scenarios |
| F12 | second (Euro) schema conversion | ✅ MATCH | §46.1, Euro keys + `§M3_F12_ORACLE2` |
| F13 | 0 / negative quantities accepted | ✅ MATCH | §47.1, S14a/b/c |
| F14 | reversal invoice tax + reversal-shipment re-derive fix | ✅ MATCH | §48.1, S12b |
| S3 | keyed price (AD-window path) | ✅ MATCH | §39 (quirk entries deleted; LEGACY-QUIRK count 0) |
| DD | dict_diff composite keys / ALTER / CREATE / NOT-EXISTS inserts | ✅ witnessed | §37, §49 |
| L&F | dictionary-level look & feel | ✅ measured 350/370 → 370/370 with patches | §49 |
| S2b | price-list check on the AD-window path | ⛔ Q-OOTB | §39 (fix lives in ~/bim-ootb/erp/model_order.js) |
| F2 | deliver-later lanes (kitchen/pick/lens) bundle the DR shipment | ⛔ Q-OOTB | the kernel split exists (F1: `buildDeliverLaterGroup` + `buildGenerateShipmentOps`); what remains is UI in the SHIPPED lens/kitchen/pick files (~/bim-ootb/erp) — the queues must read open order lines instead of DR shipments |
| DELIVERY | every kernel fix above reaching users | ⛔ Q-OOTB | `~/bim-ootb/erp/` ships its OWN copies of `pos_core.js`, `pos_lens.js`, `erp_engine.js`, `doc_poster.js` — already 46/4/114/58 lines apart from this repo's copies BEFORE this session; F1-F14 are in the bim-compiler copies (what M3 measures). Porting them + the patch loader is ~/bim-ootb work. |
| F9 | back-date costing (S8a `cost_qty_delta`) | ⏸ PAUSED (scope) | see below |
**F9 resume point (⏸, spec only):** legacy re-processes cost details dated after a back-dated transaction (`MCostDetail.beforeSave` IsBackDate MCostDetail.java:1241-1267 → DocManager.java:620-900 re-posts later documents; MCost history MCost.java:113-146). SQLite has no `M_CostDetail` / `M_CostHistory` at all.
Steps: (1) read types `QueryMCostDetail`/`QueryMCostHistory` + dict_spec rows (composite keys) so the scratch posting db carries the history; (2) port `MCostDetail.process` for shipments (per costing element, qty adjust; average cost unchanged on issue) as a pure fold over the detail rows ordered by DateAcct;
(3) port the back-date re-processing (DocManager.java:620-900) incl. `BackDateDay` (c_acctschema, already synced); (4) measure on a CLEAN product first (141 Weeder: costed 30, no harness history) with an interleaved receipt, then re-judge S8a. The pilot's Oak Tree history is polluted by hundreds of refused harness shipments — keep S8a as the failing regression, judge F9 on the clean product.

## §51 DECISION D6 — WebService setup on legacy is the legal door (user 2026-10-09: "setting up WebServices eventually if needed is OK as that is the legal door into the legacy")
**Settled.** Registering WS types, field whitelists, role access and read-only query types on the legacy side (everything in `scripts/bridge/pilot/*.sql`, i.e. the proposal list for the admin) is an ACCEPTED, legitimate step —
it is the same door any integration client uses. This resolves the tension in P1 and §19 ("honest bound"): the admin provisioning an integration user + WS types is expected, not a violation.
**Still forbidden** (unchanged): direct SQL into legacy, custom tables/columns/plugins as a dependency (Mode B stays parked), schema changes, markers, forged identity. Posture: WS config only, as AD configuration done by the legacy admin on their say-so;
on the local pilot we apply the same SQL ourselves. Read-only query types are preferred over write types; each write type is listed with its field whitelist in the admin handover list (§9 P1).
**Not decided by this note:** Q-OOTB (editing `~/bim-ootb/erp` to deliver the SQLite-side fixes) — still waiting for the user.

## §52 THE PLAN IN ONE PAGE — the user's full-circle restatement, rephrased (2026-10-09: "I am coming full circle recollecting what I have been planning all along")
1. **Work happens in SQLite.** SQLite is the daily system (the user's world is SQLite throughout). New features, rules and validations are built and used there first.
2. **Legacy is a twin that must show the same result** (CARDINAL RULE, incl. look & feel). Legacy users keep working in iDempiere; they must not be able to tell the difference.
3. **After SQLite has done its lane, it recomposes the same facts into legacy through the WebServices** (the legal door, D6). Two shapes:
   a. **Integration-style flows (the Unicenta POS pattern):** POS orderlines go up through WS to an integration plugin on the legacy side that merges them into the central DB, runs replenishment, and returns stock — exactly the 2012 design, **minus ActiveMQ** (the broker is not a legal/permitted path). Nothing new except the transport.
   b. **Native-feature flows (e.g. Fixed Asset registration + depreciation):** iDempiere already has the feature. SQLite implements it itself (new rules welcome), then creates the resulting records **directly in legacy through the WS** (asset, additions, depreciation entries, doc-actions) so legacy's OWN engine processes them.
4. **Compare, then close the gap on the SQLite side.** Legacy's result (its own depreciation numbers, its postings, its refusals) is the oracle. Every difference is a SQLite gap (§21/§23/§35). The parallel run continues until the gap list is empty; only then is legacy retired.
**Where the build stands against this:** 3b is exactly what the harness already does for orders (descriptor → composite WS → read-back → reconcile); Fixed Assets is the next scenario family (A_Asset / A_Asset_Addition / A_Depreciation_Entry via WS; WS types are configuration under D6). 3a today runs plugin-free through the stock composite WS (Mode A);
the legacy-side integration plugin of the Unicenta kind (Mode B, parked in §19 C1 under the old "legacy installs nothing" reading) is **re-opened as allowed** by this restatement ("a plugin there that does the integration, as done before") — to be confirmed in scope: build it, or keep using it only as a comparison oracle where it already exists.
**Not changed:** no direct SQL into legacy; no ActiveMQ; WS config is the only legacy-side setup unless the user says otherwise.

## §53 ONE LAYER FOR ALL OF SQLITE — `legacy_link` facade BUILT + WITNESSED 2026-10-09 (user: "SQLite > WS > iDempiere legacy… abstract a common layer so that any part of SQLite just uses that")
**Design.** Every part of the SQLite side (POS, Fixed Assets, the AD windows, a report, a test) reaches legacy through ONE entry: `scripts/bridge/legacy_link.js` → `createLink({cfg, persistence, descriptors, ownUserId, log})`.
API (nothing app-shaped): `submit(name,payload[,uid])` (local-first: queues, never touches the network) · `drain()` (UP: one composite WS call per document, parks the undecidable) · `baseline(rules)` / `pull(rules)` (DOWN: change log → read document → the app's `rules.apply`) ·
`read(readType, filter)` (read-only WS rows) · `compare(scenarios, spec, quirks)` (parallel-run reconcile; CARDINAL RULE enforced) · `status()` (outbox/inbox state for any UI) · `store` (the local tables). The app supplies only descriptors (what to write) and rules (how to apply what legacy did).
**Isomorphic by contract** (so the browser UI and Node tests use the same code): no Node-only module at top level (`store.js` takes a file path OR an injected persistence adapter `{load(),save(bytes)}` — IndexedDB/OPFS in a browser — and requires `fs` lazily only for the path form; sql.js comes from the page global when present). Gate in the witness.
**Witness `witness_link_facade.js` — `§LINK_VERDICT PASS` (all through the facade only):** SUBMIT_DRAIN (submit = 0 network calls; drain = ONE composite call; legacy order +1) · PERSIST (new link over the same stored bytes still knows CONFIRMED, resends 0, creates 0) ·
PULL (another legacy user's document applied once; own document not echoed) · READ · COMPARE (a match and a deliberate difference reported) · ISOMORPHIC (9 layer files, no Node-only top-level module). Regression after the `store.js` change: W10/M1/M2/DD/M3/LF all PASS in `run_all.sh`; genericity gate PASS (9 files).
**What is NOT done (honest):** the files are still CommonJS — dropping them into `idempiere.html` needs the repo's UMD wrapper or a bundler step (mechanical, per file); the browser must be allowed by the legacy WS (CORS on the ADInterface servlet — a WS-config item under D6, untested here); the SQLite UI's own windows do not call `link` yet (that is the delivery work behind Q-OOTB).
Next uses of the same facade: Fixed Assets (3b, §52) and the integration flows (3a).

## §54 THE LAYER IS AN ADAPTER — freeze the code, add models as data (user 2026-10-09: "we may not need to code anything further as that layer will be an adapter of sort")
**Rule.** `legacy_link` and its modules are FROZEN. Testing "any model" means writing a **descriptor** (header table, optional lines, optional doc-action, field mappings, read-back expectation) plus the **WebService configuration** for that model (D6) — data, not code.
No sweep tool, WS-type generator or per-model code is built now (I had started to scope one — stopped, not needed).
**Reopen the code only if a real model proves a missing capability**, and then through the usual loop (P17: evidence, failing scenario first, one commit). Known candidates, NOT built: a header-only descriptor (a master with no lines and no doc-action — `doc_writer.validate` currently requires `docAction`);
three-level documents (batch → journal → line, e.g. GL_Journal); models whose create needs values the descriptor cannot express (unique keys, sequences).
**Checklist to add a model (no code):** (1) pick the legacy table + doc type from the dictionary; (2) register the WS types for it on the pilot (SQL in `scripts/bridge/pilot/`, the same text goes to the admin); (3) write the descriptor; (4) one scenario in the corpus (facts → legacy via the link → SQLite engine result → `compare`); (5) read the `§GAP` lines; (6) fix SQLite per the CARDINAL RULE.
Candidate first models by the dictionary (34 doc tables carry `DocAction` on the pilot): C_Payment, C_Invoice, M_Inventory, M_Movement, C_Cash, M_Requisition, GL_Journal, and Fixed Assets (A_Asset, A_Asset_Addition, A_Depreciation_Entry).

## §55 "IF THAT IS POSSIBLE" — second model through the frozen layer with data only: PROVEN (2026-10-09)
**Question (user):** can the layer be an adapter so new models need no further code? **Test:** Inventory Move (`M_Movement` + `M_MovementLine`, doc-action CO) — a different table family from orders — added as a **descriptor + WebService configuration only**:
`scripts/bridge/pilot/ws_model_movement.sql` (3 WS types: create header, create line, complete; + 2 read-only query types in `ws_changelog_read.sql`) and the descriptor inside `witness_model_movement.js`.
**Result `§MODEL_VERDICT PASS`:** DATA_ONLY (git shows the 9 layer files unchanged) · MOVE (one composite call; legacy movement CO with DocumentNo 10000000; stock left locator 101 46→45 and arrived at 102 0→1, psql oracle) ·
READBACK (CONFIRMED by the link's own read-back; idmap has header + line ids + legacy DocumentNo) · REJECT (unknown product ⇒ REJECTED with the server's text, legacy movements +0 — atomic).
**So: yes, for the header + lines + doc-action shape, which most legacy document models share (34 doc tables carry DocAction on the pilot).** Not yet proven, stated plainly: header-only masters (descriptor needs `docAction`), three-level documents (GL_Journal), and the SQLite-side comparison for movement
(the SQLite engine's movement/inventory rules are the next `§GAP` hunt — that is the normal loop, not layer code).
Per-model cost to add: ~30 lines of WS configuration SQL + ~10 lines of descriptor. Wired into `run_all.sh`.

## §56 MODEL 1 — Inventory Move (M_Movement): the SQLite side (2026-10-10, resume work list item 1) — SPEC before code
**Legacy path:** the frozen link + the §55 descriptor/WS config (no layer code). **Facts:** MV1 inter-org move, product 137 × 1, locator 101 (HQ, org 11) → 102 (Store Central, org 12), doc type 143 (MMM), date today; MV2 same-locator-org is not available on the pilot
(each warehouse has ONE locator) ⇒ only the inter-org case is reachable without data changes (stated); MV-REJ unknown product (rejected, atomic); NEG control = +1 qty on the SQLite side.
**Keys:** outcome · docstatus · lines `product:qty:from:to` · stock_delta per LOCATOR · postings (schema 101, Fact_Acct AD_Table 323 folded per account) · postings_euro (200000) · cost_qty_delta (Average-PO, client level).
**Legacy rules to compare against (read):** `MMovement.completeIt` moves storage from → to per line; `Doc_Movement.createFacts` (Doc_Movement.java:128-232): per line CR `{Product.Asset}` at the from-locator org and DR `{Product.Asset}` at the to-locator org for
`costs = current cost` (the schema's costing element), cost details only for Organization costing level; inter-org lines are then bridged by the intercompany Due-To/Due-From accounts (segment balancing — the seed oracle of `poc_movement.js` shows them).
**SQLite today (read):** `pos_core.buildReplenishMove` builds the documents; `ad_docfsm` knows DR→CO for table 323; NO verb completes a movement (no stock move) and `doc_poster.derivePostings` has NO `M_Movement` branch — the Doc_Movement fold exists only inside the witness `scripts/poc_movement.js`.
⇒ expected SQLITE-GAP (MISSING) on docstatus/stock/postings; fix F15 after the measurement: `erp_engine.completeMovement` + `doc_poster.deriveMovement` (port of the proven witness fold into the product, cited).
**MEASURED MV1 (legacy first, through the frozen link):** CO, lines `137:1:101:102`, stock `{137@101: −1, 137@102: +1}`, books `600 Cr 270 / 741 Dr 270 / 742 Dr 270 / 742 Cr 270` (Euro 230: cost 2.2964 → line 2.30), costed qty unchanged (client-level costing).
SQLite before: status DR, no stock move, no books ⇒ SQLITE-GAP (MISSING) on 4 keys. MV-REJ MATCH (both refuse an unknown product).
### §56.1 DECISION RECORD F15 — Inventory Move completes, moves stock and posts like legacy (2026-10-10)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `completeMovement` (MMovement.java:290-320 @NoLines@, :455-520 stocked lines: from −qty / to +qty; optional period check); `scripts/doc_poster.js` NEW `deriveMovement` wired in `derivePostings`
(Doc_Movement.java:128-232 + Fact.balanceSegments Fact.java:405-480; the fold proven in `poc_movement.js`/`poc_movement_fx.js` moved into the product), exact HALF_UP line rounding (also applied to `deriveInOut`, which used float `cents(price × qty)` — no live tie on the pilot, latent),
`_bigDec` accepts exponent notation; `build/erp/patches/glassbowl_data.db.sql` + `C_AcctSchema_Element` (from the SQLite seed; balancing needs IsBalanced of the Organization element); `scripts/bridge/witness_m3_gap.js` move suite (MV1, MV-REJ, `§M3_MOVE_NEGATIVE_CONTROL`), `M3_ONLY` now filters the extra suites.
**Proof:** `§SCN MV1-move-inter-org MATCH compared=7` · `§SCN MV-REJ-unknown-product MATCH` · `§M3_MOVE_NEGATIVE_CONTROL PASS` (gaps on lines, stock, both books). Layer files unchanged (`git diff` empty, `§GENERICITY PASS`, `§MODEL_VERDICT PASS`).
**Regression:** 99 engine witnesses identical to the F14 run except the 4 known-nondeterministic logs.
**Residue (stated):** same-org move not reachable on the pilot (one locator per warehouse; would need a new locator = master data); reversal of a move, batch-lot and organization costing level (cost details per org) not ported; `isStocked` callback defaults to stocked when the host gives none.

## §57 MODEL 2 — AR Receipt (C_Payment) settling an invoice (+ C_AllocationHdr) (2026-10-10, work list item 2) — SPEC before code
**Model as data (D6, no layer code):** `scripts/bridge/pilot/ws_model_payment.sql` — `BridgeCreatePayment` (createData C_Payment: AD_Org_ID, C_DocType_ID, C_BankAccount_ID, C_BPartner_ID, C_Invoice_ID, C_Currency_ID, PayAmt, TenderType, DateTrx, DateAcct, Description) +
`BridgeCompletePayment` (setDocAction CO) + read types `QueryCPayment`, `QueryCAllocationHdr`, `QueryCAllocationLine`. Descriptor: header + doc-action, NO lines (the frozen `doc_writer` already allows that — lines are optional there).
**Facts:** PAY1 = a POS sale of 137 × 1 to BP 112 (creates an open invoice, as S11) → an AR Receipt (doc type 119 ARR, bank account 100 "1234", TenderType X cash) for the invoice GrandTotal with C_Invoice_ID set → CO. PAY-REJ = a receipt for an unknown invoice (rejected).
NEG control = +1¢ on the SQLite payment.
**Keys:** outcome · payment docstatus · IsAllocated · invoice IsPaid · allocation `docstatus:amount¢:writeoff¢` (+ invoice/payment links) · payment books (AD_Table 335) · allocation books (AD_Table 735), schema 101 (+ Euro both).
**Legacy rules to expect (read before measuring):** MPayment.completeIt → `allocateIt` (invoice set ⇒ one C_AllocationHdr + line payment→invoice, completed) and the invoice becomes paid; Doc_Payment posts Dr BankInTransit / Cr Unallocated (receipt);
Doc_AllocationHdr posts Dr Unallocated / Cr Receivable (fold proven in `scripts/poc_alloc_post.js`). Measure first — these are hypotheses until the log says so.
**SQLite today:** `ad_docfsm` knows the payment/allocation FSMs; NO verb completes a payment or allocates; `doc_poster.derivePostings` has NO C_Payment / C_AllocationHdr branch (folds only in witnesses) ⇒ expected MISSING.
**MEASURED PAY1 (legacy first, through the frozen link; header + doc-action descriptor, no lines — no layer change needed):** payment CO, IsAllocated Y, invoice IsPaid Y, allocation `CO:300:0:0` → the invoice; payment books **509 Dr 300 / 511 Cr 300** (Bank In-Transit / Unallocated Cash),
allocation books **511 Dr 300 / 518 Cr 300**; Euro converted 255. PAY-REJ: legacy `Foreign ID 999999999 not found in C_Invoice_ID`. SQLite: DR, nothing allocated, no books ⇒ SQLITE-GAP (MISSING).
**F16 (spec):** `erp_engine.completePayment(pay, invoice, opts)` = MPayment.completeIt → allocateIt → allocateInvoice (MPayment.java:2298-2304, 2369-2420: allocation amount = PayAmt (+ negative over/under), receipt signs as-is, AP negated; one header + one line, completed; header DateAcct = later of payment/invoice) +
MInvoice.testAllocation (:1433-1455) / MPayment.testAllocation (:966-982) for IsPaid / IsAllocated. `doc_poster.derivePayment` = Doc_Payment.createFacts (Doc_Payment.java:110-170: ARR DR {Bank.InTransit} / CR {Bank.UnallocatedCash}; APP DR {Bank.PaymentSelect} / CR {Bank.InTransit}; tender X with CASH_AS_PAYMENT=N ⇒ no facts) and
`doc_poster.deriveAllocation` = Doc_AllocationHdr SO-invoice branch (fold proven in `poc_alloc_post.js`: DR {Bank.UnallocatedCash} amount / CR {BPartner.Receivable} amount+discount+write-off; discount/write-off ≠ 0 ⇒ tax correction etc. reported absent, not ported). Conversion into schema 200000 via the generalized
`convertToSchema` (table-aware). Posting-db patch: `C_AllocationHdr.C_Currency_ID` (Doc_AllocationHdr posts in the header currency).
### §57.1 DECISION RECORD F16 — AR receipt completes, allocates the invoice and posts like legacy (2026-10-10)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `completePayment` (MPayment.java:2298-2304, 2369-2420; testAllocation MInvoice.java:1433-1455 / MPayment.java:966-982); `scripts/doc_poster.js` NEW `derivePayment` (Doc_Payment.java:110-170) +
`deriveAllocation` (Doc_AllocationHdr SO branch incl. cash-journal lines, discount/write-off, TaxCorrectionType tax correction, clearing-equal guard — the fold proven in `poc_alloc_post.js`, now in the product), `convertToSchema` table-aware, NEW `balanceAccounting`
(Fact.java:548-615, currency-balancing branch; the "correct biggest line" branch and Doc_AllocationHdr's own rounding corrections Doc_AllocationHdr.java:1147-1900 are reported ABSENT by name); `build/erp/patches/glassbowl_data.db.sql` + guarded ALTERs (`C_AllocationHdr.C_Currency_ID`, `C_AcctSchema_GL.UseCurrencyBalancing`)
and seed values; the harness loads that patch through the PRAGMA-guarded `dict_diff.applyPatch` (a real loader must guard ALTERs the same way); `pilot/ws_model_payment.sql` + 13 read types (payment, allocation, inventory, Fixed Assets) in `ws_changelog_read.sql`.
**Proof:** `§SCN PAY1-receipt-settles-invoice MATCH compared=9` (CO, allocated, invoice paid, allocation CO 3.00, payment books 509/511, allocation books 511/518, both Euro) · `§SCN PAY-REJ-unknown-invoice MATCH` · `§M3_PAY_NEGATIVE_CONTROL PASS` ·
**second oracle** `§M3_F16_ORACLE2 PASS captured legacy books: MATCH=7 ABSENT=1 DIFF=0` (every captured payment + allocation in the shared posting db, both schemas; the one ABSENT = allocation 101 in schema 200000, whose 1¢ is legacy's allocation rounding correction — not ported, named).
Layer files unchanged; `§MODEL_VERDICT PASS`. Regression: 99 engine witnesses identical except the 4 known-nondeterministic logs.
**P17 (harness):** in one full run `§M1_W1_ONECALL`/`§M1_W4_REJECT` failed: one push came back AMBIGUOUS under load and was PARKED as designed while the server had committed, so the order counter read +2. Two isolated reruns PASS. Recorded as load-sensitive; not a code defect.
**Residue:** payment-selection / order / multi-allocation (MPaymentAllocate) paths, AP payments' allocation, charges and prepayments are named-absent; over/under-payment amounts are taken from the payment row (no callout recomputation measured).

## §58 MODEL 3 — AR Invoice created directly (C_Invoice + lines, with tax) (2026-10-10, work list item 3) — SPEC before code
**Model as data:** `pilot/ws_model_invoice.sql` — `BridgeCreateInvoice` (AD_Org_ID, C_DocTypeTarget_ID, C_BPartner_ID, C_BPartner_Location_ID, M_PriceList_ID, IsSOTrx, DateInvoiced, DateAcct, Description), `BridgeCreateInvoiceLine` (AD_Org_ID, AD_Client_ID, C_Invoice_ID, M_Product_ID,
QtyEntered, QtyInvoiced, Line), `BridgeCompleteInvoice` (CO). **Facts:** INV1 AR Invoice (doc type 116), org 12 (CT), BP 112 (CT), price list 101, product 137 × 2, today ⇒ expected by the ported rules: price 3.00 (version by DateInvoiced), line 6.00, tax 105 CT 6% = 0.36, GrandTotal 6.36;
INV-REJ unknown product; NEG control +1¢. **Keys:** outcome · docstatus · lines `product:qty:price¢:tax` · line net total · invoice_tax · grand_total · postings (318) · postings_euro · ispaid.
**Legacy rules (read):** MInvoiceLine.beforeSave prices from the invoice's price list at DateInvoiced and sets the tax via Tax.get with no DeliveryViaRule for a direct invoice (MInvoiceLine.java:499-520 ⇒ bill-to = BP location); StandardTaxProvider.calculateInvoiceTaxTotal (StandardTaxProvider.java:166-230) = the order
algorithm (F11 `orderTaxes`); Doc_Invoice books Dr receivable / Cr revenue / Cr Tax-Due (F3/F11 `deriveInvoice`). **SQLite today:** `erp_engine.completeInvoice` sets status only; pricing/tax for a stand-alone invoice exist as separate verbs (`priceAt`, `taxLookup`, `orderTaxes`) but no verb assembles an invoice from them ⇒ measure.
**MEASURED INV (legacy first):** INV1 CO, line `137:2:300:105`, TotalLines 600, InvoiceTax `105:600:36`, GrandTotal 636, books `518 Dr 636 / 596 Cr 36 / 758 Cr 600` (Euro 541/31/510); INV2 (product 122, NOT on the price list) ⇒ legacy ACCEPTS the line at price 0 (no price-list check on invoice lines,
MInvoiceLine.java:899-903 — unlike the order line), CO, totals 0, no books; INV-REJ unknown product rejected. SQLite before: no verb assembles a direct invoice (DR, nothing).
### §58.1 DECISION RECORD F17 — direct AR invoice priced, taxed, totalled and posted like legacy (2026-10-10)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `prepareInvoice` (MInvoiceLine.beforeSave :877-950 pricing/tax/line net, StandardTaxProvider.calculateInvoiceTaxTotal :166-230 via `orderTaxes`); completion by the existing `completeInvoice`; books by the existing `deriveInvoice`
(+F12 conversion); `scripts/bridge/pilot/ws_model_invoice.sql` (3 WS types, data only); `scripts/bridge/witness_m3_gap.js` invoice suite (INV1, INV2, INV-REJ, `§M3_INV_NEGATIVE_CONTROL`); the adapter's tax inputs carry no DeliveryViaRule for an invoice (MInvoiceLine.setTax :504-520).
**Proof:** `§SCN INV1-ar-invoice-taxed-direct MATCH compared=9` · `§SCN INV2-ar-invoice-product-not-on-pricelist MATCH` · `§SCN INV-REJ-unknown-product MATCH` · `§M3_INV_NEGATIVE_CONTROL PASS`. Layer files unchanged (`§MODEL_VERDICT PASS`, genericity PASS). Regression: identical except the 4 known-nondeterministic logs.
**Residue:** price-limit enforcement (`UnderLimitPrice`, :905-913) not ported (no keyed price on this path); AP invoices / credit memos not scenario-tested; the invoice from an order line (C_OrderLine_ID ⇒ the order's DeliveryViaRule) is the WR path already covered by F11.

## §59 MODEL 4 — Physical Inventory (M_Inventory) (2026-10-10, work list item 4) — SPEC before code
**Model as data:** `pilot/ws_model_inventory.sql` — `BridgeCreateInventory` (AD_Org_ID, C_DocType_ID, M_Warehouse_ID, MovementDate, Description), `BridgeCreateInventoryLine` (AD_Org_ID, AD_Client_ID, M_Inventory_ID, M_Locator_ID, M_Product_ID, QtyBook, QtyCount, InventoryType, Line),
`BridgeCompleteInventory` (CO). **Facts:** doc type 144 (Physical Inventory, PI), warehouse 103 / locator 101, product 137; QtyBook = legacy on-hand read at run time, the SAME QtyBook/QtyCount go to both sides (the count is a user fact); PI1 count = book + 2 (gain), PI2 count = book − 1 (loss),
PI-REJ unknown product, NEG control +1 counted. **Keys:** outcome · docstatus · lines `product:book:count` · stock_delta per locator · postings (321) · postings_euro · cost_qty_delta.
**Legacy rules (read):** MInventory.completeIt qty diff = QtyCount − QtyBook for PI (MInventory.java:531-535) moves storage; Doc_Inventory (Doc_Inventory.java:285-400) DR `{Product.Asset}` = diff × current cost, CR the warehouse Inventory-Differences account (or the line's charge).
**SQLite today:** `doc_poster.deriveInventory` exists (B-3 tail; rounds the unit cost to cents BEFORE multiplying — to be judged); no verb completes an inventory (status/stock) ⇒ measure.
**MEASURED PI (legacy first):** PI1 gain (book 16, count 18) ⇒ CO, stock +2, books **742 Dr 540 / 439 Cr 540** (Product Asset / Inventory Differences; Euro 459/459 = 2 × 2.2964 rounded on the LINE), costed qty +2; PI2 loss (book 18, count 17) ⇒ stock −1, books **439 Dr 270 / 742 Cr 270**
(positive amounts on SWAPPED sides), costed qty −1; PI-REJ unknown product rejected. SQLite before: DR, no stock, no books.
**Harness defect found by PI1 (P17, important):** the first measurement showed legacy's costed qty jumping +16 for a +2 gain — the cost details were `IsBackDate=Y` dated 2026-10-09: the harness's `TODAY` was the UTC day (`toISOString`), the pilot server runs on local time (UTC+8, already the 10th),
so before 08:00 local EVERY dated document the harness sent (moves, receipts, invoices, inventories) went down legacy's back-date costing path. Fixed: `TODAY` = the local calendar day. All suites re-measured afterwards (MATCH unchanged).
### §59.1 DECISION RECORD F18 — Physical Inventory completes, moves stock, posts and keeps costed qty like legacy (2026-10-10)
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `completeInventory` (MInventory.java:525-540, :587); `scripts/doc_poster.js` `deriveInventory`: exact LINE rounding (was unit cost rounded to cents first ⇒ 4.60 vs legacy 4.59 on the Euro schema) and the
single-amount `Fact.createLine` rule (Fact.java:206-212: a negative amount is booked on the CREDIT side as its absolute value; a zero amount keeps its line) — the same rule applied to `deriveMovement`; NEW `costQtyUpdatesFor(db, 'M_Inventory', id)` (CurrentQty += count − book);
`build/erp/patches/glassbowl_data.db.sql` + `M_Warehouse_Acct` (seed); `dict_spec.json` m_product + `producttype`; `pilot/ws_model_inventory.sql` (data only); `witness_m3_gap.js` inventory suite (PI1, PI2, PI-REJ, `§M3_PI_NEGATIVE_CONTROL`) and the local-date `TODAY`.
**Proof:** `§SCN PI1-physical-inventory-gain MATCH compared=7` · `§SCN PI2-physical-inventory-loss MATCH` · `§SCN PI-REJ-unknown-product MATCH` · `§M3_PI_NEGATIVE_CONTROL PASS` · MV/PAY/INV still MATCH. Layer files unchanged.
**Regression:** identical except the 4 known-nondeterministic logs. (A first cut dropped zero-amount lines and broke `poc_post_tail`'s blessing-flip falsifier — caught by the regression check, fixed before commit.)
**Residue:** Internal-Use (IU) and Cost-Adjustment (CA) inventories, charge lines and the zero-cost-purchase blessing in a live scenario not measured; the costed-qty refusal for a loss below 0 is not applied to inventories (no scenario reaches it); `deriveMovement` still drops a zero-cost line.

## §60 LAYER REOPENED (P17, §54 rule) — header-only masters + a doc-action on a CHILD table (2026-10-10, needed by Fixed Assets, work list item 6/7)
**Evidence (failing first, log `scratchpad/layer_gap.log`):** Fixed Assets needs an A_Asset (status New) before the Asset Addition can register + activate it (MAssetAddition.java:112-118 `setA_CreateAsset`, prepareIt :573-590); A_Asset is a master WITHOUT DocAction. The frozen `doc_writer`:
`§LAYER_GAP header-only master: §DW descriptor missing 'docAction'`, and for asset + addition in ONE composite (header A_Asset, line A_Asset_Addition, doc-action on the addition) it sent `recordIDVariable "@A_Asset.A_Asset_ID"` — the doc-action would target the WRONG record.
**Change (generic, app-word-free; one commit):** `doc_writer.validate` — `docAction` optional (a descriptor without it = create only, e.g. a master); `doc_writer.build` — the doc-action's record variable is `@<docAction.table>.<docAction.table>_ID` (identical output whenever the doc-action is on the header table, i.e. every existing descriptor).
**Proof required:** `§LAYER_FIX` both gap probes pass after the change; every existing descriptor builds byte-identical operations (W10/M1/M2/LINK/MODEL/M3 unchanged); genericity gate PASS; FA scenario uses it (§61).
**RESULT §60:** `§LAYER_FIX header-only PASS ["createData"]` · `§LAYER_FIX child doc-action PASS @A_Asset_Addition.A_Asset_Addition_ID` · `§LAYER_IDENTICAL order/pay/move PASS` (old vs new `doc_writer` build byte-identical operations for existing descriptors) · `§GENERICITY PASS`. Backtrack = `git revert <sha>`.

## §61 MODEL 5 — FIXED ASSETS: registration + addition + depreciation (the user's headline, §52 3b) (2026-10-10, work list item 6) — SPEC before code
**Model as data (D6):** `pilot/ws_model_fa.sql` — create A_Asset (master, no doc-action — needs §60), create A_Asset_Addition + CO (doc-action on the CHILD table, §60), create A_Depreciation_Entry + CO; read types from §57. ONE composite per registration: asset + addition + CO.
**Facts:** FA1 = asset "M3-FA-<run>" in group 50007 Equipment (Straight Line 50003 on both schemas), product 145, owned, depreciated, UseLifeMonths 12 (+_F 12), manual addition (A_SourceType MAN, no charge) AssetSourceAmt 1200.00 USD, DateDoc = DateAcct = today;
FA-DEP = a Depreciation Entry (doc type 200002, schema 101, period of today, A_Entry_Type DEP) completed after FA1; FA-REJ = addition for an asset group that does not exist (rejected); NEG control = +1¢ on the SQLite cost.
**Keys (legacy = the oracle):** asset status · workfile per schema `cost¢:life:period:accum¢` · expense schedule per schema (count, first period expense¢, Σ) · addition books (A_Asset_Addition) per schema · depreciation-entry books per schema · workfile accumulated after the entry.
**Legacy rules (read so far):** MAssetAddition.beforeSave/prepareIt/completeIt (MAssetAddition.java:112-138, 560-600, 659-800): asset status New ⇒ CreateAsset, activation, workfile per group-acct schema (MDepreciationWorkfile.java:243-280: use life from the asset when > 0), cost via `adjustCost`, `buildDepreciation` (:649-…) builds the A_Depreciation_Exp schedule
with the method of the asset acct (SL: MDepreciation.apply_SL:330 exp = remaining cost / remaining periods, HALF_UP at precision); Doc_AssetAddition / Doc_DepreciationEntry posting folds exist in `doc_poster` (B-3; to be judged against legacy FIRST, per the work list).
**SQLite today:** posting folds only; no registration / addition / workfile / schedule / depreciation-run engine ⇒ measure legacy, then port the measured path.
**MEASURED FA1 on legacy (probe through the link, ONE composite: create asset + addition + CO — the §60 capability in use; psql oracle read-only):** asset 1000000 status `AC`, AssetServiceDate = DateDoc, own UseLifeMonths 12 kept on the asset; addition CO, Posted Y,
books schema 101 `563 Dr 1200 / 431 Cr 1200` (A_Asset_Acct asset / product-expense default), schema 200000 `563 Dr 1020 / 431 Cr 1020` (converted at 0.85); workfile 101 `cost 1200, UseLifeMonths 0, _F 60, A_Life_Period 0, A_Current_Period 1, DateAcct 2026-10-31`,
workfile 200000 `cost 1020, life 0/0`; expense schedule 101 = 60 rows of **0.00**, 200000 = none. **Why zero (rule, not accident):** `MAsset.afterSave` creates A_Asset_Acct + workfile per group-accounting schema and then OVERWRITES the use life with the GROUP's values (MAsset.java:438-456) —
the asset's own 12 months are ignored; every pilot asset group has C life 0 (F 60 on schema 101, 0 on 200000), and `apply_SL` (MDepreciation.java:330-341) gives remaining cost / remaining periods = 0 when the C life is 0. The addition never adjusts use life (`adjustUseLife` is not called, MAssetAddition.java).
**⏸ PAUSED 2026-10-10 (context budget) — resume point:** (1) SQLite port of the MEASURED path: `registerAsset` (A_Asset NW + per group-acct A_Asset_Acct + workfile with the GROUP life), `completeAssetAddition` (status AC, service date, workfile cost per schema converted at DateAcct, current period 1,
DateAcct month-end, `buildDepreciation` with lifePeriods = max(C,F) and `apply_SL` incl. the zero-life case), then `deriveAssetAddition` (B-3 fold) judged against the measured books above; (2) FA-DEP depreciation entry (WS types exist: `BridgeCreateDepreciationEntry` / `BridgeCompleteDepreciationEntry`);
(3) a NON-ZERO depreciation needs a use life on the asset GROUP — question Q-FA below; (4) items 5 (C_Cash / M_Requisition) not started.

## §62 LEDGER — 2026-10-10 resume run (work-to-zero; cardinal rule)
| # | Item | State | Proof |
|---|---|---|---|
| F15 | Inventory Move | ✅ MATCH | §56.1 MV1 + MV-REJ + negative control |
| F16 | AR receipt + allocation (+ currency balancing) | ✅ MATCH | §57.1 PAY1 + captured books 7 MATCH / 1 named absent / 0 diff |
| F17 | direct AR invoice with tax | ✅ MATCH | §58.1 INV1, INV2 (unpriced line accepted at 0), INV-REJ |
| F18 | Physical Inventory (+ costed qty, side rule) | ✅ MATCH | §59.1 PI1, PI2, PI-REJ; harness `TODAY` = local day |
| L | layer reopened: create-only masters + child-table doc-action | ✅ | §60 (byte-identical for existing descriptors) — work list item 7 delivered by this |
| FA | Fixed Assets | ⏸ PAUSED | legacy measured (above); SQLite port = resume point |
| C_Cash / M_Requisition | item 5 | ⏸ not started | — |
| S2b, F2, delivery | | ⛔ Q-OOTB (unchanged) | |
| F9 | back-date costing | ⏸ (unchanged) | |
**Q-FA (concept source §52 3b — legacy's own depreciation is the oracle; undecidable from the record):** every pilot asset group has use life 0, so legacy's depreciation of any newly registered asset is ZERO. To compare a real depreciation the Equipment group needs a use life on legacy.
May that be set as a recorded pilot fixture (`scripts/bridge/pilot/fa_group_life.sql`, e.g. Equipment 50007 → 60 months on both schemas, restorable), or should it be keyed by a legacy user in the Asset Group window?
**Q-FA ANSWERED (2026-10-10, relayed in the resume brief):** "set it THE WAY A LEGACY USER DOES — through the legacy WebServices as a normal user (register an update WS type for A_Asset_Group / its accounting … under D6), with the before/after values and the restore recorded in the spec so it is reversible. Choose a realistic value (e.g. 60 months) … do not use direct SQL. This is a pilot-copy change under the legal door, not a divergence." ⇒ §63.

## §63 FIXED ASSETS resumed — group use life set through the WS, then the SQLite port (2026-10-10, resume of §61) — SPEC before code
**D-FA fixture (D6, data only, reversible).** The use life lives on `A_Asset_Group_Acct` (per schema; MAsset.java:438-456 copies it onto the workfile). WS type `BridgeUpdateAssetGroupAcct` (updateData, fields UseLifeMonths, UseLifeYears, UseLifeMonths_F, UseLifeYears_F)
in `scripts/bridge/pilot/ws_fa_group_life.sql`; `scripts/bridge/pilot/fa_group_life.js set|restore|show` updates rows **200002** (Equipment 50007, schema 101) and **200005** (Equipment, schema 200000) as GardenAdmin (role 102) through `ad_client.call('update_data')`.
**Value chosen: 60 months (5 years) on BOTH the C and F life of BOTH schemas** — the same 60 months the pilot already carries as the fiscal life of every group on schema 101 (seed value, not invented). MAssetGroupAcct.beforeSave → UseLifeImpl.validate (UseLifeImpl.java:245-262) recomputes years from months, so the 4 fields are sent consistently.
**Before (psql oracle, read-only):** 200002 = C 0 m / 0 y, F 60 m / 5 y; 200005 = C 0/0, F 0/0. **Restore** = `node scripts/bridge/pilot/fa_group_life.js restore` (sends exactly those values; a months value of 0 with years 0 stays 0 — UseLifeImpl.java:252-254).
Vehicles (50006) is NOT touched: it keeps C 0 / F 60 on schema 101 ⇒ the measured zero-C-life branch stays reachable as its own scenario (FA0).
**SQLite side data:** `dict_spec.json` + `a_asset_group_acct` (seed) ⇒ the changed life shows as `§DICT_GAP` with a generated patch (class DATA, §26); the FA witness loads the legacy group accounting into its scratch working copy at start (handover, `§FA_STATE_SYNC`), like `§M3_STATE_SYNC`.
**Rules to port (F19), each from legacy source, into `scripts/erp_engine.js` (pure functions over plain rows; host persists):**
1. `faRegisterAsset` — MAsset.afterSave (MAsset.java:426-456): per group-acct row with org 0 or the asset org: an asset-acct copy and a workfile per schema with the GROUP's C/F life (the asset's own UseLifeMonths is overwritten), `A_Life_Period = UseLifeMonths` (MDepreciationWorkfile.beforeSave :146-151), cost 0, period 0; IsDepreciated/IsOwned from the group; status NW. Unknown group ⇒ refused.
2. `faCompleteAddition` — MAssetAddition.prepareIt/completeIt (MAssetAddition.java:559-800): period open (GL Journal base type), AssetValueAmt ≠ 0, CreateAsset only for status NW; asset status AC + AssetServiceDate = DateDoc; per workfile: DateAcct = month end of the addition DateAcct (:723 + MDepreciationWorkfile.beforeSave :163-166), cost = AssetSourceAmt converted to the schema currency at DateAcct (reset when CreateAsset, `adjustCost` :437-453), qty, current period 1 (:752-759), then `buildDepreciation`.
3. `faBuildDepreciation` — MDepreciationWorkfile.buildDepreciation (:649-785) with no IDepreciationMethod factory (none ships in core; Core.java:811-838): lifePeriods = max(C,F); per period p from the current period: C: `lifeC > p` ⇒ `apply_SL` (MDepreciation.java:330-345: (cost − salvage − accum) / (lifeC − (p−1)), HALF_UP 2; 0 when no remaining periods) then `invoke` scale 2 (:275); `lifeC == p` ⇒ remaining cost; beyond ⇒ 0; same for F; row DateAcct = month end of (start + (p − current) months); accounts from the asset acct (A_Depreciation_Acct DR / A_Accumdepreciation_Acct CR, MDepreciationExp.createDepreciation :166-200). Only SL is ported; any other method ⇒ refused by name, never guessed.
4. `faCompleteDepreciationEntry` — MDepreciationEntry (afterSave → selectLines :174-190: unassigned exp rows of the entry's month, client, org, schema; completeIt :291-340: each unprocessed row in the period, `MDepreciationExp.process` :205-253: no unprocessed earlier rows of the asset, asset AC, workfile accum += expense/expense_F, current period / DateAcct from the latest processed row + 1 month).
Books: the existing `doc_poster.deriveAssetAddition` / `deriveDepreciationEntry` (B-3 folds) — judged against the legacy Fact_Acct FIRST (§61 measured 563 Dr / 431 Cr), changed only if a key differs.
**Scenarios (new witness `scripts/bridge/witness_fa_gap.js`, wired into `run_all.sh`):** FA1 = Equipment asset + MAN addition 1200.00 USD today (one composite) + a Depreciation Entry per schema for today's period, completed;
FA0 = the same on Vehicles (C life 0 ⇒ C expense 0, F 20.00); FA-REJ = asset in a group that does not exist (refused, atomic); NEG = +1¢ on the SQLite addition amount (must surface on workfile cost, schedule and books).
**Keys:** outcome · asset_status · workfile per schema `cost¢:lifeC/lifeF:A_Life_Period:period:dateacct` · schedule per schema `n|first|last|Σexp¢/Σexp_F¢` · addition books per schema · entry docstatus · entry lines `n` + own-asset line `period:exp¢:expF¢` · entry books per schema · workfile after the entry `accum¢/accumF¢:period:dateacct`.
Other legacy assets' unassigned rows of the month (e.g. the §61 probe asset 1000000) are entry state: read once before the entry and loaded into the SQLite scratch side (handover, logged `§FA_PENDING_SYNC n=`), so both entries select the same rows.

### §63.1 DECISION RECORD F19 — Fixed Assets: registration, addition, schedule and depreciation entry like legacy (2026-10-10)
**Fixture (D-FA, through the WS as a normal user):** `pilot/ws_fa_group_life.sql` + server restart; `node scripts/bridge/pilot/fa_group_life.js set` ⇒ `§FA_GROUP_LIFE after row=200002 schema=101 C=60m/5y F=60m/5y` / `row=200005 schema=200000 C=60m/5y F=60m/5y`
(psql oracle: UpdatedBy=101 GardenAdmin). Restore: `fa_group_life.js restore` (before values in the script and in §63).
**Measured legacy FA1 (Equipment, 1200.00 USD, today 2026-10-10):** asset AC, service date = DateDoc; workfile 101 `cost 1200.00, life 60/60, A_Life_Period 60, period 1, DateAcct 2026-10-31`, schedule 60 rows of 20.00/20.00 (2026-10-31 … 2031-09-30, Σ 1200.00);
schema 200000 cost 1020.00 (0.85), 60 × 17.00; addition books `563 Dr / 431 Cr` both schemas; Depreciation Entry per schema CO, own line period 1 processed, books **501 Dr / 574 Cr** (Depreciation / Accumulated Depreciation), workfile after `accum 20.00/20.00, period 2, DateAcct 2026-11-30`.
FA0 (Vehicles, C life 0 / F 60): C expense 0 on every row, F 20.00; entry 101 posts NOTHING (Doc_DepreciationEntry posts Expense, which is 0); schema 200000 has life 0/0 ⇒ no schedule, the entry selects 0 lines and still completes.
FA-REJ: `Foreign ID 999999 not found in A_Asset_Group_ID`; FA-REJ2 (amount 0): `Invalid: Asset value=0` (MAssetAddition.prepareIt :573-577) — both atomic (composite rolled back).
**Two harness/WS facts found (P17, recorded the same day):** (1) `A_Depreciation_Entry.IsApproved` is NOT NULL with AD default `@#IsCanApproveOwnDoc@`, a login-context value the window fills and createData over the WS does not ⇒ legacy refused every entry
("null value in column isapproved"); the WS type now whitelists IsApproved (`ws_model_fa.sql` tail) and the client sends the login role's flag, read through the new read type `QueryADRole` (role 102 = Y). (2) The composite answer carries no RecordID for the asset ADDITION line, so the link's idmap holds only the asset — the witness reads the addition by its asset (not a layer change; the layer is not reopened for it).
Pending rows of OTHER legacy assets for the month (from the earlier failed runs) are selected by legacy's entry too: the witness hands them over (`§FA_PENDING_SYNC`) and the SQLite entry selected the same set (5 lines / 4 lines in the run that had them).
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `faRegisterAsset`, `faCompleteAddition`, `faBuildDepreciation`, `faCompleteDepreciationEntry` (+ helpers; SL and ARH_ZERO only — any other depreciation type is refused by name);
`scripts/doc_poster.js` exports `fxRate` (no rule change: the B-3 folds `deriveAssetAddition` / `deriveDepreciationEntry` matched legacy unchanged); NEW `scripts/bridge/witness_fa_gap.js` (wired into `run_all.sh`); `dict_spec.json` + `a_asset_group_acct`; `pilot/ws_fa_group_life.sql`, `pilot/fa_group_life.js`, `ws_model_fa.sql` (IsApproved), `ws_changelog_read.sql` (QueryADRole).
**Proof (log `scratchpad/fa_all.log`):** `§SCN FA1-equipment-60m MATCH compared=15` · `§SCN FA0-vehicles-zero-c-life MATCH compared=15` · `§SCN FA-REJ-unknown-group MATCH` · `§SCN FA-REJ2-zero-amount MATCH` · `§FA_NEGATIVE_CONTROL PASS` (+1¢ ⇒ gaps on workfile, schedule, addition books, both schemas) · `§FA_NOT_VACUOUS PASS` · `§FA_VERDICT PASS`.
`§FA_STATE_SYNC a_asset_group_acct changed_cells=6` = the SQLite seed still carries life 0 — a DATA gap (patch generated by dict_diff, delivery = patch + loader, Q-OOTB).
**Regression:** the 99 engine witnesses run on HEAD (engine/poster restored from git for the baseline) and after the change: logs identical except the 4 known-nondeterministic ones (random group ids / signatures), exit codes identical. `run_all.sh` green: core corpus MATCH=18 SQLITE-GAP=2 (S2b, S8a, unchanged), all model suites MATCH, `§FA_VERDICT PASS`; `§TRIAGE DATA_gaps` now also lists the 6 group-life cells (patch `out/dict_patch_a_asset_group_acct.sql`).
**Residue (stated):** depreciation methods other than SL/ARH_ZERO, salvage value, asset depreciation date, imported/invoice/project additions, additions to an existing asset (adjust, not create), disposal/transfer/revaluation documents, the "fully depreciated ⇒ status DE" workfile rule (MDepreciationWorkfile.beforeSave :153-160, not reachable within 60 periods), reversal of an addition or an entry — not ported; each is a separate scenario when reached.

## §64 FULL DOCUMENT CYCLE — ORDER-TO-CASH chained, compared after EVERY step (user priority 2026-10-10: "full document cycle tests, sales order etc even") — SPEC before code
**Cycle C-O2C (one chain, six steps; each step is a scenario of its own, legacy first, keys compared after the step):**
1. **SO** — Standard Order (doctype 132, BP 112 / loc 108, warehouse 103, product 137 × 2, today) created + CO (descriptor = the M3 order path).
2. **SHIP** — the shipment FROM the order: M_InOut (doctype 120 = 132's shipment type, MovementType C-, C_Order_ID) + lines carrying C_OrderLine_ID, locator 101, CO.
3. **INV** — the AR invoice FROM the shipment: C_Invoice (doctype 116 = 132's invoice type, C_Order_ID) + lines carrying C_OrderLine_ID + M_InOutLine_ID and the ORDER LINE's price, CO.
4. **PAY** — AR Receipt (119) for the invoice's GrandTotal with C_Invoice_ID ⇒ allocation (the §57 path).
5. **RC-INV** — Reverse-Correct of the (paid) invoice. 6. **RC-SHIP** — Reverse-Correct of the shipment.
**How a normal user does steps 2-3 and why the WS payload is this:** in the windows, Shipment → "Create lines from" the order, Invoice → "Create lines from" the shipment (CreateFrom forms, UI-only). The resulting records are exactly header + lines with the
C_Order_ID / C_OrderLine_ID / M_InOutLine_ID links and the copied order price — that is what the WS writes (Pilot_createData_M_InOut/_Line, Pilot_createData_C_Invoice/_Line, already registered). The processes "Generate Shipments" (M_InOut_Generate) and
"Generate Invoices" work from a T_Selection made in an Info window; without a selection they sweep EVERY open order of the warehouse/BP — on the pilot that would ship the hundreds of standard orders S6 leaves open, so they are not used (stated, not hidden).
Doc-actions on EXISTING documents (RC) go through `ad_client.call('set_docaction')` with Pilot_setDocAction_* (docAction is a free parameter there): the frozen descriptor writer only acts on documents it creates in the same call — a P17 candidate for the layer, not reopened for the oracle side.
**Keys after each step (both sides, deltas where legacy state is shared with other runs):** order `docstatus` · order lines `qtyordered/qtyreserved/qtydelivered/qtyinvoiced` · order tax / grand total · shipment `docstatus`, lines, `stock_delta` (on-hand 137@101) · `cost_qty_delta` (Average PO, client) ·
books per document AND per schema (101 + 200000) · invoice lines `product:qty:price:tax`, invoice tax, grand total, `ispaid`, shipment-line `isinvoiced` · payment `docstatus`, `isallocated`, allocation · **BP open item**: delta of `C_BPartner.TotalOpenBalance` and `SO_CreditUsed` (MBPartner.setTotalOpenBalance, MBPartner.java:711-757) ·
reverse legs: statuses of original + reversal, reversal books per schema, allocation effects (reversed allocation, invoice-vs-reversal allocation), order-line quantities restored.
**MEASURED legacy (probe 2026-10-10, scratchpad `o2c_probe.log`):** SO CO ⇒ line `qtyreserved 2`; SHIP CO ⇒ `qtydelivered 2, qtyreserved 0`; INV CO ⇒ `qtyinvoiced 2`, GrandTotal 6.00, BP TotalOpenBalance **+6**, SO_CreditUsed **+6**; PAY ⇒ both back to **0**;
RC-INV ⇒ original + reversal RE, reversal GrandTotal −6, both IsPaid Y, TotalOpenBalance **−6** (the receipt is unallocated again), SO_CreditUsed 0; RC-SHIP ⇒ both RE, `qtydelivered 0, qtyreserved 2` (reservation restored), `qtyinvoiced 0`.
**SQLite today (read):** order completion has no reservation; shipment/invoice completion do not touch the order line; no BP open-balance rule; invoice reversal exists only inside the POS void (`voidOrder`, no allocation handling) ⇒ expected SQLITE-GAPs, fixed one rule per commit (F20…), each citing the legacy lines above.
**Cycle C-P2P (§65, after O2C):** Purchase Order → Material Receipt from the PO → AP Invoice matched → AP Payment + allocation; keys as above + MatchPO / MatchInv + average-cost update (cost detail / costed qty / current cost price).

### §64.1 DECISION RECORD F20 — order-line quantities (reserved / delivered / invoiced) like legacy (2026-10-10)
**Evidence (first cycle run, log `scratchpad/o2c1.log`):** `O2C1-SO ol_qty legacy 137:2/2/0/0 sqlite 137:2/0/0/0`, `O2C2-SHIP legacy 2/0/2/0`, `O2C3-INV legacy 2/0/2/2` (ordered/reserved/delivered/invoiced) — SQLite never moved the order line.
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `orderReserve` (MOrder.reserveStock MOrder.java:1930-2023), `inoutOrderLineEffects` (MInOut.completeIt :1686-1690, :1959-1985), `invoiceOrderLineEffects` (MInvoice.completeIt :2111-2125) — pure, UPDATE_LINE ops on C_OrderLine;
NEW `scripts/bridge/cycle_o2c.js` (the cycle, legacy + SQLite sides) wired into `witness_m3_gap.js` (`M3_ONLY=O2C` runs the cycle alone).
**Proof (log `scratchpad/o2c2.log`):** `ol_qty` MATCH on O2C1-SO, O2C2-SHIP, O2C3-INV, O2C4-PAY; every other key of steps 1-4 already MATCHed in the first run (status, lines, order/invoice tax, grand total, shipment + invoice + payment + allocation books on BOTH schemas, stock, costed qty) — the only key left on steps 1-4 is `bp_delta` (F21).
Reverse steps (O2C5/O2C6) still differ by design of the sequence: they need the reversal verbs (F22, F23); the quantity rules above already cover reversals (a reversal completes with negated quantities).
**Regression:** 99 engine witnesses identical to the F19 run (the verbs are new; nothing existing calls them).

### §64.2 DECISION RECORD F21 — BP open item (TotalOpenBalance / SO_CreditUsed) like legacy (2026-10-10)
**Evidence (`o2c2.log`):** `bp_delta` (cents, TotalOpenBalance/SO_CreditUsed vs the cycle start) legacy `0/0 → 0/0 → 600/600 → 0/0 → −600/0`, SQLite `none` (no rule).
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `bpOpenBalance` — MBPartner.setTotalOpenBalance (MBPartner.java:711-757) with the DB functions it calls, read from the pilot (read-only): `invoiceopen` (GrandTotal of C_Invoice_v — credit memo negated —
minus ACTIVE allocation lines × MultiplierAP) and `paymentavailable` (0 with a charge, else C_Payment_v.PayAmt — payment negated — minus ACTIVE allocation amounts); currency conversion is the host's (`toBase`), absent ⇒ base. The cycle derives it from the SQLite side's OWN documents.
**Proof (`o2c3.log`):** `§SCN O2C1-SO MATCH compared=9` · `O2C2-SHIP MATCH 9` · `O2C3-INV MATCH 12` (bp 600/600) · `O2C4-PAY MATCH 13` (bp 0/0) — steps 1-4 of the cycle fully MATCH on every key, both schemas.
**Regression:** additive verb; covered by the F22 regression run (no existing witness calls it). **Residue:** ActualLifeTimeValue and SOCreditStatus re-evaluation (MBPartner.setSOCreditStatus, called at :756) not compared here (credit status is F5's rule on the order side).

### §64.3 DECISION RECORD F22 — Reverse-Correct of a PAID invoice like legacy (2026-10-10)
**Evidence (`o2c3.log`):** O2C5-RC-INV legacy: original + reversal `RE/RE`, reversal GrandTotal −600, both IsPaid `Y/Y`, reversal tax `104:−600:0`, reversal books `518 Dr −600 / 758 Cr −600` (Euro −510), allocations `RE:0:inv:pay | CO:600:inv:- | CO:−600:rev:-`
(the receipt's allocation de-activated with zero lines, a new invoice-vs-reversal allocation), receipt IsAllocated `N`, order line QtyInvoiced back to 0, BP `−600/0`. SQLite: no Reverse-Correct for a stand-alone invoice.
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `reverseInvoice` (MInvoice.reverseCorrectIt :2599-2619 → reverse :2627-2815, reverseAllocations :2821-2833 → MAllocationHdr.reverseIt non-accrual :845-935, MPayment.testAllocation) and
NEW `_reversalInvoiceDocOps` = the reversal-document block that `voidOrder` already had (F4/F14), moved out VERBATIM so both verbs share one implementation (`voidOrder` output byte-identical: S12/S12b MATCH, regression identical); `cycle_o2c.js` applies the kernel ops to its state (`applyDocOps`).
**Proof (`o2c4.log`):** `§SCN O2C5-RC-INV MATCH compared=13` (all keys above, both schemas, bp `−600/0`); O2C1-4 still MATCH; `M3_ONLY=S12` ⇒ `S12-void-pos-sale MATCH 16`, `S12b-void-taxed-pos-sale MATCH 16`.
**Regression:** 99 engine witnesses vs the F20 run: identical except the 4 known-nondeterministic logs; exit codes identical (this run also covers F21's additive verb).
**Residue (P17, new ledger row):** legacy's POS void (MOrder.voidIt → invoice reverseCorrectIt) ALSO creates the invoice-vs-reversal allocation and re-tests the BP open item; `voidOrder` does not emit them and S12 does not compare allocations / bp — measured next as S12c (or closed by `voidOrder` calling `reverseInvoice` for paid/unpaid invoices).

### §64.4 DECISION RECORD F23 — Reverse-Correct of a shipment like legacy; the O2C cycle MATCHES end to end (2026-10-10)
**Evidence (`o2c4.log`):** O2C6-RC-SHIP legacy `RE/RE`, reversal line `137:−2`, books **430 Cr 540 / 742 Dr 540** (the original's facts with sides swapped, Doc_InOut.java:287-300 `updateReverseLine`), Euro 459, stock back (+2 ⇒ delta 0), costed qty back (0),
order line `2/2/0/0` (reservation restored). SQLite: no Reverse-Correct for a shipment outside the POS void.
**Changed (one commit, backtrack = `git revert <sha>`):** `scripts/erp_engine.js` NEW `reverseInOut` (MInOut.reverseCorrectIt :2714-2740 → reverse :2743-2880: reversal COMPLETED ⇒ storage, order-line rule; invoice lines lose the link :2812-2836) and NEW `_reversalInOutDocOps` = `voidOrder`'s shipment-reversal block
moved out VERBATIM (shared; S12/S12b still MATCH); the books come from the existing `deriveInOut` reversal path (F14) and costed qty from `costQtyUpdates`, unchanged. `cycle_o2c.js`: RC-SHIP host + a cycle NEGATIVE CONTROL (`§M3_O2C_NEGATIVE_CONTROL`: a second chain, SQLite invoice price +1¢,
must MATCH at SO and SHIP and differ at INV on lines, tax, total, books, open item). Harness defect found by that control (P17): two chains shared one id range in the scratch db and double-counted each other's documents — each chain now owns its range (`idBase`).
NEW `scripts/bridge/coverage.js` + `run_all.sh` prints `§COVERAGE` (models with scenarios N1 of the 34 dictionary doc tables, cycles covered K of M, windows identical X of 370) — no coverage claim without a denominator.
**Proof (`o2c7.log`):** `§SCN O2C1-SO … O2C6-RC-SHIP` **all MATCH** (9/9/12/13/13/9 keys: statuses, lines, quantities, tax, totals, shipment / invoice / payment / allocation / reversal books on BOTH schemas, stock, costed qty, BP open item) · `§M3_O2C_NEGATIVE_CONTROL PASS` · `M3_ONLY=S12` S12/S12b MATCH.
**Regression:** 99 engine witnesses vs the F22 run: identical except the 4 known-nondeterministic logs; exit codes identical.
**Residue:** accrual reversal (RA) and Void (VO) of an invoice/shipment, partial shipments / partial invoices, Generate Shipments/Invoices processes (selection-based), shipment confirmations, a taxed O2C chain (org 12) — not in this cycle; each is a separate step family when needed.

*Copyright (c) 2025-2026 Redhuan D. Oon. MIT Licensed.*
