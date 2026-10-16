# ⚠ DO NOT REMOVE — Scope guard / SESSION HANDOFF CARD (written 2026-08-23)
# Scope: continuation of the T-0 truth-maintenance pass `docs/ERP_PROJECT_REVIEW.md` §5.1 named as the
#   highest-leverage next move (2026-08-12), picked back up 11 days later after the ERP lane went fully
#   code-dark while 4D/Gantt work absorbed attention. Two of T-0's items closed this session (access-gate,
#   Forms/ValRules data gap). The rest of T-0, plus the much bigger functional-parity gap, are still open —
#   read "WHAT'S STILL OPEN" below before assuming any of this is close to done.
# READ THE LOG after every run (exit ≠ evidence). Full evidence trail for everything below:
#   `docs/ERP_PROJECT_REVIEW.md` §2.1 CLOSED, §7, §8 (all dated 2026-08-23).
# Push permission is ON (CLAUDE.md 2026-07-17): commit, push, PR, merge. The `system-is-real` CI check
#   fails on a pre-existing, unrelated browser-regime issue on the base branch itself (confirmed failing
#   since 2026-07-17, still failing today) — not yours to fix, don't chase it, verify via `mergeStateStatus`
#   + read the failure log before assuming a red check is caused by your change.
# STANDING INTENT (user, 2026-08-24): close ANY gap in ERP — this is not scoped to the two items closed
#   2026-08-23. Every gap named below is QUEUED WORK, not a menu to ask permission on. Rank by leverage/
#   cost, distinguish bounded work from a multi-session campaign, but do not hold a named gap back
#   waiting for a go-ahead. See `feedback_erp_close_all_gaps.md`.
# Live iDempiere source for anything oracle-diffed against real Postgres: docker container `postgres`
#   (0.0.0.0:5432, PG15, user/pass `adempiere`/`adempiere`, DBs `idempiere` + `idempiere_test`). **It gets
#   stopped between sessions** (was down 4 weeks before this session) — `docker start postgres` first,
#   then `docker exec postgres psql -U adempiere -d idempiere_test -c "<sql>"` to query. Full detail:
#   memory `reference_idempiere_source.md`.

---

## ▶ WHOLE-LANE SWEEP 2026-09-02 — read `prompts/AGENT_QUEUE.md` §WAVE E first
A fresh sweep of the entire ERP third of the trilogy (code-checked, not doc-derived) found **15 gaps**,
now tabled with evidence + a dispatch order in `prompts/AGENT_QUEUE.md` §E.GAPS / §E.ORDER. This card's
own still-open items are E-1 (454-proc corpus), E-2 (§RULE-EDIT grail — and it surfaced a CONTRADICTION
with `project_rule_edit_gesture.md`, which claims the loop is closed and LIVE), E-3 (Form renderer) and
E-9 (DisplayLogic, ⛔user). Do not re-derive the open list from this file alone.

## WHERE THIS PICKS UP (state as of 2026-08-23, all merged to main)

**Shipped this session — 3 PRs, all merged, all CI-green (past the known pre-existing base-branch red):**
- bim-ootb **#1495** — `erp/ad_access.js` shipped as a true twin of `build/erp/ad_access.js`;
  `erp/idmp_session.js` now delegates `accessibleWindows/Processes/Forms` to it (`IsReadWrite`/`canView`/
  org-client scope), proven live in the browser (not just headless — that gap is exactly what caused the
  original misattribution). New witness: `erp/tests/poc_access_gate_live.js`.
- bim-ootb **#1496** — `AD_Form` (49 rows) + `ad_val_rule` (332 rows) baked additively into `erp/ad_seed.db`
  via a new `erp/tests/bake_forms_valrules_seed.js`, proven zero regression on the other 399 tables.
- bim-compiler **#91** — `scripts/ad_seed_manifest.json` gained real, PG-extracted contracts for both tables.

**Both closures found real bugs while fixing, not before (worth knowing for next time):** the access-gate
fix hit a missing `ad_entitytype` table in the trimmed seed; the seed-bake fix found the SAME class of gap
independently the same day. Also (2026-08-23) claimed: 4 witnesses cited in `prompts/archive/
IDMP_FULLWIDTH_SEED.md`'s re-witness protocol don't exist anywhere in the tree. **This claim was WRONG,
corrected 2026-08-24 (item 6 below)** — the search that produced it only checked bim-ootb; all 5 scripts
live in `bim-compiler/scripts/`. Re-running them live surfaced a real gap instead (item 8 below).

**The seed-regeneration "lost recipe" question is answered, not just worked around:** `erp/ad_seed.db` was
never a single reproducible pipeline output. `git log --follow -- erp/ad_seed.db` shows one full export
(`fd09ad1`, PR #265) followed by ~20 separate incremental "bake X into ad_seed.db" commits over a month.
That IS the house convention (`git show 3773ff6` / `tests/bake_all_erps_seed.js`: column-intersect, `INSERT
OR IGNORE`, idempotent, additive-only) — mirrors what real iDempiere OSGi plugins do at bundle-install time,
without the OSGi/Maven machinery. **Never run a full `scripts/export_ad_seed.js` against the live docker PG
expecting it to reproduce the shipped seed** — the container's current data has drifted from what built the
shipped seed (verified: `idempiere_test.c_bpartner=18` vs shipped seed's 113), so a full re-export silently
wipes `ad_client`/`ad_role`/`C_BPartner`/`ad_window_access`/`fact_acct`/`HR_*`/`C_Subscription*` back down
to whatever's in the container today. Always bake additively into the existing `ad_seed.db`, following
`bake_forms_valrules_seed.js`'s pattern, never full-regenerate.

---

## WHAT'S STILL OPEN

### From the original T-0 list (2026-08-12), not touched this session
1. ✅ **DONE (witness) 2026-08-24** — Enumerable ledger + bundle runner. New `docs/internal/
   ERP_EQUIVALENCE_LEDGER.md`: all 49 raw `✅ oracle-equivalent` rows from `ERP_COVERAGE_MATRIX.md`'s
   Second-axis section, numbered, each with a witness ID, script path (verified `[ -f ...]` on disk, all
   49/49 found), log path, and tally Y/N (3 rows are evidence-only, explicitly marked in the source text).
   New `build/erp/run_bundle.sh` runs every tally-row script via the existing `run_witness.sh` convention —
   **actually run: 46/46 PASS, 0 FAIL, 0 MISSING** (`build/erp/run_bundle.log`, real log read, not just exit
   code). **Reconciliation finding (new, not previously known):** raw mechanical arithmetic over the current
   table — 46 tally rows, 2 of which bundle multiple surfaces (row 48 W-POST-B3 = 6, row 49 W-POST-TAIL = 3,
   per the source's own `ledger N→M` annotations) — sums to **53 surfaces, not the headline 52**. The
   doc's own `41→42→43→49→52` chain is internally consistent but rests on a "41" baseline
   (`prompts/HARDEN_MATRIX.md:93`) that was never itself recounted from the table; the pre-B1 span of rows
   mechanically counts to 42, not 41 — that's the exact 1-row source of the gap. Not inflation (per the
   2026-08-12 review's own finding), but now a precisely quantified discrepancy instead of "cannot be
   recounted." CI still runs exactly 1 of the 46 (`poc_morder_fsm.js`) — named as a follow-up (needs a
   docker-PG / idempiere-checkout / bim-ootb-playwright CI runner most of these depend on), not wired this
   pass. `ERP_COVERAGE_MATRIX.md` cross-references the new ledger as the count's source of truth.
2. ✅ **DONE (witness) 2026-08-24** — Wrote back the lane index. Audited all 41 "Project — ERP" memory
   lanes via 4 parallel read-only forks (one per ~10 lanes), spot-checked their PR-merge-state claims
   directly (4/4 spot checks confirmed accurate — e.g. PR #972 claimed-open was actually MERGED 2026-07-22;
   PR #203 claimed-shipped is actually still OPEN 2.5 months later), then applied fixes: rewrote MEMORY.md's
   "Project — ERP" index line-by-line with corrected status; merged 2 genuinely duplicate files
   (`project_pos_killer_demo.md` → `project_pos_lens.md`, same PR/date content told twice) and deleted the
   redundant one, fixing the 2 dangling `[[wikilink]]` references it left; clarified 1 same-topic-different-
   lane false-positive (`project_plugin_arch.md` vs `project_plugin_system.md` — different scopes, not a
   dup); appended dated correction notes to ~15 individual memory files whose body text was stale/wrong
   (DONE-NOT-MARKED, SELF-CONTRADICTING, or citing pre-ERP_EQUIVALENCE_LEDGER.md ledger counts). MEMORY.md
   stayed at 59 lines (≤80 budget held). Full per-lane verdict tables are in the fork transcripts, not
   re-copied here — MEMORY.md's index is now the source of truth per the project's own "links only" rule.
3. **The §RULE-EDIT grail witness** (`docs/HolyGrail.md:159-172`) — edit one validation row → K records
   re-fold live, signed, reversible. The project's stated differentiator. Still doesn't exist.

### New, found this session
4. ✅ **DONE (witness) 2026-08-24** — `gateRecordFor` (record-level `canView` + org/client scope) is now
   wired into the ONE real chokepoint: `crud_overlay.js`'s `commitCrud` (confirmed via code read — EVERY
   CRUD_CREATE/CRUD_UPDATE/CRUD_DELETE funnels through it via `applyOp`, not a per-call-site sprawl).
   `idempiere.html`'s `applySession` sets `window.APP.gateRecordFor` (same "the page may set it" seam as
   `sessionActor`/`sessionClientId`/`sessionOrgId`, absent on no-login hosts like `glassbowl.html` → PASS,
   never a hard dependency); `crud_core.js` gains `recordAccessGate` (AD_Table.AccessLevel lookup + the
   gate call); the check runs for UPDATE/DELETE (CREATE is a named residual — the new row is stamped with
   the actor's own scope, inherently self-consistent). **New witness `scripts/poc_record_gate_live.js`**
   (bim-compiler) proves it against REAL seed data: role 1300103 (GardenWorld User, client 13) editing a
   client-12 (Odoo-tenant) `c_bpartner` is REJECTED (`reason=wrong-client`, no `§CRUD-PERSIST`) before the
   seal; the same edit on the role's own tenant still commits. **Two real bugs found+fixed while building
   this** (worth knowing for next time): (1) `_gateRecordAccess`'s first draft mirrored the existing
   owner/CAS gate's no-explicit-id `getRecord(op.key, cb)` call, which resolves the record via `curChain`
   (ambient "currently open form" state) — correct for a real UI click, but a host-triggered write
   (`hostUpdate`) never updates `curChain`, so the gate silently checked the WRONG record and let an
   out-of-scope write through; fixed by passing `op.id` explicitly. (2) `c_order` was the first table tried
   for the REJECT case but EVERY client-12 order fails an unrelated pre-existing beforeSave invariant
   (`MOrder.warehouseMandatory` — the Odoo-migrated tenant's orders have no warehouse in this seed), masking
   the gate entirely; switched to `c_bpartner` (no `ad_modelval` hook) to isolate exactly this gate.
   **Regression-checked** against the 9 existing live CRUD-path witnesses — 2 pre-existing failures
   confirmed identical on an unmodified control worktree at the same base commit, not caused by this change.
   Shipped bim-ootb PR #1499 (auto-merge armed, `sw.js` v769→v770).
5. **`AD_Form` data exists now; no Form-screen renderer does.** Real iDempiere Forms are bespoke coded
   screens (Bank Statement matching, GL Journal generator, etc.), not declarative Window/Tab/Field data.
   The data gap is closed; the feature isn't — don't conflate the two if this comes up again.
6. ✅ **DONE (witness) 2026-08-24** — The dead re-witness-citation problem. **The original claim was
   wrong** — a first search pass checked only bim-ootb and concluded the 5 witness scripts didn't exist.
   Re-checked properly: all 5 (`poc_ad_docfsm_live.js`, `poc_ad_access_live.js`, `poc_ad_modelval_live.js`,
   `poc_ad_menu_prf_live.js`, `poc_ad_displaylogic_live.js`) are tracked, clean, on `origin/master`, in
   **`bim-compiler/scripts/`** (committed by this card's own `1122ddbec`) — the engine/witness code lives
   in bim-compiler, bim-ootb only hosts the deployed app. **Actually re-ran all 5** (`bash build/erp/
   run_witness.sh scripts/poc_ad_<X>_live.js`): DOCFSM/ACCESS/MODELVAL/MENU-PRF all 🟢 PASS;
   DISPLAYLOGIC 🔴 FAILS FOR REAL (exit 2) — see item 8, a genuine new finding, not a stale-witness
   artifact. Fixed in `prompts/archive/IDMP_FULLWIDTH_SEED.md`: CORRECTION-1 (struck, records the wrong
   bim-ootb-only search) + CORRECTION-2 (the real result table + root cause). **Takeaway for next time:**
   when a witness/script "doesn't exist," check `bim-compiler/scripts/` and `build/erp/` before concluding
   it was never committed — don't search bim-ootb alone.
7. **Read-write-vs-read-only access is implemented and headless-proven, but not live-data-demonstrable** —
   the shipped seed carries zero `isreadwrite='N'` grant rows anywhere. Not a bug; just means the live
   witness can't currently show the RW distinction actually gating something, only the visibility gate.
8. ✅ **DONE (witness) 2026-08-24** — AD_Field·DisplayLogic hiding is architecturally dead for every
   CRUD-enabled table. Root cause traced to the exact fork point (`erp/idempiere.html:2882` `buildForm`): a
   table with a registered CRUD spec (`c_order` and presumably most commonly-used tables by now) takes the
   `canInline` branch → mounts `crud_overlay.js`'s in-place editor (P2, `editInline`), which renders a
   **narrow curated field set** (8 for c_order) via `_inlineOptsFor`. Any table WITHOUT a CRUD spec falls
   back to `_appendReadonlyFields` (`idempiere.html:2899-2917`) — the ORIGINAL 60-field accordion render
   that hides 27 fields by real AD DisplayLogic. **Neither the evaluator nor the inline editor's own
   logic-application is broken** (`crud_overlay.js:483 applyAdLogic` correctly reads
   `f.displaylogic`/`readonlylogic`/`mandatorylogic` via the same proven `CORE.effectiveFlags`, confirmed by
   code read) — the gap is that the inline editor's 8-field curated set happens to contain zero
   DisplayLogic-bearing columns, so `withLogic=0` every time on every CRUD-enabled table.
   **Decision made: re-score honestly, don't redesign the UI.** This T-0 pass is truth-maintenance, not
   feature work — widening the inline editor's field set (or deciding which fields belong in a curated edit
   form) is a real product-UX call with a blast radius across every CRUD-enabled table, not a bounded fix.
   Re-scored `docs/internal/ERP_COVERAGE_MATRIX.md`: the surface moved ✅→🟡 (headline **6✅ / 33🟡 / 3⛔ of
   42**, was 7✅/32🟡/3⛔), with the downgrade reasoning + re-run evidence recorded in both the headline rows
   and the detail row (`AD_Field · DisplayLogic`, verdict now 🟡 PARTIAL). Widening the inline editor to
   restore live proof is named as a follow-on feature task, not queued as a bug.

### The one that dwarfs everything else — restate this every time someone reads this file
**454 of 476 real iDempiere processes, ~200 beforeSave overrides, and 139 callout atoms remain
named-deferred** (`docs/internal/ERP_COVERAGE_MATRIX.md:188-194`). Nothing above touches this number.
Today's work made the navigational shell more complete (Windows/Tabs/Fields/Menus/Forms/ValRules all now
present) and the access boundary honest (proven live, not just headless) — neither moves the functional-
parity needle. If the standing goal is genuinely "an iDempiere user feels at home," this is still the
dominant remaining distance, by a wide margin, and nothing currently scheduled closes it.

## Queue, in order (all of this is in scope by the standing intent above — not a menu, a sequence)
1. ✅ Item 6 (the dead witness citations) — DONE 2026-08-24, see above.
2. ✅ Item 1 (enumerable ledger) — DONE 2026-08-24, see above.
3. ✅ Item 8 (DisplayLogic-live regression) — DONE 2026-08-24, see above (re-scored honestly, UI widening
   named as a separate follow-on).
4. ✅ Item 4 (`gateRecordFor` wiring) — DONE 2026-08-24, see above.
5. ✅ Item 2 (lane-index write-back) — DONE 2026-08-24, see above.
6. **Item 5, the Form-screen renderer — queued, not held.** Real scope: a generic Form-shell (title bar,
   field layout from `AD_Form`/`AD_Field` where declarable) plus per-Form logic for whichever Forms are
   highest-traffic in real iDempiere use (Bank Statement matching, Payment Allocation, GL Journal
   generator are the classic first three — verify against real usage, don't guess the order). Start with
   ONE Form end-to-end (spec → witness → ship) before generalizing, same discipline as every other lane
   in this project. `AD_Form`'s 49 rows and `erp/genesis.js`'s access-grant consumer are already there
   (§8) — this item is the missing renderer + per-form behavior, not new data plumbing.
7. **The 454-proc corpus — queued as a campaign, not deferred indefinitely.** Real long pole, genuinely
   multi-session. Before writing code: triage the 454 by actual usage weight (which processes a real
   GardenWorld-shaped tenant calls often vs. rarely-touched edge cases — the equivalence campaign's own
   K=1/K=2 pattern already shows how thin the walked paths are), and sequence the highest-traffic slice
   first. This is the next scoped-plan-writing task, not a "someday" — the standing intent means it gets
   a plan, not silence.
