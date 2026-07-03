# ⚠ DO NOT REMOVE — Scope guard
# §STATUS 2026-07-03: T3 ✅ SHIPPED + T6 ✅ SHIPPED — bim-ootb PR #623 (erp sw v759, kernel v9→v10).
#   T3 W-PCLOSE-ARCHIVE 10/10, T6 W-CROSS-TAB-PERSIST 9/9, both red-before/green-after in node over the
#   REAL kernel; poc_teams_phase_d 11/11 unchanged (no regression). DEFERRED from T6: the commitGroup
#   id-race retry (touches the atomic-commit transaction — needs its own concurrency witness; the caller
#   res.committed guards already stop the silent-loss symptom).
#   T4+T5 (unify 3 kernel copies): ANALYSIS DONE 2026-07-03, ⛔ BROWSER-GATED. The three-way diff proves
#   NEITHER copy is a superset: erp/kernel_ops.js (now v10) has branch+emitter+T6-guard but LACKS viewer's
#   three persist guards (§KRN_PERSIST_GUARD foreign-db skip, _cacheDisabled, openCacheDB version-fix = the
#   2026-06-12 P0). viewer/modeller copies (v8) lack branch support (the T4 what-if bomb — blue_fold.js:36
#   commits {branch_id} but the active branch-blind viewer copy drops it → what-if commits as OFFICIAL).
#   Host surface = 10 HTML loaders; viewer.html DOUBLE-loads (erp copy 825 THEN viewer copy 854 → last wins).
#   The unify = merge viewer's 3 persist guards INTO the erp copy (safe: erp/*.js never reference APP.db so
#   the foreign-db guard is inert there), delete viewer/+modeller/ copies, repoint their hosts, boot-assert
#   on double-define, commitGroup throw-on-unknown-groupMeta-key. The persist-merge + host-repoint CANNOT be
#   node-witnessed (IDB/navigator.locks/openCacheDB/APP.db are browser runtime) — it REQUIRES the W-ONE-KERNEL
#   building-load browser smoke to prove no 2026-06-12 regression. Held for a browser-capable session.
#   T1 trust-root: ✅ DECIDED (Watchdog excavation 2026-07-03) — adopt the doctrine's OWN answer, not a fresh
#   design: device-level CENTRAL roster (DistributedERP.md §228 edge/merchant-key signing + §445/§8 key-trust
#   root stays central), ROTATE/REVOKE + key-epoch map (§290, burn-not-reattribute), starting from the
#   witnessed scripts/poc_rotate.js (bim-compiler master + feat/erp-substrate-phase012, §ROTATE-OP/HISTORY-
#   VALID/FUTURE-GATED/REVOKE). SEPARATE 4th question (NOT T1): employee attribution (self-asserted actor
#   defeats maker-checker) → cheap answer is a PIN/login as op METADATA (audit-logged, not per-employee PKI).
#   T2 canonicalization now UNBLOCKED by T1's decision. NEXT LANE = T1/T2 (node-verifiable) over browser-gated T4+T5.
#
# Implementation spec for the FIRST greenlit batch of kernel-timebomb fixes (visionary greenlit the
# no-design-call items 2026-07-03). Source findings: prompts/KERNEL_TIMEBOMB_AUDIT_2026-07-03.md.
# This is spec-first per CLAUDE.md — code is written AGAINST this doc, in dedicated bim-ootb /tmp/wt-*
# sessions (kernel = Sacred, one bounded task per session). READ THE LOG after every witness run.
# CORRECTIONS to the watchdog's raw "T2+T3+T4+T6" grouping, both verified live in code this session:
#   (a) T4 is NOT "delete a script tag" — the erp/ kernel copy has the WEAKER persist guard (1 hit vs
#       viewer/modeller's 4), so viewer-falls-through-to-erp-copy REINTRODUCES the 2026-06-12 clobber.
#       T4 MUST be done as T4+T5 (unify to one canonical copy that has BOTH branch logic AND the guard).
#   (b) T2 is NOT fully independent — its content-canonicalization half is safe, but the `actor` field it
#       signs is the exact identity semantics T1's threat-model decision owns. Build canonicalization
#       ONLY; hold identity binding for T1. Signing self-asserted `actor` now = re-migrate every sig later.

## THE SHARED ACCEPTANCE GATE (definition-of-done for EVERY item below — non-negotiable)
The audit's root cause is that the only self-check (`erp_seam.verify`) replays the same log twice and
compares it to ITSELF — green by construction, blind to divergence. **No fix in this batch is "done" on
a green `verifyChain` or a green `verify()`.** Each ships with a witness that can actually go RED:
- **W-LOG-VS-IMAGE** — fold the live op-log into a FRESH db and diff the resulting projection against the
  live in-memory table image, row-by-row. Any fix that changes persisted state must show this stays equal
  (and must show a deliberately-injected out-of-log write makes it go RED — prove the witness has teeth).
- **W-CROSS-TAB / W-CROSS-PEER** — simulate two writers over the same db key (two sql.js instances +
  two IDB puts, or export→import via `erp_sync`), assert no committed op is lost and both projections
  converge. Must go RED against today's code before the fix, GREEN after.
Build the witness harness FIRST (it is shared across the batch and is most of the real work); if it can't
be made to fail against the current bug, it isn't proving anything (feedback_whitebox_no_handwave_geometry
+ feedback_test_real_user_path_not_seams).

---
## BATCH 1a — build now, no design call (independent, low-risk)

### T3 — gate the destructive period-close DELETE behind a CONFIRMED archive
- **Site:** `erp/erp_period_close.js:92` `db.run('DELETE FROM kernel_ops WHERE id < ?', [ckptId])`.
- **Change:** `closePeriod(db, kernel, signer, opts)` gains a required `opts.archiveSink(signedArray) →
  Promise<{ok, ref}>`. BEFORE the DELETE: `var arr = exportBranch(db, {...})` (reuse `teams/erp/
  erp_sync.js:46`); `var res = await opts.archiveSink(arr)`; **if `!res.ok` THROW — do not delete.** Only
  on confirmed archive does the DELETE fire. `res.ref` (CAS hash / blob key) is stored in the checkpoint
  op's params so the cold archive is addressable from the live log.
- **Caller:** `erp/period_close_ui.js:78` must pass a real sink (CAS put, or a downloaded signed `.log.json`
  the operator confirms) — today it passes none and the `archived=` it logs is only a row COUNT (misleading).
- **Witness W-PCLOSE-ARCHIVE:** (1) close with a sink that returns `{ok:false}` → assert rows still present,
  throw raised, zero deletion. (2) close with a real sink → assert archive round-trips: re-import the
  archived array, `erpVerifyChain` OK, and its fold reproduces the pre-close projection byte-identical.
  (3) balances-b/f unchanged from current W-PCLOSE (don't regress the fold math — it's already correct).

### T6 — lock + tip-guard the multi-tab persist (stop silent loss of signed ops)
- **Site:** `erp/kernel_ops.js:107-125` `_persistToIdb` (also mirror the pattern in `kanban_host.js:107-109`).
- **Change (two parts — a mutex ALONE is insufficient):**
  1. Wrap seal+export+put in `navigator.locks.request(dbUrl, {mode:'exclusive'}, async () => {…})` so
     same-origin tabs serialize (graceful fallback: if `navigator.locks` absent, keep current path + warn).
  2. **Tip-ancestor guard** inside the lock: read the stored blob's tip (or a sidecar `<dbUrl>:tip` key)
     BEFORE overwrite; if the stored tip is NOT an ancestor of this tab's tip (i.e. another tab advanced
     the log), **do not blind-overwrite** — reload/merge then re-persist, or abort with a loud
     `§KRN_PERSIST_STALE` and surface to the status bar. Never silently clobber a newer log.
- **Related (fold in): `commitGroup` id-race** (`kernel_ops.js:304-337`, `MAX(id)+1` across awaits) — make
  it retry-on-collision internally, and fix `pos_lens.js:793-801` + kitchen twin to branch on
  `res.committed` (today they log "committed" unconditionally → silent loss even in the §-log).
- **Witness W-CROSS-TAB-PERSIST:** two db instances on one dbUrl, both commit; assert BOTH tabs' ops
  survive the persist race (RED against current code, GREEN after); assert a stale-tip put is refused, not
  applied; assert an id-collision commit retries and returns `committed:true`.

---
## BATCH 1b — build now, but as ONE unified task (NOT T4 alone — verified regression trap)

### T4+T5 — collapse to a SINGLE canonical kernel_ops.js (branch-aware AND persist-guarded)
- **Verified facts:** `viewer.html:825` loads `../erp/kernel_ops.js` (branch-aware, 18 `branch_id` refs)
  then `:854` loads `viewer/kernel_ops.js?v=4` (0 branch refs) → last-load wins → viewer runs the
  branch-blind fork → Blue-Future/what-if ops commit as official signed history, `discardBranch` is a
  TypeError. THREE distinct md5s (erp/viewer/modeller). The `erp/` copy has only the WEAK persist guard
  (guards on `dbUrl` presence only) while viewer/modeller carry the fuller §KRN_PERSIST_GUARD (the fix
  added after the 2026-06-12 foreign-db clobber). **⇒ merely deleting the viewer include strands the
  viewer on the weak-guard erp copy and can re-open the 2026-06-12 building-load bug.**
- **Change:** produce ONE `common/kernel_ops.js` = superset (branch_id + gid + `_sv` stamp from erp/ **AND**
  the full persist guard + openCacheDB VersionError fix from viewer/modeller). Point `erp/`, `viewer/`,
  `modeller/` hosts at it; delete the two forks and the duplicate `viewer.html:854` include.
- **Boot assertion:** `§KERNEL_OPS_LOADED v<N>` on load; **refuse to run (throw) if a second copy tries to
  redefine `window.KernelOps`** — makes any future re-fork fail loudly instead of clobbering silently.
- **`commitGroup` hardening:** throw on unknown `groupMeta` keys (a branch-blind copy silently dropping
  `branch_id` is exactly what let T4 through).
- **Witness W-ONE-KERNEL:** (1) grep/CI: exactly one `window.KernelOps =` in shipped src. (2) load two
  copies in one page → boot assertion throws (RED path proven). (3) a what-if commit with `{branch_id}`
  on the viewer path lands in a BRANCH, is excluded from the official fold, and `discardBranch` removes it
  (the exact scenario that was silently official before). (4) building-load smoke on the viewer proves the
  persist guard survived the merge (no 2026-06-12 regression) — real-user path, readPixels/op-log assert.
- **⚠ Scope note:** this is a merge of three drifted files + a re-point of every host — its OWN bounded
  session, do NOT combine with 1a. Diff all three copies first (feature/fix matrix) so nothing is dropped.

---
## HELD — needs the visionary's decision first (do NOT build ahead of it)

### T2 — content-addressed signing: HALF ready, HALF blocked on T1
- **Safe-now half (can be specced/built independently):** `_canonical` (`kernel_ops.js:157-160`) hashes the
  local rowid `id` → merge renumbers ids → every historical signature is orphaned. Fix: hash op CONTENT
  (`op_uuid|timestamp|op_type|parameters` — length-prefixed or JSON-canonical, adopting teams'
  `stableStringify` so the kernel and teams canonical agree and the `'|'`-injection in `_canonical`/
  `erp_sync.js:21` closes). Keep the chain hash as a SEPARATE re-sealable order artifact.
- **BLOCKED half:** the audit's suggested signed tuple includes `actor`, but `actor` is a self-asserted
  `localStorage` string (T1). Signing it now bakes the wrong identity shape into the signature format →
  T1 later must re-migrate every signature. **Build canonicalization ONLY; leave `actor` OUT of the signed
  payload until T1 defines identity binding.**

### T1 — the ONE decision that is yours, not code. Three forks, each a PRODUCT question:
1. **Trust root:** central roster (an org admin issues/authorizes keys) or web-of-trust (peers vouch for
   peers)? = "is this ERP for a franchise HQ, or a loose federation of independent shops?"
2. **Admission/revocation:** how does a new peer get a recognized key; who can revoke one?
3. **Compromise:** on key loss/compromise, can history be re-attributed, or is that key's history burned?
Answer these three and T1's code is small and T2's blocked half unblocks. Same category as the E-Invoice
regulatory gate: decision/dialogue, not implementation. **Bring answers → I turn it into a spec.**

## DEFERRED (fine past this round, per greenlight): T5-standalone folded into 1b above; T7 O(history) scale
## cliff (~5k ops, 2-3 wks out — do before it bites, primitives already in-tree); T8/T9/T10/T11/T12/T13 =
## steady structural paydown behind the single fold-cursor + one-kernel work.

## SEQUENCING FOR THE COODER SESSIONS
1. Build the shared witness harness (W-LOG-VS-IMAGE + W-CROSS-TAB) — prove it goes RED on current bugs.
2. Session A: T3 (archive-gated close) ✅ SHIPPED #623. Session B: T6 (persist tip-guard) ✅ SHIPPED #623.
3. Session C: T4+T5 unify — ⛔ BROWSER-GATED (analysis done, see §STATUS; needs W-ONE-KERNEL building-load smoke).
4. T2 canonicalization + T1 code — ✅ UNBLOCKED (T1 decided). Execution plan below. ← START HERE next session.

## ══ NEXT SESSION — T2 then T1 (trust model). Node-verifiable. Cite this §. ══
Order is T2 → T1: today the verifier holds ONE local key and sigs bind to the local rowid (`_canonical`
hashes `op.id`), so roster-verification across a merge is impossible until content-signing lands first.

### CANONICAL FORK — RECOMMENDED PATH = ADDITIVE-VERSION (confirm at session start; visionary leaned proceed).
Changing `_canonical` changes EVERY `op_hash` → a blunt cut invalidates every historical signature (the
T2/T11 permanence trap). Land it additively, NOT as a flag-day migration over signed financial history:
- Old ops keep verifying under the v1 canonical (`id|ts|type|params|inG|outG`); NEW ops sign a v2
  content-addressed payload gated by `_sv` (the D2 version stamper already exists, `kernel_ops.setVersionStamper`).
- `sealChain`/`verifyChain` pick the canonical form per op's `_sv` — v1 rows unchanged, v2 rows content-signed.
- No re-seal of history, no migration event. (Clean-cut-with-migration is the alternative IF the visionary
  prefers a single canonical form + a one-time re-sign — more risk, cleaner end state. Default = additive.)

### T2 — content-addressed signing (build first). Witness W-CONTENT-SIGN, RED-first:
- v2 `_canonicalV2(op)` = length-prefixed or JSON-canonical over `op_uuid|timestamp|op_type|parameters|actor`
  (adopt teams `stableStringify` from teams/connectors.js so kernel + teams canonical AGREE — closes the
  `'|'` delimiter-injection: two distinct field partitions currently collide to one `op_hash`, §T2/security#6).
  ⚠ `actor` stays a PLACEHOLDER field here — do NOT bind identity yet (that's T1); just include it in the payload.
- Witness asserts: (a) a v2-signed op survives a simulated id-renumbering (its sig still verifies after
  ids shift — the merge property v1 fails); (b) `'|'`-bearing params can't be re-partitioned to a colliding
  hash; (c) EXISTING v1 logs still verify unchanged (no regression). RED against current `_canonical` first.

### T1 — roster + ROTATE/REVOKE on the verify path. EXCAVATE, don't design. Witness W-ROSTER-VERIFY:
- Source: `scripts/poc_rotate.js` (bim-compiler master + feat/erp-substrate-phase012) is already witnessed
  §ROTATE-OP/§HISTORY-VALID/§FUTURE-GATED/§REVOKE — PORT it into the bim-ootb kernel verify path, don't rebuild.
- Device-level CENTRAL roster: a signed `{device_id → pubkey}` list, HQ-signed, extending the pinned-key
  pattern already in `erp/erp_snapshot_sign.js` (PINNED_PUBKEY). Replace kernel_ops' single module-global
  `_signer` with per-op ISSUER-key resolution from the roster + key-epoch map (verify each op under the key
  valid at its seq — DistributedERP.md §290). Wire it onto the MERGE/import path (teams/erp/erp_sync.js
  `importBranch` + `erpVerifyChain`), which today checks the keyless chain only (the T1/security#1 gap).
- ROTATE (counter-signed by outgoing key) installs a new key going forward; REVOKE kills future, keeps past
  (burn-not-reattribute — DECIDED). Witness: rotate→past still valid under old key; post-rotation old-key op
  rejected; a forged foreign-key op on import REJECTED (today it's silently accepted).

### SEPARATE 4th question (NOT T1, do not inflate the lane): employee attribution — self-asserted `actor`
  defeats maker-checker (two typed names, security#2). Cheap answer when scoped: a PIN/login recorded as op
  METADATA (audit-logged human-accountability), NOT per-employee signing keys (PKI won't stop an insider
  forging the business's own key — wrong tool for that threat). Leave unscoped until explicitly picked up.

Each session: spec-cite this §, §-log first, RED-before/GREEN-after node witness over the REAL kernel,
push before finish, PR + auto-merge. Kernel = Sacred: one bounded task per session, never cowboy the
hashed path without a witness that can go red.
