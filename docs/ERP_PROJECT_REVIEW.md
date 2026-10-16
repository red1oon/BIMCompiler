# ERP Project Review — Card 0 (Fable 5 whole-project adversarial audit)

**Run:** 2026-08-12 · Fable 5 · per `prompts/FABLE5_PROJECT_REVIEW.md` (spec written 2026-06-11, deferred by
recorded decision the same day — `prompts/FABLE5_MORDER_EQUIVALENCE.md:2-4` — and executed now, two months later).
**Method:** READ + WRITE-ONE-DOC. No code changed. Spot-checks read witness logs; ONE witness re-run live
(`bash build/erp/run_witness.sh scripts/poc_morder_fsm.js`, 2026-08-12, exit 0). Live-UI reachability and the
lane index were audited read-only against bim-ootb `origin/main` (local checkout was 36 behind; all deploy-side
reads via `git show origin/main:`), every claim below carries a file:line / log / commit / matrix-row citation.
**Context the spec predates:** the spec assumed the tally was `0✅/39🟡/3⛔` and that this card gates H-1.
In fact H-1 ran 2026-06-11 (gate consciously deferred, not silently skipped), and the campaign continued through
H-2, the isomorph tail, B-1/B-2 (06-12), B-3 (07-17) and W-POST-TAIL/-2 (07-18). This review is therefore a
**post-hoc audit of a lane that ran ~2 months without its planned adversarial gate** — which is exactly what the
review was re-invoked to check.

---

## 1 · Is the thesis sound?

**The claim (restated):** iDempiere made the UI data and left the engine as code; this project pushes the same
bet one layer deeper — the engine becomes data too — ONE owned AD model (`build/erp/ad_full.db`, 927 tables) +
a signed, hash-chained op-log (`build/erp/kernel_ops.js:21-23` W-CHAIN/W-SIGN); UI is a cheap swappable lens
behind one contract; the engine folds ANY source ERP into renderable, *oracle-equivalent* iDempiere
(`docs/internal/ERP.md:83-90`, `docs/internal/IDEMPIERE_2.md:24-33`).

**Where it is strongest — the oracle-diff discipline.** This is not a demo culture; it is a falsifier culture:

- The contained-set thesis was put on trial across six hot cells and held — settlement collapses to ONE generic
  matcher, zero new verbs (`docs/internal/ERP.md §0.17:888-945`, M_MatchInv 18/18, M_MatchPO 19/19).
- The equivalence campaign (H-1 → H-2 → isomorph tail → H-3 → B-1/B-2/B-3 → W-POST-TAIL) diffs the engine
  against *real* oracles — stored GardenWorld rows, the live iDempiere Postgres, runtime-parsed Java source, and
  (B-3) the real compiled posters driven inside iDempiere's own OSGi test harness — never hand-authored fixtures.
  Every row carries a load-bearing §FALSIFIER (e.g. `poc_alloc_post.log`: drop tax-correction → maxDiff=13c).
- The refusal discipline is real. §W-POST-TAIL-2 (`prompts/HARDEN_MATRIX.md:204-230`) *predicted* Cash/Inventory
  would post on a scratch clone, measured that the real engine refuses (`IsActive='N'`, `@NoLines@`, "No Costs"),
  and banked the refusal as ⛔ rather than mutating data to force a ✅. That is the Prime Directive working
  under pressure.
- Public claims lead with the conservative bound: ~21× at full parity, not the flattering 51×, with the "~1% of
  M-class logic actually ported" caveat printed in the paper itself (`docs/MigrateComparisonPaper.md:943,973-977`).
- The grail itself is stated as **half-reached** — rules extracted to data, the live edit-loop NOT built
  (`docs/HolyGrail.md:146-172`). The differentiating witness `§RULE-EDIT` is named but does not exist yet.

**Where it is thinnest:**

- **"Folds ANY source" rests on two doc-complete tenants.** iDempiere (canonical) + Odoo 17 (J5/J6, maxDiff=0c).
  SAP is a master-mapping + lifecycle stub with no FI; the marquee ACDOCA fold is ⛔ pending *access to a posted
  oracle* — an external dependency the project cannot schedule (`docs/internal/ERP_COVERAGE_MATRIX.md:36-49`).
  Oracle EBS / Dynamics are reference-only. The matrix states this honestly; the thesis language elsewhere
  ("ANY source") outruns it.
- **Mechanism ≠ corpus, and the corpus is most of the behavior.** 454/476 SvrProcess procs, 139/145 callout
  atoms, ~200 beforeSave overrides remain named-deferred (`ERP_COVERAGE_MATRIX.md:188-194`). The L0–L6
  admission model (`IDEMPIERE_2.md:168-205`) is the honest frame — but full-parity readings of the ledger must
  be resisted: 52 oracle-equivalent surfaces ≠ a ported ERP.
- **The UI-lens leg is the least proven leg of the thesis** — see §2: one of the browser gates turned out to be
  a *different engine than the one the matrix credits*.

**The single weakest link most likely to invalidate the thesis:** the oracle universe is **one seed**
(GardenWorld client 11) with small K stated per row (K=1, K=2 rows are common — e.g. W-MPAYMENT-SAVE K=2,
W-MALLOCHDR-SAVE K=1, `ERP_COVERAGE_MATRIX.md:92,98`). "Oracle-equivalent to the cent" is proven exactly as far
as this seed exercises the code paths — the matrix's own posting tail hit that ceiling three times ("the ceiling
is this seed's actual data state", `ERP_COVERAGE_MATRIX.md:115`). Equivalence on GardenWorld does not bound
behavior on a tenant whose data exercises the unwalked arms (commitment-ON posting, foreign-rate journals,
charge lines, the 454-proc corpus). The honest generalization instrument exists — fold a NEW tenant and diff
(the Odoo path) — but only one such second tenant has been walked.

**Verdict on the thesis: SOUND, and unusually honestly argued — but its two forward-looking legs (any-source
migration, UI-as-lens) are each one proof-point thinner than the engine leg, and the differentiator (live rule
edit) is still a promissory note.**

---

## 2 · Is the equivalence tally HONEST?

**Claimed:** coverage `7✅ / 32🟡 / 3⛔ of 42` (`ERP_COVERAGE_MATRIX.md:20-26`; arithmetic verified) + an
equivalence ledger of **52 oracle-equivalent** surfaces/classes + 3 rule/recipe-consistent
(`ERP_COVERAGE_MATRIX.md:117`, `HARDEN_MATRIX.md:136`) + 17/20 factory posters folding (`:115`).

**Spot-checks (4 rows, 1 re-run):**

| row | check | result |
|---|---|---|
| W-MORDER-FSM (H-1.4) | **re-run live 2026-08-12** via `run_witness.sh` | 🟢 exit 0, `fixtures=43 diff=0`, both falsifiers fire; log size identical to the June run (7,272 B) — deterministic |
| W-FOLD-ALLOC | log read (`build/erp/poc_alloc_post.log`, 06-11) | 🟢 2/2 == `fact_acct(735)` maxDiff=0c incl. tax-correction sub-cents; falsifiers 13c / truncate-vs-HALF_UP load-bearing; schema-200000 honestly §DEFERRED (later closed by W-FOLD-ALLOC-FX) |
| W-POST-TAIL | log read (`build/erp/poc_post_tail.log`, 07-18) | 🟢 BankStatement 0c vs fact_acct(392); MatchPO ∅==∅ over all 37 docs; 3 falsifiers; skips named in-log |
| W-LOGIC-HARDEN (B-1) | log read (`build/erp/poc_logic_harden.log`, 06-12) | 🟢 2751/2751 diff=0 vs the real compiled evaluator; verdicts two-sided (T=985/F=1766); flip-falsifier flips BOTH sides |

**Is 🟡 inflated?** **No.** The two axes (coverage-touched vs oracle-equivalent) are kept explicitly distinct
(`HARDEN_MATRIX.md:40-43`), 🟡 is defined as touched-not-proven, three rows that merely re-exercise counted
surfaces are explicitly tagged "*Evidence row — does not change the 42-surface tally*"
(`ERP_COVERAGE_MATRIX.md:61-63`), and the rule-consistent tier is explicitly "NOT == iDempiere" (`:107-108`).
**Are the 3⛔ dodged?** **No** — each carries an engine-cited, data-state reason (AD_Rule: ruletype-Q SQL over
empty tables; C_Cash `IsActive='N'` at `Doc.java:591-605`; M_Inventory `@NoLines@`/no-costs at
`Doc_Inventory.java:319-336`), and §W-POST-TAIL-2 measured them rather than asserting them.

**Findings against the tally (none reverses it; two require correction):**

1. 🚩 **The four security ✅ COVERED rows credit an engine that has never shipped.** The matrix flips
   AD_Role / AD_Window_Access / AD_Process_Access / AD_Form_Access to ✅ on live-UI witnesses and names
   `ad_access.js` as the engine (`ERP_COVERAGE_MATRIX.md:24`). **`ad_access.js` does not exist anywhere in
   bim-ootb** (no file, no script tag; verified against `origin/main`). The live browser gate is
   `erp/idmp_session.js` (loaded at `erp/idempiere.html:480`; `accessibleWindows/Processes/Forms` at
   `idmp_session.js:159-187`) — an independent implementation with **no `IsReadWrite`, no AccessLevel `canView`,
   no org/client `gateRecord`** — the semantics W-ACCESS-HARDEN proved on the *headless* `build/erp/ad_access.js`
   (`:46,93,119,148-149`) never reached the browser. This is precisely the "reimplemented under a different
   name" pattern this review was asked to hunt: the June live behavior (role-pruned menus) was genuinely
   witnessed, but on weaker code than the row credits, and the rows' readWrite/accesslevel semantics are NOT
   live today. **Honest coverage reading: 3 of the 7 ✅ verified intact (C_DocType FSM — wiring re-verified at
   `idempiere.html:2152-2216,2880`, extended not replaced; DisplayLogic — `idempiere.html:2895-2905`;
   AD_Process); the 4 access rows should be re-scored 🟡 (or the gap closed) until the proven engine is the
   shipped engine.** The *equivalence* ledger is unaffected — it scores headless engines and says so — but
   nothing in the matrix warns that the browser runs a different access gate.
2. 🚩 **One cited evidence log is missing: `build/erp/generate_post_tail_oracle.log`** — cited three times as
   the ground truth for the W-POST-TAIL-2 ⛔ classifications (`ERP_COVERAGE_MATRIX.md:113`,
   `HARDEN_MATRIX.md:229`). 79 of the 80 distinct logs the matrix cites exist on disk; this one does not
   (`build/erp/*.log` is gitignored — `.gitignore:85` — so witness evidence is local-only by design, and this
   file did not survive). The fixture it produced IS committed (`build/erp/oracle/post_tail_fixture.json`,
   commit `102f0eb9b`) and the *diff* is re-runnable from it, so the claim stands — but the generation-run
   provenance is gone, and the retention is inconsistent (B-3's excerpt `oracle/post_b3_oracle_run.log` was
   preserved in the tracked dir; the tail-2 twin was not). Lower stakes because it backs a *concession* (⛔),
   not a win — but by this project's own Log Mandate it must be flagged, and it exposes the structural point:
   **the entire 52-row evidence base is one `git clean` away from existing only as prose.**
3. **The ledger number (52) is maintained as prose increments, not an enumerable list.** The increments are
   internally consistent (41 → 42 → 43 → 49 → 52 with named causes: `HARDEN_MATRIX.md:93,101,136`;
   `ERP_COVERAGE_MATRIX.md:109,111,113`), and the spot-checks all verified — but the number cannot be
   independently recounted from the table (49 rows grep as "✅ oracle-equivalent", of which 3 are non-tally
   evidence rows and 2 bundle 6+3 surfaces each). Not inflation — bookkeeping fragility.
4. **Stale claim-echoes contradict the tally in sibling docs:** `IDEMPIERE_2.md:161` still says
   "0 covered / 12 partial / 28 gap of 40"; `HARDEN_MATRIX.md:15` says "0✅/37🟡/3⛔"; the review spec itself
   said "0✅/39🟡"; three memory lanes report the ledger as 14, 20 and 41 (see §3). Anyone reading a single doc
   gets a random generation of the truth.
5. **June-era live numbers have rotted under the deployed seed.** The shipped `erp/ad_seed.db` has been
   regenerated twice since PR #265 (IDB key v14 → **v16**, `idempiere.html:666,875`) and now carries 14 roles /
   4448 window grants / **600** `fact_acct` rows vs the matrix's 5 / 1303 / 300; `idempiere.html:2322,2685`
   still carry the rotted comment "fact_acct is NOT carried in ad_seed.db" (behavior is correct — the gate is
   row-count-based — only the prose is wrong). `bim-compiler/build/erp/ad_seed.db` is 0 bytes locally, so the
   June per-role figures are not locally re-verifiable.

**The honest count:** equivalence **52 stands** (verified by spot-check and consistent increments; needs an
enumerable ledger). Coverage is honestly **3✅-verified + 4✅-misattributed + 32🟡 + 3⛔** until the access-gate
finding is resolved. Nothing was found that "quietly reads surface-touched as works" — the failure mode found is
subtler: *proven-headless quietly reads as shipped-live*.

---

## 3 · Drift & dead lanes

**The ERP-side counterpart of the BIM housekeeping debt EXISTS, and it is the lane index, not branches**
(65 local branches here ≈ 65 remote — no 530-branch problem; the 20 `.claude/worktrees/agent-*` are
harness-managed). Full audit of all 39 "Project — ERP" memory lanes (subagent, verdict table on file):

- **Activity: 3 of 39 lanes show any in-text activity after 2026-07-01** (`project_erp_business_cycle_next.md`
  DONE 07-22 · `project_erp_p2p_invoice_match.md` 07-23, the one honestly-live lane · the demo-sequencing memo
  07-22). **0 of 39 after 2026-08-01.** 35 lanes are frozen text from mid-June or earlier; 4 carry no date at
  all. Filesystem mtimes are useless — all 39 files were bulk-stamped 2026-07-30 06:35:03 by a memory-dir move.
- **The repo agrees:** last commit touching `build/erp/` or `scripts/poc_*` is `102f0eb9b` **2026-07-18**;
  last ERP-path commit at all is `883fe9cc5` 2026-07-23 (P2P). Since 2026-07-01: 1,257 commits total, ~50
  (~4%) ERP; **since 2026-08-01: 296 commits, zero ERP**. The ERP arc has been code-dark for 25 days while the
  4D/cinema lanes absorbed all attention. (Whether that priority is intended is the user's call; the *tracking*
  of it is what's broken.)
- **~15 lanes are done-but-not-buried** ("ALL DONE", "DRAINED", "LIVE" — still listed as active with no closure
  marker): crud_edit_persist, pos_killer_demo, pos_lens, kanban_marvel, erp_mobile_ui_fixes, spatial_picking,
  posting_preview, multi_lane_launch, import_expand_poc, new_client_mgmt, + fossils (spatial_erp, ad_erp,
  erp_ad_ui — whose "Next: Session 2 = ad_ui.js renderer" shipped months ago) + reports/reference cards filed
  as lanes (scale_forecast, erp_shard_rekey).
- **4 lanes self-contradict** (ninja_mode: "✅ LANE COMPLETE" + "⬜ NEXT SESSION 3 gaps"; erp_dr_tco: "next
  session" above "ALL CLOSED"; tour_guide: description "blocked" vs body "LIVE BIND VERIFIED 11/11";
  erp_sync_fsm: PR #195 "HELD" then "HELD is not honoured").
- **1 lane is stale-WRONG:** `project_fable5_lane.md` still lists "0-seed posting oracles" as *remaining* —
  commits `1241cd6f1` (07-17) and `3003b1881`/`102f0eb9b` (07-18) shipped exactly that, ledger 41→52. A month
  of real ERP work was never written back to the lane that owns it.
- **3-way number contradiction:** the same ledger is reported as 14 (demo_sequencing), 20 (fold_keystone),
  41 (fable5_lane) — repo truth is 52. Undated snapshots presented as current.
- **The index is incomplete as well as stale:** ≥10 ERP-topic memory files exist unlinked from MEMORY.md
  (project_erpmaker, erp_instant_globe, erp_one_base_doctrine, erp_raw_migration, erp_refmap_bug,
  erp_reporting_lane, erp_secured_phase, idempiere_renderer, ninja_excel, glassbowl_builder). Duplicate
  clusters: plugins ×3, POS ×4 (2 unlisted), tenant-onboarding ×4, BIM→ERP ×3.
- **Doc-path drift:** the ERP canon moved to `docs/internal/` (commit `87bc56b47`) but `CLAUDE.md` ("read
  `docs/ERP.md` first") and this review's own spec still cite the dead `docs/ERP.md` / `docs/ERP_*` paths.
- Also noted in passing: the bim-ootb local checkout carries **1 local-only commit** on top of being 36 behind
  origin/main — someone's unpushed work, against the push-before-finish rule (not this repo's to fix; flagged).

**Costliest three confusions:** (1) `project_fable5_lane.md` stale-wrong — the flagship lane misstates what
remains; (2) the 14/20/41/52 ledger disagreement — no reader can trust any one number; (3) the ✅-live security
rows vs `idmp_session.js` (§2.1) — the one drift that misstates the *shipped product*, not just the paperwork.

**Verdict: the tracked-vs-verified gap the user feared is real, but it is a *bookkeeping* failure, not an
integrity failure — the underlying witnessed work checks out everywhere it was spot-checked; the index describing
it has stopped being maintained (the MEMORY.md ERP block is the only section whose entries carry no state
labels, unlike the BIM/CPE sections above it).**

---

## 4 · Architecture / separation

**The §0 three-layer invariant (declaration / interpretation / log-fold never merge,
`docs/internal/ERP_BACKEND_SEPARATION.md:15-37`) HELD under two months of load.** Checked mechanically and by
read:

- **No layer-2 sibling coupling:** zero cross-module `require`/references among the nine `build/erp/ad_*.js`
  engines (the §5 anti-coupling grep, `ERP_BACKEND_SEPARATION.md:147-151`, run 2026-08-12: clean).
- **Layer-3 determinism contract intact:** `kernel_ops.js` fold/replay paths are pure (`:232` "PURE: no
  Date.now/Math.random"); append-path stamps accept a supplied deterministic `ts` (`:80-84`);
  `erp_period_close.js:16` and `scripts/erp_engine.js:11` declare and hold the same rule.
- **The campaign extended the seams instead of eroding them:** H-2/tail/B-3 added per-table FSM and save-hook
  surfaces as new registry entries in the *existing* modules (`ad_docfsm.legalActionsFor`, `install*SaveHooks`
  in `ad_modelval`), and B-3/W-POST-TAIL extended `doc_poster.derivePostings` with per-class manifests — data
  added, layers unmoved. The composer rule (caller composes; modules never call each other) survives in the
  doc-action path (`admit → derive → fold`).
- **Named deviations (accepted, should be recorded):** the A-1 module the spec names `build/erp/ad_posting.js`
  (`ERP_BACKEND_SEPARATION.md:46`) shipped as `scripts/post_resolver.js` + `scripts/doc_poster.js` — location/
  name drift only; no seam violation found. `docs/kernel_ops.js:72` (the glassbowl UI copy) still stamps
  `Date.now()` at op-append — an *input* timestamp, permitted; fold paths in the same file are pure.

**Is the 3-layer model the right architecture?** Yes — the evidence is that every new surface for two months
landed as either (a) rows in layer 1, (b) a registry entry in an existing layer-2 module, or (c) a manifest for
the layer-3 fold, and the B-1/B-2 oracles could drive layer-2 modules *headless and unmodified*. An architecture
that lets you diff its parts against a foreign JVM without refactoring is holding.

**Where the architecture actually leaks — the twin-copy seam, not the layer seam.** The engine ships as UMD
twins (`build/erp/*.js` ↔ bim-ootb `erp/*.js`), with no mechanism keeping them equal:

- The three twins checked are md5-identical (ad_docfsm / ad_evaluator / wh_route — zero drift). Good.
- But the twin *set* is incomplete: `ad_access.js` and `ad_valrule.js` **have no browser twin at all** (§2.1),
  and the browser grew a non-twin (`idmp_session.js`) with no bim-compiler counterpart — the fork happened at
  the module-set level, where no convention was watching. (bim-ootb's own history shows the pattern being
  fought elsewhere: `f83312c` "ONE canonical common/pill_builder.js — retire the silent erp/viewer fork".)
- The deployed seed regenerates independently of the matrix's numbers (§2.5).

**Regression standing:** CI runs exactly ONE ERP witness (`.github/workflows/ci.yml:8`,
`scripts/system_is_real.sh:29` → `poc_fold_complete.js`). There is **no bundle runner** — "whole bundle re-run
green" (`HARDEN_MATRIX.md:226-230`) was a manual, witness-by-witness pass, last done 2026-07-18. The 52-row
ledger's freshness is therefore a hand-run claim; today's single re-run (W-MORDER-FSM) was green, which is
evidence the bundle likely still passes, not proof.

---

## 5 · Highest-leverage next move

**H-1 is not the next keystone — it is finished and it verifies.** `ERP_MODEL_ARCHETYPE.md:41-47` (REACHED
2026-06-11), `FABLE5_MORDER_EQUIVALENCE.md:104` (# DONE), and this review's own re-run confirm it. The question
the spec asked ("is H-1 right?") has been answered by execution; the question that remains is what the *lane*
needs now. Ranked:

1. **T-0 · A bounded TRUTH-MAINTENANCE + RECONCILIATION pass (1–2 sessions, highest leverage per hour).**
   This is the direct answer to the oversight question that re-invoked this card — it converts "a pile of June
   claims" back into a checkable system:
   - **Fix the access-gate finding (§2.1)** — either ship the proven `ad_access.js` semantics into the browser
     gate (fold `canView`/`IsReadWrite`/org-scope into or alongside `idmp_session.js` + a live witness), or
     re-score the 4 rows 🟡 with the gap named. Recommend: re-score NOW (honesty is cheap), wire NEXT.
   - **Make the 52-ledger enumerable + re-runnable:** one numbered list in the matrix; a
     `build/erp/run_bundle.sh` over the witness set; wire it (or a subset) into CI or a scheduled run;
     regenerate + commit the missing `generate_post_tail_oracle` excerpt to the tracked `build/erp/oracle/`
     dir (the post_b3 precedent).
   - **Write back the lane index:** mark the ~15 done lanes DONE, fix the 4 self-contradicting files, correct
     `project_fable5_lane.md` (B-3/POST-TAIL landed), collapse duplicates, link or archive the 10 unlisted
     files, add state labels to the MEMORY.md ERP block, fix the stale scoreboard echoes
     (`IDEMPIERE_2.md:161`, `HARDEN_MATRIX.md:15`, `CLAUDE.md` doc paths, `idempiere.html:2322,2685`).
2. **The §RULE-EDIT grail witness** (`docs/HolyGrail.md:159-172`) — the single named witness that closes the
   half-claimed grail (edit one validation row → K records re-fold live, signed, reversible). It is the
   project's differentiator, the architecture is already standing under it, and it is one bounded gesture —
   the right *build* keystone after T-0.
3. **Close the open transactional thread:** P2P M_MatchInv (the named blocker in
   `project_erp_p2p_invoice_match.md`, PROGRESS.md:307; PR #972 was open as of 07-23 — verify merged first,
   per `feedback_verify_pr_merge_before_followup_push`).
4. **ACDOCA fold (SAP)** — stays ⛔ on oracle access (`ERP_COVERAGE_MATRIX.md:44-49`); not schedulable from
   inside the repo. The paper (`docs/BIMERPPaper.md`) can consume the existing fixtures whenever chosen
   (`HARDEN_MATRIX.md:267-270`), but it inherits whatever staleness T-0 doesn't fix — sequence it after.

Not recommended as next: another equivalence band. The marginal row now proves less than T-0's restoration of
the *system that makes rows provable* — the campaign's own honesty is its main asset, and it is the thing
currently decaying.

---

## 6 · Verdict

The engine-side work is real, deep, and holds up under adversarial spot-checks — including a live re-run today.
The decay is in the truth-maintenance layer around it: a stale-wrong flagship lane file, a four-generation
spread of scoreboard numbers, one ✅ band crediting an engine the deployed product does not run, one lost
evidence log, and an index nobody has pruned since mid-June. None of that is invention; all of it is drift —
and it is exactly the kind of drift that, left another two months, would make the *next* honest audit
impossible.

**REDIRECT: H-1 is already executed and verified (do NOT re-run `FABLE5_MORDER_EQUIVALENCE.md`); the
highest-leverage target is the T-0 truth-maintenance pass of §5.1 — re-score/wire the access-gate rows, make
the 52-ledger enumerable + bundle-re-runnable, write back the lane index — followed by the §RULE-EDIT grail
witness as the next build keystone.**

---

## §2.1 CLOSED — the access-gate finding, wired live (2026-08-23)

11 days after this review, the T-0 pass had not started (0 ERP commits in that window — confirmed by
`git log --since=2026-08-12 -- erp/`). Closed now, scoped to exactly the §2.1 finding, nothing else:

- `erp/ad_access.js` shipped as a true twin of `build/erp/ad_access.js` (md5-identical, verified before AND
  after a defensive bugfix described below — the twin was re-synced, not allowed to drift).
- `erp/idmp_session.js`'s `accessibleWindows`/`accessibleProcesses`/`accessibleForms` now delegate to
  `AdAccess.buildRole(...).gateWindow/gateProcess/gateForm` via a `db.prepare().get()/.all()` shim
  (`toB3`, the same shape `idempiere.html`'s own `_b3w` and `erp/doc_cycle_validator.js`'s `mkAdapter`
  already use for this exact node-shaped-code-on-sql.js problem — not a new pattern). External return
  shape is unchanged (`{id: {rw:bool}}`, still truthy — every caller only tests presence); a loud
  `§ACCESS_GATE_MISSING`/`§ACCESS_GATE_ERR` log + honest fallback fires if `AdAccess` fails to load, so a
  future regression here is never silent. A `gateRecordFor` (record-level `canView` + org/client scope) is
  now exposed but NOT wired into every CRUD call site — that is a whole-app integration, out of scope for
  the 4 Role/Window/Process/Form rows this closes; named so it isn't mistaken for done.
- **A real bug found while wiring, not before:** `ad_access.js:buildRole`'s entity-type query assumed
  `ad_entitytype` exists; it doesn't in the browser's trimmed `ad_seed.db` (only in the full `ad_full.db`
  dump) — the exact same class of gap the sibling Forms/ValRules fork found the same day. Fixed defensively
  (try/catch → empty set, same idiom `idmp_session.js` already used for `isShowAcct`); re-verified the
  headless oracle-equivalence witness (`poc_access_harden.js`, 15/15 maps diff=0, 42/42 canView combos)
  still passes unchanged after the fix, and re-synced the twin's md5 after.
- **Live proof** (`erp/tests/poc_access_gate_live.js`, new — the matrix's prior citations
  `poc_ad_access_live.js`/`poc_ad_menu_prf_live.js` do not exist anywhere in bim-ootb, confirming they
  never shipped either): `window.AdAccess` loads; `accessibleWindows` logs `source=AdAccess/...` not the
  fallback path; role 103 (User) and 102 (Admin) differ on window 114 "Task" exactly as the real grant
  rows say; a real `?login=` auto-login (the same production code path the click-through dialog calls)
  shows `menu-visible=163/332` for User vs `294/332` for Admin from the live `§IDEMPIERE-LOGIN` log; window
  114 cross-checked as a real tree-reachable `AD_Menu` leaf, not a synthetic fixture. 0 page errors.
  **Honest ⬜, not fabricated:** this seed carries zero `isreadwrite='N'` grant rows across every
  role/window/process/form — the read-write-vs-read-only distinction is implemented and exposed
  (`{rw:bool}`) and already headless-oracle-proven, but cannot be demonstrated against live browser data
  today; named rather than claimed.
- Regression check: `erp/tests/poc_client_switcher.js` fails 3/many pre-existing, unrelated to this fix —
  its fixture assumes `ad_seed.db` starts with exactly 1 resident tenant, the live seed now carries 7 (the
  same seed-drift class §2.5 already named). `test_idempiere_login.js` couldn't run in this worktree
  (`Cannot find module 'sql.js'`, a pre-existing environment gap, not evaluated). Neither touches
  `accessibleWindows`/`AdAccess`/`idmp_session.js`'s changed functions.
- CI: not wired in — `scripts/system_is_real.sh` runs exactly one headless ERP witness
  (`ERP_WITNESS`/`poc_fold_complete.js`); this is a live-browser Playwright witness, a different class,
  and there is still no bundle runner (§4, unchanged). Named, not silently skipped.
- `docs/internal/ERP_COVERAGE_MATRIX.md`'s 4 access rows re-scored ✅ with the real witness cited, the
  phantom `poc_ad_*_live.js` citations corrected in place.
- Ships: `sw.js` v767→v768 (new precached file `ad_access.js` + the delegation change to `idmp_session.js`).

**What this does NOT close:** §5.1's other two T-0 items (the 52-ledger enumerable list, the lane-index
write-back) — untouched, still open. The §RULE-EDIT grail witness — untouched. This is exactly one
finding, closed precisely, not a re-run of the whole T-0 pass.

---

## §7 — 2026-08-23: T-0 still not started; a fresh structural triage against the live PG found a new
## showstopper before it found a fix

11 days after this review, **T-0 had not been started** (verified: 0 ERP commits since 2026-08-12, `ad_access.js`
still doesn't exist in bim-ootb, `idmp_session.js` still has no `IsReadWrite`/`canView`/org-scope). The ERP lane
had been fully code-dark the entire interval.

**New structural finding (declarative/navigation layer, not the oracle-equivalence engine):** the shipped
`erp/ad_seed.db` carries 82-100% of the real iDempiere AD dictionary (Windows 375/458, Tabs 1135/1166, Fields
20988/21432, Menus 590/826, Processes 476/476, References 604/606) — but `AD_Form` and `ad_val_rule` were
**entirely absent** (0 rows / no table), against 53 and 332 real rows. `build/erp/ad_full.db` (the raw migration
dump) has essentially perfect fidelity on all of these — the gap is specifically in what gets trimmed into the
shipped seed, not in the migration capability.

**Attempted fix, found a bigger gap instead.** `scripts/ad_seed_manifest.json` was missing both tables (a prior
substring-based scan wrongly credited `AD_Form` as present — it had matched `ad_form_access` instead; corrected
here). Both were added with real PK/case/column contracts extracted from the live PG catalog (bim-compiler PR
#91) and verified: `export_ad_seed.js` lands `AD_Form=49` (53 real, 4 inactive, exact match) and
`ad_val_rule=332` (exact match), zero errors, reproduced twice.

**But re-running the full export against the CURRENT live docker PG (`postgres`/`idempiere`) regresses
production, badly**, not just for the 2 new tables:

| table | shipped `ad_seed.db` (2026-07-05) | fresh export (2026-08-23) |
|---|---|---|
| ad_client | 6 | 1 |
| ad_role | 14 | 4 |
| C_BPartner | 113 | 18 |
| ad_window_access | 4448 | 1080 |
| fact_acct | present | not in the manifest at all |
| HR_*, C_Subscription* | present | not in the manifest at all |
| kernel_ops | present | not a PG table — bim-ootb's own op-log, confirms the shipped seed is POST-PROCESSED, not a raw export |

Checked both live PG databases (`idempiere` AND `idempiere_test`, the posted-fact_acct oracle) — **neither holds
anywhere near the data state that built the shipped seed.** `idempiere_test.c_bpartner=18` matches the fresh
export exactly, not the shipped seed's 113. The container has drifted or been reset since July. **This means:
the shipped `erp/ad_seed.db` was never a straight `export_ad_seed.js` run — some further pipeline stage (likely
`fact_acct` pulled from `idempiere_test` via `extract_fact_acct.sh` per `reference_idempiere_source.md`, plus HR/
Subscription seeding, plus the §4 PK-reband/client-13-shard step from `prompts/archive/IDMP_FULLWIDTH_SEED.md`)
folds additional sources in, and that stage's exact recipe is not identified anywhere checked so far.**

**Not shipped, deliberately.** The manifest fix (PR #91) is real and safe on its own — it's a correct, minimal,
verified addition that costs nothing to merge. But regenerating and deploying the seed right now, even just to
add Forms/ValRules, would silently wipe fact_acct, HR, Subscriptions, and most of the accumulated demo/shard
data from production. That is a materially worse outcome than shipping nothing.

**The real next step, named not guessed:** before touching `erp/ad_seed.db` again, reconstruct (or find, if it
already exists and is merely undocumented) the FULL pipeline recipe — base GardenWorld export → fact_acct fold
→ HR/Subscription seed → client-13 shard reband → whatever else — and either automate it end-to-end or write
down the manual steps precisely enough that Forms/ValRules can be folded in without regressing everything else.
This is a genuinely different, larger task than "add 2 tables to a manifest," and this session's attempt to
just re-run the proven exporter is the concrete falsifier proving that assumption wrong.

**Access-gate fix:** closed separately, same day — see §2.1 CLOSED above.

---

## §8 — 2026-08-23: Forms/ValRules baked additively, root cause found, four named witnesses don't exist

Closes the Forms/ValRules half of §7. Does NOT touch the access-gate finding (a sibling PR against
`erp/idmp_session.js` + `erp/ad_access.js` owns that).

**Root cause, confirmed:** `bim-ootb/erp/ad_seed.db` was never reproducible from one pipeline run.
`git log --oneline --follow -- erp/ad_seed.db` shows one full export (`fd09ad1`, PR #265) followed by
**~20 separate incremental "bake X into ad_seed.db" commits** over a month (HBA IoT sirens, Payslip/
Leave windows, Hospital cost variance, POSTING-CONFIG fact_acct linkage, etc.), each additively
merging new rows into the shipped sqlite file — never re-deriving the whole thing from Postgres. This
IS the "recipe": not a lost pipeline stage, but an established idempotent-bake pattern this repo has
used ~15 times (see `git show 3773ff6` / `tests/bake_all_erps_seed.js` for the house convention).
Regenerating from scratch was never the right move for adding 2 tables — appending was.

**Fix shipped:** `erp/tests/bake_forms_valrules_seed.js` (new, following the `bake_*_seed.js`
convention, sql.js-based to match the repo's own available deps) — queries the live docker PG
directly for `AD_Form` (canonical case, `IsActive='Y'`) and `ad_val_rule` (lower case, all rows) using
the exact column/case/PK-derivation logic ported verbatim from `scripts/export_ad_seed.js` (the same
proven machinery PR #265/#266 shipped with), `CREATE TABLE` for both (neither existed), `INSERT` the
rows.

```
§BAKE_FV_BEFORE tables=399 bytes=27066368
§BAKE_FV table=AD_Form rows=49 cols=19 pk=ad_form_id
§BAKE_FV table=ad_val_rule rows=332 cols=14 pk=ad_val_rule_id
§BAKE_FV_REGRESSION_CHECK other_tables=399 regressed=0
§BAKE_FV_DONE new_tables=2 total_rows=381 bytes=27189248 (25.9MB)
```

**Zero regression on all 399 pre-existing tables** (row-counted before/after, diffed programmatically
— the exact proof that was missing before this fix and that a naive re-export would have failed).
Size grew 27,066,368 → 27,189,248 bytes (+122,880 B, +0.45%) — nowhere near the historical size-gate
concern (v14-fullwidth was 24.9MB at 200ms boot median; this lands at 25.9MB, well inside that budget,
no boot-time regression plausible at this data volume).

**Consumption verified, not assumed:**
- `ad_val_rule` has real, existing consumers today: `erp/crud_core.js` / `erp/crud_overlay.js` (the
  field-validation engine — `effectiveFlags`/`validate`/`docPolicyFor`), `erp/ninja_stage.js`,
  `erp/idempiere_agent/migrate_agent.js`, plus a dedicated headless twin `build/erp/ad_valrule.js`.
  These were running against an always-empty table until this fix — the bake activates real,
  previously-dead behavior, not just adds inert rows. Some rule types are expected to still legitimately
  refuse (already-documented honest ⛔ for ruletype-Q SQL over empty referenced tables, per §2's
  W-POST-TAIL-2 precedent) — that is correct behavior, not a new defect.
- `AD_Form` has one real consumer: `erp/genesis.js`'s `grant('AD_Form', 'AD_Form_Access', ...)` — the
  role-provisioning/access-grant machinery, directly relevant to the sibling access-gate work. **Honest
  gap named, not hidden:** there is no dedicated Form-screen renderer anywhere in this codebase. Real
  iDempiere Forms are bespoke coded screens (Bank Statement matching, GL Journal generator, etc.) —
  this project's declarative Window/Tab/Field renderer does not and cannot render them without
  per-form UI work that doesn't exist yet. AD_Form is now structurally present and feeds access-grant
  provisioning; it is NOT yet a working "open a Form and use it" feature. Do not credit this as closing
  that gap — it closes the *data* gap only.

**Live regression proof:** `poc_ad_displaylogic.js` (W-AD-DISPLAYLOGIC-LIVE, real Playwright browser,
serves the modified `erp.html`/`ad_seed.db`) — `🟢 PASS`, DisplayLogic still correctly evaluates
AD_Menu action-gating with the new tables present, zero page errors.

**A finding that must be corrected, not just noted:** the four other live witnesses named in
`prompts/archive/IDMP_FULLWIDTH_SEED.md` §3 as the re-witness set for the last seed change
(`poc_ad_docfsm_live.js`, `W-AD-ACCESS-LIVE`, `W-AD-MODELVAL-LIVE`, `W-AD-MENU-PRF-LIVE`) **do not
exist under those names anywhere in the current tree** (`grep -rl` across `erp/` for both the file
names and the `W-*-LIVE` code strings found nothing beyond `poc_ad_displaylogic.js`). Most likely:
they were verification scripts local to that PR's branch, never intended as permanent repo files, and
were not preserved after the PR merged. This is itself worth flagging to whoever owns the T-0
truth-maintenance pass (§5.1) — a doc citing witnesses as the re-run protocol for future seed changes
is not re-runnable if the witnesses it names don't exist. This session ran what actually exists and
is relevant instead of fabricating a pass on witnesses that aren't there.

**Deploy:** `ad_seed_v16` → `ad_seed_v17` IndexedDB cache key (2 sites in `erp.html`, 8 in
`idempiere.html`) so returning users' stale-cached seed gets replaced. `erp/sw.js` `CACHE_VERSION`
v767→v768 (bim-ootb). **Note for whoever merges next:** a sibling PR (access-gate fix) also bumps
bim-ootb's `sw.js` to v768 independently — whichever merges second will show the documented
"sw.js is the conflict magnet" conflict; per this project's own rule, take the HIGHER number on
rebase, keep both precache/version-comment additions, never drop one session's hunk for the other's.

**Not done, sequenced correctly as a separate task:** building an actual Form-screen renderer (UI
work, not data work — a new task, not a regression of this one).
