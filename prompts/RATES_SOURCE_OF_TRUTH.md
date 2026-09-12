# RATES_SOURCE_OF_TRUTH — does the Modeller need the Viewer's 4D/5D rates, or just a fast handoff to it?

```
# ⚠ DO NOT REMOVE
SCOPE: (1) audit which values in `bim-ootb viewer/rates/sequence_rules.json` are actually LIVE for the
Viewer's own real 4D bake (schedule_author.js / cpm_schedule.js / schedule_gate.js) vs. stale-but-committed;
(2) settle the design question this audit exists to inform — should the Modeller ever read/duplicate 4D/5D
rate data itself, or should "seeing 4D/5D" always mean switching to the Viewer (bridged by Connect Scene)?
Read the log after every measurement. Spec before code — this file is SPEC ONLY, nothing implemented here.
```

Session 2026-09-13, `red1org@gmail.com` + assistant, live discussion. Grew out of a Modeller-vs-Viewer
architecture comparison (see `[[bim-ootb-dagevu-engine]]`-adjacent session work, not yet its own memory
file) that surfaced two separate, previously-unexamined questions in the same conversation.

## §1 The two questions, kept separate on purpose

**Q1 — Rate/template consistency.** Does the Modeller's own rule data (`modeller/duplex_rules.db`,
`modeller/terminal_rules.db` — fixture placement cadence for the disc-walker) share a schema or formula
with the Viewer's 4D scheduling rates (`viewer/rates.js`, `viewer/rates/sequence_rules.json`,
`4D_template.json`, `structural_rules.json`, `egress_rules.json`)? **Measured answer: no.** Zero
cross-references either direction (`grep`-confirmed, both `modeller/*.js` → no hit on any `viewer/rates*`
path, and no reverse hit). They are not competing/duplicated implementations of the SAME concept — they
answer different questions that happen to share the English word "schedule":
- Modeller's `rule_space_schedule` table: **how many fixtures per room, where, at what anchor/offset** —
  a placement cadence, mined from real buildings for the disc-walker (`modeller/disc_walker.js`).
- Viewer's `sequence_rules.json`: **which construction phase/day an element gets built, by whom, at what
  labour rate** — a construction timeline input.

No design defect here — they were never meant to be the same thing. Nothing to unify.

**Q2 — Is `sequence_rules.json` even the Viewer's own live source of truth?** This is the one with a real,
open question. The file's own header (as of this session) says:

> "READ THIS BEFORE CITING A NUMBER FROM THIS FILE (corrected 2026-08-13, §RULES_TABLE_SOURCE): this file
> is NOT what Time Machine `injectGantt` runs on. `viewer.html` never calls `loadSequenceRules()` — only
> `mep_report.html` and `boq_...` [truncated in this session's view — re-read the full note before citing]."

But `schedule_author.js:685` DOES read one live constant from it —
`sequence_rules.json LABOR_RATES._default_max_crews_author`. So the file is **partially** live: at least
one value flows into the real bake; the file's own comment says the FULL `loadSequenceRules()` load path
does not run for the live Time Machine bake. This is an internal Viewer inconsistency, found by accident
while checking whether the Modeller should ever point at this file — **not yet audited**, not this
session's job to fix without a dedicated pass.

## §2 §AUDIT — not run yet, spec only

Before anyone (Modeller or a future Viewer refactor) treats `sequence_rules.json` as authoritative:
1. Enumerate every top-level key/value the file defines (`LABOR_RATES`, whatever else sits beside it).
2. For each, grep `schedule_author.js` / `cpm_schedule.js` / `schedule_gate.js` / `rates.js` for a live
   read (`require(...sequence_rules...)`, a destructured import, or a literal copy that was hand-kept in
   sync — distinguish "reads the file" from "the same number was pasted here once and may have drifted").
3. Report a table: `{key, live-read-from-file | hand-copied-elsewhere | dead-in-viewer}`. A "dead-in-viewer"
   row is itself a finding — either delete it from the file (it's misleading) or wire it in (it was meant
   to be live and isn't).
4. Do the same one-pass check for `4D_template.json`, `structural_rules.json`, `egress_rules.json` — the
   session that found the `sequence_rules.json` gap didn't check whether its siblings have the same
   file-says-one-thing-code-does-another problem.
**Witness claim (A-1):** for every key reported "live-read-from-file," changing that key's value in the
JSON and re-running the relevant bake/report changes the output by a traceable amount. A key that doesn't
move the output when changed is not actually live, regardless of what a grep hit suggested.

## §3 The design question this audit was for

**Should the Modeller ever read `viewer/rates/*.json` (or a future shared rates file) itself, so a
resident opened in the Modeller shows real 4D/5D consequence in-app?**

**Recommendation (not yet actioned — needs the user's go-ahead before scoping real work): no — route to
the Viewer instead of duplicating scheduling machinery in the Modeller.**

Reasoning:
- The Modeller has **zero** scheduling machinery today — no `rates.js` equivalent, no `schedule_author.js`
  equivalent, confirmed by grep (nothing in `modeller/*.js` computes a construction date, a crew count, or
  a cost). Building that in from scratch is a large, separate engine, not a rates-file read.
- The Viewer already owns this, is already mature (`schedule_gate.js`/`cpm_schedule.js`/`schedule_author.js`,
  this session's own §GROUND_CONNECTED work, `witness_e2e_*` coverage across 4D), and §1/§2 above show its
  OWN rate-file story isn't even fully self-consistent yet — pointing a second consumer (the Modeller) at
  a file the Viewer itself only partially trusts would propagate an unresolved problem, not share a solved
  one.
- `Connect Scene` (`bim-compiler prompts/CONNECT_SCENE_SPEC.md`) already exists as the cross-surface bridge
  and is the RIGHT mechanism for this — not a duplicated rates read. P0 (broker), P1 (selection), P2
  (timeline/scrub) are shipped and witnessed. **P3 (a commit in one surface → the others re-fold live) is
  the one missing piece**, explicitly still "NEXT" in that spec as of this session. Once P3 ships, "edit a
  wall in the Modeller, switch to the Viewer, see the schedule already reflect it" becomes a real,
  witnessed, near-instant cross-tab handoff — without the Modeller ever needing to know what a labour rate
  is.

**What this recommendation does NOT mean:** it doesn't devalue Connect Scene's P3 — if anything this
raises its priority, since it's now the identified dependency for the cross-surface "killer" moment
discussed earlier this session (edit → see schedule/cost consequence) rather than a nice-to-have.

## §4 Status

- [ ] §2 AUDIT — trace every `sequence_rules.json` (and siblings) key to live/dead, table + witness A-1
- [ ] Fix whatever §2 finds (delete dead keys, or wire them live) — separate follow-up, scope after the audit
- [ ] Decide (user) whether §3's recommendation stands, or the Modeller should get its own scoped 4D/5D
      surface after all — this doc takes no further action without that decision
- [ ] If §3 stands: prioritize `CONNECT_SCENE_SPEC.md` P3 (identity/commit channel) as the dependency for
      the cross-surface "killer" handoff — not scoped here, cross-reference only
