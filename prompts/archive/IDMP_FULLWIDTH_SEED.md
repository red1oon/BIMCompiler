# ⚠ DO NOT REMOVE — Scope guard / SESSION CARD: FULL-WIDTH iDEMPIERE SEED + PK RE-BAND (user-decided 2026-06-11)
# Lane: make "load iDempiere and use it RIGHT AWAY" true. Two bounded jobs, in order:
#   §1-§3 FULL-WIDTH ad_seed.db — the browser seed is a hand-picked COLUMN SLICE of GardenWorld; every
#         degradation the UI-bridge lane §-named (M_InOut windows empty, no Re-Activate, B-5 dead) is
#         self-inflicted by the slice, NOT the engine. Widen the extract, regen, re-witness.
#   §4    PK RE-BAND in gen_ad_idmp.sh — NEW_CLIENT_MGMT #5-install is ⛔ on PK collision (re-keys client
#         11→13 but NOT the primary keys → INSERT OR IGNORE drops tenant rows, PK-less tax tables double).
# READ THE LOG after every run (exit ≠ evidence); ALL poc_* via `bash build/erp/run_witness.sh scripts/poc_X.js`
#   (never tee to context). bim-ootb edits ONLY via a /tmp/wt-* worktree off FRESH origin/main. EXTRACT, DON'T
#   INVENT — every row/column from the Docker PG (`postgres`/`idempiere`, GardenWorld client 11); never hand-author.
# READ FIRST: prompts/NEW_CLIENT_MGMT.md §5-install (the collision analysis + exact table/FK list — verbatim
#   below) · prompts/UI_UNPARK_RESUME.md # DONE (which residuals this seed dissolves) · scripts/export_ad.sh
#   (the slice producer) · prompts/ERP_EXECUTION_ROADMAP.md (this card = its ingest prerequisite).

---

## WHY (one paragraph, don't relearn)
The engines are proven (41 oracle-equivalent; UI bridge live, matrix 6✅). The community proof "bring your
iDempiere, use it now" fails today at INGEST: (a) the demo seed is a slice → features degrade with §-named
seed-gaps; (b) a second client can't install beside GardenWorld (PK collision). Fix both and the demo stops
fighting itself; UI roadmap C-5 (process dispatch) un-gates as a side effect.

## §1 — FULL-WIDTH EXPORT (scripts/export_ad.sh is the slice; widen it)
- The producer: `scripts/export_ad.sh` → `deploy/dev/ad_seed.sql` → sqlite → `bim-ootb/erp/ad_seed.db`
  (12.7MB today; ad_full.db = 44.9MB / 927 tables is the ALL-tables reference — do NOT ship that).
- RULE: for every table ALREADY exported, export **ALL columns** (`SELECT *`) — stop hand-picking; the slice
  is the bug. ADD tables: `ad_process` + `ad_process_para` (unblocks B-5/C-5; 476+1208 rows). CHECK ad_menu
  full-width brings `AD_Workflow_ID` → the F-leaf gating B-4 named impossible becomes possible (ad_workflow_access
  already in seed) — note it, wire only if trivial.
- KNOWN slice-holes this must close (verify each in the regenerated db, §-log the check):
  `M_InOut.MovementType` (all 4 M_InOut windows scope 0 rows without it) · `c_doctype.iscanbereactivated` +
  `docsubtypeso` (doc-action bar conservative no-RE) · `C_Order.DateAcct` (periodOpen assume-open fallback).
- SIZE GATE: §-log byte size + `§IDEMPIERE boot ms` before/after (IDB+SWR cache the seed, so steady-state is
  cheap — first-load is what moves). If the full-width seed exceeds ~2× current (>25MB), trim ONLY columns no
  AD_Field references (un-rendered LOBs) and name what was dropped; below that, ship it whole.

## §2 — REGEN + CACHE-KEY BUMP (the silent-staleness trap)
- Rebuild the .db, replace `erp/ad_seed.db` in the worktree.
- **idempiere.html AND erp.html cache the seed in IndexedDB under key `ad_seed_v13`** (idempiere.html:386/430/439
  — shared key). Bump to `ad_seed_v14` in BOTH pages or every returning visitor keeps the stale slice forever.
- sw.js: bump CACHE_VERSION + the seed entry; conflict rule unchanged (keep both hunks, higher version).

## §3 — RE-WITNESS (expectations move because the TRUTH moved — re-derive, don't pad)
- `scripts/poc_ad_docfsm_live.js`: re-derive CASES from the REAL full-width c_doctype — completed docs whose
  doctype has `iscanbereactivated='Y'` now legally offer RE (the conservative no-RE §-gap dissolves);
  **restore the M_InOut case** (windows scope rows once MovementType exists — the card's original no-VO-on-InOut
  falsifier, dropped to C_Invoice in the UI-bridge session, comes home). Pre-compute expected legal sets by
  sqlite query, never by guess.
- Re-run ALL five live witnesses (`poc_ad_access_live` · `poc_ad_displaylogic_live` · `poc_ad_docfsm_live` ·
  `poc_ad_modelval_live` · `poc_ad_menu_prf_live`) against the worktree (ERP_ROOT=… pattern) — counts may
  shift with new rows/cols; accept the new §-logged truths, investigate any FAIL before touching expectations.
- Headless regressions untouched (they read ad_full.db / the bundle, not the browser seed).
- Deploy: PR → auto-merge → VERIFY squash landed → live-verify sw + seed bytes on Pages.

## §4 — PK RE-BAND in gen_ad_idmp.sh (NEW_CLIENT_MGMT #5-install, verbatim analysis)
- ROOT (verified): `gen_ad_idmp.sh` re-keys only AD_Client_ID 11→13; GardenWorld PKs unchanged → shard-in
  `INSERT OR IGNORE` drops every tenant row (client-13 orders land = 0) while PK-less c_invoicetax/c_ordertax
  DUPLICATE → GL doubles. (Odoo avoids it with fresh DOC=CL*100000-band ids — the pattern to copy.)
- FIX: uniform offset of tenant-owned ids into the client band — c_order/c_orderline/c_invoice/c_invoiceline/
  c_bpartner/m_product/m_product_category/c_tax/c_validcombination/c_elementvalue + their FK columns. The
  shard's id-tables are ALL client-13-only (no shared System(0) rows — verified) so a uniform offset is
  FK-consistent. CAVEAT: also offset `fact_acct` dimension FKs (account_id + record_id + bpartner/product/order
  dims) AND update `poc_idmp_frame_fit.js`'s hardcoded INVOICE_ID=100.
- Witness `W-IDMP-REBAND` (new `scripts/poc_idmp_reband.js` or extend the gen log): post-reband shard installed
  over the FULL-WIDTH GardenWorld seed → 0 PK collisions, client-13 row counts == source counts, tax tables NOT
  doubled, both clients' TB balance independently. Then `erp/tests/poc_install_idmp.js` (mirror PR #260's
  poc_install_persist pattern: TENANT_SHARD 13-idempiere.db + erp_picker install-mode route + ship the shard +
  sw bump). The previously-reverted dialog wiring is reconstructable from PR #260.

## DONE WHEN
§1-§3: full-width seed LIVE (sw bumped, IDB key v14), the named slice-holes verified closed in-browser, five
live witnesses green with re-derived expectations, UI_UNPARK_RESUME residuals + matrix seed-gap notes updated
(C_DocType-FSM row's "conservative no-RE" + "M_InOut unreachable" notes dissolve; B-5/C-5 entrance = satisfied).
§4: W-IDMP-REBAND green + install-beside-GardenWorld witnessed. Each claim gets a § line in this card's # DONE
appendix (Watchdog rule). Anything needing a user fact → `⛔ BLOCKED: <one question>`, move on.

---

# DONE (2026-06-11) — §1-§4 ALL WORKED; bim-ootb PR #265 (2 commits: full-width seed 10852d7 + install wiring 08cf449)

- ✅ **§0 recon** — deployed seed = TWO strata: 45 MixedCase tables (the export_ad.sh slice — the holes) +
  335 lowercase full-width tables (SQLite table names case-insensitive → the slice MASKED full-width copies of
  exactly the doc tables). `§RECON tables=378` → `build/erp/seed_recon.log`; per-table contract pinned in
  `scripts/ad_seed_manifest.json` (380 = 378 + ad_process + ad_process_para; name-case/WHERE/IsActive observed,
  never authored).
- ✅ **§1 full-width export** — NEW `scripts/export_ad_seed.js` (manifest-driven SELECT *, DDL from the PG
  catalog incl. REAL PRIMARY KEYS, canonical AD_Column case for the MixedCase stratum, COPY-TEXT machinery from
  migrate_pg_to_sqlite.js, no 2>/dev/null); `scripts/export_ad.sh` rewritten as its wrapper (the slice producer
  is DEAD). `§SEED-FW done tables=380/380 rows=85818 widened=50 bytes=26112000 (24.9MB)` — under the >25MB gate,
  shipped whole; `§SEED-CHECK row-diffs vs old seed: NONE` (every existing table's rows preserved); deterministic
  (`§EXPORT deterministic: regen .dump == shipped seed .dump`) → `build/erp/seed_fullwidth_build.log`.
- ✅ **§1 slice-holes closed (verified in the regenerated db)** — `§SEED-CHECK M_InOut MovementType: 9 rows,
  types=C-,V+` · `§SEED-CHECK C_DocType holes: reactivatable=17 docsubtypeso_nonnull=11` · `§SEED-CHECK C_Order
  DateAcct: 8 rows, dateacct_nonnull=8` · `§SEED-CHECK ad_process: 476 ad_process_para: 1208` (B-5/C-5 entrance
  SATISFIED) · NOTED: `§SEED-CHECK AD_Menu AD_Workflow_ID: col_exists=1 wf_leaves=12` — the B-4 F-leaf gate is
  now POSSIBLE; wiring left to the UI lane (not trivial here: scopeMenu needs a workflow-access set).
- ✅ **§1 size gate** — `§SIZE-GATE v13-slice 12.1MB firstload-boot median=183ms · v14-fullwidth 24.9MB
  median=200ms` (fresh-context Playwright = the first-load path; steady-state is IDB-cached) →
  `build/erp/poc_seed_bootms.log`.
- ✅ **§2 regen + cache keys** — worktree /tmp/wt-fullseed off fresh origin/main (8229cc6); `ad_seed_v13→v14` in
  BOTH idempiere.html (5 sites) and erp.html (2); sw CACHE_VERSION v647→v648 (seed itself skips the SW —
  `.db` fetched directly; the bump refreshes the changed shells).
- ✅ **§3 re-witness, expectations RE-DERIVED by query** (`build/erp/seed_case_derive.log` + §PERIOD probes, all
  5 doc periods 'O') — `poc_ad_docfsm_live.js` now 6 cases: completed Order 100 (doctype 135 POS Order
  canReact=Y) `legal=[CL,VO,RE]` · **M_InOut case RESTORED** (window 169 scopes C- rows; record 100
  `legal=[CL,RC,RA]`, no VO no RE — the card's original falsifier home) · C_Invoice 100 (ARI canReact=N) = the
  no-RE falsifier · GL_Journal 100 + Payment 100 (GLJ/ARR canReact=Y) `legal=[CL,RC,RE,RA]`, journal clicked
  RC→RE. ALL FIVE live witnesses green against the worktree (exit 0, logs in build/erp/): W-AD-ACCESS-LIVE
  (294/163/0 of 332 + role 200001=294) · W-AD-DISPLAYLOGIC-LIVE (33/27 + falsifier) · W-AD-DOCFSM-LIVE ·
  W-AD-MODELVAL-LIVE (REJECT CannotChangePl + derive fired=11 + signed persist) · W-AD-MENU-PRF-LIVE
  (137/116/1 of 159 procs; live DOM falsifier). poc_ad_access_live gains ERP_ROOT (was hardcoded ~/bim-ootb).
- ✅ **§4 PK re-band** — `gen_ad_idmp.sh` step 2b: 13 families (the card's 10 + identity ad_org/ad_role/ad_user —
  VERIFIED collision: shard client rows carry the SAME ids as the seed's GardenWorld identity rows → un-banded,
  client 13 is never login-able) offset CL*100000 with PRE-captured tenant id-lists, abort-on-unsafe asserts
  (client≠0/CL rows in a family · populated ref_* alias columns); specials: vc.account_id + fact_acct.account_id
  (+ev) · *_acct-suffix cols (+vc) · fact_acct.record_id/line_id (259/318; line_id 48/74 ⊆ c_invoiceline
  verified, 26 NULL). `§REBAND … §GEN-AD-IDMP wrote build/erp/13-idempiere.db` → `build/erp/gen_ad_idmp.log`.
  REBAND=0 emits the un-banded falsifier fixture. Band leak NAMED: ids ≥100000 (role 200001, order 200002) land
  past the next client's nominal band start — same leak as the Odoo CL*100000 pattern we copied.
- ✅ **W-IDMP-REBAND** (`scripts/poc_idmp_reband.js`, exit 0 → `build/erp/poc_idmp_reband.log`) — §A 0 PK
  collisions, every client-13 row landed (c_acctschema_default = SHARED-CONFIG expected-drop, §-named: the
  acctschema 101/102 is deliberately not banded, seed carries the same default rows) · §B re-install no-op
  (c_ordertax/c_invoicetax 8→8 — the full-width seed's REAL composite PKs dedup at the substrate) · §C merged-db
  client-13 invoice 1300100 coverage:complete balanced `maxDiff=0c` == own fact_acct + GardenWorld order 100
  unharmed + shard TB ΣDR=ΣCR=46574.97 · §D 12 FK families 0 dangles · §E login-able grants=9 · §F un-banded
  shard → orders landed=0 (the original bug, reproduced). Witness-side traps hit + fixed: the v642
  DECLARED-case lesson (AS-alias reads on the canonical-case seed) and the seed's own c_invoice having no
  c_order_id linkage (GW arm folds order-direct).
- ✅ **frame-fit on banded ids** — `poc_idmp_frame_fit.js` INVOICE_ID now 100+CL*100000: `§FRAME-FIT client=13 …
  coverage=complete balanced=Y oracle=fact_acct(3) maxDiff=0c verdict=ORACLE-EQUIVALENT` + falsifier loadBearing=Y.
- ✅ **#5-install wiring (bim-ootb 08cf449)** — erp_picker.js?v=27/2: TENANT_SHARD gains idempiere
  (13-idempiere.db SHIPPED, `git add -f` = the tracked-shard pattern); install mode routes iDempiere →
  `_renderInstallTenant` (pre-verified shard → straight to the Install CTA via the SAME `_doInstall`); migrate
  mode keeps MigrateShowMe untouched. Witness `erp/tests/poc_install_idmp.js` (W-INSTALL-IDMP, exit 0):
  dialog→`§ERP-INSTALL … persisted=Y` · bare reload → client 13 resident, 8/8 orders, roles=4 · guarded
  re-install (`already=Y rows=0`) · preview C_Invoice:1300100 `coverage=complete ΣDr=5035==ΣCr=5035` ·
  screenshot install_idmp_resident.png. Regressions on the same tree: W-INSTALL-PERSIST + W-CLIENT-SWITCHER
  re-run PASS (persist witness gains the worktree playwright-path fallback). NOTED honest side effect:
  tenants=3 post-install — the shard's System(0) identity rows land → System client becomes login-able (stock
  iDempiere behavior).
- ✅ **Deploy, VERIFIED** — PR #265 squash fd09ad1 on main; **the PR #138 orphan trap FIRED**: the late-pushed
  #5-install commit (08cf449) was NOT in the squash (0 `_renderInstallTenant` hits on main) → re-landed per
  protocol off FRESH origin/main as **PR #266 (squash 3b6cb04, sw v649)** — verified on main (picker route ×2,
  `erp/13-idempiere.db` blob, CACHE_VERSION v649). LIVE on Pages: sw v649 · `ad_seed.db content-length=26112000` ·
  idempiere.html v14×5/v13×0 · erp.html v14×2 · shard HTTP 200 (552960 bytes) · picker route served. (Both e2e
  failures = the UNRELATED flaky viewer S274 GP.2 goto-timeout; passed on re-run; ERP-only diffs.)
  bim-compiler: 1122ddbe on `feat/erp-substrate-phase012`, pushed. Matrix C_DocType-FSM residuals + AD_Process
  seed-gate notes updated; UI_UNPARK_RESUME residual banner added; NEW_CLIENT_MGMT #5-install flipped ✅.

---

# CORRECTION-1 (2026-08-24, RETRACTED — see CORRECTION-2 below) — wrongly claimed the 5 scripts don't exist

The first pass at this correction searched only **bim-ootb** (`find`/`grep -r` current tree + `git log --all
-S` per string) and concluded the 5 §3 witness scripts were never committed. That search missed the actual
location: **all 5 live in `bim-compiler/scripts/`** (this repo), not bim-ootb — a wrong-repo search error,
not a missing-file finding. Left in place below, struck by CORRECTION-2, as a record of the mistake (don't
repeat: when a witness name is "missing," check bim-compiler's own `scripts/`/`build/erp/` before concluding
it never existed — the engine/witness code lives here, bim-ootb only hosts the deployed browser app).

# CORRECTION-2 (2026-08-24) — the 5 §3 witnesses DO exist (bim-compiler `scripts/`), re-run live: 4 PASS, 1 FAILS FOR REAL

All 5 are tracked, clean, on `origin/master`, committed by `1122ddbec` (`IDMP_FULLWIDTH_SEED §1-§4`, this
card's own DONE commit): `scripts/poc_ad_docfsm_live.js`, `poc_ad_access_live.js`, `poc_ad_modelval_live.js`,
`poc_ad_menu_prf_live.js`, `poc_ad_displaylogic_live.js`. Actually re-run (`bash build/erp/run_witness.sh
scripts/poc_ad_<X>_live.js`, ERP_ROOT default `~/bim-ootb/erp`, 2026-08-24, fresh-synced bim-ootb `origin/main`):

| witness | result |
|---|---|
| W-AD-DOCFSM-LIVE | 🟢 PASS — `build/erp/poc_ad_docfsm_live.log` |
| W-AD-ACCESS-LIVE | 🟢 PASS — `build/erp/poc_ad_access_live.log` (role-scoped menu, real `ad_window_access` grants; note this witness's *territory* now overlaps `erp/tests/poc_access_gate_live.js` from bim-ootb PR #1495 — both live, not a replacement) |
| W-AD-MODELVAL-LIVE | 🟢 PASS — `build/erp/poc_ad_modelval_live.log` |
| W-AD-MENU-PRF-LIVE | 🟢 PASS — `build/erp/poc_ad_menu_prf_live.log` |
| W-AD-DISPLAYLOGIC-LIVE | 🔴 **FAIL, exit 2** — `build/erp/poc_ad_displaylogic_live.log`: `shown=1 hiddenByLogic=0 ChargeAmt-rendered=0 DocumentNo-rendered=0` |

**The DisplayLogic failure is a real, diagnosed regression, not a stale-witness artifact.** Root cause
(diagnostic run capturing full console output against the same route, `?window=143&record=100`): the record
now renders through a **different, newer UI path** — `crud_overlay.js`'s inline-edit overlay
(`§INPLACE-EDIT table=c_order id=100 verb=update fields=8 mount=inline`, `§AD-LOGIC-LIVE key=c_order fields=8
withLogic=0 visibilityFlips=0`) — instead of the original accordion/form render this witness was built
against (`idempiere.html:2901-2914`, `.idmp-fld` markup, the real `§AD-DISPLAYLOGIC-LIVE table=… hidden=…`
tag). **Both code paths still exist in `erp/idempiere.html`/`erp/ad_ui.js`** (verified: `.idmp-fld` at
`idempiere.html:2817,2917`; `§AD-DISPLAYLOGIC-LIVE` tag still emitted at `idempiere.html:2914` and
`ad_ui.js:183-195`) — the newer inline-edit overlay (`erp/crud_overlay.js`) has just taken over as the
default render for this route, and its `§AD-LOGIC-LIVE` field-visibility pass reports `withLogic=0`: the
DisplayLogic-hiding behavior (`docs/internal/ERP_COVERAGE_MATRIX.md:24`'s ✅ `AD_Field·DisplayLogic
W-AD-AD-DISPLAYLOGIC-LIVE` row) is **not exercised on the current default record view** — same failure shape
as the access-gate finding this whole T-0 pass started from (`ERP_PROJECT_REVIEW.md` §2.1: a proven-live
behavior silently superseded by a newer code path, nobody re-witnessed). **Neither the evaluator nor its DOM
wiring is broken** — `crud_overlay.js:483 applyAdLogic` correctly reads per-field displaylogic and calls the
same proven `CORE.effectiveFlags`; the gap is that the inline editor's curated 8-field set for `c_order`
happens to contain none of the 27 DisplayLogic-bearing columns the 60-field accordion form had. **Queued as
a new named gap** —
see `prompts/RESUME_ERP_T0_TRUTH_MAINTENANCE.md` item 8.

**For the re-witness protocol itself:** the 5 scripts ARE re-runnable exactly as written in §3 above — no
rewrite needed to run them, only to fix the one real failure. `poc_ad_displaylogic.js` at
`bim-ootb/erp/tests/` (an unrelated, differently-scoped headless test, not this witness) is a false-friend
name collision — don't confuse it with `poc_ad_displaylogic_live.js` here.
