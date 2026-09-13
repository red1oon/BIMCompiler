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

~~But `schedule_author.js:685` DOES read one live constant from it —
`sequence_rules.json LABOR_RATES._default_max_crews_author`. So the file is **partially** live.~~

⚠ **CORRECTED by the §2 audit, 2026-09-13 — that sentence was wrong in MECHANISM, and the correction
makes the answer cleaner, not murkier.** `schedule_author.js:688` reads
`laborRates._default_max_crews_author` from its own **parameter**, not from the file. On the live path
that parameter is `time_machine.js:4601 var LR = window.LABOR_RATES`, i.e. the `rates.js` literal. The
file is not *partially* live for the viewer — it is **not live at all**. See §2-RESULT.

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

## §2-RESULT — AUDIT RUN 2026-09-13 (static trace; bim-ootb `main` @ `fc7e4ac6`)

**Verdict: `sequence_rules.json` is a MIRROR IN FULL on the viewer.html path. Zero of its keys reach the
live 4D bake.** It IS the live source on exactly two other pages.

| key | `viewer.html` (the live 4D bake) | `mep_report.html` / `boq_charts.html` |
|---|---|---|
| `meta` (3) | **dead** — no code reads it on any page | dead |
| `SEQUENCE_RULES` (58) | hand-copied → the `rates.js` literal | **live-read-from-file** |
| `SEQUENCE_DEFAULT` (3) | hand-copied | **live-read-from-file** |
| `LABOR_RATES` (10 trades + 3 constants) | hand-copied | **live-read-from-file** |
| `NAME_OVERRIDES` (7) | hand-copied | **live-read-from-file** |

**The load-path proof** (this is why no key can be live for the viewer, key by key): `loadSequenceRules()`
has exactly ONE caller, `rates.js:746 initRateTemplate()`; `initRateTemplate` has exactly TWO callers,
`boq_charts.html:974` and `mep_report.html:174`. `viewer.html:911` loads `rates.js` and calls neither.

**Witness A-1, answered without running a bake.** Change any key in the JSON and re-run: the viewer.html
programme moves by **zero** for every key (nothing reads the file), and the two report pages move for
every key. A-1 as written would have "failed" the whole file — correctly, and for the load-path reason
above rather than per-key drift.

**THE REAL FINDING — not what this audit went looking for.** `viewer/tests/witness_sequence_template_lock.js`
gates mirror↔literal equality and was **RED from 2026-09-02 to 2026-09-13**, on **prose, not values**: six
documentation keys exist only in the JSON (`LABOR_RATES._{productivity_basis_secs,zero_minute_floor_secs,
default_max_crews_author}_why` from #1616; `NAME_OVERRIDES[foundation_wall_substructure |
stair_member_architecture | finish_floor_finishes]._why` from #1551), while its `strip` only deleted
`reason`. It is not in `run_witness_suite.js`'s `KNOWN_RED`, so the suite counted it as an unexpected red
for 11 days. This is the exact failure its own `canon()` comment warns about — *"a gate that fires on it
teaches people to ignore it."* **Fixed: bim-ootb PR #1731** (exclusion by prose NAME — `reason`, `_why`,
`<key>_why` — at every depth; NOT by leading underscore, which would gut the gate since the three
functional `_`-prefixed constants must stay compared). Proven with controls: unmodified 7/7 · a real value
change `LABORER.rate_per_day` 95→96 still FAILS · a new `_why` key stays green.

**With the six prose keys excluded, all four functional keys are byte-identical — zero value drift.** So
the mirror is honest today; what had lapsed was the thing keeping it honest.

**§2 step 4 — the siblings, and `sequence_rules.json` is the odd one out, not the pattern:**
- `4D_template.json` — **genuinely live-fetched** at runtime on viewer.html (`time_machine.js:4177
  _load4DTemplate`, §TPL_WIRED, via `loadJsonWithOverrides`). No mirror, no second copy. Nothing to fix.
- `structural_rules.json` / `egress_rules.json` — **JSON is primary**, fetched via `RuleReport.loadRules`;
  the JS object (`structural_sanity.js` / `egress_sanity.js` `FALLBACK_RULES`) is only the offline
  fallback — the INVERSE of `sequence_rules.json`. Equality IS gated and IS green: `tests/test_rule_report.js`
  R13, run 2026-09-13, **85 passed / 0 failed**.

**Nothing in either data file was changed by this audit**, and no runtime module was touched — so no
schedule, duration or phase order moved. Per [[observe-document-dont-fix]], the one fix applied (#1731) is
to a test file and was authorised by the user in the same session.

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

- [x] §2 AUDIT — DONE 2026-09-13, see §2-RESULT. Table complete for all 5 keys + the 3 siblings; A-1
      answered from the load path (no key is readable by the live viewer, so none can move its output).
- [x] Fix whatever §2 finds — the finding was NOT a dead key, it was a lapsed GATE: **bim-ootb PR #1731**
      restores `witness_sequence_template_lock.js`'s mirror invariant (red 11 days on prose). Zero value
      drift was found, so no data file was edited.
- [ ] OPEN, low priority: `meta` is genuinely dead-in-viewer (no code reads it). It is not misleading —
      it is the §RULES_TABLE_SOURCE warning note itself, which is worth keeping — so "delete it" is the
      WRONG call here. Listed only so the next pass doesn't re-discover it as a defect.
- [x] Decide (user) whether §3's recommendation stands — **STANDS, user 2026-09-13**: route through the
      Viewer, "if this is better organised reuse, now by Modeller". The Modeller gets no rates machinery.
- [ ] §3 dependency: `CONNECT_SCENE_SPEC.md` **P3** (identity/commit channel, `W-CONNECT-COMMIT`) is now
      the named blocker for the cross-surface handoff. P0/P1/P2 shipped (#383, #384); P3 unbuilt.
      Not scoped here, cross-reference only.
- [ ] Related, spec'd the same day out of the same conversation: `TM_4D5D_VARIANCE_LANE.md` **S7** — the
      per-element 4D window + class-grain cost on `#info-panel` and the hover label. Uses the Viewer's own
      persisted schedule, so it is a Viewer stage, NOT a reason to teach the Modeller rates.
