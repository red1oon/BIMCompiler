# ⚠ DO NOT REMOVE — POSITIONING DELTA for the team layer (a delta to `docs/StrategicIndustryPositioning.md`, never a second paper)
**The canonical positioning paper is `docs/StrategicIndustryPositioning.md`** (public, tiered Landed / Wedges / Frontier, landscape, moats, honest risks, who pays; last currency pass 2026-09-27). This file does NOT restate it and holds no competitor table of its own: it carries only (a) who edits what, (b) the §16 master-split recommendation, (c) wording guards for the serverless / novelty claim, (d) **proposed** additions and corrections to the paper (not applied: it is a public doc, owner approval first), (e) the test order. Written 2026-10-25 after the owner flagged the clash; the first version of this file (a field map and beachhead table) was cut because the paper already owns those. **Read the log after every test run before changing any line here.**

## 0. Who edits what (so nothing is overridden)
| Side | Owns (do not edit from the other side) | State on 2026-10-25 |
|---|---|---|
| **Replication session** | `TEAMWORK_FRAMEWORK.md` §16.x · `build/scriptor/*` · `scripts/witness_scriptor_*.js` · `prompts/prior_art_2026-10-25/*` · `docs/DistributedERP.md` · (planned) `scripts/film_replication_engine/*` | uncommitted in the shared tree |
| **Team-layer / evaluation session** | `TEAMWORK_FRAMEWORK.md` §15.14, §15.15, §17 · this file · `scripts/film_server_dead_modeller_hhs/*` · `prompts/film_server_dead_modeller_hhs_logs/*` | committed and pushed; bim-ootb PR #2368 MERGED (4e95b393) |
| **Positioning paper** | `docs/StrategicIndustryPositioning.md` (+ its `site/` copy, published only via `scripts/safe_gh_deploy.sh`) | not edited by either session above |
**Rules.** (1) `TEAMWORK_FRAMEWORK.md` is the one shared file: edit only your own § numbers with exact-match edits, never a whole-file write from an earlier read; new text at the end under a new § number; commit your own hunks only. (2) Engine files (`build/comm/*`, `common/comm/comm_*.js`): one agent at a time. (3) A finding about someone else's section or the paper is written HERE (as a proposal) or told to its owner, never edited in place.

## 1. Recommendation (owner decision pending)
**§16 = the single master for *what moves* (scope, flows, treatments, schedules); §11–§15 = the master for *how it moves*.** Reason: both host adapters hard-code "what is shared" (`STATION_LOCAL` in the ERP, the Modeller's 7-of-22 class table, §15.2) — flow rows in disguise, the bloat §16 targets. **Handover is declared only when:** C1 generated plans run in the office-day simulator and every existing witness quotes the same numbers (§16.12 S2–S3) · C2 the Modeller's `bim_element` has a pseudo-dictionary entry in the flow table · C3 the plan-signing key is answered (§16.13 Q1) · C4 §17 T1 / T4 / T5 are re-expressed on the scriptor's budget and owners · C5 Modeller authoring depth stays out (`prompts/Modeller/`).

## 2. Wording guards (the serverless / novelty claims only; the paper's tier discipline covers the rest)
Say now: *no server we operate holds the truth, plus one owner-designated always-on hub for the few scarce resources* (§16.14 B1) · MIT · forged or altered ops are detected and refused on every device ("tamper-evident", witnessed) · every film claim is a test line. Say only as *"to our knowledge"*: no documented production system with real transactions and no always-on DB / app server (R1); no system found combining a serverless plan compiler with a signed deferred-query catalog (R2). Do not say: "first" · unqualified "serverless" · "no other FOSS project has this" as a fact (it is the owner's position) · "disrupter" before a pilot · "free" before the cost ledger (§17 T9). Insider fraud: out of scope by the owner's directive (§17).

## 3. Proposed changes to the paper (NOT applied — owner approves, then whoever owns the paper edits)
| # | Where in the paper | Proposal | Why (source) |
|---|---|---|---|
| P1 | **Moat #4** ("each browser is its own server; the only shared resource is a stateless signature gatekeeper; scales to 10,000 POS stations") | keep the claim but anchor it to its witness (`poc_pos_wan_scale`, 10k stations ~4.6k ops/s) and say which topology it measures; add the post-office carriage's own measured ceilings beside it (GitHub pipe ~31 devices per account, web relay ~100 staggered) and use the §2 wording | two different carriages now exist; the paper reads as if one number covers both |
| P2 | **Landscape** (Tier 1–3 + "Adjacent layers") | add two rows: *local-first sync stacks* (Automerge, Yjs, Replicache/Zero, ElectricSQL, PowerSync, Ditto, CouchDB/PouchDB — scope hand-written by the developer, R2) and *offline POS* (Unicenta, Odoo POS offline) | the paper's landscape is BIM-only except Speckle; the team layer competes in a different field. **[mine]** class members are from general knowledge, verify before publishing |
| P3 | **Tier 2 — Wedges** | add *iDempiere branch / offline kit — legacy untouched (twin rule), parity run as the oracle* next to the existing "iDempiere DB health-check" wedge | the only wedge whose oracle (legacy) already exists |
| P4 | **Tier 3 — Frontier** | add the Replication Scriptor (§16) and the one Team icon + avatars (§15.15) as Frontier rows, each with its witness status | they are not in the paper |
| P5 | **Honest risks** | add: team size ceiling, phones unmeasured, email path unmeasured, dependence on free tiers and terms of the relays — each pointing at its §17 test (T1, T2, T3, T9) | the paper's four risks are about adoption and credibility only |
| P6 | **Currency** | the paper's last pass is 2026-09-27; §15.14–§15.15 / §16 / §17 postdate it — a dated re-read of Tier 1 rows against merged PRs before the next publish | the paper's own rule (Tier-1 claims must hold) |

## 4. Test order for the positioning claims (detail lives in §17; this is only the order)
iDempiere branch kit (P3) → offline POS sale path (§16.19 film numbers on real data) → open-BIM small-team pilot (§17 T10, T7) → pawn lending (parked: legal first, R1) → sovereign data (defer). **Kill criteria:** the legacy community will not run it or parity cannot reach every window / doctype (branch kit); stock or cash reconciliation needs a central arbiter on most days (POS); no use beyond the demo or the IFC export fails validation (BIM).

## 5. Open — owner-owned
1. Accept §1 (the split) and tell the Replication session (this file does not edit its section).
2. Approve P1–P6 (and who edits the paper).
3. Is the branch kit (P3) the first wedge to test?
