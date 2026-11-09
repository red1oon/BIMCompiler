# ⚠ DO NOT REMOVE — Scope guard
> **Lane (2026-11-09):** this file is one part of the ONE-DOOR framework (Actor | Channel | One door | Engine). Home and lane map: `prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md` §0. Column owned here: CHANNEL (mobile chat).
# Scope: a NEW LENS over the SAME op-log engine — the ERP rendered as a chat surface
#        (WhatsApp/Telegram-shaped), MOBILE-FIRST. The op-log IS the message stream: kernel_ops
#        (op_uuid, timestamp, op_type, parameters, output_guid, user_tag) == (id, time, verb,
#        content, thread, sender). A document = a thread; an op = a message; a DocAction = a reply;
#        the signature = the verified tick. This is the most NATIVE lens: the UI's structure ==
#        the engine's structure. It is ONE MORE FOLD, not a new engine.
# NON-NEGOTIABLE: spec-first; witness-led (each test NAMES the issue it proves); §-log first (READ
#        the log before any conclusion); deterministic / non-invent (every message folds from a real
#        kernel_ops / AD / glassbowl_data.db row — absent → labelled "absent", never fabricated).
#        REUSE the proven engine via the seam (ENGINE_CONTRACT read/dispatch/verify) + the proven
#        overlays (UI_OVERLAY_GOVERNANCE keyed-over-tagged) — NO fork of a verb, NO new verb.
#        EXPLICIT GO before any deploy.
# Lane: GATED, mobile-first, OUT OF the in-progress sessions' way (idempiere desktop renderer #1,
#        login/role session, record-panel). Reaches the engine only via the seam; touches no desktop
#        chrome. Behind a flag / its own page so concurrent desktop work never collides.
# Read first: docs/ENGINE_CONTRACT.md (the seam) · prompts/UI_OVERLAY_GOVERNANCE.md (keyed overlays)
#        · scripts/erp_kernel.js (kernel_ops shape + Kernel.apply/replay) · prompts/idempiereUI.md
#        (the lens family) · docs/PILL_MANIFEST_SPEC.md (pills = the flip controls).

---

# Mobile Chat Lens — the ERP as a conversation (renderer over the op-log)

## The thesis (why this is the most honest lens, not a skin)
Grid renders the op-log as current-state rows; Gravity renders it as the FK graph. **Chat renders
the op-log AS ITSELF** — a time-ordered, signed, multi-party event stream. `kernel_ops` is already
a message table. So the chat lens is the one place where the interface and the architecture stop
being two things: the same log that renders as a grid renders as a WhatsApp thread with ZERO engine
change. That is the strongest demonstration of "the UI was never the product."

**North star — invisible ERP:** as Alibaba/WeChat-QR made commerce ambient, the ERP dissolves into
the channels people already use — chat, QR, email. The end state is not "open the ERP" but events
happening in the medium you are already in (answering an email = a cited op; scanning a QR = a
product lookup). The lens is the on-ramp to invisibility. (Free-text → authoritative act always
goes through propose→confirm / cite-the-source; the signed op-log records confirmed acts only.)

Mobile-first because: (1) mobile ERP has always been miserable (cramped grids); chat is the ONE
paradigm natively excellent on a phone; (2) the mobile worker's job IS the conversational slice —
approvals, status, "did this ship?", field updates (the Pareto 20% chat is built for); (3) offline /
intermittent / merge is what chat apps AND the op-log are both built for.

## The mapping (each is a fold, non-invent)
| Chat element | ERP fold | Source |
|---|---|---|
| Thread | a document's lifecycle | `kernel_ops` for one `output_guid` (+ its source row) |
| Message | one op | `op_type`→verb label · `parameters.payload`→body · `timestamp` · `user_tag`→sender |
| Verified tick (✓/🔒) | op is signed + chain-verified | `kernel_ops` sign/seal (W-CRUD-WRITELOOP, proven) |
| Reply / send | a DocAction | `dispatch(SET_STATUS)` via the seam — send gesture == verb (NO new verb) |
| Thread list / inbox | work queue (push, not pull) | ops needing this role's action, ranked (the feed idea) |
| @mention / assign | route an op to a role | `AD_Window_Access` / role ctx |
| Attachment | the record detail / lines | `document_lines` / the source doc |
| Group | an org / project / doc with N actors | role ctx · participants = access |

## Controls ARE pills (the flips = registry entries, not bespoke chrome) — feedback/non-invent
The view toggles are `pills.json` rows driven by `pill_builder.js` — pills are DATA:
- **Recent Changes** — show the latest ops across threads (the change feed).
- **Replay** — scrub/re-play a thread's op-log from t0 (event-sourcing made visible; swiped messages
  RETURN because the log is the source of truth and `Kernel.replay` is exact).
- **Anchor** — pin a focal entity (a BPartner, e.g. "Joe Block") → line up ALL related messages/docs:
  last action · outstanding (open docstatus) · docs matching the chooser's criteria.
- **Chooser** — the criteria selector that drives which threads/docs line up under the anchor.
- **Install** — the cold-start door. A registry pill (download/plug glyph) whose `fn` opens the EXISTING
  migrate dialog (`erp/migrate_showme.js`, owned by `prompts/MIGRATE_SHOWME_OVERLAY.md` — REUSE, do NOT
  fork) with a **source selector**: *iDempiere PG/Docker* (LIVE — `migrate_pg_to_sqlite.js --masters`) ·
  *Odoo PG* (honest-planned — JSON-RPC read+fold PROVEN `4042fe85`; master extractor not built yet).
  This is the chat-shaped onboarding move (master cold-start = THE ERP pain, §adoption killer above):
  the install pill sits beside contact-import as the two ways to fill the ERP. Pill is DATA
  (`{ id:'install', icon:'…', fn: openMigrateDialog }`), not bespoke chrome — [[feedback_no_invent_rules]].
  Witness `§INSTALL-PILL present=Y registry=pills.json opens=migrate-dialog` +
  `§INSTALL-SOURCE options=[idempiere:live,odoo:planned] selected=<s>`. Lens lane adds the trigger + the
  source-selector UI only; the dialog + the Odoo extractor stay with the overlay/backend owners.
Swipe-off = a VIEW dismissal (a dismissed-set), never a delete; a flip (Recent Changes / Replay)
restores them. The op-log is NEVER mutated by a view action.

## Auth = SSO (real auth, delegated — the honest upgrade) — [[feedback_no_hype]]
The desktop renderer is "identity SELECTION, not auth" (no server). The mobile lens uses **SSO
(OIDC via an accepted IdP — Google / Microsoft / Okta)**: REAL authentication you do NOT build a
server for — you delegate it. The returned identity binds to an `AD_User` → drives the existing
role/client/org scope fold (`idmp_session.buildContext`). SSO is "accepted" (enterprises expect it)
AND it is the strongest honest auth story so far. (Device-protected sign-in is a fallback; SSO is
preferred because accepted + maps to the role machinery already built.)

## The adoption killer — fill the ERP from the contacts you already have (HONEST API reality)
A chat-shaped app makes contact import feel native, and master-data cold-start is THE ERP onboarding
pain. So: import contacts → `C_BPartner`; share documents out → the channels people already use.
**Non-invent on what is actually reachable ([[feedback_no_hype]]):**
- **REAL / sanctioned import:** Google Contacts (People API — the SAME OAuth grant as Google SSO),
  Microsoft Graph contacts (MS SSO), device **vCard**, email (Gmail/IMAP). These are buildable.
- **FB / WhatsApp:** NO sanctioned contact-pull API (Meta locked these down). Honest path =
  user-initiated **share-IN** / vCard import, NOT an API harvest. Spec it as share-in-only; never
  claim a FB/WA contact API.
- **Share OUT:** reuse the existing share sheet ([[project_share_sheet]], Web Share API) — a doc /
  thread shares to WhatsApp/email/etc. as a link or card.
Each import is a fold into a BPartner row through the engine seam (signed op), never a silent write.

## Delight = the familiar chat affordances (make usage pleasant)
Familiar messaging audio (send swoosh / receive ding / sent-tick), swipe gestures, pull-to-refresh,
typing/▶ pending→confirmed transitions. These map the engine's states (queued→signed→verified) onto
interactions billions already understand — the trust property becomes legible WITHOUT explaining
crypto. Opt-in / mutable (governance: off = zero affordance).

---

## POC-1 (THIS session — the falsifiable engine claim, headless, real data)
Prove the chat lens is a **faithful, deterministic, dismissible, anchorable fold over the REAL
op-log** — the engine-side falsifier. The visual mobile page + pills + SSO + import/export are LATER
builds (renderer lane, bim-ootb/erp, gated, EXPLICIT GO); they are NOT POC-1.

- Source a REAL document (C_Invoice#103: bpartner 117, 3 lines, grandtotal 161.12) from
  `build/erp/glassbowl_data.db`; build its lifecycle as REAL ops (CREATE_DOCUMENT, CREATE_LINE×3,
  SET_STATUS DR→CO) — values + audit actors (`createdby`/`updatedby`) folded from real rows, ids
  pre-stamped deterministically. Commit via the PROVEN `Kernel.apply` (no fork, no new verb).
- Fold `kernel_ops` → a message thread; replay via `Kernel.replay`; dismiss/restore as a view set;
  anchor over `glassbowl_data.db` FKs.
- **Posted message = honest coverage degrade:** `fact_acct` in this extract has NO per-doc linkage
  → render "books balanced at client level (ΣDr=ΣCr=46574.97); per-doc posting needs local install"
  — `coverage:partial`, NEVER a fabricated per-doc journal. This showcases the degrade principle IN
  the lens.

### Witnesses (§-log first → `build/erp/poc_chat.log`; READ before concluding)
- `§CHAT-THREAD doc=C_Invoice#103 msgs=N source=kernel_ops handAuthored=0` — a real doc folds into N
  messages, each traced to a real op (sender=`user_tag`, verb=`op_type`, time=`timestamp`).
- `§CHAT-REPLAY ops=N liveHash=… replayHash=… equal=Y deterministic=Y` — the thread is reproducible
  from the log alone (event sourcing); swiped messages return because the log is the source.
- `§CHAT-DISMISS swiped=k visible=N-k flip=RecentChanges→visible=N restored=Y logRows=N unchanged=Y`
  — swipe is a view filter; the pill restores; the op-log row count is untouched.
- `§CHAT-ANCHOR entity=<bpartner> relatedDocs=D lastAction=<verb@t> outstanding=O source=FK-fold
  handAuthored=0` — the anchor lines up real related docs (pick the richest bpartner at runtime).
- `§CHAT-COVERAGE posted source=fact_acct coverage=partial note="install local for per-doc" fabricated=0`
  — the degrade state is explicit; never a silent empty, never an invented total.

### Out of scope POC-1 (named, [[feedback_listen_first]])
The mobile DOM/chat-bubble page, pill wiring, SSO/OIDC flow, contact import (Google People/vCard),
share-out, audio. Each is its own bounded build with its own witness + EXPLICIT GO. POC-1 proves the
DATA claim (the lens is a faithful fold) — the only thing that, if false, kills the lens.

## Future waves (named, NOT built — honest scope)
- **The phone as the killer device (near-term):** GPS · camera · always-attached-to-user (as in the
  BIM viewer). Sensors become native ERP inputs — GPS → org/site/warehouse context; camera → QR /
  barcode → product lookup, photo → receiving/inspection evidence (an attachment op). "TikTok broke
  the desktop gate": mobile is the primary surface; the job is NAVIGATION, not a desktop port. Each
  sensor input is a fold/attachment through the seam (signed op), never a silent write.
- **Intent detection — the next wave (PROPOSE-only, [[feedback_no_invent_clash]]):** classify an
  inbound media/message as product-inquiry vs buy-decision (what FB Messenger / WA Business already
  do) and turn it into ERP records. **NON-INVENT GUARDRAIL:** classification is PROBABILISTIC — it
  may only PROPOSE a draft document a human CONFIRMS; it must NEVER silently commit a buy decision as
  authoritative fact. The signed op-log records confirmed acts ONLY. "Silent integration" = a draft
  surfaced in the thread, not an auto-posted order. Witness any such feature with a confirm-gate.

## Status
KICKOFF + POC-1 (engine lane, headless), 2026-06-02. Reuses `scripts/erp_kernel.js` (apply/replay,
proven) over `build/erp/glassbowl_data.db` (real). No fork, no new verb, no deploy. Produces
`scripts/poc_chat.js` + `build/erp/poc_chat.log` + the §-witnesses above.
