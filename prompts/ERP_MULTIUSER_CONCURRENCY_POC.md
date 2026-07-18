# ⚠ DO NOT REMOVE — Scope guard
# Scope: the ERP engine's #1 remaining adoption gap (scored 3/10 in the 2026-07-18 session, see
#   docs/ERPUserGuide.md's maintenance appendix + that session's transcript): a REAL, DOCUMENTED,
#   DEPLOYABLE multi-user concurrency setup that a 10-user shop can adopt TODAY, without standing up
#   any dedicated server — deliberately choosing the low-tech transport path (email / social-DM /
#   a simplest file server) over the deferred real-compute relay, because that path needs ZERO new
#   infrastructure and stays true to the "no server to maintain" value proposition the rest of this
#   engine is built on. NOT started yet — assign to a dedicated session. Read the log after every run
#   (exit ≠ evidence) once implementation begins.
# USER DIRECTIVE (2026-07-19): "just put in one big feature needed if u agree — multi user concurrency
#   setup using options such as via email, or social media, or a simplest file server. Later can be
#   assigned to a dedicated session to setup its POC framework that can deploy right away to users
#   with full documentation." Agreed and recorded here — see §WHY THIS ONE below.

## WHERE THIS PICKS UP — read before touching anything
This is NOT a new invention. The transport idea is already proven at POC level; what's missing is
turning proven POCs into a shippable, documented FEATURE. Read these first, in order:
- `docs/DistributedERP.md` §5 (2026-06-14, bim-ootb PR #300) — POS "deliver later" already serializes
  a signed op-group to a base64 blob; the user pastes it into WhatsApp/email/SMS; the receiving device
  pastes it back and it replays into the IndexedDB sidecar. **"The social channel *is* the relay. No
  server, no sync protocol, no polling."** Witness: `scripts/poc_oplog_clipboard.js` (`§CL-SERIAL` +
  `§CL-UUID` idempotency + `§CL-DELTA`).
- `docs/DistributedERP.md` §14 "Per-node email-DR" — each node (store/HQ/vendor/phone) periodically
  emails *itself* a signed snapshot + deltas as its own cold-store recovery path. Witnessed by
  `poc_email_dr` + `W-POS-WAN-SCALE B6`.
- `docs/DistributedERP.md` §6 "How much central persistence? — a dumb async post office" — the general
  discipline both of the above instantiate.
- Memory `project_erp_sync_fsm` (§0.20 substrate, CONTRACT-FROZEN) — the kernel-side machinery this
  feature rides: `erp_sync_fsm.js` (schema-gate + chain-gate, `rebase()`), `erp_sequencer.js` (dumb,
  idempotent-by-`op_uuid` facilitator), the W-REPLICA 3-host read-replica mockup (GH+OCI+local, signed
  tip, tamper-detect), `erp_snapshot_sign.js` (ECDSA P-256 signed checkpoints). **The ONE item that
  memory names as explicitly deferred: "relay-on-real-compute + sig-verify-at-/push deferred (no UI
  dep)"** — i.e. a live, authenticated, always-on multi-writer sequencing relay was sandboxed
  (`erp_relay_server.js`) but never hardened or deployed, because static hosts (GH Pages/OCI buckets)
  **cannot run compute** — only serve/store blobs. That gap is explicitly OUT OF SCOPE here (see
  §WHY THIS ONE) — this card is about the transport options that need no compute at all.

## §WHY THIS ONE (my agreement with the user's call, recorded per Anti-Drift — cite the reasoning, not
just the verdict)
Scored honestly in the 2026-07-18 session: multi-user concurrency was the single lowest-scoring axis
(3/10) against a real "viable alternative to iDempiere/Odoo" bar — not because the substrate is weak
(it's contract-frozen and witnessed), but because nothing turns the proven POCs into something a real
10-user shop can actually pick up and run with, documented, today. Two paths exist:
1. **The real-compute relay** (deferred item above) — solves TRUE simultaneous concurrent writes, but
   needs a live server process (OCI Functions/CF Worker/VM) + auth + sig-verify-at-push, none of which
   exist yet. Building this FIRST would reintroduce exactly the "something to run and patch" cost this
   engine's whole maintenance-appendix pitch argues against.
2. **The low-tech transport path** (email / social-DM / simplest file server) — ALREADY proven at POC
   scale (clipboard/WhatsApp/email paste-back), needs zero new infrastructure, and is the honest,
   consistent next step: it doesn't solve TRUE simultaneous-conflict arbitration, but it DOES solve
   sequential/asynchronous multi-user handoff (one person's committed ops reach another person's device
   without a dedicated server) — which is the realistic day-to-day shape of a small shop's concurrency
   needs (a bookkeeper posts, a warehouse person picks, a manager reviews — rarely truly simultaneous
   writes to the SAME record).
Agreed: **pick path 2.** It is the one feature that most directly closes the 3/10 gap without
contradicting the engine's own "no server" differentiator, and it is buildable from parts that already
exist and are witnessed — not a research bet.

## THE ONE FEATURE (scope for the dedicated session — NOT started, do not begin without user go-ahead)
Build a **POC framework, with full documentation, deployable to real users immediately**, for
low-tech multi-user concurrency setup. Concretely:
1. **Generalize the proven clipboard pattern** (`poc_oplog_clipboard.js`) from POS-only ("deliver
   later") into a general-purpose "Send my changes" / "Receive changes" pair usable from ANY window in
   the app, not just POS — same signed-op-group blob, same idempotent-by-`op_uuid` replay.
2. **Offer a menu of transports for that blob, not just clipboard:**
   - **Email** — reuse the `poc_email_dr` pattern (already proven for self-recovery) generalized to
     "email this op-group to a teammate"; a mailto: link or a small server-less email-relay pattern
     (e.g. the blob as an attachment/body, opened+applied via the same paste-back UI).
   - **Social/messaging** — already proven (WhatsApp/SMS paste-back); extend the UI affordance beyond
     POS so any user can copy/paste a blob through whatever channel their team already uses.
   - **Simplest file server** — the ONE genuinely new transport this card adds: a shared folder/Dropbox/
     a static file host the OWNER can write to (same "host stores+serves, doesn't sequence" doctrine
     already proven for the W-REPLICA read-replica hosts) — each user drops their signed op-group as a
     file; others poll/watch the folder and apply new files on sight. No compute, no auth server —
     just filesystem semantics teams already understand.
3. **Documentation, written for an end user, not an engineer** — a "How 10 people use this together"
   guide: how to send your changes, how to receive teammates' changes, what happens if two people edit
   different records (fine, converges) vs the same record (name the honest limit: last-write-wins or a
   named conflict card — do NOT invent silent merge logic; the kernel reducer's existing idempotent/
   reject-on-conflict behavior, proven in `test_kernel_sync.js`'s concurrent-double-ALLOCATE case, is
   the real behavior — document THAT, don't promise more).
4. **Explicit non-goal, state it in the docs too:** this does NOT solve true simultaneous-write
   arbitration for the same record at the same instant — that remains the deferred real-compute relay's
   job, named and left alone. This feature's honest claim is asynchronous, sequential, no-server
   multi-user handoff — say exactly that, no more.

## SPEC-FIRST before any code (per CLAUDE.md standing rule)
Before implementation: write the manifest of which existing modules get reused verbatim
(`erp_sequencer.js`, `kernel_ops.commitGroup`/`replayOps`, `erp_signer.js`, the clipboard blob format
from `poc_oplog_clipboard.js`) vs what's genuinely new (the file-server transport, the generalized
send/receive UI, the end-user documentation) — cite line numbers from the existing POCs, don't guess
at their shape. Witness claim first (a `poc_multiuser_*.js` following the existing `poc_*` convention),
then implement.

## STOP CONDITION for this card
Not done until: (a) a witnessed POC exists for at least the file-server transport (the genuinely new
one) with the same rigor as `poc_oplog_clipboard.js` (§FALSIFIER load-bearing, idempotency proven,
convergence proven); (b) the generalized send/receive UI is wired into the live app, not just a
node-only witness; (c) the end-user documentation ships in `docs/ERPUserGuide.md` (a new section,
matching this guide's existing voice — cite witnesses, no marketing tone) — as a "how a small team
sets this up" walkthrough a non-engineer can follow; (d) the non-goal (no true simultaneous-write
arbitration) is stated plainly in that same documentation, not buried in a code comment only engineers
will read.
