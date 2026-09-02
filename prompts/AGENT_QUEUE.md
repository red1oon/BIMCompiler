<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# AGENT QUEUE — dispatchable work, ordered, with conflict rules

```
# ⚠ DO NOT REMOVE
SCOPE: a standing queue of agent-dispatchable tasks for this project, so a session that starts
after a usage reset can launch work WITHOUT the user re-explaining anything. Written 2026-09-02.
RULES: (1) never dispatch an item whose CONFLICTS column names a file another live agent owns —
check §LIVE first; (2) items marked ⛔USER are decisions, not work — do not let an agent "decide"
them; (3) every dispatched agent inherits CLAUDE.md: PRIME RULE, PRIMAL LAW (witness replaces
every human visual check), Log Mandate, Spec-First; (4) NO BAKES — user directive 2026-09-02, the
cli_silent_bake harness is proven and is not a routine measurement tool; (5) work each item to
zero, mark it ✅ DONE (witness) or ⛔ BLOCKED: <one question> here, then take the next.
```

## §LIVE — agents running as of 2026-09-02 (update this block when they report)
| lane | owns these files — DO NOT dispatch conflicting work | status |
|---|---|---|
| ~~TM 4D buildup sequence (Fable 5.1)~~ | released — worktree pruned | ✅ **REPORTED 2026-09-02.** `§TM_REVEAL_TILED` — PR #1605 squash-merged `c8a6df61`, verified on `origin/main`. **W-RWB 22/22, red control green.** Dead air **44-71% → 0.0%** on all four buildings; Hospital pile-up **77.0% → 5.6%**. Surfaced A-9, U-8, U-9. **⚠ PARTIAL on the slab half — see U-8.** Substructure fixed outright (Hospital 553 footings, 200→553 distinct starts, dead air 63%→0%); several slab SETS still land 100% in one decile. |
| ~~Film review continuity~~ | released — files free | ✅ **REPORTED 2026-09-02.** PR #1604 (`§MEP_DISC_PALETTE`, W-MEP-DISC-PALETTE 24/24) + PR #1603 (`§CPE_PIE_HOLD` contradiction settled) both merged. Left 2 ⛔USER questions → U-2, U-6. **Wave C and A-6 are now unblocked.** |
| **ERP parity §P2→§P1 (Fable 5.1)** | `erp/crud_overlay.js` · `erp/crud_core.js` · `erp/crud_ops.json` · `erp/idempiere.html` | 🔵 **RUNNING** 2026-09-02 — AD_Ref_List/Yes-No editors then retire the curated-5 field list. **§P3 (ValRule picker wiring) is BLOCKED on this** — same file (`crud_overlay.js:535,545`). |
| **§CPE_AIM_DEPTH retirement (U-2)** | `viewer/effects.js` (cinema/aim section ONLY — NOT effects/lighting) · `viewer/sw.js` · `viewer/viewer.html` · `witness_cpe_{aim_retire,stick_hold,hose,corr_brush}.js` | ✅ **REPORTED 2026-09-02.** `fix/retire-aim-depth`, witness 7/7 depth-OFF + failing red control. ⚠ Shares `viewer/effects.js` and `viewer/sw.js` with the D-1 lighting lane — the aim change touches neither lighting nor the glow lens; `sw.js CACHE_VERSION` is v1126, take the HIGHER on conflict and KEEP BOTH notes. |
| **ERP doctype re-score §P4** | `docs/internal/ERP_COVERAGE_MATRIX.md` (docs only, read-only on erp/) | 🔵 **RUNNING** 2026-09-02 — audit-and-re-score, forbidden from writing FSM code. No conflict. |
| ~~Perf/mem desk analysis~~ | released — files free | ✅ **REPORTED 2026-09-02.** Appended `§R13_BAKE_FRAME_MINING` (331 lines) to `CPE_4D_PERF_MEM_STUDY.md`. Nothing run, no product code touched. Surfaced U-7 and A-7/A-8 below; **de-prioritised R9**; struck the stale ▶RESUME lines (closes A-4 item 1). |

---

## WAVE A — zero conflict with §LIVE. Dispatch any of these at the next reset.

### A-1 · repo-hygiene · ✅ **DONE 2026-09-02**
**Release train — NOT broken, mid-cycle.** `ci.yml`/`release-please.yml` are `on: push`-only; a
GITHUB_TOKEN-authored push (release-please's own commits to its bookkeeping branch) never triggers
Actions (GitHub's recursion guard) → `#1600`'s branch shows **0 check-runs, 0 statuses**, hence
empty `statusCheckRollup` + `BLOCKED` (branch protection requires `fast-checks`+`e2e-tests`,
`enforce_admins:true`). This is BY DESIGN: `auto-publish-release.yml` (daily cron `0 1 * * *` +
`workflow_dispatch`) is the documented self-heal — it marks the two contexts `success` (bookkeeping
PR, no app code) then squash-merges, then re-runs release-please to cut the tag. **Verified working**:
it merged `#1591`→v1.57.1 at 2026-09-01T05:59 UTC, and v1.51.0 through v1.57.1 all shipped this way.
`#1600` just hasn't had its next daily sweep yet (6 more PRs landed after the last one). Tried the
manual escape hatch (`gh workflow run auto-publish-release.yml`) — **blocked by this environment's
permission classifier** (consequential-action gate); needs the user to run it, or wait for the next
cron tick.
**#1596 (security-bot, dbQuery hardening) — CLOSED, false positive.** `A.dbQuery` (`viewer/helpers.js:116`)
is a synchronous in-browser `sql.js`/WASM call — no server, no network, no adversarial-input channel.
The diff didn't even touch `dbQuery`; it shortened `probe_billboard.js`'s (local Puppeteer witness)
wait-loop timeout 180s→60s, a correctness-regression risk on slower-loading buildings, not a security
fix. Closed with reasoning on the PR.
**115 MB untracked binaries — evidence gathered, removal recommended, NOT executed (destructive,
needs your go-ahead):**
- `buildings/Hospital_meta.db.bak` (22M) / `Terminal_meta.db.bak` (19M): proven to be the PRE-§S21-patch
  snapshots (`sqlite3 … "SELECT COUNT(*) FROM spatial_structure"` → `.bak`=149/49, live=212/150 — the
  live counts match commit `c7221244`'s own "149+7+56=212" exactly). The tracked migration
  (`buildings/patches/{Hospital,Terminal}_meta.db.sql`, already committed) is strictly superior and
  already applied to the live `.db`. Zero unique value — safe to delete.
- `buildings/_backup_ltu_june_2026-08-10/` (74M, gzip'd geo/meta/positions "served" snapshots): OCI's
  live `bim-ootb` bucket already holds a STRICTLY NEWER build of all four LTU_AHouse files
  (2026-08-29, confirmed via `oci os object list`), and the source IFCs still exist
  (`bim-compiler/internal/UNMERGED/LTU_AHouse_*.ifc`) for full re-extraction. Doubly reproducible —
  safe to delete.
- None is the only copy of anything. Recommend: `rm buildings/Hospital_meta.db.bak
  buildings/Terminal_meta.db.bak && rm -rf buildings/_backup_ltu_june_2026-08-10/` — left for the user
  to execute (or say go).

### A-2 · pr-backlog-triage · ✅ **DONE 2026-09-02** — every one of the 21 open PRs dispositioned
**Constraint discovered mid-task: this environment's permission classifier blocks `gh pr merge` and
`gh workflow run` unconditionally (tried on 4 different PRs, including a trivially clean one) — so
nothing here got MERGED by the agent. Merges are prepared/CI-green and left for a human click; one
(#429) was in fact merged by the user mid-session while this ran.** Per-PR:
- **Closed, superseded (verified against real shipped commits, not assumed):** **#345** (re-landed as
  `#395`/`810d12ff`, further refactored into `find_erp_push.js`) · **#253** (superseded by the
  "canonical report_overlay engine" from `#295` onward — `foldPrint`/`foldTrialBalance`/`foldStatement`
  all already ship on main) · **#1543** (`§BAR_LIVE` wires `bar_model.js` — confirmed DEAD CODE,
  hook-blocked, per `4D_MODEL_INTEGRITY.md` §J.3/§L) · **#1176** (stale 128-file witness-relocation
  chore; 101 witnesses already live in `tests/` via other work, 163 still at root — the list itself is
  a month stale, needs a fresh scan not a rebase).
- **Closed, reviewed on the merits (security-bot PR):** **#1596** (see A-1). **#990** (semgrep
  child_process finding — the fix was CORRECT and worth keeping, but is a fork PR and this repo's
  `ci.yml` has no `pull_request` trigger, so fork PRs can NEVER accumulate the required checks and sit
  permanently `BLOCKED` regardless of diff quality — re-pushed the identical diff as a same-repo branch,
  **PR #1606, CI green (fast-checks+e2e-tests PASS)**, ready to merge; #990 closed pointing to it).
- **Rebased in place (merge-not-rebase per the standing rule, pushed to the SAME branch, conflicts
  resolved and verified — `node --check` clean, feature diff confirmed intact vs `origin/main`):**
  **#429** (erp/sw.js only — **merged by the user during this session**, v1.57.1-era) · **#255**
  (viewer/sw.js only) · **#203** (`erp/glassbowl.html` + `erp/sw.js` — kept-both additive HTML merge)
  · **#300** (`erp/sw.js` + `viewer/sw.js`, `pos_lens.js`/`wh_walk.js` auto-merged clean) · **#1157**
  (`common/room_graph.js` — a REAL conflict, not just a version bump: origin/main's E1
  union-find/per-COMPONENT bridge-rejection landed after this branch opened, so the sealed-room flag
  now marks every member of a rejected component, not just one room — flagged on the PR as a judgment
  call, not mechanical) · **#1318** (tiny, `§GANTT_CACHE_ERR_STACK` logging-only). All 6 pushed;
  `erp/sw.js`/`viewer/sw.js` version bumps follow the standing rule (kept both notes, took the higher
  number, own bump for the new change).
- **Verified ready, no rebase needed:** **#966** (applies clean against current main, CI already green
  since 2026-07-21 — one-click merge).
- **Genuinely unshipped, conflicts real (schedule_author.js/effects.js/time_machine.js/scene.js —
  the high-churn files this queue already flags) — documented per-PR on GitHub with the exact
  conflicting files and WHY it isn't blind-resolved (domain risk + this session's no-bake/no-browser
  restriction blocks re-running the witness after resolving), left un-rebased for a dedicated
  session:** **#676** (Open-button IFC-merge + BCF export, 5-file conflict) · **#1015** (MaxQ offline
  runner, 4-file conflict, additive) · **#1191** + **#1196** (a STACKED pair — #1196 is based on
  #1191's branch and already contains all 4 `§EXACT_LOOKUP_BLINDSPOT` phases despite its P1-only
  title; land #1191 first) · **#1317** (`§ARCH_AREA_WEIGHT`, same schedule_author.js/rates.js lane as
  1191/1196 — recommend landing all three together) · **#1327** (`§BAKE_INTERIOR_LIGHTS` — conflicts
  directly with the newer `§STAGED_PL_CUT`/`§NIGHT_BAKE_POOL` night-lighting mechanism; renamed
  `_nightFixtures`→`_nightLights` makes this genuinely ambiguous, not mechanical) · **#1551**
  (`§STOREY_DATUM` — **the "superseded by #1552" premise this file stated is FALSE, corrected on the
  PR with evidence**: #1552 only fixed the one sub-bug #1551's own description flagged as a known
  defect; #1551's actual payload — schedule_author.js banding, `§TPL_LADDER_BRIDGE`, name overrides —
  has zero footprint on main and is still fully needed).
- **#1600** — the release-please PR, handled under A-1 (self-healing, not backlog debt).
- Cross-ref: **Wave E's E-6** names 4 of these same PRs (#429/#300/#253/#203) — resolved above, do not
  re-dispatch as ERP-lane work.
Left 10 fresh scratch worktrees behind (`/tmp/wt-pr*`), all pushed/clean — did not prune (A-3's
`git worktree remove` is blocked by this session's own destructive-ops rule + the permission
classifier; confirmed by trying once). Safe for A-3's pass to reclaim.

### A-3 · worktree-debt · autonomous, careful
`/tmp/wt-bar-is-task` has **1 unpushed commit**; `feat/storey-injection` in `/tmp/wt-storey-inject`
has **no remote at all**; `/tmp/wt-zda-bisect` is detached with **14 dirty files**. Violates the
standing "leave no committed-but-unpushed branch" rule. **Before removing any worktree**, scan
`for p in /proc/[0-9]*; do readlink -f "$p/cwd"; done | grep '^/tmp/wt-'` and skip any that is
occupied — 8 were occupied at last check. Never touch `.claude/worktrees/agent-*` (harness-managed).
DONE WHEN: every branch pushed, prunable worktrees pruned, occupied/dirty ones left alone and listed.

### A-4 · doc-drift · autonomous, small — ✅ **DONE (witness) 2026-09-02** — all three items closed
Three stale sections found 2026-09-02, each contradicted by shipped code:
1. ~~`CPE_4D_PERF_MEM_STUDY.md` §RESUME R10/R11 "NEITHER confirmed"~~ ✅ **DONE** — struck by the
   perf agent in §R13.6, which also re-confirmed both from the frame series (`§PHOTO_PREWARM
   ms=7,965` n=6; `taa=8 ao=12` on all 2,028 folds).
2. ~~`PHOTOREAL_STILL_RENDER.md` §PHOTO_REALISM_RETUNE says "SPEC ONLY, not built" — #1575 shipped part
   of it (`PHOTO_ENVMAP_BOOST 3.0→2.0`).~~ ✅ **DONE** — heading replaced with a per-item table
   verified against `origin/main` @ `c8a6df61` IN THE CODE. **Item 2 shipped (#1575,
   `PHOTO_ENVMAP_BOOST = 2.0` at `effects.js:2643`) AND SO DID ITEM 3** — `CAM_LIGHT_COLOR =
   0xffdca8` at `effects.js:332`, shipped by **#1579 `§TRIPLANAR_NORMAL`**, whose own commit message
   names "§PHOTO_REALISM_RETUNE item 3". Only **item 1** (staged-brightness re-measure vs the
   post-§TRINORM_LINEAR baseline) is still open — `A._nightPLScaleStill = 0.5` unchanged at
   `tools.js:1100`, no re-measurement recorded. Scope note added so item 2 is not overstated: #1575
   changed the CONSTANT + added a witness; there was no separate room-probe code fix.
3. ~~`4D_MODEL_INTEGRITY.md` §I row for "where inside its task?" says `layerOf`'s 4th arg is on an
   unmerged branch — that branch is merged.~~ ✅ **DONE** — the "unmerged" wording had already been
   corrected 2026-08-27; the row now states MERGED in its own words, re-confirmed against
   `origin/main` @ `c8a6df61`, and says the stale wording must not be reintroduced. **Made consistent
   with the PLAYED-layer row #1605 added beneath it**: both rows describe the SAME verb
   (`remapSolveToTasks`) called from TWO sites with different arguments (`layerOf` vs `null`, authored
   solve vs CPM display), and each now names the other — measured, they disagree on the start instant
   of **99.6%** of Hospital's 63,182 elements. The cross-file instructions in
   `4D_GANTT_TM_REFACTOR.md` §FUTURE item 2 and `4D_SCHEDULE_ARCHITECTURE_REDESIGN.md` §L1 are marked
   discharged. ⚠ §L1's SECOND half — re-checking §I's other line numbers against `6b12783` — was NOT
   done and is left open there.

### A-5 · clinic-tm-slab · autonomous
**§Z.3** — Clinic TM ground-floor slab appears late, then persists on scrub-back. The baked schedule
CONTRADICTS the symptom: the 4 `Slab on Grade` elements are in `TASK_Substructure_TOF_Footing`, the
FIRST task, data clean (0 orphans/nulls/unmapped). Two named unverified hypotheses with the
measurement that falsifies each — read `LTU_TERMINAL_CLINIC_RENDER_CORRUPTION.md` §Z.
⚠ RELATED to the Fable lane's question but a DIFFERENT building and a different symptom (late-then-
persists, not one-shot). Dispatch only after Fable reports, then cross-check the two findings.

### A-6 · film-overlays · autonomous
`INFORMATIVE_FILM_OVERLAYS.md`, written 2026-09-01, zero code. Its own build order:
**§FILM_UNSUPPORTED first** (detection already exists, no camera coupling, no flicker risk, best
value/effort) → §CLASH_QUALIFY → §FILM_CLASH_IN_FRAME.
⛔ **§FILM_CRITICAL_PATH is scope-blocked**: `cpm_schedule.js` computes **no float and no critical
flag**; those exist only in `foreign_schedule.js` for imported P6/MSP. Build scope (a) imported-only,
which needs zero new maths. **Do NOT bolt a float calculation into the film layer.**
CONFLICTS: film agent has REPORTED — files are free.
⚠ **UPDATED 2026-09-02 by the film agent: §FILM_UNSUPPORTED was deliberately NOT started.** Its
witness contract requires asserting marks across a WHOLE film, which the no-bake directive rules
out. It named a cheaper re-scope: **assert against `§SUPPORT_UNCHECKED_SUMMARY` on a short
`--frames` run** instead of a full bake. Dispatch it with that re-scope, or with the whole-film
contract only if the user lifts the bake restriction — see U-6.

---


## §SESSION 2026-09-02 — WAVE A OUTCOMES (all four agents reported)
| item | outcome |
|---|---|
| A-9 | ✅ **PR #1607 MERGED.** Cache carries BOTH layers; every judge prints `layer=`. `layerOf` THROWS on unknown, reports MISSING on a pre-change cache. Witness **W-CLA 5/5**, C3 judged 119,568 element-task pairs. |
| A-0 | ✅ **PR #1610 MERGED** (replaced #1609 — see squash note below). Void numbers struck; NO-GO, day-buckets, overlap lever, §W_D0 C1 left standing. |
| A-4 | ✅ Done. PHOTOREAL heading was **doubly** wrong — items 2 AND 3 shipped (#1575, #1579); only item 1 (`_nightPLScaleStill` 0.5) is open. §I rows now consistent. |
| A-7 | ✅ **PR #1608 MERGED** (`bf600d4a`). 7 GUARD · 2 GUARD+FIX · 0 REMOVE. Log volume 2,028→10, 3,502→48, lossless (replayed through shipped `_vacLog`). Handed on A-7b. |
| A-1 | ✅ Release train was **never broken** — `GITHUB_TOKEN` pushes don't trigger Actions (recursion guard), so release-please's branch has 0 checks and reads BLOCKED. `auto-publish-release.yml` is the designed sweep. **Triggered 2026-09-02 01:51 → #1600 merged, v1.58.0 published.** |
| A-2 | ✅ All 21 PRs dispositioned. #1596 closed as a **false positive** (`A.dbQuery` is synchronous in-browser sql.js, no adversarial surface; the diff only shortened a witness timeout 180s→60s). #990 was a fork PR this repo's push-only CI can never check — re-pushed as #1606, merged. |

**⚠ CORRECTION to this file's own earlier premise: #1551 is NOT superseded by #1552.** Verified
against the diffs — #1552 fixed only a sub-bug that #1551 itself flagged; **#1551's real payload is
unshipped and still needed.** Do not close it.

**⚠ SQUASH-COLLISION, worked example for the next session.** #1609 was stacked on #1607's branch.
After #1607 squash-merged, #1609 still carried the pre-squash commit `4f9eb028` and would have gone
DIRTY. Fix was NOT a force-push: a new branch off fresh `origin/main`, the payload cherry-picked
unchanged (`750b825b`→`a7e878cc`), new PR #1610, old PR closed with a pointer. This is CLAUDE.md's
own rule, executed.

**⚠ TOOLCHAIN TRAP, cost ~15 min.** A fresh worktree has no `node_modules`, so `npx eslint`
resolves a different `globals` and reports **3 phantom `VideoEncoder`/`VideoFrame` errors** in
`cinema_maxq.js` that exist neither on main nor in CI. Always lint via the repo's own install
(`ln -sfn /home/red1/bim-ootb/node_modules node_modules`), and read eslint's OWN exit code — a
`| tail` pipe returns tail's, which reads as green.

### ⛔ AWAITING USER GO — 115 MB removal (A-1 evidence complete, nothing deleted)
All three proven non-unique; the destructive-ops rule held them for approval:
- `Hospital_meta.db.bak` / `Terminal_meta.db.bak` — pre-§S21-patch snapshots (`spatial_structure`
  149/49 rows vs live 212/150, matching the patch commit's own math). Migration already applied live.
- `_backup_ltu_june_2026-08-10/` (74M) — OCI serves a strictly newer 2026-08-29 build of all four
  files, and the source IFCs remain in `bim-compiler/internal/UNMERGED/` for full re-extraction.

## WAVE B — dispatch after the TM/Fable agent reports and releases the schedule files.

### B-1 · day0-attribution · ✅ **DONE (witness) 2026-09-02** — bim-ootb PR **#1615** `fix/day0-attribution`
**All eight played-layer FAILs attributed. NOT a regression — nothing to bisect, as A-9 said.**
Spec first: `4D_MODEL_INTEGRITY.md` **§J.6** (table, the three witness defects, the §I correction,
and the two measured-but-deliberately-unshipped items). Cache rebuilt on `origin/main` @ `99e260e8`,
4 buildings / **119,568 elements**, no bake, no browser.
**Roll-up: 3 witness defects · 3 modelling facts · 1 real defect (fix on unmerged #1551) · 1 scope
limit. Hospital contributes ZERO FAILs on the played layer.**
- **C1 HHS** excess=1 = the `Roof Level` band (n=45); HHS's `spatial_structure` is **3 rows, 3/3
  `object_type='COMPILED'`** (`compile_rooms.py`, `STC_*` guids) — **witness defect W3**.
- **C1 Terminal** excess=16 = **22 storey strings across three parallel naming systems** (Malay /
  English / `Ceiling Level *`) against **6/6 COMPILED** rows — **modelling fact**.
- **C2 Duplex** bad=3 = exactly PR **#1551**'s three unmerged name overrides (`IfcWall* /foundation/`
  Duplex 7 · `IfcMember ^Stair` 4/4 · `IfcSlab /finish floor/` 14) — **real defect, fix unmerged**.
- **C2 Terminal** bad=9 = `IfcBeam "M_Concrete-Foundation Beam"` with `phase='Substructure'` in the
  FIRST task; day-0 phase purity is **245/245**. §GROUNDWORK_SLAB promotes phase and leaves `seq`
  (236 elements fleet-wide) — **witness defect W1**.
- **C3 Duplex** bad=1 = the same stair stringer; its **only 3 bearing candidates are waste/cold-water
  `IfcFlowSegment`** at bz −0.47/−0.63 (§S26.2's own example) — **witness defect W2** + #1551.
- **C3 HHS** bad=3 = HHS **models zero seq-1 elements**, so `T.seq !== 1` can never fire; the 65×53 m
  ground slab has **3 bearing contacts of 6,193** (2 seq-6 `IfcStairFlight` @+264 h, 1 pipe @+816 h)
  and `grounded=0` because **one single pipe** at bz −4.700 sits in its footprint — **modelling fact**
  + §F's cross-task later-phase support, outside §TPL_LAYER_ORDER's within-task scope (§H.3).
- **C4 Duplex** bad=83 = under-slab plumbing, **all 83 on `T/FDN`**, 39 below grade, day 2.00 of a
  **13.00-day** programme; the fixed 3-day window is **23.1 %** of Duplex vs **0.9 %** of Hospital —
  **witness scope**, no schedule defect found.
- **C4 Terminal** bad=4 = the 4 `IfcFlowTerminal` **are the whole `00 Aras Asas` band**, 3 of them at
  bz ≈ 0.2 m against model **p01 = 14.43 m**; `Substructure` is `scope: building` so it instantiates
  on that phantom lowest level — **modelling fact**.

**NOTHING WAS WEAKENED: `§W_D0_VERDICT` is `claims=16 PASS=5 FAIL=8 INCONCLUSIVE=3 RED` before and
after, on BOTH layers.** All three witness fixes are additive; every FAIL is now self-attributing in
its own log line. New **`witness_day0_attribution.js` (§W_D0A) claims=6 PASS=6 GREEN, red control
`W_D0A_RED=1` goes RED bad=2**, so the attribution is machine-checked, not prose.
⛔ **Correction landed in §I**: `deriveStoreyMergeMap` was recorded as "✅ RUNS as of 2026-08-27
(Terminal 23 names → 15 bands)". Measured against the shipped bytes it **runs on nothing in the
fleet** — `§S18_STOREY_MERGE_FAIL no such column: elevation` on Terminal AND HHS, `no such table` on
Duplex and Hospital. `compile_rooms.py` writes `center_z` and no `elevation`.
▶ **Two measured items handed on, deliberately not shipped (§J.6.4):** (1) §GROUNDWORK_SLAB prices
**21 promoted `IfcBeam` as STEEL_ERECTOR** (Terminal 20 + Hospital 1) — changes dates, so it is a
**U-8-class ruling**, see U-10 below; (2) widening `stair_member_architecture` to `IfcSlab` closes
C3 HHS (`IfcSlab ^Stair` = HHS **4/83**, 0 elsewhere) but appends to the same array **#1551** appends
to and moves `IfcSlab` out of `supportPool` — **land #1551 first**, then take it as one A/B.

<details><summary>ORIGINAL ITEM — kept for the trail only, both premises retired</summary>

### B-1 · day0-bisect · ⛔ **PREMISE RETIRED 2026-09-02 (A-9) — REWRITE BEFORE DISPATCHING**
**`witness_day0_integrity.js` (§W_D0) reproduces `claims=13 PASS=4 FAIL=5 INCONCLUSIVE=4` on
unmodified `origin/main`.** But the TM lane established that **§W_D0 judges `displaySchedule`, a map
the movie and scrubber never play** — `time_machine.js` has ZERO readers of it. On the layer that
IS played, day 0 is pure (`§TM_REVEAL_DAY0 Hospital onScreenDay0=93 impure=0`).
**So the first question is no longer "what regressed" — it is "is this witness judging a dead
layer".** Settle A-9 first, or do it as part of this item. Bisecting the old table without that
would chase a defect in a map nobody plays.

⛔ **REFRAMED AGAIN 2026-09-02 by A-9 — THE PREMISE OF THIS ITEM IS GONE. Do NOT dispatch it as
"bisect 13 → something".** With all four buildings cached on the current code, `§W_D0` scores
**`claims=16 PASS=5 FAIL=8 INCONCLUSIVE=3`** on the PLAYED layer (and the same 5/8/3 pattern, with
different populations, on `display`). The old `claims=13` was read off a cache covering only THREE
buildings — the fourth contributed a single INCONCLUSIVE instead of four claims. **That is cache
coverage, not a regression signature; there is nothing to bisect there.** What IS still open and
unowned: C2/C3/C4's FAILs are genuine on the layer that plays — Duplex C2 `bad=3` (IfcWallStandardCase/
IfcSlab/IfcMember on day 0), Duplex C4 `bad=83` MEP inside 3 days, HHS C3 `bad=3` hanging IfcSlab,
Terminal C2 `bad=9` IfcBeam + C4 `bad=4` IfcFlowTerminal — and nobody has attributed any of them to
a commit. Rewrite this item around THOSE five specific failures before dispatching it.

</details>

### B-2 · future7-stage4-5 · autonomous, plan-first
`4D_GANTT_TM_REFACTOR.md` §FUTURE item 7. **Stage 4:** `verifyGanttIntegrity()` ANDs two
known-disagreeing "does S support T" implementations, one lacking the false-positive fix — edit
legality is decided by the wrong copy. Investigate and RECOMMEND, do not silently pick one.
**Stage 5:** floating judged by 4 disagreeing implementations; 3 rival storey-suffix rules; the
untagged 3rd task-grid producer (`materializeDefault`). The section's own MANDATORY STEP 0 requires
posting a written plan before code — honour it: write the plan into the file, then proceed.

### B-3 · 4d-policy-to-json · ✅ **DONE (witness) 2026-09-02** — bim-ootb PRs **#1616, #1617, #1618**, all CI green
Three related items, `4D_GANTT_TM_REFACTOR.md` §FUTURE-5A (inventory written 2026-08-27) — implemented
against it, nothing re-derived.
- **PR #1616 — 7 of 11 constants moved to JSON** (A1 `28800` basis, B2 project-start, B3 `120` floor,
  B4 author-side crew-cap fallback, B5 `95`→now points at the existing `LABOR_RATES.LABORER`, B6
  `LEVEL_SCAN_MAX`), mirrored into `rates.js` (the object `window.LABOR_RATES` ACTUALLY resolves to on
  every real viewer load — sequence_rules.json alone would have been invisible, the exact Part-2
  anti-pattern one level down). **4 of 11 (A5/A6/A7/B1) deliberately left as documented literals**:
  A5 is the audit's own "NOT safe to move blind"; A7 and B1 were each tried as a shared constant/helper
  and **reverted same-day** after concretely breaking `bar_needs.js` / `witness_gantt_native_generate.js`
  — this repo has a large family of witnesses that slice one function out of a file as raw text and
  eval it standalone, so a shared symbol declared elsewhere in the file is undefined in that sandbox;
  B7 verified dead (no caller passes `opts.template` to the two legacy-path functions that read it).
  **Invariance proof** (`scripts/cache_4d_run.js`, node-only, no bake/browser): Hospital/HHS/Duplex
  totalDays 318/50/13 → 318/50/13, byte-identical guid→task membership hash on all three. **Canary
  proof** the wiring is genuinely live (not coincidental): doubling `_productivity_basis_secs`
  28800→57600 moved Duplex totalDays 13→22. Full witness suite run clean (only pre-existing reds:
  `witness_bar_needs.js` schema drift, `witness_day0_integrity.js` `claims=16 PASS=5 FAIL=8
  INCONCLUSIVE=3` — matches this file's own already-recorded re-baseline exactly — and the other
  already-`known` entries); **two real regressions this refactor itself introduced were found and
  fixed before landing** (materializeZones' own second `_defMaxCrews` scope; the A7 helper revert).
- **PR #1617 — `viewer/rates/4D_policy.json` DELETED**, not marked (a loud warning already failed
  once on `sequence_rules.json` for the same mistake class — deletion is what actually stops drift).
  Its only 2 readers (`witness_bar_schedule.js`/`witness_bar_composite.js`, both `bar_model.js`
  fixtures — dead code, untouched per rule) fixed in the same PR: the JSON's values now live as each
  witness's own local fixture object. 13/13 and 12/12 pass, isolated worktree.
- **PR #1618 — §FUTURE item 6 toast.** Re-derived from the live clamp logic first: `commitGanttDrag`
  (mouse drag) and `openGanttProps` Apply (typed edit) ALREADY surface `blockedBy`/`clampedTo` via the
  shared `tm-gantt-tip`/`_tmSay` mechanism, since 2026-08-04/08-24 respectively — both predate the
  2026-08-27 report, so that gap is stale, not open. The one real, verified gap: `linkGanttBars`'s
  re-apply-after-link call to `moveTaskCascade` never checked `res.clamped` at all. Fixed with a
  `_tmSay` call carrying `res.blockedBy` (extracted, not invented). All 8 witnesses referencing
  `linkGanttBars` pass.
- All three: `eslint viewer modeller` exits 0. Not stacked (all three independent branches off
  `origin/main`) — safe to merge in any order.

---

## WAVE C — dispatch after the film agent reports.

### C-1 · cpe-preview-restore · autonomous
**§CPE_PREVIEW_ARG**: the hidden `#cpe-preview` button hands its click MouseEvent into `_previewFly`'s
`povOnly` arg. The one-line fix was deliberately NOT shipped because it exposes a second, real bug —
**the full preview path never restores the main camera to the editing pose.** Fix the restore FIRST,
prove it with `witness_cpe_stick_after_preview.js`, only then wrap the listener.
Then **§CPE_BUILDUP_ACTIVATE_POPS_PANEL**: Alt+C's bake calls `tmActivateForBake()` → `activate()`,
which bundles the schedule data load with `_panel.style.display='flex'`, so a pure camera action pops
the TM editing UI open. Named fix already written (split a data-only entry point), with its acceptance
witness — build it as specced.
Then **§CPE_PANEL_PERF**'s three measured stalls, if the perf agent's report has not superseded them.

### A-7 · vacuous-tag-audit · ✅ **DONE (witness) 2026-09-02** — PR **#1608** `fix/vacuous-tag-audit`
Nine tags: **7 GUARD · 2 GUARD+FIX · 0 REMOVE**. **W-VACUOUS-TAG-GUARDS 10/10, redControl green**,
plus two source-level red arms. Written up as **`CPE_4D_PERF_MEM_STUDY.md` §R14_VACUOUS_TAG_AUDIT**
(spec) + **§R14.4** (measured). No bake, no browser, no behaviour change — only what is printed.
- **`§SHADOW_FRONTIER_AT_CAPTURE` was an EMPTY POPULATION, not a broken matcher.** `§SHADOW_FRONTIER_IDX
  meshGuids=0 groupGuids=63182`; all three `streaming.js` single-mesh sites are BatchedMesh FALLBACKS and
  `§BATCHED_FAIL`=0 with `multi_draw=on`; the batch half judged on **286/286** firings. → GUARD. But the
  **FIX** half is real: the `forEach`'s third outcome (guid in NEITHER index) was never counted — added
  `unmatched=`, which will attribute the **63,182 streamed vs 63,417 placed** gap on the next bake, free.
- **`§GROUP_SPARK_TICK` was a second FIX** — `_gspRoll % 10` is a DEAD throttle in the bake path
  (`_gspRoll++` only in `playTick()`; `roll=0` on 2,027/2,027). ⚠ **`§PERF_TRAVERSE` carries the SAME dead
  expression** (2,027 firings) — named, deliberately NOT changed, someone should take it deliberately.
- **`§IDLE_GATE` was already compliant** — its 165+165 lines are a 1-in-25 sample of **4,050+** real
  cycles; §R13.9 read them as the event count. Wording only.
- Lossless, replaying the real series through the SHIPPED `_vacLog`: 2,028→10 · 2,026→10 · 1,751→24 ·
  1,751→24 · 1,740→29 · 2,027→467, every one reconstructing its original count exactly.
- ⚠ Two self-inflicted defects the witness caught, not review: C2 was **scope-blind** (passed while
  reading its own comment block — now strips comments), and the first `§GROUND_WETNESS_OVERRIDE` guard
  would have **dropped** 2,027 repeats to emit 1 line. Both recorded in §R14.4.
- `sw.js` v1122 → **v1123**.

### A-7b · §PERF_TRAVERSE dead throttle · autonomous, one line
Handed on by A-7 (2026-09-02), deliberately not fixed there. **`§PERF_TRAVERSE` carries the same
dead `_gspRoll % 10` throttle that `§GROUP_SPARK_TICK` had — it fired 2,027 times where ~203 were
intended.** A-7 left it because unlike the others it is a REAL per-frame measurement that
`CPE_4D_PERF_MEM_STUDY.md` §R13.12 quotes; changing its cadence changes a number another section
depends on. Fix the throttle deliberately, and re-state §R13.12's figure against the corrected
cadence in the same PR — do not fix one without the other.

### A-8 · heap-instrument-fix · autonomous, rides free
**`§CLI_BAKE_HEAP`'s 229-477 MB range is an aliased sawtooth, not a memory profile.** The same
instrument read **2,388.8 MB then 224.0 MB fourteen seconds later**, and the page witness read
5,223.0 and 2,328.5 MB at the same pipeline point across two runs of identical code. Fix:
**dual-instrument heap sampling in `cli_silent_bake.js`** — a harness edit that then rides free on
whatever bake happens next. **Needs no dedicated run**, so it does not violate the no-bake directive.
⚠ Until this lands, do NOT quote the 229-477 MB figure anywhere. §R12_HOSPITAL_MEM's 1,546-1,577 MB
is UNAFFECTED and still stands.

### A-0 · VOID-NUMBER SWEEP · ✅ **DONE (witness) 2026-09-02** — bim-ootb PR #1609 + doc strikes
**Numbers now VOID because they measured the unplayed `displaySchedule`** — they must be struck
where they appear, not left standing: `§TPL_REVEAL_SPREAD`'s aggregate deciles `[12.8,9.7,…]` and
`§TPL_REVEAL_SPREAD_WORST`'s MEP-Final skew; `§TPL_MOVIE_BINDS_BARS`'s "every element now plays
inside the bar that claims it" (never true on the played layer); and
**`§BUILDUP_DAY_BATCH_FEASIBILITY`'s WITHIN-TASK numbers** — `§DAYBATCH_FRAMES worst=94 = 4.6x
mean`, the flat per-day rates (CV 0.21-0.31), the "10.5-min drip", and the short-element-run
clustering that was named as the real lever. `§W_D0` C2/C3/C4 likewise.
**Still STANDING, do not strike:** that no real day-buckets exist (a property of the continuous
schedule, true of both maps), the **NO-GO on day-batching**, the task-overlap density lever
(windows unchanged), `§W_D0`'s C1 band-model claim, and everything about task windows and dates.

✅ **DONE 2026-09-02. Struck, each with its played-layer replacement inline, not just a warning:**
`4D_GANTT_TM_REFACTOR.md` §FUTURE item 2 (the `[12.8,9.7,…]` bullet + the 42.7%/38.8% MEP-Final
bullet, both `~~struck~~`, replaced by §CACHE_PLAYED_LAYER §K's four-building table) ·
`GANTT_ACCURACY.md` §BUILDUP_DAY_BATCH_FEASIBILITY (gap p50, the per-day CVs, the worst-frame
paragraph, the pulse prediction — all struck with re-measured played-layer values) ·
`4D_MODEL_INTEGRITY.md` §J.1 (C2/C3/C4 struck, C1 kept, re-baselined table added) and its "State,
honestly" `claims=13` line · the SHIPPED log string itself (`schedule_author.js`
§TPL_MOVIE_BINDS_BARS no longer says "plays") and `witness_4d_movie_binds_bars.js`'s title.
**RE-MEASURED, not merely struck** (`scripts/probe_daybatch_played.js`, new, in-repo): Hospital
worst frame `94 @f1250 = 4.6x` → **`142 @f1504 = 7.0x`**; gap p50 10.5 min → **11.52 min**; CVs
0.21-0.31 → **0.28-0.40**; burst width 45 s vs 632 s → **77 s vs 691 s**; pulse prediction
19.7x/299 days → **26.1x/235 days**.
⚠ **ONE ITEM WAS NOT STRUCK, ON EVIDENCE:** the short-element-run clustering lever. Re-measured on
the played layer it is REAL and worse than before (115/142 of the worst frame from ONE task, burst
width p50 77 s against that task's 691 s). Its MAGNITUDES were void; the LEVER stands. Striking it
would have removed a still-valid conclusion.
⚠ **A SECOND cause of voidness, found while doing this:** the cache also ran WITHOUT
`opts.displayRemap`, so those numbers came from a configuration the browser never runs at all — not
merely the wrong layer of the right run. See A-9.

### A-9 · point-the-judges-at-the-played-layer · ✅ **DONE (witness) 2026-09-02** — bim-ootb PR #1607
**`cache_4d_run.js` still persists the unplayed `displaySchedule`.** So `§W_D0`,
`§TPL_REVEAL_SPREAD`, and every probe reading the cache still judge a map the movie does not play.
This is the root of a whole class of wasted measurement — it produced "roughly uniform" reveal
numbers while the played layer was `[18.4,17.8,17.8,18.4,17.5,8.8,1.1,0,0,0.2]` on the same task in
the same run. Named in `4D_GANTT_TM_REFACTOR.md` §TM_REVEAL_SHIPPED, deliberately not changed there.
Extend the cache to persist the PLAYED layer (`injectGantt` → `_tmTilePlayWithinTasks`) alongside
`displaySchedule`, then re-point the judges. DONE WHEN: a cached run carries both layers and each
witness names which one it judges.
CONFLICTS: none now. **Do this before B-1.**

✅ **DONE — bim-ootb PR #1607 `fix/cache-played-layer`.** Spec written first:
`4D_GANTT_TM_REFACTOR.md` §FUTURE item 2 **§CACHE_PLAYED_LAYER** (§G-§K). New
`scripts/lib/tm_played_layer.js` is the ONE owner of "the played layer in node" — the slicing +
injectGantt mirror LIFTED from `probe_tm_reveal_shipped.js` (#1605), with that probe refactored onto
it so no second copy exists. `cache_4d_run.js` persists `play` beside `sched`; `layerOf()` is the
single accessor (throws on an unknown id, reports MISSING rather than substituting). All 5 cache
readers re-pointed and self-describing. **Witness W-CLA
(`viewer/tests/witness_cache_layer_attribution.js`): `claims=5 PASS=5 FAIL=0 INCONCLUSIVE=0 GREEN`,
C3 judged 119,568 element-task pairs, C4 discovers readers by grep so a new un-repointed one FAILS.**
⚠ **A SECOND divergence found and fixed:** the cache called `materializeZones` WITHOUT
`opts.displayRemap`, so the cached run never ran the CPM display pass at all — no
`§ZONE_DISPLAY_AUTHORING`, no `§CELL_GATE`, no `§CPM_DISPLAY` in its 29 log lines. It was a third
configuration nobody runs. Now wired, and `§CELL_GATE` matches the live probe exactly on all four
buildings (97.34/85.21/99.42/99.56%).
**B-1 IS ANSWERED, NOT JUST UNBLOCKED:** re-baselined, `§W_D0` is `claims=16 PASS=5 FAIL=8
INCONCLUSIVE=3` on the played layer. The `claims=13` that B-1 was going to bisect came from a cache
covering only three buildings — it is not a regression signature. **Do not dispatch B-1 to bisect
13→16.** The real open question is unchanged: C2/C3/C4's FAILs are genuine on the played layer and
nobody has attributed them to a commit.

---


### A-10 · §CLINIC_LANDING_REPOINT · needs U-4b decided first
Mechanical fix named by the Clinic diagnosis (`LTU_TERMINAL_CLINIC_RENDER_CORRUPTION.md` §AD.3):
repoint `bim-compiler/SYSNOVA/index.html`'s `Clinic` entry from `Clinic_extracted.db` to
`Clinic.db`, and resync `deploy/dev/*.js` so that landing page stops serving a May-2026 viewer.
**This is a DEPLOY action** — guarded flow (`deploy/OCI_UPLOAD.md` §RULES, every `oci os object put`
needs `--content-type`; DBs are gzip + `content-encoding`). Do not run it unprompted.
⚠ Alternative on record: §AB already proposed retiring this landing page instead. U-4b picks.

## WAVE D — from the user's 2026-09-02 film review (measured, not speculative)

### D-1 · §SUN_FILL_RATIO — the wall away from the sun · autonomous, cheap · USER ASKED FOR THIS
**User: "Wall away from Sun shadow?"** Measured position: shadows ARE on and correct in Alt+S —
`§PHOTO_SHADOW enabled casters=382 texelPerM=11.4`, and `§EXTERIOR_FLAT_SHADOW` measured
`outsideFrustum=0` on two buildings, so nothing is clipped. **The gap is not shadows.** N8AO is
contact/crease-only by design: `STILL_AO_RADIUS = 32` is in SCREEN PIXELS (`screenSpaceRadius`
mode), so a broad flat wall far from any corner legitimately reads AO≈1.0. That verdict is on
record and is correct — do not re-open it as a shadow bug.
**The build:** an orientation-based read — raise the sun-vs-fill ratio so N·L falloff separates a
sun-facing wall from a shaded one — or a distance-based ambient pass. Both were NAMED as possible
future work in §EXTERIOR_FLAT_SHADOW and never built.
**⚠ Couples to an OPEN item — do not tune blind.** `PHOTOREAL_STILL_RENDER.md`
§PHOTO_REALISM_RETUNE item 1 is still open: `§TRINORM_LINEAR` brightened every triplanar surface
and was **never re-measured against `§STAGED_PL_CUT`'s 0.5x night-fixture cut** (`_nightPLScaleStill`
still 0.5). The user's standing complaint is "too bright, shiny reflection, it be shadow effects for
realism". Raising contrast by adding light would fight that. Measure the current ratio first.
**Witness:** numeric per-pixel luminance separation between a sun-facing and an away-facing wall on
the same building, before and after — not a screenshot, not "looks better".

### D-2 · §MEP_COLOR_SURVIVES_PHOTOREAL · autonomous
**User: standard MEP colours (yellow/blue/green/red per device) during Alt+S and the movie.**
Half-shipped. `§MEP_DISC_PALETTE` (PR #1604) works — HHS bake shows `§MEP_DISC_COVERAGE
uniformDisc=283 mixedDisc=0 (100% now keyed)`. **But the photoreal path paints over it:** the same
log carries `§TRIPLANAR_INIT class=IfcFlowSegment tex=metal_color_1k.jpg`, same for
`IfcFlowFitting` and `IfcFlowTerminal` — a metal texture keyed on `ifc_class` wins over the
discipline colour. The user's fire-red valve survives only because it is a REAL IFC material.
**The job:** let the discipline colour survive the triplanar material path (tint the albedo rather
than replace it, most likely), so MEP reads by system in a photoreal frame.
**⚠ The palette is AUTHORED, not a published standard** — that boundary was set when #1604 shipped;
keep saying so. Witness counts distinct hues, does not look at a frame.

### D-3 · §DUCT_SILHOUETTE — jagged large ducts · autonomous, spec first
**User: roundness works on lamps, large duct piping still jagged.** Diagnosed:
`§MEP_SMOOTH_NORMALS geoms=160 vertsSmoothed=2,074,656 vertsKeptHard=691,414 creaseDeg=55` smooths
**normals** at a 55-degree crease — it changes SHADING, not geometry. A faceted lamp shades smooth
and its silhouette is too small to read; a large duct's silhouette is still a visible polygon.
**Detection is already solved** by the existing crease test — the remedy is what differs: re-tessellation
of large-radius curved elements, or a silhouette treatment. Spec both, cost both, recommend one.
Do not "fix" it by widening `creaseDeg` — that addresses shading, which is not the defect.

### D-4 · §SLAB_AREA_PRICING — the remaining one-shot floors · BLOCKED ON U-8
Measured on the user's own HHS bake (buildup covers 37.3 s of film for a 50-day axis, 11.2
frames/day): Superstructure L1 27 slabs / 123 frames · L2 37 / 91 · **L3 12 / 22 frames (1.5 s)** ·
**Roof 7 / 10 frames (0.64 s)**. L1 and L2 genuinely spread; L3 and Roof still read as one shot, and
the user confirms it. §TM_REVEAL_TILED spread elements WITHIN the block; it did not lengthen the
block. Cause: `_installSecs` prices every `IfcSlab` at a flat **823 s** regardless of area, and §S50
orders a level trade-by-trade so the slabs sit contiguous. **Candidate: area-weighted slab pricing —
the machinery already exists** (`§LABOR_QUANTITY_WEIGHT` does exactly this for fragmented classes,
using `analysis_sidecar.js`'s dominant-face formula). This changes dates, so it is U-8's ruling.

### A-11 · ✅ DONE (witness) 2026-09-02 — PR #1551 LANDED, squash `59736505` on `origin/main`
Merged after a 64-commit sync (`fast-checks` + `e2e-tests` both green; `mergeStateStatus` DIRTY →
CLEAN). Four conflicts, all resolved keeping both sides; the two that vanished from the final diff
were **already subsumed by main** — `buildings/patches/Duplex_extracted.db.sql` (#1557 carries
#1551's four storey rows verbatim and corrected its `CREATE TABLE IF NOT EXISTS` to DROP+CREATE)
and `witness_day0_integrity.js` (#1615's C2 `okPhase` line IS #1551's, and #1615 names #1551's raw
contact walk as its own defect **W2** against §I). Final diff = 5 files, purely #1551's payload.

**IT DOES WHAT IT CLAIMS — proven element-by-element, not by verdict letter.** `§PR1551_APPLIED`:
`foundation_wall_substructure` Duplex **7/7** + Hospital **28/28** → Substructure/seq1;
`stair_member_architecture` Duplex **4/4** → Architecture Envelope/seq6; `finish_floor_finishes`
Duplex **14/14** → Finishes/seq11; **0 hits elsewhere** — exactly the scoping this item recorded.
Fleet collateral check: Duplex **25** elements changed (phase,seq) = 7+4+14 and *nothing else*;
Hospital **28**; HHS **0**; Terminal **0**. Zero unintended reclassification.

**`§W_D0` layer=played: `PASS=5 FAIL=8` → `PASS=8 FAIL=5` (claims=16, INCONCLUSIVE=3).**
Duplex C2 `bad=3 → 2` and the three named intruders are GONE (`IfcWallStandardCase`/`IfcMember`/
`IfcSlab`seq4 → `IfcBeam`/`IfcFlowFitting`); it does **not** reach 0 because the reshaped programme
pulls two *different* elements into day 0. Terminal C1 FAIL→**PASS** (22 bands→6, excess 16→0,
datumCollisions 5→0) and Terminal C4 FAIL→**PASS** (firstMEP +2.0d→+15.0d); HHS C1 FAIL→**PASS**.
Duplex C4 worsened 83→173 *within an unchanged FAIL* — fully attributed and **not** a scheduling
defect: `foundation_wall_substructure` correctly empties `Architecture Envelope @ T/FDN`, so MEP
Rough-in moves day 2→1 and its 171 elements fall inside C4's **fixed** 3-day window, which is 25%
of Duplex's 12-day programme (exactly what `§W_D0A` A6 already says).

**⚠ ONE GENUINE NEW RED, not pre-existing — `viewer/tests/witness_bar_schedule.js`
`band-monotonic-holds` (Terminal `bandInversions` 0 → 91 against a `<= 20` gate).** NOT in CI (that
is why CI is green); it is a local-discipline witness. The gate's own comment says the 20 is *"locked
to the measured fleet baseline"* — i.e. calibrated against Terminal's **22-band phantom model that
#1551 replaces**, and the same witness's other Terminal measures improve by an order of magnitude in
the same run: midair **521→30**, byRawLabel inversions **6462→91**, forcePlaced **5772→759**, bars
79→34. So the 91 is very likely the first *honest* reading rather than new disorder — but that is a
hypothesis, not a measurement. **Do not just raise the threshold** (author-then-gate); re-derive what
the baseline should be under a declared-datum band model, and attribute the 91.

**⚠ `§W_D0A` went `PASS=6 GREEN` → `PASS=3 FAIL=3 RED`, BY DESIGN — this is not a regression.**
That file's own header: *"the day a cause stops being true — **a rates.js override lands** … the
attribution in §J.6 goes red instead of quietly becoming fiction"*, and A2 exists to say *"the defect
#1551 targets is still live" **while #1551 is unmerged***. Its fleet-reach lock still passes
unchanged. **A4 is a real witness defect though:** Terminal's early-MEP set is now **empty** because
#1551 fixed it, and A4 tests `names.length !== 1`, so it prints **FAIL over an empty population** —
the vacuous case CLAUDE.md PRIMAL LAW clause 4 requires to print INCONCLUSIVE. Deliberately NOT
fixed here (changing a witness's gate to make one's own merge look greener is the antipattern).
**Follow-up: re-baseline §W_D0A onto the post-#1551 world, and fix A4's vacuous branch.**

**NOW UNBLOCKED:** widening `stair_member_architecture` to `IfcSlab` (C3 HHS, `IfcSlab ^Stair`
HHS 4/83) — it appends to the same array, which is now on `main`.
Also landed alongside: `scripts/knob_sweep.js` ported to `CACHE.layerOf()` (it was the one cache
reader that could not name its layer — caught by `§W_CLA C4_READERS_NAME_IT` going GREEN→RED on the
merge commit; restored to `claims=5 PASS=5 GREEN`, C4 judged 7→8).
Pre-existing reds confirmed unchanged on unmodified `origin/main`: `witness_4d_band_monotonic`,
`witness_4d_template_instantiation`, `witness_4d_template_reached`, `witness_tm_element_window_bind`.
⚠ #1551 also carried an **undeclared revert of `§TPL_LAYER_ORDER` (#1549)**, absent from its PR body;
it was rejected in the merge (main has since built on it in #1567 §I.5c) — `TPL_LAYER_ORDER` is back
to main's original 7 occurrences on `origin/main`.

<details><summary>original item (kept for provenance)</summary>

**Twice confirmed today that #1551 is NOT superseded** (this file's original premise was wrong):
(a) the PR triage verified #1552 only fixed a sub-bug #1551 itself flagged; (b) B-1 measured that
**C2 Duplex's 3 DAY-0 failures ARE exactly #1551's three overrides** — `IfcWallStandardCase`
"Basic Wall:Foundation…", `IfcMember` "Stair:Residential…", `IfcSlab` "Floor:Finish Floor - Ceramic
Tile" (13 mm). Scoping re-measured: `IfcWall* /foundation/` Duplex 7 / Hospital 28 / 0 elsewhere;
`IfcMember ^Stair` 4/4 Duplex, **0 of 9,019 elsewhere**; `IfcSlab /finish floor/` Duplex 14, 0 elsewhere.
**It also BLOCKS a named fix:** widening `stair_member_architecture` to `IfcSlab` closes C3 HHS
(`IfcSlab ^Stair` = HHS 4/83, 0 elsewhere) but appends to the same array #1551 appends to and moves
`IfcSlab` out of `supportPool`. **Land #1551 first, then that.**
</details>

### A-12 · §I ownership-table row is FALSE, correct it · autonomous, small
B-1 measured against the shipped bytes: `deriveStoreyMergeMap` is recorded in
`4D_MODEL_INTEGRITY.md` §I as "✅ RUNS as of 2026-08-27 (Terminal 23 names → 15 bands)". **It runs on
nothing in the fleet** — `§S18_STOREY_MERGE_FAIL no such column: elevation` on Terminal AND HHS,
`no such table` on Duplex and Hospital. §I is the table every 4D session is ordered to read first,
so a false row there is expensive. Correct it, and decide whether the merge map should be repaired
or retired (it is the storey-banding owner — this is not cosmetic).

## ✅ SETTLED 2026-09-02 — DB HOSTING. Do not re-litigate.
**User ruling: "Github need not be repo for the DBs. Remain with OCI."**
This confirms the architecture already in place and measured today: **GH Pages serves the APP, OCI
serves the DATA.** `red1oon.github.io/bim-ootb/` carries `objectstorage…/b/bim-ootb/o/` as its data
base, and a direct probe of `red1oon.github.io/bim-ootb/buildings/Clinic.db` returns **404** —
GitHub never hosts a DB.
Three measured reasons it must stay this way, so no future session re-opens it:
1. **GitHub hard-rejects any single file >100 MB without LFS.** Every major DB exceeds it —
   `Hospital_extracted` 252 MB, `HospitalAjaibPath` 250 MB, `Terminal_geo` 249 MB, `Hospital_geo`
   229 MB, `JKR_extracted` 194 MB, `LTU_AHouse_geo` 161 MB.
2. **Using LFS to get around that reopens what #1593 closed** (HEAD 1.79 GB of LFS content → 0).
3. **GH Pages sites cap ~1 GB**; `buildings/` is 2.2 GB.
Economics run counter to intuition: **end users never cost LFS bandwidth** — they hit the static
site and never clone. The whole quota drain was dev/agent worktree churn. Moving data to GitHub
would convert a free path into a metered one.
⚠ This does NOT resolve **U-3** (reclaiming the stranded historical 8.53 GB) — that is separate and
still open.

## ⚠ RE-CLASSIFIED 2026-09-02 — these were parked as "user decisions" and should NOT have been
**User: "Why are those waiting on me? I given direction, u can help manage."** Correct. Direction
was already given on each of these; parking them was invented gating, which CLAUDE.md's Anti-Drift
rule names as drift in itself. They move to ACTIONABLE with a measure-first mandate and a hard stop
condition — the same pattern §FUTURE item 7 Step 1 used successfully twice.

| was | now | mandate |
|---|---|---|
| U-2 retire `§CPE_AIM_DEPTH` | **✅ DONE (witness) 2026-09-02** | Shipped on `fix/retire-aim-depth` (bim-ootb), witness `witness_cpe_aim_retire.js` **7/7** on the depth-OFF arm, depth-ON run as a FAILING red control. Gaze vs the look-ahead chord **150.075° → 0.000°** (HHS_Office) and **163.114° → 0.000°** (Duplex) over 451 judged samples each. Pins 0.000° aim error / 1.9e-6° bleed; correction window 33.3% reach vs authored 34%, outside it 0.0448°; dive + closing orbit **0.00 m / 1.7e-6°** arm-to-arm. `§CPE_STICK_HOLD`'s aim half REMOVED, not orphaned — a held beat is a pure rate dip and `§CPE_AIM_PIN` is the authored replacement (G-SH-5 re-scoped to assert the frozen gaze). Details: `RESUME_2026-09-02_FILM_REVIEW.md` §AIM_RETIRED_DONE. |
| U-6 bake for `§FILM_UNSUPPORTED` | **ACTIONABLE** | Take the cheap re-scope (short `--frames` run asserting `§SUPPORT_UNCHECKED_SUMMARY`). A whole-film assertion mostly proves the harness. |
| U-8 slab pricing | **ACTIONABLE, measure-first** | User said twice the slabs are one-shot. Area-weight `IfcSlab` via the EXISTING `§LABOR_QUANTITY_WEIGHT` machinery. **MEASURE the date impact first**; if proportionate, ship; if it moves totals like the calibration lever did (318→940), STOP and report. |
| U-10 groundwork beam trade | **ACTIONABLE, measure-first** | Same rule. 21 `IfcBeam` priced STEEL_ERECTOR against the code's own CONCRETE_GANG comment. Measure the date delta; ship if small, stop and report if not. |
| U-4b OCI landing | **SPLIT** | The **DB repoint** (`SYSNOVA/index.html` Clinic → `Clinic.db`) is correcting a demonstrable error — do it. The **viewer resync** is a production deploy with real blast radius — do it carefully through `deploy/OCI_UPLOAD.md` §RULES with fetch-back verification. Only "retire the page entirely" is a genuine choice. |

**STILL genuinely the user's** (money, or a fleet-wide product change, or invention):
**U-1** calibration lever (318→940 days) · **U-3** LFS pay-vs-rewrite (8.53 GB, real money or a
force-push of every ref) · **U-9** sub-element slab splitting (invention under the PRIME RULE).

## ⛔ USER DECISIONS — never dispatch these as agent work
| # | the decision | the number that forces it |
|---|---|---|
| U-1 | **Bar-width calibration.** Fixing "squashed bars" means recalibrating `_installSecs` 28800→86400 — measured to be the SAME lever as the 24h→8h revert already rejected (`tasksDiffering=0/42`). | Hospital totalDays **318 → 940**, HHS **50 → 137** |
| U-2 | **✅ ANSWERED AND SHIPPED 2026-09-02 — do not re-open.** Retired in full; see the WAVE-U row above and `RESUME_2026-09-02_FILM_REVIEW.md` §AIM_RETIRED_DONE. The two named costs were handled, not merely accepted: the dead-end rescue is gone (and the rule's own formula shows that tail was the small part — `clearM = 8.0 m`, half its authority spent at 4 m), and `§CPE_STICK_HOLD`'s aim half is removed with `§CPE_AIM_PIN` named as the authored replacement rather than left as a dead path. | witness `witness_cpe_aim_retire.js` **7/7 depth-OFF**, red control fails A-1; chord **150.075° → 0.000°** |
| U-3 | **LFS: pay or rewrite.** Growth stopped (#1593, HEAD 1.79 GB→0); the historical 8.53 GB is stranded. Recommendation on record: **(a) $5/mo data pack**, because (b) is a force-push of all refs across a repo with many live worktrees. | **8.53 GB** |
| U-4b | **⚠ SHARPENED 2026-09-02 — it is not a "sandbox", it is documented as PRODUCTION, and it is 3.5 months stale.** `deploy/OCI_UPLOAD.md` calls `…/b/bim-ootb-live/o/index.html` **"PRODUCTION — users see this"**. It is a SEPARATE landing page (sourced from `bim-compiler/SYSNOVA/index.html`, last touched 2026-07-28) serving a THIRD independent code tree (`sandbox/*.js` from `deploy/dev`/`deploy/live`). Measured live: it maps Clinic to **`Clinic_extracted.db`** (md5 `b57a2866…`, 130,224,128 bytes, **16,912 elements**, missing `calendars`/`kernel_ops`/`scene_state`) while GH Pages maps it to the correct `Clinic.db` (md5 `636c8ef1…`, 226,349,056 bytes, 16,071 elements — byte-identical to the user's own file). Its `tools.js`/`streaming.js` are **May 18/19 2026**; `effects.js` 404s. **This is why Clinic "does not load like local" — the DB and the whole 4D/CPE stack are stale on that surface, not broken.** Decide: repoint + resync, or retire the page. | **16,912 vs 16,071 elements; viewer 3.5 months stale** |
| U-4 | ~~Is the OCI sandbox viewer still a supported front?~~ superseded by U-4b — It is a far older build — `effects.js` absent, `scene.js` **7 KB vs 191 KB** — with no patch self-heal, so it cannot receive fixes. **Measured 2026-09-02:** deployed `sw.js` is **v387 (live) / v505 (dev)** against **v1120** local, and `HospitalAjaibPath.db` is **404 on OCI**. `Hospital_meta.db` differs by exactly **735 `IfcOpeningElement`** rows with all **63,415 shared rows byte-identical** — so the divergence is the DEPLOYED BUILD, not the data. | sw **v387/v505 vs v1120** |
| U-8 | **The slab half of the complaint is only PARTLY relieved — decide whether to go further.** Per (task, IfcSlab) group, share in the densest decile, before → after: Hospital Superstructure L3 (22) **100% → 100%** (but 8 → 22 distinct instants, width 0.07 → 0.09 d) · HHS L1 (27) 100% → 96% · HHS L2 (37) 78% → **81%** · HHS L3 (12) 92% → 92% · HHS Roof (7) 86% → **14%** · Terminal 02 FIRST FLOOR (72) 100% → 68% · Terminal 04 THIRD FLOOR (53) **100% → 100%** · Terminal foundation (449) 52.6% → 20.9% · Duplex mild throughout. Cause of the residual: `_installSecs` prices every `IfcSlab` at a flat **823 s** (0.8% of Hospital L3's labour) and §S50 lays a level out trade-by-trade, so the slab block sits contiguous at the bar's tail. **Both are rulings, not bugs.** Note before spending on it: 0.09 d of 318 days in a 135 s film is **sub-frame either way** — the residual is invisible in the FILM, and would only show on the TM scrubber. | slab sets still **100%** in one decile |
| U-9 | **Hospital Levels 2-6 floor plates are ONE `IfcSlab` each** (7.6-9.2k m², 100% of the level's slab area). Progressive reveal of a single element requires sub-element geometry splitting — a new mechanism, and invention under the PRIME RULE. Not built, not proposed. Do you want it explored? | **1 element = a whole floor** |
| U-10 | **§GROUNDWORK_SLAB prices 21 promoted `IfcBeam` as STEEL_ERECTOR** (Terminal 20 + Hospital 1) — its own comment's claim "CONCRETE_GANG already" is false for beams. Correcting the trade changes durations and therefore dates, so it is a U-1/U-8-class ruling, not a bug fix. Measured by B-1, not shipped. | **21 beams on the wrong trade** |
| U-7 | **Trim `§R10`'s AO margin?** `ao=12` was shipped on an assumed 18.75 ms/render; measured it is **27.26 ms** (and TAA is 49.06 ms, not the assumed 75.0). The margin costs **109.0 ms/frame = 221 s (3m41s) per Hospital bake**. Trimming it is a quality-vs-time trade only the user can price. | **3m41s/bake** |
| U-6 | **Lift the no-bake restriction for witnesses that structurally need a whole film?** `§FILM_UNSUPPORTED` is the first item to hit this. A cheaper re-scope exists (short `--frames` run against `§SUPPORT_UNCHECKED_SUMMARY`) — the question is whether that is accepted as sufficient, or whether whole-film witnesses get a sanctioned bake budget. | — |
| U-10 | **§GROUNDWORK_SLAB prices 21 promoted `IfcBeam` as steel erection — fix it, or leave it?** Its own comment says *"seq/resource unchanged (CONCRETE_GANG already)"*; that is true for `IfcSlab` (seq 4, CONCRETE_GANG) and **false for `IfcBeam`** (seq 3, STEEL_ERECTOR). Measured 2026-09-02 (B-1, §J.6.4): Terminal 20 + Hospital 1 = **21** elements the pipeline itself calls Substructure groundwork are priced and crewed as steel. Correcting it changes `_installSecs` and crew allocation, therefore **dates** — the same class of lever as U-1/U-8, not an agent's call. | **21** elements · Terminal's promotion set is 233 (213 `IfcSlab` + 20 `IfcBeam`) |
| U-5 | **B's own `THREE.WebGLRenderer`.** Last structural cause of POV framing being off, and it BLOCKS §CPE_WALK_AUTHORING (spec fully settled with the user, not built). Real architecture work — needs an explicit go. | — |

---

## §HOW A FRESH SESSION USES THIS FILE
1. Read §LIVE. If a lane is still running, its files are off-limits.
2. Take the topmost undispatched item whose CONFLICTS are clear.
3. Dispatch it with CLAUDE.md's laws in the prompt, plus: no bakes, cache-first
   (`~/.cache/bim4d`, 119,568 elements in 0.43 s), numeric `§` evidence only, worktree not the
   shared checkout, stop-and-report if scope exceeds the item.
4. Mark the item ✅ DONE (witness) or ⛔ BLOCKED: <the one question> here. Then take the next.

---

# WAVE E — ERP LANE (swept 2026-09-02, independent of the Viewer/4D waves above)

```
SCOPE: the ERP third of the trilogy (bim-ootb `erp/` 91 js files / 48 MB · bim-compiler
`scripts/poc_*.js` 244 witnesses · `build/erp/`). Swept fresh this session against CODE, not against
the lane docs' own claims — every ⚑VERIFIED line below was re-checked in the tree today.
ZERO CONFLICT with §LIVE and with waves A/B/C: no ERP file is touched by any 4D/viewer lane.
STANDING INTENT (user, 2026-08-24, `feedback_erp_close_all_gaps.md`): close ANY named ERP gap —
these are queued work, not a menu to ask permission on. Rank by leverage/cost, do not hold back.
```

## §E.STATE — where the lane actually is
- **Code-dark since 2026-07-18** apart from 6 commits: last ERP commits are `#1509` (TM P6 fold),
  `#1499` (record gate), `#1496` (seed bake), `#1495` (ad_access), `#1487` (crud_core split).
- **T-0 truth-maintenance: 5 of 6 items ✅ DONE** (items 1/2/4/6/8) — `RESUME_ERP_T0_TRUTH_MAINTENANCE.md`.
  Only item 3 (§RULE-EDIT grail) and the 454-proc corpus were left open there.
- Coverage headline stands at **6✅ / 33🟡 / 3⛔ of 42** surfaces (`docs/internal/ERP_COVERAGE_MATRIX.md`).
- Equivalence ledger: **46/46 tally witnesses re-run PASS** (`docs/internal/ERP_EQUIVALENCE_LEDGER.md`).

## §E.GAPS — dispatch table

| # | gap | evidence (checked today unless noted) | shape |
|---|---|---|---|
| **E-1** | **454 of 476 AD_Process, ~200 beforeSave overrides, 139 callout atoms named-deferred.** The dominant remaining functional-parity distance; nothing scheduled closes it. | `ERP_COVERAGE_MATRIX.md:188-194`; dispatch spines exist (`ad_process.js:dispatch` 22/476, `ad_callout.js:dispatch` 6 atoms/18 cols) — the corpus does not | campaign · **plan first** → Fable 5.1 |
| **E-2** | **§RULE-EDIT grail: two lanes contradict each other and neither has been reconciled.** `project_rule_edit_gesture.md` says the loop is CLOSED + LIVE (`rule_fold.js`, PR #171, erp sw v593, `§GATED-COMPLETE-POC` PASS). T-0 item 3 says the grail witness "still doesn't exist." Both may be right: rule_fold gates ONE hardcoded T-threshold rule, the grail claim is *edit any AD validation row → K records re-fold*. | ⚑VERIFIED: **zero** `RULE-EDIT`/`RULE_EDIT` witness scripts in `scripts/` | reconcile + build the general witness → Fable 5.1 |
| **E-3** | **AD_Form data shipped, no Form renderer exists.** 49 AD_Form rows baked (#1496); real iDempiere Forms are bespoke screens (Bank Statement match, Payment Allocation, GL Journal). | T-0 item 5/queue 6 | bounded IF scoped to ONE form end-to-end → Fable 5.1 |
| **E-4** | **O2C Stage 4 stock effect is structurally absent** — a real signed shipment still cannot move stock. | ⚑VERIFIED: `grep -rln m_storageonhand erp/*.js` → **0 hits across all 91 files** | plan-first, then build |
| **E-5** | **P2P Fix 5 (M_MatchInv) — blocker named, fix specced, not built.** `C_InvoiceLine.M_InOutLine_ID`/`C_OrderLine_ID` are hard `IsReadOnly='Y'` (AD_Tab 291), matching real iDempiere. Fix = generalize PR #956's `seedVals` to a PEER FK, triggered from the existing `AD_Process 200143`. | `ERP_P2P_INVOICE_MATCH.md` §Fix 2026-07-23 | **bounded, spec-complete — highest ready-to-build value** |
| **E-6** | **5 stale open ERP PRs, all from June, none triaged.** bim-ootb **#429** (2026-06-19), **#300** (06-13), **#253** (06-13), **#203** (06-08 — disposable-host persistence; memory already had to correct a false "shipped" claim about it); bim-compiler **#8** (06-03, op-group atomicity). | ⚑VERIFIED via `gh pr list` today | autonomous triage |
| **E-7** | **The whole equivalence evidence base is gitignored.** 378 logs live in `build/erp/*.log`; `.gitignore:85` excludes them. The ledger's 46 PASSes are re-verifiable only from local disk — one `git clean -x` from prose-only. | ⚑VERIFIED: 378 files, `.gitignore:84-85` | autonomous — decide a retention mechanism |
| **E-8** | **CI runs 1 of the 46 ledger witnesses.** `ci.yml:8` — "one ERP witness". Most need docker-PG / an iDempiere checkout / bim-ootb Playwright. | ⚑VERIFIED: no `poc_`/`run_bundle` reference in any bim-compiler workflow | autonomous, needs a runner design |
| **E-9** | ⛔**USER** — **AD_Field·DisplayLogic hiding is architecturally dead for every CRUD-enabled table.** The inline editor's curated 8-field set (`_inlineOptsFor`) contains zero DisplayLogic-bearing columns, so `withLogic=0` every time. Re-scored honestly ✅→🟡 rather than fixed. Widening the field set is a product-UX call with blast radius across every CRUD table. | `idempiere.html:2882` fork; T-0 item 8 | **decision, not agent work** |
| **E-10** | **The read-write-vs-read-only half of the access gate has never gated anything on live data.** Implemented + headless-proven, but the seed carries no read-only grants at all. | ⚑VERIFIED: `isreadwrite='N'` = **0 rows** of 4,448 window + 1,170 process + 120 form grants in `erp/ad_seed.db` | autonomous — bake a read-only grant additively, then witness the RW distinction |
| **E-11** | ⛔**USER** — **GrisLab field-service vertical: 600-line spec, zero code.** Real prospect (SEI Asia/Wilson, meeting 2026-08-14, proposal 08-17), §8.4 already names what to pick off. Also §10.2's own pre-pilot security gaps: relay `/push` is unauthenticated (`ACAO:*`, no token → floodable) and plain `http.createServer`. | ⚑VERIFIED: **no `grislab` hit anywhere** in `erp/`, `scripts/`, `build/erp/` | **priority/commercial call.** The relay-auth sub-item is a bounded agent task if the vertical is greenlit |
| **E-12** | **Ninja mode: 3 gaps left unpicked since 2026-06-14.** (1) reverse-export `extractModel(db,AD_Window_ID)→model` = literal PackOut, witness roundtrip==orig; (2) auto-wire `AD_Column.Callout` from the sheet grammar (today wired by hand); (3) the structural-only caveat. | `NINJA_MODE_LANE.md` §NEXT | autonomous, bounded |
| **E-13** | **`shard_loader` is the one real remaining substrate wire — and it is a DESIGN task, not a wire.** `idempiere.html` already has a live `installShard()`/`?shard=` that fetches whole-TENANT shards; shard_loader's warm/cold ATTACH/DETACH model is different and its artifacts are not served. | `project_substrate_hardening.md` | design session → Fable 5.1 |
| **E-14** | **The trilogy stale-audit's ERP findings were never actioned.** Named orphans: `erp_panel.js`/`role_band.js`/`menu_seed.js` (precache-only, no html loads them), `migrate_showme.js` (superseded byte-for-byte by `overlay_kit.js`), the `chat_lens.*`/`feed_fold.js` trio (parked), `ad_table_map.js` (dormant-by-design), `erp_key_epochs.js` (precached + witnessed, no page loads it), a duplicated `migrate_agent.js`, plus tracked binaries `idempiere_agent.zip` (9.7 KB, duplicates `erp/idempiere_agent/`), `spike_writepath_browser.log`, and `preview_demo.db` (a DB-policy violation). | `TRILOGY_STALE_CODE_AUDIT.md:174-195`; ⚑VERIFIED the branch `origin/fable/trilogy-stale-audit` exists and was **never merged** | autonomous, careful — verify each before removal |
| **E-15** | **Ledger headline says 52 surfaces, mechanical count is 53.** Source pinned: a `41` baseline (`HARDEN_MATRIX.md:93`) that itself counts to 42. Not inflation — a precisely located off-by-one. | T-0 item 1 | trivial doc fix, ride it on any other ERP PR |

## §E.ORDER — recommended dispatch sequence
1. **E-5** (P2P Fix 5) — the only gap that is spec-complete AND product-visible. Ship first.
2. **E-6 + E-15 + E-14** — one hygiene agent: triage the 5 stale PRs, fix the 52/53 headline, action the
   stale-code list (verify-then-remove, never blind).
3. **E-10 + E-7 + E-8** — one truth-infrastructure agent: make the RW gate demonstrable, stop the evidence
   base being one `git clean` from gone, propose the CI runner.
4. **E-4** then **E-12** — feature work with a written plan first.
5. **Fable 5.1**, one each: **E-2** (grail reconcile — highest conceptual value, it is the project's stated
   differentiator), **E-1** (454-proc triage-by-usage PLAN, not code), **E-3** (one Form end-to-end),
   **E-13** (shard_loader design).
6. ⛔ Hold **E-9** and **E-11** for the user.

## §E.DISPATCH RULES (on top of §HOW A FRESH SESSION USES THIS FILE)
- The engine + witnesses live in **bim-compiler `scripts/`+`build/erp/`**; bim-ootb only hosts the deployed
  app. When a witness "doesn't exist," check bim-compiler before concluding it was never committed (T-0
  item 6 was a retracted claim caused by exactly this).
- **Never full-regenerate `erp/ad_seed.db`** — always bake additively (`bake_forms_valrules_seed.js`'s
  pattern). A full re-export against the docker PG silently wipes production rows (verified: ad_client 6→1,
  C_BPartner 113→18).
- Oracle-diffing needs `docker start postgres` first (it stops between sessions); creds in
  `RESUME_ERP_T0_TRUTH_MAINTENANCE.md`'s header.
- `erp/sw.js` CACHE_VERSION bump is mandatory in the same PR as any shipped erp/ change.


## §E.UPDATE 2026-09-02b — the user set the ERP priority
User directive: *"Our ERP must give exactly the user experience in iDempiere, improved where we added
in the pills such as the graphs page and red pill back to Viewer... Priority is that an iDempiere user
can say ERP OOTB works as well or better than thought."* Operational integrity in **DocType + AD UI
behaviour** is the named focus.
- **E-9 is GREENLIT** — it was tabled ⛔USER as a product-UX call; the user has now made that call.
  It is the headline of the new lane `prompts/ERP_IDEMPIERE_UX_PARITY.md` §P1.
- New lane written + dispatched: **§P2→§P1 to Fable 5.1**, **§P4 (doctype re-score) to an agent**.
- **§P3 (wire AD_Val_Rule into the live FK picker, 61 fields) is QUEUED, not dispatched** — it edits
  `crud_overlay.js`, which the Fable lane owns. Dispatch it the moment Fable reports.
- Re-ranked by the directive: **E-5** (P2P Fix 5) and **E-4** (stock effect) are the next two
  operational-integrity items after the parity lane; E-6/E-7/E-8/E-14/E-15 stay hygiene.
