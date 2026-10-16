/**
 * BIM OOTB — Frictionless BIM. Two DBs. One browser. Zero install.
 * Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com>
 * SPDX-License-Identifier: MIT
 */

# ⚠ DO NOT REMOVE — Scope guard
# Scope: Spatial ERP OOTB — Field Service / Facilities Maintenance vertical (7th vertical
#        on the same doc_engine.js + category_registry core as SpatialERP_POC.md's
#        Construction vertical). Browser-only. No server. No iDempiere dependency.
#        Requirement source: ~/Projects/Wilson/Meeting Summary - GrisLab.pdf
#        (SEI Asia / Wilson meeting, 2026-08-14)
# Read the log after every run. Exit code is not evidence.
# Spec-first: implement only what is described in a § section below.

---

# Spatial ERP OOTB — Field Service Vertical (GrisLab)

## Goal

Prove that a field-service business (plumbing / grease-trap / equipment
servicing) runs on the same Spatial ERP core already proven for Construction
(`prompts/SpatialERP_POC.md`) and live end-to-end for O2C
(`prompts/ERP_BUSINESS_CYCLE_E2E.md`, DO→Invoice PASS 2026-07-22) — with **no
new engine code**, only new adapters, handlers, and category_registry rows.

This vertical is the test of the framework's own claim (`docs/SpatialERP_OOTB.md`
line 58): "the same engine ... handles any domain where things have coordinates
and belong to documents." GrisLab has no BIM/IFC model — its "spatial" unit is
a customer site or a vehicle, not a building. This spec exists partly to prove
the core still holds when there's no 3D geometry underneath it at all.

**Requirement source:** SEI Asia / Wilson meeting summary, GrisLab, 2026-08-14 —
real prospect, real pain points, real next-action items (see §1).

**Success = one device, all roles: technician logs a job-complete photo from
the field (offline-capable) → back-office sees DO status without asking →
signed DO auto-triggers invoice generation → e-invoicing fields blocked at
intake if incomplete → fleet/equipment maintenance due dates surface without
a spreadsheet.**

---

## §0. What This Reuses — No New Engine Code

| Framework primitive | GrisLab pain it already solves | Evidence it's proven |
|---|---|---|
| `kernel_ops` offline append-only log | "Technicians/sales on separate WhatsApp chats, no central logging" | Already built, proven in BIM viewer (`docs/SpatialERP_OOTB.md` §5b) |
| `containers` / `items` / `category_registry` generic schema | "Manual Excel for scheduling, job tracking" — no new tables needed | "Adding a new domain = inserting rows here, not writing code" (`docs/SpatialERP_OOTB.md` line 422) |
| StateMachine + O2C fold (DO signed → Invoice) | "Unreturned signed DOs delay conversion to invoices, strains cash flow" — GrisLab's #1 stated pain | Live-verified: `prompts/ERP_BUSINESS_CYCLE_E2E.md` line 32, real `M_InOut` reaches op-log through real UI |
| Offline-first field capture (IndexedDB, sync on reconnect) | Field technician on a job site, intermittent connectivity | `docs/SpatialERP_OOTB.md` line 348 (farm-worker precedent) |
| Role band + field visibility filtering | Back-office/finance needing job-status visibility without chasing technicians | `docs/SpatialERP_OOTB.md` §6 (Sysnova confidential-field precedent, same mechanism) |

## §0b. What This Needs — New Adapters/Handlers Only

Per the Adapters/Handlers/Core split (`docs/SpatialERP_OOTB.md` line 548:
"Handlers are stateless plugins. Adapters are the UI skin."), none of the
following touch `kernel_ops`, `StateMachine`, or the table schema itself:

| Priority | Component | Type | Status today |
|---|---|---|---|
| **P0** | WhatsApp adapter — inbound photo/voice/update ingestion → `commitOp` | Adapter | Does not exist. Only WhatsApp reference in repo is an *outbound* share-link in `deploy/live/sitecam.js` |
| **P0** | Attachments via kernel_ops | Core (small) | Flagged as unbuilt in `docs/SpatialERP_OOTB.md` line 217 ("future: attachments via kernel_ops") — needed before job photos can commit |
| **P1** | E-invoicing (LHDN) validation guard | StateMachine transition guard | Not built. Blocks DO→Invoice transition unless TIN/reg-no/billing address present |
| **P1** | SQL Accounting export adapter | Adapter | Not built. Repo's journal is iDempiere-schema; SQL Account is a distinct 3rd-party target — export, not port |
| **P2** | AI triage handler (customer pre-qualification, booking, renewal reminders) | Handler | Not built. Start rule-based (keyword/field match), same pattern as existing P2P `MatchEngine` — no LLM dependency required for v1 |
| **P2** | Self-service scheduling adapter | Adapter | Not built. Same pattern as POS/restaurant self-order UI already scoped for the Retail/F&B verticals |

---

## §1. Requirement — GrisLab (from meeting summary)

### §1.1 Core business challenges identified

1. **Operational & sales disconnection** — technicians/sales on separate
   WhatsApp chats, no central logging, back-office lacks real-time job status.
2. **Manual bottlenecks & missing paperwork** — Excel-based scheduling/tracking,
   missed follow-ups, unreturned signed DOs delay invoicing, strains cash flow.
3. **E-invoicing data deficits** — SQL Accounting e-invoicing submissions fail
   because sales don't collect TIN/registration/billing address upfront.
4. **Internal asset & fleet oversights** — vehicle road tax, grease-trap
   servicing, machine maintenance tracked manually → last-minute disruptions.

### §1.2 Key solution requirements discussed

- Centralized WhatsApp + AI automation: job photos/updates/voice → central hub;
  AI pre-qualification, appointment booking, contract renewal reminders.
- Accounting & workflow integration: DO/job-photo upload → auto invoice
  generation in SQL Accounting; e-invoicing field capture at sales intake.
- Internal asset & field scheduling: automated calendar replacing spreadsheets
  for dispatch, leave tracking, road tax alerts, equipment maintenance.
- Self-service & membership: recurring clients/sub-contractors self-schedule;
  maintenance predictions from historical usage.

### §1.3 Stakeholders and roles

| Role | Responsibility | OOTB mode | OOTB scope |
|---|---|---|---|
| **TECH** (Field technician) | Job execution, photo/DO capture, voice notes | `operator` | Assigned jobs only |
| **SALES** | Customer intake, e-invoicing field collection, quoting | `operator` | Own leads/customers |
| **DISPATCH** | Job assignment, calendar, fleet scheduling | `full` | All jobs, all assets |
| **FINANCE** (back-office) | DO→Invoice conversion, AR, SQL Accounting sync | `full` | All documents, journal |
| **MGMT** | Approval authority, reporting | `full` | Everything |

### §1.4 Next action items (from meeting, still open)

- Map current workflows: operational steps, customer-intake field questions
  (pipe length, pipe size, site conditions), repetitive customer inquiries.
- Prepare data fields: full e-invoicing field set, vehicle/equipment
  maintenance schedules — needed before §3/§6 schema rows below can be finalized.
- System integration scoping: SEI Asia/Wilson to evaluate connector frameworks
  for SQL Accounting + WhatsApp + dispatch — this spec is that scoping output.

---

## §2. iDempiere-Equivalent Mapping — AD in SQLite

| Concept (GrisLab needs) | Browser equivalent |
|---|---|
| Job / work order | `documents` with `doc_type='FIELD_JOB'` |
| Delivery Order (signed) | `documents` with `doc_type='DO'`, same shape as O2C fold's `M_InOut` |
| Invoice | `documents` with `doc_type='INVOICE'`, journal auto-posts on DO complete |
| Customer intake record | `documents` with `doc_type='CUSTOMER_INTAKE'`, metadata carries e-invoicing fields |
| Vehicle / equipment asset | `containers` — category `VEHICLE` / `EQUIPMENT`, no building geometry needed |
| Maintenance event (road tax, servicing) | `items` under the asset container, `metadata.due_date` |
| Technician WhatsApp message | `kernel_ops` with `op_type='FIELD_UPDATE'`, written by the WhatsApp adapter |
| AI triage decision | `kernel_ops` with `op_type='AI_TRIAGE'`, written by the triage handler |
| DocStatus workflow | `doc_engine.js` StateMachine (unchanged) |

---

## §3. Schema — Same Tables, New Category Rows

**No new tables.** Same five data tables + registry as
`docs/SpatialERP_OOTB.md` §4 and `prompts/SpatialERP_POC.md` §3. GrisLab-specific
data lives in `metadata` JSON on existing rows, exactly as Construction's
land/FAR fields do.

```sql
-- §CAT_FIELDSERVICE — category_registry rows this vertical adds
INSERT INTO category_registry (category, domain, json_schema, actions) VALUES
  ('VEHICLE',   'fleet',        '{"plate":"","road_tax_due":"","last_service":""}', '["schedule_maint","log_usage"]'),
  ('EQUIPMENT', 'fleet',        '{"asset_tag":"","service_interval_days":0}',        '["schedule_maint","log_usage"]'),
  ('FIELD_JOB', 'field_service','{"customer_id":"","site_address":"","photos":[]}',  '["dispatch","complete","upload_photo"]'),
  ('CUSTOMER_INTAKE', 'field_service', '{"tin":"","reg_no":"","billing_address":""}', '["validate_einvoice"]');
```

No `containers`/`items`/`documents`/`journal`/`kernel_ops` column changes —
consistent with `docs/SpatialERP_OOTB.md` line 356 ("All domains share the
same schema. No domain-specific tables.").

---

## §4. State Machine — Job → DO → Invoice

The base 5-state machine (DRAFT → IN_PROGRESS → COMPLETED/VOIDED) is
unchanged. GrisLab's flow is domain-specific `sub_status`, same pattern as
Construction's FAR/APPROVAL/BOQ/NEGOTIATION sub-statuses (§5 of
`prompts/SpatialERP_POC.md`):

```
Job Created (DRAFT)
    ↓ dispatch
Dispatched (IN_PROGRESS — sub_status: DISPATCHED)
    ↓ tech_photo_upload (via WhatsApp adapter → kernel_ops)
In Progress (IN_PROGRESS — sub_status: ON_SITE)
    ↓ do_sign
DO Signed (IN_PROGRESS — sub_status: DO_SIGNED)
    ↓ einvoice_guard: block unless customer_intake.tin/reg_no/billing_address present
    ↓ invoice_generate
Invoiced (COMPLETED)
```

The `einvoice_guard` is the one **new** transition guard this vertical adds
to the StateMachine (transition guards are domain-specific by design — see
`docs/SpatialERP_OOTB.md` line 573: "Domain-specific rules live in transition
guards, not in the machine"). Everything else is the same DO→Invoice path
already live-verified in the O2C fold.

Fleet/equipment maintenance is a **separate, parallel** document type
(`doc_type='MAINT_DUE'`), not a state on the job — it's driven by
`items.metadata.due_date` compared against current date, same recurring-alert
pattern as any dated document, no new machinery.

---

## §5. Role-Based Field Visibility

Same mechanism as Construction's "Sales users shall NOT have visibility"
rule (`docs/SpatialERP_OOTB.md` §6) — UI filtering via `?mode=` +
`confidential_fields`, not server enforcement:

| Role | Sees job status | Sees customer intake | Sees fleet/maint | Can approve invoice |
|---|---|---|---|---|
| TECH | Assigned only | No | No | No |
| SALES | Own leads | Yes (own) | No | No |
| DISPATCH | All | Read | **Yes (edit)** | No |
| FINANCE | All | Read | Read | **Yes** |
| MGMT | All | Yes | Yes | Yes |

---

## §6. Build Priority

| Priority | Component | File | Depends on |
|---|---|---|---|
| **P0** | `category_registry` rows (§3) | seed script | Nothing — existing tables |
| **P0** | Attachments via kernel_ops (job photos) | `kernel_ops.js` | Nothing — currently unbuilt |
| **P0** | `einvoice_guard` transition guard | `doc_engine.js` | StateMachine (exists) |
| **P1** | WhatsApp adapter (inbound) | `adapters/whatsapp.js` | kernel_ops attachments |
| **P1** | SQL Accounting export adapter | `adapters/sql_accounting.js` | journal (exists) |
| **P2** | AI triage handler (rule-based v1) | `handlers/field_service.js` | Category registry |
| **P2** | Self-service scheduling adapter | `adapters/self_service.js` | Handlers |
| **P3** | Integration test (job→DO→invoice, e-invoice guard, fleet alert) | test file | All above |

**P0 must work headless** (no UI) with unit tests proving the e-invoice guard
blocks an incomplete customer intake and the DO→Invoice transition still
posts to journal correctly — same discipline as `prompts/SpatialERP_POC.md`
P0 requirement.

---

## §7. Open Questions (blocked on GrisLab, not on us)

Per §1.4 — these were the meeting's own named next-action items, not
invented gaps. Status as of the 2026-08-17 SEI Asia proposal (§8):

- ✅ RESOLVED — customer-intake field set: pipe diameter/length, grease trap
  capacity, kitchen layout photos. `FIELD_JOB` json_schema (§3) can use these.
- ✅ RESOLVED — e-invoicing fields: TIN, Company Registration Number,
  **SST ID** (not previously known), official billing address, contact
  details. `CUSTOMER_INTAKE` json_schema (§3) and `einvoice_guard` (§4)
  updated to include SST ID.
- ✅ RESOLVED — fleet/equipment maintenance categories: road tax, insurance,
  **Puspakom inspection** (vehicles); hydro-jetting machines, pump units,
  dosing canisters tracked by operating hours + service interval (equipment).
- ⛔ STILL OPEN, but narrower now (web research, 2026-08-17) — "SQL
  Accounting" is confirmed to be SQL Account (sql.com.my), the dominant
  Malaysian SME accounting platform ("trusted by 270,000+ Malaysian
  businesses"). It ships **native MyInvois/LHDN e-invoicing** as a first-party
  feature (1.4M TIN record database, direct MyInvois API call from inside
  the product) — meaning WE do not need to build LHDN submission logic
  ourselves; our job narrows to getting compliant invoice data (TIN/SST
  ID/reg-no/billing address — already in `CUSTOMER_INTAKE`, §3) INTO SQL
  Account, and its own product handles the MyInvois call from there. There
  is real prior art for this exact shape — third-party Malaysian vendors
  (e.g. Frontdesk Malaysia, "SQL Accounting API Integration... Auto-Sync
  Your Sales") already sync external systems into SQL Account via its API.
  Still open: which edition HHC/GrisLab runs and its exact API surface/
  credentials — but the SHAPE of the adapter is now known, not a guess.
- ⛔ LHDN vendor registration — also narrower now: this is a real, documented,
  self-serve process (IRBM publishes e-invoice API docs + a sandbox
  environment), not a mysterious closed door. Still real lead time, still
  not something engineering effort compresses, but not opaque either.
- ⛔ NEW — council compliance certificate formats (DBKL, MBPJ, MBSA, DOE).
  Named in the proposal as a deliverable (Module 4) but no actual template/
  format supplied — same category of gap as the SQL Accounting surface
  above: named by SEI Asia, not yet sourced.
- ⛔ NEW — LHDN MyInvois vendor registration/certification status. E-invoicing
  compliance in Malaysia requires the submitting system to be registered
  with LHDN, not just formatted correctly. Not mentioned in either proposal
  PDF. This is a compliance/business step, not something engineering can
  close by writing code.

---

## §8. Addendum — SEI Asia Full Proposal (2026-08-17)

**Context:** Wilson is SEI Asia's business-dev lead negotiating this deal
with GrisLab (HHC Industries Sdn. Bhd.) — he is not building this. Three
PDFs landed same-day: "Digital Transformation & Operations Modernization
Proposal" (the full 7-module scope), "Executive BI Staged Rollout Strategy"
(Module 7 detail — BI ships incrementally per phase, not as a final
milestone), and "HHC Industries Design Proposal" (a designed slide-deck
restating the same proposal — no new content). All three moved to
`~/Projects/Wilson/`. This section is a technical sanity-check of what
was promised, done before Wilson locks in scope/timeline with the client —
not a commitment to build any of it as written.

### §8.1 Confirms the vertical-fit read from §0/§0b

The proposal's own architecture diagram (Central Operations & CRM Engine →
Field Technicians / SQL Accounting → Executive BI Dashboard) maps cleanly
onto the Adapters/Handlers/Core split already scoped. Nothing here changes
§0's reuse claim: `kernel_ops`, the generic schema, and the O2C fold are
still the right foundation.

### §8.2 New scope NOT in the original meeting summary — real gaps, not schema rows

| Proposal item | What it actually requires | Fit with our framework |
|---|---|---|
| **~~Native iOS/Android mobile app~~** (Module 3, Phase 4) | ~~A separate native/cross-platform build + app-store distribution~~ | **DECIDED 2026-08-17 — REJECTED as a build, RECONCILED as language 2026-08-18.** No native app, no app-store build — Module 3 ships as the browser-only, zero-install Spatial ERP surface. Wilson's "cross-platform mobile app" wording in the client-facing deck is **not a spec conflict — it's layman-facing language describing the deliverable's experience**, which the installed PWA genuinely provides: `deploy/live/manifest.webmanifest` already declares `"display": "standalone"`, so once added to the home screen it opens with its own icon, its own window, no browser chrome — indistinguishable to GrisLab's staff from "an app on the phone." Internally: "cross-platform mobile app" = the installed PWA, not two native codebases. **One honest asymmetry to keep visible, not a reason to reverse this:** install is one-tap on Android (Chrome's install prompt) but more manual on iOS (Safari's Share → Add to Home Screen, no automatic prompt) — same functionality once installed, slightly different first-run friction by platform. |
| **Deposit payment gateways** (DuitNow/FPX/Card) | Real payment-processor integration (tokenization, webhook confirmation, reconciliation) | Not built anywhere in this repo. New adapter, non-trivial — payment failure/reconciliation edge cases are a different risk class than the rest of this vertical. |
| **GPS "Route Clumping"** (Module 2) | An actual geographic clustering/routing algorithm, not a schema row | Not a `category_registry` insert — this is new logic, closer to a proper handler with real complexity (distance matrix, clustering), not "add rows." |
| **Referral/Partner Incentive Engine + Credit Wallet** (Module 3) | New ledger concept: wallet balance, credit hold gating self-service bookings | Adjacent to but distinct from the O2C `journal` — a wallet needs its own balance/hold semantics, not just an AR view. |
| **Council compliance certs** (Module 4) | Government-specific formatted output (DBKL/MBPJ/MBSA/DOE) | Blocked on sourcing the actual formats (§7) — not an engineering gap, a missing-input gap. |

### §8.3 Timeline read (informational — not our call, Wilson's to negotiate)

The proposal's 14-week roadmap bundles all of §8.2 alongside the
already-scoped O2C/WhatsApp/fleet work. Native app + 2 payment gateways +
LHDN vendor certification + government cert formatting, on top of the
core CRM/dispatch/BI build, in 14 weeks, is aggressive — several of these
(LHDN registration, council cert sourcing) aren't compressible by adding
engineering effort, they're external/administrative lead time. Flagging
this for Wilson to weigh in the negotiation, not deciding it here.

### §8.4 What to pick off — recommended for this vertical spec right now

Stays IN (proven core + resolved fields, no new architecture):
- §6 P0/P1 items unchanged — `category_registry` seed (now with SST ID +
  Puspakom/hydro-jetting/dosing-canister categories), kernel_ops
  attachments, `einvoice_guard`, WhatsApp adapter, SQL Accounting export.

Decided:
- No native app. Customer/self-service surface is the framework's own
  browser-only, zero-install pattern (§8.2) — same `adapters/self_service.js`
  already named in §6 P2, no new mobile-app track needed.

Deferred pending an explicit decision (not silently absorbed into P0-P3):
- Payment gateway choice/scope — new adapter, not yet in §6.
- GPS route-clumping — new handler, not yet in §6.
- Referral/wallet ledger — new schema concept, not yet in §3.
- Council cert formats + LHDN registration — blocked on external input,
  not code.

---

## §9. Early-Win POC — Proving the No-DB-Server Claim Live

**Why this exists:** GrisLab is the first real commercial pressure-test of
the distributed-ERP relay doctrine (`docs/DistributedERP.md`) outside
internal POCs. Before committing to any 14-week build, the concept itself
— local-first signed ops, a *dumb* relay instead of an always-on DB server,
converging back to identical state — needs to be shown working end-to-end
in GrisLab's own domain. This is a small, fast, standalone deliverable,
not a slice of Phase 1.

**Scope — one chain, the exact one that resolves GrisLab's #1 stated pain
AND stress-tests the architecture's core claim in the same run:**

```
Technician device (offline-capable)
    → creates FIELD_JOB, uploads job photo, signs DO
    → commits signed ops locally to kernel_ops (IndexedDB) — works with zero connectivity

Reconnect → ops POST to erp_relay_server.js (`/push`)
    → the ONLY server involved: ~5KB sequencer, JSONL file, no DB process,
      idempotent by op_uuid (already witnessed: W-RELAY)

Back-office/FINANCE device → GET `/snapshot` → replays ops locally
    → sees DO status update without polling a database

DO signed → einvoice_guard checks fields (§4) → journal auto-posts
    → invoice appears in FINANCE view
```

**This proves, in one run, in GrisLab's own domain:**
1. Field capture works fully offline (technician's actual connectivity problem).
2. The relay is genuinely "dumb" — no business logic on the server, no
   always-on DB — matching the cost/architecture claim being pitched.
3. Multi-client convergence — technician device and back-office device reach
   identical state through the relay, not through a shared database.
4. The DO→Invoice pain point (meeting summary §1.2, GrisLab's stated #1
   issue) is solved by the same chain, not a separate feature.

**Success criteria — witness discipline, not a demo:** per this project's
standing rule (no screenshots as proof), success is `§`-tagged log lines
read after the run proving: (a) the technician's op committed while
offline, (b) the relay sequenced it idempotently on reconnect, (c) the
back-office device replayed to an identical state, (d) the journal posted
the correct debit/credit. A recording of it "looking like it works" is not
the evidence.

**Where this sits in the timeline:** before or parallel to Phase 1 of the
SEI Asia 14-week roadmap (§8.3) — independent of it. It de-risks two things
at once: proves the concept before Wilson commits further to the client,
and buys time to properly scope the genuinely-new items in §8.4 (payment
gateway, GPS routing, wallet ledger) without those blocking early momentum.

**Depends on:** §6 P0 items (kernel_ops attachments, einvoice_guard,
category_registry rows) — this POC is the first real exercise of that P0
work, not separate from it.

### §9.1 What this POC actually is, precisely stated

**Mechanism-proven vs. operationally-proven — a real distinction, not
hedging.** The relay mechanism itself already has synthetic witnesses:
`test_kernel_relay.js` proves two *simulated* clients converge through the
real `erp_relay_server.js` over actual HTTP (§RELAY-CONVERGE, §RELAY-
IDEMPOTENT, §RELAY-DURABLE); `poc_equivocation.js` proves attributable
equivocation detection; a synthetic 10,000-till benchmark (W-POS-WAN-SCALE)
exists. All three run as one script, one machine, simulated actors. **What
has never happened: a real technician's real phone and a real back-office
admin's real desktop — two different actual people, real field conditions,
real money on the other end.** That gap is what this POC closes. It is
therefore the Distributed ERP doctrine's **first true multi-user field
test**, not just a new vertical — a claim worth carrying explicitly into
how the pilot's results get weighed, not left implicit.

**Prior art — checked by web search 2026-08-17, not asserted from memory.**
Local-first, SQLite-in-the-browser software is a real, established,
named movement (Turso, sql.js/wa-sqlite, SQLite Sync's CRDT sync,
"local-first software" has its own Wikipedia entry) — the *category* is
not ours alone, and this spec should never imply otherwise. Two targeted
searches — for local-first ERP with a signed op-log, and for WhatsApp/
email used as the actual relay transport for a backend-less field-service
app — surfaced nothing matching that specific combination. That is a
**"nothing found on record" finding, not a "we are first in the world"
claim** — a search can't prove a negative, and an undocumented internal
tool elsewhere would not show up. Stated precisely: no prior art on record
for this composition (signed op-log + dumb relay + an existing social
channel as the transport + ERP semantics), which is meaningfully different
from claiming uniqueness.

**The prospect is real, and corroborates the meeting summary's own pain
points.** HHC Industries Sdn. Bhd. (reg. 1315330H, founded 2019, Selangor)
is a real, established grease-trap/oil-separator company — "founded by
seasoned professionals with over 50 years of combined industry experience,"
described as a "rapidly expanding" operator serving all of Peninsular
Malaysia. Its own public website lists **three separate WhatsApp numbers**
as the customer contact method (no shared inbox, no routing) — first-party
evidence, not an assumption, that the "decentralized WhatsApp threads"
pain point named in the meeting summary (`prompts/SPATIAL_ERP_FIELD_SERVICE_GRISLAB.md`
§1.1) is real and currently live on their own storefront, not a
hypothetical framed for the pitch.

---

## §10. PWA Security & Relay Security

### §10.1 What the architecture already provides — cited, not asserted

| Property | Mechanism | Source |
|---|---|---|
| Transport encryption | Service Worker registration is a browser-enforced secure-context requirement (HTTPS or localhost) — not optional, not something we build | web-platform standard; both current hosts (GitHub Pages, OCI) already serve HTTPS |
| Content integrity | Every op is **signed** (W-SIGN) and the log is **hash-chained** (W-CHAIN) — a forged op fails signature verification wherever it's replayed; an altered entry breaks the chain at exactly that op | `docs/DistributedERP.md` lines 108, 292 — `verifyChain()`, live in `kernel_ops.js` |
| Untrusted-pipe design | The relay is *meant* to carry unverified content — "the container is untrusted by design; only signed content verifies" | `docs/DistributedERP.md` line 288 |
| Relay dishonesty is attributable | A relay handing different clients different histories (equivocation) is detectable via signed period-tip gossip, not just theoretically preventable | `docs/DistributedERP.md` — `poc_equivocation.js`, §RELAY equivocation table |

**Verified directly (2026-08-19, per the "verify before load-bearing" rule) —
`build/erp/erp_relay_server.js`:** `_accept()` (lines 42–55) does dedup-by-
`op_uuid` and durable append, nothing else — no signature check, no content
validation, confirming "no validation, no folding, no rule eval" is accurate,
not aspirational. This is correct **by design** per §10.1's untrusted-pipe
principle — a compromised relay still can't forge state that passes
client-side verification.

### §10.2 What is a real, current gap — not built yet, needed before a live pilot

Also verified directly against the same file, same read:

- **No access control on the relay** (`erp_relay_server.js` lines 58–59):
  `Access-Control-Allow-Origin: *`, no bearer token, no API key — `/push`
  (lines 74–83) accepts a POST from anyone who can reach the URL. Forged
  ops still can't pass client-side verification (§10.1) — but an
  unauthenticated endpoint can be **spammed/flooded** (storage exhaustion,
  denial-of-service) by anyone who finds it. Needs, at minimum, a shared
  secret on `/push` before this is pointed at the public internet for
  GrisLab — small, not yet built.
- **Plain HTTP in the script itself** — `http.createServer`, not
  `https.createServer` (line 26). TLS has to be terminated by whatever
  hosts it (reverse proxy / platform), not by this script alone.
- **Signing-key custody is the real root of trust, and it now lives on
  every technician's phone**, not one hardened server. A phone lost
  *unlocked*, with its keys extractable, lets whoever holds it sign as
  that technician until the key is revoked — a genuine operational-security
  question (device lock policy, key rotation on loss), not something the
  crypto model solves by itself. The doctrine's own honest admission
  applies directly: a key-holder's lie "must be told consistently across
  all books → caught at the count... not crypto's job — accounting's"
  (`docs/DistributedERP.md` line 325).
- **Browser storage isn't encrypted at the app level.** IndexedDB/OPFS data
  at rest relies on the device's own OS-level disk encryption (assuming
  the device is locked) — we don't add a further encryption layer today.

### §10.3 Is this better and lower-cost than conventional client-server security?

**Not an unqualified yes — the honest verdict is that it trades one cost
for a different one, and is genuinely better on the specific properties
that matter most here.**

**Structurally cheaper, for real:**
- No single "crown jewel" to protect. A conventional model concentrates
  all risk on one node — breach the server/DB credentials, get everything,
  for every customer, often silently. Compromising the relay here gets an
  attacker a relay that's explicitly untrusted by design (§10.1) — it
  can't forge signed content, and equivocation is attributable. There's no
  equivalent "pop this one thing, own everything quietly" node.
- Tamper-evidence is free, not a bolt-on. A malicious `UPDATE` on a
  conventional server DB is often invisible unless audit logging was
  separately engineered. Here it's detectable by construction
  (`verifyChain()`) at zero extra cost — it's how the storage model works,
  not a feature someone had to remember to add.

**Not cheaper — a real, different cost, not a smaller one:**
- The security burden moves from one server to every device. Financial-
  grade signing keys now live on each technician's phone, not behind one
  hardened perimeter. Fleet device hygiene (screen-lock enforcement, key
  revocation on loss, OS patching) becomes load-bearing in a way it isn't
  for a thin client hitting a server — genuinely more operational overhead
  for a small business with no existing MDM practice, not less.
- We have to build the access-control layer a conventional server stack
  gives you almost for free. "Add an API-key check" is a one-line,
  well-trodden pattern in any server framework; the relay currently has
  none at all (§10.2) — it must be added deliberately, it isn't inherited.

**Net:** yes, structurally better and cheaper on tamper-evidence and on
having no single silent-breach point — that's a real, citeable property
(W-CHAIN/W-SIGN), not a sales claim. But "no server to breach" does not
mean "less security work" — it means the work moves from "harden one
server" to "harden N devices' key custody + the relay's access control,"
and the second half of that (§10.2) is a real, currently-unbuilt gap for
GrisLab, not a solved problem riding on the architecture for free.

### §10.4 Insider threats — trust vs. authentication, a different problem

Everything in §10.1–§10.3 is about keeping *untrusted* actors out. This is
about a *legitimate* key-holder doing something wrong — no relay access
control touches this; the doctrine says so directly: **"the lie must be
told consistently across all books → caught at the count... not crypto's
job — accounting's"** (`docs/DistributedERP.md` line 325).

1. **A technician signs a DO for work not actually done.** Attributable
   (provably, non-repudiably that key), not preventable — same exposure a
   conventional cloud CRM has, not a regression. Real defense: GPS-
   timestamped photos + customer signature (already in Wilson's own
   proposal), plus periodic spot-checks. An accounting control, not a
   crypto one.
2. **Shared devices collapse attribution entirely.** One phone rotated
   across a crew means the signature means "whoever held the phone," not
   "this person." **Hard requirement: one signing key per person, never
   per team or shift** — free to get right, easy to get wrong by accident.
3. **A malicious admin still can't rewrite history — a real structural
   win, not a caveat.** `kernel_ops` is append-only; even bad-faith admin
   action is a new signed, hash-chained entry (a void, a correction), not
   a silent edit. A conventional DB's `UPDATE`/`DELETE` leaves no trace
   unless audit logging was separately built; here the trail is
   unavoidable by construction.
4. **Role enforcement today is UI convenience, not a real boundary — the
   one open gap worth closing.** §5 already states this: role filtering is
   `?mode=` display logic, "not server enforcement... convenience, not
   security." It's weaker for *doing* than *seeing* — nothing stops a
   technician's key from signing an op their role shouldn't be allowed to
   commit at all (e.g. a credit-release approval). Fix, reusing rather
   than inventing: extend the public-key allowlist (relay access control,
   above) to be **scoped per `op_type`**, checked at fold time on *every*
   client, not just admission to the relay — "is this key authorized for
   *this* action," not just "is this key known." Same untrusted-relay
   design; the check just moves to where trust actually lives — the
   client doing the replay.
5. **"Any client can fold everything" cuts against confidentiality, not
   just for it.** The admin desktop holding the full dataset locally,
   by design, is a bigger walk-out-the-door risk than a conventional model
   where only the server holds everything and every query is logged/
   rate-limited — copying a local `.db` is easier than exfiltrating from a
   metered API. Real, unsolved here: the mitigation is scoping what the
   admin's fold actually needs rather than defaulting to literally
   everything — flagged as an open design question, not resolved by
   anything built so far.

### §10.5 Daily digest-to-Gmail backup — design recommendation

**Not a new mechanism — the same §2b pattern (email as a durable, user-
owned, append-only, tamper-evident log), applied fleet-wide instead of
per-customer.** Concrete recommendation:

- **Content: the raw signed, hash-chained op-log slice for the day, not a
  folded summary number.** A snapshot like "AR balance: RM 4,120" is small
  and readable but throws away exactly the property that makes this
  useful — nobody receiving just a number can run `verifyChain()` against
  it later. The raw ops (signatures + hash-chain links intact) let anyone
  holding the backup independently verify tamper-freedom, not just trust
  that a number was correct on the day it was sent. Given this domain's
  real volume (a small field-service fleet, dozens to low hundreds of ops/
  day), this stays genuinely small — gzip it, matching this project's
  existing OCI convention (gzip + content-encoding) rather than inventing
  a new compression choice.
- **Run it on the relay, not the admin's browser tab.** The relay already
  holds the full canonical ordered log (`/snapshot`) and is the one
  persistent Node process in this architecture — a scheduled "zip + email
  today's new ops" job is a small, natural addition to
  `erp_relay_server.js` itself. A browser-based client has no reliable
  OS-level daily scheduler; forcing this through Background Sync would be
  a worse fit for a job this simple.
- **Custody of the backup account is the whole ballgame for the fraud-
  deterrence half of this.** If the same admin who could commit or approve
  fraud also holds the backup Gmail credentials, "independent copy" isn't
  independent — they can also suppress or edit it. The account needs to be
  held by someone outside day-to-day operational access (owner/director
  level), the same segregation-of-duties principle conventional accounting
  already runs on. Cheap to get right, easy to silently get wrong.
- **The absence of a digest is a real signal — conditionally.** Stopping
  the scheduled send, or deleting it at the backup end, is itself a
  conspicuous act once the cadence is expected — but only if something
  actually *notices* a missing day. Needs a cheap watchdog (a rule
  flagging "no digest arrived today"), not just the backup's existence —
  same "someone has to do the count" principle as §10.4 point 1, applied
  to this mechanism specifically.
- **Scope, stated precisely: this hardens against altering a *recorded*
  transaction. It does nothing against a transaction that's never recorded
  at all** — a technician doing a cash job and simply not logging it. That
  is likely the *more common* fraud vector in a small cash-adjacent field-
  service business, and no log-integrity design touches it — it's the same
  operational-control category as §10.4 point 1, not a gap unique to this
  backup idea.

**Verdict:** genuinely strong, low-overhead disaster recovery — an
independent, off-premises second recovery path on top of the
device-log-rebuild property already established (`docs/MigrateComparisonPaper.md`,
"total relay loss, no backup... rebuilds to the cent"). Real, not
"good enough," for the specific fraud class of *tampering what's already
recorded* — conditional on backup-account segregation and someone actually
watching for silence. Not a general fraud-prevention claim; off-book,
never-recorded transactions remain outside anything this design touches.

---

# 2026-08-17 — Spec drafted

Requirement source read: `~/Projects/Wilson/Meeting Summary - GrisLab.pdf`
(moved there this session). Spec written before any implementation, per
Spec-First rule. §0/§0b reuse-vs-new split verified against actual repo
state (grepped for whatsapp/e-invoic/lhdn/fleet — confirmed no prior
build in any of those areas beyond the outbound WhatsApp share-link in
`sitecam.js`). No code written yet. Next: user go-ahead on which P0 item
to implement first (§6).

# 2026-08-17 (later) — Addendum from 3 SEI Asia proposal PDFs

Wilson (SEI Asia biz-dev, negotiating with GrisLab — not the dev lead)
dropped 3 PDFs same-day, moved to `~/Projects/Wilson/`. Reviewed for what
to pick off vs what needs a call before it's promised further: resolved
3 of 4 §7 open questions with real field data (§7), found 2 new ones
(SQL Accounting surface still vague, LHDN registration unmentioned), and
named 5 scope items in the proposal that are real new builds, not schema
rows — most notably a native mobile app that conflicts with the framework's
own zero-install doctrine (§8.2). No code written. Nothing in §8.4's
"deferred" list should be scheduled without an explicit go — this is a
sales proposal from a non-dev partner, not an accepted engineering scope.

# 2026-08-17 (evening) — §9 added: early-win POC, multi-user framing, web-checked prior art

Native mobile app question DECIDED — rejected (§8.2), the browser-only
zero-install surface ships instead, no call left open. Added §9: the
early-win POC chaining offline technician capture -> `erp_relay_server.js`
-> back-office convergence -> DO-to-invoice auto-post, scoped to run before/
parallel to Phase 1, scored by `§`-tagged log evidence per this project's
witness discipline, not a screenshot demo. Explored WhatsApp/Gmail-as-relay
(reusing the already-witnessed `poc_oplog_clipboard.js` social-channel-is-
the-relay pattern) as a lower-cost variant, plus the Web Share Target API
as the correct on-device pickup mechanism (native OS share sheet, not a
WhatsApp API, not a background-listener hack) -- `deploy/live/manifest.webmanifest`
already exists as real groundwork, just missing `share_target`.

§9.1 added on request: (a) mechanism-proven (3 synthetic witnesses named)
vs. operationally-proven (never, until this pilot) -- GrisLab is the
doctrine's first true multi-user field test, stated explicitly rather than
left implicit; (b) prior art checked by actual web search, not recalled --
local-first/SQLite-WASM is a real named movement (Turso, sql.js, SQLite
Sync), but no prior art found for this specific composition (signed op-log
+ social-channel-as-relay + ERP semantics) -- stated as "nothing found on
record," never as "we are first in the world," since a search cannot prove
a negative; (c) HHC Industries Sdn. Bhd. confirmed real via web search
(reg. 1315330H, founded 2019, Selangor, "50 years combined experience") --
its own public website lists three separate WhatsApp numbers as the
customer contact method, first-party evidence the meeting summary's
"decentralized WhatsApp" pain point is real, not just pitch framing.

§7's SQL Accounting question narrowed (not closed) by the same search:
SQL Account (sql.com.my) ships native MyInvois/LHDN e-invoicing itself, so
our adapter's job is getting compliant data INTO SQL Account, not building
LHDN submission logic -- real third-party prior art exists for that exact
sync shape (Frontdesk Malaysia). LHDN vendor registration confirmed to be
a real, documented, self-serve process (IRBM docs + sandbox), not opaque --
still real lead time, just not a mystery. Still open: which SQL Account
edition HHC/GrisLab actually runs and its exact API surface/credentials.

Deployed the GrisLab Proof Run client-facing page (phone mockups, human
avatars, relay-node visual) to GitHub Pages as a standalone, additive page
-- live at https://red1oon.github.io/BIMCompiler/grislab_proof_run.html.
Source-of-truth copy on branch `docs/grislab-proof-run`; the direct
gh-pages push was necessary because `master` is currently thin relative to
live gh-pages (unrelated pre-existing drift, several live pages missing
from master -- flagged, not fixed, out of this session's scope). No other
live page touched or shrunk; canaries verified 200 post-deploy.

# 2026-08-19 -- §8.2 native-app language reconciled, §10 security spec added

§8.2's native-app row updated: not a spec conflict after all -- Wilson's
"cross-platform mobile app" wording in the client deck is layman-facing,
describing the experience the installed PWA already delivers
(`manifest.webmanifest`'s `"display": "standalone"` -- own icon, own
window, no browser chrome). Internally still the zero-install PWA, not a
native build. One asymmetry kept visible: Android gets a one-tap install
prompt, iOS needs manual Share -> Add to Home Screen -- not a reason to
revisit the decision, just a real first-run difference.

Added §10 (PWA + relay security spec) on request. Verified directly against
`build/erp/erp_relay_server.js` before writing any claim (per the
"verify before load-bearing" rule): confirmed no signature check / no
validation in `_accept()` (by design, per the untrusted-pipe principle,
`docs/DistributedERP.md` line 288) but ALSO confirmed a real gap -- zero
access control (`Access-Control-Allow-Origin: *`, no token) and plain HTTP
in the script itself. Both stated precisely, not glossed over.

Answered "is this lower-cost than conventional client-server security" as
a real trade, not a yes/no: cheaper on tamper-evidence and no single
silent-breach point (free, structural, cited to W-CHAIN/W-SIGN) -- but not
cheaper overall, since the burden shifts to per-device key custody + a
relay access-control layer that doesn't exist yet (§10.2), which a
boilerplate server stack would have had by convention. No code written.
