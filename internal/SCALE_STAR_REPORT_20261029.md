# W-SCALE-STAR — the star measured at N = M = 10, 100, 1000 (2026-10-29)

Source of every number below: the logs in `build/scriptor/witness_scale_star_*.log` (the `§STAR-*` lines) and the two derived files `witness_scale_star_fit.log` / `witness_scale_star_tables.md`, produced by `scripts/witness_scale_star.js` (modes `engine`, `hq`, `fit`, `tables`). Spec: `prompts/TEAMWORK_FRAMEWORK.md` §45.1. Nothing in the product was changed. bim-ootb read at `origin/main` `193677b1` (detached worktree).

## Verdict line (from `witness_scale_star_fit.log`)

`§STAR-VERDICT FAIL arms=E1:PASS E2:MEASURED CONTROL:PASS MUT-SCOPE:KILLED MUT-COUNTER:KILLED H1:FAIL H2:MEASURED engine_points=10:PASS-RUN,100:PASS-RUN,1000:INCONCLUSIVE hq_points=10:PASS-RUN,100:PASS-RUN,1000:STOPPED`

Reading it: the edge is flat (E1 PASS), the bytes it is sent are not (E2: linear in N), and head-office per-ticket cost is NOT flat (H1 FAIL: the §45 expectation is refuted by the numbers). The N=1000 engine point is INCONCLUSIVE (time box) and the N=1000 head-office point is STOPPED before its accounting run; neither is a PASS.

## What was run

- One head-office device (role 102, founder) + N stations (own org/warehouse/locator, role 50004, bound `by` its `ad_org_uu`) + M borrowers (bound to a `C_BPartner_UU`, role 50004); the shipped POS plan signed in the run, genesis `plan:'pos'`; real `common/comm` engine, real `erp/team_sync.js` in a vm. Day: each station K=3 tickets (2 lines + 1 tender = 15 ops), each borrower 1 payment + 1 slip (2 ops); head office visits, answers with 1 replenishment movement per station and 1 loan invoice + 1 instalment per borrower; the measured edges visit again.
- Measured edges: 2 stations (first, last) + 2 borrowers (first, last), each fetching the WHOLE relay. The other N+M-2 devices are load generators (fetch only the founder's roster bundle) and are not measured.
- Time boxes (wall clock, per invocation): engine N=10: 20 min · N=100: 30 min · N=1000: 150 min. Model layer: cached N=10, 100: 60 min · cached N=1000: 120 min · as-shipped N=10: 30 min. A phase finishing after its box is INCONCLUSIVE.
- Head-office model layer, two variants. **shipped** = the code as it is (N=10 only: 10 tickets, 5 slips). **cached** = identical code except the harness memoises `AdCallout.loginContext` (NOT as shipped; reason in "Findings" below) so that the rest of the cost becomes visible; all N use it. Tenant accounting mode `Q` (end-of-day posting, §41.1 F1); the seed's own unposted backlog is posted first and is not counted in the day.
- Honest limits (also printed in each log header): one Node process family simulates all devices, no network latency, no browser; the relay is a folder pipe on local disk; `teamRebuild` is browser-only so Visit ms = sync + the adapter's `_project`; Node + sql.js timings are not browser timings; model-layer inputs are K4-shaped tickets, not bridged from the engine's projection. Runs overlapped on the 20-core machine (loadavg at start 2.0 to 5.6, see the headers); engine N=1000 ran alongside the model-layer N=100 and N=1000 runs.

## Tables (copied from `witness_scale_star_tables.md`)

| metric | N=M=10 | N=M=100 | N=M=1000 (INCONCLUSIVE) |
|---|---|---|---|
| EDGE station: bytes downloaded, Visit #1 (catch-up) | 384,071 | 4,514,145 | 45,816,693 |
| EDGE station: bytes downloaded, Visit #2 (steady, after head office answered) | 103,900 | 589,793 | not reached |
| EDGE station: objects fetched, Visit #1 / #2 | 34 / 24 | 394 / 204 | 3,994 / not reached |
| EDGE station: ops delivered (placed) / accepted / refused (Visit #2) | 200 / 16 / 184 | 2,000 / 16 / 1,984 | Visit #1: 16,981 / 15 / 16,966 (s:0) |
| EDGE station: comm-log DB bytes | 540,672 | 4,511,744 | 39,448,576 (Visit #1) |
| EDGE station: Visit ms, #1 / #2 | 417 / 179 | 2,999 / 1,358 | 48,313 / not reached |
| EDGE borrower: bytes downloaded, #1 / #2 | 440,910 / 69,127 | 4,578,726 / 555,020 | 45,958,676 / not reached |
| EDGE borrower: delivered / accepted / refused (#2) | 200 / 4 / 196 | 2,000 / 4 / 1,996 | #1: 17,000 / 2 / 16,998 (b:999) |
| RELAY objects stored for the day | 44 | 404 | not read (relay dir removed at INCONCLUSIVE); head office fetched 4,000 objects, 46,041,787 bytes |
| RELAY bytes stored (of which heads) | 674,100 (10,548) | 6,365,784 (103,000) | not read |
| RELAY objects listed per Visit (#2) | 43 | 403 | #1: 3,995 |
| HQ engine: fold ms of the day's inbound (sync + project) / ops received | 314 / 170 | 3,294 / 1,700 | 43,437 / 17,000 |
| HQ engine: replies authored (N movements + 2M loan ops) ms | 630 | 46,553 | 5,313,096 (all 1,000 / 1,000 / 1,000 addressed) |
| HQ engine: enrol ms per device (roster = N + M devices) | 39 | 105 | 908 (1,816 s for 2,000 devices) |
| HQ engine: comm-log DB bytes / process heap MB (engine parent) | 495,616 / 20 | 4,038,656 / 48 | 39,444,480 / not recorded |
| CONTROL: planted op moves accepted by | +1 | +1 | not reached |
| MUTANT scope-off: accepted (mutant) vs real 17 | 201 | 2,001 | not reached |
| engine point wall seconds | 6 | 122 | 10,250 |

| model layer (head office) | cached N=10 | shipped N=10 | cached N=100 | cached N=1000 |
|---|---|---|---|---|
| tickets imported (oracle: orders = invoices = receipts CO) | 30 | 10 | 300 | 3,000 (3000/3000/3000) |
| Import POS Sales ms per ticket (all in) | 125 | 8,767 | 263 | 2,147 |
| ... first round / last round, ex login-context (batch per round: 6 / 60 / 600) | 177 / 119 | 200 / 101 | 156 / 389 | 656 / 3,774 |
| login-context builds per ticket / share of Import POS Sales ms | n/a | 4.2 / 98.3 % | 0 builds timed | 0 builds timed |
| deposit ms per ticket (I_Order + I_Payment via ML.save) | 3 | 8 | 1 | not extracted |
| invoice copy + Complete ms (micro, per document) | 22 | 48 | 23 | 23 |
| Import Payment ms per slip (slips) | 27 (10) | 422 (5) | 96 (100) | 849 (1,000) |
| Replenish Report ms (ONE branch, MMM) | 74 | 2,088 | 76 | 78 |
| Tenant Accounting Processor ms / documents posted / ms per doc | 9,984 / 191 / 52 | 4,067 / 73 / 56 | 250,794 / 1,811 / 138 | NOT MEASURED (stopped, see below) |
| head-office model-layer ms measured | 14,092 | 95,941 | 339,368 | n/a |
| heap MB at end (cached N=1000: peak across import rounds) | 26 | 50 | 193 | 466 (round 5) |
| model DB bytes | 30,060,544 | 29,753,344 | 32,985,088 | not reached |

Head-office day (`§STAR-H2`): N=10 total 15.0 s, N=100 total 389.2 s (both WITHIN the stated budget below). N=1000: the measured components are fold 43.4 s + replies 5,313.1 s + Import POS Sales 6,439.6 s (sum of the five rounds) + Import Payment 849.5 s + Replenish 0.08 s (one branch) = 12,645.7 s, WITHOUT the accounting run, which did not answer inside the session; the fit prints `§STAR-H2 n=1000 INCONCLUSIVE`. Budget used for the comparison is a STATED CHOICE of the measurer, not a source value: heap <= 2000 MB (docs/BrowserScaleBenchmark.md reports one tab peaking 3.4-3.8 GB at 22 M vertices), day <= 3600 s.

## Fits (from `witness_scale_star_fit.log`; class = log-log slope vs N: flat < 0.15, linear 0.15..1.15, super-linear > 1.15; 3 points where shown, otherwise 2, where R2 is trivially 1)

| metric | class | slope | R2 (log-log / linear) | points |
|---|---|---|---|---|
| station accepted ops (#2) | flat | 0.000 | 1 / 1 | 2 (16, 16); Visit #1 accepted is 15 at all 3 N |
| borrower accepted ops (#2) | flat | 0.000 | 1 / 1 | 2 (4, 4) |
| station refused ops (#2) | linear | 1.033 | 1 / 1 | 2 |
| station bytes downloaded, Visit #1 | linear | 1.038 | 0.9997 / 1.0000 | 3 |
| station Visit ms, #1 | linear | 1.032 | 0.9905 / 0.9988 | 3 |
| station objects fetched, #1 | linear | 1.035 | 0.9997 / 1.0000 | 3 |
| station comm-log DB bytes | linear | 0.921 | 1 / 1 | 2 |
| relay objects / bytes stored | linear | 0.963 / 0.975 | 1 / 1 | 2 |
| HQ fold ms | linear | 1.071 | 0.9993 / 0.9996 | 3 |
| HQ replies ms | super-linear | 1.963 | 0.9992 / 0.9944 | 3 |
| HQ enrol ms per device | per-unit grows (total ~ N^1.69) | 0.686 | 0.9571 / 0.9998 | 3 |
| Import POS Sales ms per ticket (cached, ex context) | per-unit grows (total ~ N^1.62) | 0.617 | 0.9290 / 0.9995 | 3 |
| ... last-round ms per ticket | per-unit grows (total ~ N^1.75) | 0.751 | 0.9679 / 0.9997 | 3 |
| Import Payment ms per slip | per-unit grows (total ~ N^1.75) | 0.748 | 0.9771 / 1.0000 | 3 |
| Replenish ms (one branch) | flat | 0.011 | 0.9997 / 0.8364 | 3 |
| Tenant Accounting ms | super-linear | 1.400 | 1 / 1 | 2 (10, 100 only) |

## Findings in the log that are not in the §45.2 list

1. **Login-context rebuild is 98.3 % of the shipped head-office ticket cost.** As shipped, one ticket costs 8,767 ms and calls `AdCallout.loginContext` 4.2 times (21 calls for 5 tickets) at about 2.07 s each (`§STAR-HQ-IMPORT` in `witness_scale_star_hq_shipped_10.log`: login_ctx_ms 43,481 of 44,482 ms in round 1). The query is the `IsDefault` loop at `erp/ad_callout.js:938-943`; the callers, from a one-ticket stack probe (`witness_scale_star_probe_loginctx.log`, a scratch probe of the same model layer, not a witness mode), are `ad_process.js:1149` (`pi.ctx || A.loginContext(...)`, three per ticket) and `model_order.js:738` via `ImportOrder.js:349` (two per ticket, one per line). The same 2 s is paid once by every other process run (Import Payment 422 ms per slip, Replenish 2,088 ms, Accounting 4,067 ms at N=10, each with one build). The browser caches a login context for callouts (`crud_overlay.js:377`); the process path does not pass `ctx`. This is why the "cached" variant exists. Lower-bound projection (not measured): 3,000 tickets as shipped = 26,302 s (`§STAR-H2-PROJECTION`).
2. **Head-office reply authoring is super-linear (slope 1.96).** 630 ms, 46.6 s, 5,313 s for 1x, 10x, 100x. At N=40 the split (`§STAR-HQ-REPLIES` in `witness_scale_star_profile_engine_40.log`, a profile run that is not in the point set) was 2.07 s for 40 movements + 4.33 s translating 80 loan ops + 0.05 s in `authorMany` + 0.24 s push (6.70 s in all): the cost is in the translate of DOWN rows, which at `erp/team_sync.js:262` calls `S.order()` per row; the product's own comment at `team_sync.js:193` says "S.order() refolds the whole log after every author", and the release pass avoids it with `relPersons`.
3. **Per-ticket import cost grows with what is already in the DB** (cached, batches constant within a point): N=1000 rounds 656, 1,199, 1,866, 3,238, 3,774 ms per ticket at 0 / 600 / 1,200 / 1,800 / 2,400 orders already in; N=100 rounds 156, 189, 248, 333, 389. First round on an empty DB, by batch size in one run: 6 tickets 177, 60 tickets 156, 600 tickets 656 ms per ticket (flat to 60, about 4x at 600). The harness path is `ws_kernel` (journal + apply) plus the shipped model layer; a browser run was not made.
4. **Enrolment** of the 2,000 devices cost the founder 1,816 s (908 ms per device at the end, per-unit slope 0.69). Set-up cost, not part of a day.
5. **The edge discards nearly everything it downloads.** Station accepted ops are 15 (own) at Visit #1 and 16 after head office answers, at every N; delivered is 200 / 2,000 / 16,981; so 92 % / 99.2 % / 99.9 % of the delivered ops are refused. Heads are small (about 512 bytes each, 201 at N=100), so the bytes are the bundles.

## Which §45.2 fix each metric triggers, and at which N

| Fix | Metric (arm) | Reading | Triggered? |
|---|---|---|---|
| **F1 per-device mailboxes** | E2: station bytes per Visit #1 are linear in N | 384 KB at N=10, 4.5 MB at 100, 45.8 MB at 1,000 (Visit 417 ms, 3.0 s, 48.3 s); steady Visit #2: 104 KB at N=10, 590 KB at 100 | **Yes, from the smallest point (N=10): not flat at any N measured.** Accepted stays 15-16 ops. |
| F2 relay sharding | relay objects / bytes per day | 44 / 404 objects, 0.67 / 6.4 MB at N=10 / 100; head office fetched 4,000 objects / 46.0 MB at N=1000. This harness's folder pipe has no ceiling, so the study §11 limit (provider limit) is not judged here. | Not judged (no limit to compare against). |
| **F3 several processors** | H2: day total vs stated budget 3,600 s | 15 s (N=10), 389 s (N=100), >= 12,646 s without accounting at N=1000 | **Yes, somewhere between N=100 and N=1000.** Log-log interpolation between the two totals (389 s, >= 12,646 s; slope >= 1.51) puts 3,600 s at about N = 430 or lower (a projection from two points). Largest parts at N=1000: Import POS Sales 6,440 s, replies 5,313 s. Note F3 divides ticket count, not the per-document constant of finding 1. |
| F4 head-office data volume | heap / DB bytes | cached heap peak 466 MB at N=1,000 (193 MB at 100); head-office comm-log DB 39.4 MB at N=1,000; model DB 30.1 / 33.0 MB at N=10 / 100 | **No at these N** (466 MB < 2,000 MB stated budget). The accounting run at N=1,000 did not finish inside the session, which is a time effect, not memory. |
| F5 edge working set | edge live (accepted) docs vs save-latency knee (2.9k mobile) | 16 accepted ops at every N | No. (The 39.4 MB / 17k-op comm log at the edge at N=1,000 is the F1 effect, not live docs.) |
| F6 tiny counter | no metric in this harness reads a linearizable need | none of the measured arms touches a shared spendable balance, gapless numbering, or a cross-channel stock promise | No metric; stays the owner's per §45.2. |

## Not measured, and why

- **N=1000 engine point is INCONCLUSIVE**: its reply authoring finished (5,313 s) after the 150-minute box, so Visit #2, the control, the scope-off mutant, relay stats, and the end-of-day heap were not run. Reached: enrol, produce (1,996 of 1,996 load generators, 16,966 ops, 0 errors), the four Visit #1, head-office Visit, all replies authored and pushed (1,000 movements, 1,000 loans, 1,000 instalments). E1 at N=1000 rests on Visit #1 only (15 accepted).
- **Tenant Accounting Processor at N=1000** had not answered when the measurer stopped the run at 11:56 local, about 85 minutes after its replenish line was first seen (the log says so: `§STAR-STOPPED`). Its cost at N=10 / 100 is 9,984 / 250,794 ms for 191 / 1,811 documents (52 / 138 ms per document); no N=1000 figure is given.
- **Complete ms per order** is not separable: the order's Complete runs inside Import POS Sales / Import Orders (DocAction CO); no standalone hook exists besides the process. Reported instead: whole-ticket ms and a per-invoice copy + Complete micro (22-48 ms).
- **Replenish for N branches**: only one destination branch (the pilot warehouse 103 with the twin-only source-warehouse fixture of `witness_replenish_diff.js` M1) was run; 74-78 ms cached, 2,088 ms as shipped. A day's N-branch total is not measured.
- **As-shipped variant at N=100 and N=1000** was not run (a ticket costs 8.8 s as shipped; 3,000 would be about 7 hours). The "shipped" figures are N=10 only.
- **Browser timings, relay latency, a real GitHub / OCI pipe, and the tiny counter** are outside this harness.
- Visit #1 of the sampled edges happens in sequence, so a later sampled edge sees the bundles of the earlier ones (3 objects of up to 4,000); the table averages the two stations / two borrowers.

## Reproduce

```
node scripts/witness_scale_star.js <bim-ootb> engine --n 100 --m 100 --workers 6 --budget-min 30 > build/scriptor/witness_scale_star_engine_100.log
node scripts/witness_scale_star.js <bim-ootb> hq --n 100 --m 100 --ctx-cache 1 --budget-min 60 > build/scriptor/witness_scale_star_hq_cached_100.log
node scripts/witness_scale_star.js <bim-ootb> fit build/scriptor/witness_scale_star_*.log
```
