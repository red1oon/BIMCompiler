# ⚠ DO NOT REMOVE
**Scope:** A scale/lag forecast harness. Drive the REAL fold engine at full-production iDempiere
cardinalities, measure where its OWN internal lag (op-log growth, per-write re-fold, projection bloat,
cold-boot cliff) becomes user-perceptible, and turn the measured curves into a **business-capacity
forecast**: documents/day it sustains, and the size of ERP department it can carry — WITH and WITHOUT
each mitigation (checkpoint / batch / prune).
**Non-invent law:** every forecast number is a *fit to measured points*, never a typed-in guess. The
production profile is *sized from the real iDempiere oracle's table cardinalities*, not assumed. An
extrapolated cell is tagged `(forecast)`; a measured cell is tagged `(measured)`. Never present the two
as the same kind of number.
**Read the log after EVERY run.** Exit code is not evidence. `bash build/erp/run_witness.sh
scripts/poc_scale_forecast.js` → read `build/erp/poc_scale_forecast.log` before any conclusion.

---

## §0 The claim under test
> *Stated once.* At a robust, non-trivial production load — a multi-year iDempiere tenant with a real
> document mix — the Fold Engine's internal lag stays under the user-perceptible budget on every surface
> (write, boot, storage), and the deployed strategies (checkpoint bootstrap, batch `commitGroup`,
> projection prune) are what keep it there. We can **forecast the docs/day and the ERP-department size**
> the system carries before any surface crosses its budget.

This is a *falsifiable forecast*, not a benchmark vanity run. Each witness names the lag surface it
proves or refutes (Standing Rule: tests expose issues).

## §1 The four lag surfaces (what we are actually racing)
Anchored to the engine's already-measured reality — do NOT re-derive, EXTEND these points:

| Surface | Cost shape | Driver var | Measured anchor (source) | Budget |
|---|---|---|---|---|
| **S-WRITE** per-commit latency | re-fold = full GROUP BY per write → **O(live docs)** (I-5) | `D` = open docs | ~500 op/s end-to-end (`spike_writepath.log`) | <100 ms (feels instant); <16 ms ideal |
| **S-BOOT** cold start | genesis re-fold replays whole log → **O(N)** | `N` = total op-log len | 100M ops = **25 s** mobile; checkpoint boot **~9 ms FLAT** (`bootstrap_path.js`) | <2 s good, >10 s broken |
| **S-STORE** projection size | rich JSON payload/op → **O(N)** bytes | `N` | **~481 B/op** (52→992 KB / 2000 ops, `spike_writepath.log` I-3) | IDB/OPFS practical + mobile RAM |
| **S-THRU** sustained throughput | batch amortises commit+seal | batch `B` | naive **9,390** vs `commitGroup` **22,492 ops/s** = **2.4×** (`sync_poc_smoke.log`) | ≥ daily op load ÷ working seconds |

The two re-fold costs are DISTINCT and must never be conflated: **S-WRITE is O(live docs)** (per keystroke-commit), **S-BOOT is O(total ops)** (cold start). They scale on different variables and have different fixes.

## §2 Production profile — SIZED FROM THE ORACLE, not invented
Before any sweep, derive the load shape from real iDempiere, so "production" is extracted, not guessed.

1. **ops-per-document (the conversion constant).** Drive ONE real `C_Order` through the live 6-verb O2C+FI
   fold (create → complete → ship → invoice → post → allocate) and **count `kernel_ops` rows appended**.
   Repeat for invoice-only, payment, GL journal. Emit `§SCALE-OPSDOC doctype=<t> ops=<k>`. This `k` is the
   bridge from business docs to engine ops — MEASURED, never assumed.
2. **doc mix + GL depth.** From an iDempiere reference DB (`build/erp/13-idempiere.db` / the
   `idempiere_test` oracle), count `C_Order`, `C_Invoice`, `M_InOut`, `C_Payment`, `Fact_Acct` rows and
   `Fact_Acct` lines per posted doc. Emit `§SCALE-MIX orders=… invoices=… shipments=… factlines/doc=…`.
   This sets the realistic ratio of cheap vs GL-heavy documents.
3. **production envelope.** Scale the measured per-period mix by `YEARS × VOLUME_MULT` to a stated
   envelope. Label every envelope input `(assumption: …)` and make it a CLI arg — never bake a guess in.
   Default envelope to sweep: small / mid / large tenant (see §4).

## §3 Harness — reuse, do not reinvent the timing path
`scripts/poc_scale_forecast.js` is a *parametric driver* over the EXISTING measured paths. It must call the
real engine, never a synthetic stopwatch loop:
- per-write latency → the `spike_writepath.js` write-path core (real fold + project + persist).
- throughput naive vs batch → the `sync_poc` commit/seal path.
- cold boot ON/OFF checkpoint → `bootstrap_path.js` genesis vs checkpoint bootstrap.
- prune ON/OFF → the I-3 compaction path (`erp_period_close.js` checkpoint drops pre-anchor ops).
Each inner run already §-logs; the forecast harness aggregates their `§` lines, it does not re-time them.

## §4 Sweep matrix (measure a few points per axis, then FIT)
Measure ≥3 points per axis so a curve can be fit (2 points can't reveal super-linearity):

- **S-WRITE vs D (live docs):** D ∈ {100, 1 000, 10 000, 50 000} → fit `write_ms(D) ≈ a + b·D`. Report the
  D where `write_ms` crosses 100 ms. Run prune ON and OFF.
- **S-BOOT vs N (total ops):** N ∈ {10 k, 100 k, 1 M, 10 M} → fit `boot_ms(N) ≈ c + d·N`; extrapolate to the
  envelope N. Run **checkpoint OFF (genesis)** vs **ON** — expect ON to flatten toward the ~9 ms constant.
- **S-STORE vs N:** confirm `bytes(N) ≈ 481·N` holds across the sweep; with prune, `bytes ≈ 481·(N since
  last checkpoint)`. Report projected DB size at envelope N.
- **S-THRU vs B:** B ∈ {1, 10, 100, 1 000} → confirm the 2.4× batch speedup and find where it saturates.

Envelope tiers to forecast against (each an `(assumption)` arg, tune from the oracle in §2):
- **small** ≈ 5 k docs/yr · 1 yr · ~10 users
- **mid** ≈ 50 k docs/yr · 3 yr · ~50 users
- **large** ≈ 500 k docs/yr · 5 yr · ~200 users

## §5 Forecast model (the fit — and its honesty rules)
For each surface, fit the measured points to its KNOWN complexity (§1), then extrapolate to envelope N/D.
- State the fit (`a,b,c,d`, R²) in the log. A poor R² (<0.95) = the cost shape is wrong → STOP, do not
  extrapolate a bad model.
- Every extrapolated cell is tagged `(forecast)` with the fit it came from; measured cells `(measured)`.
- Report the **crossover**: the N or D at which each surface first exceeds its §1 budget — that is the
  capacity ceiling, with and without the mitigation.

## §6 BUSINESS TARGETS — docs/day and ERP-department size
Translate engine numbers into the only units a buyer cares about. All derived from §2's measured `k`
(ops/doc) and §4's throughput — arithmetic over measured constants, nothing invented:

- **Daily op budget:** `ops/day = sustained_ops_per_s × working_seconds/day` (default working window an
  `(assumption)` arg, e.g. 8 h = 28 800 s; or 24 h for batch/integration load).
- **Docs/day sustained:** `docs/day = ops/day ÷ k_weighted` (k weighted by the §2 doc mix).
- **ERP department it carries:** `clerks = docs/day ÷ docs_per_clerk_day`, where `docs_per_clerk_day` is a
  stated `(assumption)` band (e.g. AP/AR clerk ~50–200 posted docs/day; tune per role). Report a RANGE,
  not a false-precision single number.
- **Concurrency note:** S-WRITE (O(live docs)) is the *interactive* ceiling (how laggy each clerk's Save
  feels at the day's open-doc count); S-THRU is the *aggregate* ceiling (how many the whole dept posts).
  Report BOTH — a system can be fast per-click yet capped in aggregate, or vice-versa.

**Target table to emit (`build/erp/scale_forecast.md`):**

| Tier | docs/yr | live-doc D | total-op N | write ms (D) | boot s (N) | DB size (N) | **docs/day** | **ERP dept (clerks)** | limiting surface |
|---|---|---|---|---|---|---|---|---|---|
| small | … | … | … | …(measured) | …(measured) | … | … | ~N–M | … |
| mid | … | … | … | …(forecast) | …(forecast) | … | … | ~N–M | … |
| large | … | … | … | …(forecast) | …(forecast) | … | … | ~N–M | … |
| large, **no checkpoint** | … | … | … | … | …(forecast, 25 s cliff) | … | … | — | S-BOOT |
| large, **no batch** | … | … | … | … | … | … | … | ~N–M (÷2.4) | S-THRU |

## §7 Witnesses (the §-tagged claims — no log line = not done)
- `§SCALE-OPSDOC` — ops/doc measured per doctype from the real fold (§2.1).
- `§SCALE-MIX` — doc mix + Fact_Acct depth read from the oracle (§2.2).
- `W-SCALE-WRITE` — `§SCALE-WRITE D=… ms=… fit b=… R2=… cross100ms@D=…` (prune ON/OFF).
- `W-SCALE-BOOT` — `§SCALE-BOOT N=… genesis_ms=… checkpoint_ms=… flat=Y/N` — proves checkpoint flattens O(N)→~const.
- `W-SCALE-STORE` — `§SCALE-STORE N=… bytes=… B/op=481±… pruned_bytes=…`.
- `W-SCALE-THRU` — `§SCALE-THRU B=… naive=… batch=… speedup=2.4×… saturate@B=…`.
- `W-SCALE-FORECAST` — emits the §6 table; each cell tagged (measured)/(forecast); names the limiting
  surface per tier and the crossover N/D.

## §8 Acceptance / DONE
- All §7 witnesses PASS with a `§` log line each (Watchdog: claim without a log line = not done).
- Fits have R² ≥ 0.95 or the row is reported as "shape uncertain — not extrapolated."
- `build/erp/scale_forecast.md` exists with the small/mid/large tiers + the two no-mitigation rows, every
  forecast cell tagged and traceable to a fit.
- A one-paragraph verdict: *largest ERP department the system carries before the first surface crosses
  budget, and which surface that is* — the honest ceiling, stated plainly (no hype).

## §9 Strategy on/off matrix (what the forecast must isolate)
Run the envelope with each mitigation independently toggled so the forecast SHOWS each one's contribution:
| Strategy | OFF behaviour (the lag it removes) | ON behaviour |
|---|---|---|
| **Checkpoint bootstrap** | S-BOOT = O(N) genesis, 25 s cliff at large N | ~9 ms flat (open-period fold only) |
| **Batch `commitGroup`** | S-THRU at naive 9,390 ops/s | 22,492 ops/s (2.4× → 2.4× more docs/day) |
| **Projection prune** | S-STORE = 481 B/op unbounded → mobile RAM / IDB wall | bytes bounded to ops-since-checkpoint |

> Spec lineage: extends `docs/FoldEngineConstraints.md` (§2 cliff, §4 genesis) + the measured logs
> `spike_writepath.log` (I-3/I-5), `sync_poc_smoke.log` (2.4×), `bootstrap_path.js` (25 s vs 9 ms). New
> driver: `scripts/poc_scale_forecast.js`. Output: `build/erp/scale_forecast.md` + `…_forecast.json`.

---

## §10 — 2026-09-03 · W-SCALE-THRU's claim flipped to 0.82×. SPEC of the root cause and the fix.

**Reported state (`build/erp/poc_scale_forecast.log`, 06:48):** `§SCALE-THRU naive=1228op/s
batch=1001op/s speedup=0.82×` → `🔴 W-SCALE-FORECAST FAIL (1 of 3 measured claims broke)`, while the
same run's VERDICT box printed *"MITIGATIONS EARN THEIR KEEP … batch = 0.8×"* — self-contradicting.

### §10.1 MEASURED — the flip is contention-amplified, not a code regression
Re-run on an idle machine, 6 consecutive runs of the unmodified witness:

| run | naive op/s | batch op/s | speedup |
|---|---|---|---|
| logged 06:48 | 1,228 | 1,001 | **0.82×** |
| 1 | 6,480 | 9,826 | 1.52× |
| 2 | 5,639 | 12,060 | 2.14× |
| 3 | 6,215 | 11,256 | 1.81× |
| 4 | 6,102 | 12,322 | 2.02× |
| 5 | 5,824 | 11,718 | 2.01× |
| 6 | 5,877 | 8,294 | 1.41× |

Both arms degrade under load; **the batch arm degrades ~2.5× harder** (11.7× down vs 4.7× down). The
claim is a bare `speedup > 1` over a single un-repeated wall-clock pair, so it flips.

### §10.2 ROOT CAUSE — `commitGroup` hashes every op TWICE (measured, not inferred)
Digest counter wrapped around `crypto.subtle.digest` for one 2,000-op run of each arm:

```
§PROBE-NAIVE  digests=2000   (insert phase 0 + sealChain 2000)
§PROBE-BATCH  digests=4040   (staged 2000 + 40 group hashes + sealFrom 2000)   = 2.02× the hashing
§PROBE-SEALFROM  §KRN_SEAL_FROM fromId=0 sealed=2   ← a 2-op group re-seals BOTH of its own rows
```

`kernel_ops.js` `commitGroup` step 4 calls `sealFrom(db, tipRow)` where `tipRow` was captured **before**
the INSERTs, so `WHERE id > tip.id` selects the group's own just-inserted rows and re-derives every hash
it already staged, plus N `UPDATE`s. Its own comment states the intent it does not implement:
*"Rows were inserted ALREADY-sealed … sealFrom is idempotent over them and confirms the tip."*
Each digest is an `await`, so under CPU contention the extra 2,000 promise round-trips are what makes the
batch arm lose — the mechanism behind §10.1's asymmetric degradation.

### §10.3 THE FIX (two parts — the engine, then the instrument)
**F1 · `commitGroup` skips the redundant re-seal in the clean case.** When `_lastSealedTip(db).id ===
MAX(id)` (every existing row is sealed and the tip IS the last row), the staged hashes are already the
chain — return `{ sealed: ids.length, tip: <last staged hash> }` without re-hashing.
- **Contract preserved exactly:** `sealed === ids.length` is asserted by `poc_crud_group.js:91` and
  `test_crud_process_writeloop.js:39`, and truth-tested by `poc_pos_deliverlater/register/replenish_staged`,
  `poc_kitchen_queue`. The rows *were* sealed — at stage time — so the count stays honest.
- **Dirty case unchanged:** if unsealed rows sit below the tip (a prior `commitOp` without a seal), the
  full `sealFrom(db, tipRow)` still runs, because it must re-chain over those rows. It now emits
  `§KRN_GROUP RESEAL` naming the gap, so the slow path is visible instead of silent.
- **Falsifier:** `verifyChain` must return `ok` after a clean-case `commitGroup`, and the returned
  `op_hashes`/`tip` must equal the rows actually stored. If skipping the re-seal broke the chain,
  `verifyChain` fails — it is the same check `poc_crud_persist`/`poc_crud_docstatus` already run.

**F2 · W-SCALE-THRU stops asserting on one un-repeated wall clock.** The arm is measured **3× per side,
interleaved** (naive, batch, naive, batch, …) and the claim is asserted on the **median** speedup; min/max
are printed so a flip is visible rather than silent. A `§SCALE-THRU-WORK` line reports the deterministic,
contention-immune half of the claim — digests and row-writes per op for each arm — so a future regression
in engine *work* is caught even when the machine is too loaded to time anything.

### §10.4 Acceptance
- `§SCALE-THRU-WORK batch_digests` drops **4040 → 2040** for 2,000 ops (the 40 group hashes remain).
- `W-SCALE-FORECAST` PASSes 3/3 with the median claim, and the VERDICT box's "batch = N×" agrees with it.
- `check_erp_twins.js` GREEN (both `kernel_ops.js` copies changed together), and the kernel_ops-judging
  witnesses re-run with 0 regressions.

### §10.5 RESULT — 2026-09-03, both parts shipped, measured
`build/erp/poc_scale_forecast.log` after the fix:
```
§SCALE-THRU naive=7785op/s batch=27449op/s speedup=3.53× (median of 3 interleaved reps; per-rep 4.55× 3.53× 3.44×)
§SCALE-THRU-WORK naive digests=2000 rows=2000 · batch digests=2040 rows=2000
                 · batch/naive hashing=1.02× (contention-immune) · batch chain ok=true len=2000
🟢 W-SCALE-FORECAST PASS — 5 measured claims hold
```
| | before | after |
|---|---|---|
| batch digests / 2,000 ops | 4,040 | **2,040** |
| batch/naive hashing | 2.02× | **1.02×** |
| speedup, isolated probe | 2.25× | **3.69×** |
| speedup, in-witness | **0.82× (FAIL)** / 1.41–2.14× idle | **3.53× median, worst rep 3.44×** |
| claims | 3 (one a bare un-repeated wall clock) | 5 (median + work-ratio + chain-verifiable) |

**The new work-ratio claim is falsifier-proven, not decorative:** on the pre-fix engine it reads
2.02× > 1.10 → 🔴. It would have caught this defect on ANY machine, loaded or idle.

**Regression sweep — 73 kernel_ops-judging witnesses, run BEFORE and AFTER the engine change:**
66 PASS / 7 FAIL, **identical set both times → 0 regressions**. The 7 are pre-existing and unrelated:
`poc_kernel`, `test_kernel_owner`, `test_kernel_sign` are `MODULE_NOT_FOUND` (a path issue, the engine is
never reached); `poc_kds_live`, `poc_pos_live`, `poc_replenish_live`, `poc_wh_cache` need a served app
(Playwright). `check_erp_twins.js` GREEN — both `kernel_ops.js` copies moved together.

**Shipped:** bim-ootb `fix/erp-commitgroup-seal-skip` (`erp/kernel_ops.js` + `erp/sw.js` v777→**v778**).

**⬜ Left open, deliberately — the DIRTY-case hash inconsistency (pre-existing, NOT introduced here).**
When unsealed rows sit below the tip, `commitGroup` returns `op_hashes`/`group_hash` staged off the OLD
tip while `sealFrom` then re-chains the rows to DIFFERENT stored hashes — so the returned hashes and the
`expectedHash` all-or-none gate disagree with what is on disk. The fix makes this path *visible*
(`§KRN_GROUP RESEAL`) but does not change its semantics, because the gate's contract is a separate
decision. Nothing in the tree hits it today (every live caller commits through groups only).
