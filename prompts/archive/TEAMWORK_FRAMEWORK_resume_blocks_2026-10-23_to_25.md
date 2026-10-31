# TEAMWORK_FRAMEWORK — resume blocks of 2026-10-23 … 2026-10-25 (archived 2026-10-26)
Moved out of `prompts/TEAMWORK_FRAMEWORK.md` unchanged (move, not delete) so the live file has ONE current resume block. Facts that are still useful here: the 2026-10-23 ids, accounts and Gmail post-box setup; the 2026-10-24 shipped-PR list.

## ▶ RESUME HERE — 2026-10-25 evening (REPLICATION ENGINE LANE; written by session `bim-compiler-02`; supersedes the §21 prompt and the two blocks below it for this lane)
**State (all merged/pushed; branch `fable/meshdb-livewire`; sections §22–§34 are this lane's log, written in order).** Engine `build/scriptor/*` (virtual tables, registrable treatments, mesh `audience: space`, `LOCAL`, `refs`, compile report, plan emitters, signing, sealing in the simulator); Flow Row pattern guide `docs/ReplicationFlowRows.md`; both hosts (Modeller, ERP) derive their scope from a compiled plan through ONE reader `TeamScope`, verify its signature before `ready`, and read the trust list pinned in the space GENESIS (engine `planTrust`). bim-ootb PRs merged: #2369 #2370 #2371 #2372 #2374 #2375 #2377 #2378 #2379. Owner decisions taken: git admin is mine (commit, push, PR `--auto --squash`, stage by explicit path); the ERP plan leaves out the 141 unreached dictionary views (857 tables); Q1 key custody = offline owner key, public key pinned in the genesis, primary + backup, rotation by POLICY op (rotation NOT built).
**Run the whole lane (all Node, no browser; expected verdicts):** `scripts/witness_scriptor_{s1 PASS 22, treat PASS 30 (11/11 mutants), registry PASS 18, virtual PASS 25, mesh PASS 25, dryrun PASS 13, patterns PASS 89, team_scope PASS 14, erp_plan PASS 15, modeller_plan PASS 5, sign PASS 17, hosts PASS 47, seal PASS 24, erp_scope EVIDENCE 14}.js` + `scripts/witness_comm_plantrust.js` PASS 23 + the 15 other `witness_comm_*.js` + the peer's `witness_comm_versions.js` PASS 25 (mutants 7/7). The three bim-ootb-reading ones (`team_scope, erp_plan, modeller_plan, sign, hosts`) read `origin/main` with `git show` (`git -C ~/bim-ootb fetch origin` first). **Owner rule: NO new Playwright** (CLAUDE.md whitebox-first); the pre-existing browser suite is the other session's to run.
**⚑ CONSOLIDATED (owner, 2026-10-25: *"No other session is restarted as all will consolidate to this session to take over"*): ONE session now owns BOTH lanes — replication engine §22-§34 AND event versioning §16.30-§16.35; the take-over result is §16.35.2 (end of file). The paragraph below is history.** **(HISTORY) TWO SESSIONS ARE WORKING ON THIS FILE AND THE COMM ENGINE (owner, 2026-10-25: *"another session is also working on it, we may take over what it is doing once it also wraps up — at a new session"*).** The other is `bim-compiler-68 [9352dd]` — EVENT VERSIONING: its sections are **§16.30–§16.35**, witnesses `witness_comm_versions.js`, `W-OP-VERSIONS`, `W-VERSIONS-MODELLER` (browser; its lane). Same shared checkout and same branch, so each push carries the other's commits — always stage by explicit path. **STATE OF THE VERSIONING LANE (updated at its wrap-up, owner 2026-10-25: *"wrap up, resume in new session"*; the engine-lane session `bim-compiler-02` has retired too, so the next session is an ENTIRELY NEW one and nobody is mid-edit):** versioning is merged through the Team-chip indicator (bim-ootb #2373, #2376, #2380, #2381). The last feature, admin-published signed upcaster sets, is split: the ENGINE half is committed and pushed (bim-compiler `8e86b4ea7`: `comm_roster.js` POLICY `upcasters` + `upcasters-dropped`; witnesses green, the 15 comm witnesses and your plan-trust witness unchanged); the HOST half sits on bim-ootb branch `feat/versions-publish` (pushed, **no PR, nothing merged**, host regression suite not yet run). **Nobody should edit `policyProblem()` or the POLICY branch of `comm_roster.js` (the plan-trust add/rotate item below) until that branch is merged — follow `§16.35.1` steps 1-4.** **TAKE-OVER:** the versioning session has wrapped: its resume list is **§16.35.1** (end of file). A new session adopts it under the same file-ownership rule (§18); there is no one to ask, so §16.35.1 is the whole hand-over.
**Open items of THIS lane, in order:** (1) ✅ **`W-THIN-DERIVE` RAN 2026-10-26 — 7/10 classes derivable, −82% bytes, four preconditions to build; §36.1. Owner decision G9 now has its evidence.** ⚠ **Reframed by FL-8 (UPS, §16.0a): one DocAction executor per document; the experiment is an audit/reproducibility result, not a design for every device to complete. Work list = §38 (hardened).** (history: §34, the owner's thin-pipe principle: a second device derives a Complete's consequences from document + status instead of receiving them; 10 DocAction classes; read-only Node experiment) — awaiting the owner's go; it decides the ERP scope (G9) more cleanly than §30. (2) ✅ **Add/rotate a plan-trust key by a signed POLICY op** — DONE 2026-10-26, §35 / §35.1, bim-ootb #2383 (history: follow its monotone pattern: a later epoch may add a key but not silently drop the founder's pinned keys). (3) ERP scope decision G9: 857 shipped; wider options and evidence in §30–§30.2. (4) Owner to retire the value arms of the two merged Playwright plan witnesses (`W-PLAN-MODELLER`, `W-PLAN-ERP`) — they overlap the Node witnesses. (5) §23 ideas register (1: inform-before-proceeding notes; 2: higher container) parked behind the multi-user HOLD. (6) §16.13 Q2–Q8, S2/S3, the film's `local-sale` → `local-action` rename (after the film is final), genesis-pinned trust boot-order is read-not-tested.
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


