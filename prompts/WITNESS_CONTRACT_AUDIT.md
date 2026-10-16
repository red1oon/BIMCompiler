# ⚠ DO NOT REMOVE — Witness Contract Audit (is a witness truthful, or just comforting a code snip?)
# SCOPE: a READ-ONLY skeptic's pass over `witness_*.js` files — NOT the ERP fold/equivalence claims
#   (that's `ADVERSARIAL_EQUIVALENCE_AUDIT.md`, a different population, don't merge the two). Also NOT
#   `WITNESS_INTERFACE_FRAMEWORK.md` — that's the forward-looking design for how NEW witnesses get
#   authored (a reusable schema+invariant+builder library); this file is backward-looking, auditing what
#   already exists. This audit's
#   population is the generic 4D/Gantt/TM/viewer/modeller witness suite: bim-ootb, `viewer/tests/` (44-52
#   currently run by `tests/run_witness_suite.js`), repo ROOT (~151 `witness_*.js`, never run by anything
#   — §S66, `SCRIPT_LENGTH_REFACTOR_SEAMS.md`), `modeller/tests/` (~130, never run by anything). ~346 total.
# WHY NOW (user, 2026-08-24): "review the WITNESS logging again that it is truthful in verifying
#   falsifiable output rather than comforting a code snip." Triggered by a real, concrete find the same
#   session: `witness_4d_band_monotonic.js`'s own T2c is `chk('...', true, ...)` — a HARDCODED true,
#   always green regardless of what the code does, because the real check lives in a different file this
#   witness never calls. If one of the FEW witnesses under active scrutiny had this, the ~340 nobody is
#   currently reading are unknown territory. Read `MEMORY.md`'s `project_time_machine.md` §GHOST FAMILY
#   entry and this session's own PR #1504 for the concrete case this audit exists to generalize from.
# NON-NEGOTIABLE:
#   - READ-ONLY. Do not edit product code. Do not "fix" a witness you find broken — FLAG it here with
#     file:line + the exact defect, so triage (a separate, deliberate pass) decides what to do. Exception:
#     mechanical, zero-judgment fixes with no behavior change (e.g. relocating an orphaned file the way
#     PR #1504 did) may be proposed but must be called out explicitly, not silently bundled into a "audit".
#   - EXTRACT / NON-INVENT. Every verdict quotes the actual line(s) read. No verdict from a filename or a
#     docstring alone — read the assertion logic itself.
#   - §S66's own warning applies here doubled: "do NOT just widen the scan and run 346 files... list-only
#     first... expect a large KNOWN_RED/UNKNOWN harvest that must be triaged by hand, not bulk-labelled."
#     This audit is exactly that triage — go population by population, smallest/highest-value first, not
#     all 346 in one sweep.
#   - Findings append to §RESULTS below, dated, one entry per batch. Do not create a second file for this.

---

## 0. POSTURE
A witness that cannot fail is not a witness — restated from `witness_4d_band_monotonic.js`'s own header
("A test that cannot fail is not a test"). "It exits 0" is not a verdict; this audit asks whether the
assertions inside are checking something that could plausibly have been FALSE, against an independent
ground truth, on a non-empty population. Passing is the DEFAULT you must argue past skepticism, not the
finding you start from.

## 1. THE CONTRACT — what a witness owes the runner, checked per-file
Adapted from `ADVERSARIAL_EQUIVALENCE_AUDIT.md` §1's six refutations, retargeted from ERP-fold claims to
generic code witnesses:

| Check | The failure it hunts | How to test it |
|---|---|---|
| **§W-VACUOUS** | a literal `true`/`false` (or an always-true expression) passed as the assert condition — the T2c defect, verbatim | grep the file for `assert(`/`chk(`/local-helper-name`(` calls; for each, read whether the condition variable could ever actually be false given the code paths above it |
| **§W-REDCONTROL** | no case in the file demonstrates what a FAILING run looks like — every witness must show, or have shown at authoring time and recorded, at least one genuine red (a BEFORE/AFTER pair like `witness_4d_band_monotonic`'s OLD/NEW, or an explicit "RED first" case like §S71's G-COH-9) | does the file compare against an INDEPENDENT prior state (frozen module, git history, a deliberately-broken input), or only ever compute one thing and assert it against itself? |
| **§W-EMPTY-POP** | the checked population is silently empty (a bad DB path, an empty filter, a `.length` of 0) so the `forEach`/loop body — where the real assertions live — never runs, and the script still exits 0 | is there an explicit `if (!population.length) { assert(false, ...) }` guard (the correct pattern, `witness_bake_plays_schedule.js:90`) or does an empty population pass unnoticed? |
| **§W-ORPHAN** | the witness is never run by anything — `git log -1` shows it untouched since authoring, and it sits outside `viewer/tests/` (the ONLY directory `run_witness_suite.js` scans) | `git log -1 --format=%ci -- <file>` vs today; is it in `viewer/tests/`? If not: is ANY other script/CI/doc referenced running it, or is it purely decorative? |
| **§W-STALE-SLICE** | the witness slices source TEXT (`indexOf('function NAME(')`, a fixed-width `.slice()`) instead of brace-matching or requiring the real module — a proven bug class in this exact codebase (G-COH-6, `witness_gantt_lock_integrity` both matched a COMMENT, not the code, §S71/§S73) | does it use `require()`/AST-level access to the real function, or a hand text-slice? If a slice: has anyone re-measured the offset since it was written? |
| **§W-PROVENANCE** | the "before" or "independent" comparator isn't actually independent — it's the same code re-run, a copied value, or a frozen fixture nobody re-derives from source | for any BEFORE/OLD reference (like `tests/_schedule_gate_main.js`), confirm it's a genuinely separate snapshot, not an alias back to the same live module |

## 2. METHOD
1. **Enumerate, don't assume.** `find . -maxdepth 1 -iname 'witness_*.js'` (root), `find viewer/tests
   modeller/tests -iname 'witness_*.js'`. Record raw counts; §S66's own table is 2 days stale (its 44/151
   /130 was 2026-08-22) — expect drift, cite the fresh count.
2. **Batch by population, smallest + highest-leverage first:**
   - **Batch A — `viewer/tests/` (~44-52, ALREADY GATING CI).** Highest value: these decide `green`/
     `known_red` today. Full six-check pass, every file.
   - **Batch B — repo ROOT (~151, NEVER RUN).** List-only first (name, last-touched date, one-line guess
     at subject from its own header comment) — a population census, not full checks yet. Then apply the
     six checks to whichever subset looks HIGHEST-RISK from the census (touches scheduling/ordering/
     persistence — the classes that already produced real bugs this session and in §S63/§S71).
   - **Batch C — `modeller/tests/` (~130, NEVER RUN).** Same treatment as B, after B, only if B doesn't
     eat the whole budget.
3. **Report format per file, one line:** `<file> — <VERDICT> — <one-line reason, quoting the line if a
   defect>`. VERDICT ∈ {CLEAN, VACUOUS(§W-x), ORPHAN-ONLY(no defect found, just never runs), UNKNOWN(needs
   a human judgment call this audit shouldn't make alone)}.
4. **Do not fix anything found.** Append findings to §RESULTS below with a batch date. A defect found here
   is a NAMED, dated fact — triage (separate pass, possibly a different session) decides what happens next,
   same discipline `ADVERSARIAL_EQUIVALENCE_AUDIT.md` uses for its own findings.

## 3. Known-good patterns to calibrate against (not to re-flag as defects)
So the audit doesn't waste a pass rediscovering things already correct:
- `witness_bake_plays_schedule.js:90` — the correct §W-EMPTY-POP guard shape.
- `witness_4d_band_monotonic.js`'s T1/BEFORE-AFTER pair — the correct §W-REDCONTROL shape (T2c on the
  SAME file is the counter-example — a file can be a mix, check every assertion, not just one).
- `witness_gantt_edit_coherence.js` G-COH-9 — an explicit, named RED CONTROL clause.
- §S63's `audit_rank_vs_support.js` — genuinely independent re-derivation (does not call the code it
  audits), the correct §W-PROVENANCE shape.

---

# §RESULTS (append dated batches below, do not overwrite prior ones)

## 2026-08-24 — Batch A COMPLETE: all 72 `viewer/tests/witness_*.js`, 4 parallel Fable agents

Full population (72, not the ~44-52 estimate — that excluded browser-witnesses, which this audit
included). **Tally: 42 CLEAN, 30 with at least one real finding (42%).** Read-only throughout; nothing
in bim-ootb was edited, run, or fixed as part of this audit.

| category | count | files |
|---|---|---|
| EMPTY-POP-RISK | 12 | class_fallback_blackbox, crosstask_judge_parity, gantt_baseline, edit_undo, native_generate, og_grid_perf, refold_yield, s50_cell_engine, shift_schedule, shift_tasks, tm_geo_order_cycles, zone_display_authoring |
| VACUOUS (incl. T2c-shape literal-true) | 8 | crew_demand (worst — structurally always-true), find_close_no_leak (minor), hba_cctv_inscene_capture, iot_pov_live, role_filter, room_select_door, xray_cache_memo, zone_index |
| PROVENANCE-RISK (frozen hand-copy, not a real slice) | 9 | corridor_reveal_shell, gantt_bars_in_rect, hosted_before_host, midair_zero, real_placement_resolver, save_fold, tm_refold, whatif_authored_sync, s50_cell_engine (minor) |
| STALE-SLICE (currently broken) | 2 | **door_window_host_wall (actively RED today on a stale anchor)**, gantt_gesture_wiring |
| KNOWN_RED, cause now established | 2 | tm_stream_index_defer (permanently red by construction post-fix, needs retiring), xray_cache_memo (infra-only, missing port 8519, product is fine) |

(Categories overlap — several files carry more than one finding; raw per-file verdict lines from all
four agent reports are preserved in this session's transcript, not re-pasted here to keep this file
navigable — the table above is the triage-ready summary.)

### The one systemic finding, worth fixing once instead of file-by-file
**`run_witness_suite.js` judges green by exit code alone (its own header, line 19).** 12 files can reach
`exit 0` with **zero assertions ever executed** — a missing fixture DB / wrong `BLD_DIR` silently greens
all of them at once, no `ran > 0` gate anywhere in the runner itself. Two files already show the
CORRECT pattern (`witness_s55_identity_vs_cell.js`, `witness_gantt_cpm_annotate.js` — the latter
`process.exit(1)`s on the identical failure another file exits 0 on). **Fixing the runner once — require
a witness's own summary line to report a `ran` count, and treat `ran=0` as red — closes all 12 at the
source**, cheaper than patching each file.

### Highest-priority individual items
1. **`witness_door_window_host_wall.js` is ACTIVELY RED TODAY, for the wrong reason.** Its wiring-check
   string predates `hostGate(el)` being added to the real call chain (`schedule_gate.js:904`) — the
   anchor no longer matches live source, so it fails on a stale assumption, not a real defect. The real
   "door starts before its host wall finishes" check behind it never runs as a result (already named in
   `4D_GANTT_TM_REFACTOR.md §S58.5` item 3, 2026-08-21 — open 3 days, not new).
2. **`witness_crew_demand.js` G-HR-INVARIANT cannot fail by construction** — `crewMul` only enters one
   side of the comparison, so `a.hrTotal === b.hrTotal` is tautological. Same file's crew/cost math also
   duplicates `injectGantt`'s arithmetic locally (mirror, not a call) using a stale 8h default instead of
   live 24h — **the same `shiftHours`-default bug class fixed today in `witness_4d_band_monotonic.js`**,
   independently present here too, and already named in §S58.5 item 4 ("green but computing wrong
   numbers... green-and-wrong is worse than red").
3. **`witness_midair_zero.js`'s W-MZ-2 does not prove what it's been cited for.** Its independent
   `census()` uses a symmetric contact rule; the shipped `SupportSweep.midairAudit` went directional in
   #1435. Green here regression-locks the witness's OWN count, not the shipped mechanism — already
   self-disclosed in the file (line ~302) and in §S58.5 item 1 as an open, unchased item. **This directly
   qualifies this session's earlier "hell #2, zero doubt" claim** — no regression detected, but the
   original certainty was too strong.

### Convergent validation, not just new discovery
About half of what surfaced (crew_demand, shift_schedule/tasks silent-skip, tm_refold's hand-copy,
door_window_host_wall's brittleness, midair_zero's judge-divergence) **independently re-finds exactly
what `4D_GANTT_TM_REFACTOR.md §S58.5` already wrote down on 2026-08-21** — a repair queue that was named
and then never worked. That's not this audit failing to find anything new; it's confirmation the method
finds real things AND that naming a defect here doesn't get it fixed by itself — the closing step still
needs someone to pick the queue up.

### Note: `viewer/tests/` gained 3 files + upstream drift since Batch A's audit
Pulling `origin/main` to start Batch B picked up PR #1504 (this audit's own witness relocation, now
live) plus unrelated concurrent work: `witness_tm_edit_exception.js`, `witness_tm_office_snapshot.js`,
`witness_tm_silent_refusal_tips.js` (new, unaudited) and a 147-line change to `time_machine.js` — some
Batch A line-number citations may already be stale against current HEAD. Not re-verified here; flagged
so a future line-number citation from Batch A is checked against current source before being trusted,
per this project's own "verify before load-bearing" rule.

## 2026-08-24 — Batch B census + first high-risk slice dispatched

**Census (fresh, §S66's 151/2026-08-22 count is 2 days stale): 149 `witness_*.js` at repo ROOT**, still
none run by anything (`run_witness_suite.js` only scans `viewer/tests/`). Age spread: 81 last touched
2026-07, 69 in 2026-08 (one, `witness_4d_band_monotonic.js`, has now left this population via PR #1504).

Per the contract's own method (§2 step 2): list-only first, full six-check pass on the highest-risk
subset first. Keyword census (`schedul|order|persist|gantt|cpm|midair|support|band|sequenc` in the
filename) — the classes that already produced real bugs this session and in §S63/§S71 — surfaces
**16 of 149** as highest-risk: `boq_charts_real_schedule`, `cinema_bands`, `cinema_path_persist`,
`cpe_buildup_schedule`, `gantt_bar_identity`, `gantt_edit_constraints`, `gantt_ops_blackbox`,
`gantt_palette`, `gantt_phase_palette`, `gantt_row_order`, `gap1_task_sequences`, `geo_support_leak`,
`stagger_support_order`, `support_invariant_all_buildings`, `zone_cpm_duplex`, `zone_cpm`. Full
six-check audit dispatched on this 16 (2 Fable agents, 8 each) — results below.
The remaining 133 stay list-only for now, per §S66's own warning against bulk-checking an untriaged
population in one pass.

## 2026-08-24 — Batch B high-risk slice COMPLETE: 16/149 root witnesses (scheduling/ordering/persistence)

**Tally: 6 CLEAN, 4 LIKELY-BROKEN (crashes or asserts against deleted/refactored code), 6 MIXED/weak.**
Worse than Batch A's 42% defect rate, and a NEW category shows up that Batch A barely had: this
population doesn't just carry weaker rigor, it's **actively rotting** — nothing exercises these files as
the live code moves, so they silently stop meaning anything and nobody notices.

| file | verdict | reason |
|---|---|---|
| `boq_charts_real_schedule.js` | CLEAN | 3 real RED controls, live anchors verified |
| `cinema_path_persist.js` | CLEAN | true negative control + real page-reload round trip |
| `gantt_edit_constraints.js` | CLEAN | RED control re-runs the OLD verb and asserts it DOES violate |
| `gantt_palette.js` | CLEAN (minor) | live color anchors real; empty-object guard is truthy-only, not count-gated |
| `gap1_task_sequences.js` | CLEAN | real `require()`s, named red-state check, idempotence |
| `zone_cpm.js` | CLEAN | real `require()`s, cross-path numeric equalities, DAG-via-cycle-error |
| `cinema_bands.js` | MIXED (minor) | `[].every()` gates pass on a 1-band seed with 0 real checks; one connector auto-passes on a swallowed exception |
| `gantt_bar_identity.js` | PROVENANCE-RISK (minor) | hardcodes `schedule_id='SCH_AUTHORED'`, live code now resolves it dynamically w/ self-heal — a divergence there is invisible here |
| `gantt_row_order.js` | MIXED, **actively RED today** | stale text anchor (`_ROW_PHASE_ORDER` no longer exists) — same class as `door_window_host_wall`; its `rates.js`-side half is genuinely good and still runs |
| `geo_support_leak.js` | MIXED | hand-mirrored predicate has drifted from the live gate a **third time** (documented in its own v1→v2→v3 history); all-fixtures-missing exits 0 "PASS" |
| `support_invariant_all_buildings.js` | WEAK-REDCONTROL | audits `ScheduleGate.auditFloating` using `ScheduleGate.auditFloating` — deliberately kept symmetric with the code it checks, no independent judge, no red arm |
| **`gantt_ops_blackbox.js`** | **LIKELY-BROKEN** | its sliced `computeDays()` is now a stub after the §S53 `gantt_model.js` extraction (2026-08-21) — the logic it exercises no longer lives where it's looking; one gate (G-7) fails on a stale anchor for logic that MOVED, not broke |
| `cpe_buildup_schedule.js` | LIKELY-BROKEN | default fixtures (`TerminalHi4D`, `Hospital_3`) don't exist anywhere in the repo — fails loudly, not silently; assertion design itself is the strongest in this batch |
| `gantt_phase_palette.js` | LIKELY-BROKEN | two slice anchors gone from `time_machine.js`; even past the crash, its own RED comparator is now permanently green post-merge — "witness is blind" |
| `zone_cpm_duplex.js` | LIKELY-BROKEN | fixture path points at a **different session's scratchpad file**, long gone — unhandled rejection on load |
| `stagger_support_order.js` | MIXED (subject rot) | its entire mechanism (§PLAYBACK-STAGGER) was superseded twice in production (2026-08-11, then 2026-08-15); green/red here says nothing about the shipped product anymore |

**New, load-bearing finding:** `GANTT_ACCURACY.md:1172` attributes the "6,778→0, the user's invariant"
claim to `audit_support_roleblind.js` — **that file exists only on branch `fix/helipad-roof-separation`
(`86b8535`), not in the working tree.** The doc's own cited instrument is currently un-runnable from a
checkout of `main`. Not chased further here — named so a future session doesn't assume it can just `node`
that file.

**Zero T2c-shape literal-`true` finds in this 16** — the classes here are rot and weak-provenance, not
vacuous-by-construction. Cross-references §S58.5's "witness that cannot fail, or fails silently, is worse
than no witness" verdict again, this time via decay rather than authoring — nobody wrote a bad witness
here, the ground moved out from under a previously-fine one and nothing signaled it.

## 2026-08-24/25 — Batch B COMPLETE: remaining 133 root witnesses, 6 parallel Fable agents

**All 149 repo-root `witness_*.js` now audited (16 high-risk + 133 general).** Approximate combined
tally for this 133-file sweep: **79 CLEAN, 54 with at least one real finding (~41%)** — consistent with
both the high-risk slice (10/16, 62%) and Batch A (42%). Across all 221 files audited today (Batch A's
72 + Batch B's 149), the defect rate holds at **~42% regardless of population or subject matter** — that
consistency is itself worth noting: this isn't a pocket of bad witnesses, it's a background rate.

### The dominant NEW pattern this round: decay-by-merge (git-show-origin/main comparators)
**Six separate files** die the identical mechanical way: their BEFORE/RED comparator is
`git show origin/main:<file>` or a `git diff` against main, authored while the fix under test was still
unmerged. The moment that fix lands on `main`, BEFORE ≡ AFTER and the comparison becomes the file
diffing itself against itself — permanently green, zero information, and nothing about the file changes
to signal this happened.
- `witness_cinema_exit_breathe.js`, `witness_containment_alias_js.js` (worktree require also gone),
  `witness_exit_not_a_lift.js`, `witness_tour_polyline_path.js`, `witness_spine_bridge_cluster_regression.js`
  (also has no `process.exit` at all — FAIL text prints, exit code is still 0)
- `witness_cpe_buildup_arm_gate.js` is the ONE file that SELF-DETECTS this and prints "WITNESS IS BLIND"
  before going red — the pattern every other instance should follow.

### Second pattern: decay-by-refactor (anchor moved, not deleted)
Legitimate refactors silently orphan the witness pointed at the old location: `gantt_ops_blackbox.js`
(§S53 `gantt_model.js` extraction), `gantt_row_order.js`, `gantt_phase_palette.js`, `cinema_r2_floor_level.js`,
`cinema_r3_swoop.js`, `cinema_reciprocal.js` (mechanism explicitly RETIRED with a "do not resurrect" note —
the witness still gates it), `history_viewnav_backarrow.js`, `tour_cache_evict.js` (version-pinned `v12`
vs live `v18`, plus a retired store path). None of these are silent — all fail loudly — but all represent
a real check that stopped covering anything, for weeks in some cases, with nobody told.

### Third: a recurring PHANTOM fixture — `Hospital_3`
`witness_cpe_buildup_schedule.js` (Batch B high-risk slice), `witness_cpe_hose.js`, and
`witness_cpe_aim_depth_buildup.js` all default to a `Hospital_3` building that exists nowhere in the
repo. Same name, three unrelated files, three separate batches. One triage decision (what was this
building, was it renamed or retired) fixes all three at once instead of three separate investigations.

### Fourth: two more load-bearing doc citations that don't hold up
- `witness_room_path_raster_polyline.js` and `witness_zstack_xray_staging.js` both compare the shipped
  code to **their own hand-copy of the same predicate**, not to an independent source — the X-ray
  staging file's byte-identical-schedule gate is genuinely sound, but its carrier predicate is self- vs
  self-referential, so `GANTT_ACCURACY.md`'s PR #1139 claim is certified at the algorithm level only, not
  the shipped browser copy. Same shape as this session's earlier `audit_support_roleblind.js` finding
  (branch-only, unreachable from `main`) — a second instance of a headline doc claim resting on a witness
  that can't actually see a regression in the code it's supposedly proving.

### Best-built witnesses found today, worth using as the contract's calibration set going forward
The `gpu_warn_*` family (5 files, `witness_gpu_warn_{degraded,firstrun,nonag,recovered,wiring}.js`) and
the `cpe_room_title_*` cluster (10 files) are the strongest-built witnesses found in this entire audit —
real fault injection in both directions, anti-vacuous design called out explicitly in their own headers
(e.g. `witness_cpe_room_title_lead.js` G-TL-7b exists specifically to catch "green with the feature never
firing"), and genuine independent re-derivation rather than mirrored constants. Add these to §3's
calibration examples the next time this contract is revised.

### Isolated notable finds (not part of a repeated pattern)
- `witness_one_spot.js` **writes to the shared checkout's `viewer/effects.js`** as part of its own "before"
  run — a correctness risk to the shared tree, not just a rigor gap, flagged separately from this audit's
  normal scope.
- `witness_envmap_stomp.js` — `process.exit(0)` unconditionally; its verdict is print-only. Always green.
- `witness_cpe_work_pacing.js`, `witness_tour_mainhall_selection.js` — more T2c-shape literal-`true`
  gates, most (not all) self-disclosed as intentional retirements — still invisible to a runner judging
  exit code alone, same systemic fix as Batch A's finding applies here too.

Full per-file verdict lines from all 6 agent reports are preserved in this session's transcript.

### Not yet run: `modeller/tests/` (~130 files, Batch C — a different subsystem entirely, unstarted)
