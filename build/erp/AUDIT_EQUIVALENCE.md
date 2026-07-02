# AUDIT_EQUIVALENCE — adversarial pass over the "== iDempiere to the cent" claims

> **Role:** verified-skeptic (per `prompts/ADVERSARIAL_EQUIVALENCE_AUDIT.md`). READ-ONLY w.r.t. the FOLD / H-3 / UI-bridge / docs lanes — this file + `build/erp/audit_*.log` are the only writes. Every verdict traces to a **re-run `§`-log line** (`build/erp/audit_<name>.log`, regenerated 2026-06-10 on `feat/erp-substrate-phase012`) or a **quoted live query**. Nothing is taken from the prose of the doc under audit.
>
> **Branch:** `feat/erp-substrate-phase012` · **Witnesses re-run:** 22 (18 fold + 4 H-3), all exit 0 · **Oracles probed:** `build/erp/glassbowl_data.db` (fold `fact_acct`) + live Docker Postgres `idempiere_test` (fold provenance, client 11) + `idempiere` (H-3 declarative).
>
> **Correction note (2026-06-10):** two cross-cutting "honesty gap" findings in this audit's first pass — a fold-oracle provenance gap and an unverified doc-109 edit excuse — were **REFUTED on re-check** (I had queried the wrong database and the wrong audit column). They are recorded below as **PASSED** provenance checks, with the evidence that overturned them. The one finding that survives is **F-TIER-1**.

---

## 0 · Headline

The strong core is **real, well-built, and live-cross-checkable**: the order→ship→invoice→match→pay→allocate trade loop, the inventory qty-spine, and GL movement/journal/reverse all **fold from source documents and diff to the cent against an independent product** (`fact_acct` posted by iDempiere's own Java). I independently re-confirmed that the captured fold oracle **matches the live posted ledger exactly** (`glassbowl_data.db.fact_acct` == `idempiere_test.fact_acct`, client 11: 300 rows, `ΣDr=ΣCr=46574.97`, table 224 = 8 rows/370.00). The two "named drift" excuses (doc-109, callout-119) are **verified post-edit artifacts**, not convenient hand-waves.

**One finding survives the pass — F-TIER-1.** The single `✅ oracle-equivalent` badge in `ERP_COVERAGE_MATRIX.md` is worn by **two different epistemic classes**:

- **Class A (~16 rows) — fold vs independent product.** Our derivation vs `fact_acct` that iDempiere's Java posted. Two independent producers of the same number. *This is the grail and it holds.*
- **Class B (4 rows) — H-3 declarative vs config read-back.** And on inspection, **2 of the 4 reduce to "the same SQL evaluated on SQLite and on Postgres over copied data" (SQLite==Postgres), not engine==iDempiere.** Counting them in the same "20" overstates the headline.

So the exposure is narrow and entirely in the **H-3 declarative quartile + the headline arithmetic** — not in the fold core.

---

## 1 · Per-claim verdicts

Tier-as-stated is from the matrix/scorecard; **verdict** is this audit's. Evidence = a re-run `§` line (`build/erp/audit_*.log`) or a quoted query.

### 1a · FOLD — Class A (derivation vs real `fact_acct`, an independent product)

| Claim (witness) | Tier-stated | Refutations applied | **Verdict** | Evidence | Hardening (if any) |
|---|---|---|---|---|---|
| **W-FOLD-COMPLETE** `poc_fold_complete` | oracle-equiv | TAUTOLOGY, FALSIFIER, TIER, EXCUSE | **SOLID** | `§FOLD-COMPLETE …invMaxDiff=0c(EQUIVALENT)…oracle=iDempiere` ×3; `§FALSIFIER drop-receivable-DR maxDiff=5035c`. Oracle = `fact_acct(318)`/`(319)`; doc-109 drift **verified** (see Provenance §A). | — |
| **W-FOLD-PAYMENT** `poc_money_post` | oracle-equiv | FALSIFIER | **SOLID** | 2/2 == `fact_acct(335)` `maxDiff=0c`; falsifier drops DR → diff≠0. | — |
| **W-FOLD-ALLOC** `poc_alloc_post` | oracle-equiv | UNFALSIFIED (HALF_UP) | **SOLID** | `§FALSIFIER truncate…naive=10c proper=11c oracle=11c` — HALF_UP **is** the hard case and the oracle confirms 11c. | — |
| **W-FOLD-ALLOC-FX** `poc_alloc_fx` | oracle-equiv | UNFALSIFIED (FX rounding) | **SOLID** | `§FOLD-COMPLETE …id=101…currencyBalancing=1c…maxDiff=0c` — a genuine 1c HALF_UP residual exists in seed → FX rounding exercised; `§FALSIFIER-B wrong-rate`. | — |
| **W-FOLD-QTYONHAND** `poc_qtyonhand` | oracle-equiv | TAUTOLOGY | **SOLID** | TWO independent oracles: sign rule 28/28 (`m_transaction`) + accumulation 20/20 (`m_storageonhand`), separate code paths; both falsifiers fire. | — |
| **W-FOLD-REPLENISH** `poc_replenish` | oracle-equiv | TAUTOLOGY | **SOLID** | 8/8 == iDempiere's own ReplenishReport formula-SQL via a *different* execution path + on-hand source. | — |
| **W-FOLD-INVOICE** `poc_invoice_complete` | oracle-equiv | TAUTOLOGY | **SOLID** | emitted MatchInv set == real `m_matchinv` 18/18 junctions (independent table). | — |
| **W-FOLD-AP-INVOICE** `poc_invoice_post_ap` | oracle-equiv | FALSIFIER | **SOLID** | 4/4 == `fact_acct(318)`, exact accounts 419/749/780; falsifiers 20000c. | — |
| **W-FOLD-MOVEMENT** `poc_movement` | oracle-equiv | TAUTOLOGY, UNFALSIFIED | **SOLID** | 1/1 == `fact_acct(323)` `maxDiff=0c`; cost-selection non-invent; falsifiers 20580c/10980c. | only 1 movement doc in seed (breadth) |
| **W-FOLD-MOVEMENT-FX** `poc_movement_fx` | oracle-equiv | UNFALSIFIED (rounding) | **SOLID** | `§FALSIFIER-B round per-unit cost first → maxDiff=1c` — 4dp cost (43.7325) makes full-precision rounding load-bearing & exercised. | — |
| **W-FOLD-MATCHINV** `poc_matchinv` | oracle-equiv | UNFALSIFIED, FALSIFIER | **SOLID** | 18/18 == `fact_acct(472)` incl. the IPV variance split (doc 100, 70/30 — a real hard case); falsifiers 36000c/3000c. | — |
| **W-FOLD-MATCHINV-FX** `poc_matchinv_fx` | oracle-equiv | **UNFALSIFIED-IN-SEED** | **SOFT** | `§MATCHINV_FX_NOTE …at 0.85 every leg converts exactly…no currency-balancing residual`. Conversion-multiply proven; the **FX HALF_UP rounding edge is asserted-not-exercised** (every leg lands clean). Honestly disclosed in the note. | add one match whose leg×0.85 hits a half-cent → SOLID |
| **W-POST-HARDEN** `poc_post_harden` | oracle-equiv | PROVENANCE, FALSIFIER, EXCUSE | **SOLID** | 3/4 == `fact_acct` `diff=0c`; `§FALSIFIER maxDiff=5035c`. doc-109 `AMT-DRIFT` **verified** as a real post-posting edit (Provenance §A) — the label is honest *and* provable. | — |
| **W-FOLD-GLJOURNAL** `poc_gljournal` | oracle-equiv | **TAUTOLOGY** (prioritised) | **SOLID** (w/ note) | Load-bearing half confirmed: `§FALSIFIER-B drop per-org balancing → maxDiff=10000c`; 2/2 == `fact_acct(224)` (independent, 8 rows 370/370 — matches live `idempiere_test`). **Note:** the direct-post leg is degenerate (`§GLJ_NOTE …degenerate (rate=1)`) so only the inter-org balancing is non-trivial — honestly disclosed. | a rate≠1 journal closes the degeneracy |
| **W-FOLD-REVERSE** `poc_reverse` | oracle-**anchored** | TIER, TAUTOLOGY | **SOLID** | Re-confirms forward == real `fact_acct`, then engine reversal nets to 0c in every account; tier correctly labeled *anchored*. Falsifiers 19700c/9850c. | — |

### 1b · RULE-CONSISTENT / RECIPE — correctly **excluded** from the "20"

| Claim (witness) | Tier-stated | Refutations | **Verdict** | Evidence |
|---|---|---|---|---|
| **W-FOLD-PRODUCTION** `poc_production` | rule-consistent | TIER, TAUTOLOGY | **SOLID-as-tiered** | `tier=RULE-CONSISTENT(no-oracle)`; GL `§GL-DEFERRED` honestly named; rides the oracle-anchored qty spine. Verified **not** badged `✅ oracle-equivalent` in the matrix. |
| **W-FOLD-INVENTORY** `poc_inventory` | rule-consistent | TIER | **SOLID-as-tiered** | `tier=RULE-CONSISTENT(no-oracle)`, `§GL-OFFSET-DEFERRED`; balance + cost-element falsifier load-bearing. Excluded from the 20. |
| **W-FOLD-BACKFLUSH** `poc_backflush` | recipe-equiv | **TAUTOLOGY** (prioritised) | **SOLID-as-tiered** | The "independent" oracle is genuinely a *different algorithm*: `pathEnumerate` = root→leaf path-product DFS (`poc_backflush.js:42-50`) vs `explodeBOM` = per-node dict-merge — not two spellings of one recursion. Multi-path invariant (screw=16/chair) + flat-explosion falsifier load-bearing. Correctly *not* oracle-equivalent. |

### 1c · H-3 DECLARATIVE — the 4 rows counted **inside** the "20" (the weak quartile)

| Claim (witness) | Tier-stated | Refutations applied | **Verdict** | Evidence |
|---|---|---|---|---|
| **W-ACCESS-HARDEN** `poc_access_harden` | oracle-equiv | **TAUTOLOGY** | **OVERSTATED** | The grant-map "oracle diff" runs the **identical** `…WHERE ad_role_id=? AND isactive='Y'` SQL on both engines: our side `ad_access.js:124-128` (`SELECT … WHERE … isactive='Y'`) vs the oracle `poc_access_harden.js:64` (`SELECT id, isreadwrite … WHERE … isactive='Y'`). Same query + same copied rows ⇒ proves **SQLite==Postgres / config-read-back**, not a reproduction of `MRole`'s decision. The only non-config leg (`canView`) is diffed against a **self-authored bitmask** (two encodings agree, recipe-style) and **excludes the one divergent input** (empty userLevel, `poc_access_harden.js:83-84`). Neither leg is fold-vs-independent-product. |
| **W-VALRULE-HARDEN** `poc_valrule_harden` | oracle-equiv | **TAUTOLOGY** | **OVERSTATED** | 5 of 10 fixtures are **static, token-free** (ids 143/146/187/200047/104 — verified `kind=static hasToken=false`). For those `V.substitute` is a no-op, so the **identical** WHERE SQL runs on SQLite and Postgres = SQLite==Postgres over copied data. The genuine port content (`Env.parseContext` substitution) is exercised only on the 5 token rules — and there it's a **trivial single-integer replacement** (`@AD_Table_ID@`→318, `@AD_Client_ID@`→11). "10/10 non-tautological" is true for ≤5. |
| **W-REFERENCE-HARDEN** `poc_reference_harden` | oracle-equiv | TAUTOLOGY | **SOFT** | Half-genuine. The **resolution** leg *is* a real reimplementation diff — `R.readRefTable` (fkTable,keyCol) vs the oracle's `ad_ref_table⋈ad_table⋈ad_column` join (`poc_reference_harden.js:59-64`) — load-bearing. But the **membership** leg (`SELECT keyCol FROM fkTable`, line 67) is the same SELECT on both DBs = SQLite==Postgres. The "12/12 diff=0" headline is dominated by the membership (data-fidelity); the resolution is the real win. |
| **W-CALLOUT-HARDEN** `poc_callout_harden` | oracle-equiv | TAUTOLOGY, **EXCUSE** | **SOLID** | **The one genuine H-3 reimplementation.** A real derive (`LineNetAmt=round(PriceActual×Qty)` + price-list join, `poc_callout_harden.js:62-93`) diffed vs the **stored** `c_orderline` value iDempiere's CalloutOrder wrote — an independent stored oracle, 26/27 + 27/27. The 1 residual (line 119: derived 89.25 vs stored 89.4) is a **verified** post-edit artifact: live `c_orderline 119.updated = 2021-10-16` (≠ created 2003-01-22), `priceactual` refined to 2.975 while stale `linenetamt` 89.4 (= old 2.98×30) was never recomputed — the engine's 89.25 is the *correct* recompute. |

---

## 2 · Scoreboard

**22 audited claims:**

- **SOLID — 18**: fold_complete, money_post, alloc_post, alloc_fx, qtyonhand, replenish, invoice_complete, invoice_post_ap, movement, movement_fx, matchinv, post_harden, gljournal, reverse (14 fold) + production, inventory, backflush (3 correctly-tiered) + **callout_harden** (the one genuine H-3 reimpl).
- **SOFT — 2**: `matchinv_fx` (FX rounding unfalsified-in-seed, admitted), `reference_harden` (membership leg = SQLite==Postgres).
- **OVERSTATED — 2**: `access_harden` (grant-map = identical SQL both DBs), `valrule_harden` (5/10 static = SQLite==Postgres).

Above the grid: **1 surviving cross-cutting finding — F-TIER-1** (the badge conflates Class A and Class B). Two first-pass findings **REFUTED** (provenance, doc-109 excuse — see §4).

---

## 3 · Harden-first list (FLAG, not fix — for the owning lane)

Ranked: OVERSTATED first, then cheap SOFT→SOLID promotions.

1. **[paper/matrix · cheap · highest leverage] F-TIER-1 — split the badge.** In `ERP_COVERAGE_MATRIX.md` line 57 / `MigrateComparisonPaper.md` line 491, replace the single "20 oracle-equivalent" with two sub-tiers: **"~16 fold-vs-`fact_acct` (independent product)"** + **"4 declarative (1 reimpl-equivalent, 3 config-fidelity/reimpl)"**. The fold core earns the strong claim; the declarative quartile should not silently inherit it.
2. **[H-3/access · cheap] access_harden — relabel.** The grant-map leg is config-read-back (identical `WHERE isactive='Y'` on both DBs), not `MRole` reproduction. Demote from `oracle-equivalent` to a `config-fidelity` sub-tier, and note `canView` excludes the empty userLevel.
3. **[H-3/valrule · cheap→medium] valrule_harden — qualify "non-tautological".** State plainly: 5 token rules exercise substitution, 5 static rules are a SQLite==Postgres data-fidelity check. Optional strengthen: add 2-3 `@SQL=`/nested-token rules so the *port* is what's under test.
4. **[H-3/reference · cheap] reference_harden — foreground the resolution leg.** Re-word so the load-bearing win (FK *resolution* reimpl) is the headline and the membership diff is named as the data-fidelity leg it is.
5. **[fold/matchinv_fx · medium] promote SOFT→SOLID.** Add one FX leg whose `amtsource × 0.85` lands on a half-cent so HALF_UP is exercised, not just asserted.
6. **[paper · cheap] state the two oracle DBs.** Fold oracle = `idempiere_test` (posted GL) / `glassbowl_data.db`; H-3 declarative oracle = `idempiere` (AD dictionary, GL unposted). Both valid; a reproducer should know which DB each witness family targets (`idempiere` has 0 `fact_acct` rows — don't point a fold re-check at it, as I mistakenly did first pass).

---

## 4 · Refuted-on-recheck (recorded for honesty; the user's correction triggered both)

- **§A — doc-109 / callout-119 "post-posting edit" excuses: VERIFIED, not convenient.** First pass I flagged these as unverified. On re-check they are **real and dated**: `c_invoice 109.updated = 2004-01-04` (header carries the edit date; the *line's* `updated` stayed 2003-12-30, which misled me), and `idempiere_test.fact_acct` for invoice 109 line 127 contains **both** postings — `CR 254.00` (original) **and** `CR 215.90` (re-post after edit) — the drift is literally in the ledger. Likewise `c_orderline 119.updated = 2021-10-16`. The matrix's narratives are accurate.
- **§B — fold-oracle provenance: PASS (live-re-verifiable).** First pass I queried db `idempiere` (which has 0 `fact_acct` rows) and wrongly concluded the fold oracle was snapshot-locked. The canonical oracle DB is **`idempiere_test`** (per the prompt §4 / memory). There, client-11 `fact_acct` = **300 rows, `ΣDr=ΣCr=46574.97`**, table 224 = 8 rows/370.00 — an **exact match** to `glassbowl_data.db`. The captured fixture provably equals the live posted ledger. Provenance is **SOLID**.

## 4′ · What an external skeptic would still attack (residual exposure)

- **"You diffed your own copy of the data against itself."** Lands on the H-3 quartile (valrule static / access grant-maps / reference membership are SQLite==Postgres). It does **not** land on the fold core — the oracle is `fact_acct`, an independent product, and I confirmed it equals the live `idempiere_test` GL. A skeptic can re-run that check.
- **"One fixture, clean numbers."** Rate 0.85 converts too cleanly (matchinv_fx); only one M_Movement doc; production/inventory have no GL oracle. Breadth is narrow and *named*, but "20 oracle-equivalent" invites a breadth expectation the seed doesn't carry.
- **Strengths they will *not* break:** falsifiers are genuinely load-bearing (every corruption blows the diff up by the right magnitude); accounts are read from real master columns (no invention); the production/inventory/backflush tiers are scrupulously *not* oversold; the drift excuses are provable from the ledger. The trade-loop equivalence is the real thing — only the **headline arithmetic and the 4 declarative labels** need hedging before publication.

---

## 5 · ⛔ BLOCKED

None remaining. The two items first parked here (doc-109 / callout-119 edit timestamps) were resolved in §A — both edits are dated in the source audit columns and, for doc-109, doubly visible as two postings in `fact_acct`.

---

---

## 6 · Addendum — POSTING_PREVIEW_PANEL (Phases 1+3) audited on return

Verified the held UI-bridge lane's `# DONE` claims (`prompts/POSTING_PREVIEW_PANEL.md`).

- **Phase 1 — `W-DOC-POSTER` re-run by this audit** (`build/erp/audit_poc_doc_poster.log`, exit 0): `§DOC-POSTER` id 100/101/102 `maxDiff=0c(EQUIVALENT)`, id 108 `maxDiff=4039c(AMT-DRIFT)`, `§FALSIFIER drop-receivable-DR maxDiff=5035c` — **byte-identical to `poc_fold_complete`** (same per-doc maxDiff, same falsifier magnitude). **Verdict: SOLID, Class A** (fold vs independent `fact_acct(318)`); inherits W-FOLD-COMPLETE/W-POST-HARDEN. The 108/109 drift is the same **verified** dated edit from §A (not an excuse). The `basis='order'` projection branch is honestly labeled no-oracle and is *not* used by the witnessed path — the audit's earlier guard is honored.
- **Phase 3 — preview seam** (`/tmp/wt-preview/erp/tests/poc_posting_preview.log`, present, all 5 `§`): `§PREVIEW-COMPLETE … maxDiff=0c vs fact_acct(318) class=A` (inherits the Class-A oracle I re-confirmed) · `§PREVIEW-NOWRITE db_bytes=393216 unchanged=Y commitGroup=none` (pure preview — byte-unchanged) · `§PREVIEW-DATA … coverage=absent dom-rows=0` (honest empty state) · `§PREVIEW-GATE … dom-rows=0 leak=N` (**UI zero-leak — directly answers this audit's parked-UI-leak worry**) · `§PREVIEW-FALSIFIER … balanced=N badge=Unbalanced` (load-bearing). **Verdict: SOLID**, additive, seams un-forked, byte-unchanged.
- **One disclosed scope point (not a finding):** §PREVIEW-COMPLETE uses option (a) — re-derive a **CO** order's journal ("what Complete *would* produce"), since `glassbowl_data.db` has no DR draft. Honestly framed in the prompt + witness; true-draft synthesize-then-derive is named-deferred (§8).
- **GO confirmed:** Phase 3 was correctly executed — pure, additive, worktree-isolated, no deploy. The deploy/mount stays GO-gated (§9). Nothing here touches the 20-surface equivalence tally.

---

*Audit complete · 22/22 equivalence claims + the POSTING_PREVIEW_PANEL lane verdicted from re-run `audit_*.log` + live queries against `idempiere_test`/`idempiere` · 0 edits to FOLD/H-3/UI/doc-owned files · `feat/erp-substrate-phase012` · 2026-06-10.*
