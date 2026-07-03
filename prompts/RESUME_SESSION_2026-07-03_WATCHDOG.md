# ⚠ DO NOT REMOVE — Session resume: architect/watchdog role, 2026-07-03 (supersedes both 2026-07-02 docs)

**Read this first if picking up cold.** This session opened on a system crash across a multi-terminal
workflow. Every lane below was independently re-verified against real git/gh state or a live-run witness —
not trusted from an agent/session's self-report. That discipline held up the whole session (caught nothing
fabricated, but caught real imprecision once — see §KERNEL below — and caught two of my OWN reporting errors,
see §CORRECTIONS).

## §CRASH RECOVERY (opening act, now closed)
System crashed mid multi-terminal-session. Audited every branch/worktree across both repos: **zero work lost.**
4 stale bim-compiler `/tmp/wt-*` worktrees were wiped by the crash but their branches were already `0/0` synced
with origin (pruned the dangling entries). bim-ootb's in-flight worktrees were either clean or their tips were
already squash-merged ancestors of `origin/main`. Cleaned up genuinely stale untracked scratch files
(`_scale.js`, `dagevu_catalog.json`/`geometries.json`, `stats/traffic.jsonl.bak`, duplicate `kitchen_core.js`
copies) — traced each to its lane first, all were either byte-identical duplicates of already-merged content
or stale pre-fix snapshots, none held unlanded work.

**One crashed session was a 18-agent parallel quality/security audit** (`997725ee-...`), interrupted mid the
final "security sweep" agent. Recovered its full transcript from `~/.claude/projects/.../subagents/`, found 4
completed-but-never-synthesized reports (pipeline rigor, repo hygiene, shallow-witness hunt, ERP data-
discipline) plus finished the interrupted security thread myself (verified an `innerHTML + f.name` self-XSS
pattern live in `ninja_pill.js`/`migrate_showme.js`, cleared 3 other flagged sites as false positives). Wrote
it all to `prompts/CODEBASE_QUALITY_AUDIT_2026-07-02.md` — **since closed, see §CLOSED LANES.**

## §CLOSED LANES — verified merged, nothing pending unless noted

All PRs below were independently confirmed via `gh pr view` (state=MERGED, merge commit = actual repo tip) —
not taken from any session's self-report. Several code claims were spot-verified by reading the diff or
re-running the witness live myself.

| Lane | What shipped | PRs | Verification depth |
|---|---|---|---|
| **POS/Kitchen** | Kitchen Display (fold-over-op-log) + POS restyle + staged Generate Replenishment (QtyBatchSize round, PO-vs-Move routing, pending-inbound dedup) | ootb #617/#619, bc #19/#22 | file+function existence confirmed |
| **Codebase audit §5+§2** | `_escHtml` XSS fix (both repos' `ninja_pill.js`+`migrate_showme.js`) + doc-drift corrections | ootb #618, bc #20/#21 | **ran live**: confirmed `_escHtml()` wraps `f.name` before `innerHTML` |
| **Modeller §DECISIONS** | Scale-preview local axes, instanceId pick identity, real BCF 2.1 export | ootb #620 | file list matches claim exactly |
| **Modeller §POLISH3** (new, not yet reviewed) | Outliner eye/filter-dim/windowing/auto-expand + selection outline + real shadows | ootb #625 | **NOT YET VERIFIED — next session should check this** |
| **HBA Stage 1** | Real seed rows into `ad_seed.db` (M_Warehouse 990000, locators, BPartner/User, HR_* via `AdPayroll.runPeriod`, Ninja-staged C_Attendance) | ootb #621 | file+content confirmed (`seed_hba_erp.js` grep) |
| **HBA Stage 2** | Compile layer reads the Stage-1 seeded rows (`ad_attendance.js`, `ad_bom.js` new; `ad_tenancy`/`ad_payroll`/`models`/`occupancy` re-cut) | ootb #622 | **ran live**: `witness_ad_attendance.js` → real `§W-HBA-AD-ATTENDANCE PASS 8/8`, substantive non-trivial assertions |
| **Kernel hardening batch-1** | T3 (period-close archive-first gate) + T6 (multi-tab tip-guard + `navigator.locks`) | ootb #623, bc #24/#25 | **ran live**: both witnesses `ALL PASS` with real log-vs-image / cross-tab checks, read the actual diff |
| **Housekeeping** | `MEMORY.md` fixed to link to `prompts/WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md` instead of duplicating content in a memory topic file | bc #26 | self-authored, merged |

## §KERNEL — DistributedERP hardening, the live thread (READ THIS SECTION FULLY before touching kernel_ops.js)

Full findings: `prompts/KERNEL_TIMEBOMB_AUDIT_2026-07-03.md` (13 findings, tiered) and
`prompts/KERNEL_HARDENING_BATCH1_SPEC.md` (the build spec). T3+T6 shipped (above). **Still open:**

- **T4+T5 (kernel unify)** — NOT independent, verified: `erp/kernel_ops.js` has **zero** persist-guard
  references vs. **one** each in `viewer/`+`modeller/` copies (I grepped this myself — the report said "1 vs
  4," reality is "0 vs 1," same conclusion, stronger). A naive dedup that points everything at the wrong copy
  reopens the 2026-06-12 building-load clobber bug. Spec'd as ONE bounded task, diff-the-three-copies-first.
  **A branch `lane/kernel-unify` already exists (appeared this session, unverified) — check its state before
  assuming it hasn't started.**
- **T2 (content-addressed signing)** — HALF ready (canonicalize on content not rowid — safe, independent).
  HALF blocked on T1 (whether to also sign `actor`).
- **T1 (trust-root decision)** — **the one still on the user's desk.** My advice, given this session: **two of
  the three forks are already decided in `docs/DistributedERP.md` and never wired in** — (a) the doctrine's
  trust unit is the edge/device, not the individual human (§6: "signing happens at the edge"), and §8 names
  "the key-trust root" as one of the few things that deliberately stays central → **central roster, not
  web-of-trust**, matching the existing hub-and-spoke "dumb post office" multi-branch model; (b) key
  compromise semantics are fully specified AND witnessed already — `docs/DistributedERP.md:290`, a signed
  `ROTATE`/`REVOKE` scheme where a revoked key "loses its future, not its past" (**burned, not
  re-attributable**), with a working POC sitting unused on branch `feat/erp-substrate-phase012`
  (`scripts/poc_rotate.js`, §ROTATE-OP/§HISTORY-VALID/§FUTURE-GATED/§REVOKE). **Recommended framing for the
  user: don't re-derive T1 from scratch — pull `poc_rotate.js` forward as the starting point.** The one
  genuinely NEW question I flagged: the audit's "self-asserted actor" finding (maker-checker defeated by two
  typed names) is a *human-within-a-device* attribution problem, one layer above device-level signing —
  recommended keeping it a separate, explicitly-scoped question (PIN/login as audit metadata, not a signing
  key) rather than folding it into T1 and inflating scope.
- **T7 (O(history) scale cliff)** — deferred, ~2-3 weeks of live POS use before it bites (~5k ops). Primitives
  (`sealFrom`, checkpoints) already exist in-tree, just unwired. Not urgent this round.

## §HBA — next up is Stage 3 + a new BOM lane (decided, not started)

Stage 3 (retarget Presence drawer to the `C_Attendance→AD_InfoWindow` lens + the one browser-async smoke node
witnesses can't cover) is queued for Fable5, spec in `RESUME_HBA_ERP_GOVERNED_DISPLAY.md` §STAGE2-DONE.

**New, decided-but-not-started: the BOM lane.** `hr_bim_asset/ad_bom.js` currently reads bim-compiler's
transient Java `m_bom` output directly — wrong direction per the newly-agreed doctrine (see
`prompts/WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md`, linked from `MEMORY.md`): the ERP AD table should be the
authority, BIM/Java output a migration source only. Decided fix: seed `pp_product_bom`/`pp_product_bomline` +
`AD_Ref_List 'B'` from a compiled building's real elements, add an `AD_InfoWindow` BOM lens (mirroring
`C_Attendance`'s pattern), reframe `ad_bom.js` to seed-builder + lens-read. **Q1 (write this up as a formal
`docs/`-level doctrine, peer to `WalkerDoctrine.md`) is still UNDECIDED — don't assume settled either way.**

## §STANDING WATCHDOG CHARGE (carry into every future session, not just this thread)

`prompts/WATCHDOG_BIM_ERP_SOURCE_OF_TRUTH.md` (linked from `MEMORY.md`): in any session touching
`erp/*.js`, `hr_bim_asset/*.js`, or a Viewer/ERP pane, check whether it reads a bim-compiler `.db`/Java output
directly at runtime instead of a seeded `ad_seed.db` AD table. Named-but-unaudited candidates if scope
naturally touches them: `library/component_library.db`, `library/archive/building_BOM.db`. Don't pre-emptively
hunt — flag if touched.

## §STILL BLOCKED (not a coding gap, needs the user)

**POS Thread-3, E-Invoice.** The 7-box regulatory research gate got a real pass this session (105-agent
fan-out, 21/25 claims confirmed via 3-vote adversarial verification): boxes 2 (format/transport) and 7 (PDPA)
are fully sourced from primary official sources; boxes 1/4/5 (MyInvois dates, PCB brackets, EPF/SOCSO rates)
are structurally confirmed but missing exact numeric tables; **boxes 3 (legal clearance mandate — the
load-bearing one) and 6 (MFRS 15) are still genuinely open.** Full citations: `RESUME_HR_BIM_ASSET.md`
§RESEARCH GATE. My advice given this session: box 6 is a normal re-fetch (wrong document was pulled). **Box 3
may not be closeable by another research pass alone** — the doc's own words say it needs either a direct
statute read or "a qualified Malaysian tax lawyer's opinion." Don't let "run research again" become an
infinite loop on box 3 without considering the lawyer branch.

## §OPEN, UNVERIFIED THREADS FOR NEXT SESSION TO CHECK FIRST
- `bim-ootb` branch `lane/kernel-unify` — exists, unreviewed, possibly T4+T5 already starting (was supposed
  to wait on T1 — check whether it actually is, or if it's premature).
- `bim-ootb` branches `lane/modeller-polish-3` (→ shipped as PR #625, listed above, unverified) and
  `lane/modeller-polish-4` (exists, unreviewed) — Modeller polish continued past what this doc tracked live.
- HBA Stage 3 — not started as of this doc.

## §PROCESS NOTES — behaviors worth repeating
- **This bim-compiler working tree is SHARED across concurrent Fable5/Opus sessions on the same disk.**
  Uncommitted edits from other sessions appeared/vanished mid-session multiple times (including two of my own
  gitignored `prompts/` docs briefly swept by another session's cleanup — recovered from `origin/master`,
  no loss). `MEMORY.md` itself is shared too — another session inserted an entry between two of my own edits.
  Don't assume a clean `git status` at turn start stays clean; re-check before trusting file state.
- **Verify claims by running the witness live or reading the diff, not by trusting the pass-count in prose.**
  Every single claim checked this session held up (nothing fabricated across ~10 PRs) — but T4's original
  "1 vs 4" framing was slightly off (real count "0 vs 1") until re-checked directly; running witnesses live
  caught real substance (e.g. HBA's honest-skip assertions) that a summary table wouldn't have shown.
- Housekeeping convention for docs that must survive a shared/gitignored `prompts/` tree: `git worktree add`
  a throwaway branch off fresh `origin/master`, `git add -f` the file (prompts/ is gitignored), commit, push,
  `gh pr merge --auto --squash`. Matches how `CODEBASE_QUALITY_AUDIT`/`KERNEL_TIMEBOMB_AUDIT`/this doc's own
  predecessor were landed.

## §CORRECTIONS (own mistakes this session, for calibration)
- Told the user "items 2-10 of the Modeller polish sweep were none built yet," based on reading a spec doc's
  prose without checking git — PR #616 had already shipped several of them. Corrected when the Modeller
  session pushed back; verified the correction myself before accepting it (it was right).
