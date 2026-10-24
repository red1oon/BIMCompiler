# ⚠ DO NOT REMOVE — POSITIONING & EVALUATION of the local-first team layer in the wider field
**Scope:** the evaluation lane only: where this work stands among other projects, what we may say, which beachheads to test, and what would make us change course. It does NOT hold the replication design (that is §16 of `TEAMWORK_FRAMEWORK.md`, owned by the Replication session) nor the carriage (§11–§15). Every claim here is either sourced (R1–R3 in `prompts/prior_art_2026-10-25/`, our witnesses) or marked **[mine]** = general knowledge not checked in this repo. Written 2026-10-25 (owner: *"I am concerned of override … crystalize without stale repeat"*). **Read the log after every test run before changing any line here.**

## 0. Who edits what (so nothing is overridden)
| Side | Owns (do not edit from the other side) | State on 2026-10-25 |
|---|---|---|
| **Replication session** | `TEAMWORK_FRAMEWORK.md` §16.x · `build/scriptor/*` · `scripts/witness_scriptor_*.js` · `prompts/prior_art_2026-10-25/*` · `docs/DistributedERP.md` · (planned) `scripts/film_replication_engine/*` | uncommitted in the shared tree |
| **Team-layer / evaluation session** | `TEAMWORK_FRAMEWORK.md` §15.14, §15.15 (+ results), §17 · this file · `scripts/film_server_dead_modeller_hhs/*` · `prompts/film_server_dead_modeller_hhs_logs/*` · bim-ootb PR #2368 files (`common/comm/team_{avatars,panel,focus,people,people_ui}.js`, `modeller/*`, `erp/team_sync.js`, `erp/sw.js`) | committed and pushed (§15.15, §17); #2368 open, auto-merge on |
**Rules.** (1) `TEAMWORK_FRAMEWORK.md` is the ONE shared file: edit only your own § numbers, with exact-match edits, never a whole-file write from an earlier read; new text goes at the end under a new § number; commit your own hunks only (stage HEAD + your section as a blob, as done for §17). (2) Engine files (`build/comm/*`, `common/comm/comm_*.js`): one agent at a time. (3) **Sequencing:** PR #2368 touches `erp/team_sync.js`, which a flow-table reader will also touch — #2368 merges FIRST; the Replication session rebases its host-reader step onto it. (4) A finding about the other side's section is written HERE or told to the owner, never edited in place.

## 1. Recommendation (decision for the owner)
**§16 becomes the single master for *what moves* (scope, flows, treatments, schedules); §11–§15 stay the master for *how it moves* (signed ops, post office, conflicts, POLICY / CHECKPOINT / BASE).** Evidence the split is real: both host adapters hard-code "what is shared" (`STATION_LOCAL` in the ERP; the Modeller's 7-of-22 class table, §15.2) — those are flow rows in disguise, i.e. the bloat §16 targets.
**Conditions before the handover is declared (each is a test, not an opinion):** C1 parity — generated plans run in the office-day simulator and every existing witness quotes the same numbers (S2–S3, §16.12); C2 non-dictionary sources — the Modeller's `bim_element` has no AD row, so the flow table needs a pseudo-dictionary entry (§16.16 already allows a non-AD `GroupKey`; columns are the open part); C3 the plan-signing key answered (§16.13 Q1); C4 §17 T1 / T4 / T5 re-expressed on the scriptor's plan budget and owners instead of duplicated; C5 Modeller authoring depth stays out (its own lane, `prompts/Modeller/`).

## 2. Claims ledger (what any film, page or pitch may say)
| Say now | Say only as "to our knowledge" | Do not say |
|---|---|---|
| no server we operate holds the truth (+ one owner-designated always-on hub for the few scarce resources, §16.14 B1) · MIT · forged or altered ops are detected and refused on every device ("tamper-evident", witnessed) · every claim in a film is a test line | no documented production system with real transactions and no always-on DB / app server (R1) · no system found combining a serverless plan compiler and a signed deferred-query catalog (R2) | "first" · unqualified "serverless" · "no other FOSS project has this" as a fact (owner's position, kept as such) · "disrupter" before a pilot · "secure / unhackable" · "free" before the cost ledger (§17 T9) |
Insider fraud: out of scope by the owner's directive (§17); the wording guard above is the only trace.

## 3. The field, by class **[mine — unverified here; a dated desk pass must confirm before any public comparison]**
| Class | Examples | What they do | Where we differ | How we could be wrong |
|---|---|---|---|---|
| Cloud BIM / CDE / construction suites | Autodesk Construction Cloud, Trimble Connect, Bentley iTwin, Procore | central servers, permissions, issue tracking, integrations, support, liability | no operated server; offline; no subscription | buyers purchase integration, compliance and a throat to choke, not architecture |
| Open BIM tooling | Bonsai / BlenderBIM, IfcOpenShell, That Open Company, Speckle, FreeCAD | authoring / parsing / server-based data exchange | a team layer with signed ops in the browser, plus ERP on the same kernel | Speckle or git-based flows may already satisfy small teams |
| ERP | SAP, Odoo, ERPNext, iDempiere | server-centred; open ones are free to license | iDempiere twin that runs offline in the browser, replication generated from the dictionary | the free ERPs already cost nothing in licences; our edge is operations and resilience, not price |
| Local-first stacks | Automerge, Yjs, Replicache / Zero, ElectricSQL, PowerSync, Ditto, CouchDB / PouchDB | sync engines; scope hand-written by the developer (R2) | scope compiled from the dictionary (§16); deterministic verbs replayed identically | a general-purpose engine could add a schema-driven scope planner |
| Offline POS | Unicenta, Odoo POS offline mode | local sale, sync on reconnect to a central DB | the sale path needs no central DB (§16.19) | reconciliation disputes may force a central arbiter more often than the Deming loop assumes (§16.0a FL-4) |

## 4. Beachheads, ranked by how near the evidence is (the order to test, not a promise)
| # | Beachhead | Why first / last | Evidence needed | Kill criterion |
|---|---|---|---|---|
| B-1 | **iDempiere branch / offline kit** — legacy untouched (twin rule) | existing community, the legacy system is the oracle (parallel run), real pain = branch connectivity | parity run "X of N windows / doctypes equal" on a real dataset; one branch running a week | the legacy community will not run it, or parity cannot reach every window / doctype |
| B-2 | **Offline retail POS chains** (the Unicenta pattern) | the flow pattern is already hand-built and understood (§16.0a) | the sale-path film's numbers on real data; 2–3 stores | stock / cash reconciliation needs a central arbiter on most days |
| B-3 | **Open-BIM small teams** (Modeller + team layer) | the demo exists; competes with Speckle / git flows | §17 T10 pilot + T7 IFC round trip | no one uses it past the demo; the IFC export fails validation |
| B-4 | Pawn / micro-lending | strongest custody argument, but regulated; parked by the owner | legal position first (R1, out of §16) | the lender may not keep its authoritative record on devices |
| B-5 | Sovereign / public-works data | long sales cycle | a sponsor | defer |

## 5. What would change this assessment
Upward: a pilot where honest refused ops = 0 and two sides converge for two weeks (T10); an independent clean-clone reproduction (T8); the scale ladder reaching a team size that matches a real branch network (T1). Downward: any §17 test that finds a free-tier or terms limit under the real load (T9); phone fold times far above the node numbers (T2); an outside reviewer finding an arbiter we call "none" (B1).

## 6. Open — owner-owned
1. Accept §1 (the split) — and tell the Replication session, since this file does not edit its section.
2. Is B-1 the first beachhead? (it is the only one whose oracle already exists.)
3. Who runs the dated desk pass that checks §3 before any public comparison?
