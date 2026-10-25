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

## ▶ SPINE (user, 2026-10-25) — **§16 The Replication Scriptor** is the most important piece of the Distributed ERP thesis
The post office carries; **the scriptor decides who holds what and how a device asks for what it does not hold** (a standalone, serverless compiler: AD + roles + topology → signed per-device plans, a signed catalog of deferred queries with reply schedules, owner assignments, all simulated before rollout). Spec only, nothing built: **§16** (end of file). Evidence and prior art: `prompts/prior_art_2026-10-25/` (R1 transaction precedent, R2 scriptor/deferred-query prior art, R3 relay engineering experience). Linked from `docs/DistributedERP.md`. **Engine lane log (steps 1–4 DONE, witnessed): §22 (§22.8 = state). Owner's ideas register (parked, planned): §23.** Resume prompt: §21.

## ▶ RESUME HERE — 2026-10-25 evening (REPLICATION ENGINE LANE; written by session `bim-compiler-02`; supersedes the §21 prompt and the two blocks below it for this lane)
**State (all merged/pushed; branch `fable/meshdb-livewire`; sections §22–§34 are this lane's log, written in order).** Engine `build/scriptor/*` (virtual tables, registrable treatments, mesh `audience: space`, `LOCAL`, `refs`, compile report, plan emitters, signing, sealing in the simulator); Flow Row pattern guide `docs/ReplicationFlowRows.md`; both hosts (Modeller, ERP) derive their scope from a compiled plan through ONE reader `TeamScope`, verify its signature before `ready`, and read the trust list pinned in the space GENESIS (engine `planTrust`). bim-ootb PRs merged: #2369 #2370 #2371 #2372 #2374 #2375 #2377 #2378 #2379. Owner decisions taken: git admin is mine (commit, push, PR `--auto --squash`, stage by explicit path); the ERP plan leaves out the 141 unreached dictionary views (857 tables); Q1 key custody = offline owner key, public key pinned in the genesis, primary + backup, rotation by POLICY op (rotation NOT built).
**Run the whole lane (all Node, no browser; expected verdicts):** `scripts/witness_scriptor_{s1 PASS 22, treat PASS 30 (11/11 mutants), registry PASS 18, virtual PASS 25, mesh PASS 25, dryrun PASS 13, patterns PASS 89, team_scope PASS 14, erp_plan PASS 15, modeller_plan PASS 5, sign PASS 17, hosts PASS 47, seal PASS 24, erp_scope EVIDENCE 14}.js` + `scripts/witness_comm_plantrust.js` PASS 23 + the 15 other `witness_comm_*.js` + the peer's `witness_comm_versions.js` PASS 25 (mutants 7/7). The three bim-ootb-reading ones (`team_scope, erp_plan, modeller_plan, sign, hosts`) read `origin/main` with `git show` (`git -C ~/bim-ootb fetch origin` first). **Owner rule: NO new Playwright** (CLAUDE.md whitebox-first); the pre-existing browser suite is the other session's to run.
**⚑ CONSOLIDATED (owner, 2026-10-25: *"No other session is restarted as all will consolidate to this session to take over"*): ONE session now owns BOTH lanes — replication engine §22-§34 AND event versioning §16.30-§16.35; the take-over result is §16.35.2 (end of file). The paragraph below is history.** **(HISTORY) TWO SESSIONS ARE WORKING ON THIS FILE AND THE COMM ENGINE (owner, 2026-10-25: *"another session is also working on it, we may take over what it is doing once it also wraps up — at a new session"*).** The other is `bim-compiler-68 [9352dd]` — EVENT VERSIONING: its sections are **§16.30–§16.35**, witnesses `witness_comm_versions.js`, `W-OP-VERSIONS`, `W-VERSIONS-MODELLER` (browser; its lane). Same shared checkout and same branch, so each push carries the other's commits — always stage by explicit path. **STATE OF THE VERSIONING LANE (updated at its wrap-up, owner 2026-10-25: *"wrap up, resume in new session"*; the engine-lane session `bim-compiler-02` has retired too, so the next session is an ENTIRELY NEW one and nobody is mid-edit):** versioning is merged through the Team-chip indicator (bim-ootb #2373, #2376, #2380, #2381). The last feature, admin-published signed upcaster sets, is split: the ENGINE half is committed and pushed (bim-compiler `8e86b4ea7`: `comm_roster.js` POLICY `upcasters` + `upcasters-dropped`; witnesses green, the 15 comm witnesses and your plan-trust witness unchanged); the HOST half sits on bim-ootb branch `feat/versions-publish` (pushed, **no PR, nothing merged**, host regression suite not yet run). **Nobody should edit `policyProblem()` or the POLICY branch of `comm_roster.js` (the plan-trust add/rotate item below) until that branch is merged — follow `§16.35.1` steps 1-4.** **TAKE-OVER:** the versioning session has wrapped: its resume list is **§16.35.1** (end of file). A new session adopts it under the same file-ownership rule (§18); there is no one to ask, so §16.35.1 is the whole hand-over.
**Open items of THIS lane, in order:** (1) ✅ **`W-THIN-DERIVE` RAN 2026-10-26 — 7/10 classes derivable, −82% bytes, four preconditions to build; §36.1. Owner decision G9 now has its evidence.** (history: §34, the owner's thin-pipe principle: a second device derives a Complete's consequences from document + status instead of receiving them; 10 DocAction classes; read-only Node experiment) — awaiting the owner's go; it decides the ERP scope (G9) more cleanly than §30. (2) ✅ **Add/rotate a plan-trust key by a signed POLICY op** — DONE 2026-10-26, §35 / §35.1, bim-ootb #2383 (history: follow its monotone pattern: a later epoch may add a key but not silently drop the founder's pinned keys). (3) ERP scope decision G9: 857 shipped; wider options and evidence in §30–§30.2. (4) Owner to retire the value arms of the two merged Playwright plan witnesses (`W-PLAN-MODELLER`, `W-PLAN-ERP`) — they overlap the Node witnesses. (5) §23 ideas register (1: inform-before-proceeding notes; 2: higher container) parked behind the multi-user HOLD. (6) §16.13 Q2–Q8, S2/S3, the film's `local-sale` → `local-action` rename (after the film is final), genesis-pinned trust boot-order is read-not-tested.
**Habits that paid (keep):** spec before code · a RED log first · every mutant must prove it applied (stale text anchors silently became no-ops, §33.4) · a witness that finds a hole in itself is a good sign · read the app's own `§` line, not a Playwright DOM value.

## ▶ (SUPERSEDED — the §20 review is done) NEXT SESSION (team-layer lane, closed 2026-10-25): **§19** — review the Replication Scriptor (§16, written by the other session) and write how it can GOVERN the Team Modeller setup. Read §18 (ownership rules) and §19 first. Read-only on §16 and `build/scriptor/*`; findings go in a new § at the end.

## ▶ RESUME HERE — 2026-10-24 session close (read this first; the 2026-10-23 block below it is still valid for what it covers)

**State in one line:** the comm layer (no DB/app server, a dumb post office + signed per-device ops) now has a Team pill + in-panel desktop pairing (no phone), document actions, a Modeller adapter, a people strip, and the "elegant frame" engine steps (POLICY+gate, CHECKPOINT, KEYCLAIM, BOOKING/putIfAbsent, BASE hash + base-row scope). Six films exist. Design for the rest is in §13.12 (A–J).

**Shipped this session (all witnessed; merged unless noted)** — bim-ootb PRs #2352 W2 doc actions · #2355 Team pill/defaults/trial · #2357 in-panel pairing · #2358 Modeller team mode · #2360 chain-verify fix · #2362 people strip + role scope · #2364 policy/checkpoint/keyclaim/booking · #2365 base hash + base-row scope; bim-compiler PRs #247–#254 (specs, films, engine). Spec sections: §13.7 · §13.8 · §13.9 · §13.10 (office-day numbers) · §13.11 (14 gaps vs legacy) · §13.12 A–J · §14.5 (UI, parked) · §14.6 · §15 · §15.12–15.13.

**Films (in ~/Videos, all sent to the user):** `TheServerIsDead_ERP_Desktop_narrated_2026-10-24_v2.mp4` (3:14, good) · `TheServerIsDead_Modeller_part2_narrated_2026-10-24.mp4` (2:23; first cut `…Modeller_narrated…` 2:38) · `TheServerIsDead_Modeller_part3_HHS_Office_narrated_2026-10-25_v2.mp4` (4:44, Team Visibility card + the ONE Team icon + avatars + HHS wings; §15.15.5; v1 `…_2026-10-25.mp4` = §15.14 without the icon/avatars) · `MicroFinance_SlipRoundTrip_BehindTheScenes_EN_2026-10-24.mp4` (3:32, admin/dev) · earlier `TheServerIsDead_Essentials_v1/v2_2026-10-23.mp4`. User wants later films to be "part 2 onwards" (skip the part-1 explanation; one recap card reusing the ERP film's image).

**Open, in order (the next session picks the top one)**
1. **ESCROW + `W-INVARIANTS-CHAOS` — BUILT, GREEN, NOT MERGED.** Branches (pushed, no PRs yet): bim-compiler `feat/comm-escrow` (head `5dabb42c0`, worktree `/tmp/wt-escrow`) and bim-ootb `feat/comm-escrow` (worktree `/tmp/wt-escrow-ootb`, engine copy only, `cmp`-clean). Its spec notes (§13.12.J.3, written before the code, with status) live ON THAT BRANCH, not on `fable/meshdb-livewire`. Verdicts: `§W-ESCROW PASS 45/0`, `§W-INVARIANTS-CHAOS PASS 72/0` (seed 20261024, N=6/12/24; 24/24/42 over-draws all refused; invariants held on every device; derived-ledger hash equal everywhere, control differs); 11 mutants all red. **Node regression AFTER (run at close, identical to before):** cl1_uu 23 · cl2_order 12 · cl3_store 25 · cl4_admit 23 · cl5_conflict 12 · cl8_opaque 44 · space_scope 23 · policy 32 · checkpoint 43 · keyclaim 25 · pipe_ifabsent 29 · docno_booking 15 · docno_modes 14 · base 36 · waiting_ops 9. **Still to run before merging:** `sim_comm_office_day.js 9 3 15 0.3` (it now includes a ~5 min growth probe) and, in `/tmp/wt-escrow-ootb`, the browser set `erp/tests/witness_team_so, witness_team_docaction, witness_team_desktop, witness_team_pill, witness_team_base, witness_people_strip` + `modeller/tests/witness_team_modeller` (quote lines equal to before). Then open + merge both PRs (bim-compiler has no auto-merge; bim-ootb `--auto --squash`) and remove both worktrees. Named limits (from the agent): ancestor sets are O(escrow ops²) per fold; a later POLICY that reassigns a desk re-judges its ops; an op by a device that has not yet seen the `desks` policy is `escrow-not-owner`. Then: wire the ERP `m_storagereservation` Complete to `ESCROW_USE` (host step).
2. **Build the numbering in the ERP** (`team_sync.js` calling `store.numberDocument`, AD_Sequence modes S/B/K per §13.12.F) — engine part is done.
3. **Event versioning** (`W-OP-VERSIONS`, §13.12.J.2 amended: separate schema/rules versions, declarative signed upcasters, parking policy, provisional ledger) — design only.
4. **Role scope uses 3–5** (tiered cadence, selective fetch by head summary, notification routing; §13.12.H) — only (1)(2) are built.
5. **Base releases / fast-forward, thin base, serving the base via the POLICY directory, Modeller base wiring** (§13.12.I).
6. **Audience keys** (read isolation, gap 9); sealing the focus board (people-strip limit L1); `policy.json` mirror in the post office; write token derived from the key epoch; ghPipe CAS for `putIfAbsent`.
7. **⛔ User-owned:** create the fine-grained token for `red1oon/bim-teams-trial` and paste it into `common/comm/team_defaults.js` (panel says "Trial key not installed" until then). Real-phone measurements (Android background-sync interval; fold speed on a phone) for both the team layer and the news board.
8. **Micro Finance** (`~/Projects/ThaiGoldPawn`, NOT a git repo; mockup repo has a PUBLIC remote): everything is on the LOCAL branch `news-board` of `mockup/` (head `e5d74b0`, never pushed — deploying is the user's call). Spec §25–§25.14, scripts `film/news/news_en_v1…v3.tsv`, 61 witness groups / 714 PASS in `tools/run_all.sh`. Not built: signed `policy.json`, per-ticket CHECKPOINT, capability re-grant after re-enrolment, outbox persistence across reload.

**Known measured limits (don't rediscover):** a no-news visit re-folds the whole log (≈0.18–0.34 ms/op in node; checkpoint flattens it; publishing a checkpoint is still O(|S|) and a save is still O(log)); GitHub as pipe holds ~31 devices per account at V=15 (125/h pushes), web relay/bucket ~100 with staggered visits (requests grow with N²); email path limited by postbox processing (assumed 1 s/mail ⛔ unmeasured); focus board works on folder/mem/http pipes and now ghPipe name class `f` (one-line change in #2365); the Complete's workflow rows (`ad_wf_*`) are still local-only.

**Lessons from this session (the education to keep):** (1) a green witness can hide a red log line — assert the `verifyChain=ok` line explicitly (found by the film agent: `rebuildSide` persisted tombstones after sealing); (2) film footage is a witness too — the agents' `§FILM_CUE/§FILM_STATE` pinning caught narration running 5 s ahead of the picture; (3) the bad spec example (§13.12.H accounts collapsed on the warehouse device) was found only because the build agent implemented the rule literally — implement-literal-then-compare beats re-reading; (4) an outside LLM opinion is useful for the question it raises, not for its numbers (§13.12.J); (5) an engine file edited by two agents at once is the real collision risk — queue engine steps, parallelise only host/UI work.

**Housekeeping at close:** merged PR worktrees pruned; the unmerged escrow worktrees (`/tmp/wt-escrow`, `/tmp/wt-escrow-ootb`) kept on purpose. `/tmp/wt-base`, `/tmp/wt-basemain`, `/tmp/wt-d73`, `/tmp/wt-d78`, `/tmp/wt-preD59` belong to other sessions — untouched.

---

## ▶ EARLIER RESUME (written 2026-10-23 at session close — still valid for what it covers: ids, accounts, the Gmail post box, the first witnesses)

**State in one line:** the local comm layer — a team ERP/BIM sync with **no DB server and no app server, just a data
relay** — is built, encrypted, witnessed, running on a real GitHub repo and a real Gmail post box, wired into the real
ERP Sales Order window, and explained in a narrated essentials film. It is a **proof of concept**, not a product.

**Where everything is**
- Engine source (canonical): bim-compiler `build/comm/`
  - `comm_envelope`, `comm_order`, `comm_roster`, `comm_admit`, `comm_pipe`, `comm_store`, `comm_visitlog`;
  - Gmail post box Apps Script: `build/comm/postbox/` (`Code.gs`, `appsscript.json`, `.clasp.json`).
- Byte-identical copies in bim-ootb `common/comm/`. Check with `cmp` before trusting either.
- ERP wiring: bim-ootb `erp/team_sync.js` + hooks in `erp/crud_overlay.js` / `erp/idempiere.html` (`?team=1` only).
- Test bench page (live): https://red1oon.github.io/bim-ootb/common/comm/comm_phone.html
  - slim seed `common/comm/access_seed.sql` (154 KB), generated by `common/comm/tools/gen_access_seed.js`.
- Pipe: **private** GitHub repo `red1oon/bim-teams-pipe` — one branch per device, names `s/<space64>/{o,h,r}/<kid>…`.
- Post box: Apps Script **"BIM Team Postbox"** in **amazingerp@gmail.com**, scriptId
  `18I5ET9T5JoB1bqxSJAJuQLZrJvJuu-ATGUnt0_yQ0Z8DrVh3U0V6v_Iv`.
  - Deployment `AKfycbx-HDroFGTi5q7a53T4gpb-fibPpi8DcT8yptupuE7XK9gVqgqn_SBfi168hNlL38xqzQ` (@4, the same URL across
    redeploys).
  - **The secret is ONLY in `~/.config/bim-teams/postbox.json` (mode 600)** — never print or commit it.
  - Redeploy: `clasp push` then `clasp create-deployment -i <deploymentId>` from a dir holding `.clasp.json`.
  - clasp is logged in as amazingerp (`~/.clasprc.json`). The Apps Script API switch must be on at `/u/1/` — the
    browser's second Google account.
- Film:
  - `~/Videos/TheServerIsDead_Essentials_v2_narrated_2026-10-23.mp4` (2:50, user: *"Film is good, will use it as early
    idea sharing"*);
  - script `prompts/film_narration_server_dead_dialogue_v1.tsv`;
  - storyboard deck https://claude.ai/artifact/Vt8DdVP7gAW7BsyfdKWgnQ (19 slides, private);
  - the card renderer and ffmpeg recipe are described in §14.3/§14.4.

**Re-run the proof (read every log; logs in `build/comm/logs/`, gitignored)**
- Local, fast:
  - `node scripts/witness_comm_cl1_uu.js` (23) · `cl2_order` (12) · `cl3_store` (25)
  - `cl4_admit` (23) · `cl5_conflict` (12) · `cl8_opaque` (44) · `space_scope` (23)
  - `node scripts/explore_comm_waiting_ops.js` (9)
- Real network, run once each:
  - `witness_comm_cl3b_github.js` (8; deletes its branches)
  - `witness_comm_gmail_log.js` (5)
- bim-ootb (Playwright at `~/bim-ootb/tests/node_modules/playwright`):
  - `common/tests/witness_comm_cl3_folder.js` (16)
  - `common/tests/witness_comm_phone_page.js` (18; real GitHub + post box)
  - `erp/tests/witness_team_so.js` (19)
- Access-seed self-check: `node common/comm/tools/gen_access_seed.js` → `§SEED-EQ … differences=0`.

**Decisions the user made (don't re-ask)**
- D1: no sequencer.
- D2: references by UUID only.
- D3: offline crossed saves the Git way — per-column conflict, last agreed value kept, iDempiere `CurrentRecordModified`;
  the mine/theirs/before chooser is approved.
- D4: a person's own enrolled device may enrol another.
- Pipe = GitHub repo (no LFS); Gmail = visit log only, with links to repo files.
- Local POC, not public.
- The waiting-ops rule was delegated to me and decided by measurement (§12.6: deps = records read; 50.1% → 0.5% held back).

**Open, in order (next session picks the top one)**
1. **Retake the film footage in ONE fresh space** (§14.3). Both devices: **Start over** ×2 → laptop Start a new space →
   phone opens the NEW invite → Join → Takes A–E (pairing, first transaction, offline, clash, refusal as role 103 at
   Store Central). Then verify from GitHub with an observer, not by eye. Then the full film, including the real ERP window
   (W1 has merged: `idempiere.html?team=1`).
2. **⏸ PARKED 2026-10-24 (user: UI "may not be too pursued")** — Friendlier UI (§14.3, spec §14.5, nothing built):
   - a first-run wizard;
   - a QR code for the invite;
   - a plain status line;
   - the `§` log hidden behind "details";
   - phone-first layout;
   - an old-space warning;
   - the Team Panel (§11.17).
3. ✅ **DECIDED 2026-10-24 (user: "go with your advice"): keep the named `STATION_LOCAL` list.** Reason: the dictionary has no flag to read (`AD_Table.ReplicationType='L'` on all 1003 tables) and adding an AD column would make our dictionary differ from legacy (TWIN rule). It stays the ONE table list in `team_sync.js`, with its reason in the comment. (Was: `STATION_LOCAL` table list in `erp/team_sync.js` (`ad_sequence`, `ad_sequence_no`,
   `ad_recentitem`, `ad_session`, `ad_changelog`) — keep the named list, or add an AD flag? It is an AD-LAYER LAW tension
   (§13.3).)
4. **Team pill + trial (§13.8) shipped (PR #2355); owed: the trial token (user creates it).**
5. **ERP gaps from W1** (§13.3):
   - DocumentNo collides across devices — needs a station-owned sequence (§11.1);
   - edits to **seeded** records aren't shared (scope needs the CREATE);
   - ~~DocActions (W2)~~ ✅ DONE 2026-10-24, §13.7 (bim-ootb PR #2352);
   - **K3: `m_storagereservation` write on a seeded row is REFUSED (`scope-unknown`) and is an absolute old/new — two devices reserving at once lose an update** (§13.7-4);
   - the phone page and ERP share one device identity, so they must not both author.
6. **Still-owed engine steps:**
   - CL6 manifest/version skew;
   - CL7 multi-pipe heal;
   - two admins re-keying concurrently (not witnessed);
   - `comm_visitlog.js` fetch timeout (a hang was seen once);
   - the confirm-by-read-back path of the visit log is not yet exercised by a forced lost reply;
   - retire the older `?relay=` path (after W1 parity, with the user's go);
   - CL4b: run the canUpdate truth table against live iDempiere.
7. **Novelty:** say "to our knowledge" until a proper prior-art search is done (§14.1).

**Lessons from this exercise (the education the user asked to keep)**
- **Test the real user path.** Three bugs only showed in a real browser:
  - the browser HTTP cache served stale GitHub branch pointers;
  - the Visit button was hidden behind approval;
  - a Save before the page was ready did nothing.
  Node witnesses could not see them.
- **The user's own recording found a design-level defect**: unscoped pipe names. Read the footage and the GitHub data
  for what really happened.
- **My own slips caught by witnesses**:
  - a `//` comment swallowed the enrol call;
  - a JSON key-order comparison faked a permutation failure;
  - a read-back answered from a local cache would have made "SENT" vacuous.
- **Film honesty:**
  - the two clips were in different spaces, so no fake cause→effect splice;
  - the phone clip's variable frame rate turned 22 s into 36 s — set fps before trimming;
  - pale subtitles need a dark band on light cards.
- **Shared working tree:** a commit sweeps whatever another session staged. Prefer a worktree when agents run in
  parallel. Don't `pkill` browsers broadly.


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

### §12.15 User report 2026-10-23 — "saved … but doesn't react" → fixed (bim-ootb PR #2333)

- **Reproduced on the live Pages URL.** Save pressed at 2.6 s → pageerror `Cannot read properties of undefined (reading
  'kid')`; the page was ready only at 7.0 s. The page downloads the 27 MB `ad_seed.db` first, and an early press ran
  before the device existed. The rehearsal never pressed early, so it couldn't see this.
- **Fix:**
  - Buttons stay disabled, with a download-progress line, until the page is ready.
  - Actions wait for readiness.
  - Saved token and post box fields are refilled on reload.
  - A failed start says so on the page.
- **`W-PHONE-PAGE` 11/11** with a new `§PHONE-EARLY` arm: disabled + progress while loading, then enabled with Save
  working.
- The user's second report, *"Sorry, unable to open the file at present"*, is Google's page for opening the post box
  `exec` URL directly in a browser signed into several Google accounts. That URL is not for opening; the page calls it
  in the background, and the post box reads back fine (§12.14).
- **Owed:** the 27 MB download is heavy for a phone. A slim seed with only the role and access tables
  (`ad_role`, `ad_role_orgaccess`, `ad_table_access`, `ad_table`) would be under 1 MB — a follow-up.

---

## §13 Next two builds (user, 2026-10-23: *"proceed with Sales Order wiring and encryption. We are just doing local POC and not open to public.. we may make a film to showcase the working concept."*)

Both are local POC (no public users). Both must be filmable: every step is a visible click with a visible result,
and every claim also has a `§` line.

### §13.1 W1 — the real ERP Sales Order window in team mode (owner: ERP-wiring lane)

**Rule (AD-LAYER LAW):** the hook is **generic**. It sits on crud_overlay's commit funnel and the sidecar projection, for
every CRUD op on every AD window. Sales Order (window 143, header + Order Line tab) is the first witnessed
denominator — `X of N` is reported, never "Sales Order works". There are no `if table==='c_order'` branches.

- **Turning it on.** `erp/idempiere.html?team=1` loads `common/comm/*` and a new adapter `erp/team_sync.js`.
  - Identity, space, token and post box are **read from the same-origin IndexedDB `comm_phone`** that
    `common/comm/comm_phone.html` writes. You pair once on the phone page, and the ERP on that browser then acts as that
    device.
  - Without `?team=1` nothing changes (no DOM, no extra scripts).
- **Outgoing.** After each committed local CRUD op, `team_sync` turns the kernel op into a v3 envelope and authors it
  into the comm store:
  - `CommEnvelope.wrapKernelOp` gives the target uu: a CREATE's uu is its `op_uuid`; an UPDATE's uu is the row's
    `<table>_uu` from the live tip.
  - **CL1b, generic FK rule:** a field `<x>_id` holding a negative integer (a device-local synthetic pk) is rewritten to
    `{uu: <x>_uu of that row}`, and that uu is added to `refs` (so it is read). The table is `<x>` by iDempiere's
    TableDir naming. Positive ids are seeded masters, shared by every device, and are left unchanged.
  - An op that can't be fully translated is **not sent**. It shows as a visible local-only warning — never guessed.
- **Incoming (a "Visit"):**
  1. `store.sync(pipe)`.
  2. **Rebuild the sidecar projection** from `store.foldable()` in order. Each op becomes a kernel op with
     `idCol:'<table>_uu'`. FK `{uu}` values become the local pk of that row: the CREATE inserted earlier in the same
     rebuild has pk `-kernelRowId`, so the map is built during the rebuild.
  3. Persist with the existing append-only sidecar mechanism, then refresh the open window.
  - The comm log is the truth; the kernel sidecar is a projection of it.
- **UI, minimal and filmable:**
  - one **Team** chip in the ERP status area: *device code · team devices · "Visit"*;
  - conflicts shown as iDempiere's `CurrentRecordModified` text on the record;
  - delivery counts as on the phone page.
- **Not in W1 (named):**
  - DocActions (Complete/Void) and their fan-out groups — W2;
  - retiring the older `?relay=` path — after W1 parity, with the user's go;
  - slim AD seed.
- **Witness `W-TEAM-SO`** (bim-ootb `erp/tests/`) — two real contexts, real `idempiere.html` login, real clicks in window
  143:
  - A creates a Sales Order with 1 line → Visit → B Visits → B's grid shows the order. On the Order Line tab: **row
    count and parent id per row**; switching tabs without Save.
  - B edits a header field → both Visit → A shows it.
  - The CL1 defect scenario: both create an order, then edit it, then sync → each order keeps its own edit, on both.
  - Both edit the same field crossed → both show the conflict and keep the last agreed value.
  - 0 page errors.
  - Pipe: the local dumb folder server (no GitHub budget). One optional run against `bim-teams-pipe`.
  - Regression: the existing ERP witnesses the lane touches stay green; `erp/sw.js` is bumped if precached files change.

### §13.2 CL8 — encryption: the pipe sees only ciphertext (owner: comm-layer lane)

- **Device keys.** `newDevice()` also makes a P-256 **ECDH** key pair (private part non-extractable). ENROLL params carry
  `dh_jwk`; GENESIS's founder block carries the founder's `dh_jwk`.
- **Space key.** An AES-GCM-256 key per **epoch**, created by the founder (epoch 1).
- **KEYGRANT** (identity op): `{kid, epoch, from_kid, wrapped}` — the space key wrapped for one device, using
  ECDH(granter private, device public) → HKDF-SHA256 → AES-KW (or AES-GCM).
  - It is issued automatically by whoever enrols the device (admin or same-person device, D4), in the same visit.
  - A device derives its keys at open time from its own grants and its ECDH private key, so no symmetric key is ever
    stored.
- **What is encrypted.**
  - Business envelopes inside a bundle are stored as `enc:<epoch>:<base64(iv ‖ ciphertext)>`.
  - The `op_hash` column stays plaintext: read-back, dedup and naming are unchanged.
  - **Identity ops stay plaintext**, because a new device must read its own KEYGRANT before it has a key. They hold only
    names, public keys and wrapped keys.
  - Heads stay plaintext: seq, frontier and timestamps only.
  - A device without the key keeps sealed ops in `cl_sealed`, then opens and ingests them once its grant arrives.
- **Revocation → REKEY.** After a REVOKE, an admin's next visit writes a **REKEY** (epoch n+1) with fresh KEYGRANTs for
  every non-revoked device. New ops use the newest epoch the author holds. A revoked device cannot read anything written
  after the rekey.
- **Witness `W-PIPE-OPAQUE`** (bim-compiler, node, over memPipe + folderPipe):
  - A, B and C converge as before.
  - **Raw pipe bytes contain none of the business values** (documentno strings, distinctive totals), checked by
    grepping every object.
  - An outsider with full pipe access reads the identity ops but **zero** business ops.
  - A late joiner opens sealed ops after its grant.
  - After REVOKE C plus REKEY, C cannot open B's new op, while A can.
  - A tampered ciphertext is refused (GCM tag).
  - All existing comm witnesses stay green:
    - W-UU-NO-COLLIDE, W-ORDER-PERMUTE, W-STORE-NODE, W-ADMIT-FOLD, W-CONFLICT;
    - W-GH-PIPE-2DEV, W-GMAIL-LOG;
    - and, in bim-ootb, W-FOLDER-2CTX and W-PHONE-PAGE (the phone page passes the new ENROLL `dh_jwk` through
      pairing).
- **API the ERP lane may rely on:** `newDevice()` / `newSpace()` / `open()` / `sync()` / `foldable()` / `conflicts()` /
  `enroll(kid, jwk, personUu, dhJwk?)` keep their names and shapes. An ENROLL without `dhJwk` still works, just without
  a key grant.


### §13.7 W2 — DocActions (Complete / Void / …) in team mode (2026-10-24, user: *"begin the wiring of it behind the standard document actions"*)

**Measured first** (`erp/tests/explore_team_docaction.js`, real `idempiere.html?team=1`, window 143, Complete via the host DocAction lane
`__crud.process('c_order', id, 'CO')`; log `scratchpad/explore1.log`). One Complete commits ONE kernel group (gid) of 14 rows:
- model-layer consequences: `ad_wf_process`/`ad_wf_activity`×3/`ad_wf_eventaudit`×3 CREATE, `c_acctschema` UPDATE (period), `m_storagereservation` UPDATE
  (qty 305→307), `m_storagereservationlog` CREATE, `c_orderline` UPDATE (qtyreserved, processed), `c_ordertax` CREATE;
- the status: `c_order` UPDATE (docstatus DR→CO, isapproved, processed, …) **and** the signed `SET_STATUS` row (last).
What W1 did with them: `c_order`/`c_orderline`/`c_ordertax`/`m_storagereservation` ops were SENT as ordinary K2 writes; the workflow rows and the
`c_acctschema` write stayed local-only (FK to an unshared parent / seeded target); **`SET_STATUS` was local-only** ("DocActions are W2").
Consequence on the other device: the grid column says CO but the DocStatus bar (which reads the `SET_STATUS` lane, `crud_core.readTip`) says Draft.

**Decisions (mine, by measurement — the doc-action semantics are already settled in §11.7 K4 + §11.15 D3):**
1. **Share the status op itself.** `SET_STATUS` becomes an envelope (`intent K4`, target = the document's uu) with params `{action, from, to, oracle}`
   plus `changes:{docstatus:{old:from,new:to}}`. The `changes` mirror lets the comm layer's existing per-column conflict rule judge it with the
   `c_order.docstatus` write that rides in the same group — **no change to `build/comm/*`**. The receiving device projects it back to a kernel `SET_STATUS`
   row (not re-running the model layer: the consequences arrive as the ops that were already shared).
2. **A group is all-or-none.** Each shared op of a group carries `grp` (the kernel gid). If any op of a group has a column held back by an open conflict
   on `docstatus`, the **whole group is left out of the projection** on every device: the document keeps its last agreed status AND none of its consequences
   (reservations, tax rows, line flags) show. Reason (measured expectation, to be witnessed): without this, a crossed Complete/Complete leaves the
   document in Draft while its lines say processed and its tax rows are doubled.
3. **Crossed doc-actions are a conflict, not a silent winner** — D3 (Git way) supersedes the older "first valid wins, second REFUSED". Both devices show
   `CurrentRecordModified`; resolving it is the chooser UI (CL-P, not built).
4. **Named, not fixed here:**
   - `m_storagereservation.qty` is sent as absolute old/new on a seeded row: two devices reserving at once lose one update (K3 invariant — needs the owner/CAS rule of §11.7).
   - workflow audit rows (`ad_wf_*`) stay local-only (their parent `ad_wf_process` has a polymorphic `record_id`, rejected by the generic FK rule).
   - a DocAction on a **seeded** document stays local-only (W1 limit 4).
   - DocumentNo collisions (§11.1).

**✅ DONE (witness) 2026-10-24 — bim-ootb PR #2352 (`team_sync.js` only, `build/comm/*` untouched; sw v900).** Logs read in full
(`scratchpad/da2.log`, `so2.log`): `§W-TEAM-DOCACTION PASS judged=17 fails=0 inconclusive=0 pageerrors=0`; regression `§W-TEAM-SO PASS-WITH-INCONCLUSIVE(1) judged=18 fails=0`
(the one inconclusive is the CL1 pk-collision precondition, same as before).
- `§DA-SYNC`: A's Complete sends `SET_STATUS` (was local-only); after Visit A/B both show `readTip`=CO, column CO, 1 tax row, lines processed 1/1, no conflict; B's rebuilt chain `verifyChain=ok`. NO-OP guard: B showed DR before its Visit.
- `§DA-CROSS`: both Complete the same order before any Visit → 9 open conflicts on each device (docstatus among them); order stays DR (`readTip` null, column DR); `tax=0` and processed lines `0` on both
  (24 `§TEAM_GROUP_HELD` lines) — all-or-none held. Before the Visit each device showed tax=1 / CO, so the arm was not vacuous.
- `§DA-REFUSED`: the only refused op of a Complete is `m_storagereservation` (`scope-unknown`) — named limit, pinned by the witness.
- Not witnessed here: Void/Close/Reverse (only `CO` driven), a Complete of a **seeded** document (stays local-only), a real GitHub run.

**Witness `W-TEAM-DOCACTION`** (`erp/tests/witness_team_docaction.js`, harness copied from `witness_team_so.js`; two real browsers, dumb folder pipe):
- `§DA-SYNC` A creates order+line, Visit A, Visit B, A completes (host lane), Visit A, Visit B → B: `readTip` = CO **and** grid docstatus = CO **and** its
  `c_ordertax` count for the order equals A's; `§TEAM_OUT op=SET_STATUS` seen on A (no longer local-only). NO-OP guard: B's `readTip` before A's Visit is not CO.
- `§DA-CROSS` both complete a second order before any Visit → both devices: one open conflict on `docstatus`, `readTip` = DR, **zero** `c_ordertax` rows for that order on both (all-or-none).
  VACUOUS guard: the arm prints INCONCLUSIVE if the order had no consequence rows to hold back.
- `§DA-LOCALONLY` the previous W1 arm (an `applyOp` DocAction with no resolvable target) still ends local-only.
- Regression: `witness_team_so.js` (its `§TEAM-LOCALONLY` arm used `PR` with `id:null`; stays local-only).


### §13.8 Team pill, system-default setup, one-cycle trial, usage tracking (2026-10-24, user)

> User: *"We need to know also how team setting is done. A pill icon showing two human head avatar as its feature? Then the setup values we can default as we already setup. In team user guide we note that this is our system default which they can setup too (catch on our Github side but place a limit to test only a single cycle. Then we can know if users really been using. Track usage ie if can get its IP at least."*
> Decisions (asked, answered): delivery = **trial repo + expiring token**; the cycle = **one Sales Order Complete**.

**Facts checked before designing (so nothing is promised that can't be delivered):**
- **IP cannot be had from GitHub or from the Apps Script post box.** GitHub's API/traffic data gives the repo owner counts (views, clones), never client addresses; an Apps Script web app is not given the caller's address. So "track usage" here = what the pipe itself shows: devices, spaces, bundles, rows, first/last activity (+ the Gmail visit log). Getting an address would need an edge function we run — a server, which the concept deliberately avoids; not built, offered only if the user wants it.
- A key shipped in a public page is readable by anyone. Hence a **separate trial repo** (`red1oon/bim-teams-trial`, private, created 2026-10-24) and a **fine-grained token limited to that one repo, Contents read/write, with an expiry date**. The real pipe (`bim-teams-pipe`) is never in the page. **The token is created by the user in GitHub's settings** (no API makes fine-grained tokens) and pasted into `common/comm/team_defaults.js`; until then the panel says "trial key not installed".

**Design (generic, no window-specific code):**
| # | Piece | Rule |
|---|---|---|
| T1 | **Team pill** (`id:"team"`, Lucide `users` — two heads — added verbatim to `icons.js`) in `pills_idmp.json`, always on the bar | opens the Team panel. Pill present with and without `?team=1` (discoverability); without team mode the page otherwise stays untouched. |
| T2 | **Team panel** `erp/team_panel.js` | shows: mode (off / not paired / ready), setup values (repo, key, visit-log address), "Turn on team mode" (stores `localStorage.teamMode=1`, reloads with `?team=1`), "Pair this browser" (opens `common/comm/comm_phone.html`), trial status. Values default from `team_defaults.js`; **"System default"** badge; the user may replace repo/key (stored in the same IndexedDB `comm_phone` cfg) → badge becomes "Your own". |
| T3 | **Defaults** `common/comm/team_defaults.js` | `{owner:'red1oon', repo:'bim-teams-trial', token:'', postbox:{}, trialCycles:1}`. The phone page and `team_sync.js` read cfg first, defaults second. `cfg.trial` is true only while the default repo+key are in use. |
| T4 | **One-cycle trial limit** `common/comm/team_trial.js` (pure functions + tiny state) | While `cfg.trial`: a space may author business ops until the log holds one document `SET_STATUS` to `CO` (the cycle: order → line → Complete) plus its group; after that, new business ops are **not sent** (local-only reason `trial-finished`) and the panel/chip say "Trial cycle finished — use your own repo and key to continue". Safety cap: 60 business ops per space. Enforced in `team_sync.onCommit` (client side, soft) and by the token's expiry (hard). A user with their own repo/key is not limited. |
| T5 | **Usage report** `scripts/team_trial_usage.js` (bim-compiler, node, `gh api`) | reads `bim-teams-trial` branches/trees: per space → devices, bundles, rows, first/last commit time; prints `§USAGE` lines; prints `INCONCLUSIVE` when the repo has no traffic (never "0 users" as a pass). Says plainly: no IP. |
| T6 | **Team user guide** `erp/team_guide.html` (bim-ootb; served same-origin so the panel can link it) | how to turn on, pair, the system-default note, how to use your own repo/key, what the trial limit is and why, what we can and cannot see about usage. |

**Witnesses:**
- `W-TEAM-TRIAL-LIMIT` (node, pure): cap + cycle logic over fixed op lists — before Complete allowed; after Complete refused; own-repo never limited; empty list is INCONCLUSIVE.
- `W-TEAM-PILL` (Playwright, `erp/tests/witness_team_pill.js`): the pill is on the bar without `?team=1` and the page loads no comm script; clicking it opens the panel; panel shows System default badge, the repo name from `team_defaults.js`, and "trial key not installed" while the token is empty; "Turn on team mode" reloads with `?team=1` and the chip appears (paired fixture) — each a `§` line.
- `W-TEAM-DOCACTION` extended: with `cfg.trial=true` a second order after the first Complete is `local-only reason=trial-finished`.


**✅ DONE (witness) 2026-10-24 — bim-ootb PR #2355 (sw v901); bim-compiler `scripts/team_trial_usage.js`.** Logs read in full:
`§W-TEAM-PILL PASS 14/0` · `§W-TEAM-TRIAL-LIMIT PASS 5/0` (+1 INCONCLUSIVE-by-design: an empty space is "open", not a pass) · `§W-TEAM-DOCACTION PASS 21/0` (new `§DA-TRIAL`:
trial on → a new order after the Complete is `local-only reason=trial-finished`, nothing sent, chip says "Trial cycle finished"; trial off → the same action is sent) ·
`§W-TEAM-SO PASS 19/0` · `§W-PHONE-PAGE PASS 18/0` (real GitHub, branches cleaned up) · `audit_sw_precache` 0 missing.
`node scripts/team_trial_usage.js` → trial repo: `INCONCLUSIVE` (no device branches yet); against the real pipe it lists 2 old device branches, 0 scoped spaces (they predate §13.6).
**Still owed by the user:** create the fine-grained token for `red1oon/bim-teams-trial` (Contents read/write, that repo only, with an expiry) and paste it into `common/comm/team_defaults.js` —
until then the panel says "Trial key not installed". Not built: pairing inside the ERP panel (it links to `comm_phone.html`); an edge function for IP (would be a server — only if you want it).


### §13.9 Desktop-only team setup — pairing inside the Team panel (2026-10-24, user: *"Try to do the ERP setup without the phone, just demo the desktop side and it should work for the Modeller thus do it as single Team setup and Modeller example (mock another user login setup). Is that viable?"*)

**Viable — measured constraints, then design.**
- *Second user on one desktop:* identity (`comm_phone` IndexedDB), the comm store and the ERP's own op-log sidecar (`crud_overlay.js:1904` `SIDE_DBNAME` IndexedDB) are all **per origin and per browser profile**. Two tabs of one profile are ONE user (and would even share the sidecar). So "mock another user" = a **private/incognito window or second browser profile** on the same URL (on a dev machine `localhost` vs `127.0.0.1` are two origins and also work). No code is needed for that — it is how every witness already runs ("laptop" and "phone" are just two contexts).
- *What was really missing:* pairing lived only on `comm_phone.html`. **Change:** the Team panel itself does it — Start a team · invite link · Join · pending requests with a role picker · Approve — through new `TeamSync` calls ported from `comm_phone.html` (same `CommStore` calls: `newSpace/genesis`, join request `s/<space>/r/<kid>`, `addPerson` + `enroll`). The phone page stays as is (mobile).
- *One setup for ERP and Modeller:* identity + space + pipe live in the same IndexedDB `comm_phone` on the same origin, so a browser paired once is paired for BOTH apps. The panel/pairing code is host-neutral (it needs only `CommStore`, `CommPipe`, an access function and a kv store); the Modeller adapter (§15, separate agent) reuses it. This section does not touch `modeller/`.

**✅ DONE (witness) 2026-10-24 — bim-ootb PR #2357 (sw v902).** `§W-TEAM-DESKTOP PASS judged=9 fails=0 inconclusive=0 pageerrors=0` (log read in full); regressions `§W-TEAM-PILL PASS 14/0`,
`§W-TEAM-SO PASS-WITH-INCONCLUSIVE(1) 18/0` (same CL1 precondition as before), `§W-TEAM-DOCACTION PASS 21/0`. Found on the way (all fixed): the folder pipe has `put` only (the join request used `putMany`);
`var roles` (access cache) shadowed a `roles()` function; the Visit button stayed disabled after pairing mid-session. Not covered: the real-GitHub path of the new in-panel pairing (only the folder pipe was run; `W-PHONE-PAGE` still covers the
old path), and the Modeller (agent task, §15) — it should call the same `TeamSync` pairing calls; `TeamSync` is currently ERP-hosted (needs `__crud`/`__idmpDb`), so the Modeller either reuses its pairing functions after a small extraction or ships its own host adapter.

**Witness `W-TEAM-DESKTOP`** (`erp/tests/witness_team_desktop.js`, two real contexts, **no phone page opened**, dumb folder pipe): ① A turns team mode on from the pill, panel shows "not paired"; ② A "Start a team" → invite link; ③ B (separate context) opens the invite link on the ERP, turns team mode on, "Join" → shows its code; ④ A "Check join requests" lists exactly B's code → picks a role → Approve; ⑤ B Visit → panel says "paired"; ⑥ A creates an order (window 143), Visit A, Visit B → B sees it. NO-OP guard: before ⑤ B's chip says waiting. 0 page errors. `W-PHONE-PAGE` and `W-TEAM-SO` stay green (the old pairing path is untouched).

**Same idea, other product:** the borrower "news board" for the mock Micro Finance system (blinded tags published as static shards, sealed notes, per-borrower poll periods, offer computed on the phone) is specified in `~/Projects/ThaiGoldPawn/spec/PAWN_FINTECH_SPEC.md` §25 with its film script `film/news/news_en_v1.tsv`. It reuses §11.17 (a board of latest heads) without any team layer.


### §13.10 Office-day scale scenario — many staff, robust, NOT real-time (2026-10-24, user)

> User: *"Spec the scenario we described where we have high number and robust ERP usage. Calculate outcome. I am not for realtime checking as ERP is not a production floor machine controller. It's a 9 to 5 workflow with rules and roles. Thus it's just a digital used office space of staff processing parts and conveying along."*

**Design stance (decided by the user, so it is a requirement, not a limit):** an ERP day is a **batch of hand-offs between roles** — Sales raises an order, Warehouse completes it, Accounts invoices it — each step done by a person at a desk. Freshness is measured in **minutes**, not milliseconds. So the transport is a **visit every V minutes** (default 15), never a live socket. A hand-off therefore costs one visit period (A's step is visible to B at B's next visit after A's). This is the §11.17 "post office" model and needs no push.

**Model (every input is a stated assumption the user can change; outputs are computed, nothing is claimed as measured that was not):**
| Symbol | Meaning | Default | Source |
|---|---|---|---|
| N | staff devices in ONE space | sweep 10 · 30 · 100 · 300 · 1000 | scenario |
| H | working hours | 8 | 9-to-5 |
| V | visit period (minutes) | 15 (also 5, 30, 60) | scenario (user: not real-time) |
| d | business documents started per staff per day | 20 | **assumption** (office processing; tune) |
| s | steps (hand-offs) per document | 3 (create → complete → invoice) | **assumption** |
| ops/step | shared comm ops per step | **measured** by the simulation from the real layer (§13.7 log: one Complete sends 5 ops — order, reservation, line, tax row, status — of which the reservation write is refused, so 4 are accepted) | `scripts/sim_comm_office_day.js` |
| bytes/op | wire bytes per op incl. seal + signature | **measured** | same |
| c | share of steps that touch a document another person edits in the same visit window | 2 % (**assumption**, swept 0–10 %) | scenario |

**Quantities computed** (formulas live in the script so they reproduce):
- ops/day = N·d·s·(ops/step); visits/day per device = H·60/V; bundles/day = N·H·60/V (a device with nothing new still posts a signed head, so a quiet device costs a head, not a bundle).
- **per-device download/day** = all other devices' bundles = (N−1)·(ops/day per device)·bytes/op — full replication means every device receives everything in its space: the cost grows with N·work, which is why a space must be a **department or branch**, not the company.
- **hand-off latency** = V (one visit) per step ⇒ end-to-end document time ≥ s·V.
- **expected conflicts/day** = N·d·s·c (each a visible `CurrentRecordModified`, never a lost update; D3).
- **GitHub pipe feasibility** (caps from §11.16): writes per visit ≈ 4 content-generating requests; per-repo 6 pushes/min = 360/h; per-account 500 content-generating/h ≈ 125 pushes/h; reads 1 `matching-refs` + ≈ 2 per changed branch. Feasible iff N·(60/V) ≤ min(360, 125)·(accounts) per hour.
- **Transport alternatives** (same four-verb pipe, §11.16/§11.19): GitHub single repo · GitHub one repo per space · object storage / static bucket (no per-repo push cap; request-priced) · broker/relay (needs a server).

**Witness/simulation `W-COMM-OFFICE-DAY`** (`scripts/sim_comm_office_day.js`): the REAL comm layer (`build/comm/*`, sql.js, WebCrypto, CL8 encryption on, `canUpdate` via the AD layer) with N simulated devices over `memPipe`, a virtual clock stepping V minutes, a role pipeline (Sales creates order+line → Warehouse Completes → Accounts finalises), documents handed on only AFTER the receiving device has placed the previous op (so latency is real). Judges: ① **convergence** — after a final settle, all N devices hold one op set and one order; ② **no lost work** — every authored business op is placed on every device; ③ **measured ops/step and bytes/op** feed the projection; ④ **hand-off latency** measured in visits equals the model (≥ 1 visit per hand-off, ≤ 2); ⑤ **conflicts** injected at rate c are all surfaced (count equals injected contested columns, none silent). NO-OP/VACUOUS guards: zero ops authored or zero cross-device hand-offs prints INCONCLUSIVE. Then the projection table above for N up to 1000, printed as `§SCALE` lines (computed, labelled "projected").


### §13.11 Where we cannot match legacy workflow integrity (2026-10-24, user: *"Think of situations where ours cannot do what legacy ERP does in workflow integrity"*)

Legacy iDempiere has ONE database and one server: a transaction is atomic, a row lock serialises writers, a sequence is gap-free, a workflow engine runs timers, and a user can read only what the server sends. Ours has none of those by default. Each row says what legacy does, what ours does **today** (**M** = measured in a witness/log, **R** = by reading the design, unwitnessed), and the class: **F** = fixable inside the design (an owner/CAS op or a rule) · **A** = needs one arbiter (an always-on hub device or a relay with compare-and-set) · **I** = inherent to serverless, only mitigated.

| # | Situation | Legacy | Ours today | Class · planned rule (witness to write) |
|---|---|---|---|---|
| 1 | **Two users take the last unit of stock** | row lock; second gets "insufficient stock" now | both succeed locally; stock write is absolute old/new and the seeded-row write is **refused** (M, §13.7) → the Complete's reservation never arrives, the order shows Completed (partial state) | **A** · K3 owner/CAS for each guarded resource (§11.7); `W-STOCK-LASTUNIT` |
| 2 | **Document numbers** | gap-free `AD_Sequence`, locked | each device allocates its own: both orders were `50001` (M, §13.3) | **F** · station-owned number ranges (§11.1); `W-DOCNO-RANGE` |
| 3 | **Two users Complete the same document** | the second is refused at once ("already processed") | both complete locally and may act on it (ship!) before the next visit; reconciled to a visible conflict, document held at its last agreed status (M, `§DA-CROSS`) | **I** (the window is V) · mitigate with the document `Processing` claim op + shorter V for hand-off documents; `W-CLAIM-DOC` |
| 4 | **Approval workflow across roles** (`AD_WF_Activity`, "Workflow Activities" window) | the approver's inbox is a table every user reads | `ad_wf_*` rows stay local-only (M, §13.7); the approver sees the document go to *In Progress* but not the activity | **F** · share the activity rows (their parent `ad_wf_process` has a polymorphic `record_id` the generic FK rule rejects → give it a `{table,uu}` ref form); `W-WF-APPROVER` |
| 5 | **Posting to the general ledger** (`Fact_Acct`) | one ledger, one poster, trial balance always agrees | each device posts what it completes; `c_acctschema` period writes are local-only (M); two devices could post the same document, or the books differ per device (R) | **A** · one *poster* role/device per ledger (single-writer, K9 style); `W-LEDGER-ONE-POSTER` |
| 6 | **Period close / lock** | refused centrally the instant the period closes | an offline or lagging device can author into a closed period; refused only when its op folds (R) | **F** · period-close is an identity-class op: ops dated in a closed period are refused at admission after the close op in fold order; `W-PERIOD-CLOSED` |
| 7 | **Credit limit / uniqueness (BP tax id, one invoice per order)** | DB constraint or live query across all rows | cross-record checks see only what this device holds; two devices can both pass (R) | **A** for credit; **F** for uniqueness via a claim-by-key op; `W-UNIQUE-KEY` |
| 8 | **Revoking a user** | takes effect on the next request | takes effect at the next admin visit + fold; ops the user authored offline before then are placed or REFUSED by `last_good_seq` (M, W-PIPE-OPAQUE REVOKE); data the user already downloaded stays with them (**I**) | **I** · mitigated by REKEY; window = V |
| 9 | **Read isolation** | the server never sends rows a role cannot read | every member of a space holds the space key, so a modified client could decrypt and read **all** ops in the space; the role layer limits the screen, not the bytes (R, CL8) | **F** · per-audience keys (a key epoch per org/role group, or separate spaces per audience); `W-READ-SCOPE` — see the control discussion in the session notes |
| 10 | **Delete vs concurrent update; FK to a deleted record** | FK constraint / cascade | "no rule yet; delete just hides the row" (§12 note) | **F** · tombstone-wins + dependants held; `W-DELETE-CROSS` |
| 11 | **Server-side batch processes** (generate invoices, cost run, MRP, period-end) | one run, locked by `AD_PInstance` | two devices can run the same process and both create the output (R) | **A** · process-owner claim (single writer) ; `W-PROC-ONCE` |
| 12 | **Scheduled / timed workflow** (timeouts, escalation, reminders) | the server scheduler | nothing runs while no browser is open (R) | **A** · designate one device (or a free scheduled function) as the "clock"; `W-TIMER-HUB` |
| 13 | **Read-your-writes across users** | immediate | after the other user's visit (≤ V; measured 1 visit per hand-off) | **I** · the stance of §13.10: an office day is batch hand-offs |
| 14 | **Cross-department process** (spaces are per department) | one DB | no cross-space document hand-off exists (R) | **F** · a "letter" op addressed to another space (a signed hand-over), designed not built |

**Reading.** Five items need an **arbiter** (stock, ledger posting, credit, batch processes, timers). The honest minimum is **one always-on role** — a hub device or a free scheduled function — that owns exactly those few resources; everything else (numbering, period close, approvals, uniqueness, delete, read scope, cross-space letters) is fixable inside the design. Items 3, 8 and 13 cannot be made instant without a server; their cost is bounded by the visit period V. None of the 14 is witnessed fixed yet; each names the test that would prove it.


### §13.12 The elegant frame — a minimal post office, five peer primitives, one policy (2026-10-24, user: *"Let's go for an elegant framework where post office stays minimalist. Find workarounds or a standard config controller in the post office for values that can be mitigated among peers."*)

**Stance.** The post office stays a dumb object store. Everything legacy gets from "one server" is rebuilt from **rules every peer folds identically** (so they agree without talking) plus a **small signed policy** that fixes the values peers cannot choose alone. No arbiter machine; no always-on role.

**A. The post office (minimal, maintenance-free) — only four things**
1. `put / get / list / putMany` of opaque objects (unchanged four-verb contract, §11.2).
2. **Write gate** from `gate.json`: a per-space write token (rotates with each key epoch, so REVOKE cuts a leaver off), max object size, max puts per device per hour. It answers "who may write junk", never "what is true" (truth = signatures + fold, as today).
3. A cached copy of `policy.json` (below) so a brand-new device can bootstrap before it has the log.
4. Optional retention: delete bundles older than the last checkpoint (§C-5).
It holds no business logic, no user database, no clock, no queue. Any bucket, GitHub repo, or Apps Script can be one.

**B. The standard config controller = `POLICY` (one admin-signed op in the log, mirrored to `policy.json`)**
A normal identity-class op, so it is ordered by the same fold and **every peer applies it at the same log position** (deterministic, tamper-evident, versioned by epoch). Values it fixes — exactly those a peer cannot decide alone:
| Value | Why peers cannot choose it | Used by |
|---|---|---|
| visit period V and **stagger rule** (offset = hash(kid) mod V) | must be common and spread, or the relay sees synchronized bursts (§13.10) | all |
| gate parameters (size, puts/hour), write-token epoch | the post office enforces them | A.2 |
| **pipe directory**: primary + fallback pipes, switch-over epoch, cross-space addresses | peers need one agreed place to look | failover, §14 gap |
| bundle caps (max ops/bundle), **checkpoint cadence** | bound the log and the visit cost (§13.10 growth limit) | C-5 |
| **audience map**: table/role group → audience key, who holds which key | read isolation needs the same map everywhere | C-4 |
| **rules manifest** (hash of the AD + posting rules version) | derived data must come from the same rules (§11.8) | C-3 |
| lease TTLs, escrow slice defaults, number prefix scheme | common constants for C-1/C-2 | C-1, C-2 |
| period calendar (`PERIOD_CLOSE` is its own op) | a closed period must close for everyone | gap 6 |
| trial flags / retention | operations policy | §13.8 |
Anything NOT in this list is decided by peers with the primitives below. Changing the policy is a rare admin act; a peer that has not yet seen the newer epoch keeps the older one until its next visit (bounded by V).

**C. Five peer primitives (all folded; none needs a server)**
1. **KEYCLAIM — first-in-fold-order wins** on a key. One op type, many uses: *document number blocks / station prefixes* (gap 2), *uniqueness* (BP tax id, one invoice per order; gap 7), *document claim before Complete* (soft "Processing", gap 3), *timer fired* (`TIMER:<doc>:<rule>` — any peer that opens the app and finds a rule due posts it; duplicates collapse; **no clock hub**, gap 12), *process run* (`RUN:<process>:<period>`, gap 11), *delete tombstone* (gap 10). A loser is told at its next visit through the existing visible-conflict path. With a TTL it becomes a **LEASE** (same op + `until`, takeover only by an op that cites the expired lease — the `G-LEASE-EXPIRY` pattern already in teams/), used for the *ledger poster* role if one is ever wanted.
2. **ESCROW (bounded counters).** A guarded quantity (stock per product×locator, credit headroom per partner) is **split into slices owned by desks**; a desk decrements only its own slice, so the invariant "never below zero" holds **without coordination**. Running out is a normal workflow step: the desk sends a `TRANSFER_REQUEST` and a peer with spare answers `TRANSFER`. Initial slices come from the policy's defaults. This replaces K3's central owner (gap 1, credit in 7) with something peers do alone.
3. **DERIVED, never authored.** GL postings (`Fact_Acct`), totals, aging, balances are **pure functions of the folded documents under the pinned rules manifest**, so every peer computes the identical ledger itself and nothing is shared (gap 5). The only shared fact is the document and its status. A witness recomputes the trial balance on two devices and compares.
4. **AUDIENCE keys.** One key epoch **per audience** (org / department / role group) instead of one per space; an op is sealed to its table's audience; members hold the keys of the audiences they belong to (gap 9). A cross-audience step is a *letter* (below).
5. **CHECKPOINT.** Any peer may publish a signed snapshot of the folded state at log position P; peers adopt it after checking the hash against their own fold (or after N co-signatures), then fold only what follows. It bounds visit cost (§13.10: a quiet visit costs ≈0.34 ms per op in the log) and lets the post office delete old bundles.
6. **LETTER** (cross-space). A signed op addressed to another space's directory entry (policy B): the receiving space imports it as a normal intake document (gap 14).

**D. What stays inherent (named, not hidden):** a stale read lasts up to V (gaps 3, 13); a revoked user keeps what they already downloaded (8); the first loser of a KEYCLAIM race learns at the next visit. Everything else of the 14 in §13.11 maps to one of C-1…C-6 or to a normal fix (period close, approval rows).

**E. Build order (each ends with its witness; nothing is built yet).**
1. `POLICY` op + `gate.json` + stagger (witness `W-POLICY-FOLD`: two devices apply the same policy at the same position; a device with an old epoch is refused by the gate after rotation; a flood past the cap is refused).
2. `KEYCLAIM` + station prefix (witnesses `W-DOCNO-NOCLASH`, `W-UNIQUE-KEY`, `W-TIMER-ONCE`, `W-CLAIM-DOC`; each with a control where two devices race).
3. `CHECKPOINT` (witness `W-CHECKPOINT`: visit time flat after adoption; adopted state hash equals a full fold) — removes the first limit of §13.10.
4. `ESCROW` for stock (witness `W-STOCK-LASTUNIT`: two desks, one unit left → exactly one succeeds, never negative, with a transfer arm).
5. `DERIVED` check (witness `W-LEDGER-TWOSIDES`) · 6. `AUDIENCE` keys (witness `W-READ-SCOPE`: a device without the audience key reads zero bytes of that audience, with a control that it can with the key).
Recommendation: build 1 → 3 → 2 first (they remove the measured limits and the duplicate-number defect), then 4.

### §13.12.1 build spec — POLICY op, reference write gate, stagger (2026-10-24, Witness: `W-POLICY-FOLD`, `scripts/witness_comm_policy.js`)

**Op.** `POLICY`, identity class (plaintext in bundles, like KEYGRANT; it holds configuration only). Target `{table:'comm_policy', uu: policyUU(space)}` (one record; a new POLICY reads the previous one's version).
`params = { epoch:int>=1, visit_ms?:int>0 (V), stagger?:'kid-hash-mod-V', bundle_max_ops?:int>=1, gate?:{max_object_bytes?, max_puts_per_hour?}, checkpoint?:{every_ops?, cosigs?}, lease_ttl_ms?:int>0, pipes?:{primary?:string, fallback?:[string]} (informational), manifest?:string (informational), number_prefix?:string (informational) }`.
Unknown keys are kept and ignored (a newer admin may add values an older device does not know; refusing them would make two devices judge the same op differently).

**Fold (comm_roster.js, inside `walk`, same family as REKEY).** Signer must be a comm-admin (`not-admin`); invalid values → `bad-policy:<field>`; `epoch` must exceed the current one: equal → `epoch-exists` (first in fold order wins an epoch), lower → `epoch-stale`.
A POLICY **replaces** the previous one entirely (the admin re-sends the full set). `roster.policy = {epoch, params, hash, author}`; `store.policy()` adds `pos` = its fold position, which is the same on every device.

**Pure functions.** `staggerOffset(kid, V)` = FNV-1a-32(kid text) mod V (ms, in `[0,V)`); `store.visitOffset()` applies it to the device's own kid once a policy fixes V. `bundle_max_ops` is applied by `bundleNew` (the rest goes at the next visit; no policy = unchanged behaviour).

**Reference gate (comm_pipe.js).** `gatedPipe(pipe, gateJson, {now})` with `gateJson = {token, max_object_bytes?, max_puts_per_hour?}` wraps ANY pipe (the real GitHub pipe is untouched); `gate.writer(token)` gives the pipe a device sees, `gate.rotate(newJson)` rotates the token.
A refused write returns `false` (like an HTTP 4xx), is listed in `gate.refusals` with reason `stale-token` | `bad-name` | `oversize` | `rate`, and the visit shows it as `PUT-UNVERIFIED` (not sent, retried next visit). One put/putMany call = one put; the hour is a sliding window of `now()`; reads are not gated. `gateFromPolicy(params, token)` builds the gateJson from a policy.

**Witness arms** (each with a control that can fail): POLICY-FOLD (3 devices: same policy hash and same `pos`; control: before the POLICY op none has one) · NONADMIN (a non-admin POLICY is REFUSED `not-admin` on every device and does not take effect; control: the same params from the admin are MERGED) · EPOCH (a higher epoch wins; a lower and an equal one are refused; the effective policy never goes down; two admins racing the same epoch → one winner on every device) · BADVALUE (`bad-policy:visit_ms`) · UNKNOWNKEY (an unknown key is kept, op MERGED) · STAGGER (deterministic, in `[0,V)`, ≤ 2x the mean per bucket over 100 kids; control: an obviously clustered rule — `kid mod 1` — fails the same spread test) · CAP (`bundle_max_ops=3` → 8 ops go out 3+3+2 and all converge; control: no policy sends 8 at once) · GATE (stale token after rotation, oversize object, the cap+1-th put in an hour; each with a control that the same write succeeds when allowed, and an end-to-end arm through `store.sync` showing the refused visit is retried and delivered with the fresh token) · SKEW (an engine from before this change folds a log that contains POLICY without crashing and refuses it; unknown op types do not crash a newer device).

**Results 2026-10-24** (`node scripts/witness_comm_policy.js`, log `build/comm/logs/witness_comm_policy.log`, read in full): **`§W-POLICY-FOLD PASS judged=32 fails=0 inconclusive=0`**.
- `§POLICY-FOLD epoch=1/1/1/1 hash=402af596ca ×4 pos=4/4/4/4` (control: `policies=none/none/none` before the op). `§POLICY-NONADMIN verdicts=REFUSED:not-admin ×4 effective epoch(C)=1`, control: the same op from a second admin MERGED, epoch 2.
- `§POLICY-EPOCH lower=REFUSED:epoch-stale equal=REFUSED:epoch-exists effective epoch=2`; higher epoch 5 wins on all four; race on epoch 6: `A:MERGED D:REFUSED` on all four devices, one winner hash.
- `§STAGGER V=900000 kids=100 buckets=9,13,13,13,9,7,6,10,8,12 max=13 (mean 10, limit 20)`; the clustered control gives `max=100` and fails the same test.
- `§CAP bundle_max_ops=3 ops=8 sent per visit=3+3+2+0 A placed=8 B placed=8`; control without policy `sent=8`.
- `§GATE` stale-token / oversize (1001 B refused, 1000 B stored) / rate (puts 4,5 stored, 6,7 refused; another device unaffected; an hour later allowed) each with its control; end to end through `store.sync`: `stale visit: sent=0 readBackFail=1 outbox=PUT-UNVERIFIED delivery=SAVED` then `fresh visit: sent=2 A placed=2`.
- `§SKEW old engine` (the engine of commit 34b915fb1 loaded from git, isolated): `crashed=false POLICY op held=1 verdict=REFUSED:scope-unknown business placed=1`; a new device given an unknown op type: `REFUSED:scope-unknown`.
- **The witness can fail:** with the `not-admin` check removed from the fold and the token check removed from the gate it goes red on 10 arms (`fails=10`, verdict `INCONCLUSIVE` because the race collapsed).
- *Left out, named:* the real GitHub pipe is not gated (a gate on GitHub is a repo/ruleset matter, not code here); the write token is an opaque string handed out by the gate holder — deriving it from the key epoch (so REKEY rotates it automatically) and mirroring `policy.json` into the post office are **not built**; the device does not pre-split a bundle that is over `max_object_bytes` (use `bundle_max_ops`); `pipes`, `manifest`, `number_prefix` are carried and folded but nothing consumes them yet.



### §13.12.2 build spec — KEYCLAIM (2026-10-24, Witness: `W-KEYCLAIM`, `scripts/witness_comm_keyclaim.js`)

**Op.** `KEYCLAIM`, **business class** (sealed in bundles in an encrypted space — a key such as `UNIQUE:c_bpartner:taxid:…` is business data; an identity-class op would leave it in the clear). Target `{table:'comm_claim', uu: claimUU(space, key)}` (so a claimant that has seen an earlier claim *reads* it and orders after it).
`params = { key:string (1..200), until?:int>=1, takes?:hex64 }`. `until` = lease end (ms; compared with a *signed op's own* `ts`, never a clock the fold reads); `takes` = the hash of the claim being taken over.
**Admission** (`CommAdmit.admitClaim`): unknown device → PARKED; bad signature / revoked past its cut-off / no role → REFUSED (as every op); **no table access check** (a claim writes no table); malformed params → `bad-claim:<field>`.
**Fold** (in `core`, after the order is known, so "first" means FIRST IN FOLD ORDER, the same on every device). State `claims[keyh] = {h: op hash, a: author kid, u: until|null, p: payload|null}` with `keyh = sha256('claim:'+space+':'+key)` (the key itself never goes into a snapshot).
1. no claim on the key → this op wins;
2. a claim exists and this op has no `takes` → REFUSED `key-claimed`;
3. `takes` ≠ the winner's hash → REFUSED `bad-takeover`; `takes` = the winner but the winner has no `until` or this op's `ts < until` → REFUSED `lease-live`; otherwise (the lease has expired — shown by the taking op's own signed `ts`) the op wins and replaces the lease.
A refused claim leaves the order and is removed from it; ops that read its version are refused `dep-refused` (the version never happened) and the pass repeats until nothing more is refused. A loser stays a loser.
**Uses (keys):** `DOCNO:<station>:<block>` (document-number block) · `UNIQUE:c_bpartner:taxid:<v>` · `PROCESS:<doc>` (document processing claim) · `TIMER:<doc>:<rule>` (timer-once; any peer that finds a rule due claims it, duplicates collapse, no clock hub) · `RUN:<process>:<period>` · lease for a single-poster role (`until`).
**API.** `store.claim(key, {until, takes, ts})`; `store.claimOf(key)` → the winner `{hash, author, person, until}` or null; `store.claims()` → every claim op with its verdict; `store.claimNotices(personUu)` → the person's claims that lost, with the winner (the Notice the loser sees — derived from the fold, like conflicts). KEYCLAIM/BOOKING ops are not handed to the kernel (`placedEnvelopes`/`foldable`/`conflicts` skip them).
**Checkpoint:** `state.claims` (and `state.used`, §13.12.F.1) is what makes a claim won inside S final: the barrier (§13.12.3) keeps an S winner against a late claimant that the plain fold would have ordered first; a light client that never folded S refuses a new claim on an S key from `state.claims` alone.
**Witness arms** (control for each): RACE (devices claim the same key concurrently — neither op depends on the other — → exactly one MERGED, the same on every device, the loser REFUSED `key-claimed` with a Notice; INCONCLUSIVE if no pair was concurrent) · INDEPENDENT (claims on other keys are not touched; a race-free claim is MERGED) · USES (document-number block, tax-id uniqueness, document processing claim, timer-once with three devices → exactly one winner each) · LEASE (a claim without `takes` on an expired lease is refused; with `takes` before `until` → `lease-live`; with `takes` after `until` → wins; a wrong `takes` → `bad-takeover`; afterwards another claimant is refused) · OPAQUE (the key strings are not found in the pipe bytes of an encrypted space; control: found in a plaintext space) · CHECKPOINT (S winner holds against late claimants on the in-force devices and the light client; plain control: some late claimants win) · SKEW (an older engine refuses the op without crashing).

**Results 2026-10-24** (`node scripts/witness_comm_keyclaim.js`, log `build/comm/logs/witness_comm_keyclaim.log`, read in full): **`§W-KEYCLAIM PASS judged=25 fails=0 inconclusive=0`**.
- `§KC-RACE keys=8 concurrent pairs=8 ; identical verdict pair on all 6 devices for 8/8 ; exactly one MERGED for 8 ; loser REFUSED key-claimed for 8 ; loser got a Notice (winner none) for 8 ; winners by device {"A":2,"B":3,"C":3}` — the winner is fold order, not who asked first.
- `§KC-USES timer-once (3 devices): MERGED=1 ; uniqueness: one MERGED, the loser's gated document REFUSED dep-refused ; processing: B=REFUSED:key-claimed C=MERGED:claim`.
- `§KC-LEASE original=MERGED | expired, no citation=REFUSED:key-claimed | cites, before until=REFUSED:lease-live | cites another claim=REFUSED:bad-takeover | cites at until=MERGED | later claimant=REFUSED:key-claimed ; holder now B (the taker)`.
- `§KC-OPAQUE encrypted space: objects=23 needle hits=0 ; plaintext space (control): hits=2`.
- `§KC-CHECKPOINT … S-winners still holding their key (of 12): A=12 V=12 F=12 L=12 | plain control O=6 ; late claims that WON: A=0 V=0 F=0 | plain control O=6` — the barrier keeps an already-won number; a light client that never folded S refuses a new claim on an S key from `state.claims` alone (`REFUSED:key-claimed`); the snapshot state is sealed and keys claims by hash.
- `§KC-SKEW old engine: crashed=false KEYCLAIM ops opened=58 sample verdict=REFUSED:scope-unknown`.
- **The witness can fail:** every claim wins → 12 arms red (`fails=12`, INCONCLUSIVE); claims forgotten across the checkpoint → 2 red; a lease taken without citation → 2 red.
- *Note on `lease-live`:* a takeover that sorts BEFORE an early citation makes the early one `bad-takeover` (the lease was already taken) — the verdict depends on fold position, never on arrival, and is the same on every device; the witness tests `lease-live` on its own key for that reason.
- *Left out, named:* the claim fold is a *fixed point*, a loser stays a loser even if its winner is later removed by a cascade; `until` is judged by the taking op's own signed `ts` (a device with a wrong clock can take a lease early or late — the cure is a policy skew bound, not built); a KEYCLAIM through `putIfAbsent` (immediate hard winner when the pipe is up) is the booking flow of §13.12.F.1.

### §13.12.F.1 build spec — `putIfAbsent` and document-number BOOKING (2026-10-24, Witnesses `W-PIPE-IFABSENT`, `W-DOCNO-BOOKING`, `W-DOCNO-MODES`; design in §13.12.F)

**The verb.** `pipe.putIfAbsent(name, bytes)` → `true` (created) | `false` (the name already existed; nothing written) and **throws** on a transport error or a gate refusal (so "number taken" is never confused with "post office said no"). `pipe.ifAbsent === true` says a pipe has it. memPipe: a Map check; folderPipe: `fs.writeFileSync(…, {flag:'wx'})`; httpPipe client: `PUT <base>/f/<name>?absent=1` — `201` created, `412` exists, anything else throws (the test server in the witness implements the flag); gate wrapper: the same checks as `put` (token, size, rate) then the inner verb; ghPipe: `ifAbsent === false` and `putIfAbsent` throws `unsupported` — a GitHub compare-and-swap through a non-forced ref update is a later step, not built here.
**Sequence config** (an AD_Sequence-like object, passed in as `open(…, {sequences:[…]})`; the ERP window code is not touched): `{uu, tables:[table…], mode:'S'|'B'|'K', prefix, suffix, pad, start_no, increment_no, block_size?, station?(kid)→code}`; the DocumentNo is `prefix [+ station code in S] + zero-padded n + suffix`. With no `sequences`, nothing below is active and the fold is unchanged.
**Objects and ops.** Booking object `s/<space>/seq/<seq_uu>/<n>` (mode B) or `…/blk<j>` (mode K), content `{seq, n|block, device, doc}`. The signed record is the op `BOOKING {seq, n, doc}` (B) or `{seq, block:j, from, to}` (K): business class, a claim on the key `BOOKING:<seq>:<n>` / `BLOCK:<seq>:<j>`, resolved by the same first-in-fold-order rule as KEYCLAIM (the pipe object makes the winner known at once; the fold is the backstop when the pipe was down or two pipes disagree).
**Numbered documents.** A document op (CREATE or UPDATE of any table) names its number with `params.docno_ref = {seq, n}` and sets `documentno`; it lists the booking record in `refs` so it orders after the booking.
**Admission** (generic, config-driven, in `core` after the claims): an op that sets a non-empty `documentno` on a table that has a configured sequence and carries no `docno_ref` → REFUSED `docno-unnumbered`; unknown sequence → `docno-unknown-seq`; wrong table → `docno-wrong-table`; `documentno` ≠ the format of `n` → `docno-mismatch`;
mode B: the winning BOOKING of `(seq,n)` must exist (`docno-unbooked`), be by the same device and name THIS document (`docno-booking-names-other-doc`); mode K: the winning BLOCK booking of the block containing `n` must be by the same device and cover `n` (`docno-outside-block`); modes S and K: `(seq, device, n)` may be used by one document only (`docno-duplicate`, first in fold order wins).
**Flow API** (`store.numberDocument(pipe, seqUU, docUU, o)` chooses by mode): B → list `seq/<uu>/`, take max n + increment, `putIfAbsent`, on `false` try the next n (a loser retries inside the same Complete), then author the BOOKING; pipe error → `{offline:true}` and **nothing is consumed or authored** (the Complete waits; never a duplicate). K → use a free number of a block this device holds, else `bookBlock` (putIfAbsent on `blk<j>`, next j on `false`) then allocate; offline with a block left works, with none → `{offline:true}`. S → the next unused n of this device, no pipe. Returns `{mode, n, docno, ref, refs}`; `store.bookDocNo`, `store.bookBlock` are the pieces. `o.afterList` is a test seam awaited between the list and the put (to force a race).
**Witness arms.** IFABSENT: the verb on mem/folder/http/gated pipes — first create true, second false, bytes unchanged; 20 concurrent creates of one name → exactly one true; control: plain `put` overwrites (so the verb is what makes it safe); gate: stale token / oversize / rate throw, nothing stored; ghPipe is declared unsupported. BOOKING: two devices Complete at once (race forced) → two different consecutive numbers, same on every device, the loser tried twice; a forged number (no booking / booking of another doc / wrong format) is REFUSED at admission with the right reason; two BOOKING ops for one number written without the pipe → one wins in the fold, the other document is refused; control: a properly booked document is MERGED; INCONCLUSIVE if no one lost the race. MODES: S needs no pipe and never clashes, a repeated n for another document is refused; K exhausts a block of 5 then books the next, blocks of two devices never overlap (race forced), an n outside the block is refused; B with the pipe down → `offline`, no op authored, no n consumed, and the next number after the pipe returns is the first free one.

**Results 2026-10-24** (logs `build/comm/logs/witness_pipe_ifabsent.log`, `witness_comm_docno_booking.log`, `witness_comm_docno_modes.log`, read in full):
**`§W-PIPE-IFABSENT PASS judged=24 fails=0 inconclusive=0` · `§W-DOCNO-BOOKING PASS judged=15 fails=0 inconclusive=0` · `§W-DOCNO-MODES PASS judged=14 fails=0 inconclusive=0`.**
- IFABSENT: on memPipe, folderPipe and httpPipe (a real local HTTP server implementing `?absent=1`) `create=true again=false stored=first`; **20 concurrent creators → `true=1`**, the stored bytes are the winner's; the control (20 concurrent plain puts) gives 20 `true` and the last overwrites; **6 real OS processes on one folder file: `LOST,WON,LOST,LOST,LOST,LOST`**; a dead HTTP server throws (never "taken"); the gate throws `gate-refused:oversize|stale-token|rate` and stores nothing; ghPipe `ifAbsent === false`, `putIfAbsent` rejects "unsupported".
- BOOKING: `§BK-RACE A booked n=1000 (INV-01000) after 1 try ; B booked n=1001 (INV-01001) after 2 try` (a barrier forces both to list before either writes); eight Completes from three devices → 1000..1007, no gap, identical on all five devices; forged numbers refused by the generic rule — `docno-unbooked` · `docno-booking-names-other-doc` · `docno-mismatch` · `docno-unnumbered` · `docno-unknown-seq` · `docno-booker-mismatch` — each identical on the verifier, the publisher and the no-checkpoint control, with controls (a properly booked document, the document a booking names, a draft without a number) MERGED; **two BOOKING ops for one number written with the pipe bypassed: one `MERGED`, the other `REFUSED:key-claimed`, and its document refused, the same on all five**; with no sequence config nothing is refused for its DocumentNo.
- MODES: S — `pipe touched 0 times`, nine documents from three devices offline, nine different numbers (`POS-<station><n>`), a reused number for another document `REFUSED:docno-duplicate` (the document authored FIRST keeps it), another station's code `docno-mismatch`; K — block race `A block 0 [1..5] in 1 try ; B block 1 [6..10] in 2 try`, ten documents allocated with the pipe DOWN all MERGED, the 6th is `{offline:true}` while down and `K-011` from the next block once up, a number from the other device's block `REFUSED:docno-outside-block`; B — pipe down → `{offline:true}`, **ops before/after 5/5** (no op authored, no number consumed), then 500, 501.
- **The witnesses can fail** (mutations run): `putIfAbsent` that overwrites → 3 arms red; booking check removed → `docno-unbooked` arm red; S duplicates allowed → duplicate arm red.
- *What the fold needs from the document:* a numbered document must list the booking record in `refs` (modes B, K — `numberDocument` returns `refs`), otherwise it can be ordered before its booking and is refused `docno-unbooked`/`docno-outside-block`; a first draft of the S/K duplicate rule let the document that sorts first by hash keep the number — fixed to "the device's lowest seq keeps it", which is what a user expects.
- *Left out, named:* ghPipe (GitHub compare-and-swap); the ERP wiring (`erp/team_sync.js` calling `numberDocument` at Complete, the AD_Sequence window feeding `sequences`) — a follow-up as instructed; devices must be opened with the SAME `sequences` config (it is not yet pinned in the POLICY `manifest`); a booking object is unsigned (the signed BOOKING op in the log is the record), so a rogue writer can burn numbers at the post office — the gate's per-device rate cap and the abandoned-booking gap are legacy behaviour, not repaired; an abandoned booking leaves a gap in mode B by design.

### §13.12.3 build spec — CHECKPOINT (2026-10-24, Witness: `W-CHECKPOINT`, `scripts/witness_comm_checkpoint.js`)

**What is checkpointed, and why a position is not enough.** The device's whole cost is `order()`: it re-reads, re-admits and re-linearizes EVERY op at every visit (§13.10: ~0.34 ms per op — in the simulation most of it is the AD `canUpdate` call per op). A checkpoint lets a device keep the fold of a closed prefix **S** and fold only what follows.
A bare "log position P" is unsound here: the order is *causal + lowest hash first among ready ops*, so a late op that has been waiting can slot into the middle of the old order and every position after it moves. Therefore S is named by a **frontier** `{kid: max seq}` (a set, not a position), and a checkpoint is a **barrier**: the order of a log that contains an in-force checkpoint is `order(S alone) ++ [the CHECKPOINT op] ++ order(everything else, S treated as already placed)`. This is a new canonical rule, so it applies only to logs that contain a CHECKPOINT op (logs without one fold byte-for-byte as before); an engine older than this change does not know it and may order post-checkpoint ops differently (the `manifest` field of POLICY is where a space says which engine it needs).

**Op.** `CHECKPOINT`, identity class (plaintext), target `{table:'comm_checkpoint', uu: ckptUU(space, state_hash)}`; any enrolled, non-revoked device may publish or co-sign.
`params = { pos:int>=1, state_hash:hex64, frontier:{kid:int>=1}, prev:hex64|null, bytes_ref:string }`.
`frontier` is needed beyond the spec's `{pos, state_hash, bytes_ref}` (it is what names S); `prev` = the `state_hash` of the checkpoint this one extends (null for the first).
Roster fold: structural check (`bad-checkpoint:<field>`); a second op for the same `state_hash` must carry the same `pos/frontier/prev` (`checkpoint-mismatch`) and come from a new author (`checkpoint-duplicate`) — that is a **co-signature**. `roster.checkpoints[state_hash] = {params, ops:[{hash,author,person,bytes_ref}], persons}`; "N co-signatures" = N distinct *persons* (default N = 2, `policy.checkpoint.cosigs`).

**State.** `state = {v:1, space, frontier, prev, order:[op hash…], verdict:{hash:{verdict,reason}}, scopes:{record uu:[client,org]}, claims:{}}`, `state_hash = sha256(canonical(state))`, `pos = order.length`. `order` = the MERGED ops of S in barrier order (identity and business); `verdict` = every op of S (MERGED or REFUSED; none PARKED/EQUIVOCATED); `scopes` = the client/org of each record whose CREATE is in S (so a later UPDATE can be admitted without the CREATE being re-read); `claims` is filled by KEYCLAIM (§13.12.2).
**Snapshot object** = a normal bundle (`ops` table: S's ops, identity plaintext, business sealed under the newest epoch key like any bundle) + a `meta` table holding `state`, named `s/<space>/o/<kid>/ck.<pos>.<h12>.bimsnap`. Because it is a bundle, every device ingests it through the normal path and an old engine just sees duplicates.

**In force** (decided by every device from the log, same answer everywhere): a checkpoint is in force on a device iff all hold —
1. **accepted**: a MERGED CHECKPOINT op for it is in the roster; its deps are inside S;
2. **verified**: either (a) the device's own fold reproduces `state_hash` — `fold(S alone)` under the barrier of `prev`, roster = the identity ops of S only — or (b) light-client mode (`opts.trustCheckpoints`), ≥ N co-signing persons, and the snapshot's `meta.state` hashes to `state_hash` and lists exactly the ops the device holds under the frontier (nothing is folded; the AD adapter is not called for S). A mismatch is `BAD`, logged `§CKPT_REFUSED`, and never retried for that op;
3. **stable** (no later op can change a verdict inside S): for every identity op in S, the verdict under the full roster equals the verdict in the S-alone roster; for every author in the frontier, device key/person and the revoke cut-off (`cut` ≥ frontier counts as equal) are equal; for every person of those authors, every role entry the full roster has and the S-alone roster lacks does not apply to any seq ≤ frontier (`from_seq[kid] ≥ frontier[kid]`); and no contender op claims a slot (author, seq ≤ frontier). A late REVOKE/ROLE that reaches into S, or a late equivocation of an S slot, therefore switches the checkpoint OFF on every device that sees it and the fold is the plain full fold again (`§CKPT_STALE`) — the checkpoint is an optimisation that cannot change a verdict.
Chain: of several in force, the highest `pos` is used; a checkpoint whose `frontier` does not cover the previous in-force one is ignored.

**Fold with a base** (`core(base)` in `comm_store.js`, the body of `order()` generalised; `base=null` is today's code): only ops beyond the frontier are read (per-author index range, so the read is O(new)); the roster is the plain fold of ALL identity ops (a few hundred at most; constant in the business log); business ops of S keep their verdict from `state.verdict`; a rest op is admitted against the full roster with scope from `state.scopes` or its own CREATE; a dep inside S satisfies readiness, a dep that is REFUSED in S refuses the op (`dep-refused`), a dep nobody holds parks it; every rest op implicitly depends on the CHECKPOINT op, so it is placed first. `cl_verdict` rows are rewritten only for rest ops.
**Per-visit costs that were also O(log) in the sync path** are made O(new): `frontier()`/`gaps()` read an aggregate (`MAX`/`COUNT` per author; the old per-row scan only for an author whose counts say it has a hole) and `autoKeys()` reads its own KEYGRANT/REKEY rows by type instead of parsing every op. Results are identical (the witness compares them with the old scans).

**API.** `store.checkpoint(pipe, {keepTail?})` → publishes (snapshot to the pipe, then the CHECKPOINT op) or returns `{skipped: reason}` (`nothing-new`, `parked-in-S`, `reads-outside-frontier`, `unstable`); `store.cosign(pipe)`; `store.checkpointInfo()` → `{inForce:{state_hash,pos,frontier}|null, candidates:[{state_hash,pos,cosigners,status}]}`; `open(…, {noCheckpoint:true})` is the **control switch** (never adopts; used by the witness and the growth probe); `opts.trustCheckpoints` is the light-client switch. Policy `checkpoint.every_ops` is read by `store.checkpointDue()` (rest size ≥ every_ops); nothing publishes by itself yet.

**Witness arms** (`W-CHECKPOINT`; each can say NO-OP / VACUOUS): EQUAL (a device with the whole log folds S itself: adopted `state_hash` = the published one; control: a sibling with `noCheckpoint` reaches the same *op set* and the same verdicts) · BARRIER (an independent oracle written in the witness from this spec — `linearize(S)` then `linearize(rest | S placed, checkpoint first)` using only `CommOrder`/`CommRoster`/`CommAdmit` — equals the engine's order and verdicts on A, the verified device and the light client) · TRUST (a fresh device with only the snapshot adopts with the AD adapter called **0** times for S; a device that verifies calls it |S business| times) · TAMPER (a snapshot whose state differs in one verdict is refused by the light client, which then falls back to its own fold and still ends equal; a CHECKPOINT op with a wrong `state_hash` is `BAD` on a verifying device) · CONVERGE (after more ops from three devices all ordered identically: same op set, same order, same verdicts) · STALE (a late REVOKE with `last_good_seq` below the frontier switches the checkpoint off on every device and the result equals the plain fold; the same for a contender on an S slot) · LATE (an old op that arrives after the checkpoint and would have slotted into S is placed after the barrier on every in-force device; the plain control places it earlier — the barrier is observable) · COST (visit time vs log size, with checkpoints at a fixed cadence and without, same ops; the first grows ~linearly, the second is flat within noise; access-adapter call counts printed as a second, noise-free instrument) · SKEW (an engine from before this change folds a log containing CHECKPOINT without crashing and refuses it).

**Results 2026-10-24** (`node scripts/witness_comm_checkpoint.js`, log `build/comm/logs/witness_comm_checkpoint.log`, read in full): **`§W-CHECKPOINT PASS judged=43 fails=0 inconclusive=0`** (66 s). Encrypted space, real AD adapter, counting adapters per device.
- `§CK-EQUAL published state_hash=405458e5aafb900b oracle=405458e5aafb900b pos=80/80`; control: one op fewer in the frontier → `68fb98973d8c`.
- `§CK-BARRIER order hash: oracle=875d1bde1f98 A=B=V=F=875d1bde1f98 | control O=39ad935f1e5d`; verdicts of all 82 ops equal the oracle's and the no-checkpoint control's; the cl_verdict rows written incrementally equal the verdict map.
- `§CK-TRUST F: … access calls=0 (business ops in S=60, V's visit that verified S called the adapter 60 times)` — the light client had only the snapshot (10 bundles withheld, i.e. retention).
- `§CK-TAMPER` (a) insider re-sealed a state with one verdict changed → `§CKPT_REFUSED … falling back to my own fold`, paid 60 calls, same order; (b) outsider flipped a bit of the sealed state → refused by the GCM tag, same; bogus CHECKPOINT op (wrong state_hash, higher pos) → `BAD` on a verifier, the true one stays in force.
- `§CK-CONVERGE ops=125 order hash A/B/C/V/F/L = c3efb5e9290f ×6`; the final order equals the oracle's.
- `§CK-LATE S=80 … L's 14 old ops at positions (barrier) 124,105,104,…  (plain control) 124,55,53,33,17,…; inside S: barrier=0 plain=13` — the barrier is real and observable: **13 of 14 late ops would have slotted into the old order and are placed after it**.
- `§CK-STALE` REVOKE with last_good inside S → `§CKPT_STALE … reason=revoke-inside`, and V, A equal the plain control in order and verdicts (`f10756c0156d`); ROLE from seq 0 → `role-inside`; equivocation on an S slot → off. Controls: a REVOKE with cut-off 1000 and a ROLE `from_seq 100000` leave it in force.
- `§CK-AGG` frontier()/gaps() aggregates equal the old scans on a store with a hole and a head claiming seq 400.
- **`§CK-COST`** (log 175 → 1,225 ops, a checkpoint every 150 ops): quiet visit **8.2 → 9.0 ms with checkpoints vs 18.8 → 93.9 ms without** (slope 0.0016 vs 0.0703 ms/op); adapter calls per quiet visit **0 vs 175 → 1,225**; cold start of a fresh store over the saved comm.db **9 → 12 ms vs 77 → 709 ms**; a visit with 150 new ops makes ≤ 175 adapter calls (vs 3,525 at 1,225 ops: the old code folds the whole log about three times per visit). Wall time of a visit with news is O(news) either way (~250–400 ms for 150 ops — mostly verifying their signatures) and noisy; the call counts are the clean instrument.
- `§CK-SKEW old engine: crashed=false … verdict=REFUSED:scope-unknown business placed=102 (new engine 102)`.
- **The witness can fail** (mutations run): stability check disabled → 4 arms red (`fails=4`); CHECKPOINT op not placed first → order and LATE red (`fails=2`); trust path without the hash check → TAMPER(a) red (`fails=2`).
- `node scripts/sim_comm_office_day.js 9 3 15 0.3` after all three steps (no checkpoint in that sim): **`§W-COMM-OFFICE-DAY PASS judged=6 fails=0`**; its no-news growth fit is `ms = 5.1 + 0.1826 x ops` (275 ops → 56 ms, 1,525 ops → 279 ms) against `32.5 + 0.3544 x ops` (105 → 527 ms) before — roughly halved with NO checkpoint, because identity signatures are verified once instead of every fold and `autoKeys` no longer parses the whole log. Different load on the machine, so read it as 'about 2x', not a precise ratio.
- Existing witnesses after the change: cl1_uu 23/0, cl2_order 12/0, cl3_store 25/0, cl4_admit 23/0, cl5_conflict 12/0, cl8_opaque 44/0, space_scope 23/0, explore_comm_waiting_ops 9/0, W-POLICY-FOLD 32/0.
- *Decisions I had to make (spec was silent):* the order is a **barrier** (see the spec above — a bare position is unsound); the stability test is deliberately conservative (any late ROLE/REVOKE that reaches S, or a second op on an S slot, switches the checkpoint off for everyone instead of trying to patch it); snapshot state travels sealed and is opened into the device's own comm.db; `trustCheckpoints` is an `open()` option (a phone), not a policy value yet; old folded states are pruned when a newer checkpoint is adopted.
- *Left out, named:* **publishing is still O(|S|)** (the snapshot repeats every op of S: 54 → 282 ms for A as the log grows 175 → 1,225) — an incremental snapshot (only the ops since `prev` + the new state) is the next step; `author()` calls `versions()` which walks the whole order, so a *save* is still O(log) while a *visit* is O(new); nothing publishes by itself (`checkpointDue()` only reports); pipe-side retention (deleting bundles wholly inside the frontier) is simulated by withholding, not built; a bogus-CHECKPOINT flood costs one fold per distinct fake hash (rate-limit by author/role is a policy knob not built); the claims part of the state (`claims:{}`) is filled by KEYCLAIM (§13.12.2).

### §13.12.F Document numbers the legacy way — BOOKING at the post office (user, 2026-10-24)

> User: *"Perhaps the relay needs to keep at least the AD_Sequence numbering as this is iDempiere legacy functionality that users there mostly already know. Even though we worked out on our own to have prefix by POS or user ID to always differ while all docs go local running sequence numbering. This can be an option. And it is in use always at the same time a Doc needs to check post office when posting a result where it can fetch forward the next ID as booked at the relay. Thus each user is auto assigned a sequence (how's that as an idea?)"*

**Verdict: a good idea, and it costs the post office ONE more verb — not logic.** The verb is `putIfAbsent(name, bytes)` (create the object only if that name does not exist yet; refuse otherwise). Every store we use already has it as its atomic primitive: a Git ref update that is not a fast-forward is refused (a non-forced push is a compare-and-swap); S3/GCS conditional write (`If-None-Match: *`); the folder pipe `O_EXCL`; Apps Script `LockService`. The post office stays a dumb store.
**How a booking works (the AD_Sequence behaviour users already know):**
1. A document that needs its number (at Complete/Post, exactly where legacy calls `DB.getDocumentNo`) asks for the next free slot of its AD_Sequence: `seq/<ad_sequence_uu>/<n>` for n = CurrentNext, CurrentNext+IncrementNo, … It tries `putIfAbsent`; the first writer owns that number and the object records the claimant device and the document uu. A loser tries the next n. The result is exactly the legacy outcome: one number, one document, in order of booking.
2. The document's `DocumentNo` = Prefix + n + Suffix from the AD_Sequence row (same fields, same twin look: Prefix/Suffix/StartNo/IncrementNo/CurrentNext). Peers verify in the fold that the booking object exists and names this document; a document whose number was not booked (or booked for another document) is refused at admission — so the number is a hard fact, not a hope.
3. `CurrentNext` is derived (highest booked n + increment), not authored.
**Three modes per AD_Sequence — a chooser, as the user says "this can be an option":**
| Mode | How | Needs the post office at Complete? | Gap-free? | Use for |
|---|---|---|---|---|
| **S — station prefix** | `Prefix = station/user code`, local counter; collisions impossible by construction | no (offline-safe) | per station | POS, field work, drafts |
| **B — booking** | the `putIfAbsent` flow above, one number at a time | **yes** (like legacy needing its server) | yes (a number is only lost if its document is abandoned after booking; that is legacy behaviour too) | statutory sequences: invoices, payments |
| **K — block lease** | book a BLOCK (say 50 numbers) once, then allocate offline from it | once per block | no (unused numbers at block end) | high-volume documents where gaps are acceptable |
The default per document type is a **policy** value (§13.12 B, "number prefix scheme" row), overridable per AD_Sequence; the legacy window still edits the sequence rows. "Each user is auto assigned a sequence" = each Complete is assigned the next booked number automatically; in mode S/K the user (station) additionally owns a fixed prefix/block.
**Same verb strengthens C-1:** KEYCLAIM can use `putIfAbsent` when the post office is reachable (an immediate, hard winner) and falls back to fold order when offline; the fold stays the backstop, so both agree.
**Witnesses (when built):** `W-DOCNO-BOOKING` (two devices Complete at once → two different consecutive numbers, same on every device; a forged number is refused at admission; the loser retries within the same Complete) · `W-DOCNO-MODES` (S: no clash with no pipe; K: block exhausted → next block; B: pipe down → the Complete waits with a visible "numbering offline" state, never a duplicate) · `W-PIPE-IFABSENT` (the verb on memPipe, folderPipe, httpPipe and a gated pipe; a second create of the same name is refused).

### §13.12.G People strip — who is on what, from the signed heads (user, 2026-10-24; extends §11.17 and §15, not realtime)

> User: *"…some user avatar panel like a chat panel where users can see each other rankings of last updated, and what they working on so they can avoid. So they need not check online when they see no one else working on theirs. This again, a heads up idea, where users' last tasks are in the 'git' history of that panel."*

**Already specified:** the Team Panel (§11.17) shows last visit and advice per person; presence (`teams/overlay/presence.js`) exists but is one-browser (§5 S-8). **New here, small:** the **signed head** each device already posts at every visit gains a short `focus` field — the records (target uu + short label + since) this person currently has OPEN for editing, at most ~5 — and the panel adds a people strip:
- **Avatar row, ranked by last activity** (newest signed op or head first); each avatar shows initials/photo, role, "active 4 min ago", and a badge of what they are on ("Wall W12 · 2 min", "Order SO-0044").
- **Heads-up on the record itself:** opening a record someone else lists in `focus` shows "Aisha is editing this (3 min ago)" before you type — the Modeller shows it on the element, the ERP on the form. If nobody lists it, you proceed without any online check, which is the point: the answer is already in the heads you hold from your last visit.
- **Per-person history = the log, not new storage:** the avatar opens "last tasks" — that person's latest ops grouped by record (what, when, which window), read from the same fold every device has (the "git history of the panel"). No extra data is written for it.
- **Not real time:** `focus` is as fresh as the last visit (≤ V). It is advisory, never a lock; the conflict path of §11.15 still decides. A stale `focus` expires by its `since` + a policy TTL (default 30 min), so a closed laptop does not look busy forever.
- **Privacy/scope:** `focus` is sealed like any head content to the space (audience keys, C-4, narrow it to the audience of the record). A person can switch it off ("don't show what I'm on"); their ranking then shows only "active".
**Witness (when built):** `W-PEOPLE-STRIP` — three devices: A opens element E (focus set), B visits and shows "A is editing E" on E; A closes it, visits; B's next visit clears it; ranking order equals the newest-op order computed independently from the log; a stale focus past the TTL is not shown; switch-off hides the label; each arm has a control.


### §13.12.H Role scope as the attention filter — less reactive checking (user, 2026-10-24: *"the role scope of tasks can come into play here to minimize reactive checking"*)

**Idea.** A person's role already says which windows/tables they may read or write (the AD role access the layer evaluates locally, `AdAccess.buildRole`) and, through the workflow and document flow (Order → Shipment → Invoice → Payment), **whose output becomes their input**. Use that **role scope** to decide what a device needs to look at, instead of looking at everything on every visit.
**Role scope S(role) — derived, not authored:** `reads` (tables/windows the role can open), `writes` (tables it can change), `upstream` (roles whose documents arrive in its queue: from AD_WF_Node responsibility and the document-flow edges, with a policy override list), `downstream` (roles that receive its output). Computed on each device from the same AD dictionary, so every peer derives the same S. Nothing is stored.
**Five uses, in order of payoff:**
1. **People strip / heads-up filtered by scope (cheap, UI only).** Show first the people whose scope overlaps mine (same tables or adjacent in the flow); the rest collapse to "+N others". A heads-up on a record only appears for people who could write it. (Extends §13.12.G; toggle "Everyone / My role scope", default = role scope.)
2. **Inbox = items entering my role's queue.** "Mail for me" (§11.17) is computed as: ops from `upstream` roles on documents whose next step is mine. A Warehouse clerk is alerted for *new Sales orders*, not for every invoice edit. This is the workflow-assignment idea made local.
3. **Tiered visit cadence.** *Hot*: authors in my `upstream`/`downstream` → fetched every visit. *Warm*: same department, other roles → every k-th visit (policy value, default 4). *Cold*: everyone else → only at checkpoints (§13.12 C-5). This cuts the **N² reads** of §13.10 to roughly N × (hot + warm/k), which is what makes a web relay or email transport comfortable beyond ~100 staff. Convergence is unchanged: a cold or warm op that an in-scope op **reads** is pulled on demand by the existing "parked until its reads arrive" rule (§11.7, W-STORE-NODE gaps).
4. **Selective fetch by summary.** The signed head already goes out every visit; adding a compact `touches` summary (the tables, and a small Bloom filter of record uuids, an author touched since their last head — §11.17 "Bloom per author", measured 1 KB, 0 misses) lets a reader skip a bundle that cannot affect its scope. Needs a field in the head (engine change, after the current frame work).
5. **Notification routing.** The News/Notice items (§25-style) and the visit advice (§11.17) go to the role that must act, instead of broadcasting.
**What it does NOT do:** it never lets a role *skip validation* — admission still checks every op that is folded; it only decides what is fetched *early*. A full-scope role (admin, auditor) gets hot for everyone. A role with an empty `upstream` is simply Cold-heavy and relies on checkpoints.
**Witnesses (when built):** `W-SCOPE-DERIVE` (S(role) computed from the AD for sales/warehouse/accounts is the same on every device and matches the hand-derived flow) · `W-SCOPE-STRIP` (a **sales** device ranks warehouse first and collapses accounts — on the warehouse device accounts is *downstream*, so it stays visible and is the control; toggle shows all) *[example corrected 2026-10-24: the first wording put accounts outside the warehouse's scope, which contradicts the adjacency rule]* · `W-SCOPE-TIERS` (in the §13.10 simulation, requests per visit fall from N+2 to ≈ hot + warm/k + 2 and every device still converges to the same op set and order) · `W-SCOPE-READS` (a cold op that a hot op reads is fetched on demand: no op left parked) · `W-SCOPE-INBOX` (the inbox lists exactly the upstream-originated items awaiting this role).
**Build order:** (1) and (2) are UI/derivation over data every device already has — fold them into the people-strip build; (3) needs the policy value and a scope function in the adapter, no engine change; (4) is the only engine change (head field), after the frame steps land.

### §13.12.G.1 Build spec — people strip + role scope uses (1)(2) (2026-10-24; spec written BEFORE code)

> Coordinator brief: build §13.12.G exactly, witness-first; fold in §13.12.H uses (1) strip filtered by scope and (2) inbox. Uses (3)(4)(5) of H (tiered cadence, selective fetch, routing) are NOT built here — (4) needs an engine change, (3) a cadence policy.

**Constraint:** nothing under `build/comm/` or bim-ootb `common/comm/comm_*.js` is edited. The post office keeps its four verbs; the focus board is just another named object.

#### G.1.1 Transport — the focus board `s/<space>/f/<kid>`
One small object per device, overwritten at every Visit (`pipe.put`; same one-writer-per-name rule as `h/<kid>`).
```
{ v:1, kind:'focus', space, kid, author:<kid>, person:<person_uu>, ts:<ms, time posted>, since:<ms|null, when this device last changed its focus set>,
  focus:[ {table, uu, label, since} ... ]   // at most 5; [] when nothing is open or off:true
  off:boolean,                              // "don't show what I'm on": the details are NOT written at all (focus:[]), only "I am here"
  sig:<hex> }                               // CommEnvelope.sign(obj, device) — the same ECDSA signature as heads and ops
```
- **Reader** (`list s/<space>/f/` + `get`): accepts an object only if `kid` equals the name, `author===kid`, `space` matches, the kid is an enrolled device of the roster and the signature verifies against that device's key. Anything else is dropped and logged (`§PEOPLE_FOCUS_REJECT`).
- **Sealed or not:** the engine's seal helper (`comm_store._seal`) is private (not on the exported API) and may not be edited, so the focus object is **signed but NOT sealed**. NAMED LIMIT L1: whoever operates the pipe can read which records a person has open (table, uu, label). The keyring is exposed (`store.keyring()`), so a follow-up can seal it with its own AAD from `team_focus.js` without touching the engine; not done here (the brief says state the limit).
- **ghPipe dependency — ⛔ DEP-GHPIPE-F:** `ghPipe._kidOfName` (comm_pipe.js) accepts only name classes `o`, `h`, `r`, so a `put` of `s/<space>/f/<kid>` throws "not under my prefix" on the GitHub pipe. The focus board therefore works on the **folder, mem and http pipes only** until a one-line change adds `'f'` to that class test (not made here: comm_pipe.js is frozen for the engine owner). On ghPipe the Visit still succeeds: the publish is caught, logged once as `§PEOPLE_FOCUS_PUBLISH unsupported pipe=gh:… (ghPipe accepts classes o/h/r only — DEP-GHPIPE-F)`, and the people strip degrades to "active N min ago" (ranking from ops + heads) with no focus badges.

#### G.1.2 Pure module `common/comm/team_people.js` (UMD, no DOM, no storage, no clock of its own)
Every function takes `now` (ms) or options explicitly, so a witness injects the clock; there are no sleeps.
- `directoryFrom(roster, roleName)` → `[{person, name, role:<ad_role_id|null>, roleName, kids:[kid…]}]` sorted by person (from `CommRoster.fold` output: `devices`, `persons`, `roleAt`).
- `rank(ops, heads, focusObjs, now, opts)` → people array, newest activity first.
  - `ops`: envelopes `{author, ts, …}` (every stored op, identity ops included — a signed op is activity); `heads`: `[{author, ts}]` verified heads; `focusObjs`: verified focus objects.
  - `opts`: `{directory, ttlMs (default 1 800 000), mode:'all'|'scope', scope (my scope), scopeOf(roleId) → scope|null, selfPerson}`.
  - Each result: `{person, name, role, roleName, kids, lastActive, lastSource:'op'|'head', focus:[{table,uu,label,since,ageMs}], off, inScope, writes}`; `lastActive` = max ts over the person's kids' ops and heads; ties break on person uu. `focus` = the union over the person's devices of entries with `now - since <= ttlMs` (TTL basis = the entry's own `since`, as §13.12.G says); `off` = any device of the person says `off`, in which case `focus` is `[]`.
  - Scope mode: the `inScope` people come first (each group by recency); `collapse(list, mode)` → `{shown, others}`; "Everyone" mode shows all in recency order.
- `historyOf(personUu, ops, n, opts)` → that person's last `n` business ops (identity ops excluded: table `comm_*`), grouped by record `(table, uu)`: `{table, uu, label, count, last}`; label from the CREATE's `documentno` / `name` / `value` field if the CREATE is in `ops`; newest group first. Nothing is stored.
- `headsUpFor(uu, selfPerson, people, opts)` → `[{person, name, kid?, label, since, ageMs}]`: the OTHER people whose live focus lists `uu` **and who could write that table** (`person.writes` contains it; when no scope is available the filter is skipped).
- Role scope (§13.12.H uses 1+2): `roleScope(roleId, dict, over)` and `inboxFor(scope, ops, opts)` — G.1.4.
- Helpers: `initials(name)`, `ageText(ms)` ("just now" | "N min ago" | "N h ago").

#### G.1.3 Host seams (generic; no per-window / per-table code)
- **ERP:** `idempiere.html` `refreshForm()` (called at the tail of every `renderBody()`, i.e. window / tab / grid-form switch) dispatches `window` event `idmp:record` with `detail {view:'form'|'grid'|'new', table, uu, label, pk}`; `uu` = the row's `<table>_uu`, `label` = tab name + DocumentNo/Name/Value. This is the only edit to the page: one function, no table named. `team_sync.js` listens: a `form` view with a `uu` = focus `[that record]` (keeps `since` while it stays the same record); `grid`/`new` = `[]`. `overlay:committed` with CRUD_* / DOC_ACTION on the focused table drops the focus ("clear on save") and suppresses its re-add for 2 s (the form re-mounts itself after a save); re-opening later sets it again.
- **Publish at every Visit** (after `sync` and the projection rebuild): `TeamFocus.publish`; **collect** (`list f/`, `h/`) → `TeamPeople.rank` → `#team-headsup` banner on the open form ("<name> is editing this (just now | N min ago)") and the Team panel People section.
- **Switch-off:** panel checkbox "Don't show what I'm on" → `cfg.hideFocus` in the same IndexedDB `comm_phone` `cfg` (so the Modeller reads the same switch); published as `off:true, focus:[]`.
- **Modeller:** the existing `dagevu:select` event (fired by `setSelectionIds` on every selection change, modeller.html) + `Bonsai._selSet` (feature row ids → `op_uuid` via the oplog) = focus of every selected element that is a shared team record. The Modeller has no AD dictionary, no Team panel and no per-element overlay hook: the heads-up is a label `#team-headsup` beside the chip ("<name> is editing this element (…)"), the people list is `#team-people` (chip tooltip + a small list). NAMED LIMIT L2: no badge on the 3D mesh / outliner row; no role scope in the Modeller (`scope:null` → always Everyone).
- Panel mode toggle "Everyone / My role scope" → `cfg.peopleMode` (default `'scope'`).

#### G.1.4 Role scope S(role) — derived from the dictionary the adapter already has
`roleScope(roleId, dict, over)` → `{role, reads:[table…], writes:[table…], upstreamTables:[…], downstreamTables:[…], upstream:[roleId…], downstream:[roleId…]}`, every list sorted (identical bytes on every device).
- `dict` (built from the page's `__idmpDb` by `TeamPeople.dictFromDb(db, AdAccess)`; in node over the same `erp/ad_seed.db`): `roleIds()`, `reads(roleId)`, `writes(roleId)`, optional `wf()` → `[{table, roleId}]`.
  - **reads(role)** = tables of the tabs of every window the role has in `ad_window_access` (`AdAccess.buildRole(...).win`).
  - **writes(role)** = tables of the NON-read-only tabs of its read-write windows AND where `RoleContext.canUpdate(client, org, table, level)` allows (tried for the role's own client with each read-write org it holds and org 0). So a window does not make a table writable unless the same rule the admission check uses allows it.
  - `wf()` — AD_WF_Node responsibility. **NAMED LIMIT L3:** the browser seed `erp/ad_seed.db` has NO `ad_wf_node` / `ad_wf_responsible` table (only `ad_wf_nodenext`, 9 rows), so the ERP dict returns none; the function accepts `wf()` rows (adding their tables to the role's `writes` for flow purposes) and the witness covers that path with a fixed input.
- **Flow edges:** default `[c_order→m_inout, m_inout→c_invoice, c_invoice→c_payment]`; `over.edges` replaces them (the "optional override list").
- **Definitions (W = writes):** `upstreamTables` = `{a : (a→b) an edge, b ∈ W(me), a ∉ W(me)}`; `downstreamTables` = `{b : (a→b), a ∈ W(me), b ∉ W(me)}`; `upstream` = roles X ≠ me with `W(X) ∩ upstreamTables ≠ ∅`; `downstream` likewise. A person is **in scope** when their role equals mine, or is in my upstream/downstream, or `W(them) ∩ W(me) ≠ ∅` (a full-scope role shares tables with everybody, so it is hot for everyone — §13.12.H "What it does NOT do").
- `inboxFor(scope, ops, opts)` → items entering my role's queue: placed CREATEs on a table in `scope.upstreamTables`, authored by a person whose role is in `scope.upstream`, not by me, **and not yet handled** (no placed CREATE on a table in `scope.writes` references that record's uu in its fields). Item: `{table, uu, label, author, ts}`, newest first. The role of an author = the person's CURRENT role (NAMED LIMIT L4: not the role at the op's seq).
- **Spec vs. rule note (reported):** §13.12.H's example "a warehouse device … collapses accounts" does not follow from the stated adjacency rule — accounts is DOWNSTREAM of warehouse (m_inout→c_invoice), so on a warehouse device accounts is in scope. The collapse is witnessed on the SALES device (accounts is neither adjacent nor sharing a table). The rule was implemented as written, not tuned to the example.

#### G.1.5 Witnesses (each names the issue it proves or disproves; INCONCLUSIVE when nothing was judged; each arm has a CONTROL that can fail)
| id | file | proves |
|---|---|---|
| `W-PEOPLE-PURE` | `common/tests/witness_people_pure.js` (node) | rank / TTL / off / history / headsUp / roleScope(fixed dict, wf path, override) / inboxFor (handled item leaves) on FIXED inputs, with a mutant control per function |
| `W-SCOPE-DERIVE` | `common/tests/witness_scope_derive.js` (node, real `erp/ad_seed.db` + 3 fixture roles) | S(role) for sales / warehouse / accounts is byte-identical on two independent loads, equals an independent raw-SQL derivation and the hand-derived flow; control: a role with no read-write window has empty writes; override list moves the edge |
| `W-PEOPLE-STRIP` | `erp/tests/witness_people_strip.js` (3 real browsers, real ERP, folder pipe) | G.1.2/G.1.3: (1) A opens E → B's form shows "A is editing"; (2) A closes → A visits → B's next visit clears; (3) ranking order = newest-op/head order recomputed from the raw log + raw head files; (4) TTL via injected clock; (5) switch-off; (6) history = raw cl_op grouped; (7) NO-OP guard (nothing before A publishes) + writers-only control |
| `W-SCOPE-STRIP` | same file | the sales device lists warehouse in scope and collapses accounts to "+1 others"; "Everyone" shows all; heads-up only from people who could write the table (accounts opens an order → no heads-up) |
| `W-SCOPE-INBOX` | same file + the pure file | the warehouse inbox lists exactly the sales-authored order; an accounts-authored order is not listed (non-upstream control); a handled item leaves (pure) |
| `W-PEOPLE-MODELLER` | `modeller/tests/witness_people_modeller.js` (2 real browsers, real Modeller) | A selects shared element E → B's label "A is editing this element"; A deselects → A visits → B visits clears; ranking vs raw log; TTL; switch-off; history |
Regression, quoted before/after: `witness_team_so`, `witness_team_docaction`, `witness_team_desktop`, `witness_team_pill`, `witness_team_modeller`.

#### §13.12.G.2 Results 2026-10-24 — people strip + role scope uses (1)(2) ✅ DONE (witness) — bim-ootb PR #2362 (branch `feat/people-strip`, ERP sw v904, Modeller sw v156)
Logs read in full (`scratchpad/after/*.log`, `ps_final.log`, `pm_final.log`, mutant runs `ps_mut_*.log`). Files (bim-ootb): `common/comm/team_people.js` (pure), `team_focus.js` (focus board I/O), `team_people_ui.js` (shared DOM), `erp/team_sync.js` + `erp/team_panel.js` + `erp/idempiere.html` (`idmp:record` seam in `refreshForm()`), `modeller/team_sync.js` + `modeller.html`, `team_defaults.js` (`focusTtlMs`), both `sw.js`. `build/comm/*` and `common/comm/comm_*.js` untouched. Tests: `common/tests/witness_{people_pure,scope_derive,focus_board}.js`, `people_fixture_roles.js`, `erp/tests/witness_people_strip.js`, `modeller/tests/witness_people_modeller.js`.

**Object shapes as settled**
- Focus object `s/<space>/f/<kid>`: `{v:1, kind:'focus', space, kid, author:<kid>, person:<person_uu>, ts, since:<ms|null>, focus:[{table,uu,label,since}] (<=5), off, sig}`; signed by the device key (`CommEnvelope.sign`), overwritten at every Visit; `off:true` writes `focus:[]` (the bytes carry no label — asserted on the pipe file).
- `TeamPeople.rank(ops, heads, focusObjs, now, opts)` → `[{person,name,role,roleName,kids,self,lastActive,lastSource:'op'|'head',ageMs,focus:[{table,uu,label,since,ageMs}],off,writes,inScope}]`; options `directory, ttlMs (TeamDefaults.focusTtlMs = 1 800 000), mode:'all'|'scope', scope, scopeOf, selfPerson`; `collapse(list, mode)` → `{shown, others}`; `historyOf(person, ops, n, {directory, labelOf?})`; `headsUpFor(uu, selfPerson, people, {ignoreWriters?})`; `roleScope(roleId, dict, {edges?})` → `{role,reads,writes,upstreamTables,downstreamTables,upstream,downstream}`; `inboxFor(scope, ops, ctx)`; `dictFromDb(db, AdAccess)`.
- Host settings in the same IndexedDB `comm_phone` `cfg`: `hideFocus` (boolean), `peopleMode` (`'scope'` default | `'all'`).

**Verdicts (verbatim)**
- `§W-PEOPLE-PURE PASS judged=39 fails=0 inconclusive=0` (+ 5 mutants of `team_people.js` each flip exactly the arm it should: TTL boundary, writers filter, handled-set, heads, off)
- `§W-SCOPE-DERIVE PASS judged=13 fails=0 inconclusive=0` (17 roles incl. 3 fixture clerks; byte-identical on two loads; writes = independent SQL = hand-listed tables; role 103 loses 252 AccessLevel-2/4/6 tables that role 102 keeps)
- `§W-FOCUS-BOARD PASS judged=12 fails=0` (tampered object, un-enrolled device, wrong name rejected; cap 5; the REAL unmodified `ghPipe` refuses the `f/` name before any network call)
- `§W-PEOPLE-STRIP PASS judged=22 fails=0 inconclusive=0` · `§W-SCOPE-STRIP PASS judged=5 fails=0 inconclusive=0` · `§W-SCOPE-INBOX PASS judged=2 fails=0 inconclusive=0` · `§W-PEOPLE-STRIP-ALL PASS judged=29 fails=0 inconclusive=0 pageerrors=0` (three real browsers, real ERP, folder pipe)
- `§W-PEOPLE-MODELLER PASS judged=22 fails=0 inconclusive=0 pageerrors=0` (two real browsers, real Modeller)
- Browser-level mutants (`PS_MUTATE=`) each fail exactly one arm: `writers` → "accounts … gives NO heads-up" (`§W-SCOPE-STRIP FAIL … fails=1`), `offleak` → "switch-off … only {off:true}" (bytes 398 → 505), `ttl` → "injected clock 31 min … NOT shown" (`at31min:true`).
- Regression, before (origin/main c3d6a399) → after: `§W-TEAM-SO PASS judged=19 fails=0` → same · `§W-TEAM-DOCACTION PASS judged=24 fails=0` → same · `§W-TEAM-DESKTOP PASS judged=9 fails=0` → same · `§W-TEAM-PILL PASS judged=14 fails=0` → same · `§W-TEAM-MODELLER PASS judged=33 fails=0` → same. ESLint clean on the new/changed modules; `audit_sw_precache` 0 missing (that audit reads the Viewer sw only; the new ERP/Modeller precache entries were checked to exist on disk).

**Found by the witnesses and fixed**
1. A created-and-saved record became "open" again the moment the form showed it, so A published focus on a record it had just saved. Rule now: a write on a table suppresses focus on that table for 2 s ("clear on save"), whether it re-mounts the same record or shows the new one.
2. The Modeller's op `ts` is the kernel row timestamp, a deterministic synthetic value (2023-11 + n s) — "active 25777 h ago". The adapter now authors envelopes with `ts: Date.now()` (§15.3 already said `ts` is display-only, never ordering); the witness asserts a wall-clock ts.
3. My own witness read the raw log before the edit it then compared against (history count) — fixed; the arm now re-reads.

**Named limits / dependencies (not hidden)**
- **⛔ DEP-GHPIPE-F — follow-up for the engine owner:** one line in `ghPipe._kidOfName` (`build/comm/comm_pipe.js` and bim-ootb `common/comm/comm_pipe.js`): accept class `'f'` next to `'o'|'h'|'r'`. Until then the focus board works on the folder / mem / http pipes only; on GitHub the Visit still succeeds, the publish is caught and logged once (`§PEOPLE_FOCUS_PUBLISH unsupported …`), and the strip shows "active N min ago" and the panel notes "This pipe does not carry the focus board yet". Witnessed against the real unmodified `ghPipe` (`§FB-GHPIPE`); not witnessed against real GitHub.
- **L1 signed, not sealed:** the engine's seal helper is private (not on `CommStore`'s API); whoever operates the pipe can read which record uu/label each person has open. `store.keyring()` is exposed, so a follow-up can seal in `team_focus.js` with its own AAD without touching the engine.
- **L2 Modeller:** no badge on the 3D mesh or outliner row (no overlay hook found); heads-up is the label `#team-headsup` beside the chip, people in `#team-people` (+ chip tooltip). No role scope there (no AD dictionary): the scope toggle and Inbox are absent, a plain note says so.
- **L3** the browser seed has no `ad_wf_node` / `ad_wf_responsible` (only `ad_wf_nodenext`, 9 rows): the ERP dict supplies no workflow responsibility; `roleScope` accepts it (`dict.wf()`), proven on fixed input only. Flow edges are the default c_order→m_inout→c_invoice→c_payment (override list supported).
- **L4** an author's role in the inbox / scope = the person's CURRENT role, not the role at the op's seq.
- **L5** "focus" = the record's form is open (the twin's forms are always editable), not "has typed"; after a save the focus drops until the record is re-opened (2 s heuristic).
- Role-scope witnesses use three FIXTURE roles (the seed has only Admin 102 / User 103) cloned into the in-memory dictionary; the founder's role is changed by a ROLE op in the witness setup (no UI changes a role).
- Spec-vs-rule note kept: §13.12.H says a warehouse device collapses accounts; under the stated adjacency rule accounts is downstream of warehouse, so the collapse is witnessed on the sales device and the warehouse device is the control (nobody collapsed).
- Not witnessed: real GitHub / Gmail, phone-sized layout (sizes are asserted >= 44 px, not rendered on a phone), more than three devices, the Modeller gizmo path.
- Not built (as instructed): H uses (3) tiered cadence, (4) selective fetch (engine head field), (5) routing.

### §13.12.I A shared loaded DB with git-like events on top — the BASE (user, 2026-10-24: *"in the event that A works on a loaded DB which the team keeps online, likewise B can also load but the events on top are all git like managed"*)

**This is the intended shape, and it maps to git exactly:** the loaded DB is the **initial commit** (a *base*); every signed op is a **commit on top**; a **checkpoint** (§13.12 C-5) is a **squash / new base**; a device that has the base and the log has the whole repository. What we have, and what is missing:
| Piece | State today | Gap |
|---|---|---|
| Ops fold on top of a loaded DB | ERP: the bundled seed DB + sidecar op-log; Modeller: `bonsai_oplog` over the loaded model DB; comm layer folds the shared ops onto each device's own copy | works |
| **Base identity** | none — each device just "has a DB"; B could have a different or older copy and nothing says so | **GENESIS gains `base: {name, sha256, bytes, version}`; a device must verify its loaded DB hash equals it before folding, else it refuses with "your copy is not the team's base" (never silently diverges)** |
| **Where the team keeps the base online** | ad hoc (OCI for building DBs, bundled for the ERP seed) | the **POLICY pipe directory** (§13.12 B) lists base locations (OCI/CDN/bucket URLs, in preference order); the base is **content-addressed** (sha256), immutable, fetched once, cached. Binaries never go through git/LFS (CLAUDE.md DB rule); the post office carries only the small ops. |
| **Edits to records that live in the base** | not shared: admission judges an op against the scope of the record's CREATE, and a base record has none (W1 limit 4: `scope-unknown`; measured: the `m_storagereservation` refusal, §13.7) | **admission reads the scope from the BASE ROW** (client/org of the row with that `<table>_uu` in the verified base) — the base hash makes that row trustworthy. This single rule unlocks editing every seeded master record, and closes gap 1's reservation refusal |
| Two people load different versions | undetected | base hash mismatch → refuse; **a base update is a *release***: a new base + the team's checkpoint at position P, signed by an admin (POLICY epoch bump); devices fast-forward: load/verify the new base, fold ops after P |
| Base too big to ship to a phone | n/a | policy may name a **thin base** (the slice a role needs: AD slim seed `access_seed.sql`-style) with its own hash; ops that touch outside it are fetched on demand — later |

**Rules (decided):**
1. The base is **read-only**; no one edits it in place. Every change is an op. A fix to the base itself = a new release.
2. Ops carry the **base hash** in their envelope's `manifest` (§11.8 version skew) so an op from a different base is recognised and parked/refused rather than misapplied.
3. Loading is **verify-then-fold**: hash, then GENESIS check, then fold. A mismatch is a visible, plain-words state ("Your copy of <name> is v3; the team is on v4 — update"), not a crash.
4. The base can be **public or private**: access is the hosting's (signed URL, OCI pre-authorised request); the data inside is no more secret than today, and per-audience sealing of ops (C-4) still applies to the ops on top.
5. Git-like affordances come free: *branch* (a what-if space that starts from base+checkpoint P and never publishes), *blame* (which op set this field — `fieldLineage` already exists), *revert* (an op that restores), *tag* (a signed checkpoint named "month-end").
**Witnesses (when built):** `W-BASE-HASH` (B with a different base copy is refused with the plain message; the right copy folds; control) · `W-BASE-EDIT` (A edits a seeded master record; B sees it; a role without write on that org is REFUSED by the base row's scope; the `m_storagereservation` Complete now applies) · `W-BASE-RELEASE` (admin releases v2 at checkpoint P; a device on v1 fast-forwards and converges to the same state as one that started on v2) · `W-BASE-SKEW` (an op stamped with another base hash is not applied).
**Build order:** after POLICY/CHECKPOINT/KEYCLAIM (current agent): GENESIS `base` field + verify-then-fold → base-row admission scope (unblocks W1 limit 4) → release/fast-forward. The base-row admission rule is the highest-value single change for the ERP today.



### §13.12.J Taking the useful part of an outside review (2026-10-24; user: "Take only what's useful")
An outside LLM review of the framework (event sourcing is legitimate accounting practice; the open question is business invariants under concurrent offline edits) was weighed. **Kept:** (1) the open question is the right one, and it deserves a *test*, not an argument; (2) event-schema evolution is the classic event-sourcing pain and we have no answer yet. **Dropped:** its throughput numbers (single-node append speed; our limit is the per-visit fold and signature checks, §13.10), its claim that we show no invariant resolution (partly stale: §13.11/§13.12), and unverifiable third-party claims. Two items follow.

**J.1 ESCROW + invariants under chaos (`W-INVARIANTS-CHAOS`).**
- Engine, generic, no table named: three op types in the roster/claims family. `ESCROW_OPEN {resource, slices:{desk: qty}}` (admin; the sum is the conserved total); `ESCROW_USE {resource, desk, qty, doc}`; `ESCROW_TRANSFER {resource, from, to, qty}` (authored by the **sender** desk). A desk's available = its slice − uses + transfers in − transfers out, folded from the ops **that op causally read** (`deps`), so every peer computes the same number at the same point. A USE or TRANSFER above available is **REFUSED `escrow-exceeded`** at admission; a USE by a device that does not own the desk is REFUSED `escrow-not-owner`. A device's desk is its roster person/role mapping (policy `desks`).
- Invariants the fold guarantees (the chaos witness checks them on every device after settle): per-desk available ≥ 0; sum(slices) conserved (open total = Σ available + Σ used); every USE names a distinct doc or is refused as a duplicate; transfers conserve quantity.
- **Chaos witness:** the real layer, N devices (default 12, sweep 6/12/24), random offline periods, random order and drop-and-redeliver of bundles, random `USE`/`TRANSFER`/document-number `BOOKING`/`KEYCLAIM` attempts including deliberate over-draws and double claims; then a settle. Judged on each device: the invariants above; **identical op set and order everywhere**; document numbers unique and gap-accounted; each `KEYCLAIM` has one winner; **derived ledger** (a pure `ledgerOf(folded documents, manifest)` computing a trial balance — debits = credits — and a hash of it) **equal on every device** with a control that a deliberately different manifest gives a different hash. Seeded runs are reproducible; the seed is printed. INCONCLUSIVE when no over-draw was attempted or no device went offline. Mutation checks: remove the escrow check → witness red; make conflicts commutative-unsafe → red.
- **Not in J.1 (named):** wiring the ERP's `m_storagereservation` Complete to ESCROW_USE (host step, after the engine witness is green); the real `Fact_Acct` posting rules (the witness uses a small stated posting function); audience keys.

**J.2 Event versioning (design only, not built) — amended 2026-10-24 after a second outside opinion; only the parts that hold up are kept.**
- **Two separate versions.** `v` = the op's *data shape*, per op type, stamped in the body. `manifest` = the *business rules + base* (§13.12.I.1). They change independently (a nullable field is a shape change, not a rules change), so they must not constrain each other. *(Adopted: the first draft pinned the upcasters to the rules manifest, too coarse.)*
- **Weak-schema reader.** The fold reads tolerantly: missing field → default, unknown field → passed through and ignored (POLICY already keeps unknown keys). Tolerance lives in the READER; stored envelopes are never rewritten (the signature covers the bytes as written). This keeps most small changes from needing a version bump. Renames and meaning changes are NOT allowed under weak schema; those bump `v`.
- **Upcaster chain, old → new.** One step per version (`N → N+1`, no gaps — validated when the set is loaded); applied by the fold to *old* ops so they replay forever as the current shape. Old data on a new client is therefore never a problem.
- **A newer op on an older client cannot be upcast** (it needs code the client does not have; down-conversion is not generally possible). That case is PARKED `needs-upgrade`. *(The outside text blurred these two directions.)*
- **Upcasters are data, not code.** Distributing executable functions to every device would be a supply-chain hole in a system whose point is signed trust. An upcaster set is therefore **declarative** (rename / default / split / merge field mappings in a small fixed vocabulary), **admin-signed** like POLICY, and fetched through the policy pipe directory. An anything-more-complex change needs an app upgrade. This lets a device clear parked ops by fetching a signed mapping, without a full app upgrade, when the change fits the vocabulary.
- **Parking policy (the part the first draft left open):**
  1. A parked op stays in the log and in `cl_op`; it is **not** in the fold and **not** in the order. An op that *reads* a parked op parks too (existing deps rule).
  2. The device keeps working; its UI shows "N items need an update" and the reason.
  3. It is retried at every fold after the upcaster set or the app version changes — never on a timer.
  4. Parking is device-dependent, convergence needs a global rule: an admin can **retire** a version (`min_v` in POLICY); ops below it are REFUSED `retired-version` on every device at the same log position. Until then a still-parked op is simply not yet part of anyone's agreed state.
  5. **Derived values are marked provisional while anything is parked.** `ledgerOf` hashes only folded ops; the result carries `parked_count` and `provisional:true` when it is not 0. Two devices with different parked sets legitimately differ, so the chaos witness compares hashes only among devices with the same parked set (and asserts all devices agree again after upgrade). *(Adopted from the second opinion.)*
- **Copy-and-transform later = a base release (§13.12.I):** when the chain gets long, publish a new base + checkpoint with the ops already upcast and archive the old stream. Immutability is kept (old stream stays); the hot path is short. Not needed until the number of versions is a burden.
- **Witness `W-OP-VERSIONS` (when built):** v1 and v2 ops in one log fold to the same state as the all-v2 rewrite (upcaster chain with a gap is rejected at load); a client that knows only v1 parks v2 ops, shows the count, and converges after it is upgraded; the ledger hash is `provisional` while parked and equals the full-upgrade hash afterward; a bogus `v` is parked, never applied; an upcaster set not signed by an admin is refused; `min_v` retirement refuses the same op on every device.

---

## §14 Showcase film — storyboard v1 (user, 2026-10-23: *"plan the film storyboard for the showcase"*)

**Title (user, 2026-10-23):** *"The Server is Dead Scenario"* — subline *"No DB server. No app server. Just a data relay."* (was "No server. Still a team."). Illustrated storyboard deck: https://claude.ai/artifact/Vt8DdVP7gAW7BsyfdKWgnQ (private until shared). About 4 minutes, screen-capture film of the laptop and the phone, with
narration later via `prompts/FILM_NARRATION.md` ▶ PLAYBOOK.

**Rules for the film:**
- Every number on screen comes from a `§` log line of that take.
- **Never show a token, secret, `exec` URL or invite link unblurred.**
- Say "proof of concept", not "first", unless a prior-art check (§14.2) supports more.

| # | Shot (screen) | Action | Narration idea | Proof overlay | Needs |
|---|---|---|---|---|---|
| 0 | Phone in airplane mode | makes an order; it shows "saved, not sent" | "No signal. No server. Still working." | delivery `SAVED` | ✅ now |
| 1 | Simple diagram: DB server + app server, then the server crossed out | — | "Usually, when the server stops, everyone stops." | — | ✅ |
| 2 | Laptop + phone side by side; the GitHub repo; the Gmail label | — | "Two devices, a private repo, a mailbox. That's the whole setup." | — | ✅ |
| 3 | Pairing | Start space → invite → Join → **the same code on both screens** → Approve | "Trust is a code you can read aloud." | `§COMM_TRUST mode=roster` | ✅ |
| 4 | First transaction | phone New order → Visit → laptop Visit → the order appears | "The server became a post box: drop off, pick up." | `§COMM_SYNC sent=… fetched=…`; GitHub commit appears; Gmail `BIMTEAM` note | ✅ |
| 5 | Offline and back | phone offline → edit → reconnect → Visit → laptop shows it | "Nothing is lost while you're away." | `SAVED → SENT → SEEN` | ✅ |
| 6 | The clash | both edit the same total → ⚠ on **both** screens, total held at 150 → one resolves → both agree | "No silent overwrite — the same message iDempiere users already know." | conflict `before=150 values=200/300` | ✅ |
| 7 | Permissions | a role without org-12 access writes → refused on every device | "The ERP's own access rules, checked by every device." | `REFUSED access:missing=W` | ✅ (role pick in UI = small add) |
| 8 | Encryption | open the bundle file on GitHub: unreadable; in the app: readable | "The post box can't read your mail." | W-PIPE-OPAQUE | ⏳ CL8 (agent running) |
| 9 | The real ERP | the same flow in the iDempiere Sales Order window, header + line | "Not a demo screen — the ERP itself." | W-TEAM-SO | ⏳ W1 (agent running) |
| 10 | Close | witness PASS lines scroll, then the title | "Witnessed, not promised." | witness counts | ✅ |

**Capture:**
- Laptop: screen recording of the desktop browser.
- Phone: the phone's own screen recorder (Android: quick settings → Screen record).
- One take per beat; cut in the edit.
- Keep the `§` log panel of the page visible, or capture it with `console` logging, to source the overlay numbers.


**Results 2026-10-24** (`node scripts/sim_comm_office_day.js 9 3 15 0.3`, log `build/comm/logs/sim_comm_office_day.log`, read in full; fixed seed): `§W-COMM-OFFICE-DAY PASS judged=6 fails=0`.
- *Measured (real layer, 9 devices, CL8 on, 32 visits each):* all devices ended with one op set and one order; no authored op lost; every hand-off took exactly **1 visit** (15 min at V=15); the injected double-Completes surfaced **every** contested column (12 of 12), none silent.
- *Measured costs:* ops per step **3.78**; a bundle = **≈10.1 KB fixed + ≈2.1 KB per op** (least squares over 28-55 real bundles); a signed head ≈ 0.56 KB; requests per visit at N=9: put 1.2, get 11.0, list 2.3 (so gets ≈ N+2).
- *Measured growth:* a visit with **no news** re-folds the whole log: **70 ms at 275 ops → 535 ms at 1,525 ops** (≈0.34 ms per op, node, best of 3). **This is the first limit the office day hits** — before GitHub's caps: a quiet visit passes **1 s at ≈3,100 ops** (half a working day at N=30, 1.4 days at N=10), 5 s at ≈14,800. Phone speed is not measured ⛔. The cure is an incremental fold / the period-close checkpoint of §11.16 (not built) — **spec'd next, before any large rollout.**
- *Projected thresholds* (formulas of this section; assumptions d=20, s=3, V=15 unless stated):
  - GitHub, one account (125 pushes/h): **31 devices** at V=15, 125 at V=60; one repo (6 pushes/min): 90 / 360.
  - Download per device per day: 10 MB at N=14, 50 MB at N=65, 100 MB at N=128 (full replication inside one space ⇒ a space is a **department/branch**, not the company).
  - Pipe growth vs the 10 GB advice: N=10 → 5.2 working years; N=30 → 1.7; N=100 → 0.5.
  - **Web relay** (requests grow with N², everyone fetches everyone's bundle): N=30 ≈ 4.2k req/h (1.2/s); N=100 ≈ 41.9k req/h (11.6/s); N=300 ≈ 366k req/h (102/s). **Visits must be staggered** (a per-device offset inside V): a synchronized burst at N=100 is ≈10.5k requests in a minute. Apps Script postbox: 30 simultaneous executions per user, 6 min per execution, URL Fetch 20,000/day consumer / 100,000 Workspace, trigger runtime 90 min/day / 6 h (quota page fetched 2026-10-24; "may change without notice"); no daily web-app request cap is listed; our per-request time is **not measured ⛔**. Object storage or a bucket has no such concurrency cap. A relay that merges bundles per round would cut the N² reads to N (needs compute — a server).
  - **Email** (each visit = one email with one attachment ≈ 25-34 KB; Gmail cap 25 MB ⇒ size never the limit): per sender 32 mails/day at V=15 (cap 500/day consumer Gmail); into the postbox N=100 → 3,200 mails/day; at an **assumed** 1 s per mail that is 59 % of the 90 min/day consumer trigger budget (N=300 → 178 %, over). The 1 s is an assumption ⛔ — measure before relying on it. Email adds delivery delay on top of V.
- *Reading:* for a 9-to-5 office workflow the layer is comfortable up to **one department of ~30 staff per space on GitHub, ~100 on a web relay/bucket with staggered visits**, **provided** the fold is made incremental. Larger = several spaces (one per department/branch) and a transport without GitHub's per-account cap.
- *Not covered:* a phone's CPU; more than 9 simulated devices (projection only); real network latency; the Apps Script per-request time.


#### §13.12.I.1 Build spec — base hash and base-row scope (2026-10-24, read from `comm_store.js`/`comm_admit.js`; user: "build the base hash and base-row scope next")
**Where the code stands (read, not assumed):** admission scope comes only from the record's CREATE — `comm_store.js` `order()`: `scope: cr ? _scopeOfCreate(cr) : null`, and `comm_admit.js:21` `if (!ctx.scope) return REFUSED 'scope-unknown'`. GENESIS params = `{name, nonce, founder{…}}`, and `space = ROS.spaceOf(params)` (the space id is the hash of the genesis params).
**1. Base hash**
- `CommStore.newSpace(name, founder, personUu, personName, adRoleId, opts)` — new optional `opts.base = {name, sha256, bytes, version}` copied into `params.base`. Because the space id hashes the params, **a different base is a different space id** — the binding is automatic and tamper-evident. A space without `opts.base` behaves exactly as today (additive).
- `store.baseInfo()` → the genesis `base` object or `null` (read from the folded roster; no new op type).
- Host check `CommStore.checkBase(store.baseInfo(), loaded)` where `loaded = {sha256, bytes?}` is what the host computed from the DB it actually has: returns `{ok:true}` or `{ok:false, reason:'base-mismatch', have, want}`; it is a pure function. The host (ERP `team_sync.js`, Modeller adapter) calls it **before** opening the store for folding and shows the plain message of §13.12.I rule 3; it never folds onto a mismatching base. For the ERP the thing hashed is the shipped seed the sidecar sits on (state the exact file in the host change); for the Modeller the loaded model DB.
- Ops stamp `manifest` (existing field, §11.8) with a short form of the base sha256; an op whose `manifest` base differs from the genesis base is **REFUSED `base-skew`** at admission (after signature, before access).
**2. Base-row scope**
- `CommStore.open(db, opts)` gains `opts.baseRow(table, uu) → {client, org} | null` — supplied by the host from the **verified** base DB (e.g. `SELECT ad_client_id, ad_org_id FROM <table> WHERE <table>_uu=?`). The engine stays DB-agnostic.
- In `order()`: `scope = cr ? _scopeOfCreate(cr) : (opts.baseRow ? opts.baseRow(table, uu) : null)`. Precedence: a CREATE in the log wins; else the base row; else `scope-unknown` as today. An UPDATE/DELETE whose target is a base row is admitted or refused by the SAME `canUpdate(role, client, org, table)` as any other op — no special case per table.
- The refusal reasons stay the same plus **`base-row-missing`** when `opts.baseRow` is supplied and returns null for a uu that is not created in the log (an op against a record that exists nowhere).
- ERP host change (`erp/team_sync.js`): `translate()` currently marks an UPDATE/DELETE of a seeded record (positive pk) local-only (`uuOf` returns null for non-negative ids). With a base present it resolves the seeded row's `<table>_uu` from the base DB and sends the op; `STATION_LOCAL` tables stay excluded. Remove the "seeded edits are local-only" limit text from the chip/guide only after the witness is green.
**3. Witnesses** (each with a control; INCONCLUSIVE when nothing was judged)
- `W-BASE-HASH` (`scripts/witness_comm_base.js`, node): space created with `base`; same base → `checkBase` ok; one flipped byte of the DB → `base-mismatch` with have/want; a space without `base` still folds as before; the space id differs when the base differs; an op stamped with another base is REFUSED `base-skew`.
- `W-BASE-EDIT` (node + the ERP two-browser harness): a base record (real seeded row with a `_uu`) is edited by A (role with write on its org) → B sees it after a Visit; a role WITHOUT write on that org is REFUSED by the base row's scope with `access:` reason; an op on a uu that is in neither the log nor the base is REFUSED `base-row-missing`; the Complete of §13.7 now sends the `m_storagereservation` write and it is ADMITTED (before: `scope-unknown`) — printed as before/after counts of `refused`.
- Regression: all comm witnesses, `witness_team_so/docaction/desktop/pill`, `witness_team_modeller` unchanged (spaces without `base` must behave identically).
**4. Out of scope here:** releases/fast-forward (`W-BASE-RELEASE`), thin base, serving the base (policy directory). Named so they are not silently skipped.

#### §13.12.I.2 build notes (2026-10-24, written BEFORE the code; the places §13.12.I.1 was silent)
Implementing §13.12.I.1 — Witnesses: W-BASE-HASH (`scripts/witness_comm_base.js`), W-BASE-EDIT (`bim-ootb erp/tests/witness_team_base.js`).
1. **Which DB is the ERP base (read from `erp/idempiere.html` 1070-1105, then CORRECTED by the first browser run):** the ERP does not run on `ad_seed.db` alone. The page loads `erp/ad_seed.db` (27,193,344 B; `seedFile`, default `ad_seed.db`) and then applies, on EVERY load, the self-heal patch texts `patches/<seed>.sql` and `patches/mfg.sql` (idempiere.html §FS-15). `glassbowl_data.db` and `ad_full.db` are other pages' data. **MEASURED (W-BASE-EDIT first run):** the reservation row a Complete updates (`m_storagereservation`, uu `019ee88d…`, qty 305) is NOT in `ad_seed.db` (2 rows, qty 0); it comes from `patches/ad_seed.db.sql` — a file-only hash left it "in neither the log nor the base" (`base-row-missing`). So **the ERP base = the seed file + the two patch texts**, hashed together. Rows with `<table>_uu` + `ad_client_id` + `ad_org_id` exist for `m_storagereservation`, `c_order` (9 rows of client 11; one is the non-UUID demo id `hba-iot-order-latest`), `c_bpartner` (24 rows of client 11; 6 are non-UUID demo ids `hba-bp-*`), `ad_org`, `c_invoice`, `c_payment`; a seeded row with no valid-UUID `<table>_uu` cannot be addressed by the envelope (named limit: it stays local-only, `seeded-row-has-no-uu`).
2. **Where the hash is computed:** in the HOST. The engine never reads a DB. `CommStore.baseFromBytes(name, bytes, version)` (async, WebCrypto) returns `{name, sha256, bytes, version}`. `erp/team_sync.js` hashes `sha256("seed <sha256 of the file> <size>\n" + "--patch <i>\n<text>\n" … )` — patches by POSITION (so a `?seed=` copy keeps the same patches), a missing patch as `MISSING`; `base.name = '<seed>+patches'`, `bytes` = file + patch bytes, `version` = the page's `__adSeedFingerprint` (informational, not compared). The live `__idmpDb` is that PLUS device-local overlays (BIM project orders, system tenant, installed shards, plugins), which differ between devices and are NOT part of the base identity. Therefore **base rows are read from a PRISTINE second database = the seed file with the same patches applied by the same statement rule, nothing else**, never from the live `__idmpDb` — otherwise two devices could judge the same op against different rows and fold differently (the convergence property would be gone). It is opened lazily on the first base-row question (re-fetch, re-hash, require the SAME hash, open, apply patches); a device that never edits a seeded record pays nothing. Cost when used: one extra ~27 MB wasm database (heap ≈ file size) + the patch statements' run time (named, per the PERF BUDGET).
3. **Engine API (all optional → a space without `base` is bit-for-bit as before):**
   - `newSpace(name, founder, personUu, personName, adRoleId, opts)`; `opts.base = {name, sha256 (64 hex), bytes?, version?}` is validated (throws otherwise) and copied into `params.base`; the space id hashes it.
   - `roster.base` = the genesis `base` (shape-checked) or `null`; `store.baseInfo()` is **async** (it reads the folded roster) → the base or `null`. A roster that is not ok yet (no trusted genesis seen) also gives `null`; hosts must tell the two apart with `store.order().roster.ok`.
   - `CommStore.checkBase(baseInfo, loaded)` pure: `baseInfo == null` → `{ok:true, base:false}`; equal sha256 (and equal `bytes` when both carry it) → `{ok:true, base:true}`; else `{ok:false, reason:'base-mismatch', have, want, message}` where `message` is the plain sentence of rule 3.
   - **Stamp:** `author()` of every non-identity op sets `manifest = 'b:' + sha256.slice(0,12)` when the space has a base, from `opts.baseSha256` (what the host actually loaded) if the host supplies it, else from the genesis base. A caller-supplied `spec.manifest` still wins. Identity ops keep `m0`. Claims (KEYCLAIM/BOOKING) are stamped but not judged (they write no table).
   - **`base-skew`:** `CommAdmit.admit` gets `ctx.base` (the same short form, or null); `ctx.base && env.manifest !== ctx.base` → `REFUSED base-skew`, placed right after the signature check and before revoked/no-role/scope/access.
   - **`opts.baseRow(table, uu) → {client, org} | null`** may be sync or async (it is awaited); asked ONLY when the op has no CREATE in the log and no checkpoint-frozen scope; the answer is memoised per fold. `null` with `baseRow` supplied → `REFUSED base-row-missing`; no `baseRow` → `scope-unknown` as today.
   - A checkpoint's frozen verdicts need no change: verdicts of the closed prefix are frozen as judged; the base row is a pure function of the (hash-pinned) base.
4. **ERP host (`erp/team_sync.js`):** (a) `found()` hashes the base and passes it (if hashing fails it founds WITHOUT a base and logs `§TEAM_BASE none reason=…`, never a silent weaker space); (b) after every sync and at boot, `S.baseInfo()` + `checkBase`: on mismatch NO projection (`teamRebuild` is skipped), the chip shows the plain message and `data-base="mismatch"`, new local edits stay local-only (`base-mismatch`); (c) `translate()` resolves a seeded row's uu from the pristine base for UPDATE/DELETE/SET_STATUS (positive pk), so it is sent; `STATION_LOCAL` stays excluded; (d) `project()` maps a base-record uu back to the receiver's key — `{id: pk}` when the table has a `<table>_id` column in the base, else `{idCol: '<table>_uu', id: uu}` exactly as the model layer addresses composite-key tables; (e) `opts.baseRow` and `opts.baseSha256` are passed to `CommStore.open`.
5. **Named limits (not built):** releases / fast-forward (W-BASE-RELEASE), thin base, serving the base through the POLICY directory, Modeller base wiring (its spaces have no base — unchanged). An op authored by a device that has not yet seen the team's GENESIS carries `m0` and is `base-skew` in a space with a base (the device could not know the base); a seeded row without a `<table>_uu` stays local-only; the pristine base costs one extra database of the file's size on first use.

**Results 2026-10-24** (logs read in full; `build/comm/logs/witness_comm_base.log`, `witness_comm_base_mutations.log`; bim-ootb `erp/tests/witness_team_base.js`):
- `§W-BASE-HASH PASS judged=36 fails=0 inconclusive=0` (node, the REAL base = `build/erp/ad_full.db` 44,937,216 B hashed by `CommStore.baseFromBytes`; rows looked up with `<table>_uu`; roles judged by the real `MRole.canUpdate` port). Arms: BASE-ID 5 · BASE-INFO 3 · BASE-CHECK 6 · BASE-SKEW 7 · BASE-NOBASE 3 · BASE-EDIT 9 · BASE-PERMUTE 3 (20 arrival orders and an ASYNC `baseRow` give identical verdicts over 16 ops, 4 refused).
- Engine mutants (`scripts/witness_comm_base_mutate.sh`, each must go RED): baseRow never consulted 8 red · baseRow answer dropped 6 · `base-row-missing` collapsed into `scope-unknown` 2 · `checkBase` always ok 4 · `checkBase` ignores the hash 3 · `base-skew` rule removed 3 · `author()` never stamps 12 · genesis base not folded into the roster 18 · base not put in the genesis params (crash, exit 2).
- `§W-BASE-EDIT PASS judged=22 fails=0 inconclusive=0 pageerrors=0` (two real browsers + a third with a seed one byte different; the base is the REAL `erp/ad_seed.db` + `patches/*.sql`; node recomputes the base hash independently: `d35e8a75a3be…`, 30,383,663 B). Browser mutants: `MUTATE=baserow` 8 red · `MUTATE=checkbase` 4 red.
- **Before/after `refused` of the §13.7 Complete** (same arm, real ERP): a team without a base (phone page) `refused=1 {"m_storagereservation:scope-unknown":1}` -> a team founded in the ERP with a base `refused=0` and the `m_storagereservation` write `MERGED:role 102 ok`; B's op-log holds the same reservation update (A=1 B=1, before the Complete B=0). Engine level, the same op log judged without/with `baseRow`: refused 7 -> 4, reservation `scope-unknown` -> `MERGED`.
- Base-edit arms in the ERP (seeded Business Partners, no CREATE in the log): role 102 edits partner 114 -> B sees it after a Visit (`MERGED:role 102 ok`); role 103 on an org-0 partner `REFUSED access:missing=C` with the SAME verdict on A and B, B's own screen reverts (a NO-OP guard first shows the edit on B's form); role 103 on the org-11 partner is ADMITTED and reaches A (control); a random uu is `REFUSED base-row-missing` on both. A device with a one-byte-different seed: chip `data-base=mismatch` with "Your copy of ad_seed.db+patches is not the team's (yours 6253f4a32b49, the team's d35e8a75a3be, version f7e391af). Update it, then try again.", 19 placed ops held, **0** projected (control: B has 15).
- **Side effect worth knowing (found, not designed):** in a base team the Complete also shares the `c_acctschema` period update (a seeded row with a uu) — local-only 9 -> 8 in the same arm — and it is admitted.
- Measured costs: the first base-row question on a device opens a pristine copy: **1.3 s** (3,895 patch statements ok, 3 failed — the page's own boot rule), **+~26 MB** wasm heap, one extra ~27 MB + 3.1 MB fetch from cache; the hash itself is a fetch + SHA-256 of ~30 MB per page load of a base team (not measured separately). Founding hashes the same bytes.
- Regression, unchanged (spaces without a base): bim-compiler `cl1_uu 23`, `cl2_order 12`, `cl3_store 25`, `cl4_admit 23`, `cl5_conflict 12`, `cl8_opaque 44`, `space_scope 23`, `policy 32`, `checkpoint 43`, `keyclaim 25`, `pipe_ifabsent 24 -> 29` (+5: name class `f`, below), `docno_booking 15`, `docno_modes 14`, `waiting_ops 9`, `sim_comm_office_day 9 3 15 0.3` PASS judged=6. bim-ootb `witness_team_so` (18, 1 timing-dependent INCONCLUSIVE -> 19/0: its pk-collision precondition arm depends on timing), `docaction 24` (still `§DA-REFUSED m_storagereservation scope-unknown`: it founds on the phone page = no base), `desktop 9` (founds with a base), `pill 14`, `people_strip 29`, `team_modeller 33`; `audit_sw_precache` 0 missing, 0 unlisted.
- Also: `ghPipe._kidOfName` and the post-office gate accept name class `f` (`s/<space>/f/<kid>`, the focus board, §13.12.G.2 DEP-GHPIPE-F) — five assertions in `witness_pipe_ifabsent.js` (accepted; unknown class `z/` and another device's `f/` name still refused; gate accepts `f/` and still says `bad-name` to `z/`); removing the one-line change turns three of them red.
- **Named limits (not built):** releases / fast-forward (`W-BASE-RELEASE`), thin base, serving the base through the POLICY directory, Modeller base wiring (its spaces have no base and its witness is unchanged); device-local overlays (BIM project orders, system tenant, shards, plugins) are not part of the base, so an edit of a row that only such an overlay creates is `base-row-missing`; the base-row scope is read once per row and remembered for the life of the store (the base is immutable); an op authored before the device has seen the GENESIS carries `m0` and is `base-skew` in a base space; a checkpoint freezes verdicts but not base-row scopes (they are a pure function of the hash-pinned base); `hostBaseRow` must throw, not return null, when it cannot answer.

### §14.1 Novelty — what is and isn't new (checked 2026-10-23)

- **The building blocks are known.**
  - Local-first apps and CRDTs: Ink & Switch, Automerge, cr-sqlite, SQLSync, LiveStore; our own `docs/LocalFirstPriorArt.md`
    compares them.
  - Per-author signed append-only logs over any transport: Secure Scuttlebutt, p2panda, Hypercore.
  - Peer validation of every entry against shared rules: Holochain's per-agent "source chains" checked by peers.
  - Git or a shared folder as the transport: Gatty (event stream in a git repo, synced to a git host), outl (per-device
    op log over an iCloud folder).
- **The combination looks unusual.** Two web searches found no project that combines all of:
  - an iDempiere-faithful ERP;
  - per-device signed chains;
  - order computed with no sequencer, from the records each op read;
  - admission at fold time by the ERP's **own** role engine (an `MRole.canUpdate` port);
  - conflicts shown with iDempiere's own `CurrentRecordModified`;
  - pipes that only store bytes (GitHub branch per device, Gmail visit log, folder).
- **That is a short search, not a prior-art study.** Claim *"to our knowledge"*, and run a proper search (deep-research)
  before any "first" wording, as was done for the Spatial Compilation paper (priority-dated).

### §14.2 Owed before the film

- W1 and CL8 PASS.
- A slim AD seed for the phone (the 27 MB first load is visible on camera).
- A role picker on Approve (for beat 7).
- One clean end-to-end take on the user's real phone, read back from GitHub.

### §13.4 CL8 results 2026-10-23 — encryption ✅ DONE (witness, node + 2 real browsers + real GitHub/Gmail)

**`W-PIPE-OPAQUE` PASS judged=44 fails=0** (`scripts/witness_comm_cl8_opaque.js`, log `build/comm/logs/witness_comm_cl8_opaque.log`),
22 judgements each over memPipe and folderPipe:

| Arm | Measured (log line) |
|---|---|
| CONVERGE | `§OPAQUE-CONVERGE business=6/6/6 order=e62363741ed9744c/e62363741ed9744c/e62363741ed9744c` — A, B, C: one op set, one order |
| RAW | `§OPAQUE-RAW pipe objects=7 bytes=66812 sealed-rows=6 needles=14 hits=0` — documentno strings, 3 + 3 totals, `grandtotal`, `documentno`, `c_order`; every object searched |
| RAW control | `§OPAQUE-RAW control (plaintext space) needles found=5/5 sealed-rows=0` — the same search finds them in a pre-CL8 space, so the 0 above can fail |
| OUTSIDER | `§OPAQUE-OUTSIDER identity ops read=8 roster devices=3 business ops read=0 placed=0 sealed=6 foldable=0` |
| NOGRANT | `§OPAQUE-NOGRANT E enrolled without dh_jwk: in roster=true epochs=none business placed=0 sealed=6` (the "ENROLL without dhJwk still works, just no grant" promise) |
| LATE | `§OPAQUE-LATE before enrol: business placed=0 sealed=6` → `after grant: opened=6 sealed=0 business placed=6 order(L)=…=order(A)` |
| NOKEY | `§OPAQUE-NOKEY raw epoch-1 key found in comm.db=false in pipe=0 ; fresh comm.db re-derived epochs=1 placed=6` |
| TAMPER | `§COMM_SEAL … TAMPERED op=… refused (GCM)`; `§OPAQUE-TAMPER … flipped 1 bit … tampered=1 op-in-store=0 placed=5/6` → after restoring the honest bytes `tampered=0 placed=6/6` |
| REVOKE | `§COMM_REKEY kid=… epoch=2 excludes=<C> grants=3`; `§OPAQUE-REVOKE B epochs=1,2 ; C epochs=1 revoked=true C placed=6 sealed=1 ; A placed=7 L placed=7 B placed=7`; `B's post-rekey row is enc:2: ; C forcing its epoch-1 key on it → refused` |
| RAW after rekey | `§OPAQUE-RAW after rekey: objects=13 sealed-rows=7 hits=0` |

- **The witness can fail.** Mutation check: with `_seal` removed from `bundleNew` (business ops go out in plaintext), the same
  witness goes red on RAW (`hits=18 sealed=0`), OUTSIDER, NOGRANT, LATE, REVOKE and the post-rekey RAW.
- A first run failed on TAMPER (`placed=4/6`): the flipped op was a CREATE, so the UPDATE that read it parked. That was
  the witness's expectation, not the code. It now flips the last sealed row of a bundle.

**What was built** (`build/comm/`, ported byte-identical to bim-ootb `common/comm/`):
- `newDevice()` also makes a P-256 ECDH pair (private non-extractable). `ensureDh(dev)` upgrades a device object saved
  before CL8 (useful only before it is enrolled). `newSpace` puts `dh_jwk` in the founder block; a founder without one makes a
  plaintext space, exactly as before.
- Identity ops `KEYGRANT {kid, epoch, from_kid, wrapped}` and `REKEY {epoch, excludes}` (comm_roster.js). A grant is the
  epoch key `AES-KW`-wrapped under `HKDF-SHA256(ECDH(granter priv, device pub))`, with space, epoch, from and to bound into
  the HKDF info, so a grant cannot be replayed to another device or epoch. Business envelopes are `AES-GCM-256`,
  AAD = `space|epoch`.
- Roster rules I had to decide (the spec was silent):
  - A KEYGRANT is valid only if its signer is a comm-admin or the same person as the grantee, **and holds that epoch**
    (the founder holds epoch 1, a REKEY's author holds its epoch, a grantee holds what it was granted).
  - A REKEY needs an admin and must be exactly `max epoch + 1`; the first in fold order wins, a second for the same epoch
    is `REFUSED epoch-exists`.
  - Both read the epoch record (`ROS.epochUU`), so they order after the GENESIS / REKEY that created the epoch.
- The store derives keys in `keyring()` from the accepted grants at fold time and memoises on the fold result. Nothing
  symmetric is ever written to `comm.db`.
- `enroll(kid, jwk, personUu, dhJwk?)` with `dhJwk` also grants every epoch the enroller holds, in the same visit.
- `sync()` order is now: collect (sealed rows → `cl_sealed`) → open what a key now opens → housekeeping → send my news.
  - Housekeeping (`autoKeys`): an admin's visit after a REVOKE of a key holder writes REKEY + a grant to every
    non-revoked device with a key; an admin or same-person device also issues any epoch grant a device still lacks (the
    repair path). It never re-issues a grant it already authored.
  - **Never plaintext:** in an encrypted space a business op the device cannot yet encrypt (no key, or no trusted genesis
    yet) is not put in a bundle; the bundle stops before it. Identity ops still go out.
  - A tampered row (key held, GCM refuses) is dropped, counted (`rep.tampered`), and its bundle is forgotten
    (`cl_fetched`) so an honest copy heals it on a later visit.
- `readBundle` returns `{hash, env:null, enc:<epoch>}` for a row it cannot open. New `keyring()` and `sealed()` on the store.

**Existing witnesses changed (only where the new flow requires it):**
- `witness_comm_cl3_store.js`, `_cl5_conflict.js`, `_cl3b_github.js`, `_gmail_log.js`: `enroll(...)` now passes `dhPubJwk`,
  otherwise the enrolled device has no key and (correctly) cannot read the founder's ops.
- `witness_comm_cl3_store.js`: the §STORE-WITHHOLD late joiner used to be an unenrolled `newDevice()` that read everything;
  it is now enrolled and granted, since an unenrolled reader sees nothing (that is what CL8 is).
- `witness_comm_cl3b_github.js`: op counts 5 → 7 and A's SEEN ops 4 → 6 (the 2 KEYGRANTs).
- bim-ootb `witness_comm_cl3_folder.js`: A's own ops before the first visit 5 → 7. `comm_poc.html` passes `dh_jwk` through
  `init` / `enrollPeer`. `witness_comm_cl4_admit.js` needed no change (28 ops written instead of 27: the founder's self-grant).

**Regression (each log read):**
- W-UU-NO-COLLIDE PASS 23/0 · W-ORDER-PERMUTE PASS 12/0 · W-STORE-NODE PASS 25/0 · W-ADMIT-FOLD PASS 23/0 · W-CONFLICT PASS 12/0.
- W-GH-PIPE-2DEV PASS 7/0 (real GitHub, now with ciphertext bundles: `A blob bytes read=90012`). Run twice: the first run
  failed on the two op-count assertions above, which were then corrected.
- W-GMAIL-LOG PASS 5/0 (real Gmail, 4 notes matched by message id).
- bim-ootb: W-FOLDER-2CTX PASS 16/0 (two real browsers). W-PHONE-PAGE PASS 13/0 (two real browsers, real GitHub + Gmail post box, 10 notes read back, `errors=0`; the phone's join request carries `dh_jwk` and Approve calls `enroll(kid, jwk, person_uu, dh_jwk)`). Its first run crashed with `waitForSelector` timeout on the phone's last visit: the post-box call hung past 90 s (no `§PHONE_NOTE` printed for it; the box answered a probe in 2 s right after). The rerun passed; the visit-log fetch has no timeout of its own, which is a separate small item.

**Named limits (not hidden):**
- **Two admins revoking at once** each write REKEY epoch n+1. The second is refused, and any business op its author wrote
  under that epoch before seeing the winner stays sealed for everyone else. Not witnessed.
- The pipe still sees **metadata**: author kids, bundle names (seq range, hash), sizes, head timestamps, and all identity ops
  (names, role ids, public keys, wrapped keys).
- A revoked device keeps the epochs it already had (it can still read history it could always read).
- **Local plaintext:** `comm.db` on a device holds the ops it can read in the clear, as the business DB does. CL8 protects
  the pipe, not a stolen unlocked device.
- Existing spaces are plaintext (the founder block is part of the space id, so it cannot gain a key later). Only a space
  founded by a device with a `dhPubJwk` is encrypted.
- A phone paired before CL8 has no ECDH key: `ensureDh` gives it one on page load, but it only helps if the device is not
  yet enrolled. Already-enrolled phones need re-pairing to read an encrypted space.
- The epoch key is held extractable in memory (needed to re-grant it); the ECDH private key is not extractable.

### §13.3 W1 results 2026-10-23 — Sales Order in team mode ✅ DONE (witness, two real browsers) — bim-ootb PR #2347

**Built (bim-ootb `erp/team_sync.js` + 3 additive hooks).** Both seams are generic; no window or business table is named.
- OUT: `crud_overlay._sidePersist` → `TeamSync.onCommit(rows, liveSidecar)`. Each CRUD row becomes a v3 envelope through `wrapKernelOp`.
  CL1b: a negative `<x>_id` (checked against the CREATE row that minted it: same table, already shared) becomes `{uu}` and a ref.
  Anything else is **not sent** and shows in the chip as `⚠ n local-only` (`§TEAM_LOCALONLY … reason=…`).
- IN: Visit = `store.sync` → `store.foldable()` → `__crud.teamRebuild(project)`. Rows this device never shared stay verbatim at their ids; the
  placed ops are regenerated after them (`user_tag='team'`), FK `{uu}` → local pk through a uu→pk map built in the same pass. Written as new
  snapshots plus an `undone` tombstone for each vanished id, into the existing append-only `ops` store under the same cross-tab lock.
  `window` re-keys its current records (`TEAM_VISIT` branch in the `overlay:committed` listener) and re-queries.
- Loader: `idempiere.html` writes the comm scripts only when the URL has `?team=1`.
- Comm store: the ERP keeps its own bytes under IDB key `erp_db` (seeded once from the phone page's `db`); identity/space/token from `comm_phone`.
  After CL8 it calls `CommStore.ensureDh` and writes the same device object back, so the space (encrypted — founder had a `dhPubJwk`) works unchanged.

**Findings that changed the spec text:**
1. The spec said each op becomes a kernel op with `idCol:'<table>_uu'`. `listTip` honours that, but `tipValues`/`readTip`/the edit form key on the
   numeric `p.id` (`crud_core.js:654`), so an `idCol` op is invisible to the form overlay. The projection therefore carries the **local pk** in `id`
   (a created row's `-kernelRowId`), and the uu lives only in the comm log.
2. `erp/sw.js` `cacheFirst` keyed on the URL without its query, so two `list?prefix=` pipe reads got the same stale answer (and any GitHub GET would
   be cached forever). Fix: a request with `cache:'no-store'|'reload'` is never answered from a cache (v899).
3. Document saves also write `ad_sequence`(+`_no`), `ad_recentitem`, `ad_session`. Shared, they would turn every save into a crossed edit.
   No AD column marks them (`AD_Table.ReplicationType='L'` on all 1003 tables), so `STATION_LOCAL` is **one named list** in `team_sync.js` — the only
   table list in the adapter. Consequence still open: two devices allocate the same DocumentNo (witness: both orders are `50001`) — needs the
   station-owned sequence of §11.1.
4. An UPDATE/DELETE on a **seeded** record (positive pk) can't be admitted: `comm_admit` judges scope from the record's CREATE (`scope-unknown`).
   It is sent nowhere and shown local-only. Admitting edits to seeded masters needs the scope read from the AD row — open.
5. A Visit renumbers synthetic pks (`-kernelRowId` follows the rebuilt order). Observed in the witness: the same pk number names different records on
   A and B. The window re-keys its current records, but a dirty form defers the refresh (`refresh=DEFERRED`).

**Witness `W-TEAM-SO`** (`erp/tests/witness_team_so.js`, run on the CL8 comm layer after rebasing onto #2343/#2344):
`§W-TEAM-SO PASS judged=19 fails=0 inconclusive=0 pageerrors=0` (log: `/tmp/claude-1000/…/scratchpad/w5.log`, quoted below).
- `§TEAM-OFF` no chip/box/global/comm script tag and 0 `§TEAM` lines without `?team=1`.
- `§TEAM-PAIR` phone pages paired by clicks (founder, join, Approve with role picked); the ERP chip shows code · `team devices 2` · Visit (cursor pointer).
- `§TEAM-SO-SYNC` A creates an order + 1 line → `§TEAM_OUT` header and line (`refs=1`); Visit A, Visit B → B's grid 5→6 rows; B's header form shows
  A's Description; Order Line tab: **1 row, link `c_order_id=-2` = the header's pk**, projected line `c_order_id=-2` count 1; header → Order Line →
  header → Order Line without Save keeps 1 row on the same parent.
- `§TEAM-EDIT` B edits Description, both Visit → A shows `W1-A-one edited-by-B`.
- `§TEAM-CL1` both create then edit before any Visit → both hold the same three orders, each with its own edit; pk `-28` is "CL1-B edited" on A and
  "CL1-A edited" on B (the §12.1 precondition is real) and no edit landed wrong.
- `§TEAM-CONFLICT` crossed Description edits → both devices show ONE conflict naming both values with "Current record was changed by another user,
  please ReQuery", and keep `CL1-A edited`.
- `§TEAM-LOCALONLY` a DocAction commit is not sent; `chip.localonly 0 → 1`.
- `§TEAM-XOFN` **the generic hook covers 240 of 373 AD windows** (≥1 tab on a table with `<t>_uu`, not station-owned; 168 with every tab);
  **witnessed 1 of 373** (window 143, header + Order Line). Not "all windows work".
- Pipe: local dumb folder over `CommPipe.httpPipe`; the unmodified phone page pairs through a Playwright stand-in for `api.github.com` that is a thin
  view of the same folder. No GitHub was touched; the optional `bim-teams-pipe` run was **not** done.

**Regression** (run before and after in the same worktree; verdict lines identical): `poc_access_gate_live` 9/0, `poc_inplace_edit_live` 12/12,
`poc_parity_docno_live` 10/10, `poc_critic_crud_full_live` 2/10 (red before and after), `poc_inplace_newdel_live` 7/14 (red before and after),
`witness_gridtab_live` pass=4 fail=1 (timed out at 400 s both times), `test_idempiere_master_detail` crashes on a missing `sql.js` module both times;
`audit_sw_precache` 0 missing.

**Not in W1 (named):** DocActions (W2), retiring `?relay=`, slim seed; DocumentNo ownership; admitting edits of seeded records; the optional real-GitHub run.

### §14.3 User notes 2026-10-23 (film first; UI next)

- **Film first** (user: *"Just do the film first"*).
  - Rough cut v0: `~/Videos/TheServerIsDead_RoughCut_v0_2026-10-23.mp4` (80 s): title card → ch03 card → laptop founds a
    space → phone (approved earlier) Visit → enrolled, orders arrive → ch04 card → laptop New order → retake card.
  - **Honest splice:** the two clips were in **different spaces**. The phone had not pressed Start over, so it was still in
    `59a0b7f4` while the laptop founded `55ca3c3e`. So no cause→effect is implied across them; each segment is captioned
    with what it really shows.
  - The laptop's log panel is cropped out: it showed misleading `TAMPERED` lines caused by the space-scope defect below.
- **Defect found from the clips:** pipe names are not scoped by space (§11.2 said `s/<space>/…`). One device in two spaces
  clobbers its own head and tries to open other spaces' sealed rows. An agent is fixing it (§13.6). **Retake after that
  lands.**
- **UI must be friendlier — next ongoing work** (user: *"I think the UI should be more user friendly (take note for next
  ongoing work)"*). Candidates seen in the clips:
  - a guided first-run wizard (token → start or join) instead of numbered panels;
  - a QR code for the invite instead of a long link;
  - plain words instead of the `§` log panel (hide it behind "details");
  - one big status line ("2 to send · last visit 2 min ago · all seen");
  - phone-first layout and larger touch targets;
  - a clear warning when the phone is still in an old space;
  - the Team Panel of §11.17.
- **My independent re-run of W-TEAM-SO** (agent run: 19/0/0): `PASS-WITH-INCONCLUSIVE(1) judged=18 fails=0`. The
  `§TEAM-CL1` precondition (the same local pk naming different records on both devices) didn't occur in this run, so that
  arm honestly reports INCONCLUSIVE; the collision itself is covered by W-UU-NO-COLLIDE.

### §13.6 Space-scoped pipe names (2026-10-23) — defect found from a user screen recording, fixed (witness W-SPACE-SCOPE)

**Defect (verified by reading code, then reproduced).** §11.2 says every pipe object lives under `s/<space>/…`. The code
(CL3 `comm_store.sync`, the phone page) wrote and listed *unscoped* names: `o/<kid>/<from>-<to>.<h12>.bimpack`, `h/<kid>`,
`r/<kid>`. A device that is in two spaces on the same pipe (the user's laptop had founded two) therefore
(a) overwrote its own head `h/<kid>` across spaces, so receipts and frontier were wrong; and
(b) listed and fetched the other space's bundles, then tried to open their sealed rows with the wrong key/AAD, which GCM refuses —
logged as `§COMM_SEAL … TAMPERED … refused (GCM)` although nothing was tampered with. Reproduced: the new witness run against the
pre-fix modules prints those TAMPERED lines and fails `§SCOPE-NAMES` and `§SCOPE-HEADS`.

**Decision.** Every name the store and the phone page write or list is under `s/<space>/`, with `<space>` = the **full 64-hex
space id** (not the 12-hex prefix). Reason: it is exactly §11.2's layout; a 12-hex prefix is only 48 bits, and a short prefix lets
someone grind a second space whose prefix collides, which would re-create this very defect on purpose; the cost is a longer path
(well under any path limit; GitHub tree paths and the Gmail-log blob link just get 52 characters longer). The 12-hex form stays
what it always was: a display shorthand in logs.

| Name | Written by | Listed by |
|---|---|---|
| `s/<space>/o/<kid>/<from>-<to>.<h12>.bimpack` | `comm_store.sync` (bundleNew) | `pipe.list('s/<space>/o/')` — own kid skipped as before |
| `s/<space>/h/<kid>` | `comm_store.sync` (signed head) | `pipe.list('s/<space>/h/')` |
| `s/<space>/r/<kid>` | phone page join request | phone page `b-requests`: `pipe.list('s/<space>/r/')` |

**Four-verb contract unchanged** (`put/get/list/putMany`); only the names differ. `ghPipe._kidOfName` now parses
`s/<64-hex space>/<o|h|r>/<kid>[/…]` and returns the kid; any other shape (unscoped `o/ h/ r/`, a short space id, an unknown
class, `…/genesis`, a missing kid) returns null and is refused ("not under my prefix"), as is every name whose kid is not the
device's own. One-writer-per-name is therefore kept and is now also per space.

**Old objects.** Unscoped objects already in `red1oon/bim-teams-pipe` (and any old folder/http pipe) are simply ignored — no
migration; nothing lists them any more (witness arm `§SCOPE-LEGACY`). Consequence, stated plainly: ops a device already marked SENT (`bundled_to`) under the old names are NOT re-sent under the new
ones, so a space that already has history on the real pipe must be re-founded (the real-repo data is POC test data; the user
accepted no migration). New ops and every new space use the scoped names from the first visit.

**GCM-failure log.** With the listing scoped, no path remains that feeds a row of another space into `openSealed`: every bundle
fetched is, by name, in this space. A row that fails GCM now is therefore genuinely corrupt or a tampered copy planted *inside
this space's prefix* (e.g. a bundle of another space copied under it) — which is the case `§COMM_SEAL … TAMPERED` exists for, so
the line is kept as is. The old false-positive source is removed at its root rather than relabelled.

**Witness W-SPACE-SCOPE** (`scripts/witness_comm_space_scope.js`, memPipe + folderPipe + a network-stubbed ghPipe guard): one
device X founds two encrypted spaces on ONE pipe; M1 is a member of space 1, M2 of space 2; X works more in space 1 than space 2
so its two heads differ (guards against vacuity). Arms: `§SCOPE-NAMES` (every object `s/<space64>/{o,h}/…`, both spaces
present), `§SCOPE-CONVERGE` (each space converges on its own ops only — same op set per space, every stored op carries that
space's id, business op sets disjoint), `§SCOPE-HEADS` (read both heads back; author+visit only in space 2 → head 1 byte-identical,
head 2 advanced by exactly the new ops; receipt SEEN comes from the space-2 head), `§SCOPE-TAMPER` (zero TAMPERED lines, with the
positive control that §COMM_SYNC lines were captured), `§SCOPE-LEGACY` (planted unscoped objects ignored), `§SCOPE-GHGUARD`
(13 names: own scoped o/h/r accepted past the guard; other kid, unscoped, short-space, unknown class, genesis refused). INCONCLUSIVE,
not PASS, if a space has no objects/ops, the two heads are equal in seq, or no sync line was captured.
Existing witnesses that asserted names were updated: `witness_comm_cl3_store` (stray-name regex, planted fork bundle, list prefixes),
`witness_comm_cl3b_github` (cross-prefix put now `s/<space>/h/<B>`; new check that A's own kid under the OLD unscoped name is refused),
`witness_comm_cl8_opaque` (list prefixes), `witness_comm_gmail_log` (the note's bundle-link regex), and in bim-ootb
`common/tests/witness_comm_cl3_folder.js` (folder-name check). `common/tests/witness_comm_phone_page.js` needed no edit: it drives
the page, which now writes/lists `s/<space>/r/<kid>`, and its "requests from other spaces ignored" claim is now structural.
Results and PR: appended below at close.

### §14.4 Essentials film v2, narrated (2026-10-23)

- `~/Videos/TheServerIsDead_Essentials_v2_narrated_2026-10-23.mp4` — 2:50, English two-voice dialogue (Kokoro: F asks
  as the puzzled viewer, M explains), framed as a **proof of concept of the underlying idea**.
- Script: `prompts/film_narration_server_dead_dialogue_v1.tsv`, 14 beats.
  - Covers: the usual problem → the four ideas → "bizarre? it's how Git works" → setup → **test bench vs. daily work** (user:
    *"are those screens behind the scene, transparent, or actual work?"*) → real footage labelled TEST BENCH → the clash and
    the rules as illustrations tagged "Filmed live in the next take" → close.
- **Fit:** 14/14 DETAIL, 0 tone WRONG.
- **Measured:** loudness I=-16.8 LUFS; longest quiet gap 6.94575 s (bar ≈7 s).
- Subtitles are on a dark band, and the card footers are removed (v1 was hard to read on the light cards).
- Fixed along the way: the phone clip's variable frame rate turned a 22 s cut into 36 s and shifted every later cue. It is
  now re-timed to exactly 22 s.
- **Still owed for the full film:** the retake in one fresh space after the space-scope fix (§13.6), the clash and refusal
  live, and the real ERP window (W1).

**§13.6 results 2026-10-23 — ✅ DONE (witness).** Logs read after every run.
- `witness_comm_space_scope.js` (new): `§W-SPACE-SCOPE PASS judged=23 fails=0` (memPipe + folderPipe + stubbed ghPipe guard). Same witness against the
  PRE-fix modules: `§COMM_SEAL … TAMPERED … refused (GCM)` lines and `🔴 every object is s/<space>/{o,h}/…` / `🔴 X has TWO heads` — the defect, reproduced.
- Regression: cl1_uu `PASS 23/0`, cl2_order `PASS 12/0`, cl3_store `PASS 25/0`, cl4_admit `PASS 23/0`, cl5_conflict `PASS 12/0`, cl8_opaque `PASS 44/0`
  (its 2 TAMPERED lines are the deliberate `§OPAQUE-TAMPER` arm, bundle names now `s/<space>/o/…`), real GitHub cl3b `PASS 8/0` (new check: own kid under the old
  unscoped name refused), real Gmail `§W-GMAIL-LOG PASS 5/5` (its bundle-link regex was `o/…`, caught as a red on first run, fixed).
- bim-ootb PR #2348 (modules byte-identical): W-FOLDER-2CTX `PASS 16/0`, W-PHONE-PAGE `PASS 18/0` (real GitHub + post box), W-TEAM-SO `PASS 19/0 inconclusive=0`
  (PR #2347 was on main; `erp/team_sync.js` untouched, only the witness's fake-GitHub kid parser needed the new layout).

### §14.5 Friendlier UI for the test bench — spec (2026-10-24, user chose this as the next item; origin: §14.3)

> **⏸ PARKED 2026-10-24 (user: *"we could begin the wiring of it behind the standard document actions, and this UI may not be too pursued"*).** No code was written from this section (a first edit was started and discarded). Next work = DocActions wiring (§13.3 W2). Resume this only if the user asks.

**Scope:** `common/comm/comm_phone.html` only (the test bench). No change to `build/comm/*` engine modules, no change to the
ERP window. Every existing element id and the 18 checks of W-PHONE-PAGE keep working — the page is re-skinned, not re-wired.
**Not in this pass:** the Team Panel advice engine (§11.17/§11.18 — needs the EODA rules, its own spec + `W-PANEL-ADVICE`).

| # | Change | Rule (what the witness asserts) |
|---|---|---|
| U1 | One plain **status line** (`#plain`) above everything: e.g. "In team · 2 to send · last visit 2 min ago · all seen" | text is derived from the same numbers as `#delivery`; before a space it says what to do next. `§UI-STATUS` compares its counts to `#delivery`'s. |
| U2 | **Wizard header** "Step n of 4 — <name>" over the one visible step | n equals the step whose section is visible: token 1, space 2, pairing 3, work 4 |
| U3 | **QR code** of the invite link on the founder's pairing step (`#invite-qr`, canvas) using `erp/qrcode.min.js` | decoding is not available in the browser, so the witness regenerates the matrix from the SAME link with the same library and compares module-for-module with the canvas pixels (`§UI-QR`); canvas absent → fail, library absent → the text link still shows |
| U4 | **`§` log behind "Details"** (`<details id="details">`, closed by default) | log text is not visible until opened; still in the console (PRIMAL LAW §3: never suppressed) |
| U5 | **Phone-first**: every button/input min height 44 px; layout one column ≥ 320 px, no horizontal scroll | measured `getBoundingClientRect` on Pixel 7 emulation: all visible buttons ≥ 44 px high; `scrollWidth <= clientWidth` |
| U6 | **Old-space warning** (`#old-space`): the page was opened with `#join=<X>` but this browser is already in space `Y≠X` → banner "This device is in an older space (Y…). The invite is for X…" with a **Start over and join** action | witness: phone in space A opens B's invite → banner shown naming both; same-space link → no banner (NO-OP arm); no hash → no banner |

Witness: extend `witness_comm_phone_page.js` with `§PHONE-UI` arms (U1–U6). Each arm must be able to print INCONCLUSIVE
(e.g. U6 when no second space exists). Real GitHub as before; branches cleaned up.


---

### §15 Modeller case — two browsers, one model, the SAME comm layer (2026-10-24, user: *"do the same for the BIM Modeller … prepare a SIMPLE FILM SCRIPT"*)

**Status: SPEC written before any code.** A separate session owns this section; it only appends here (no other section was edited). Code + witness + film
script results are appended at the end of this section as `§15.10`. Everything below was read from code this session (file:line cited) or measured
(`scratchpad/probe1.js`, a real headless Modeller: commit `GEOM_EXTRUDE`, then `GEOM_MOVE {dx:2,dy:-3,dz:0}` → mesh bbox centre `[0.5,0.5,1.25]` → `[2.5,-2.5,1.25]`).

#### §15.1 Facts that shape the design (read, not guessed)
| # | Fact | Source | Consequence |
|---|---|---|---|
| F1 | The Modeller's model IS a signed `kernel_ops` table of `GEOM*` rows; geometry is a pure fold over it. | `modeller/bonsai_oplog.js:1-6,300-308` | The projection of the comm log is a kernel_ops table, exactly as ERP's sidecar is. |
| F2 | Every row carries an edge-minted `op_uuid`; `commitGroup` honours a caller-supplied one. | `modeller/kernel_ops.js:352-353` | A CREATE's record uu = its `op_uuid` (same convention as ERP, `comm_envelope.js:111-112`). No new id needed. |
| F3 | Rows reference each other by `parameters.parent` = a **local integer row id** (`GEOM_MOVE {parent,dx,dy,dz}`); a position is the **sum of active GEOM_MOVE deltas** (`moveDeltaFor`), a *delta*, not a value. | `bonsai_oplog.js:303,517-527` | Envelopes must carry the uu, never the row id (V8), and a move must be restated as an **absolute offset per axis** so the per-column conflict rule can judge it. |
| F4 | The one commit funnel is `OpLog._emit()`, which dispatches `bonsai:oplog` after every mutation (and on load). | `bonsai_oplog.js:284` | The adapter listens to the event — **no edit to `bonsai_oplog.js`**. |
| F5 | `importBytes(u8)` loads a db as the current model: verifies the chain, refolds, persists, emits. | `bonsai_oplog.js:234-252` | The rebuilt projection is installed through it. |
| F6 | The Modeller signs with a hard-coded demo key; its chain is a local integrity check only. | `bonsai_oplog.js:12,38-41` (= §5 S-6) | Not a problem for sync: §11.3 already makes the kernel chain "a local integrity check", and comm envelopes are signed by the **device** key (ECDSA P-256). S-6 stays true for the Modeller's own chain and is *not* made worse. |
| F7 | Envelope validation V8 refuses **any negative integer anywhere in `params`** as "a device-local synthetic pk". | `comm_envelope.js:56-60,81-82` | A geometry `dy:-3` (or a profile point `-2`) cannot travel raw. The adapter encodes a negative integer as `{"$n":"-3"}` and decodes it on the other side. **No engine change** (a real mismatch to report, §15.8). |
| F8 | Admission needs a record scope from the CREATE (`fields.ad_client_id/ad_org_id` or `stdDefaults`) and an `access(role, client, org, table)` adapter; an op with no CREATE in the log is `REFUSED scope-unknown`. | `comm_store.js:112-116,150-157`, `comm_admit.js:12-26` | Every element CREATE carries client 0 / org 0 (iDempiere's System / `*` convention — the Modeller has no client or organisation). Moves of a record this space never saw created are local-only (same limit as ERP W1-4). |
| F9 | Conflicts are judged **per record (target uu) × column** from `fields` (CREATE) / `changes` (UPDATE); the held-back value stays at the last agreed one; `foldable()` deletes contested columns from the op. | `comm_store.js:208-248` | Position columns `pos_x/pos_y/pos_z` give per-axis conflicts for free. |
| F10 | Intent is only recorded, never branched on. | `grep intent build/comm/*.js` | Tag `K6` (what the data is) without changing the engine. |

#### §15.2 What a Modeller "op" is for sync
**Element** = a feature row of a *create-class* op. **Table** = `bim_element` (a pseudo-table name: the comm layer needs a lower-case table name per record; the
Modeller has no AD dictionary). **State columns** of an element: `geom_op`, `geom` (the op's parameters), `pos_x`, `pos_y`, `pos_z` (net offset from the authored
placement, metres, rounded to 1e-6), plus optional `output_guid`/`input_guids` and the scope pair `ad_client_id=0`, `ad_org_id=0`.

The ONE named op-class list in the adapter (the Modeller analogue of ERP's `STATION_LOCAL`; reason: there is no dictionary to read it from, and it equals the fold
class in `bonsai_oplog.js:354` plus `GEOM_INSERT`):

| class | GEOM ops | shared as |
|---|---|---|
| create | `GEOM_INSERT`, `GEOM_EXTRUDE`, `GEOM_EXTRUDE_POLY`, `GEOM_SWEEP`, `GEOM_LOFT`, `GEOM_REVOLVE` | `CRUD_CREATE` on `bim_element`, target uu = the row's `op_uuid` |
| move | `GEOM_MOVE` | `CRUD_UPDATE` on the parent element's uu, `changes: {pos_x|pos_y|pos_z: {old,new}}` for each axis whose delta ≠ 0 |
| local-only (named, with reason shown in the chip) | every other `GEOM_*` — `GEOM_CUT`, `GEOM_FILLET`, `GEOM_ROTATE`, `GEOM_SCALE`, `GEOM_ARRAY`, `GEOM_GRID_MOVE`, `GEOM_ROOM_MOVE`, `GEOM_SHELL`, … | not sent |

Denominator reported by the witness (AD-LAYER-LAW style, not "Modeller works"): **7 of the 22 `GEOM_*` op types named in `bonsai_kernel_worker.js` + `bonsai_kernel.js` are shared; 15 are local-only** (the witness counts them from source and prints the number).
Rows of an `arcseed-*` group (a building seed both devices already have) and rows already tagged `team` are never authored.

#### §15.3 How a GEOM op is wrapped into a v3 envelope
```
create:  target {table:'bim_element', uu: <row op_uuid>}
         body   {op_type:'CRUD_CREATE', params:{ fields:{ geom_op, geom:<enc(params)>, pos_x:0, pos_y:0, pos_z:0, ad_client_id:0, ad_org_id:0, [output_guid], [input_guids] } }}
         refs   []        intent 'K6'        ts = the row's timestamp (display only, never ordering)
move:    target {table:'bim_element', uu: <the PARENT row's op_uuid>}      (parent must itself be shared; else local-only 'target-not-a-team-record')
         body   {op_type:'CRUD_UPDATE', params:{ changes:{ pos_x:{old:<enc>,new:<enc>}, … }, [induced] }}
         refs   []        intent 'K6'
enc(v):  a negative integer -k → {"$n":"-k"} at any depth; every other value unchanged (floats such as -2.5 are fine, F7).
```
`old` is the element's net offset on that axis in the *local* fold just before the move; `new = old + delta`, both rounded to 1e-6. `reads` (set by the engine's `author`)
makes the move descend from the element's current head, so a move made after a Visit supersedes the moves it saw.
The wrap is generic over op *class*; there is no branch on a particular op name beyond the one class table above.

#### §15.4 What "two people editing the same model" means
Same rule as ERP (§11.15/§12.9 D3), applied to the `pos_*` columns:
- **Different elements** (or different axes of one element): both apply on both devices; 0 conflicts.
- **Same element, same axis, crossed** (neither had seen the other's move): both devices show ONE conflict per axis naming both values and keep the **last agreed**
  offset (the CREATE's 0, or the last move both had seen). Message text is the existing `CurrentRecordModified` string.
- **Resolve** = any later move by someone who has seen both heads (it descends from both, §12.9). A chooser UI is not part of this slice (same as ERP, CL-P).
- A move made *after* a Visit that fetched the other's move is a plain K2 save over the visible value: no conflict.

#### §15.5 Single-writer claim (discipline × zone, K6): **OUT of this slice** — named as the next step
Reason: `comm_admit.admit` receives only `(role, client, org, table)` and the roster has no `OWNER` op, so "this device owns zone Z of discipline D" cannot be expressed
without an engine change, and the brief says not to touch `build/comm/*` unless unavoidable. Cheapest future path, recorded so it is not rediscovered: map
**discipline → table** (`bim_arc`, `bim_str`, `bim_mep`) and **zone → org**, so the existing `canUpdate(role, client, org, table)` rule already yields "refused at write
time"; what is missing is a role dictionary for the Modeller (who may touch which discipline/zone) and a way to read an element's discipline/zone off the op.
Until then the access adapter is **open by design** for any enrolled role: `access()` returns `{allowed:true, reason:'modeller-open (no claims yet)'}` for table `bim_element` only and refuses every other table.

#### §15.6 How the Modeller projection is rebuilt after a Visit
`Visit` = (1) settle pending scans, (2) `store.sync(pipe)`, (3) `store.foldable()` (placed, admitted, conflict-held ops in the engine's order), (4) rebuild the kernel_ops table, (5) `OpLog.importBytes`.
Rebuild (a scratch sql.js db, then `importBytes`):
1. **Kept rows** (verbatim, same order, same `op_uuid`/`gid`/`undone`): rows that are not `user_tag='team'` and whose uu is not in `sent` — i.e. seeds, local-only ops, and anything not yet authored.
2. **Projected rows** (after the kept ones, one group `team-proj`, `user_tag='team'`): for each folded op in order — CREATE → the original `geom_op` + decoded `geom` with `op_uuid = target.uu`;
   MOVE → `GEOM_MOVE {parent:<new id of the row with op_uuid = target.uu>, dx,dy,dz}` where each delta = `new − current projected offset` of that axis (so a held-back axis simply produces no move).
3. **Parent remap**: every kept row's `parent` is mapped old-id → uu → new id; a kept row whose parent vanished logs `§TEAM_REMAP_MISS` (never guessed).
4. Re-sign with the Modeller's own signer (`commitGroup`), `verifyChain`, refold, persist — all inside `importBytes`.
The comm log is the truth; the model is its projection (identical stance to §13.1). Row ids change after a Visit (known, same as ERP limit 5); selection by row id may reset.

#### §15.7 Wiring, switch, UI
- `modeller/team_sync.js` (new, generic adapter) + a loader in `modeller/modeller.html` that writes the comm scripts and the adapter **only when** `?team=1` or `localStorage.teamMode==='1'` (the ERP's switch). Off: no script tag, no DOM, no global, no `§TEAM` line.
- Identity / space / token come from the same-origin IndexedDB `comm_phone` (pair once on `common/comm/comm_phone.html`). The Modeller keeps its own comm store bytes under `modeller_db`.
- A fixed bottom-left chip `#team-chip`: `Team · <device code> · team devices n · Visit · my ops … seen … refused …`, `⚠ n local-only`, and a `#team-conflicts` list (same text as the ERP's).
- `modeller/sw.js`: add `team_sync.js` to `PRECACHE_ASSETS`, bump `CACHE_VERSION`.
- The one-cycle **trial cap** of §13.8 (`TeamTrial`, 60 ops) applies identically when `cfg.trial` is on (the cap works for any op; the "cycle" never completes in the Modeller).

#### §15.8 Named limits of this slice (not hidden)
1. Ops outside the class table stay on the device (15 of 22 `GEOM_*` types), shown as `⚠ n local-only` with a reason. A cut/fillet/rotate on a shared element is therefore **not** seen by the other person.
2. Edits to a **seeded** element (building seed rows) are local-only (no CREATE in the log → `scope-unknown`), same as ERP W1-4.
3. **Undo/delete of an already-shared op is not shared**; the next Visit restores the shared state (the comm log wins).
4. A multi-op gesture (grid stretch + riders) is shared op by op; all-or-none is not enforced as it is for ERP doc-actions.
5. One app per space: ERP devices judge a `bim_element` op `REFUSED no-table` and a Modeller judges an ERP op the same way; verdicts are per device, so a mixed space would diverge. Use a fresh space per app.
6. The phone page, ERP and Modeller on one browser share ONE device identity and must not author at the same time (equivocation) — same as §RESUME item 5.
7. F7: the engine's "no negative integer" rule is a **real mismatch for geometry**; worked around in the adapter by encoding, not fixed in `build/comm/`. A proper fix is to scan only `*_id` columns in `validate`/`wrapKernelOp` (engine owner's call).
8. Positions are quantised to 1e-6 m in the shared state; a Visit renumbers row ids; turning team mode on in a model that already has hand-authored features shares them all (`§TEAM_CATCHUP`).
9. Not witnessed: a real GitHub pipe (folder pipe only), more than two devices, big models (rebuild is O(rows), re-signing each).

#### §15.9 Witness `W-TEAM-MODELLER` (`modeller/tests/witness_team_modeller.js`; two real Playwright contexts, the real `modeller.html`, dumb folder pipe + the same fake-GitHub stand-in for the unmodified phone page as `witness_team_so.js`)
Every arm names the issue it proves or disproves and prints INCONCLUSIVE (never PASS) when it judged nothing. Numbers are read from real state: oplog rows, `moveDeltaFor`, mesh bbox centres, `verifyChain`, engine conflict list.
| Arm | Issue it proves / disproves | Guards |
|---|---|---|
| `§TM-OFF` | disproves "the team code touches an ordinary Modeller session": without the switch no chip, no `TeamSyncModeller`/`CommStore` global, no comm script tag, 0 `§TEAM` lines; the page still commits a feature | VACUOUS if the commit produced no row |
| `§TM-PAIR` | phone pages pair (founder + join + Approve with role); the Modeller chip shows the code, `team devices 2`, a Visit button | |
| `§TM-CREATE` | "A creates and moves an element; B sees it": A commits an extrude and `GEOM_MOVE dx=2,dy=-3` (negative integer!), Visit A, Visit B. B's rows, `moveDeltaFor`, **mesh bbox centre equals A's** to 1e-6; B's chain verifies; B's projected rows are `user_tag='team'` | NO-OP guard: B had 0 GEOM rows and 0 meshes before its Visit. F7 guard: the move with `dy=-3` was not refused |
| `§TM-DIFF` | different elements moved by each: both apply, 0 conflicts, both devices' two centres equal the expected numbers | VACUOUS if either centre did not move |
| `§TM-CROSS` | same element, same axis, crossed: each device shows ONE `pos_x` conflict naming both values and **keeps the last agreed centre** (numbers); an axis only one of them moved (pos_y) still applies | NO-OP guard: before the Visit each device's own centre showed its own move |
| `§TM-RESOLVE` | a later move after seeing both clears the conflict on both and both converge on the same centre | INCONCLUSIVE if there was no conflict to resolve |
| `§TM-LOCALONLY` | a `GEOM_SCALE`/`GEOM_ROTATE` on a shared element is NOT sent (chip shows it, the other device does not receive it) and the kept local row's `parent` is remapped to the element's NEW row id after a Visit (`§TEAM_REMAP_MISS` count 0) | |
| `§TM-XOFN` | prints the denominator: shared op types / all `GEOM_*` types named in the worker (7 of 22) | |
| `§TM-NOERR` | 0 page errors on both pages | |
Regression: `erp/tests/witness_team_so.js` and `witness_team_docaction.js` stay green; `build/comm/*` and `common/comm/*` stay byte-identical (`cmp`).

#### §15.10 Results (2026-10-24) — bim-ootb PR #2358 (`feat/modeller-team`)
Logs read in full (`scratchpad/tm5.log`, `so.log`, `da.log`; also `tm1.log`/`tm2.log` = the red runs). Files: `modeller/team_sync.js` (new), `modeller/modeller.html` (loader), `modeller/sw.js` (precache + the fix below, v155), `modeller/tests/witness_team_modeller.js`.
`build/comm/*` and `common/comm/*` are byte-identical (`cmp` against bim-compiler: all 7 modules identical); no ERP file was touched.
- `§W-TEAM-MODELLER PASS judged=33 fails=0 inconclusive=0 pageerrors=0`. Every arm of §15.9 ran: TM-OFF (separate browser, 0 `§TEAM` lines, still commits), TM-PAIR, TM-CREATE (A's move `dx=2,dy=-3` with a negative integer arrives; B's mesh centre equals A's to 0.0 m, centre `[3,-2.5,1.25]`; a polygon with `[-2,-1]` points arrives with the same size `[2,2,3]` and centre `[-1,0,1.5]`; both kernel chains verify; NO-OP guard: B had 0 rows / 0 meshes before its Visit), TM-DIFF (E1 x+1 and E2 y+4 applied on both, 0 conflicts), TM-CROSS (one `pos_x` conflict per device with values `[4,5]` before `3`, the `CurrentRecordModified` text shown, both keep x at the last agreed value; the z axis only B moved still applies on both), TM-RESOLVE (a later move by A clears it; both converge on x = agreed + 1.5), TM-LOCALONLY (rotate not sent, chip 0 → 2 local-only; the kept rotate row's parent follows the element's renumbered row 1 → 2; the rotation still applies on A, never reaches B), TM-XOFN (7 of 22).
- Red/green evidence: first full run **failed** on a real defect, `modeller/sw.js` answered the comm layer's `list?prefix=` reads from cache (the same bug erp/sw.js got fixed for in §13.3, finding 2), so a Visit parsed a bundle as a head and threw. Fixed with the same three lines; this also protects GitHub API reads in the Modeller. Mutation check: replacing the id remap with the old id makes TM-LOCALONLY fail 3 arms (`fails=3`), then reverted.
- Regression: `witness_team_so.js` `PASS judged=19 fails=0`, `witness_team_docaction.js` `PASS judged=21 fails=0`, `audit_sw_precache` 0 missing (that audit covers the viewer; the Modeller entry `team_sync.js` was checked to exist).
- Findings that changed the spec text: (1) the Modeller's own sw (above); (2) a local row that depends on a projected element must be placed AFTER the projection or the fold sees a forward reference (`planProjection` + kept-after list, §15.6 step 3 refined); (3) the 22nd op type (the regex also counts `GEOM_OPENING`).
- Hard / left out, with the reason: the single-writer (discipline x zone) claim (needs an OWNER op and an owner check in `comm_admit`, i.e. an engine change); Undo/delete of a shared op; op classes beyond create/move; a real GitHub run (not done); real gizmo drag under team mode (the witness drives `Bonsai.oplog.commit`, the call the gizmo release makes; the gizmo path itself, which commits via `commitGesture` for riders, was not run under team mode); a phone-sized Modeller (not tested).

#### §15.11 Film: simple script and takes
Script: `prompts/film_narration_server_dead_modeller_v1.tsv` (10 beats, 2:35, same columns as the ERP script: beat, start, end, visual, short text, full text; honest framing: proof of concept, test bench vs real work, what is not shared yet). Not recorded, no TTS run.
**Takes** (one fresh space; follow §14.3: both devices Start over first, laptop founds, second device opens the NEW invite; set fps before trimming; never show a token, the invite link or an `exec` URL unblurred):
1. **Dry run first, unrecorded**: open the Modeller on both with `?team=1`, draw one block with the real tools, move it with the gizmo, Visit both, and read the `§TEAM_OUT` / `§TEAM_VISIT` lines. The gizmo path has not been run under team mode (§15.10); if a line says `local-only`, fix before filming.
2. **Take A, pairing (TEST BENCH label)**: second browser window or profile (or a second laptop) on the phone page: Start a space, Join with the code, Approve with a role. Record both screens.
3. **Take B, the chip**: open `modeller.html?team=1` on both; show `Team · <code> · team devices 2 · Visit` for 3 s each.
4. **Take C, create**: device 1 draws a block, presses Visit; device 2 shows an empty model (2 s hold, proves it was empty), presses Visit; the block appears. Overlay the `§TEAM_VISIT` line.
5. **Take D, move**: device 1 drags the block left (a negative direction) and forward; Visit on both; hold on both screens. Overlay the two `centre` numbers read from `Bonsai.group()` (same values to 1e-6).
6. **Take E, different blocks**: each device moves a different block, then Visit, Visit, Visit; both moves on both screens, chip shows 0 conflicts.
7. **Take F, the clash**: do not Visit between the two drags; both drag the SAME block along x to different places; Visit on device 1, device 2, device 1. Hold on the warning on both (`pos_x: values 4 / 5, kept 3`), block still at the agreed place.
8. **Take G, resolve**: device 1 moves the block once more; Visit, Visit; warning gone, both agree.
9. **Take H, limits**: device 1 rotates the block; the chip shows `⚠ 1 local-only (not shared)` and device 2 does not rotate. Then the plain limits card.
Order of editing: cards and tags `TEST BENCH` over A and B, `LIVE` over C to H; every number on screen from that take's log.

### §14.6 ERP desktop film (2026-10-24) — "The Server is Dead — ERP, desktop setup"
- **File:** `~/Videos/TheServerIsDead_ERP_Desktop_narrated_2026-10-24.mp4` (3:20.9, 1920x1080, 25 fps, English two-voice Kokoro, subtitles on a dark band). Work files (footage, cfr clips, cards, fit) in `~/Videos/ServerDead_desktop_work/`.
- **Script / logs:** `prompts/film_narration_server_dead_desktop_v1.tsv` (14 rows, cue/end generated from the `§FILM_CUE` log through `scripts/film_server_dead_desktop_tsv.py`); logs in `prompts/film_server_dead_desktop_logs/` (`rec.log`, `cues.json`, `narr_fit.log`, `mux.log`, the three witness logs, `wit_*.log`). Tools: `scripts/film_server_dead_desktop_rec.js` (footage driver), `..._build.py` (cards + side-by-side + overlays), `..._tsv.py`, `film_html_shot.js`. Shared film scripts were not edited (the mux's "Script directed by red1" credit line was stripped from the generated `.ass`, voices credit kept).
- **Footage:** two Playwright contexts (User A, User B = separate storage), real `erp/idempiere.html` from bim-ootb main `4f2e2600`, dumb folder pipe as a stand-in for GitHub, ONE fresh space, one continuous take per window (308 s), clicks driven by script. Recorded at **1024x576** per window (not 1280x720) so the text stays legible after the side-by-side scale to 954x536. Cosmetic only: red pointer dot, invite-link inputs blurred, `docstatus` conflict line highlighted. Real clicks on the real DocAction bar (`data-doc-action="CO"`), not `__crud.process`.
- **One space (measured):** `§FILM_SPACE who=A space=77a039e42b87` and `who=B space=77a039e42b87` (page logs); the pipe folder holds objects of exactly one space, `§FILM_PIPE objects=10 spaces=["77a039e42b87:10"]`. Take verdict `§FILM_REC_VERDICT PASS checks=18 bad=0` (incl. NO-OP guards: B not enrolled before Approve, B not Completed before its Visit; non-vacuous clash: both had tax=1 before any Visit; 0 page errors).
- **Beats (all on the footage):** turn on team mode from the pill → Start a team (blurred link) → B opens the invite, Join, code E819-1010 → A lists exactly that code, role GardenWorld Admin (102), Approve → B Visit, `team devices 2` → A creates order + line (×4 sped up), Visit A/B, B's grid has "Film order 1" with 1 line → A Complete; B shows Drafted until its Visit, then `status=CO tax=1 lines processed 1/1` (same as A) and an Order Tax row on the tab → clash on order 2: both Complete before visiting, after the visits both show 9 conflicts incl. `docstatus: values "CO" / "CO", kept "DR" — Current record was changed by another user, please ReQuery`, status Drafted, `tax=0 processed=0` on both (`§TEAM_GROUP_HELD` x8).
- **Measured on the final file:** frames 5023 = silent source 5023 (`ffprobe -count_frames`); longest silence (`silencedetect n=-40dB:d=2`) 3.81 s; loudness I = -17.1 LUFS, LRA 4.0 (single-pass loudnorm, not exactly -16); fit 14/14 DETAIL, 0 SHORT, tone 20 OK / 0 WRONG / 0 INCONCLUSIVE (two first-draft questions that read WRONG were reworded); subtitles at most 3 lines on footage (proof lines end at y=775, subtitle block starts at y>=875), 4 lines only on the limits card. Pane clocks: first ERP paint at 9.08 s (A) / 9.00 s (B) vs cue `loaded` 10.93 / 10.90 → video time = take time − 0.33 s on both (used for every cut).
- **Witness PASS lines on the closing card (re-run 2026-10-24):** `§W-TEAM-DESKTOP PASS 9/0`, `§W-TEAM-DOCACTION PASS 21/0`, `§W-TEAM-SO PASS 19/0` (inconclusive 0 each).
- **Defect found while filming (not fixed, named on the limits card):** after the first `TEAM-REBUILD` that tombstones rows, the next Complete's commit reads `§KRN_CHAIN group-torn … prev_hash link broke` / `§OPLOG-HYDRATE … verifyChain=FAIL(group torn)` and `§CRUD process committed … verifyChain=FAIL`; the ERP toast says "signed (verify FAIL)". The following Visit logs `§TEAM-REBUILD … verifyChain=ok`. The witnesses never print this line. Owner: ERP-wiring lane.
- **Not filmed / cut:** the real-GitHub pipe; the trial limit (key not installed, covered by `§DA-TRIAL` only); Void/Close/Reverse; waiting time (page loads, B's re-open of the grid) is cut, never reordered.

### §15.12 Modeller film (2026-10-24) — "The Server is Dead — the Modeller"
- **File:** `~/Videos/TheServerIsDead_Modeller_narrated_2026-10-24.mp4` — 2:38 (157.76 s), 1920x1080, 25 fps, English two-voice dialogue (Kokoro: F asks, M explains), subtitles burned in. Script `prompts/film_narration_server_dead_modeller_v2.tsv` (14 rows; v1 kept). Driver + builder `scripts/film_server_dead_modeller/` (`rec.js` records, `sync.py` aligns, `assemble.py` + `plan7.py` cut and compose, `overlay_ass.py` numbers/tags, `cards.py`, `mktsv.py`/`rowtimes.py` script times, `loud2.py` loudness, `film_checks.sh` witness); logs `prompts/film_server_dead_modeller_logs/`. Source product: bim-ootb PR #2358 (merged, `4f2e2600`): `modeller/team_sync.js`.
- **What the footage is (labelled the same way on screen):**
  - ONE fresh space for everything: `§TEAM_BOOT … space=2a1f91ce8280` printed by BOTH pages (A device `edf5aca91e1f6d24`, B device `86560f81b9ec381a`). Two Playwright contexts = User A / User B, `--disable-gpu`, no GPU lock, static server + dumb folder pipe (no real GitHub).
  - Pairing = the unmodified `common/comm/comm_phone.html` in a second desktop window (no phone device), labelled TEST BENCH; the invite link, token and post-box fields are blurred in the page (CSS filter, not shown). The in-panel flow of §13.9 is ERP-hosted and is not used by the Modeller.
  - **Every move is a REAL gizmo drag** (`page.mouse` down / 14 moves / up on the Move gizmo; the block is first selected with a real click). `§FILM_DRAG` prints the offset before/after read from `moveDeltaFor` and the `§TEAM_OUT op=GEOM_MOVE as=CRUD_UPDATE …` line each release produced (6 drags: A x -2, B x +2, A x +1, B x +2, B y +1, A x +1; `realClickFallbacks=0`, `pageerrors=0`). This closes the §15.10 gap "gizmo path not run under team mode": the release commits one `GEOM_MOVE` and the adapter sends it with no `local-only` line.
  - **Blocks and the rotate are the Modeller's own command** (`Bonsai.oplog.commit`, the call the witness makes) and say so on screen; Visit is a real click.
  - Camera: the Modeller frames a selection tightly, so after each selection a fixed overview camera is set (`A.camera`/`controls.target`, camera only, not model state). A yellow disc follows the pointer (film-only cursor, pointer-events none). Slow parts (drags, Visit waits) are played at x2 / x3 with an on-screen badge `playback xN`; 39.3 s of the 157.76 s are sped up; waits (page loads, settle, selection framing) are cut; 162.9 s of footage kept from 210.9 s recorded, nothing reordered.
  - Numbers on screen under each pane are `§FILM_STATE` readings (mesh bbox centre from `Bonsai.group()`, conflicts from `store.conflicts()`, chip `data-localonly`); they are blanked from the moment a Visit or a gizmo gesture starts until the next reading, so they are never older than the picture beside them.
- **Measured (final file, `film_checks.log`):** duration 157.76 s video / 157.80 s container; frames 3944 = silent source 3944; longest silence (`silencedetect n=-40dB:d=2`) 2.34 s (3 gaps of 2.28 / 2.34 / 2.21 s); loudness I = -16.1 LUFS, LRA 3.1, peak -1.4 dBFS (two-pass loudnorm on the audio, video stream copied); fit 14/14 DETAIL (two rows at x1.03 / x1.04), tone 16 OK / 0 WRONG / 0 INCONCLUSIVE; subtitle block y = 914..1038, x = 248..1671 (frame 1920x1080; clear of the note line y <= 910 and the number lines y <= 870); overlay lines at most 0.86 of their pane width; fontselect DejaVu Sans / DejaVu Sans Mono / Liberation Sans Narrow Bold. Sync: the white pulse is at video 1.36 s in both recordings (cue 1.52) so both panes share one clock.
- **Witness lines on the closing card (run this session, `witness_team_modeller_run.log`, 26 s):** `§W-TEAM-MODELLER PASS judged=33 fails=0 inconclusive=0 pageerrors=0` and six arm lines quoted verbatim (negative integer survived the pipe; one conflict per device; last agreed kept; conflict gone after a later move; B never receives the rotation; 7 of 22 shared).
- **Beat by beat — did the footage really show it (numbers from `rec.log`):**
  | Beat | Shown | Reading |
  |---|---|---|
  | pair | yes | `§FILM_PAIR B code=8656-0F81`; `A sees requests=["8656-0F81"]`; `B state=✓ enrolled — you are in the team` |
  | draw | yes | A: block 1 centre [1, 0.5, 0.75], block 2 [3.5, 2.5, 0.75]; B empty (`el:{}`) before any Visit |
  | visit1 | yes | after B's Visit: B shows the same two centres (`B_visited_blocks_arrived`) |
  | move | yes | A drag x -2: offset [0,0,0] -> [-2,0,0]; B drag x +2 on block 2: [0,0,0] -> [2,0,0]; before the Visits each pane shows only its own move; after: both panes block 1 [-1, 0.5, 0.75], block 2 [5.5, 2.5, 0.75] |
  | clash | yes | A x +1 (offset -2 -> -1), B x +2 (-2 -> 0), B y +1 (0 -> 1); after A, B, A Visits both panes: `conf [{block 1, pos_x, values [0,-1], kept -2}]`, block 1 centre [-1, 1.5, 0.75] (x held at the last agreed, y 1.5 applied on both) |
  | resolve | yes | A x +1: A centre x 0, warning gone on A, still on B (`resolve_A_moved`); after Visits both [0, 1.5, 0.75], 0 conflicts |
  | rotate / limits | yes | A block 1 size [1,2,1.5] with chip `local-only 1` and `§TEAM_LOCALONLY op=GEOM_ROTATE … (NOT SENT)`; B still [2,1,1.5] after both Visits; limits card quotes 7 of 22 (§TM-XOFN) |
- **Cut / not filmed:** a real-GitHub pipe (folder pipe only, as the witness); a phone; undo of a shared edit; a chooser button (not built); the single-writer (discipline x zone) claim (§15.5); more than two devices. Rotate is shown as not shared, never as shared.
- **Findings made while filming (not fixed here):** (1) at a 960 px viewport `#team-conflicts` (max-width 70vw, bottom 40 px) wraps to two lines and the History pill (`#hist`) sits on top of its middle, so the in-app warning reads `⚠ bim_element GEOM_EXTRUDE (…) … rent record was changed by another user, please ReQuery`; the film repeats the exact conflict text in the number lines under each pane. Owner: Modeller UI. (2) Selecting a block frames it tightly (camera distance 2.9); in my dry runs a real wheel zoom worked in select mode (distance 9.97) but had no effect after entering Move mode, so the film sets the camera instead. (3) The conflict candidates list order differs between runs (`[-1,0]` vs `[0,-1]`); the film quotes it as printed.

### §15.13 Modeller part 2 (2026-10-24) — re-cut that skips part 1 (user: "part 2 onwards")
- **File:** `~/Videos/TheServerIsDead_Modeller_part2_narrated_2026-10-24.mp4` — 2:23 (143.12 s), 1920x1080, 25 fps. Script `prompts/film_narration_server_dead_modeller_v3.tsv` (31 rows, one recorded reading per row); v1/v2 kept. Same footage as §15.12 (`rec.log`, nothing re-recorded): no title card, no "what you are watching" card, no problem/four-ideas material.
- **Recap:** ONE 8 s card, the ERP film's own image `~/Videos/ServerDead_desktop_work/work/cards/problem.png` (`cmp` identical, not redrawn), with one exchange ("Same idea as part one? / Yes: a full copy in each browser, signed letters through a post box. Now a model."). Pairing is cut to 17.8 s (five segments); the TEST BENCH / LIVE tags, the "drawn by the Modeller's own command" / "real drag of the Move gizmo" notes and the `playback xN` badges stay on the footage.
- **Narration re-timed to the log** (the §15.12 defect: "show the warning" spoken ~5 s before A's warning). `scripts/film_server_dead_modeller/mk3.py` pins every row to a `§FILM_CUE` or `§FILM_STATE` reading through `reftimes.py` (final-film time of the reading, same mapping the number overlay uses) and starts the row at that time + a delta of at most 0.8 s; rows are short (one event each) so no sentence waits for a later one. `cuecheck.py` measures the real speech onset in each row's wav: **31 rows, max |onset - reading| = 0.76 s, none above 1.0 s** (e.g. `warn` onset 88.17 s vs `clash_after_visits` reading 88.33 s; `agree` 63.86 vs 64.20; `G3_A_down` 67.89 vs 68.65). Only a row's first sentence is checked; multi-sentence rows (recap, limits, close, `warn`) are not aligned beyond their first sentence.
- **Measured (`part2_film_checks.log`, `part2_cuecheck.log`):** frames 3578 = silent source 3578; video 143.12 s / container 143.20 s; longest silence (`silencedetect n=-40dB:d=2`) 4.55 s (83.6-88.2 s, during the three clash Visits), other gaps 2.0-3.6 s; loudness I = -16.2 LUFS, LRA 3.9, peak -1.5 dBFS (two-pass loudnorm on the audio, video copied); fit 31/31 DETAIL, tone 11 OK / 0 WRONG / 0 INCONCLUSIVE; subtitle block y = 914..1038, x = 280..1635.
- **Same space as §15.12:** `§TEAM_BOOT … space=2a1f91ce8280` on both pages (one fresh space for all footage); positions per beat as in §15.12 (e.g. both panes block 1 [-1, 0.5, 0.75], block 2 [5.5, 2.5, 0.75] after the move Visits; conflict values [0,-1], kept -2 after the clash Visits; both [0, 1.5, 0.75] after the resolve).
- **Caveat:** the recap image says "The usual ERP needs a server" (it was drawn for the ERP film); it is reused unchanged by instruction.

### §15.14 Modeller part 3 — a real building, three wings, who-is-on-what (2026-10-25, user: *"show working on HHS Office ARC so that it is more realistic. The building has U shape wings so A can work on one and B on two"*)
- **File:** `~/Videos/TheServerIsDead_Modeller_part3_HHS_Office_narrated_2026-10-25.mp4` — 4:17.6 (257.6 s), 1920x1080, 25 fps, two-voice English (Kokoro), subtitles burned in. Script `prompts/film_narration_server_dead_modeller_v4_hhs.tsv` (34 rows, each pinned to one recorded reading). Recorder + builder `scripts/film_server_dead_modeller_hhs/` (`rec.js` take, `build.sh` everything after the take, `plan.py` edit list, `mk.py` script, `overlay_ass.py`, `cards.py`); logs `prompts/film_server_dead_modeller_hhs_logs/` (`rec.log`, `cues.json`, `fit.log`, `film_checks.log`, `cuecheck.log`, both witness runs). Skips the part-1 material (one recap card = the ERP film's own image, `cmp`-identical) and does not film pairing ("as in part two"; the take still pairs through the unmodified phone page, one fresh space).
- **What the footage is:** both windows open the REAL `HHS_ARC.db` resident (`§ARC-SEED building=HHS committed=1077`, geometry from the local copy of the OCI file) in `modeller.html?team=1`. Level-1 footprint = a C/U: north wing (y >= 31), west wing (the spine), south wing (y <= -3.5), numbers from the slab extents in `HHS_ARC.db`. A works the north wing, B the west and south wings (by agreement; nothing enforces it). Blocks = the Modeller's own command (`GEOM_EXTRUDE_POLY`), moves = REAL gizmo drags, selection = `Bonsai.select`, Visit = real clicks. View-only film aids (never model state): renderer clipping plane z = 3.8 (floors above Level 1 hidden), wing names, a ring + name per team block the window holds, the `#s9-erp-btn` button hidden, and in the last shot every mesh but the wall hidden with a dashed "where the wall started" line.
- **What it shows (all `§FILM_CHECK` lines of the take, 17/17 PASS, `rec.log`):** each window holds only its own blocks before the Visits (A 2 north; B 0, then 3 west/south, A still 2); after three Visits five blocks with identical centres; three real drags in three wings (N1 +1.039 x, S1 -1.014 x, W1 +0.913 y, each only its asked axis, each SENT) -> after the Visits identical on both, 0 conflicts, chips 0; A and B both open S1 (south wing): after A's and B's Visit B shows `founder is editing this element (just now)` (none before; gone after A lets go and both Visit); People list: two people, both "active", last task each; A ticks "Don't show what I'm on": B shows no label, A still "active"; A drags a seeded HHS wall (#907, north wing): `§TEAM_LOCALONLY op=GEOM_MOVE reason=target-not-a-team-record` x5 (the wall and four things riding on it), chip 5, B unchanged; close-up with the same camera on both: A's wall 0.999 m from B's on x, y and z equal. Chain: 0 `verifyChain=FAIL` / `group-torn` lines on either page; 0 page errors.
- **Measured (final file, `film_checks.log`, `cuecheck.log`):** frames 6440 = silent source 6440; fit 31 DETAIL + 3 SHORT (rows with 2.3-3.0 s room), 0 WRONG tones; loudness I = -16.1 LUFS, LRA 7.6, peak -1.4 dBFS; longest silence 7.3 s (204 s, the wall drag), next 7.0 s, 5.3 s; narration onset vs the reading each row is pinned to: max |delta| 0.56 s over 34 rows. Witnesses run for the closing card on bim-ootb main `6fdb77de`: `§W-TEAM-MODELLER PASS 33/0`, `§W-PEOPLE-MODELLER PASS 22/0`, `§TM-XOFN 7 of 22`.
- **Recorder defects the take's own checks caught (each fixed, then re-taken; kept so the next film does not repeat them):** (1) a fixed "grab the handle at +0.7 m" hit the Z handle and moved a block up (+1.55 m z) while the old check only compared panes; the grab point is now the axis SHAFT mesh read from `A.scene` (`userData.moveAxis`), and the check asserts each drag moved ONLY its asked axis by its asked distance and was sent; (2) kernel ROW ids are per device and are renumbered by every Visit's rebuild, so an id read before the moves selected nothing after them (no `§PEOPLE_FOCUS_OWN` line, no label): ids are resolved at the moment of use and a check asserts A's focus line exists; (3) the wall close-up first left the building visible (nested groups after a team rebuild): the isolation walks the scene and a check asserts 1..6 of >1000 meshes visible on both windows; (4) a check that was hard-coded `true` ("drags were sent") passed while a drag had not registered — replaced by one computed from the drag results.
- **Findings while filming (not fixed):** at 960 px the heads-up label (`#team-headsup`) sits exactly under the `ERP > Project Order` button (`#s9-erp-btn`) and is half covered (the film hides that button); the chip text truncates at 960 px (`5 local-...`); names are the plain founder / `device XXXX-XXXX` until a name field exists on the pairing page; A's window shows B's label too (B never deselected S1) - correct, but easy to misread.
- **Not shown / limits (also on the film's limits card):** the building itself is not shared, only what the team draws (Modeller base wiring, §13.12.I item 5, not built: moving a wall stays local); wings are agreement, no claim/lock (§15.5); 7 of 22 op types shared; the label is beside the chip, not on the 3D element (L2); two windows on one desk, folder pipe, no phone, no real GitHub, two people.

### §15.15 ONE Team icon in the Modeller + built-in avatars (2026-10-25, SPEC written before any code; user: *"it first shows the whole team ... overview what others doing. It is part of the multi user story. It is where the Join should be first. And the later present team overlay is an extension from it"* · *"the dots supposed to be avatars - graphics preference by each user"* · *"Yes built in, but look like those usual colored different personality head avatars. Film has to include this wow factor."* · *"there is no single machine multi tab users, but different machines team work and both of them are the same lens"*)
**Finding that triggered it (§15.14 film):** the Modeller showed TWO identical two-person icons — the top-pill `#b-teams` (the old Teams overlay, local-tab presence, off until clicked) and the bottom-right `#team-people-toggle` (People list of team mode) — and NO control to enter team mode at all (`?team=1` + the separate phone page). The original Team icon (teams/TEAM_OPTICS.md §1: "the Team icon turns on a dot layer … toggle, not a takeover") was always meant to be the one entry; its presence rode a same-browser BroadcastChannel (TEAMWORK_FRAMEWORK §5 S-8), i.e. it could never see another machine. The post-office layer (§13.12.G) is the first thing that can.
**Decision (user): different machines are the story; the old overlay and the People list are one lens.**

#### §15.15.1 The one icon (Modeller)
`#b-teams` (top pill) is THE Team control; `#team-people-toggle` is removed. It has three states, read from the live adapter, never remembered: **off** (team mode not on, or this browser not in a team) · **pending** (device asked to join, waiting for approval) · **on** (enrolled; the button carries `.on`, `aria-pressed=true`).
Click: not enrolled -> the Team panel (`erp/team_panel.js`, made host-neutral: it talks to `TeamSync || TeamSyncModeller`) with, in this order, **Start a team / Join** (in-panel pairing, §13.9, no phone page), the setup (system default or own repository + key), **Your avatar**, Turn on / off team mode. Enrolled -> a non-modal People popover anchored under the icon (the existing `#team-people` box, repositioned) with a "Team settings" link back to the panel. Turning team mode on reopens the panel by itself after the reload (Modeller host only, `TEAM_PANEL_AUTO_OPEN`; the ERP keeps its two-step behaviour so its witnesses are untouched).
The Modeller adapter (`modeller/team_sync.js`) gains the pairing calls the panel needs — `pairState, found, join, leave, requests, approve, roles, inviteLink` — as its OWN thin host adapter over the same CommStore calls the ERP uses (§13.9 left this choice open; no engine file is edited). A browser with no device gets one (no phone page). `roles()` = one entry (`102`, "Team member"): the Modeller has no AD dictionary and `access()` is open (§15.5).
The old Teams overlay (dots on the Outliner rows, local presence) stays, as an EXTENSION reached from the panel ("Show dots on this machine"); it is not removed and not re-wired here. NAMED LIMIT: its dots still ride the same-browser channel; feeding them from the post-office focus board (so they cover other machines) is the next step, not built.

#### §15.15.2 Built-in avatars
**What:** a fixed built-in set of 24 flat, colourful "personality head" avatars (round, SVG, generated by `common/comm/team_avatars.js` from a small parameter table: background colour, skin tone, hair style + colour, eyes, mouth, accessory — glasses, beard, cap, beanie, headscarf, earrings, bun, curls, ponytail, bald…). Look: the usual flat avatar-pack heads, each clearly a different character. No upload (a picture would need a size cap and an inspection of what is uploaded; ⛔ not built).
**Choice and default:** each person picks one in the panel ("Your avatar", a grid, click = chosen). Before a choice, the default is `a01..a24` by a deterministic hash of the person's `person_uu` — so every person already has a distinct-looking avatar and two devices agree on it with no message.
**How it travels (no engine change, no new op type):** the id string (e.g. `a07`, <= 4 characters) is an optional field `avatar` of the device's signed focus object (`s/<space>/f/<kid>`, team_focus.js v1, §13.12.G.1), published at every Visit EVEN when "Don't show what I'm on" is ticked (an avatar is not "what I'm on"). The signature already covers the object. `collect()` keeps the field; `TeamPeople.rank()` puts the freshest verified id of a person's devices on the row (`avatar`).
**Safety:** only the id travels, never markup; a receiver renders `TeamAvatars.svg(id)` ONLY for an id in its own set, otherwise the person's deterministic default. A forged or unknown id cannot inject anything.
**Where it shows:** People rows (replacing the blue initials circle; initials stay as the accessible name), the heads-up label ("<avatar> founder is editing this element"), the panel, and — film aid, labelled as such — the ring marker of a team block in the overview.
**How many:** no cap on distinct avatars used (24 presets; people may share one by choice). On-screen stacks cap at `TeamAvatars.STACK_MAX = 5` heads then `+N` (matches the 5-entry focus cap). The real ceiling on team size is the post office (measured: GitHub pipe ~31 devices per account at one Visit / 15 s; web relay ~100, §RESUME limits), not graphics. Payload: one 4-character id per device per Visit; the SVG set (~tens of KB) ships with the page, nothing is fetched.

#### §15.15.3 Witness claims (names the issue each proves; written before the code)
| Witness | Proves / disproves | Verdict lines |
|---|---|---|
| `W-AVATARS` (node, `common/tests/witness_avatars.js`) | 24 distinct, well-formed SVGs (parsed; no `<script>`, no `on*=`, no external href); 24 ids pairwise visually distinct by their parameter tuple AND by rendered markup; default is a pure function of `person_uu` (same in, same out; spread over >= 20 of 24 ids for 200 random uuids — not a constant); unknown / forged ids fall back to the default; `stack(list, 5)` = 5 + `+N`. | `§W-AVATARS PASS judged=… ` · VACUOUS if the set is empty |
| `W-AVATAR-TRAVEL` (node, `common/tests/witness_avatar_travel.js`) | the id survives `publish -> collect -> rank` and the row carries it; an unsigned / foreign object is rejected as before; `off:true` still carries the avatar while focus stays empty; a forged id renders the default. | `§W-AVATAR-TRAVEL PASS …` |
| `W-TEAM-ICON-MODELLER` (`modeller/tests/witness_team_icon_modeller.js`, two real browsers, real Modeller, folder pipe + fake-GitHub stand-in as the other Modeller witnesses) | NO `#team-people-toggle` in the DOM (disproves "two icons"); `#b-teams` is the only control; clicking it unpaired opens the panel with Start / Join and no phone page used; A starts, B joins from the invite, A lists B's code + approves in the panel, B Visits -> both `team devices 2`; icon state off -> pending (B) -> on (both) read from `aria-pressed`; the panel's avatar grid: A picks `a07`, after A's and B's Visit B's People row for A shows `a07`, and B's own default equals `defaultFor(B.person_uu)`; heads-up label carries A's avatar; People popover opens from the icon. | `§W-TEAM-ICON-MODELLER PASS …` |
| Regression (quote before/after) | `witness_team_modeller` 33, `witness_people_modeller` 22 (its `#team-people-toggle` clicks move to `#b-teams`), `witness_team_so`, `witness_team_docaction`, `witness_team_desktop`, `witness_team_pill`, `witness_people_strip` 29 (the ERP People rows now carry an avatar), node `common/tests/witness_{people_pure,scope_derive,focus_board}.js`. |

#### §15.15.4 Film (part 3, retake)
Opens with a chapter card **"Team Visibility"**: an ILLUSTRATION (labelled as such on the card: "illustration - not live data") of the building plan with more avatar heads placed on it than the two-person take (up to the 5 + "+N" rule), built from the SAME `team_avatars.js` set (rendered by the page, not drawn by hand). Then the live two-user take as before, now starting at the icon: click -> panel -> Start a team -> invite -> B Join -> A approves -> avatars appear; avatar pick; the blocks, drags and heads-up (with avatar); People list; the wall drag, now shown with the wall highlighted and the dashed start line DURING the drag so the action reads (user: *"The drag a wall does not seem highlighted well on canvas to know it is a dragged action"*). Take checks stay assertion-based (`§FILM_CHECK`); the old `?team=1` entry is gone from the footage.

#### §15.15.5 Results 2026-10-25 — product: bim-ootb PR #2368 (`feat/team-icon-avatars`, sw erp v906 / modeller v159); film part 3 v2
- **Built as specified:** one Team icon (`#b-teams`; `#team-people-toggle` removed), in-panel Start / Join / Approve in the Modeller (`modeller/team_sync.js` pairing calls; a device is created without the phone page), the panel moved to `common/comm/team_panel.js` (host-neutral; Start/Join first, then avatar, people, setup; Close at the top), People popover under the icon, 24 built-in avatars (`common/comm/team_avatars.js`), the id carried as the optional `avatar` field of the signed focus object, shown in People rows, the heads-up label and the panel.
- **Witnesses (logs in `prompts/film_server_dead_modeller_hhs_logs/v2/`):** `§W-AVATARS PASS 13/0` · `§W-AVATAR-TRAVEL PASS 9/0` · `§W-TEAM-ICON-MODELLER PASS 15/0 pageerrors=0` (phoneHits=0). Mutants all red: rank drops avatar (5 fails), resolve accepts any id, publish without the shape check, constant default, avatar not published (2 fails), pending painted as on. Regression after the panel reorder: `team_modeller 33` · `people_modeller 22` · `team_pill 14` · `team_desktop 9` · `people_strip 29` (this one needed its assertion changed: the avatar is an SVG with `data-avatar`, initials are its title); before the reorder also `team_so 19` · `team_docaction 24` · `team_base 22` · `people_pure 39` · `scope_derive 13`; `audit_sw_precache` 0 missing. NOT ours: `witness_focus_board` §FB-GHPIPE fails identically on clean origin/main (it expects the pre-#2365 refusal of the `f/` name).
- **Bugs the new witness / take found (fixed):** (1) `scanInner` returned at once because `ready` had resolved FALSE at an unpaired boot, so a browser that paired after boot never shared a block — the guard is now "is there a store"; (2) the chip's Visit button stayed disabled after joining from the panel; (3) with the setup block first, the Join button sat below a 640 px viewport (the film's real click missed it) — Start/Join now come first; (4) row ids are renumbered by every Visit (again): the recorder resolves ids at the moment of use.
- **Film v2:** `~/Videos/TheServerIsDead_Modeller_part3_HHS_Office_narrated_2026-10-25_v2.mp4` (4:44 = 284.3 s, 7107 frames = silent source; I -16.1 LUFS; longest silence 5.4 s; 44 rows, 36 DETAIL + 8 SHORT, 0 WRONG tones; narration onset vs its pinned reading max 0.46 s). Opens with the chapter card **Team Visibility** (`card_visibility.js`: an ILLUSTRATION, labelled, 11 invented people on the HHS plan, five heads + "+2" on the south wing, drawn with the real avatar set), then the recap card, then the live take starting at the icon: off -> panel -> Turn on (reload, panel reopens) -> Start a team -> invite (blurred) -> B joins (pending) -> A approves -> B Visits (on) -> each picks an avatar on the grid (a02 / a12) -> Visits -> People list under the icon with both avatars; then the wings, blocks (ring markers are the owners' avatars, labelled film aid), three drags, heads-up label with A's avatar, switch-off, and the wall drag with only the wall shown bright and a dashed start line DURING the drag. Take checks 22/22 PASS (`v2/rec.log`), chain 0 failures.
- **Not done / honest:** the older Outliner dots are still the same-browser overlay (reached from the panel: "Show dots on this machine"); feeding them from the focus board is the next step. No avatar upload. During the Move gizmo the Modeller's own ghost/cost note still shows beside the wall (native UI, not hidden).

#### §14.6 update 2026-10-24 — corrected cut v2 (after bim-ootb PR #2360, `rebuildSide` re-seals vanished ids)
- **File:** `~/Videos/TheServerIsDead_ERP_Desktop_narrated_2026-10-24_v2.mp4` (3:14.5; v1 untouched). Re-recorded on bim-ootb main `34d3bcd2` (take `§FILM_REC_VERDICT PASS checks=19 bad=0`); script `prompts/film_narration_server_dead_desktop_v2.tsv`; logs `prompts/film_server_dead_desktop_v2_logs/`; work files `~/Videos/ServerDead_desktop_work_v2/`. Clip cut points are now anchored to the take's own `§FILM_CUE` times (the same offsets as v1).
- **Chain check (new, in the verdict):** `§FILM_CHAIN complete_commits=3 ok=3 fail_or_torn_or_toast_lines=0` → `🟢 chain valid on every Complete commit: no verifyChain=FAIL, no group-torn, no "verify FAIL" toast on either page — commits=3 ok=3 bad=0`. Every `§CRUD process committed` line (A twice, B once) says `verifyChain=ok`; `grep -c "group-torn|verifyChain=FAIL"` on both page logs = 0; a MutationObserver in both pages logs `§FILM_TOAST` if a toast with "verify FAIL" ever appears: none. (The first v2 run's verdict was FAIL only because my own threshold expected 4 commits; fixed to 3, re-recorded; log kept as `rec_first_run_threshold_bug.log`.) The builder refuses to build unless the take is PASS with 0 such lines.
- **Limits card:** the defect bullet is gone; kept stock reservation, document numbers, demo-data edits, no clash chooser, one-cycle trial / key not installed, real-GitHub in-panel pairing and >2 users not run. Narration limits row lost its last sentence; other rows unchanged.
- **Measured on the v2 file:** frames 4861 = silent source 4861; longest silence 3.51 s (`n=-40dB:d=2`); loudness two-pass (loudnorm measure, then linear) **I = -16.1 LUFS**, LRA 3.7; fit 14/14 DETAIL, tone 20 OK / 0 WRONG / 0 INCONCLUSIVE; subtitles at most 3 lines everywhere; one space `4c66d93d1851` on both pages (`§FILM_SPACE` A and B) and the pipe holds exactly that one (`§FILM_PIPE objects=10 spaces=["4c66d93d1851:10"]`).
- **Witnesses on the closing card (re-run on `34d3bcd2`):** `§W-TEAM-DESKTOP PASS 9/0`, `§W-TEAM-DOCACTION PASS 24/0` (was 21: PR #2360 added arms), `§W-TEAM-SO PASS-WITH-INCONCLUSIVE(1) 18/0` (the known CL1 pk-collision precondition did not occur this run; v1's run had 19/0/0).

## §16 The Replication Scriptor — the spine of the Distributed ERP thesis (2026-10-25, user directive) — SPEC ONLY, nothing built

> **User, 2026-10-24/25:** *"…what is missing for ERP or Enterprise Database in this local first world is a replication strategy developer, where a user makes an SQL query which requires certain info from some devices and the system makes such replication rules instead of manually writing each."* · *"…it is a standalone scriptor that generates the scripts that instruct each node or device when and what to send or read."* · *"A true DB query will go to the central server. Ours is like a delayed instruction set as we do not have such server. It will identify who and where has such info and put in data fetching strategy where it is still not realtime, but timely. Thus the SQL query has a reply schedule, ie end of day, periodic.."* · *"This is gold, and the most important spine in the DistributedERP thesis."* · On the research: *"Ink & Switch hard problems will be ours and we have to do some sandbox deeper probe. Briar adding mailbox is my exact backup plan."*

**Spec-first.** No code from this section until the user says go on a step (§16.12). Every sourced claim cites one of the three reports saved with this section: `prompts/prior_art_2026-10-25/01_serverless_transaction_precedent.md` (R1), `…/02_deferred_query_and_scriptor_prior_art.md` (R2), `…/03_relay_engineering_experience.md` (R3). Source quality is stated there per row (most fetches were tool-written digests, not verbatim reads). Inferences are marked *(inference)*.

### §16.0 The statement
§11–§15 built the **carriage**: ops that identify, order and authorise themselves, a post office that only stores bytes (§11.2), admission and conflicts at fold time. Two things were left to a person writing rules by hand, and they are exactly what the user names:
1. **Who holds what** — which data each device replicates, when it sends, when it reads.
2. **How to ask for what you do not hold** — a query that needs another device's data cannot go to a server (there is none), so it becomes a **request with a reply schedule**.

The **Replication Scriptor** is a standalone compiler, run on an admin's device, with no server: it reads the Application Dictionary (AD), the roster, each role's declared needs and the pipes, and **emits per-device plans** (what to publish, fetch, and when) plus a **signed catalog of deferred queries** and **owner assignments** for the few scarce resources (§13.11). Plans travel as signed POLICY ops (§13.12.1) — the post office stays dumb. Deterministic, diffable, and checked by simulation **before** any device sees it. This is the Prime Rule applied to replication: *compile, don't hand-write*.

### §16.0a Doctrine from the Unicenta POS integration (user, 2026-10-25: *"I am a guru on this Unicenta POS story as I built the integration"*)
> *"…with a full seed local, you only need to send a minimal payload across. Even stock checking is not needed on POS side, because admin side has the full picture when an orderline with product and qty sold. Yes POS side has deducted its stocks from each sale, that is for its own info but maybe 2 sources of truth and thus redundant. POS just goes on selling. If it cheats ie under declare, it ends up in trouble as less stocks replenish. This is something i grasp as quantitative methods of Edward Deming… The AD design of having a lookup ID in PK form is a big hint how we need not store core tables. And passing PK/FK is encrypted enough… that is the truth and integrity in minimal form."*
The shape of the Unicenta integration: **up** = order lines (product, qty) from each POS to HQ; **down** = replenishment (product_id, qty) from HQ to the one station that needs it; nothing else crosses. The scriptor's unit is therefore a **flow**, not a table set.
- **FL-1 Seed once, send minimal.** Every device holds the master data (the BASE: dictionary + master tables, hash-pinned, §13.12.I). A flow carries only record identity, references (ids resolved in the receiver's base), measures (qty, amount, date) and codes. Descriptive text is not carried; its meaning lives in the base.
- **FL-2 One place holds the truth per fact class; the point of action declares, the centre derives.** The POS declares sales; HQ derives stock (a sum over declared movements — the thesis sentence in `docs/DistributedERP.md`) and answers with replenishment. A POS-local deduction is an advisory copy. Each fact has one author, so §11.2 "one writer per name" already prevents the conflict. **Reworded 2026-10-25 (§16.18b): the invariant is *one derivation function*, not one place — in a star one device (the hub) runs it; in a mesh every member runs the same deterministic fold and reaches the same result; either way a derived value is never copied from one device to another.**
- **FL-3 Feedback instead of inspection (Deming).** No synchronous stock check and no arbiter for stock: under-declaring starves the declarer of replenishment. *(inference from the user's account)* the "last unit of stock" row of §13.11 then needs no arbiter in this pattern — a stock-out is a business consequence, not an integrity failure. Remaining arbiter cases are listed in the §16.14 amendment.
- **FL-4 Limits to test, not assume.** *(inference)* The incentive holds where the declarer bears the consequence (stock). It does not police cash or value taken outside the system, and it does not detect *over*-declaration; those need an independent flow (payments, a periodic count — the pawn day-end count, `PAWN_FINTECH_SPEC.md` §20.5).
- **FL-5 Ids are pseudonymous, not confidential.** Without the seed an id means nothing — real data minimisation. But ids are small sequential integers, a seed can be public (GardenWorld), and volume and timing stay visible, so flows are still sealed (CL8, §13.4). References to seed rows use the seed key (identical on every device because the base is hash-pinned); references to records created on a device use `<table>_uu` (§11.1).

### §16.1 Why it is the spine (and the evidence it is a real gap)
- Every sync engine whose docs R2 read has the developer hand-write the sync scope (Zero queries, Electric shapes, PowerSync streams, Couchbase sync function, Realm subscriptions, Ditto subscription queries); closure (every reference resolves locally) is "the developer's problem" there (R2 planner half).
- The nearest ancestor that *derives* scope from structure is SQL Server merge replication (join filters generated from FK→PK), which is central, unsigned, has no role/topology model, no pre-rollout check, and documents a closure gap (a late parent does not pull its existing children) (R2).
- Reports across sites are done by aggregating centrally in every local-first/offline ERP-like project R2 found; none asks the data holder.
- **Novelty status (R2, "to our knowledge"):** no exact match for the combination found; each half has a close ancestor (planner: merge replication; deferred query: MIT CarTel/ICEDB; trust: Astrolabe). The search was shallow (no patent-office/CPC search, no ACM DL). Wording rules in §16.10.
- The pawn project already runs the pattern **by hand**: the borrower news board (blinded-tag shards, sealed notes, per-borrower poll period; `~/Projects/ThaiGoldPawn/spec/PAWN_FINTECH_SPEC.md` §25) is a hand-made plan. The scriptor generalises it.

### §16.2 The three artefacts
| Artefact | Content | Carried as |
|---|---|---|
| **Plan** (per device) | tables/row-sets to hold (the closed scope), what to publish, which spaces/tags to fetch, visit cadence and stagger, checkpoint cadence, which heads to compare before fetching | signed POLICY op (§13.12.1) |
| **Catalog** | named, parameterised queries a holder may run for others: SQL template, parameter types, row/byte limit, timeout, schedule classes allowed, expiry | signed by the admin key, in POLICY |
| **Owners** | one named device per scarce resource (last unit of stock, ledger posting, credit limit, batch run, timer — §13.11) and two always-on roles: the **blind mailbox** (stores encrypted bundles, cannot read; Briar-style, §16.9 P7) and the **hub/deputy** (holds plaintext; arbiter and DQ-8 fallback) | POLICY (`desks`/keyclaim machinery §13.12.2) |

### §16.3 Inputs — checked against the AD seed on 2026-10-25
`~/bim-ootb/erp/ad_seed.db` (the copy under `build/erp/ad_seed.db` was a 0-byte file on this date). Read-only counts: `ad_table` 1,004 · `ad_column` 26,161 · reference columns of type Table/TableDir/Search (18/19/30) 1,442 / 4,331 / 3,560 · `ad_ref_table` 243 · `ad_role` 14 · `ad_window` 375 · `ad_tab` 1,135 · `ad_window_access` 4,448 · `ad_val_rule` 332 · `AD_Client_ID` and `AD_Org_ID` columns present on essentially every table.
**Two findings that shape the design:** `ad_table_access` has **1 row** and there is **no `ad_record_access` table** in the seed. So role→data scope must be derived from **window access → tab → table** (what the role can open), not from table-level or record-level access rules. Record-level scope (iDempiere `AD_Record_Access`, `canView` row rules) is **not in the seed** and is an open input (§16.13 Q2).

### §16.4 Scope derivation rules (each becomes a witness, §16.7)
- **SD-1 Roots.** A device's roots = tables behind the windows/tabs its roles may open (`ad_window_access` → `ad_tab` → `ad_table`), plus tables its declared needs name.
- **SD-2 Closure.** From each root follow reference columns (18/19/30, resolved via `ad_ref_table`/`ad_reference_value`) to parent tables, transitively; a replicated row's references must resolve locally. Parent-first order in the plan.
- **SD-3 Partition.** Scope carries the device's `AD_Client_ID` set and `AD_Org_ID` set.
- **SD-4 Over-approximate, never under.** Fetching extra is safe; missing a row silently breaks a query. A need the compiler cannot bound (free subquery, aggregate over all rows, run-time parameter) is labelled **NEEDS-FULL-TABLE** or **NOT-OFFLINE** in the plan — never silently skipped.
- **SD-5 Late parent / late child.** The merge-replication gap (R2) must not occur: an op whose reference is not yet local is parked, not dropped (the waiting-ops mechanism, §12.6, is the existing answer; the scriptor's witness proves it holds for every derived scope).
- **SD-6 Determinism.** Same inputs → byte-identical plan. A change in AD/roles/roster produces a plan *diff*, which is the review artefact.

### §16.5 Replicate or ask (the cost decision)
Per declared need: **replicate** the rows when the device needs them often, offline, or in small volume (a counter's customer's open tickets); **ask** (deferred query) when the need is occasional, aggregate, or large (head office's monthly NPL total). Inputs: frequency, offline requirement, estimated volume, tolerated staleness, pipe budget (§16.7 W-SCRIPTOR-BUDGET). **The thresholds are branch choosers with defaults the user sets — no number is invented here** (⛔ §16.13 Q3).

### §16.6 Deferred queries — the Catalog
A query for data not on the device becomes a **request op**, not a call. Shape (extends §11.3 envelope; field names provisional): `QUERY {id, catalog_entry, params, to: holder-set, reply_by: schedule, reply_to: requester kid}`; answered by a `QUERY_REPLY {id, holder, result_sealed_to_requester, as_of:{holder_kid, head_hash, seq, holder_time}, sources}`. Local queries stay instant; only data the device does not hold is deferred (§13.10 stance).
- **DQ-1 Catalog only.** A peer executes **only** registered catalog entries; never free SQL from another device (remote query = remote code execution). Requester picks an entry and fills parameters.
- **DQ-2 Signed, expiring, revocable.** Entries are signed by the admin key in POLICY and carry an expiry; **explicit revoke** is a POLICY op. (Astrolabe's own text: certificates "cannot be easily revoked until they expire" — R2.)
- **DQ-3 Holder-side access check.** The holder runs the entry against its own SQLite **under its own role check** (the `MRole.canUpdate` port, §11.6 lineage); a refusal is a valid answer state.
- **DQ-4 Attributed, not proven.** The reply is signed by the holder and stamped with the holder's head at execution time. It proves *who said it, about which state*, not that it is true (R1/R2: Astrolabe admits authorised agents can lie).
- **DQ-5 Schedule classes.** `once` · `at-next-visit` · `end-of-day` (holder's local day, branch timezone) · `periodic(N)` · `on-change`. EODA (§11.18) is the first, hand-made, case. Vocabulary for once/periodic/at-time is old (Oracle MV refresh, SSRS subscriptions, TinyDB `SAMPLE PERIOD`); the claim is not the clause but the serverless signed carriage (R2).
- **DQ-6 Bounded.** Every entry has a row limit, byte limit and timeout.
- **DQ-7 Combined answers show per-source as-of.** A sum over ten shops mixes ten moments; the report shows each holder's as-of and never labels the total "as of" one instant.
- **DQ-8 Unanswered is a state.** `pending → answered | expired | refused`, visible to the requester; expiry has a fallback holder if configured — a **deputy** (a trusted always-on replica that holds the data and may read it, §16.2), never the blind mailbox, which cannot read content and so cannot answer a query.
- **DQ-9 Quota.** Requests are ops and cost pipe pushes; the plan caps requests per requester per period.

### §16.7 Plan verification — simulate before rollout (each names the issue it proves; INCONCLUSIVE, never PASS, when nothing was judged)
Harness: the existing office-day simulator (`scripts/sim_comm_office_day.js`, §13.10) extended to run *generated* plans.
| Witness | Issue it proves or disproves | Verdict rules |
|---|---|---|
| `W-SCRIPTOR-DETERMINISM` | same inputs give byte-identical plans; a one-column AD change yields a minimal diff | NO-OP if the diff is empty after a real change |
| `W-SCRIPTOR-CLOSURE` | every reference of every replicated row resolves on that device | VACUOUS if the replicated set is empty |
| `W-SCRIPTOR-LEAK-PLAN` | the **plan** never tells a device to fetch a table outside its role scope | runs now |
| `W-SCRIPTOR-LEAK-BYTES` | the device holds **no row** outside scope | **INCONCLUSIVE until audience keys exist** — today every member holds the space key (§13.11 gap 9) |
| `W-SCRIPTOR-BUDGET` | pushes/min and requests/h stay under the pipe's rated caps for N devices at the plan's cadence | INCONCLUSIVE for a pipe with no rated cap in `cl_pipe.caps` |
| `W-SCRIPTOR-CONVERGE` | devices following the generated plans reach the same derived-ledger hash (§13.12.J.3 style) | control run with a broken plan must differ |
| `W-CATALOG-ONLY` | a peer asked to run a non-catalog query refuses; a revoked/expired entry refuses | |
| `W-DQ-ASOF` | each reply's as-of equals the holder's head at execution | |
| `W-DQ-STATES` | pending/answered/expired/refused all reachable; a holder offline past `reply_by` shows expired | |
| `W-SCRIPTOR-MUTANTS` | break each SD-/DQ- rule in a copy; **every** mutant must turn at least one witness red (the pawn `tools/mutate_news_up.js` pattern) | a surviving mutant = a hole |

### §16.8 What others learned → obligations (the digest; building blocks, not trivia)
| # | Lesson (source) | Obligation here | Lands in | Witness / probe |
|---|---|---|---|---|
| 1 | **Relays turned out not to be dumb** — Nostr: a post sits on 34.6 relays on average, 98.2 % of download traffic is redundant, ~20 % of relays are down >40 % of the time (Wei & Tyson, arXiv 2402.05709, R3); Delta Chat built its own "chatmail" relays because ordinary providers block/scan/throttle (R3) | the post-office contract states retention, write authentication, quota and a "what am I missing" query; **2–3 mirrors**, not flood replication | §11.2 contract + plan (`mirrors`) | `W-SCRIPTOR-BUDGET`; P7 |
| 2 | **Every pure-P2P system added an always-on helper** — Briar Mailbox, SSB pubs/rooms, Ditto Server, Anytype sync nodes, Radicle seeds (R3). *User: Briar's Mailbox is the exact backup plan.* | name the **mailbox device** role: an always-on, powered device that holds copies of bundles and answers "what am I missing"; cannot read content (**blind mailbox**); second pipe if the main pipe dies. The arbiter (§13.11) and the DQ-8 fallback need plaintext, so they are a **different role — the hub/deputy** (a trusted always-on replica, in effect a server the owner runs; stated plainly in §16.14). One physical device may hold both roles only if the owner accepts that it can read | POLICY role, §16.2 | P7 |
| 3 | **One identity on two devices forks the log** — SSB handbook (R3) | one chain per device (already §11.3/§11.5); a **restored backup must not reuse sequence numbers** → restore issues a new kid/epoch (KEYCLAIM/REKEY, §13.12.2) | §11.5, §13.12.2 | P5 |
| 4 | **History growth is the cost that persists at small scale** — SSB initial sync 12 h → 55 min with the DB halved (Staltz); Automerge once took ~40 s to load because sync sent changes one by one (R3) | CHECKPOINT (built, §13.12.3) cadence is set by the plan; measure cold start from checkpoint vs from zero | §13.12.3 | P1 |
| 5 | **Version skew is the top support pain** — Anytype "IncompatibleVersion" threads; Ink & Switch: schema evolution with no central authority is unsolved (R3) | `W-OP-VERSIONS` (design only, §13.12.J.2) must land before plans are rolled out to a mixed fleet; the plan carries each device's schema/rules version and the scriptor emits a **skew report** | §13.12.J.2 | P2 |
| 6 | **Debugging without a central log** — Anytype ships `anysync netcheck` (R3) | a catalog entry `diag.netcheck` (head, pipes reachable, last visit, version) answerable by any device; the Gmail visit log (§12.14) is the passive counterpart | §16.6 | `W-DQ-STATES` |
| 7 | **Channel limits bind first** — GitHub recommends ≤6 pushes/min per repo; 30 devices pushing every 5 min is exactly 6/min *(arithmetic, R3)*; consumer Apps Script: 100 email recipients/day (R3) | the scriptor computes load from N, cadence and DQ traffic and staggers visits (§13.12.1 stagger); refuses a plan over a rated cap | §13.10, §11.16 | `W-SCRIPTOR-BUDGET` |
| 8 | **A shared database file is not a transport** — SQLite docs; Syncthing makes conflict copies and never merges (R3) | already doctrine (per-device SQLite, events as the unit); keep it out of the plan vocabulary | §11.11 | — |
| 9 | **Deletion is advisory on relays** — Nostr NIP-09 (R3) | corrections are compensating events; tombstone-wins (§13.11 row 10) | §13.11 | — |
| 10 | **Restore can lose or resurrect data** — Actual Budget "reset sync from the file you treat as true" lost a budget and brought back a deleted one (user report, R3) | restore = verify chains, pick the longer chain per ledger, never merge silently (pawn §19.3 rule); the journal receipts show exposure | pawn §19, §13.12.3 | P5 |
| 11 | **Astrolabe's weaknesses** — certificates revocable only by expiry; authorised agents can lie (R2) | DQ-2 explicit revoke; DQ-4 attributed not proven | §16.6 | `W-CATALOG-ONLY` |
| 12 | **Ink & Switch's four hard problems — history growth, NAT traversal, schema evolution without a central authority, permissions** (R3) *User: these will be ours.* | #1 → P1, #3 → P2, #4 → P3. #2 NAT traversal is **avoided by design** (devices never connect; they visit a pipe) — avoided, not solved *(inference)* | §16.9 | P1–P3 |

### §16.9 Sandbox probes (the "deeper probe" — each measured in a sandbox, no real accounts, no real GitHub budget; results recorded as numbers, thresholds only where a cited source gives a limit)
- **P1 History growth.** Generate a multi-year ledger for one shop (pawn events at the volume the partner states, or a stated assumption flagged as one). Measure: fold-from-zero time, cold start from a CHECKPOINT, bundle count, bytes per year, index rebuild. *Proves/disproves:* that history length stays tolerable on a phone. *Verdict:* numbers + the device class they were measured on; INCONCLUSIVE if only node was measured (phone not run — §13 "real-phone measurements" is a ⛔ user-owned item).
- **P2 Schema evolution, mixed fleet.** Three devices on versions N, N+1, N+2 sharing one log; apply upcasters (§13.12.J.2). *Proves/disproves:* that an old device parks (not corrupts) ops it cannot read and a new device never loses an old op.
- **P3 Permissions.** Devices with different roles under audience keys (not built). *Proves/disproves:* that read isolation holds at the **byte** level; today the plan-level check only (`W-SCRIPTOR-LEAK-PLAN`).
- **P4 Closure on the real AD.** Derive scope for each of the 14 roles in `ad_seed.db` (SD-1…SD-5) and run `W-SCRIPTOR-CLOSURE`. *Proves/disproves:* that the AD is rich enough (§16.3: `ad_table_access` 1 row, no record access) — expect NEEDS-FULL-TABLE labels; count them.
- **P5 Restore fork.** Restore an old backup onto a device that already issued N ops; attempt to continue. *Proves/disproves:* that a restore cannot silently re-issue sequence numbers or ticket numbers.
- **P6 Channel budget.** Local folder pipe with a rate cap equal to GitHub's recommended 6 pushes/min; N = 6/12/24/30 devices at the plan's cadence. *Proves/disproves:* the scriptor's stagger keeps under the cap and cold-start fan-in does not burst.
- **P7 Mailbox-device failover (Briar plan).** Designate the mailbox device; kill the main pipe; kill the mailbox device. *Proves/disproves:* what stops, what degrades, how long until a visit heals it; DQ-8 fallback fires.

### §16.10 What we may claim (R2) — and what not
- **May:** "To our knowledge we found no system, paper or patent combining (a) a serverless compiler that turns schema, roles and topology into signed per-device publish/fetch plans, and (b) a signed catalog of parameterised queries answered later by the data holder under its own access check with an as-of stamp over a passive carrier."
- **Must distinguish from CarTel/ICEDB** (MIT; `RATE` clause, holder-side execution, delivery at next contact): control plane (peer-addressed, no portal/sink), trust (signed catalog and replies), as-of (holder-attested, not synced clocks) — R2. R2 read only the ICEDB thesis abstract.
- **Must not:** say "first"; call the catalog or the schedule clause new (Zero named queries, ORCHESTRA templates, TinyDB, Oracle, SSRS, a 1991 patent — R2); claim the hypothesis "cheap AI-assisted coding makes this feasible" — R2 found no support for it.
- Unchecked, most likely to hold a closer hit: Cimbiosys, SymmetricDS, GraphQL persisted queries / signed stored procedures, MobiLink, Couchbase Lite (R2). A CPC-class patent search has not been run.

### §16.11 What the scriptor does NOT close, and the new risk it adds
- It does not arbitrate scarce resources, fork, restore rollback, owner re-signing, or the legal position — R1; §13.11 stands.
- **New trust root: the key that signs plans and the catalog.** Its compromise rewrites every device's behaviour. Needs a stated answer (rotation, threshold signing, or one-writer-per-space) — §16.13 Q1. *(inference)*
- A generated plan is only as good as the AD; record-level role rules are missing from the seed (§16.3).

### §16.12 Build order (spec-first; engine steps are queued **one at a time** — an engine file edited by two agents at once is the real collision risk, §RESUME lesson 5)
S1 scope derivation for **one role** on `ad_seed.db` + `W-SCRIPTOR-CLOSURE`/`DETERMINISM` (read-only, no engine change; P4 starts here) → S2 plan format + `W-SCRIPTOR-BUDGET`/`LEAK-PLAN` → S3 run generated plans in the office-day simulator (`W-SCRIPTOR-CONVERGE`) → S4 catalog + `QUERY`/`QUERY_REPLY` ops in the engine (`W-CATALOG-ONLY`, `W-DQ-ASOF`, `W-DQ-STATES`) → S5 EODA (§11.18) re-expressed as the first catalog entry → S6 probes P1–P3, P5–P7 → S7 `W-SCRIPTOR-MUTANTS`. A fresh agent's job at each step: **implement the rule literally first, then compare to this text** (the way the §13.12.H spec error was found).

### §16.13 Open — user-owned (⛔) questions
1. **Who signs plans and the catalog**, and how that key rotates (§16.11).
2. **Record-level role scope:** the seed has none; do we port iDempiere `AD_Record_Access` into the scriptor's input, or declare per-device needs by hand for those cases?
3. **Replicate-vs-ask thresholds** (§16.5) — branch choosers; what defaults?
4. Run the unfinished prior-art checks (CPC patent search; Cimbiosys, SymmetricDS, persisted queries) before any public novelty wording?
5. Real-phone measurements for P1 (also owed to §13 / the news board).
6. **Which closure variant defines the base** (V-PARENT / V-MAND / V-ALL; with or without audit columns) — S1 prints all; pick after seeing the sizes.
7. **Replenishment carrier:** is `M_MovementLine` the right iDempiere record for HQ→station replenishment (Unicenta sent product_id + qty), or `M_Requisition`/`M_InOut`?
*Legal and regulatory questions are deliberately out of this section (user, 2026-10-25); they stay in R1.*

### §16.14 Showstopper review of the material (2026-10-25, user: *"Are there any showstoppers they pointing to?"*) — read this before building S4
**Verdict.** R1–R3 point to **no showstopper for the owner-operated small-shop case**. They point to six *conditional blockers*, ranked, and a wording consequence. Evidence limits: R1–R3 are shallow (digests, no patent-office search); "none found" is weak evidence.
| # | Blocker | Why (source) | Blocks what | Cheapest first test |
|---|---|---|---|---|
| B1 | **The arbiter is a server in all but name.** Every system in R1 has one (Corda notary, Fabric orderer, card processor, git host, quorum); R3: every pure-P2P system added an always-on helper | scarce resources (§13.11: stock, ledger posting, credit, batch, timers) need one writer; the hub/deputy holds plaintext | the *wording* "serverless": say **"no server we operate that holds the truth; one owner-designated always-on hub for the few scarce resources"** — never "no server at all" | n/a (wording) |
| B2 | **Event versioning must land before any fleet rollout.** The scriptor makes plan/AD/catalog changes routine, so version skew becomes routine | R3: version skew is the top support pain (Anytype "IncompatibleVersion"); Ink & Switch: schema evolution without a central authority is unsolved. `W-OP-VERSIONS` is design only (§13.12.J.2) | §16.12 S4 onward in production | P2 |
| B3 | **No byte-level read isolation yet.** Every member holds the space key (§13.11 gap 9; audience keys not built) | plans are advisory to an honest client; a modified client reads everything | any multi-role claim (cashier vs owner vs head office); fine for one owner who trusts their own devices | `W-SCRIPTOR-LEAK-BYTES` (INCONCLUSIVE today), P3 |
| B4 | **AD may be too thin to derive scope.** Seed has 1 `ad_table_access` row and no record-access table (§16.3) | if most needs resolve to NEEDS-FULL-TABLE the scriptor degrades to "replicate everything" — acceptable at small-shop volume, pointless at enterprise volume | the *value* of the scriptor beyond one shop | **P4 / S1 — done 2026-10-25, see §16.15a** |
| B5 | **The plan-signing key is a single root of trust** (§16.11) | compromise rewrites every device's behaviour; Astrolabe's revocation weakness (R2) | production rollout | design answer (§16.13 Q1) |
| B6 | **Restore/fork.** A restored backup can re-issue sequence numbers or ticket numbers; SSB forks are fatal (R1/R3) | hash chains show tampering, not agreement | trust in any restored device | P5 |
**B1 amendment (2026-10-25, FL-2/FL-3):** under the Unicenta pattern the *stock* case leaves the arbiter list. Still needing a single writer or an independent flow: document-number allocation (station-owned ranges, §13.12.F), the ledger poster, credit limits, batch runs, timers, and anything that moves cash or value outside the declare-and-replenish loop (FL-4).
**Costs, not blockers (measured numbers exist or are cheap to get):** history growth on a phone (P1; SSB 12 h → 55 min is the warning, CHECKPOINT is the answer); channel budget (30 devices × 5 min = GitHub's recommended 6 pushes/min — arithmetic; P6); support without a central log (`diag.netcheck`, §16.8 row 6); email quotas (Apps Script consumer: 100 recipients/day); advisory deletion on relays (compensating events).
**Two structural truths the team should hear first.** (1) *Serverless* here means *no shared database server*, **not** no always-on role — see B1; the mailbox (blind, Briar-style) and the hub/deputy (arbiter, reads plaintext) are two different roles (corrected 2026-10-25: an earlier draft merged them, which cannot work since a blind mailbox cannot answer queries or arbitrate). (2) *(inference, to verify with the partner)* for a pawn shop the **physical world is a natural arbiter**: a pledged item is in one place and the vault count is physical, so double-pledge and last-unit cases are largely serialised by custody; ticket numbers use station-owned ranges (§13.12.F). The general-ERP claim does not get this help.
**Outside this section but binary:** whether a licensed lender may keep its authoritative record on devices (R1; parked by the user).

### §16.15 S1 build spec — flows (2026-10-25, user: *"rewrite S1 around the flows"*; supersedes the first S1 draft, which asked for the closure of a whole role and so measured the maximum case; spec BEFORE code; Witnesses `W-FLOW-*` and `W-SCRIPTOR-*`; files `build/scriptor/scope.js` (edge rules, kept), `build/scriptor/flow.js`, `scripts/witness_scriptor_s1.js`)
**Question S1 answers (B4, §16.14):** can the AD alone derive, for a **declared flow**, (a) the minimal payload, (b) the references the receiver must already hold, and (c) the columns the receiver has to reconstruct? And how small is that next to "replicate the role's tables"? **Read-only, table/column level; no engine change, no network.** Value-level and row-level checks need business data the AD does not hold → printed **INCONCLUSIVE**, never PASS.
**AD used:** `build/erp/ad_full.db` (the one the comm witnesses use). Edge rules ER-1..ER-5 are unchanged and cited from iDempiere: `MLookupFactory.getLookupInfo` (`MLookupFactory.java:192-214`), `getLookup_TableDir`, `MQuery.getZoomColumnName/getZoomTableName` — ER-1 Table/Search with reference value → `ad_ref_table`; ER-2 TableDir (and Table/Search without reference value) → table named by the column with the fixed renames (SalesRep_ID→AD_User_ID, C_DocTypeTarget_ID→C_DocType_ID, Bill_BPartner_ID→C_BPartner_ID, …); ER-3 List → no table edge; ER-4 typed lookups, table read from the lookup class: Locator→`M_Locator` (`MLocatorLookup.java:384`), Location→`C_Location` (`MLocationLookup.java:142-147`), Account→`C_ValidCombination` (`MAccountLookup.java:58`), PAttribute→`M_AttributeSetInstance` (`MPAttributeLookup.java:130`); Image, Assignment, Payment: lookup classes not read → UNRESOLVED(typed-lookup), never guessed; ER-5 RecordID/RecordUU → UNBOUNDED.
**A flow declaration** (human-written, the only hand input): `{name, dir: UP|DOWN, table, carries:[column names], schedule, from, to}`. Implicit and always reported: the record identity (`<table>_uu`, §11.1) and the partition columns (`AD_Client_ID`, `AD_Org_ID`, SD-3).
**Column classes (from `AD_Column.AD_Reference_ID`):** KEY (`IsKey`/identity) · REF (resolved by ER-1..ER-3, with its target table) · MEASURE (Integer 11, Amount 12, Number 22, Quantity 29, CostPrice 37) · DATE (15, 16, 24) · FLAG (YesNo 20) · CODE (List 17) · TEXT (String 10, Text 14, Memo 34, TextLong 36, FileName/Path/URL 38-40, PrintName 42) · OTHER (anything else, listed, not carried). FL-1: **TEXT is never carried unless the declaration names it.**
**Derived for each flow:** the payload (columns by class) · the REF targets = the **base requirement** (what the receiver must hold, §13.12.I) · (which targets are seed rows vs device-created, hence seed key vs `<table>_uu` per FL-5, is a property of the declared base — §16.13 Q8; S1 does not guess it) · **mandatory-uncarried columns** (`IsMandatory='Y'`, no `DefaultValue`, not carried, not audit/partition) = what the receiver must reconstruct or default · UNRESOLVED/UNBOUNDED references among the carried columns.
**Test flows (the Unicenta shape, expressed in iDempiere AD terms):** F1 UP `C_OrderLine` carrying product and quantity (`M_Product_ID`, `QtyEntered`, plus the declared minimum to make the line meaningful: `C_Order_ID`, `C_UOM_ID`) — POS→HQ, end of day. F2 DOWN replenishment as `M_MovementLine` carrying `M_Product_ID`, `MovementQty`, `M_Locator_ID`, `M_LocatorTo_ID` — HQ→station. **⛔ the choice of `M_MovementLine` as the replenishment carrier is mine, not the user's** (§16.13 Q7). F3 (control) the same table declared with *every* column — must show the narrowing numbers collapse.
**Base requirement closure.** The base must hold the REF targets and, to be usable, what those rows point to. Reported under V-PARENT / V-MAND / V-ALL (§16.13 Q6) with and without partition/audit columns, and with and without role gating (`canView(userLevel, accesslevel)`, `ad_access.js`, from `MRole.canView:2422-2465`). **Narrowing metrics (printed, no threshold):** payload columns ÷ table columns · base tables ÷ all tables · and, as the diagnostic maximum, the whole-role closure of role 103 *GardenWorld User* from `scope.js` (the "server-full" end).
**Witnesses (each names the issue; INCONCLUSIVE ≠ PASS; VACUOUS/NO-OP are separate verdicts):**
- `W-FLOW-DECLARED` — every declared table/column exists in the AD (a typo is red).
- `W-FLOW-CLASSIFY` — known answers: `C_OrderLine.M_Product_ID`→REF→`M_Product`; `C_OrderLine.QtyEntered`→MEASURE; `C_OrderLine.Description`→TEXT; `C_Order.SalesRep_ID`→REF→`AD_User`; no carried column is OTHER (else listed).
- `W-FLOW-REFS` — the ER-1 and ER-2 edge sets equal an **independent SQL recomputation** (different code path); VACUOUS if the AD has no such rows.
- `W-FLOW-MINIMAL` — F1/F2 carry no TEXT, carry fewer columns than the table, and F3 (every column) carries more; NO-OP if F1 equals F3.
- `W-FLOW-MANDATORY` — the mandatory-uncarried list is non-empty for F1 and becomes empty in a control flow that carries all mandatory columns (proves the check can fire).
- `W-FLOW-BASE` — every REF target of every flow is in the reported base requirement; closure sizes printed.
- `W-SCRIPTOR-DETERMINISM` — two runs → identical canonical sha256; changing one carried column changes it (else NO-OP).
- `W-SCRIPTOR-MUTANTS` — in-process: drop ER-1 · drop ER-2 · ignore `IsActive` · treat TEXT as MEASURE · skip role gating. Each must turn ≥1 witness red; a survivor is printed as a hole (and `ignoreActive` is INCONCLUSIVE if the AD has no inactive rows to expose it).
- Value/row-level closure → **INCONCLUSIVE (no business data in the AD)**.
**Output:** `§S1` log lines at `build/scriptor/s1.log`: per flow, payload columns by class, REF targets, mandatory-uncarried count and names, UNRESOLVED/UNBOUNDED among carried, base-requirement closure sizes, the narrowing ratios, the whole-role diagnostic.
8. **What is in the base** (the seed every device holds): S1 derives the *minimum* the flows require; the actual seed list, and which references therefore use the seed key vs `<table>_uu` (FL-5), is a declaration — and Image/Assignment/Payment lookups (§16.15 ER-4) still need their lookup classes read.

#### §16.15a S1 results (2026-10-25; run `node scripts/witness_scriptor_s1.js`, log `build/scriptor/s1.log`, read in full) — `§S1_VERDICT PASS judged=14 fails=0 inconclusive=1`
- **AD:** `build/erp/ad_full.db` — 1,076 tables (1,003 active), 26,519 columns (375 inactive), 5 roles. Station role for the test: 103 *GardenWorld User* (UserLevel `  O`).
- **Edge rules checked against an independent SQL recomputation** (different code path, same author — not a second pair of eyes): ER-1 3,783 = 3,783 · ER-2 5,173 = 5,173 · ER-4 357 = 357, zero differences. Known answers 7/7 (product→`M_Product`, qty→MEASURE, description→TEXT, `SalesRep_ID`→`AD_User`, `C_DocTypeTarget_ID`→`C_DocType`, `C_Invoice.C_BPartner_ID`→`C_BPartner`, `M_MovementLine.M_Locator_ID`→`M_Locator`).
- **F1 (POS→HQ order line, EOD):** carries 4 columns (`C_Order_ID`, `M_Product_ID`, `QtyEntered`, `C_UOM_ID`) + 3 implicit (`C_OrderLine_UU`, `AD_Client_ID`, `AD_Org_ID`) = **7 of the table's 60 columns (11.7 %)**, no TEXT. Base requirement: `C_Order`, `C_UOM`, `M_Product`.
- **F2 (HQ→station replenishment, on change; carrier `M_MovementLine` is my choice, Q7):** 8 of 29 columns (27.6 %). Base requirement: `M_Movement`, `M_Product`, `M_Locator`.
- **Base requirement closure (F1+F2), role 103:** V-PARENT **5** tables · V-MAND **15** · V-ALL gated **75 of 1,003 (7.5 %)** · V-ALL ungated 150. Role gating (`canView`) blocks 30 tables at V-ALL.
- **The maximum case, for contrast (the first-draft question):** whole-role closure for role 103 = **450 gated / 571 ungated of 1,003 tables (45 % / 57 %)** — from 254 windows, 645 tabs, 464 root tables. Closure adds only ~1 % over the roots (V-PARENT 445 = V-MAND 445 ≈ roots); **the breadth comes from "role = a set of windows", not from the reference graph.**
- **What the F1 minimal payload leaves for the receiver to reconstruct:** 13 mandatory columns without an AD default — `C_Tax_ID`, `FreightAmt`, `LineNetAmt`, `M_AttributeSetInstance_ID`, `PriceActual`, `PriceEntered`, `PriceLimit`, `PriceList`, `Processed`, `QtyDelivered`, `QtyInvoiced`, `QtyLostSales`, `QtyReserved`; F2 leaves `Processed`. *(inference)* This is an upper bound (the database may default some) and it means **the receiver must run the same document logic to complete a line** — i.e. ship the verb and its minimal arguments and replay deterministically on the other side (the lever in `docs/LocalFirstPriorArt.md`). It does not make the flow bigger on the wire.
- **Still unresolved, stated:** globally 51 unresolved references (Image 33, Assignment 10, Payment 2 typed lookups whose classes were not read; 6 `name-no-table`, all pointing at views or tables absent from this AD, e.g. `M_Promotion`) and 47 UNBOUNDED record-id references (18 within role 103's scope).
- **Mutants:** dropping ER-1, ER-2, ER-4, ignoring `IsActive`, or treating TEXT as MEASURE each turn ≥1 arm red; skipping role gating lets 161 tables the role cannot view into the base. No survivor.
- **INCONCLUSIVE, stated:** value-level and row-level closure (the AD holds no business data). The defaults point above is also unverified against the database.
- **Reading for blocker B4 (§16.14):** the AD **can** derive a flow's payload, its reference targets and the base it requires, with iDempiere's own rules and no hand-written scope. The narrowing is large when the unit is a **flow** (≈12 % of the columns, ≈7.5 % of the tables) and small when the unit is a **role** (≈45 %). B4 is therefore answered for the table/column level: scope must be declared per flow, not derived per role. What S1 cannot tell is row volume.

### §16.16 The flow table — replication declared in ONE place, generic code reads it (2026-10-25, user: *"Replication table can come in handy to abstract such rather than custom make each… Replication sits in one place saying what a role can send over and receive back"* · *"I don't think it will bloat, as we can make same abstract code"*) — spec BEFORE code; files `build/scriptor/flows.json` (the rows), `build/scriptor/compile.js` (the one generic compiler); Witnesses `W-FLOW-NO-DERIVED`, `W-FLOW-ZERO-CODE`
**Reuse what the AD already has.** `AD_ReplicationStrategy` (id 100 "POS") types 472 tables by `ReplicationType` (Reference 205, Merge 47, Local 220; meanings from `ad_ref_list` 126: Local, Merge ↔, Reference →, Broadcast ↔↔). From the columns present (`ad_replicationtable`: strategy, table, type, entity type, description) it has **no role, direction, column set, schedule or key**. The flow table adds exactly those, in the same AD style (rows, generated form, no custom UI) — provisional name `AD_ReplicationFlow`:
| Column | Meaning |
|---|---|
| `AD_ReplicationStrategy_ID` | the strategy it refines (100 POS); table-level type R/M/L is **read from it, not repeated** |
| `AD_Role_ID` | who sends/receives (the branch role); the other end is implicit (star, §16.0a) |
| `AD_Table_ID` | the record type |
| `Direction` | UP (the role sends) · DOWN (the role receives) |
| `Carries` | the declared columns (facts). Empty = ask the compiler for **candidates** (§ below), which a human must confirm |
| `GroupKey` | natural key that groups lines into a document the receiver authors itself (e.g. POSStation/Date/Order#, a namespace-partitioned id — §16.16a) — may name a field that is not an AD column |
| `Schedule` | at-visit · end-of-day · periodic(N) · on-change |
| `IsActive` | |
**Guards the compiler applies to EVERY row — no per-flow code** (this is where the "no bloat" claim lives or dies):
- **G1 declared** — every named table/column exists in the AD.
- **G2 no TEXT** unless named (FL-1).
- **G3 ghost guard (FL-6 below)** — no carried column is *derived*, where derived is read from the window definition: the column has `AD_Field` rows and **every one is `IsReadOnly='Y'`** (parent link, key, identity and partition columns exempt). The AD tells us what a human types and what the system computes; a read-only field is the system's own computation and must not cross.
- **G4 base typing** — each REF target is typed from the strategy (R = seed it once; M = transactional, must itself travel earlier or be authored locally; L/unlisted = flagged).
- **G5 resolution complete** — any carried reference the edge rules cannot resolve makes the verdict INCONCLUSIVE.
- **G6 receiver-authored** — mandatory columns not carried are listed as what the receiver authors from its own base (not replayed).
**FL-6 Declare facts, derive locally, never copy derived state (user, 2026-10-25: *"Local-first has full ability to do its own lookup but not replaying what another has done as it may result in ghosts of truth"*).** The receiver authors its own record from the declared facts under its own rules; a derived value (a computed amount, a stock level, a balance) is computed in exactly one place. This **corrects §16.15a**, which said the receiver "must run the same document logic… replay deterministically": that is replay and creates a second truth. The ghost test is not synchronisation: two derivations from the same declared facts must agree on the declared invariants, and a mismatch is reported as a defect (the pawn W-PAWN-DUN-1 pattern). Consequences already visible in the AD: carrying `M_MovementLine.MovementQty` (read-only in the *Inventory Move* tab; derived by callout from `QtyEntered` and `C_UOM_ID`) is a ghost — F2 should carry `QtyEntered` and `C_UOM_ID`; F1 must not carry `C_Order_ID` (the POS header is the POS's own; admin authors the order header from the line group key).
**Candidates (what the AD can and cannot choose).** From the tab definition the compiler can *propose* the human-entered inputs (displayed, not read-only, not TEXT). It cannot choose "product and quantity only": on *Sales Order › Order Line* tab 187 price, tax, freight and others are also editable, and the fact that price and tax come from the receiver's base is **business knowledge**, not dictionary data. So a flow row stays one declared line of `Carries`; the compiler checks it, it does not invent it.
**`W-FLOW-NO-DERIVED`** — F1 and F2 carry no column the AD marks derived. *Control with teeth:* a row that declares `MovementQty` must be flagged (else the guard is dead). VACUOUS if the table has no field rows.
**`W-FLOW-ZERO-CODE` — the bloat test (AD-LAYER LAW 6 / Ninja test, applied to replication).** Add flows, **by rows only**, for tables the compiler code has never been written for. Pass requires all of: (1) the code files contain **no** table name used by the rows (grep = 0); (2) every new row yields a payload spec with G1-G6 evaluated and no error; (3) the compiler's code hash is identical before and after the rows are added; (4) a deliberately wrong row (typo'd column) turns red, so the test can fail; (5) the numbers are printed — lines of generic code, rows per flow, lines per flow — so "no bloat" is a measurement, not a claim. **Deletion budget** (AD-LAYER LAW 4): record, per flow, the custom endpoint or handler it replaces (§16.17 column "replaces").

### §16.16a Ticket identity (user, 2026-10-25: *"the POS Order header in the Unicenta integration reconstructed as always unique POSStation/Date/Order#"*)
A natural key made of owner-assigned parts is a **namespace-partitioned id**; Bailis et al. (R1) find uniqueness and sequential ids need coordination *except* namespace-partitioned ids. It gives idempotent delivery (the same ticket twice is one key) and lets the receiver author the header from the key. *(inference)* It also turns restore-rollback into a **detectable** event: a restored station re-issuing an order number produces the same key with different content, which admin flags by content hash; the key alone does not prevent it.

### §16.16b Prototype results — can one generic compiler carry it? (2026-10-25; `node scripts/witness_scriptor_s1.js`, log `build/scriptor/s1.log`, read in full) — `§S1_VERDICT PASS judged=22 fails=0 inconclusive=2`
**Supersedes the F1/F2 numbers of §16.15a** (F1 and F2 were redeclared as rows in `build/scriptor/flows.json` per FL-6).
- **Corrected flows.** F1 carries `M_Product_ID`, `QtyEntered`, `C_UOM_ID` → **6 of 60 columns (10.0 %)**, base requirement `C_UOM`, `M_Product` only (no `C_Order`: admin authors the header from the group key `POSStation/Date/Order#`). F2 carries `M_Product_ID`, `M_Locator_ID`, `M_LocatorTo_ID`, `QtyEntered`, `C_UOM_ID` → 8 of 29 (27.6 %); `MovementQty` removed as derived. Base requirement closure for F1+F2, role 103: V-PARENT **3**, V-MAND **7**, V-ALL gated **39 of 1,003 (3.9 %)**, ungated 102 (was 75 / 142 before the correction).
- **Ghost guard works mechanically.** `W-FLOW-NO-DERIVED` PASS: F1 and F2 carry no read-only (system-computed) field; the control row that declares `MovementQty` is flagged. Mutant "ghost guard off" turns it red.
- **Strategy typing is read, not repeated.** F1 `C_OrderLine`=M, F2 `M_MovementLine`=M; base targets `M_Product`=R, `C_UOM`=R, **`M_Locator`=M** (so locators are not pure seed in iDempiere's POS strategy; the setup flow must create them). Control: `M_StorageOnHand` reads **unlisted**.
- **Zero-code test (`W-FLOW-ZERO-CODE`).** Five rows — `C_Payment`, `C_InvoiceLine`, `M_InOutLine`, `S_TimeExpenseLine`, `R_Request`, each one JSON line — compile with all guards evaluated and no error; none of the seven table names appears in the compiler code (0 hits); a typo'd row turns red; adding the rows changes the plan. **Generic code: 241 non-blank, non-comment lines in total** (`scope.js` 122, `flow.js` 104, `compile.js` 15). Per flow: one JSON line of 3–5 hand-written column names.
- **Same rows, a different AD snapshot.** The identical rows compiled against `bim-ootb/erp/ad_seed.db` (1,004 tables instead of 1,076) with no code change and the same payload shapes; the plan hash differs because that snapshot has only 1 replication-strategy row, so every table types as **unlisted** — the compiler flagged the missing typing instead of failing or assuming. This is the maintenance behaviour wanted: an AD change shows up as a plan diff.
**Limits, stated so they are not rediscovered.**
- **What the AD cannot choose.** With `Carries` empty the compiler *proposes* the human-entered columns, and the proposals are wide: **45 columns for `C_OrderLine` against the 3 a person declares**, 55/105 for `C_Payment`, 42/54 `C_InvoiceLine`, 23/41 `M_InOutLine`, 24/39 `S_TimeExpenseLine`, 52/68 `R_Request`. Price, tax, dimensions and workflow fields are all editable in the window, and that the receiver gets them from its own base is **business knowledge**. So the irreducible hand-written part of a flow is its `Carries` list, and the X flows above are proposals the witness reports as INCONCLUSIVE, not plans. "No bloat" is therefore supported for the *code*; the *declaration* still needs a person per flow.
- **Check (3) of the zero-code test is weak.** The compiler code hash cannot change during one run, so it only pins the hash into the log; the claim rests on (1) no table names in code, (2) 5/5 rows compile, (4) a wrong row fails, (5) the plan changes.
- **Not measured:** behaviour on a real AD *upgrade* with renamed or removed columns (only two different snapshots, not a version series), row-level volume, and the maintenance cost of the compiler's own bug fixes over time.
- **Table `M_Locator` and the setup flow:** because it types as Merge, the one-time setup (base + initial stock movement) has to create the branch's locators — to be specified with the setup flow (§16.13 Q8).

### §16.17 Workaround ledger — every server call in the old design → its local-first form (user, 2026-10-25: *"this brought about the novel workarounds which aren't fully triaged yet. That is the main purpose of our research and spec session"*)
**FL-7 Deterrence over prevention for low-value, identity-bound instruments (user, 2026-10-25: *"…it is the user's phone that will update when it scans the cashier given code. Redeemed or returned. User has no more credit left in the phone… tampering… be rare and illegal and will blacklist as all other ehailing systems do"*).** The design does not try to make tampering impossible; it makes it **detectable at settlement and costly**. Conditions it depends on *(inference)*: (1) the instrument is bound to an identity that can be blacklisted; (2) detection exists — admin can compare the codes issued with the redemptions the phones report, so the deterrent is credible; (3) the exposure per account is small. `W-CODE-ONCE` (detection, not prevention): a cashier code is applied exactly once and a second scan is a no-op; admin's reconciliation lists issued against applied; a phone restored to an earlier state produces a discrepancy that is flagged as a blacklist candidate. This supersedes the "offline e-purse dilemma" wording earlier in this section's first draft.
**Where the server sits (the sentence to use):** *no server in the sale path; a settlement authority behind it, asynchronous* — the same shape as Square offline and store-and-forward POS (R1), with the authority a device the owner runs. Class **(a)** purely local · **(b)** declared fact, later settlement at the centre, bounded exposure · **(c)** needs a realtime arbiter. Rows marked ◇ are **my candidates, not extracted from the user's fork** (⛔ extract or confirm).
| # | Server call (today) | Local-first form | Class | Residual risk | Bound | Witness (to write) | Replaces |
|---|---|---|---|---|---|---|---|
| 1 | Stock check at POS | none: POS sells and declares; admin derives stock and replenishes (FL-2/FL-3) | b | stock-out; over-declaration undetected | day-end count flow (pawn §20.5) | `W-STOCK-LOOP`: sales→shortfall→Generate Replenishment→movement, branch blind to admin | |
| 2 | Return validated against the original sale by a server | negative-quantity line; the cashier gives a code, the customer's phone scans it and updates itself (user, 2026-10-25) | b | tampering with the phone (rare, illegal) | deterrence (FL-7): detected at settlement, blacklisted; no preventive check | `W-CODE-ONCE` | |
| 3 | Loyalty balance held and checked by a server | the points live in the buyer's phone; redeeming = the phone scans the cashier's code and updates itself, leaving no credit (user, 2026-10-25) | b | tampering with the phone (rare, illegal) | deterrence (FL-7): detected at settlement, blacklisted | `W-CODE-ONCE` | |
| 4 | Order number allocation | natural key POSStation/Date/Order# (§16.16a) | a | restore re-issues a number → same key, different content | content hash at admin | `W-TICKET-COLLISION` | |
| 5 | Order header | admin authors it from the line group key; never copied (FL-6) | a | none beyond FL-6 | — | `W-FLOW-NO-DERIVED` | |
| 6 | Price / promo update | Reference seed (type R), pulled; effective-dated | a | stale price until next pull | pull guard: last-check time + value not null | `W-SEED-STALE` | |
| 7 | Gold price (Micro Finance) | public daily file in the relay; the borrower app pulls, guarded by last-check date and rate not null; balance value computed locally | a | file missing or stale | the guard | pawn price witnesses (§20.3) | |
| 8 | Customer payment (Micro Finance) | one upstream payment line; admin processes and verifies | b | duplicate slip | one-slip-one-count (§25.13) | `witness_news_up_dedup.js` | |
| 9 ◇ | Manager override / discount approval | signed override token minted on the manager's device | b | token reuse | single-use id + expiry | `W-OVERRIDE-ONCE` | |
| 10 ◇ | Gift card / voucher balance | same mechanism as row 3 **if the instrument is bound to an identity**; an anonymous bearer voucher has nothing to blacklist (FL-7 condition 1) | b / c | double spend by an unidentified holder | cap per instrument | `W-CODE-ONCE` | |
| 11 ◇ | Customer credit limit | cap checked at admin at settlement; the POS limit is a branch chooser | b | exposure until settled | per-customer cap | `W-CREDIT-CAP` | |
| 12 ◇ | Day-end cash reconciliation | count flow up; variance computed at admin | b | cash taken outside the system is not policed by FL-3 (FL-4) | independent count | pawn `witness_dayend.js` | |
| 13 ◇ | Fiscal / tax-authority printing or reporting | external obligation, outside the replication design | — | ⛔ not analysed | — | — | |

### §16.18 Treatments — the category of action a flow row states, and the one abstract engine behind them (2026-10-25, user: *"we abstract such treatment into category of actions stated by the Replication. Design an abstract code over it where it can handle the above in particular"*) — spec BEFORE code; files `build/scriptor/treat.js` (the treatments), `build/scriptor/sim.js` (the engine and a dumb in-memory relay), `scripts/witness_scriptor_treat.js`
**Idea.** A flow row (§16.16) gains two columns: **`Treatment`** (a list) and **`Params`** (the few values that treatment needs). The engine knows treatments, not tables or business cases. Everything in the §16.17 ledger that the old design did with a server call reduces to one of four treatments:
| Treatment | Does | Params | Ledger rows it carries |
|---|---|---|---|
| **FACT** (`dir` UP, DOWN or BOTH; `audience` hub or space — §16.18b) | a device declares facts to the hub (UP), or the hub sends facts addressed to one device (DOWN), or every member of a space authors and receives (BOTH, audience space); content-addressed, idempotent, collision-detecting | `table`, `carries`, `group` (natural key), `audience` | 1 (sales lines up, replenishment down) · 4 · 5 · 8 |
| **SEED** (`audience` addressed or public) | the hub publishes a versioned value; a device **pulls** it under a guard | `guard` (`daily`/`once`), value must be non-null | 6 (price list) · 7 (gold price, public) |
| **RULE** | when facts of flow X arrive, the hub runs a named kernel process and emits facts of flow Y | `on`, `process`, `emits` | 1 (Complete order → Generate Replenishment → movement) |
| **INSTRUMENT** (`kind` counter) | an authority device issues a signed single-use code that changes a counter (+ earn, − redeem/return); the holder's device applies it once and reports; the hub keeps the one derived balance and reconciles | `account`, `authority role` | 2 · 3 · 10 |
**The boundary.** The engine never contains business logic. A RULE names a **process** (`GenerateReplenishment`) that the host supplies from the kernel's own standard processes (the twin rule: the hub runs what legacy iDempiere runs). The engine only wires: arrival → process → emitted facts.
**A treatment implements five things:** `needs` (static validation of the row, run at compile time) · `deviceVisit` (what a device does when it visits the relay) · `hubVisit` (what the hub reads) · `hubAfter` (what follows an accepted fact) · `reconcile` (settlement). A new treatment is one object of this shape; a new flow of an existing treatment is **one row and no code**.
**Invariants the engine enforces for every treatment (each a witness):**
- **I1 Blind scope.** A device can only list/get under its own prefixes (`o/<id>`, `d/<id>`) and the shared `seed/` and `pub/`; any other name throws. (Branch A has no awareness of admin or other branches, §16.0a.)
- **I2 Idempotent, content-addressed.** A name is `<flow>/<natural key>.<content hash>`; the same fact twice is one object.
- **I3 Collision detection.** The same natural key with different content is **flagged, never overwritten** (the restore-reissues-a-number case, §16.16a).
- **I4 One derivation (FL-6).** Hub-derived values (stock, account balance) exist in one place; a device's copy is advisory.
- **I5 Pull guard.** A SEED is fetched at most once per guard period and again only if the local value is missing (the gold-price rule: last-check + value not null).
- **I6 Treatments are data.** Adding a flow of an existing treatment changes no code file.
**INSTRUMENT in detail (FL-7).** Codes are signed with the authority's key (ed25519 in the prototype; the roster of authority keys is in the seed) and carry `{id, account, delta, kind, issuer}`. The phone applies a code **once** (a second scan is a no-op) and reports the application. The hub derives the balance as the sum of issued deltas — the one truth — and **reconciles**: it flags an account whose derived balance goes negative (the phone showed credit it no longer had, e.g. restored from an older state) and an account whose reported applications differ from issued codes. The phone's number is the advisory copy. This is detection, per FL-7, not prevention.
**Witnesses (each names the issue; teeth required):**
- `W-TREAT-REGISTRY` — every row resolves to a treatment and satisfies its `needs`; a row with an unknown treatment or a missing param is red.
- `W-TREAT-STOCKLOOP` — branch sells → hub derives stock → shortfall → replenishment arrives at **that** branch only; replaying the same arrival changes nothing.
- `W-TREAT-BLIND` — no device made an out-of-scope call during the run; a deliberate out-of-scope read throws.
- `W-TREAT-TICKET` — the same ticket twice is one record; the same key with different content is flagged, not overwritten.
- `W-TREAT-PULLGUARD` — a SEED is fetched once per day; a missing value triggers a refetch; the public gold price is fetched by every device without any addressing.
- `W-TREAT-CODE` — a code applies once; a second scan is a no-op; an honest account reconciles clean; a phone rolled back and redeemed again is flagged as an overspend.
- `W-TREAT-ZEROCODE` — a further FACT flow for another table and a further SEED, added as rows only, run through the engine with no code file changed.
- `W-TREAT-MUTANTS` — switch off each invariant (scope check, content addressing, collision flag, pull guard, apply-once, reconcile) in a copy; each must turn at least one arm red.
**Out of scope here (stated):** transport sealing (CL8), persistence, real kernel processes (a stub stands in, in the witness), the class-(c) realtime-arbiter cases, and the real-phone behaviour of the pull guard (background fetch limits, §25.1).

#### §16.18a Treatments — results (2026-10-25; `node scripts/witness_scriptor_treat.js`, log `build/scriptor/treat.log`, read in full) — `§TREAT_VERDICT PASS judged=16 fails=0` (SAMPLE DATA throughout)
- **The engine is small and names no business word.** `treat.js` 93 + `sim.js` 42 = **135 non-blank, non-comment lines**; with `scope.js`/`flow.js`/`compile.js` the whole replication toolchain is ~245 + 135 lines. The engine and treatments contain none of 10 table/process/business words (`C_OrderLine`, `M_MovementLine`, `C_Payment`, `GenerateReplenishment`, `ApplyPayment`, "gold", "loyalty", …); the business logic lives only in the two PROCESS stubs inside the witness. A further FACT flow for `C_InvoiceLine`, added as one row, was delivered and accepted end-to-end with no code change.
- **Unicenta POS case (`W-TREAT-STOCKLOOP`).** Three sale lines (3, 3, 2 units, sample) go up from branch A; the hub derives stock 10 → 2, which is below the sample minimum 4, so the RULE runs the (stub) Generate Replenishment process and one movement of 8 reaches **branch A only** (B's inbox empty); the branch's own advisory stock (10 − 8 + 8) **equals** the hub's derived 10 (FL-2: one derivation, a harmless second copy); replaying the visit adds 0 objects. Branch blindness (`W-TREAT-BLIND`): no out-of-scope call occurred; a deliberate read of another branch's prefix throws.
- **Ticket identity (`W-TREAT-TICKET`).** The same ticket twice = 1 record; the same key with different content (the restored branch) = **1 collision flagged, original kept** (§16.16a, now witnessed).
- **Pull guard (`W-TREAT-PULLGUARD`).** Two visits the same day = 1 fetch; next day = 2; value vanished → refetch = 3; the public price reached all 5 devices with no addressing; the addressed price list reached no borrower.
- **Cashier code (`W-TREAT-CODE`, FL-7).** Balance after earn / redeem / second scan = 100, 0, 0 (second scan a no-op); a code signed by a key not in the roster is rejected; two honest accounts reconcile with 0 flags; after the phone is restored to an older state and redeems again at another cashier, the hub's derived balance goes to −100 and **flags the account as an overspend** (the blacklist candidate).
- **Micro Finance case (`W-TREAT-MICROFINANCE`).** Two app opens = 1 price fetch; the fund value (12 g × 2,300, sample) is computed **on the phone** from local gold and the public price; the same payment slip twice = 1 payment; the hub derives the owing balance (5,000 → 3,500, sample) and the confirmation reaches that borrower only.
- **Mutants — all killed:** scope check off → `W-TREAT-BLIND` · content addressing off, collision flag off → `W-TREAT-TICKET` · pull guard off → `W-TREAT-PULLGUARD`, `W-TREAT-MICROFINANCE` · apply-once off, signature check off, reconcile off → `W-TREAT-CODE`.
- **Limits, stated.** (1) The run is **unsealed**: transport encryption (CL8) is not exercised, so the film must say payloads are readable in this run. (2) The hub is one in-memory object, the relay is a dictionary, time is a number — it proves the *logic* of the treatments, not persistence, concurrency across real devices, or a real phone's background-fetch limits. (3) The process stubs are mine, not the kernel's; the twin-rule witness (admin's books equal legacy's for the same documents) is still to be written. (4) `W-TREAT-CODE` detects the rolled-back phone because the hub sees every issued code; a cashier who never reports (offline for days) delays detection — the bound is the reporting interval. (5) All quantities, prices and balances are made up for the run.
- **Ledger rows now witnessed:** 1 (stock loop), 2/3 (cashier code), 4 (ticket key), 5 (header authored by the hub), 6/7 (seed + public price with the guard), 8 (payment line, duplicate slip).

#### §16.18b Mesh = FACT with `audience: space` (2026-10-25, user: *"go, write the mesh audience into §16.18"*) — DECISION recorded; spec BEFORE code; resolves §20 gap G1
**Decision.** There is **no fifth treatment**. The difference between the POS (a star) and the team layer (a mesh) is *who may read whom*, so it is one parameter on FACT: **`dir: BOTH`, `audience: space`** (default `audience: hub`). Topology is **derived, not declared**: a strategy whose FACT flows are all `hub` is a star; one with any `space` flow has a mesh part; the two may coexist (blind POS branches and a design team in one business).
**What changes in the engine (when built).**
- **I1 per flow.** A hub-audience flow keeps today's scope (own `o/<id>/`, own `d/<id>/`, `seed/`, `pub/`). A space-audience flow additionally lets a *member* of the space list and read `o/<member>/<flow>/` of **that flow only** — never another flow, never a non-member. (Byte-level isolation inside the space still needs audience keys: §16.14 B3, §13.11 gap 9.)
- **No derived-truth holder.** Each member folds the accepted facts of the flow with the same deterministic function and reaches the same result; there is no hub-side RULE or INSTRUMENT reconcile for a space flow.
- **Conflicts stay in carriage.** The engine only reports a **collision** (same key, different content — already implemented, I3). Per-column judgement (`pos_x` warnings), refuse-vs-warn and KEYCLAIM stay in §11–§15/§13.12. The engine must not grow a resolve function; `W-TREAT-MESH` checks that it has none.
**`W-TREAT-MESH` (to write; nothing built yet).** (1) members A and B (same role) edit *different* elements: each device ends with both; (2) both edit the *same* element key with different content: a collision is flagged on every device, no overwrite; (3) the canonical fold of the accepted facts has the **same hash on A and B** (order-independent: sorted by key); (4) a device outside the space reads none of the flow (scope throws); (5) every existing star arm still passes unchanged. *Mutants:* space-scope off (a member sees only its own) · audience ignored (a non-member reads) · a conflict-resolving function present → each must turn ≥1 arm red.
**Order (the hold stays until step 3 passes).** (1) `compile.js`: virtual tables (a table with no `ad_table` row, columns declared in the row; G3 ghost guard prints VACUOUS for it); (2) `audience: space` on FACT + `W-TREAT-MESH`; (3) **compile-only dry run** — the Modeller's 7 shared op types and the ERP's table scope as rows, compared line by line with `CLASS` / `STATION_LOCAL`; no adapter edits; (4) the Modeller adapter first (already default-deny, no dictionary — the best test of *abstract*), the ERP second (it must flip from share-everything to default-deny, a behaviour change that needs the every-window check). Prototype unsigned; the plan-signing key (§16.13 Q1) is needed at rollout.
**Also noted (not done):** the engine's trace kind `local-sale` should read `local-action` (the engine names no business word; this is the one leak — `grep` finds it in `sim.js`). Renaming changes the film's data source, so it waits until the film is finished.

### §16.19 Film storyboard v1 — "No server in the sale path": the Replication engine, two cases (2026-10-25, user: *"I would love a film illustrating how the Replication engine works for Unicenta POS case and Micro Finance case"*) — **STORYBOARD ONLY; NOT RECORDED. Per `prompts/FILM_NARRATION.md` nothing is recorded until the user approves this plan.**
**Source of truth.** The film shows the engine's **own recorded run**: `build/scriptor/trace_pos.json` (73 events), `trace_code.json` (65), `trace_mf.json` (56), produced by `witness_scriptor_treat.js`. Every number spoken or shown is read from those traces or from `treat.log` / `s1.log` (`facts.json` generated from them, the house rule). Nothing is drawn by hand; sample data is labelled "sample" on screen.
**Form (house format, same pipeline as the 2026-10 films).** A self-contained HTML *stage* page replays a trace: devices as cards (Branch A, Branch B, a phone, the HQ desk), the relay as a shelf that only stores named objects, envelopes moving between them, each step stamped with its trace line (`§FILM_CUE`). Recorded headless on CPU, one continuous take per part, two-voice English (Kokoro), subtitles burned in, opening and closing cards, recap card reused from the ERP film for "part 2 onwards" viewers. ⛔ language: English first; Thai after approval (the pawn films were bilingual).
**Part 1 — Unicenta POS (target ~2:30).**
1. *Cast and the one table.* Branch A, Branch B, HQ desk, the shelf; the flow rows F1, F2, R1, S1 shown as the only configuration (`flows.json`).
2. *Seed once.* HQ puts the price list on the shelf; Branch A pulls it; a second visit the same day is **skipped** (trace `pull`, `skip`).
3. *Selling.* Three tickets at A (3, 3, 2 units, sample). A's own stock counts down 10 → 2 — shown greyed as "advisory".
4. *What leaves.* Only product, quantity and unit cross (6 of the line's 60 columns, `s1.log`); price and tax stay behind because HQ has its own. The object name on the shelf: `o/A/…/A/2026-10-25/1/1.<hash>`.
5. *HQ visits.* Accepts three facts; derives stock; 2 is below 4 → RULE → the kernel's Generate Replenishment (named, host-supplied) → a movement of 8 for A.
6. *Replenishment returns.* A visits and receives it; its own count meets HQ's: 10 = 10. B's inbox is empty; B tries to read A's shelf and is refused (`out-of-scope`).
7. *The same ticket twice, and a restored branch.* One record; then the same number with different content: a red **collision** flag, the original kept.
8. *Return and loyalty.* The cashier gives a code; the phone scans it; credit 100 → 0; a second scan does nothing; a forged code is rejected; a phone restored to an older state redeems again and HQ flags **overspend** — "rare, illegal, blacklist" (user's words, FL-7).
**Part 2 — Micro Finance (target ~2:00).**
9. *Cast.* A borrower's phone holding its own gold and balance; the shop desk; the shelf; the daily public gold price.
10. *Price once a day.* The phone opens twice; one fetch, one skip; the fund value is computed **on the phone** (12 g × 2,300 = 27,600, sample).
11. *A payment.* One payment line goes up; the same slip sent twice is one payment; the shop derives the owing balance 5,000 → 3,500 (sample).
12. *Confirmation.* It reaches that borrower only; the other borrower's phone sees nothing.
13. *The same engine.* The Micro Finance flows are the same four treatments as the POS; on screen: the rows, the 135 lines of engine, "a new flow = one row" (the `C_InvoiceLine` run).
**Closing card (limits, from `treat.log`):** sample data · this run is not encrypted (sealing is a separate, witnessed layer) · logic only: one in-memory hub, no real phone yet · the process stubs stand in for the kernel's own.
**Wording rules.** No "mockup" / "simulated" claims beyond the limits card; "sample" for made-up numbers; "to our knowledge" for any novelty line; no list of unbuilt items beyond the closing-card limits; no legal statements.
**Witness the film must carry (house rule — footage is a witness too):** `§FILM_CUE` per beat read from the trace; frames = silent source frames; longest silence; loudness; captions inside the band; every spoken number equal to `facts.json`. Recorder and narration are CPU-only and local.
**Owed before recording:** (a) the user's OK on this storyboard (the film playbook's gate); (b) the stage page `scripts/film_replication_engine/stage.html` replaying a trace; (c) language and length decisions; (d) whether the "twin-rule" witness (§16.18a limit 3) should land first so Part 1's "the kernel's own process" line is true rather than stubbed — until then the film says "stands in for".

---

## §17 Sandbox test plan — the open concerns, each turned into a test with a pass line (2026-10-25, user: *"NO other FOSS project has this. We have non existent server costs. Update the prompts/# with your listed concerns, to sandbox test it. Do not worry of the same factor insider fraud which ours is already tamper evident which the others have not."*)
**Status: SPEC ONLY — nothing in this section is built yet.** Written before any test code, per the house rule. Each row names the issue it proves or disproves, what is measured, and the verdict line. Existing numbers are the BASELINES that must not regress; where no number exists the first run RECORDS one and red1 sets the pass line after seeing it (nothing invented — `HYP` marks a hypothesis the first run may overturn).

**Owner's position, recorded as given (not re-argued here):** (1) server cost is nil — no always-on database or application server; (2) no other FOSS project has this; (3) insider fraud is out of scope for these tests because the log is tamper-evident. **Wording guards that stay in every public statement until an independent review exists:** the novelty line keeps "to our knowledge" (the prior-art notes `prompts/prior_art_2026-10-25/01..03` found no production precedent for fully serverless transactions, but several rows rest on search excerpts, and nothing there compares tamper-evidence project by project); "tamper-evident" means a forged or altered op is DETECTED and refused on every device (witnessed: W-FOCUS-BOARD forge arms, W-AVATAR-TRAVEL, the comm layer's signature checks) — it is not a claim that a signer cannot sign something false; "server cost nil" is stated with its dependencies (test T9).

### §17.1 The concerns → tests
| # | Concern (the issue) | Sandbox test (proposed name) | How, in the sandbox | Measured / pass line | Verdict line |
|---|---|---|---|---|---|
| T1 | **Team-size ceiling** (GitHub pipe ~31 devices per account at one Visit / 15 s = 125 pushes/h; web relay/bucket ~100 staggered; relay requests grow with N²) | `W-SCALE-LADDER` | `scripts/sim_comm_office_day.js` generalised to N = 6, 12, 24, 31, 50, 100 simulated devices on the folder pipe and on a rate-limited fake-GitHub stand-in; Visits staggered and unstaggered | every device folds to the SAME derived hash; 0 refused honest ops; requests/h per device recorded vs the stand-in's limit; pass = convergence at every N the pipe's limit allows, and the first N where the limit bites is REPORTED (not hidden) | `§W-SCALE-LADDER PASS` · `max_N_converged=…` · `first_limit_hit=…` |
| T2 | **Real phones never measured** (fold speed, Android background-sync interval, memory) | `W-PHONE-FOLD` | a real Android phone (or the emulator for the first cut, labelled as such) opens the Modeller/ERP in team mode on the phone page and the main page; logs of 100 / 1,000 / 5,000 ops; the node figure 0.18–0.34 ms/op is the comparison | fold ms/op, heap, time to first Visit after a background period; `HYP`: phone <= 10x the node ms/op — red1 sets the line after the first number | `§W-PHONE-FOLD … ms_per_op=… heap_mb=…` |
| T3 | **Email path throughput unmeasured** (post-box processing assumed 1 s/mail, ⛔) | `W-POSTBOX-LATENCY` | a sandbox Gmail account as the post box: send K = 20, 100 sealed letters, measure send-to-fold latency distribution and the post box's processing rate | p50 / p95 / max latency, letters lost = 0; replaces the assumed 1 s/mail with a number | `§W-POSTBOX-LATENCY p95=… lost=0` |
| T4 | **The building itself is not shared** (seeded HHS elements: a wall drag is `target-not-a-team-record`, local-only) | `W-BASE-EDIT-MODELLER` (spec: §13.12.I item 5, Modeller base wiring) | two devices open the same HHS resident, the team pins its hash at genesis, A moves a seeded wall | B's wall moves identically after the Visits; a device with a DIFFERENT building file is refused with the base-mismatch message; a stale base is refused, never folded | `§W-BASE-EDIT-MODELLER PASS` |
| T5 | **Wings are agreement, not enforcement** (no claim / lock, §15.5) | `W-WING-CLAIM` | a discipline x zone claim as an op; A claims the north wing; B's edit to an element in it | B's edit is refused (or held as a conflict) with the owner named; B's edits elsewhere pass; releasing the claim re-allows | `§W-WING-CLAIM PASS` |
| T6 | **Old Outliner dots only see this machine** (same-browser channel, S-8) | `W-DOTS-FROM-POSTBOX` | feed the overlay from the signed focus board (same data as the People list) | two machines: B's Outliner row for an element A has open shows A's avatar after the Visits; no BroadcastChannel needed | `§W-DOTS-FROM-POSTBOX PASS` |
| T7 | **buildingSMART certification / IFC round trip** (open) | `W-IFC-ROUNDTRIP-TEAM` | export IFC4 from a model both devices edited, validate with IfcOpenShell + the buildingSMART validation service, re-import | export validates with 0 errors; element count and the moved positions match the team model | `§W-IFC-ROUNDTRIP-TEAM PASS errors=0` |
| T8 | **Nobody outside has reproduced it** (independent review, "to our knowledge") | `W-CLEAN-CLONE` | a fresh clone on a machine that has never run the project (and an outside reviewer's own run): `git clone`, one install, run the witness set listed in §15.15.5 + the sim | every witness verdict reproduces (counts equal); the reviewer's written findings are filed under `prompts/` verbatim, good or bad | `§W-CLEAN-CLONE PASS witnesses=… reproduced=…/…` |
| T9 | **"Server cost nil" has dependencies** (free-tier limits and terms of every external service the team layer rides on) | `W-COST-LEDGER` | list every external service in the team path (GitHub repo + API as pipe, Gmail post box, OCI/GitHub Pages static hosting, domain, fonts/CDN if any) with its documented limit and its terms for this use (GitHub API rate limits; use of a repository as a relay for business data), and measure a full sim day's calls against them | a table: service · what we use it for · limit · measured use · terms checked (date + URL) · monthly cost; pass = measured use is under every limit with margin, and every terms question is answered in writing | `§W-COST-LEDGER … monthly_cost=… within_limits=true` |
| T10 | **No real-user pilot** | `PILOT-A` (not a witness: a field trial with witnesses attached) | 3–5 real people, one real project, 2 weeks, two machines each; the task is whatever the Modeller authoring lane (`prompts/Modeller/`, in progress, NOT this spec's concern) states as supported on the pilot's start date; the Team icon, avatars, People list, wings by agreement | counted from the logs, not from impressions: Visits per person per day, conflicts raised / resolved, ops refused (must be 0 honest), time from an op to the other side seeing it, support questions asked; red1 sets what "worked" means before the pilot starts | `§PILOT-A … conflicts=… refused_honest=0 …` |
| T11 | **Robustness under bad networks / clocks / duplicates** | `W-INVARIANTS-CHAOS` (BUILT on `feat/comm-escrow`, 72/0, seed 20261024, N = 6 / 12 / 24) | already specified in §13.12.J.3; to be merged and re-run against the Modeller adapter | invariants hold on every device; derived-ledger hash equal everywhere (control differs) | `§W-INVARIANTS-CHAOS PASS 72/0` |

### §17.2 Order and rules
1. **Cheapest first, all in the sandbox (no real users, no production):** T11 (merge + rerun) → T1 → T9 (a table, no code) → T8 → T3 → T2 → then T4–T7 (each is a product slice with its own spec section before code) → T10 last.
2. **Every test names the issue it can falsify.** A scale test that only runs N = 6 proves nothing about the ceiling; T1 therefore must reach the N where the pipe's limit bites, or say it did not.
3. **A test that cannot fail is not a test:** each witness above gets a mutant (as W-AVATARS / W-TEAM-ICON-MODELLER did) before its PASS counts.
4. **Results go in this section, dated, with the log lines** — and a failing result is recorded as a finding, not retried until green.
5. **Out of scope by decision:** insider fraud (owner's directive above), and the depth of Modeller authoring (its own lane, in progress under `prompts/Modeller/`; owner, 2026-10-25: *"that is not the present prompts/# specs concern"*). Recorded so a later session does not re-open either unprompted.

### §16.20 Activity panel and failure / fold-back (2026-10-25, user: *"show a panel that indicates 'server' activity ie on admin side, the pipe of what goes to and fro how infrequently, and the user side indicating action is localised. And the backups or fold back in case of devices failure. Or that can be a lower parallel bar"*) — spec BEFORE code; the engine and `witness_scriptor_treat.js` are extended; storyboard §16.19 → v2
**The panel (a lower parallel bar under the stage), three lanes, all read from the engine's own trace — nothing drawn:**
- **ADMIN lane** — the hub's events on a timeline (visit, accept, publish, send, flag). The point is how *rarely* it acts.
- **PIPE lane** — every object that crosses the shelf (`put`, `recv`, `pull`, `send`, `publish`), with a running count and the object names.
- **USER lane** — the device's *local* actions (`local-sale`, `local-stock`, `apply-code`, `skip`), many and instant.
- **Counters shown beside the lanes:** local actions · pipe crossings · hub events · device visits, and the ratio local : crossing for the run. The ratio is **measured on the sample run and labelled so** — the film makes no claim about real-world frequency (§16.18a limit 2).
- New trace kinds the engine must emit: `local-sale` (in `World.sell`), `local-stock` (host-logged), `visit`, `hub-visit`, `fail`, `restore`, `rebuild`.
**Failure and fold-back — three beats, each with a witness.**
- **F-DEVICE — a branch device is lost.** Its local state is wiped; unsent facts are lost and the number is **shown** ("not yet sent: N", the exposure — pawn §19.5). Restore = re-read its **own** prefix on the shelf (its published facts), its addressed down-facts (`d/<id>/`), re-pull the seeds, and a phone re-learns which codes it already applied. The branch's recomputed advisory stock must equal the hub's derived figure, and re-scanning an already-applied code is a no-op. `W-TREAT-DEVICEFAIL`.
- **F-HUB — the admin device is lost.** Its derived state (records, stock, owing, account balances) is wiped and rebuilt by **re-reading the shelf** and re-folding. The rebuilt state must equal the state before, with **zero duplicate objects** on the shelf. This requires a new invariant: **I7 Replay-safe rules** — the keys of facts a RULE emits are a pure function of the triggering fact (`MV/<fact key>`), so a replay produces the same content-addressed names. `W-TREAT-HUBFAIL`.
- **F-PIPE — the shelf is lost.** With a second pipe (the blind **mailbox device**, §16.8 row 2, the Briar plan) every write goes to both and reads fall back; killing the primary leaves the rebuild unchanged. **Control without a mirror:** the same loss leaves the hub unable to rebuild — the exposure is shown, not hidden. `W-TREAT-PIPEFAIL`.
- **Mutants:** restore off · mirror write off · replay-unsafe rule keys (counter-based) — each must turn an arm red.
**Stated limits (carry to the film's limits card):** (1) a fold-back reproduces the same derived state only if the rule is **order-insensitive or the replay order is deterministic**; the prototype replays in object-name order, which equals arrival order only for the sample keys (lexicographic order mis-sorts `10` before `2`; the production ordering is §11.4, not this). (2) Facts a device had not yet sent are **lost** with it; the hub's truth excludes them, and the restored device agrees with the hub, not with its former self (FL-2). (3) Mirroring doubles the writes — it counts against the pipe budget (`W-SCRIPTOR-BUDGET`). (4) The mailbox device is a blind copy; it cannot rebuild derived state itself.

#### §16.20a OFFLINE label (2026-10-25, user: *"make a point of their offline mode by displaying a red OFFLINE label whenever they are local-only"*) — spec BEFORE code
- **Definition.** A device (and the admin device) is **local-only** whenever it is not inside a visit to the shelf. The engine records the connection windows itself: `online` when a visit starts, `offline` when it ends, and `visit-failed` when the link is down (`setLink`). The film's red **OFFLINE** label is drawn from these events — a device is OFFLINE from the start of the run until its first `online`, between every `offline` and the next `online`, and for the whole of an outage. **Nothing about the label is hand-timed.**
- **What it is meant to make visible:** a device keeps working while OFFLINE (sales, stock counts, scanning a cashier code, computing the fund value) and exchanges objects only inside the short online windows. The share of the sample day spent OFFLINE is **measured from the trace** and labelled as sample.
- **An outage beat.** On day 1 the branch's link is down at its 18:00 visit: the visit fails with zero pipe calls, the sales stay queued on the device, the OFFLINE label stays up, and the 18:30 visit delivers all of them — no loss, no duplicate.
- **`W-TREAT-OFFLINE`** — (1) per device the trace alternates `online`/`offline`; (2) **no pipe event (`put`, `recv`, `pull`) occurs outside an online window**; (3) during the outage `visit-failed` fires, the branch makes 0 pipe calls, and its queued facts reach the hub afterwards exactly once; (4) the measured OFFLINE share per device is printed. *Mutant:* link check off (the visit proceeds through an outage) → (3) must go red.

#### §16.20b Results — panel data, fold-back, OFFLINE (2026-10-25; `node scripts/witness_scriptor_treat.js`, log `build/scriptor/treat.log`, read in full) — `§TREAT_VERDICT PASS judged=30 fails=0` (SAMPLE DATA)
- **Engine size now:** `treat.js` 93 + `sim.js` 76 = **169 non-blank, non-comment lines**; still names no table, process or business word (10 checked).
- **Local actions touch no pipe (`W-TREAT-LOCAL`):** a sale made 0 pipe calls; scanning a cashier code made 0 (the cashier roster is a SEED the phone already holds — it was a pipe read in my first draft, found and fixed); control: one visit made 3.
- **Device lost (`W-TREAT-DEVICEFAIL`):** the branch lost with 1 unsent sale; its advisory stock read 9 before and 10 after fold-back, equal to the hub's 10 (**the hub's truth wins**; the unsent sale is gone); the seed was re-pulled; the phone re-learned the codes it had applied (a rescan is a no-op); the cashier's next code id is `A-3`, not a reused `A-1`.
- **Admin device lost (`W-TREAT-HUBFAIL`):** wiped and rebuilt from the shelf — 8 records, derived stock, owing and balances **identical**, shelf objects 14 → 14 (no duplicates). Needs I7 (replay-safe rule keys); the time-stamped-key mutant breaks it.
- **Shelf lost (`W-TREAT-PIPEFAIL`):** with the mirror (the blind mailbox device) the rebuild is identical; the control without a mirror recovers **0 of 8** records — the exposure is shown, not hidden.
- **Timed days (the film's data):** `trace_film_pos.json` (155 events), `trace_film_mf.json` (45). **Normal working day 1, POS:** local actions 13, shelf crossings 17, admin events 10, **admin visits 2**, device visits 4; days 1–2 including the failure beats: admin visits 3. **Micro Finance day:** local 12, crossings 9, **admin visits 1**, device visits 6. The point is the cadence — the admin acted twice on a working day while the branch counted down stock, scanned codes and priced its own gold locally — not the ratio, which is a property of this sample.
- **OFFLINE (`W-TREAT-OFFLINE`):** connection windows alternate for every device; **0 pipe events outside a window** (POS and MF); the outage beat: 1 failed visit with 5 facts queued, 0 pipe puts during it, then the 3 sale lines accepted once with 0 duplicates. Online windows have **zero length on the simulated clock** — so the red label is up for essentially the whole day; the film gives each window a fixed on-screen duration and says so.
- **Mutants (11):** scope check · content addressing · collision flag · pull guard · apply-once · signature check · reconcile · fold-back · mirror write · replay-unsafe keys · link check — each turns ≥1 arm red; none survives.
- **Findings from reading the log (not hidden):** (1) a SEED whose value does not exist yet is refetched on **every** visit (the guard requires a non-null value) — fine at a handful of visits a day, a polling hazard if visits are frequent; a retry back-off is a design item, not built. (2) The date is part of the ticket key, so reusing "ticket 1" on a new day is correctly *not* a collision; a collision needs the same date and a first version that reached the shelf. (3) The test driver's `cycle()` visits every device twice per call and inflates visit counts — the film uses the timed days, not those traces.
- **Limits carried to the closing card:** sample data; not encrypted (CL8 not exercised); one in-memory hub and a dictionary shelf — logic, not persistence or a real phone; process stubs stand in for the kernel; replay order is object-name order (lexicographic: `10` sorts before `2`), correct for the sample keys only — production ordering is §11.4.

### §16.19a Storyboard v2 (2026-10-25) — supersedes the beat list in §16.19; **STILL NOT RECORDED; waiting for the user's OK.** English first (user), Thai after.
**Layout.** Top: the stage (cards for the HQ desk, Branch A, Branch B, a customer phone, the shelf, and the mirror shelf labelled "mailbox device"; envelopes move between cards). **Bottom: a parallel bar with three lanes** — ADMIN (the hub's events), PIPE (objects crossing the shelf, named, with a running count), USER (local actions: sales, stock counts, code scans, the fund value) — and counters (local actions · crossings · admin visits · device visits). **Every card shows a red OFFLINE label whenever the device is local-only** (§16.20a): it is up from the start, flashes to ONLINE only for the length of a visit window, and stays up through the outage. Everything on screen is read from `trace_film_pos.json` / `trace_film_mf.json` and `treat.log` (no hand timing; `§FILM_CUE` per beat; `facts.json` for every spoken number).
**Part 1 — Unicenta POS (day 1 → day 2).**
1. *Cast and the table.* All cards OFFLINE; the flow rows F1, F2, R1, S1 shown as the only configuration. (08:30)
2. *Setup.* HQ's one online window: price list and an initial stock movement of 10 go on the shelf; Branch A's 09:00 visit pulls them; back to OFFLINE.
3. *A day of selling, all local.* 10:15 sale of 3 · 11:00 the customer's phone scans an earn code · 13:40 sale of 3 · 15:00 a redeem code takes the credit 100 → 0, the second scan does nothing · 17:20 sale of 2. USER lane fills; PIPE and ADMIN stay silent; every card OFFLINE.
4. *The link goes down.* 17:59–18:30: A's 18:00 visit fails with 5 facts queued; the label stays up and nothing is lost; at 18:30 A's visit delivers them. HQ's first activity of the day, 18:35: accepts 3 sale lines; derived stock 10 → 2; the rule runs the kernel's replenishment (named, stub) → a movement of 8 for A.
5. *Day 2, 09:00.* A receives it; its own count meets HQ's (10 = 10); B's inbox empty; B cannot read A's shelf.
6. *Failure 1 — the branch is lost (10:20).* "not yet sent: 1"; fold-back from its own shelf prefix; the count reads 9 and then agrees with HQ's 9; the cashier's next code is A-3.
7. *Ticket number reused (10:30).* Same date and number, different content → red COLLISION, the original kept.
8. *The phone restored to an older state (11:00)* redeems again at Branch B → 18:05 HQ flags **overspend** — "rare, illegal, blacklist" (FL-7).
9. *Failure 2 — HQ is lost (19:00).* Rebuilt from the shelf: identical, no duplicate objects.
10. *Failure 3 — the shelf is lost (19:30).* The mailbox device (mirror) carries the rebuild; the control without a mirror: 0 of 8 recoverable.
11. *The day in numbers.* From the panel: on the working day HQ visited the shelf 2 times, the devices 4, while the branch did 13 local actions (sample).
**Part 2 — Micro Finance (one day).** 08:30 the shop puts the gold price on the shelf (public) · 09:00 the borrower's phone opens: one fetch, the fund value 12 g × 2,300 = 27,600 computed **on the phone** (sample) · 14:00 opens again: skipped · 15:00 a payment slip (local) → 15:01 visit sends it · 15:03 the same slip again → still one payment · 16:00 the shop visits: derives owing 5,000 → 3,500, confirms · 18:00 the borrower receives it; the other borrower sees nothing. Cards OFFLINE except during visits.
**Closing card (limits):** sample data · not encrypted in this run · logic only — one in-memory hub, no real phone · process stubs stand in for the kernel's own · online windows are zero-length on the simulated clock and are shown for a fixed time · replay order caveat.
**Target length:** about 4:00–4:30 for both parts at the house pace (Part 1 ≈ 2:50, Part 2 ≈ 1:20), to be measured from the narration fit, not assumed.
**Owed before recording:** the user's OK on v2 · the stage page `scripts/film_replication_engine/stage.html` (reads the two traces; red OFFLINE per card from `online`/`offline`/`visit-failed` events) · English narration TSV with every number from `facts.json` · the recorder/fit/mux per `prompts/FILM_NARRATION.md` PLAYBOOK, CPU-only · then the Thai cut.

---

## §18 Ownership and the master split (2026-10-25; owner flagged a clash with the positioning paper → the positioning content was ABSORBED into `docs/StrategicIndustryPositioning.md`, not kept in a second file)
**Positioning lives in `docs/StrategicIndustryPositioning.md`** (Moat #4, risks 5–6, the Tier-2 branch-kit wedge, the Tier-3 team-layer paragraph and the local-first / offline-POS / CDE landscape rows were added 2026-10-25; not yet published — publish only via `scripts/safe_gh_deploy.sh`). This section keeps only what does not belong in a public paper.
**Who edits what.** *Replication session:* §16.x · `build/scriptor/*` · `scripts/witness_scriptor_*.js` · `prompts/prior_art_2026-10-25/*` · `docs/DistributedERP.md` · (planned) `scripts/film_replication_engine/*`. *Team-layer / evaluation session:* §15.14, §15.15, §17, §18 · `scripts/film_server_dead_modeller_hhs/*` · `prompts/film_server_dead_modeller_hhs_logs/*` (bim-ootb PR #2368 merged, 4e95b393). **Rules:** this file is the one shared file — edit only your own § numbers with exact-match edits, never a whole-file write from an earlier read, new text at the end under a new §, commit your own hunks only; engine files (`build/comm/*`, `common/comm/comm_*.js`) one agent at a time; a finding about another side's section is told to its owner, not edited in place.
**Recommendation (owner decision pending):** §16 = the single master for *what moves* (scope, flows, treatments, schedules); §11–§15 = the master for *how it moves*. Reason: both host adapters hard-code "what is shared" (`STATION_LOCAL` in the ERP, the Modeller's 7-of-22 class table, §15.2) — flow rows in disguise, the bloat §16 targets. **Declared only when:** C1 generated plans run in the office-day simulator and every existing witness quotes the same numbers (§16.12 S2–S3) · C2 the Modeller's `bim_element` has a pseudo-dictionary entry in the flow table · C3 the plan-signing key is answered (§16.13 Q1) · C4 §17 T1 / T4 / T5 are re-expressed on the scriptor's budget and owners · C5 Modeller authoring depth stays out (`prompts/Modeller/`).
**Wedge test order** (detail in §17): iDempiere branch kit → offline POS sale path (§16.19 numbers on real data) → open-BIM small-team pilot (§17 T10, T7) → pawn lending (parked: legal first, R1) → sovereign data (defer). **Kill criteria:** the legacy community will not run it or parity cannot reach every window / doctype; stock or cash reconciliation needs a central arbiter on most days; no use beyond the demo or the IFC export fails validation.
**Open — owner:** accept the split and tell the Replication session · publish the paper (a dated Tier-1 re-read is owed first, as the paper's currency line says).


---

## §19 RESUME — the team-layer / evaluation session closed 2026-10-25; the next session reviews Replication (§16) against the Team Modeller setup (user: *"Update prompt the need to Review Replication as spec'd by other session, to see how it can govern the Team Modeller setup here. New session to do that"*)
**Design intent (owner, 2026-10-25: *"Replication Strategy (revamped from legacy to our spine) is to remove custom code and have abstract implementation that can scale"*) — this is the review's YARDSTICK, and it is measured, not argued:** the legacy `AD_ReplicationStrategy` is revamped into the spine so that custom per-host code is REMOVED and one abstract implementation carries every case. So the review reports numbers: (a) per adapter (`modeller/team_sync.js`, `erp/team_sync.js`), which functions and how many lines a flow row would replace and which must stay (carriage, UI, pairing); (b) a `W-FLOW-ZERO-CODE`-style probe for the Modeller — a NEW shared op type or table added by a row ONLY, generic code hash identical before and after; (c) the deletion budget (AD-LAYER LAW 4) as + / − lines; (d) "scales" = the same generic compiler and treatment engine handle the ERP, the Modeller, the POS and the Micro Finance rows (§16.16b, §16.18). **Any mapping that needs a per-host special case is a finding against the design**, told to §16's owner.
**The job (one bounded task, read-only on the other side's files, no code until the owner says go):** read §16 as the Replication session wrote it, and produce — in a NEW § at the end of this file, not inside §16 — (1) a **mapping table**: every hard-coded "what is shared / who may / who holds" item in the Team Modeller and ERP adapters → the flow row or treatment (§16.16, §16.18) that would replace it; (2) a **gap list**: what the flow table cannot yet say about the Modeller (see "known mismatches" below); (3) a **verdict on C1–C5** (§18) with a recommended order and the first witness that would fall; (4) what, if anything, must change in §16 — as a note TO its owner, never an edit.
**Read first (in this order):** §18 (rules) → §16.0, §16.0a, §16.2, §16.12, §16.14 (B1 wording) → §16.15–§16.18 (flows, the flow table, treatments) → §15.2 (the Modeller's 7-of-22 class table), §15.5 (the wing claim, not built), §13.12.F (document numbering), §13.12.I (base), §15.15 (one Team icon, avatars) → §17 (sandbox tests T1, T4, T5 are the ones that overlap). Code to read (not edit): `modeller/team_sync.js` (`CLASS`, `translate`, the focus board), `erp/team_sync.js` (`STATION_LOCAL`), `common/comm/team_focus.js`, `build/scriptor/flows.json` + `compile.js` + `treat.js`, `scripts/witness_scriptor_s1.js`.
**Known mismatches to test, not assume (from this lane's side):**
1. The Modeller's table `bim_element` is a pseudo-table with no `ad_table` row; the flow table is built on `AD_Table_ID` (§16.16). A pseudo-dictionary entry is needed, and its columns (`geom_op`, `geom`, `pos_x|y|z`) are facts, not AD fields.
2. FL-6 says *declare facts, derive locally, never copy derived state*. A Modeller move is a delta fact and the geometry is a fold over it — consistent; but the 15 local-only op types (rotate, scale, cut…) are today dropped with a visible chip: should a flow row say "local" explicitly, and is that a treatment?
3. Conflict surfacing (per-column `pos_x` warnings, §15.4) is carriage (§11–§15), not replication: confirm the flow table never has to know about it.
4. The wing claim (§17 T5) is a scarce-resource owner (§16.2 *Owners*): does a wing map onto a `desks`/owner row, and does the claim arbitrate or only warn?
5. Pairing (Start / Join / Approve in the panel), the roster and the avatar field on the signed focus object are POLICY / identity, not flows — confirm they stay outside the flow table.
6. Shared-building base (§17 T4) is the BASE hash (§13.12.I); the Modeller's seeded elements are base rows — does the flow table's G4 "base typing" cover them without a new rule?
**State at close (so nothing is rediscovered):** bim-ootb PR #2368 MERGED (4e95b393): one Team icon + 24 built-in avatars, `W-TEAM-ICON-MODELLER` 15/0, `W-AVATARS` 13/0, `W-AVATAR-TRAVEL` 9/0, regression unchanged; `witness_focus_board` §FB-GHPIPE fails identically on clean main (stale expectation, not ours). Films in `~/Videos/`: `TheServerIsDead_Modeller_part3_HHS_Office_narrated_2026-10-25_v2.mp4` (4:44; Team Visibility card, icon flow, avatars, HHS wings; take 22/22) and v1 (without icon/avatars). §17 sandbox plan = spec only, nothing built. Positioning content absorbed into `docs/StrategicIndustryPositioning.md` (NOT yet published — only via `scripts/safe_gh_deploy.sh`, after the dated Tier-1 re-read its currency line asks for). Worktrees of this lane removed; no process left running.
**Still owner-owned (do not decide for them):** accept the §18 master split and tell the Replication session · publish the paper · §16.13 Q1–Q7 (plan-signing key, record-level scope, replicate-vs-ask thresholds, prior-art checks, phone measurements, closure variant, replenishment carrier) · whether the iDempiere branch kit is the first wedge to test.
**Rules that bit this lane (keep):** a green witness can hide a red log line — assert the verdict line; row ids are PER DEVICE and renumbered by every Visit — resolve at use; a check hard-coded `true` is not a check; the other session's uncommitted text lives in this same file — commit only your own hunks (stage HEAD + your section as a blob).

---

## §20 Review — the Team Modeller and ERP team adapters under the Replication Strategy (once-over, 2026-10-25; user: *"Give it a once over, as everything on multi user env has to hold until we sort out the Replication engine"*) — read-only; no code; findings for the Team session's sections are told here, not edited there (§18)
**Reviewer's note.** I am the author of §16, so this is partly self-critique; §19 asked for a fresh session. Treat the verdict as a first pass and have it re-read independently before it settles anything. **Method:** `git show origin/main` @ `4e95b393` (bim-ootb, read-only); `modeller/team_sync.js` 420 lines, `erp/team_sync.js` 498, `common/comm/team_focus.js` 59; the sections §15.2–§15.15, §17–§19; AD `build/erp/ad_full.db` strategy 100. Line counts below are grep-based estimates, not a code audit. Nothing was run.
### HOLD (user directive, recorded)
**Held until the Replication engine is sorted:** (1) any change to *what is shared or who may* in `modeller/team_sync.js`, `erp/team_sync.js`, `common/comm/*` — `CLASS`, `STATION_LOCAL`, `access`, new op classes, the wing claim (§15.5), record-level scope; (2) building the §17 sandbox tests that assume today's adapter scope (T1, T4, T5); (3) new Team features or films that add scope; (4) handing any multi-user build to others (the "branch kit" pilot). **Not held:** bug fixes that do not change what is shared; read-only measurement; spec work; the already-merged work stays as it is (#2358, #2368, the films). The Team session is told through this section (§18 rules).
### Verdict in one paragraph
§16 can govern **what** the adapters share, but it covers only a small part of them and it does **not yet fit their topology**. Of ~918 adapter lines about **19** (≈2 %) decide what is shared; the other ≈98 % is carriage, projection, pairing and UI that no flow row replaces. And §16's treatments assume a **hub** (FACT up/down, RULE at the hub, INSTRUMENT reconciled at the hub) while the team layer is a **mesh** with no centre. The two adapters also use **opposite defaults**: the Modeller shares only 7 of ~22 op types (default-deny), the ERP shares every table except 5 (default-share), while §16 is default-deny. So: no showstopper, but a design decision first (topology), then small compiler work.
### 1 Mapping table — what is hard-coded today → what would replace it
| # | Hard-coded item | Where | Replaced by (§16) | Stays (carriage / not scope) |
|---|---|---|---|---|
| M1 | 7 shared op types (`CLASS`: 6 creates + `GEOM_MOVE`) | modeller:25 | 7 flow rows on a virtual table `bim_element` (gap G2), peer treatment (G1) | how each op becomes an envelope |
| M2 | `create-with-parent`, `target-not-a-team-record` guards | modeller:72–86 | closure rule (SD-2 / the "refs resolve locally" guard) | the create/move → envelope translation itself |
| M3 | `access()` "modeller-open" | modeller:42 | every role carries the same rows | admission at fold time |
| M4 | the 15 local-only op types + chip | modeller:109… | **nothing to declare**: undeclared = local (default-deny); the chip's reason becomes "not in any flow" | the chip UI |
| M5 | `STATION_LOCAL` (5 tables) | erp:36,187 | strategy 100 `Local`: **4 of the 5 are `L`, the 5th (`ad_recentitem`) is unlisted** — already covered by data | — |
| M6 | "share every other table" | erp:~205–223 | default-deny + strategy `Merge` rows: strategy 100 types **47** of 1,003 active tables Merge (and 188 Reference = seeds, 217 Local, 551 unlisted) against the **~998** the adapter shares today | — |
| M7 | `isShared` / `fk-target-not-shared` | erp:155,164 | closure guard (SD-2/G4) | — |
| M8 | seeded rows stay local; base mismatch | erp:132,217 | BASE (§13.12.I) = Reference-type seed; seeds are not shared as edits | the BASE hash check |
| M9 | `access()` = the `MRole.canUpdate` port | erp:57 | stays: admission is fold-time carriage; per-role *scope* derivation is the future part | the port |
| M10 | focus board / people strip / heads-up | team_focus.js, modeller:268–330 | not a flow (soft state with a TTL) — G5 | all of it |
| M11 | pairing, roster, avatars | panel, POLICY | outside the flow table (identity / POLICY) — confirmed | all of it |
| M12 | wing claim | §15.5 (not built) | an owner row — but see G6 | — |
| M13 | `sent`, `localOnly`, `project`, id renumbering | both adapters | stays (bookkeeping and projection) | all of it |
**Yardstick numbers (§19 a–d).** (a) replaceable by rows ≈ 19 of 918 lines (≈2 %); the rest stays. (b) the Modeller zero-code probe, *predicted*: a new create-like op type = one row, generic code unchanged; a new kind of op that needs a new fold (rotate, scale) = **not** row-able — it is projection. (c) deletion budget: − the `CLASS` list and the `STATION_LOCAL` list and a handful of guards, + one virtual-table feature in `compile.js` and one flow-row set per host; roughly a wash in lines, a win in having **one** polarity. (d) "scales": the same compiler already compiles POS and Micro Finance rows; the ERP/Modeller rows have not been compiled — C1/C2 below.
### 2 Gap list — what the flow table cannot yet say
- **G1 Topology (the big one).** §16.16/§16.18 treatments are star-shaped. The team layer is a **mesh**: every member authors and receives, there is no hub holding derived truth — each device folds the same events (the derived-ledger hash is equal everywhere). Needs a strategy attribute `topology: star | mesh` and either a peer treatment (provisionally **MERGE**: every member both ways, nobody holds the derived truth) or a statement that mesh sits outside the treatments. §16.0a FL-2 ("one place holds the truth") must be restated as **one derivation function**, which both topologies satisfy.
- **G2 Virtual tables.** `bim_element` has no `ad_table` row; its columns (`geom_op`, `geom`, `pos_x|y|z`) are facts, not AD fields. `compile.js` needs a `virtual` form (declared columns); then G3 (ghost guard) is VACUOUS and G5 trivial for it — printed, not hidden.
- **G3 Local-only types** need no row or treatment (default-deny). The ERP adapter must flip polarity to match (see G9).
- **G4 Conflict surfacing** (per-column `pos_x` warnings, §15.4) is carriage: the flow table never needs it. Confirmed. The `old` value carried in a move is a precondition for the fold-time conflict rule, not copied state.
- **G5 Presence** (focus board, heads-up, avatars on the signed object) is not FACT/SEED/RULE/INSTRUMENT. Recommendation: keep it **outside** the flow table — it is soft state with a TTL, no history, no settlement.
- **G6 Wing claim.** Owner rows (§16.2) assume a device that arbitrates. In a mesh nobody does. Recommendation: an **advisory** claim (warn + people strip), per FL-3/FL-7 — detect, do not prevent — unless the owner wants a designated arbiter device for wings.
- **G7 Pairing / roster / avatar** are POLICY and identity — confirmed outside.
- **G8 Base typing.** The Modeller's seeded elements and the ERP's seed tables are base rows; iDempiere's POS strategy 100 knows neither `bim_element` nor the team ERP. They need their **own `AD_ReplicationStrategy` row** whose Reference rows are the base — no new rule, G4 simply reads it.
- **G9 Opposite defaults.** Modeller: default-deny (7 types). ERP: default-share (all but 5). §16 is default-deny; adopting it shrinks ERP team scope from ~998 tables to the strategy's Merge set (47 for the POS strategy; the ERP team strategy would be its own list). **That is a behaviour change** and needs the twin-rule check (every window / doctype) before it is adopted.
- **G10 Read isolation.** Both adapters give every member of a space the whole corpus (the space key) — the same fact as §16.14 B3, and in direct conflict with the *blind branch* of §16.0a for any team that wants roles. Not solvable by flow rows alone; audience keys.
### 3 Verdict on C1–C5 (§18) and order
- **C1** (generated plans run in the office-day simulator; existing witnesses quote the same numbers; §16.12 S2–S3): **NOT MET.** The engine's simulator is `build/scriptor/sim.js`, not `scripts/sim_comm_office_day.js`; no generated plan has run through the team witnesses.
- **C2** (Modeller `bim_element` has a pseudo-dictionary entry): **NOT MET**; blocked by G2, which is small.
- **C3** (plan-signing key): **NOT MET** — §16.13 Q1, owner-owned.
- **C4** (§17 T1/T4/T5 re-expressed on the scriptor's budget and owners): **NOT MET**; T1/T4/T5 are specs only (and are held).
- **C5** (Modeller authoring depth stays out): **MET** — nothing in §16 touches `prompts/Modeller/`.
**Recommended order:** (1) owner decision on **topology / MERGE** (G1) — everything else waits on it; (2) G2 virtual tables; (3) C2; (4) C1 (S2–S3); (5) C4; (6) C3 before any rollout. **First witnesses that would fall:** `W-TREAT-REGISTRY` must today reject a MERGE row ("unknown treatment") — red proves G1; and a `bim_element` row through `compile.js` today returns `no-table` — red proves G2.
### 4 Notes to §16's owner (me) — proposed, NOT applied
N1 reword FL-2 to "one derivation function" (§16.0a). N2 add `topology` to the strategy and decide MERGE vs "mesh is outside the treatments" (§16.18). N3 `compile.js`: virtual tables. N4 §16.14 B1: the arbiter is a hub **only in a star**; in a mesh the equivalent is the advisory claim (G6). N5 §16.17: add the team rows (wing claim, local-only ops, focus board, seeded elements) so the ledger covers both topologies. N6 state "undeclared = local" in §16.16 itself, since the two adapters disagree on the default.
### Limits of this review
Read-only and grep-based; no adapter function was run; the "19 of 918" figure is a count of matching lines, not a measured replacement; the ERP strategy comparison uses iDempiere's **POS** strategy, which is not the team ERP's intended scope — the 47 is an illustration of the gap, not a target. A fresh reviewer should re-do M1–M13 from the code before any of it is acted on.

#### §20a Cross-check with the Team session's closing answer (2026-10-25; the user pasted it; the Team session made no further edits and is handing off) — reconciles it with §20
**Agreement.** On their six questions (§19 mismatches) the two readings agree on five. The **boundary rule** both reach, and §16 adopts: **the engine owns *what moves, in which direction, on what schedule, and who holds it* — plus the typing of base rows and the declaration of owners. Carriage keeps: conflict judgement (per-column warnings, fold-time admission), enforcement (refuse vs warn, KEYCLAIM / POLICY), identity (pairing, roster, avatars), presence (focus board), the base **hash pin**, and projection.** If the engine starts absorbing conflict surfacing or presence it becomes the bloat it was meant to remove.
| # | Question | Team session | §20 | Reconciled |
|---|---|---|---|---|
| 1 | `bim_element` has no dictionary row | Replication — "the best test of *abstract*" | G2 | agree: virtual-table support in `compile.js` is the first compiler change |
| 2 | the 15 local-only op types | Replication: an **explicit Local row**, as the dictionary already types 220 tables Local | G3: nothing to declare (default-deny) | **adopt theirs as a refinement:** runtime stays default-deny (undeclared = local, nothing crosses), but a declared `Local` row is kept so the compile report can separate **declared local** from **unclassified** (the strategy's `unlisted` bucket: 551 tables in strategy 100). Unclassified is reported, never silently treated as decided |
| 3 | per-column conflict warnings | not replication — carriage | G4 | agree |
| 4 | who owns a wing | **split:** declaring owners fits §16; enforcement belongs to §13.12 policy/claims | G6 (mine mixed the two) | **adopt the split.** My "advisory, not arbiter" recommendation concerns the **enforcement** half and therefore moves to the claim machinery (§13.12.2 KEYCLAIM); §16 only holds the owner declaration |
| 5 | pairing, roster, avatars | not replication — identity/policy; avatars ride the signed presence object | G5, G7 | agree |
| 6 | shared building as base | **split:** typing seeded rows as Reference fits replication; pinning by hash is carriage | G8 | agree |
**One difference, resolved narrower.** §18 C4 said §17 T1, T4 and T5 would be re-expressed on the scriptor's budget and owners. Their closing answer says **only T1 (the scale ladder, it tests the plan budget) belongs to the engine**; T4 and T5 stay as they are. Adopted: **C4 = T1 only**, plus the *declaration* half of T5 (the wing owner row) and the *typing* half of T4 (the base rows as Reference). The rest of T4/T5 stays carriage and stays held (§20 HOLD).
**What their answer does not cover, and still gates everything: G1 topology.** Their phrase "who holds it" is a star-shaped question; in the team layer's mesh every member holds it. Whether the engine gets a `topology` attribute and a peer treatment (MERGE), or states that mesh sits outside the treatments, is the open owner decision of §20 §3 step (1). Their boundary rule does not settle it and does not contradict it: whichever way it is decided, the peer *declaration* is the engine's and the conflict handling stays carriage.
**Status after the cross-check:** §20's verdict and order stand; C4 is narrowed as above; the HOLD stands unchanged. **Update 2026-10-25 (user: "go"):** the topology question is answered — mesh is `FACT dir BOTH, audience space`, no fifth treatment (§16.18b); §20 §3 step (1) is done, steps (2)–(3) are next; the HOLD stands until the compile-only dry run passes.

#### §20b Note to the positioning owner (Team / evaluation session) — told, not applied (§18)
`docs/StrategicIndustryPositioning.md` has already absorbed the prior-art findings (risk 6; the "local-first sync and offline POS" landscape rows) and cites them at `prompts/prior_art_2026-10-25/`, which the site does not serve. A **published digest now exists**: `docs/LocalFirstPriorArt.md`, section *Update 2026-10-25* (written 2026-10-25; not deployed — publish only via `scripts/safe_gh_deploy.sh`). Suggestions: (1) point the landscape note and risk 6 to that page instead of the `prompts/` path; (2) the landscape note's "not re-verified in this pass" can now cite sourced rows for the sync engines, Ditto, CouchDB / PouchDB and the Square / Stripe / Adyen / SumUp offline payments — **but Unicenta and Odoo POS offline mode were not researched**, so those two names stay unverified; (3) keep "to our knowledge" and never "first"; (4) do **not** add the sceptic objections or the Thai-law gap (report 01) to a public page — they are internal. Nothing was edited in that file.

---

## §21 RESUME — the Replication engine lane (2026-10-25; user: *"Give a prompt for me to direct the next session in this new lane"*; this section is the prompt, paste it to start the session)

```text
# ⚠ DO NOT REMOVE — REPLICATION ENGINE LANE (continue; do not restart)
Scope: the Replication Strategy ("the spine"): a declarative flow table + a small engine of
treatments that decides WHAT moves, in which direction, on what schedule, and who holds it —
for POS, Micro Finance, ERP team mode and the Modeller. Read the log after every run; an exit
code is not evidence. Honour this block until the lane is DONE.

## Stance (owner, 2026-10-25)
Build it like the iDempiere Java core: a SMALL CORE + a REGISTRY OF COMPONENTS behind named
extension points; behaviour is added by registering a component and writing a row, never by
editing the core. Source of truth for how iDempiere does this: ~/idempiere-dev-setup/idempiere/
(model factories, process factories, callouts, validators, org.adempiere.replication).
VERIFY by grep and cite file:line before claiming a mechanism (AD-LAYER LAW 1). Measured, not argued:
lines replaced, zero-code probe (hash of core before/after), deletion budget (+/- lines).
The core may name no table, process or business word.

## Read first, in this order
1. /home/red1/bim-compiler/CLAUDE.md (PRIME RULE, PRIMAL LAW, AD-LAYER LAW, TWIN RULE) and
   ~/.claude/CLAUDE.md.
2. prompts/TEAMWORK_FRAMEWORK.md: §18 (who edits what — edit ONLY your own § numbers, exact-match
   edits, never a whole-file write, new text at the end), §16.0a (FL-1..FL-7), §16.2, §16.12–§16.20b
   (flow table, treatments, §16.18b mesh = FACT dir BOTH audience space), §16.14 (blockers), §20/§20a
   (review of the Team Modeller + ERP adapters), §19 (hand-off). Then docs/DistributedERP.md (box).
3. prompts/prior_art_2026-10-25/01..03 (skim): no production precedent for "no server at all";
   every system has an arbiter; claim only "to our knowledge", never "first".
4. Run and READ the logs: `node scripts/witness_scriptor_s1.js` (expect PASS judged=22) and
   `node scripts/witness_scriptor_treat.js` (expect PASS judged=30, 11 mutants killed). Code:
   build/scriptor/{scope,flow,compile,treat,sim}.js, flows.json, flows_extra.json.
   Engine = treat.js 93 + sim.js 76 lines; toolchain 245 lines. All SAMPLE data.

## State
- UNCOMMITTED in the shared tree: TEAMWORK_FRAMEWORK §16–§21, docs/DistributedERP.md,
  build/scriptor/, scripts/witness_scriptor_*.js, prompts/prior_art_2026-10-25/,
  scripts/film_replication_engine/. Commit/push only when the user says, and only your own hunks.
- A narrated English film was being built by a background agent: check §16.21 (if present) and
  ~/Videos/NoServerInTheSalePath_ReplicationEngine_EN_2026-10-25.mp4. Do not rebuild it. The engine's
  trace kind `local-sale` should become `local-action`, but only AFTER the film is final.
- HOLD (owner): everything on the multi-user environment waits for the engine — no change to what is
  shared in modeller/team_sync.js, erp/team_sync.js, common/comm/*; do not build the §17 tests T1/T4/T5;
  no multi-user handoffs. Allowed: spec, read-only measurement, engine work in build/scriptor/.

## Next, in order (spec first, witness claim first, each step ends with its log read)
1. compile.js: VIRTUAL TABLES (a table with no ad_table row, columns declared in the row). Witness:
   a `bim_element` row compiles; ghost guard prints VACUOUS; a typo'd column is red; mutant killed.
2. Make treatments registrable components (`register(name, component)`; the core only loops the
   registry). Probe: add a treatment as a NEW file without editing the core (hash identical).
3. `audience: space` on FACT + `W-TREAT-MESH` exactly as specced in §16.18b (write the arms first).
4. Compile-only DRY RUN: the Modeller's 7 shared op types and the ERP's table scope as rows, compared
   line by line with CLASS / STATION_LOCAL. Report numbers. NO adapter edits.
5. Only after (4) passes AND the owner says go: the Modeller adapter first, the ERP second (it flips
   from share-everything to default-deny: needs the every-window twin check).
6. SCALE PROBE (spec §16.26): ladders L1 flows, L2 hosts, L3 changes, L4 AD changes (L5 devices is blocked on S2/S3); predictions are stated in the spec before any run; read-only on adapters and engine.
Also open, do not decide for the owner: §16.13 Q1–Q8 (plan-signing key, record-level scope,
thresholds, closure variant, replenishment carrier, base list ...), the twin-rule witness
(admin books equal legacy's for the same documents), S2/S3 (plan format; generated plans in
scripts/sim_comm_office_day.js so existing witnesses quote the same numbers).

## Rules
Spec before code. Every test names the issue it proves; VACUOUS / NO-OP / INCONCLUSIVE are
verdicts, never PASS. Sample data labelled. The engine detects and reports; it never resolves
conflicts (carriage does). Agents: Sonnet. No GPU/bake without permission. Report ONLY: the ✅ list
(with witness log line) and the ⛔ questions. Update §16 results; do not edit MEMORY.md.
```

---

## §22 Engine lane log — Replication engine steps (2026-10-25; resume prompt §21; edited by the Replication session only, §18)
### §22.1 Step 1 — VIRTUAL TABLES in `compile.js` (spec written BEFORE code; closes §20 gap G2)
**Issue.** The Modeller's shared records (`bim_element`) and any host without an AD dictionary have no `ad_table` row, so `compile.js` returns `no-table` for them and the dry run (step 4) cannot even start. **Rule (AD-LAYER LAW 1, mirrored from iDempiere's `AD_Table`/`AD_Column`):** a virtual table is *the same thing as an AD table, declared in a row instead of in the dictionary* — one declaration row, then any number of flow rows name it. No compiler code names a table.
**Form (data only).** Declaration row: `{ "virtualTable": "bim_element", "columns": [ { "name", "cls": KEY|REF|MEASURE|DATE|FLAG|CODE|TEXT|OTHER, "target": <AD table or virtual table, REF only>, "mand": bool } ] }`. A flow row then says `"table": "bim_element"` exactly as for an AD table. `cls` is the class `flow.js classify` would have derived from the AD; for a virtual table the author states it because there is no dictionary to derive it from.
**Compile-time guards (each reported in the result as `virtualErrors`, each with a red arm):** (V1) `cls` is one of the eight classes; (V2) a REF has a `target` that resolves to an AD table or another declared virtual table; (V3) column names unique (case-insensitive); (V4) at least one column and at most one KEY; (V5) the name does not shadow an active AD table (`virtual-shadows-ad` on the flow). A flow row on a virtual table keeps every existing guard: a carried name that is not a declared column is `declaredMissing`; mandatory-uncarried is computed from `mand`.
**What is printed, not hidden (§20 G2).** The ghost guard (FL-6) judges AD fields that are read-only; a virtual table has no fields, so it is **VACUOUS** — the flow carries `ghostGuard: "VACUOUS"` and the witness prints 🟡 VACUOUS, never 🟢. `tableType` is `virtual` (the strategy has no row for it; typing the base is the per-host `AD_ReplicationStrategy` row, G8, later). A self-reference (`parent_id → bim_element`) is not a base requirement.
**Witness `W-VIRT-*` (`scripts/witness_scriptor_virtual.js`; written first, run RED before the code).** A1 a `bim_element` row compiles to `tableType virtual` with declared classes and the exact payload count · A2 ghost guard VACUOUS printed (and absent on AD flows) · A3 a typo'd carried column is `declaredMissing` · A4 each of V1–V5 turned red by a deliberately wrong declaration · A5 mandatory-uncarried follows `mand` · A6 AD flows' plan entries are byte-identical with and without the virtual rows in the same call (the feature is purely additive; NO-OP guard: compared > 0) · A7 zero-code: a *second* virtual table added as a row only compiles with the compiler code hash unchanged, and no compiler file names `bim_element` · A8 determinism and sensitivity (same rows → same sha256; one class changed → different). *Mutants (each must turn ≥ 1 arm red):* virtual declarations ignored · declaration validation off · VACUOUS label dropped. Sample declaration = TEST FIXTURE (columns from §20 G2: `geom_op`, `geom`, `pos_x|y|z`, plus a self-parent and one AD reference); the real 7-op rows come in step 4 from the adapter code, not from here.
**Regression gate:** `witness_scriptor_s1.js` PASS judged=22 and `witness_scriptor_treat.js` PASS judged=30 / 11 mutants, both unchanged after the edit. **Deletion budget** reported with the result.
### §22.2 Step 1 RESULT — ✅ DONE (witness, 2026-10-25)
RED first: `build/scriptor/virtual_RED_before.log` — `bim_element` row → `error=no-table`, 16 arms red. After: `build/scriptor/virtual.log` **`§VIRT_VERDICT PASS judged=23 fails=0 vacuous=1`** (the one VACUOUS is the FL-6 ghost guard, printed 🟡, by design). All five guards V1–V5 red on a wrong declaration; typo'd carried column → `declaredMissing=["pos_xx"]`; AD flows byte-identical with/without virtual rows (3 compared); a second virtual table (`x_widget`) = rows only, compiler code hash unchanged; no compiler file names a virtual table. Mutants: declarations ignored → 6 arms red · validation off → `W-VIRT-GUARDS` · VACUOUS label dropped → `W-VIRT-VACUOUS` (no survivor). **Regression:** `witness_scriptor_s1.js` PASS judged=22 (unchanged), `witness_scriptor_treat.js` PASS judged=30 (unchanged). **Deletion budget:** nothing deleted yet (the `CLASS` / `STATION_LOCAL` lists go at the adapter step); added generic code `flow.js` +27, `compile.js` +1 (non-blank, non-comment: 104→131, 19→20; toolchain 245→273) + one fixture `flows_virtual.json` (SAMPLE). A bug the log caught on the way: a comment appended to a one-line statement swallowed `out.baseTypes = bt` (printed `baseTypes=undefined`); fixed, and the arm now asserts `baseTypes={"AD_User":"M"}`.
### §22.3 Step 2 — TREATMENTS AS REGISTRABLE COMPONENTS (spec written BEFORE code; the iDempiere stance of §21)
**Issue.** `treat.js` defines FACT / SEED / RULE / INSTRUMENT inside the core file, and `sim.js` names two of them (`TREAT.T.INSTRUMENT.hubAfter`, `TREAT.T.RULE.hubAfter`, `TREAT.T.SEED.hubPublish`). A fifth treatment therefore means editing the core — the opposite of "behaviour is added by registering a component and writing a row". **Mechanism copied (to be cited file:line in the result, AD-LAYER LAW 1):** iDempiere's `IModelFactory` / `IProcessFactory` service registries (`org.adempiere.base.Service` / `ServiceLocator` look components up by name; `MTable.getClass` asks the registered factories in order), `ModelValidationEngine` calling every registered validator at a named point.
**Design.** `treat.js` becomes the core: a registry (`register(name, component)` — rejects a duplicate name and a component with no `needs` array; `get(name)`; `expand(rows)`; `validate(row)`) plus loading of every file in `build/scriptor/treatments/` (sorted) at start-up. Each built-in treatment moves *unchanged in behaviour* to its own file there (`fact.js`, `seed.js`, `rule.js`, `instrument.js`) and registers itself. **Named extension points** (the only contract): `needs` (row parameters) · `expand(row) → rows` · `deviceVisit(w, dev, row, view)` · `hubVisit(w, row)` · `onAccept(w, row, acceptedRow, fact)` (the hub accepted a fact; called for every row of every treatment that defines it, the component decides whether it applies — replaces the two named calls in `sim.js`) · `publish(w, row, value)` (replaces `publishSeed`/`T.SEED.hubPublish` by name; `World.publish(name, value)` looks the component up by the row's `treatment`). The core names no treatment; `sim.js` names none.
**Witness `W-REG-*` (`scripts/witness_scriptor_registry.js`; written first, run RED before the refactor).** R1 the registry rejects a duplicate name and a shapeless component · R2 **zero-code probe**: a new treatment (`ACK` — a device acknowledges a received fact; a test fixture in a temp dir, not in the repo's `treatments/`) is registered from a NEW file, a row names it, a `World` runs it end-to-end (the ack arrives at the hub, idempotent) with the **core files' sha256 identical before and after** · R3 an unregistered treatment name still fails `validate` ("unknown treatment") — the test can fail · R4 the core (`treat.js`, `sim.js`) names none of the four built-in treatments (grep) · R5 `onAccept` and `publish` reach their components by registry lookup (a probe component records both calls) · R6 behaviour preserved: `witness_scriptor_treat.js` PASS judged=30 / 11 mutants and the trace byte-identical to the pre-refactor `trace_film_*.json` (hash recorded before the edit — NO-OP guard: the hash was captured). *Mutants:* registry lookup bypassed (built-ins hard-wired) · duplicate registration allowed · `onAccept` not dispatched → each must turn ≥ 1 arm red.
**Deletion budget (stated, then measured):** delete the three by-name calls in `sim.js` and the inline `T = {}` block in `treat.js`; add ≈ 15 lines of registry. Net lines reported with the result.
### §22.4 Step 2 RESULT — ✅ DONE (witness, 2026-10-25)
RED first: `build/scriptor/registry_RED_before.log` (`TREAT.register is not a function`). After: `build/scriptor/registry.log` **`§REG_VERDICT PASS judged=13 fails=0`**. R2 zero-code probe: treatment `ACK` arrives as a NEW file (temp dir, `TREAT.loadDir`), one row names it, a `World` runs it end-to-end (ack reached the hub once across two cycles), **core sha256 identical before/after** (`treat.js`+`sim.js`). R1 duplicate name and shapeless component refused; R3 `unknown treatment NOPE` still red; R5 `onAccept` and `publish` reached a probe component by lookup. **R6 behaviour preserved:** `witness_scriptor_treat.js` PASS judged=30, 11/11 mutants killed, and both film traces equal the pre-refactor baseline (normalized sha256 of 155 + 45 events; baseline in `build/scriptor/trace_baseline.json` — the raw traces differ per run only by random ed25519 public keys, which the normalization replaces). Regression: `witness_scriptor_s1.js` PASS judged=22, `witness_scriptor_virtual.js` PASS judged=23 — both unchanged. Mutants: duplicate registration allowed → `W-REG-GUARDS` · lookup bypassed → red · `onAccept` not dispatched → `W-REG-POINTS` (no survivor).
**What the witness caught on the way (the arm R4 was written for):** first run red — `sim.js` `view()` hard-wired the relay prefixes `seed/` and `pub/` (SEED's names) inside the core. Fix: a sixth extension point `scope(w, dev) → prefixes`, each component declares what its devices may touch; `view()` is the union. This is also exactly the point step 3 needs (a space-audience flow lets a member read `o/<member>/<flow>/`).
**Mechanism cite (AD-LAYER LAW 1) — DONE, grep-verified 2026-10-25** (`~/idempiere-dev-setup/idempiere/org.adempiere.base/src/`): the contract is an interface with named points, `org/adempiere/base/IModelFactory.java:25` (`getClass(tableName)` :31, `getPO(...)` :40/:60); components are found through a service registry, `Service.locator()` `org/adempiere/base/Service.java:34`; the core asks every registered factory in turn and caches the winner, `org/compiere/model/MTable.java:257-261` (`Service.locator().list(IModelFactory.class).getServiceReferences()` then `for (IServiceReferenceHolder<IModelFactory> factory : factoryList)`; cache `:235`); event-style dispatch to every registered listener at a named point, `org/compiere/model/ModelValidationEngine.java` (`m_modelChangeListeners` :214, `addModelChange` registers by table name :346-355). Our `register` / `get` / `loadDir` / `onAccept` are the same shape; difference named: iDempiere lets several factories answer and takes the first non-null, ours is one component per treatment name and a duplicate is refused.
**Deletion budget (measured, non-blank non-comment lines):** core before `treat.js` 93 + `sim.js` 76 = 169; after `treat.js` 16 + `sim.js` 76 = **92 core**, plus 4 component files (fact 26, instrument 43, rule 10, seed 13 = 92). Net +15 lines; **removed from the core:** the four treatment bodies, three by-name calls in `sim.js` (`T.INSTRUMENT.hubAfter`, `T.RULE.hubAfter`, `T.SEED.hubPublish`), the hard-wired `seed/` `pub/` prefixes. `World.publishSeed` → `World.publish` (callers in `witness_scriptor_treat.js` updated).
**NAMED LIMIT L1 (not fixed; step-2 spec did not cover it):** INSTRUMENT state still lives in the core device (`dev.applied`, `dev.balance`, `dev.seq` in `World.addDevice`/`wipe`) and `World.restore` fold-back recognises `.applied` / `.issued` flow suffixes. A sixth treatment with its own device state cannot fold back without editing the core. Candidate fix = a `restoreFact(w, dev, fact)` point plus per-treatment device state; queue it after step 3, owner not asked (an internal engine matter).
### §22.5 Step 3 — `audience: space` ON FACT + `W-TREAT-MESH` (spec written BEFORE code; arms before code; implements §16.18b exactly)
**Issue.** The team layer is a mesh (every member authors and receives, nobody holds derived truth). The engine today is star-only: a device reads only its own `o/<id>/` and `d/<id>/` (the `scope` of `fact.js`). §16.18b decided: no fifth treatment — a FACT row with **`dir: BOTH`, `audience: space`**.
**Semantics (from §16.18b; nothing new invented).** (a) *Declaration:* `audience` is `hub` (default) or `space`; `space` requires `dir: BOTH` (validated at compile time — a `space` row with UP/DOWN is red, a `BOTH` row with `hub` is red: in a star there is no both-ways). (b) *Carriage:* a member PUTS its facts to its own `o/<id>/<flow>/<key>.<hash>` (unchanged, content-addressed); every member's visit LISTS `o/<member>/<flow>/` of **that flow only**, for every member of the space, and ingests facts it has not seen — never another flow, never a non-member. (c) *Scope (I1):* `fact.scope(w, dev)` returns, for each space-audience row whose role the device holds, the prefix `o/<member>/<flow-name>/` for each member of that row's space; a device whose role is not in the row gets nothing extra, and a path outside the union still throws. (d) *No derived-truth holder:* no hub RULE/INSTRUMENT is run for a space row; each member computes `fold(accepted)` — the sorted-by-key canonical list of accepted facts — and **the hash of that fold is equal on every member**. (e) *Conflicts stay in carriage:* when two facts share a key with different content the member records a **collision** (same detector as the hub's I3: flagged on every device, neither overwritten); the engine has no resolve function.
**Membership.** Members of a space = the devices whose `role` equals the row's `role` (a sample rule for the prototype; the real set is the signed plan's roster, §16.13 Q1 — named limit). The row carries `role` as every FACT row does.
**Extension-point use.** Only existing points: `needs` (add nothing — `audience` is optional), `scope`, `deviceVisit`. The new bits live in `treatments/fact.js` (≈ 15 lines) and one validation point: a component may state `check(row) → [errors]` (point 7, called by `validate`) so that FACT can refuse `space` without `BOTH` without the core knowing FACT.
**`W-TREAT-MESH` (`scripts/witness_scriptor_mesh.js`, arms written FIRST, run RED, then built).** M1 A and B (same role) edit *different* element keys: after one cycle each device holds both · M2 both edit the SAME key with different content: a collision is flagged on **both** devices, neither fact is overwritten, no resolve function exists (grep the engine for `resolve`/`merge` returns 0) · M3 the fold hash is **identical on A and B** and differs from a control where one fact is withheld (order-independence: B ingests in the opposite order, same hash) · M4 a device outside the space (other role) lists/reads none of the flow: `scope` throws, and with the control (inside the space) it reads · M5 a third member C added later (late joiner) catches up from the shelf alone and reaches the same fold hash · M6 every existing star arm unchanged (`witness_scriptor_treat.js` PASS judged=30, 11/11; traces equal baseline; registry PASS 13) · M7 compile-time: `space` with `UP` red, `hub` with `BOTH` red. NO-OP/VACUOUS guards: zero facts exchanged prints INCONCLUSIVE; a fold of fewer than 2 members prints VACUOUS. *Mutants (each ≥ 1 red arm):* space-scope off (member sees only own) · audience ignored (non-member reads) · a resolving function present (last-writer-wins overwrite) · fold order-dependent (insertion order instead of sorted).
**Deletion budget:** none expected (additive); lines reported. Hold stays until step 4.
### §22.6 Step 3 RESULT — ✅ DONE (witness, 2026-10-25)
RED first: `build/scriptor/mesh_RED_before.log` (no mesh carriage: A=, B= empty, 0 puts; `fold` missing). After: `build/scriptor/mesh.log` **`§MESH_VERDICT PASS judged=25 fails=0 vacuous=0`**. M1 A and B edit different keys → each holds `K1,K2` · M2 same key, different content → collision flagged on **both** (A=1, B=1), both versions kept on both (2 contents each), engine grep `resolve|lastWriter` = 0 hits · M3 fold hash **equal on A and B although B ingested in the opposite order** (`insertion order A=K1,K2 B=K2,K1`, `c472db59c7ea`), equal under a collision (the contest is part of the fold, `9eb1cbb292ff`) and different from it, and a control with a fact not yet received differs · M4 a device of another role: `out-of-scope O o/A/E1 element/` thrown; control member lists 1 name; a member cannot read A's OTHER flow (`o/A/F1 pos-sales-up/` throws) · M5 late member C catches up from the shelf alone (`K1,K2,K4`, one fold on A, B, C) · M8 star + mesh in one world: the hub holds the sale and **nothing** of the mesh · M7 declaration checks: `space`+`UP` red, `hub`+`BOTH` red, unknown audience red, `space`+`BOTH` ok. **M6 star unchanged** (child runs): treat PASS 30, registry PASS 13, virtual PASS 23, s1 PASS 22. Mutants (no survivor): space scope off · audience ignored → `W-MESH-SCOPE` · keep-only-latest → `W-MESH-COLLIDE`, `W-MESH-FOLD` · arrival-order fold → `W-MESH-FOLD`, `W-MESH-LATE` · collision flag off → `W-MESH-COLLIDE` (the first mutant shows a THROW as its red — the scope check fires inside the visit; a throw is a red, not a clean arm).
**Design points that came out of the build (not in the spec text, now fact):** the fold is over *sets of content hashes per key*, so a contested key folds identically everywhere — detection is part of the derivation, no member "wins"; membership = devices whose `role` equals the row's role (sample rule; the real set is the signed roster, §16.13 Q1); `check(row)` is a 7th extension point (`validate` calls it), so FACT validates `dir`/`audience` without the core knowing FACT. The virtual-table fixture `flows_virtual.json` rows now carry `"audience": "space"` (a `BOTH` row without it is red since this step).
**Deletion/addition budget (non-blank non-comment lines):** core `treat.js` 16→17 (+1, the `check` point), `sim.js` 76→76 (0), `treatments/fact.js` 26→61 (+35, all mesh). Nothing removed (additive by design). Engine total now: core 93 + components 127.
**Hold:** unchanged — step 4 (compile-only dry run of the Modeller's 7 op types and the ERP table scope) is next; no adapter file was touched in this lane (`git status` on bim-ootb not involved; this repo: only `build/scriptor/*`, `scripts/witness_scriptor_*.js`, §22).
### §22.7 Step 4 — COMPILE-ONLY DRY RUN: the Modeller's shared op types and the ERP's table scope as rows (spec written BEFORE code; NO adapter edits; reads bim-ootb by `git show` at the pinned commit `4e95b393` only)
**Issue.** The hold lifts only when the rows that would replace the hard-coded lists compile and are shown equal to them. §20 predicted "7 flow rows on a virtual table" and "STATION_LOCAL → strategy L"; both were grep-based estimates and unrun. **Method (read-only):** extract from the pinned adapter sources — Modeller: `CLASS` (`modeller/team_sync.js:25`), the create field set and the move columns written by `translate` (`:72-92`), and the denominator N (all `GEOM_[A-Z_]+` names in `bonsai_kernel_worker.js` + `bonsai_kernel.js`, the same method as `§TM-XOFN`); ERP: `STATION_LOCAL` (`erp/team_sync.js:36`). Write the rows **by hand first** (fixtures `flows_modeller.json`, `flows_erp.json`), compile them, and diff against the extraction — the diff is the finding, not a pass condition to be tuned to.
**Prediction to be proved or corrected (stated before the run):** (P1) the Modeller's 6 create types are **values of one column** (`geom_op`, a Reference List in AD terms) and `GEOM_MOVE` is not a row at all but the write to the three carried measure columns `pos_x|y|z` — so 7 shared op types = **1 virtual table + 1 FACT row + 6 list values**, not 7 rows (this corrects §20 M1). A new create-like op type = one list value (data), no code. (P2) A first hand-written row set will be **incomplete** against `translate` (the create also writes `output_guid`, `input_guids`, `ad_client_id`, `ad_org_id`); the diff shows exactly which. (P3) `STATION_LOCAL` as 5 declared-Local rows equals the extraction; strategy-100 typing gives 4 `L` + 1 unlisted (§20 M5, to be re-measured). (P4) Default-deny with the strategy's Merge set shares **far fewer** tables than today's ~998, and the core trade-cycle sample is **not** fully inside it (§20 G9 — the behaviour change that needs the every-window twin check); the numbers decide how big.
**Engine additions this step needs (each minimal, each with a witness arm):** (1b) a virtual CODE column may declare `values: [...]` (V6: only on CODE, non-empty, unique strings); the plan carries them, so adding a value changes the plan hash. (L) a sixth component `treatments/local.js` — `LOCAL`, a *declared* Local row (§20a #2: runtime stays default-deny; the row lets the report separate declared-local from unclassified) — registered as a new file, core untouched.
**Witness `W-DRY-*` (`scripts/witness_scriptor_dryrun.js`; run RED first).** D1 the Modeller rows compile (0 errors) · D2 `values(geom_op)` equals the extracted CLASS create keys · D3 carried `pos_x|y|z` equals the extracted move columns · D4 the create field set written by `translate` vs the row's payload + implicit — **diff printed**; red until the rows are complete · D5 shared-by-rows (6 creates + the move) equals `Object.keys(CLASS)` · D6 N from the sources, shared ⊂ N, local-only = N − 7 are exactly the names no row mentions (undeclared = local) · D7 ERP: the 5 LOCAL rows equal the extracted `STATION_LOCAL`; strategy typing counts re-measured · D8 ERP at scale: one FACT row per strategy-100 Merge table compiles; counts today (active tables − 5) vs rows (Merge) vs lost; core trade-cycle sample membership printed (a named, labelled sample list) · D9 mutants: a column dropped from the rows → D4 red; a list value added → D2/D5 red; a LOCAL row dropped → D7 red; an extra op in the extraction (simulated) → D5 red. NO-OP guard: extractions must be non-empty (else INCONCLUSIVE). **Deletion budget:** reported as lines the rows would replace (the `CLASS` line, the `STATION_LOCAL` line, guards that become compile-time) — nothing is deleted in this step.

### §16.21 Film record — "No server in the sale path" (English, 2026-10-25)
**File:** `~/Videos/NoServerInTheSalePath_ReplicationEngine_EN_2026-10-25.mp4` — 1920x1080, 24 fps, **300.42 s (5:00)**, 18.5 MB. Built from `scripts/film_replication_engine/` (`core.js` plan + counters, `facts.js` facts.json with a source per fact, `beats.js`, `stage.html` + `stage.js` the replay page, `film_replication_engine.js` recorder, `film_replication_engine_tsv.js` narration, `fit/` caption / mux / check copies). Scratch + passes: `/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/film_replication_engine/` (p0 first draft, p1 and p2 kept; **p3 ships**). Picture = the engine's own `trace_film_pos.json` (155 events) and `trace_film_mf.json` (45), engine untouched; `treat.log` re-run first: `§TREAT_VERDICT PASS judged=30 fails=0`.
**Method.** The page is a pure function of the film clock; the recorder steps it frame by frame (CPU, headless Chrome `--disable-gpu`), so picture and cue cannot drift. Each ONLINE window (zero length on the trace clock) is shown for a fixed 4.0 s.
**Measured (from the logs and the file, not by eye).** frames silent = final = 7210; video 300.417 s, audio 300.416 s; narration fit **22/22 DETAIL**, 19 tone checks OK / 0 WRONG; max |spoken onset - §FILM_CUE| = **0.05 s** (22 beats); loudness two-pass: pass 1 I=-23.7 LUFS, final **I=-16.4 LUFS, LRA 3.1 LU, peak -1.3 dBFS**; silencedetect n=-40dB d=2: 7 gaps, longest **4.79 s**; captions 52, **0 outside the band** (`sub_fit.py` bbox, min top y=940, band from 930); `§NUM_CHECK` 58 spoken numbers = 50 facts, none spoken that was not requested from facts.json (count per value); OFFLINE label: **22,100 label checks (every frame, every actor) DOM vs an independent recomputation from the trace, 0 mismatches**, 24/24 online runs exactly 4.00 s, 75 shelf events all on frames where the DOM shows their actor ONLINE (control detects a mismatch), outage sample: A OFF + NO LINK tag, queue 5 = trace `visit-failed.queued` 5; failure samples (A / HQ / shelf lost) show the lost card; COLLISION and overspend flags on the HQ card; rebuild 10 records = 10, shelf 14 -> 14, mirror 14; on-screen counters day 1 = 13 / 17 / 2 / 4 and MF = 12 / 9 / 1 / 6, equal to `§TREAT_PANEL`; layout witness: 1740 changed frames, 0 clipped or truncated text blocks.
**Defects found while filming, and fixes.** (1) the roster object was shown as the gold price on a borrower card ("[object Object]") - only S2 pulls feed the price now; (2) HQ log line for the lost admin device read "unsent" (a device-only field) - separate wording; (3) the lost-card ribbon covered the stats - now a stamp over the log area; (4) the shelf and price board lists were clipped by a fixed box - sized per card; (5) three on-screen notes (A restore, HQ overspend, HQ replenishment) wrapped past their box - shortened (found by the layout witness, p1 -> p3); (6) one narration question ended with a rising tone where a fall was wanted ("What if a ticket number is reused?", "How?") - rephrased; (7) the first number check was vacuous (a prose "one" passed because some fact equals 1) - now counted per value, and four prose number words were removed.
**Decisions where the spec was silent.** Beats 7 and 8 reveal their result at HQ's 18:05 visit and the trace is chronological, so the film plays 7 (10:30), 8 (11:00) and a short "8b" settlement beat. The word "illegal" (FL-7 user quote) is not narrated or shown (no legal statements); the film says "caught at settlement: blacklist candidate". The recap card is `ServerDead_desktop_work/work/cards/problem.png`, scaled to the 930 px app area. The Micro Finance run has no mailbox device (that trace was built without a mirror), so that stage has no mirror card. The "0 of 8 records" control comes from `W-TREAT-PIPEFAIL` (a separate scenario of 8 records; the film day rebuilds 10) and is labelled as that test. The closing narration adds one sentence on the same four kinds of rows / 169 engine lines (from `treat.log`). A cashier issuing a code (`earn` / `redeem`) is drawn on the card but is not a USER-lane tick, because the engine's own counters do not count it (13 local actions on day 1 must equal `§TREAT_PANEL`). Length 5:00, not the 4:00-4:30 target: 24 fixed 4 s windows plus 257 s (4:17) of narration; trimming would mean shortening the windows or the narration.
**NOT done:** the Thai cut; a native-listener review of the English tone; a Thai/Edge fit; nothing committed, pushed or deployed.
### §22.8 Step 4 RESULT — ✅ DONE (witness, 2026-10-25): compile-only dry run passes; one OPEN item (G9); no adapter file touched
RED first: `build/scriptor/dryrun_RED_before.log` (D2/D4/D5 red: no list values, 4 create fields missing). After: `build/scriptor/dryrun.log` **`§DRY_VERDICT PASS judged=13 fails=0 open=1`**, read against bim-ootb `4e95b393` by `git show` only. Engine additions this step: virtual CODE column `values` (guard V6, 2 arms in the virtual witness, now PASS judged=25) and `treatments/local.js` (2 lines, a new file, core untouched). Regression: s1 PASS 22 · treat PASS 30 / 11 mutants · registry PASS 13 · virtual PASS 25 · mesh PASS 25 (re-run after the change).
**Predictions, stated before the run (§22.7) — all four held:** **P1 ✅** the Modeller's 7 shared op types = **1 virtual table + 1 FACT row + 6 list values** (`D2`: values equal CLASS create keys, 6 = 6; `D3`: carried `pos_x|y|z` equal the move's written columns; `D5`: 6 + the move = `Object.keys(CLASS)`, 7 = 7). **This corrects §20 M1** ("7 flow rows"): `GEOM_MOVE` is not a row, it is the write to three carried measure columns; a new create-like op type = one list value (data). **P2 ✅** the first hand-written row set was incomplete — `D4` showed exactly `ad_client_id, ad_org_id, input_guids, output_guid` missing (identity `element_id` rides in the envelope target, not in the fields); completed, then equal. **P3 ✅** the 5 declared-Local rows equal `STATION_LOCAL` (`D7`); strategy 100 types 4 of them `L` and `ad_recentitem` unlisted. **P4 ✅** re-measured from the AD: 1,003 active tables = **M 47 · R 188 · L 217 · unlisted 551** (the §20 estimates were exact). Today's team ERP shares **998** (all but the 5); default-deny with the Merge rows shares **47**; **951 tables (95 %) would stop being shared**. One row per Merge table compiles: 47 rows, 0 errors, 1.2 s.
**Denominator:** N = **22** GEOM names in `bonsai_kernel_worker.js` + `bonsai_kernel.js`; shared 7; the **15** local-only names are exactly the ones no row mentions (undeclared = local): `GEOM_ARRAY, CHAMFER_DIST_ANGLE, CUT, CUT_MOVE, CUT_RESIZE, DRAFT, FILLET, FILLET_VARIABLE, GRID_MOVE, OFFSET, OPENING, ROOM_MOVE, ROTATE, SCALE, SHELL`.
**OPEN (G9, owner-owned; not decided here):** of a named *core trade-cycle sample* of 20 tables (orders, purchasing, inventory, invoices, payments, posting, costing — CLAUDE.md AD-LAYER LAW 6; a labelled list, not a decision) **14 are inside strategy-100 Merge**; outside: `C_AllocationHdr=L, M_Requisition=L, M_StorageReservation=unlisted, Fact_Acct=L, M_CostDetail=unlisted, M_Product=R`. Reading, as facts not verdicts: `Fact_Acct` and `M_CostDetail` are *derived* (FL-2: each member derives them, so not sharing them is the point); `M_Product=R` is a seeded base (shared as base, §16.18 SEED), not edited; `C_AllocationHdr`, `M_Requisition`, `M_StorageReservation` are real gaps for a team ERP strategy. Strategy 100 is the **POS** strategy; a team-ERP strategy does not exist yet. Adopting default-deny on the ERP is the behaviour change that needs the every-window twin check (§20 G9) — this witness does not discharge it.
**New findings (to hand to the Team session when the hold lifts; not edited into their sections, §18):** (F1) §20 M1 corrected as above. (F2) `input_guids` is a **list of references** to other elements; the AD has no list-of-reference type, so it is declared `OTHER` and the closure guard (SD-2) cannot see those references — named gap **G11**. (F3) the 5 `STATION_LOCAL` + the 4 hard-coded guards (`create-with-parent`, `target-not-a-team-record`, `fk-target-not-shared`) stay in the adapters; only the lists move to rows. **Line honesty:** JSON rows are *more* lines than the two JS lists they replace (CLASS: 1 line → 1 declaration + 1 row + 6 values; STATION_LOCAL: 1 line → 5 rows). The win is not line count: one polarity (default-deny), compile-time validation, and the lists become data a dictionary can supply. Engine total now (non-blank non-comment): `scope.js` 122 + `flow.js` 132 + `compile.js` 20 = 274 (S1 baseline 245); core `treat.js` 17 + `sim.js` 76; components fact 61 · instrument 43 · seed 13 · rule 10 · local 2.
**State of the order (§16.18b / §21):** steps 1–4 done. **Step 5 (the Modeller adapter first, then the ERP) waits for the owner's "go"** and, for the ERP, for the team-ERP strategy + twin check. HOLD unchanged. Not done / queued: L1 (§22.4), the `local-sale` → `local-action` rename (after the film), §16.13 Q1–Q8, S2/S3.

---

## §23 Owner's ideas register — PLANNED, NOT BUILT (2026-10-25; user: *"I wanna add more ideas, for u to take note, and plan for it, not adhoc react as these are just my random thoughts"*)
**Rules for this section.** Each idea is written down as the owner said it, read against what already exists, mapped to the engine/Team pieces, given witness claims, and parked behind the HOLD (§20: nothing that changes what is shared or adds Team features is built until the engine lane clears). New ideas are appended as 2, 3 … here; none is acted on without the owner saying go. Ownership (§18): presence/heads-up code is the Team session's; row declarations are the Replication session's — the plan below is split that way.
### Idea 1 — "Inform the other person before proceeding" (1a awareness · 1b notes)
**As said.** (1a) *"When a user is in the same doc or part of another user already noted in user's space or local, there be a code to highlight that user needs to inform or chat with the other before proceeding to give a heads up or be on the same page."* (1b) *"Or there are notes that team members put in, ie a link to some issue tracker etc., or simply to inform what they are doing, so that others may decide before acting further."*
**My reading (to be corrected by the owner).** Two layers. *Awareness:* the app knows that someone else is on this record/part and raises a visible "talk first" cue on the person about to act. *Communication:* a short note attached to the record or part — free text, a link to an issue, or "what I am doing" — that others see before they act. The cue is a nudge, not a lock.
**What already exists (verified 2026-10-25).** (a) Presence: the focus board, people strip and heads-up label (`common/comm/team_focus.js`; ERP `witness_people_strip`; Modeller `#team-headsup`, §15.14–15.15) — soft state with a TTL, sealed like any head content; it already says "X is editing this", it does not yet escalate or carry text. (b) **Legacy twin mechanism for 1b:** iDempiere's record **Chat** — `CM_Chat` (one per `AD_Table_ID` + `Record_ID`, looked up at `org/compiere/model/MChat.java:234`) with `CM_ChatEntry` rows, UI `webui/window/WChat.java`, opened from the window toolbar (`AbstractADWindowContent.java`); also `AD_Note`, `AD_Attachment`, `R_Request`. In our AD (`ad_full.db`): `cm_chat` (id 876) and `cm_chatentry` (877) exist, `ad_note` (389) and `ad_attachment` (254) are `L` in strategy 100, `r_request` (417) is `M`; `cm_chat*` are unlisted. By the TWIN RULE and AD-LAYER LAW 1 the note/link carrier should be the **legacy chat tables, driven by the generic AD engine**, not a new bespoke note store; the awareness overlay is team-mode-only (it does not exist in legacy, and is off without team mode).
**Mapping to the engine (what is a row, what is carriage).**
| Piece | Kind | Where |
|---|---|---|
| a durable note on a record/part (text, link, "what I'm doing") | **FACT** `dir BOTH, audience space` on `CM_ChatEntry` (+ `CM_Chat` header) — two rows, no engine code (the §22.6 mesh) | Replication: rows; needs a team strategy typing both Merge |
| the polymorphic pointer (`AD_Table_ID` + `Record_ID`) | engine edge ER-5 *unbounded* (`scope.js`): closure cannot follow it | gap **G12**: the team layer addresses records by `uu`; the note must carry the target's `uu` (as `bim_element` already does), not a numeric `Record_ID` |
| "someone else is here / has a note I have not read" cue | derived UI rule over (focus board ∪ unread-note count) — **detect, never prevent** (FL-3/FL-7); a prompt to open the record's chat, not a block | Team session (presence, §15.x); outside the flow table (G5) |
| short-lived "I'm doing X" status | soft state with a TTL (extends the focus entry with a text field) vs durable chat entry — owner chooses which | Team session |
| link in a note | rendered as a link with no fetch, no preview, `rel=noopener` (serverless, nothing leaves the device by itself) | Team session |
**Plan (spec first; none started).** P-1 owner confirms the reading and the open questions below. P-2 spec section by the Team session: the cue's triggers, clearing rule, TTL, wording (legacy message text where a message exists — `AD_Message`). P-3 Replication adds the two chat rows to the team strategy and a dry-run compile (extends `witness_scriptor_dryrun.js`, D-arm: both tables compile, `uu`-addressed). P-4 witness-first build by the Team session after the HOLD clears. P-5 twin check: with team mode off, the ERP/legacy chat window behaves exactly as before (CLAUDE.md TWIN RULE).
**Witness claims (each names the issue it would prove; written before any code).** `N1` a note by A on record X, with a link, reaches B byte-identical (link untouched, never fetched) — issue: "notes are lost or rewritten in carriage" · `N2` B opens X while A has focus on X → the cue is raised on B and not on a control record — issue: "no warning when two people are on the same record" · `N3` B opens X with an unread note by A and no live focus → cue raised (the 1b case) · `N4` B reads/replies → cue clears on B only · `N5` B can still edit with the cue showing (**detect, not prevent**); a mutant that blocks must turn the arm red · `N6` a late joiner C sees the existing notes from the shelf alone, same fold hash as A and B · `N7` a status note expires after its TTL, a chat entry does not · `N8` a device outside the audience reads none of it (scope, §22.6 M4). Guards: a cue computed over zero devices prints VACUOUS; zero notes exchanged prints INCONCLUSIVE.
**Open questions only the owner can answer (collected, not asked now).** (Q-A) Is the cue ever a hard stop — e.g. two people on the same *column* of the same record — or always advisory? (Q-B) Granularity of "same part": document, document line, Modeller element, wing/zone? (Q-C) Should "what I'm doing" persist (a chat entry, in history) or expire (a status)? Both? (Q-D) Link policy: any URL, or only hosts the space lists? (Q-E) Does an unread note by someone else on a record I am about to Complete need an explicit acknowledge, or only a visible count?
**Status:** parked. First possible touch = P-3 (compile-only, no behaviour change) once the owner says so.

### §16.23 Film 2 storyboard v2 — "Keeping the bloat off: the dictionary, replication, and a serverless day" (educational; 2026-10-25) — **PLAN ONLY; NOTHING BUILT OR RECORDED; waits for the user's OK.** Supersedes the first §16.23 plan (the Unicenta-fork case is dropped — returns and loyalty stay a hypothesis the engine tests; the other-projects opener is REINSTATED in short form, with logos, by the user's word of 2026-10-25; §16.22 is reserved for the Thai film record).
> **The story, in the project leader's words (2026-10-25):** *"Replication and AD Strategy reduces bloat entirely. Explain a bit about the AD concept and the use of _IDs as main payload. Then Replication. Then how we putting it together in local serverless where most data transfer need no realtime connectivity."* · *"Need not reference the fork. It is a sound concept to hypothesise."*
**Wording of the claim.** The film says the abstraction **keeps three kinds of bloat off**, each with its number: *payload* (ids instead of content), *scope code* (rows read by one small engine instead of per-host lists), *network chatter* (visits, not a live connection). It also says what stays, in the same breath: about 98 % of the two team adapters (carriage, projection, pairing, UI) is not replaced, and the JSON rows are *more* lines than the two lists they replace (§22.8). "Entirely" is therefore not put in the narrator's mouth as a measured fact; "keeps the bloat off" is.
**Outside references: a short opener only, logos allowed (user, 2026-10-25: *"you may refer from our other parties issues in general — saying we look at similar projects (display their logos) and learn from their challenges among which…"*).** Parts 1–3 contain **no** outside claim: everything in them is a live read-only query of our own dictionary (`ad_full.db`) or a line from our own logs, plus iDempiere's open source cited by file and line (`MLookupFactory.java:192-214`, `MQuery.getZoomTableName`). The outside material is confined to the **opener** and the **Sources card** at the end, and is *general*: it names challenges projects have reported, not verdicts on any project.
**Form.** ≈ 8 min (≈1 min opener + 7); two voices; English first, Thai after; the house format; CPU only. Visuals: real query results from the dictionary on screen, log lines as text panels, and the Film-1 stage for the sample day. Facts come from a generated `facts.json` (logs `s1.log`, `treat.log`, `registry`, `virtual`, `mesh`, `dryrun` and the live queries), so every spoken number is read, not typed.
**Opener — projects we studied (≈1:00).**
- *Line:* "We looked at similar projects and learned from the challenges they report. Among them:" — a wall of up to ~12 projects, **logos where their own terms allow, the project's name as plain text where they do not** (candidates from the research, the final set fixed by the ledger): Automerge · Yjs · Rocicorp Zero · ElectricSQL · PowerSync · Couchbase · Ditto · CouchDB / PouchDB · MongoDB Atlas Device Sync (Realm) · Secure Scuttlebutt · Nostr · Anytype · Matrix · Syncthing · Delta Chat · Briar.
- *Then six challenge cards,* each a plain sentence with a **source bar** (publisher, title, date) and, where the challenge was reported about a particular project, **that project's name or logo beside the cited statement**. In the film each card points to where our design answers it — or says plainly that it does not yet:
  1. **The sync scope is written by hand, app by app** (the engines' own documentation) → Part 2: rows, one default, checked at compile time.
  2. **Different versions on different devices are a top support problem** (user threads; the local-first essay on schema evolution) → **not solved yet:** event versioning is design only (§13.12.J.2); the film says so.
  3. **A "dumb" relay turns out not to be** (a measurement study of relays; the relay-based mail project's own notes) → Part 3: a stated post-office contract, a mirror, and a hub that is named.
  4. **History keeps growing and first sync slows** (a maintainer's account; a CRDT project's own posts) → Part 3: checkpoints and fold-back from the shelf (both built and witnessed).
  5. **Pure peer-to-peer systems ended up adding an always-on helper** (their own documentation) → Part 3: the helper is an explicit role, the blind mailbox device.
  6. **Products change direction or are retired, so dependence is a risk** (the vendors' own announcements) → Part 3: the data is local and the shelf is any dumb store.
- *Standard: academic fair comment (user, 2026-10-25: "this is an academic paper, not a lawsuit, so ease up on avoiding backlash.. go for fair comment").* The bar is **accuracy and attribution**, not defensiveness: (1) every fact is true and cited — quote ≤ 25 words with URL, publisher, date and our access date; (2) a challenge **may be tied to the project it was reported about**, with the project's logo beside the cited statement; (3) criticism and interpretation are allowed and **labelled as our reading** ("our reading: …"), kept separate from the quoted fact; (4) figures appear when verified in the source (the paper, the post), not from memory; a claim seen only as a snippet or a third-party summary is dropped or marked "reported by …"; (5) where a project's later announcement changes the picture, we show the later one.
- *Logos (user-permitted):* taken from the project's own site, brand page or repository, unmodified (not redrawn, recoloured or distorted), shown beside the project's cited statement and on the opener wall and the Sources card; the ledger records each file's URL and access date, and a licence or brand-guideline line where one is published. If no official file can be found, the plain-text name is shown. One line on the Sources card: *"Logos and names are trademarks of their owners, shown to identify the projects discussed."* No further legal review is claimed.
- *Sources card (end):* every citation with URL, publisher, date of source and our access date; honest note on read depth (full page / page summary).

**Part 1 — The dictionary, and ids as the payload (≈2:00).**
- The system describes itself in tables. Live: 1,076 tables, 26,519 columns. Every table has a key `<Table>_ID` and a `<Table>_UU`; a column ending `_ID` points at another table — **9,313 pointers**, each set equal to an independent SQL recomputation (ER-1 3,783 · ER-2 5,173 · ER-4 357).
- So a record is mostly ids. Live: `C_OrderLine` has 60 columns; the sale line sends **6** — the product id, the unit id, the quantity, plus its own identity and partition. The names, prices and descriptions live in the master rows every device already holds (the seed).
- The dictionary also says what a person types and what the system computes (read-only fields): computed values never cross (`MovementQty` flagged, the order header authored by the receiver).
- On-screen honesty: an id is a pointer, **not encryption** — small integers, a public seed can be decoded, volume and timing still show, so flows are still sealed; integer keys collide across stations, so a record made on a device is addressed by `<table>_uu` (§11.1).
**Part 2 — Replication (≈2:00).**
- iDempiere already has the idea: each table is Reference (flows down), Merge (both ways) or Local (stays). Live, strategy 100 (POS): **47 Merge · 188 Reference · 217 Local · 551 not yet classified**, of 1,003 active tables.
- Ours: **one flow row** (which table and columns, direction, who may read, when) read by four handlers behind a registry. Live and from the witnesses: a new flow by one row (`C_InvoiceLine`), a new handler as a new file with the core's hash unchanged, a new virtual table (`bim_element`) by one row; a deliberately wrong row failing at compile time.
- The dry run: the Modeller's 7 shared op types = **1 virtual table + 1 row + 6 list values**; the 5 declared-Local rows **equal** the ERP's `STATION_LOCAL`; today's team ERP shares **998** tables, default-deny with the Merge rows shares **47**.
- The honest ledger: engine 274 + 17 + 76 + components 129 lines; rows are more lines than the lists; the win is one default, compile-time checks, data instead of code, additions by row.
**Part 3 — Putting it together: local, serverless, mostly no live connection (≈3:00).**
- Each device is its own database and visits a plain shelf now and then. The sample day: a branch OFFLINE almost all day (red label), **13 local actions**, the admin acts **twice**.
- *Why most transfers need no realtime:* facts only append and are idempotent; ids resolve on the device itself; stock is derived at the centre and the branch just keeps selling (feedback, not inspection); a late arrival changes nothing. The sale path never waits for a server.
- *A concept to hypothesise, then test (not a claim about anyone's system):* a **return** is a negative-quantity line; **loyalty lives on the buyer's phone** and a signed cashier code is applied once. The sample run tests it: second scan a no-op, a forged code rejected, a phone restored to an older state flagged at settlement (`W-TREAT-CODE`) — detection, not prevention (FL-7); the film says what that does and does not prove.
- *Micro Finance:* the gold price pulled once a day, the fund value computed on the phone, one payment line up, the owing balance derived at the shop.
- *Failure:* a lost branch folds back from the shelf; a lost admin device is rebuilt; a lost shelf is covered by the mailbox device (mirror).
**Closing card (limits).** Sample data · not encrypted in the run · logic only — one in-memory hub, no real phone · process stubs stand in for the kernel · the adapters are unchanged (the multi-user hold) · the ERP's flip to default-deny still needs the every-window check · plan signing and real pipes not built.
**Owed before building:** the user's OK on this plan · **a light claims-and-logos ledger** (`scripts/film_replication_engine/film2_claims.json`: for each of the six cards 1–3 primary sources with an exact quote ≤ 25 words, URL, read depth, access date; for each wall project the official logo file or the decision *plain text*, with the terms text) — two researchers, Sonnet, primary sources first, snippets dropped — candidates are in R2/R3, whose read depth was mostly page summaries, so each source is re-read · a small script of live dictionary queries (read-only, each shown with its command) · `facts.json` extraction · the stage additions for the opener and Parts 1–2 · English narration TSV · recorder, fit and mux per the Film-1 pipeline · then the Thai cut.

### §16.22 Film record — Thai cut of "No server in the sale path" (2026-10-25; user: *"Impressive! Do Thai version"*)
**File:** `~/Videos/NoServerInTheSalePath_ReplicationEngine_TH_2026-10-25.mp4` — 1920x1080, 24 fps, **291.58 s (4:51)** (English 300.42 s), 16.2 MB. The English file is untouched. Same picture, same beats, same engine traces (`trace_film_pos.json` 155 events, `trace_film_mf.json` 45; engine and `witness_scriptor_*.js` not touched; `treat.log` read, not re-run: `§TREAT_VERDICT PASS judged=30 fails=0`). Built from `scripts/film_replication_engine/th/` (new files only; the English sources are untouched, `../core.js` and `../facts.js` are shared): `strings_th.js` (all on-screen Thai + the GLOSSARY), `beats_th.js` (Thai titles and the 40 notes, same anchors), `stage_th.html` + `stage_th.js`, `film_replication_engine_th.js` (recorder, extra witnesses), `film_replication_engine_th_tsv.js` (Thai narration + number checks), `problem_th.html/.png` (Thai copy of the recap card), `fit/ass_band_th.py`, `fit/glyph_check_th.py`, `fit/asr_numbers_th.py`, `fit/gloss_use_th.js` (generic `../fit/{beatmin,sub_fit,mux_two_pass,film_check}.py` reused as they are). Scratch + passes: `/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/film_replication_engine_th/` (`p0` layout stills, `p1` first full record, **`p2` ships**; `fit0` measure fit, `fit1` final fit and mux; `q1-q4` witness-only runs with `NOSHOT=1`, `LAYOUT_MUTANT=1`, `NOTE_MUTANT=1`).
**Method (same as §16.21).** Page = pure function of the film clock, stepped frame by frame (CPU, headless Chrome `--disable-gpu`). Fixed 4.0 s ONLINE windows and the beat structure unchanged. Narration: Edge TTS th-TH Premwadee (F, ค่ะ) / Niwat (M, ครับ) via `prompts/film_narration_fit_edge.py ... th`; captions burned in Thai, Noto Sans Thai, split at the spaces the script uses between phrases (Thai has no spaces between words). The F lines are statements (no `?`): Thai is tonal and the playbook says no pitch edit, so the English questions were rephrased.
**Edge TTS (cloud) was used.** The Thai narration sentences (44 turn texts, sample-data wording only, no secrets, no file contents) were sent to Microsoft Edge TTS: 44 calls + 1 retry in `fit0`; the final fit `fit1` made 0 calls (cache hits, `~/.local/share/film_narration/cache_edge/`). Two short test sentences (Thai plus the letters A, B, HQ) were sent first to learn how the voice reads Latin letters. Nothing else left the machine. One more network fetch, download only: the multilingual `faster-whisper small` model (Hugging Face) for the soft number check below.
**Measured (from logs and the file, not by eye).** frames silent = final = **6998**; video 291.583 s, audio 291.583 s; narration fit **22/22 DETAIL** (0 SHORT, 0 cut); **tone checks: NONE** (Thai, per the playbook; no question marks, so no `§NARR_TONE` line exists); max |spoken onset - `§FILM_CUE`| = **0.03 s** (22 beats, read from the file's audio); loudness two-pass: pass 1 I=-21.1 LUFS (TP -2.9, LRA 5.0), final **I=-16.2 LUFS, LRA 4.5 LU, peak -1.4 dBFS**; silencedetect n=-40dB d=2: 7 gaps, longest **5.70 s** (50.3-56.0 s, the `setup` beat: narration 9.1 s inside a beat held by a fixed 4 s window plus gaps; English longest 4.79 s); captions 49, **0 outside the band** (`sub_fit.py` rendered bbox, min top y=976, band from 930, max right x=1758); `fontselect` picks **NotoSansThai-Regular** (Latin letters fall back to NotoSans-Regular); `§TH_NUM_SELFTEST` Thai number writer vs a 28-entry hand table (11 สิบเอ็ด, 21 ยี่สิบเอ็ด, 101 หนึ่งร้อยเอ็ด, 20 ยี่สิบ, 27600 สองหมื่นเจ็ดพันหกร้อย ...) 0 wrong, and round trip 0..99,999 through an independent reader 0 wrong; `§NUM_CHECK` **58 spoken numbers = 50 facts, by value and count, 0 not in facts**, control (a changed number, 3,500 to 3,600) is detected; no digits and no `?` in the narration; **soft ASR evidence** (`fit/asr_numbers_th.py`, whisper-small, reported not gated because small is a rough Thai recogniser): 46 of 58 numbers heard as digits or number words in the expected beat, the misses are merges and omissions (10 7 4 2 heard as "1742", 2300 as "2000 300", zeros written as the word), and no number was heard that contradicts the text (one "7" is the recogniser hearing "ออบเจกต์" as "อบ เจ็ด"); OFFLINE label: **21,223 label checks (every frame, every actor), DOM label text (`OFFLINE · ออฟไลน์` / `ONLINE · ออนไลน์`), its data-off flag and its visibility vs an independent recomputation from the trace, 0 mismatches**, 24/24 online runs exactly 4.00 s, 75 shelf events all on frames where the DOM shows their actor ONLINE (control detects a mismatch), 34 samples 0 wrong (outage: A OFF + link tag, queue 5 = trace; failure cards; COLLISION and overspend flags); on-screen counters day 1 = 13 / 17 / 2 / 4 and MF = 12 / 9 / 1 / 6 equal `§TREAT_PANEL`; **layout witness: 1742 changed frames, 0 clipped or truncated text blocks** (now also checks that every child of every card lies inside the card), control with an over-long note turns it red (101 frames); **note visibility: 40 of 40 notes have their text in the DOM and their box inside the card**, control (shelf and mailbox note boxes pushed down) turns it red on exactly 3 notes; **glyphs: 134 distinct screen characters (54 Thai) all render as real glyphs in the page's font stacks** (canvas render of every character compared with the tofu render of U+0E3B, control: the tofu glyph differs from blank and from a real letter) and `glyph_check_th.py` (fontTools): screen 0 missing, captions (85 chars, 53 Thai) 0 missing, control U+0E3B reported missing — the caption check is by font-file coverage plus the `fontselect` line, not by a rendered tofu comparison; cards: title, recap, part 2, close all fit (4 of 4); **closing card: 6 limits in Thai + `§TREAT_VERDICT PASS judged=30 fails=0` equal to the line read from `build/scriptor/treat.log`**.
**Glossary (the ONE table a Thai reviewer corrects; the strings are in `th/strings_th.js` `GLOSSARY` and are written with exactly these terms; `fit/gloss_use_th.js` prints how often each is used on screen and in speech).**
| English | Thai on screen | note |
|---|---|---|
| HQ (head office, the admin device) | HQ (สำนักงานใหญ่) · เครื่องผู้ดูแล | id "HQ" stays; spoken as "HQ" |
| branch | สาขา |  |
| till (the sales device of a branch) | เครื่องคิดเงิน |  |
| shelf (stores named objects, reads none) | ชั้นวาง | object on the shelf = ออบเจกต์ (ไฟล์ที่ตั้งชื่อไว้) |
| mailbox device (blind copy of the shelf) | เครื่องตู้จดหมาย | สำเนาชั้นวางที่อ่านเนื้อหาไม่ได้ |
| visit (a device or HQ calls at the shelf) | แวะ / การแวะ |  |
| fact (a number or record read from a log) | ข้อเท็จจริง | screen only, "facts.json" stays |
| collision (same ticket key, different content) | ชนกัน | flag name COLLISION stays |
| overspend | ใช้เกินยอด | flag name OVERSPEND stays |
| fold-back (a lost device re-reads its own part of the shelf) | ดึงคืน |  |
| rebuild (HQ re-derives its state from the shelf) | สร้างใหม่ |  |
| advisory copy (own count, not the master) | ค่าอ้างอิง |  |
| sample (made-up number) | ตัวอย่าง |  |
| OFFLINE / ONLINE (the red / green label) | OFFLINE · ออฟไลน์ / ONLINE · ออนไลน์ | both words shown, as requested |
| online window (the short time a device is online) | ช่วงออนไลน์ |  |
| settlement (HQ closes the books on a visit) | ปิดยอด |  |
| caught at settlement: blacklist candidate | ตรวจพบตอนปิดยอด: รายที่อาจขึ้นบัญชีดำ | no legal wording |
| ticket (a sale ticket) | ใบขาย |  |
| credit / earn code / redeem code | เครดิต / รหัสสะสม / รหัสใช้เครดิต |  |
| fund value (value of the gold held) | มูลค่าทอง |  |
| replenishment | เติมสต็อก | process name Generate Replenishment stays |
| stand-in (a stub process) | ตัวแทนชั่วคราว |  |
| replication engine | เอนจินทำสำเนาข้อมูล |  |
| lost (device / shelf) | หาย |  |
| restore | กู้คืน |  |
Ids, object names and trace names stay as they are on screen and in speech (A, B, HQ, PH1, `o/A/...`, F1, R1, COLLISION, OVERSPEND, Generate Replenishment, §-lines, trace kinds put / recv / pull / send / publish / accept). HQ is read as the letters (the voice does that for Latin letters), glossed once in the cast beat as สำนักงานใหญ่; "ค่าอ้างอิง" and "เครื่องผู้ดูแล" are screen-only terms. Made-up numbers carry ตัวอย่าง.
**Defects found while building, and fixes.** (1) The red label "OFFLINE · ออฟไลน์" is wider than the card header: header changed to two rows (name over sub-label), the shelf / mailbox / price cards to a one-row header. (2) Thai needs taller line boxes (marks stack above and below): all line-heights raised, status / log / note boxes re-sized until the card-child containment check passed (first record p1: 1738 of 1742 frames flagged; p2: 0). (3) The SVG lane labels (ADMIN, PIPE, USER) fell back to a serif font (`Noto Sans Thai` has no Latin letters): font list now `Noto Sans, Noto Sans Thai`. (4) The recap card is an image with English text: Thai copy `problem_th.png` rendered from `problem_th.html` (title line-height fixed after the overflow check). (5) Two draft narration problems caught by the number check or by review: prose number-words inside ordinary words (ทั้งสอง, ห้าม, คนที่สอง) would read as numbers: rewritten; `ห้ามไว้` became `ขัดขวาง`. (6) Whisper-small truncated two beats (`selling`, `mfprice`) after the first turn; the check now transcribes the whole clip and the clip from 1.9 s, and takes the larger count per value. (7) The Thai credit line used an italic style (synthetic Thai italic): italic off.
**Defects in the ENGLISH cut found while doing this (not fixed; the English file and sources are untouched; the owner decides).** (a) **Three on-screen notes are clipped by their card to a sliver of about 6 px in the shipped English film:** "The primary shelf is gone..." (shelf card), "Control, no mailbox: 0 of 8 records recoverable" (mailbox card) and, in Part 2, "Same name, so 1 object: 1 payment" (shelf card). Cause: the shelf, mailbox and price cards give their list a fixed height of `card height - 62` and the note box starts below it, outside the card; the English layout witness measured the note box against its own content, not against the card. Measured on the shipped frames `p3/frames` by counting pixels of the note background colour inside the card region (3,032 px of "bad" pink at the shelf = a strip about 6 px high of a 512 px wide box; 2,002 px of "ok" green in Part 2). The Thai stage fixes this by layout and now has a witness for it (note visibility, control included). (b) The English closing card and narration say the engine is **169 lines**; `treat.log` now says `§TREAT_SIZE ... treat.js=17 sim.js=76`, i.e. **93** (the engine lane re-ran it after the English cut: `facts.json` of the English p3 has 169, today's has 93; every other one of the 84 facts is identical). The Thai film reads the current log and says 93 (spoken "เก้าสิบสาม", card "เอนจินมี 93 บรรทัด"). The two films therefore disagree on this one number until the English is re-cut or the owner says which is right.
**Decisions where the spec was silent.** Both on-screen words are kept in the labels ("OFFLINE · ออฟไลน์", "ONLINE · ออนไลน์"), as asked. The words in the narration that the English reads as "A", "B", "HQ" stay Latin letters (the voice reads them as letters; transcribing them into Thai script would make the captions differ from the screen). `illegal` is not said or shown; "caught at settlement: blacklist candidate" = "ตรวจพบตอนปิดยอด: รายที่อาจขึ้นบัญชีดำ". Sentences end without a full stop in the Thai (captions never show one). The Thai narration is shorter than the English (246.8 s of speech vs 257 s) so the film is 291.6 s, not 300 s; no wording was padded to match. The fixed 4.0 s ONLINE windows and the beat structure are exactly the English ones (same §FILM_PLAN beats, 24 windows).
**Passes kept.** `p0` (layout stills at 8 times; 6 frames were looked at in total: 5 of those stills and 1 frame of the final film for the captions, after that numbers only), `p1` (full record, first layout fixes needed), `p2` ships. Measure fit `fit0` (44 Edge calls), final fit `fit1` (cache).
**NOT done:** a **native Thai listener review of tone, rhythm and terminology** (nobody Thai has listened; the voice is a neural TTS reading statements, the glossary above is my translation, not checked by a Thai reader); no tone check exists for Thai by design; the soft ASR evidence is whisper-small and misses 12 of 58 numbers by recogniser limits, not a pass/fail gate; the captions' tofu check is by font coverage, not by a rendered comparison; the English defects (a) and (b) are not fixed; nothing committed, pushed or deployed.

---

## §24 Step 5a — the MODELLER ADAPTER reads its shared-op list from the compiled plan (2026-10-25; owner: *"Modeller first"* = the go for §21 step 5; spec written BEFORE code)
**Issue.** `modeller/team_sync.js:24-25` hard-codes `CLASS`, the one list of which op types are shared. §22.8 showed that list is data: 1 virtual table + 1 FACT row + 6 list values (`flows_modeller.json`). Step 5a makes the adapter derive `CLASS` from the **compiled plan** instead of a literal, with **no change in what is shared** and a fail-closed default. **Scope (the only files touched, all in the worktree `/tmp/wt-team-plan`, branch `feat/modeller-team-plan` from `origin/main` @ `4e95b393`; shared `~/bim-ootb` untouched; nothing committed or pushed until the owner says):** `modeller/team_sync.js` (CLASS derivation) · `modeller/modeller.html` (one `<script>` entry before `team_sync.js`, inside the `?team=1` loader) · `modeller/sw.js` (precache the new file + `CACHE_VERSION` bump) · NEW generated `modeller/team_plan.js` · NEW `modeller/tests/witness_team_plan.js`. **Not touched:** `erp/*`, `common/comm/*`, the carriage/projection/guards/UI of the adapter (§20: ≈98 % of it).
**Design.** (a) *The plan artifact.* `build/scriptor/emit_plan.js` (bim-compiler) compiles `flows_modeller.json` and writes `modeller/team_plan.js`: a generated, deterministic file `window.TEAM_PLAN = { v:1, hash, flows:[{ name, table, dir, audience, payload:[{col, cls, values?}], implicit:[...] }] }` with a header naming the source rows and the plan sha256. Unsigned (prototype; the signing key is §16.13 Q1 — named limit). (b) *The adapter.* `CLASS` becomes a 6-line derivation: take the plan flow with `table === 'bim_element'` and `audience === 'space'`; every value of its `geom_op` column is a `create`; `GEOM_MOVE` is a `move` iff the flow carries all of `pos_x|y|z` (the adapter already knows that a move writes those three; the plan decides whether they are shared). (c) *Fail closed.* No plan (script missing / not loaded) or no matching flow → `CLASS = {}`: **nothing is shared**, and the adapter logs `§TEAM_PLAN missing — nothing is shared` and shows the existing local-only chip reasons; it never falls back to a built-in list (PRIME RULE: extract or compile only). (d) *Visible provenance.* one new log line `§TEAM_PLAN hash=<12> creates=<n> move=<cols>`; `§TEAM_BOOT` is not changed (existing witnesses quote it).
**Witnesses (RED first where a red is possible).** *Baseline BEFORE any edit:* `modeller/tests/witness_team_modeller.js` on the untouched worktree — recorded below (`§TM-*` lines and verdict). *`W-PLAN-*` in `modeller/tests/witness_team_plan.js` (real Chromium, `--disable-gpu`, no GPU lock; every number read from the live page):* **P1 equivalence** — with the generated plan, `TeamSyncModeller.classes()` deep-equals the OLD literal `{GEOM_INSERT, GEOM_EXTRUDE, GEOM_EXTRUDE_POLY, GEOM_SWEEP, GEOM_LOFT, GEOM_REVOLVE: 'create', GEOM_MOVE: 'move'}` (embedded in the witness as the expectation, captured from `origin/main`) — issue: "the move to rows changed what is shared"; **P2 zero-code probe** — a plan with one more list value (`GEOM_FOO`) served instead (request interception) makes `classes()` contain `GEOM_FOO:'create'`, `team_sync.js` sha256 identical, and the real `Bonsai.oplog` still treats `GEOM_ROTATE` as not shared — issue: "adding an op type needs adapter code"; **P3 fail closed** — plan request answered 404 → `classes()` is `{}`, `§TEAM_PLAN missing` logged, and a committed `GEOM_EXTRUDE` is NOT sent (the real chip counts it local-only) — the test that can fail: without the guard it would have been shared from a stale literal; **P4 a plan that withholds the move** (no `pos_*` carried) → `GEOM_MOVE` absent, creates still shared; **P5 no page errors**. *Drift check on the compiler side* (`scripts/witness_scriptor_modeller_plan.js`): regenerating the plan from the rows reproduces the committed `modeller/team_plan.js` byte for byte (else red: "the shipped plan no longer matches its rows"), and a changed row changes the hash. *Mutants:* literal list reinstated alongside (P3 red) · derivation ignores `audience` (P4/P1 red where a hub row is injected) · plan hash not logged (provenance arm red). Re-run after the edit: the whole `witness_team_modeller.js` (quote lines equal to the baseline) and the ERP team witnesses are unaffected by construction (not touched) — spot-run `erp/tests/witness_team_so.js` once to prove it.
**Deletion budget:** removes the `CLASS` literal and its comment; adds ≈ 6 lines of derivation + 1 loader entry + 1 precache line; the list lives in `flows_modeller.json`. Measured and reported with the result.
**Twin rule:** none of this touches iDempiere behaviour (the Modeller has no legacy twin; the ERP is untouched).
### §24.1 Step 5a RESULT — ✅ DONE in the worktree `/tmp/wt-team-plan` (branch `feat/modeller-team-plan` from `origin/main` @ `4e95b393`); NOT committed, NOT pushed (owner has not said; §21 State) (2026-10-25)
**Baseline before any edit** (`build/scriptor/modeller_baseline_before.log`): `§W-TEAM-MODELLER PASS judged=33 fails=0 pageerrors=0`. **After** (`modeller_after.log`): the same, **PASS judged=33 fails=0 inconclusive=0 pageerrors=0**; the arm-by-arm diff against the baseline differs only in the random device codes/uuids; `§TM-XOFN` still 7 of 22 shared, 15 local-only. **New** `modeller/tests/witness_team_plan.js` (`modeller_plan_witness.log`): **`§W-PLAN-MODELLER PASS judged=11 fails=0 pageerrors=0`** — P1 the committed plan yields exactly the old 7-key list · P2 plan + `GEOM_FOO` shares it (8 keys, `GEOM_ROTATE` still not), `team_sync.js` served byte-identical (`9aec22f72c38`) · P3 plan 404 → `classes()={}` and `§TEAM_PLAN missing — nothing is shared` · P4 a plan without `pos_x` shares no move (6 creates remain); a hub-audience flow shares nothing · P5 `§TEAM_PLAN hash=4f0bfecad90b creates=6 move=pos_x|pos_y|pos_z` equals the generated file's header · P6 0 page errors over 5 loads. Mutants (adapter served broken): literal list reinstated → P2, P3, P4 red · audience ignored → P4 red · hash not logged → P5 red; no survivor. **Compiler side** (`scripts/witness_scriptor_modeller_plan.js`): **`§MODPLAN_VERDICT PASS judged=5`** — the shipped `team_plan.js` equals a fresh emission byte for byte (880 bytes, hash `4f0bfecad90b`); a changed row changes bytes and hash; emission deterministic; a broken declaration (class `NOPE`) refuses to emit; the adapter code no longer lists the 6 create op types (only `GEOM_MOVE` remains, by design: the move's name is projection). **Fail closed, end to end** (`modeller_noplan_failclosed.log`): the UNCHANGED full witness with `team_plan.js` absent does **not** pass — `§TEAM_PLAN missing` on both devices, 6 arms red from `§TM-CREATE` (A's extrude not sent, B shows no element: `rows=0`), then a crash in `§TM-DIFF` on the missing element, exit 2, no PASS line. **ERP untouched:** `erp/tests/witness_team_so.js` PASS judged=19 fails=0. Engine regression unchanged (the six scriptor witnesses re-run earlier this lane).
**Files changed in the worktree (uncommitted):** `modeller/team_sync.js` (+10 −2), `modeller/modeller.html` (+1 −1: loader adds `team_plan.js?v=1`, `team_sync.js?v=4`), `modeller/sw.js` (+2 −1: precache + `CACHE_VERSION` v159→v160), NEW `modeller/team_plan.js` (generated), NEW `modeller/tests/witness_team_plan.js`. Compiler side: NEW `build/scriptor/emit_plan.js`.
**Yardstick, measured (§19):** the adapter did **not** shrink — **+10 / −2 lines** in `team_sync.js`; what moved is the *list*: the literal is gone from the code, lives in `flows_modeller.json` (1 declaration + 1 row + 6 values), and the adapter derives it from a generated, hash-stamped plan with a fail-closed default. The line-count win predicted in §20(c) ("roughly a wash") is a wash; the gain is one place to change, a visible plan hash, compile-time validation, and a zero-code probe that holds (P2) in a real browser. The guards (`create-with-parent`, `target-not-a-team-record`) and `access()` stay in the adapter.
**Named limits:** the plan is **unsigned** (§16.13 Q1) — a user can edit `team_plan.js` locally and widen what their own device sends; peers still judge arrivals at fold time (admission), so this is plan *integrity* not read isolation · the adapter still knows `GEOM_MOVE` by name and the three `pos_*` columns (projection) · `sw.js` and `modeller.html` are conflict magnets (§CLAUDE.md): on merge keep both precache additions and the HIGHER `CACHE_VERSION` · `input_guids` list-of-references stays gap G11.
**Next (owner decides):** (a) commit + push + PR of the worktree branch (nothing has been committed); (b) the ERP adapter second — it flips from share-everything to default-deny (G9: needs a team-ERP strategy and the every-window twin check) and is therefore not started; (c) L1, the Q1–Q8, S2/S3 as listed in §22.8.


### §16.24 Film record — Film 2 (English): "Keeping the bloat off: the dictionary, replication, and a serverless day" (2026-10-25)
**File:** `~/Videos/Keeping_the_bloat_off_ReplicationEngine_EN_2026-10-25.mp4` — 1920x1080, 24 fps, **554.92 s (9:15)**, 33.1 MB. Built from `scripts/film_replication_engine/film2/` (new folder; Film 1's and the Thai files untouched): `facts2.js` (facts.json: live read-only queries of `build/erp/ad_full.db` with their exact commands, lines of `s1/treat/registry/virtual/mesh/dryrun.log`, file counts with the counting command, §20 numbers, Film 1's trace facts), `cards2.js` (opener wall, six challenge cards, Part 1 and 2 cards, concept card, limits, Sources), `beats2.js`, `stage2.html/js` (Film 1's stage + card reveal, card witnesses), `film2_record.js`, `film2_tsv.js`, `film2_controls.js`, `asr_numbers_en.py`, `build_index.js` → `film2_claims.json` (49 verified claim cards, sha256 of the two source JSON files) and `film2_logos_index.json` (URL + sha256 per logo; files stay outside the repo, shown only through `<img src>`). Logs kept in `film2/logs/`. Scratch passes: `/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/film2_work/` (p0 stills, p1, p2, **p3 ships**). Logs read before building: s1 `PASS judged=22 fails=0 inconclusive=2`, treat `PASS 30`, registry `PASS 13`, virtual `PASS 25 vacuous=1`, mesh `PASS 25`, dryrun `PASS 13 open=1`; s1 and treat were re-run, the other four re-run to stdout and diffed against their logs (only a temp-dir name and one timing differ).
**Content.** Opener: title, wall of 17 tiles (13 logos, 4 names as text: Triplit, Nostr, Scuttlebutt, the Ink & Switch essay), six challenge cards with 26 verified quotes, each with project name or logo beside its own statement, publisher · title · date bar, labelled "our reading" where the card JSON has one, and a closing line "where our design answers it" or "NOT SOLVED YET" (card 2). Part 1: tables and columns (live query), iDempiere's pointer rule printed by file and line (`MLookupFactory.java:192-214`, `MQuery.java:420-430`), the three SQL counts of pointers against the compiler's (`W-FLOW-REFS`), `C_OrderLine` 60 columns with the 6 on the wire, computed vs typed, "an id is not a secret". Part 2: strategy 100 live (47 M · 188 R · 217 L · 551 unlisted of 1,003), one flow row, adding by row and the wrong row failing, the dry run (7 = 1 + 1 + 6; 998 vs 47; G9 open), three counted bloat numbers (6 of 60 · 274 lines · 0 calls), the honest ledger. Part 3: Film 1's sample day (engine trace, OFFLINE label logic unchanged, 4.00 s ONLINE windows) with merged beats, the concept card (returns, loyalty), Micro Finance. Limits card and two Sources cards. Line counts as the coordinator verified them: core 93 (treat 17 + sim 76), components 129, **engine 222**, compile toolchain 274 — counted by `grep -vE '^[[:space:]]*($|//|/\*|\*)' <file> | wc -l` (recorded in facts.json; Film 1's "169" not reused).
**Measured (from the logs and the file, not by eye).** Frames silent = final = **13,318**; video 554.917 s, audio 554.916 s. Narration fit **36/36 DETAIL** (one at x1.065: card 3), tone **35 OK / 0 WRONG**; onset of speech vs `§FILM_CUE`: **max 0.05 s over 36 beats** (window from cue-0.2 s; with the stock cue-0.5 s window two beats read -0.51 s because the previous clip's tail ends 0.3-0.4 s before the cue). Loudness two-pass: pass 1 I=-23.7 LUFS, final **I=-16.4 LUFS, LRA 2.4 LU, peak -1.4 dBFS**. `silencedetect` -40 dB / 2 s: 7 gaps, 2.18-4.46 s, longest 4.46 s (the end tail). Captions **95, 0 outside the band** (rendered bbox, min top y=972, band from 930; 94 wrapped captions all within 2 lines). `§NUM_CHECK`: **81 spoken numbers = 69 facts requested, 0 mismatch** (counted per value; prose number words banned and removed); soft ASR (whisper small.en, both passes): **81 of 81** expected numbers heard, 0 unexpected. Layout: 1,830 changed frames, **0 trace frames with clipped text, 0 card frames flagged**, 24 cards checked at their fully revealed state (clipping, outside the 1920x930 area, overlap of boxes). OFFLINE label (DOM vs independent recomputation from the trace): **18,455 label checks (every frame, every actor), 0 mismatches**, 24/24 ONLINE runs exactly 4.00 s, 75 shelf events all on frames where their actor shows ONLINE (control detects a mismatch), 35 samples OK (outage tag and queue 5 = trace, three failure cards, COLLISION and overspend flags, rebuild 10 = 10, shelf 14 -> 14), counters day 1 = 13 / 17 / 2 / 4 and MF 12 / 9 / 1 / 6 = `§TREAT_PANEL`. **Citation witness:** 26 on-screen quotes equal the verified JSON quote **byte for byte**; 26 citation bars show publisher + title + date from the JSON; the Sources cards list **22 URLs = exactly the 22 cited URLs** (0 missing, 0 extra). **Logo witness:** 13 distinct logos, 32 `<img>` instances all loaded; `data-sha` = index hash; the 13 image requests the page made, hashed on disk, equal the index (PowerSync: the clean alternate file, hash computed from the downloaded bytes); every logo scaled by `object-fit: contain` (not stretched or cropped); the four plain-text names load no image; trademark line and the Manyverse credit (© 2019 The Manyverse Authors, CC BY-SA 4.0) on screen; no Matrix logo. **Words witness:** 'hiatus', 'fork', 'retired' (beside Triplit or at all), 'unsolved', 'entirely', 'Unicenta', 'Flexible Sync' — 0 hits in 101 on-screen texts, the narration and the captions; the dropped claims (Matrix hiatus, SSB identity-forks, the ~20 % relays figure, CoNEXT venue, 17.9 M) are not on screen. Controls (`film2_controls.js`): a one-character change in a quote, a changed hash and a planted word are each detected.
**Decisions where the spec was silent.** Quotes are only the `quote` field of each verified card (the notes' extra verbatim sentences are not shown, so the "~20 % of relays" figure is dropped, not shown with a caveat). Card 5 omits Ditto and Anytype (both PARTIAL); card 2 shows the two Anytype items as "a user's report on the community forum, not a statement by Anytype"; the wall tile for Triplit is text, Supabase's logo sits beside the Triplit item (post: "does not announce a shutdown of Triplit"). Rocicorp's file is white-on-transparent and PowerSync's clean alternate is white text: both on a dark tile. "Checkpoints" (§16.23 card 4 answer) are NOT claimed: the engine has none; the card says fold-back only, and "not tested here: years of growth". Returns as negative lines are stated as a hypothesis the sample run did not send. The sample day keeps the whole engine trace (merged beats `lostA`, `rolled`, `hqlost`; no event removed); Part 3 therefore carries 24 fixed 4 s windows. The limits card says "adapters **on main** unchanged (the dry run touched none)" because §24 now records an uncommitted Modeller adapter change in a worktree. Spoken outside facts carry no figures (the figures are on the cards, quoted). Length 9:15, not 8:00: 35 of 36 beats are narration-bound, the rest bound by the sample-day windows; trimming means cutting content.
**Defects found while filming, and fixes.** (1) The Rocicorp logo was invisible (white fill on a white tile) — dark tile. (2) The iDempiere source panel ran off the right edge — found by the card witness (outside the area), columns re-proportioned, font 14 px. (3) The strip source label of the HQ-lost beat was 6 px too long — shortened (p1 -> p2: 213 frames flagged -> 0). (4) My first aspect check flagged 17 logos that were letterboxed by `object-fit: contain` — the check now reads the fit mode. (5) Prose number words ("Part one", "invent one", "Zero" the project) were counted as spoken facts by `§NUM_CHECK` — rephrased. (6) Four questions ended with a falling tone where a rise was wanted — rephrased as yes/no or elliptical. (7) My own note on the Triplit item contained the word "retired" — caught while planning the words witness, reworded. (8) Narration said "unpaid costs" for the Nostr study: changed to "free relays that cannot cover their costs" (the verified claim); "a virtual table is one row" changed to "a declaration row".
**Passes kept.** p0 (stills; **4 frames were looked at in total** — the logo wall, one challenge card, the order-line card and the source-code card, for logos and overflow; after that numbers only), p1, p2, **p3 ships**; fits `fit0` (measure), `fit2`..`fit4` (fit4 ships).
**NOT done:** the Thai cut; a native-listener review (tone and pacing never heard by a person; the question "A reused ticket, and an older phone?" got an 11-semitone PSOLA rise, the cap); the soft ASR is whisper small.en, not a gate; two PARTIAL claims are shown (Nostr 98.2 % and the 95 % of free relays), each labelled as the authors' estimate; the Nostr paper's venue is not stated; nothing committed, pushed or deployed. Side effect to know: running `witness_scriptor_s1.js` and `witness_scriptor_treat.js` rewrote `build/scriptor/trace_film_*.json` with identical content (`W-REG-PRESERVED` hash check), logs there untouched.

---

## §25 Step 5b — the ERP ADAPTER reads its table scope from the compiled plan (2026-10-25; owner: *"go on with the ERP"*; spec written BEFORE code) — BEHAVIOUR-PRESERVING by decision
**Issue.** `erp/team_sync.js:36` hard-codes `STATION_LOCAL` (5 tables) and the rest of the file shares **every other table by default** (§20 M5–M7, G9). The engine's polarity is default-deny. §22.8 measured the cost of a *narrowed* scope (998 → 47 tables, 6 of a 20-table core sample outside it); that is a product decision with a twin check behind it and it is **not taken here**. **Decision (git/engineering admin call, recorded — not a product question):** step 5b changes the *mechanism* and keeps the *scope*: the plan lists the tables the adapter shares today, i.e. every active AD table except the 5 declared-Local ones (1003 − 5 = 998), so no table changes sides and the TWIN RULE is untouched; any later narrowing is a data change to the rows, gated by the every-window check (§20 G9), and needs no adapter code. **Why not put the scope in the dictionary** (`AD_Table.ReplicationType` = `M`, or a new `AD_ReplicationStrategy` row): that would change `ad_table` / strategy data the Table, Column and Replication Strategy windows show, which legacy iDempiere does not have in that shape (all 1003 are `L` there) — a visible dictionary divergence for a team-mode-only concern. The plan stays outside the dictionary, as the Modeller's does.
**Design.** (a) `build/scriptor/emit_erp_plan.js` (bim-compiler): rows = the 5 `LOCAL` rows (`flows_erp.json`) + one `FACT dir BOTH audience space` row per active AD table not declared Local (generated in memory from `ad_full.db`, sorted; compiled with every guard, so a table that does not exist is red); writes a **scope-only** plan `erp/team_plan.js` = `{ v, hash, flows:[{name,table,dir,audience}], local:[tables] }` (no payload — the ERP shares whole record ops; the payload analysis stays a compile-time check). Unsigned (Q1). (b) `erp/team_sync.js`: `STATION_LOCAL` and a new `SHARE` set are built from `window.TEAM_PLAN`; `translate` keeps its station-owned `quiet` branch and gains one gate: a table not in the plan is **local-only** with reason `table-not-in-plan <t>` (logged `§TEAM_LOCALONLY`), never shared by default. **No plan => `SHARE` empty => nothing is shared**, logged `§TEAM_PLAN missing — nothing is shared`. `§TEAM_PLAN hash=<12> tables=<n> local=<n>` on load; `§TEAM_BOOT` unchanged. One tiny export `scopeOf(table) → 'share' | 'station-local' | 'unplanned'` so the witness reads the decision the adapter itself uses (the same function `translate` calls). (c) `erp/idempiere.html` loader entry before `team_sync.js` (team mode only); `erp/sw.js` precache + `CACHE_VERSION` bump.
**Predictions (stated before the run).** P1 over the AD universe the live page holds (`ad_table`, N ≈ 1003) the old rule (`!STATION_LOCAL[t]`, extracted from `origin/main` source) and the new rule agree on **every** table — shared 998 = 998, 0 differ. P2 the old rule also "shares" any name that is not an AD table (internal SQLite tables, device-local overlay tables from plugins/BIM projects); the new rule does not — the witness **lists** them from the live page; if any is a table a CRUD op can target, that is a finding and the plan or the rule changes before this step is done. P3 plan absent → `scopeOf` is `unplanned` for every table (0 shared). P4 the five ERP team witnesses (`so`, `docaction`, `base`, `desktop`, `pill`) keep their baseline verdicts and quote lines. P5 zero-code: a plan with one more table shares it, a plan that moves a table to local silences it, the adapter byte-identical.
**Witness `W-PLAN-ERP` (`erp/tests/witness_team_plan.js`, real Chromium, written first, RED on the untouched adapter: `scopeOf` does not exist).** Arms: E1 equivalence over N tables with the differing set printed · E2 the non-AD names and their old/new decision · E3 fail closed (plan 404) · E4 plan decides (+table, +local, hub-audience flow ignored) · E5 provenance hash == header · E6 0 page errors. *Mutants (adapter served broken):* plan ignored (old rule reinstated) · audience ignored · hash not logged · `unplanned` treated as share. Compiler side `scripts/witness_scriptor_erp_plan.js`: shipped `erp/team_plan.js` = fresh emission byte for byte; a changed LOCAL row changes bytes; a nonexistent table refuses to emit; count 998 + 5 = active tables. **Deletion budget:** removes the `STATION_LOCAL` literal; adds ≈ 8 lines; measured and reported. **Branch/worktree:** new `/tmp/wt-erp-plan` off fresh `origin/main` (the Modeller PR #2369 is independent: different files).
### §25.1 Addendum (owner, 2026-10-25: *"the abstract patterns akin to a Java abstract factory is what I am aiming for in asking for Replication, to reduce custom code"*) — ONE shared plan reader, `common/comm/team_scope.js`
**Issue.** After §24 the Modeller derives its scope from the plan with its own few lines; §25 would add a second, different derivation in the ERP. Two copies of "read the plan" is the custom code the lane exists to remove. **Pattern (cite: iDempiere `Service.locator()` / `IModelFactory`, `MTable.java:257-261`):** hosts do not parse plans; they ask a registry-style reader. `TeamScope` (global, pure, ≈ 25 lines) is the single reader of `window.TEAM_PLAN`: `flow(table)` · `values(table, col)` · `carries(table, col)` · `scopeOf(table) → 'station-local' | 'share' | 'unplanned'` · `summary()`. Only `audience: space` flows count; no plan ⇒ every answer is empty/`unplanned` (fail closed); lookups are case-insensitive and indexed once per plan object. **Both adapters call it**: the Modeller's `CLASS` derivation shrinks to `TeamScope.values/carries` and the ERP gets `scopeOf` with no derivation of its own. **Witness** `scripts/witness_scriptor_team_scope.js` (Node, the real generated plans of both hosts, vm-loaded): reader answers equal the compiler's own plan (independent recomputation from the rows), hub-audience ignored, missing plan fail-closed, case-insensitivity, a mutant per rule; the two browser witnesses (`W-PLAN-MODELLER`, `W-PLAN-ERP`) keep proving the end of the chain. **Deletion budget:** Modeller derivation −N lines; ERP derivation 0 (never written); `TeamScope` +≈25 once. Loader entry + precache + version bump in both hosts.

### §16.25 Film record — Film 1 re-cut v2 (English): "No server in the sale path" (2026-10-25; user: *"recut and then do also Thai"* — the Thai re-cut is the NEXT step, by another session)
**File:** `~/Videos/NoServerInTheSalePath_ReplicationEngine_EN_2026-10-25_v2.mp4` — 1920x1080, 24 fps, **307.33 s (5:07)** (v1 300.42 s; the only difference in length is the longer closing narration: `beatmin` close 23.84 -> 30.76 s, the other 21 beats identical), 18.8 MB. **The first file `..._EN_2026-10-25.mp4` is untouched** (mtime 05:49). Sources: the same `scripts/film_replication_engine/` (edited in place; the v1 copies of `stage.html stage.js film_replication_engine.js film_replication_engine_tsv.js facts.js beats.js core.js fit/` are kept in the scratch folder `v1_src/` because these files were never committed). Scratch: `/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/film_replication_engine_v2/` (`p1` first full record, `p2` second record, **`p3` ships**; `fit0` measure fit, `fit1` final fit and mux; `q1`-`q3` witness-only runs with `NOSHOT=1`, `NOTE_MUTANT=1`, `LAYOUT_MUTANT=1`). The first build's passes `film_replication_engine/p0..p3`, `fit0`, `fit3` are kept as they were (v1 shipped p3). Engine and `witness_scriptor_*.js` not edited; `witness_scriptor_treat.js` and `witness_scriptor_s1.js` were RUN and their stdout compared with the logs in `build/scriptor/`: identical (`§TREAT_VERDICT PASS judged=30 fails=0`, `§S1_VERDICT PASS judged=22 fails=0 inconclusive=2`). Side effect: each run rewrites `trace_film_*.json`; only the random public-key hex strings differ between runs (not shown in the film).
**Defect 1 fixed: three notes clipped to a ~6 px sliver.** Cause (as the Thai builder measured): the shelf / mailbox / price cards gave their list `card height - 62` and the note box started below it, outside the card. Fix (`stage.html`, `stage.js`): those three cards get a 30 px header, a list of `card height - 99` (13.5 px / 1.2 mono lines: 7 shelf lines = 113 px in 115) and a 48 px note box that ends inside the card; the "SHELF LOST" block is smaller; the device cards' note box is 54 px (was 56: its bottom overlapped the card border by 1 px, found by the stronger witness on the 37 other notes). **Witnesses ported from the Thai cut (`film_replication_engine.js`):** the layout witness now also requires every child of every card to lie inside the card (1740 changed frames, **0 flagged**; its first run flagged 1736 frames, 1 px on the device cards, fixed as above); `§FILM_NOTE_VISIBLE`: for each of the 40 notes its text is in the DOM, its box is inside its card and not clipped, **40 of 40**; control `NOTE_MUTANT=1` (shelf and mailbox note boxes pushed 90 px down) turns it red on **exactly 3 notes** (`shelflost/SHELF`, `shelflost/MIRROR`, `mfpay/SHELF`); control `LAYOUT_MUTANT=1` (over-long note) turns the layout witness red on 101 frames. **On the shipped frames** (`fit/note_px.py` counts the pixels of each note's own background colour inside the card region and compares with the box area): **40 of 40 notes visible, ratio min 0.74 / max 1.10, rows with colour = the full box height (48/48)**; the three formerly clipped notes read 0.83 / 0.88 / 0.90 (20,116 / 21,353 / 21,933 px of 24,288). **Control, the same method on the v1 frames `p3`:** exactly those 3 notes are NOT visible (3,384 / 3,127 / 2,515 px, ratio 0.12 / 0.11 / 0.09, 5-6 rows of 56) and the other 37 are fine. Frames looked at: **2** (the shelf-lost frame 4567 and the closing card frame 6638, once; after that numbers only).
**Defect 2 fixed: stale engine line count (169).** `facts.js` now counts the files (`build/scriptor/treat.js sim.js treatments/{fact,instrument,seed,rule,local}.js scope.js flow.js compile.js`) with the command recorded in `facts.json` `lineCommand`: `grep -vE '^[[:space:]]*($|//|/\*|\*)' <file> | wc -l` (non-blank, non-comment lines, run from `build/scriptor/`; the node count equals the grep count per file, asserted). **Core 93** (treat 17 + sim 76; equals `treat.log §TREAT_SIZE`, asserted) **+ components 129** (fact 61 + instrument 43 + seed 13 + rule 10 + local 2) **= 222 in all**; compile toolchain 274 (equals `s1.log §S1_ZERO_CODE_NUMBERS`, asserted). The key `engineLines` keeps its old meaning, the `§TREAT_SIZE` core (now 93), so the Thai build keeps working; the new keys are `linesCore linesComponents linesEngine linesToolchain lineEach lineCommand`. Spoken: "The engine is a core of ninety three lines plus one hundred twenty nine lines of components, two hundred twenty two in all." On the card: "engine: a core of 93 lines plus 129 lines of components, 222 in all (non-blank, non-comment)". `§FILM_CLOSE_CARD` re-counts the files in the recorder (not through facts.js) and compares with the card text and `treat.log`.
**Limits card (item 3).** v1 had **no** adapter statement (its six limits do not mention adapters; Film 2's limits card does). A seventh limit was added from §24 only: "No product adapter on main reads the engine's plan yet: the dry run touched none, and the one Modeller change is not committed." and the same clause in the closing narration ("no product adapter on main reading the engine yet"). The card was re-laid for seven items (font 33 px). **Caveat for the next re-cut:** §25 (ERP adapter, Step 5b) was being specified / built in a worktree at cut time; if that also stays uncommitted, "the one Modeller change" should become "the adapter changes".
**Facts diff (new `facts.json` vs v1 `p3/facts.json`; 84 facts before, 90 now):** **only ONE v1 fact changed value: `engineLines` 169 -> 93** (the engine lane moved the treatments out of treat.js after the English cut; `§TREAT_SIZE` counts only the core). The other 83 are identical in value and in source (verdict line, 30 judged, trace-derived numbers, day-1 panel 13 / 17 / 2 / 4, MF panel 12 / 9 / 1 / 6, shelf 14, 10 records, 0 of 8 control, ...). **New (6):** `linesCore 93`, `linesComponents 129`, `linesEngine 222`, `linesToolchain 274`, `lineEach`, `lineCommand`. The `§FILM_CUE` times of beats 1-21 are identical to v1 (diff empty); only the closing beat is longer.
**Measured (from logs and the file, not by eye).** frames silent = final = **7376**; video 307.333 s, audio 307.333 s; narration fit **22/22 DETAIL** (0 SHORT, none re-voiced faster), **tone 19 OK / 0 WRONG**; the **21 unchanged clips are bit-identical to v1** (sha256 of the wav; the Kokoro fit is deterministic on CPU, so the unchanged beats regenerate identically; only `close` differs); max |spoken onset - `§FILM_CUE`| = **0.05 s** (22 beats, `film_check.py`, read from the file); loudness two-pass: pass 1 I=-23.73 LUFS (TP -0.88, LRA 3.40), final **I=-16.4 LUFS, LRA 3.1 LU, peak -1.3 dBFS**; `silencedetect` n=-40 dB d=2: 7 gaps, longest **4.79 s** (v1: 7 gaps, 4.79 s); captions 54 incl. the credit line, **0 outside the band** (`sub_fit.py` rendered bbox: min top y=940, band from 930, max right x=1768; `ass_band.py` 0 WRONG, widest 1738 of 1740 px); `§NUM_CHECK` **60 spoken numbers = 52 facts, by value and count, 0 not in facts** (v1 58 / 50: `169` removed, `93`, `129`, `222` added); OFFLINE label: **22,100 label checks (every frame, every actor), DOM vs an independent recomputation from the trace, 0 mismatches**; 24/24 online runs exactly 4.00 s; 75 shelf events all on frames where the DOM shows their actor ONLINE (control detects a mismatch); 34 samples, 0 wrong (outage tag and queue 5 = trace, three failure cards, COLLISION and overspend flags, rebuild 10 = 10, shelf 14 -> 14); on-screen counters day 1 = 13 / 17 / 2 / 4 and MF = 12 / 9 / 1 / 6, equal to `§TREAT_PANEL`; card fit 4 of 4 (title, recap, part 2, close; close card last block bottom 678 of 930); **closing card: `§TREAT_VERDICT PASS judged=30 fails=0` equals the line read from `build/scriptor/treat.log`; counts on the card = counts re-read from the files = 93 / 129 / 222, core equals `§TREAT_SIZE`; 7 limits, adapter limit present.**
**Defects found while re-cutting.** (1) The first run of the ported card-containment check flagged 1 px on every device-card note (box bottom 1 px past the inner border): `.nt` height 56 -> 54. (2) My first `notes_px.json` overwrote the note's card name with its rectangle (`card` key): renamed `cardRect`, re-recorded (p2 -> p3). (3) The seven-item limits card at the old font (38 px) would not have fitted: 33 px.
**Decisions where the spec was silent.** The other 21 beats keep their content; the full fit, subtitles, recorder and mux were re-run so every timing and cue is pinned again. The v2 name keeps the date of the first build. `engineLines` keeps meaning "core" so the Thai sources are not changed under their owner; the Thai re-cut chooses its own wording (the Thai film still says 93 only).
**NOT done:** the Thai re-cut (to follow, by another session: it should take the new facts keys, the same closing wording and the adapter limit; its own `th/` layout already has the note fix); a native-listener review (nobody has listened to the tone and pacing); the soft ASR number check was not run (it was not part of the first English build); nothing committed, pushed or deployed.
### §25.2 Step 5b RESULT — ✅ DONE (witness, 2026-10-25): the ERP adapter's table scope is read from the compiled plan; scope unchanged; bim-ootb branch `feat/erp-team-plan` (off `origin/main` after PR #2369 merged)
**Behaviour-preserving, proved over the denominator.** `W-PLAN-ERP` (`erp/tests/witness_team_plan.js`, real Chromium, every number read from the live page): **PASS judged=16 fails=0 open=1 pageerrors=0**. E1 over **all N=1003** live dictionary tables the plan decision equals the old rule (`!STATION_LOCAL[t]`): shared **998 = 998, 0 differ**; over **all N=373 AD windows** the number of shared tab-tables is equal in each (0 differ); exactly the 5 station-owned tables are `station-local`. E3 plan 404 → every table `unplanned`, 0 shared, `§TEAM_PLAN missing — nothing is shared`. E4 plan + `x_widget` shares it, plan moving `c_order` to local silences it (`c_orderline` stays shared), hub-audience flows share nothing, `team_sync.js` served byte-identical. E5 `§TEAM_PLAN hash=07596c569a37 tables=998 local=5` = header hash. Mutants (reader/adapter broken one rule each) all killed: old rule reinstated → E2/E3/E4 · audience ignored → E4 · hash not logged → E5 · unplanned-as-share → E2/E4. Compiler side: `witness_scriptor_erp_plan.js` **PASS 8** (shipped `erp/team_plan.js` = fresh emission byte for byte, 998 + 5 = 1003 active tables, a nonexistent table refuses to emit, one extra LOCAL row moves exactly one table, deterministic) and the shared reader `witness_scriptor_team_scope.js` **PASS 14** (independent recomputation over all 1003 tables, case-insensitive, hub ignored, declared-local wins, no-plan fail-closed, a plan swapped at runtime is re-indexed, 6 reader mutants killed).
**End of the chain, unchanged (baseline recorded BEFORE any edit → after):** `witness_team_docaction` PASS 24 → 24 · `witness_team_base` PASS 22 → 22 · `witness_team_desktop` PASS 9 → 9 · `witness_team_pill` PASS 14 → 14 · `witness_team_modeller` PASS 33 → 33 · `W-PLAN-MODELLER` PASS 12 (now 4 mutants on the shared reader) · **zero `table-not-in-plan` lines in any of those runs** (no real cycle targeted an unplanned table). `witness_team_so` PASS 19 → 19 or **PASS-WITH-INCONCLUSIVE 18**: one precondition arm (`§TEAM-CL1 defect precondition`, "a local pk named different records on A and B") is **timing-dependent and flaps on the unmodified code too** (measured: old code 2 of 3 runs INCONCLUSIVE, new code 1 of 3); it never fails, it prints INCONCLUSIVE by design. Told to the Team session, not edited (§18).
**The one OPEN finding (E2), stated plainly.** 28 sqlite tables are not active AD tables: `cm_*` (CMS), `k_*` (knowledge), `m_bom*`, `ad_treebar`, `ad_ddl_*`, `t_selection*`, `dbreplicasyncverifier`, `kernel_ops`, `sqlite_sequence`, `m_product_bom_old`. The OLD default shared an op on any of them; the new rule keeps them local. **None of them has a row in the live `ad_table`**, so no AD window tab can target them (arm E2b: 0 of 28 in the dictionary) and no team witness run produced an op on one. The honest wording is "no user path reaches them", not "none could ever be shared"; a module that ships a table through Ninja/plugins gets shared by shipping its own flow row (zero adapter code, E4 `plus`), which is the intended route and is witnessed.
**The abstraction (§25.1), measured.** `common/comm/team_scope.js` (`TeamScope`) is the single reader of the plan; **both adapters call it** — the Modeller's hand-rolled derivation was replaced by 3 `TeamScope` calls, the ERP got `scopeOf` with no derivation of its own. Honest line count (non-blank non-comment): `team_scope.js` **+23**; adapters touched 21 changed lines, net **ERP +2 / Modeller 0**; `STATION_LOCAL` literal gone (5 names now in `flows_erp.json`), `CLASS` literal gone (§24). So custom code did **not** fall in this change — one new 23-line reader is added once, and what is removed is *duplication of scope knowledge* (two lists, two derivations) and the third copy that would have come with the next host. The gain is structural (a third host = a plan file + `TeamScope` calls, no new derivation), as for §22.
**Files (bim-ootb, branch `feat/erp-team-plan`):** NEW `common/comm/team_scope.js`, `erp/team_plan.js` (GENERATED, 998 + 5), `erp/tests/witness_team_plan.js`; `erp/team_sync.js`, `erp/idempiere.html` (loader), `erp/sw.js` (precache, v906→v907); `modeller/team_sync.js` (now on `TeamScope`), `modeller/modeller.html`, `modeller/sw.js` (v160→v161), `modeller/tests/witness_team_plan.js`. Compiler side: `build/scriptor/emit_erp_plan.js`, `scripts/witness_scriptor_erp_plan.js`, `scripts/witness_scriptor_team_scope.js`. `sw.js` is the conflict magnet: keep both precache additions, take the HIGHER `CACHE_VERSION`.
**Still NOT done (and why):** narrowing the ERP scope to a team-ERP strategy (G9; needs the strategy + the every-window twin check — this step makes it a data change) · L1 (INSTRUMENT device state still in the engine core) · plan signing (Q1) · wing-claim/focus, presence and §23 ideas (held).

---

## §26 Flow Row PATTERN LIBRARY — common samples + a plain-English guide (2026-10-25; owner: *"Use it to set common pattern samples for now, as long as we understand and can guide users how to use it. Thus the Flow Row is the abstraction we been aiming for?"*; spec written BEFORE the files)
**Answer to the question, recorded.** The Flow Row is the *interface* the user touches (the "what"); the *abstraction* the lane is after is three parts: the **row** (declaration) + the **treatment registry** (the factory side: the row's `treatment` name looks up the component that knows how to carry it out, §22.3) + the **plan reader** `TeamScope` (what a host consumes, §25.1). A user needs only the first; an engineer extends the second; a host author uses the third.
**Deliverable (no new engine code).** (a) `build/scriptor/patterns.json` — the pattern catalogue as DATA: per pattern `id`, `name`, `want` (one plain sentence: "I want …"), `rows` (by reference to the real, already-witnessed sample rows in `flows*.json`, or inline SAMPLE rows where none exists), `proves` (the existing `§W-…` arms that demonstrate the behaviour), `adjust` (which fields to change when copying). (b) `docs/ReplicationFlowRows.md` — the guide: what a row is and its fields, "I want … → use pattern" table, each pattern with its row verbatim and the compile output verbatim, a 6-step "how to write your own", and "common mistakes" each with the **exact message** the compiler gives. (c) `scripts/witness_scriptor_patterns.js` — keeps the guide from lying.
**Patterns (each EXISTS and is witnessed; nothing invented).** P1 *branch sale up, stock answer down* (FACT UP + RULE + FACT DOWN; `F1/R1/F2`) · P2 *price list pushed to one branch* (SEED addressed; `S1`) · P3 *a public value everyone may fetch, once a day* (SEED public; `S2`, `S0`) · P4 *a code that carries value (loyalty / store credit)* (INSTRUMENT; `I1`) · P5 *a customer's payment up, a confirmation down* (FACT UP + RULE + FACT DOWN, Micro Finance; `P1/R2/N1`) · P6 *a team shares records of a dictionary table* (FACT BOTH space; a generated ERP row) · P7 *a team shares records that are not in the dictionary* (virtual table + list values; `flows_modeller.json`) · P8 *a table that stays on its own station* (LOCAL; `flows_erp.json`) · P9 *another table, same shape, no code* (copy a row; `flows_extra.json`). A pattern not witnessed is not in the library.
**Witness `W-PATTERNS` (RED first: the guide and catalogue do not exist).** G1 every pattern's rows resolve (referenced rows exist, names unique) and compile through `compile.js` with **0 errors**; treatment validation passes · G2 `proves` names exist: each `§W-…` tag is present in the named witness source (a guide cannot cite an arm that does not exist) · G3 **guide ⇄ data parity**: every fenced row block in the guide deep-equals a catalogue row, every catalogue pattern appears in the guide with its id, and the verbatim compile-output block of each pattern equals what `compile.js` prints now (so the guide cannot drift from the engine) · G4 **common mistakes are real**: each listed mistake is reproduced on a copy of a pattern row and the compiler/validator gives the documented message (typo'd column → `declaredMissing`; unknown treatment; `BOTH` without `space`; `space` without `BOTH`; a nonexistent table → `no-table`; a virtual column with an unknown class → `V1`; a duplicate virtual column → `V3`; a missing `needs` parameter) · G5 coverage: every registered treatment is used by ≥ 1 pattern (a treatment with no pattern is reported, not hidden) and every row field the compiler reads is described in the guide's field table. *Mutants:* a pattern row broken (typo'd carried column) → G1 red · a guide row edited → G3 red · a documented message changed → G4 red · a cited arm renamed → G2 red.
**Plain-English rule for the guide (owner feedback "short plain English, no jargon"):** no engine words in the user text without a one-line gloss; a row is explained field by field with the SAMPLE value next to it; each mistake shows the message and the one-line fix.

### Idea 2 — "Abstract enough to be managed by a higher container for high-performance enterprise" (owner, 2026-10-25; PARKED, planned, not built)
**As said.** *"Being abstract, it can be easier handled by a higher container later that manages perhaps a high-performance enterprise that we may place our app in?"*
**My reading.** The row/treatment/plan split makes the replication layer something an orchestrator can operate: compile plans from rows, simulate before rollout, sign, version, deploy, roll back; host the convenience parts (relay, hub/admin device, compiler, monitoring) in managed infrastructure while the truth stays in the signed log.
**What already supports it (witnessed):** plans are deterministic data with a hash (`emit_plan.js`, drift witnesses); the relay needs only put/get/list (`sim.js` `Relay`; the mirrored-pipe arm `FILMDAY-POS-rebuild`); the hub is rebuilt from the shelf identically (`W-TREAT-HUBFAIL`); treatments load from a directory (`W-REG-ZEROCODE`); a plan can be simulated before rollout (`sim.js`). **What is NOT there:** the hub as a deployable unit (it is a simulator object); plan signing (Q1) and audience keys (gap 9); observability/health of the engine; any throughput measurement on enterprise hardware (only the browser memory data in `docs/BrowserScaleBenchmark.md` and the measured relay limits ≈ 31 devices per GitHub account, ≈ 100 on the web relay); a rollout/rollback protocol for plans.
**Guard rail (so the container does not become the server we removed):** it may host carriage and convenience, never derive truth for devices; losing it must cost availability only (witness idea: kill the hosted hub + relay, rebuild from the shelf, same fold hash — `W-TREAT-HUBFAIL` extended to a hosted unit). TWIN RULE: hosting must not change application behaviour.
**Plan (spec first, after the engine gaps below):** (a) plan signing + verification (so a container can distribute plans it cannot forge) (b) audience keys (so a hosted relay cannot read) (c) a hosted-hub contract: stateless admin device + health/readiness + rebuild-from-shelf (d) rollout protocol: simulate → sign → stage → activate → rollback, each with a witness (e) a measured scale run on real infrastructure when the owner names one. Open for the owner (Q-F): which environment is meant (managed Kubernetes, an app server, a vendor cloud) — it decides (c)–(e); not asked now.

### §26.1 Pattern library RESULT — ✅ DONE (witness, 2026-10-25)
**`scripts/witness_scriptor_patterns.js`: `§PAT_VERDICT PASS judged=89 fails=0`** (RED first: `build/scriptor/patterns_RED_before.log`, 42 red — the guide did not exist and mistake M12 was not produced). Deliverables: `build/scriptor/patterns.json` (9 patterns, 12 documented mistakes), `build/scriptor/patterns.js` (loader/resolver/mutator), `build/scriptor/report.js` (the plain-text compile report — `x` mistake · `!` question · `i` fact), `build/scriptor/gen_patterns_doc.js` → **`docs/ReplicationFlowRows.md`** (20.5 KB, generated, not typed). G1 all 9 patterns compile with 0 problems, P6 carries every mandatory column · G2 all 20 cited `§W-…` arms exist in the cited witness files · G3 each pattern's row block equals the catalogue and each "what the compiler says" block equals the engine's output today (so the guide cannot drift) · G4 all 12 mistakes produce exactly the documented line and the guide shows that exact line · G5 every registered treatment (FACT, INSTRUMENT, LOCAL, RULE, SEED) has a pattern and every field used is explained. Mutants (no survivor): typo'd pattern column → G1, G3 · guide row edited → G3 · documented message changed → G4 · cited arm renamed → G2 · P8 dropped → G5 · field explained nowhere → G5.
**A real compiler gap the guide work found and closed:** the compiler did not check that a RULE's `on` / `emits` name an existing row (a typo'd `emits` compiled silently). Fix is one generic point, not a rule-specific branch: a component declares `refs:[params that name other rows]` (`rule.js`: `['on','emits']`), `treat.js` `refs(row, names)` (+3 lines), `compile.js` passes the set of row names (+2). Mistake **M12** reproduces it: `RULE emits names a row that does not exist: F9 replenishment-typo`. Regression to re-run with this change is listed in the commit.
**Honest note on the guide:** all rows are SAMPLES (section 7 of the guide says so); only the Modeller and the ERP team scope are read by live applications; signing and audience keys are stated as not built.

---

## §27 Closing the abstraction: L1 — the engine core knows no treatment's STATE (2026-10-25; owner: *"Proceed on those that you stated is needed to be more complete"*; spec written BEFORE code)
**Issue (named limit L1, §22.4).** After §22.3 the core `sim.js` still builds and resets state that belongs to particular treatments: device fields `out inbox seen ledger` (FACT), `pull` (SEED), `applied balance seq` and the signing keypair (INSTRUMENT); hub fields `rec seen dups collisions` (FACT), `acct` (INSTRUMENT), `ver` (SEED); `World.restore` recognises `.applied` / `.issued` flow suffixes and lists the `o/` and `d/` prefixes; `rosterValue` reads the INSTRUMENT keys; `hubSend` writes the `d/` name format; `sell` pushes to FACT's queue. A sixth treatment with its own state therefore cannot be initialised, wiped or folded back without editing the core. **Mechanism (same stance as §22.3, iDempiere `ModelValidationEngine` fan-out to every registered listener at a named point):** the core gets two generic dispatchers — `each(point, …)` and `collect(point, …)` over the registry — and the components own their state through five more optional points: `deviceInit(w, dev, opts)` · `deviceReset(w, dev)` (a wipe; keys survive) · `unsent(w, dev) → n` · `restore(w, dev, view) → {counters}` and its per-fact fan-out `restoreFact(w, dev, fact)` · `hubInit(w)` · `hubReset(w)` · `enqueue(w, dev, row, key, fields)` (a local action) · `hubSend(w, row, station, fact)` · `roster(w)`. Device fields keep their **names and places** (`dev.balance`, `dev.out`, …) so witnesses and the film read them unchanged; only the owner of the code that creates and resets them moves.
**Witness `W-REG-STATE` (added to `witness_scriptor_registry.js`, RED first).** R7 a NEW treatment from a NEW file (test fixture `TALLY`) with its own device state: `deviceInit` creates it, a wipe resets it, `restoreFact` rebuilds it from the shelf — scenario: 2 facts sent, wipe (state 0), restore (state 2) — with **core sha256 identical before/after** (today: the field does not exist, red) · R8 the core (`sim.js`, `treat.js`) names no treatment's state: 0 property accesses of `.out .inbox .ledger .pull .applied .balance .seq .priv .pub .rec .acct` and no `.applied` / `.issued` suffix test · R9 behaviour preserved: `witness_scriptor_treat.js` PASS 30 / 11 mutants, traces equal the recorded baseline, mesh/virtual/s1/dryrun unchanged. *Mutants:* fan-out `restoreFact` dropped (R7 red) · `deviceReset` dropped (R7 red).
**Honest leftovers to be listed in the result, not hidden:** `World.stats` counters (`fetch skipped sent scopeViolations`) and the trace kind `local-sale` stay in the core until the film is final.

### §16.26 Scale probe — what the abstraction costs as things multiply (2026-10-25; user: *"Perhaps the real value is when we scale things?"* · *"Yes indeed, as ERP value such attention"*) — SPEC ONLY; nothing built; read-only on the adapters and the engine
**Why this is the test.** So far the measured picture is small and honest: one adapter moved from a list to rows at **+10 / −2 lines** (§24.1), the JSON rows are *more* lines than the lists they replace (§22.8), about 98 % of the adapters is not touched. At N = 1 the abstraction **costs more** than a hard-coded list. A claim of value is therefore a claim about the **slope**, not the intercept: what it costs to add the Nth flow, host, policy change or schema change. The ERP is where N is large (1,003 active tables; strategy 100 types 47 Merge / 188 Reference / 217 Local / 551 unclassified; the team ERP shares 998 today), which is why it gets this attention.
**Hypothesis H (stated before any measurement; falsifiable).** With the abstraction: (H1) the **engine and compiler code do not change** at any N; (H2) compile cost grows **no worse than linearly** in the number of flows; (H3) the **host-specific code needed per added host** is a small constant (consuming a plan), not proportional to the number of flows; (H4) a **policy change across hosts** is a data change (rows → plan diff), touching no host code; (H5) an **AD change** that breaks a row is caught at compile time, not at run time. **H is partly or wholly false if:** any N needs an engine/compiler edit; time(2N)/time(N) exceeds 2.5 at any step; an added host needs scope-specific code proportional to its flows; a policy change touches adapter code; an AD change breaks a flow silently.
**Definitions (fixed before the run, so the numbers cannot be tuned).** *Host-specific scope lines* = non-blank, non-comment lines in an adapter whose job is deciding what is shared (counted by a recorded grep and reviewed line by line; §20 estimated about 19 across the two adapters). *Rows* = JSON lines in the flow files. *Engine/compiler code hash* = sha256 of `scope.js flow.js compile.js treat.js sim.js treatments/*.js`. *Counterfactual* = the lines and files that **actually exist** in the real adapters and would have to change under the old arrangement — counted from code, never an invented estimate; where no real counterpart exists the cell is INCONCLUSIVE. The 2.5 threshold is a test definition, not a measured fact.
**Ladders.**
- **L1 flow ladder — `W-SCALE-FLOWS`.** Compile N = 10, 100, 500 and all active AD tables (~1,003) as FACT rows (generated in memory from `ad_full.db`, every guard on). Record per N: compile time (median of 5 runs), plan bytes, errors (expected 0), determinism (same rows → same sha256), engine/compiler hash before = after. *Prediction P1:* errors 0 at every N; hash identical; time roughly linear (ratio test above). *Control with teeth:* one row naming a nonexistent table at N = 1,003 must turn the run red and name the row.
- **L2 host ladder — `W-SCALE-HOSTS`.** Hosts: the Modeller (virtual table, 1 + 1 + 6 rows), the ERP team (998 + 5 rows, per §25), the POS flows, the Micro Finance flows, and an **invented fifth host** added as rows only. Record per host: rows, engine/compiler files touched (expected 0), host-specific lines that read the plan (the Modeller's measured +10 / −2; the ERP's once §25 has a recorded result; the invented host consumes a plan through the shared reader `team_scope.js` in a harness — count its lines). *Prediction P2:* host-specific consumption lines per host stay in one small band while rows grow from 8 to about 1,000; engine files touched 0 for all five. *Control:* a host that needs an engine edit (planted) is flagged.
- **L3 change ladder — `W-SCALE-CHANGE`.** Three policy changes: (a) move one table from shared to local on both hosts; (b) add one op type; (c) the ERP's flip from share-everything to default-deny (998 → the Merge rows; the every-window twin check stays a separate, unwritten gate). Per change: **abstraction side** = rows changed, plan diff bytes, host code files touched (expected 0), witnesses to re-run; **counterfactual side** = files and lines that exist in the real adapters that would change. *Prediction P3:* host code touched = 0 for all three; the counterfactual side touches at least one adapter file for (a) and (b) and both adapters for (c).
- **L4 AD-change ladder — `W-SCALE-AD`.** Compile the same rows against the two AD snapshots on disk (`ad_full.db` 1,076 tables; `bim-ootb/erp/ad_seed.db` 1,004) and against **synthetic mutations** of a COPY of `ad_full.db` (never the original): rename a table, drop a column, change a reference type. Record per mutation how many rows go red at compile time and whether any row is silently wrong (judged by an independent recomputation). *Prediction P4:* every breaking mutation is caught at compile time (silent = 0); the plan diff between snapshots is listed, not hidden. An earlier one-off run showed the same shapes on both snapshots with every table typed "unlisted" in the thinner one — that behaviour stays in the record.
- **L5 device and pipe ladder — `W-SCALE-BUDGET` (BLOCKED).** Devices 6 / 12 / 24 / 30 / 60 × visit cadence against the relay's rated push limit (§17 T1, which §20a assigns to the engine). **Blocked on S2/S3** (a plan format that carries cadence, and generated plans running in the office-day simulator); until then it is INCONCLUSIVE and says so. GitHub's recommended cap of about 6 pushes a minute per repository (R3, via a digest — re-read before use) is the reference.
**Output.** One log `build/scriptor/scale.log` with `§SCALE_*` lines and a table per ladder; one verdict line `§SCALE_VERDICT` that prints **PASS-WITH-INCONCLUSIVE(n)** or FAIL, never a bare PASS while L5 is blocked; for each prediction a line `P1 held` or `P1 FAILED because …`. New file: `scripts/witness_scriptor_scale.js`. **Not touched:** the adapters (read by `git show` at the pinned commit; worktrees read-only), the engine files, `~/bim-ootb`. The probe is read-only measurement and so allowed under the HOLD (§20).
**What it will and will not show.** It can show that scope cost stays flat while rows grow, that policy and schema changes are data and caught early, and where host code is still needed. It **cannot** show product benefit (only counts), real-device behaviour, or that the ERP's default-deny flip is safe (that is the every-window twin check, §20 G9). If H fails on any point the film says so.
**Film.** After the results: a short part, or a follow-up film, on the slope — *what changes when N grows* — built, like Films 1 and 2, only from log lines. Until then the "under the hood" cut ships as planned.
**Owed:** the user's OK to build; the host-specific-lines recount reviewed line by line; §25's recorded result for the ERP row of L2 (otherwise that cell reads "specified, not measured").
### §27.1 L1 RESULT — ✅ DONE (witness, 2026-10-25): the engine core names no treatment's state
RED first: `build/scriptor/registry_L1_RED_before.log` (29 leaked state accesses in the core; the fixture's `deviceInit` never ran: `init=undefined`). After: **`§REG_VERDICT PASS judged=18 fails=0`** (`registry.log`). R7 a NEW treatment `TALLY` (a test fixture in a NEW file) owns device state: created by `deviceInit` (0), rebuilt from the shelf by `restoreFact` (2), reset by a wipe (0), rebuilt (2) — core sha256 identical before/after · R8 the core (`sim.js`, `treat.js`) has **0** accesses to `.out .inbox .ledger .pull .applied .balance .seq .priv .pub .rec .acct` and no `.applied$` / `.issued$` suffix test · R9 behaviour preserved: `witness_scriptor_treat.js` PASS 30 / 11 mutants and **both film traces equal the recorded baseline** (normalized sha256 `95b1e7e79f30` / `6465344e7913`). Mutants: `restoreFact` fan-out dropped → red · `deviceReset` dropped → red. **The witness caught a hole in its own first draft:** the `deviceReset`-dropped mutant first SURVIVED because the fixture never held a non-zero value before the wipe; the scenario now restores (2) before it wipes (0).
**What moved (state ownership, names and places unchanged so witnesses and the film read the same fields):** FACT owns `out inbox seen ledger`, the hub `rec seen dups collisions`, `enqueue` (the local action), `unsent`, `hubSend` (the `d/` name format) and the own/down fold-back; SEED owns `pull` and `hub.ver`; INSTRUMENT owns `applied balance seq`, the signing keypair, `hub.acct`, the `.applied` / `.issued` fold-back and the roster of public keys (`w.rosterValue()` → `I.roster(w)`). The core got two generic dispatchers (`each`, `collect`) and no state. **Contract is now 17 extension points** (listed in the `treat.js` header). **Count, measured (non-blank non-comment):** core `treat.js` 17→**18**, `sim.js` 76→**70** (core total 93 → **88**); components fact 61→**77**, instrument 43→**52**, seed 13→**16**, rule 10→**11**, local 2 (components 129 → **158**): the state moved out of the core into the components that own it, so the core is smaller and every line that remains names no treatment.
**Leftovers, still named:** `World.stats` counters (`fetch skipped sent scopeViolations`) and the trace kind `local-sale` stay in the core (the film is not final). `scripts/witness_scriptor_{team_scope,erp_plan,modeller_plan}.js` now read bim-ootb with `git show origin/main:` through `scripts/lib_ootb.js` (no worktree needed): PASS 14 / 8 / 5 on merged `origin/main`.

---

## §28 Plan SIGNING — the mechanism (2026-10-25; owner: *"Proceed on those that you stated is needed to be more complete"*; spec BEFORE code). Key custody (§16.13 Q1) stays the owner's: this builds the mechanism with the trusted key as CONFIGURATION
**Issue.** Every plan is unsigned (named limit in §24.1, §25.2): anyone who can edit `team_plan.js` on a device widens what that device sends, and nothing proves which admin issued a plan. A hosting container (idea 2) cannot distribute plans it cannot be stopped from forging. **Primitive reused, not invented:** the comm layer already signs with WebCrypto ECDSA P-256 / SHA-256 over canonical JSON (`common/comm/comm_envelope.js:89-97`, public keys as JWK). Plans use the same primitive.
**Design.** (a) *Signing (compiler side, Node):* `build/scriptor/sign_plan.js` — `keygen()` → `{publicJwk, privateJwk}`, `sign(plan, privateJwk, publicJwk)` adds `sig` (hex r‖s) and `signer` (the public JWK) over `canon(plan without sig/signer)` (sorted-key JSON); the emitters take an optional signing key; **private keys are never written inside the repo** (the CLI writes to a directory the caller names). (b) *Verification (host side, `TeamScope`, bim-ootb `common/comm/team_scope.js`):* `TeamScope.verify(subtle)` (async, WebCrypto injected) sets the plan's state: `unsigned` (no trust configured — allowed, the prototype default, visible as `TeamScope.state()`) · `ok` · `invalid` (signature does not verify, or a signed field changed) · `untrusted` (signer not in the trust list) · `missing`. **Trust = `window.TEAM_PLAN_TRUST`, an array of public JWKs** set by the host; where it comes from (the founder's device, an offline admin key, the space POLICY) is Q1 and is NOT decided here. (c) *Fail closed:* if a trust list is configured, every `TeamScope` answer is empty/`unplanned` **until** the state is `ok` — while the check is pending, for an unsigned plan, for a bad signature, for an untrusted signer. No trust list ⇒ today's behaviour, unchanged (so the merged hosts keep working; wiring `await TeamScope.verify(crypto.subtle)` into the adapters' boot is a one-line step taken when Q1 is answered).
**Witness `W-SIGN-*` (`scripts/witness_scriptor_sign.js`, Node, the REAL generated plans of both hosts, vm-loaded `TeamScope` + Node WebCrypto; RED first: `verify` does not exist).** S1 a plan signed by the compiler verifies `ok` under the matching trust and the scope answers are the unsigned ones · S2 one list value added after signing (`GEOM_FOO`) → `invalid`, scope closed · S3 signed by another key → `untrusted`, closed · S4 unsigned plan with a trust list → closed · S5 no trust list ⇒ unsigned plan still works (state `unsigned`) · S6 the signed `hash` field edited → `invalid` · S7 canonical form: the same plan with keys re-ordered still verifies (the signature is over content, not text) · S8 cross-implementation: signed by `sign_plan.js` (Node), verified by `TeamScope` (browser code path) over WebCrypto · S9 while the check is pending, with a trust list, answers are closed (no window of unverified use) · S10 the ERP plan (998 tables) signs and verifies too (size/time reported). *Mutants:* verification skipped (always `ok`) → S2/S3/S4/S6 red · signer not matched against the trust list → S3 red · unsigned accepted under trust → S4 red · pending treated as open → S9 red · canonicalisation order-sensitive → S7 red. **Deletion/addition budget:** `team_scope.js` +≈22 lines, `sign_plan.js` ≈25, emitters +3 each.
**Honest scope:** this proves a plan was issued by a key the host trusts and has not been altered; it does not make a signed plan a *good* plan, and it does not give read isolation (audience keys, §29). Rotation/revocation of the admin key is NOT specified here (named, owner decision with Q1).

---

## §29 Read isolation — AUDIENCE SEALING, prototyped in the engine simulator (2026-10-25; owner: *"Proceed on those that you stated is needed to be more complete"*; spec BEFORE code). Design source: §13.12 C-4 (*"one key epoch per audience … an op is sealed to its table's audience; members hold the keys of the audiences they belong to"*); closes the `INCONCLUSIVE` of `W-SCRIPTOR-LEAK-BYTES` (§16.13 / B3) **in the simulator only**
**Issue.** Today scope (§22.5 `scope`, I1) is enforced by the *honest client*: a modified client, or whoever operates the shelf, reads every byte in the space. Plan-level isolation (`W-SCRIPTOR-LEAK-PLAN`) does not stop that. **Scope of this step, stated first:** the engine simulator (`build/scriptor/sim.js` + `treatments/fact.js`). It proves the *mechanism* and the *witness*. It does **not** touch the real comm layer (`build/comm/*`, `common/comm/*`: one agent at a time, HOLD), so no live application changes; the real integration (key epochs distributed by the POLICY op, rotation, revocation) is a separate step with its own witness `W-READ-SCOPE` and is NOT claimed done by this one.
**Design.** A FACT row may carry `seal: "<audience name>"` (default: none ⇒ plaintext, today's behaviour — so every existing witness is unchanged by construction). Per audience the world holds one AES-256-GCM key; a device holds only the keys of the audiences listed in its `audiences` (a device option; in the real system the roster/policy). (a) *Sealing:* the fact `{flow, key, fields, by}` is encrypted with the audience key; what the shelf stores is `{seal: audience, iv, ct, tag}` — **no field values, no natural key**. (b) *Names:* the shelf name must not leak the plaintext either: `o/<device>/<flow>/<opaque>` where `<opaque>` = first 12 hex of **HMAC-SHA256(audience key, canonical(key‖fields))** — equal content has equal names *for key holders only*; a dictionary attack on small values (a product code, a quantity) needs the key. (c) *Opening:* a reader opens with its key; no key or a wrong key ⇒ `unreadable` (logged, counted, never accepted); a flipped byte ⇒ the GCM tag fails ⇒ `tampered` (never accepted). (d) *Hub/members:* the hub (head office) and mesh members hold the audience key by option; accept, duplicate, collision detection and the fold work on the opened fact exactly as before. **Named residual (not hidden):** the shelf still shows metadata — the device id, the flow name, the number and timing of facts, sizes. A member removed from an audience keeps what they already downloaded and the old epoch; **key rotation / revocation is out of scope here** (§13.11 gap 8, inherent).
**Witness `W-SEAL-*` (`scripts/witness_scriptor_seal.js`, RED first: `seal` is not a field the engine knows ⇒ the sealed flow is stored in plaintext).** L1 **bytes**: after a cycle, the whole shelf dump contains none of the sealed flow's field values or natural keys, while a CONTROL unsealed flow in the same world shows its values (the test can fail) · L2 **outsider with full shelf access** (a modified client that ignores scope and reads every name): 0 of N sealed facts open; the insider opens N of N · L3 **tamper**: one byte flipped on the shelf ⇒ not accepted, `tampered` counted · L4 **wrong audience**: a holder of audience B's key opens 0 of A's · L5 **end to end**: sealed sale → hub accepts the same fact as the plaintext run (hub record equals), a resend is a duplicate, a changed resend with the same key is a collision · L6 **mesh**: a sealed space flow — members converge to ONE fold hash, an outsider who ignores scope reads 0 · L7 **names**: the same plaintext in two audiences gets different names; an attacker who knows the plaintext but not the key cannot recompute any shelf name (and with the key can — the control) · L8 existing arms unchanged: treat 30 / 11, registry 18, mesh 25, traces equal baseline. *Mutants:* sealing off · one key shared by all audiences (L4 red) · unauthenticated cipher (L3 red) · name from the plaintext hash (L7 red) · key given to the outsider (L2 red) · open skips the audience check (L4 red). `W-SCRIPTOR-LEAK-BYTES` is then reported as **JUDGED in the simulator, INCONCLUSIVE for the real comm layer** — never a bare PASS.
**Order inside the lane:** after §28 signing is merged. The real-layer integration (`W-READ-SCOPE`) waits for the HOLD to lift on `common/comm/*`.


### §16.27 Film 2 v2 — handoff (WIP) (2026-10-25; written at the coordinator's wind-down; nothing here was run after the wind-down message except the file copies and this text)
**Why a v2.** User feedback: Film 2 must be SEPARATE from Film 1 (no POS day, no Micro Finance, no cashier code / returns / loyalty) and the new angle is *under the hood: how bloat is reduced or better managed*, built only from recorded facts (the real Modeller / ERP adapters, their witnesses, the engine's own shape). v1 (`~/Videos/Keeping_the_bloat_off_ReplicationEngine_EN_2026-10-25.mp4`, §16.24, 554.9 s, Film 1's sample day in Part 3) is **untouched**.
**Which file is final, which interim.** `~/Videos/Keeping_the_bloat_off_ReplicationEngine_EN_2026-10-25_v2.mp4` (saved 09:20, 443.92 s = 7:24, 10,654 frames) is a **COMPLETE, mux-finished, but INTERIM cut**. Its Part 3 is the **"under the hood" real-adapter Part 3** (cards `u_code`, `u_chain`, `u_probes`, `u_erp`, `u_ledger`, `u_engine`, `u_why`, `u_next`); it contains **no** neutral Device A/B demo (that attempt was built and checked once, then replaced on the coordinator's instruction; its files are only in scratch `v2_neutral_attempt/`, not shipped) and **no** POS / Micro Finance material. It is interim because the source was edited AFTER that mux (see "Pending edits") and the caption bbox check was still running. Nothing is half-written in `~/Videos`; the file plays.
**Instructions: done / half-done / not started.** DONE: no Film 1 content anywhere (word witness 0 hits, see below); opener, Part 1, Part 2 kept (Part 2 now has `r_strategy`, `r_row` with the REAL Modeller row `flows_modeller.json`, `r_zero`, `r_bloat`; the old `r_dry` and `r_ledger` cards were folded into Part 3); under-the-hood Part 3 replacing the neutral demo, with the code before / after / now (`4e95b393`, `5dfa4231`, `4958a885`, exact commands and line numbers), the chain, the probes from the real witnesses, the ERP step, the ledger, the engine's own shape, why-no-live-connection (static diagram), what is next; a single closing pointer to Film 1 ("A full working day on a real case is shown in the first film", on the limits card and in the narration only); limits card without "unchanged". HALF-DONE: the limits / next-steps wording was updated for §28 signing AFTER the mux (see Pending). NOT STARTED: the Thai cut; the OFFLINE-label stage check is not applicable (v2 has no stage scene).
**State of the facts read (all by command, recorded in `facts.json` `queries`).** Modeller change = **PR #2369 MERGED** (`gh pr view`; `git show --numstat 5dfa4231`: team_sync.js +10 / −2, 5 files +112 / −4); ERP step + shared reader `TeamScope` = **PR #2370 MERGED** (§25.2: `W-PLAN-ERP` PASS judged=16 open=1, re-run for this film; `witness_scriptor_erp_plan.js` PASS 8; `witness_scriptor_team_scope.js` PASS 14; `team_scope.js` 23 non-comment lines, on main 1,930 bytes; net ERP +2 / Modeller 0). So the coordinator's earlier "not committed, in a worktree" instruction was superseded by the facts: the film says §24.1 recorded it as not committed and that it has since been merged. The worktree `/tmp/wt-team-plan` was removed after the merge: `witness_scriptor_modeller_plan.js` now prints INCONCLUSIVE; its PASS 5 run is kept in `film2/logs/modplan_run.log`.
**Moving ground (important).** The engine lane kept editing `build/scriptor/` while the film was built (L1 §27.1, signing §28, sealing §29): at 09:14 `registry.log` and `mesh.log` were red mid-edit; live line counts became 94 / 130 / 224 / 274. The film therefore reads **frozen inputs**: `film2/logs/inputs/*.log` (the last all-green runs) and `film2/logs/lines_frozen.json` (core **93**, components **129**, engine **222**, toolchain **274**, same counting command; from v1's measured facts). If the next session wants current numbers it must delete `lines_frozen.json`, re-run every witness to a green state, re-copy the logs and re-build everything.
**Measured checks that PASSED on the 09:20 file** (from the logs): frames silent = final = **10,654**; video 443.917 s, audio 443.916 s; fit **29/29 DETAIL**, tone **29 OK / 0 WRONG**; speech onset vs `§FILM_CUE` max **0.05 s** (29 beats, window from cue−0.2 s); loudness two-pass pass 1 I=−23.8, final **I=−16.4 LUFS, LRA 2.3 LU, peak −1.4 dBFS**; `silencedetect` −40 dB / 2 s: **2 gaps** (3.45 s, and the 4.47 s end tail); captions: `ass_band` 77 wrapped captions all within 2 lines (widest 1,739 of 1,740 px); `§NUM_CHECK` **47 spoken numbers = 42 facts, 0 mismatch**; soft ASR (whisper small.en) **47 of 47** heard, 0 unexpected; layout: 125 changed frames, **0** flagged, 29 cards at their fully revealed state **0** flagged (clipping, outside the area, overlapping boxes); citations: **26 quotes byte-equal** to the verified JSON (26 distinct claims), 26 bars (publisher + title + date), Sources cards list **22 URLs = exactly the 22 cited**; logos: 13 distinct, 32 `<img>`, all loaded, `data-sha` = index, the 13 requested files' sha256 on disk = index, `object-fit: contain`, plain-text names Nostr / Triplit / Scuttlebutt, trademark line + Manyverse credit, no Matrix logo; **words witness** (`film4_words.js`): 165 texts (card text without code panels, narration and its source labels, captions) — pos, point of sale, Unicenta, cashier, replenish*, loyalty, return(s), micro finance, borrower, gold, ticket(s), sale(s), hiatus, fork, retired, unsolved, entirely, Flexible Sync = **0 hits**; the closing pointer is at: card `limits`, narration `limits`, caption 73; whole-word matching, so the dictionary identifier `QtyLostSales` and the letters in `pos_x` are not hits (printed as information); the Java keyword `return` in the iDempiere source panels (d_source, u_code, u_chain) is scanned apart and listed; controls (`film2_controls.js`) PASS.
**Checks NOT yet run / not finished.** `sub_fit.py` (rendered caption bbox) was **still running** on the 09:20 captions (48 of 77 done, 0 WRONG so far; log `film2/logs/v2/subfit.log` is a partial copy); every check after the pending edits below; the full chain has never been run on the edited source.
**Pending edits already in the source but NOT rendered** (made after the 09:20 mux, because `build/scriptor/sign.log` now shows `§SIGN_VERDICT PASS judged=18` and the old wording "plan signing is not built" became stale): `cards4.js` (limits bullets 2 and 4; `u_next` bullet 2; ledger bullet "plans on main are unsigned"), `film4_tsv.js` (`u_next` narration: "Signing is prototyped in the engine, but no product verifies it yet…"), `facts4.js` (fact `signJudged` from `logs/inputs/sign.log`; `teamScopeVerifyOnMain` = 0 checked by `gh api … | grep -c verify`). The 09:20 file still says signing / real pipes are not built — true for the products, but it omits the engine prototype. §29 sealing (`seal.log` unfinished at 09:25) is NOT claimed anywhere; the limits card still says the runs are not encrypted.
**Scratch folder and passes** (`/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/film2_work/`): `v3_p0` (measure TSV), `v3_fit0` / `v3_fit1` (measure fits, `beatmin.json` in `v3_p1`), `v3_p2` (record with the then-live 94/130/224 counts — **do not use**), **`v3_p3` (record that shipped; frozen inputs)**, `v3_fit2` (aborted: TSV build failed on a red live log), **`v3_fit3` (final fit + `fin.ass` + `fin_plan.tsv` that shipped)**; earlier neutral-demo attempt: `v2_p0..2`, `v2_fit0..3`, `v2_neutral_attempt/` (moved files: `neutral_day.js`, `neutral_flows.json`, `neutral_trace.json`, `facts3.js`, `cards3.js`, `beats3.js`, `film3_*.js`, `stage3.*`); v1: `p0..p3`, `fit0..fit4`.
**Files (all under `scripts/film_replication_engine/film2/`, uncommitted).** v2 sources: `facts4.js`, `cards4.js`, `beats4.js`, `film4_record.js`, `film4_tsv.js`, `film4_words.js`, `stage4.html`, `stage4.js`, `film2_controls.js`, `asr_numbers_en.py`, `build_index.js` (+ `film2_claims.json`, `film2_logos_index.json`). v1 sources kept: `facts2.js`, `cards2.js`, `beats2.js`, `film2_record.js`, `film2_tsv.js`, `stage2.*`. Logs: `logs/` (v1), `logs/v2/` (v2: `film.log`, `facts.json`, `narration_en_v2.tsv` = **the English script the Thai cut must translate once final**, `cards_audit.json`, `fit.log`, `ass.log`, `cue02.log`, `asr.log`, `words.log`, `controls.log`, `mux.out`, `subfit.log`, `erp_plan_witness.log`), `logs/inputs/` (frozen witness logs), `logs/lines_frozen.json`, `logs/modplan_run.log`, `logs/erpplan_run.log`, `logs/teamscope_run.log`. Nothing outside `film2/` was edited; `~/bim-ootb` was only read (git show / gh); I ran `witness_scriptor_s1/treat/registry/virtual/mesh/dryrun/modeller_plan/erp_plan/team_scope.js` (read-only), which rewrote `build/scriptor/trace_film_*.json` once with identical content.
**Exact commands to continue** (cwd `scripts/film_replication_engine/film2`; `S=<scratch>/film2_work`):
1. `node film4_tsv.js measure $S/w0 $S/w0/measure.tsv` (must print `§NUM_CHECK … PASS`), then `cd $S/wfit0 && cp ~/bim-compiler/prompts/film_narration_ass_head.txt ass_head.txt && cp ../w0/measure.tsv . && FILM_SEC=999 ~/.local/share/film_narration/venv/bin/python ~/bim-compiler/prompts/film_narration_fit_kokoro_v3.py measure.tsv meas 1.15 > fit.log` (about 3 min; read every `§NARR_TONE … WRONG`), `python3 ../fit/beatmin.py $S/wfit0/fit.log $S/w0/beatmin.json`.
2. `BEAT_MIN=$S/w0/beatmin.json node film4_record.js $S/w1 > $S/w1.out` (about 2 min; read `§FILM_LAYOUT_DONE`, `§FILM_CARD_LAYOUT`, `§CITE_*`, `§LOGO_*`, `§FILM_DONE`).
3. `node film4_tsv.js build $S/w1 $S/w1/en.tsv`, then the same fit command with `en.tsv en 1.15` and `FILM_SEC=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $S/w1/film_silent.mp4)`.
4. `python3 ../fit/ass_band.py en.ass fin.ass; cp en_plan.tsv fin_plan.tsv; FILM_SEC=<dur> python3 ../fit/mux_two_pass.py fin $S/w1/film_silent.mp4 ~/Videos/…_v2.mp4` (it REFUSES to overwrite: move or delete the interim file first, deliberately).
5. Checks: `python3 -u ../fit/sub_fit.py fin.ass 930 > subfit.log` (about 13 min, run it last or in the background); `ffmpeg -i <mp4> -vn -af silencedetect=n=-40dB:d=2 -f null -`; `ffmpeg -i <mp4> -vn -af ebur128=peak=true -f null -`; the cue-onset check (`../fit/film_check.py` with the window start at cue−0.2 s, as in `fit3/film_check_w02.py`); `node film4_words.js $S/w1 $S/w1/en.tsv $S/wfit1/fin.ass`; `node film2_controls.js $S/w1`; `~/.local/share/film_narration/venv/bin/python -u asr_numbers_en.py $S/w1/en.tsv $S/wfit1 en`.
**Known defects / watch-outs.** (1) The 09:20 file's signing wording is stale (above). (2) `u_probes` / `u_erp` quote shortened log lines (labelled "lines shortened"). (3) The witness `modeller_plan` PASS 5 line comes from a saved run (worktree gone); its byte count says 880, `wc -c` of the merged file says 883 (both shown with their sources, not reconciled). (4) §24.1 says "6 arms red" in the no-plan run; the log shows 5 red arms then a crash — the card shows the log. (5) v2 is 7:24 against a 7–8 min target. (6) `facts4.js` runs `gh` and `git` against bim-ootb at build time (network, read-only); the PR / worktree facts can change again. (7) `r_bloat` still cites `treat.log W-TREAT-LOCAL` (Film 1's engine witness) for "a local action makes 0 shelf calls, a visit 3": numbers only, no Film 1 words on screen.
**Thai cut (after this).** The Thai film must translate the FINAL English script (`logs/v2/narration_en_v2.tsv` once the pending edits are rendered), the same cards and the same facts keys; outside quotes stay in their source language and byte-exact; logos unchanged; never start it from the 09:20 text.


#### §16.26a Scale probe — WIP handoff (2026-10-25; nothing measured by the witness yet; written to resume in a new session)
**Status by ladder.** `scripts/witness_scriptor_scale.js` exists as a WIP stub: it carries H1-H5 and P1-P4 verbatim from §16.26 in its header (pre-registered), prints `L5 INCONCLUSIVE (BLOCKED on S2/S3)` and `§SCALE_VERDICT INCONCLUSIVE — WIP` (never PASS). **L1, L2, L3, L4: NOT STARTED** (no measurement code). Syntax-checked and run once (3 lines of output). `build/scriptor/scale.log` was NOT created. No prediction held or failed yet.
**Pre-measurements taken by hand while designing (3 runs, not witness output, no log file; re-measure inside the witness):** `compile()` of 1,003 FACT rows (`emit_erp_plan.rowsFor` over `ad_full.db`, no carries = proposals) took **26.2 / 25.6 / 26.0 s** (about 26 ms per row; plan 1,003 entries, 887,766 JSON bytes); `buildEdges` alone 69 ms; 10 rows 349 ms. **Consequence for the design:** L1 with 5 runs per N costs about 5 x (0.35 + 2.6 + 13 + 26) s, about 3.5 minutes, plus a determinism compile per N; L4 compiles the full set once per mutation (about 26 s each). Run the witness in the background and read the log afterwards. Deliberate: do NOT shrink N.
**Facts found that change the spec's assumptions (read before building):**
1. **The worktrees `/tmp/wt-team-plan` and `/tmp/wt-erp-plan` no longer exist; both PRs are merged** into bim-ootb `origin/main` (#2369 Modeller `5dfa4231`, #2370 ERP + `TeamScope` `d0153e46`). The Modeller's +10/-2 is reproducible with `git -C ~/bim-ootb diff --numstat 4e95b393 5dfa4231 -- modeller/team_sync.js` = `10 2`. Cumulative 4e95b393..d0153e46: `modeller/team_sync.js` 10/2, `erp/team_sync.js` 10/8, NEW `common/comm/team_scope.js` 27 lines (shared reader, counted once). So the ERP row of L2 IS measurable: §25.2 has a recorded result and passing logs (`build/scriptor/erp_plan.log` `§ERPPLAN_VERDICT PASS judged=8`, `team_scope.log` `§SCOPE_VERDICT PASS judged=14`; the browser `W-PLAN-ERP` PASS 16 is recorded in §25.2 text only). `common/comm/team_scope.js` exists, so the invented fifth host's harness reader should use it (load with `scripts/lib_ootb.js` `git show origin/main:`).
2. The merged Modeller adapter's derivation is a self-contained block `var CLASS = (function () { ... })();` at `modeller/team_sync.js:27-35` (origin/main); it can be extracted and run in `vm` with a stub `global.TeamScope` over two compiled plans, so L3(b) can run the REAL adapter code on both plans (adapter byte-identical). The ERP gate is 3 lines (`erp/team_sync.js:187-189`, `TeamScope.scopeOf`).
3. **Likely P3 finding (stated here, not yet measured):** the Modeller adapter is already default-deny (`CLASS` is an allow-list; unknown op types are local), so the counterfactual of change (c) (ERP flip 998 -> 47) touches the ERP adapter only. The pre-registered clause "both adapters for (c)" will probably print `P3 FAILED because` the Modeller has no share-everything polarity. Do not tune; report as found. Also for (a)/(b) the counterfactual is 1 line in 1 file each (`STATION_LOCAL` literal `erp/team_sync.js:36`; `CLASS` literal `modeller/team_sync.js:25` at 4e95b393): the abstraction does not win on lines there; print it.
4. The other session edited engine files during this work (`git status` shows ` M build/scriptor/treatments/fact.js`, new `build/scriptor/seal.js`, `scripts/witness_scriptor_seal.js`, none mine): the engine hash before/after a run can change because of THEM; the witness must print both hashes and say "changed during the run (concurrent session?)" rather than silently pass H1.
**Design decisions already made (carry into the build; not yet in code):** N set = 10, 100, 250, 500, 1003 (250 added so 250->500->1003 are real doublings); tables for N<1003 chosen by even stride over the alphabetical list of active tables (records the sample is representative, not the `ad_*` prefix); the doubling test = `(t2/t1)^(ln2/ln(N2/N1)) <= 2.5` per consecutive step, plus the exact-doubling steps; rows counted as entries (+ list values) AND as JSON file lines, both printed; POS = F1 F2 R1 S1 S2 I1, MF = P1 R2 N1 S0 (`flows.json`, refs stay inside each set); ERP rows = `emit_erp_plan.rowsFor(db, flows_erp.json)`; recount of host-specific scope lines at 4e95b393 by recorded regexes (Modeller: `\bCLASS\b|create-with-parent|target-not-a-team-record|modeller-open`; ERP: `\bSTATION_LOCAL\b|isShared\(|fk-target-not-shared|\.quiet|station-owned`; skip comment lines with the repo's `grep -vE '^[[:space:]]*($|//|/\*|\*)'` rule), printed with file:line each, compared with the §20 estimate 19 and with the after-state `grep -n TeamScope` at origin/main; L3(a) ERP table `C_Order` to a LOCAL row, Modeller analogue = `bim_element` M1 FACT -> LOCAL (nothing shared); L3(b) add value `GEOM_BEVEL` (not in the 22 names) to `geom_op`; L3(c) 47 Merge rows of strategy 100 vs 998; witnesses to re-run = a recorded grep for `flows_erp.json|flows_modeller.json|team_plan` in `scripts/witness_scriptor_*.js` (+ the two bim-ootb `witness_team_plan.js`); L4 mutations on a COPY of `ad_full.db` in `/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/scale/`: rename a table (affected = rows naming it + rows whose table has an active `<old>_ID` TableDir column, by SQL), deactivate a column, change a reference id, AccessLevel (`compile()` never reads it, so report "not consumed; relevance INCONCLUSIVE", not silent), control = rename an INACTIVE table (0 affected, 0 changed); per row classify RED (error / treatmentErrors / declaredMissing) / CHANGED-NOT-RED (REF -> REF? is not red in `report.js`) / SILENT (byte-identical while affected); also print UNEXPLAINED (changed but not predicted by the SQL). `ad_seed.db` has the same tables as views/tables (1,004 / 1,003 active, `ad_replicationtable` 1 row vs 473), so the "everything unlisted" behaviour is expected there; list the plan diff by field. A test-definition note to print: "band" for P2 = every measured host adds <= 30 non-comment lines and ERP/Modeller ratio < 3 while rows grow > 100x (chosen before the first run).
**What remains, L by L:** L1 (generate rows, 5-run medians, hash check, determinism, control row) · L2 (five hosts, recount with file:line, planted unregistered treatment as control) · L3 (three changes, both sides) · L4 (two snapshots + mutations + control) · final H1-H5 / P1-P4 lines and `§SCALE_VERDICT PASS-WITH-INCONCLUSIVE(1)` or FAIL · then append `#### §16.26a Scale probe results` (replaces this handoff's "NOT STARTED") · regression: `witness_scriptor_s1.js`, `_treat.js`, `_registry.js` verdict lines unchanged.
**Run / continue:** `cd ~/bim-compiler && node scripts/witness_scriptor_scale.js 2>&1 | tee build/scriptor/scale.log` (today prints the WIP stub; edit only that one file).
**Files created by this lane:** `scripts/witness_scriptor_scale.js` (stub) and this section. Nothing committed, pushed or deployed. `git status` also lists changes that are NOT mine (` M build/scriptor/treatments/fact.js`, `?? build/scriptor/seal.js`, `?? scripts/witness_scriptor_seal.js`, `sign_plan.js`, `witness_scriptor_sign.js`, `build/erp/logs_locator/`, film files, trace_film jsons); mine are only the stub and this append to `prompts/TEAMWORK_FRAMEWORK.md`.

### §16.28 RESUME — films and the scale probe (2026-10-25; written at the user's wind-down: "about to run out of tokens, wind down the other agents to resume in a new session")
**Rules for the next session:** edit only your own § numbers (§18); append-only at the end of this file; `build/scriptor/*` engine files belong to the engine-lane session (it was still editing: §26 pattern library, §27 L1, §28 signing, §29 sealing); agents = Sonnet; CPU only; nothing here is committed (commit only your own hunks, only when the user says). Read the log after every run.
**The films (all in `~/Videos/`; sources `scripts/film_replication_engine/`, uncommitted; scratch `/tmp/claude-1000/-home-red1-bim-compiler/18a58635-fe65-4017-bd2b-34f2bfa87daa/scratchpad/`):**
| File | State |
|---|---|
| `NoServerInTheSalePath_ReplicationEngine_EN_2026-10-25.mp4` (5:00) | Film 1 English v1. Finished; has 3 clipped notes and the stale line count 169. Kept. |
| `…_EN_2026-10-25_v2.mp4` (5:07) | Film 1 English v2 (notes fixed, 93 / 129 / 222). Finished and checked (§16.25). Use this one. |
| `NoServerInTheSalePath_ReplicationEngine_TH_2026-10-25.mp4` (4:51) | Film 1 Thai. Finished (§16.22). Blemish: closing card and narration say the engine is 93 lines (core only); should read core 93 + components 129 = 222, and lacks the seventh limit. The fix is small and was STOPPED by the user ("don't redo Film 1"); do it only if asked. No native Thai listener review. |
| `Keeping_the_bloat_off_ReplicationEngine_EN_2026-10-25.mp4` (9:15) | Film 2 first version. **Superseded: it replays Film 1's sample day** (the user's complaint: repetitive, "joined" to the earlier film). Move to a "superseded" folder after the user agrees. |
| `Keeping_the_bloat_off_ReplicationEngine_EN_2026-10-25_v2.mp4` (7:24, 09:20) | Film 2 v2: the "under the hood" cut (opener with logos + six verified cards, Part 1 dictionary/ids, Part 2 replication, Part 3 real-adapter story; no POS/Micro Finance content). **Interim, not final:** the engine lane's signing result (`§SIGN_VERDICT PASS judged=18`) made its "plan signing not built" wording stale; the sources were edited after the mux but NOT re-rendered. Full state and commands: `### §16.27 Film 2 v2 — handoff (WIP)`. |
**Film 2 to-do, in order:** (1) re-read §16.27; delete or move the interim v2 (the mux refuses to overwrite); (2) refresh the frozen inputs (`film2/logs/inputs/*.log`, `lines_frozen.json`) against the CURRENT logs — the engine lane changed the live line counts to 94 / 130 / 224 / 274 and some logs were red mid-edit, so re-run the witnesses and read them before freezing; (3) update the wording for signing / sealing to what §28 / §29 record; (4) re-record, fit, mux, and repeat every measured check (the caption bbox check and everything after the pending edits were not run); (5) only then the **Thai Film 2**, translated from the FINAL English script (reuse the Thai build's glossary, labels and layout checks in `scripts/film_replication_engine/th/`; the user asked: "KeepBloatOff film, do in Thai"); (6) move the superseded 9:15 file.
**Verified sources for Film 2** (do not re-research): `scratchpad/film2_claims/cards_1_6.json`, `cards_2_5.json` (corrected wordings: PowerSync "phased out", Triplit acquired not retired, Matrix hiatus DROPPED, Scuttlebutt-fork DROPPED, Nostr figures as the authors' estimates), logos `scratchpad/film2_logos/index.json` (Scuttlebutt, Nostr, Triplit = plain text). Academic fair comment (user): accurate and attributed, not defensive. Adapter PRs on bim-ootb merged: #2369 (Modeller), #2370 (ERP + the shared `TeamScope` reader).
**Scale probe (§16.26): SPEC DONE, WITNESS NOT BUILT.** Only a stub exists: `scripts/witness_scriptor_scale.js` (header with H1–H5 and P1–P4 verbatim; prints the L5 line `INCONCLUSIVE — BLOCKED on S2/S3` and `§SCALE_VERDICT INCONCLUSIVE — WIP`, never PASS). L1–L4 have no measurement code; `build/scriptor/scale.log` does not exist; no prediction has held or failed. The builder's handoff is `#### §16.26a Scale probe — WIP handoff` (status per ladder, design decisions, run command). Facts it recorded for the next builder: hand timings (not witness output) compile() of 1,003 FACT rows ≈ 26 s (≈ 26 ms/row), plan 887,766 bytes, so L1 at 5 runs per N takes ≈ 3.5 min and each L4 mutation compile ≈ 26 s — run in the background; the worktrees `/tmp/wt-team-plan` and `/tmp/wt-erp-plan` are gone because both PRs merged into bim-ootb main (#2369 Modeller `5dfa4231`, #2370 ERP + `TeamScope` `d0153e46`); the Modeller +10/−2 is reproducible with `git diff --numstat 4e95b393 5dfa4231 -- modeller/team_sync.js`; the ERP cumulative is +10/−8 in `erp/team_sync.js` and `common/comm/team_scope.js` is a new 27-line shared reader; §25.2 records the ERP result (`erp_plan.log` PASS 8, `team_scope.log` PASS 14), so the L2 ERP cell can be measured. **Expect P3 to FAIL as pre-registered** (the Modeller's `CLASS` is already default-deny, so change (c), the ERP's 998 → 47 flip, touches only the ERP adapter): print `P3 FAILED because …`, do not tune. For changes (a) and (b) the counterfactual is one line in one file each (`erp/team_sync.js:36`, `modeller/team_sync.js:25` at 4e95b393) — the abstraction does not win on line count there; say so. The engine lane edits `build/scriptor/` while you run, so print BOTH engine hashes and flag H1 if they differ. After results: a short part or film on the slope; do not claim a curve before the log.
**Open owner decisions (do not decide for them):** whether to fix the Thai Film 1 closing card; commit/push of the many uncommitted files; the superseded-file folder; the Q1–Q8 list in §16.13; the ERP default-deny flip and its every-window twin check.
**Paste-ready prompt for the new session:** "Resume the Replication films lane. Read prompts/TEAMWORK_FRAMEWORK.md §16.28 (this section), §16.27 and §16.26/§16.26a, then CLAUDE.md. Do not redo Film 1. First re-run the engine witnesses and read their logs; then finish Film 2 English v2 per the to-do list; then the Thai Film 2. Report only what you verified."
### §28.1 Plan signing RESULT — ✅ DONE as a mechanism (witness, 2026-10-25); wiring into the hosts waits for the key-custody answer (Q1)
RED first: `build/scriptor/sign_RED_before.log` (no `verify`). After: **`scripts/witness_scriptor_sign.js` `§SIGN_VERDICT PASS judged=18 fails=0`** against the changed reader (bim-ootb PR #2371, `feat/plan-signing`). S1 plan signed by the compiler verifies `ok` and the scope answers equal the unsigned ones · S2 `GEOM_FOO` added after signing ⇒ `invalid`, scope closed · S3 other signer ⇒ `untrusted`, closed · S4 unsigned plan under a trust list ⇒ closed · S5 no trust list ⇒ `unsigned` and everything works (the merged hosts are unaffected) · S6 signed `hash` edited ⇒ `invalid` · S7 keys re-ordered still verify · S8 canonical form · S9 closed while pending, open after `ok` · S10 the ERP plan (998 + 5) signs and verifies in **28 ms** · **S11 Chromium's own WebCrypto** verifies the plan signed in Node (ok, 6 values), rejects the tampered one (invalid, closed) and the other signer (untrusted) — a different implementation from the signer. Mutants (no survivor): verification skipped → S2/S3/S4/S6/S5 red · signer not matched → S3 · unsigned accepted → S4 · pending treated open → S9 · order-sensitive canonical → S1/S7/S9/S10. CLI end to end: `sign_plan.js keygen <dir outside the repo>` then `sign <plan.js> <private> <public> <out.js>` produced a file whose signature `TeamScope` verified `ok` (6 values); **0 private keys inside the repo**.
**A bug the witness caught in my own first draft:** rebuilding the index cache overwrote the whole `memo` object and lost the verification state (`TypeError … reading 'plan'`, found by the 998-table arm S10); fixed to update fields in place.
**Regression with the changed reader:** `witness_team_modeller` PASS 33 · `witness_team_docaction` PASS 24 · `W-PLAN-MODELLER` PASS 12 · `W-PLAN-ERP` PASS 16 · reader witness PASS 14 · registry PASS 18. Added `TeamScope` lines: 23 → 41 non-comment (+18); `sign_plan.js` ≈ 22.
**NOT done, by design (owner, Q1):** who holds the admin key and where `window.TEAM_PLAN_TRUST` comes from (a founder device key, an offline admin key, the space POLICY) · wiring `await TeamScope.verify(crypto.subtle)` into the adapters' boot (one line each, and the Modeller's `CLASS` is computed at load, so it needs to become lazy first) · key rotation and revocation. Until then a host that sets a trust list without that wiring shares nothing (fail closed) — safe, but a limit.

### §29.1 Audience sealing RESULT — ✅ DONE in the SIMULATOR (witness, 2026-10-25); the real comm layer is NOT touched
RED first: `build/scriptor/seal_RED_before.log` (the sealed flow leaked `P-COLA,P-GOLD,P-TEA,A/2026-10-25,QtyEntered,M_Product_ID` in plaintext; no `openFact`). After: **`scripts/witness_scriptor_seal.js` `§SEAL_VERDICT PASS judged=24 fails=0`**. L1 the sealed flow's whole shelf (3 facts) contains none of its values, field names or natural keys; control: the unsealed flow in the same world shows all 4 · L2 an outsider with FULL shelf access and no key opens **0 of 3**; control: an insider opens 3 of 3 · L4 a holder of another audience's key opens 0 of 3 (a client tries every key it holds) · L3 one flipped byte ⇒ the hub does not accept it and counts it tampered (1) · L5 the hub accepts the sealed sale with exactly the plaintext run's fields; an exact resend creates no new shelf object; a changed resend under the same key is a flagged COLLISION and the hub keeps the original (QtyEntered 7) · L6 a sealed team flow: both members reach ONE fold hash and the shelf holds no field name; an outsider reading the shelf directly opens 0 of 2 · L7 the same content has a different name under another audience's key; an attacker who knows the plaintext but not the key finds 0 sealed names (control: 1 unsealed match); with the key the name is recomputable · L8 the existing star/mesh arms are unchanged (child runs: treat PASS 30, registry 18, mesh 25, virtual 25). Mutants (no survivor): sealing off → L1/L2/L3/L4/L6/L7 · one key for every audience → L4, L7 · unauthenticated cipher → L3 · name from the plaintext hash → L7 · the outsider handed the key → L2 · open skips the audience check → L2/L4/L6.
**Design as built:** `build/scriptor/seal.js` (18 lines: AES-256-GCM per audience; synthetic IV = HMAC of the content ⇒ equal content ⇒ equal blob, so a resend is idempotent; shelf name = first 12 hex of HMAC(audience key, key‖fields) ⇒ no plaintext hash on the shelf) and `treatments/fact.js` (+16 lines: `shelfPut`, `openFact` with a keyring, sealed hub→device sends, sealed mesh ingest and fold-back); a FACT row opts in with `seal: "<audience>"` (default none ⇒ plaintext, so no existing witness can change); a device's audience keys survive a wipe like its signing key.
**`W-SCRIPTOR-LEAK-BYTES` is now: JUDGED in the simulator; INCONCLUSIVE for the real comm layer** (never a bare PASS). **Named residuals:** the shelf still shows metadata — device id, flow name, count, timing, sizes; the key derivation is a SAMPLE (`sha256('seal-key|'+audience)`) — the real keys come from key epochs distributed by the POLICY op (§13.12 C-4); rotation/revocation and cross-audience LETTERS are not built; a removed member keeps what they already downloaded (§13.11 gap 8, inherent). The real-layer step (`W-READ-SCOPE` in `build/comm/*`, `common/comm/*`) waits for the HOLD on those engine files to lift.

---

## §30 ERP team scope — the EVIDENCE for the owner's decision (G9), computed from the dictionary and the real cycles (2026-10-25; owner: *"Proceed on those that you stated is needed to be more complete"*; spec BEFORE code). Nothing shipped, nothing adopted: this produces numbers and a candidate list
**Issue.** §25 kept the ERP team scope at today's 998 tables. Narrowing it is a product decision gated by the TWIN RULE (§20 G9). §22.8 showed the *POS* strategy's 47 Merge tables is the wrong narrowing (6 of a 20-table core sample fall outside). The better candidate is the **scriptor's own S1 function applied to the whole dictionary** (§16.15): *a table is in the team scope iff some role's window can reach it, directly (a tab) or by a reference from such a table*. Why that is twin-safe for what users do: a user authors records only through windows, so a table no window of any role reaches cannot receive a user-authored op; narrowing to the reachable set changes nothing a user can do. **The exception to test, not assume:** tables written as a side effect of a document action or process (Complete writes `M_StorageReservation`, workflow rows, …) are not "reached" by structure — the real team cycles show which tables were actually touched.
**What is computed (read-only; `ad_full.db` + the recorded cycle tables).** For the UNION of all roles' windows: roots (independently recomputed in SQL, compared with `scope.js rootsFor`), closure under each variant (follow PARENT / MAND / ALL, ± audit columns), sizes against today's 998; **X of N AD windows** whose every tab-table is inside the scope (the every-window check, §20 G9 — by construction 100 % for windows some role can open; the witness reports the windows no role can open and their tables); membership of the tables the real cycles attempted (`build/scriptor/observed_team_tables.json`: 6 shared by `§TEAM_OUT`, 6 attempted-local, 3 station-local, with provenance); membership of the 20-table core trade-cycle sample; the dropped tables classified (`T_*` working tables, `I_*` import, `*_Trl` translations, other) so the owner sees *what* would stop being shared.
**Witness `W-ERPSCOPE-*` (`scripts/witness_scriptor_erp_scope.js`; RED first: the observed-tables file and the script do not exist).** C1 roots: SQL recomputation == `scope.js` roots (a difference is printed and judged) · C2 every window reachable by some role has every tab-table in the scope: X of N · C3 **every table the real cycles attempted is inside the scope**, per variant — with a CONTROL: a scope with `c_order` removed must turn this arm red (the test can fail) · C4 the core sample, per variant · C5 the narrowing: shared today 998 → scope size, dropped count, dropped classification · C6 per role: windows and closure sizes. Verdict prints **EVIDENCE, not decision**; any attempted table outside the scope prints `OPEN` with the table, never a bare PASS. *Mutants:* a role's windows dropped from the union → C2 red · closure follow-mode weakened (PARENT instead of ALL) → C3/C4 shows the loss · the observed file edited to add a never-reachable table → C3 red.
**Outputs for the owner:** `build/scriptor/candidate_erp_scope_ALL.json` and `_PARENT.json` (table lists, NOT wired into any host; adopting one = regenerate `erp/team_plan.js` from fewer rows, a data change, then run the every-window twin witnesses).
### §30.1 ERP scope EVIDENCE — RESULT (2026-10-25): `§ERPSCOPE_VERDICT EVIDENCE judged=13 fails=0 open=1` — a candidate, NOT a decision (G9 stays the owner's)
**A defect in my own S1 code, found by the first arm and fixed:** `scope.js rootsFor` took every tab of every window a role could open **without checking that the window or the table is active** — 855 "root" tables where an independent SQL recomputation gave **707** (148 were inactive). Fixed (join `ad_window` and `ad_table`, active only); RED→GREEN: `W-ERPSCOPE-ROOTS` now 707 = 707, 0 differ; `witness_scriptor_s1.js` still PASS 22. (Role-closure sizes quoted from earlier S1 runs were therefore slightly overstated.)
**The numbers (union of the 4 roles that have windows; gate off; `build/scriptor/erp_scope.log`).** Roots 707 · closure PARENT 709 / MAND 709 / ALL 731 of 1,003 active tables. **Every-window check:** 369 of 369 windows some role can open have every tab-table inside the scope (370 active windows; 1 no role can open) — true by construction, now witnessed. **Reachability alone is NOT enough** — the real cycles shared 6 tables (`c_order, c_orderline, m_storagereservation, c_ordertax, c_bpartner, c_acctschema`); 5 are reached by a window, **`m_storagereservation` is not** (the Complete document action writes it, no user opens it in a window). So the candidate = reachable ∪ observed-shared: **705 (PARENT/MAND) or 727 (ALL)** tables after removing the 5 station-local; the 20-table core trade-cycle sample is **20/20 inside** (it was 14/20 under the POS strategy's 47). Control: removing `c_order` or `m_storagereservation` turns `C2`/`C3` red; roots computed without the two Admin roles turn `C1`/`C2` red (the arms can fail).
**What would stop being shared vs today's 998:** 293 (PARENT/MAND) or 271 (ALL) = 27–29 %. **141 of those are database VIEWS** (`rv_*` and others; `AD_Table.IsView='Y'`) — views never hold records, so no op can target one: dropping them changes nothing a user or the books can see (a zero-impact first step: **998 → 857**). The rest (≈ 130–152 real tables) are tables no window of any role reaches: `c_` 52–57, `ad_` 34–37, `m_` 29–33, `t_` working 21, `hr_` 18, `pp_` 12–13, `b_` 10, `w_` 7 …
**OPEN (printed by the witness):** document-action side effects are known only for the recorded **sales-order Complete**; the dictionary has **52 active document types in 33 base families**, so the side-effect tables of the other families are UNKNOWN until a doc-type sweep runs (X of N families, AD-LAYER LAW 2). Until then 705/727 is a lower bound that may be missing tables like `m_storagereservation`.
**Options for the owner (my recommendation first, not a decision):** (1) now: remove the 141 views from the plan → 857 tables, provably zero user impact; (2) after a doc-type sweep: adopt reachable ∪ side-effect tables (≈ 705–727 + whatever the sweep finds), then run the every-window twin witnesses; (3) keep 998. Candidate lists (NOT wired into any host): `build/scriptor/candidate_erp_scope_{PARENT,MAND,ALL}.json`. Adopting any of them = regenerate `erp/team_plan.js` from fewer rows (a data change, one command), then run `W-PLAN-ERP` + the five ERP team witnesses.

### §16.29 Film 2 v2 FINAL (English) + Thai Film 2 — record (2026-10-25; resume of §16.28; session worked from `scripts/film_replication_engine/film2/`, uncommitted)
**Engine witnesses re-run first (logs read, stdout in `film2/logs/inputs/`, copies of the previous frozen set in `logs/inputs_prev/`):** treat `§TREAT_VERDICT PASS judged=30` · s1 `PASS judged=22 inconclusive=2` · registry `PASS 18` · virtual `PASS 25 vacuous=1` · mesh `PASS 25` · dry run `PASS 13 open=1` · seal `PASS 24` · sign `PASS 18` · patterns `PASS 89` · team_scope `PASS 14` · erp_plan `PASS 8` · modeller_plan `PASS 5` (it was INCONCLUSIVE in the handoff because the worktree was gone; it now judges the merged `origin/main`). **One red that was NOT a defect:** the first `witness_scriptor_sign.js` run crashed `T.verify is not a function` because the local `origin/main` ref of `~/bim-ootb` was stale (it read the reader from before PR #2371); after `git fetch origin` it prints `PASS judged=18 fails=0`. The browser-side logs (`modeller_*`, `erp_plan_witness.log`) were NOT re-run (they need the deleted worktrees); the film cites them as the saved logs they are.
**Moving ground, again:** `build/scriptor/scope.js` was edited by another session at 09:31 (one SQL line, same non-comment count); line counts were re-taken and frozen at **core 88 (18+70) · components 174 (93+52+16+11+2) · engine 262 · toolchain 274** (same command; the frozen file is `logs/lines_frozen.json`, taken 01:34Z). They were 93 / 129 / 222 / 274 in the interim file.
**English v2 final:** `~/Videos/Keeping_the_bloat_off_ReplicationEngine_EN_2026-10-25_v2.mp4` — 1920x1080, 24 fps, **452.25 s (7:32)**, 10,854 frames (counted from the file = plan), 25.7 MB. The interim 09:20 file was MOVED (not deleted) to `~/Videos/superseded/..._v2_INTERIM_0920.mp4`. The 9:15 first version is still in `~/Videos` (superseded folder move waits for the user's word). Wording changes made from the facts: signing (§28: the reader on main can verify, **0 adapters call it**, **0 plans signed**, PR #2371 merged — each read live by `git`/`gh`, facts `adaptersCallVerify plansSignedOnMain scopeNowLines scopeSignAdded`), sealing (§29: simulator only, `PASS 24`, `sealJudged`), reader size now stated as "23 lines as merged in PR #2370 (1,930 bytes), +18 later for signature checks". **Two defects in the 09:20 file found and fixed:** (1) the title card said "and a serverless day" (that content left in v2) -> "and what is under the hood"; (2) four answer boxes said "Part 3: the shelf has a stated contract…" but Part 3 does not show those things -> "Our design:". **Open for the owner:** those answer boxes (cards 3, 4, 5, 6) still use the words shelf / mailbox device / hub, which Film 2 never explains (Film 1 does) — either a one-line gloss or cut; not decided here.
**Measured on the final file (from logs / the file):** narration fit **29/29 DETAIL**, tone **29 OK / 0 WRONG**; speech onset vs cue max **0.05 s** (29 beats); loudness **I=-16.4 LUFS, LRA 2.3 LU, peak -1.4 dBFS**; silencedetect -40 dB / 2 s: 2 gaps (3.45 s; the 4.50 s end tail); captions 79 incl. credit, **`sub_fit.py` rendered bbox 0 outside the band** (min top 972, band from 930; max right 1780; tallest 73 px); `ass_band` widest 1,739 of 1,740 px; **`§NUM_CHECK` 47 spoken numbers = 42 facts, 0 mismatch** (control detects a changed number); soft ASR (whisper small.en) **47 of 47** heard, reported not gated; layout **125 changed frames, 0 flagged; 29 cards at full reveal, 0 flagged**; **26 quotes byte-equal to the verified JSON** (control: one changed character is caught), 26 citation bars match, Sources cards list **22 URLs = exactly the 22 cited**; logos **13 distinct, 32 `<img>`, all loaded, sha256 attr and on-disk equal to the index**, Nostr / Triplit / Scuttlebutt plain text, trademark + Manyverse credit present, no Matrix logo; **words witness 166 texts, 0 hits** (Film 1 words and the dropped words; the one allowed pointer is on the limits card, narration and caption only; control passes). Rebuilt twice (the second after fix 1-2): the narration is deterministic: one clip (`c1`) was compared by sha256 between the two builds and is identical (the other 28 were not compared).
**Thai Film 2 (new):** `~/Videos/Keeping_the_bloat_off_ReplicationEngine_TH_2026-10-25.mp4` — 1920x1080, 24 fps, **433.46 s (7:13)**, 10,403 frames (counted from the file), 22.7 MB; translated from the FINAL English script (`logs/th/narration_th_v1.tsv` = the Thai text; English = `logs/v2/narration_en_v2.tsv`). Sources `film2/th/`: `mk_cards_th.py` (builds `cards4_th.js` from `../cards4.js`: every English UI string replaced by its Thai text, each replacement must match exactly once; quotes, citation bars, code panels, log excerpts and ids untouched — outside quotes stay in their source language and byte-exact), `stage4_th.html` (Noto Sans Thai after every Noto Sans, taller line boxes, no letter-spacing), `film4_record_th.js`, `film4_tsv_th.js` (Thai number writer + independent reader, copied from §16.22's), `film4_words_th.js`, `glyph_check_th2.py` (the §16.22 check plus Noto Color Emoji: the u_probes log excerpt contains the red-circle emoji from the real witness log). Reused unchanged: `../facts4.js`, `../stage4.js`, `../beats4.js`, `../film2_claims.json`, `../fit/*`, `../../th/fit/{ass_band_th,asr_numbers_th}.py`. F lines are statements (no `?`), as in §16.22; HQ-style Latin names (project names, iDempiere, PowerSync …) are kept Latin on screen, in captions and in the TSV; "witness" is "ตัวทดสอบ" in speech and "(witness)" on screen.
**Thai measured:** fit **29/29 DETAIL**; tone **none by design** (Thai); speech onset vs cue max **0.03 s**; loudness **I=-16.2 LUFS, LRA 4.2 LU, peak -1.3 dBFS**; silencedetect 3 gaps (2.35 s, 3.43 s, the 4.52 s end tail); captions 68, **`sub_fit.py` 0 outside the band** (min top 976, max right 1807, tallest 74 px); `§TH_NUM_SELFTEST` 28-entry hand table + round trip 0..99,999 **0 wrong**; **`§NUM_CHECK` 47 spoken numbers = 42 facts, 0 mismatch** (same values and counts as the English; control detects a changed number); no digits and no `?` in the narration; layout **125 changed frames, 0 flagged; 29 cards, 0 flagged**; citations/logos/credits **identical results to the English** (26 quotes byte-equal, 22 URLs, 13 logos, "ไม่ระบุวันที่" for an undated page); **glyphs: screen 163 chars (60 Thai) and captions 100 chars (58 Thai) all covered, control U+0E3B reported missing**; words witness (Thai terms ขาย, แคชเชียร์, ไมโครไฟแนนซ์, ผู้กู้, ทอง, ใบขาย, เติมสต็อก, … plus the English list) **155 texts, 0 hits**, pointer only on the limits card / narration / caption; soft ASR (whisper-small, Thai) **40 of 47** numbers heard (misses are merges and "0" written as a word, e.g. 1003 heard as 1033; reported not gated, as in §16.22).
**Edge TTS (cloud) was used for the Thai voices** (th-TH Premwadee / Niwat): the Thai narration sentences (public film text, no secrets, no file contents) went to Microsoft in the measure fit; the final fit reuses the cache keyed on (text, voice, rate).
**NOT done:** a native Thai listener review (tone, rhythm, terminology; the Thai wording is my translation, glossary in `mk_cards_th.py`); a native-listener review of the English; nothing committed, pushed or deployed; the superseded 9:15 English file and Film 1 files untouched; Film 1 Thai closing-card blemish (§16.28) NOT touched (user: do not redo Film 1); the scale probe (§16.26a) NOT started in this session. Scratch: `/tmp/claude-1000/-home-red1-bim-compiler/1c47711a-30d5-439e-9e4e-bf3b80145c4f/scratchpad/f2/` (`w0 wfit0` measure, `w1 wfit1` English final, `prev/` first build, `tw0 tfit0 t1 tfit1` Thai).

---

## §16.30 Event versioning — build the amended §13.12.J.2 on the kernel op-log (2026-10-25; user: *"No more rerender.. i just want to work on the issue"*; SPEC WRITTEN BEFORE CODE; witness RED first)
**Status today, measured (not assumed).** Built and green since July: `build/erp/op_upcaster.js` (version stamp `params._sv` inside the signed bytes, function upcasters registered in code, read-time upcast, a future-version op THROWS `D2_UNSUPPORTED`) with `scripts/poc_d2_versioning.js` — re-run today: `§D2-WITNESS OVERALL=PASS`. **Not built (the gap this section closes):** everything §13.12.J.2 added after the second outside opinion — upcasters as signed *data* instead of code, parking instead of throwing, `min_v` retirement, a provisional ledger hash while anything is parked, dependency parking, the tolerant reader, chain-gap validation at load. `W-OP-VERSIONS` does not exist anywhere in the repo.
**Scope and boundary.** New module `build/erp/op_versions.js` (UMD, node + browser) that LAYERS ON the kernel's op rows (`replayOps` output) and the existing `_sv` stamp. **Not edited:** `build/erp/op_upcaster.js` (its sha256 is printed before and after), `kernel_ops.js`, anything in `common/comm/*` or `build/comm/*` (HOLD §3374: this does not change what is shared). The comm-layer parking (`cl_op` / `cl_sealed`) is a later wiring step, not part of this one.
**Reading of J.2 that this spec fixes (J.2 is ambiguous in one place, stated so it can be corrected).** J.2 says a newer op "cannot be upcast" and is parked `needs-upgrade`, AND that a device can clear parked ops "by fetching a signed mapping without a full app upgrade". Both hold only if two things are kept apart: `appV[op_type]` = the shape the app's reducer reads (changes only with an app release) and the loaded upcaster set (data). Therefore: `v > appV` -> PARKED `needs-upgrade` (only an app release clears it); `v < appV` and a rung of the chain is not loaded -> PARKED `needs-mapping` (a signed set clears it, no app change); `v <= appV` with all rungs loaded -> upcast on read and folded.
**Rules (each one has a witness arm below).**
1. **Shape version** = `params._sv` (default 1 = legacy), already signed. Not an integer >= 1 -> REFUSED `bogus-version` (never applied, never parked).
2. **Upcaster set = data.** `{kind:"upcasters", op, steps:[{from:N, map:[…]}], signer, sig}`; step `from:N` takes shape N to N+1; the map vocabulary is fixed: `rename [a,b]`, `default [k,v]`, `drop k`, `split {from,into:[a,b],sep}`, `merge {from:[a,b],into,sep}`, each optionally `at:"<array>[]"` (applied to every element of that array, e.g. `lines[]`). Anything else -> `bad-vocabulary`. Steps must be consecutive from the lowest `from` -> a hole is `chain-gap` (checked at load). `sig` = the trusted signer's signature over sha256 of the canonical JSON of the set without `sig`; no `sig` -> `unsigned`; signer not in the trust list -> `untrusted-signer`; any edit after signing -> `bad-signature`. A refused set changes nothing.
3. **Fold classification, in order:** bogus -> REFUSED · `v < min_v[op]` (POLICY) -> REFUSED `retired-version` (same result on every device at the same log position) · reads (`input_guids`) a REFUSED op -> REFUSED `dep-refused` (checked BEFORE any parking: refusal is global and must come out the same on every device, parking is local) · `v > appV` -> PARKED `needs-upgrade` · rung missing -> PARKED `needs-mapping` · reads a PARKED op -> PARKED `dep-parked` · otherwise upcast a COPY and fold. A stored op is never rewritten (the chain still verifies).
4. **Tolerant reader.** Per op type a `defaults` shape: missing field -> default; unknown field -> passed through untouched. Renames / meaning changes are not tolerated (they need a version bump + a step).
5. **Provisional hash.** `ledgerOf(result)` = sha256 over the folded ops only (uuid, type, upcast params); the result carries `parked_count` and `provisional: parked_count > 0`. Devices with the same parked set must agree; after the upgrade all devices agree again.
6. **Retry** happens at every `fold()` call (the caller calls it after loading a set / changing `appV`); there is no timer in the module.
**Witness `W-OP-VERSIONS` = `scripts/poc_op_versions.js`** (real kernel `kernel_ops.js`, real signer `~/bim-ootb/erp/erp_signer.js`, real `verifyChain`; reads like `poc_d2_versioning.js`). Arms: **V1** a mixed v1+v2 signed log with the set loaded folds to the all-v2 rewrite and to the original v1 effect (maxDiff 0), chain verifies after · **V2** a set with a hole is `chain-gap`, an unknown verb `bad-vocabulary` · **V3** an `appV=1` device parks v2 ops `needs-upgrade`, `parked_count>0`, `provisional:true`; after the upgrade `parked_count 0`, `provisional:false`, hash == the full-upgrade hash · **V4** three devices (A and C at appV 1, B at appV 2): A==C, B differs; after upgrade A==B==C · **V5** `_sv` of 0, -1, 1.5, "x" -> REFUSED `bogus-version`, balances unchanged · **V6** no sig -> `unsigned`, other signer -> `untrusted-signer`, an edited step -> `bad-signature`; control: the good set loads · **V7** `min_v POST=2` refuses every v1 op `retired-version` identically on two devices; control: without the policy they fold · **V8** an op reading a parked op is `dep-parked`, one reading a refused op is `dep-refused`, an independent op folds · **V9** tolerant reader: missing -> default, unknown field passes through, stored bytes unchanged · **V10** appV 2, no set -> every v1 op `needs-mapping`; loading the signed set clears them with no appV change · **V11** `fold` twice and loading two sets in either order give the same hash · **V12** `op_upcaster.js` sha256 before == after and `poc_d2_versioning.js` still `OVERALL=PASS`. **Verdict line** `§OPV_VERDICT` prints `INCONCLUSIVE` if any arm judged an empty population (a log with no v2 ops, etc.), never a bare PASS.
**Mutants (each must turn at least one arm red):** signature check skipped · chain-gap check off · future op folded instead of parked · `min_v` ignored · `provisional` never set · dependents of a parked op folded · bogus version applied · tolerant reader overwrites a present field with the default.
**RED first:** the witness is written and run before the module exists; the RED log is `build/erp/logs_versions/op_versions_RED_before.log`.

### §16.30.1 RESULT — ✅ DONE as a module (witness, 2026-10-25); NOT wired into any fold: kernel replay and the comm layer are untouched
RED first: `build/erp/logs_versions/op_versions_RED_before.log` (`§OPV_MODULE_MISSING`, exit 3 — the module did not exist, so every arm was unjudged). After: **`scripts/poc_op_versions.js` `§OPV_VERDICT PASS judged=43 fails=0 vacuous=0 mutants_killed=8/8`** (`build/erp/logs_versions/op_versions.log`). Real kernel, real signer, real `verifyChain`; `op_upcaster.js` sha256 identical before and after and `poc_d2_versioning.js` still `OVERALL=PASS` (V12).
**What now holds, each by an arm that can fail:** V1 a mixed v1+v2 signed log folds to the all-v2 rewrite and to the original effect (maxDiff 0 c), chain verifies after · V2 a hole in the chain is `chain-gap`, an unknown verb `bad-vocabulary`, a conflicting redefinition of a step `step-conflict` · V3 an `appV=1` device parks the 6 v2 ops `needs-upgrade`, `parked_count 6`, `provisional:true`, hash differs; after the upgrade `0` / `false` and the hash equals the full-upgrade hash · V4 same parked set => same hash (A == C), B differs, A == B == C after the upgrade · V5 `_sv` of 0, -1, 1.5, "x" -> 4 REFUSED `bogus-version`, balances unchanged · V6 unsigned / untrusted signer / right id but another key / a step edited after signing are each refused (`unsigned`, `untrusted-signer`, `bad-signature` x2) and change nothing; control: the good set loads · V7 `min_v POST=2` refuses all 6 v1 ops `retired-version`, the same ids on a device WITH the mapping and one WITHOUT · V8 transitive `dep-parked`, `dep-refused`, and only the independent op folds · V9 missing -> default, present field kept, unknown field passed through, rows frozen + DB parameter strings unchanged · V10 appV 2, no mapping: 6 v1 ops `needs-mapping`; the signed set clears them with no appV change · V11 deterministic, two sets in either order give one hash, rename + default steps give the current shape.
**Mutants (all killed):** signature check skipped -> V6 · chain-gap off -> V2 · newer op folded -> V3, V8 · `min_v` ignored -> V7 · `provisional` never set -> V3 · parked dependents folded -> V8 · bogus applied -> V5, V8 · tolerant reader overwrites -> V9. **Expectation I had to correct:** I first expected "newer op folded" to turn V4 red too; it does not (A == C and B != A still hold under that breakage), so the expectation is now V3 only — the mutant is killed regardless.
**Spec point fixed while building:** J.2 listed `dep-parked` before `dep-refused`; the order is now dep-refused FIRST (§16.30 rule 3), because a refusal is global and must be identical on every device while parking is device-local.
**Honest limits (read before claiming "versioning is solved"):** (1) the module is a pure function over op rows; nothing calls it — `kernel_ops.js` replay and the comm fold (`cl_op` / `cl_sealed`) do not use it yet, and `common/comm/*` is under the HOLD (§3374), so the wiring is a separate step that needs the owner's go; (2) the `_sv` write seam is still opt-in (`op_upcaster.install`), unchanged; (3) trust list and `min_v` are inputs the caller passes; where the admin key and the POLICY op live is the same open key-custody question as §28 Q1; (4) the vocabulary is five verbs on top-level fields or one array level (`lines[]`) — a change outside that needs an app release, by design; (5) multi-device convergence is shown by independent devices folding the same rows, not through a real relay; (6) the manifest/rules version (J.2 "two separate versions") is not modelled here, only the shape version. The §13.12.J.2 header says "design only, not built": it is now "built as `build/erp/op_versions.js`, witnessed, unwired".

---

## §31 ERP team plan v2 — leave out the dictionary VIEWS that nothing can reach (2026-10-25; owner: *"Removing DB views plan, you may proceed if no impact in legacy itself. Why are they there? Bad housekeeping by iDempiere community?"*; spec written BEFORE code)
**Why the views are in the dictionary (answer, with source).** Not housekeeping. iDempiere makes database VIEWS first-class dictionary objects: `AD_Table.IsView`, the view's SQL is defined in the dictionary (`MTable.getViewComponent`, `MTable.java:984-992`), and a view is forced read-only (`MTable.beforeSave`: `if (isView() && isDeleteable()) setIsDeleteable(false)`, `MTable.java:883`). The `RV_*` ("reporting views") and `*_v` objects exist so reports, info windows and read-only windows are built from queries through the same dictionary machinery. They hold no records; they are *presentations of other tables*. The dictionary lists **158** active views.
**Impact on legacy: none, and checked three ways before anything is changed.** (1) *The dictionary is not touched* — the Table / Column / Replication windows, the books and every window look exactly as before; only the generated team plan (`erp/team_plan.js`, team mode only) changes, and legacy iDempiere has no such plan. (2) *Nothing a user does reaches them:* the candidate set is the views that are NOT reached by any window of any role and NOT a reference target from a reached table (closure ALL, the widest variant) — **141 of the 158**; the other 17 are read by a window or reference and **stay in the plan**. (3) *They cannot be written:* measured in the shipped browser dictionary (`erp/ad_seed.db`), **all 141 are ABSENT** — neither a table nor a view exists under those names, and the file has 0 triggers — so no op can target them; "shared by default" meant only that their names were not on a deny list.
**What changes.** `emit_erp_plan.js` leaves those views out (no row ⇒ `unplanned`, the engine's default): 998 → **857** shared + 5 station-local; the plan records `excluded: view-unreached ×141` for transparency. The decision rule is code, not a list: view ∧ not reached (ALL) ∧ not an observed shared table. One new module `build/scriptor/erp_scope.js` holds the reach computation so the emitter and the evidence witness do not each carry a copy.
**Witnesses (RED first on the unchanged plan).** *Compiler side* (`witness_scriptor_erp_plan.js` extended): V1 every excluded table is `IsView='Y'` (141 of 141) · V2 none has an active tab and none is reached by closure ALL · V3 none is in the observed cycle tables (shared or attempted) · V4 plan tables + local + excluded == every active table (857 + 5 + 141 = 1003) · V5 the 17 reached views are still in the plan · V6 mutants: a non-view table added to the exclusion → V1 red; a reached view excluded → V2 red. *Browser side* (`erp/tests/witness_team_plan.js`, the E1 arm is rewritten, RED first because it still says 998 = 998): E1' over all 1003 live dictionary tables the decision differs from the old rule on **exactly** the excluded set, every one of which is `IsView='Y'`, and **absent from the live database** (`sqlite_master`), with 0 triggers · E1'' over all 373 AD windows the number of shared tab-tables is unchanged for every window · the five ERP team witnesses and the Modeller witness unchanged against their baselines · 0 `table-not-in-plan` lines in any run.
**Not claimed:** this does not decide the wider narrowing (reachable ∪ side-effect tables, 705–727); that waits for the doc-type sweep (§30.1 OPEN).

---

## §16.31 Wire event versioning into the comm fold (2026-10-25; user: *"Yes, and are solving it from learning where those others failed?"* — the "Yes" answers "wire it into the comm fold next?"; SPEC BEFORE CODE)
**Where the comm layer lives.** Source of truth is `build/comm/*` in this repo; `~/bim-ootb/common/comm/*` is a byte-identical copy shipped by PR (#2364 did that). **This step edits `build/comm/` only.** The copy PR to bim-ootb is a separate step that waits for the owner's word. HOLD (§3374) is not crossed: nothing here changes what is shared, who may, an op class or access; the owner's "Yes" is the go for this wiring.
**Baseline recorded BEFORE any edit (15 comm witnesses, all exit 0, 🔴 count 0 in each):** base 36 · checkpoint 43 · cl1_uu 23 · cl2_order 12 · cl3b_github 8 · cl3_store 25 · cl4_admit 23 · cl5_conflict 12 · cl8_opaque 44 · docno_booking 15 · docno_modes 14 · gmail_log 5 · keyclaim 25 · policy 32 · space_scope 23 (arms judged). They must read the same after, with `opts.versions` absent.
**Why this design — what the outside failures were, and what each arm answers (honest scope: two forum reports and one essay are in the verified cards; the rest of J.2 comes from the two outside opinions of 2026-10-24).**
- *Anytype (card 2a1/2a2, forum 2026-04 / 2026-05):* the client showed "Incompatible version" and a spinning sync wheel; the intermediate release 0.54.2 still failed, only 0.54.11 worked. The failure was **per device, all-or-nothing, and gave no reason**. Answer: failure is per OP (a device folds everything it can read and parks only the rest), the intermediate version keeps working on its subset (`V13` in `poc_op_versions.js`: appV 1 folds 3 of 9, appV 2 folds 6 of 9, appV 3 folds 9, and says "6 items need an update: 6 needs-upgrade"), and the state is marked provisional until the upgrade, after which all hashes are equal. **Not answered:** whether Anytype's cause was a server-side cutoff — I did not read the threads beyond the cards, so I do not know why 0.54.2 failed; I only reproduced the symptom shape.
- *Ink & Switch (card 2b1):* with no central server there is "no authoritative current schema". Answer is a deliberate trade, not a refutation: **the authority is an admin signature, not a server** — upcaster sets are signed data any device can verify offline, and `min_v` rides the in-log POLICY (same position on every device). It re-introduces an admin as the schema authority; if that admin key is lost the schema cannot move (the §28 key-custody question, still open).
- *What no outside report tested and this does not claim:* years of accumulated versions (chain length), a rollback of an app release, an admin who is wrong (a signed bad mapping is applied faithfully).
**Rules.**
1. `opts.versions` (an `OpVersions` registry, `build/erp/op_versions.js`) is optional; **absent => the store is byte-for-byte what it was** (the 15 witnesses).
2. **Shape marker of an envelope op:** `body.sv`, else `body.params._sv`, else 1 (legacy). (J.2 says `v`; the envelope already has `v:3` for its own format, so the body key is `sv`, as the kernel's is `_sv`.)
3. **Verdict hook:** in `core()`, after `ADM.admit`, an op whose verdict is MERGED is passed to `versions.judge(body, policy.params)`; a non-null answer replaces the verdict (`REFUSED bogus-version | retired-version`, `PARKED needs-upgrade | needs-mapping`). An op already refused or parked for signature, role, access, scope or deps **keeps that verdict** (the version check only ever downgrades a MERGED op). What reads a version-parked op is parked `deps` and what reads a version-refused op is `dep-refused`, by the store's own existing cascade (no new rule).
4. **`min_v` lives in POLICY:** `params.min_v = {<op_type>: <integer >= 1>}`; invalid => `bad-policy:min_v`; a later epoch that LOWERS any `min_v` of the epoch in force is refused `min_v-lowered` (a retirement must never un-retire: checkpoints freeze verdicts). The host's own `setPolicy({min_v})` is combined by max.
5. **`foldable()` hands the host UPCAST COPIES** of the bodies (the stored envelope in `cl_op` and its signature are never touched).
6. **`store.versionState()`** = `{parked_count, provisional, parked_by_reason, refused_by_reason}` from the folded verdicts (what a UI shows instead of a spinner).
7. **Checkpoints (corrected after the first run showed the original wording was wrong):** a checkpoint published by up-to-date devices CAN contain an op that an old device parks. The old device must not adopt it (it cannot reproduce S by its own fold) and must not condemn it either — the store persists `BAD` for good, and an unreadable prefix is a limit of the reader, not a lie by the co-signers. So a prefix whose only problem is version-parked ops makes the candidate `WAITING-VERSION` (not adopted, not BAD, not persisted); `refold()` (after a set is loaded or appV changes) lets the next fold verify it again. (First run: the old device marked it `BAD` permanently — found by arm C7, fixed, mutant added.)
8. `store.refold()` drops the cached fold and the `WAITING-VERSION` memo; the host calls it after `loadSet` / `setApp` (there is no timer). Upcaster **sets arrive from the host** (`await registry.loadSet(set)`); fetching signed sets through the policy pipe directory (J.2) is NOT part of this step.
**Witness `W-COMM-VERSIONS` = `scripts/witness_comm_versions.js`** (real store, sql.js, WebCrypto, the real access port; 3 devices on one pipe). **C1** control: with no `versions` a body of `sv:2` is MERGED everywhere (unchanged behaviour) · **C2** device A (appV 1) PARKS the v2 ops `needs-upgrade` while B and C (appV 2 + set) MERGE the same ops; A's `foldable()` omits them, `versionState()` is provisional; after A upgrades (setApp + set) it re-folds to the same placed order as B and C and the same upcast bodies · **C3** `foldable()` returns v1 bodies upcast to the v2 shape while the stored envelope string and its signature verify unchanged · **C4** `sv` of 0 and "x" are REFUSED `bogus-version` identically on every device; an op that reads one is `dep-refused`; an op that reads a parked one is PARKED `deps` · **C5** admin POLICY `min_v` retires v1 CRUD_CREATE identically on every device (`retired-version`); a non-admin POLICY with `min_v` is refused `not-admin`; `min_v:'x'` is `bad-policy:min_v`; lowering is `min_v-lowered`; the v2 op still MERGES · **C6** an op refused for ACCESS keeps `REFUSED access:…` even when it is also unreadable (`sv:2` on appV 1) — the hook never un-refuses · **C7** a checkpoint over a prefix with a version-parked op is refused `parked-in-S` · **C8** the 15 existing comm witnesses re-run unchanged. **Mutants:** hook removed -> C2 · upcast removed -> C3 · `min_v` not read from POLICY -> C5 · lowering allowed -> C5 · hook overwrites any verdict -> C6 · `judge` applied to claims/identity ops too is not mutated (not applicable). RED first: `build/comm/logs/witness_comm_versions_RED_before.log`.

### §16.31.1 RESULT — ✅ DONE in `build/comm/` (witness, 2026-10-25); the bim-ootb copy is NOT made; nothing committed
RED first: `build/comm/logs/witness_comm_versions_RED_before.log` (**14 of 23 arms red**: A merged ops it cannot read, no `versionState`, no `min_v`, no upcast; the controls and the stored-envelope arm were green). After: **`scripts/witness_comm_versions.js` `§CV_VERDICT PASS judged=25 fails=0 vacuous=0 mutants_killed=7/7`** (`build/comm/logs/witness_comm_versions.log`). **The 15 existing comm witnesses re-run after the change: same verdict line, same 🟢 count and 0 🔴 in all 15** (list in §16.31; second full re-run after the checkpoint fix). `poc_op_versions.js` `PASS judged=50 mutants 8/8`, `poc_d2_versioning.js` `OVERALL=PASS`.
**Edits (build/comm only, `git diff --numstat`: `comm_store.js` +19/−5, `comm_roster.js` +2/−0; the 5 removed lines are in-place edits of existing lines):** `comm_store.js` — the verdict hook in `core()` (only downgrades a MERGED op), `foldable()` upcasts a COPY, `versionState()`, `refold()`, the `WAITING-VERSION` rule for a checkpoint whose prefix holds version-parked ops · `comm_roster.js` — POLICY `min_v` validated (`bad-policy:min_v`) and monotone (`min_v-lowered`). `build/erp/op_versions.js` gained `judge`, `upcast`, `summary` and `at:"<object>"` (a nested object such as `fields`, the CRUD ops' own shape — the first version could only reach arrays; `V14`). `body.sv` is the marker (the envelope already has `v:3`).
**What the arms show on the real store (3 devices, one pipe):** C2 A (appV 1) PARKS the sv:2 op `needs-upgrade` and the op that reads it `deps`, B and C MERGE all three, A's `foldable()` omits them, `versionState()` = `{parked_count 2, provisional true, needs-upgrade 1, deps 1}`; after A upgrades it matches B and C in placed order, `provisional:false` · C3 `foldable()` returns the legacy op in the v2 shape while the STORED envelope string is byte-identical and its signature still verifies; A and B hand the host identical bodies (compared canonically) · C4 sv 0, "x", 1.5 REFUSED `bogus-version` on all 3 · C5 POLICY `min_v` retires the v1 create on all 3 and the edit that read it is `dep-refused`; non-admin and `min_v:"x"` refused; a lowering is `min_v-lowered` · C6 an op on an unknown table keeps `REFUSED access:no-table` (never un-refused); control: the same op on a real table is PARKED · C7 B and C co-sign a checkpoint over an op A parks: B and C take it into force, A does not, does not condemn it, and after the upgrade verifies it by its own fold and takes it into force.
**A real defect the witness found in my first wiring:** the old device marked the honest co-signed checkpoint `BAD` — and `BAD` is persisted (`persistCk`) and reloaded from the DB, so it would have stayed condemned across restarts and after the upgrade. Fixed (`WAITING-VERSION`), mutant `a prefix the app cannot read is condemned BAD for good` -> C7.
**Honest limits (do not claim "versioning is solved" from this):** (1) **bim-ootb `common/comm/*` is not updated** — the shipped Modeller/ERP do not run this until the byte-identical copy PR is made (needs the owner's word; `sw.js` conflict rule applies). (2) **No host uses it yet:** nothing passes `opts.versions` in `modeller/team_sync.js` or `erp/team_sync.js`; and `versions` is a per-device object the host must fill (trust list, `setApp` per op type, signed sets) — where the signed sets are FETCHED from (J.2: the policy pipe directory) is not built. (3) `trustCheckpoints:true` light clients adopt a checkpoint's frozen verdicts without folding S, so for the frozen prefix they skip the version judgement — not tested, not fixed. (4) Verdict REASON strings depend on fold order for an op refused twice over (C5: `min_v-lowered` when judged, `epoch-stale` once a higher epoch is in force) — the verdict is identical, only the first failed rule named differs; pre-existing behaviour of the POLICY fold. (5) An op refused `retired-version` is frozen into a checkpoint like any refusal, which is why `min_v` is monotone — an admin who retires a version by mistake cannot undo it (a new base release is the way out, §13.12.I). (6) Only two op types exist in the comm layer's CRUD (`CRUD_CREATE`, `CRUD_UPDATE`); the vocabulary reaches top-level fields, one array level and one nested object. (7) The Anytype/Ink & Switch evidence is two forum reports and one essay; the design is checked against their symptom shape, not their cause.
### §31.1 RESULT — ✅ DONE (witness, 2026-10-25): the ERP team plan leaves out 141 unreached dictionary views; 857 shared + 5 station-local (bim-ootb PR #2372)
**Compiler side:** `witness_scriptor_erp_plan.js` **PASS 15** (RED first on the shipped 998 plan: 3 red) — V1 all 141 excluded tables are `IsView='Y'` · V2 none has an active tab, none is reached by any window or reference (closure ALL) · V3 none is a table the real cycles shared/attempted · V4 857 + 5 + 141 = 1003, pairwise disjoint · V5 the 17 views a window or reference DOES reach stay in the plan · the plan records `excluded: view-unreached ×141` · mutants: a non-view added to the exclusion → V1 red, a reached view → V2 red. Reader witness PASS 14 (expects the 141 as `unplanned`). New module `build/scriptor/erp_scope.js` (`reach`, `excludedViews`) is the single copy of the reach computation.
**Browser side:** `W-PLAN-ERP` **PASS 17** (RED first on the old plan: 3 red) — over all N=1003 live dictionary tables the plan differs from the old rule on **exactly 141**, every one an `IsView` table; over all **373** AD windows no window loses a shared table; 4 mutants killed. Regression against baselines: docaction 24 · base 22 · desktop 9 · pill 14 · modeller 33 · so 19 or 18+1 INCONCLUSIVE (the known timing-dependent arm) · **0 `table-not-in-plan` lines** in any run.
**A wrong first claim of mine, caught by the witness and corrected:** §31 said all 141 views are ABSENT from the browser database. I had measured the shipped `erp/ad_seed.db` only; the live page also applies the self-heal patches. In the **live** database: **5 of the 141 exist as read-only SQL views, 136 do not exist, 0 are tables, the file has 0 triggers** — so still nothing can store a record in any of them (a SQLite view without an INSTEAD OF trigger rejects writes). Impact on legacy unchanged: none (the dictionary and every window are untouched; the plan is team mode only). The arm now asserts what is true: not a table, no trigger.
**Why the views are in the dictionary** (answer given to the owner, source-checked): iDempiere registers read-only database views as first-class AD tables — `AD_Table.IsView`, the SQL kept in the dictionary (`MTable.getViewComponent`, `MTable.java:984-992`), forced non-deletable (`MTable.beforeSave`, `MTable.java:883`) — so reports and info windows are built from queries through the same dictionary machinery. Not housekeeping.

---

## §32 Plan signing WIRED into both hosts (2026-10-25; owner: *"Go"* to the Q1 advice; spec BEFORE code). Phase A now (host side, no engine file touched) · Phase B specified, NOT built (needs the comm engine, which another session is editing)
**Owner's accepted advice (Q1):** offline owner key signs plans; its PUBLIC key is the trust anchor, pinned in the space genesis beside the base-seed hash; two keys (primary + backup) in the trust list; rotation by a signed POLICY op / epoch bump.
**Why the genesis pin is not built yet (found by reading the code, not assumed).** `CommStore.newSpace` copies only `name, sha256, bytes, version` into the genesis base and `comm_roster.baseOf` drops unknown keys (`comm_store.js:926-934`, `comm_roster.js:108-117`), so a trust list in the genesis needs a **comm-engine change** (`newSpace`, `baseProblem/baseOf`, `baseInfo`) — engine files are "one agent at a time" and `build/comm/comm_roster.js` + `comm_store.js` carry another session's uncommitted edits right now. I will not edit them. **Phase B spec (for when the engine is free):** genesis `params.base.planTrust` = array of 1–3 public JWKs (validated: ECDSA P-256, `kty crv x y` only), hashed into the space id like the base; `baseInfo()` returns it; hosts set `window.TEAM_PLAN_TRUST` from it after the store opens and re-run `TeamScope.verify`; witness `W-PLANTRUST-GENESIS`: a device whose trust list differs from the genesis is refused, a plan signed by a key not in the genesis never opens, adding a key requires a signed POLICY op, the space id changes with the list.
**Phase A (this step).** The single injection point is `window.TEAM_PLAN_TRUST` (public JWKs). (a) NEW `common/comm/team_trust.js`: `window.TEAM_PLAN_TRUST = window.TEAM_PLAN_TRUST || []` — **empty by default, so every shipped build behaves exactly as today**; a deployment (or an embedding page, or a test) sets the keys before it. Loaded before `team_scope.js` in both loaders; precached. (b) BOTH adapters verify at boot, **before `ready` resolves**, so no commit or scan can be judged against an unverified plan and permanently marked local-only: Modeller: `CLASS` is recomputed after `TeamScope.verify(crypto.subtle)` (it was computed once at load); ERP: the `scopeOf` answers are call-time already. Log: `§TEAM_PLAN_SIG state=<unsigned|ok|invalid|untrusted|missing>` always, and the existing `§TEAM_PLAN …` lines are kept but now logged after the verdict (a plan that fails verification logs `missing — nothing is shared` for its scope). (c) **Honest limit stated before the build:** with the anchor delivered by the same web host as the plan (this phase), an attacker who controls that host controls both; the signature protects plans that arrive by another channel (a copy, a relay, a container) and makes a mismatch loud. The genesis pin (Phase B) is what moves the anchor out of the host.
**Witnesses (RED first: no `§TEAM_PLAN_SIG` line exists).** *Per host, real Chromium, extending `W-PLAN-MODELLER` / `W-PLAN-ERP`* (test signer = Node WebCrypto, cross-checked by the compiler-side `witness_scriptor_sign.js` S8 canonical form): G1 trust `[K1]` + plan signed by K1 → host shares exactly what the unsigned run shared (Modeller `classes()` == the old 7 keys; ERP `scopeOf` c_order `share`, ad_sequence `station-local`) and logs `state=ok` · G2 tampered plan (a value / a table added after signing) → `invalid`, **nothing shared** · G3 the committed UNSIGNED plan under a trust list → closed · G4 trust `[K2]`, signed by K1 → `untrusted`, closed · G5 no trust list → `unsigned`, all existing arms unchanged. *End to end under signing:* `witness_team_modeller.js` (33 arms) and `witness_team_so.js` (19) re-run with `PLAN_SIGNED=1` (an env hook that serves a signed plan and injects the trust list through `witness_kit/plan_signed.js`) — the whole two-device cycle must pass **exactly as unsigned**, which proves no op is lost to a verification race. Mutants: adapter does not await verification → an arm turns red; adapter ignores the verdict → G2 red. Default-off hooks: with no env var the two full witnesses are byte-for-byte what they were.
### §32.1 AMENDMENT (owner, 2026-10-25: *"We avoid Playwright for reasons noted"*) — the signed-host wiring is proved by a Node WHITEBOX witness; the Playwright arms I had added are removed
**What I got wrong, and the rule it broke.** CLAUDE.md: *"Primary browser verification = whitebox §-tagged console.log() … Playwright is secondary — wiring/deploy checks only. Do NOT add Playwright tests for value verification — add a § log line instead"*; memory `feedback_whitebox_not_playwright` (a Playwright-driven test gave a false green, GIGO). In §32 I specified `P7`/`E7` Playwright arms, a `PLAN_SIGNED` end-to-end hook in the two full witnesses and a Playwright signing helper, and earlier I had added `S11` (a Chromium arm) to the signing witness and two Playwright plan-witness files (`W-PLAN-MODELLER`, `W-PLAN-ERP`) that read VALUES out of the page with `page.evaluate`. Those values (`classes()`, `scopeOf` over 1003 tables) are exactly what the rule says to prove with the app's own `§` line.
**Corrected design.** The adapters already print the evidence (`§TEAM_PLAN hash=… tables=…`, `§TEAM_PLAN_SIG state=…`, `§TEAM_PLAN missing — nothing is shared`). New **Node whitebox** witness `scripts/witness_scriptor_hosts.js`: the REAL `common/comm/team_trust.js`, `team_scope.js`, the REAL generated plans and the REAL adapters (`modeller/team_sync.js`, `erp/team_sync.js`) are loaded in a `vm` with a minimal global (location `?team=1`, `document.readyState`, Node WebCrypto, captured `console.log`); plans are signed by the REAL compiler signer `build/scriptor/sign_plan.js`. It asserts only what the app prints or exports: the `§` lines, `TeamSyncModeller.classes()` / `TeamSync.scopeOf`, and the ORDER of the SIG line against `ready` (no scan can run on an unverified plan). No browser, milliseconds, runnable in CI and by mutation. Scenarios per host: no trust list (default) · signed + trusted · altered after signing · unsigned under a trust list · other signer · no plan. Mutants: verify skipped · `ready` not gated by verification · the verdict ignored (scope not recomputed after verify) · the shipped trust file overwriting an injected list · a literal list reinstated.
**Removed from the change:** the `PLAN_SIGNED` hooks in `witness_team_so.js` / `witness_team_modeller.js`, `witness_kit/plan_signed.js`, the `P7`/`E7` arms, and `S11` from `witness_scriptor_sign.js`. The already-merged Playwright plan witnesses stay untouched except one mutant string that the adapter refactor would otherwise leave as a surviving hole; their value arms are redundant with the Node witnesses (`witness_scriptor_team_scope.js` over all 1003 tables, `witness_scriptor_erp_plan.js` V1–V5) and are **candidates to retire** — not done unasked. **Honest residual:** the browser's own WebCrypto ECDSA verify is no longer exercised by a test I own (the comm layer's browser witnesses exercise the same `subtle.verify` call shape); a Node-vs-Chromium difference would not be seen here.
### §32.2 RESULT — ✅ DONE (whitebox witness, 2026-10-25): signing is wired into both hosts (bim-ootb PR #2374); trust list empty by default; genesis pin specified, not built
**`scripts/witness_scriptor_hosts.js` `§HOSTS_VERDICT PASS judged=25 fails=0`** — the REAL `team_trust.js`, `team_scope.js`, generated plans and both adapters loaded in a `vm` with a minimal global; plans signed by the compiler's own `sign_plan.js`; only the app's own `§` lines and exports are asserted. Per host (Modeller, ERP): H1 no trust list ⇒ `§TEAM_PLAN_SIG state=unsigned`, the same scope as before (Modeller `classes()` = the old 7 keys; ERP `c_order` share, `ad_sequence` station-local), the plan line printed (`hash=4f0bfecad90b creates=6 move=pos_x|pos_y|pos_z` / `hash=87977c52fb50 tables=857 local=5`) · H2 trust [K1] + plan signed by K1 ⇒ `state=ok`, same scope · H3 plan altered after signing ⇒ `state=invalid`, **nothing shared**, `§TEAM_PLAN missing — nothing is shared` · H4 the unsigned plan under a trust list ⇒ closed · H5 other signer ⇒ `untrusted`, closed · H6 no plan ⇒ `missing`, nothing shared · H7 the verdict line comes **before `ready`** in all four runs including a deliberately SLOW verification (120 ms), so no scan or commit can be judged against an unverified plan and marked local-only for good. Mutants (no survivor): verification skipped → H1/H3/H4/H5/H6 · `ready` not gated → H7 · the Modeller never recomputes after the verdict → H2 · the shipped trust file overwriting an injected list → H2–H5 · a literal list reinstated → H3–H7. **The witness found a hole in itself:** the "ready not gated" mutant first SURVIVED because the stubbed boot happened to be slower than the verification; the slow-verification scenario fixed it.
**Playwright (owner: "We avoid Playwright for reasons noted"):** the signed-host evidence is whitebox; the Playwright arms/hook/helper and `S11` I had started to add were removed (§32.1) and the rule is recorded in memory. The pre-existing browser suite ran green on this adapter state before the test-file reverts (docaction 24, base 22, desktop 9, pill 14, modeller 33, so 19); it was not re-run after the reverts because the adapter code is identical. **Open for the owner:** retire the value arms of the two Playwright plan witnesses I merged earlier (`W-PLAN-MODELLER`, `W-PLAN-ERP`) — they overlap the Node witnesses; not done unasked.
**Shipped behaviour:** unchanged until a deployment sets `window.TEAM_PLAN_TRUST` before `team_trust.js`; with keys set, an unsigned/altered/untrusted plan shares nothing. **Still open (Q1 phase B):** genesis-pinned trust (comm engine: `newSpace`, `baseProblem/baseOf`, `baseInfo` — currently being edited by another session), two-key trust list + rotation by POLICY op, and the honest limit that a same-host anchor protects plans arriving by another channel, not a compromised host.

---

## §16.32 Event versioning in the MODELLER host (2026-10-25; user: *"Proceed on the plan"* after *"in those other projects who has done this successfully?"*; SPEC BEFORE CODE; ERP is the step after)
**Who has done it, from what I could read (web search 2026-10-25; summaries, not full papers — treat as leads, not proof):** nobody has a proven answer for the case WE are in (no server, no authority, devices offline for weeks). What exists: **Axon Framework** (event sourcing, server-side): stored events stay immutable and are transformed on READ by upcasters; Axon 5 moved to "conversion first" — compatible changes (add a field with a default, drop a field) need no upcaster at all, and its docs insist mappers be deterministic and side-effect-free — *our tolerant reader + read-time upcast on a copy follow this*. **Matrix**: every room carries an explicit room version; a server that does not support it answers `M_INCOMPATIBLE_ROOM_VERSION`; the way forward is an admin-driven room upgrade — *our `min_v` and "needs-upgrade" follow the explicit-version idea, but Matrix refuses where we park*. **Replicache**: a `schemaVersion` bump gives a new local state and the server serves both generations during rollout, and a "mutation recovery" system rescues pending offline writes from older versions; **Zero** (same authors) has an open bug where offline writes made under an old schema are lost on upgrade — *the lesson we took: a parked op stays in the log and is never discarded*. **MongoDB Realm**: a schema mismatch forces a client reset (local changes dropped) — *what we refuse to do*. **Ink & Switch Cambria**: bidirectional edit lenses for schema evolution without a central authority — a research prototype; the 2023 "Live & Local Schema Change" paper says there has been surprisingly little research since; *we deliberately do NOT down-convert (a newer op on an older app parks)*. **So:** the parts that are proven (immutable log + read-time transform; explicit versions; admin-driven retirement; never lose offline writes) are borrowed from server-side systems; the peer-to-peer part (signed declarative mappings + parking + same verdict on every device) has no production precedent that I found.
**Scope of this step.** Make the MODELLER pass `opts.versions` to its comm store, with the same trust anchor as plan signing (§32 phase A). The ERP adapter is the next step. Behaviour with no configuration is unchanged.
**Files (bim-ootb, branch `feat/modeller-versions`):** NEW `common/comm/op_versions.js` (the registry; a copy of bim-compiler `build/erp/op_versions.js`, with one new option `verifySet`, below), NEW `common/comm/team_versions.js` (host glue), `modeller/team_sync.js`, `modeller/modeller.html` (script tags), `modeller/sw.js` (precache + version), NEW `modeller/tests/witness_team_versions.js`. **Not edited:** `common/comm/comm_store.js`, `comm_roster.js` (another session owns them for the genesis trust list), `erp/*`, `op_upcaster.js`.
**Configuration (all optional; absent = today).** `window.TEAM_SHAPE_V` = `{op_type: n}` — the shape version this app build reads, default 1 for every op type. `window.TEAM_UPCASTERS` = array of signed sets, default `[]`. Trust = `window.TEAM_PLAN_TRUST` (the same public JWKs as plans; one admin key signs both). **Set signature, identical to a plan's:** the set carries `signer` (a JWK, kty/crv/x/y) and `sig` (hex ECDSA P-256/SHA-256) over the canonical JSON of the set WITHOUT `sig` and `signer`; accepted iff `signer` is in the trust list. **An empty trust list accepts NO set** (`untrusted-signer`) — unlike plans, which stay usable unsigned for back-compat: a set rewrites the meaning of stored data, so it is never taken on faith.
**Rules.** 1. `OpVersions.create({verifySet})`: a host-supplied `async verifySet(set) -> null | 'unsigned' | 'untrusted-signer' | 'bad-signature'` replaces the id-keyed `trust` map (the map path is unchanged and still witnessed). 2. The registry is created at load; `setApp(op, TEAM_SHAPE_V[op] || 1)` for `CRUD_CREATE` and `CRUD_UPDATE` (the only two op types the Modeller authors); `TeamVersions.ready` resolves after every set in `TEAM_UPCASTERS` has been verified and loaded or refused; each outcome is logged `§TEAM_VERSIONS_SET op=… <ok|refused:reason>`, and `§TEAM_VERSIONS appV=<…> sets=<n loaded>/<n offered>` once. 3. `team_sync.js` waits for `TeamVersions.ready` BEFORE `openStore` (so the first fold already has the sets), passes `versions: TeamVersions.registry`, and **stamps `body.sv = appV` on every op it authors iff appV > 1** (a shape-1 op stays byte-identical to today's). 4. `TeamSyncModeller.versionState()` returns the store's `versionState()` (what a UI will show instead of a spinner); no UI is added in this step. 5. A set offered later than boot is loaded by `TeamVersions.load(set)` and the host calls `store.refold()`.
**Witness `W-VERSIONS-MODELLER` (`modeller/tests/witness_team_versions.js`; real Chromium, the real `modeller.html?team=1`, a dumb folder pipe, the Modeller founds a team through its own `found()` and authors through the store's own `author()`; every number read from the live page).** **M1** default configuration: `§TEAM_VERSIONS appV=1 sets=0/0`; an authored op carries no `sv` (stored envelope body has no `sv` key); a normal op is MERGED; `versionState()` not provisional · **M2** an op authored with `sv:2` on this shape-1 Modeller is PARKED `needs-upgrade`, absent from `store.foldable()`, `versionState().provisional === true`; control: the same op without `sv` MERGES · **M3** `TEAM_SHAPE_V={CRUD_CREATE:2}` + one admin-signed set (`fields.grandtotal -> fields.total`) + that admin key in `TEAM_PLAN_TRUST` (the plan is signed too, else it would fail closed): `sets=1/1`; a shape-1 op authored BEFORE (in a first load of the same storage) is handed to the host in the v2 shape by `foldable()` and the stored envelope string is unchanged; an op authored now carries `sv:2`; the `sv:2` op MERGES · **M4** the same config with an unsigned set / a set signed by a key not in the trust list / a set edited after signing: `sets=0/1`, each logged `refused:<reason>` (`unsigned`, `untrusted-signer`, `bad-signature`), and shape-1 ops are PARKED `needs-mapping` (never folded half-translated) · **M5** an EMPTY trust list refuses even a correctly signed set (`untrusted-signer`) while the shape-1 behaviour of M1 is unchanged · **M6** 0 page errors in every load. **Mutants (served in place of the real file; each must turn >= 1 arm red):** `versions` not passed to the store -> M2 · `verifySet` accepts everything -> M4 · stamp `sv` even at appV 1 -> M1 · `team_sync.js` opens the store before `TeamVersions.ready` -> M3 · empty trust list accepts sets -> M5. **Regression (must read the same as before this change, recorded before editing):** the Modeller's own `W-TEAM-MODELLER` (33), `W-PLAN-MODELLER` (12), `W-TEAM-DOCACTION` is ERP and unaffected.

---

## §33 Plan trust PINNED IN THE GENESIS — Phase B of §32 (2026-10-25; the other session confirmed `build/comm/comm_store.js` + `comm_roster.js` are free and its edits do not overlap; spec BEFORE code)
**Issue.** §32 wired the hosts to verify plan signatures, but the trust anchor is delivered by the same web host as the plan. The advice you accepted: pin the owner's PUBLIC key in the space genesis (beside the base pin), primary + backup. That needs the comm engine, because `newSpace` copies only `name, sha256, bytes, version` and `baseOf` drops unknown keys.
**Design (engine, minimal, no behaviour change for spaces without it).** A **top-level** genesis param `planTrust` (not inside `base`: the Modeller's spaces have no base, §15.8): an array of **1–3 public ECDSA P-256 JWKs**, each EXACTLY `{kty:'EC', crv:'P-256', x, y}` (base64url x/y); duplicates, other curves, **any extra field (a private `d`, a `kid`, `key_ops`) and a wrong count are rejected**. `newSpace(..., {planTrust})` validates and normalises; `params.planTrust` is part of the hashed params, so **the space id pins the list** (a different list is a different space). The roster fold (a) **refuses a genesis whose `planTrust` is invalid** — it is an `untrusted-genesis`, never silently dropped, so there is no downgrade-by-garbage path — and (b) returns `planTrust`; the store exposes `planTrust()` (null before the genesis is seen, null for a space without one). New pure helpers `ROS.planTrustProblem / planTrustOf`. Everything else — the other 15 witnesses and the other session's `witness_comm_versions.js` — must be unchanged.
**Witness `W-PLANTRUST-GENESIS` (`scripts/witness_comm_plantrust.js`, Node, real `build/comm/*`, RED first: `newSpace` ignores the option).** T1 `params.planTrust` equals the normalised list; the space id changes with the list (a different list or none ⇒ a different id; the same params ⇒ the same id) · T2 `newSpace` throws `invalid planTrust (…)` for: empty, 4 keys, not an array, a duplicate, a missing `x`, `P-384`, `RSA`, **a key carrying private `d`**, an extra `kid` · T3 `planTrust()` returns the list on the founder's store AND on a joiner that has only the invite + genesis; null before the genesis arrives; null for a space without one · T4 a forged genesis whose `planTrust` is invalid but whose space id is self-consistent is REFUSED (`no-trusted-genesis`, `roster.ok=false`) — never accepted with the list dropped · T5 end to end with the REAL reader: a plan signed by the compiler's own signer under the key pinned in the genesis verifies `ok`; signed by a key not pinned ⇒ `untrusted`. *Mutants:* planTrust left out of the space id (T1) · private material accepted (T2) · invalid list silently dropped at fold (T4) · planTrust not returned by the fold (T3) · count limit removed (T2) → each ≥ 1 red arm.
**Then (separate steps):** the byte-identical bim-ootb copy PR of the two engine files (re-diffed against `origin/main`, which now contains the other session's #2373); host reading of the genesis list in both adapters (`erp/team_sync.js` now; `modeller/team_sync.js` + `sw.js` only after the other session's `feat/modeller-versions` PR merges — I told them which lines); `found()` passes the deployment's `TEAM_PLAN_TRUST` into `newSpace`; **a genesis list, when present, OVERRIDES the deployment list** (the space decides). **Not in this step:** rotation / adding a key by a signed POLICY op (engine POLICY fold; its own spec + witness).
### §33.1 RESULT — ✅ DONE (witness, 2026-10-25): the plan trust list is pinned in the space genesis (engine); host reading follows
RED first: `build/scriptor/plantrust_RED_before.log` (a private key `d` in the list was ACCEPTED; no `planTrust()`). After: **`scripts/witness_comm_plantrust.js` `§PLANTRUST_VERDICT PASS judged=23 fails=0`** (`build/comm/logs/witness_comm_plantrust.log`). T1 `params.planTrust` is the normalised list and the **space id pins it** (another key or none ⇒ a different id) · T2 `newSpace` refuses: empty, 4 keys, not an array, a duplicate, missing `x`, P-384, RSA, **a key carrying private `d`**, an extra `kid` · T3 `planTrust()` is null before the genesis arrives, returns the list on the founder and on a joiner holding only the founder's genesis op, null for a space without one · T4 a self-consistent genesis with an INVALID list is refused (`no-trusted-genesis`, `roster.ok=false`) — never accepted with the list dropped · T5 with the REAL reader and the compiler's own signer: a plan signed by either pinned key (primary or backup) verifies `ok` under the list read from the genesis; a key not pinned ⇒ `untrusted`. Mutants (no survivor): left out of the space id → T1/T3/T5 · private material accepted → T2/T4 · invalid list silently dropped → T4 · not returned by the fold → T3/T5 · count limit removed → T2.
**A harness bug I fixed on the way:** the comm modules find each other through `globalThis` first (`_dep`), so mutated copies silently used the REAL roster and the mutants gave inconsistent results; the witness now clears those globals before loading each copy.
**Regression (all re-run on the changed engine, every log read):** base 36 · checkpoint 43 · cl1_uu 23 · cl2_order 12 · cl3b_github 8 · cl3_store 25 · cl4_admit 23 · cl5_conflict 12 · cl8_opaque 44 · docno_booking 15 · docno_modes 14 · keyclaim 25 · policy 32 · space_scope 23 · gmail_log 5 · **the other session's `witness_comm_versions.js` PASS 25, mutants 7/7** — all unchanged and PASS. **Engine diff:** `comm_roster.js` +17 (`planTrustProblem`, `planTrustOf`, one fold condition, one returned field, two exports), `comm_store.js` +6 (`newSpace` option, `planTrust()` accessor, export); before my edit `common/comm/comm_store.js` + `comm_roster.js` in bim-ootb `origin/main` were byte-identical to the other session's commit `a3c959036` (checked with `cmp`), so the copy PR is a pure +25/−5.
**Not done here:** (1) the bim-ootb copy PR (next); (2) hosts reading the genesis list — the genesis list OVERRIDES the deployment list; `found()` passes the deployment's `TEAM_PLAN_TRUST` into `newSpace` (ERP first; Modeller only after the other session's `feat/modeller-versions` PR merges); (3) adding or rotating a key by a signed POLICY op.

### §33.2 ERP host reads the genesis trust list (spec BEFORE code; the Modeller follows after the versions session's PR merges)
**Rules (decided, the advice you accepted).** (1) **The space decides:** when the folded genesis carries a `planTrust`, it REPLACES the deployment's `window.TEAM_PLAN_TRUST` (the deployment list is only the founder's default and the fallback for spaces that pinned nothing). (2) **The founder pins what the deployment trusts:** `found()` passes the deployment's list (if non-empty) into `newSpace`, so a space founded by a deployment that trusts K1 + K2 is born pinned to them. (3) **No window of unverified use:** the genesis list is applied and the plan RE-verified before `ready` resolves at boot, and again after a Visit (a joiner learns the list when the genesis arrives); a plan that fails the genesis list closes the scope. (4) Rotation / adding a key by a POLICY op is NOT here.
**Implementation (erp/team_sync.js only + erp/sw.js version).** `spaceOpts(bi)` → `{ base?, planTrust? }` for `newSpace` (pure; exported `_spaceOpts` for the witness); `pinTrust(store)` → reads `store.planTrust()`, replaces `window.TEAM_PLAN_TRUST` when it differs, re-runs `TeamScope.verify(crypto.subtle)`, prints `§TEAM_PLAN_SIG state=<s> trust=genesis(<n>)`; called in `boot` before `_resolveReady(true)`, in `found()` after the store opens, and after each Visit's sync; exported `_pinTrust(store)` as a test hook (like `_setClock`).
**Witness (Node whitebox, extending `witness_scriptor_hosts.js`; the REAL engine from `build/comm` creates the space and the store; RED first: `_pinTrust` does not exist).** G1 deployment list empty + genesis [K1] + plan signed by K1 ⇒ `state=ok trust=genesis(1)`, ERP scope open · G2 deployment [K2] (wrong) + genesis [K1] + plan signed by K1 ⇒ ok (**the genesis overrides the deployment**) · G3 genesis [K1] + UNSIGNED plan ⇒ `invalid`, closed · G4 genesis [K1] + plan signed by K2 ⇒ `untrusted`, closed · G5 a space that pinned nothing + deployment [K1] + plan signed by K1 ⇒ ok (the deployment list stays the fallback) · G6 `_spaceOpts` carries the deployment list into `newSpace` and the resulting genesis params contain it; with an empty list the option is absent · G7 ordering: the re-verification verdict is printed before `ready`. *Mutants:* `pinTrust` never replaces the deployment list (G2 red) · genesis list merged with instead of replacing the deployment list (G2 red) · re-verify skipped after pinning (G3/G4 red) · `found()` drops the list (G6 red).
### §33.3 RESULT — ✅ DONE (whitebox witness, 2026-10-25): both hosts read the genesis-pinned plan trust list (ERP #2377 merged; Modeller #2378)
**`scripts/witness_scriptor_hosts.js` `§HOSTS_VERDICT PASS judged=47 fails=0`** — for BOTH hosts, with the REAL comm engine creating the space and store (no browser): G1 deployment list EMPTY + genesis [K1] + plan signed by K1 ⇒ the host adopts the list, `§TEAM_PLAN_SIG state=ok trust=genesis(1)`, scope open · G2 deployment [K2] + genesis [K1] + plan signed by K1 ⇒ ok (the space decides), and plan signed by **K2** ⇒ `untrusted` and closed (so the genesis list REPLACES the deployment list; it is not merged) · G3 genesis [K1] + an unsigned plan ⇒ `invalid`, closed (the host was open until the list was applied) · G4 plan signed by K2 ⇒ `untrusted`, closed · G5 a space that pinned nothing + deployment [K1] ⇒ ok (deployment list stays the fallback) · G6 `found()` hands the deployment list to `newSpace` (genesis params carry the keys; ERP also the base); with no list there is no option. RED first: `_pinTrust` did not exist on either adapter. **13 mutants killed**, each by the right arms: genesis list never adopted → G1–G4 · merged instead of replaced → G2 · not re-verified after adopting → G1–G4 · `found()` drops the list → G6 · plus the earlier signing mutants. **Bugs the witness found in my own work:** (1) the arms read the FIRST verdict line instead of the latest (a pinned list re-verifies; harness fixed); (2) the Modeller printed the plan line from a stale op list when a verdict closed the scope — `summary()` was null, a mutant crashed it; the line now prints "missing" whenever the summary is closed.
**Co-ordination (cross-session, no user relay):** the session that owns the versioning work confirmed `comm_store.js` / `comm_roster.js` were free (its edits did not overlap), asked me to re-run its witnesses, and after its Modeller PR (#2376) merged I added my Modeller block without touching its lines (told it exactly which). Its `witness_comm_versions.js` PASS 25 / mutants 7/7 + the 15 other comm witnesses were re-run on the changed engine (§33.1). `W-VERSIONS-MODELLER` is a **browser** witness: per the owner's rule I did not run it — I told that session which lines I changed and asked it to confirm on the branch.
**Residual, stated:** the boot call-site order (`pinTrust` before `_resolveReady`) is read in code, not exercised by the Node witness (the boot path needs the full page). **Open:** adding/rotating a key by a signed POLICY op (engine POLICY fold: its own spec + witness); the two-key convention (primary + backup) is enforceable today only by the founder listing two keys; wiring the key into a real deployment (`team_trust.js` is empty by default).
### §30.2 ERP scope evidence — ADDENDUM (2026-10-25): the document-action side effects, from the real oracle and the model layer's own code (no browser, no new sweep run)
**Where the side-effect tables are knowable without running 33 families.** (1) The ERP's document actions go through `ModelLayer.docActionFor(table)`: **10 tables have a registered DocAction class** (`m_rma, dd_order, m_inventory, c_order, m_inout, c_invoice, c_payment, c_allocationhdr, m_movement, m_movementconfirm`); every other document family gets a **status-only (FSM) group** — the code logs `§MODEL-NAMED … status-only (FSM) group` (`crud_overlay.js completeFanout`) — so its only write is the document's own table, which a window reaches. (2) The **real-iDempiere oracle** (`scripts/poc_model_layer_oracle.js`, W-MODEL-ORACLE, log of 2026-10-04: pilot documents compared table by table against live iDempiere) records the whole footprint of 4 document kinds — `c_order` (17 tables with rows), `m_inout` (8), `c_invoice` (8), `c_payment` (4); 121 MATCH · 15 NAMED-EXCLUDED · 9 VALUE-DIFF · 9 MISSING — and **every table in those footprints with rows is inside the window-reach scope**. (3) The model layer's own source (14 `erp/model_*.js` files at `origin/main`, static extraction, a lower bound because dynamic table names are not seen) names **31 written tables**; **27 are inside window-reach and 4 are not: `m_storagereservation` (shared today, observed), `m_storageonhand`, `t_fact_acct_history`, `m_attributeinstance`** (plus `m_costhistory` under the PARENT/MAND variants).
**What that does to the candidate.** `witness_scriptor_erp_scope.js` (now 14 judged, EVIDENCE) adds those named writes to the reachable set: candidate = reachable ∪ observed-shared ∪ model-layer writes = **709 tables (PARENT/MAND) or 730 (ALL)**, 289 / 268 fewer than today's 998 (141 of them views). The four extra tables are classified for the owner, not decided: `m_storagereservation` — shared in the real cycle; `m_attributeinstance` — attribute data of a record, a candidate to share; `m_storageonhand` — stock on hand is a SUM over movements (FL-2: derived on each member), a candidate to stay local; `t_fact_acct_history` — a working/derived posting table (FL-2), a candidate to stay local. The candidate lists (`candidate_erp_scope_*.json`) include all four as the safe SUPERSET.
**Remaining OPEN (unchanged in kind, smaller in size):** the dynamic table names the static extraction cannot see, and the six registered classes (`m_rma, dd_order, m_inventory, c_allocationhdr, m_movement, m_movementconfirm`) that the oracle did not cover. They are the X of N to close if the owner wants the wider narrowing: run each class's `completeIt` in a Node harness and read the tables of its op group (the model layer already logs `§MODEL-DOCACTION … tables=` for that). **Recommendation unchanged:** keep step 1 (views removed, 857, shipped); take the wider narrowing only after that six-class check.
### §33.4 LESSON (2026-10-25, found by the versions session running the browser suite): a text-anchored MUTANT silently becomes a no-op when the code it anchors on changes
My #2378 refactor changed a logged expression (`T.summary().hash` → `sm.hash`); the Playwright witness `W-PLAN-MODELLER` anchored its 'plan hash not logged' mutant on the old text, the replace did nothing, the "mutant" equalled the real file and read as a SURVIVOR (FAIL 12/1) — a stale test, not a behaviour regression, and **I had not re-run that suite after the refactor (owner rule: no Playwright)**, so only a peer's run caught it. **Fix (bim-ootb PR `fix/plan-witness-anchors`):** the anchor updated, and both plan witnesses now print `MUTATION DID NOT APPLY: stale anchor` and FAIL when a mutant's source equals the real source. Checked WITHOUT a browser: every anchor of both witnesses exists in the current `modeller/team_sync.js`, `erp/team_sync.js`, `common/comm/team_scope.js` (0 stale; the ERP witness had no drift). **My own Node witnesses audited for the same hole:** `witness_comm_plantrust`, `witness_scriptor_hosts`, `witness_scriptor_sign` already refuse a no-op mutation; `witness_scriptor_team_scope` did not — now it does (PASS 14 unchanged); `mesh`/`seal`/`registry`/`virtual`/`patterns` mutate through options, monkeypatches or catalogue objects, not text anchors. **Rule for the lane:** a mutant defined by text replacement must prove it changed the text.

### §16.33 Event versioning in the ERP host (2026-10-25; user: *"Yes"*) — same wiring as §16.32, ERP files; **honest note: I wrote the code and the witness from §16.32's rules BEFORE writing this section — the spec-first rule was skipped for this half; the rules below are what was built, not a plan**
**Files (bim-ootb):** `erp/team_sync.js` (store opts `versions`; `boot()` awaits `TeamVersions.ready` before opening the store; the one `S.author` site uses `stamped(body)` — `sv` only when the op type's shape version is above 1; `TeamSync.versionState()`), `erp/idempiere.html` (the two scripts, `team_sync.js?v=8`), `erp/sw.js` (precache + v909→v910), `common/comm/team_versions.js` (the op list is now all four op types the adapters author: `CRUD_CREATE CRUD_UPDATE CRUD_DELETE SET_STATUS`; the Modeller's log line, witness regexes, `modeller.html` cache-bust `?v=2` and `modeller/sw.js` v164→v165 follow), `erp/tests/witness_team_versions.js`. Not edited: `common/comm/comm_store.js`, `comm_roster.js`, `op_versions.js`.
**Witness `W-VERSIONS-ERP` (real Chromium, real `erp/idempiere.html?login=GardenAdmin&window=143&team=1`, folder pipe, the ERP founds a team through its own `found()`; a real `c_bpartner` is committed through the ERP's own funnel `__crud.applyOp`; peer ops through `store.author()`):** M1 default config (shape 1 for all four op types, 0 sets, authored op has no `sv`, MERGED) · M2 an `sv:2` op parks `needs-upgrade`, absent from `foldable()`, and the ERP database gains exactly the control row, not the parked one (rows measured after a first visit, because a visit re-projects the ERP's own op once) · M3 shape 2 + admin-signed set (`fields.legacy_note -> fields.description`): an older peer's op is folded in the v2 shape, stored envelope byte-identical, the ERP-authored op carries `sv:2`, both peer ops reach the database · M4 unsigned / untrusted / edited sets refused with the reason, the older op parks `needs-mapping` and never reaches the database · M5 an empty trust list accepts no set, the unsigned plan still works (3 sample tables shared) · M6 0 page errors. **Result: PASS 23/0, 0 page errors, mutants 4/4 killed** (versions not passed; verifySet accepts all; empty trust accepts a set; stamp ignores the shape). Regression on the branch, 0 red: W-TEAM-DOCACTION 24 · W-BASE-EDIT 22 · W-TEAM-DESKTOP 9 · W-TEAM-PILL 14 · W-TEAM-SO 19 · W-PLAN-ERP 17 (open 1) · W-TEAM-MODELLER 33 · W-PLAN-MODELLER 12 · W-VERSIONS-MODELLER 21 (mutants 4/4).
**Limits:** the ERP's SET_STATUS and CRUD_DELETE shapes are registered but no arm authors them under a shape bump; the ERP witness's rename targets a column that is only on the legacy op, so it proves the mechanism, not a real ERP schema change; no UI shows `versionState()`; sets still come from config.
**Prior-art correction to §16.32 (user: *"since no one done this aren't we prior art, or innovative?"*; three more searches, 2026-10-25, summaries only):** the sentence "no production precedent that I found" was too strong for the pieces. **Closest finds:** **DefraDB Lens** (Source Network, a peer-to-peer database): bi-directional schema migrations run lazily, defined as WebAssembly modules in a sandbox, and its docs say peers on different app versions can sync without worrying about the mismatch — that covers "migration travels with the data between peers" and a safety story (sandbox, not signatures). **Cambria**: lenses are declarative JSON/YAML (the idea our five-verb vocabulary resembles; its own page calls it not production-ready). **PowerSync**: additive changes are ignored by old clients; breaking changes branch the sync rules by a client-supplied schema version. **WatermelonDB sync**: clients that cannot read a table wait for the upgrade and resume consistently (the same shape as our parking, for tables). **What I did NOT find in those searches** (absence in a few searches, not proof): the combination of (1) data-only mappings signed by an admin key and verified offline against the space's key list, (2) per-operation parking in an immutable signed op log with a provisional state hash that provably re-converges after the upgrade, (3) `min_v` retirement carried in the in-log policy and made monotone so the same op gets the same verdict on every device and checkpoints cannot freeze a mistake, (4) a witness-with-mutants suite for all of it. **So:** the pieces are NOT novel and must be credited (Axon/event-sourcing upcasting, Cambria lenses, DefraDB Lens, Matrix room versions, Replicache); the combination may be new, but "new" needs a proper prior-art search (an extended search plus reading the DefraDB and Cambria specs) before anyone writes it down as a claim. Dated commits (a3c959036, 02300c9ef and the bim-ootb merges #2373 / #2376 / this PR) make OUR work citable; they do not make it first.

---

## §16.34 The versioning INDICATOR in the Team pill (2026-10-25; user: *"Yes"* to "the N items need an update indicator in the Team pill?"; SPEC BEFORE CODE this time)
**Issue.** §16.30-§16.33 park and refuse ops correctly, but the user sees nothing: the Anytype complaint was a spinning wheel with no reason. The indicator is what turns "parked" into a sentence a person can act on. **Proof method (PRIMAL LAW):** no screenshot — every claim is a value read from the live DOM (`data-*` attributes and `textContent` of the Team chip) by the host witnesses.
**Where.** Both hosts already draw the Team chip (`#team-chip`, with `#team-warn` for the local-only warning). The indicator reuses that line and adds attributes on the chip; no new element, no new panel. **Wording lives in ONE place:** `common/comm/team_versions.js` gets `TeamVersions.describe(verdictMap)` -> `{level, parked, refused, by_reason, text, title}`; the hosts do not word anything themselves. (The store's own `versionState()` stays as the engine API; `describe` is computed from the verdicts the host's `render()` already holds, so the pill costs no second fold; a witness arm checks the two give the same counts.)
**Wording (plain English, one line, from the verdict reasons):** `needs-upgrade` -> "N change(s) from a newer app wait — update this app" · `needs-mapping` -> "N change(s) wait for a translation rule from the team admin" · parked `deps` (only shown when one of the two above is present) -> "M more wait on those" · `retired-version` -> "K change(s) from a retired version were ignored" · `bogus-version` -> "J change(s) with an unreadable version were ignored". Singular/plural exact ("1 change … waits"? — fixed text: "1 change from a newer app waits — update this app"; N>1: "N changes from a newer app wait — update this app"). Parts are joined with " · " and prefixed "⚠ ". Nothing parked or refused for a version reason -> `text === ''` (the pill shows nothing new). `title` = one `reason: count` per line for the curious.
**Attributes on `#team-chip`:** `data-versions` = `ok` | `provisional` (anything parked for a version reason: the data is not final) | `refused` (only ignored ops, nothing waiting); `data-parked` = N parked (all reasons); `data-version-refused` = K+J. Appended to the existing `#team-warn` text and title (the local-only warning is untouched).
**Witness arms (added to `W-VERSIONS-MODELLER` and `W-VERSIONS-ERP`, real Chromium, after `render()`):** **I1** default config: `data-versions="ok"`, `data-parked="0"`, no versioning text in `#team-warn` · **I2** a newer peer's op on a shape-1 host: `data-versions="provisional"`, `data-parked="1"`, `#team-warn` contains exactly "1 change from a newer app waits — update this app", the title contains `needs-upgrade: 1` · **I3** a refused set (unsigned) with an older peer's op: the text says "wait for a translation rule from the team admin", never "newer app" · **I4** after the upgrade path of M3 (shape 2 + signed set): `data-versions="ok"`, no versioning text (the indicator clears by itself) · **I5** parity: `describe()` counts equal `store.versionState()` counts in I2 and I3 · **I6** a retired version (host passes `min_v` through POLICY is not available in these witnesses, so retirement is checked at unit level in the comm witness): the glue's `describe()` is fed a synthetic verdict map with `retired-version`/`bogus-version` and must produce the exact K/J sentences — a pure-function check run inside the page. **Mutants:** `describe` returns "" always -> I2 · text wording swapped between needs-upgrade and needs-mapping -> I2/I3 · host never calls it -> I2 · `data-versions` not cleared when nothing is parked -> I4.
**Not in this step:** a click-through "what do I do" panel; localisation; a badge on the Team icon (Modeller) — only the chip line, so the Team panel keeps its current look.

### §16.34.1 RESULT — ✅ DONE in both hosts (witness, 2026-10-25; bim-ootb PR from branch `feat/versions-indicator`)
**What a user now sees (values read from the DOM by the witnesses, no screenshot):** on a shape-1 host a newer peer's op makes the Team chip carry `data-versions="provisional" data-parked="1"` and the warning line reads exactly **"⚠ 1 change from a newer app waits — update this app"** (title `needs-upgrade: 1`); a refused set with an older peer's op reads **"⚠ 1 change waits for a translation rule from the team admin"** (never "newer app"); with shape 2 + the signed set the indicator is clear by itself (`data-versions="ok"`, no versioning text); default configuration shows nothing new. Wording is in ONE place (`TeamVersions.describe` in `common/comm/team_versions.js`); both hosts call `TeamVersions.paint(chip, warn, L.verdict)` from `render()` with the verdicts they already hold (no second fold). Plural / retired / unreadable / dependents sentences checked exactly by a pure-function arm (I6).
**Witnesses:** `W-VERSIONS-MODELLER` **PASS 27/0, mutants 8/8**, `W-VERSIONS-ERP` **PASS 29/0, mutants 8/8**, 0 page errors; new mutants: indicator text blanked -> I2/I3/I6 · mapping wording swapped -> I3 · host never paints the chip -> I1-I4 · level never clears -> I1/I4/I6. Parity arm I5: `describe()` counts equal the store's `versionState()` counts. Regression on the branch, 0 red: W-TEAM-DOCACTION 24 · W-BASE-EDIT 22 · W-TEAM-DESKTOP 9 · W-TEAM-PILL 14 · W-TEAM-SO 19 · W-PLAN-ERP 17 · W-PEOPLE-STRIP-ALL 29 · W-TEAM-MODELLER 33 · W-PLAN-MODELLER 12 · W-PEOPLE-MODELLER 22.
**A flaky witness found on the way (NOT caused by this change, not fixed here):** `modeller/tests/witness_team_icon_modeller.js` failed once (14/15): arm "B has chosen nothing: B's own row draws the deterministic default … different from A's default" failed because A's and B's RANDOM person ids hashed to the same default avatar (`a07` / `a07`); two reruns passed 15/15 (`a21`/`a02`, `a07`/`a04`). The arm needs fixed person ids (or to pick ids with different defaults), else it fails roughly 1 run in the number of avatars. Told in the report to the owner.
**Limits:** words are English only; no click-through "what do I do" panel; the line is in the Team chip, not a badge on the Modeller's Team icon; `ERP` shows it after a visit/render, not the instant an op arrives; the indicator reflects verdicts (it does not itself fetch a missing set).

---

## §34 THE THIN-PIPE PRINCIPLE — the main lesson of the Unicenta integration, as the owner states it (2026-10-25: *"ActiveMQ is just a dumb post office. The main lesson as you noted how minimalist record IDs is enough to give functional flow. Each browser is model rich with loaded ERP functions. The main lesson is we can be thin pipe. And continuously workaround thin pipes, scalable, versatile."*) — DOCTRINE recorded + AUDIT of the build against it; the witness is PLANNED, nothing built
**The principle (FL-0, above FL-1..FL-5).** (a) The transport is a **dumb post office** — ActiveMQ's real role in the 2012 integration; here `put/get/list` on a shelf. (b) What crosses is the **minimum that identifies**: record ids, references, measures. (c) The intelligence is in **every browser, which is model-rich** (the ERP functions, the dictionary and the model layer are loaded locally), so the receiver *reconstructs* meaning, consequences and documents from the minimum. (d) Therefore a **thin pipe is enough**, and scale and versatility come from *continuously working around thin pipes* — spending engineering on sending fewer bytes and deriving more locally — not on a fatter pipe or a smarter server. Measured thin pipes we already live with (§14): the GitHub pipe ≈ 31 devices per account at one Visit / 15 s, the web relay ≈ 100.
**AUDIT — where the build already follows it (evidence):** the relay is `put/get/list` only (`sim.js Relay`, `W-TREAT-*`); flows carry identity, references and measures, never descriptive text (FL-1; `W-FLOW-MINIMAL`: 6 of 60 columns); the base pin lets ids resolve locally (BASE, `W-BASE-*`); derived values are never copied (FL-2; `W-MESH-FOLD`: one fold hash on every member); a plan is tiny data (the Modeller's is 880 bytes, the ERP's 77 KB for 857 tables); a space pins its trust list in its genesis (public keys, a few hundred bytes).
**AUDIT — where it does NOT yet, stated plainly:** (1) **A document Complete ships its CONSEQUENCES.** In the recorded team cycles the Complete's op group carried `m_storagereservation` ×13 and `c_ordertax` ×13 next to the document's own `c_order` / `c_orderline` rows (`build/scriptor/observed_team_tables.json`). Those rows are *derived* by the model layer from the document and its status — and the oracle shows our model layer reproduces the real iDempiere footprint table by table (W-MODEL-ORACLE: 121 MATCH over 4 document kinds). Each peer's model layer could derive them; sending them is the fat-pipe habit. (2) **The ERP adapter shares whole-record field maps verbatim** (the engine's `CRUD_CREATE` fields), not a minimal `carries` list; the Flow Row's `carries` / ghost guard (FL-6) is not yet applied there. (3) **The ERP scope is a table set** (857 tables), the shape the Unicenta lesson says to leave behind for a flow (§16.0a).
**What this changes in my own earlier recommendation (G9, §30.2).** I built a candidate scope (709–730 tables) by ADDING the tables Complete writes as side effects (`m_storagereservation`, `m_storageonhand`, `t_fact_acct_history`, `m_attributeinstance`) because the heavy status quo ships them. Under the thin-pipe principle that is backwards: the narrowing that matches the thesis is **scope = user-authored tables only, consequences derived locally and never shipped** — *if* a second device can derive them. So the six-class document-action check I proposed is replaced by a sharper, falsifiable experiment (below), and the 709–730 candidate stays as the **fallback** if derivation proves impossible for some class.
**Planned witness `W-THIN-DERIVE` (SPEC ONLY; Node, whitebox, no browser; model layer + the oracle fixtures of `scripts/poc_model_layer_oracle.js`).** Device A completes a document and ships ONLY the document's own ops + the status intent (what the user did). Device B — same BASE hash, same model-layer version — applies the status itself by running `completeIt`. Arms: T1 for each of the 10 registered DocAction classes (X of N) the consequence rows B derives equal the rows A would have shipped, table by table, column by column after canonicalisation (device-local pks, timestamps and document numbers normalised by the SAME rules the oracle uses); T2 bytes: shipped bytes with consequences vs without (the saving, per class); T3 determinism preconditions named and tested — document-number allocation (station-owned ranges, §13.12.F), timestamps taken from the op not the clock, prices/taxes read from the base, idempotent re-run; T4 where B differs, the output is the exact table + column list ("NOT DERIVABLE YET: …") — never a bare FAIL; T5 version skew: B on a different model-layer manifest must REFUSE to derive (the versioning session's shape versions / `min_v`), not guess. *Mutants:* a consequence dropped from B's derivation · a clock read inside the derivation · a skewed manifest accepted. **Risks stated:** derivation needs bit-identical model code (the BASE + manifest pin it); a class with an external lookup (a price list that changed) is not derivable from the document alone; ledger postings (Fact_Acct) are derived on each member already (FL-2) — they are the first proof that the pattern works.
**Status:** doctrine recorded; audit done from existing logs; `W-THIN-DERIVE` waits for the owner's go (it touches no shipped code — it is a read-only experiment over the model layer).

---

## §16.35 An admin PUBLISHES signed upcaster sets; devices adopt them on their next visit (2026-10-25; user: *"yes"* to "build the missing piece, so an admin can publish a signed rule and waiting devices pick it up"; SPEC BEFORE CODE)
**Issue.** Today a set only arrives through the host's own config (`TEAM_UPCASTERS`). A device that shows "N changes wait for a translation rule from the team admin" has no way to get the rule short of a new app build. J.2 said sets travel "through the policy pipe directory".
**Design decision (and why it differs from J.2's wording).** The set rides INSIDE the POLICY op: `params.upcasters = [signed set, …]`. Not a new pipe prefix. Reasons, each checkable: (1) POLICY is already admin-only (a non-admin POLICY is `REFUSED not-admin`), epoch-ordered, and folded at the same log position on every device — exactly the "same verdict on every device" property the sets need; (2) it needs no fetch protocol, no new object names, no reference-gate change, and travels in the bundles devices already exchange; (3) `min_v` already lives there. **Trust is two-keyed on purpose:** the POLICY envelope proves an enrolled ADMIN DEVICE published it; the set itself must still carry the owner's signature verified against the space's pinned trust list (`TEAM_PLAN_TRUST`, genesis-pinned since #2375) — a stolen online admin device cannot introduce a mapping that rewrites stored data.
**Rules.** 1. `policyProblem`: `upcasters` optional; if present an array of at most 16 objects, each `{kind:'upcasters', op:<string>, steps:<non-empty array, at most 32>, signer:<object>, sig:<string>}` — else `bad-policy:upcasters`. The engine does NOT verify signatures or judge vocabulary (it has no trust list or registry); that stays with `OpVersions.loadSet`. 2. **Monotone:** a later epoch must contain every set of the epoch in force (compared by canonical JSON); dropping or editing one -> `REFUSED upcasters-dropped`. Reason: devices that already loaded a set keep it (the registry never unloads), a fresh device would not have it — they would diverge. 3. Host glue `TeamVersions.adopt(store)` (called by both hosts right after `pinTrust()` in `visit()` and at boot, before the first fold): reads `store.policy()`, loads each `params.upcasters[i]` not yet loaded (`loadSet`, same verifier as config sets: unsigned / untrusted / edited are refused and logged `§TEAM_VERSIONS_SET … refused:<reason>`), and if at least one set was newly loaded calls `store.refold()`. A refused set is remembered by its canonical hash and not re-tried every visit (a set refused because the trust list was not yet known is retried when the trust list changes: the memo is dropped whenever `TEAM_PLAN_TRUST` differs from the one used). 4. Host API `TeamVersions.publish(store, sets)` (admin only by the engine's rule): builds the next POLICY = the previous params + `epoch+1` + `upcasters = previous ∪ sets` (deduplicated by canonical JSON); returns the authored op; hosts export `publishUpcasters(sets)` which publishes then visits. 5. Sets from config and sets from POLICY go through the same `loadSet`; `step-conflict` still refuses a redefinition.
**Witness arms.** *Engine* (added to `scripts/witness_comm_versions.js`): **C8** POLICY `upcasters` accepted and returned by `store.policy()` on every device; malformed (`'x'`, an element without `steps`, 17 sets) -> `bad-policy:upcasters`; non-admin -> `not-admin`; a later epoch that drops a set -> `upcasters-dropped`, one that keeps it and adds another -> MERGED; control: policies without `upcasters` behave as before. *Host* (added to `W-VERSIONS-MODELLER`, then `W-VERSIONS-ERP`; real Chromium, TWO browser contexts A (admin, founder) and B (joiner approved by A) on one folder pipe, both at shape 2, trust list = the owner key): **P1** an older peer's op (no `sv`) on B with no set is PARKED `needs-mapping`, B's chip says "wait for a translation rule from the team admin", the op is NOT in B's model · **P2** A publishes the owner-signed set through `publishUpcasters`; after B's next visit B's op is MERGED and folded in the v2 shape, B's model gains the element, B's chip is clear (`data-versions="ok"`), and B's stored envelope is untouched · **P3** an UNSIGNED set published by the admin is refused by B (`refused:unsigned`), the op stays parked, the chip still says translation rule · **P4** a set signed by a key outside the trust list: `refused:untrusted-signer`, same outcome · **P5** B (not admin) calling `publishUpcasters` produces no effect: its POLICY is REFUSED `not-admin` on both devices, nothing adopted · **P6** a fresh device C that joins AFTER the publish adopts the set on its first visit and folds the old op (the set travels with the log, no fetch needed) · **P7** 0 page errors. **Mutants:** `adopt` never called by the host -> P2 · `adopt` skips verification (loads sets straight from the policy) -> P3/P4 · `publish` drops the previous sets -> P6 and the engine C8 · engine monotone rule off -> C8 · refold not called after loading -> P2.
**Limits stated before building:** no admin UI (an API; a form for it is a later step); the owner signs a set offline with whatever produces the plan signature today — there is no CLI for sets yet (the witness signs with WebCrypto in node, the same scheme as `TeamScope.verify`); a set for an op type the host did not register still loads but folds nothing; at most 16 sets per space until the first real use shows what is needed.

### §16.35.1 STATE AT WRAP-UP + RESUME (2026-10-25, user: *"wrap up, resume in new session"*) — my lane is §16.30-§16.35; edit only these numbers
**DONE and merged:** engine versioning in comm (bim-ootb #2373), Modeller host (#2376), ERP host (#2380), Team-chip indicator (#2381); bim-compiler commits a3c959036, 02300c9ef, 8e86b4ea7 (all pushed on `fable/meshdb-livewire`).
**DONE, pushed, NOT merged (the only open thing):** admin-published signed upcaster sets (§16.35).
- Engine half, bim-compiler `8e86b4ea7`: `comm_roster.js` — POLICY `upcasters` validated (`bad-policy:upcasters`) and monotone (`upcasters-dropped`). `scripts/witness_comm_versions.js` **PASS 31/0, mutants 9/9** (a mutant that crashes the fold counts as killed: harness change). Re-run after the change: the 15 older `witness_comm_*.js` unchanged (same verdict/green count/0 red), `witness_comm_plantrust.js` PASS 23.
- Host half, bim-ootb branch **`feat/versions-publish`** @ b8b2ef89 (pushed, NO PR opened, auto-merge NOT enabled): `common/comm/team_versions.js` (`adopt(store)`, `publish(store, sets)`, `load` idempotent), `common/comm/comm_roster.js` (byte-identical copy of `8e86b4ea7`, sha256 5026115b34ad), `erp/team_sync.js` + `modeller/team_sync.js` (`adoptSets()` right after `pinTrust()` in `visit()` and at boot; `publishUpcasters(sets)` export), `erp/idempiere.html` + `modeller/modeller.html` (`team_versions.js?v=4`), `erp/sw.js` v912, `modeller/sw.js` v167, NEW `modeller/tests/witness_team_publish.js` (**W-PUBLISH-MODELLER PASS 12/0, mutants 4/4**) and `erp/tests/witness_team_publish.js` (**W-PUBLISH-ERP PASS 12/0, mutants 4/4**): three Chromium devices — A admin, B approved joiner, C joins after the publish; arms P0-P7 as in §16.35 (the engine refuses an UNSIGNED set outright; a set edited after signing is merged into the policy but B refuses it `bad-signature`; untrusted signer refused; non-admin publish refused `not-admin`; C adopts on its first visits; ONE visit by B is enough, which is what kills the "no refold" mutant).
**NOT YET RUN on that branch:** the host regression suite (it was killed at the user's wrap-up). Run these from a worktree of the branch (`cd ~/bim-ootb && git worktree list` first; reuse, do not duplicate; `git worktree add /tmp/wt-adopt origin/feat/versions-publish --detach` if gone) and expect: W-VERSIONS-ERP 29 (passed on the branch, mutants 8/8) · W-VERSIONS-MODELLER 27 (8/8) · W-TEAM-DOCACTION 24 · W-BASE-EDIT 22 · W-TEAM-DESKTOP 9 · W-TEAM-PILL 14 · W-TEAM-SO 19 · W-PLAN-ERP 17 (open 1) · W-PEOPLE-STRIP-ALL 29 · W-TEAM-MODELLER 33 · W-PLAN-MODELLER 12 · W-PEOPLE-MODELLER 22 · W-TEAM-ICON-MODELLER 15 (**flaky**: it fails ~1 run in the number of default avatars when the two random persons collide, e.g. `a07`/`a07` — rerun before blaming the change).
**Next steps, in order:** (1) run the suite above; (2) `gh pr create --repo red1oon/bim-ootb --head feat/versions-publish` (body: the evidence lines of this section), `gh pr merge <n> --auto --squash`, verify it landed (`gh pr view`), then remove the worktree and delete the local branch; (3) message the other session (name `bim-compiler-02`, via `ListAgents`/`SendMessage`): its future POLICY `planTrust` add/rotate change in `comm_roster.js` waits for my merge, and it will re-diff `common/comm/comm_roster.js` against origin/main first; (4) append the merged PR number and any suite deviation to this section.
**Open items that are NOT scheduled (mine):** (a) no admin UI to publish a set (`publishUpcasters` is an API); no CLI to sign a set (the witnesses sign with WebCrypto in node, the same scheme as `TeamScope.verify`: canonical JSON of the set without `sig`/`signer`, ECDSA P-256/SHA-256, hex) — write one next to the plan signer, with the owner key kept offline; (b) design wart: a published set can never be dropped (monotone rule) so a mistaken set stays in the policy forever and 16 is the cap — a "revoke / supersede" design is needed before real use; (c) `trustCheckpoints:true` light clients skip the version judgement for the frozen prefix (untested, unfixed); (d) the ordering "sets loaded before the first fold" (host `boot()` awaits `TeamVersions.ready`) has no mutant of its own; (e) the indicator is English only, one line in the chip, no click-through help, no badge on the Modeller's Team icon; (f) the ERP witness's rename targets a column only the legacy op carries (proves the mechanism, not a real ERP schema change); SET_STATUS / CRUD_DELETE are registered but no arm authors them under a bump; (g) **the two films still say versioning is "design only, nothing built"** — stale since §16.30; the user said NO more re-render, so do not touch them unasked; (h) **novelty is NOT established**: §16.33 lists the closest prior art found (DefraDB Lens, Cambria, PowerSync, WatermelonDB, Axon, Matrix room versions, Replicache); an extended search plus reading the DefraDB and Cambria specs must come before anyone writes "first"; (i) process slips to avoid: §16.33 was written AFTER its code (spec-first skipped); the first indicator run measured DOM rows without a baseline visit (found by the witness). **Shared-tree notes:** `bim-compiler-02` also edits `common/comm/*` and the hosts' `team_sync.js` (genesis trust list, merged #2375/#2377/#2378) — always `git fetch` and re-diff before a copy PR; `erp/sw.js` and `modeller/sw.js` are conflict magnets (keep both precache additions, take the HIGHER version).

### §16.35.2 TAKE-OVER RESULT (2026-10-25, session `bim-compiler-cc`; owner: *"No other session is restarted as all will consolidate to this session to take over"*) — §16.35.1 steps 1-4 closed
**Step 1, host regression suite on `feat/versions-publish`** (worktree `/tmp/wt-adopt`, logs read in full): W-PUBLISH-ERP 12/0 mutants 4/4 · W-PUBLISH-MODELLER 12/0 4/4 · W-VERSIONS-ERP 29/0 8/8 · W-VERSIONS-MODELLER 27/0 8/8 · W-TEAM-DOCACTION 24 · W-BASE-EDIT 22 · W-TEAM-DESKTOP 9 · W-TEAM-PILL 14 · W-PLAN-ERP 17 (open 1, plan unsigned) · W-PEOPLE-STRIP-ALL 29 · W-TEAM-MODELLER 33 · W-PLAN-MODELLER 12 · W-PEOPLE-MODELLER 22 · W-TEAM-ICON-MODELLER 15 (no flake this run) — all 0 fails, 0 page errors.
**The one deviation: W-TEAM-SO 18 + 1 INCONCLUSIVE (expected 19), caused by this branch, not chance.** Arm `§TEAM-CL1 defect precondition` (the §12.1 "pk numbers are not portable" observation). Measured: branch 3/3 runs INCONCLUSIVE, `origin/main` 3/3 PASS 19; bisect with `adoptSets()` switched off on the branch → 19/19. Mechanism: synthetic pk = −(position in `S.foldable()` order) (`erp/team_sync.js` `project()`, `var id = ++base`); with no set published `adopt()` only adds await ticks at boot and in `visit()` (`pinTrust()` has already called `cur()`, `policy()` has no side effect), which shifts when ops are authored relative to visits and so the fold positions — on main A's ids step by 2 and overlap B's (collision form), on the branch two are adjacent and never overlap. Final values, the conflict text and the 18 other arms are identical. **Fix (witness, not host):** the arm claimed non-portability but only counted the timing-dependent collision form; it now also counts the MOVED form (same record, different pk on A and B — present in all 9 runs) and logs `§TEAM-CL1 pk portability: collision=N moved=M`. Re-run: main 19/19 (collision=1 moved=3), branch 19/19 (collision=0 moved=3). Still INCONCLUSIVE when both devices number every record identically. bim-ootb `6c05e3c2`.
**Step 2:** bim-ootb **PR #2382 MERGED** (`5f484524`, fast-checks + e2e-tests green; `common/comm/comm_roster.js` on main = sha256 5026115b34ad = bim-compiler `8e86b4ea7`); worktrees `/tmp/wt-adopt` + `/tmp/wt-main-so` removed, local branch deleted. **Step 3:** void — no other session runs; this session owns both lanes (§16.30-§16.35 and §22-§34), so the plan-trust add/rotate item (RESUME block item 2) is mine and is unblocked once #2382 is on main.

## §35 Add / rotate a plan-trust key by a signed POLICY op (2026-10-26; owner: *"go on"* after the take-over report named this as the unblocked next item; Q1 decision: *offline owner key, public key pinned in the genesis, primary + backup, rotation by POLICY op*; SPEC BEFORE CODE)
**Issue.** The plan trust list (§33) is fixed at the genesis: a lost or leaked primary key can only be survived by re-founding the space. The Q1 decision says rotation rides a POLICY op; nothing builds it.
**Design.** An optional `params.planTrust` on POLICY = a **rotation statement** `{kind:'plan-trust', keys:[1-3 public P-256 JWKs, same rule as the genesis list], prev:<sha256 hex of the canonical list in force>, signer:<public JWK>, sig:<hex>}`; `sig` is ECDSA P-256/SHA-256 over the canonical JSON of the statement without `sig`/`signer` — the SAME scheme and the SAME signer as plans (`build/scriptor/sign_plan.js sign()`), so the owner signs it offline with the key they already hold. **Two-keyed, like §16.35:** the POLICY envelope proves an enrolled ADMIN device published it; the statement must be signed by a key IN THE LIST IN FORCE (primary or backup). A stolen online admin device alone cannot change the list; a lost primary is replaced by the backup signing `[backup, new]`.
**Rules (engine, `comm_roster.js`).** 1. `policyProblem`: if `planTrust` present it must have exactly that shape (keys pass `planTrustProblem`, signer is one valid public key, `prev` 64 hex, `sig` a hex string) — else `bad-policy:planTrust`. 2. The roster fold keeps a trust state: starts at the genesis list (or none). For an accepted POLICY carrying a statement: **(a)** the same statement as the last one applied (canonical JSON equal) = carry-forward, no change (so a POLICY built by copying the previous params — `TeamVersions.publish` — still works); **(b)** otherwise, in this order: no list in force → `plan-trust-unpinned` (a space founded without a list cannot gain one by POLICY: that would let an admin device pin its own key); `prev` ≠ hash of the list in force → `plan-trust-stale` (an old statement cannot be replayed after a later rotation); signer not in the list in force → `plan-trust-untrusted-signer`; signature invalid → `plan-trust-signature`. Any of these REFUSES the whole POLICY. 3. The new list takes effect ONLY if the whole POLICY is accepted (a statement inside an `epoch-stale` / `upcasters-dropped` / `min_v-lowered` POLICY rotates nothing). 4. A POLICY WITHOUT `planTrust` leaves the list in force unchanged: omitting is not dropping; a key leaves the list only by a signed statement. 5. The fold returns `planTrust` = the list in force (was: the genesis list), plus `planTrustEpoch` (0 = genesis, else the POLICY epoch that set it). New export `ROS.planTrustHash(list)` (async) so a tool can fill `prev`. Signatures are verified once before the walk (memoised like the envelope signatures); membership and `prev` are judged in fold order, so every device that holds the same ops gets the same list.
**Hosts:** no code change expected — `pinTrust()` already re-reads `store.planTrust()` after each Visit and re-verifies the plan when the list differs; `TeamVersions.adopt` drops its refusal memo when the list changes. Proven by a Node arm in the hosts witness, not assumed.
**Witness arms (extend `scripts/witness_comm_plantrust.js`, real `build/comm/*`, the compiler's own signer; RED first: today a POLICY with `planTrust` is accepted and ignored).** **T6 ROTATE** a statement signed by the primary K0 adding K2 → POLICY MERGED, `planTrust()` = [K0,K1,K2] on the founder AND on a joiner that received the ops, `planTrustEpoch` = that epoch · then the BACKUP K1 signs `[K1,K3]` (primary dropped) → MERGED; with the real reader a plan signed by K0 is now `untrusted`, by K3 `ok`. **T7 REFUSE** (each REFUSED with its reason and the list unchanged): signer outside the list · keys edited after signing (`plan-trust-signature`) · the first statement replayed after the second (`plan-trust-stale`) · keys carrying a private `d` (`bad-policy:planTrust`) · a valid owner-signed statement published by a NON-admin device (`not-admin`) · a space with no genesis list (`plan-trust-unpinned`) · a valid statement inside an `epoch-stale` POLICY rotates nothing. **T8 CARRY** the next POLICY repeating the applied statement → MERGED, list unchanged; one omitting `planTrust` → MERGED, list unchanged. **T9 ORDER** a second joiner ingesting the same ops in reverse arrival order returns the same list. *Mutants:* membership check off → T7 · signature check off → T7 · `prev` check off → T7 (replay) · rotation never applied (genesis list returned) → T6 · omitting = dropping → T8 · rotation applied before the POLICY's other checks → T7 (epoch-stale) · each must prove it applied (§33.4). **Host arm** (`witness_scriptor_hosts.js`, both hosts, real engine): after a rotation POLICY and a Visit, the host's `§TEAM_PLAN_SIG` re-verifies under the new list — a plan signed by the dropped key closes the scope, a plan signed by the added key opens it.
**Limits stated before building.** (1) **Sets already loaded stay loaded:** an upcaster set signed by a key that a later rotation drops stays in the registry of devices that loaded it, while a fresh device refuses it → those devices fold that op differently. Same family as §16.35.1 (b) (no revoke/supersede); needs the set verified against the list in force AT the POLICY that published it — not in this step. (2) No CLI to build a statement (a tool computes `prev` with `ROS.planTrustHash` and signs with `sign_plan.js sign`); no admin UI. (3) A space founded with no list cannot gain one (re-found it). (4) Light clients with `trustCheckpoints:true` take the frozen prefix's roster as given (same as every other roster fact).
### §35.1 RESULT — ✅ DONE (witness, 2026-10-26): the plan trust list rotates by an owner-signed POLICY statement (engine); both hosts follow with no host code
RED first: `build/scriptor/plantrust_rotate_RED_before.log` — a POLICY carrying a statement was MERGED and IGNORED (list stayed the genesis one, `planTrustEpoch` undefined, no refusal reason existed): 12 red arms. After: **`scripts/witness_comm_plantrust.js` `§PLANTRUST_VERDICT PASS judged=45 fails=0`** (`build/comm/logs/witness_comm_plantrust.log`; T1–T5 unchanged + T6–T9). **T6** primary K0 signs [K0,K1,K2] → MERGED on founder and joiner, both return the 3-key list, `planTrustEpoch=1`; then the BACKUP K1 signs [K1,K3] (primary dropped) → MERGED; with the REAL reader a plan signed by K0 is now `untrusted`, by K3 `ok` · **T7** each REFUSED on both devices, list unchanged: signer outside the list `plan-trust-untrusted-signer` · keys edited after signing `plan-trust-signature` · first statement replayed after the second `plan-trust-stale` · private `d` in keys `bad-policy:planTrust` · valid statement from the non-admin device `not-admin` · valid statement inside an `epoch-stale` POLICY rotates nothing · a space founded with no list `plan-trust-unpinned` · **T8** the same statement in a fresh epoch MERGED (control) · copied forward again → MERGED, list and `planTrustEpoch` unchanged · a POLICY omitting `planTrust` → MERGED, list kept · **T9** a third device ingesting the same 16 ops in REVERSE order returns the same 3-key list. **Mutants 13/13 killed** (5 old + 8 §35: membership off → T7/T8 · signature off → T7/T8 · prev off → T7 · unpinned may gain → T7 · shape off → T7 · never applied → T6/T7/T8 · omitting drops → T8 · applied before the other checks → T6/T7/T8). One old mutant's text anchor (`planTrust: planTrustOf(gen…)`) was replaced by this change; the witness reported `MUTATION DID NOT APPLY` (§33.4 rule working) and it was re-anchored.
**Hosts (Node, real engine, real adapters from bim-ootb `origin/main`):** `scripts/witness_scriptor_hosts.js` **PASS 51/0** (was 47): new **G7** for BOTH hosts — a running host open under genesis [K1]; a K1-signed POLICY rotates to [K2] (MERGED); the SAME host's next `pinTrust` re-verifies → the K1-signed plan is `untrusted` and the scope closes; a K2-signed plan opens. No host code changed; every earlier host mutant now also turns G7 red.
**Regression (engine changed, all logs read):** base 36 · checkpoint 43 · cl1_uu 23 · cl2_order 12 · cl3b_github 8 · cl3_store 25 · cl4_admit 23 · cl5_conflict 12 · cl8_opaque 44 · docno_booking 15 · docno_modes 14 · gmail_log 5 · keyclaim 25 · policy 32 · space_scope 23 · versions 31 (mutants 9/9) — identical to the recorded counts.
**Engine diff:** `build/comm/comm_roster.js` only: `planTrustStmtProblem` (shape), `planTrustHash` (export, for a tool that fills `prev`), one `policyProblem` line, a pre-walk pass (statement signatures memoised like envelope signatures + list hashes), the trust state in `walk()`, the POLICY branch's 4 checks + apply-after-all-checks, fold returns `planTrust` = list in force + `planTrustEpoch`. `comm_store.js` unchanged.
**Residuals, stated:** (1) the hosts' log line still says `trust=genesis(n)` after a rotation (the list is right, the word is not) — cosmetic, bim-ootb host text; (2) the §35 limit (1) stands: an upcaster set signed by a key a rotation later drops stays loaded on devices that loaded it → those devices and fresh ones fold that op differently; (3) no CLI to build a statement yet (compute `prev` with `ROS.planTrustHash`, sign with `sign_plan.js sign`).
**Copy + browser suite:** bim-ootb **PR #2383 MERGED** (`8b070c84`, fast-checks + e2e-tests green; `feat/plantrust-rotate`, `common/comm/comm_roster.js` sha256 8f88ab8164c0 = this repo's, sw v913 / v168). Team browser suite run on that branch, logs read: W-PUBLISH-ERP 12 · W-PUBLISH-MODELLER 12 · W-VERSIONS-ERP 29 · W-VERSIONS-MODELLER 27 · W-TEAM-DOCACTION 24 · W-BASE-EDIT 22 · W-TEAM-DESKTOP 9 · W-TEAM-PILL 14 · W-TEAM-SO 19 (collision=2 moved=3) · W-PLAN-ERP 17 (open 1) · W-PEOPLE-STRIP-ALL 29 · W-TEAM-MODELLER 33 · W-PLAN-MODELLER 12 · W-PEOPLE-MODELLER 22 · W-TEAM-ICON-MODELLER 15 — 0 fails, 0 page errors.

## §36 `W-THIN-DERIVE` — build spec (2026-10-26; owner: *"go on"* = the go §34 waited for; read-only experiment, no shipped file touched; SPEC BEFORE CODE)
**Question (from §34).** When device A completes a document, can device B — same BASE, same model-layer code — DERIVE the Complete's consequences from the document's own rows + the intent (`CO`), instead of receiving them? Answered per DocAction class, X of N, N = the model layer's own registry `ML.DOCS` = **10** (`c_order m_inout c_invoice c_payment c_allocationhdr m_movement m_movementconfirm m_inventory m_rma dd_order`).
**Harness decisions (measured before writing this, scratch probes).** (1) **BASE = the shipped ERP seed** `erp/ad_seed.db` + its self-heal patch (`scripts/bridge/ad_shipped_fixture.js loadShipped`) — the very base a team pins; the §34 text named the oracle prestate, but that needs the `idempiere_pilot` postgres (down) and is not what devices sit on. Each device = its own `serialize()` copy + UDFs. (2) **Derivation function = `ML.run(query, env, {table, timing:'DOCACTION', id, action:'CO'})`** — returns the Complete's op group as data (the group the pipe ships today); measured on the seed: GardenWorld order 100 → 54 ops (shipment, storage, transaction, cost detail, 4 sequence updates…), 104 → 20 ops (reservations, order tax). (3) **The draft document = a CLONE of a seed document of that class** (header + lines, new ids, status columns reset to a draft: `DocStatus=DR, DocAction=CO, Processed=N, Posted=N, IsApproved=N, ProcessedOn=0` where the column exists, plus the oracle's per-line resets) — identical rows on A and B except the ids, which models "B received the document's own rows". Source documents are taken in seed order; the first whose Complete succeeds on A is used (tries logged). Line tables: a fixture map checked against the schema (`<line>` must carry `<header>_id`). (4) **B differs from A only by what a real second device would differ by:** its own local ids (a different allocator start; the draft rows carry B's ids), and, per variant, its own clock and its own advanced document sequences.
**Comparison.** A's group vs B's group, op by op: same `op_type`, table, target (A's document/line ids mapped to B's), and every field/change value after normalisation (`__opRef` refs compare as refs; numbers to 1e-6). Generated `*_uu` values are NOT compared but COUNTED (the host mints them at random: a derived row gets a different uu on each device — named as a precondition, below). Output per class: `MATCH` · or `NOT DERIVABLE YET: table.column, …` (the exact list, never a bare FAIL) · or `INCONCLUSIVE: <why>` (no seed document of the class, the table is not in the base, no source completes on A).
**Arms.** **T1** per class, variant SAME (B given A's clock and A's sequence state): MATCH or the column list. **T2** bytes per class: today's shipped group (document rows + Complete group) vs thin (document rows + `{table, uu, action:'CO', ts}`), JSON bytes. **T3** preconditions, each named and measured: (a) CLOCK — B on its own clock: which columns change; (b) DOCNO — B's sequences advanced by one document: which columns change; (c) RE-RUN — a second `CO` on A after applying its group changes nothing (refused or 0 ops); (d) ORDER — B run before A gives the same comparison (no hidden model-layer state between devices); (e) UU — count of generated uu per class (must become deterministic, e.g. derived from the document uu + op index, before thin derivation can ship). **T4** = the column lists of T1/T3. **T5** version skew: there is NO mechanism today by which B can tell that A's model layer differs (no manifest on the intent) — reported `OPEN (not built)`, never PASS. **Comparator mutants** (each must turn the affected class away from MATCH): one op dropped from B's group · one value altered in B's group · B's clock shifted without telling the comparator.
**Verdict line:** `§THIN_VERDICT EVIDENCE judged=<classes judged> derivable=<X>/<N> notDerivable=[…] inconclusive=[…] mutants=<k>/3` — EVIDENCE, not PASS: the experiment informs the G9 scope decision (§30, §34), it does not gate a build. Log: `build/scriptor/witness_thin_derive.log`.
**Not in this step:** changing any host to ship thin groups; deterministic uu; a manifest on the intent (T5).
### §36.1 RESULT — EVIDENCE (2026-10-26): **7 of 10 DocAction classes are derivable** by a second device from the document rows + the intent; 3 inconclusive, 0 not derivable
`scripts/witness_thin_derive.js` → `build/scriptor/witness_thin_derive.log`: **`§THIN_VERDICT EVIDENCE judged=7 derivable=7/10 [c_order,m_inout,c_invoice,c_payment,m_movement,m_inventory,m_rma] notDerivable=[] inconclusive=[c_allocationhdr,m_movementconfirm,dd_order] mutants=3/3`** (bim-ootb model layer @ 5f484524, 13/13 model modules, BASE = shipped `erp/ad_seed.db` + patch).
**T1 SAME (B given A's clock + sequence state):** every judged class MATCH op for op and column for column, with B on its OWN local ids — order 100: 54 ops (order tax, shipment + line + MA, storage, transaction, cost detail/history/cost, 4 sequences …); shipment 26; invoice 24 (incl. the generated payment + allocation + 14 Fact_Acct); payment 6; movement 15; inventory 5; RMA 3. **Inconclusive, named:** `c_allocationhdr` — both seed allocations fail validation when cloned (their invoices are already allocated); note the invoice class's group CREATES an allocation and that group matched · `m_movementconfirm` — no document in the base · `dd_order` — table not in the base.
**T2 BYTES (today = document rows + Complete group; thin = document rows + `{table, uu, action, ts}`):** order 30,700 → 3,216 (−89.5%) · shipment 13,735 → 2,431 (−82.3%) · invoice 14,235 → 2,635 (−81.5%) · movement 11,116 → 1,607 (−85.5%) · inventory 2,947 → 1,326 (−55.0%) · payment 4,667 → 2,097 (−55.1%) · RMA 1,712 → 1,046 (−38.9%). *(Corrected 2026-10-26: the first run's per-class percentages were the Complete group's share of today's bytes, not the net saving 1 − thin/today — found by the film agent, §37; the witness now prints the net figure; bytes and the total were right.)* All 7: **79,112 → 14,358 bytes (−82%)**.
**T3 preconditions — what a thin intent MUST carry, measured (this is the build list if the owner wants it):** (a) **CLOCK:** only `processedon` depends on the device clock (order, movement, inventory) → the intent carries A's `ts`, B derives with it; no Fact_Acct / document date moved. (b) **DOCNO:** documents GENERATED by a Complete take numbers from the device's sequences — order: `m_inout/c_invoice/c_payment/c_allocationhdr.documentno` (+ `fact_acct.description`, `c_allocationhdr.description`, `ad_sequence.currentnext`); invoice: payment + allocation numbers. With station-owned ranges (§13.12.F) B would number them differently → **the intent must carry the numbers A allocated** (a few strings). (c) **RE-RUN is NOT a no-op:** a second `CO` on a completed document CLOSES it (movement, inventory, RMA → `docstatus=CL`; shipment, invoice → `docaction='--'`; order and payment refuse because CL is not implemented). **This is legacy behaviour, not a twin divergence:** iDempiere `DocumentEngine.java:272-276` falls back to the document's own DocAction (CL after a Complete) when the requested action is not valid. → a thin intent MUST be guarded by its from-status (`DR/IP → CO`; the team op's `SET_STATUS {from, to}` already carries both — derivation must enforce it, never re-run blindly). (d) **ORDER:** B completing before A gives the same comparison in all 7 → no hidden model-layer state between devices. (e) **UU:** a Complete mints 1–3 uu per document (order 3, movement 2, inventory 2, shipment/invoice/RMA 1, payment 0) through `env.uuid`; the host mints them at random → a derived row would carry a DIFFERENT uu on each device, and any later op addressing it (edit a generated shipment) would not resolve → **generated uu must be deterministic** (e.g. a hash of the document uu + the op index) before thin derivation can ship. **T5 SKEW: OPEN (not built)** — the intent carries no model-layer manifest; a B on different model code would derive silently.
**Comparator mutants 3/3:** one op dropped → 7/7 classes turned · one value altered → 7/7 · B's clock shifted unannounced → 3/7 (exactly the 3 classes whose group writes `processedon` — the other 4 have no clock column, so they correctly stay MATCH).
**What this means for G9 (§30/§34), stated for the owner, not decided:** the thin-pipe scope (user-authored tables only, consequences derived) is FEASIBLE for the 7 judged classes on the shipped base, at −82% bytes, IF four things are built first: (1) intent = `{from, to, ts, allocated docnos}` with a from-status guard; (2) deterministic generated uu; (3) a model-layer manifest on the intent + refusal on mismatch (T5); (4) the 3 inconclusive classes judged (an allocation built from fresh documents; a movement confirm generated by a movement with a confirm doctype; `dd_order` needs its table in the base). Until then the shipped 857-table scope stays; the 709–730 candidate (§30.2) stays the fallback.
**Limits:** one source document per class (the first that completes); the clone is the document's FINAL rows reset to draft, not a user's entry path; single process (module-level state is shared — the ORDER arm is the check that this did not matter); the model layer's posting is on (`fact_acct` in the groups), so the ledger lines were derived too.

### §36.2 Team user guide brought up to date (2026-10-26; owner: *"update the user guide."*) — bim-ootb **PR #2384 MERGED** (`42e106e6`, fast-checks + e2e green; `erp/sw.js` v914; LIVE — fetched https://red1oon.github.io/bim-ootb/erp/team_guide.html: 7,147 bytes, new sections present, live sw v914)
`erp/team_guide.html` (the panel's **Team guide** link — shared panel, so ERP and Modeller users both reach it) had not changed since #2355 (2026-10-24). Updated against the code on `origin/main`, every quoted button/message checked verbatim in `team_panel.js / team_people_ui.js / team_sync.js / team_versions.js / comm_store.js` (36/36). **Added:** setup as the panel does it now (Start a team → invite link → Join → device code → Check join requests → role → Approve → Visit; Your avatar) · *Who is on what* (People list; My role scope / Everyone — ERP only, the Modeller shows everyone; "Don't show what I'm on"; the ERP's "<name> is editing this" note) · *What the chip tells you* (devices, approval, delivery counters, the BASE mismatch text and its effect, newer-app / translation-rule / retired-version messages from §16.34, local-only) · *For the team admin* (signed translation rules §16.35; trusted keys §33/§35 — "written into the team when the app is set up with signing keys", changed only by a change signed with a key already trusted; no buttons yet). **Corrected (were stale):** demo-data edits ARE shared (#2365) and stock reservations ARE shared (`M_StorageReservation` is a plan flow); document numbers are per device (`AD_Sequence` is LOCAL in the plan; BOOKING exists in the engine but no host calls it) — two devices can give out the same number. **Not done:** screenshots (the guide stays text-only, as #2355 shipped it); the thin-pipe result (§36.1) is not in the guide because nothing user-visible changed.

### §37 Film — "Trust and the thin pipe" (English), 2026-10-26 (owner: *"If there's enough to make an additional film too. Use the beautiful chapter color schema … a better schema before this that we did for civil works. launch an agent to do this."*) — built by a Sonnet agent; checked here
**File:** `~/Videos/TeamTrust_and_ThinPipe_EN_2026-10-26.mp4` — 1920x1080, 24 fps, **377.71 s (6:17.7)**, 9,065 frames (= the silent source), 18,582,229 bytes (ffprobe re-read here: h264 + aac, 377.708 s). Two-voice English (Kokoro, F asks / M explains), captions burned in. Built from `scripts/film_replication_engine/film5/` (new subfolder inside the folder that was already untracked; no tracked file edited; cards only, Chrome `--disable-gpu`, `nvidia-smi` showed 0 compute processes before recording). No other film touched.
**Colour scheme = the Civil Works chapter cards**, extracted from `prompts/film_ch0_card_v7.py`, `film_earthworks_clip_cards.py`, `film_health_card.py` and confirmed by pixel sampling of `Civil_Works_Road_Report_narrated_AFTER.mp4` / `CivilWorks_ch_speed_zones_BEFORE.mp4` (±6): ground #080A0E · panel #1A1A19 · muted #6B6A63 · "Chapter N" kicker/secondary #C3C2B7 · title #FFFFFF · accent rule #4FC3F7 (8 px at x=96) · sub-text #FFEB3B · good #0CA30C · warn #FAB219 · refused #FF8C1A (table with file:line in `film5/palette.json`). Not in those two films: yellow/amber/orange/blue (from the other card scripts); Road Report body text measures (220,220,217) with no script in the repo, so #C3C2B7 is used; the older coral/off-white trailer family (`film_title_cards.py:145`) not used. Cards fade 0.5 s in/out, held for their spoken lines.
**Content (4 chapters, 25 beats; every number regex-extracted from frozen copies of `witness_comm_plantrust.log`, `hosts.log`, `witness_thin_derive.log` and this file's §16.35–§36.1, with a line cite on each card):** Ch 1 admin-published signed translation rules (#2382) · Ch 2 trusted-key rotation by a signed statement (#2383; 45/0, 13/13, 7 refusals, hosts 51/0) · Ch 3 the thin pipe — EVIDENCE (7 of 10 identical; order 30,700 → 3,216 bytes; all 7 79,112 → 14,358 = −82%; the four things to build) · Ch 4 ledger (two merged, one evidence only; going thin is the owner's decision).
**Checks the agent ran (logs in `film5/logs/`):** 57 facts cross-checked against the frozen sources (a mismatch throws) · `§NUM_CHECK` 41 spoken numbers = 33 facts, 0 mismatch (2 controls detected) · layout 245 changed frames + 25 cards + 104 reveal states, 0 flagged (planted faults detected) · 167 on-screen digit tokens, 0 absent from the sources · 27 source-line cites, 0 dangling · 0 off-palette colours · contrast 471 runs, 0 below WCAG AA (lowest 3.65) · stage console/page errors 0 · narration fit 25/25 DETAIL, tone 0 WRONG · loudness I −16.4 LUFS, LRA 2.4, TP −1.4 dBFS · silencedetect (−40 dB, 2 s): only the 4.47 s end tail · speech onset vs cue ≤ 0.05 s · 69 captions, 0 outside the band · words check 163 texts, 0 hits (no "Jelapang", no "first/novel") · soft ASR 40/41 numbers heard (not a gate).
**Finding while building, FIXED here:** §36.1's per-class percentages were the Complete group's share, not the net saving — corrected above; `witness_thin_derive.js` now prints `saving=<net>% (net: 1 - thin/today)` and was re-run (verdict unchanged: 7/10, mutants 3/3). The film shows a percentage only for the order (−90%, net 89.5) and the total (−82%, net 81.9), both right.
**NOT done:** a listener's review of tone and pacing; reveals timed by fraction of each card, not word-synced; no Thai cut; the `scripts/film_replication_engine/` folder (all films of this lane) is still untracked — same as the films before it.

## §38 GAP REGISTER — solve before the next film (2026-10-26; owner: *"Hold the Thai film so we solve these first and do a better film with real mobile phone content mockup"*; work-to-zero, top to bottom, each item spec → witness → log read → ✅/⛔)
**Thai cut of §37: HELD** (agent stopped mid-build; no Thai mp4 written; its partial files `scripts/film_replication_engine/film5/th/{cards5_th.js, film5_record_th.js, mk_cards5_th.py, stage5_th.html}` kept, untracked). **Next film = after this register: a better film with REAL MOBILE PHONE CONTENT MOCKUPS** (the apps' own screens at phone size, not abstract cards) — storyboard written only when the register is done.
**The question that produced this list (owner):** *"The sending of text and DocAction within it, is this in line with Unicenta POS and the Replication engine?"* Answer given: DocAction as an intent derived by the receiver IS in line (FL-2; W-THIN-DERIVE 7/10); shipping the whole document text is NOT (FL-1, `carries`); the ERP plan as a table set is NOT (§16.0a); Unicenta's POSStation/Date/Order# key (§16.16a) answers the docno and generated-id gaps.
| # | Item | Source | Kind |
|---|---|---|---|
| G-1 | **W-THIN-CARRIES** — re-run the derivation with the message cut to identity + references + measures + codes (FL-1; descriptive text left in the base): real bytes, and does B still derive the same? names the user-typed text columns that would have to be carried | §34, §36.1, FL-1 | Node experiment |
| G-2 | Intent = `{from, to, ts}`, applied only from `from` (a replayed `CO` closes a document — DocumentEngine.java:272-276) | §36.1 T3(c) | engine/host rule |
| G-3 | Unicenta keys: document numbers as station/date/sequence (no clash, derivable); generated ids from document key + op position (same on every device) | §16.16a, §36.1 T3(b)(e) | engine/host rule |
| G-4 | Model-version tag on the intent; a mismatched receiver refuses instead of deriving | §36.1 T5 | engine/host rule |
| G-5 | Judge the 3 open kinds (allocation, movement confirm, DD order) | §36.1 | Node experiment |
| G-6 | ERP team plan as FLOW ROWS with `carries`, not a 857-table set | §16.0a, §34 audit 3 | scriptor |
| G-7 | Correctness: a translation rule signed by a key a later rotation drops stays loaded on old devices → verify each set against the trust list in force AT its publishing POLICY | §35 limit (1) | engine + host |
| G-8 | Offline signing tool for rules and key statements (build → sign → check; private key never in the repo) | §16.35.1 (a), §35.1 (3) | tool |
| G-9 | Supersede a published rule (cap 16, never withdrawable today) — spec first | §16.35.1 (b) | design |
| G-10 | Admin screen for rules / keys in the Team panel | §16.35 limits | UI — ⛔ waits for the owner's go on UI |
