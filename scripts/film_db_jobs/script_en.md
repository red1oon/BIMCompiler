<!-- ⚠ DO NOT REMOVE — Scope: narration source for the film "What a server stands for, and what a database stands for" (bim-compiler prompts/TEAMWORK_FRAMEWORK.md §53; claims from docs/DistributedERP.md "What a database stands for"). The narration column below is spoken VERBATIM (F asks / M explains). NO FIGURES by design (owner 2026-11-03: unlabelled dial) — guard.js refuses any digit. READ THE LOG after every run: out/guard.log, out/fit.log, out/mux.log. -->
# Storyboard — narration (v1, EN)

| # | Beat | On screen | Narration |
|---|---|---|---|
| 1 | Title | title card | — |
| 2 | The objection | "If there is no server, what is missing?" then the bundle of tasks | "F: A reasonable objection. If there is no server, what exactly is missing? | M: Nothing is missing, but the question assumes that a server is a place. It is a bundle of tasks. | F: Which tasks? | M: Arbitrating writers, holding the truth, keeping copies, surviving a crash, checking identity, answering queries. Take them apart, and each has a smaller home." |
| 3 | House A: the guard | guard, cameras, 24-hour dial, cost meter, locked-out outage | "M: Consider a security guard who watches one door around the clock. The cost is continuous, while the work is occasional. And when the guard leaves, the household is locked out." |
| 4 | House B: the sensor | sensor, dark until triggered, one action, outage shown harmless | "M: Replace the guard with a motion sensor. It does nothing until it is triggered, does one small thing, and stops. If it fails, the household carries on, because the sensor never made the house work." |
| 5 | The lock | lock with three parts | "F: But a sensor does not check who walks in. | M: Correct. So the lock verifies the key itself: a signature, a chain of hashes, and a single permitted writer." |
| 6 | Concurrency | job 1 card | "M: A classical database needs locks, because its state is overwritten. Here, state is the fold of an append-only log. There is nothing to overwrite, and therefore nothing to lock." |
| 7 | Replication | job 2 card | "F: And the copies? | M: A copy is simply a position in the log. Seed the base once; thereafter send only the operations that follow the replica's last hash. Delivery may repeat, because replay is idempotent." |
| 8 | Durability | job 3 card | "M: Durability is the job we had to rebuild most deliberately. Our own power-cut test showed that the earlier claim was only half true, and the redundancy ladder is the result." |
| 9 | Atomicity, integrity, audit | jobs 4, 5, 8 card | "F: And atomicity, integrity, audit? | M: A change is one operation, applied whole. A kernel that is deterministic on every device validates it against a schema pinned in the base. And the log is itself the history, with the hash chain making any alteration detectable." |
| 10 | Querying: kept | job 6 card | "F: Is the database itself gone? | M: No. The server around the database is gone. Querying and indexing remain, performed by an embedded engine over tables derived from the log." |
| 11 | Access control | job 7 card | "M: Writes are verified in the data itself. Reads are weaker: they rest on who was given the data in the first place. We state that limit rather than hide it." |
| 12 | A place to ask | job 9 card | "F: Whom do I ask for the current figure? | M: No one, live. A device answers from its own derived copy, and for what it does not hold there is a signed catalogue of deferred queries with reply schedules. This is where the absence is felt most, and we say so." |
| 13 | The exception | always-on sensor | "M: One sensor stays on permanently: an online compare-and-set for a high-value, divisible balance. That is a recorded owner decision, not an oversight." |
| 14 | Necessary, not sufficient | fold + three conditions | "F: Is the fold alone enough? | M: It is necessary, but not sufficient. It removes the need to arbitrate state. Determinism, a total order, and a single writer remove the need to arbitrate writers. Without those three, the server returns." |
| 15 | Close | table jobs by home | "M: The server never held the truth. It held the queue." |
| 16 | End card | end card | — |
