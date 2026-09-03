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
