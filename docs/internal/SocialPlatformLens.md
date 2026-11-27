# The Social Platform Lens — the ERP comes to you, in the app you already live in
> **Lane (2026-11-09):** this file is one part of the ONE-DOOR framework (Actor | Channel | One door | Engine). Home and lane map: `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §0. Column owned here: ACTOR (email and chat) and the proof-of-sender rule.

*For the owner who runs the business **on the move** — checks a phone, never a desktop, lives in WhatsApp and email.
The interface is not an app they open; it is the **conversation the system already has with them.** A mobile-shaped
lens over the one [Distributed ERP](DistributedERP.md) model — sibling to [The POS Lens](POSLens.md) (the in-person
edge) and [The WMS/Logistics/Robot Lenses](WMSLens.md) (the movement edge).*

---

## 0. The persona — always on the move

The owner is at a supplier, in a van, on a site, at lunch. There is no desktop and no "let me log in later." The
only surface is the phone, and the only apps they reliably open are the ones everyone opens: **WhatsApp, email,
maybe Telegram.** So the ERP cannot wait in a portal for them to visit. It must **come to them**, in the channel
they already check, glanceable in two seconds and answerable with a thumb.

This is the same doctrine as everything else — *one model, many lenses* — but the lens is now a **social platform**,
and the design constraint is *mobile-only, attention-scarce, on-the-move.*

## 1. The principle — the platform is the lens

We already use email/WhatsApp as the *transport* (the dumb post office, [WMSLens §7](WMSLens.md)). The Social
Platform Lens takes the next step: **the platform is also the interface.** The system **sends to** the owner and
**receives from** them, and that exchange *is* the ERP interaction. No app to install, nothing to learn — the
conversation is the UI.

`SEND == reply == VERB`: a reply is a dispatch. The fold pushes what needs attention; the owner answers with a
decision; the loop closes. **The inbox/chat thread is the worklist.**

## 2. Send and receive — the ERP as a conversation

**The system SENDS (the fold decides what's worth a ping):**
- end-of-day summary ("Today: 47 sales, RM2,310; low: sauce, buns");
- an approval request ("Reorder 50× SKU123 from NextDoor — approve? **[Yes] [No]**");
- an exception ("Bin A3 short by 3 on count"); a new wholesale order; a delivery confirmation.

**The owner RECEIVES and REPLIES (each reply is a signed party-act):**
- tap **Yes** → the PO dispatches (a canned email to the supplier, [POSLens §6](POSLens.md));
- send a canned order; forward a supplier's email; snap a photo of a delivery (proof + provenance);
- a voice note → transcribed, AI-parsed, confirmed.

The fold pushes *only* what needs a human — an approval, an exception, a digest. Everything deterministic (backflush,
on-hand, the reorder *quantity*) is already computed; the owner is asked only for the *judgement* the fold can't make.
That keeps it glanceable, not noisy.

## 2a. A TikTok of ERP — a feed of one-tap cards (riding native intents)

Forget the dense iDempiere grid — that is a *desktop* artifact. On the move, the ERP is a **feed**: glanceable cards
you flick through, each a record or an exception, each actionable in a single tap. *A TikTok of ERP* — the data is the
same fold, shaped as a scrollable mobile feed instead of a table. The feed shows what needs you (a customer to call,
an order to approve, a stock exception); you act and flick on.

**Action icons ride the phone's native intents — zero integration.** The principle generalizes: **the phone is a
pre-installed suite of killer apps, and every field on a record is a latent verb that hands off to its native one.**
The ERP builds none of them; it routes each datum to the guaranteed app that already handles it:

| Field on the card | Tap → native intent | Killer app it rides |
|---|---|---|
| phone | `tel:` / `wa.me` / `sms:` | dialer / WhatsApp / SMS |
| address / locator | `geo:` / maps / **BIM floor** | maps (street) → viewer (bin) |
| email | `mailto:?subject=…&body=…` | mail (canned message) |
| website | `https://` | browser |
| product / item | scan / `BarcodeDetector` / photo | camera / scanner |
| invoice / receipt | PDF + **OS share sheet** | share to anyone, print |
| amount due | payment deep-link / pay-QR | wallet (GrabPay/Alipay/Stripe) |
| appointment / slot | calendar intent | Calendar (booking, delivery window) |
| contact | vCard "add to contacts" | Contacts |
| this location now | GPS capture | proof-of-presence / PoD |
| note | mic → voice | voice → AI-parse |
| signature | sign-on-glass | e-sign |

**Location is scale-aware:** the same 📍 resolves a *customer* address to street maps/navigation, a *delivery* to the
route, and a *bin/locator* to the BIM or schematic warehouse floor ([WMSLens](WMSLens.md)) — one icon, the resolver
picks the spatial view that fits the record's granularity.

You build no dialer, messenger, map, or wallet — you **emit a universal intent every phone already honors**, and the
killer app does the work. "Use what is guaranteed" + "ride killer apps" converge at the *action* layer: the device
*is* the app suite, the ERP is glue. `SEND == tap == VERB`, the verb handed to the phone's built-in app.

**It folds back:** tapping an action appends an activity op (*contacted*, *messaged*) — the CRM history writes itself.
Honest boundary: the web can *launch* the intent but can't *verify* the call/message completed (privacy sandbox), so
the log records **"initiated"** — confirmed two-sided only when a reply returns through the channel. The tap is the
witnessable fact; completion is a claim until the counterparty answers.

## 3. The richness spectrum — same model, pick by what they open

The owner's "UI" is whatever they actually open, and the lens meets them there:

| Lens | Surface | When |
|---|---|---|
| **Rich mobile UI** | a browser/PWA lens on the phone (POS, dashboard) | when they want the full picture |
| **Email** | canned + filtered (Email-ERP) | structured B2B orders, digests, audit trail |
| **Just chat** | WhatsApp / Telegram — notifications + button replies + canned orders | the leanest: the owner who *only* checks chat |

These are *tiers of richness over the same fold*, not three products. The owner who only ever opens WhatsApp still
runs a full ERP — approvals, orders, reports — through chat alone. The one who wants the grid opens the PWA. Same
model, social-shaped lens, no re-platform between them.

## 4. Mobile-first mechanics

- **Glanceable** — a message read in two seconds; the digest is a line, not a report.
- **Thumb-answerable** — interactive buttons (WhatsApp Business buttons / Telegram inline keyboards) for Yes/No/pick,
  so a decision is one tap, not typing.
- **Voice & photo** — a voice note becomes a parsed order; a snapped photo is the receipt or proof-of-delivery.
  Literacy-light and on-the-move-friendly, the same accessibility win as the QR scan.
- **Notify only the actionable** — the fold surfaces exceptions and decisions, never a feed to scroll. No fatigue.

## 5. How it stays honest (the doctrine holds on a chat thread)

- **Secure the fact, not the container.** Chat/email identity is spoofable, so the op is **signed**; an approval is
  bound to the owner's known number/address plus a token. A reply is a *claim* until matched/confirmed — two-sided,
  exactly the parties rule, on a phone.
- **Non-invent.** Replies map to **canned actions or master references**; free-text and voice are **AI-parsed against
  the master** with `error_report.js` discipline — low-confidence becomes a *flagged question back to the owner*, never
  a guessed order. ("Did you mean 50× SKU123? [Yes] [No]")
- **Use what is guaranteed.** WhatsApp/email/Telegram are world-standard, mobile, always-on — ride them; the server
  deletes itself. Double up across two independent channels for free (the fold is idempotent; the same op via two
  channels dedupes by UUID).
- **No central control.** The platform is the relay; the fold is the truth; any node folds the same thread.

## 6. Honest edges

- **WhatsApp automation is constrained.** Outbound notifications need the **Business API**, pre-approved message
  templates, and respect the 24-hour customer-service window and rate limits. So WhatsApp = widest *reach* but
  tightest *automation*; **Telegram** (open bot API) and **email** are the frictionless automatable channels. Don't
  promise trivial personal-WhatsApp bot automation — it violates ToS. Use the Business API properly or lead with
  Telegram/email and offer WhatsApp where the rules allow.
- **High-value actions deserve a stronger confirm.** A one-tap "Yes" is fine for a routine reorder; approving a large
  PO may warrant a signed tap in a mini-app or a second-channel confirmation. Scale the friction to the stakes.
- **Identity binding.** A known number/address is a weak credential; pair it with a per-action token and the signature
  for anything that moves money or stock.

## 7. The lens family — features ready to adapt

Each item is a **lens** (a view/conversation) or a **provider** (an input channel) over the *same* model — glue, not
a new engine.

| Feature | Kind | Status |
|---|---|---|
| Push digest / EOD to chat or email | lens (outbound) | shelf — adapt on demand |
| Approval request + button reply | lens (two-way) | shelf — `SEND==reply==VERB` |
| Canned order by email (Email-ERP) | provider + lens | shelf — rides existing B2B behavior |
| Chat order (WhatsApp/Telegram) | lens (`chat_lens`) | partly built — chat_lens exists |
| Voice note → parsed order | provider (AI-parse) | shelf — ErrorReport-gated |
| Photo receipt / proof-of-delivery | provider (camera) | shelf — same as POS snap |
| Rich mobile PWA dashboard | lens (browser) | shelf — the full-picture view |

**A parts shelf, not a build queue.** Pull the channel a real owner actually opens; leave the rest ready. The
on-the-move owner who lives in WhatsApp gets the chat tier; the one who wants the grid gets the PWA — same fold.

## 8. Honest scope

- **Proven / real:** email comm through iDempiere's API (tested historically); `chat_lens` exists in the suite; the
  fold/model it rides is the same one the POS and WMS lenses ride.
- **Specified, not yet built:** the social adapters (WhatsApp Business / Telegram bot / email-template) and the
  push-decide-confirm loop, each over the frozen engine seam (`window.ERP`), gated on the front-end write-path. This
  is a *lens* over the proven model — it rides existing behavior (people already run their business from their phone),
  so demand is pre-proven; it is not a separate system.
- **Discipline:** the in-person front door stays the POS; this is the *same owner's* on-the-move lens, one more step
  on the staircase, built when a real owner reaches for it — not all channels at once.

The promise, plainly: **the owner never opens an ERP — the ERP reaches them where they already are, asks only the one
question the fold can't answer, and takes a thumb-tap as a signed act.** Mobile-only, channel-guaranteed, on the move.

---

*Companions:* [POSLens.md](POSLens.md) (in-person edge) · [WMSLens.md](WMSLens.md) (movement edge) ·
[DistributedERP.md](DistributedERP.md) (the doctrine). *Channels:* WhatsApp Business API · Telegram Bot API ·
standard email (SMTP/IMAP) — ride the world standards; secure the fact, not the container.
