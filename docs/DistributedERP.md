# Distributed ERP — Contention Map & Guards
*[← Back to the **User Guide**](USER_GUIDE.md) · [Home](index.md)*


> **New here?** Two short on-ramps before the full doctrine:
> - **[Migrate & Compare (ERP)](MigrateComparisonPaper.md)** — the one-page evaluator, with the "where's the server?" map at a glance.
> - **[Two messages a day](RetailScaleStory.html)** — the same idea told for a shop owner: 10,000 tills, books to the penny, animated.
>
> This page is the complete argument and the adversarial edge cases. The guards described here are benchmarked at fleet scale in **POS WAN-Scale** (`W-POS-WAN-SCALE`).

## In one minute

"Serverless" usually means *the server is still there — you just can't see it.* You inherit all the complexity of a distributed system and lose the ability to watch it. That is not what this document means.

Here, **serverless means there is no server that *owns the truth*.** The model is **git**: every clone holds the whole history, can verify it, and can rebuild from it. GitHub is a convenience, not the source of truth. This project does the same thing for ERP transactions — and for BIM geometry — under one signed, append-only log.

The claim that makes it work is small but load-bearing:

> **A fact is a sum over a signed list of events — never a number you store and guard.**

`QtyOnHand` is not a cell you overwrite; it is the sum of stock movements, the same way a bank balance is the sum of journal entries. Once you stop storing the number and start *deriving* it, most of the "hard distributed-systems problem" simply disappears — because the contention you were fighting was something the storage design invented.

What's left after that move is small and bounded:

- **~90% of ERP** has a single owner (one rep owns an order, one worker owns a pick). No concurrency at all.
- **~10%** is the "100 branches roll up to head office" case — a once-a-day, one-direction pipeline, not live multi-master sync.
- **One** genuinely real-time case remains: a single thing claimed in two places at once (a loyalty prize, a credit balance). That is *one operation class*, not a property of the whole system.

None of it needs a fat, always-on server.

---

## Why the instinct is disbelief

The honest first reaction to this document is skepticism — *ERP without a server sounds like a category error.* That reaction is worth naming, because it's the whole point: everyone "knows" an ERP needs a fat, always-on server, so a serverless one reads as impossible until the model shifts. The disbelief comes from a **mental model**, not a missing feature.

Two things make it real now, and only now:

- **The browser quietly became able to hold the whole engine.** None of the underlying pieces is new on its own — the doc is scrupulous about that (§10: SQLite-in-WASM dates to 2012, official WASM/OPFS to 2022; local-first, op-logs, hash-chains are all prior art). What is recent is the *assembly*: `sql.js` (SQLite-in-WASM) running in-memory, durability carried by the **signed log** rather than the database file (OPFS/IndexedDB serve only as an optional local-cache speed-up, where the host's headers allow it), plus PWA install, Web Crypto for signing and hash-chaining, and `BarcodeDetector` for the scan-is-the-op gesture — all dependable enough *in the same tab, at once* to run an entire ERP **and** a BIM kernel with no backend. For this project the decisive event is concrete: **the browser port landed in April 2026.** Before that, this argument was a thesis; after it, it runs.

> **The dated timeline** — exactly when each enabling technology landed, the *one* that was the genuine near-miss (three.js `BatchedMesh.addInstance`, r166, 2 Jul 2024), how the 2024–2026 SQLite/Turso ferment is **routed around** rather than depended on, and what an LLM got *wrong* when asked to harvest those dates — is kept in the **[Enabling-Tech Timeline](EnablingTechTimeline.md)** (see [The Turso / core-SQLite ferment](EnablingTechTimeline.md#the-turso-core-sqlite-ferment-20242026-parallel-mostly-routed-around)), to keep this architecture doc free of version-by-version detail.

- **The unlock is conceptual, not hardware.** *A fact is a fold; delete the stored scalar.* Once a quantity is derived from a signed, append-only log instead of guarded in a mutable cell, the contention you were fighting turns out to be something the storage design invented — and the always-on server you were defending turns out to have been optional all along. That is why the git analogy lands: no central machine owns your code history, yet every clone can verify and rebuild it. This does the same for ERP transactions and BIM geometry.

So the skepticism is the correct starting point. The rest of this document is the work of converting it — claim by claim, each with a witness and an honest residual.

---

## How to read this document

- **§0** is the foundation: the one root idea and the four working truths everything else falls out of.
- **§1–§3** show the reframe in action: why most ERP isn't a concurrency problem, and a normal multi-till day end to end.
- **§4–§8** are the mechanics: the guard set, the one real-time case, how little central infrastructure is actually needed, and why accounting is the reconciliation engine.
- **§9** is the adversarial suite — every edge case, the witness that proves it, and the *honest* residual that remains.
- **§10–§15** place the work against related systems, blockchain, and the streaming/recovery/custody extensions.

Companion docs: ERP.md §0.20 (the secured/durable phase) and [LocalFirstPriorArt.md](LocalFirstPriorArt.md) (how this compares to related systems). This is a SPEC, 2026-05-31 (consolidated revision). Every scenario below was worked against the residuals in §8, which the ledger reconciles.

---

## 0. The two truths — and the root beneath them

This document is the *mechanics*. None of it is assumed; all of it was derived. Each section below is one truth at work.

### The root truth

**A fact is a fold over a signed sequence — never a stored, guarded scalar.**

`QtyOnHand` is not a cell you mutate. It is the sum (`Σ`) of movements (`M_Transaction`), exactly as a trial balance is the sum of journal entries. The authoritative number is **derived**, never held.

The moment you model a derived quantity as a shared, mutable cell — `UPDATE qty = qty - 1` — you *invent* the contention you then have to solve. Delete the cell, keep the sum, and the contention was never real.

### The four working truths

From that root come four working truths (candidate mantras; wording for `CLAUDE.md` is pending ratification, §11):

**1. Deterministic. Non-invent. Extract.** *(computation)*
State is a pure function of the recorded, ordered inputs. Nothing is computed that can't be replayed. This is what makes *who holds the data* irrelevant: any replica replays to the same number. (This is the existing prime directive — here it acts as *infrastructure*, §7.)

**2. Not real-time — business-time.** *(cadence)*
The sum reconciles at the cadence the business actually runs: close-of-day, overnight, next-day — not microseconds. The business sets the clock, not the system. Real-time is the *degenerate case* (the one indivisible operation class, §5), reserved for when the business genuinely demands instant.

**3. Secure the fact, not the container.** *(trust)*
A fact signed at its point of origin is authentic *anywhere*, so it needs no trusted store. Durability attaches to something the user already keeps — their email or social account (§5.2b). The "back up the backup of the backup…" regress *terminates*, because every durable thing is either the user's own existing channel or rebuildable from self-securing facts.

**4. The system can't prevent — only witness.** *(the floor)*
Fraud and overspend are **not solvable** (a CAP partition; the offline witness; the bearer token; the lying insider — these are impossibilities, not bugs). Every system that claims to "solve" fraud is quietly doing record-and-consequence and charging you for the costume. So we don't pay to prevent the unpreventable. We **witness** it cheaply (a signed chain), **record** it permanently (the ledger), and **consequence** it (blacklist, receivable). *We reduced the cost of a non-solution.*

### Two keystones bind them

- **Determinism earns business-time.** Because each site is deterministically exact *locally*, deferring the *global* sum to close-of-day loses nothing — the total is identical whenever you compute it. (Truth 1 makes Truth 2 safe.)
- **Self-securing facts terminate the regress.** Determinism makes a fact's *value* portable; signing makes its *authenticity* portable. So a fact can live anywhere durable, and no server of record is needed. (Truths 1 + 3.)

### From server to serverless — what moved where

"Serverless" is **not** "no machine ever talks to another." It is **no server of record** — no machine that *owns the truth*. Every job a classic ERP server used to do still happens. Each one just moved off the server onto one of four things: the **signed log**, the **deterministic kernel running on each client**, the **user's own channel**, or a **dumb facilitator** that owns nothing.

Here is the full mapping, each line with its proof:

| What a server used to do | Now done — without a server of record | Proof |
|---|---|---|
| Hold the authoritative state | the **signed op-log**; state = its deterministic *fold*, recomputable by anyone | §0 root · `poc_distributed.js` |
| Mint record IDs (DocNo) | **edge-minted UUID** recorded as an op input — unique without coordination (G-IDENTITY) | `poc_distributed.js` (no clash) |
| Run business logic / validate | the **deterministic kernel on every client** — same verbs both sides, no server re-run | `erp_kernel.js` (replay-hash) |
| Merge concurrent edits | **union signed logs → total-order → replay** → identical state everywhere | `poc_distributed.js` |
| Prevent conflicts / double-write | **owner-gate** (G-SINGLE-WRITER) + **CAS** for the one op-class — enforced on replay | `poc_distributed.js` |
| Detect tampering | the log **hash-chains itself**; `verifyChain()` finds the altered op | `poc_chain.js` · live `kernel_ops.js` |
| Authenticate / authorise | **edge signature** (W-SIGN) — wrong key fails anywhere; holder can present, not forge | `poc_sign.js` |
| Durably store / back up | the **user's own email/social** + export; the local copy is disposable | `poc_persist.js` |
| Sequence multi-party order | a **dumb facilitator** (accept + order + persist + relay), daily — itself rebuildable from signed logs | §6 |
| Reconcile discrepancies | the **ledger** (double-entry, 1494) — the fact is a fold here too | §8 |
| Be always-on | **nothing** — work offline; sync at business-time | Truth 2 |

**The analogy that grounds it: git.** No central machine owns your code history — every clone holds all of it, can verify it, can rebuild from it. GitHub is a *convenience*, not the truth: lose it and you push to a new host from any clone, having lost nothing. Commits are **hash-chained** (= W-CHAIN) and can be **signed** (= W-SIGN). Git is a serverless-*of-record* distributed system that millions use daily.

**This project does to ERP transactions what git did to source code:** the log is the truth, the host is disposable, history is chained and signable. The one thing git lacks that we add — *invariant enforcement* (no double-spend) — is the owner-gate plus the single CAS operation class. Everything else, git already proves is possible.

**Measured witness:** DepreciationPerf.md puts numbers on this mapping using a real iDempiere batch (40-year asset depreciation): where the server's ~20 minutes actually goes (per-row `saveEx` = ~1M round-trips, *not* the maths), a four-tier comparison, and the honest counter-hype — *most* of the speedup is a server-side SQL rewrite; SQLite-WASM's real edge is **no server + local reads**, not raw throughput.

The rest of this document is these truths meeting concrete scenarios: the normal multi-POS day (§3), the adversarial edges (§9), and the comparison to related systems (§10).

---

## 1. The 90/10 reframe

- **~90% of ERP is single-writer / owned.** A sales order belongs to a rep, a PO to a buyer, a pick to a worker. There is no concurrency challenge at all — real businesses *dispatch* work to exactly one person.
- **~10% is the "100 branches → central" case** — and it is **not** multi-master concurrency. It is a **one-way circle**: branches → central (sales and orders flow up) → `QtyOnHand` and replenishment computed → branches (stock and POS flow down). Overnight, directed. An op-log handles this natively as **deterministic fan-in → deterministic fan-out**: push the branch logs up, total-order and replay them to exact state, derive replenishment ops, push them down. No conflict resolution.
- **The only genuine all-round-sync need** is a single, indivisible thing claimed in real time across sites — for example a loyalty prize claimed at two branches on the same day. That is **one operation class** (§5), not a property of the whole system.

---

## 2. Physics partitions the data — the granularity ladder

Contention over goods isn't solved by an algorithm. It's solved by **atoms having a location.** Single-writer is enforced by the physical world at every level of granularity:

| Granularity | Owner | Why there's no contention |
|---|---|---|
| **Branch** | the shop | a shop's stock is physically *in that shop* (`M_StorageOnHand` per `M_Locator`/`Org`) — another branch cannot ship it |
| **Van** (DSD / van-sales) | the salesperson | each van is loaded at the depot in the morning (fan-out); its stock is physically the salesperson's |
| **Box-in-hand** | whoever holds it | **you cannot scan a box that isn't physically there** — the scan *is* proof of possession and the commit; two people can't scan the same physical unit |

**Cadence matches physics.** Goods move next-day at the fastest, so the data only needs **daily** consistency. Real-time global inventory sync solves a problem physics doesn't pose: you can't get a unit from another branch faster than a transfer anyway. Overnight batch is therefore the *correct* cadence, not a tolerated limitation — the book catches up with the atoms at the rate the atoms travel.

**The scan is the operation.** `SCAN(unit_SSCC → customer, qty, ts)` — the barcode/SSCC is the unit's natural **UUID** (a global identity handed out by GS1; foreign keys reference it). Scan data is captured as an *input* to the op, never recomputed, so replay stays deterministic.

---

## 3. Normal operation — a multi-POS day, end to end

Edge cases (§9) are the minority. The **common** case is handled natively by single-writer-by-physics (§2), deterministic backflush, and the one-way circle — with no special machinery. Here is a real day:

**One till, one shop (the 90%).** A sale is one op — `SELL(item, qty, ts)` — committed locally, with the projection updating at 0ms. Component consumption is **backflushed**: the BOM recipe is exploded *deterministically* (`SELL burger → −1 bun, −1 patty, …`), never recorded line by line. `QtyOnHand` is the sum over `M_Transaction`. Entirely offline-capable — the device is the whole system.
*(Backflush **is** deterministic replay of the recipe — the same BOM verb that compiles a building, run at the point of sale. Truth 1.)*

**Two tills, one shop.** Each till owns its own sales. Two sales are appends to disjoint positions, so the logs **union trivially**, and `OnHand` is the sum of both — no contention (*the fact is a fold, not a scalar*). The *one* contended case — two tills racing for the genuine last unit — is a **local-LAN single-writer** decision (sub-millisecond, §9-D), not a distributed problem.

**Multi-branch (the 10% — the one-way circle).** Branches sell all day against their own physical stock (provisional, local, instant). **Close-of-day:** each branch pushes its signed log up to the dumb post office (§6), which assigns a total order and persists it. **Overnight:** deterministic replay → exact consolidated state → derive replenishment ops (reorder where below minimum) → fan out downward. **Next day:** receipts restock the branch locator and selling resumes. Directed, daily — no multi-master, no conflict resolution.
*(Truth 2 — the replenishment fact is **produced after** the day's sales reconcile; it cannot exist any sooner.)*

**Van / DSD.** Loaded at the depot in the morning (fan-out); its stock is physically the salesperson's (single-writer by possession). Each `SCAN(SSCC → customer)` is the commit op (you can't scan a box you don't hold); settlement at end of day reconciles the van.

In every normal flow the pattern is identical: **append a signed op where you physically stand; the sum computes the number; reconcile at business cadence.** Nobody writes a shared scalar, nothing blocks on the network, and the post office only sequences and relays. The edges in §9 are exactly the residue this leaves — bounded, named, and ledger-backed.

> **Worked examples — the Lens Family.** This doctrine made concrete, extracted from my iDempiere + Unicenta POS plus plugins and ported to browser lenses over the one model: POS (in-person sale) · WMS / Logistics / Robots (movement) · Social Platform (on-the-move) · Credit Ledger (receivables) · Workforce (attendance/tasks) · Guaranteed Channels (transport/payment pipes). Hub: **LensFamily**. One source act, the rest a fold, no central control — a business run from a phone. These are the smallest complete proofs of the doctrine above.

---

## 4. The fundamental guard set

These are the invariants the system enforces so that, for the common case, contention is structurally impossible:

| Guard | Invariant | What it kills |
|---|---|---|
| **G-IDENTITY** | every entity = a global UUID primary key (edge-minted, recorded as an op input); FKs → UUID; the human-readable handle is `user/date/doc/#` per *device* (gapless in its own namespace, unique without coordination) | PackIn/merge clashes; centralised DocNo allocation |
| **G-EXCLUSIVE-DISPATCH** | a work item is delivered to **exactly one** writer (a queue, not a broadcast) | two clients ever receiving the same order |
| **G-SINGLE-WRITER** | at any instant **≤1 owner** (a device/session, not a human) may emit mutating ops on an entity; others are read-only; non-owner ops are rejected on replay | concurrent writes to one document |
| **G-RESERVATION** | consuming a shared pool requires a lease granted **at dispatch** (online); offline work stays inside the granted envelope | pooled-resource contention (where stock isn't physically partitioned) |
| **G-ORDERED-HANDOFF** | ownership transfers only via an explicit **ordered** handoff op — never a two-owner window | hand-off races |
| **G-LEASE-EXPIRY** | unexercised ownership/reservation expires after N and returns to the pool; the expiry is itself an ordered op | a device offline for a week locking resources forever |
| **G-READ-ANYWHERE-WRITE-OWNER** | reads replicate freely (stale snapshots are fine); writes are owner-gated | read/write coupling |

**The architecture is belt-and-suspenders.** *Avoid by ownership (primary):* G-EXCLUSIVE-DISPATCH + G-SINGLE-WRITER + physical location cover almost all normal flow, so there's no contention and no rollback. *Resolve by total order (fallback):* the dumb async broker (§6) handles only the rare, uncontainable edge.

---

## 5. The one real-time operation class — customer-global entitlements

The *customer* is the only entity that can be "in two branches at once." So loyalty prizes, gift balances, coupons, and **credit** are the single operation class that needs more than ownership plus daily cadence. Here is the full lifecycle, in pure out-of-the-box terms (no fat server):

**1. Issue = a URL.** Mint a merchant-**signed** token (customer, limit, validity), encode it as a URL or QR code, and deliver it (SMS, WhatsApp, QR). The customer's browser persists it as a wallet entry (their op-log). This reuses existing `share.js` / QR (`BarcodeDetector`) / PWA machinery. *Already proven: our `?tm=play` share-URL replays an instance on any device — a server effect with no server. Add a signature and it carries credit, not just a view.* Two flavors:

   - **Self-contained URL** → *zero-server issuance* (the merchant signs locally).
   - **Activation link** → one narrow `DateLastUsed`-style touch, so a link can't mint infinite cards.

**2. Carry = a signed op-log on the customer's phone.** The customer is their own single-writer. The token is **merchant-signed + hash-chained** (= `§0.20` W-SIGN / W-CHAIN), so the holder can *present* it but not *forge* it — they don't hold the signing key.

**2b. Persist and recover = the user's own email / social account** (zero-infra durability — this resolves the §0.20 W-PERSIST eviction worry). Each use emits a **signed email** (a full signed snapshot of the latest count, or a hash-chained delta) to the customer's own inbox. **The inbox is a durable, user-owned, append-only, tamper-evident log** — already universal, already backed up, reachable from any device.

   **Recovery:** lost phone or wiped PWA → the new PWA reads the customer's **latest email** and restores the count. No server owns the data — *the user's own channel does* (Truth 3). The email is an **untrusted pipe**: a forged body simply fails signature verification, so the pipe needs zero trust. (Caveats: pick the chain tip by signed `seq`/`prev_hash`, not arrival order; send a **full signed snapshot per email** so a single email is enough to recover; encrypt-to-user for privacy. "Email receipt" is an old idea — "**inbox as the recoverable signed state-log**" is the fresh framing.)

   **Witnessed live (2026-06-14, bim-ootb PR #300):** POS "deliver later" serialises the committed op group to a compact base64 blob, copies it to the clipboard, and the user pastes it into WhatsApp, email, or SMS. On any device, the warehouse-walk user pastes it into the receive box and hits Apply — the ops replay into the IndexedDB sidecar, the pending shipment surfaces in the selector, and the pick walk proceeds. The social channel *is* the relay. No server, no sync protocol, no polling. The dumb `erp_relay_server.js` is the upgrade path — same op format, different pipe. Witness: `scripts/poc_oplog_clipboard.js` (`§CL-SERIAL` + `§CL-UUID` idempotency + `§CL-DELTA`).

**3. Claim / spend:**

   - **Online (normal POS):** a sub-second authority **compare-and-set** (set-if-unset) → first-wins. This is the same weight as a card-payment authorisation — not a burden. (A plain `DateLastUsed` *read* is best-effort only: two branches can both read "unused" before either writes. CAS is the hard guarantee.)
   - **Offline (the CAP edge):** choose by value × frequency. **High-value → block** ("confirming…", like an offline card decline). **Low-value → allow + reconcile.** For *credit*, an offline overspend simply becomes a larger **receivable** — that's accounting-native, not an error state.

**4. Reconcile = the ledger** (§8).

**Bearer vs bound (the honest caveat):** a URL is a bearer token. **Promo → bearer** (forwarding it = a viral coupon, which is desirable). **Personal credit → bind on first open** (sign it to the customer's device/public key, or one activation touch), otherwise forwarding it = giving away the credit line.

**Scan unification:** a QR code is a URL made physical. Scanning a customer's QR at the POS reads their entitlement — the *same gesture* as scanning a box. One scan model serves both: goods (SSCC → which unit) and customers (token → who/what credit).

### 5.1 Multi-branch claim fraud — the bearer artifact is the gate (blackout-proof)

**The attempt:** a customer tries to claim a *one-per-customer* offer (a free item, a single-use coupon) at several branches before the day's reconciliation catches up.

**The common path — defeated locally, offline, with no central check.** One person carries one phone. Claiming at branch A welds a merchant-**co-signed `CLAIMED`** op into the phone's hash-chained log (§5.2). The offer is a URL whose JS reads that log, so at branch B the artifact itself answers **"ALREADY CLAIMED"** and the till refuses. The check lives **in the thing the customer must present** — no round-trip to any authority — so it **holds in a total network blackout.** A server, by contrast, has to be *absolutely real-time* to catch a hopper; with the link down it is **blind** (refuse-all or wave-through). On the realistic case this is therefore **strictly more secure *and* simpler than a server: it removed the component that has to be perfect** — correctness rides the artifact-in-hand, not the network.

**The only residual — a device self-fork — still doesn't beat us.** A sophisticated holder could snapshot their device *before* claiming and restore it *after*, presenting a stale "unclaimed" log at a second offline branch. That is: (a) **caught at reconciliation** — two co-signed `CLAIMED` ops on one single-use offer-id is a **provable, attributable** double-claim (§8), not a silent loss; (b) **defeated for value** by single-use semantics + identity binding (void / claw back / ban); and (c) **also defeats an offline server**, which equally cannot reach a central counter with the link down. So **no real-time prevention is lost relative to a server**, and on the common path you are blackout-safe where the server is not.

**Carve-out (this refines §5):** a *single-use* claim therefore **escapes the real-time operation class on the common path** — its state rides the bearer artifact, not a central counter. The genuinely real-time case shrinks to a *divisible* balance spent **anonymously + irreversibly + simultaneously offline** — exactly the §5(3) *high-value → block* branch. Tamper-proof, not fraud-proof; and here **tamper-proof-in-hand beats real-time-at-a-server.**

---

## 6. How much central persistence? — a dumb async post office

Because clients **deterministically replay** the ordered log to identical state, the central thing runs **no business logic.** It is a **facilitator, not an actor.** It does three things (the ActiveMQ job): **accept** ops (append-only), **assign a total order** (the one thing that genuinely must be centralised), and **persist durably + fan out**. It's a Kafka/ActiveMQ-class **log broker**, not a server-side ERP. It doesn't know what an invoice *is*. It never re-runs business logic, never validates semantics, and never signs — *signing happens at the edge (the merchant's key), and enforcement is the deterministic kernel on every client (non-owner ops are rejected on replay).*

| Mode | Central post office needed? |
|---|---|
| Single user / one device | **No** — device + export/backup is the whole system; cloud = optional backup |
| Multi-device / durability / 100-branch circle | **Yes — only the dumb broker** (order + persist + relay), run **daily** |
| Contended invariants (rare; only where stock isn't physically partitioned) | the broker's total order **is** the serialization point — no separate locks; the loser of a true contention gets a *deterministic, explainable* correction (e.g. a backorder), never an arbitrary overwrite |

The post office wears a second hat for the entitlement operation class: a **sub-second matchmaker** for the online CAS (a compare-and-set register over an opaque token — still facilitation, not business logic). That is the *only* always-fast online need; everything else is daily.

**Even the post office is disposable — with one named caveat.** Because every op is signed and hash-chained, the *net result* is reproducible from the collected signed logs: the disjoint per-branch sums **commute**, so re-collecting the union in any order replays to identical books (witnessed `maxDiff=0c` across a 50-branch blackout rebuilt from the edges alone — `scripts/poc_blackout_resume.js` `§ORDER-HONEST`). What is **not** reconstructible from the signed logs alone is the **cross-branch CAS arbitration order** for the one contended operation class: a rebuild from the edges can pick a different winner than the lost real-time arbitration (`§CAS-SLIVER`). That sliver is bounded and routed to the ledger (loser → receivable), never silently corrupted. When minimising it matters, the contended CAS is committed to a **quorum** of owns-nothing replicas *before* ack, so the live decision survives broker loss within a **measured quorum-RTT window** (independent of fleet size — `scripts/poc_quorum_cas.js` `§INTERSECTION-NO-SPLIT` / `§WINDOW-NUMBER`).

### 6.1 The centralized-ID problem, in one place

Classic ERP centralises identity allocation: a single sequence service (`AD_Sequence`) hands out primary keys and gapless document numbers, which forces an always-available coordinator. Here that requirement splits into three parts, and only one of them needs any centralisation:

1. **Primary-key identity is fully decentralised.** Each entity's PK is an **edge-minted UUID**, recorded as an op input (G-IDENTITY, §4; implemented per ERP.md §0.21). Two devices mint without coordination and their logs union with no clash ([poc_distributed.js](https://github.com/red1oon/BIMCompiler/blob/d81a017fa284da27fd81be4830485534de71d92f/scripts/poc_distributed.js)).
2. **Total order is the one part that is centralised — minimally.** Ordering across parties is assigned by the dumb facilitator (above), which runs no business logic and is itself reconstructible from the signed logs. It sequences; it is not an authority.
3. **The gapless human document number is a per-device namespace.** The sequential identifier users expect (e.g. `INV-2026-0001`) is issued as `user/date/doc/#` within each device's own namespace — gapless in that namespace, unique across devices without coordination — and is distinct from the global UUID PK. No shared counter is required.

So the only centralised function is sequencing, and even that is rebuildable offline. Identity allocation — the part that classically forces a coordinator — requires none.

---

## 7. Determinism is load-bearing (not just nice)

The dumb-broker model only works if **clients converge from the ordered log.** So *any* nondeterministic verb — a live FX/rate lookup, an uncaptured clock read, a re-rolled random number — breaks it. That turns the prime directive (deterministic, non-invent, extract-or-compile-only) from a virtue into **infrastructure**: determinism is *what lets the server be dumb and the clients agree.*

The practical rule (already enforced in our runtime): nondeterministic values — UUIDs, timestamps, scanned codes, external rates — are **generated at the edge and recorded as inputs in the op.** The kernel only ever *reads* them, never computes them. Use **UUIDv7** for identity (timestamp-sortable + collision-safe via the random tail; a millisecond alone is *not* a uniqueness guarantee). *Witness: `replay-hash == live-hash` — proven in `scripts/erp_kernel.js` / `poc_kernel.js` / `poc_longtail.js` on the sql.js (browser) binding.*

---

## 8. Capstone — accounting *is* the reconciliation engine

We don't need perfect real-time distributed consistency, because **accounting was invented to reconcile imperfection.** Double-entry bookkeeping (Pacioli, 1494) is the original eventually-consistent log — five centuries of provisions for shrinkage, bad debt, overages, disputed claims, and double-payouts.

So a local-first ERP's job is **not** to prevent every discrepancy in real time (CAP says you can't). It is to **feed clean, ordered, signed ops into the system already designed to reconcile discrepancy.** The op-log and the ledger are the same instinct, 500 years apart — both are *folds over an append-only log*: `OnHand = Σ M_Transaction` is the same shape as `Balance = Σ journal`. **Accounting reconciles because it never stored a balance either.**

Every residual in this doc resolves there: a double-claim → flagged at month-end, expensed as promo; a credit overspend → a receivable; a phantom scan → a van shortage the salesperson is liable for. **Common in the real world, provisioned for, not a showstopper.** And our ordered, hash-chained log makes every such case *more* auditable than a centralised system — full lineage, deterministic first-wins, no quiet overwrite.

---

## 9. Edge scenarios — the adversarial suite

The normal day (§3) leaves a bounded residue. Each row below names the issue it proves or disproves, the truth/guard that carries it, the acceptance witness, and the **honest residual** that remains. (This consolidates the former "residuals" list — every item below is on the list, and none of them is a blocker.)

> **From residual to production-proof.** This section names the residuals; the **Production Readiness — Risk Register & Test Plan** turns each into a remedy plus a test with an honest status (✅ exists / 🟡 partial / 🔴 to build). We left the *devil we knew* (Postgres/JVM/Docker); the angel that replaces it must be **tested to failure first** — that companion doc is where the gaps are surfaced and worked to zero before any tenant.

### A. Durability & loss

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| Browser eviction (Safari ~7-day) | T3 / W-PERSIST | self-securing log + email durability; `navigator.storage.persist()` requested on first load | `persisted=true`; export→wipe→import → `replay-hash == pre-export hash` | a shared browser limitation — mitigated, not eliminated |
| Lost phone / local copy | T3 | recover from the latest **signed email snapshot** → replay to identical state | new PWA reads latest email → count restored | email-account loss is a risk the user **already** carries; we inherit it, never manufacture a new one |
| Lost sequencer / post office | T1 + T3 | **net books** reproducible — disjoint folds commute; rebuild from the union of signed logs → identical balances | 50-branch blackout rebuilt from edges → `maxDiff=0c`, identical tip (`poc_blackout_resume.js` `§ORDER-HONEST`) | the **cross-branch CAS order** is the one thing *not* reconstructible from logs alone (`§CAS-SLIVER`) — bounded, routed to the ledger; minimised live to a quorum-RTT window (`poc_quorum_cas.js`) |

### B. Forgery & authenticity

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| **False email / URL / data** | T3 / W-SIGN | the container is untrusted **by design**; only signed content verifies | a forged body fails signature under the issuer key → rejected | none beyond key custody (below) |
| Signing-key **theft** / custody | T3 | the **one irreducible anchor**; secure-enclave | — | key *theft* is irreducible — true for *every* system (you can steal a server's key too) |
| Key **rotation / revoke / offboarding** | T3 / W-ROTATE | a signed `ROTATE` (counter-signed by the **outgoing** key) installs a new key at seq S, plus a key-epoch map → history verifies under the key valid **at its seq**, with no re-signing of the past; `REVOKE` kills a key's **future** but keeps its **past** | rotate → past still valid under the old key; a post-rotation old-key op is rejected; a revoked key loses its future, not its past ([poc_rotate.js](https://github.com/red1oon/BIMCompiler/blob/feat/erp-substrate-phase012/scripts/poc_rotate.js) §ROTATE-OP/§HISTORY-VALID/§FUTURE-GATED/§REVOKE) | key lifecycle is no longer hand-waved — it's witnessed; key *theft* itself stays the floor above |
| Bearer token forwarded | §5 / T3 | bind-on-first-open for personal credit; bearer is fine for promo/view | forwarded credit fails the device-bind check | promo forwarding is *desirable* (a viral coupon) |
| Tampered local log | W-CHAIN | hash-chain; `verifyChain()` detects tamper at op N | alter op N → chain breaks **at exactly N**; clean → `chain OK len=N` | detection, **not** prevention — by design (the floor) |
| **Relay equivocation** (hands client A `[a,b]`, client B `[b,a]` over one seq window) | T1 / §6 | clients sign their **observed period-tip** and gossip it; mismatched signed tips = equivocation **attributable** to the relay (a client signs only what it saw — unforgeable) | divergent signed tips detected + attributed; an honest relay → identical tips, no false positive ([poc_equivocation.js](https://github.com/red1oon/BIMCompiler/blob/feat/erp-substrate-phase012/scripts/poc_equivocation.js) §DETECT/§ATTRIBUTABLE) | silent **without** tip-gossip (§FALSIFIER); the post office is no longer *assumed* honest — equivocation is caught. Real-time-cadence detection is tier-2 |

### C. Freshness / double-spend (the one real-time operation class, §5)

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| Replay a genuine token (claim twice) | §5 / T2 | online **CAS** set-if-unset, first-wins | 2nd claim sees spent → rejected, no double payout | needs the sub-second touch — the *one* online need |
| Two branches read "unused" before either writes | §5 | **CAS**, not a plain `DateLastUsed` read | first CAS wins | — |
| Offline overspend window | §5.3 / T4 | value-tiered: high-value **block**, low-value **allow + reconcile** | overspend → **receivable**, not an error | bounded residual → the ledger (the floor) |

### D. Ownership / contention

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| Doc edit across a handoff (two-owner window) | G-ORDERED-HANDOFF / G-SINGLE-WRITER / W-OWNER | ownership transfers only via an **ordered handoff op**; designated-owner node at the seam | two peers allocate the same invoice → owner rejects the 2nd, no money lost | concentrated at **a few seams**, not per-collection |
| Device offline a week holding a lock | G-LEASE-EXPIRY | lease expires after N, returns to the pool; expiry is itself an ordered op | unexercised lease → reclaimed | generous leases + provably-unexercised expiry |
| Two tills, the genuine last unit | (local) | **local-LAN single-writer**, sub-ms | — | not distributed — a local problem |
| In-transit ownership (truck A→B) | (movement) | iDempiere in-transit locator / `M_Movement` confirm-both-ends | shipped-not-received accounted for in the daily reconcile | the daily reconcile must carry it |
| Pooled resource (stock not physically partitioned) | G-RESERVATION | lease granted at dispatch (online); offline stays inside the envelope | — | lease-expiry oversell — rare in retail |

### E. Determinism integrity

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| Nondeterministic verb creeps in (live FX / clock / random) | T1 / §7 | values generated at the edge, **recorded as op inputs**; kernel only reads; UUIDv7 | `replay-hash == live-hash` holds | the failure mode = divergence breaks merge → the prime directive is *infrastructure*, not style |
| Identity collision on merge | T1 / G-IDENTITY | **edge-minted UUID PK** (not a numeric seq); identity is an op input | two devices' logs union with **no PK clash** | Implemented in the kernel (ERP.md §0.21, witness `§IDENTITY` / [poc_identity.js](https://github.com/red1oon/BIMCompiler/blob/d81a017fa284da27fd81be4830485534de71d92f/scripts/poc_identity.js)): natural-key `docKey`/`lineKey` retired; replay re-reads recorded ids (`edgeMintCalls=0`) |
| Schema migration to N offline clients | (shared hard) | compiled-AD **manifest** + forward-only / frozen-effects replay | old ops replay to their original effect (frozen) | an open problem across the whole category; partial mitigation only |

### F. The irreducible (the floor — Truth 4)

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| Insider fraud (the **key-holder** lies) | T4 / §8 | double-entry + physical reconciliation; the hash-chain makes it *more* auditable | the lie must be told consistently across **all** books → caught at the count | not crypto's job — accounting's |
| Cloned / printed barcode (scan without the box) | T4 | caught at van settlement + accounting | — | shrinkage/fraud, *not* a distributed problem |
| The unsolvable residual (CAP partition; offline witness) | T4 | **record + consequence + price-in** | — | **not solvable** — we reduced the *cost of the non-solution* |

### G. Privacy / right-to-erasure

| Scenario | Truth / § | Mechanism | Acceptance witness | Honest residual |
|---|---|---|---|---|
| Right-to-erasure on an immutable signed log (GDPR/CCPA) | T3 / W-ERASE | PII rides in a **per-subject encrypted envelope**; erase = destroy the subject key (**crypto-shred**). Non-PII (account/cents) stays in the clear and folds normally | drop the key → PII irrecoverable, yet the chain still verifies, the tip is identical, and books are byte-identical (`maxDiff=0c`) ([poc_erase.js](https://github.com/red1oon/BIMCompiler/blob/feat/erp-substrate-phase012/scripts/poc_erase.js) §ERASE/§BOOKS-INTACT) | **tombstone the identity, keep the accounting fact** — the honest GDPR posture, not faux-deletion (the event provably happened; the person is unidentifiable). §FALSIFIER: cleartext PII can only be "erased" by rewriting the chain |

---

## 10. Comparison with related systems

The full detail is in [LocalFirstPriorArt.md](LocalFirstPriorArt.md); here is the summary. A recurring constraint in local-first systems is that the server and the client run *different* code, which pushes implementations to hand-code conflict logic, overwrite optimistic state, or write business logic twice. The approach here — deterministic semantic verbs, one kernel on both sides — avoids that constraint. The table states each system's approach, its documented limitation, and the corresponding difference here; sources are cited in [LocalFirstPriorArt.md](LocalFirstPriorArt.md).

| System | Approach | Documented limitation | Difference here |
|---|---|---|---|
| [Replicache](https://doc.replicache.dev/) | server re-runs mutations as the authority | the server may not compute the same result, so optimistic state can be overwritten; conflict logic is per-mutator; no zero-server mode (a backend of authority is required) | determinism removes the divergence case; offline-only operation is supported |
| [ElectricSQL](https://electric-sql.com/) | read-path sync; writes go through the application's own API | bidirectional sync documented as "fundamentally difficult"; reads sync from Postgres, writes go through a separate API — two disjoint paths, no unified write model | the op-log is symmetric — push-ops *are* the read-ops; one model, no Postgres coupling |
| [PowerSync](https://powersync.com/) | Postgres→SQLite; writes routed through the backend | the backend is the write authority (default last-write-wins); write-side business logic and conflict policy live server-side, not symmetric or offline-authoritative | the deterministic kernel is the write path, authored once and run on both sides |
| [LiveStore](https://livestore.dev/) | event-sourced, SQLite-materialised (the nearest neighbour) | beta; requires a sync provider; no built-in auth; documented scale and P2P limits | identical at the data layer (no technique novelty); the difference is at the application level (combined BIM and ERP, AD→5-table reduction) |
| CRDTs ([Automerge](https://automerge.org/)/[Yjs](https://yjs.dev/)) | guaranteed convergence with no referee | per the literature, cannot enforce invariants that depend on the latest version; no access control | only a degenerate CRDT is needed (grow-only op-set + total order + replay); invariants are enforced by the deterministic kernel, not the CRDT |

**Reconciliation cost.** Because a fact is a fold over an append-only log, a merge is `union → verify signatures → order → replay`. For single-writer cases (≈90%) it is trivial (disjoint entities); for derived quantities it is addition (a PN-counter); for the one contended operation class it uses total order plus owner-gating — the same server-authoritative sequencing the CRDT literature prescribes for invariant-bearing state. The costs: determinism must hold exactly (the prime directive), semantic seams still require an owner node (a few, not per-type), and schema migration remains an open problem (shared across the category).

**Limits on the novelty claim.** SQLite-in-WASM (sql.js, 2012; official WASM/OPFS, 2022; wa-sqlite) is established. Local-first as a category (LiveStore, ElectricSQL, Replicache, RxDB) is established (ERP.md §0.20: no novelty on the mechanism). "Replace any database app" would be incorrect: full-dataset download, browser eviction, unbounded scale, and built-in auth are documented limits, and this is not intended for multi-TB analytics or high-concurrency OLTP at scale. SQLite-WASM, local-first, op-logs, CRDTs, and hash-chains are all prior work, not contributions of this project.

**What *is* specific to this project** — to the authors' knowledge, a *combination* rather than a technique (consistent with ERP.md §0.20; the absence of prior art cannot be proven):

1. **BIM geometry + ERP transactions under one op-log / one kernel** (BIM undo == ERP audit) — no prior art found.
2. **The domain reduction** — iDempiere AD (925 tables, `M*` classes) → **5 tables + deterministic verbs**.
3. **The doctrine** (§0) — fact-is-a-fold, secure-the-fact, business-time, the non-solution floor — a coherent serverless-ERP *stance*, not a tech first.

---

## 11. What infrastructure is actually required

**No fat always-on server.** The complete, tested architecture needs only:

1. **Per-shop / per-van / per-box single-writer** — free, from physical ownership + `M_Locator`.
2. **A thin async post office** (order + persist + relay), run **daily** — the one-way circle. *(And even it is disposable — reconstructible from the signed logs, §6.)*
3. **A sub-second touch** for the *one* customer-global operation class (online CAS), high-value only.
4. **Signed, hash-chained logs** (W-CHAIN / W-SIGN) — justified concretely by credit-on-phone.
5. **The user's own email / social account** as zero-infra durable persistence + recovery (§5.2b).
6. **The ledger** — doing the reconciliation job it has done since 1494.

> **Second mantra (proposed — wording to be ratified before it enters `CLAUDE.md`).** The prime directive governs *computation* — *"Deterministic. Non-invent. Extract."* This architecture adds three more, governing *cadence, trust, and the floor* (§0): **(2) Not real-time — business-time. (3) Secure the fact, not the container. (4) The system can't prevent — only witness; we reduced the cost of a non-solution.** Candidate short forms for the persistence/ownership axis: *"Data is truth; the signed log is trust; the user holds both."* / *"User-owned. Server-less. Ledger-reconciled."* / *"No server of record — the user's own log is."* Keystones: *determinism earns business-time*; *self-securing facts terminate the regress*.

**Sources / cross-refs:** ERP.md §0.20 (phase + witnesses W-CHAIN/SIGN/PERSIST/OWNER) · [LocalFirstPriorArt.md](LocalFirstPriorArt.md) (Replicache/ElectricSQL/PowerSync/LiveStore/CRDTs, per-system analysis) · [scripts/erp_kernel.js](https://github.com/red1oon/BIMCompiler/blob/d81a017fa284da27fd81be4830485534de71d92f/scripts/erp_kernel.js) + [poc_kernel.js](https://github.com/red1oon/BIMCompiler/blob/d81a017fa284da27fd81be4830485534de71d92f/scripts/poc_kernel.js) + [poc_longtail.js](https://github.com/red1oon/BIMCompiler/blob/d81a017fa284da27fd81be4830485534de71d92f/scripts/poc_longtail.js) (`replay-hash == live-hash`, browser binding) · [SpatialERP_OOTB.md §11.5](SpatialERP_OOTB.md) · iDempiere `M_Transaction` / `M_StorageOnHand` / `M_StorageReservation` / `M_Movement`.

### 11.1 The Disposable-Host paradigm — what it actually costs to run

A standard corporate ERP install is **three always-on tiers, per tenant, 24/7**: an application server (ZK/OSGi/JVM), a database server (Postgres), and the surrounding cache / load-balancer / standby. That fleet is the dominant hosting line item, and it runs whether anyone is clicking or not.

This architecture *deletes* that tier rather than renting it more cheaply. The compute moves *into the client* — the deterministic kernel over SQLite-WASM (§7, §0; **[the big picture, plainly](SQLiteWasmArchitectureActual.html)**) — so the server side reduces to two things, both of which the doc has already shown are *disposable* (reconstructible from the signed logs, §6/§11):

1. **Static object storage** for the signed-log snapshot — a CDN/bucket object. Near-zero marginal cost, scales for free, no process to keep alive. *(Witnessed live: the same signed snapshot served interchangeably from GitHub raw, an OCI bucket, and localhost — `build/erp/replica_poc.html`, `scripts/test_kernel_replica.js`; any reachable host replays to an identical, controller-signed chain tip, so the host is genuinely interchangeable.)*
2. **A thin "dumb post office" relay** (§6) — order + persist + relay only, no business logic — run *intermittently*, not 24/7, and itself reconstructible from the logs. *(Witnessed: `build/erp/erp_relay_server.js`, `scripts/test_kernel_relay.js` — idempotent ingest, convergence over HTTP, durable restart.)*

**Where the saving comes from — stated so a reader can check it, not just asserted.** The reduction is bounded by *how much of a given bill is the always-on app+DB compute tier* — usually the majority. Eliminating it leaves static storage plus an intermittent relay, so an **order-of-magnitude (up to ~90%) cut is an architectural claim about removing that tier**, not a measured invoice — quote it as such. The saving is largest for the **~90% single-writer workload** (§1), which needs **no server at all** (one device, offline-first); it shrinks for the **~10%** that needs the relay and the *one* customer-global CAS touch (§5). What remains to pay: cheap static hosting, the intermittent relay, and that sub-second CAS for high-value global ops.

**The interactive-speed half is a separate axis — don't conflate them.** Near-instant UI comes from two real removals: no per-interaction network round-trip (the kernel answers locally) and no server-rendered widget tree (HTML-native UI replaces the ZK round-trip "click tax", ERP.md §4b). **Honest caveat (carried from §19.6 / the measured A-B):** our ~100× local-throughput figure is *almost entirely the asynchronous-durability trade* (instant local append vs synchronous fsync/commit), **not** server-removal — server-removal only wins over a *network*. So: the **cost** win is the disposed compute tier; the **latency** win is local compute + no click tax; the **throughput** number is the durability trade. Three distinct claims, kept distinct.

**The trade is priced in, not hidden:** durability is *asynchronous* (Truth 2) — a write is durable when the log reaches a replica, not at keystroke. That is the one honest cost of having no always-on server of record, and the signed log + multi-replica publish (§5.2b, and the 3-host replica above) is how it is made safe.

---

## 12. Relationship to blockchain and to general-purpose sync

**Blockchain: same data structure, different problem.** This design uses blockchain's *data structure* — a hash-chained, signed, append-only log (W-CHAIN / W-SIGN) — but not its consensus machinery (proof-of-work or -stake, global replication, tokens). That machinery buys trustless agreement among mutually distrusting parties over a single global state. ERP does not pose that problem: physics partitions the writers (§2), the business sets the cadence (Truth 2), and accounting reconciles the remainder (§8). So we keep the signed append-only log and drop the consensus layer.

The model is **trust-anchored local-first** (a signing key plus a sequencer), not trustless consensus — and **P2P-capable rather than P2P-dependent**: single-user is one device, multi-party exchange of signed logs is possible, and the facilitator (§6) is an optional relay. A closer analogy than blockchain is version control (git): a content-addressed, append-only history that any participant can hold and reconcile.

**Why general-purpose frameworks centralise more.** Replicache, ElectricSQL, PowerSync, and LiveStore build *general* sync infrastructure, where a server is genuinely necessary — a general tool cannot assume the domain partitions the data. This project is an *application* that uses domain-specific structure — location, ownership, cadence — to remove the parts a general tool must keep. The components involved (event-sourced SQLite, hash chains, CRDTs) are all established; the difference is the synthesis, not a new primitive (§10).

**Scope of any novelty claim.** The technique is not novel (§10). What is specific to this project, to the authors' knowledge, is the combination: BIM geometry and ERP transactions under one op-log (BIM undo and ERP audit are the same mechanism), the design principles in §0, and a running substrate — a deterministic kernel, a real iDempiere AD extraction, and a BIM op-log. This is a claim about combination and placement, not about any underlying technique, and it is stated subject to the limit that the absence of prior art cannot be proven. In summary: the ledger is an append-only log, and git and SQLite-WASM are long established; the work here is the synthesis — applying that log structure to ERP transactions and BIM geometry under one kernel.

---

## 13. Sharding the engine by gravity — what arrives, and when (2026-06-01, SPEC)

§2 partitions the **transaction data** by where the atoms physically are. This section partitions the **engine itself** — the dictionary (925 AD tables → cells → verbs → FK spines, ERP.md §12) — for the client that has to hold it. The two are **orthogonal axes of the same root** (§7, *identity and inputs are recorded, never recomputed*): §2 is *where the goods are*, §13 is *which part of the engine you've pulled down yet*.

**The problem, stated honestly.** The full AD is too big to ship whole to a browser, and the naïve fix (stream every table) makes the first paint wait on the long tail. But you never need it whole *at once* — and the engine already tells you what matters: **op-log gravity** (ERP.md §0.6/§0.13/§0.17) self-ranks the cells by real mass (`C_Invoice` #1 = the settlement spine). So don't shard by schema — **shard by gravity**, and stream shards *on approach*. It's the same doctrine as BIM geometry DLOD, with one substitution.

> **One streaming doctrine, two distance metrics.** Geometry streams by **camera distance** (DLOD / split-DB / click-to-stream, S285 city). The engine streams by **op-log mass**. *Distance to the work* replaces *distance to the eye.* That a single pattern serves both spatial-BIM and transactional-ERP is the §0.20 unification made operational — not a coincidence, the same op-log seen two ways.

**The shard unit — a *single table, ranked by gravity*.** Three granularities were on the table. The spectrum, and why per-table wins *once gravity is computed from real traversal*:

| Granularity | What it is | Verdict |
|---|---|---|
| per-module | iDempiere's own packaging | **Rejected** — modules cut *across* gravity (one module mixes hot and cold cells), so pulling one hot cell over-fetches its cold module-mates |
| per-gravity-band | a contiguous gravity slice plus its explicit 1-hop FK closure | **Workable but coarser than needed** — it bundles by hand a closure that gravity already encodes, shipping cold band-mates that may never be touched |
| per-table, gravity-ranked | one AD table per shard, the manifest ordered by op-log gravity | **Chosen** — finest grain, no over-fetch, no dangling trace: gravity is itself a fold over op-log traversal, which crosses FKs, so a hot table's frequently-walked neighbours co-rank and arrive alongside it. The closure is *implied by the ranking* rather than added separately |

**The key realization: gravity already *is* the closure.** Because the op-log records real journeys down the FK spines (§0.6/§0.13 — derivation green, settlement amber), a table and the neighbours actually traversed *from* it accrue mass **together**. So a per-table manifest sorted by gravity pulls the hot closure in naturally — the band machinery was solving a problem the gravity score had already solved. The rare, genuinely-cold FK is the *stub* case below, not a reason to coarsen the unit. This is the engine analogue of a DLOD level — "the N nearest tables," where *near* = op-log mass, not metres. **Tier 0 = the top-gravity tables** (`C_Invoice` #1, the O2C/P2P spine) — the prefetched `<300ms` `initbubble.json` (ERP.md instant-globe). The 155 dormant cold cells (ERP.md §0.11 *housed-vs-active*) sit at the bottom of the ranking — present in the manifest, **fetched only on touch**.

**The manifest is a fold over the log (no new infrastructure, §6).** Gravity is an aggregation over `kernel_ops` (count / `grandtotal`, ERP.md §0.6 analytical substrate), computed **offline, deterministically** (no `Date.now`/`Math.random`, §7). The shard manifest is just that fold — every table with its gravity rank. The **dumb post office** that already orders, persists, and fans out the op-log (§6) serves the tables too: *pull = "give me table T."* No authority, no business logic server-side — and because the log is deterministic (§7), a client **verifies a shard's content hash against the ordered log** rather than trusting it. A shard is *checked, not believed* — the same stance W-CHAIN takes on ops (§9-B).

**The fetch trigger — lazy, gravity-cached, with a feedback loop (ERP.md §0.10).** A table is pulled when the user *moves toward* a not-yet-resident cell: clicks a cold bubble, follows an FK spine into an unfetched table, or scans a code (§2 *the scan is the op*) that references a cold doc-type. Once fetched, a table stays resident, and **its access bumps its own gravity** (the §0.6 op-log feedback loop) — so next session's tier 0 reflects *this* operator's real usage, not a static default. The cache warms toward the work.

**The honest edge — a stub, never an invention.** An FK followed *before* its target table is resident draws a **stub bubble** (`cold — fetching`), not a guessed or stale value — extract-only, never invent (ERP.md §0.17). The fetch resolves it in place. This is exactly S285's invisible-bbox frontier (place the marker, stream the content) carried onto the engine graph. **No silent truncation:** the stub is visible and logged, so "I haven't pulled that yet" can never masquerade as "that's all there is."

**What this is and isn't.** It **is** a deterministic, gravity-ordered lazy-loader for an engine-as-data, on the infrastructure §6 already requires. It is **not** a new sync primitive (the §10/§12 honesty holds — DLOD, lazy-fetch, and content-addressing are all mature). The distinctive move is the *substitution*: **op-log mass as the LOD metric for a business engine**, unifying the spatial and transactional loaders under one rule. **Witness (when built, mirroring the suite's discipline):** a `gravity_seed`-ranked per-table manifest whose tier-0 content-hash matches the prefetched globe; a cold-cell touch pulls exactly that table (its hot neighbours already co-resident **by rank**, not by an explicit closure — proving gravity self-bundles), with over-fetch counted = 0; an unresolved FK renders a stub (not a value); the resident set's replay-hash equals the full-engine replay-hash for every path actually walked. SPEC only — no code yet; T3-adjacent (it serves the read-only trace first, edit later).

---

## 14. Per-node email-DR — each node backs itself up (inbox-as-log)

§9.A proves a store recovers from a signed snapshot after total loss. This section **generalizes that to every node**: each sovereign log — store, HQ, vendor, and the customer's phone (the BPartner-as-node, §5/§9.G) — periodically emails *itself* a signed, encrypt-to-self **snapshot + the deltas since** — a loose, off-device retrace path it owns. It is the §6 post-office discipline turned inward: the node's own inbox is its cold store. Witnessed in miniature by `poc_email_dr` (Layer A data / Layer B key) and by **W-POS-WAN-SCALE B6** (POS total loss → recover the last signed EODA snapshot from the inbox).

**Why the inbox.** It is ubiquitous, off-device, append-only, and already provider-replicated — no new infrastructure. The channel is a **commodity**: export@A → import@B verifies with *no re-trust*, because trust lives in the signature, not the container (Truth 3, *secure the fact, not the container*). So backup decentralizes the same way the log does — **self-custody, no central backup honeypot**.

**Cadence = checkpoint + deltas.** A periodic signed snapshot (the *latest alone suffices* — the provider-purge case) plus the incremental ops between. Recovery = the newest valid snapshot, then replay the tail. It's the same snapshot → segment → retain housekeeping, with the mailbox as the segment store.

**"Loose" is a feature, and it is integrity-safe.** A hostile or lapsed provider can *withhold or delete* (an availability problem) but **cannot forge** (signatures reject it, §9.B) — so a best-effort, eventually-consistent inbox suffices. It is also **redundant atop the mesh**: counterparties already hold the overlapping signed facts, so each node has *two* retrace paths — its own inbox, and counterparty re-supply. Belt and suspenders.

**The floor (Truth 4 / §9.F).** The inbox recovers the *facts* unconditionally **given the key**; the key is the single secret that signs and (by derivation) decrypts. Lose it with no anchor → the data is present-but-undecryptable. "Responsible for yourself" therefore means **responsible for the key**, not the data — which is why consumer nodes need the recovery anchors `poc_email_dr` enumerates (k-of-n across one's own channels, a platform passkey, employer escrow). Discipline: email the **log/fold**, never fat blobs (the op-size cap).

Net: each node carries its **own** disaster recovery. The only residues that stay central are the ones §5 / §8 / §9.F already name — the contended-balance agreement point, the settlement rail, and the key-trust root.

---

## 15. Physical custody — the shipment as a node (chain-of-custody log)

Replenishment *execution* need carry no messages at all: the **shipment is a node** that holds its own signed log — a cryptographic waybill. In transit there is nothing on any wire; the truck **is** the message in motion. This is the §3 sales append and the §14 DR loop applied to the physical leg — one primitive. Planning stays HQ's replenish fold (§5/§6); its output, the **dispatch op**, is *also* the truck's manifest.

**Every handoff is a co-signed append**, never a one-way write. HQ signs *dispatched*; the carrier counter-signs *custody taken*; on arrival the carrier signs *delivered* and the store counter-signs **the count it actually received**. A short or damaged delivery is therefore a **signed delta**, not a silent gap — the receipt is the store's truth, the dispatch is HQ's, and the diff reconciles.

**Decoupled to operate, linked to audit.** Each layer knows only its own handoff (HQ does not track the drive; the store was not pre-notified — goods and manifest arrive together). Yet the logs reference each other (receipt ← delivery ← custody ← dispatch), so the **full chain folds on demand**: recall, provenance, and "where did the two units go?" all fall out of replay, even though no layer watched the others in real time.

**Status is pulled, not streamed.** "Ask the truck to ping back its last log" is the §6 `/snapshot?after=N` read — no telemetry, no tracking server. The carrier is a queryable, offline-capable node that syncs opportunistically (worst case, read the chain from the store on arrival).

**The floor (Truth 4 / §9.F).** The log makes loss **detectable and attributable to the exact hop** (loaded 100 / took 100 / received 98 → provably in transit) but does **not physically prevent** it: a colluding signer's lie is caught at reconciliation, not at signing. **Provable attribution, not a physical guarantee** — the same stance as the rest, applied to pallets. Net: replenishment = one dispatch op that rides the truck and reconciles on arrival; planning is a fold, execution a moving log, audit a pull.

??? note "Further reading — the fleet-scale proof"
    - POS WAN-scale benchmark — spec &amp; witness (W-POS-WAN-SCALE) — the fleet-scale proof: 10k tills → central dump relay, minimal SODA/EODA fold, idempotent retry, relay-crash + email-backup DR, partitioned doc-numbering.
    - [Two messages a day → books to the penny](RetailScaleStory.html) — the animated, plain-English retail one-pager (bar charts, legacy side-by-side, and the runnable benchmark).
