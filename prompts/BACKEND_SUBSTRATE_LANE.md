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

### §MH.0 — measured 2026-09-03, before writing a line of it. The prior proof has DECAYED.
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
