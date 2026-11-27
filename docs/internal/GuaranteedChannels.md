# Guaranteed Channels — the pipes the ops ride and the rails payments ride
> **Lane (2026-11-09):** this file is one part of the ONE-DOOR framework (Actor | Channel | One door | Engine). Home and lane map: `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §0. Column owned here: ACTOR delivery transport.

*The wiring under the lenses. The lens docs ([POSLens](POSLens.md), [WMSLens](WMSLens.md),
[SocialPlatformLens](SocialPlatformLens.md), [CreditLedgerLens](CreditLedgerLens.md)) are the *interfaces*; this is
the *transport* — how a signed op gets from one node to another, and how money gets collected — built entirely from
channels that are **guaranteed to already exist and need no upkeep.** Grounds the channel choices made across
[Distributed ERP](DistributedERP.md).*

---

## 0. The principle — use what is guaranteed; the server deletes itself

A server is the one thing that **isn't** guaranteed: you provide it, maintain it, pay for it, and it can fail.
Commit to building *only from guaranteed parts* and the server deletes itself. What's left is enough to move every
op and collect every payment:

- the **fact is signed** → the channel can be open, public, even unreliable, because tampering breaks the signature
  (*secure the fact, not the container*);
- the **fold tolerates the channel** → duplicates (idempotent, UUID-keyed), out-of-order (commutative), late
  (business-cadence) are all harmless — the channel's poorness is exactly what the merge was built to absorb;
- so **redundancy is free** → fan one op across two independent channels; the same op arriving twice dedupes by UUID.

Pick the guaranteed channel that fits the job; double up across independent ones for availability; the signature
carries the truth regardless.

## 1. Email — the default bus

The "dumb async post office" of DistributedERP §6 is **email**: universal, free, tested (through iDempiere's email
API), and run for you at hyperscale (Gmail down = global news, not your 3am problem). Branches/tills/vans email
signed ops; the admin's inbox is the incoming op-log; a lens folds it onto the kanban (`SEND == arrive == VERB`).
Per-op messages, ~business cadence. *The frictionless automatable default.* (Full treatment: [WMSLens §7](WMSLens.md).)

## 2. Your own cloud — the encrypted log file (Drive / Dropbox)

Where email carries *messages*, the user's own cloud carries the **whole signed log as a file** — bulk state and
backup. Following the [Cryptomator](https://cryptomator.org/) / Standard Notes FileSafe pattern: **encrypt locally,
store only ciphertext in the user's own Drive/Dropbox.** The cloud sees nothing readable; the data stays sovereign;
durability attaches to something the user already keeps (DistributedERP Truth 3). The op is already signed — just
encrypt and drop. Guaranteed (everyone has a Drive), free, E2E, and a clean complement to email's per-op stream.

## 3. USSD / SMS / SIM-Toolkit — the feature-phone channel

Below the smartphone line live the deepest un-served, and they are reachable: **USSD works on *any* phone, no app,
no data** — it is [M-Pesa's real moat](https://fintechmarker.com/m-pesa-why-old-school-ussd-still-wins-in-african-mobile-money/),
and the primary rail of bKash, EasyPaisa, EcoCash. The **design law** this imposes on every lens: degrade to a
**terse numbered text-menu**, so the *same fold* is drivable by SMS/USSD where there are no smartphones. ("1) Sell
2) Stock 3) Who owes →".)

**Honest caveat — the one channel that breaks no-server purity.** USSD needs a telco aggregator/shortcode (~$1k/mo;
ride [Africa's Talking](https://africastalking.com/) / Twilio), so it is a *metered dependency*, not free infra. Keep
the data sovereign so the aggregator is swappable; depend on its *reach*, never its *permission*. Use it where the
feature-phone persona justifies the cost; SMS (also aggregator-metered, but ubiquitous) is the lighter fallback.

## 4. Payment rails — collection on the country's standard

Money rides the country's own rail — **UPI** (India), **M-Pesa** (East Africa), **PIX** (Brazil), **DuitNow**
(Malaysia), **Alipay/WeChat** (China). Each is a guaranteed, civilization-scale QR/deep-link: the card shows a
**pay-QR or a pay-link**, the customer scans, **the payer serializes** (they pay once — §POSLens), and the payment
confirmation **folds back** to clear the receivable ([CreditLedgerLens §3](CreditLedgerLens.md)). You build no
payment system; you emit the rail's standard intent.
*Honest:* rails carry fees and ToS — but the orders/receivables stay **sovereign**, so the rail is swappable; you
depend on its *settlement*, never on owning it.

## 5. Choosing — one table

| Channel | Guaranteed? | Cost | Role | Use when |
|---|---|---|---|---|
| Email | yes (hyperscale) | free | transport (per-op) | default bus, digests, audit trail |
| Own Drive/Dropbox (encrypted) | yes | free | bulk state + backup | whole-log durability, sovereign |
| Native intents (tel/sms/wa.me/maps/mailto) | yes (on-device) | free | action / reach | one-tap actions from a record |
| USSD / SMS / STK | partial (telco gateway) | metered (~$1k/mo+) | UI + reach | feature-phone, below-smartphone users |
| Payment rail (UPI/M-Pesa/PIX/DuitNow) | yes (country std) | per-txn fee | collection | get paid, clear receivables |

**Rule of thumb:** prefer the *free + guaranteed* (email, Drive, native intents); accept a *metered* channel (USSD,
payment rail) only where it genuinely buys reach or settlement you can't get otherwise — and keep the data sovereign
so it stays swappable. Double up across independent channels for free, because the fold dedupes.

## 6. Honest scope

- **Proven:** email comm (iDempiere API, tested); native intents are universal device features; payment rails and
  USSD are live national infrastructure.
- **To build:** the *adapters* — fold↔email, encrypt↔Drive, fold↔text-menu, rail↔receipt — each thin glue over the
  signed op, gated on the engine seam. No new engine; the channels already exist.
- **Discipline:** add a channel when a real user's context needs it (the feature-phone shop → USSD; the B2B buyer →
  email; the on-the-move owner → native intents). Not all channels at once — the shelf is optionality, not a queue.

The promise: **every op rides pipes the world already runs and maintains, every payment rides the rail the country
already trusts, the fact is signed so the pipe can be anything, and nothing here is yours to host.**

---

*Companions:* [POSLens](POSLens.md) · [WMSLens](WMSLens.md) · [SocialPlatformLens](SocialPlatformLens.md) ·
[CreditLedgerLens](CreditLedgerLens.md) · [DistributedERP](DistributedERP.md).
