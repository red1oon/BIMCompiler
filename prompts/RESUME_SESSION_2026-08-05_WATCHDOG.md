# ⚠ DO NOT REMOVE — Session resume: general reviewer/watchdog role, 2026-08-05

**Read this in full before touching code.** This session ran alongside a concurrent dev session
doing Gantt/CPE polish on bim-ootb — this file is the reviewer's own report, kept separate from
that session's own task file (`prompts/4D_SCHEDULE_PERFECTION.md`) per `WATCHDOG.md`'s own rule:
"the role definition and the task content never merge." Findings that are facts *for* the dev
session (a new bug found, a witness result) went into their file, already committed
(`bim-compiler` `dfe3997e3`); commentary *about* their work (this file) stays here instead.

## §WHAT THIS SESSION DID

1. **bim-ootb PR #1176** (`chore/witness-cleanup`, open, not merged) — 128 stray `witness_*.js`
   scripts were sitting loose at repo root instead of the `<module>/tests/` convention every other
   module already follows. Relocated 108 → `viewer/tests/`, 20 → `common/tests/`, categorized by
   evidence (require() targets, page.goto URLs, header spec citations — not filename guessing).
   41 needed `__dirname`-depth fixes (they assumed repo-root); fixed and runtime-verified with two
   live re-runs post-move, not just `node -c`.
2. **bim-ootb PR #1185** (`chore/blackbox-harden`, open, not merged) — built the general-purpose
   "read the real schedule to see what's wrong" black-box tool that was actually asked for
   (the existing `witness_gantt_ops_blackbox.js` only guards one already-fixed bug against a
   SYNTHETIC 40-element fixture, never real data). Runs the real `matchRule` (required/sliced from
   shipped files, never reimplemented) against real `elements_meta` across 4 buildings (239,469
   elements). Found 3 real classes silently defaulting to `Architecture/seq6/no-resource`:
   `IfcDistributionControlElement` (861, Hospital), `IfcSwitchingDevice` (113, Hospital),
   `IfcSpace` (21, Duplex — proves it isn't Hospital-only).
3. **Reviewed the dev session's fix for #2**, in progress as this session closes — grounded in real
   IFC4 schema subtype relationships (verified independently, not taken on faith), plus loud
   `§CLASS_UNMATCHED` logging in all 3 `matchRule` copies. Asked directly "is it foolproof" and
   answered no — see §OPEN below, these are real gaps, not hedging.

## §LESSONS — durable, apply every session, don't re-litigate

1. **A witness only ever runs because the session that needs it runs it — nothing in this repo
   auto-runs any witness.** No CI executes the witness suite; "GREEN before commit" is entirely a
   local, per-session discipline. A tool built on an unmerged branch in one worktree is invisible to
   every other concurrent session until someone explicitly relays it. Don't assume "it was running
   before" implies automation — check whether it ran because it was the SAME session's own current
   task (it almost always is).
2. **`matchRule`'s substring-containment matching cannot see real IFC schema relationships.**
   `"IfcFlowController"` is not a textual substring of `"IfcSwitchingDevice"` even though the second
   is a direct schema subtype of the first — so a generic parent-class rule can never auto-catch a
   child whose name doesn't literally contain it. Any future classification fix needs an EXPLICIT
   entry per real class, not a hope that substring matching will generalize from schema knowledge it
   doesn't have.
3. **The "N independent copies" pattern keeps recurring in this codebase** (support predicate: found
   at 3, turned out to be 4; date-cursor logic: 3 sites; classification: `matchRule` in
   `schedule_author.js` + two separate closures in `time_machine.js`). Any fix touching one copy
   should default to grep-verifying there isn't a 4th under a different name before declaring done.
4. **A "fail loud" log line is not the same as "foolproof."** `console.warn`/`§TAG` logging makes a
   defect detectable to someone who reads that run's output — it does not stop the defect from
   shipping. If the actual bar is "cannot recur silently," it needs an enforced gate (a witness wired
   into a pre-merge check, or a visible in-product signal like `§Z_STACK_XRAY_STAGING`), not logging
   alone. Worth naming explicitly whenever "add logging" is offered as the fix for "make it
   impossible."
5. **Two separate real bugs got conflated in first triage** (this session's own mistake, corrected
   mid-session): "2 IFC trucks wrongly typed" was assumed to be a classification issue (matchRule
   fallback); the real trucks bug was geometric (`geoGate()`'s support-detection heuristic,
   §GEO_SUPPORT_LEAK, already fixed by the dev session). The classification fallback found via #1185
   is real but unrelated — always check whether a vague symptom report has ALREADY been diagnosed
   elsewhere before building new tooling to chase it.

## §OPEN — the foolproof gaps, concrete, not yet resolved

1. **No enforcement, only logging.** The dev session's `§CLASS_UNMATCHED` addition is a real
   improvement but not a gate — pair it with wiring PR #1185's witness into an actual pre-merge check,
   or route unmatched classes through `§Z_STACK_XRAY_STAGING` so they're visibly wrong even unread.
2. **"All 3 `matchRule` copies" is unverified as the true count** — do a repo-wide grep for the
   *pattern* (longest-substring match against `SEQUENCE_RULES` with a silent default), not just the
   literal name, before calling the fix complete.
3. **Only proven against 4 buildings** (Hospital/Terminal/LTU_AHouse/Duplex). JKR/Clinic/HHS and any
   future user-uploaded IFC are unchecked — a genuinely novel class there still silently defaults.
4. **The `IfcOpeningElement` precedent's "4 query sites" for the exclusion pattern was inherited, not
   independently re-verified this round** — worth a fresh grep to confirm it's still 4.
5. **Verification once the dev session's fix lands:** re-run PR #1185's
   `witness_class_fallback_blackbox.js` — G-A should flip to 0 hits. Also re-run the full existing
   regression suite (167/167 was the last known-green count per `4D_SCHEDULE_PERFECTION.md`) to
   confirm the 3 new explicit entries don't shift anything already correctly classified.

## §STATE — what's live vs pending as this session closes

- bim-ootb PR #1176 — open, not merged, no known blockers.
- bim-ootb PR #1185 — open, not merged; dev session's classification fix is in progress on a
  separate fresh worktree (`origin/main` was 26 commits stale + dirty locally at the time).
- `bim-compiler` `fable/meshdb-livewire` @ `dfe3997e3` — pushed, clean. Contains the
  `§CLASS_UNMATCHED_FALLBACK` prelim note in `prompts/4D_SCHEDULE_PERFECTION.md` (the finding, for
  the dev session) and this file (the review, for whoever picks up the watchdog role next).
- Two worktrees created this reviewer session (`/tmp/wt-witness-cleanup`, `/tmp/wt-blackbox-harden`)
  were pruned at close — both fully pushed and clean, branches persist on GitHub via their PRs.
