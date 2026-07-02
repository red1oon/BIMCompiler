# ⚠ DO NOT REMOVE — Scope guard
# Findings-only doc from a 3-agent deep audit of the op-log KERNEL (scalability / macro-design / security),
# dispatched 2026-07-03 under the architect's rule: "minor stuff that surfaces is not feared — it is slop
# that is a landmine or timebomb later that we watch for." NOTHING here is implemented. These are diagnoses
# for the architect (mastermind) to sequence, not a spec. The three load-bearing claims (tautological
# self-check, period-close DELETE, viewer kernel_ops clobber) were re-verified live at file:line, not trusted
# from the agents. Repos read-only; no kernel code was touched. Re-verify anything before acting if picked up
# more than a few sessions later (fast-moving repo).

## THE ROOT CAUSE (one sentence)
The op-log core is deterministic and genuinely sound **at op-creation time** — identity, timestamp, rates
all travel as recorded edge inputs inside the signed op (verified clean, see §CLEAN). Every *peripheral*
contract with that log — signatures, fold-selectors, "the one write path", persistence, and the trust
self-check — is written to **walk or trust the raw log in a way that is green-by-construction under today's
single-device / single-tab / no-merge / no-close conditions.** Each timebomb is therefore armed not by
misuse but by a **success milestone**: first real peer merge, first period close, first multi-tab shop,
first heavy what-if session. Fixing the Tier-1 items while logs are still short is cheap; after two years
of signed history it is a migration crisis.

## TIER 0 — THE META-ENABLER (why none of the below self-surfaces)
**The only integrity self-check is a tautology.** `erp/erp_seam.js:170-175` `verify(ctx)` replays the SAME
op-log twice into two fresh DBs and returns `chainOk: ra.hash === rb.hash`. Identical input + deterministic
fold ⇒ the two rebuilds are always equal. It **never** compares the log-fold against the live DB image, and
`kernel_ops.verifyChain` only proves the keyless SHA-256 chain is internally consistent (§T1). So "trust:
OK" is displayed no matter how far the live state, the peers, or the tabs have diverged. Fix: `verify()`
must fold the log into a fresh DB and diff it against the live projection (log-vs-image), and cross-check
the tip against at least one peer.

---
## TIER 1 — CRITICAL: detonates on a success milestone, permanent damage

### T1 — Trust is KEYLESS on the only path that matters (P2P merge)
- `teams/erp/erp_sync.js:30-41` `erpVerifyChain` (the verifier `teams/transport.js` push/pull run, wired as
  the ERP default at `erp_sync.js:78-83`) checks only `prev_hash` link + `op_hash == sha256(prev|canonical)`
  and **never inspects `sig`**. `importBranch` (`:59-73`) replays without checking signatures.
- SHA-256 is keyless → anyone (a collaborator, or anyone with write access to the "dumb post office"
  GitHub/OCI transport) authors a fully-valid chain from GENESIS with arbitrary content and any `author`,
  recomputing every hash. Every peer folds it as authentic history.
- No identity↔pubkey binding anywhere: `actor` is a self-minted `localStorage` tag (`erp/kanban_host.js:83`),
  `role` is honored straight from `?role=` (`erp/role_band.js:43`), maker-checker compares self-asserted
  name strings with a default-true eligibility (`teams/erp/cosign.js:80,103`) — two typed names defeat it.
- The ECDSA verifier holds ONE local key (`kernel_ops.js:132,404`; `erp_signer.js` mints one `edge` key),
  so a genuinely multi-signed peer log can never pass the sig branch — almost certainly why the merge path
  dropped sig-checking entirely. The W-SIGN "authenticity" layer is inert in exactly the multi-actor
  scenario it's advertised for (DistributedERP.md §68/§330/§385).
- Detonates: first real multi-actor merge. Fix: resolve each op's issuer pubkey from a signed org roster
  (out-of-band trust root — the pinned-key pattern already exists, isolated, at `erp/erp_snapshot_sign.js:16`),
  make sig-verification non-optional on import, derive actor/role from the verified key not from ctx.

### T2 — Signatures bind chain-POSITION, not content; merge/compact/close orphan every historical sig
- `_canonical` (`kernel_ops.js:157-160`) hashes the **local rowid `id`** + chains from per-device GENESIS;
  `sig` is over `op_hash` (`:183-184`). Union of two logs renumbers ids ⇒ every `op_hash` changes ⇒ every
  signature ever made attests a hash that no longer exists. `sealChain` re-signs only rows lacking a sig
  (`:183`) so re-seal keeps stale sigs → `verifyChain` fails `'signature'` → escalates to `'group torn'`
  (`:407-417`) → the fold contract drops the whole (valid, years-old) group.
- Same `_canonical` is **delimiter-injectable** (`'|'`-joined free-text fields): two distinct op tuples can
  produce one `op_hash`, letting a tamperer re-partition fields under a valid chain. (Teams-side
  `stableStringify` is injection-safe; the kernel canonical is inconsistent with it.)
- Detonates: first merge, first `compact()`, or first period-close on a log with a signer set. Fix: sign
  CONTENT (`op_uuid|timestamp|op_type|parameters|actor`), keep the chain hash as a separate re-sealable
  order artifact; length-prefix or JSON-canonicalize the signed payload.

### T3 — Period close DESTROYS pre-close signed history; the cold-archive leg was never built
- `erp/erp_period_close.js:92` `DELETE FROM kernel_ops WHERE id < ckptId`. Comment claims "the full pre-close
  log is the cold archive — kept by the caller"; the only live caller (`erp/period_close_ui.js`) does **no**
  export/archive before the close (`archived=` is just the deleted-row count). Balances survive (fold math is
  clean, cent-identical), but document lineage, field blame, Time-Machine, and "show me the signed op behind
  this Q1 journal line" become permanently unanswerable — directly contradicting "the op log is permanent."
- Detonates: first real period close. Fix: `closePeriod` refuses to DELETE unless handed an archive sink that
  has confirmed a verified copy (the §9 exportBranch→CAS/snapshot machinery already exists).

### T4 — Viewer runs the branch-UNAWARE kernel_ops fork → what-if ops committed as OFFICIAL permanent signed history
- `viewer/viewer.html:825` loads `../erp/kernel_ops.js` (branch-aware, 18 `branch_id` refs), then `:854`
  loads `viewer/kernel_ops.js?v=4` (**0** `branch_id` refs). Both end `window.KernelOps = {...}` →
  last-load clobbers → the live viewer runs the fork with no branch support, no `discardBranch`.
- `viewer/blue_fold.js:36` / `whatif.js:193` call `commitGroup(db, ops, {branch_id})`; the fork silently
  ignores `groupMeta.branch_id` → the speculative group is sealed, signed, persisted as **official** history.
  `discardBlue`→`discardBranch` is a TypeError (method absent), so the "shirk the blues" path can't remove
  them; every peer that pulls folds the speculation as fact.
- Detonates: first heavy Blue-Future / what-if use. Fix: one canonical kernel_ops (§T5); delete one of the
  two viewer includes; make `commitGroup` **throw** on unknown groupMeta keys.

### T6 — Multi-tab last-writer-wins whole-blob persist → silent loss of committed, sealed, SIGNED ops
- `kernel_ops.js:107-125` persist = 2s-debounced `db.export()` → `IDB.put(buf, dbUrl)`, **no `navigator.locks`,
  no BroadcastChannel write-coordination, no read-modify-write** (same pattern `kanban_host.js:107-109`).
  Each tab holds its own full in-RAM copy. Tab B's export overwrites the blob holding tab A's committed ops;
  both chains still verify, so nothing flags — the sale is simply gone on next reload.
- **Zero op-count threshold** — it's a usage-pattern bomb, and POS-tab + back-office-tab is the *natural*
  production setup. Compounded by `commitGroup` predicting ids via `MAX(id)+1` across `await` yields with no
  mutex (`:304-337`): an interleave rolls the group back `committed:false`, and callers like
  `pos_lens.js:793-801` log "committed" without checking the flag. Fix: Web Locks around persist+commit, or
  one elected writer tab via BroadcastChannel; make callers branch on `committed`.

---
## TIER 2 — HIGH: compounding structural debt

### T5 — "One write path" has re-forked into THREE kernel_ops.js (after being unified once)
- Distinct md5s for `erp/`, `viewer/`, `modeller/kernel_ops.js`; git `0a8ef10 §INTEG-COLLAPSE` unified them
  in June, they drifted apart again. Feature/fix asymmetry: the **erp copy lacks the §KRN_PERSIST_GUARD P0
  fix** (the foreign-db IDB clobber that killed building loads 2026-06-12, fixed only in viewer/modeller);
  viewer/modeller copies lack `branch_id`. New op-log columns land in one copy and silently not the others.
  Fix: one `common/kernel_ops.js`, version-logged, with a boot assertion that refuses to run if two copies
  define `window.KernelOps`.

### T7 — O(history)-per-action on four independent axes (all incremental primitives already exist in-tree, unwired)
- Per **commit**: `_persistToIdb` calls full `sealChain` (`kernel_ops.js:110,173-189`) though incremental
  `sealFrom` (`:203-220`) exists; POS/kitchen/CRUD then run full `verifyChain` with **per-op ECDSA verify**
  (`:389-425`) on every SEND/save/DocAction (`pos_lens.js:796`, `crud_overlay.js:1746,2201`).
- Per **dispatch**: `erp_kernel.js:269-277` computes `projectionHash` twice + full `snapshotProjection`
  before a single-doc action; `erp_seam.verify` replays the whole log twice per drag (`kanban_lens.html:167`).
- Per **paint**: `crud_overlay.js:516-527` `readTip` re-scans + JSON.parses all SET_STATUS ops **per (table,id)**
  → O(rows×ops) per grid (the exact class fixed in Modeller PR #596, still live ERP-side); `listTip`/`tipValues`
  full-scan per render.
- Per **commit I/O**: whole-DB `export()` + single-blob IDB write (2–3× RAM spikes, write amplification).
- Trigger: a busy POS (~300 ops/day) hits ~5k ops in **2–3 weeks** → 1–5s added per sale, climbing. There is
  **no ERP-side compaction/checkpoint** — `compact()` (`:501-557`) is BIM-modeller semantics and correctly
  never runs on financial data, so the log grows monotonically forever. Fix: wire `sealFrom`, tip-cached
  incremental verify, memoized tip-folds (moveDeltaFor precedent), and a signed snapshot op (period-close
  pattern) that folds/verifies start from.

### T8 — Fold-selector columns (`undone`, `branch_id`) are unsigned AND don't survive transport
- `undone`/`branch_id`/`gid` are outside `_canonical` (unsigned), yet every fold filters on them.
  `exportBranch` omits `undone` → peer imports it as 0 → **applies an op the origin had undone**; both chains
  green, books differ by exactly that op. And `erp_kernel.replay:205` has **no branch filter** while
  `KernelOps.replayOps` excludes branches → the "trust" hash and the rendered official state are hashes of
  two different worlds. Fix: make undo/discard compensating **ops** (signed), not mutable row flags; until
  then export `undone` and give `ERPKernel.replay` the same branch filter as `replayOps`.

### T9 — Runtime writes OUTSIDE the log (unreplayable state in a container the doctrine calls disposable)
- `ad_data.js:263,283` `saveRecord`/`deleteRecord` mutate the table then log `AD_SAVE {table,id,action}` with
  **no field values** — the log can't rebuild the write. `getNextId` = device-local `MAX+1` (`:293`).
- `crud_overlay.js:2121` writes the docno sequence cursor directly; the cursor doesn't travel in the log, so
  a refold-from-baseline (IDB eviction — treated as fine, `erp_persist.js:4-6`) or any peer **re-issues an
  already-used DocumentNo** → duplicate invoice numbers, unattributable.
- `time_machine.js:3559,3622` and `ninja_stage.js:181,205` raw-INSERT unsigned rows into `kernel_ops` with
  their **own competing DDL**; `ad_ui.js:788-792` implements undo as direct inverse table writes.
- Invisible because the only self-check (§T0) never compares log-fold vs live image. Fix: AD_SAVE carries the
  full field payload (make CRUD_CREATE/UPDATE the only AD write dialect); docno allocation becomes an op; a
  CI grep-gate: no `db.run(INSERT|UPDATE|DELETE` on kernel tables outside `kernel_ops.js` + bake scripts.

---
## TIER 3 — MEDIUM: latent, lower blast radius

- **T10 — Fold sprawl (~18 modules) re-fold the raw log with inconsistent selectors/order:** `pos_lens.js:252`,
  `kitchen_lens.js:70` (no `undone`/branch filter), `time_machine.js:66` + `erp_search.js:354` (`ORDER BY
  timestamp` not `id` → period-close re-stamps ts=0, reorders the fold), `erp_seam.js:92` `currentRuleT` (no
  branch filter → a blue-branch SET_RULE changes the OFFICIAL admission threshold). Each new op semantic
  fractures a subset. Fix: one shared filtered/ordered/upcasted/group-aware fold-cursor API.
- **T11 — Schema-evolution machinery is write-only:** `OpUpcaster.install` called in ONE host
  (`idempiere.html:533`); **zero** `register/setCurrent` calls repo-wide; no fold routes through `upcast`.
  Unversioned op-shape drift already shipped (`crud_overlay.js:405` folds CRUD_UPDATE as `{new:…}` OR bare
  value; `erp_kernel.replay:210` silently skips ops lacking `.payload`). Permanence currently rests on nobody
  ever changing an op shape again. Fix: route every fold through one `readOps` that applies `upcastAll` +
  refuses unknown `_sv`; install the stamper in all hosts.
- **T12 — Boot & storage durability:** FTS index DROP+rebuilt from zero every boot (`erp_search.js:92-123`);
  IDB quota/eviction errors swallowed (`idempiere.html:661-667` empty `catch{}`, `kernel_ops.js:122`
  console.warn only); `navigator.storage.persist()` requested only in `erp.html:227`, **never in
  idempiere.html** — the main app stays best-effort, so the browser may evict the tenant, the op-log, AND
  `bim_erp_signer` (the device identity key) under pressure, silently. Fix: request persist in boot, surface
  put-failures, persist the FTS index in the blob.
- **T13 — Doctrine contradictions carried in production:** `idempiere.html:483,487` load
  `erp_descriptor.js` + `odoo_descriptor.js` — the Renderer-#2/descriptor seam the settled 2026-07-01
  doctrine CANCELLED (ONE iDempiere base; other ERPs migration-only). And the contract that names "the only
  write path" — `ENGINE_CONTRACT.md`, cited by `erp_seam.js:5` — **does not exist in bim-ootb**; it lives at
  `~/bim-compiler/docs/internal/ENGINE_CONTRACT.md`, invisible from the repo whose code claims to implement
  it (which is how T9's bypasses grew unchallenged). Fix: drop the descriptor include from the live chrome or
  re-open the doctrine explicitly; mirror ENGINE_CONTRACT.md into bim-ootb.
- **Social/awareness surface (low):** any same-origin tab can `BroadcastChannel('bim_teams').send('TEAM_OP')`
  and forge presence/"CFO just approved" awareness (`op_subscribe.js:26-34`, untagged events pass the scope
  filter) — not a commit path, so phantom activity only. Owner-gate + org/role scope are advisory, keyed on
  self-asserted `actor` (`erp_seam.js:104,134`; omit `scope` → no check).

---
## §CLEAN — checked and dropped (non-invent)
- **No `Date.now()`/`Math.random()` inside fold-applied logic** — they appear only at op-CREATION
  (`kernel_ops.js:84,285,307`), the stamp travels in the signed op; `erp_kernel.apply/replay`, `foldBalances`,
  POST verb, pos/kitchen core, doc_poster, ad_callout are grep-clean and integer-cent.
- `crud_overlay._fmtKernelTs` uses `getUTC*` (TZ-safe); `projectionHash` orders by id with fixed column order
  (stable); modeller fold files (`bonsai_kernel`, `sdg_cascade`, `arc_editable`, `real_geometry`) grep-clean.
- `ad_evaluator.js:180` `Date.parse` of zoneless timestamps is TZ-sensitive but runs at guard/display time,
  never on replay (frozen effects) — not a fold divergence.
- Boot does NOT full-replay (`kanban_host.js:59-64` restores the exported blob directly = O(bytes), good);
  `erp_period_close.js` gives the GL a correct signed balance-b/f checkpoint (the fold math is sound — it's
  the history-DELETE around it, T3, that's the bomb).

## DOCTRINE vs IMPLEMENTATION (honest separation)
- Byzantine/trustless consensus is **explicitly disclaimed** (DistributedERP.md §483-489) — cross-peer
  equivocation (one collaborator serving two valid divergent chains) is a doctrine gap, not an impl bug;
  BUT it's the gap the unimplemented signatures (T1) were meant to cover.
- Local repudiation (owner rewriting their own past via edit→`sig=NULL`→`sealChain`) is partly by-design
  (§488 "trust-anchored local-first, not trustless"), but the doc's tamper-**detection** claim (§333
  "verifyChain detects tamper at op N") overstates the code: after a local re-seal there is nothing to detect.

## SEQUENCING (architect's call — this doc is diagnosis, not a mandate to build)
Cheap-now / migration-crisis-later, do while logs are short: **T2, T3, T4, T6** (sign content not position;
gate the period-close DELETE behind a verified archive; de-fork the viewer kernel; lock multi-tab persist).
T1 is the largest (needs a trust-root/roster design — the mastermind's call on threat model first). T5+T7
are mechanical once prioritized (the incremental primitives already exist in-tree). Everything else is
steady structural paydown behind a single shared fold-cursor + one kernel_ops copy.
