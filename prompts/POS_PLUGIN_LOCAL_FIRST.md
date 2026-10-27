# POS as a plugin, a local-first till (Unicenta reborn), and the head-office day close — SPEC FOR LATER

```
# ⚠ DO NOT REMOVE — Scope & protocol. Read the log after EVERY run before any conclusion.
# SCOPE: (1) package the POS lens as a plugin; (2) turn the till into a local-first app that DEPOSITS tickets
#   (it never completes core documents); (3) an opt-in one-click "branch day close" at head office that chains
#   the SAME legacy processes. Nothing is built from this file until the owner says go on a phase.
# RULES: TWIN CARDINAL RULE (the default ERP = legacy, L&F included; a friendlier op is an opt-in lens) ·
#   AD-LAYER LAW (port the mechanism, one implementation per responsibility, deletion budget, X of N) ·
#   IMMUTABLE TWIN PRINCIPLE (local first, minimal relay; TEAMWORK_FRAMEWORK top) · FL-8 (one DocAction executor).
#   Spec before code · RED first · a mutant must prove it applied, a crash is not a kill · witness, never eyes.
# RELATED (read, do not duplicate): prompts/POS_SHOWCASE_LANE.md (the register/KDS/kiosk/tender UI lane) ·
#   docs/internal/POS_ADDON_SPEC.md (the 2012 Unicenta loop as folds) · prompts/ERP_FRIENDLY_OPS_LENS.md
#   (friendlier ops = opt-in lens, measured) · prompts/TEAM_REPLICATION_PLUGIN_STUDY.md §13-§14 (the chain, the
#   owner's operating model) · prompts/TEAMWORK_FRAMEWORK.md §38 (gap register G-1…G-21).
```

## §0 The owner's words (2026-10-28)
> *"Also consider if we should have the typical ERPNext Friendlier plugin benefit of unified in single batch process. Or maintain them as part of Unicenta POS plugin. I remember back that Unicenta POS on client side is its own client touch screen app. Since we did a POS lens in our twin as a pill we can rethink this. 1. Should it be a plugin too or stay as one off demo? 2. Build a local first version of our Unicenta POS. This can be spec'd in a prompts/# for later."*

Before that (study §14): *"These are separate ops by dedicated roles … An admin or clerical person does the import of branches data already deposited by respective POS stations Orgs. Then stocks are checked via that report. A process confirm proceeds their movement or purchase order creation. … Mfg Order is optional … We merely twin them."*

**Owner correction, same day:** *"By right, if we are to follow legacy, that POS was my early days overlooked that it should be as described above - Unicenta POS with its kitchen screen standalone."* ⇒ The target is **legacy's shape: a standalone till app and a standalone kitchen screen** (Unicenta oPOS and its kitchen display), each its own app on its own device. Neither is a pill inside the ERP window. The in-ERP POS pill (M1-M4) was an early shortcut and is **superseded**, not extended. This decides Q1 below and reorders the phases.

## §1 Measured today (bim-ootb main @c2dbc70c, 2026-10-28)
| # | Fact | Where |
|---|---|---|
| M1 | The POS lens is **built-in host code**, not a plugin: two script tags plus a pill gated `showWhen: pos-station` | `erp/idempiere.html:706` `pos_core.js?v=3`, `:714` `pos_lens.js?v=11` |
| M2 | The till **completes the sale itself**: `completeOrder` → `SET_STATUS CO`, then the shipment and the invoice (WR fan-out) in one group, committed on the till. Under FL-8 and the owner's model (§0: stations *deposit*, head office *imports*), that makes every till a DocAction executor | `erp/pos_core.js:70-139` |
| M3 | The till also composes **its own engine verbs** (`erp_engine` `buildDoc/completeOrder/completeInvoice/explodeBOM`, `ALLOWED_VERBS`), not the ported legacy model classes (`model_order.js` etc.) — a second path for a core document | `erp/pos_core.js:7-8, :41` |
| M4 | `pos_core.replenishSuggest` / `buildReplenishPO` = a **second replenishment formula** beside the ported legacy Replenish Report (AD_Process 53267, `erp/processes/ReplenishReportProduction.js`, 860 legacy lines) | `pos_core.js`; AD-LAYER LAW 5 |
| M5 | The ERPNext/Odoo-style precedent already exists AS A PLUGIN: `erp/plugins/friendly_ops.mjs` (`org.kernel.friendly-ops`) stages `AD_Process`, `AD_Process_Para`, `AD_Process_Access`, `AD_ToolBarButton` rows (`manifest.dictionary`), opt-in, measured by gestures/screens/fields with books diff 0 | `friendly_ops.mjs:16-55`; `ERP_FRIENDLY_OPS_LENS.md` §1-§2 |
| M6 | The deposit path is built and live: station `I_Order` rows travel, the ported **Import Orders** (206) makes ONE completed order at head office, the order comes back. `I_Order.PriceActual` is honoured (the ticket's price is the order's price) | study §13.5; `ImportOrder.js:345-346` (= `ImportOrder.java:750-751`) |
| M7 | Payments have the same legacy shape: `I_Payment` (AD_Table 597, AccessLevel 2) + **Import Payment** (AD_Process 343, `org.compiere.process.ImportPayment`) are in the seed dictionary; **not ported** (`erp/processes/` has only `ImportOrder.js` of the Import* family). `I_BankStatement` / Import Bank Statement (221) likewise | seed `ad_table`, `ad_process` |
| M8 | Unicenta 2012 = a fat Java touch-screen client with **its own database** (tickets, payments, closed cash), an ActiveMQ queue per station, the AutoBOMOrder backflush plugin and the Replenishment Report at iDempiere | `docs/internal/POS_ADDON_SPEC.md` §0, `:36-46` |

## §2 Recommendations
### §2.1 Q1 — the POS lens: neither plugin nor demo; RETIRED in favour of the standalone apps (owner correction, §0)
**Decided by the owner's correction:** the till and the kitchen screen are **standalone apps** (own entry pages, own local store, installable, offline), as Unicenta and its kitchen display were. Each device pairs into the team as a Team device of its branch Org, so the till app is the POS "plugin" in legacy's sense: an add-on outside the ERP, connected by data, not code. The ERP side keeps only what head office needs, and that is core/legacy already (Import Orders, Import Payment, Replenish Report) plus the friendly-ops day close (§2.3). **Deletion budget:** the in-ERP POS pill (`idempiere.html:706,714` script tags, the `pos-station` pill gate), `pos_core.js`'s complete-on-the-till path (M2/M3) and `replenishSuggest` (M4) are removed once the standalone till reaches the same ring/receipt features. W-POS-OFF: the ERP page without them is byte-identical to one that never had them.
**Kitchen screen (KDS):** a second standalone app in the same branch. It receives the till's ticket lines and sends back "bumped / ready". This is a **branch-local flow** (till ⇄ kitchen) that never waits on head office: a plan row with audience = the branch, not the space. Today's KDS is a 2nd ERP tab (`POS_SHOWCASE_LANE.md` §P2); it moves into its own app. How Unicenta's kitchen display actually receives orders (shared database, printer queue or network) is **extracted from Unicenta's source in P0**, not assumed.
### §2.2 Q2 — a local-first Unicenta: the till deposits, it never completes
**The till is its own app** (as Unicenta was, owner §0): a touch-screen page with its own local store, fully offline, outside the ERP window. It keeps what Unicenta kept (the open ticket, its lines, tenders, the receipt, the cash drawer and the close-cash count). It **deposits** declarations through Team (minimal relay, FL-1):
- the ticket as `I_Order` rows (built, M6; the price paid travels as `PriceActual`; DocTypeName e.g. *POS Order*, `IsSOTrx='Y'`, study §13.5 finding 4);
- the tenders as `I_Payment` rows (needs the Import Payment port, M7 — the same pattern as Import Orders);
- the close-cash as a declaration (row shape TBD, owner Q-c).

It **reads** master data down (products, prices, taxes: read-only plan flows) to price the receipt with the core's own functions. It writes no `C_Order`/`M_InOut`/`C_Invoice`/`Fact_Acct`. **The head office owns every document** (FL-8, §14).

**Reuse the front end, replace the back end:** the ring UI, album cards, KDS, kiosk, modifiers and tender screens (`POS_SHOWCASE_LANE.md` P1-P5) stay. `pos_core`'s complete-on-the-till path (M2/M3) and its own replenishment formula (M4) are DELETED in the same change (deletion budget). Backflush (AutoBOMOrder) then happens where the order is completed, at head office. **Divergence named in advance:** a receipt total is the till's arithmetic; the order total is head office's (derived, FL-2). `PriceActual` keeps them equal for price, while tax rounding must be judged by a witness (receipt total == imported order GrandTotal, to the cent).
### §2.3 The ERPNext-style one-click "branch day close" — a friendly-ops op at head office, NOT inside the POS plugin
**Recommend: both, layered.** The legacy operations stay separate, each run by its own role and schedule (the default; the twin, §14). An opt-in friendly-ops process "**Branch Day Close**" (dictionary rows staged by `org.kernel.friendly-ops`, the M5 pattern) runs the SAME ported processes in legacy order for the branches chosen:

1. Import Orders (206, DocAction CO)
2. Import Payment (343, once ported)
3. Replenish Report (53267) for the branch warehouses
4. the report's confirm create (Movement / Purchase Order)

Each step is shown with its own result; the close stops at the first error; every step stays runnable alone. It belongs to friendly-ops, not the POS plugin: it is a head-office office operation by head-office roles, and a site without the POS plugin (importing from another till system) wants it too. **Acceptance (W-DAYCLOSE):** the one-click run and the four separate runs over the same deposits give identical books and stock (`fact_acct`, `m_storageonhand`, `m_movement`, `c_order` diff = 0); the gestures G and screens S are measured before and after (`ERP_FRIENDLY_OPS_LENS.md` §2).
### §2.4 Manufacturing (optional, unchanged)
LiberoMfg (`erp/plugins/libero_*`) or legacy's simple Production (e.g. Patio Furniture: components → parent in stock). Replenish Report's production create mode is already refused as named in the port (not core).

## §3 Phases (each: spec → RED witness → build → witness → log read; the owner's go per phase)
| Phase | What | Witness |
|---|---|---|
| P0 | **Extract, no code:** Unicenta oPOS's own screens, its local tables (ticket, lines, tenders, closed cash) and how its kitchen display receives orders (source, not memory); X of N `pos_lens`/`pos_core` features worth carrying into the standalone till; the tax rounding of a receipt vs an imported order; what Import Payment needs (legacy source lines, the model classes it calls) | evidence log |
| P1 | **The standalone till app** (own entry page, own store, offline cache, pairs as a Team device of its branch Org), depositing `I_Order` (+ the ring/receipt UI carried over) | W-TILL-DEPOSIT (receipt total == imported GrandTotal to the cent; the till wrote 0 core-document rows) + W-TILL-OFFLINE (a full shift with the network off; deposits arrive at the next Visit; nothing lost, nothing doubled) |
| P2 | **The standalone kitchen screen**: a branch-local flow till ⇄ kitchen (lines in, bump/ready out), never waiting on head office | W-KDS-BRANCH (a line reaches the kitchen and a bump reaches the till with head office offline) |
| P3 | **Port Import Payment** (343) verbatim, `I_Payment` boot overlay (the B1 route: base hash unchanged) | W-IMPORT-PAYMENT (the W-IMPORT-ORDER pattern) |
| P4 | **Retire the in-ERP POS pill**: script tags, pill gate, `pos_core` complete path, `replenishSuggest` deleted | W-POS-OFF (the ERP page byte-identical to one that never had them) |
| P5 | **Branch Day Close** in friendly-ops | W-DAYCLOSE (one click == four separate runs, books diff 0; G/S measured) |
| P6 | the film (till + kitchen at the branch → clerk imports at head office → day close / replenish → movement back) | follows W-HQ-CLERK (study §14) |

## §4 Owner questions (decide, or say "decide for me")
- **Q-a (tenders):** deposit tenders as `I_Payment` rows for Import Payment (legacy, recommended), or inside the ticket?
- **Q-b (stock on the till):** may the till show availability, read-only from head office's last published snapshot (offline it can be stale), or no stock display at all?
- **Q-c (close cash):** Unicenta's close-cash count: a declaration head office books (cash journal / bank statement import), or till-only?
- **Q-d (screens):** the till's screens — Unicenta's own layout (parity, the twin habit), or carry our lens design (`POS_SHOWCASE_LANE.md` P1-P5) into the standalone app? Recommendation: Unicenta's layout and flow as the base (twin), our modern touches (album cards, QR tender) only where Unicenta has an equivalent screen.
