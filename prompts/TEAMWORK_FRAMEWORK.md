# ⚠ DO NOT REMOVE — Scope & Protocol
- **Scope:** ONE multi-user teamwork framework for BIM-OOTB (Modeller/Viewer) and the Kernel ERP.
  This file is the SPEC + ROADMAP. **No code is written from it until the user says go on a phase.**
- **Source of truth:** every claim below cites a file:line, a doc §, or a witness. Things that are proposals, not repo
  facts, sit under **§6 Innovations** and **§8 Roadmap** and say so.
- **Read the log after every run.** Each phase closes only on a `§`-tagged witness log that was read in full. A witness
  must be able to print NO-OP / VACUOUS / INCONCLUSIVE (CLAUDE.md PRIMAL LAW §4).
- **Twin rule applies:** on the ERP side, multi-user behaviour must match legacy iDempiere, including what the user sees
  (CLAUDE.md TWIN CARDINAL RULE). See §5 S-1.
- Written 2026-10-23 from a survey of bim-ootb `origin/main` @ `80e3fb86` and bim-compiler `b581a24c2`.

---

## §0 One-paragraph verdict

The parts exist; the framework does not. There are **five separate partial stacks** — the `teams/` engine, the ERP live
sync path, the `history_bar` fork tree, three copies of `kernel_ops.js`, and the legacy iDempiere bridge — and they
disagree with each other on ordering, identity, conflict handling and what "CAS" even means (§3 lists 12 contradictions).
The engines are well proven in node and in real two-browser runs. The gaps are at the joins: **merges don't re-check
permissions, the loser of a conflict is never told, identity is a device not a person, and the BIM side can't join the
signed log at all.** So the first job is to **unify one substrate and settle the contradictions**, not to add features.
The biggest showstopper is also a twin-rule violation: iDempiere refuses a stale save ("CurrentRecordModified"); our
SQLite side silently overwrites (§5 S-1).

---

## §1 What exists today (EXTRACTED)

| Layer | What is there | Where | Proven by | Live? |
|---|---|---|---|---|
| Op record | `op_uuid, timestamp, op_type, parameters, input_guids, output_guid, undone, prev_hash, op_hash, sig, gid, branch_id, user_tag` | bim-ootb `erp/kernel_ops.js:9-58` (canonical, = bim-compiler `build/erp/kernel_ops.js`) | W-CHAIN, W-SIGN | yes |
| Content signing v2 | hash covers actor, guids, type, uuid, params, ts | `kernel_ops.js:253`, opt-in `setContentSigning` :238, on only in `idempiere.html:1055` | #630/#634 | ERP only |
| Kernel forks | `viewer/kernel_ops.js` (597 lines), `modeller/kernel_ops.js` (610) — no v2, no emitter | bim-ootb | — | yes, unsigned-v1 |
| Append-only local store | one IDB record per op, no whole-blob overwrite | `crud_overlay.js` (#913) | W-N10-CONCURRENT-TODAY → fixed | yes |
| Relay client + rebase | push all (dedup by `op_uuid`) → snapshot → rewrite in relay order → re-seal | `erp/erp_sync_fsm.js:178-208`, `erp_relay_client.js`, `erp_sync_relay.js` (`?relay=` pill) | W-RELAY, W-REBASE, W-N-CONVERGE N=2/N=10 | opt-in, no relay URL ships |
| Relay server | body cap → shape → dedup → HQ-signed roster → ECDSA verify → ROTATE/REVOKE | bim-compiler `build/erp/erp_relay_server.js:26-50` | W-RELAY-AUTH 32/32, W-RELAY-TLS 4/4 | **not deployed** |
| Sequencer | first-seen arrival order, no business logic | `build/erp/erp_sequencer.js:30-42` | W-SYNC-FSM | bim-compiler only |
| Signed snapshots / replicas | 3-host replica, signed tip, failover | `erp_replica_client.js`, `erp_snapshot_sign.js` | W-REPLICA, W-MULTIHOST-SYNC 6/6 | dev |
| Period-close checkpoint | compaction = signed balance b/f | `erp_period_close.js` | W-PCLOSE, maxDiff=0c | glassbowl |
| Device keys | ECDSA P-256, non-extractable, **one per browser profile** | `erp/erp_signer.js:16,47-72` | W-SIGN | yes |
| Key epochs | ROTATE (countersigned), REVOKE, multi-device verify against HQ roster | `erp_key_epochs.js`, `verifyMultiDeviceOps` :169 | S8 W-MULTI-DEVICE-VERIFY 37/37 | witness-side only |
| Person attribution | PIN → `attrib` inside device-signed params; `user_tag` = `APP.actor` | `erp/erp_attrib.js`, `crud_core.js:1047` | W-T1-ATTRIB | yes |
| Access control | role/window/process/record gates | `erp/ad_access.js`; `crud_core.js:1058-1092` | W-ACCESS-GATE-LIVE | write-time only, **fails open** |
| Reducer guards | owner-gate, first-claim CAS, lease conflict | `erp/erp_replay.js:42-108` | poc_crud_ownergate G3-G5 | **no caller in sync path** |
| Scope partition | `ctx.scope={role,org}` read-filter / write-refuse | `erp/erp_seam.js:36-49,84,104` | W-SCOPE | off by default |
| Op emitter | `TEAM_OP` after `commitGroup` | `kernel_ops.js:303,650` | W-EMIT | off by default |
| Teams engine | fold by (ts,id), owner-gate, cross-branch gate R/O/G, PERT gate, post-it, bundle, World-at-T, cosign, nudges | bim-ootb `teams/` (93 files, #593) | node suite (ROADMAP: 134/134) | **no clickable fork/merge UI** |
| Teams signatures | `sha256(author:op_hash)` | `teams/connectors.js:108` | — | stub, not ECDSA |
| Presence | heartbeat on `BroadcastChannel('bim_teams')` | `teams/overlay/presence.js`, `modeller/teams_embed.js:74-90` | W-E2E-DUAL-PRESENCE 11/11 (#661) | one browser only |
| Fork tree | sibling universes, switch, combine/cherry-pick | `common/history_bar.js:170-228,350`; `viewer/universal_history.js:185` | poc_cherry_pick | yes, single actor |
| Blue branches | `acceptBranchUpTo` / `discardBranch` = flag flips | `kernel_ops.js ~900-945` ("single actor only") | — | yes |
| Legacy bridge | SQLite works, iDempiere is the twin and oracle; documents + doc-actions only | `prompts/SQLiteIDEMPIERE.md §P`; REST bridge #1701 | shop day 25/25 | pilot |

**Engine-level proofs worth keeping** (bim-compiler `scripts/poc_*.js`): atomic op-group + checkpoint (`poc_showstopper`),
blackout of 50 branches rebuilt at maxDiff=0c (`poc_blackout_resume`), lying relay caught by signed-tip gossip
(`poc_equivocation`), GDPR erase by crypto-shred keeps books byte-identical (`poc_erase`), oversell window = quorum
round-trip, not fleet size (`poc_quorum_cas`), 10k stations ~4.6k ops/s (`poc_pos_wan_scale`).

---

## §2 Settled doctrine this framework inherits (do not re-litigate)

1. **A fact is a fold over a signed log**, never a guarded stored number. (`docs/DistributedERP.md §0`)
2. **Serverless = no server of record.** The relay is a dumb post office: accept, order, persist, forward. It holds no
   truth and never signs. Static hosts store and serve; only multi-writer ordering needs compute. (`ERP.md §0.20`,
   `DistributedERP §6`, `BACKEND_SUBSTRATE_LANE §MH.1`)
3. **Avoid conflicts by ownership first, fall back to total order.** ~90% of work has one owner. (`DistributedERP §1,§4`)
4. **Semantic op merge, not state CRDT, not blanket LWW.** LWW silently double-allocates. (`ERP.md §0.18(c)`)
5. **Ids are minted at the edge (UUID); anything non-deterministic is recorded in the op.** (`ERP.md §0.21`)
6. **Draft branches, craft locks.** Compiled work branches and merges; invented work (architect trunk) has one writer.
   Cross-discipline = federation, not git merge. (`RESUME_DISTRIBUTED_BRANCHES §0-§2`)
7. **World = fold(History); the scope key is opaque** — discipline in BIM, `{role,org}` in ERP. (`teams/DESIGN §0-1`)
8. **Three timelines never merge:** 4D Gantt / op-log History / Blue-dot what-if. (`RESUME_TEAMS_UI_CONSISTENCY §1a`)
9. **Trust-anchored local-first**, not trustless consensus. The system can witness fraud, not prevent it. (`DistributedERP §0,§12`)
10. **Accounting is the reconciliation engine** — a leftover becomes a receivable or an expense. (`DistributedERP §8`)
11. **Team off = pixel-identical; additive only.** (`teams/ROADMAP` non-negotiables)

---

## §3 Contradictions to settle FIRST (each needs one line of decision, then the losing docs get corrected)

| # | Conflict | Side A | Side B | Recommended resolution |
|---|---|---|---|---|
| C1 | Who sets order | relay assigns seq (`DistributedERP §6`) | client `(ts,id)` (`teams/engine.js:36-60`, `ERP.md §0.21`) | **Relay seq wins.** Client clock is a hint only; ordering by client clock lets a device backdate to win. |
| C2 | LWW | rejected (`ERP.md §0.18(c)`) | planned HLC + per-field LWW (`ERP_Roadmap R6`); live relay is already LWW by seq | LWW only for cold, invariant-free fields **and the loser is told** (§4). Everything else per §4. |
| C3 | What "CAS" means | compare-and-set (`DistributedERP`) | content-addressed storage (`teams/PROTOCOL.md`); `crud_ops.json` "cas" points at a lease column | Rename: `CAS` = compare-and-set only; storage = `CAStore`; lease = `lease`. |
| C4 | Trustless relay | yes (`teams/DESIGN §7`) | no; it can equivocate (`DistributedERP §12`, `poc_equivocation`) | Not trustless. Signed-tip gossip is required (§6 I-6). |
| C5 | Geometry merge | cr-sqlite LWW (`LocalFirstPriorArt`, `MigrateComparisonPaper`) | single writer per scope + gate (`teams/DESIGN`, `RESUME_DISTRIBUTED_BRANCHES`) | **Single writer per scope.** Correct `MigrateComparisonPaper`, which states LWW as adopted. |
| C6 | Seam protocol open? | ⛔ open (`RESUME_DISTRIBUTED_BRANCHES §12`) | resolved, W-PROTO 17/17 (`teams/PROTOCOL.md`) | Re-read PROTOCOL.md against §12; close §12 if it holds. |
| C7 | G-SINGLE-WRITER live? | doctrine | `ownerGated` default FALSE for DocActions (`crud_overlay.js`) | ERP follows iDempiere: role-governed + optimistic lock (§5 S-1), not owner-gated. Correct the doctrine wording. |
| C8 | DocumentNo rule | MAX+1 (`ERP §15.1`) · `user/date/doc/#` (`DistributedERP §6.1`) · server final (`SQLiteIDEMPIERE §6`) · org-prefixed `IsOrgLevelSequence` (`ERP_PARALLEL_RUN_PILOT §DECISIONS`) | — | Pilot §DECISIONS is newest and is the iDempiere mechanism. Retire the other three. |
| C9 | What the server does | no sync, no lock (`ERP §15.2`); never arbitrates (`§18.7`) | orders + runs CAS matchmaker (`§0.20`) | §0.20 wins; mark §15.2/§18.7 superseded. |
| C10 | AD_ChangeLog | deleted by field-lineage fold (`TEAM_OPTICS §3,§8`) | not removed (`ROADMAP §R4`) | Keep it (twin rule: iDempiere has it). |
| C11 | Same-doc race | "server docstatus wins" (`SQLiteIDEMPIERE §6`) | withdrawn (`§21`) | Fix the §6 line. |
| C12 | Peer-sync bench | quoted clean (`HolyGrail`) | prints `chainOk=false` yet PASSes (`poc_bench_peer_sync`) | Witness defect: fix it to FAIL on `chainOk=false`, then re-quote. |

---

## §4 Conflict model (the framework's core — goes beyond "async + relay + merge rules")

Every op carries an **intent class**. The class decides what happens when two ops meet. **No class is allowed to lose a
write silently** — every losing op produces a visible result for its author.

| Class | Example | Rule | Loser gets |
|---|---|---|---|
| K0 Disjoint | two people edit different records/fields | union | nothing to tell |
| K1 Cold field | description, note, colour tag | last by relay seq | a "your value was replaced by X (who, when)" notice |
| K2 Guarded field (matches iDempiere) | any column on a table with `Updated` | **optimistic lock**: op carries the `Updated` it read; stale = refused | iDempiere's own `CurrentRecordModified` message + refresh (§5 S-1) |
| K3 Invariant | stock, credit limit, allocation | owner-gate / compare-and-set / quorum (`erp_replay.js`, `poc_quorum_cas`) | a **Merge Exception** document (§6 I-1) |
| K4 Lifecycle | Complete / Void / Close | first valid doc-action wins; completed docs immutable (`SQLiteIDEMPIERE`) | a Merge Exception, linked to the winner |
| K5 Hand-off seam | order → shipment → invoice across roles | designated owner node per seam (`ERP §18.5,§18.7`) | queued in the next owner's My Work |
| K6 Geometry | element move/resize | one writer per (discipline × zone) claim; non-owner ops refused (`teams/engine.js:18`) | refused at write time, before work is lost |
| K7 Spatial / schedule join | clash across branches; PERT dep/resource | advisory gate verdict R/O/G (`teams/gate.js`, `pert_gate.js`); goes stale when trunk moves | a BCF-style snag, same Exception anchor as K3 |
| K8 Annotation | post-it, chat | always union | nothing |
| K9 Craft trunk | architect's ARC trunk | exclusive lock with lease + expiry (`G-LEASE-EXPIRY`) | can't start the edit; sees who holds it |

**The rule that makes this work:** classes are **data, not code** — a column on the AD dictionary (`AD_Column` /
`AD_Table`) or the BIM op vocabulary, read by one generic engine. No `if table==...` branch (AD-LAYER LAW §1).

---

## §5 Showstoppers (ranked)

**S-1. Silent overwrite on the ERP side — and it breaks the TWIN rule.**
iDempiere refuses a stale save: `GridTable.java:1692-1700` calls `hasChanged(po)`, which compares the `Updated` and
`Processed` the user loaded against the database (`GridTable.java:3482-3510`), and on mismatch shows
`CurrentRecordModified` and returns `SAVE_ERROR`. `PO.java:423` also does optimistic locking on `Updated`. Our live path
has **no version value at all** (`ERP_MULTIUSER_CONCURRENCY_POC §Concurrency Model Case 2`) and the relay resolves the
same field by arrival order (`§Relay Wiring`). Two users, same order, same field: iDempiere stops the second; we keep it
and drop the first with no message. Under the twin rule this is a SQLite-side defect, not a design choice.

**S-2. Merges don't re-check permissions.** Access, owner and CAS gates run at write time only, and the record gate fails
open (`crud_core.js:1058-1092`). `rebase()` re-inserts foreign ops without calling any gate; `erp_replay.js` guards have
no caller in the sync path; the relay has no role checks. Any device that holds a roster key can get any op folded into
everyone's books. Fix: admission runs **at fold time, fail-closed for foreign ops** (§8 P3).

**S-3. Order is not settled.** C1 above. Until the relay's seq is the only order, compare-and-set results depend on who
sets their clock forward.

**S-4. Version skew across offline devices.** Called "THE hard problem" (`ERP.md §18.7`, `DistributedERP §9-E`). Two
devices on different app versions fold the same ops differently. The live `syncNow` (`crud_overlay.js:1962`) calls
`rebase()` directly and **skips the schema-manifest gate** in `runSync`.

**S-5. Identity is a device, not a person.** One key per browser profile; no person→devices binding; roster distribution
over the relay not built; no ROTATE/REVOKE UI; "who may revoke whom" ⛔ open (`BACKEND_SUBSTRATE_LANE §MH.4`). A person
with a phone and a laptop is two strangers to the system.

**S-6. BIM cannot join the signed log.** `viewer/` and `modeller/` run their own `kernel_ops.js` forks without v2 signing
or the emitter; `teams/` signs with a sha256 stub (`connectors.js:108`). Cherry-pick has no conflict check
(`history_bar.js:337`). Blue-branch accept is single-actor only. Teams fork/merge has **no clickable UI**
(`project_teams_e2e_no_ui_finding`).

**S-7. No production relay.** Server code (roster, TLS) is done but not deployed; static hosts can't order writes; key
custody sits on the device; no encryption at rest (`BACKEND_SUBSTRATE_LANE S-1..S-4`). Today production = one writer per
device.

**S-8. Presence is one-browser only.** `BroadcastChannel` never crosses devices (§BC-CONTROL); Modeller uses `bim_teams`,
ERP uses `bim_erp` (GAP-BUS-SCOPE, `RESUME_TEAMS_OVERLAY.md:96-100`); late joiners stay invisible.

**S-9. Rebase loses fidelity on v1 rows.** Signatures bound to chain position can't survive re-ordering; v2 is opt-in and
only on in `idempiere.html`.

Floors that no design removes (name them, don't chase them): insider fraud, key theft, eviction (`DistributedERP §9-F`);
browser storage ~2GB; save latency >100ms past ~3,954 live docs (`HolyGrail` scale).

---

## §6 Innovations (PROPOSALS — not repo fact)

These go past "async, relay, merge rules". Each one reuses a part that already exists.

- **I-1 Conflict as a document.** A losing K3/K4 op does not vanish; it becomes a **Merge Exception** record with its own
  doc-actions (Accept / Redo / Void), landing in the loser's My Work (`teams/erp/my_work.js`). Same anchor as a BIM clash
  snag. This generalises "accounting is the reconciliation engine" from money to every conflict, and gives auditors a
  list of every disagreement the team ever had.
- **I-2 Claim before you edit.** A short-lived signed `CLAIM` op ("I'm editing order 101 / this wall zone") goes out on the
  presence tier before the edit starts. Others see it as a dot and are steered away. Ownership-first doctrine, extended
  to time. Conflicts get prevented, not resolved. Reuses LEASE ops (`erp_replay.js:72-111`).
- **I-3 Sync preview ("dry-run merge").** The fold is deterministic, so a device can fold `relay ops + my pending ops`
  locally **before** committing the sync and show: "3 merge clean, 1 will be refused, 1 replaces Ali's value". Every
  offline session is a branch; sync is a pull request with a gate verdict. Reuses `teams/gate.js` and the Blue branch.
- **I-4 Policy-stamped ops.** Each op carries `policy_hash` + `kernel_version` (`ERP.md §18.7`). The fold applies each op
  under the rules in force when it was written, with versioned translators between schema versions. This is the only
  known way to make S-4 survivable without forcing everyone to upgrade at once.
- **I-5 Legacy as the conflict oracle.** When the right outcome of a conflict is in doubt, replay the same two operations
  against real iDempiere over the REST bridge (#1701) and copy what it does. Rules are extracted, not invented — the
  twin rule turned into a test generator.
- **I-6 Witnessed sync.** Every sync prints one verdict line per incoming op — `MERGED / REFUSED / RECONCILED / STALE` —
  plus a signed tip that peers swap (gossip) so a relay that shows different histories to different people is caught
  (`poc_equivocation`). "No silent merge" becomes something a witness can assert.
- **I-7 Place is ownership, in both products.** ERP: the branch/van/till owns its writes (`DistributedERP §2`). BIM: the
  (discipline × zone) claim owns geometry. Both are the same "location partitions writers" rule, and both have the same
  hand-off seam. One engine, two scope keys.
- **I-8 Cross-product links.** An ERP op (PO for a duct run) and a BIM op (the duct element) reference each other, so
  "why does this exist / who paid for it" walks both ways — and presence shows the buyer and the MEP engineer on the same
  object. This is the moat named in `teams/IDEAS.md` B.
- **I-9 Erase without breaking books.** Per-person encryption keys; deleting the key erases the person's data while the
  ledger stays byte-identical (`poc_erase`). Answers "immutable log vs GDPR".

---

## §7 Decisions only the user can make (⛔)

1. ⛔ Relay hosting: which compute (OCI Functions / Cloudflare Worker / small VM) — needed for S-7.
2. ⛔ Roster default: open or closed enrolment; who may REVOKE whom (`BACKEND_SUBSTRATE_LANE §MH.4`).
3. ⛔ Person→device enrolment: PIN on device (today) vs a person key that signs each device key.
4. ⛔ First pilot surface: ERP (Sales Order, 2-5 users) or BIM (two disciplines, one building). Recommended: **ERP first** —
   the relay, signing and legacy oracle are furthest along, and S-1 is a twin-rule defect that must be fixed anyway.
5. ⛔ Ratify §3 resolutions C1-C12 (one yes/no each).

---

## §8 Roadmap (PROPOSAL — each phase = spec section → witness → implement → witness log read)

Cut order: **substrate before features, ERP before BIM, invisible before visible.**

| Phase | Goal | Main deliverable | Gate witness (issue it proves) | Deletion budget |
|---|---|---|---|---|
| **P0 Settle** | one doctrine | §3 decisions applied; losing docs corrected; C12 witness made honest | `W-DOCTRINE-XREF` — grep proves no doc still states a retired rule | stale lines removed |
| **P1 One kernel** | BIM can join the log | `viewer/` + `modeller/` `kernel_ops.js` collapsed onto `erp/kernel_ops.js`; v2 signing on everywhere; `teams/connectors.js` uses real ECDSA | `W-KERNEL-ONE` — 3 copies → 1, existing viewer/modeller witnesses byte-identical; `W-TEAMS-REALSIG` — forged stub sig refused | −2 kernel forks, −stub signer |
| **P2 Identity** | person ≠ device | person→device roster; roster travels over the relay; ROTATE/REVOKE gesture | `W-PERSON-2DEV` — one person, 2 devices, ops attribute to ONE person; revoked device refused | — |
| **P3 Admission at fold** | merges obey permissions | gates (access, owner, CAS, lease, scope) run inside the fold, fail-closed for foreign ops; relay seq is the only order; `syncNow` goes through `runSync` schema gate | `W-ADMIT-FOLD` — an op from a role without access is REFUSED on every peer; `W-ORDER-SEQ` — backdated op does not win; `W-SKEW-REFUSE` — mismatched manifest blocks sync | `erp_replay.js` guards get their one caller |
| **P4 Conflict classes** | no silent loss | intent class as AD data; K2 optimistic lock on `Updated` with iDempiere's `CurrentRecordModified`; Merge Exception doc (I-1); per-op verdict line (I-6) | `W-STALE-SAVE-TWIN` — same 2-user same-field save on iDempiere and SQLite gives the SAME refusal; `W-NO-SILENT-LOSS` — N=10 contested edits, every loser has a notice or Exception | `crud_ops.json` "cas"→lease rename |
| **P5 Relay live** | real multi-device | relay on chosen compute (⛔1), TLS, roster auth, encryption at rest, signed-tip gossip | `W-MULTIHOST-SYNC` re-run on prod host; `W-EQUIVOCATE-LIVE` — split-view relay caught | — |
| **P6 Awareness** | see each other | presence + CLAIM ops over the relay; one bus for Modeller + ERP; late-joiner catch-up | `W-PRESENCE-2DEV` — two real contexts see each other; `W-CLAIM-STEER` — claimed record shows holder before edit | −1 duplicate channel |
| **P7 Sync preview** | merge before you merge | dry-run fold + gate verdict shown before sync (I-3) | `W-PREVIEW-EQ-RESULT` — preview verdicts == actual post-sync verdicts, N=10 | — |
| **P8 BIM teams** | two disciplines, one building | (discipline × zone) claims; geometry single-writer; clickable fork / gate / merge; cherry-pick gets the K-class check | `W-BIM-2DISC` — two contexts, two disciplines, real UI clicks, merged tip identical, clash snag raised | Teams static scenario page retired |
| **P9 Cross-product** | the moat | BIM↔ERP op links + unified presence (I-8) | `W-XLINK` — PO ↔ element walk both ways from either app | — |

Denominators (AD-LAYER LAW §2): P3/P4 report "X of N AD tables" honour their class, N from `ad_seed.db`; P8 reports
"X of N op types" from the BIM op vocabulary.

---

## §9 Non-goals

- Real-time co-typing in the same field (Google-Docs style). Business-time, not real-time (`DistributedERP §0`).
- Trustless / blockchain consensus.
- Replacing iDempiere's own multi-user behaviour with a "better" one — the twin rule forbids it.
- Teams in the Viewer (settled out, #664). Viewer's operate-phase people view stays HBA.

---

## §10 Source map (read these before working a phase)

bim-compiler: `docs/DistributedERP.md` · `docs/internal/ERP.md §0.18-0.21, §18` · `docs/HolyGrail.md` hard parts ·
`docs/LocalFirstPriorArt.md` · `prompts/ERP_MULTIUSER_CONCURRENCY_POC.md` · `prompts/RESUME_DISTRIBUTED_BRANCHES.md` ·
`prompts/BACKEND_SUBSTRATE_LANE.md §MH` · `prompts/KERNEL_TIMEBOMB_AUDIT_2026-07-03.md` · `prompts/SQLiteIDEMPIERE.md §P,§6,§21` ·
`build/erp/erp_relay_server.js` · `scripts/poc_*.js`.
bim-ootb `origin/main`: `teams/{DESIGN,PROTOCOL,ROADMAP,IDEAS,ERP_CONTEXT,TEAM_OPTICS}.md` · `erp/kernel_ops.js` ·
`erp/crud_overlay.js` · `erp/erp_sync_fsm.js` · `erp/erp_key_epochs.js` · `erp/ad_access.js` · `erp/erp_replay.js` ·
`common/history_bar.js`.
iDempiere oracle: `org.adempiere.base/src/org/compiere/model/GridTable.java:1692,3482` · `PO.java:423`.
