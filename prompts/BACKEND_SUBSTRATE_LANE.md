# ⚠ DO NOT REMOVE — Scope guard
# Lane: BACKEND / ERP substrate (event-sourced op-log, period-close, distributed durability). Distinct from the
#       UI+doc lane (prompts/UI_AND_DOC_LANE.md); shared files only erp/sw.js + erp/idempiere.html (see §SHARED).
#       Read the log after every run (exit code is NOT evidence). Honour until every item is ✅ DONE or ⛔ BLOCKED.
# NON-NEGOTIABLE: EXTRACT/COMPILE ONLY — never invent a number or an op. Spec-first, witness-led (each test NAMES
#       the issue it proves/disproves); whitebox §-log; deterministic on every fold/replay path (ids/ts/balances
#       are recorded INPUTS, no Date.now()/Math.random(); balances INTEGER CENTS). build/erp/ is the source of
#       truth ([[feedback_erp_source_of_truth]]); per-env copies sync FROM it.
# Read first: memory [[project_erp_sync_fsm]] (the WHOLE substrate arc + Phase 0/1/2A DONE lines) +
#       prompts/ERP_SUBSTRATE_INTEGRATION.md (the frozen contract + the phase ledger) + docs/ERP.md /
#       docs/HolyGrail.md §"hard parts" / docs/DistributedERP.md.

---

# Backend substrate lane — continue to zero

## State at handoff (2026-06-08) — Phase 0/1/2A all green
- **Phase 0 §INTEG-COLLAPSE** — ONE canonical `kernel_ops.js` (v8 + deterministic `ts` fold) is on bim-ootb
  `main` (#195, auto-merged). 10/10 app + 5/5 substrate witnesses green. Pre-collapse copies archived
  `build/erp/_archive/kernel_collapse_2026-06-08/`.
- **Phase 1 §INTEG-POSTINGS-RECONCILE + §INTEG-SIGNER-REUSE** — `erp_period_close.foldBalances` extended
  (additively) to fold the app's REAL double-entry `POST {lines:[{account_id,amtacctdr,amtacctcr}]}` ops; tip
  signed via the app `erp_signer.js`. Witness `scripts/test_integ_postings_reconcile.js` (W-POSTINGS-RECONCILE)
  🟢 maxDiff=0c; frozen synthetic `scripts/test_kernel_period_close.js` still 🟢.
- **Phase 2 slice A §INTEG-WIRE** — period-close IN-APP on glassbowl.html's live sidecar op-log
  (`period_close_ui.js` window.PeriodClose). Witness `bim-ootb/erp/tests/poc_period_close_wire.js` 🟢 6/6.
  Landing via **PR #197 → main** (verify it merged; sw v600 is the deploy switch).

## ⚠ UNCOMMITTED in this repo (bim-compiler) — COMMIT FIRST (source of truth)
These engine edits are on the `feat/revit-plus-lens` working tree, NOT yet committed:
- `build/erp/kernel_ops.js` — the deterministic `ts` 7th param folded into commitOp (Phase 0 reconcile-forward).
- `build/erp/erp_period_close.js` — POST-shape fold (Phase 1).
- `build/erp/period_close_ui.js` — synced copy of the app module.
- `scripts/test_integ_postings_reconcile.js` (+ `build/erp/test_integ_postings_reconcile.log`) — the W-POSTINGS witness.
- `build/erp/_archive/kernel_collapse_2026-06-08/` — the archived pre-collapse kernels + README.
Commit these to a backend branch (NOT mixed with UI/doc). `git add` specific files (never -A). Re-run
`node scripts/test_kernel_period_close.js` + `node scripts/test_integ_postings_reconcile.js` → both 🟢 before commit.

## OUTSTANDING (work top-to-bottom to zero)

### §B-1 — commit the uncommitted engine source-of-truth (above) + verify witnesses green.
✅ DONE (2026-06-08, commit `3d9e07d1` on branch `feat/erp-substrate-phase012`). Staged only the specific
files (never -A): kernel_ops.js, erp_period_close.js, period_close_ui.js, scripts/test_integ_postings_reconcile.js,
_archive/kernel_collapse_2026-06-08/. The witness `.log` is .gitignored (regenerable artifact) — left untracked.
Pre-commit compile gate passed. Witnesses re-run green BEFORE commit:
`node scripts/test_kernel_period_close.js` → 🟢 ALL PASS (period-close fold = signed checkpoint = balance b/f);
`node scripts/test_integ_postings_reconcile.js` → 🟢 ALL PASS (A1-A4 + B1-B3 falsifier, maxDiff=0c, balSum=0,
app-signed+verified). NOT pushed (backend branch local; user merges/deploys).

### §B-2 — Phase 2 candidate B: disposable-host persistence (the W-PERSIST / 3-host replica story) — IF user wants
The user picked slice A first; B was deferred. Wire the live op-log to spill to a SIGNED replica the user owns,
recoverable on a fresh device. Substrate already exists (`erp_replica_client.js` / `erp_snapshot_sign.js` /
`gen_replica_snapshot.js`, witnessed W-REPLICA/W-SIGN). Slice: from the glassbowl/erp surface, export+sign the
op-log snapshot to a user channel; on a fresh load, fetch+replay+verify (recompute tip == signed tip). Witness it
whitebox before any UI. ⛔ Confirm with the user this is the next slice (vs stopping at A).
✅ DONE (2026-06-08, user said "proceed B2"; commit `90d12e41` on `feat/erp-substrate-phase012`). Witnessed
WHITEBOX before any UI: `scripts/test_persist_slice.js` (W-PERSIST-SLICE) → 🟢 ALL PASS (8/8). Composes the
FROZEN substrate (erp_replica_client replay+failover + erp_period_close.foldBalances + canonical kernel) with the
REAL app POST ops (§INTEG-POSTINGS shape) and the REAL app signer (`~/bim-ootb/erp/erp_signer.js`,
§INTEG-SIGNER-REUSE) — the key the USER owns, NOT erp_snapshot_sign's demo pinned key. No engine re-open; export
is an inline helper (UI lane picks the export surface later). Proves: S1 export signed by user's own key · S6
disposable-host failover · **S2 zero-state fresh device recomputes tip === signed tip** · S3/S3b books recovered
to the cent (recovered==live==hand-computed, maxDiff=0c) · S4 ownership verifies under the user's PUBLIC key alone
(no private key) · **S5 FALSIFIER: forger self-consistifies the tip but the user-key signature REJECTS it**. Log
`build/erp/test_persist_slice.log` (.gitignored, regenerable). NEXT (UI lane, when user says "deploy"): wire the
export+recover gesture onto the glassbowl/erp surface + §INTEG-FRESHNESS — NOT this backend lane.

### §B-3 — deferred substrate infra (OUT OF SCOPE until a real multi-writer need): relay on real compute
(Functions/CF Worker) + sig-verify at `/push` + https; incremental rebase (`?after=N`). No UI depends on these.
Do NOT build speculatively — note only.

### §B-4 — doc gate: HolyGrail.md §"hard parts" still describes compaction/period-close as prose; update to point
at the now-EXECUTABLE witnesses ONLY when the user says "deploy doc" (held).

## §SHARED — coordination with the UI lane
Only `erp/sw.js` (CACHE_VERSION magnet — take HIGHER, keep BOTH precache lists) + `erp/idempiere.html` are shared.
Backend slices touch period_close_ui/kernel/erp_period_close (separate). Work bim-ootb changes in a `/tmp/wt-*`
worktree off FRESH `origin/main` (never the shared tree — hook-blocked); let auto-merge land PRs but VERIFY (the
github-actions bot squash-merges in seconds — a late push orphans commits; start follow-ups off fresh origin/main).

## Done = §B-1 committed+green; §B-2 decided (and witnessed if taken); §B-3/§B-4 noted/held. # DONE ledger per item.

---

## §MULTIHOST_WITNESS 2026-09-03 — the standing multi-way sync proof (W-MULTIHOST-SYNC)

**User directive, quoted (2026-09-03):** *"we have a multi-user relay mechanism plan to overcome the
absence of an app server, written down, tested, and should come into play a black box WITNESS log to
proof our system can synch multi way between this machine and GH with OCI in diff roles. Such test was
done before, and should be upgraded to run whenever network ability is touched in the core."*

The question this lane exists to answer, in the user's words: **"Is this real? Will this hold and
scale? Are there any show stoppers to an enterprise user eventually?"** A witness that runs once and
is quoted for three months cannot answer that. This one runs on a trigger.

### §MH.0 — ⚠ THE TABLE BELOW IS WRONG. Read the CORRECTION under it before quoting anything here.
*(Heading rewritten 2026-09-03 after the witness disproved the section. Original heading: "measured
2026-09-03, before writing a line of it. The prior proof has DECAYED." Kept, not deleted, because the
mistake is more instructive than the conclusion was.)*
The 3-host convergence claim on record (`project_erp_sync_fsm`, W-REPLICA: *"LIVE on dev … all 3 up,
identical tip, 0 errors"*) is **no longer true as stated**. Probed directly today:

| host | URL | today |
|---|---|---|
| GH raw | `raw.githubusercontent.com/red1oon/BIMCompiler/mock/relay-snapshot/relay_snapshot.json` | **200**, 1,750 B, 5 ops, carries `tip`/`sig`/`alg`/`signed_by` (the W-SIGN shape) |
| OCI dev | `…/b/bim-ootb-dev/o/sandbox/erp/relay_snapshot.json` | **404** |
| OCI dev (the POC page itself) | `…/o/sandbox/erp/replica_poc.html` | **404** |
| OCI live | `…/b/bim-ootb-live/o/sandbox/erp/relay_snapshot.json` | **404** |

**So the three-origin proof is a two-origin proof today** (GH + local), and nothing detected the loss.
This is the same decay class as the whole `W-ERP-TWIN` finding — an instrument that stopped covering
its subject while continuing to be cited. Consistent with §U-4 in `prompts/AGENT_QUEUE.md` (the OCI
sandbox generally 3.5 months stale). **Do not re-state the 3-host claim until this witness re-earns it.**
> **⚠ CORRECTION 2026-09-03T03:21Z (measured by `witness_multihost_sync.js` §PRE_STATE, and again inside the
> 03:34Z run):** the OCI-dev 404 rows above do NOT reproduce. `…/b/bim-ootb-dev/o/sandbox/erp/relay_snapshot.json`
> answers **200**, 1,750 B, `last-modified 2026-06-07T02:10:38Z`, md5 `bd1e92ba` — byte-identical to GH raw and to
> the controller copy; `replica_poc.html` is 200 too, and the whole June-7 `sandbox/erp/` set (12 objects) is intact
> in the bucket listing. Only **OCI-live** is 404, and it always was (the POC was published dev-only —
> `project_erp_sync_fsm`). So the decay was not "a host lost the object" but "nothing re-measured for 3 months" —
> which is exactly what §MH.3's gate now closes. The two-host statement is withdrawn; three hosts were serving
> identical bytes, and until this witness nobody could prove it.
>
> **ROOT CAUSE of the wrong rows — the coordinator probed the wrong OCI tenancy.** The 404s came from
> namespace `axol6nvzzobs` in region `ap-singapore-1`; the project's real bucket is namespace
> **`ax3cp6tzwuy2`** in region **`ap-kulai-2`** (`witness_multihost_sync.js:48-49`). A wrong-tenancy URL
> returns a perfectly ordinary 404, indistinguishable from a deleted object, and it was then written into
> a spec and briefed to an agent as fact. Re-verified by the coordinator after the run: all four
> `axol6nvzzobs`/`ap-singapore-1` paths 404, while `ax3cp6tzwuy2`/`ap-kulai-2` `sandbox/erp/relay_snapshot.json`
> is **200 / 2,284 B** and its `stale/` sibling **200 / 1,789 B**. **Always take the OCI namespace and region
> from `deploy/OCI_UPLOAD.md` or a shipped constant — never assemble an object URL from memory.**
> This is the third instance today of the same failure shape: a check whose *instrument* was wrong reported
> a defect in its *subject* (cf. the 28-commit-stale `~/bim-ootb` checkout, and grepping the minified
> deployed `sw.js` with a source-form pattern).


### §MH.1 — what is architecturally settled, and must NOT be re-litigated
Static hosts **STORE + SERVE**; readers **replay deterministically**; only **multi-writer sequencing**
needs the one compute relay. "Writing" to a static host = the owner replaces the snapshot blob (OCI
authenticated `put` / `git push`). Recompute-tip catches corruption; only the **signature** catches a
forger who self-consistifies the tip. That is the doctrine — the witness proves it holds, it does not
redesign it.

### §MH.2 — the claim (W-MULTIHOST-SYNC). Black-box, over the real network, roles rotated.
Six arms, each asserting a number, each with a falsifier:
1. **PUBLISH** — this machine generates and signs a snapshot, publishes it to GH and to the OCI **dev**
   bucket. Assert both fetch back byte-identical to what was published.
2. **CONVERGE** — a zero-state reader fetching from each host *independently* recomputes the same tip,
   and it equals the signed tip. Assert `tip` equality across hosts and `len`, not "no error".
3. **ROLE ROTATION** — the ask's "diff roles": each host takes a turn as the SOLE reachable source with
   the others blocked. Assert convergence in all three rotations, so no host is secretly load-bearing.
4. **FAILOVER** — with one host returning 404 (today's real condition, so this arm is not synthetic),
   the client still resolves and converges from the survivors.
5. **TAMPER** — a mutated snapshot served by one host is REJECTED under the **pinned** controller pubkey
   (pinned out-of-band in the module, never read from the snapshot), and the reader falls back to a good
   host rather than adopting the forgery. Assert both halves.
6. **FRESHNESS** — a host serving an OLDER tip is detected as stale, not silently preferred. This is the
   arm the old POC never had, and it is the one that would have caught §MH.0.

**Vacuity guard:** an arm whose population was empty prints `VACUOUS`; a run where a host was
unreachable for reasons outside arm 4 prints `INCONCLUSIVE`, never PASS. A green log with `hosts=1` is
a §CRISIS-class defect, not a pass.

### §MH.3 — the trigger. This is the half that makes it standing rather than a one-off.
A gate, modelled on `scripts/check_erp_twins.js` (which already proved this shape works): declare the
**network core** — the modules whose change can alter sync behaviour — and fail when any of them has
changed since the last recorded W-MULTIHOST-SYNC run. Starting set, to be confirmed from the tree, not
assumed: `erp_relay_client.js`, `erp_relay_server.js`, `erp_replica_client.js`, `erp_sync_fsm.js`,
`erp_sync_relay.js`, `erp_snapshot_sign.js`, `erp_persist_ui.js`, `kernel_ops.js`, plus the snapshot
generator `scripts/gen_replica_snapshot.js`. Record the run as `{content-hash of each core file, tip,
utc}` so the gate is content-keyed and a stale pass is impossible — the same reason `cache_4d_run.js`
keys on file content.

### §MH.4 — the showstopper register, kept honest and re-measured, not asserted once
Re-verified in the shipped source 2026-09-03 (`build/erp/erp_relay_server.js`): `_accept()` dedupes by
`op_uuid` and appends durably, and **that is all it does** — grepping the server for
`authorization|bearer|token|verify|sig` returns **nothing**. So, stated plainly for the enterprise
question:
- **S-1 · the relay is unauthenticated and undeployed.** `POST /push` accepts from anyone who reaches
  the URL, with `Access-Control-Allow-Origin: *`. A forged op still cannot pass client-side
  verification — but the endpoint can be flooded. No relay runs on real compute anywhere today, so the
  live product is effectively **single-writer-per-device + signed snapshot exchange**, not multi-writer.
- **S-2 · plain HTTP.** `http.createServer`, so TLS must be terminated by the host; an https page
  talking to an http relay is mixed-content blocked outright.
- **S-3 · key custody sits on end-user devices.** The doctrine's own honest admission applies: a
  key-holder's lie must be told consistently across all books → caught at the count, not by crypto.
- **S-4 · browser storage is not encrypted at the app layer** — it relies on OS-level disk encryption.
These are the four an enterprise buyer will ask about. Each needs a measured status line here every
time this witness runs, not a one-time paragraph.
**Measured status lines, 2026-09-03T03:34Z — re-measured by every W-MULTIHOST-SYNC run (`§MH4` lines in
`build/erp/witness_multihost_sync.log`), never restated by hand:**
- **S-1 · POINTER.** Owned by §RELAY_AUTH (another agent, `build/erp/erp_relay_server.js`); its measured status is
  §RA-RESULT. This witness does not measure it. Note: that file is in the network core, so the moment the
  §RELAY_AUTH change lands the gate goes red until one witness run re-earns it — by design.
- **S-2 · plain HTTP, and no relay ships.** `http.createServer` at `erp_relay_server.js:66`, `https`/`tls` requires
  = 0; shipped `erp_sync_relay.js` default URL = null, `https:` scheme refs = 0, shipped `erp/*.js` files carrying a
  relay URL = 0. → TLS must be terminated by the host; an https page → http relay is mixed-content blocked; and
  since no relay URL ships, the live product today is **signed-snapshot exchange, single writer per device**, not
  multi-writer.
- **S-3 · key custody at the edge.** Shipped `erp_signer.js`: custody `idb-nonextractable`, `extractable=false`;
  the controller private key on this device = 206 B, gitignored; the verifier pins the controller pubkey
  `fPaLtHSA…` in-module (never from the snapshot — arm 5 proves an embedded key is ignored); roster
  `erp_key_epochs.js` has ROTATE and REVOKE. → keys never leave a device; a key-holder's consistent lie is caught
  at the count, not by crypto (the doctrine's own admission stands).
- **S-4 · no app-layer encryption at rest.** Shipped `erp/*.js` opening IndexedDB = 7
  (`crud_overlay, erp_signer, kanban_host, kernel_ops, plugin_overlay, system_monitor, tests/poc_client12_resident`);
  app-layer cipher refs (`AES-GCM|SQLCipher|subtle.encrypt`) = 0. → op-log and keys rest in IndexedDB relying on
  OS disk encryption.


---

### §MH.5 — instrument design, written before the code (2026-09-03)
Roles, per run (`scripts/witness_multihost_sync.js`, log `build/erp/witness_multihost_sync.log`):

| host | base | role(s) it plays |
|---|---|---|
| `here` | a real `http://127.0.0.1:<port>` origin serving `build/erp/` | publisher · sole source (arm 3) · **forger** (`/tamper`) · **stale** (`/stale`) · fork control (`/fork`) |
| `GH` | `raw.githubusercontent.com/red1oon/BIMCompiler/mock/relay-snapshot` | replica · sole source · survivor |
| `OCI` | `…/b/bim-ootb-dev/o/sandbox/erp` | replica · sole source · survivor · **stale** (`stale/relay_snapshot.json`, a second real stale host) |
| `OCI-live` | `…/b/bim-ootb-live/o/sandbox/erp` | arm 4's dead host — a **real 404** (never published there; `deploy/live` untouchable), not a closed port |

- **Epoch model.** A run does not regenerate a fresh chain (that would make "older" undecidable — two
  unrelated 5-op chains have equal `len`). It EXTENDS the last published chain by ONE real double-entry
  `POST` op (AR dr 1200.00 / Revenue cr 1200.00, `ts` = the run's recorded utc — no `Date.now()` in the
  fold path), re-seals under the canonical `build/erp/kernel_ops.js`, signs the tip with the controller key.
  The previous epoch is therefore a strict op_uuid PREFIX of the new one, so arm 6's "older" is decidable
  by `len` + prefix — exactly what the old POC could not express. One op per run; a run happens only when
  the gate demands it. Books are asserted too (`erp_period_close.foldBalances`, cents), not only the tip.
- **Publish mechanics.** GH = Contents API PUT on the branch (the owner's `git push`); byte identity is
  asserted at the immutable commit URL at once and at the branch URL after CDN propagation (measured
  `cache-control: max-age=300`) — the propagation seconds are a reported number. OCI = GET+diff the target
  first (OCI_UPLOAD.md rules 1/3), `oci os object put --content-type application/json` (rule 7), fetch-back md5.
- **Reader** for arms 2-6 = the frozen `erp_replica_client` (`fetchSnapshot/fetchAll/resolve/replayAndVerify`)
  plus a pure JUDGE in the witness that classifies each `fetchAll` entry CURRENT / STALE / DIVERGENT /
  TAMPERED / UNREACHABLE: the longest verified chain wins, a shorter valid chain must be a prefix of it
  (else DIVERGENT), a fork at the head is adopted only with a strict majority of valid hosts. The judge is
  the instrument; the shipped `resolve()` is first-reachable-wins and has no freshness logic — that fact
  is measured and reported in §MH-RESULT, not papered over.
- **Blocking** for arm 3 = a fetch interceptor installed BEFORE the client binds `fetch` (it captures it at
  require time); negative control asserts "all blocked → `all hosts unreachable`", so a guard that failed to
  block cannot pass the arm.
- **Tamper** = a self-consistified forgery (op mutated, tip recomputed with the same kernel) signed by a
  forger key whose pubkey is EMBEDDED in the snapshot. Two halves asserted: an embedded-key reader WOULD
  accept it (`verifyTip` under the embedded key = true), the pinned reader rejects it and adopts the next
  good host; plus a structural check that the client calls `verifyTip(tip, sig)` with no key argument.
- **Verdict structure.** The PASS marker is printed only inside `hosts_up === 3 && every arm PASS`.
  Anything else is FAIL (exit 1) or INCONCLUSIVE (exit 2, a host unreachable outside arm 4, a publish that
  could not be authenticated, propagation past the cap). VACUOUS if the population is empty. The run
  record `scripts/multihost_run.json` is written on PASS only, so a failing run can never refresh the gate.
- **Gate** = `scripts/check_multihost_gate.js` over `scripts/multihost_core.json` (bim-compiler paths hashed
  from the working tree, bim-ootb paths from the `origin/main` blob as `check_erp_twins.js` does, plus the
  instrument itself). Exit 0 same / 1 changed-or-missing-or-never-run / 2 vacuous manifest.

## §MH-RESULT 2026-09-03 — W-MULTIHOST-SYNC first PASS (6/6 arms, hosts 3/3) and the gate proven by falsifier

**Branch `feat/multihost-witness` (bim-compiler), commits `4ab0eb42a` → `0b567457e` + this doc commit; no PR (parent's call).**
Files: `scripts/witness_multihost_sync.js` (the witness) · `scripts/check_multihost_gate.js` (the trigger) ·
`scripts/multihost_core.json` + `scripts/multihost_core.js` (the declared network core, 13 files + 3 instrument files,
one shared hasher) · `scripts/multihost_run.json` (the content-keyed record, written on PASS only) · logs
`build/erp/witness_multihost_sync.log`, `build/erp/check_multihost_gate.log` (both committed as evidence) ·
`build/erp/relay_snapshot.json` (the controller copy, now epoch 6). Run: `bash build/erp/run_witness.sh scripts/witness_multihost_sync.js`
(≈5 min, of which 301 s is GitHub's CDN) · gate: `bash build/erp/run_witness.sh scripts/check_multihost_gate.js` (<3 s).

**The run, 2026-09-03T03:34:11Z (`§SUMMARY hosts_up=3/3 … checks_failed=0 inconclusive=0 ms=307948`):**

| arm | status | the numbers (from the log, not restated) |
|---|---|---|
| 1 PUBLISH | PASS | epoch 5→**6**, len 6, tip `55a01c1a7fd4`, one real POST op (AR dr / Revenue cr 1200.00, `ts` = run utc). **GH** Contents-API put 1,738 ms → commit `6464b89f78`; commit-URL byte-identical at once; branch-URL **propagation 301 s** (CDN `max-age=300`). **OCI dev** GET-before md5 `bd1e92ba` (Jun-7) → put 1,430 ms → after: md5 match, `content-type: application/json`, etag `c9420d8a…`, last-modified 2026-09-03 03:39:16 GMT; stale-role object `stale/relay_snapshot.json` put + fetched back. hosts_published **3/3** |
| 2 CONVERGE | PASS | 3/3 zero-state readers → tip `55a01c1a7fd4`, len 6, sigValid true; **books** `{101:+120000c, 400:−120000c}` on here/GH/OCI, cross-host maxDiff **0c**, vs independent oracle **0c**; replay 31 / 30 / 83 ms |
| 3 ROTATION | PASS | 3/3 sole-source rotations (`here`, GH, OCI each with the other two blocked) resolved to the intended host and converged; negative control all-blocked → `all hosts unreachable` (the guard really blocks) |
| 4 FAILOVER | PASS | dead host = **OCI-live, real HTTP 404** (never published there); 3/3 orderings resolved to the first survivor (here, GH, OCI in turn), survivors 3/3, tip equal |
| 5 TAMPER | PASS | forgery: posting 1200→999999, tip self-consistified with the same kernel, re-signed by a forger key **embedded** as `pubkey`. Embedded-key verify = **true** (an embedded-key reader would be fooled); pinned reader: recompute match = true (naive check fooled), sigValid **false**, ok **false**; reader adopted **GH**; structural: the client calls `verifyTip(tip, sig)` with no key from the snapshot |
| 6 FRESHNESS | PASS | epoch-5 snapshot served by `here/stale` **and** `OCI stale/`: both classified **STALE** (len 5 < 6, op_uuid prefix); adopted GH len 6; fork control (same len, different controller-signed tip) → **DIVERGENT**, QUORUM 2/3 adopted the published tip |

Structural guards held: hosts_up is counted from the post-publish CONVERGE arm; the PASS marker exists only inside the
`hosts_up === 3` branch; a run that is INCONCLUSIVE (exit 2) or FAIL (exit 1) writes no record, so it cannot green the gate.

**Gate falsifier (`W-MULTIHOST-GATE`):** A — before any recorded run → **FAIL** (`core=16 unrecorded=16 record=none`).
B — after the PASS → **PASS** (`same=16`). C — append one comment line to `scripts/gen_replica_snapshot.js` →
**FAIL** naming it (`CHANGED bim-compiler:scripts/gen_replica_snapshot.js 047e8798 → 2ad9b38c`); `git checkout` it back
→ **PASS**. Content-keyed: mtime is irrelevant, bim-ootb files are hashed from the `origin/main` blob.

**For the enterprise question, in the user's three parts:** *Is it real* — yes, measured: one signed snapshot from this
machine, read back over the real network from GitHub and OCI in every role, converges byte-, tip- and book-identical on
a zero-state device. *Will it hold* — the gate: any edit to the 13 network-core modules turns it red until a fresh run
re-earns it; it cannot be quoted stale. *Show stoppers* — §MH.4's measured lines: S-1 → §RA-RESULT; S-2 means the
shipped product is single-writer-per-device + signed exchange (multi-writer needs a TLS relay on real compute, none
ships); S-3/S-4 are custody/at-rest facts an enterprise buyer must accept or fund.

**Findings and open items (none blocking):**
1. **Frozen `erp_replica_client.resolve()` is first-reachable-wins.** Measured in the naive controls: it adopted the
   forgery host (`§TAMPER_CAVEAT`) and the stale host (`§FRESH_CAVEAT`); rejection happens only at `replayAndVerify`,
   freshness only in the witness's judge. The judge (~25 lines, `judge()` in the witness) is the candidate
   `resolveFreshest()` — not added, the module is frozen and NO-SHIP (bim-ootb has no `erp_replica_client.js`; PR #203
   never merged). Parent's call.
2. **The gate goes red the moment §RELAY_AUTH lands** (`erp_relay_server.js` is core). Re-earn = one run, one op.
3. **Twins gate stays at `unreviewed=0`**, but reports 3 **BROKEN** pairs — `ad_evaluator`, `crud_core`,
   `crud_overlay` — shipped side moved at bim-ootb `7168054e` (2026-09-03 11:39 +0800), the copies on this branch are
   unchanged since base and none is referenced by this lane's files. That is the AD-UI lane's forward-port.
4. Each run appends one POST op to the mock chain (GH + OCI dev are now len 6); the shared checkout's
   `build/erp/relay_snapshot.json` stays at epoch 5 until this branch merges (the judge would read it STALE — harmless).
5. OCI `sandbox/erp/replica_poc.html` (200) still loads the June-7 module copies; out of scope (the leg = the snapshot).

## §RELAY_AUTH 2026-09-03 — close S-1. Roster-verified `/push`, no new crypto, no new secret.

**User directive (2026-09-03):** *"build the relay auth so S-1 stops being a showstopper."*

### §RA.0 — state S-1 precisely, because the wrong fix follows from the wrong statement
S-1 is **not** a forgery hole. A forged op already cannot pass client-side verification — the reducer
verifies on replay, and that property is what makes the relay safely untrusted. S-1 is an
**availability** hole: `_accept()` (`build/erp/erp_relay_server.js`) dedupes by `op_uuid` and appends,
and nothing else — grep of the server for `authorization|bearer|token|verify|sig` returns **nothing**,
with `Access-Control-Allow-Origin: *`. So **anyone who reaches the URL can fill the log**: storage
exhaustion, and a snapshot every honest reader must then download and replay past.
**Therefore the fix is an admission gate, and it must not be mistaken for making the relay trusted.**
The relay stays a dumb facilitator. Clients keep verifying. Nothing about §MH.1 changes.

### §RA.1 — the mechanism is already in the tree. Do not design a new one.
Every piece exists and is witnessed; this is assembly:
- Ops already carry `op_hash` + `sig` (W-SIGN, ECDSA P-256, `kernel_ops.js:22-23`) and a `signed_by` kid.
  A **v2** row's sig attests the CONTENT hash (`KernelOps._contentHash`), so it survives a merge/renumber;
  a v1 row's sig attests `op_hash`.
- `erp_key_epochs.js` is **already the T1 trust root** and already answers "who may write": a signed
  `{devices: {device_id → pubJwk}, genesisKid}` roster, **HQ-signed under a PINNED key** (the
  `erp_snapshot_sign.PINNED_PUBKEY` pattern — the verifier trusts the pinned key out-of-band and NEVER a
  key carried inside the payload). It models ROTATE (counter-signed by the outgoing key) and REVOKE
  (future ops dead, past ops stay valid — they really were authored). Witnessed: W-ROSTER-VERIFY,
  W-ROTATE, `scripts/poc_rotate.js` (`§ROTATE-OP/§HISTORY-VALID/§FUTURE-GATED/§REVOKE`).
- `erp_snapshot_sign.verifyTip(tipHex, sigHex, pubJwk)` is the P-256 verify primitive.

**So: `/push` admits an op iff its `signed_by` kid is ACTIVE at that point in the roster, not revoked,
and its signature verifies.** No shared secret to distribute, no bearer token to leak, no second trust
root to keep in sync — a shared secret would have been a NEW invented mechanism sitting beside the
roster that already exists, and it would not survive key rotation.

### §RA.2 — ordering matters, or auth just trades one DoS for another
ECDSA verification is CPU-expensive; an attacker flooding well-formed-but-invalid signatures would
simply move the exhaustion from disk to CPU. The gate is therefore **layered, cheapest first**, and each
layer must reject before the next runs:
1. **Body cap** — reject oversized bodies and requests over a max ops-per-push, before parsing.
2. **Shape check** — `op_uuid`, `signed_by`, `sig` present and well-formed; reject on absence.
3. **Roster membership** — `signed_by` present in the verified roster and active/not-revoked. A map
   lookup, no crypto.
4. **Dedup by `op_uuid`** — already implemented; keep it BEFORE verification, since a replayed op is
   the cheapest possible rejection.
5. **Signature verification** — last, only for ops that survived 1-4.
Verification results are cacheable by `op_uuid`; an op already verified is never re-verified.

### §RA.3 — the claim (W-RELAY-AUTH). Every arm needs a falsifier that actually fires.
1. **ADMIT** — an op signed by a roster-active kid is accepted and appears in `/snapshot`. Assert the
   accepted count and that the op is readable back, not "no error".
2. **REJECT-UNSIGNED** — an op with no `sig`/`signed_by` is refused; assert the log length is
   **unchanged**, not merely that a 4xx came back.
3. **REJECT-UNKNOWN-KID** — a validly self-signed op under a key absent from the roster is refused.
   This is the arm that closes S-1: it is exactly the anonymous flooder.
4. **REJECT-REVOKED** — an op signed by a REVOKED kid is refused for FUTURE ops, while that kid's PAST
   ops still verify (the burn-not-reattribute model — do not break it).
5. **REJECT-TAMPERED** — a valid op whose parameters are mutated after signing fails verification.
6. **ORDERING** — prove §RA.2 empirically: an unknown-kid flood is rejected **without** reaching the
   ECDSA path (assert a verification-attempt counter stays flat), else the CPU DoS is still open.
7. **IDEMPOTENCE PRESERVED** — the existing `op_uuid` dedup and durable-append-with-replay-on-boot
   behaviour is unchanged; `test_kernel_relay.js` (W-RELAY: convergence, idempotency,
   durability-across-restart) must still pass **unmodified**.

**Vacuity guard:** a run where the roster was empty prints `VACUOUS`, never PASS — an empty roster
rejects everything and would otherwise look like a perfect gate.

### §RA.4 — what this does NOT fix. State it, so the register stays honest.
- **S-2 stands.** Still `http.createServer`; TLS is the host's job, and no relay runs on real compute
  anywhere, so this closes S-1 *in the code*, not *in production*. S-1 only truly dies when an
  authenticated relay is actually deployed and reachable over https.
- **S-3 stands** — roster membership proves a key signed, never that a human held it.
- **S-4 stands** — unrelated.
- The relay remains **untrusted by design**. This gate protects the relay's availability; it does not
  and must not become a source of truth clients rely on.

### §RA-RESULT 2026-09-03 — W-RELAY-AUTH 🟢 32/32 checks, 11 arms. S-1 closed IN THE CODE, still open IN PRODUCTION.
Commits (bim-compiler `fable/meshdb-livewire`): `95617ba6c` (server, WIP — committed by the coordinator mid-rate-limit),
`16ef0d98a` (server finding-fix + witness, VERIFIED). Files: `build/erp/erp_relay_server.js` (copy-only, no shipped
twin), `scripts/test_kernel_relay_auth.js`. Modules composed on and NOT modified: `erp_key_epochs.js` (verifyRoster),
`erp_snapshot_sign.js` (verifyTip), `kernel_ops.js` (_contentHash/_isV2) — W-ERP-TWIN still 🟢 0 unreviewed / 0 broken.
Run: `bash build/erp/run_witness.sh scripts/test_kernel_relay_auth.js` → `build/erp/test_kernel_relay_auth.log` (gitignored).

| arm | measured (from the log) | falsifier that fired |
|---|---|---|
| §RA-PIN | roster signed by a rogue HQ key → `listen()` throws `roster refused — roster signature invalid`; relay never starts | a non-pinned HQ |
| §RA-VACUITY | empty roster: valid member op → 403 `unknown_kid`, head=0; guard prints `VACUOUS` (devices=0), not PASS | an empty roster looks perfect |
| 1 ADMIT | A syncs via the REAL `FSM.rebase` → head=2, /snapshot=2, both rows verify under A.pub over the content hash, `signed_by`=A, A's chain still verifies; signed op = **521 B** | — |
| 2 REJECT-UNSIGNED | v1/unsigned row → 403 `not_content_signed`; signed_by-but-sig-stripped → 403 `shape`; **head 2→2, snapshot 2→2** | — |
| 3 REJECT-UNKNOWN-KID | X's 5 ops verify under X's own key (`selfVerify=true`) yet 403 `unknown_kid`×5; **head 2→2** — the anonymous flooder | X is validly self-signed |
| 4 REJECT-REVOKED | C op admitted (seq 3), A's REVOKE(C) admitted (head 4); C's next op 403 `revoked_kid`, **head 4→4**; C's past op still at seq 3 and verifies under C.pub | burn-not-reattribute kept |
| 4b ROTATE | B→B2 ROTATE admitted; B then 403 `superseded_kid`; B2 admitted (head 6) | outgoing key retired |
| 5 REJECT-TAMPERED | amount 100→100000 after signing → 403 `bad_sig`, verify_attempts 6→7 (reached ECDSA exactly once); identical re-push → attempts flat (failure cache); **head 6→6** | — |
| 5b V1-REPLAY | a v1 `(op_hash,sig)` copied onto a fresh op_uuid **DOES verify** (`verifyTip(op_hash)=true`) → refused at SHAPE, no ECDSA, head 6→6 | why v1 is refused, not verified |
| 6 ORDERING | 200-op unknown-kid flood → 403 `unknown_kid`×200, **verify_attempts 7→7 FLAT**; 501 ops → 413 `too_many_ops`; 1.2 MiB body → 413 `body_too_large` before parsing; whole-log re-push → skipped=6, attempts flat; head 6→6 throughout | CPU DoS would show as attempts rising |
| 6 residual | known-kid + garbage sig (kid is public in every snapshot): 50 ops → attempts +50, **~740 µs/op** (37 ms/50), head unchanged | stated, not hidden |
| 7 IDEMPOTENCE | `scripts/test_kernel_relay.js` md5 == committed blob (last touched `223894a83`/2026-09-02), child run exit 0 + `🟢 ALL PASS` (9 green) in **OPEN** mode; gated restart from JSONL replays head=6 + 2 control ops (revoked=1 superseded=1): C still refused, B still refused, B2 admitted | editing W-RELAY would have been a finding — it was not needed |

**As shipped.** `createRelayServer({roster, hqPub?, maxBody?, maxOps?})`: roster ABSENT → **OPEN** (pre-gate `_accept`,
byte-identical, logged `§RELAY_AUTH mode=OPEN — S-1 OPEN`); roster PRESENT → verified under the pinned HQ key at
`listen()` (unverifiable roster = refuse to start). Layers: cap (1 MiB / 500 ops ≈ 254 KB at 521 B/op; OPEN keeps the
old 50 MB guard) → shape (`_sigv:2`, `signed_by`, 128-hex sig) → op_uuid dedup → roster (unknown / revoked /
superseded) → ECDSA over `sha256('cs2|'+_canonicalV2)` LAST, bounded 10k `(op_uuid|sig)` failure cache. Admissible =
in roster ∧ not revoked ∧ not superseded (the N-writer `verifyMultiDeviceOps` model + erp_key_epochs' burn model);
REVOKE/ROTATE only ever REMOVE admissibility and are re-derived from the JSONL on boot against the CURRENT roster.
Response: `{accepted, skipped, rejected, reasons, head}`; 403 only when nothing in the push was admissible; `/health`
carries `auth:{mode, devices, verify_attempts, verify_ms, rejected_total, reasons}`.

**Findings (each changed the code or is recorded because it did not).**
1. **§RA.2's roster-before-dedup order is wrong by one slot and W-RELAY-AUTH caught it:** the literal order returned
   `skipped=4 rejected=2 {revoked_kid, superseded_kid}` for a re-push of the canonical log — ops already IN the log
   counted as refused. Every device's `rebase()` re-pushes its whole log, so after any REVOKE that inverts W-RELAY's
   idempotency contract, and a push of only canonical rows would 403 → `erp_relay_client._json` throws. Shipped
   dedup-before-roster (both O(1) lookups; verify still last, arm 6 unchanged).
2. **v1 rows are refused, not verified (§RA-5b):** a v1 sig attests a client-asserted `op_hash` the relay cannot recompute
   and that is not bound to `op_uuid`; a copied pair "verifies" and would re-open S-1. Only `_sigv:2` content-signed ops
   (the shipped `idempiere.html:861 setContentSigning(true)` path) are admissible.
3. **`user_tag` is not transmitted by the rebase push** (`erp_sync_fsm.js:179` SELECT omits it, so does
   `erp_sync_relay.pushRows`), so the relay hashes `actor:'local'`. Every witnessed op has the default tag; an op
   committed with a non-default `user_tag` would fail verification at the relay until the client sends it. Not fixed here
   (`erp_sync_fsm.js` SHIPS — a twin change belongs to a bim-ootb PR), recorded so the first real-app push finds it here.
4. **The default is still OPEN.** Flipping it would break W-RELAY (which pushes unsigned ops with no roster) — the very
   regression contract arm 7 protects. A deployment closes S-1 by passing a roster; the OPEN log line is the tell.
5. **Residual CPU cost is bounded per request, not per source:** ~740 µs per known-kid garbage sig, ≤500 per push.
   Per-source rate limiting is the reverse-proxy/host layer's job (S-2 territory), not invented here.

**§RA.4 restated — what this did NOT do.** No relay runs on real compute over https anywhere today, so **S-1 is closed
in the code only**; it dies in production when a gated relay is deployed and reachable over https (S-2 stands —
still `http.createServer`). S-3 stands (a roster proves a key signed, never that a human held it). S-4 stands. The
relay stays **untrusted by design**: clients verify on replay exactly as before; the gate is an availability control,
nothing about it is a source of truth (§MH.1 unchanged). The 3-host claim in §MH.0 is not touched by this work.

**Open decisions (not blocking delivery; each is a one-line change once decided):**
- ⛔ BLOCKED: should the relay's DEFAULT become gated (refuse to start without a roster)? That requires W-RELAY to be
  given a roster + signed ops, i.e. editing the regression contract — a user call, not this lane's.
- ⛔ BLOCKED: who may REVOKE whom in the N-writer relay? Shipped = any admissible roster kid (the flat generalisation of
  `erp_key_epochs.js:116` "signed by the active key"); the tighter alternative is self-revoke or `genesisKid` only.

---

## §RB 2026-09-03 — `rebase()` drops `user_tag`, so a non-default actor's signature dies on every sync

`AGENT_QUEUE.md §ERP-SESSION-CLOSE` NEXT item 4. Specced here BEFORE the code (Spec-First).

### §RB.1 THE DEFECT — verified by code read, `file:line` cited
`erp/erp_sync_fsm.js:179` selects, and `:186` re-inserts, exactly nine columns:
`op_uuid, timestamp, op_type, parameters, input_guids, output_guid, gid, branch_id, sig`.
**`user_tag` is not among them.** `kernel_ops.js:42` declares the column
`TEXT DEFAULT 'local'`, so every rebased row is silently rewritten to `'local'`.

That matters because `kernel_ops.js:_canonicalV2` (:240-249) signs `actor: op.user_tag` — a **v2
content-signed** row's signature attests its `user_tag`. `_sigBase` (:259) hands that content hash to
the verifier, and `sealChain`'s `if (_signer && !sig)` guard deliberately does NOT re-sign a row that
arrives with a sig intact. So after one rebase, a row committed by `user:bob` carries **bob's signature
over `actor:"user:bob"`** while the stored row now says `actor:"local"` → the content hash no longer
matches → **verification fails for every non-default actor**. Rows from the default `'local'` actor are
unaffected, which is exactly why this has never shown up: every witness to date commits as `'local'`.

This is the same class as the S7 fix the function's own docblock describes (`gid`/`branch_id`/`sig` were
being blanked by the rewind+reapply). `user_tag` was the one column that fix missed.

### §RB.2 THE FIX
Carry `user_tag` through the rewind+reapply, exactly as `gid`/`branch_id`/`sig` are — SELECT it, push it,
re-INSERT it, `COALESCE` to `'local'` only when the source row genuinely has none (so a pre-`user_tag`
log still rebases to the same bytes it does today). No kernel change: `sealChain` already reads
`user_tag` (:311) and hashes it, so the correct value simply has to be there when it looks.

### §RB.3 THE WITNESS — `W-REBASE-USERTAG`, arms that can each fail
Added to `scripts/test_kernel_rebase.js` (the function's existing witness), driving the REAL kernel +
the real sequencer stub, with a real ECDSA signer:
1. **PRESERVE** — a row committed with `user_tag='user:bob'` still reads `'user:bob'` after rebase.
   (Pre-fix this reads `'local'` — the falsifier is the defect itself.)
2. **SIG SURVIVES** — that row is v2 content-signed; `verifyChain` returns `ok` after the rebase.
   This is the arm that fails today.
3. **DEFAULT UNCHANGED** — a `'local'` row still rebases to `'local'` and still verifies, so the fix
   cannot be a no-op that merely stops asserting.
4. **NOT VACUOUS** — the test asserts the population it judged was non-empty and that at least one row
   carried a non-default actor; otherwise it prints INCONCLUSIVE, never PASS.

### §RB.0 (found while specing §RB) — three kernel witnesses had been dead since bim-ootb #88
`poc_kernel`, `test_kernel_owner`, `test_kernel_sign` all exited `MODULE_NOT_FOUND`: they required
`bim-ootb/viewer/{manifest.json,erp_replay.js,erp_signer.js}`, which **bim-ootb #88 (`9862d935`,
"ERP app gets its own /erp/ folder home — structural move") moved to `erp/`**. Same failure class as
`test_tour_idempiere`, fixed in the previous session. Repointed to `erp/`; all three now PASS:
```
§KERNEL PASS — apply+commit rich ops, violation BLOCKED, replay exact, frozen effects hold
§OWNER  PASS — merge is clash-free + holder-irrelevant; owner-gate and CAS reject the loser
§SIGN   PASS — wrong key fails, holder cannot forge, chain stays stable, custody reused across reloads
```
That drops the kernel-family's standing FAILs from **7 to 4**; the remaining four
(`poc_kds_live`, `poc_pos_live`, `poc_replenish_live`, `poc_wh_cache`) need a served app, not a path fix.

### §RB.4 RESULT 2026-09-03 — CLOSED. `W-REBASE-USERTAG` 4/4, falsifier-proven
```
§REBASE-USERTAG pre  actor=user:bob verifyChain=true nonDefaultRows=1
§REBASE-USERTAG post actor=user:bob localRow=local  verifyChain=true
🟢 PRESERVE · 🟢 SIG SURVIVES · 🟢 DEFAULT UNCHANGED · 🟢 NOT VACUOUS  → test_kernel_rebase ALL PASS
```
**On the pre-fix engine, 3 of the 4 go red and DEFAULT UNCHANGED correctly stays green:**
```
§REBASE-USERTAG post actor=local localRow=local verifyChain=false brokeAt=1 why=signature
🔴 PRESERVE (actor=local) · 🔴 SIG SURVIVES (verifyChain=false) · 🔴 NOT VACUOUS (len=undefined)
```
Regression: all 6 `erp_sync_fsm`-judging witnesses PASS (`poc_blackout_resume`, `poc_schema_version`,
`test_kernel_{sync,relay,rebase,relay_auth}`).
**Shipped:** bim-ootb **PR #1640** (`erp/erp_sync_fsm.js` + `erp/sw.js` v778→**v779**).
