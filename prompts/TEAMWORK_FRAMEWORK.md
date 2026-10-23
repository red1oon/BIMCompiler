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
| C1 | Who sets order | relay assigns seq (`DistributedERP §6`) | client `(ts,id)` (`teams/engine.js:36-60`, `ERP.md §0.21`) | ~~Relay seq wins.~~ **Revised 2026-10-23 → §11.4: nobody assigns order; it is computed from the ops' own causal links + hashes.** The client clock never decides order. |
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

> **Superseded in cut order by §11.12 (2026-10-23).** The phases below stay as the feature list; §11.12 re-cuts them so
> the local comm layer lands first and the relay site becomes the LAST, configuration-only step.

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

---

## §11 The Local Comm Layer — mechanism spec (2026-10-23, user: *"work out the proposals … before even actually relay site … the outside local comm layer schema to hold state that removes any grunt ID work in any relay"*)

**Status: PROPOSAL / SPEC. No code.** Facts this section rests on were re-read this turn and are cited inline.

### §11.0 The idea in one line

**Every device keeps all sync state in its own local "comm" store, and every op is self-identifying, self-ordering and
self-authorising — so whatever carries the ops (bucket, git repo, shared folder, WhatsApp, a server) only stores and
lists bytes.** No id minting, no sequencing, no dedup, no auth logic, no mapping anywhere outside the devices.

⚠ **Doctrine flag:** `BACKEND_SUBSTRATE_LANE §MH.1` says "only multi-writer sequencing needs the one compute relay" and
"must NOT be re-litigated". This section does not dispute what static hosts can do; it **removes the need for a
sequencer** (§11.4). If ratified, §MH.1's second sentence becomes "no relay needs sequencing logic". ⛔ needs the user's
yes (§11.13 D1) — the user's own request above is the reason it is proposed.

### §11.1 Grunt work today, and who does it after

| Grunt job | Today (EXTRACTED) | After (§ref) |
|---|---|---|
| Op identity | `op_uuid` + local integer `id`; chain hash covers local `id` (`kernel_ops.js:306`) so it changes on rebase | op hash of a signed envelope + `(author, seq)` minted by the author (§11.3) |
| Record identity in ops | ops carry integer `table, id` (`crud_core.js:325,704`); PK is synthesised locally (`crud_core.js:474`) → ids collide across stations (`ERP_PARALLEL_RUN_PILOT §9-R`) | `<table>_uu` only. The CREATE op's uuid already becomes the record's `_UU` (`crud_core.js:475-477`, mirroring `PO.saveNew`). 842 of 845 seed tables have a `_UU` column (`ad_seed.db`, counted this turn). Integer PKs stay a per-device projection detail, never in an op. |
| Legacy iDempiere integer ids | n/a | learned from the REST bridge response and published as a signed `IDMAP` op by the bridge device — the mapping travels as data |
| DocumentNo | four rules (§3 C8) | org/station-level sequence, owned by the station (`IsOrgLevelSequence`, pilot §DECISIONS) — an ownership fact, not a relay job |
| Total order | sequencer arrival order (`erp_sequencer.js:30-42`) or client `(ts,id)` | computed from causal links + hash (§11.4) |
| Dedup | relay dedups by `op_uuid` (`erp_relay_server.js`) | free — an object's name is its hash; the same op can only ever be the same file |
| Who may write | relay checks roster + signature (`erp_relay_server.js:26-50`) | every reader checks, at fold time (§11.6); roster is itself ops (§11.5) |
| Roster distribution | not built (`ERP_MULTIUSER_CONCURRENCY_POC §Explicitly NOT`) | free — ENROLL / REVOKE ops travel in the same stream |
| Revocation position | `id >= revoked[signer]` on one linear log (`erp_key_epochs.js:126`) — a position that moves when logs merge | REVOKE names the revoked device's own last good `seq` (§11.5) — never moves |
| Signatures surviving merge | v1 sigs die on rebase (§5 S-9) | signature is over the envelope, which never changes; local order is a view |

### §11.2 What a pipe must do (the whole relay contract)

Four verbs: `put(name, bytes)`, `get(name)`, `list(prefix)`, and optionally `watch(prefix)` for speed.
**Rule: one writer per name.** Every name sits under the author's own device prefix, so two devices can never write the
same object — the pipe never sees a write conflict, so it never needs locks or merge logic.

```
s/<space>/genesis                         founder-signed space genesis; space id = its hash   (write once)
s/<space>/o/<kid>/<seqFrom>-<seqTo>.<h12>  bundle of that device's ops, encrypted              (write once)
s/<space>/h/<kid>                         that device's signed head {seq, hash, frontier}     (overwrite, single writer)
s/<space>/p/<kid>                         presence + claims, short-lived                      (overwrite, single writer)
s/<space>/k/<ckpt-hash>                   period-close checkpoint                             (write once)
```

Pipes are rated, not trusted — a row per pipe in `cl_pipe.caps`:

| Pipe | Write from a browser? | Freshness | Use |
|---|---|---|---|
| Shared folder (File System Access API / a Drive-synced folder / USB) | yes | seconds–minutes | first build target: no network code at all |
| Clipboard / WhatsApp / email (`#1665` clipboard relay already exists) | manual | human | offline hand-off |
| OCI bucket | ⛔ verify: whether a pre-authenticated request can be scoped to one device's prefix | strong read-after-write | main pipe candidate |
| GitHub repo | not safely (token) — read-only mirror, owner pushes | CDN-cached minutes | backup / public mirror |
| Compute relay (`erp_relay_server.js`) | yes | sub-second, can push | optional "fast pipe" for presence and claims — **another pipe, never a requirement** |

Because names are hashes, **the same bundles can sit on several pipes at once** with no coordination. The existing
3-host replica (W-REPLICA, W-MULTIHOST-SYNC) becomes the default case, not a special one.

### §11.3 The op envelope (v3) — what makes an op self-describing

```
{ v:3,
  space:    <space id>,
  author:   <device kid>,           seq: <n, gap-free per author>,
  prev:     <hash of this author's op n-1>,               // per-author chain: never rewritten
  deps:     [<head hash of each OTHER author I had folded and that changed since my last op>],
  manifest: <schema/kernel manifest hash>,  policy: <policy hash>,          // §11.8
  intent:   <K-class, read from the dictionary>,                            // §4
  target:   { table, uu, cols:[…] },
  base:     <hash of the last op that wrote target.uu>,   // the distributed "Updated" — §11.7
  ts:       <business time, shown to users, NEVER used for order>,
  attrib:   { person_uu, pin_proof? },                    // erp_attrib.js today
  body:     { op_type, params }                           // the current kernel op, ids as UU
}  + sig (ECDSA P-256, existing erp_signer.js)
op hash = sha256(canonical envelope)
```

The kernel's `kernel_ops` row keeps working as the local World log; it stores the envelope hash and the envelope. Its
own `prev_hash` chain becomes a **local** integrity check only. `rebase()` keeps its job (re-fold in the new order) but
never re-signs anything.

### §11.4 Order without a sequencer

1. The ops form a graph: each op points to `prev` (its author's previous op) and `deps` (what its author had already seen).
2. **Order = walk the graph so every op comes after everything it points to; when several ops are ready at once, take
   the lowest op hash first.** Any device holding the same set of ops gets the same order, whatever order they arrived in.
3. A newly arrived op may slot in earlier than ops already folded → re-fold from that point. Checkpoints (§11.10) bound
   how far back that can reach; the measured fold rate (`poc_volume`: 43M ops/s) makes it cheap.
4. **The clock cannot win.** `ts` is not in the ordering at all, which closes the backdating hole in §3 C1.
5. Residual, named: among *truly concurrent* ops (neither saw the other), hash order is arbitrary. An author who did see
   an op but leaves it out of `deps` can try many variants of their own op to sort first. That only matters for K1 cold
   fields, which the doctrine already accepts as low-value. K2–K4 don't depend on hash order (§11.7) — they use `base`
   or an owner.

### §11.5 Identity: people, devices, roster — all as ops

- **Genesis.** The founder's device signs `GENESIS {space name, founder kid, admin person}`. Space id = its hash. Invite
  links carry the space id, which pins the trust root the same way `erp_snapshot_sign` pins a controller key today.
- **Person.** `PERSON {person_uu, ad_user_uu}`, signed by an admin device.
- **Device.** `ENROLL {kid, sig_pub, dh_pub, person_uu}`, signed by an admin or by an already-enrolled device of the
  same person (shows a QR / short code on the new device). A person with a phone and a laptop = one `person_uu`, two
  kids → fixes §5 S-5 with no person-level private key (browser keys are non-extractable, so there can't be one).
- **Roles.** Role grants are ordinary `AD_User_Roles` ops, so "what could this person do *at this op*" is answered by the
  fold itself.
- **Revoke.** `REVOKE {kid, last_good_seq}`. That device's ops up to `last_good_seq` stay valid; later ones are refused on
  every peer, whatever order they arrive in. ROTATE keeps the existing countersign rule (`erp_key_epochs.js:108-112`).
- **Roster = the fold of these ops.** Nothing separate to distribute.

### §11.6 Admission at fold time (closes §5 S-2)

`admit(envelope, world_before)` is a pure function run on every op, on every device, in fold order:

| Check | Source of the rule | On failure |
|---|---|---|
| signature valid, `kid` enrolled and not revoked at this `seq` | §11.5 | REFUSED `sig` / `revoked` |
| author chain intact (`prev` matches, no second op with the same `seq`) | §11.3 | REFUSED + equivocation record (§11.9) |
| every `deps` hash present | §11.3 | PARKED `deps` (not folded yet, fetched from other pipes) |
| `manifest` known | §11.8 | PARKED `schema` |
| person's role may write this table/record/org at this point | `ad_access.js` `gateRecord`, run on `world_before` | REFUSED `access` — **fail-closed for foreign ops** (today it fails open, `crud_core.js:1058-1092`) |
| owner / compare-and-set / lease | `erp_replay.js:42-108` (gets its first caller) | per §11.7 |
| `scope` | `erp_seam.js:36-49` | REFUSED `scope` |

Every op ends with exactly one verdict in `cl_verdict`: `MERGED / REFUSED / RECONCILED / PARKED / STALE`. A witness can
count them; a sync that judged zero ops prints `INCONCLUSIVE` (PRIMAL LAW §4).

### §11.7 Conflict mechanisms (§4 classes, worked out)

- **K2 — matching iDempiere's stale-save refusal.** iDempiere compares the `Updated`/`Processed` the user loaded with the
  database (`GridTable.java:3482-3510`) and refuses with `CurrentRecordModified` (`GridTable.java:1692-1700`); `PO.java:423`
  locks on `Updated`. The distributed equivalent is `base`: the hash of the last op that wrote the record when the user
  opened it. 838 of 845 seed tables have `Updated` (counted this turn).
  - **When a pipe is reachable:** on Save, read the record's latest known `base` (fresh `h/` heads). If it moved, show
    iDempiere's own `CurrentRecordModified` and refresh — **same moment, same message as legacy.**
  - **When two saves cross anyway** (offline, or inside the pipe's delay): handled the Git way — see **§11.15**. Neither
    save silently wins; both are kept; the record shows iDempiere's `CurrentRecordModified` and the author resolves.
    *(Superseded 2026-10-23: the earlier "keep the one that sorts first, refuse the other" rule.)*
- **K3 — invariants (stock, credit, allocation).** Each guarded resource has an owner (a device or role), set by a signed
  `OWNER` op. A non-owner writes `REQUEST`; only the owner's `GRANT` / `DENY` op settles it; until then the requester's
  effect is shown provisional. That is the existing reservation guard (`DistributedERP §4` G-RESERVATION), carried as ops.
  Customer-wide entitlements use the quorum pattern (`poc_quorum_cas`). No pipe arbitrates.
- **K4 — doc-actions.** Complete/Void/Close need `base` = the document's current state; the second one becomes `REFUSED`;
  completed documents are immutable, so there's nothing to merge after that.
- **Merge Exception (I-1), twin-native.** No new window: K3/K4 losers raise an iDempiere **Request** (`R_Request`, window
  201 *Request* — present in `ad_seed.db`) linked to both records, routed to the loser's My Work. K1/K2 losers get a
  Notice. A witness counts them.
- **K6/K9 — geometry and craft trunk.** Owner = the `(discipline × zone)` or trunk claim, set by a signed `OWNER` op from
  the project lead. Non-owner geometry ops are refused at write time (`teams/engine.js:18` owner-gate), so no work is
  lost. A craft lock is a lease the owner grants (`LEASE` ops, `erp_replay.js:72-111`).

### §11.8 Version skew (§5 S-4)

- Every op carries `manifest` = the hash of the schema + handler set that wrote it.
- An admin `ADOPT {manifest}` op says which versions the space accepts. A device may only author under an adopted
  manifest, so the mixed-version window stays bounded.
- Unknown manifest → PARKED `schema` with the message "update the app to see 3 ops from Ali". **Never folded wrong,
  never dropped.**
- Known older manifest → fold through a registered translator (`cl_manifest.translators`), or under that version's
  frozen handlers (`ERP.md §18.7`).
- `syncNow` must stop bypassing the schema check (`crud_overlay.js:1962` calls `rebase` directly, skipping `runSync`).

### §11.9 Honesty of pipes and authors (§3 C4, I-6)

- **Content-addressed names + signed envelopes:** a pipe cannot forge, alter or reorder anything. Its only power is
  **withholding**.
- **Withholding shows itself:** a `deps` hash I can't fetch is a gap → `cl_missing`, fetched from other pipes. Heads
  (`h/<kid>`) seen on different pipes are compared in `cl_head_seen`; two different signed heads for the same author and
  seq is proof.
- **An author who forks their own chain** (two ops, same `seq`) has signed both → stored as proof in `cl_equivocation`, a
  Request to the admin, and further ops from that kid are PARKED until the admin rules.
- This makes "the relay is untrusted" actually true, which `teams/DESIGN §7` claimed and `poc_equivocation` showed was
  not true without gossip.

### §11.10 Compaction and joining late

- A period-close checkpoint (`erp_period_close.js`, W-PCLOSE) is signed by the controller role and records the frontier
  it covers.
- A new device fetches the latest checkpoint and the bundles after its frontier — measured ~52–59× faster than replaying
  from genesis (W-PCLOSE browser POC).
- Bundles before a checkpoint can be archived from fast pipes.

### §11.11 The local comm store (`comm.db`, separate from the business DB)

Sits **outside** the kernel. The kernel only ever sees admitted ops, in order. Same storage mechanism the ERP uses today
(sql.js + IndexedDB records, append-only per #913).

```sql
-- trust and identity (a view rebuilt from ops; kept for speed)
cl_space      (space_id PK, genesis_hash, founder_kid, name, pinned_at)
cl_person     (person_uu PK, ad_user_uu, enrolled_by_op)
cl_device     (kid PK, sig_pub, dh_pub, person_uu, enrolled_by_op, revoked_after_seq NULL, status)
cl_manifest   (manifest_hash PK, kernel_version, adopted_by_op, translators_json)
cl_owner      (resource_key PK, owner_kind, owner_ref, set_by_op)              -- K3/K6/K9 owners

-- me as an author
cl_self       (space_id, kid, next_seq, head_hash, dh_priv_ref)

-- everything received or written
cl_op         (op_hash PK, space_id, author_kid, author_seq, prev_hash, deps_json,
               manifest_hash, intent, target_table, target_uu, base_hash, ts_business,
               envelope BLOB, sig, first_pipe, received_at,
               state CHECK(state IN ('RECEIVED','VERIFIED','PARKED_DEPS','PARKED_SCHEMA','ADMITTED','REFUSED')),
               UNIQUE(author_kid, author_seq))           -- a second op at the same seq trips this = equivocation
cl_frontier   (author_kid PK, contiguous_seq, head_hash)  -- what I have, per author
cl_missing    (op_hash PK, wanted_by_op, first_seen, tries)
cl_verdict    (op_hash PK, fold_pos, verdict, reason, notice_uu NULL, request_uu NULL, world_hash_after)
cl_equivocation(author_kid, seq, hash_a, hash_b, detected_at, PRIMARY KEY(author_kid, seq))

-- pipes
cl_pipe       (pipe_id PK, kind, url, caps_json, enabled)
cl_pipe_cursor(pipe_id, author_kid, listed_to_seq, etag, last_ok, PRIMARY KEY(pipe_id, author_kid))
cl_outbox     (bundle_name PK, from_seq, to_seq, bundle_hash, pipe_id, state, tries)
cl_head_seen  (author_kid, pipe_id, seq, head_hash, sig, seen_at, PRIMARY KEY(author_kid, pipe_id))

-- awareness (short-lived, never folded into the books)
cl_claim      (author_kid, target_key, kind, expires_at, seen_at, PRIMARY KEY(author_kid, target_key))
cl_checkpoint (ckpt_hash PK, frontier_json, signed_by, world_hash)
```

**Sync loop** (identical for every pipe):
`list` new names → `get` → decrypt → verify → `cl_op` → resolve deps → **preview fold on a throwaway copy** (I-3; the same
throwaway-DB pattern `erp_persist_ui` restore already uses) → show verdicts → admit into the kernel → write `cl_verdict` →
`put` my new bundle and head.

**Encryption (pipe sees only ciphertext):** bundles are encrypted with a space key; the key is wrapped to each device's
`dh_pub` inside its ENROLL op. P-256 signing keys can't do key exchange, so each device holds a second ECDH key.
Personal fields can later be encrypted under a per-person key, so deleting that key erases the person while the books
stay identical (I-9, `poc_erase`).

### §11.12 Revised cut order — the relay site comes last

| Step | Builds | Needs network? | Gate witness (the issue it proves) |
|---|---|---|---|
| CL0 | ratify §3 + §11.13 | no | — |
| CL1 | envelope v3 + UU-only refs, in node | no | `W-UU-NO-COLLIDE` — two stations each create order "1" today → ids collide (reproduce RED first); with v3 → two distinct records |
| CL2 | deterministic order | no | `W-ORDER-PERMUTE` — N=10 authors, 100 random arrival orders → one identical tip; a backdated `ts` changes nothing |
| CL3 | `comm.db` + in-memory pipe + shared-folder pipe | no | `W-FOLDER-2CTX` — two real browser contexts converge through a folder only |
| CL3b | GitHub-repo pipe (§11.16) + enrol-by-own-device (§11.5) | yes (GH API) | `W-GH-PIPE-2DEV` — laptop + phone: enrol by code, edit, converge to one tip; `W-GH-BUDGET` — writes per minute/hour logged and under §11.16 caps |
| CL3c | Gmail postbox pipe (§11.19) | yes (Apps Script) | `W-GMAIL-DELIVER` — 50 test bundles by email: delivered / spam / blocked counted (must be 50/0/0); `W-POSTBOX-BOARD` — panel board == the signed heads posted, verified on the device |
| CL-P | Team Panel (§11.17) + EODA rules (§11.18) | reads a pipe | `W-PANEL-ADVICE` — fixed scenarios (only local work / unsent stock doc / open conflict / others touched my record) each give the expected advice and reason; zero pending prints `INCONCLUSIVE`, not "all good" |
| CL4 | identity as ops + admission at fold | no | `W-ADMIT-FOLD` — a no-access role's op REFUSED on every peer; `W-REVOKE-SEQ` — the revoke cut-off holds under any arrival order |
| CL5 | K2 `base` + Notice; K3/K4 owner + Request | no | `W-STALE-SAVE-TWIN` — same two-user save on iDempiere and on SQLite → same `CurrentRecordModified`; `W-NO-SILENT-LOSS` — N=10 contested, every loser has a Notice/Request |
| CL6 | manifest parking + translators | no | `W-SKEW-PARK` — an op from a newer app parks, then folds after upgrade, same tip as a fresh device |
| CL7 | equivocation + withholding detection | no | `W-PIPE-WITHHOLD` — a pipe hiding one bundle is detected and healed from a second pipe |
| CL8 | encryption | no | `W-PIPE-OPAQUE` — pipe contents reveal no field values |
| CL9 | **add more pipes** (OCI etc.) = add rows to `cl_pipe` | yes | `W-MULTIHOST-SYNC` re-run through the comm layer |
| then | P6 presence/claims, P7 preview UI, P8 BIM teams, P9 cross-product (§8) | | |

Each step names what it deletes (AD-LAYER LAW §4): CL4 removes relay-side auth from the required path; CL2 removes the
need for `erp_sequencer.js`; CL1 removes integer ids from ops.

### §11.13 Decisions needed (⛔, in addition to §7)

**Answered by the user 2026-10-23:**
- **D1 ✅** No sequencer — order is computed from the ops (§11.4). User: *"1,2 ID, UUID, yes"*. Amends
  `BACKEND_SUBSTRATE_LANE §MH.1` (second sentence → "no relay needs sequencing logic").
- **D2 ✅** UU-only references in ops (§11.1), one-time wrap-and-sign import of existing logs per device. Same answer.
- **D3 → proposal §11.15** User: *"Do offer your idea. U know our direction is to have integrity and guarantee of
  delivery and clarity as Git does it."*
- **D4 ✅** Admin OR the person's own already-enrolled device may enrol a device. User: *"Yes, can test ie my mobile
  device or any other as this is just POC."* → the first two-device test is the user's laptop + phone (§11.16, CL3b).
- **Pipe:** User: *"we can use GH repo if it allows and no breach any limit caps such as LFS"* → §11.16.
- **✅ Chooser + repo:** User: *"Yes to whatever u need."* → the mine/theirs/before chooser (§11.15) is approved under the
  twin rule as a user-directed addition; creating the private pipe repo (§11.16) is approved — done when CL3b starts.
- **Team Panel, check-in, EODA, Gmail postbox:** User, same day → §11.17–§11.19 (quotes there).

### §11.14 Risks this design adds (named, not hidden)

- A long-parked op (missing deps) holds back every op that depends on it. Mitigated by several pipes; it must surface
  as a visible PARKED count, never as a silent stall.
- `deps` lists grow with team size. Only list heads that changed since your last op; checkpoints reset the baseline.
- Re-fold cost when a late op slots in early: bounded by checkpoints. Log it as a `§COMM_REFOLD from=<pos> ops=<n> ms=<t>`
  line (PERF BUDGET).
- Browser storage for `comm.db` comes out of the same ~2GB limit (`HolyGrail` scale). Archive bundles behind checkpoints.
- Hash-order grinding on K1 cold fields (§11.4 point 5) — accepted floor, same class as `DistributedERP §9-F`.

### §11.15 Offline saves the Git way (proposal for D3)

The user's bar: **integrity, guaranteed delivery and clarity, as Git does it.** Git never throws away a commit, never
lets a push silently overwrite someone else, and always tells you where you stand (`git status`). The mapping:

| Git | Here |
|---|---|
| commit (local, hashed, permanent) | **Save** = a signed v3 op in `cl_op`, permanent from that second, even offline |
| `git status`: ahead / behind | status line: **"2 to send · 0 to receive · 1 conflict · 0 waiting"** |
| push | send bundle to the pipe(s) |
| push rejected (remote moved) | a crossed save becomes a **conflict**, never a silent refusal |
| merge of different hunks = automatic | both saves changed **different columns** of the record → both apply, no conflict (`target.cols`) |
| merge conflict on the same lines | both changed the **same column** from the same `base` → conflict |
| you resolve, then commit the merge | a `RESOLVE` op that cites both ops → it comes after both, so everyone lands on the same answer |
| `git fsck` | `W-FSCK`: every author chain, every signature, every `deps` link checked |

**The crossed-save rule (replaces "first by hash wins"):**
1. Both ops are kept, signed and delivered. Nothing is lost.
2. For the conflicting columns only, the shared record **keeps the `base` value** and is marked **conflicted**. Other
   columns from both saves apply normally.
3. Both authors get iDempiere's own `CurrentRecordModified` message the next time the record is open — the same words a
   legacy user sees. Each also gets a Notice (window 193) listing *mine / theirs / before*.
4. Either author (or anyone with write access) resolves by picking per column: mine, theirs, or a new value. That writes
   one `RESOLVE` op.
5. If two people resolve at the same moment and disagree, it's just another conflict on the same record. Every round
   needs a human, and each round is visible.

Why this is better than picking a winner: no arbitrary hash winner, so the hash-grinding residual in §11.4 point 5 no
longer applies to guarded fields. Every device shows the same thing. And it matches what iDempiere does for a legacy
user: the second save is not allowed to overwrite silently.

**Twin check:** when a pipe is reachable at save time, the user gets the refusal **at save**, exactly as in iDempiere
(§11.7 first bullet). The conflicted-after-sync state happens only offline, which iDempiere has no equivalent for, and it
reuses iDempiere's message and Notice window rather than inventing new screens. The only new element is the
mine/theirs/before chooser inside the record window. ⛔ This is the one piece the user should confirm under the twin rule.

**Guaranteed delivery — proven by the receiver's signature, not by a server's word:**

| State | Meaning | Proof |
|---|---|---|
| SAVED | signed op in my `cl_op` | my signature |
| SENT | bundle stored on ≥1 pipe | read-back: `get(name)` returns bytes whose hash = the name |
| STORED | on ≥K pipes (K configurable) | same read-back per pipe |
| SEEN | a peer has it | **that peer's signed head lists my `seq` in its frontier** — a receipt signed by the receiver |
| SETTLED | folded on every known peer with verdict MERGED | all known peers' heads cover it, and no conflict is open on its target |

A save shows its state like message ticks. A save stuck below SEEN past a set time raises a visible warning — never a
silent stall. Witness: `W-DELIVERY-RECEIPT` — kill the pipe mid-send; the state must stop at SAVED and complete after the
pipe returns, with no duplicate and no loss.

### §11.16 GitHub repo as the first pipe (user, 2026-10-23)

**Verdict: yes for the POC and small teams, within the caps below. It uses no LFS at all.**

**Caps (quoted from GitHub docs, fetched 2026-10-23):**
- Repository limits (`docs.github.com/…/repository-limits`):
  - 10 GB on-disk; objects recommended ≤1 MB, refused at 100 MB; push ≤2 GB.
  - ≤3,000 entries per directory; 5,000 branches.
  - **6 pushes per minute per repository**; 15 git reads per second per repository.
  - The page also advises keeping generated files "outside of Git, such as in object storage".
- REST rate limits (`docs.github.com/…/rate-limits-for-the-rest-api`):
  - 5,000 requests per hour per authenticated user; 60 per hour unauthenticated.
  - **80 content-generating requests per minute and 500 per hour**; ≤100 concurrent.
  - 900 points per minute (GET costs 1, writes cost 5).

**How the pipe fits inside them:**
- **A dedicated private repo** (not bim-ootb): no Actions, no Pages, no `.gitattributes` LFS rule. Plain git blobs never
  touch LFS storage or bandwidth.
  - ⛔ The user creates it, or approves its creation; that's an outward-facing step.
- **One branch per device**, `dev/<kid12>`: one writer per ref, so devices never collide.
  - A write = Git Data API blob → tree → commit → fast-forward ref update (no force). That's about 4 write requests per
    send.
  - The ref update only moves forward from the device's last known head, so a device's own second tab can't fork its
    chain. That is Git's own check working for us.
- **Reads:** one call lists every device's head (`git/matching-refs/heads/dev/`); only changed heads are fetched.
  - ⛔ verify: whether conditional (ETag/304) reads count against the 5,000/hr limit.
- **Budget rule, enforced in the comm layer and logged** as `§GH_BUDGET pushes_min=… content_hr=…`:
  - Saves are batched into one bundle per send.
  - Per-device minimum gap = max(60 s, active devices × 10 s), so the whole team stays under 6 pushes per minute.
  - The 500/hour content limit is **per GitHub account**: if every POC device uses the user's own token, they share it.
    About 100 sends per hour for the whole team.
- **Size:**
  - Bundles stay ≤256 KB; directories are sharded by seq range so none passes 3,000 entries.
  - At each period close, the checkpoint seeds a **fresh repo** and the old one is archived read-only. Deleted files stay
    in git history, so rotation, not deletion, keeps size bounded.
- **Tokens:** a fine-grained token, one repo, contents read/write, kept in the device's IndexedDB.
  - A leaked token can delete or rewrite other branches, but it **cannot forge anything** (signatures +
    content-addressed names).
  - Every owner re-pushes its own branch when the remote head is not an ancestor of its local head, so damage self-heals
    and shows in git history.
  - ⛔ verify: whether branch protection is available on this account's private repos.
- **Presence does not go through GitHub.** Six pushes per minute can't carry heartbeats. On the GH pipe, presence is coarse
  ("Ali last sent 2 min ago", read from heads). Live presence and claims need a fast pipe later (P6).
- **Ceiling, named honestly:** roughly 10–30 active writers per repo at a 1–5 minute send gap. Past that, either split
  the space across several repos (pipes are additive and names are content-addressed, so this is free) or add OCI (CL9).

### §11.17 Team Panel — the post office (user, 2026-10-23)

> User: *"some 'Team Panel' page where users can see status of their last clock in, and how long has elapsed, and whether
> it is recommended to check in to refresh which is dependent on what they been doing since. Some are totally local …
> their comm can be minimal ie just to update status such as 'Yes, here is me, and i do have transactions in attachment'."*
> … *"The panel page fetches from the relay that has latest status to inform the user. It is like a post office to check
> mail from others and to note your visit."*

**A visit = one check-in = one exchange with the post office:**
1. **Note my visit:** post my signed head — *"I'm here; my last op is seq N; I have seen everyone up to frontier F"* — plus
   a bundle of my shared ops since my last visit, if I have any. A visit with no ops is still worth making: the frontier in
   it is everyone else's **SEEN receipt** (§11.15).
2. **Collect my mail:** read the board (every device's latest signed head) and fetch only the bundles I don't have.

The relay holds **only the latest signed head per device and the bundles**. It computes nothing; the panel verifies every
head itself. On GitHub the board is one `matching-refs` call (§11.16); on the Gmail postbox it's one `doGet` (§11.19).

**What the panel shows** (one row per person; their devices fold under it):

| Column | Source |
|---|---|
| Last visit, time elapsed | that person's newest signed head, `ts_business` (shown, never used for order) |
| Devices | `cl_device` for that `person_uu` |
| Sent / waiting to send | my own `cl_outbox` (my row only) |
| Mail for me | ops on the board that touch records I own, have open, or am named on; open conflicts; Notices and Requests addressed to me |
| Delivery of my last send | SENT / STORED / SEEN by whom / SETTLED (§11.15) |
| **Advice** | ✅ no need · 🟡 check in soon · 🔴 check in now — **always with the reason** |

**What counts as "totally local":** a new intent class **K-LOCAL**. These ops never leave the device unless the user
promotes them:
- private post-its (`teams/overlay/postit.js` is already private-first);
- view state and history-knob moves;
- unsaved drafts.

They show on the panel as "14 local only", and they never raise the advice level.

**How advice is worked out:** a pure function over `comm.db` + the board + the EODA rules (§11.18). It uses:
- what I've done since my last visit (the count and class of my unsent ops);
- what others have done that touches my work (from the board);
- the time elapsed.

Same inputs, same advice, so a witness can assert it. Example: *"Last visit 3 h 12 min ago. Since then: 14 local only,
3 to send — 1 Shipment moves stock. Rule `EODA-STOCK-2H`: stock documents must be sent within 2 h → 🔴 check in now."*

**Where it lives:** one shared page used by both ERP and Modeller (the Teams home, `project_teams_people_dimension_architecture`).
A status chip ("🔴 3 to send") sits in each app's status line and opens the panel. This is a user-directed addition with
no legacy screen, like the chooser in §11.15.

### §11.18 EODA — End-Of-Day Activity rules, as iDempiere Alerts

- **The term:** EODA is the user's own; it isn't in the repo yet.
- **The doctrine behind it:**
  - the daily one-way circle, branch → HQ → branch (`DistributedERP §1`);
  - end-of-day van settlement (`DistributedERP` "Van / DSD").
- **Mechanism, copied from legacy:** iDempiere already runs scheduled rule checks.
  - The **Alert** window (276) holds `AD_Alert` + `AD_AlertRule` (SQL rules with recipients).
  - The **Alert Processor** window (312) and the **Scheduler** window (305) run them. All three are in `ad_seed.db`,
    checked this turn.
  - An EODA rule is an **AD_AlertRule row** whose SQL runs over the local world + `comm.db` views. No new rule engine, no
    per-rule code (AD-LAYER LAW).
- **What it produces:** a hit raises the panel advice with the rule's name as the reason, plus a Notice.
- **Example rules (illustrative, to be set per client):**
  - `EODA-STOCK-2H` — a stock-moving document not sent within 2 h.
  - `EODA-CONFLICT` — any open conflict → check in now.
  - `EODA-DAYCLOSE` — before a station's day close, every shared op must be SEEN by HQ. The day-close op is refused
    until it is. This is the delivery guarantee turned into a business rule.
  - `EODA-IDLE` — no visit in 24 h while holding unsent shared ops.

### §11.19 Gmail as a post box (user, 2026-10-23)

> User: *"I can give a gmail acct that can auto respond and act as a post box. Email comm is already in iDempiere legacy,
> so we be simply copying and double it up as a convenient lazy but solid relay … we can encrypt payload … not sure if
> gmail has filters to suspect it as malicious."*

**The legacy precedent is exact.**
- iDempiere sends mail through `org.compiere.util.EMail` with client SMTP (`AD_SMTP`) and has a Mail Template window (204).
- It **reads a mailbox and turns mails into Requests** in `RequestEMailProcessor`. Its own doc line gives the example
  `imaps://imap.gmail.com:993` (`org.adempiere.base.process/.../RequestEMailProcessor.java:58`), with the Request Processor
  window (203).
- So "post box by email" is twin-native, and the legacy server can join as a peer through that same path.

**Three layers on the one Gmail account:**

| Layer | How | Who uses it |
|---|---|---|
| **A. Auto (the panel)** | an Apps Script web app owned by the postbox account: `doPost` = put, `doGet` = list / get / board. Bundles are stored as files in the account's Drive. | every browser device; no email involved, so no spam filter is involved |
| **B. Email visit** | mail to the postbox: subject `[BIMTEAM] <space12> <kid12> <seqFrom>-<seqTo>`, plain-text body = the signed head, attachment = one `.bimpack`. A time trigger (every 5 min) files it into the same Drive store. | phone users sharing through the Gmail app (Web Share with files); anyone offline-first |
| **C. Legacy** | iDempiere SMTP out to the postbox; `RequestEMailProcessor` over IMAP in | the bridge / legacy server |

- **Not Gmail's vacation responder:** it can't attach files and replies at most once per sender every few days. The
  "auto respond" is the Apps Script trigger.
- **Replies only when needed:** a receipt mail goes back only on path B. Path A users read the board instead.

**Will Gmail treat it as malicious?** What Gmail says it blocks (`support.google.com/mail/answer/6590`, fetched
2026-10-23):
- executable and script types (`.exe .js .bat .jar .apk .msi .ps1 …`);
- those types inside archives;
- **password-protected archives with archived content**;
- documents with malicious macros.

A `.bimpack` is **one encrypted binary file, not an archive, with an extension not on that list**, so none of the stated
rules match.

What the page does **not** say is how Gmail treats an encrypted non-archive file it can't scan. That's ⛔ unverified, so
it gets a witness, not a guess: `W-GMAIL-DELIVER` sends 50 test bundles and counts delivered / spam / blocked. Mitigations
on the postbox:
- a filter `subject:[BIMTEAM]` → *Never send to Spam*, label it, skip the inbox;
- plain text only, no links;
- senders are the team's own Gmail accounts, so SPF/DKIM pass;
- path A avoids mail scanning entirely.

**Caps** (Apps Script quotas, `developers.google.com/apps-script/guides/services/quotas`, fetched 2026-10-23, consumer
gmail.com vs Workspace):

| Quota | gmail.com | Workspace |
|---|---|---|
| Email recipients per day | **100** | 1,500 |
| Gmail read/write per day | 20,000 | 50,000 |
| URL fetch per day | 20,000 | 100,000 |
| Trigger runtime per day | 90 min | 6 h |
| Per run | 6 min | 6 min |
| Attachments per message | 25 MB total | 25 MB total |

- **100 recipients a day** is why receipts go by mail only on path B.
- Drive file-creation limits aren't listed on that page (⛔ verify). The postbox logs its own counts as
  `§POSTBOX_BUDGET put_day=… mail_day=… trigger_min=…`.

**Security:**
- Payloads are AES-GCM under the space key (§11.11), so Google sees only ciphertext.
- Metadata in the subject (device id, seq range) is the only clear text.
- The web app URL carries a space secret, to keep strangers from filling the quota.
- Integrity never depends on Google: the name is the hash, the content is signed, and readers verify everything.

**What we need from the user** (when CL3c starts): the postbox Gmail address, and one-time installation of the Apps Script
in that account. The script will be written into the repo for them to paste; it can't be installed from outside the
account.

**Order of pipes:** GitHub first (CL3b): no script to install, and Git's own forward-only ref check. Gmail second (CL3c):
adds the email path, phone sharing and legacy. **Both carry identical bundles**, so a device can use either or both.

### §11.20 Lineage: from a message broker to no broker (user, 2026-10-23)

> User: *"I like the novelty of such an idea when i was setting up ActiveMQ for Unicenta POS integration, where i see we
> can remove heavy costly servers and have just minimal low noise comm."*

There are three steps, and the repo already records the first two:
1. **Broker as server.** Legacy iDempiere replicates over JMS / ActiveMQ topics: `TopicExportProcessor`, `MultiplePublisher`
   (`org.adempiere.replication`) and `TopicImportProcessor`, `TopicListener` (`org.adempiere.replication.server`).
   The user ran the same pattern for Unicenta POS.
2. **Broker as dumb log.** `DistributedERP §6` keeps "the ActiveMQ job" — accept, **assign a total order**, persist and
   fan out — but strips the business logic.
3. **No broker.** D1 (§11.4) removes the one job step 2 kept, total order. What's left is storing bytes, which any pipe
   can do (§11.2).

Every guarantee a broker gives still holds, but it comes from the data, not the server:

| ActiveMQ gives | Here, from |
|---|---|
| durable queue | write-once, content-addressed bundles on ≥1 pipe (STORED, §11.15) |
| per-producer order | author `seq` + `prev` chain (§11.3) |
| global order | computed from `deps` + hash (§11.4) — no one assigns it |
| durable subscriber cursor | `cl_frontier` / `cl_pipe_cursor` |
| consumer ack | the receiver's signed head frontier (SEEN, §11.15) |
| exactly-once via idempotent consumer | name = hash; the same op can't be applied twice |
| dead-letter queue | PARKED / REFUSED with a reason (`cl_verdict`, §11.6) |
| broker auth | signatures + roster-as-ops, checked by every reader (§11.5–§11.6) |
| broker cluster for availability | several pipes at once, no coordination (§11.2) |

"Low noise" is also measurable:
- One visit = one head + at most one bundle (§11.17).
- Local-only work never travels (K-LOCAL).
- The GitHub budget rule keeps a whole team under 6 pushes a minute (§11.16).

### §11.21 What SQLite adds to relay and folding (user, 2026-10-23: *"We can look into how SQLite further helps such data relay or folding"*)

PROPOSALS. Each states what exists today and what needs checking.

1. **A bundle is a tiny SQLite file.**
   - A `.bimpack` = encrypted bytes of a SQLite file with one `ops` table (envelope columns from §11.3).
   - The receiver decrypts, `ATTACH`es it and runs one `INSERT INTO cl_op SELECT … WHERE op_hash NOT IN cl_op` — no
     parser, typed columns, and it can be inspected with any SQLite tool.
   - A content hash over the file bytes is only stable if the file is written canonically (fixed page size, rows in seq
     order, no free pages; `VACUUM INTO`). ⛔ verify byte-stability across sql.js versions. Otherwise hash the canonical
     row stream, not the file.
2. **`comm.db` and the world DB in one transaction.**
   - Attaching `comm.db` to the business DB lets "admit op → write to the kernel → write verdict → move frontier" commit
     as one transaction, so a crash can't leave an op half-admitted.
   - SQLite only makes multi-database transactions atomic outside WAL mode, and the in-browser persistence layer
     (IndexedDB records, #913) must keep that unit. ⛔ verify on the live persistence path.
3. **Sync questions become SQL.**
   - "What am I missing" = frontier vs board heads.
   - "Which deps are absent" = `deps_json` joined against `cl_op`.
   - "What touches my records" = `target_uu` join. Panel advice reads these.
   - EODA rules are already SQL (`AD_AlertRule`, §11.18), so they run on the same views.
4. **The checkpoint is a SQLite file.**
   - At period close, `VACUUM INTO` writes the folded world as one file, hashed and signed by the controller (W-PCLOSE
     already folds and signs the balances).
   - A new device downloads that one file plus the bundles after it. Bootstrap from a checkpoint is already measured at
     ~52–59× faster than from genesis.
5. **Read history without downloading it.**
   - The viewer already reads SQLite over HTTP range requests (`viewer/lib/httpvfs.js`). The same trick lets a static pipe
     serve an **archive checkpoint** that the panel or an auditor queries page by page — still no compute on the host.
   - ⛔ verify that `raw.githubusercontent.com` and the Apps Script / Drive path honour `Range` (OCI does).
6. **Search the mail.** FTS5 is already shipped (`erp/lib/sql-wasm-fts5.*`, `erp/erp_search.js`). Index op summaries and
   Notices in `comm.db`, so "what did Ali change on order 101 last week" is one query.
7. **SQLite's own change-tracking — a known option, not yet available.**
   - SQLite's *session* extension records row changes as a changeset and applies them with built-in conflict kinds (data,
     not-found, conflict, constraint). That could speed up projection catch-up between checkpoints.
   - It is **not** our source of truth: it moves state, and we move ops (doctrine §2.4).
   - Our shipped builds show no changeset symbols (`erp/sqljs/sql-wasm.wasm`, `erp/lib/sql-wasm-fts5.wasm`, checked this
     turn), so it would need a custom build. Park it until the fold is measured too slow.
8. **A determinism rule for folding in SQL.**
   - A fold done in SQL must give the same bytes on every device. So: no `random()`, no `datetime('now')`, no `ORDER BY`
     without a unique key, no reliance on `rowid`, and no float money (cents as integers, as the period-close already does).
   - Witness `W-FOLD-SQL-DET`: the same op set folded on two engines (node + browser sql.js) gives the same
     `projectionHash`.

**Recommended first use:** items 1 and 4. They turn the bundle and the checkpoint into ordinary SQLite files, which
every later step reuses.

### §11.19a Amendment — Gmail is a log, the repo holds the files (user, 2026-10-23)

> User: *"Perhaps gmail can have links to the repo of those tiny SQL scripts. Gmail merely act as a log."*

- **Bundles live only in the pipe repo** (§11.16), as the tiny SQLite files of §11.21 item 1.
- **A visit mail carries no attachment.** The body is the signed head plus links to the bundle files in the repo
  (`…/o/<kid>/<from>-<to>.<h12>.bimpack`).
- **Gmail becomes the post office's visit book:** append-only, searchable, readable by legacy through IMAP
  (`RequestEMailProcessor`).
- **Truth never depends on it:** a link is only a pointer. The reader fetches the file and checks its hash and signature.
- **What this removes:**
  - the attachment-scanning question in §11.19 (no attachments at all);
  - the Drive store;
  - the Apps Script `doPost` path. Apps Script stays optional — only to answer a board query from the log.
- **What's left on Gmail:** the 100-recipients-a-day cap applies only to receipt mails, which become optional.
- **New check:** links to `github.com` in a plain-text body are a mild spam signal. `W-GMAIL-DELIVER` keeps the 50-mail
  count, now with links instead of attachments.

---

## §12 Build spec — CL1 and CL2 (user: *"Proceed."*, 2026-10-23)

**Where:**
- Engine source goes in bim-compiler `build/comm/`, UMD with no DOM, the same pattern as `build/erp/erp_sync_fsm.js`.
- It is ported byte-identical to bim-ootb `common/comm/` at CL3, when browser contexts arrive.
- Witnesses go in `scripts/`; logs in `build/comm/logs/`.
- Nothing is loaded by any live page in CL1/CL2.

**Real code the witnesses run (no stand-ins):**
- kernel: `build/erp/kernel_ops.js` (byte-identical to bim-ootb `erp/kernel_ops.js`, §1);
- rebase: `build/erp/erp_sync_fsm.js`;
- sequencer: `build/erp/erp_sequencer.js`;
- fold: bim-ootb `erp/crud_core.js` `listTip`.

### §12.1 CL1 — envelope v3 + UU-only references

**Fact found while speccing (re-read this turn):** `listTip` already addresses a row by `<table>_uu` when an op carries
`idCol` (`crud_core.js:485-486`). A created row's `_uu` is stamped from the CREATE op's `op_uuid` (`crud_core.js:475-477`).
Its synthetic pk is `-opId` — the **local** row id of the CREATE op (`crud_core.js:441`). `rebase()` deletes and
re-inserts every row in sequencer order (`erp_sync_fsm.js:195-204`), so every synthetic pk can change on sync while the
ops that point at them keep the old number. So **UU addressing needs no fold change**: a v3 op translates to kernel
params `{table, idCol:'<table>_uu', id:<uu>, …}`.

**Module `build/comm/comm_envelope.js`:**
- `canonical(v)` — JSON with keys sorted at every level; refuses `undefined`, NaN and Infinity.
- `hashHex(env)` — sha256 over `canonical(env)` (the `sig` field is excluded).
- `validate(env)` → `{ok, errors[]}`, rules V1–V8:
  - V1 `v===3`
  - V2 `space` is 64-hex
  - V3 `author` is a non-empty kid
  - V4 `seq` is an integer ≥1
  - V5 `prev` is null if and only if `seq===1`, otherwise 64-hex
  - V6 `deps` is sorted, unique, 64-hex
  - V7 `target.table` is lowercase and `target.uu` is UUID-shaped
  - V8 **no device-local id anywhere in `body.params`**: any negative integer is refused as `local-pk-ref`, and so is an
    `id` key for the target.
- `sign(env, signer)` / `verify(env, sig, pubJwk)` — ECDSA P-256 / SHA-256 over `canonical(env)`, the same curve as
  `erp_signer.js`.
- `toKernelParams(env)` — v3 → today's kernel params, addressing the target by `idCol`.
- `wrapKernelOp(row, uuOf)` — today's kernel row → v3 body. This is D2's one-time import. A CREATE takes
  `uu = op_uuid`; an UPDATE/DELETE/DOC_ACTION resolves `uu` from the local row's `_uu`. If it can't be resolved, the row
  is refused, never guessed.
- **Not in CL1:** foreign-key values that point at *device-created* rows (an order line → its header). V8 refuses them,
  so they can't slip through; their `{uu}` form is CL1b.

**Witness `W-UU-NO-COLLIDE` (`scripts/witness_comm_cl1_uu.js`)** — each arm names its issue:
- `§UU-RED` reproduces today's defect. Stations A and B each create one `c_order` and then edit it by its synthetic pk.
  They sync through the real sequencer and rebase, then the real `listTip` folds the result.
  - Expected: B's edit lands on **A's** order.
  - If the defect does not reproduce, the arm prints `INCONCLUSIVE`, not PASS.
- `§UU-GREEN` runs the same scenario with v3 envelopes → `toKernelParams` → the same real rebase and `listTip`.
  - Expected: two rows, distinct `_uu`, and each order carries its own edit.
- `§UU-VALIDATE` checks that V8 refuses a negative-int ref and a missing `target.uu`.
- `§ENV-HASH` checks that the hash is stable under key-order permutation and that any field change changes it.
- `§ENV-SIG` checks that verify passes on the real signature and fails on a tampered body and on a wrong key.
- `§ENV-WRAP` checks that a real kernel CREATE/UPDATE row wraps to v3 with the right `uu`, and that an unresolvable row
  is refused.

### §12.2 CL2 — order without a sequencer

**Module `build/comm/comm_order.js`:**
- `linearize(ops)` → `{order[], parked[], equivocations[]}`.
- Each op is `{hash, author, seq, prev, deps}`. Nothing else is read; `ts` is never read.
- Kahn's walk: an op is ready when its `prev` and all its `deps` are placed; among ready ops the lowest `hash` goes first.
- Ops whose `prev` or `deps` are missing go to `parked`.
- Two ops with the same `(author, seq)` go to `equivocations`, and neither is placed.

**Witness `W-ORDER-PERMUTE` (`scripts/witness_comm_cl2_order.js`):**
- `§ORDER-PERMUTE`: 10 authors and ~200 ops with gossip-shaped deps; 100 random arrival orders → **one** order hash.
- `§ORDER-CAUSAL`: every op is placed after its `prev` and all its `deps`, across all permutations.
- `§ORDER-NO-TS`: the ops' `ts` is a getter that throws, so `linearize` completes only if it never reads the clock.
- `§ORDER-BACKDATE`: an op with `ts=0` that depends on Y is still placed after Y.
- `§ORDER-PARK`:
  - with one op withheld, exactly its causal descendants are parked;
  - once it is re-added, the order equals the baseline.
- `§ORDER-EQUIVOCATE`: two ops at the same `(author, seq)` are reported, and neither is placed.
- `§ORDER-PERF`: `linearize` timing at 10k ops is logged as `§COMM_ORDER ops=… ms=…`.

### §12.3 Results 2026-10-23 — CL1 ✅ DONE (witness), CL2 ✅ DONE (witness)

Both logs were read in full (Log Mandate).

**CL1 — `W-UU-NO-COLLIDE` PASS judged=21 fails=0 red_reproduced=yes**
- Log: `build/comm/logs/witness_comm_cl1_uu.log`.
- Sources: `crud_core` = bim-ootb origin/main sha1 `065b41f1ba98`; `kernel_ops` sha1 `6b77f2ee4120`.
- **The defect is real, reproduced on real code:** `§UU-RED before sync A sees A-1=111 (pk -1) B sees B-1=222 (pk -1)` →
  `after sync A-1=222 (pk -1) B-1=200 (pk -3)`.
  - Station B's edit landed on station A's order, and B's own order lost its edit — on both stations.
  - **This is the live `?relay=` path today** (#913 `syncNow` → `rebase`) for any record created on a device and then
    edited.
  - W-N-CONVERGE never saw it because it edits the seeded order 101, whose pk is a stable positive id.
  - ⚠ Until CL1 is wired into the live write path, relay sync is not safe for device-created records. This finding
    belongs to the `ERP_MULTIUSER_CONCURRENCY_POC` lane too; it is recorded here and not edited into that file (one
    session, one prompts file).
- **Fixed by envelopes addressed by UU, with no fold change:** `§UU-GREEN after sync A-1=111 … B-1=222 … rows=2`. Both
  stations fold identical rows, and every envelope verifies under its author key.
- V6, V7 and V8 refuse unsorted deps, a missing uu and device-local refs. Canonical hash and signature checks hold.
- D2 import works: a real CREATE row wraps to uu = its op_uuid, and a real UPDATE row wraps to the same uu. An
  unresolvable id is refused (`uu-unresolved table=c_order id=-99`).

**CL2 — `W-ORDER-PERMUTE` PASS judged=12 fails=0**
- Log: `build/comm/logs/witness_comm_cl2_order.log`.
- Fixture: 200 signed ops, 10 authors, 197 with cross-author deps.
- **100 arrival orders → `distinct_orders=1`.** 797 causal edges checked, 0 violations.
- `linearize` completes with a throwing `ts` getter, so the clock is never read. A `ts=0` op lands after the op it
  depends on.
- Equivocation is reported (`author=kid-8 seq=2`) and neither forked op is placed.
- Perf: `ops=10000 ms=61.0 heapMB=26`.
- **Measured risk (sharpens §11.14):** withholding ONE op parked **130 of 199** — exactly its causal descendants.
  Gossip-shaped deps spread fast, so a single missing bundle stalls most of the team's later work.
  - This makes CL7 (fetch missing from another pipe) and the visible PARKED count on the Team Panel load-bearing, not
    nice-to-have.
  - Possible mitigation for the CL3 spec: K0/K1 ops whose own `target` doesn't depend on the missing op could fold
    provisionally. That needs a target-level dependency, not author-level gossip — ⛔ design question, not decided.

**Files:**
- `build/comm/comm_envelope.js` (envelope v3)
- `build/comm/comm_order.js` (linearize)
- `scripts/witness_comm_cl1_uu.js`
- `scripts/witness_comm_cl2_order.js`
- no live page loads them yet

**Next:** CL3 — `comm.db` + an in-memory pipe and a shared-folder pipe, ported to bim-ootb `common/comm/`, with two real
browser contexts.

### §12.4 Build spec — CL3: `comm.db` + pipes, two real browser contexts (user: *"proceed"*, 2026-10-23)

**Open question carried forward:** ⛔ whether ops unrelated to a missing op may fold provisionally, which needs
target-level deps (§12.3). It isn't decided, so CL3 keeps author-level deps and **parks**; the PARKED count is reported,
never hidden.

**Modules** (bim-compiler `build/comm/` canonical, copied byte-identical to bim-ootb `common/comm/`):

**`comm_pipe.js`** — the four-verb contract of §11.2: `put(name, bytes)` / `get(name)` / `list(prefix)`.
- `memPipe()` — in memory.
- `httpPipe(base)` — `PUT|GET <base>/f/<name>`, `GET <base>/list?prefix=`. It reaches a dumb file directory served by
  any static/writable host. In the witness that is a ~30-line node folder server with no logic; it is the same contract
  as a bucket.
- `folderPipe(dir)` — node `fs`, for the node witness.

**`comm_store.js`** — the §11.11 tables CL3 needs, on an injected sql.js database:
- Tables: `cl_device, cl_self, cl_op (UNIQUE(author_kid,author_seq)), cl_equivocation, cl_verdict, cl_fetched,
  cl_outbox, cl_head_seen`.
- `author({target, body, intent, base})`:
  - assigns `seq` and `prev`;
  - sets `deps` = other authors' heads that changed since my last op;
  - validates, signs and stores the op as `OWN`.
- `ingest(env, pipe)`:
  - known device + valid signature + valid envelope → `VERIFIED`;
  - a second op at an occupied `(author, seq)` → `cl_equivocation` (the first stays, the second is not stored as an op).
- `order()` → `comm_order.linearize` over OWN+VERIFIED; writes `cl_verdict` as MERGED / PARKED / EQUIVOCATED.
- `sync(pipe)` — the post-office visit, in a fixed order:
  1. publish `d/<kid>` (my public key);
  2. put new bundles and read each back (hash = name) → SENT;
  3. list `d/` and learn devices;
  4. list `o/` and fetch only unseen names;
  5. ingest;
  6. order;
  7. put my signed head `h/<kid>`;
  8. list `h/` and verify heads into `cl_head_seen`.
  - Logs one line: `§COMM_SYNC kid=… sent=… fetched=… ingested=… placed=… parked=… equivocations=…`.
- `delivery()` — per own op: SAVED → SENT (read-back) → SEEN-by-[kid] (that peer's signed head frontier covers my seq),
  the receipt of §11.15.
- **Bundle = a tiny SQLite file** (§11.21 item 1): one table `ops(op_hash, envelope)`.
  - Its name is `o/<kid>/<from>-<to>.<h12>.bimpack`, where `h12` is the first 12 hex of sha256 over the op hashes in seq
    order — the canonical row stream, not the file bytes (§11.21 ⛔ byte-stability).
- **⚠ CL3-only temporary trust:** a device key read from `d/<kid>` is accepted as-is. CL4 replaces it with signed ENROLL
  ops (§11.5). The log prints `§COMM_TRUST mode=CL3-temporary`, so no later reader mistakes it for the real roster.

**Witnesses:**

**`W-STORE-NODE`** (`scripts/witness_comm_cl3_store.js`) — 3 devices over `memPipe` and over `folderPipe`:
- `§STORE-CONVERGE` — after two visits each, every store holds the same op set and the same order hash.
- `§STORE-RECEIPT` — before B visits, A's ops are SENT and not SEEN; after B visits, A sees SEEN-by-B.
- `§STORE-WITHHOLD` — the pipe drops one bundle → descendants PARKED (count logged); the bundle restored → converge.
- `§STORE-EQUIVOCATE` — a device publishes two different ops at one seq → `cl_equivocation` on every peer.
- `§STORE-FORGE` — an op signed by an unknown key, and one with a tampered body, are both refused on ingest.
- `§STORE-INCREMENTAL` — a second visit with nothing new fetches 0 names.

**`W-FOLDER-2CTX`** (bim-ootb `common/tests/witness_comm_cl3_folder.js`):
- Setup: two real Playwright `BrowserContext`s (separate storage, the S5 setting), Chromium with `--disable-gpu`, on
  `common/comm/comm_poc.html`.
- They reach ONE folder only through the dumb folder server — no relay code, no shared storage.
- Each context: mints its own WebCrypto key; creates an order (UU) and edits it; visits.
- Assert:
  - both contexts reach the same op count and order hash;
  - both fold, through the REAL `erp/kernel_ops.js` + `erp/crud_core.js` `listTip`, to identical `c_order` rows with
    each order carrying its own edit — the CL1 defect scenario, now across two real browsers;
  - each context sees the other's receipt (SEEN);
  - the folder holds only `d/ o/ h/` objects.
- Driven through `page.evaluate` on the POC page's API. This is an engine-in-real-browser test, not a UI test; the user
  path is CL-P.

### §12.5 Results 2026-10-23 — CL3 ✅ DONE (witness)

Both logs were read in full.

**`W-STORE-NODE` PASS judged=24 fails=0** (`build/comm/logs/witness_comm_cl3_store.log`; memPipe and folderPipe):
- **Converge:** 3 devices, two visit rounds → `placed=6/6/6`, the same op set and one order hash on each pipe.
- **Receipt:** after its own visit, A's ops are `1:SENT 2:SENT`; after B and C visit, `SEEN[b0c8,f0bc]`. The proof is
  B's and C's signed heads.
- **Incremental:** a visit with nothing new makes **3 gets** — one per device head, i.e. the board. That was 6 before
  this fix: known device keys are no longer re-read, and my key is published once (puts per run 22 → 16).
- **Equivocation:** a fork at C#2 is recorded on A and B (`equivocations A/B=1/1`), and the original C#2 is no longer
  placed (`EQUIVOCATED`).
- **Forge:** unknown key → `REFUSED:unknown-device`; tampered body → `REFUSED:signature`.
- **Withhold:** with A's bundle hidden, a late joiner gets `placed=1 parked=1` — B's dependent op parks, C's independent
  op places. After the restore, `placed=3 parked=0`.

**`W-FOLDER-2CTX` PASS judged=10 fails=0** (bim-ootb `common/tests/witness_comm_cl3_folder.js`, PR **#2315**, branch
`feat/comm-layer`):
- Setup: two real Playwright contexts with separate storage — before any visit each held only its own 2 ops. Their only
  channel was one folder behind a dumb file server.
- Visits A, B, A, B → both `ops=4 placed=4 order=9804ea6fd1f5c01f`.
- **The real `erp/kernel_ops.js` + `erp/crud_core.js` fold identical rows in both browsers: `A-1=111 B-1=222`**, each
  with the UU its own browser minted. The kernel log shows updates addressed as `"idCol":"c_order_uu","id":"<uu>"`. This
  is the CL1 defect scenario, now correct across two real browsers.
- Receipts: SEEN both ways.
- Folder contents: 6 objects, exactly `d/×2 h/×2 o/×2` — the pipe held keys, heads and two tiny SQLite bundles, nothing
  else.
- The four modules are byte-identical between bim-compiler `build/comm/` and bim-ootb `common/comm/` (checked with `cmp`).

**Learned for CL3b (GitHub pipe):** one visit makes up to 3 puts (key once, bundle, head). Under GitHub's 6 pushes per
minute per repo, **all puts of one visit must go in ONE commit** (a tree with several files, then one ref update). The
GH pipe needs a `putMany` that batches; the four-verb contract stays.

**Next: CL4** — identity as ops (GENESIS / PERSON / ENROLL / REVOKE-with-cutoff), replacing `CL3-temporary` trust, and
admission at fold time.

### §12.6 The waiting-ops question — explored, decided, built (user, 2026-10-23: *"I trust you can advice and explore it's workings."*)

**The question:** when one op is missing, what must wait?

**Measured:** `scripts/explore_comm_waiting_ops.js` (W-WAITING-OPS PASS 9/9, `build/comm/logs/explore_comm_waiting_ops.log`).
- Fixture: 10 authors, 400 ops, 60 records with a hot spot (20% of records take ~80% of edits), 35% gossip.
- One op withheld, 50 tries per model, same `linearize`. Only the meaning of "depends on" changes:

| Model: an op depends on … | Ops held back (avg / max) | Records final / provisional (avg of 60) |
|---|---|---|
| G — every peer head its author had seen (CL2/CL3 as built) | **50.1%** / 392 | 11.2 / 37.8 |
| DP — its author's previous op + the record version it read | **21.7%** / 368 | 27.4 / 21.6 |
| **D — only the record versions it read** | **0.5%** / 27 | **48.0 / 1.0** |

**Two properties hold in every model** — they are what make showing unaffected work safe:
1. **Placed ops never re-order when the missing op arrives** — 0 unstable over 150 tries. Reason: the placed set is
   always ancestor-closed, and the lowest-hash-first walk restricted to an ancestor-closed set picks it in the same
   relative order whether or not the outside ops are present.
2. **A record untouched by the missing op and its dependents has the same op sequence before and after arrival** —
   0 mismatches over 4,328 record checks. Its value is final, not a guess.

So the gossip-shaped deps were pure cost: they didn't make anything safer, they just made more things wait.

**Decision (mine, as the user delegated) — built 2026-10-23:**
- `deps` = the versions in a new `reads` map: every record the op read or writes → the op hash of the version it saw
  (null = didn't exist yet).
  - V9 refuses an envelope whose `reads` lacks the target, or whose `deps` differ from the read versions.
  - `base` = the target's read version (§11.7 K2 uses it).
- `prev` stays in the envelope as a **chain-integrity link** (gap detection, equivocation, revocation cut-off) but is
  **not an ordering edge**.
- Gossip ("who had seen whom") lives only in signed heads (receipts, §11.15), never in ordering.
- `sync` now reports `gaps` — the exact `(author, seq)` this device knows exists but doesn't hold, learned from signed
  heads. That's what the Team Panel shows as "waiting on".

**Witnessed after the change:**
- `W-UU-NO-COLLIDE` 23/23 (+2 V9 arms)
- `W-ORDER-PERMUTE` 12/12. The withhold arm now picks the op with the most dependents: 11 of 199 park. The
  previously-chosen op#66 has **0** dependents, so its arm correctly refused to PASS vacuously until the worst case was
  chosen.
- `W-STORE-NODE` 25/25. A late joiner with A's bundle hidden: B's edit on A's record parks, C's own record places,
  `gaps=1` names exactly what's missing; restore → `gaps=0`.
- `W-FOLDER-2CTX` 10/10 in two real browsers (bim-ootb PR #2317; #2315 merged).

**What this asks of later steps (the real cost of the decision):**
- **`reads` must be complete.** Leaving out a record an op really depends on would let it fold early.
  - **CL1b:** every foreign-key `{uu}` ref adds a read.
  - **K3 resources (stock per product × locator, credit per partner) are records too**, so every op that consumes one
    reads its version, and invariants serialise exactly where they must.
  - Doc-action groups read every record they touch.
  - The comm layer derives `reads` from the op body and the AD dictionary, never from the author's say-so. **CL4
    admission recomputes the derivable part and refuses a mismatch.**
- **Marking "provisional" needs the missing op's records:** from parked ops (known) plus a per-author Bloom filter of
  touched records in the signed head.
  - Measured: 1 KB, 0 misses.
  - It over-marks ~18 records under model D because it is cumulative over the whole chain. Tuning for CL-P: one Bloom
    per window of recent seqs.
- **The timeline display orders by business `ts`** (shown, never used for order). Fold order follows data, so two
  unrelated ops may fold in an order that doesn't match the wall clock; that's correct and invisible in results.

### §12.7 Build spec — CL4: identity as ops + admission at fold (user: *"Proceed"*, 2026-10-23)

**Facts re-read this turn (load-bearing):**
- iDempiere's data-level write check is `MRole.canUpdate` (`MRole.java:2335-2390`), **not** window access. It runs:
  - System user level → always true;
  - then the client/org level rules;
  - `isClientAccess(rw)` (`:1161`), `isOrgAccess(rw)` (`:1246`);
  - `isTableAccess` (`:1369`) with `isTableAccessLevel` (`:1426`).
- `erp/ad_access.js` has window/process/form gates and `gateRecord` but **no `canUpdate`**. `gateRecord` would deny the
  System role, which `canUpdate` allows — a twin divergence. So CL4 ports `canUpdate` into `ad_access.js` (the generic AD
  layer, AD-LAW §5) instead of reusing `gateRecord`.
- Real roles in `build/erp/ad_full.db`:

  | Role | User level | Org access (rw) |
  |---|---|---|
  | 0 System Administrator | `S  ` | — |
  | 102 GardenWorld Admin | ` CO` | 11: 0, 11, 12, 50000–50007 |
  | 103 GardenWorld User | `  O` | 11: 11, 50000, 50001, 50007 |
  | 50004 Web Service Execution | ` CO` | 11: 0, 11, 12 |

  - `c_order` is AD_Table 259 with AccessLevel 1 (Org).
  - `ad_table_access` has 1 row (role 103, table 520, rule E = export — not an "Accessing" rule).
  - `ad_record_access` has 0 rows.

**Identity ops** (ordinary v3 envelopes; `build/comm/comm_roster.js`):
- **GENESIS** — the founder's seq 1.
  - `params = {name, nonce, founder:{kid, jwk, person_uu, name, ad_role_id}}`.
  - **space = sha256(canonical(params))**, so the space id pins the founder key with no separate trust step. An invite
    = the space id.
  - It creates the space record and the founder's device and person records; the founder is comm-admin.
- **PERSON** `{person_uu, name, ad_role_id, comm_admin}` — signed by a comm-admin.
- **ENROLL** `{kid, jwk, person_uu}` — signed by a comm-admin **or by an enrolled device of the same person** (D4).
  `kid` must equal `kidOf(jwk)`.
- **ROLE** `{person_uu, ad_role_id?, comm_admin?, from_seq:{kid:n}}` — signed by a comm-admin.
  - It applies to that person's device ops with `seq > from_seq[kid]` (an unlisted device = from 0).
- **REVOKE** `{kid, last_good_seq}` — signed by a comm-admin or the same person.
  - Ops of `kid` with `seq ≤ last_good_seq` stay valid; later ones are refused.
- **Authority changes take effect from a seq cut-off named by the authority**, so a verdict never depends on arrival
  order and a member can't keep old rights by citing an old version.
- Identity ops read the space, signer device and signer person records, so they are ordered after what they rely on.
- **Roster fold:** walk the identity ops in order. Re-walk with the accepted REVOKE cut-offs known from the start, until
  the accepted set is stable (≤5 walks; unstable → `§COMM_ROSTER INCONCLUSIVE`).

**Admission** (`build/comm/comm_admit.js`), per business op, against the folded roster — pure:

| Check | On failure |
|---|---|
| device enrolled | PARKED `unknown-device` (an ENROLL may still arrive) |
| signature valid under the enrolled key | REFUSED `signature` |
| `seq ≤ last_good_seq` if revoked | REFUSED `revoked` |
| `ad_role_id` at `(kid, seq)` → `AdAccess` `canUpdate(client, org, table)` on the real AD rows | REFUSED `access:<missing>` |
| unknown table, unknown role, unknown record scope | REFUSED (**fail-closed**; today's write-time gate fails open) |

- Record scope = `ad_client_id`/`ad_org_id` from a CREATE's fields or `stdDefaults`; for later ops, from that record's
  CREATE op.
- An op that read a REFUSED version is REFUSED `dep-refused`, since the version it saw never happened.
- An equivocation is recorded only when **both** ops carry valid signatures. An unsigned fake at someone's slot is
  REFUSED `signature` and can't knock out the real op (denial-of-service guard).

**Store changes:**
- `ingest` keeps structural checks only (the key may arrive later). Signatures are checked at fold time against the
  roster.
- `d/<kid>` key files are retired: keys travel inside ENROLL ops.
- `§COMM_TRUST mode=CL3-temporary` becomes `§COMM_TRUST mode=roster genesis=<space12>`.

**Witness `W-ADMIT-FOLD`** (`scripts/witness_comm_cl4_admit.js`, node, real `ad_access.js` canUpdate on real
`ad_full.db` rows):
- `§ADMIT-GENESIS` — a genesis whose params don't hash to the pinned space, or that is signed by another key, is not
  trusted, and nothing is placed.
- `§ADMIT-ENROLL`:
  - accepted: admin enrols person P (role 103) and device D1; D1 enrols P's phone D2 (D4);
  - refused: a stranger self-enrolling; D1 enrolling a device for another person.
- `§ADMIT-ACCESS` — c_order creates:

  | Role | Org | Expected |
  |---|---|---|
  | 103 | 11 | MERGED |
  | 103 | 12 | REFUSED `access` |
  | 103 | 0 | REFUSED `access` |
  | 50004 | 11 | MERGED — data access, as iDempiere's web-service role has |
  | 0 | 11 | MERGED — System |

- `§ADMIT-REVOKE` — `REVOKE D2 last_good_seq=1` → D2 seq 1 MERGED, seq 2 REFUSED, the same over 20 arrival orders.
- `§ADMIT-ROLE` — P moved 102→103 with `from_seq {D1:2}` → D1 seq 2 at org 12 MERGED, seq 3 at org 12 REFUSED.
- `§ADMIT-FAILCLOSED` — unknown table → REFUSED; op from an unenrolled kid → PARKED; an op reading a refused version →
  REFUSED `dep-refused`.
- `§ADMIT-FAKE-EQUIV` — a badly signed op at D1's slot does not displace D1's real op.
- `§ADMIT-PERMUTE` — every verdict is identical across 20 arrival orders.
- Regression: `W-STORE-NODE` and `W-FOLDER-2CTX` re-run on roster trust; `scripts/poc_access.js` (W-ACCESS) stays green
  after the `ad_access.js` addition.
- **Twin check (named, not done here):** the `canUpdate` port is checked against the MRole source lines. Running the
  same truth table against a live iDempiere over the REST bridge is CL4b.

### §12.8 Results 2026-10-23 — CL4 ✅ DONE (witness)

All logs were read in full. bim-ootb PR **#2319** (auto-merge on); #2317 merged.

**`W-ADMIT-FOLD` PASS judged=23 fails=0** (`build/comm/logs/witness_comm_cl4_admit.log`)
- An observer that authored nothing judged 29 ops, using the real `canUpdate` on `ad_full.db` (244 calls, roles
  0 / 102 / 103 / 50004):

  | Area | Result |
  |---|---|
  | genesis | MERGED |
  | enrol | D1 by admin MERGED · D1 enrols own phone D2 MERGED · D1 enrols X for another person → REFUSED `not-admin-or-same-person` · stranger self-enrol → REFUSED `unknown-signer` |
  | access (`c_order`) | 103@org11 MERGED · 103@org12 → REFUSED `access:missing=W` · 103@org0 → REFUSED `access:missing=C` · 50004@org11 MERGED · System@org11 MERGED `system` |
  | revoke | REVOKE D2 after 1 → D2 seq1 MERGED, seq2 REFUSED `revoked` |
  | role | Q 102→103 from seq 2 → Q seq1@org12 MERGED, Q seq2@org12 REFUSED `access:missing=W` |
  | fail-closed | unknown table → REFUSED `access:no-table` · stranger's write → PARKED `unknown-device` · D1 editing the record created by D2's revoked op → REFUSED `dep-refused` |
  | forged op at D1's slot | REFUSED `signature`; no equivocation; D1's real op still placed |
  | untrusted genesis | `no-trusted-genesis`, placed=0 |

- **Identical verdicts over 20 arrival orders.**
  - That arm first failed 0/20, and the trace found two things. **A real hole:** if the forged op arrived first it took
    the slot, and the real op became the stand-by, never judged — a denial of service by arriving first. The fix judges
    every claimant of a slot by signature, whichever came first.
  - **A witness bug:** verdict maps were compared as JSON with key order mattering. They are now compared sorted. Both
    were found and fixed before PASS.

**`W-STORE-NODE` PASS judged=25 fails=0** and **`W-FOLDER-2CTX` PASS judged=13 fails=0** — both now on roster trust.
- The two-browser run first FAILED 2 checks, and both were real:
  - **B's edit was lost.** B wrote before the roster reached it, so its own create wasn't placed and its edit read no
    version. Fix: an author's reads include its own not-yet-placed ops — what its screen shows.
  - **B's refused op never showed SEEN.** Receipts counted only accepted ops. Fix: SEEN = received; the verdict is
    reported alongside.
- Now:
  - both browsers fold `A-1=111 B-1=222`;
  - B's org-12 order is REFUSED in both;
  - **B's own delivery row reads `SEEN · REFUSED · access:missing=W`**, so the author is told, never silently dropped.
  - The folder holds only `o/` and `h/` objects; keys travel inside ENROLL ops.

**Regression:**
- `W-UU-NO-COLLIDE` 23/23 · `W-ORDER-PERMUTE` 12/12.
- `poc_access.js` (W-ACCESS) verdict lines identical before and after the `ad_access.js` addition.
- bim-ootb `erp/tests/poc_access_gate_live.js` (W-ACCESS-GATE-LIVE) all PASS, 0 page errors.
- `erp/sw.js` v897→v898; `ad_access.js?v=2`.

**Named, not done (ports kept honest):**
- `canUpdate` does not port `isRecordAccess` (0 `AD_Record_Access` rows in the seed), summary-org tree expansion, or
  `AD_User_OrgAccess`. A role with `IsUseUserOrgAccess=Y` is refused fail-closed.
- **CL4b twin check:** run the same truth table against live iDempiere over the REST bridge.

**Next in §11.12 order:**
- **CL5** — K2 stale save, matching iDempiere's `CurrentRecordModified` (using `base`), Notice/Request for the loser,
  and the mine/theirs/before conflict state (§11.15).
- Then CL3b (GitHub pipe with batched commits), CL6 (manifest skew), CL7 (multi-pipe heal), CL8 (encryption).

### §12.9 Build spec — CL5: stale saves, crossed saves, conflicts, notices (user: *"proceed"*, 2026-10-23)

**Facts re-read this turn:**
- `AD_Message` `CurrentRecordModified` = *"Current record was changed by another user, please ReQuery"*, and
  `SaveErrorDataChanged` = *"Could not save changes - data was changed after query."* Both are in `ad_full.db`; the
  browser's `ad_seed.db` has **no `ad_message` table** (gap named for the UI step).
- iDempiere's stale check compares the `Updated` / `Processed` the user loaded with the database, **record-wide, not
  per column** (`GridTable.java:3482-3510`).
- `AD_Note` columns: `AD_Message_ID, AD_Table_ID, AD_User_ID, Record_ID, TextMsg, Reference, Description, AD_Note_UU` …
  `Record_ID` is an integer and there is no `Record_UU`, so a note for a device-created record can't name it by integer
  until the bridge's `IDMAP` (§11.1) — named, not worked around.

**Mechanism** (`build/comm/comm_store.js` + `comm_envelope.js`):

1. **A record's heads.** For each record, the placed ops form a version tree through `reads[target]`. Its heads are the
   ops with no placed descendant on that record; the author's own pending ops are on top (§12.8).
   - `versions()` gives one hash, or a sorted **array** when there are several heads.
   - `reads[uu]` may now hold that array (V9 extended: a value is `null`, a 64-hex, or a sorted unique array of ≥2
     64-hex). An edit made while seeing several heads descends from all of them: that is the Git merge commit.
2. **Online stale save = iDempiere's rule, record-wide.** `saveCheck(uu, loadedVersion)`: if the record's current heads
   differ from the version the user loaded, the result is `{stale:true, ad_message:'CurrentRecordModified'}` and the
   save is not written.
   - Same moment, same message, same record-wide rule as `GridTable.hasChanged`.
3. **Crossed saves = Git, per column** (§11.15, user-approved).
   - For record R and column c: the writers of c with **no descendant on R that also writes c** are its candidates.
   - One candidate = its value applies.
   - Two or more = **conflicted**: the record keeps the value from before the clash, and the candidates' writes to c are
     held back.
   - Different columns from the same base merge cleanly.
   - `conflicts()` lists `{uu, table, col, before, candidates:[{hash, author, person_uu, value}]}`, the same on every
     device.
4. **Resolve.** Any later write to c that read all the candidates (it saw the conflict) becomes the only candidate, so the
   conflict clears. Two concurrent resolutions that disagree form a new conflict; each round needs a human and stays
   visible.
5. **The fold stays the real one.** `foldable()` = placed business ops in order, with held-back column writes removed.
   That list goes to the unchanged `kernel_ops` + `crud_core.listTip`.
6. **Notices.** `notices(person_uu)` = one row per conflict in which that person's device is a candidate. It has the AD_Note
   fields that exist — `ad_message:'CurrentRecordModified'`, `ad_table_id`, `textmsg` (mine / theirs / before) — plus
   `record_uu`. It is derived on every device and never written as an op (it's a consequence, not an act).

**Witness `W-CONFLICT`** (`scripts/witness_comm_cl5_conflict.js`, node: real kernel + `listTip` + `canUpdate` on
`ad_full.db`, roster trust) — each arm names its issue:
- `§CONF-DISJOINT` — A changes `description` and B changes `grandtotal` from the same base → both apply, no conflict.
  Disproves "any concurrent edit conflicts".
- `§CONF-SAME-FIELD` — both change `grandtotal` from 100 to 111 / 222 → the folded row shows 100, there's 1 conflict
  with 2 candidates, and both people get a notice. Proves no silent last-writer-wins.
- `§CONF-SEQUENTIAL` — B edits after seeing A's edit → B's value, no conflict. Proves causality isn't mistaken for a
  clash.
- `§CONF-RESOLVE` — A, having seen both, writes 150 → no conflict, row 150, notices cleared.
- `§CONF-RACE` — A and B both resolve concurrently, 150 vs 160 → conflicted again with 2 new candidates.
- `§CONF-STALE-ONLINE` — the user loaded version V; someone changed **another** column → `saveCheck` says stale with
  `CurrentRecordModified` and the message text from `AD_Message`. Proves the twin's record-wide rule, not a per-column
  one.
- `§CONF-PERMUTE` — conflicts and folded rows are identical over 20 arrival orders on an observer.

### §12.10 Results 2026-10-23 — CL5 ✅ DONE (witness)

All logs were read in full. bim-ootb PR **#2320** (auto-merge on); #2319 merged.

**`W-CONFLICT` PASS judged=12 fails=0** (`build/comm/logs/witness_comm_cl5_conflict.log`; real kernel + `listTip`,
real `canUpdate`, roster trust):

| Arm | Scenario | Result |
|---|---|---|
| DISJOINT | O1: A sets description=a, B sets grandtotal=200, same base | both apply, no conflict |
| SAME-FIELD | O2: A 111 vs B 222 from 100 | one conflict, `before=100`, both devices fold 100 |
| SEQUENTIAL | O3: B wrote 333 after seeing A's 111 | 333, no conflict |
| STALE-ONLINE | B loaded O1; A then changed *description* | B's `saveCheck` → stale, *"Current record was changed by another user, please ReQuery"* (`AD_Message`); a check against the current version is not stale |
| RESOLVE | A, having seen both, writes 150 | O2 → 150 on both devices; notice gone |
| RACE | O4: A resolves 150, B resolves 160, concurrently | conflicted again, row 100 on both |
| PERMUTE | observer, 20 arrival orders | identical conflicts and folded rows, 20/20 |

- SAME-FIELD notice to A: `{ad_message:'CurrentRecordModified', ad_table_id:259, textmsg:'grandtotal: mine=111 theirs=[222] before=100'}`; B gets
  its own.
- **The first run FAILED RACE, and the failure was real.** `before` came out as 222, a value from the earlier, still-open
  clash, and the fold showed it. The fix defines `before` as the **last agreed** write: walk back through the common
  ancestors until one writer dominates. Every write of the column after it is held back. Now `before=100` and the row is
  100 on both devices.

**`W-FOLDER-2CTX` PASS judged=16 fails=0** (two real browsers): A and B change A-1's grandtotal unaware of each other
(111→120 and 111→130).
- Both browsers list `[{col:grandtotal, before:111, values:[120,130]}]` and fold A-1 to **111**.
- Each person gets one `CurrentRecordModified` Notice for AD_Table 259.
- The browser notice's `message` is null: `ad_seed.db` has no `ad_message` table — named gap for the UI step.

**Regression:** W-ADMIT-FOLD 23/23 · W-STORE-NODE 25/25 · W-UU-NO-COLLIDE 23/23 · W-ORDER-PERMUTE 12/12.

**Not done (named):**
- The mine/theirs/before **chooser UI** (Team Panel step CL-P).
- Writing the Notices into `AD_Note` rows — blocked on `Record_ID` for device-created records until the bridge's
  `IDMAP` (§11.1).
- Delete-vs-update concurrency (no rule yet; delete currently just hides the row).
- Concurrent doc-actions (K4: first valid wins via `base`) — K4 isn't witnessed here.

**Next in order:**
- **CL3b** — GitHub pipe, one batched commit per visit (§11.16; repo creation was approved).
- Then **CL6** manifest skew, **CL7** multi-pipe heal, **CL8** encryption.

### §12.11 Build spec — CL3b: GitHub repo as a pipe (user: *"Proceed"*, 2026-10-23; repo creation approved in §11.13)

**Repo:** private `red1oon/bim-teams-pipe`, created by this step.
- A README only, so the repo is not empty (Git Data API calls fail on an empty repo).
- Actions disabled. No `.gitattributes`, so no LFS — every object is a plain git blob.

**`ghPipe(opts)` in `build/comm/comm_pipe.js`** — the same four verbs, plus `putMany`:
- `opts = {owner, repo, token, self, minGapMs, fetch?}`.
- **One branch per device:** `dev/<kid>`. A device may only put names under its own prefix (`o/<kid>/…`, `h/<kid>`), and
  the pipe refuses anything else. That is the one-writer rule, made structural.
- **`putMany(entries)` = ONE commit:**
  - blobs, then one tree on the previous tree, then one commit, then a forward-only ref update (`force:false`);
  - a refused update (another tab of the same device moved the branch) is re-read and retried once;
  - the first visit creates the branch.
- **Reads:**
  - `list(prefix)` = one `matching-refs/heads/dev/` call (with ETag) plus one recursive tree read per **changed** branch
    (cached by commit sha);
  - `get(name)` = one blob read (blobs never change, so cached forever).
- **Budget, logged every visit:** `§GH_BUDGET reqs=… writes=… notModified=… rateRemaining=…`.
  - Writes are counted against GitHub's 80/min and 500/hour content limits.
  - `minGapMs` throttles each device's commits (§11.16: whole team under 6 pushes a minute).

**Store change:** if a pipe has `putMany`, `sync` sends the bundle and the head in **one** `putMany`, then reads the
bundle back (SENT only after the read-back). Other pipes are unchanged.

**Witness `W-GH-PIPE-2DEV`** (`scripts/witness_comm_cl3b_github.js`, node, **real GitHub**, token from `gh auth token`):
- Setup: two devices A and B on roster trust (A founds, enrols B with role 102).
- Visits: A, B, A, B, with B editing between visits.
- `§GH-CONVERGE` — both stores hold the same ops in the same order through GitHub alone.
- `§GH-RECEIPT` — A's ops are SEEN by B.
- `§GH-ONE-COMMIT` — each visit that sent something added exactly one commit to its own branch (the branch commit count
  is read from GitHub); a visit with nothing to send still writes the head, in exactly one commit.
- `§GH-OWN-BRANCH` — a put under another device's prefix is refused by the pipe.
- `§GH-NO-LFS` — the repo has no `.gitattributes`, and every object is a plain blob ≤256 KB.
- `§GH-BUDGET` — writes per visit ≤ 5; total writes and the rate-limit delta are logged.
- `§GH-ETAG` — **measured:** whether a 304 reply to an ETag request lowers `X-RateLimit-Remaining`. This settles the
  §11.16 ⛔ "verify" item with a number. Other API use on the same account can shift the counter, so the delta is
  reported, not assumed.
- Cleanup: the witness deletes the device branches it created.
- **The phone test (real laptop + phone, D4 enrolment by code) needs the user's hands, and comes after a minimal POC UI.**
  Named here; not claimed by this witness.

### §12.12 Results 2026-10-23 — CL3b ✅ DONE (witness, real GitHub)

Log read in full: `build/comm/logs/witness_comm_cl3b_github.log`. bim-ootb PR **#2321** (auto-merge on); #2320 merged.
Pipe repo **`red1oon/bim-teams-pipe`**: private, README only, Actions disabled (`actions/permissions enabled=false`).

**`W-GH-PIPE-2DEV` PASS judged=7 fails=0** — two devices on roster trust, 5 visits (A, B, A, B, A), throttle 12 s:

| Arm | Result |
|---|---|
| Converge | same 5 ops, same order, through GitHub only |
| Receipt | A's 4 ops `SEEN` by B, read from B's head on GitHub |
| One commit | **`dev/A=3` commits for 3 visits, `dev/B=2` for 2** — counted with GitHub's commits API, not locally |
| Read-back | SENT required 34,637 blob bytes read from GitHub. A local cache that would have made this vacuous was found in review and removed before the run. |
| Own branch | `ghPipe: h/<B> is not under my prefix (<A>)` |
| No LFS | `.gitattributes` 404; 4 plain blobs, none over 256 KB |
| Budget | writes per visit `5,4,4,5,4` (a visit with nothing new still notes itself: head blob + tree + commit + ref = 4); about 9 requests per visit including reads |
| ETag (measured, settles the §11.16 ⛔) | `plain=200 rem=4956 → conditional=304 rem=4956 → plain=200 rem=4955` — **a 304 did not lower the counter**, a plain GET lowered it by 1 |

- Cleanup: both device branches deleted (204).

**What this means for the cap in §11.16:**
- About 9 requests per visit means one account's 5,000 an hour covers about 550 visits an hour.
- Writes of 4–5 per visit against the 500 an hour content limit give about 100–125 visits an hour per account, matching the
  §11.16 estimate.
- The repo-wide 6 pushes per minute stays the binding limit for a team.
- Unchanged ETag reads are free, so idle polling of the board costs nothing.

**Regression:** W-FOLDER-2CTX 16/16 · W-UU-NO-COLLIDE 23/23 · W-ORDER-PERMUTE 12/12 · W-STORE-NODE 25/25 ·
W-ADMIT-FOLD 23/23 · W-CONFLICT 12/12. bim-compiler `build/comm/` and bim-ootb `common/comm/` are byte-identical.

**Still open:**
- **The phone test** (your laptop + your phone, enrol by code, D4) needs a minimal POC screen (found/join/enrol code/
  edit/visit) and a fine-grained GitHub token on the phone, which only the user can create. That's next with the Team
  Panel (CL-P).
- Then CL6 manifest skew, CL7 multi-pipe heal, CL8 encryption.
- Gmail visit-log (CL3c) waits for the user's postbox address.

### §12.13 The phone test + the Gmail post box (user, 2026-10-23)

> User: *"Proceed. Advice me how to do the phone test. The email i created in 2017 for such auto with iDempiere engine is
> amazingerp@gmail.com"* … *"BUt i forgot how to setup its auto responder. If u can do it for me, i can authorize"*

**A. The phone page — built and rehearsed. ✅ `W-PHONE-PAGE` PASS judged=8 fails=0** (bim-ootb PR **#2323**).
- `common/comm/comm_phone.html`. Once merged, it is served by GitHub Pages at
  **`https://red1oon.github.io/bim-ootb/common/comm/comm_phone.html`**.
- Pairing uses no long codes:
  - the phone posts a join request `r/<kid>` (scoped to the space) into its own branch;
  - both screens show the short device code (e.g. `B79B-6074`), and the founder compares it by eye and presses Approve.
- The rehearsal ran with real clicks: a desktop context plus an emulated Pixel 7, separate storage, real GitHub.
  - Pair → the phone's order appears on the laptop → the laptop's edit 150 reaches the phone.
  - Both edit the same total (200 / 300) → both screens show the conflict and keep 150.
  - Reloading the phone keeps its code, team and order.
  - 0 page errors.
- **Three real defects were found by the rehearsal and fixed before PASS:**
  1. The page never signalled ready before a space existed (test-harness signal).
  2. **The Visit button was hidden until approval, while the waiting screen said "press Visit"** — the exact trap the
     user would have hit.
  3. **In a browser, every GitHub commit after the first was refused.** The browser cache served GitHub's `max-age=60`
     branch pointer. Node has no HTTP cache, so W-GH-PIPE-2DEV couldn't see it. Fix: `cache:'no-store'`;
     W-GH-PIPE-2DEV re-run, 7/7.
  - Also: a join request left over from another space showed up, so requests now carry their space.

**Phone-test steps for the user** (~10 minutes). These are the only steps that need a person; the result is then read
from GitHub, not from the user's eyes (PRIMAL LAW):
1. **Make a token, once** (on the laptop, github.com as red1oon):
   - Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate.
   - Expiration **7 days**.
   - Repository access: **Only select repositories → `bim-teams-pipe`**.
   - Permissions → Repository → **Contents: Read and write** (Metadata read-only is added automatically).
   - Copy the `github_pat_…` value.
   - Send it to the phone the way you send yourself passwords — e.g. a password manager or a note to self, not a group chat.
2. **Laptop:** open the page → paste the token → **Save token** → **Start a new space** → copy the **invite link** shown
   under Pairing.
3. **Phone:** open the invite link (send it to yourself) → paste the token → **Save token** → **Join**. The phone shows a
   code like `AB12-CD34`.
4. **Laptop:** **Check join requests** → the same code appears → **Approve**.
5. **Phone:** **Visit the post office** → it says *enrolled* and the Work section appears.
6. **Work** (each device presses Visit after each step):
   - the phone makes a **New order** → Visit; the laptop Visits → the order is there;
   - the laptop changes the total → Save → Visit; the phone Visits → the new total is there.
   - Conflict: both change the same total without visiting in between, then Visit on both (laptop, phone, laptop) → both
     show the ⚠ conflict and keep the old total.
7. Tell me "done". I'll read both device branches on GitHub (commit count, signed heads, op counts) and write the result
   here, without asking what you saw.
- When finished, delete the token. Expiry also does it after 7 days.

**B. The Gmail post box (amazingerp@gmail.com) — script written, install needs the user's authorisation.**
- Files: `build/comm/postbox/Code.gs` + `appsscript.json`.
- **Why not Gmail's own auto-reply:** the vacation responder can't attach or link anything, and answers each sender at
  most once every few days. The "auto responder" is this Apps Script.
- What it does:
  - `doPost`: a device notes its visit — signed head + links to its bundle files in the repo. The note is **inserted**
    into the mailbox under label `BIMTEAM` via `Gmail.Users.Messages.insert`. Google's API reference, fetched this
    turn: *"Does not send a message"*, *"bypassing most scanning and classification"* — so no spam filter and no
    100-sends-a-day limit.
  - `doGet`: reads the log back as JSON, so a witness can check it.
  - `fileInbound`: every 5 minutes, files mailed-in `[BIMTEAM]` notes (from a phone share or legacy iDempiere SMTP)
    under the same label.
  - `setup()`: creates the label, a random secret, and the trigger.
- **Install, ~5 minutes of the user's clicks; I do the rest:**
  1. Signed in to Google as **amazingerp@gmail.com**, open `https://script.google.com/home/usersettings` and turn
     **Google Apps Script API: On**.
  2. In this terminal: `! npx @google/clasp login`. A Google sign-in opens; choose **amazingerp@gmail.com** and allow.
     This lets me create and upload the script to that account.
  3. I run `clasp create` / `clasp push` / `clasp deploy` and give you the script's editor link.
  4. In the editor: choose **setup** → **Run** → *Review permissions* → amazingerp → *Advanced* → *Go to BIM Team Postbox
     (unsafe)* → **Allow**. That warning is normal for a personal script Google hasn't reviewed. The log then shows
     `SECRET=…`.
  5. Paste the SECRET here. I wire the phone page to note each visit and witness it end-to-end with `doGet`
     (`W-GMAIL-LOG`).
- Until then the post box is **written, not deployed, not witnessed**.

### §12.14 Results 2026-10-23 — Gmail visit log ✅ DONE (witness, real Gmail + GitHub)

**Install (the user authorised as amazingerp@gmail.com; I did the rest with `clasp`):**
- First attempts failed with *"User has not enabled the Apps Script API"*, although the user had switched it on. The
  pasted OAuth redirect showed `authuser=1`: the switch had been set for the browser's *first* Google account. After the
  user set it at `/u/1/` for amazingerp, `clasp create` worked first try.
- Script **BIM Team Postbox**, scriptId `18I5ET9T5JoB1bqxSJAJuQLZrJvJuu-ATGUnt0_yQ0Z8DrVh3U0V6v_Iv`
  (`build/comm/postbox/.clasp.json`).
- Web-app deployment `AKfycbx-HDroFGTi5q7a53T4gpb-fibPpi8DcT8yptupuE7XK9gVqgqn_SBfi168hNlL38xqzQ`, now @4. The same URL
  is kept across redeploys.
- The user ran `setup` once (consent) and gave the secret.
- **The secret lives only in `~/.config/bim-teams/postbox.json` (mode 600).** A scan found it in no repo file.

**`W-GMAIL-LOG` PASS judged=5 fails=0** (`scripts/witness_comm_gmail_log.js`, log `build/comm/logs/witness_comm_gmail_log.log`):

| Arm | Result |
|---|---|
| NOTED | 4 visits (A, B, B, A) → 4 notes, each found in the log **by its own Gmail message id** (4 distinct) |
| POINTS | B's note links `o/<B>/1-1.<h>.bimpack` on `dev/<B>`, and GitHub answers 200 — a pointer to a real file, not a copy |
| SECRET | a wrong secret → `{ok:false, error:'secret'}` |
| NONBLOCK | post box unreachable → the visit still completed (placed=4); the note failed with its reason |

Three real problems were found on the way to PASS, all fixed:
1. **The witness read Gmail's preview snippet** (cut at ~200 characters), so links never appeared. `doGet` now returns
   each note's full text, and the witness matches by message id: subjects can repeat when a visit adds nothing, as A's
   two `seq 3` notes did.
2. **`doGet` threw *"could not decode string"*** (Google's page was in Thai: `ไม่สามารถถอดรหัสสตริง`, line 54). Gmail's
   `body.data` comes back without base64 padding, or as bytes. Fixed with `decode_()`.
3. **Google's POST reply intermittently 404s** (*"Drive: unable to open the file"*), while the note **was** written.
   Retrying blindly would duplicate it. Now every note carries its own id (`#<16 hex>` in the subject). On a lost reply
   the device reads the log and confirms by id, re-posting only if the note is truly absent.
   - **Not yet exercised:** no reply was lost during the passing runs, so the confirm-by-read-back path is written but
     its own witness (a forced lost reply) is still owed.

**`W-PHONE-PAGE` PASS judged=10 fails=0** (bim-ootb PR **#2328**, auto-merge on; #2323 merged):
- The phone page has optional post box address + secret fields, kept in the browser only.
- In the rehearsal (desktop + emulated Pixel 7, real clicks), **10 visits → 10 notes, all read back from the log**, and
  the earlier 8 arms are still green.
- The browser's cross-origin POST and GET to Apps Script work with `text/plain`, with no preflight.

**For the user's real phone test (§12.13):** in step 1 the page also asks for the post box address and secret. Paste
them on both devices, or leave them empty — the pipe works without them. The address is the `exec` URL above; the
secret is the one given at setup.

**Next:**
- After the user's phone test, read both branches on GitHub and record the result here.
- Witness the confirm-by-read-back path with a forced lost reply.
- CL6 manifest skew, CL7 multi-pipe heal, CL8 encryption.
