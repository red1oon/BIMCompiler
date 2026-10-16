# ⚠ DO NOT REMOVE — 4D generated-schedule accuracy. Read the log after every run, spec-first,
# no invented dependency edges or rates. Every number here traces to real extracted data or a
# nameable, once-confirmed business assumption — never a plausible-looking value.

---

# INDEX — what is settled, what is open (added 2026-08-26)

**How to use this index.** This file is 5,600+ lines of session logs, appended in place since
2026-08-03. Corrections are written IN PLACE, later in the file — never by editing the earlier wrong
text — so reading linearly hands you claims that were later withdrawn. This index is (1) a one-line
map of every major section with a SETTLED / SUPERSEDED / OPEN call, and (2) a ledger of every
correction found by grepping RETRACTION / WITHDRAWN / CORRECTED / "was wrong" / "is withdrawn" /
"supersed". Nothing below was deleted or rewritten — only indexed.

**⚠ ARCHIVE PASS 2026-08-27 — the `line` column below is now indicative only, never exact.** Six
blocks this index had already called SUPERSEDED or ✅ SHIPPED were moved verbatim to
`prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md` (665 lines; file 5,793 → 5,147
lines). Each left a `## … — ARCHIVED` pointer AT ITS ORIGINAL POSITION, so every `§TAG` in this
index still greps to the right place in this file and the pointer names where the full text went.
Nothing was deleted. Sections a live thread still points at were deliberately kept — see that
archive file's own header for the kept-on-purpose list and the reason for each. (The `line` numbers
in this index were already ~132 lines low before this pass, since the index was written before it
was prepended to the file — grep the `§TAG`, do not trust the number.)

**⚠ The "▶ CURRENT STATE" block immediately below this index is itself stale.** It is dated
2026-08-15 and has not been updated since — everything from §S63 onward (2026-08-22 → 2026-08-26,
including the 🏁 §MILESTONE and the storey-elevation fix in §S72.2) postdates it and is not
reflected in it. **The true latest state is the tail of the file, §S72.2 (line ≈5622).** For the
ACTIVE spec that succeeds this file's generation work, see `prompts/4D_BAR_MODEL.md` (its own
predecessor analysis cites this file's §S68–§S71) — read that file's own "SETTLED STATE — READ THIS
FIRST" section first.

## Section map

### Top matter (lines 1–4368) — 2026-08-12 → 2026-08-16 sessions
| line | section | status |
|---|---|---|
| 7 | ▶ CURRENT STATE (2026-08-15 close) | SUPERSEDED by §S63 onward (below); still a correct record of the 2026-08-13→15 PR ledger |
| 102 | ▶ SUPERSEDED — 2026-08-13 "NEXT SESSION" block | self-labeled superseded; kept only for the still-unverified "3rd level hanging doors" thread |
| 599 | §GROUNDED_OVERRIDE_FIX | SETTLED — shipped PR #1338 |
| 632 | §TIER2_PER_ELEMENT_CLAMP + §SHIFT_HOURS | SETTLED — shipped PR #1333 |
| 688 | ▶ THE ACCEPTANCE BAR (user's own words) | SETTLED — still the standing spec |
| 698 | ▶ RESUME — START HERE (2026-08-12, 4th pass) | SUPERSEDED — stale resume pointer; later ones exist (§S65/§S66/§S71/§S72.2) |
| 735 | THE ARCHITECTURE (code map) | SETTLED as written 2026-08-12 — re-verify before trusting; code has moved (§S66 template, `4D_BAR_MODEL.md` lane) |
| 759 | §STRUCT_POOL_UNGATED | SETTLED — covered at display layer by §MIDAIR_REPAIR |
| 779 | LANDMINES | SETTLED — standing operational rules |
| 795 | SHIPPED LEDGER | SETTLED — historical PR record |
| 819 | SETTLED (closed rulings) | SETTLED |
| 830 | OPEN THREADS (2026-08-12 punch list) | mostly absorbed by later work; the file's own VERIFY-BEFORE-TRUST note (866) already flags this |
| 866 | VERIFY-BEFORE-TRUST | the file's own caveat — everything above it was true only "as of 2026-08-12" |
| 871 | ▶ §MIDAIR_REPAIR (closes the acceptance bar) | SETTLED — shipped, 0/7 buildings floating on its own judge; a DIFFERENT axis regressed later, see REGRESSION FOUND (4619) |
| 1029 | §ARCH_START_TEMPO | OPEN — studied/measured, deliberately not built; 2 levers need a user call |
| — | §GANTT_PHASE_CLOBBER | SETTLED — fixed. **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| 1221–1710 | §DAY_GAP lane (§DAY_GAP_WIP · §DAY_GAP_PHASE_OCC · §TIER_SERIAL_BY_ZONE · §ZONE_KEY · §ZONE_INDEX · §DAY_GAP_TAIL*) | SETTLED — resolved to zero (line 1573); §DAY_GAP_WIP (1266) specifically SUPERSEDED by §DAY_GAP_PHASE_OCC (1333) — see ledger #1 |
| 1711 | §BIM_USABILITY_REVIEW + §HOSTED_ZONE_SUSPECT | mixed — usability scores SETTLED (self-corrected inline); §HOSTED_ZONE_SUSPECT's claim that `sequence_rules.json` is a programme template (line 1751) is WRONG — see ledger #2 |
| 1869 | §TIER1_HANDOFF | SETTLED — 3 verdicts reached; one OPEN sub-item (cache-version bump unwitnessed, 1955) |
| 1971 | §UNIVERSAL_HOST_BUFFER | OPEN — proposed, not built |
| 1998 | §CURTAIN_WALL_OPENING | SETTLED — fixed + post-merge reverified |
| 2065 | §DOOR_WINDOW_HOST_WALL_DISPLAY | SETTLED — fixed, witnessed |
| 2165 | §PHASE_WINDOW_IDLE | OPEN — mechanism found, blocked on a ruling (2271) |
| 2298 | §TIER_REGATE_WORKLIST | SETTLED — shipped PR #1348 |
| 2439 | §GATE_GUARD_BODY_TM | SETTLED — shipped |
| — | §DAY37_HOSPITAL_HANGING | superseded by §OG_HANG_BAND below (real driver found there). **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| 2513 | §CPE_DISCIPLINE_REVEAL topout gap | OPEN — named in passing, untouched |
| — | §GANTT_SHIFT_HOURS_DESYNC | SETTLED — shipped PR #1355 (same bug class recurred in one witness, see REGRESSION FOUND — fixed there too). **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| — | §GANTT_SCHEDULE_STALE | SETTLED — shipped PR #1359. **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| — | §HOSPITAL_LIGHTING_STILL_FLOATING (4 sessions) | SUPERSEDED — real driver not found until §OG_HANG_BAND; read that instead (still live in this file). **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| 2930 | §OG_HANG_BAND | SETTLED — shipped PR #1375 |
| 3028 | §TIME_MACHINE_CONSOLIDATION_SPEC | OPEN — scoping only, deferred |
| 3132 | §SCHEDULE_CLASSIFY_DEDUP | SETTLED — shipped PR #1374 |
| 3209 | §GANTT_WINDOW_FIDELITY_AND_SPREAD | SETTLED — regression found+fixed same session |
| 3333 | §GANTT_GAP_CLAMP_SPREAD | SETTLED — shipped PR #1377; Terminal-shape residual left OPEN (see top block's own open item 6, line ≈76) |
| 3405 | §CPM_GENERATOR_UPSTREAM_SPEC | OPEN when written (candidate #2 never built) — the residual floating it targeted was later chased to ~0 without it (🏁 §MILESTONE, 4562); treat as SUPERSEDED-by-outcome, not confirmed closed by name |
| 3519 | §CARRIER_DEDUP_DERISK_STUDY | OPEN/parked deliberately — now code-quality only, not correctness-blocking |
| 3648 | §FLOATING_TIMING_ROOT_CAUSE | SETTLED — root cause identified, feeds next row |
| 3716 | §MEP_PROXY_PHASE_RECLASS | OPEN — built+measured, explicitly NOT SHIPPED (net worse), blocked on §CPM_GENERATOR_UPSTREAM_SPEC |
| 3905 | §OG_HANG_UNBOUND | SETTLED — shipped PR #1382 |
| 3962 / 4004 | §CROSSTASK_JUDGE_PARITY (SPEC → BUILT) | SETTLED — shipped PR #1387 |
| — | §CHASE_TO_ZERO_WINDOW_AUTHORING | SETTLED — resolved via §ZONE_DISPLAY_AUTHORING (**kept in this file**); the SPEC + EXP5's 2 REJECTED candidates **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| 4171 / 4201 | §STOREY_ORDER_REPORT | OPEN — corruption localized to `_twoTierRemap`/`_tier1Serialize`, root cause traced one level deeper, next lever NAMED not built |
| — | §TIER1_PER_ELEMENT_CLAMP EXP | SUPERSEDED — measured, REJECTED fleet-wide. **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |
| 4310 | §CJP_DAY_ROUNDING_TOL | SETTLED — shipped, fleet floating −49.8% |
| — | ▶ NEXT SESSION START HERE (2026-08-16 close) | SUPERSEDED — stale pointer, superseded by §S63 onward. **ARCHIVED 2026-08-27 → `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`** (pointer left in place) |

### The live edge of the file (lines 4408–5656) — 2026-08-22 → 2026-08-26
| line | section | status |
|---|---|---|
| 4408 | §S63 | SETTLED — bisected/isolated/measured/re-locked; one named OPEN sub-item (4475) |
| 4484 | §S64 | SETTLED — fleet-wide decomposition; "still open after this study" list (4554) |
| 4562 | 🏁 §MILESTONE — generation SOLVED 95%+ | SETTLED-BUT-QUALIFIED — see the very next section: one of its two named "hells" reopened 2 days later on a different judge |
| 4619 | ⛔ REGRESSION FOUND + BISECTED (2026-08-24) | **OPEN** — `witness_4d_band_monotonic.js` (T2a) fails 14,267/43,000 on Hospital; real, reproducible, unresolved; needs a user design call between two already-shipped, independently-correct fixes |
| 4710 | §S65 | mixed — STAGE 1–3 SETTLED (✅), STAGE 4 explicitly NOT claimed; close-out (4903) names 2 process failures a filtered witness run caused |
| 4949 | §S66 — CORE PROGRAMME TEMPLATE | mixed — artifact SETTLED (shipped PR #1531); its "only authored layer" framing is OVERCLAIMED — see ledger #5; instantiation OPEN (RESUME, 5000) |
| 5028 | §S66.1 | SETTLED (rename shipped PR #1532) + 3 real OPEN defects found in the template itself (crew formula / gate hole / instantiation scope); instantiation must not start until Defect 1 is fixed |
| 5120 | §S67 | SETTLED — one live defect (§CREW_CAP_FINAL) found+stopped; 3 declared-vs-actual gaps left OPEN (5211) |
| 5227 | §S68 | SETTLED as diagnosis (no phase concept in the solver) — this is why `4D_BAR_MODEL.md` exists; the actual fix is OPEN here (RESUME, 5303) |
| 5319 | §S69 | OPEN — inversion built+tested on Hospital, NOT YET LIVE |
| 5387 | §S70 | OPEN — movie-vs-bars bound built; one wiring job left, unchanged from §S69 |
| 5464 | §S71 | SETTLED (an honest proven/not-proven scorecard) — and itself found midair got WORSE under the template path (Terminal +230, doubled); the resulting OPEN design decision (5523) is what `4D_BAR_MODEL.md`'s `needs()` providers now address |
| 5537 | §S72 | SETTLED, self-corrected in place ("what I got wrong, twice") — further refined by §S72.2 |
| 5589 | §S72.1 | SETTLED (what-if simulation: Terminal 513→48) — its "extracted" label for the 6 storey rows is imprecise, corrected by §S72.2 (banner added in place) |
| 5616 | §S72.2 | **SETTLED — the current, correct word on the storey-elevation gap.** The fix is ONE LINE inside the existing `room_walker.js` injector; no source IFC, no extractor change. This is the section `4D_BAR_MODEL.md` §10.3/§10.6 point to. |

## Corrections ledger — every claim later withdrawn, with both section numbers

1. **§DAY_GAP_WIP (line 1266)** → corrected by **§DAY_GAP_PHASE_OCC (line 1333)**, titled "TWO
   CORRECTIONS TO THE SECTION ABOVE, and the real defect."
2. **§HOSTED_ZONE_SUSPECT (line 1751)** claimed *"`sequence_rules.json` IS that template and it does
   work."* **FALSE — corrected by §S66 (line 4949–4957):** `sequence_rules.json` is only an
   `ifc_class → phase/sequence/trade` lookup, never a programme template. §S66's own words: *"The user
   asked for a core programme-template JSON MONTHS ago and was repeatedly told it existed. It did
   not."* No programme template existed until `4D_template.json` shipped 2026-08-25 (PR #1531).
3. **🏁 §MILESTONE (line 4562)** declared hell #1 ("Gantt Chart overstacked") closed via
   `deriveBandRanks` + the band-monotonic ladder. **⛔ REGRESSION FOUND (line 4619, 2026-08-24)**
   found `witness_4d_band_monotonic.js` (T2a) now fails 14,267/43,000 on Hospital — caused by two
   later shipped, independently-correct fixes (`§HOSTED_BEFORE_HOST` #1319,
   `§STAIR_FLIGHT_GRID_VISIBILITY` #1345) that each pull elements toward z-major geometry order at the
   expense of the rank-major band order this witness locks. **Unresolved as of this file's last
   entry** — needs a user design call, not a session's guess.
4. **REGRESSION FOUND's own first draft (same section, line 4619)** self-corrected in place: its
   initial "span 176d → 594d, a 3.4× blowup" reading used the witness's wrong 8h/day default instead
   of the product's real 24h/day; the corrected reading is 176d → 198d (1.12×, no blowup). *"The span
   claim in the first version of this section was wrong and is retracted"* (line 4645).
5. **§S66 (line 4962, "PRIMAL ROLE")** claimed `4D_template.json` is *"the only place in the 4D chain
   where a fact is AUTHORED rather than DERIVED."* **Corrected by §S66.1 (line 5042, "The §S66
   write-up overclaims one thing"):** `sequence_rules.json` also authors facts (productivity, crew
   size, class→phase). What `4D_template.json` actually authors is exactly three things: `calendar`,
   `duration_rule`, `dependencies`.
6. **§S72 (line 5537) + §S72.1 (line 5589)** — §S72 already flags itself in place: *"What I got wrong,
   twice: 1. Reported the elevations ABSENT. They are not. 2. Proposed synthesising elevations.
   Forbidden … Withdrawn."* (line 5545). **§S72.2 (line 5616) goes one step further:** the "extracted"
   storey rows §S72/§S72.1 measured are not extracted `IfcBuildingStorey` data — they are
   `room_walker.js`'s own COMPILED (injected) output. **Terminal has ZERO real extracted storeys.**
   The midair payoff numbers (513 → 48) are unaffected; only the word "extracted" was wrong. A
   correction banner was added at the head of §S72.1 pointing here.
7. **Cross-file:** `prompts/4D_BAR_MODEL.md` §10.3 item 5 originally said the storey elevations were
   "VERIFIED ABSENT" and that the fix was "fix the extractor" — both wrong, already corrected in place
   in that file once §S72.2 landed; see that file's own §10.6 WITHDRAWN list.

## Contradiction found, not resolved by re-deriving — flagged instead
None outstanding. One residual inconsistency was fixed with a one-line correction banner rather than
left standing or silently re-derived: §S72.1 (line 5589) still called Terminal's 6 storey rows
"extracted" after §S72.2 (line 5616) established they are compiled/injected, not extracted. The banner
points there; the numbers themselves were not touched.

---

# ▶ CURRENT STATE — 2026-08-15 session close. START HERE. Supersedes the "▶ NEXT SESSION" block
# immediately below (that block is 2026-08-13, now stale — kept for its still-relevant "3rd level
# hanging doors" thread, see the note at the end of this block, not as the active task list).

**For a fresh reviewer (this file is being handed to a second model for deep review): this project's
Prime Directive is EXTRACT/COMPUTE, NEVER INVENT — every number in this file traces to a real
extracted DB value or a witness/probe run, not a guess. Read `CLAUDE.md`'s Walker Doctrine +
FUNDAMENTAL LAW sections first (numeric proof only, never screenshots) before evaluating any claim
here.**

## What shipped 2026-08-15 (6 bim-ootb PRs, all merged, all measured on real data across 7 buildings)

1. **§SCHEDULE_CLASSIFY_DEDUP (PR #1374)** — collapsed 2 duplicate classification functions in
   `time_machine.js` into one delegate to `schedule_author.js`'s canonical versions. Zero behavior
   change (321,509 elements/8 buildings, 0 disagreements).
2. **§OG_HANG_BAND (PR #1375)** — widened the captured-path repair's hang-search radius 0.5m→9.5m
   (real carriers for ceiling-mounted equipment sit several metres away). Hospital floating -61%.
3. **§OG_HANG_WINDOW_BOUND (PR #1376)** — the wider search could push an element past its own Gantt
   task's authored finish date on 2/7 buildings (LTU_AHouse up to 79.1 days). Fixed: the repair now
   refuses any push that exits the element's own task window — stays honestly floating instead.
4. **§GANTT_GAP_CLAMP_SPREAD (PR #1377)** — elements were clustering at the two ends of a Gantt bar
   with a dead gap in the middle (a real 120-day cross-discipline wait, not a bug). Spread them evenly
   across the bar via additive gap-padding, clamped per-task at that task's own median gap × 500 —
   fidelity unchanged on 4/7 buildings, small honest cost on 1, better on 1.
5. **§MIDAIR_REPAIR_CONTACTGRAPH_DEDUP (PR #1378)** — `_midairRepair` had a byte-identical inlined
   duplicate of `_contactGraph`'s scan logic. Zero-risk dedupe, verified byte-identical.
6. **§OG_HANG_UNBOUND (PR #1382)** — the 9.5m cap from #1375 was itself redundant once #1376's
   window-bound guard existed (that guard already catches a bad match, by time not distance). Made
   the hang search unbounded, matching the generator's own equivalent logic. Floating -154 (-4.7%)
   across 7 buildings, **zero cost to window fidelity, byte-identical to the decimal on every
   building** — confirms the design reasoning was correct.

**Residual floating after all 6 fixes: 3090 elements across 7 buildings** (down from the session's
starting full-population baseline of ~4339). This number is the primary "chase to zero" target.

**⟶ UPDATED 2026-08-16: 3090 → 656 (-78.8%), §CROSSTASK_JUDGE_PARITY SHIPPED (bim-ootb PR #1387)**
— window-bounded judge-parity repair after `_ogSupportSweep`; window fidelity byte-identical on all
7 buildings. Closes open items 3 (IfcFooting — Hospital's 458 all repaired, zero in the final
byClass) and largely 4 (Hospital 643→39, Clinic 413→72 — both moved hard this time). The remaining
656 are ALL WINDOW_BLOCKED cross-task authoring conflicts — item 1 (§CPM_GENERATOR_UPSTREAM_SPEC)
is now the ONLY remaining lever, cleanly isolated. See §CROSSTASK_JUDGE_PARITY (spec + results) at
the end of this file.

## What's still open — in the order worth chasing next, each with a pointer to its full section

1. **§CPM_GENERATOR_UPSTREAM_SPEC candidate #2 — NOT built, the actual structural fix.** Root cause
   traced this session: `computeSchedule` (the generator) is already correct; compliance is lost in
   `deriveZones`'s coarse `(phase,storey)` task grouping and the per-task rescale's zero cross-task
   awareness. This is the fix that would make BOTH the residual floating AND item 2 below actually
   safe to ship — search `§CPM_GENERATOR_UPSTREAM_SPEC` for the full trace and blast radius (24 files).
2. **§MEP_PROXY_PHASE_RECLASS — built, measured, net WORSE, NOT shipped.** 85% of Hospital's floating
   equipment is MEP wearing the wrong (too-early) time slot by classification mistake — the fix for
   THAT is a one-line `rates.js` reclassify entry, already written and sitting uncommitted in
   `/tmp/wt-mep-reclass` — but shipping it as-is makes total floating net +28 WORSE (it displaces
   other, previously-correct MEP elements sharing the same zone). Needs item 1 above before it can
   ship safely. Search `§MEP_PROXY_PHASE_RECLASS` and `§FLOATING_TIMING_ROOT_CAUSE`.
3. **`IfcFooting` — 458 elements, Hospital's single largest remaining floating class, unexplored.**
   Completely untouched by every hang-band fix this session because a footing is normally a CARRIER
   (Substructure/seq1), not a dependent — its floating is a DIFFERENT relation (likely bearing-side,
   not hang-side). No probe has looked at this specifically yet. Search `§OG_HANG_BAND`'s residual
   note.
4. **Two buildings (Hospital, Clinic) got ZERO improvement from §OG_HANG_UNBOUND** — the unbounded
   tier found nothing new for them specifically, unlike the other 5. Not investigated. Search
   `§OG_HANG_UNBOUND`.
5. **`§CARRIER_DEDUP_DERISK_STUDY`'s 3-way shared-primitive merge — NOT attempted, deliberately.**
   `hangGate` turned out to be a closure embedded in the generator's single-pass placement loop
   (shared mutable state), structurally bigger than "one shared primitive" — a real, harder refactor
   than first scoped. The actual behavioral bug (item in §OG_HANG_UNBOUND above) is already fixed
   without it; this is now pure code-quality cleanup, not a correctness lever.
6. **Terminal's Gantt-bar spread SHAPE got measurably worse under §GANTT_GAP_CLAMP_SPREAD** (zero
   fidelity cost, but KS-uniformity 0.09→0.28) — several of its tasks have real gaps at genuinely
   different scales that one task-wide median threshold can't handle. Needs a per-cluster/local-
   outlier detector, not a bigger constant. Search `§GANTT_GAP_CLAMP_SPREAD`.
7. **§TIER2_AFTER_TIER1 / zone dead-air — now has a precise mechanism, still not fixed.** The
   `phaseTrade[storey][seq]` cross-discipline trade gate creates genuine multi-week gaps inside a
   single Gantt bar (worked example: Hospital's Architecture/Level-4, 1571 elements day 0-12, a real
   120-day wait, 2779 elements day 133-135) — confirmed deliberate design, not a bug. The honest
   display-side fix (split the task into authored sub-bars at its own internal `phaseTrade` boundary,
   so the gap reads as a real inter-task transition instead of "empty bar") is named but not built.
   Search `§GANTT_WINDOW_FIDELITY_AND_SPREAD` Q2.
8. **§XRAY_STAGING_REMOVED's nondeterminism — unexplained.** Identical `_GANTT_CACHE_VERSION` produced
   `staged=0` on 5 consecutive fresh sandbox runs but `staged=415` in the user's own live console.
   Likely object/map iteration-order-dependent somewhere in `_ogSupportSweep`/`materializeZones`/the
   `_cap` overlay. Not chased.
9. **§TIME_MACHINE_CONSOLIDATION_SPEC candidate #2 (full 7-way structural split of the 9,016-line
   `time_machine.js`) — deferred**, not a correctness item, needs its own dedicated session once this
   file's churn rate (158+ commits, several more today) settles.
10. **The "3rd level hanging doors" report (2026-08-13, below) was never explicitly re-verified as
    closed by name** — it's very likely subsumed by the general floating-element work since
    (§GROUNDED_OVERRIDE_FIX, §OG_HANG_BAND, §OG_HANG_UNBOUND all touch the same symptom class), but
    nobody has re-run a live bake against that specific original report to confirm. Worth a direct
    check before assuming it's fixed.

---

# ▶ SUPERSEDED — 2026-08-13 "NEXT SESSION" block, kept for the still-unverified doors thread only
# (see item 10 above). Do not treat anything below this line as the current task list.

**One open item, real and unreproduced. Chase it with a live baking test, not more node-side probing
— every node-side avenue below has been checked clean.**

## ⛔ THE ONE OPEN ITEM — "3rd level hanging doors" (user report, 2026-08-13, verbatim: "Nope, the
3rd level again.. with the hanging doors")

**Context this landed in:** same session shipped two real fixes for the user's broader "still
hanging in mid air" report — §GROUNDED_OVERRIDE_FIX (bim-ootb PR #1338, 1,105 previously-invisible
floating elements across 7 buildings, see that section below) and, earlier the same day,
§TIER2_PER_ELEMENT_CLAMP + §SHIFT_HOURS (PR #1333). After both were live, the user said "still
hanging in mid air" once more, I asked what specifically, and got the doors report above — likely
HHS (never confirmed — the user did not answer "is this HHS" before ending the session) and likely
the SAME class of bug already once reported+fixed there (§CURTAIN_WALL_OPENING / #1323, "HHS
Level-3 doors... worst 9.5d → 0/37, 0.0d").

**Checked, all clean — do NOT re-derive these, the numbers hold:**
1. The shipped host-check itself (`ScheduleGate.openingPairs`/`openingBrackets` — real XY-bbox
   overlap + Z-bracket, the EXACT relation `openingGate` enforces at generation time): 0% early on
   gen/remap/display for HHS, checked BOTH at schedule_gate.js's 8h internal default AND at the
   live 24h shift (`computeSchedule(..., 24)`), both AFTER §GROUNDED_OVERRIDE_FIX landed.
   `viewer/tests/witness_curtain_wall_opening.js` — still 5/5 clean.
2. §GROUNDED_OVERRIDE_FIX's own hidden-violation list for HHS: 15 elements, all `IfcMember`/
   `IfcColumn` in the Superstructure phase — none are doors, windows, or curtain-wall parts.
3. A LOOSE "any wall within 3m XY" proximity check DID flag HHS Level-3 doors (gaps 0.2–4.9d) — but
   this is confirmed a false positive: it catches walls that merely happen to be nearby (corridor
   walls, adjacent rooms), not the door's real host (which requires actual XY-bbox overlap, per
   `openingBrackets`). Do not re-use this check as evidence; it was built and rejected same-session.

**What was NOT done, and is the actual next step:** everything above is a NODE-SIDE, generated-
timeline re-derivation. None of it has looked at the REAL browser-rendered movie for HHS with fresh
eyes — no live bake, no `§`-tagged log read from an actual `injectGantt()` run in the browser, no
confirmation of which building/level the user meant. Per this project's own FUNDAMENTAL LAW
(`CLAUDE.md`), the next session's job is NOT to eyeball a screenshot either — it is to:
1. **Confirm the building.** Ask, or bake all buildings' Level-3-equivalent and check §-logs for
   each — do not assume HHS from context alone (the user never confirmed).
2. **Run a live bake** (`scripts/gate_4d.sh` won't show this — it never renders) and read the
   `§DOOR_WINDOW_HOST_WALL_DISPLAY openFixed=` and `§CURTAIN_WALL_OPENING`-tagged console lines the
   REAL `injectGantt()` call prints, not a node-side re-derivation of the same function.
3. **If the numeric logs are clean but the user still sees it**, the gap is almost certainly NOT in
   scheduling at all — check the RENDER side next: does `renderAtTime`'s frontier/reveal logic
   correctly show a door's HOST WALL as "already built" the instant the door itself reveals, or is
   there a one-frame/one-tick lag where the door pops in visibly ahead of its wall's own mesh update?
   That would look exactly like "hanging" without any schedule number ever being wrong — a rendering-
   sync bug, not a 4D-generation bug, and nothing in this file's toolset checks for it.
4. **Reusable tool**, already built for this: `bim-compiler/scripts/probe_midair_grounded_and_doors.js`
   — has `§LEVEL3_DOOR_CHECK` and `§HHS_STAIR_CHECK` wired in (env: `VIEWER_DIR`, `BLD_DIR`, `ONLY`).
   Extend it rather than writing a new probe from scratch.

### 2026-08-13 SESSION 2 (same day, continued) — live-bake attempt made, machine restarting, resume here
User ran a REAL live MaxQ bake in-browser and pasted the console. Findings, real but incomplete —
none of this closes the item, it narrows the next step:

- **NEW symptom, separate from the doors report:** "stairs on top level coming on first" — reported
  against an OLDER already-downloaded movie (`~/Downloads/BIM_MaxQ_HHS_Office_Federated_*.mp4`, several
  dated 2026-08-10→13), visible around **the 39s mark**. NOT yet cross-checked numerically — the node-
  side `§HHS_STAIR_CHECK` (see item 4 above) was never actually RUN this session, only confirmed to
  exist in the probe script. **Run it first thing next session**: `BLD_DIR=~/bim-ootb/buildings
  ONLY=HHS_Office_Federated node bim-compiler/scripts/probe_midair_grounded_and_doors.js` and read the
  printed stair start times.
- **The live console capture was PARTIAL, not proof either way.** User cancelled the bake at
  `§MAXQ_CANCEL` frame 59/976 (Alt+C toggle=cancel) — only 3.9s of a ~65s intended film
  (`§MAXQ_CANCEL_PARTIAL stitching 59 frames`). Whatever the stairs bug is, this capture didn't run
  long enough to show it either confirmed or absent.
- **§CURTAIN_WALL_OPENING / §DOOR_WINDOW_HOST_WALL_DISPLAY are REAL and live** — confirmed via `git grep
  origin/main` inside `~/bim-ootb/viewer/schedule_gate.js` (do NOT trust the local `~/bim-ootb` working
  tree as canon right now — `git status --branch` shows it **55 commits BEHIND origin/main, 1 ahead,
  and dirty** — uncommitted deletions incl. `.github/workflows/curate-release.yml`,
  `buildings/patches/Clinic_extracted.db.sql` — needs investigation before any fetch/merge, don't
  blindly fast-forward or reset it). Also confirmed: `bim-compiler/deploy/dev` is the WRONG tree to grep
  for these tags — it doesn't have them; the real source is bim-ootb's `viewer/`. Don't repeat that
  dead-end.
- **Why the pasted console never showed those tags: they print at SCHEDULE-GENERATION time, not on
  every movie bake.** If the 4D schedule was already generated/cached earlier in the browser session,
  hitting Alt+C to bake just replays the cached schedule — no regeneration, so `§CURTAIN_WALL_OPENING`/
  `§DOOR_WINDOW_HOST_WALL_DISPLAY` never reprint in that window. This is consistent with what was
  pasted (all `§MAXQ_FRAME`/photoreal-still chatter, zero schedule diagnostics).
- **Version of the tested build is UNCONFIRMED.** User asked "is this latest v?" — could not answer
  from the pasted log (it starts mid-session, past any page-load version print) and I do not have a
  confirmed live-viewer URL to check server-side (do not guess one). Next session: check DevTools →
  Application → Service Workers directly, or scroll to the very top of a fresh console capture.
- **Side finding, not this bug but worth a look sometime:** the pasted log shows `§STILL_REFINE` /
  `§PHOTO_AO` / `§TRIPLANAR_PERF` / `§NIGHT_STILL_LIGHTS` (the PHOTOREAL_STILL_RENDER still-image
  pipeline) firing and self-cancelling on EVERY single `§MAXQ_FRAME` during the movie bake
  (`perFrameMs` regularly 1500-1900ms, much of it AO/triplanar/shadow-reassert work that immediately
  cancels itself as "interaction"). That doc says these passes are meant to be "still-only fold — Alt+G
  untouched." If they're really running full per-frame during MaxQ bakes too, that's wasted work on
  every movie, independent of the stairs/doors question — not investigated, just noticed.

**NEXT SESSION — START HERE (in order):**
1. Run `§HHS_STAIR_CHECK` node-side (see above) — first real number on the stairs symptom. **It now
   also discriminates the two code-level hypotheses named in SESSION 3 below** — log the promoted
   stair's `seq`/`phase` and whether its GUID is in the orphan list, not just its start day.
2. Reconcile `~/bim-ootb`'s divergence (55 behind / 1 ahead / dirty) before treating it as canon.
3. Run a FULL, uncancelled live bake for HHS from a FRESH page load (forces schedule regeneration —
   captures the generation-time diagnostics too), console captured start-to-finish, not partial.
4. Cross-reference: does the top-level stair's node-side start time match what the movie shows at
   ~39s, or is the node-side number clean while the render still shows it early (→ render-sync bug,
   not scheduling — step 3 of the original playbook above, still unexplored)?
5. Confirm which exact `~/Downloads` mp4 the user means, and confirm the tested build's version —
   **check the mp4's file timestamp against `#1338`'s merge time (2026-08-13 13:23) first**; every
   mp4 named so far is dated 2026-08-10→13, i.e. could predate the fix entirely (SESSION 3, lead C).

### 2026-08-13 SESSION 3 (code archaeology only, per user instruction — no probe run, no live bake)
User: mp4 results still show stairs appearing without support. Told explicitly not to test/check
further this pass — find the cause by reading `git log`/diffs on `origin/main` (bim-ootb, 56 commits
ahead of the local dirty checkout — read via `git show origin/main:<path>`, never the stale working
tree) instead of computing/probing. Three candidate causes found, NOT ranked by test, only by code
reading — `§HHS_STAIR_CHECK` (already built, see item 4 in the open item above) is what turns these
into a verdict; none of them was run this pass.

**A. `_promoteRoofLoadPath` is class-blind exactly where a TOP-LEVEL stair would trigger it — never
previously checked in this direction.** `time_machine.js:3429` filters candidates by `el.cls ===
'IfcSlab'` only — no stair/roof discriminator anywhere in the function, same class-blind shape this
file already names for door/roof/stairs (§STRUCT_POOL_UNGATED, line ~274: "the generalized statement
of the 'one class at a time' bugs") but that line was only ever checked for the "never gated" (seq=4,
structure pool) direction. The promotion rule (`clauseA = el.base_z > wallMidheight` AND
`!above.length`, `time_machine.js:3448-3455`) is: "sits above its wall-carriers' midheight, with no
wall standing on top of it" — which is also the exact geometric signature of the TOPMOST flight of a
stair (nothing above it, by definition of being the top run). If it fires, `seq` flips 4→8 and the
element moves from `placeStruct` (gated only by `geoGate`) into `placeNonst`
(`schedule_gate.js:738-753`), which adds `wallGate` — built for a roof DECK resting ON TOP of its
carrying walls (`S.top_z` within `GAP`=0.5m of the promoted slab's `base_z`, `schedule_gate.js:513-
526`) — a band relationship a stair flight is unlikely to ever satisfy, so `wallGate` silently
contributes `baseMs` (no constraint) for it. **Not conclusively the cause on its own** — `geoGate`'s
generic `below` clause (`schedule_gate.js:374`, `S.base_z < el.base_z - EPS` + overlap, pool-
independent) should still catch a genuine structural support below regardless of promotion, PROVIDED
that support is a `seq<=4`/promoted-slab pool member already placed in `grid` when this element is
reached — so promotion alone degrades the *wall-carrier* check, not necessarily the *below* check.
Needs the promoted stair's actual `seq` read off a real run to confirm this fires at all for HHS's
flights, not asserted here.

**B. The orphan population is untouched by today's fix, by explicit design — not previously connected
to stairs.** §GROUNDED_OVERRIDE_FIX (#1338, `time_machine.js:4772-4788`) only un-exempts elements
whose `contacts[i]` list is non-null (a real geometric match WAS found) but were wrongly skipped via
`grounded[i]`. The `!list` path — genuinely no bearing/carrier/embedded match within `GAP`=0.5m
(`schedule_gate.js:37-39`) — is untouched, and is explicitly, permanently exempt by design: "ORPHANS
ARE REPORTED, NEVER MOVED... an extraction/authoring fact" (`time_machine.js:4728-4731`). HHS carries
36 locked orphans (`ORPHAN_BASELINE.HHS_Office_Federated = 36`, `witness_midair_zero.js:163`) —
**none has ever been identified by class**, because `§HHS_STAIR_CHECK` (the probe that would show
this) was never actually run. A stair flight's sloped/diagonal bounding box is a plausible way to miss
a landing's top within 0.5m (the 4 flights already found via `probe_named_element_times.js
NAMEQ=Stair` DID register real contacts — day 8.5/49.7 — so this would have to be a stair not caught
by that NAMEQ filter, or a genuinely different element).

**C. Cheapest explanation, this project's own most-repeated landmine, not ruled out.** Every mp4 named
in this thread so far (`~/Downloads/BIM_MaxQ_HHS_Office_Federated_*.mp4`) is dated 2026-08-10→13 —
`#1338` (GROUNDED_OVERRIDE_FIX) merged 2026-08-13 13:23, and `#1333` (SHIFT_HOURS/TIER2_CLAMP) the
same morning. Unless the specific mp4 the user means postdates 13:23 AND came from a FRESH page load
(forces `kernel_ops` re-materialization per `_genVersion`/`_GANTT_CACHE_VERSION`, `_GANTT_CACHE_VERSION`
now 17), it could be showing pre-fix behavior by construction, zero code wrong today. This file's own
LANDMINES section already names this exact failure mode twice ("Two 'still broken' reports were stale
caches"). Item 5 above (confirm the mp4's timestamp) is the cheap check that rules this in or out
before touching any code.

**Do not "fix" A or B speculatively — `§HHS_STAIR_CHECK` distinguishes all three in one run** (seq/
phase of the flagged stair rules A in/out; orphan-list membership rules B in/out; a fresh-load re-bake
rules C in/out). Fixing without that number risks the same "band-aid, not generalised" mistake this
file's acceptance bar was written against.

### 2026-08-13 SESSION 4 — HHS stair CONFIRMED (user-supplied evidence) + a second, separate report:
### Hospital "lots of hanging MEP" — both diagnosed from real data (`probe_midair_census.js`), no
### visual/screenshot check, per user instruction both times this session
User supplied the discriminator SESSION 3 asked for without a new bake: *"see latest Downloads/ HHS
mp4 at Day 50 the staircase is hanging as proof."* Then, separately: *"TimeMachine 4D generate for
Hospital has lots of hanging MEP in the air. Thus again in this session, review gantt charts rather
than doing visual check."* Both answered by running `viewer/tests/probe_midair_census.js` read-only
against the real shipped DBs, on a fresh `origin/main` worktree (`b71771d` — `#1343`, includes
`#1338`) — no browser, no bake, no screenshot; the log is the proof, per this file's own FUNDAMENTAL
LAW. **One housekeeping note first:** the probe itself was found DEAD — same class of defect
§DAY_GAP_TAIL found in `witness_midair_zero.js`/`witness_kernel_ops_sched_version.js` (#1321/#1324):
`_buildXrayElements` calls `_zoneIndex()`/`_zoneOf()` (added by #1313) and this probe's slice list was
never updated, so it has thrown `ReferenceError: _zoneIndex is not defined` and measured nothing since
#1313 — a THIRD tool in this same lane silently dead the same way. Patched read-only in the throwaway
worktree with the exact #1321 idiom (optional zone-helper slicing); **not committed, not shipped** —
flagging it here so a future session fixes it for real rather than re-discovering it a fourth time.

**HHS "Day 50 stairs" — CONFIRMED, and it is NOT a regression of §MIDAIR_REPAIR, it is the risk that
fix's own header already named and deferred.** The probe measures the DISPLAY timeline **before**
`_midairRepair` runs (it slices `_twoTierRemap` but not `_contactGraph`/`_midairRepair` — same
"before" state §MIDAIR_REPAIR's original 2026-08-12 measurement used). Hit directly:
```
§MIDAIR_WORST HHS_Office_Federated IfcSlab seq=4 phase=Superstructure bz=5.85 start=28.2d
  firstSupport=148.4d early=120.1d "Stair:Massiv - Stufen Naturstein:577000:1"
```
This is the SAME bz=5.85 flight §MIDAIR_REPAIR's 2026-08-12 pass already found and moved (day 9.6 →
"49.7d" in that pass's numbers) — the absolute days differ from that old measurement because #1319/
#1323/#1333/#1338 all changed the underlying schedule since, but the STRUCTURAL fact is identical:
this element is real structure (`IfcSlab`, seq=4) whose nearest real contact does not become visible
until **~120 days after** the un-repaired display would show it. `_midairRepair` (the shipped pass
the movie actually uses) moves it later — to the contact's **APPEARANCE**, not its **FINISH** — by
design, documented in `_midairRepair`'s own header as "the WEAKEST rule that closes the gap." That
same header also names, measures, and explicitly defers the alternative: *"THE STRICTER END-BASED
BAR... is measured and deliberately NOT enforced... Revisit only on a real report that a half-built
support reads as floating"* (`time_machine.js:4598-4613`). **The user's Day-50 report is exactly that
real report.** It is also independently counted, not invented: this session's probe shows HHS's
un-repaired `strictBar_noFinishedContact=217` (elements whose earliest contact hasn't even FINISHED
when they appear) and the shipped `_midairRepair`'s own `stats.strictResidual` line (never yet read
this session, per the no-new-bake instruction) is the exact number that would confirm this stair is
in that surviving population. **Do not re-attempt the GLOBAL end-based bar** — §MIDAIR_REPAIR's own
header already measured and rejected it project-wide (Terminal: 700 moved, 624 still violating;
"reaching it for real means serializing neighbours ... exactly what §4D_BAND_MONOTONIC rules out").
The lever this report opens is a SCOPED one: apply the end-based (finish-time) bar only to the small
`strictResidual` population a repair run already isolates, not to every element — untried, because
this is the first live case that needed it.

**Hospital "lots of hanging MEP" — CONFIRMED, and it is the permanently-exempt ORPHAN population,
not a bug in any gate.** Orphans (`supporters === 0` — literally nothing anywhere in the model
registers a bearing/carrier/embedded contact for this element, `GAP`=0.5m tolerance) are, by
`_midairRepair`'s own explicit design, **never moved by any repair, at any tier** — "an
extraction/authoring fact ... it hangs at every instant, including the last frame"
(`time_machine.js:4728-4731`). Hospital carries 35 of them (`ORPHAN_BASELINE.Hospital = 35`, already
LOCKED in `witness_midair_zero.js` — a known, counted, never-hidden number), but **no prior session
ever broke that count down by class** — this is the first time it has been asked. Measured this
session:
```
§ORPHAN_CLASSES Hospital IfcBuildingElementProxy:21 IfcPipeSegment:11 IfcLightFixture:1
  IfcDistributionControlElement:1 IfcPipeFitting:1
```
14 of 35 (40%) are explicitly-MEP IFC classes (pipe segments/fittings, a light fixture, a distribution
control element). The other 21 are `IfcBuildingElementProxy` — Hospital's own `§MIDAIR_WORST` output
(the non-orphan, still-repairable population) shows what that class means IN THIS MODEL: *"M_Supply
Diffuser_HEPA - Rectangular Face Roun..."* — an HVAC diffuser authored as a generic proxy, not an IFC
MEP class. If the 21 orphaned proxies follow the same authoring pattern (plausible, not confirmed
without opening each GUID), **the true MEP share of Hospital's 35 permanent orphans could be the
large majority, not just the 14 explicitly-MEP-classed ones.** This is consistent with, and gives a
name to, the same scope limit `§HANG_NEAREST` (#1278) already measured and left alone: that fix only
rescues BIG elements (`bboxVol > BIG_ELEMENT_VOL`) hanging outside the standard band; the probe/repair
layer (`_contactGraph` in `time_machine.js`) never received that rescue at all (only
`schedule_gate.js hangGate` did — see the §DAY_GAP_TAIL entry above, "no §HANG_NEAREST fallback"), so
ordinary-sized suspended MEP (pipes, diffusers, fixtures — none of them BIG) that hangs more than
0.5m from its true structural carrier has **no rescue anywhere in the codebase, at either the
generation or display layer.** Not a new mechanism to build blind — the concrete next step is
`§HANG_NEAREST`'s own measured band (0.5–9.5m, Hospital ducts p50 1.22m) applied to `_contactGraph`
the same way it was applied to `hangGate`, then re-run this same probe to see how many of the 35 (and
the LTU/Clinic/Terminal/JKR/HHS/Duplex orphan counts alongside it) move from "permanent orphan" to
"real, repairable contact." Untried — flag for the user's call before building it, since the last
attempt to widen this exact relation (the upper-bound experiment, §DAY_GAP_TAIL above) was measured
and rejected on its own numbers; this is a different, narrower widening (an existing rescue ported to
a second call site, not a new threshold), but still needs the same measure-before-ship discipline.

### 2026-08-13/14 SESSION 5 — both SESSION 4 levers BUILT and MEASURED. Both FAILED. Nothing shipped,
### nothing committed — `git status`/`git diff` on the fix worktree are clean, matching origin/main
### exactly. This is real information, not a stall: two concrete hypotheses are now closed, not open.
User: *"find solution this session."* Built both levers named above, in a dedicated worktree
(`fix/hangnearest-display-and-strict-residual` off `origin/main` `b71771d`), ran the REAL witness
(`witness_midair_zero.js`, not the probe — the probe never runs `_midairRepair` at all, so it cannot
prove or disprove either fix). Both failed on measurement, for two different, instructive reasons.

**Lever 1 (Hospital MEP orphans) — `§HANG_NEAREST_DISPLAY`: ported hangGate's nearest-carrier-above
rescue into `_contactGraph` (BOTH `_midairRepair` definitions — the standalone one `_midairAudit`/the
dead copy call, AND the separately-inlined copy that actually ships per declaration hoisting; missing
the second one was caught before it mattered, not after) plus the witness's own independent `census()`.
Correct, safe, zero regressions (38/38 witness pass, W-MZ-2 stayed 0/0/0/0/0/0/0, no baseline moved)
— and MEASURED TO DO NOTHING: `ORPHAN_BASELINE` was byte-identical before/after on all 7 buildings
(Hospital still exactly 35). Suspecting the BIG_ELEMENT_VOL=1.556m³ gate was excluding Hospital's
actual small pipes/fixtures, the gate was removed ENTIRELY (test-only, size-blind) and re-measured:
**still byte-identical, zero orphans rescued anywhere, on any of the 7 buildings, size gate or not.**
This is the real finding: Hospital's 35 orphans (and LTU's 865, Terminal's 7, etc.) don't merely hang
too far from a real carrier for GAP/BIG-VOL tolerance — **they have NO XY-overlapping neighbour AT
ALL, in any direction, at any distance, in this spatial index.** `_contactGraph`'s own `cands` list
(every element sharing so much as one grid cell in XY) is empty for these elements. No nearest-carrier
widening of any shape can rescue an element with zero candidates full stop — that is not a scheduling
gate problem, it is a geometry/extraction fact: either these elements are genuinely spatially isolated
from everything else in the model (a small floating diffuser mounted to something the extractor never
captured), or their own bbox is degenerate. **Closes §HANG_NEAREST_DISPLAY as a dead end for the
CURRENT 7 buildings** — do not re-attempt any variant of "widen the carrier search" for this specific
report; it was tried in its most permissive possible form (no size limit, no band limit) and still
found nothing. The real next step, if this is worth pursuing, is OUTSIDE this codebase's remit per
PRIME RULE (EXTRACT OR COMPILE ONLY): pull the actual GUIDs for Hospital's 35 orphans (`census()`'s
`orphanBy`/the probe's `§ORPHAN_CLASSES` already names the classes) and check the SOURCE IFC — do
these elements have a real `IfcRelConnectsElements`/containment relationship the extractor dropped, or
are they genuinely unconnected in the original model? That is a data question, not a schedule-code one.

**Lever 2 (HHS Day-50 stair) — `§STRICT_RESIDUAL_RESCUE`: a single, non-iterated pass pushing the
small `strictResidual` population (contact hasn't FINISHED when the element starts) to the earliest
finish among its contacts, run once after the existing start-based fixpoint, in both `_midairRepair`
copies.** MEASURED REGRESSION, caught immediately by the witness, not shipped: **W-MZ-2 — the
acceptance bar itself, "zero elements appear before what they touch," the user's own words, the ONE
invariant this whole lane exists to hold at zero — FAILED on all 7 buildings** (Terminal 47, Hospital
66, Duplex 5, HHS 29, Clinic 89, LTU 1023, JKR 56; was 0/0/0/0/0/0/0 before). Root cause, read
directly off the failure, not guessed: pushing element `i` later by Fix 2 can push it PAST some OTHER
element `X` that has `i` as its own contact — `X`'s start was fine against `i`'s OLD (earlier) time,
now `i` sits later than `X`, recreating exactly the start-based violation PASS 1's fixpoint had already
eliminated. A single non-iterated pass cannot see this, because it runs strictly after PASS 1's
fixpoint has already converged and never re-checks it. **This confirms, empirically, exactly what
`_midairRepair`'s own header already warned about the GLOBAL version** ("the contacts move too, so the
bar recedes as you chase it") — it turns out to apply to a SCOPED single pass too, not only a fully-
iterated global one; scoping down the POPULATION doesn't fix the INTERACTION. The only way to make
this lever safe is to re-run PASS 1's start-based fixpoint again after Lever 2's pass (bounded rounds,
alternating), which is the exact "joint fixpoint" shape `_midairRepair`'s header ALSO already tried
once (with a different second rule, `_tierAuditRegate`) and rejected for cost (4 rounds, 7,650 pushes,
0.8s→14.8s, Hospital still not fully clean). Untried specifically: alternating PASS 1 with THIS
end-based rescue (not `_tierAuditRegate`) — different pairing, might converge faster or cleaner since
both rules are now scoped to the same `_contactGraph`, but that is a real, measured claim to make
next, not an assumption to ship on. **Do not re-attempt a single-pass version of this lever** — it is
now proven, not merely suspected, to break the acceptance bar.

**Where this leaves the two user reports:** neither is fixed. Both are real, both are now understood
at the code level far better than before this session (the exact mechanism, the exact reason two
"obvious" scoped fixes don't work), and both have a named, concrete, NOT-yet-tried next step (extraction-
level GUID check for Hospital; alternating PASS-1/end-based-rescue fixpoint for HHS) rather than a
vague "investigate further." Per this file's own doctrine (§4D_BAND_MONOTONIC, §DAY_GAP_TAIL,
§STRICT_RESIDUAL bar all being previously-measured-and-rejected shapes), shipping either lever anyway
would have been exactly the "band-aid, not generalised" mistake the acceptance bar was written to
prevent — a fix that either does nothing (Lever 1) or actively violates "zero items hanging" while
claiming to fix a hanging report (Lever 2). Worktree removed, branch deleted, nothing committed.

### 2026-08-14 SESSION 6 — §STAIR_FLIGHT_GRID_VISIBILITY: the HHS Day-50 landing's ACTUAL root cause,
### found one level deeper than SESSION 4/5's framing, via direct code+data measurement, not a live bake
User asked why the flagged HHS `577000` landing (bz=5.85) has "no siblings" and proposed a bottom-up
walker-DAG rule ("a lower floor's stair must come from below"). Investigation (read-only SQL against
the live-served `HHS_Office_Federated_extracted.db`, then a throwaway diagnostic slicing the real
`computeSchedule`/`_twoTierRemap`/`_midairRepair` functions verbatim — not invented, not eyeballed)
found: (1) the landing is real, not orphaned — it's the mid-landing of stair assembly `577000`,
sandwiched geometrically between `IfcStairFlight :1` (z 3.39–7.01) and `:2` (z 5.9–7.48), confirmed by
AABB overlap in all three axes; (2) **the bottom-up DAG rule the user described already exists in
`schedule_gate.js` — `geoGate`/`structIdxGrid` — and `placeStruct` already calls it.** The actual gap is
one level more precise than "stairs aren't gated": **`IfcStairFlight` is classed `seq=6` (routes through
`placeNonst`, the full gate set, correctly gated itself) but `structIdxGrid`/`grid` — the ONE index
`geoGate`/`hasBearingBelow`/the DAG edge-builder all read to find "what's below me" — only admits
`seq<=4` (structure pool) or `isPromotedSlab` members (`schedule_gate.js:632,415`). A flight is real
structure but is invisible AS SUPPORT to anything resting on it, because it's never inserted into
either index.** The landing (seq=4, IS in the index) calls `geoGate`, scans an index that was never told
its own flight exists, finds nothing, and schedules unconstrained.

**Measured, throwaway script (`sliceFn`'d real functions verbatim, same idiom as
`probe_named_element_times.js` — not committed):**
```
RAW (computeSchedule, pre-remap):  flight1 end=93.12d   landing start=28.22d   gap=-64.89d
FINAL (post _twoTierRemap+_midairRepair, what the movie plays):
                                    flight1 end=189.21d  landing start=148.36d gap=-40.85d
```
The SHIPPED `_midairRepair` (§MIDAIR_REPAIR, #1338/#1343 both already in this tree) is NOT blind here —
`_contactGraph` is class-blind by design and correctly found BOTH flights as real geometric contacts,
then pushed the landing to the EARLIEST one's appearance (flight2 remap-start=148.41d) per its own
documented "weakest rule" design. The residual -40.85d gap survives because flight2 displays BEFORE
flight1 post-`_twoTierRemap` (backwards from real build order — a separate remap-ordering artifact,
**not investigated or fixed this pass, named here as a follow-on, not conflated with today's fix**).

**Fix, one narrow predicate, two call sites — mirrors the ALREADY-TRUSTED `isPromotedSlab` pattern
exactly (a `seq>4` class already admitted to `structIdxGrid`/`grid` as a real support source without
becoming a structure-pool member for gate-ROUTING purposes):** add `e.cls === 'IfcStairFlight'` to the
admission clause at `schedule_gate.js:632` (DAG edge-building index) and `:415` (runtime placement
index). Does NOT touch `placeStruct`/`placeNonst` routing, `isPoolE`/`elPool` semantics, or any gate
function body — flights keep going through the full `placeNonst` gate set unchanged; they only become
visible to OTHERS as a legitimate bearing-below neighbour. Acyclic by the same argument the code already
relies on for pool members (`edgeBelow` is a strict `base_z` inequality, so flight1≠flight2≠landing's
three distinct base_z values admit no 2-cycle among them).

**Why this differs from the two reverted widening attempts (§STRUCT_POOL_UNGATED):** those widened the
STRUCTURE POOL itself (`restsOnGate` unconditional, or the roof carrier search) — broad, and broke real
seq≤4 elements that legitimately have nothing below them (ground slabs), collapsing `witness_tier_serial
_display.js`'s locked baselines on 5/7 buildings. This fix widens neither the pool nor any gate's
routing — one unambiguous IFC class added to a support-visibility index, same shape already shipped and
trusted for `isPromotedSlab`.

**On the user's forward-precedence idea ("next level can't happen until its stairs are made"):** this
fix is the narrow, already-proven-safe realization of that intuition — real elements that geometrically
REST ON a stair flight (this landing, and by the same mechanism anything else bearing on a flight
anywhere in the 7 buildings) will now correctly wait for it. It does **not** decide the broader claim
("no work anywhere on the floor above until the stair exists") — that collides with the still-⛔-open
temporary-works/shoring question (OPEN THREADS item 6b) and needs a user product call, not a scheduling
inference, per this file's own no-invent discipline.

**Witness plan (must hold before shipping):** `witness_tier_serial_display.js` clean on all 7 buildings
(the exact locked detector that caught both prior widening attempts) + `witness_midair_zero.js`
acceptance bar 0/0/0/0/0/0/0 or better + direct re-measurement of the HHS `577000` landing gap via the
same throwaway diagnostic.

**RESULTS — ✅ SHIPPED, bim-ootb `fix/hhs-stair-geogate` (2026-08-14):**
- HHS `577000` landing, direct before/after: RAW (generative, pre-remap) gap went from **-64.89d to
  +1.90d** (correctly gated). FINAL display gap (what the movie plays, post `_twoTierRemap` +
  `_midairRepair`) went from **-40.85d to -0.11d** — essentially closed, matching `_midairRepair`'s own
  documented "push to contact's appearance, not finish" design almost exactly.
- **First cut caused a real regression, caught before shipping, not after:** making flights grid-
  visible without ALSO marking them "pool" (`isPoolE`/`elPool`, the same status `isPromotedSlab` already
  carries) let them receive `contained`/`carrier` edges from both directions — exactly what this file's
  own acyclicity guarantee excludes for non-pool members. Full-HHS run: `§SUPPORT_CYCLE cycles=0→6721`
  (98% of the building, sample = ordinary columns/floor slabs, nothing stair-specific). Fix: extend
  `elPool`/`isPoolE` with `isStairFlight()` everywhere `isPromotedSlab()` already appears (geoGate,
  hangGate, edge-building) — cycles back to 0, same building.
- **Second cut also caused a regression, also caught before shipping:** mirroring the same admission
  rule into `auditFloating`'s own `structGrid` (so the "judge" stays aligned with the "gate," per this
  file's own stated architecture rule) made the witness newly detect a PRE-EXISTING, unrelated weakness
  in `_twoTierRemap` (it reorders stair flights relative to each other — flight 2 can display before
  flight 1 — a real bug, NOT fixed this pass, named below as a follow-on) that was previously invisible
  simply because `auditFloating` never checked flights at all. `witness_tier_serial_display.js` W-TS-2
  ("remap never breaks") FAILed on 6/7 buildings as a result. Reverted the `auditFloating` edit only
  (a post-hoc audit function, no path into the real schedule or the real movie — `_contactGraph`/
  `_midairRepair` are independently class-blind and unaffected by it either way) — W-TS-2 back to 0
  FAILs everywhere, core scheduler fix untouched.
- **Final witness state:** `witness_tier_serial_display.js` 57/0 (was 57/0 baseline) — 3 LOCKED count
  baselines updated with reasons inline (`DAGWINS_BASELINE`: Hospital 256→257, LTU_AHouse 1019→1076,
  JKR 205→227 — more real cross-phase dependencies now correctly forced, same accepted class as
  `§GROUNDED_OVERRIDE_FIX`'s own baseline updates). `witness_midair_zero.js` 38/0 (was 32/0 baseline) —
  **W-MZ-2/3/4/7 (the acceptance bar itself) unchanged/clean on every building** — only `W-MZ-8`
  (`FLOAT_AFTER_BASELINE`, the strictResidual/"TRADE" observability counter, explicitly documented as
  "deliberate and named, never silent," never a gate) moved: Terminal 141→136, Duplex 9→8, Clinic
  420→407 (improved), Hospital 210→211, LTU_AHouse 1534→1561, JKR 348→358 (grew — more real
  dependencies tracked), HHS unmoved at 31.
- Three OTHER witnesses checked (`witness_tm_geo_order_cycles.js`, `witness_big_element_support_
  coverage.js`, `witness_door_window_host_wall.js`) show failures/crashes — confirmed by stash/diff
  **identical on unmodified origin/main**, i.e. pre-existing rot (the same `_zoneIndex is not defined`
  class SESSION 4 already named for a third tool in this lane), not caused by this fix.
- `_GANTT_CACHE_VERSION` 17→18, `sw.js` `CACHE_VERSION` v1023→v1024, both same commit.
- **Follow-on, named not fixed:** `_twoTierRemap` (time_machine.js) is not support-DAG-aware for stair
  flights — it can display flight 2 before flight 1 (backwards from real build order). `_midairRepair`
  papers over this for the DISPLAY outcome (proven above), but the intermediate remap stage itself still
  gets it wrong. Not investigated further this pass — flagged, not folded into this fix's scope.

### 2026-08-14 SESSION 7 — closing perf/dead-code review of the 4D gen pipeline (user: "review the 4D
### gen to be efficient not stale code to improve its speed of execution"). Two safe fixes SHIPPED,
### one big finding NAMED not fixed (too large/risky for a closing pass — needs its own session+spec).
For the SEPARATE bake/render-pipeline resource-usage lane (MaxQ movie bake, CPE, TM activation — NOT
this section's scope), the existing study already covers it: `prompts/CPE_4D_PERF_MEM_STUDY.md` +
`prompts/CPE_4D_PERF_MEM_FINDINGS.md` (2026-08-12). R1/R2/R3/R5 shipped (bake staging churn, gantt
chunk-yield, replan-lazy, TM warm/xray-memo); R6-R9 still open (memory/OPFS paging, 4-copy support-
predicate consolidation, date-cursor consolidation, DLOD flip-storm). That study explicitly measured
`_midairRepair`'s generation cost too (LTU 1,829ms) and ruled it "acceptable, not worth optimizing" —
this session's findings below are different code (dead code + a real algorithmic bottleneck in
`_twoTierRemap`/`_tierAuditRegate`, not `_midairRepair`), not a re-litigation of that ruling.

**✅ FIXED 1 — dead duplicate `_midairRepair`, 95 lines of unreachable code (`time_machine.js`).**
Two `function _midairRepair(items) {` declarations existed at the same module scope (old ~4589-4683,
live ~4732+); JS hoisting means the LAST one silently wins — the first was provably unreachable (only
one call site in the whole file, line ~5370, always resolves to the second). Already named as a known
defect in this file's own 2026-08-12 §ARCH_START_TEMPO notes ("a DUPLICATE `_midairRepair`"), never
cleaned up until now — and it was a REAL, present maintenance hazard, not just clutter: SESSION 6's
own stair fix (above) had to explicitly patch BOTH copies to avoid silently fixing only the dead one.
Confirmed no other duplicate top-level function declarations exist anywhere in `schedule_gate.js` or
`time_machine.js` (grepped both files for the pattern). **Verified behavior-identical**:
`witness_midair_zero.js` 38/0 and `witness_tier_serial_display.js` 57/0, both byte-for-byte the same
pass/fail counts before and after removal (expected — the code was unreachable, so removing it cannot
change behavior; this is why the check is "did anything change" not "did anything break").

**✅ FIXED 2 — redundant `geoGate`/`wallGate` double-scan in `placeNonst` (`schedule_gate.js:745`).**
`start = Math.max(geoGate(el), wallGate(el), hangGate(el), ...)` on the next line immediately
recomputed `geoGate(el)` and `wallGate(el)` AGAIN, purely to check a `_bmGatedB` diagnostic-counter
condition (§4D_BAND_MONOTONIC's own audit line). Both are pure, read-only functions over the grids
built so far (verified by reading their bodies — no mutation), so every non-structure element in
every building was paying for two full spatial-grid cell scans of each gate instead of one. Fixed by
caching `gg`/`wg` locals and reusing them for the counter check — same values, half the grid work,
zero behavior change (same two witnesses re-run clean: 38/0, 57/0).

**⛔ NAMED, MEASURED, NOT FIXED — `_tierAuditRegate`'s full-array-rescan fixpoint is the dominant
cost of the ENTIRE 4D generation pipeline on large/complex buildings, not `computeSchedule` and not
`_midairRepair`.** Real wall-clock profile (`ScheduleGate.computeSchedule` → `_twoTierRemap` →
`_midairRepair`, sliced verbatim, run per building):
```
building        n        computeSchedule  _twoTierRemap  _midairRepair  total
Duplex          1,119    32ms             25ms           27ms           112ms
HHS             6,839    172ms            439ms          103ms          784ms
JKR             8,985    286ms            850ms          153ms          1,366ms
Terminal        48,428   895ms            17,984ms       446ms          19,773ms
Hospital        63,182   944ms            2,624ms        883ms          4,932ms
Clinic          16,071   319ms            716ms          208ms          1,371ms
LTU_AHouse      122,330  4,083ms          35,504ms       1,999ms        42,541ms
```
**Not driven by element count alone** — Hospital (63,182 elements) remaps in 2.6s; Terminal (48,428,
*fewer*) takes 18s. Broke `_twoTierRemap` itself down (instrumented copy, per-sub-pass timing) on
Terminal: `_tier1Serialize`=24ms, `_tier1Protrusion`=14ms, `_tier1Extents`=7ms, `hostPairs`=20ms,
`openingPairs`=35ms — **`_tierAuditRegate`=15,466ms, ~99% of `_twoTierRemap`'s total and ~78-90% of
the WHOLE 4D-generation wall time**, for one building. Root cause, read from `_tierAuditRegate`'s own
code (`time_machine.js:4055-4150`): its repair loop is `for (sweeps<64) { items.forEach(fullRescan) }`
— a full O(n) rescan of EVERY element, every sweep, checking each one's support via a fresh grid-cell
scan, regardless of whether that element's answer could possibly have changed since the last sweep.
Measured on Terminal: **9 sweeps, 41,402 of 48,428 elements pushed (85%)** — a genuinely deep
dependency chain needing many rounds, each round paying for the full array again. LTU_AHouse's
35.5s remap is consistent with the same mechanism at 2.5x the element count (not independently
sweep-counted this pass — the mechanism is structural, not building-specific, so re-deriving it per
building isn't needed to trust the shape).

**Why this was NOT fixed this session:** the correct fix shape (a worklist/dirty-queue — only
re-check elements whose OWN dependency actually moved last sweep, not every element every sweep) is a
real algorithmic rewrite of core scheduling logic, not a mechanical dedup like the two fixes above.
This exact function is already flagged fragile by this file's own history — `_midairRepair`'s header
(above) documents an "alternating joint fixpoint... built and REJECTED on its own numbers (4 rounds,
7,650 pushes, cost 0.8s→14.8s)" involving `_tierAuditRegate` as one of the two rules that "genuinely
fight" when combined; that 14.8s figure is suspiciously close to this session's fresh 15.5s Terminal
measurement of `_tierAuditRegate` ALONE, which may be the same cost surfacing two different ways, not
a coincidence — worth checking first thing, not re-deriving. A worklist rewrite needs its own written
spec + an equivalence witness (same final schedule, byte-identical to the full-rescan version, not
just "converges") before it can ship, matching this project's own Spec-First discipline. **Concrete
next step for a dedicated session:** (1) confirm/deny the 14.8s-vs-15.5s connection by reading the
2026-08-12 experiment's own log if it still exists; (2) prototype a worklist version of
`_tierAuditRegate`'s sweep loop off a dependency graph (`seFor(T)`'s own grid lookups already compute
"what T depends on" — the missing piece is inverting that into "what depends on T" so only AFFECTED
elements requeue after a push, not the whole array); (3) A/B witness on Terminal/LTU_AHouse
specifically (the two buildings this actually matters for) for byte-identical final `.s`/`.e` per guid,
not just matching pass/fail counts.

**Witness state after both fixes:** `witness_midair_zero.js` 38/0, `witness_tier_serial_display.js`
57/0 — same as SESSION 6's post-merge baseline, confirming zero behavioral drift from either change.

## §GROUNDED_OVERRIDE_FIX — ✅ SHIPPED, bim-ootb PR #1338 (2026-08-13)
User: *"THINGS STILL HANGING IN MID AIR"*, reported right after §TIER2_PER_ELEMENT_CLAMP/§SHIFT_HOURS
(below) shipped. Investigation found a SEPARATE, PRE-EXISTING bug (not caused by that PR, not caused
by anything today) sitting in `_contactGraph`'s "grounded" classification since `_midairRepair` was
first built (#1301).

**The bug:** `grounded[i]` means "nothing shares my own exact XY footprint below me" — true for a
genuine ground-floor slab, but ALSO true for any element whose real support/carrier simply doesn't
overlap its own tight bbox (a column whose footing is a hair narrower, a beam one grid cell over).
`_midairRepair` and `_midairAudit` (the 🔓→🔒 lock gate's own judge) both SKIPPED every grounded
element outright — `if (!list2 || grounded[i]) continue` — so an element with a REAL, later-appearing
contact was silently exempted from ever being checked. "Grounded" was overriding a detected violation
instead of only covering the genuine "nothing to check" case (which stays `!list`, unchanged).

**Measured, all 7 buildings, before the fix** (`witness_midair_zero`'s "0 floating" was checking the
wrong question for every one of these): Hospital 460, Terminal 236, LTU_AHouse 254, JKR 57, Clinic
79, HHS 15, Duplex 4 — **1,105 elements total**, worst gaps 878.8d (LTU_AHouse) and 172.3d (Hospital).

**Fix:** one condition dropped at three call sites (`_contactGraph`'s two consumers in
`_midairRepair` — both the dead and shipping definitions — plus `_midairAudit`). `grounded[i]` no
longer overrides a present contact list.

**Verified:** W-MZ-2/3/4 (acceptance bar + monotonicity + orphan lock) unchanged, 0/0/locked on all 7
— now checking 1,105 more real elements than before. `witness_tier_serial_display.js` 57/0 clean —
the EXACT witness that broke twice before when this area was previously attacked (§STRUCT_POOL_UNGATED
below names both prior regressions; this fix did not touch that surface, so neither recurred). W-MZ-8
baseline updated with the reason inline (Terminal 103→141, Hospital 135→210, HHS 11→31, Clinic
367→420, LTU_AHouse 1142→1534, JKR 348, Duplex unmoved at 9 — it has no grounded-hidden population).
`_GANTT_CACHE_VERSION` 16→17, `sw.js` v1019→v1021 (collided live with #1337's independent same-day
v1020 bump — took one past it, same `sw.js` KEEP-BOTH/take-the-higher convention as the PR above).

**Not resolved by this fix — see ⛔ THE ONE OPEN ITEM at the top of this file.**

## §TIER2_PER_ELEMENT_CLAMP + §SHIFT_HOURS — ✅ SHIPPED, bim-ootb PR #1333 (2026-08-13)
Both fixed the same day, same PR, in response to *"solve this... you are the expert"* /
*"chase till zero, as this is stubborn issue over weeks"*.

**§SHIFT_HOURS** reverses #1323's §ARCH_START_TEMPO/M1, which shipped the rate table's 8h crew-day as
the ONLY value earlier the same day, tripling every building's display span (Hospital →~2020d, user-
confirmed live: `day=735 of=2020`). User ruling: *"why bother with 24hr? Isnt it faster? 2020 is very
slow"* → *"24hr is our default, import and JSON setting can import as we align to standard model."*
`rates.js` gets a top-level `SHIFT_HOURS = 24` (same pattern as `RATES`/`LABOR_RATES`);
`schedule_gate.js`'s `computeSchedule` takes an optional 5th `shiftHours` arg (module's own internal
default STAYS 8h, so every witness/probe that omits it is byte-for-byte unaffected); `injectGantt` —
the real generation path — reads and threads it through.

**§TIER2_PER_ELEMENT_CLAMP** replaces `_twoTierRemap`'s uniform per-zone Tier-2 shift (sized off the
EARLIEST element in a zone, applied to every element in it — inflated MEP Final's compact 121-day
generative package into a 784-day display window with zero added work) with a per-element clamp:
push only if `it.s < t1EndZ[z]`, to exactly `t1EndZ[z]`. Non-order-preserving, accepted per the
ruling; wired through the existing `_midairRepair` pass.

**Measured, all 7 buildings, both fixes together:** Terminal 375.2→131.2d · **Hospital 1168.7→369.2d
(2020d live→~369d, 5.5x)** · Duplex 18.0→10.6d · HHS 122.1→55.3d · Clinic 399.8→183.4d ·
LTU_AHouse 1855.1→915.9d · JKR 110.1→50.6d. MEP Final occupancy 22%→105.4%, MEP Rough-in →226.5%
(both now genuinely busy, zero dead-air window inflation). `gate_4d.sh` pass=7 fail=0 missing=1
(pre-existing). `_GANTT_CACHE_VERSION` 15→16, `sw.js` v1013→v1017 (collided 3x live during push —
three concurrent same-day sessions independently bumping `CACHE_VERSION`, #1331/#1332/#1334 — took
one past the highest each time, per this file's own KEEP-BOTH/take-the-higher `sw.js` convention).
CI also caught a `no-undef` on a bare `SHIFT_HOURS` reference (rates.js's global is cross-file, must
read via `window.SHIFT_HOURS` only) — fixed same session.

**Architecture/Superstructure's own RAW sparseness — ROOT-CAUSE NARROWED, not closed.** Crew-scaling
(`max_crews` ~3x) tested and is a near-null (Hospital Superstructure occupancy 40.6%→44.4%) — crew
utilization is only ~7%, so capacity is not the bottleneck. Points at a genuine **critical-path
effect**: `computeSchedule`'s PASS-A structure gate (`geoGate`, bottom-up bearing-below) chains floor
N's start to floor N-1's real finish with no bandGate/tg on structure at all (§4D_BAND_MONOTONIC's own
ruling), so a handful of elements on the longest vertical chain set the whole phase's span while
thousands of others sit with slack — classic CPM, not a scheduler bug. Matches
[[feedback_construction_standards_not_invented_pacing]]. ⛔ Needs either tracing the actual longest
chain with element-level evidence (not done), or the user's read on whether it still reads as "idle"
now that total idle time is already down 5x+. Separate from, and lower priority than, the doors item.

**What is already done — do not redo, cite it:** §DAY_GAP lane resolved to zero (#1313 §ZONE_INDEX ·
#1314 §TIER_SERIAL_BY_ZONE · #1315 §CREW_DEMAND/§HR_COST · #1317 §ARCH_AREA_WEIGHT); movie shadow
matched to TM exactly (#1316, ratio 2.155, user-confirmed "working great"); schedule export already
ships MS Project XML + P6 PMXML/XER in `viewer/schedule_editor_ui.js`.

**The product framing, from the user:** the editable Gantt + JSON is the PRODUCT; the generated 4D
is a fast demo. *"As long users get to find this suite highly usable is all we after."* Rank
accordingly — see §BIM_USABILITY_REVIEW.

# Full day-by-day history (2026-08-03 → 2026-08-12, 3941 lines) archived verbatim, nothing lost:
#   prompts/archive/4D_SCHEDULE_PERFECTION_full_history_2026-08-03_to_2026-08-12.md
#   Consolidated 2026-08-12 per user ask ("first consolidate the prompts/#") — this file keeps the
#   acceptance bar, the architecture map, a one-line-per-fix ledger, the still-OPEN threads, and the
#   landmine list. Full diagnostic narrative for closed items is in the archive if ever needed.
# Predecessor (CLOSED, do not re-litigate): prompts/CPM_FLOAT_GAP.md.

## ▶ THE ACCEPTANCE BAR — user, 2026-08-12, verbatim
**"all i want is not to see a single item hanging in midair that is all."**
Also, same session: *"no band aid fix, just generalised solution. It need not be that strict. Hunt
for chances."* and, from 2026-08-11: *"I AM NOT YOUR TESTER."*

That is the whole spec. Not "witnesses green" — **zero visibly floating elements in the movie, on
every shipped building.** A passing witness proves internal consistency with what got built; it has
twice failed to prove agreement with what was asked. Before reporting success, hold the concrete
number up against that sentence.

## ▶ RESUME — START HERE (state as of 2026-08-12, fourth pass)
**NEWEST (2026-08-12, fourth session): §ARCH_START_TEMPO — "the ARCH starting first day part is too
fast" is STUDIED, MEASURED, and deliberately NOT fixed yet.** Read that section (last in this file)
BEFORE proposing anything: it names the three multipliers that produce the burst, the prior rulings
each one came from (so a "fix" doesn't re-open a settled decision — the user's own words: *"solution
has to be after understanding previous work or else we be in vicious cycles"*), and two ⛔ items that
need the user's call. It also records two incidental defects found while measuring: a DUPLICATE
`_midairRepair` in `time_machine.js`, and §TIER2_AFTER_TIER1's ledger claim being stronger than what
actually ships post-`_midairRepair`.

**§MIDAIR_REPAIR is the answer to the acceptance bar and it is built + witnessed — see its own
section at the end of this file for the numbers.** The hanging population was never visible to the
existing proof trail: `auditFloating` only counts an element as floating when a support it KNOWS
ABOUT finishes late, and its pools are `seq<=4` + promoted slabs + walls. Measured directly on the
DISPLAY timeline, **5,561 elements across the 7 shipped buildings appeared with nothing they touch
yet on screen** — while every shipped witness was green. After the fix: **0 on all 7.**
Open after that:
1. **`fix/roof-host-wall` (`/tmp/wt-roof-fix`) — built, tested clean, deliberately NOT shipped.**
   Generalizes `openingGate`→`restsOnGate` (no class whitelist either side). Measured effect on all
   7 shipped buildings: **zero**. Now largely superseded — §MIDAIR_REPAIR closes the same class of
   gap generally, at the display layer. Retire it unless a measured case needs the gate-layer version.
2. **The stricter end-based bar** (nothing appears before a contact FINISHES) is measured and
   deliberately not enforced — see §MIDAIR_REPAIR's own section for why (it is unreachable without
   serializing the trade train, and it is not what the renderer shows).
3. **972 orphans** (elements touching nothing anywhere in the model) — an extraction limit no
   schedule can fix, now locked per building in `witness_midair_zero.js`. LTU_AHouse owns 865 of them.

**Closed by measurement this pass, do not re-open on the old story:**
- *Terminal glass-roof slabs* were NOT floating. Measured: each of the 5 `Basic Roof:Glass` slabs
  (`IfcSlab`, seq=4, bz≈22.6, day 7.2) has an `IfcColumn` based at 14.77m under it whose op starts
  day 3.3–5.0 — a real carrier, on screen first. The third-pass note calling them "zero gate of any
  kind" was right about the gate and wrong about the consequence.
- *HHS stairs "hanging in midair"* — CONFIRMED and FIXED. 4 stair flights are authored as `IfcSlab`
  (seq=4 ⇒ structure pool ⇒ no gate ever ran): 2 at bz=2.16 appeared day 1.5 (first contact day
  8.5), 2 at bz=5.85 appeared day 9.6 (first contact day 49.7). §MIDAIR_REPAIR moves them to 8.5d
  and 49.7d. No temporary-works/shoring excuse was needed — it was the structure-pool blind spot.

## THE ARCHITECTURE — where the physics actually lives (re-verified against `origin/main`, 2026-08-12)
`viewer/schedule_gate.js` `computeSchedule(elements, baseMs, scaleFactor, maxCrews)` is the element-
level scheduler that drives the live movie. Two passes; every gate returns "earliest ms I may start"
and placement takes `Math.max(...)` of all of them.
- **`bandGate`** — §4D_BAND_MONOTONIC. A trade may not run ahead of ITSELF on the floor below.
  Storey ranks are EXTRACTED (median `base_z` per collapsed storey), never a constant.
- **`geoGate`** — bearing-below: latest finish of XY-overlapping structure rising from below, plus
  the §GEO_SUPPORT_LEAK contained-support clause (strictly in my LOWER half, per §TM_GEO_ORDER_CYCLES).
- **`hangGate`** — carrier-above, for elements with NO bearing below (ceiling fans, ducts). Includes
  §HANG_NEAREST: rod-suspended BIG sinks reach the nearest overlapping pool member above (0.5–9.5m
  measured), no invented reach constant.
- **`wallGate`** — a promoted roof slab waits for the walls that carry it at their TOP.
- **`openingGate`** — §DOOR_WINDOW_HOST_WALL: a door/window is cut SIDEWAYS into a wall; gated on
  the host wall found geometrically (no `IfcRelFillsElement` table exists in the shipped DB).
- **Placement pools:** `seq<=4` = structure (`placeStruct`), `seq>4` = non-structure (`placeNonst`).
- **`auditFloating(elements, sched, classFilter)`** — the judge. Must stay aligned with the gates.
- `viewer/time_machine.js` `_promoteRoofLoadPath()` decides which `IfcSlab` gets promoted out of the
  structure pool to roof-role (`seq=8`). **`IfcWall`-only carrier search** — see §STRUCT_POOL_UNGATED.
- `viewer/schedule_author.js` `materializeDefault()`/`materializeZones()` author the Gantt bars;
  `computeCpm(db, id, {fixedDates:true})` gives float/criticality matching the real movie exactly.
- `kernel_ops` (materialized table in the building's IndexedDB blob) is what `renderAtTime`/the MaxQ
  bake actually reveal-order from — **stamped with `_genVersion`, re-materialized on mismatch**
  (§KERNEL_OPS_SCHED_VERSION). A schedule fix that doesn't bump this never reaches an opened building.

## §STRUCT_POOL_UNGATED — the shape of the gap (named 2026-08-12; COVERED at the display layer by §MIDAIR_REPAIR)
Every gate above (`geoGate`'s consumer clause, `hangGate`, `wallGate`, `openingGate`) applies to
`placeNonst` — i.e. `seq>4`. **A structure-pool member (`seq<=4`) goes through none of them.** So any
element that (a) is classified as structure and (b) is not actually structure schedules at day ~0
with no support check at all. Confirmed by measurement: HHS's stair flights are authored as
`IfcSlab`, so seq=4, so nothing ever checked them — they appeared on day 1.5 and day 9.6 against
first neighbours on day 8.5 and day 49.7. **This is the generalized statement of the "one class at a
time" bugs** (door, roof, stairs) — and it is why the fix belongs below the class level.
§MIDAIR_REPAIR closes it at the DISPLAY layer for every class and both pools at once. The GATE layer
is still pool-scoped: a generative-layer fix (gating `placeStruct` too) remains an open option, worth
doing only if a case appears that the display repair cannot express.

**⚠ Two regressions already caused and reverted while attacking this — do not re-attempt either:**
1. Firing `restsOnGate` UNCONDITIONALLY alongside the other gates broke `witness_tier_serial_display.js`'s
   LOCKED baselines on 5/7 buildings (HHS 420→0, JKR 398→3, Terminal 24007→12169). Fix: scope it as a
   FALLBACK (return `baseMs` immediately if `soFar !== baseMs`) — same idiom §HANG_NEAREST uses.
2. Widening `_promoteRoofLoadPath`'s carrier pool to `IfcWall OR bboxVol > BIG_ELEMENT_VOL` broke the
   same witness WORSE: LTU_AHouse 882→1246 (wrong direction), Terminal 24007→4 (collapsed). Reverted.
   A real fix needs a NARROW condition (e.g. roof-suggesting name/storey AND zero wall carriers found).

## LANDMINES — checked every time, learned the hard way
- **`sw.js` `CACHE_VERSION` bump belongs in the SAME PR as any `viewer/*.js` change.** Missed once
  (#1286) → users kept the stale file and re-reported a fixed bug; needed #1287 to recover. Check
  `git diff --stat` before calling a viewer PR done. `_GANTT_CACHE_VERSION` is a SEPARATE gate and
  does not cover `kernel_ops` — that needs `_genVersion` (§KERNEL_OPS_SCHED_VERSION).
- **A new gate must be wired into BOTH placement call sites** — the initial `placeNonst` `Math.max(...)`
  AND the §DEQ_V1 repair-loop `Math.max(...)`. One site alone is silently a no-op (caught by
  `witness_door_window_host_wall.js` W-DWH-1a/1b after the author's first cut fixed nothing).
- **Any new gate MUST be checked against `witness_tier_serial_display.js`'s LOCKED baselines** before
  it is considered safe. A green class-specific witness (doors, roof) is not enough.
- **Before believing a live bug report, check what the browser actually served** — `sw.js` version +
  the building's cached `kernel_ops` `_genVersion`. Two "still broken" reports were stale caches.
- **Witness rot is real** — several witnesses FAILed for stale assertions, not code regressions
  (renames, changed baselines). Un-rot before concluding an engine bug. Differential-test any FAIL
  against the pre-change tree before attributing it to your own change.

## SHIPPED LEDGER — do not rebuild any of this (one line each; full story in the archive)
- §GANTT_BAR_IDENTITY (K0) — drawer bars are real tasks; `witness_gantt_bar_identity.js` 42/42, 7 buildings.
- §ZONE_EDGE_LEAD — zone graph contradicted its own dates. FIXED 2026-08-04.
- §GANTT_AXIS_OUTLIER — PR #1175. §TM_CLOSE_RESTORE — PR #1182. §GEO_SUPPORT_LEAK — PR #1183.
- §CLASS_UNMATCHED_FALLBACK — PR #1186. §GENERATE_4D_HANG (hang root-caused + native entry) — #1193/#1194.
- §GANTT_EDIT_LOCK, §GANTT_MATDEFAULT_EXCLUSION, §DLOD_VF_CAMGUARD — #1199. §TM_PANEL_RESIZE_H — #1201.
- BOQ4D — `boq_charts.html` reads the real schedule; `witness_boq_charts_real_schedule.js` 91/91.
- §DEQ_V1 / §DEQ_REPAIR — default-engine-quality bar work (repair loop + strict containment).
- §4D_LAYER_TRUTH + §GANTT_RETIME_RESYNC — #1239/#1240. §GEOMETRIC_SUPPORT_ORDER — #1242 (support DAG,
  placement order is a structural fact, not a per-building patch). §GANTT_LOCK_INTEGRITY — #1244.
- §GANTT_STALE_CACHE — #1257. §TM_GEO_ORDER_CYCLES — #1276 (Terminal DAG cycles 37,927→0, floating 45→8).
- §SUPPORT_UNCHECKED — #1277 (warn-only observability). §HANG_NEAREST + pile reclass — #1278 (831→250).
- §NOGEO_COMPOSE — #1265–#1273 + #1280 (Garage_ARC 19→0; 8/8 buildings, ghost table all zeros;
  Modeller port #1273). Source IFCs were never lost — `reference_source_ifc_locations.md`.
- §OG_BEARING_BOUND + slab-on-grade reclass (250→246) + `IfcPile` sequence rule — #1281.
- §TIER_SERIAL — #1282 (two-tier phase-window collapse: Tier 1 serial backbone, Tier 2 pool).
- chase-to-zero (3 witnesses un-rotted, JKR+LTU coverage, §PROMOTED_CARRIER_POOL) — #1283.
- §TIER2_AFTER_TIER1 — #1286 (+ SW bump #1287): Tier 2 starts only after Tier 1's TRUE completion.
  Verified exact on 7 buildings (MEP Rough-in start == Architecture end, e.g. HHS 68.9d==68.9d).
- §KERNEL_OPS_SCHED_VERSION — #1291 (stale materialized `kernel_ops` never reached a fixed algorithm;
  magnitude if stale: Terminal 184.7d, Hospital 564.8d, LTU_AHouse 936.0d).
- §DOOR_WINDOW_HOST_WALL — #1294 (0.5–21.8% of doors/windows started before their host wall finished,
  up to 120+ days early → 0.0% everywhere).

## SETTLED — closed rulings, do not re-derive
- **Working calendar (5-day week/holidays):** CLOSED, no code. 24/7 continuous is the deliberate
  generator default (user ruling, "spec'ed early on"). P6/MSP real-calendar parsing deferred.
- **Multi-building validation:** DONE — `witness_zone_cpm_duplex.js` (small/DX-class 9/9) +
  `witness_support_invariant_all_buildings.js` (6 large fixtures, 18/18, 272k+ elements).
- **UI wiring:** DONE — zone-level detail IS the default "Generate first draft" output.
- **Captured programmes replay their own float** — we do not recompute ours over them uninvited
  (`4D_CAPTURE_AND_FALLBACK.md:359`). `computeCpm`'s `fixedDates` is the established pattern.
- **246 remaining §SUPPORT_UNCHECKED findings** are documented data limits (co-planar framing, Revit
  wall-through-slab authoring idiom, isolated railings) — warn-only, never gated. Not a live task.

## OPEN THREADS — the real punch list
1. **Terminal glass roof / §STRUCT_POOL_UNGATED** (above). The one confirmed live floater. Highest
   priority — it is exactly what the acceptance bar forbids.
2. **HHS stairs floating** — not investigated. First steps, in order: what IFC class are HHS's stairs
   (`IfcStair`/`IfcStairFlight`/proxy); what do `hasBearingBelow`/`geoGate` compute for them; is there
   a real modeled carrier (landing slab, stringers) simply unpromoted/unrecognized the same way the
   Terminal roof slabs are. EXTRACT the cause before reaching for the scaffolding explanation.
3. ✅ **DONE — HHS Level-3 doors.** MEASURED 2026-08-12, cause found, fixed: §CURTAIN_WALL_OPENING
   (section below). It was NEITHER stale hypothesis — not pre-#1294 residue, not `cinema_maxq.js`
   pacing. #1294's `openingGate` is correct and holds at 0.0% on every building; it simply could not
   SEE HHS's façade, because `wallGrid` is keyed on `cls.indexOf('IfcWall')===0` and HHS's Level-3
   glass doors are set into a CURTAIN WALL (IfcMember mullions + IfcPlate glazing). 34 of 133 HHS
   openings were structurally ungated. L3 6/37 early, worst 9.5d → 0/37, 0.0d.
4. **⛔ Item 6b (BLOCKED, user's call):** should the AUTHORED Gantt bar windows (`schedule_author.js`
   §PHASE_OVERLAP_BAND — what a PM sees and drags) also serialize to match the two-tier DISPLAY
   reality (§TIER_SERIAL/§TIER2_AFTER_TIER1)? Changes bar-date semantics for every future generated
   schedule. Surface fresh, don't default silently.
5. **⛔ LTU_AHouse canonical vintage (BLOCKED, user's call):** `_extracted.db` (old, 71MB) vs
   `_meta.db`/`_geo.db` (new split, live-served) — re-extract to unify, or retire one? Verification
   has been using the live-served pair as a pragmatic default; the architecture question is undecided.
6. **⛔ Two product judgment calls, neither decided:** (a) door/wall gate tolerance — currently zero;
   real trades sometimes set frames as the wall goes up (~1 day overlap?). Measured violations were
   weeks-to-months, so this is refinement, not correctness. (b) temporary works/shoring — this
   codebase has zero concept of it; document as a permanent warn-only limitation (matching
   §SUPPORT_UNCHECKED) or model it explicitly?
7. **`fix/gantt-refold-hang`** — pushed, unmerged, now 4+ PRs of drift in the same region of
   `time_machine.js`. Needs a real sync against current `main`, not a naive rebase. `git worktree list` first.
8b. **§ARCH_START_TEMPO (2026-08-12, studied not built)** — the film's opening dumps whole trades in
   its first day (Terminal: 236/236 substructure slabs in 0.8d of a 375d film; Duplex: whole backbone
   + 75% of ARCH in ONE day). Levers §3.1–§3.4 in that section; §3.1 (8h vs 24h crew-day) and §3.2
   (mobilisation) are ⛔ user calls, §3.3 (lock `workInFirst10%OfCalendar` in a witness) needs none.
   Two defects found alongside: duplicate `_midairRepair`; §TIER2_AFTER_TIER1 claim vs shipped times.
9. **Modeller is out of scope by user ruling** ("Ignore modeller for now") — none of §TIER_SERIAL,
   §TIER2_AFTER_TIER1, §SUPPORT_UNCHECKED, §HANG_NEAREST exist there. If it ever matters, start from
   `modeller/str_walker_outliner.js`, same pattern as the §NOGEO_COMPOSE port (#1273).

## VERIFY-BEFORE-TRUST
Every status claim above is what was true when written (2026-08-12). Re-check `git log --oneline -15`
on `~/bim-ootb` and re-run `witness_tier_serial_display.js` (the real system-wide regression detector,
57/57 clean at consolidation time) before trusting any of it — including the "still open" items.

## ▶ 2026-08-12 — §MIDAIR_REPAIR: the acceptance bar, measured and closed (bim-ootb `fix/4d-midair-gate`)
User, this session: *"this 4D generating issue is not solved for days"* → *"all i want is not to see
a single item hanging in midair that is all"* → *"no band aid fix, just generalised solution."*

### Why six PRs of green witnesses had not delivered it
`ScheduleGate.auditFloating` counts an element as floating **only when a support it already knows
about finishes after that element starts**, and the pools it knows about are narrow: `structGrid` =
`seq<=4` + promoted slabs, `wallGrid` = walls. Two populations are therefore invisible to it, and
both are exactly what an eye reads as hanging:
- an element whose only real neighbours sit outside those pools (a post on a curtain-wall plate, a
  fitting on a proxy) — it finds no candidate at all, records `se=0`, and reports the element clean;
- **any `seq<=4` structure-pool member** — every gate in `schedule_gate.js` runs in `placeNonst`,
  so structure is never support-checked in either direction (this is §STRUCT_POOL_UNGATED, named in
  the third pass, now confirmed as the dominant cause).

**Measured directly on the DISPLAY timeline** (`viewer/tests/probe_midair_census.js` — the times
`kernel_ops` is written from, i.e. what the movie plays), before any fix:

| building | total | appear with NOTHING they touch on screen | orphans (touch nothing anywhere) |
|---|---|---|---|
| Terminal | 48,428 | 161 | 7 |
| Hospital | 63,182 | 165 | 35 |
| Duplex | 1,119 | 19 | 1 |
| HHS_Office_Federated | 6,839 | 156 | 36 |
| Clinic | 16,071 | 345 | 27 |
| LTU_AHouse | 122,330 | 4,605 | 865 |
| JKR | 8,985 | 110 | 1 |
| **total** | **266,954** | **5,561** | **972** |

Every shipped witness was green throughout. That is the gap between "the witnesses pass" and "the
movie is right" — and it is the whole reason this lane felt unsolved for days.

### The rule (one sentence, class-blind and pool-blind)
**An element may not appear before the first element it physically touches appears.** Contact = the
union of the three relations the shipped gates already model, with no class or pool filter:
bearing-below, carrier-above, embedded (S spans my whole height at my XY). Exempt: an element that
IS the ground layer of its own footprint (nothing overlapping it starts lower) — unmodelled soil,
the same exemption §SUPPORT_UNCHECKED 1c already carries.

Why it is safe rather than another reshaping: it is the WEAKEST rule that closes the gap — FIRST
(min) contact, not last (max) — so it fires only when EVERY neighbour is still invisible and cannot
re-time the 99% already resting on something. It only ever moves elements LATER (monotonicity, the
property §TIER_SERIAL W-TS-3 depends on, holds by construction). It terminates: every raise assigns
some other element's CURRENT start, so the global maximum never grows. It lives in
`time_machine.js _midairRepair()`, called right after `_twoTierRemap` — the last layer before
`kernel_ops` (a generative-layer repair would be undone by the Tier-2 shift moving a carrier out
from under its consumer).

**Tier-1 serialization loses to support order**, which is this file's own established doctrine, not
a new licence: §TIER_DAG_WINS already accepts backbone elements crossing a phase window when the
support DAG forces it. `t1Moved` reports that population every run.

### Result — `viewer/tests/witness_midair_zero.js`, 22/22 PASS, 7 buildings, 266,954 elements
`§MIDAIR_REPAIR` per building (moved / sweeps / residual / t1Moved / maxShiftDays / ms):
Terminal 175/3/**0**/124/103.0d/464ms · Hospital 175/4/**0**/137/425.1d/813ms ·
Duplex 19/3/**0**/15/3.8d/23ms · HHS 166/6/**0**/100/47.9d/86ms · Clinic 540/3/**0**/459/177.4d/173ms ·
LTU_AHouse 5024/5/**0**/1314/1628.7d/1829ms · JKR 112/4/**0**/110/26.8d/145ms.
`residual=0` everywhere = **zero elements appear before the first thing they touch**, judged by an
INDEPENDENT census in the witness (it re-derives contact/ground geometry itself, so a mis-wired or
no-op repair FAILs instead of self-certifying — the §DOOR_WINDOW_HOST_WALL lesson). W-MZ-3: nothing
moved earlier on any building. W-MZ-4: orphans locked per building. Cost is a one-time ~0.5–1.8s at
generation on the largest models.

### Two live reports settled by measurement, not by story
- **HHS stairs "hanging in midair" — CONFIRMED, root-caused, FIXED.** 4 flights authored as
  `IfcSlab` (⇒ seq=4 ⇒ structure pool ⇒ no gate ever ran): 2 at bz=2.16 appeared day 1.5 with their
  first real neighbour on day 8.5; 2 at bz=5.85 appeared day 9.6 against day 49.7. Now 8.5d / 49.7d.
  **No temporary-works/shoring excuse was needed** — the third pass's hypothesis was wrong, it was
  the structure-pool blind spot. (`probe_named_element_times.js`, BLD=HHS_Office_Federated NAMEQ=Stair)
- **Terminal glass roof was NOT floating.** Each of the 5 `Basic Roof:Glass` slabs (bz≈22.6, day 7.2)
  has an `IfcColumn` based at 14.77m directly under it whose op starts day 3.3–5.0. The third-pass
  note was right that no gate ran and wrong that they hang. Do not re-open on the old story.
- **HHS day-23 report:** on the 122.1-day display timeline, the pre-fix hangings clustered at
  5%(d6)=17, 10%(d12)=22, 20%(d24)=2, 25%(d31)=10, 35%(d43)=37, 65%(d79)=43 — i.e. the day-12→24
  band the user was watching held 24 of them. All 156 are now zero.

### The stricter end-based bar — MEASURED, deliberately NOT enforced (decision recorded here)
§SUPPORT_CHECK's doctrine is end-based ("nothing may start before its physical support FINISHES"),
so that version was built and measured too: move every element to the first FINISH among its
contacts (frozen pre-repair ends — an end-based *fixpoint* provably diverges, since contact is
near-symmetric and each raise adds a duration instead of reusing an existing time).
**Result, why it is not shipped:** on Terminal it moved 700 elements by up to 103 days and STILL
left 624 violating; on Duplex 23 moved, 22 still violating — the contacts move too, so the bar
recedes as you chase it. Reaching it for real means serializing neighbours against each other, i.e.
the global floor gate §4D_BAND_MONOTONIC's own header rules out ("would serialize the project and
destroy the trade train"). It is also not the visual truth: `renderAtTime` shows an element from its
START (frontier = orange glow, "being installed"), so a slab arriving over a glowing half-built
column is on screen resting on something. `strictResidual` now reports that population every run
(Terminal 745, Hospital 219, Duplex 27, HHS 209, Clinic 677, LTU 7131, JKR 184) — a named, measured
limit, never a silent one. Revisit only on a real report that a half-built support reads as floating.

### Regression sweep (every log read, none exit-code-only) — logs in `/tmp/wt-tier2-cache-fix/viewer/_logs/`
`witness_tier_serial_display` 57/0 (all LOCKED baselines intact, incl. Terminal dagWins=24007) ·
`witness_door_window_host_wall` 10/0 · `witness_kernel_ops_sched_version` 12/0 ·
`witness_tm_geo_order_cycles` 5/0 · `witness_og_guard_bearing_bound` 9/0 ·
`witness_big_element_support_coverage` 36/0. Plus `witness_midair_zero` 22/0. **129 + 22 assertions,
zero FAILs.** `_GANTT_CACHE_VERSION` 10→11 and `sw.js` `CACHE_VERSION` v991→v992 both bumped in the
same commit — the two cache landmines this lane has already been bitten by, checked deliberately.

## ▶ 2026-08-12 (same session, follow-up) — the planner question, and the two real holes it exposed
User: *"is the resulting 4D JSON edit wise still in compliance to engineer planners as P6 MPP
quality? And easily changed also on Time Machine to effect back?"* Checking that instead of assuming
it found two defects — one pre-existing, one introduced by PR #1301 — both closed here.

### Answer 1: the planner-facing artefacts are untouched, provably
`schedule_author.js`, `schedule_author_ui.js`, `schedule_diff.js`, `foreign_schedule.js` have a
**zero-line diff** across this whole lane. `tasks` / `task_sequences` / `computeCpm(fixedDates)`
float+criticality / the P6+MSPDI export path all build from `ScheduleGate.computeSchedule`'s RAW
times (`schedule_author.js:352`); §MIDAIR_REPAIR rewrites only `kernel_ops` timestamps — the movie
layer. So the exported programme is byte-identical to what it was.
Measured consequence on the seam (`probe_bars_vs_ops.js`, HHS): of 6,839 elements linked to a task,
**14 (0.2%) newly play outside their own bar** because of the repair, max 18.2d on a 46d authored
span. Note 3,408 (49.8%) were ALREADY outside their bar before this lane touched anything — the
authored zone rollup and the display timeline have always been two calendars. That pre-existing
divergence is item 6b's territory, still the user's call, now with a number.

### Hole 1 (introduced by #1301, fixed here): the repair traded one defect class for another
Moving an element later so it stops hanging can leave a DEPENDENT starting before that now-later
support FINISHES — which is exactly what `auditFloating` counts. **Measured across the repair:
Hospital 0→135, Clinic 1→356, LTU_AHouse 334→1100, Terminal 8→102, JKR 81→158, HHS 0→11, Duplex 0→9.**
A joint fixpoint was built and **rejected on its own numbers**: alternating the shipped
`_tierAuditRegate` sweep with the midair fixpoint ran 4 rounds, pushed 7,650 times, still ended
Hospital at 140, and cost 0.8s → 14.8s. The two rules genuinely fight (one keyed on a contact's
START, the other on a support's END, and the contact relation is not a DAG). **Do not re-attempt
that shape.** The trade is now LOCKED per building in `witness_midair_zero.js` W-MZ-8 and printed in
every `§MIDAIR_REPAIR` line as `auditFloatingAfter=` — visible, never silent. The structural fix for
both at once is gate-layer (§STRUCT_POOL_UNGATED), still open.

### Hole 2 (pre-existing, older than this lane, fixed here): the lock gate demanded absolute zero
`verifyGanttIntegrity` returned `ok: n === 0`. Measured pre-repair `auditFloating` on the shipped
buildings: Terminal 8, Clinic 1, JKR 81, LTU_AHouse 334 — the documented warn-only tails. So
**🔓→🔒 lock-back was already refused on 4 of 7 buildings for a freshly generated, UNEDITED
schedule**; a planner there could never re-lock after any edit. §MIDAIR_REPAIR would have widened
that to all 7. Fixed as **§GANTT_LOCK_DELTA**: `captureLockBaseline()` snapshots {floating, midair}
on unlock (the state the planner inherited) and the lock refuses only on an **increase** in either.
Absolute counts are still reported, so the known tails stay visible instead of being defined away.

### And the lock gate now judges by the same rule the generator enforces
`verifyGanttIntegrity` also runs `_midairAudit` (same `_contactGraph`, no mutation), so a dragged bar
that re-creates a hanging is REFUSED — `auditFloating` alone cannot see that population, which is the
whole §MIDAIR_REPAIR finding. Round-trip is otherwise unchanged: drag → `retimeTaskElements` →
§GANTT_RETIME_RESYNC → lock verifies → Undo restores.

### Merged + live
**PR bim-ootb#1303 MERGED (`add18e5`), GH Pages deploy success — verified by content on the served
files, not by PR status: `viewer/sw.js` serves `CACHE_VERSION="v993"`, `viewer/time_machine.js`
serves `captureLockBaseline` + `_GANTT_CACHE_VERSION=11`.** Branch sync note: the follow-up was
built on the SAME branch #1301 was squash-merged from, so `origin/main` came back as add/add
conflicts on both new test files (the squash-merge history collision CLAUDE.md warns about) — take
the branch side (it is the superset), and on `sw.js` keep the HIGHER version. Start the next
follow-up off fresh `origin/main`.

### Witnesses
`witness_midair_zero.js` **38/38** (W-MZ-6a/6b lock-gate wiring, W-MZ-7 the judge catches a
re-introduced hanging — moved 1 element 5d before its first contact, W-MZ-8 the trade locked per
building). `witness_gantt_lock_integrity.js` **all green**, including G-LI-2d (a real bad drag still
breaches: +1 floating, +1 midair) and G-LI-4 (Hospital-scale lock audit 1,005ms / 63,415 elements).

## ▶ 2026-08-12 (fourth session, STUDY ONLY — nothing implemented) — §ARCH_START_TEMPO: why the opening of the film is too fast
User: *"recall back the prompts/# on the 4D PERFECTION, as the ARCH starting first day part is too
fast. As this is always problematic, study first"* … *"solution has to be after understanding
previous work or else we be in vicious cycles"* … and, on perf: *"also the loading timeline, look at
perf issue but note another session is studying overall and fixing perf issue, so just make observation."*

**No code was changed. No witness was added. Every number below is measured**, on `origin/main`
`add18e5` (#1303), against the real shipped fixtures.
- Probe (new, read-only, committed here — not in bim-ootb): `scripts/probe_arch_start.js`.
  `VIEWER_DIR=~/bim-ootb/viewer BLD_DIR=~/bim-ootb/buildings node scripts/probe_arch_start.js`
  It runs the SHIPPED functions (`_buildXrayElements` → `ScheduleGate.computeSchedule` →
  `_twoTierRemap` → `_midairRepair`), sliced out of `time_machine.js` exactly the way
  `probe_midair_census.js`/`witness_midair_zero.js` do — no re-implementation of the physics.
- All three rows (RAW / REMAP / REPAIR) share ONE epoch. A per-row epoch silently re-zeros the axis
  and fakes an "element moved earlier" that never happened — caught while writing this.

### §0 FIRST: what previous work already settled, so this doesn't loop
The burst is **not a new bug and not a regression.** It is the named, accepted consequence of a
ruling the user made on 2026-08-06, and every mechanism below was put there deliberately by an
earlier pass:
1. **§CPE_BUILDUP_WORK_PACED** (cinema_maxq.js) used to hide it: the film advanced by WORK, so
   "10% of the film = 10% of the building" regardless of how the schedule clustered.
2. **§CPE_BUILDUP_EVEN_TEMPO (2026-08-06) RETIRED that**, on the user's own words ("Should be even
   throughout — separation of concern. Let the user play with the sticks and timings"). Its header
   states the trade in advance: *"THIS IS A REVERSAL … the burst … (a quarter of the Hospital model
   appearing in the first 5% of the film) returns wherever a schedule clusters its elements."*
   `BUILDUP_EVEN_TEMPO = true` is live; the film clock is now **linear in calendar days**.
   ⇒ **Do not "fix" this by flipping that flag back.** It was decided, with reasons. The consequence
   is that any front-loading left in the SCHEDULE now maps 1:1 onto screen time — so the schedule is
   the only correct place to work, which is what this file is for.
3. §4D_BAND_MONOTONIC (2026-08-02) already ruled OUT a global floor gate ("would serialize the
   project and destroy the trade train"). §TIER_SERIAL/§TIER2_AFTER_TIER1 (2026-08-11) then made the
   BACKBONE serial anyway — that is as far as serialization was taken, deliberately.
4. §PHASE_DURATION/§PHASE_OVERLAP_BAND (2026-08-04) exist to fix the OPPOSITE complaint (Terminal's
   Architecture used to start at day 1,189 of 1,264). Anything proposed here must not walk that back.

### §1 The measurement — the DISPLAY timeline (what `kernel_ops` plays), post-`_midairRepair`
| building | film span | ARCH window | starts on day ≤1 | what those day-1 elements ARE |
|---|---|---|---|---|
| Terminal | 375.2d | 96.6–191.5d | 237 (0.5%) | **236 of 236 Substructure slabs — the ENTIRE substructure, in 0.8 days** |
| Hospital | 1168.7d | 306.6–861.7d | 57 (0.1%) | 57 `IfcFooting`; all 553 Substructure elements inside the first 19.5d (1.7% of the film) |
| Clinic | 399.8d | 103.7–274.6d | 57 (0.4%) | 56 `IfcFooting` + 1 slab; 100% of Substructure inside the first 6.2d |
| HHS_Office_Federated | 122.1d | 33.6–95.1d | 65 (1.0%) | 54 `IfcColumn` + 11 `IfcSlab`; **51.6% of ALL Superstructure inside the first 10% of the film** |
| JKR | 110.1d | 26.0–57.7d | 57 (0.6%) | 48 `IfcColumn` + 9 `IfcSlab` |
| LTU_AHouse | 1855.1d | 216.7–1940.6d | 49 (0.0%) | 31 `IfcColumn` + 14 `IfcSlab` + 4 `IfcBeam` (film day 0 = raw day 86.0 — the repair shifts the whole start) |
| **Duplex** | **18.0d** | **0.4–7.8d** | **80 (7.1%)** | **11 footings + 25 Superstructure + 44 Architecture (40 walls, 2 doors, 2 stair flights) — i.e. the whole backbone plus 3/4 of ARCH, in ONE day** |

**Two different "ARCH on day 1" facts, and they live in two different artefacts. Both are real:**
- **(A) The movie.** ARCH literally starts on day ~0 only on **Duplex** (0.4d of an 18d film, with
  **75.2% of all Architecture starting inside its own first day**). On the big buildings ARCH starts
  22–33% in (Terminal 26%, HHS 28%, JKR 24%, Clinic 26%, Hospital 26%). What IS on screen in the
  first day everywhere else is the **backbone start** — and that is what looks too fast: Terminal's
  entire substructure is 0.2% of the film (**under 1 frame of a 360-frame bake, ~2 frames of an
  820-frame one**), Clinic's is 1.6%, Hospital's 1.7%.
- **(B) The Gantt drawer (authored bars, `schedule_author.js` §PHASE_OVERLAP_BAND).** There the ARCH
  bar starts at **day 2 (Duplex, of 36d) · 5 (JKR, of 55d) · 11 (Terminal, of 236d) · 12 (Clinic,
  of 295d) · 14 (HHS, of 97d) · 24 (LTU, of 2194d) · 39 (Hospital, of 803d)** — every one of the six
  phases has started inside the first ~15% of the programme on every building.

### §2 The mechanism, read from code — three independent multipliers, all pre-existing
**M1 — the display clock spends an 8-hour crew-day in 24 wall-clock hours (a hard 3×).**
`schedule_author.js _installSecs` derives each element's seconds from `secsPerUnit = 28800 / productivity`
— 28,800 s = one **8-hour** crew-day, and `materializeDefault` divides by `28800 * max_crews` for the
authored bar width. But `schedule_gate.js place()` spends those same seconds as **continuous
wall-clock** (`dur = installSecs * scaleFactor * 1000`, `scaleFactor` = 1 for any project ≥10 raw
days, `time_machine.js:4853`), against `fullDayMs = 24*3600000` — the code even says so:
`// Round the clock — 24/7, no weekends` (`time_machine.js:4847`).
*Arithmetic check against the measurement, Terminal Substructure:* 236 `IfcSlab` × (28800/35 =
822.9 s) ÷ 3 `CONCRETE_GANG` crews = 64,732 s = **0.75 d** — measured `Substructure=[0.0..0.8]d`. ✓
The same labour on the 8-hour day its own rate table is written in is **2.25 d**; on a 5-day week,
**3.15 d**. So the film runs the backbone **3× (or 4.2× vs 5-day/8h) faster than the rate table's own
definition of a crew-day.** ⚠ This is adjacent to a SETTLED ruling — "24/7 continuous is the
deliberate generator default" — but that ruling was about **weekends/holidays (the calendar)**, not
about a crew working **24 h**. The two got conflated in one constant.

**M2 — day 0 is full crew strength with nothing to wait for.** Every ground-layer element is
ungated by construction (`geoGate` finds nothing below it), so at t=0 the only limiter is the crew
cap. There is **no mobilisation, no site setup, no procurement lead, no ramp-up** anywhere in the
model — `baseMs` is simply when everything can start.

**M3 — the crew cap is the ONLY spreader, and it is small and project-wide** (§CREW-CAP, 2026-07-18:
`CONCRETE_GANG` 3, `MASON`/`CARPENTER`/`ELECTRICIAN`/`PLUMBER`/`HVAC_TECH` 2, `ROOFER` 1,
`MAX_CREWS_DEFAULT` 3). Combined with M1 each crew turns over ~3× its rated daily output, so a whole
early band drains in hours: Duplex's 79 masonry-ish ARCH elements = 79 × 2,400 s ÷ 2 MASON crews =
1.1 d (would be 3.3 d at 8 h).

**M4 — the authored bars are front-loaded by a different rule entirely.** `materializeDefault` walks
`_cursor += p.lagDays` where `lagDays = ceil(widthDays / numBands)` — each phase starts after the
previous one clears ONE band, never after it finishes. That is textbook flowline and was the correct
2026-08-04 fix, but with 12–17 bands it puts every trade's bar at the far left. It also means the two
artefacts are **two different calendars** (already named as OPEN THREAD 6b — now with numbers):
ARCH bar day 11 vs ARCH movie day 96.6 on Terminal; day 39 vs 306.6 on Hospital; day 24 vs 216.7 on
LTU. Programme totals differ too (authored/display): Terminal 236/375d · Hospital 803/1169d ·
Clinic 295/400d · JKR 55/110d · HHS 97/122d · LTU 2194/1855d · Duplex 36/18d.

### §3 Levers — measured, NONE implemented, each needs its own spec section + a user pick
1. **Spend labour on the crew-day the rate table is written in** (M1). One constant, but it
   multiplies every building's display span ~3× and re-times every `kernel_ops` — needs
   `_genVersion` + `_GANTT_CACHE_VERSION` + `sw.js` bumps and a re-measure of every LOCKED baseline
   in `witness_tier_serial_display.js`. Biggest single effect on "too fast", smallest diff.
   ⛔ Needs the user's call because it refines the SETTLED 24/7 ruling (calendar vs shift-length).
2. **Mobilisation / ramp-in before the first element** (M2) — cannot be EXTRACTED from any building
   DB. It would be a named business assumption (e.g. "no trade before day N", or crews arriving over
   the first N days). ⛔ User's number, or it is invention.
3. **Make the front-load visible instead of implicit.** `window.tmWorkSchedule()` already computes
   and logs `workInFirst10%OfCalendar` (`time_machine.js:8333`, "10.0% would be evenly spread").
   Nothing pins it, so it can drift silently. A witness locking it per building is a zero-risk first
   step and the only lever here needing no user decision.
4. **Item 6b (authored bars vs display timeline)** — unchanged, still the user's call, now with the
   two-calendar numbers above.

### §4 Three incidental findings, verified while measuring (not part of the ask)
1. **`_midairRepair` is defined TWICE in `time_machine.js` at `origin/main`** (`:4248` refactored
   onto `_contactGraph`, `:4391` the older inline copy — the #1303 add/add branch-side merge). JS
   hoisting means **the browser runs the LAST one (`:4391`)** while `sliceFn` (probe + every witness)
   picks the FIRST. **Measured: both produce byte-identical display times on Duplex and HHS**, so
   this is dead duplication, not a behaviour split — but the witnesses are proving the copy that
   does not ship, and one edit to the "wrong" one would be silent. ~145 dead lines.
2. **§TIER2_AFTER_TIER1's "MEP Rough-in start == Architecture end, verified exact on 7 buildings" no
   longer holds on the shipped timeline** — because `_midairRepair` (#1301) runs AFTER `_twoTierRemap`
   and pushes backbone elements later (`t1Moved`, already reported per run). Measured ARCH tail
   INSIDE the MEP window, post-repair: **Hospital 258.0d · Clinic 67.8d · HHS 26.2d · LTU 938.7d**
   (Terminal/JKR/Duplex still exact at 0). Same for the backbone itself: Superstructure now runs
   179.4d (Hospital) / 100.7d (Clinic) / 33.5d (HHS) past Architecture's start. `witness_tier_serial_display.js`
   asserts on `_twoTierRemap`'s output only — it never runs the repair, so it cannot see this. Not
   necessarily wrong (§TIER_DAG_WINS accepts support order beating serialization), but the *claim* in
   this file's ledger is now stronger than what ships. Fix the claim or the witness — decide, don't drift.
3. **Perf observation only (another session owns the perf lane — `prompts/CPE_4D_PERF_MEM_STUDY.md`
   / `CPE_4D_PERF_MEM_FINDINGS.md`; nothing here to be actioned by this lane).** Node-side, one
   generation pass: **`_twoTierRemap` dominates everything else** — LTU_AHouse 62.0 s, Terminal
   25.6 s, Hospital 5.4 s, Clinic 1.6 s, JKR 1.8 s, HHS 0.8 s. Against `computeSchedule` (9.1/1.4/1.7 s),
   `_midairRepair` (3.7/0.9/1.9 s), x-ray build (1.3/1.2/1.0 s), authored bars (2.3/1.7/1.3 s).
   Full-pass totals: LTU 80.1 s · Terminal 31.7 s · Hospital 12.1 s. The shape is structural, not a
   fixture artefact: `_twoTierRemap` runs up to 6 iterations × `_tierAuditRegate` (≤16 sweeps each),
   and `_tierAuditRegate` rebuilds its spatial grid every call. Browser numbers will differ; the
   ratio is what matters.

### §5 What this study did NOT do
No schedule change, no gate change, no witness, no PR, no cache bump. Levers §3.1–§3.4 are unbuilt
and unspec'd. The probe is read-only and lives in bim-compiler only — bim-ootb is untouched.

## §GANTT_PHASE_CLOBBER — ARCHIVED (closed: fixed 2026-08-12)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** The captured overlay was writing the TASK NAME into `p.phase`, killing Gantt bar colour/rank on refresh; fixed at source, witnessed by `witness_gantt_phase_palette.js` (W-PHASE-KEY). Full diagnosis + the three G-PAL claims: `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`.

### §DAY_GAP — the burst has a matching DEAD AIR, measured (2026-08-12, user-reported, STUDY ONLY)
**User:** *"at Day 14 onwards nothing happens and when scrub forward it jumps to Day 48 with
construction resuming"* → *"Day 1-14 too much too fast and then delay build up until Day 48 is
telling. Day 1-14 should stretch till before Day 48."*

Measured on the shipped display timeline (`scripts/probe_arch_start.js` §DAY_GAP, Hospital, all
63,182 elements, post-`_twoTierRemap`+`_midairRepair`). Reported as PERCENT OF FILM because the
browser maps this 1,168.7-day generated timeline through one global affine into the captured window
(their run: a 126-day film) — an affine preserves relative position, raw days are not comparable.
Their day 14→48 of 126 = **11%→38% of the film**.

```
§DAY_GAP_HIST Hospital startsPer5%=[2228,0,0,915,0,4452,640,2060,6437,2523,7305,9560,7630,9182,10056,149,0,1,0,44]
                                     0-5  5-10 10-15 15-20 20-25 …
§DAY_GAP Hospital longestEmptyRun=12% at 76%..88% of the film — zero element starts
```
Bursts separated by dead air, matching the report exactly:
- **0–5%** of the film: **2,228 starts** (3.5% of the model) — the §ARCH_START_TEMPO burst.
- **5–15%**: **zero starts**, 10% of the film with nothing happening. In their 126-day film that is
  day 6.3 → 18.9 — the "Day 14 onwards nothing happens" they saw.
- **15–40%**: 915 · 0 · 4,452 · 640 · 2,060 — a trickle, with a second dead 5% band at 20–25%.
- **40%+**: the real ramp (6,437 → 10,056 starts per 5%).

Phase windows behind it (§ARCH_PHASE REPAIR): `Substructure=[0.0..19.5]d n=553` ·
`Superstructure=[10.3..486.0]d n=2603` · `Architecture=[306.6..861.7]d n=17236` ·
`MEP Rough-in=[603.7..1168.7]d n=38362`. Substructure's entire 553 elements are spent in the first
**1.7%** of the film; Architecture cannot start until **26%**; MEP Rough-in until **52%**. And 64.3%
of Superstructure's own elements start inside the first 10% of the film (§ARCH_PHASE_FRONT), leaving
the rest of its 296-day window empty. So the gap is not a data hole — it is the interval between
"the tiny backbone is finished" and "the next tier is allowed to begin".

**Diagnosis:** each phase's elements are packed at the FRONT of a window far longer than the
crew-limited work inside it. Burst, then dead air, per phase. Same root as §ARCH_START_TEMPO, seen
from the other end.

**Lever (NOT implemented — schedule-side, not film-side per §CPE_BUILDUP_EVEN_TEMPO):** spread each
phase's starts across its own already-computed window instead of packing them at its front. No new
data needed — window boundaries and element order both already exist; only placement inside the
window changes, and a monotone map inside a window preserves programme totals, phase order and
support order by construction.
⛔ Confirm before building: does *"Day 1-14 should stretch till before Day 48"* mean stretch each
phase's work to fill its window up to the next phase's start — which is what this lever does?

---

### §DAY_GAP_WIP — ⛔ THE LEVER ABOVE IS **DO NOT BUILD**. Its premise is measured false (2026-08-12)

The blocking question above was handed over unanswered. Answering it required one measurement
§DAY_GAP never took, and that measurement kills the lever. **§DAY_GAP counts element STARTS. It
never asked how many elements are IN PROGRESS.** Those are different questions with opposite fixes:
work-in-progress through a gap means the programme is honest and moving starts would fabricate
dates; zero work-in-progress means the gap is genuinely empty. Added `§DAY_GAP_WIP` + `§DAY_GAP_DUR`
to `scripts/probe_arch_start.js` and ran all 7 buildings off `origin/main`:

```
                meanDur   p50      spanD    sumWorkDays  occupancy   zeroStartBands / alsoZeroWork
Hospital        0.016d   0.015d   1168.7      1035.3       88.6%          55 / 55   minWIP=0 maxWIP=0
Terminal        0.008d   0.002d    375.2       377.9      100.7%          40 / 40   minWIP=0 maxWIP=0
Clinic          0.024d   0.022d    399.8       380.9       95.3%          46 / 46   minWIP=0 maxWIP=0
LTU_AHouse      0.019d   0.022d   1941.1      2328.7      120.0%          42 / 42   minWIP=0 maxWIP=0
HHS_Office_Fed  0.023d   0.022d    122.1       157.0      128.6%          39 / 39   minWIP=0 maxWIP=0
JKR             0.017d   0.011d    110.1       151.1      137.3%          40 / 40   minWIP=0 maxWIP=0
Duplex          0.023d   0.022d     18.0        26.3      146.0%          32 / 32   minWIP=0 maxWIP=0

§DAY_GAP_WIP Hospital meanInProgressPer5%=[2,0,0,1,0,1,0,0,0,0,2,3,3,3,3,0,0,0,0,0]
```

**Three findings, each fatal to the specced lever:**

1. **There is no surplus window to spread into.** `occupancy = sumWorkDays / spanD` is **88.6%–146%
   on every building** — the total work-days already ≈ (or exceed) the whole programme span. The
   lever's stated premise, *"a window far longer than the crew-limited work inside it,"* is false.
   Spreading starts would redistribute the same ~1-element-at-a-time trickle and convert one 12%
   dead band into dozens of small ones. The film would read empty *everywhere* instead of in one
   place — strictly worse, and it would have looked like progress on the histogram.

2. **The cause is DURATION, not placement.** `p50` element duration is **0.011–0.022 d ≈ 16–32
   minutes**, near-identical across all 7 buildings regardless of type, size or discipline. Elements
   are POINT EVENTS: they pop into existence and are done. That is why **every** zero-start band is
   also zero-work — 294 bands across 7 buildings, `minWIP=0 maxWIP=0` without a single exception.
   Nothing is ever visibly under construction, so between bursts there is genuinely nothing to show.
   This matches `time_machine.js:4816`'s own admission of a **"SAME flat duration regardless of real
   size"** and the parked weighting lane's finding that *50–71% of every building's labour-seconds
   carry no size signal.*

3. **It would have traded accuracy for polish.** Monotone re-timing of computed start dates so the
   film looks even is re-timing a schedule for VIEWING reasons — the exact thing
   `feedback_schedule_accuracy_over_movie_polish` rules against (*"a beautiful film of a WRONG
   schedule is worse than a plain film of a right one"*), and the film-side twin of this was already
   retired deliberately as §CPE_BUILDUP_EVEN_TEMPO.

**Answer to the user's question, therefore:** *"Day 1-14 should stretch till before Day 48"* is a
statement of the **desired outcome**, not of the mechanism. It should NOT be delivered by filling
each window to the next phase's start. Delivered that way it fabricates dates and still shows an
empty film. Delivered by giving elements their real durations, the same outcome falls out for free —
work that occupies 3 days instead of 32 minutes fills the gap *because it is actually happening.*

**§DAY_GAP and the weighting lane are the same bug.** `§LABOR_QUANTITY_WEIGHT` +
`§HEAVY_MEMBER_SPEED_LIMIT` (spec-only, user already ruled: 24h crew-day norm + JSON shift override
for imports) is the real lever. The data to do it is already shipped and unused: `rates.js`
`LABOR_RATES[trade].productivity` gives units/day per IFC class, with `crew_size` and `max_crews`
per trade, and `§CREW-CAP` (time_machine.js:5020) already reads `max_crews`. Deriving duration from
quantity ÷ productivity is EXTRACT, not invention — it raises schedule accuracy instead of trading
it away, and the gap closes as a side effect rather than as the goal.

**Do not re-derive this.** The probe now carries `§DAY_GAP_WIP`/`§DAY_GAP_DUR` permanently; re-run
`VIEWER_DIR=/tmp/vw BLD_DIR=~/bim-ootb/buildings node scripts/probe_arch_start.js` after any
duration change and watch `occupancy` stay ~100% while `meanInProgressPer5%` rises off the floor —
that, not the starts histogram, is the number that says the film has something to show.

---

### §DAY_GAP_PHASE_OCC — ⚠ TWO CORRECTIONS TO THE SECTION ABOVE, and the real defect (2026-08-12)

The §DAY_GAP_WIP section above is right that the specced lever is DO-NOT-BUILD, but **two of its
supporting claims were wrong and are corrected here.** Both were caught by finishing the measurement
rather than by review.

**Correction 1 — the "every zero-start band is also zero-work" evidence was a SAMPLING ARTEFACT.**
The first cut sampled ONE instant per band (`s <= t && e > t` at the band midpoint). On Hospital a
1% band is 11.7 days while p50 element duration is 0.015d, so a single instant has a ~0.1% chance of
landing on any given element — with true concurrency near 1, an instantaneous sample returns 0 by
luck. Re-measured by OVERLAP (element-days falling inside the band ÷ band width). **The conclusion
survives, on 5 of 7 buildings exactly and 2 approximately** — Hospital/Terminal/Clinic/LTU/JKR still
show every zero-start band at zero work; Duplex 31 of 32, HHS 36 of 39. But the original
`minWIP=0 maxWIP=0` line was not evidence, and is not how this should ever have been measured.

**Correction 2 — "the cause is DURATION" was WRONG. Durations are already productivity-derived and
arithmetically correct.** `getInstallSecs` (time_machine.js:4824) computes **`28800 / productivity`**
seconds per element — an 8-hour crew-day divided by units-per-day. Measured p50 = 0.022d = 1,900s ≈
15 units/day, sitting squarely inside the shipped table's range (`IfcDuct:18`, `IfcPipe:25`,
`IfcLightFixture:20`, default 10). A productivity of 18 units/crew-day genuinely IS 27 minutes per
unit. There is no missing default and nothing to invent.

**THE REAL DEFECT — measured: the WINDOW is wrong, not the duration and not the placement.**
`§DAY_GAP_PHASE_OCC` = work-days inside a phase ÷ the width of the window that phase was given:

```
Hospital    Substructure=157.8%(work=30.7d win=19.5d n=553)   Superstructure=24.4%(116.0d/475.7d n=2603)
            Architecture=18.1%(100.7d/555.1d n=17236)          MEP Rough-in=128.5%(725.9d/565.0d n=38362)
            MEP Final=323.2%(43.5d/13.5d)                      Finishes=119.9%(18.4d/15.3d)
LTU_AHouse  Substructure=4.7%(9.7d/204.7d n=238)               Superstructure=14.6%(237.2d/1627.6d n=6268)
            Architecture=10.9%(188.7d/1723.9d n=6586)          MEP Rough-in=174.3%(1636.6d/939.1d n=78940)
Clinic      Superstructure=21.2%(42.7d/201.2d)                 Finishes=11.4%(9.1d/79.8d)
Terminal    Finishes=17.7%(8.7d/49.1d)                         MEP Rough-in=97.0%(178.1d/183.7d)
```

**The structural/early phases are handed windows 4×–21× wider than their own work content, while the
MEP phases are OVERLOADED at 128–174%.** Superstructure gets 475.7 days for 116 days of work;
LTU's Substructure gets 204.7 days for 9.7. That imbalance IS the dead air — it is not a placement
problem inside a correct window, it is a window that was never derived from work content at all.
The width comes from `_twoTierRemap`'s tier serialization pushing phase ends out; the work never
grew to fill it. Global occupancy (~88–146%) hides this completely because the huge MEP counts
dominate the total — which is why §DAY_GAP_WIP's aggregate number pointed the wrong way.

This also finishes off the specced lever: spreading Superstructure's 2,603 starts across its 476-day
window would fake 4× the elapsed time to make a window look full **that should never have been that
wide.** It hides the defect instead of fixing it.

**User's question, answered (2026-08-12): "can't we have a standard default set in rates.JSON
according to world normal practice, later editable?" — YOU ALREADY DO, and it is already wired.**
`viewer/rates/sequence_rules.json` `LABOR_RATES` carries 10 trades, each with `crew_size`,
`max_crews` and a `productivity` map (units per 8h crew-day, per IFC class):
```
HVAC_TECH 2/2 · PLUMBER 2/2 · ELECTRICIAN 2/2 · STEEL_ERECTOR 4/3 · CONCRETE_GANG 6/3
MASON 3/2 · CARPENTER 2/2 · ROOFER 3/1 · FINISHER 2/2 · LABORER 1/1        (crew_size/max_crews)
```
It is already JSON, already editable, already consumed. Adding another default set changes nothing.

**But the instinct points at a real gap, in the OTHER column: `max_crews` is 1–3 for every trade.**
That is a small-job crew allocation being applied unchanged to a 63,182-element hospital and a
122,330-element LTU — and it is exactly what drives MEP Rough-in to 128–174% occupancy. A
size-scaled `max_crews` default (with the per-project JSON override the user describes) is a real,
sourced, non-invented fix for the OVERLOADED half. **Be clear about what it does and does not do:
raising crews COMPRESSES the busy phases; it does not fill the empty structural windows.** Those
need the window derivation fixed.

**Ranked, therefore:**
1. **Phase window derivation** — structural phases at 4.7–24.4% occupancy. This is the dead air.
   Window width should follow work content + support constraints, not tier-serialization push.
2. **`max_crews` scaled to project size**, JSON-overridable (the user's idea, correctly aimed) —
   fixes the 128–174% MEP overload.
3. **Do NOT build the spread-starts lever** — see above, twice over.

---

### §TIER_SERIAL_BY_ZONE — mechanism located, fix SIMULATED, result is PARTIAL (2026-08-12)

**Mechanism, measured.** `_twoTierRemap` (§TIER_SERIAL, #1282) makes the Tier-1 backbone
(Substructure→Superstructure→Architecture) strictly serial **globally**: every Superstructure element
anywhere finishes before any Architecture element starts. Hospital REMAP shows it exactly —
`Architecture=[306.6..603.7]`, `MEP=[603.7..1168.7]`, each phase beginning on the tick the previous
one ends, where RAW had `Superstructure=[0.0..296.3]`, `Architecture=[0.0..297.1]`,
`MEP=[38.9..297.8]` running concurrently. **The remap inflates the programme on all 7 buildings:**

```
              RAW end   REMAP end  inflation        by-zone SIM   vs today   longestEmptyRun
Hospital        314.9      1168.7    3.71x             616.7        0.53x       12% → 13%
Terminal        113.1       375.2    3.32x             215.8        0.58x        6% →  8%
JKR              36.4       110.1    3.02x              72.2        0.66x       10% →  6%
Clinic          143.7       399.8    2.78x             278.4        0.70x       17% → 13%
HHS_Office      46.1        122.1    2.65x              77.7        0.64x       10% → 12%
LTU_AHouse      810.9      1941.1    2.39x            1240.6        0.64x       29% →  3%
Duplex           10.5        18.0    1.71x              13.2        0.73x       23% → 10%
```

§TIER_SERIAL's own header cites the ruling it implements: *"ARCH/STR should be exempt as they are
the physical foundation. **Separate unrelated disciplines can run parallel thereafter if
construction practice permits**"* — and real practice starts walls on level 1 while level 7 is still
framing. A global barrier is stricter than that ruling requires.

**Simulation (probe only, shipped code untouched): run the SAME shipped remap per DERIVED storey
band instead of once globally.** Nothing hardcoded, nothing per-building — the band key is the
storey `_buildXrayElements` already assigns by median-Z ranking, straight out of the model; a
single-storey model collapses to exactly today's behaviour.

**Result, reported straight: it halves the inflation but does NOT fix the dead air.** Programme
drops to 0.53×–0.73× (Hospital 1168.7d → 616.7d), but the longest empty run only improves on 4 of 7
buildings and gets *worse* on Hospital (12→13%), Terminal (6→8%) and HHS (10→12%). Per-phase
occupancy barely moves (Hospital Superstructure 24%→23%, Architecture 18%→18%). **So zone-scoping
the barrier is a real and worthwhile programme-length fix, but it is NOT the dead-air fix, and must
not be sold as one.** The dead air needs the window-derivation work (rank 1 above) as well.

### §ZONE_KEY — the generic spatial key, and the COMMON-SENSE GAPS found while specifying it

User direction (2026-08-12): *"as long u ensure this is all abstract, generic to use in any IFC, at
earnest effort of the script rather than hard custom setting"* · *"we have other injections too ie
storey room space, should all come into play amicably"* · *"consolidate them to run well efficiently
cached for reuse thru out the building ops"* · *"then check for common sense gaps such as above."*

**GAP 1 — the spatial key is MOSTLY MISSING, so it can never be the primary key.** Measured share of
elements whose `elements_meta.storey` is null/empty/"unknown":
```
Duplex 86.0% (1,026/1,193) · Terminal 69.9% (33,848/48,428) · Clinic 32.2% (5,570/17,322) · Hospital 15.9% (10,192/64,150)
```
Any zone-scoped scheduling MUST run on the **derived** band (`assignStoreyByZ`'s median-Z ranking),
not the raw column. That is already the shipped behaviour inside `_buildXrayElements` and it is
generic — but it means "storey" in the scheduler is a **geometric inference, not IFC truth**, and
every doc/log line about it should say so rather than implying the model supplied it.

**GAP 2 — the richer spatial hierarchy exists on ONE building out of seven.** `Terminal_extracted.db`
alone carries `spatial_structure` (n=59: `guid, type, name, parent_guid, object_type,
predefined_type, center_*, size_*` — real `IfcBuildingStorey` rows) and `rel_contained_in_space`
(n=2,181: `space_guid → element_guid`). Hospital/Clinic/Duplex have neither. So room/space zoning
**cannot be required**. This is what "storey room space should all come into play amicably" has to
mean in practice: a **fallback chain**, finest available wins, degrading silently —
```
  room/space  (rel_contained_in_space + spatial_structure, where extracted)
    → storey  (elements_meta.storey, where non-null)
      → derived band (assignStoreyByZ median-Z ranking — ALWAYS available, geometry only)
        → single zone (degenerate: exactly today's global behaviour)
```
Each level is an optional refinement over the one below, never a prerequisite. A building extracted
without spatial tables loses precision, never correctness.

**GAP 3 — occupancy spread of 4.7% → 323% inside one building.** Hospital: `MEP Final=323.2%`,
`MEP Rough-in=128.5%`, `Substructure=157.8%` against `Architecture=18.1%`, `Superstructure=24.4%`.
LTU: `Substructure=4.7%` against `MEP Rough-in=174.3%`. A real programme keeps trades roughly
continuously employed; a 70× spread between phases of the same building is the single clearest
signal that windows are not derived from work content.

**GAP 4 — a wall takes less time than a beam, by count.** Hospital `Architecture n=17,236 →
100.7 work-days` (mean 0.006 d ≈ **8 minutes/element**) vs `Superstructure n=2,603 → 116.0
work-days` (mean 0.045 d ≈ 64 min). 6.6× more architecture elements carrying *less* total work.
Consistent with the parked weighting lane's "50–71% of labour-seconds carry no size signal" — the
productivity table is right per unit (§DAY_GAP_PHASE_OCC correction 2), but the *unit count* an
architecture element represents is not being derived from its size.

**GAP 5 — the storey banding is ALREADY computed twice.** `_buildXrayElements`'s `assignStoreyByZ`
and `injectGantt`'s own `§GANTT storey-bands: N bands from storey names (median Z)` are the same
derivation in two places — the identical duplication pattern `CPE_4D_PERF_MEM_FINDINGS.md §R7`
records for the support predicate (4 copies) and the element build (a self-described "DELIBERATE
COPY"). Adding a third consumer (a zone barrier) without consolidating first would make it three.

### §ZONE_INDEX — the consolidation the user asked for
**ONE derived spatial-zone index, computed once per (building, `_metaGen`), memoized, consumed by
every building op that needs a zone:** `injectGantt`'s storey bands · `_buildXrayElements` ·
the §TIER_SERIAL_BY_ZONE barrier · zone-level authoring (`materializeZones`, already emitting
`"<Phase> — <Storey>"`) · the Gantt's row grouping. Shape and cache discipline are already proven in
this repo — **reuse `§XRAY_CACHE_MEMO`'s pattern verbatim** (bim-ootb #1308): a 2-slot memo keyed on
`activeBuilding + _metaGen`, pure-function payload, runtime state never memoized, equivalence-gated
(`mismatch=0`) against the un-memoized derivation. That is the "efficiently cached for reuse thru
out the building ops" ask, and it is the same lever as R7 — consolidate first, then add the consumer.

### §DAY_GAP_TAIL — WORK-TO-ZERO PASS, 2026-08-12 ("proceed, resolve till zero")

**1. §ZONE_INDEX — ✅ DONE (witness W-ZONE 5/5, bim-ootb PR #1313, sw v1000→v1001).**
Both inline copies of the median-Z banding removed; one memoized index, fallback chain built.
Equivalence: **267,274 elements across all 7 buildings, mismatch=0**, band order identical.
Two corrections the witness forced on the spec above: `rel_contained_in_space` exists on **three**
buildings (Terminal 2,181 · HHS_Office_Federated 88 · JKR 107), not one — the §ZONE_KEY GAP 2 text
was written from a 4-building sample and is wrong; and **LTU_AHouse has 2 median-Z ties**, the exact
condition under which the two former copies could have disagreed with each other. They agreed in
practice; they were never guaranteed to.

**2. §TIER_SERIAL_BY_ZONE — ⛔ BLOCKED: does the strictly-serial backbone guarantee become
PER-ZONE instead of GLOBAL?** Not a code problem. Two separate user-confirmed contracts stand in
the way and only a ruling can move them:
- `W-TS-1` asserts *"Tier-1 strictly serial: `_twoTierRemap` reports tier1OverlapPairs=0 on every
  building"* — zone-scoping makes the GLOBAL count non-zero **by design**, so the witness contract
  itself has to be redefined, not merely re-run.
- §TIER2_AFTER_TIER1 quotes the user's own same-day correction verbatim: *"separate unrelated
  disciplines can run parallel THEREAFTER — after Tier 1 finishes, **not concurrent with it**."*
  Zone-scoping that is a direct reversal of it.
Weighing against: the measured benefit is programme length (0.53×–0.73×), and by this file's own
simulation it does **not** fix the dead air — it makes it slightly worse on Hospital, Terminal and
HHS. Reversing two confirmed contracts for a benefit that is not the user's stated complaint is not
a call to make unasked. Physical safety is not the issue either way: `_ogSupportSweep` already gates
every element individually against the real support DAG, and §TIER_SERIAL is a display grouping on
top of it.

**3. Window derivation — DIAGNOSED, AND IT IS NOT WHAT EITHER PRIOR THEORY SAID. UNBLOCKED.**
Measured per phase: how many elements occupy the last half of that phase's own elapsed window, and
by what point 95% of it has started (`§DAY_GAP_TAIL`).
```
Hospital  Supers: lastHalfOfWindow=13/2603 (0.5%)   95%startedBy=37%ofWindow
          MEP Ro: lastHalfOfWindow=45/38362 (0.1%)  95%startedBy=43%ofWindow
          Archit: lastHalfOfWindow=1137/17236(6.6%) 95%startedBy=52%ofWindow
LTU       Supers: lastHalfOfWindow=62/6268 (1.0%)   95%startedBy=15%ofWindow
          Archit: lastHalfOfWindow=54/6586 (0.8%)   95%startedBy=46%ofWindow
Clinic    Substr: lastHalfOfWindow=2/99 (2.0%)      95%startedBy=28%ofWindow
```
**13 elements out of 2,603 occupy the entire last half of Hospital Superstructure's 475.7-day
window.** 95% of the phase has started by 37% of it. That is the dead air, and it is a **thin
straggler tail**, not the tier-serialization contract — which is why item 3 is workable while item 2
is blocked. Naming them (`§DAY_GAP_TAIL_WHO`, worst phase per building):
```
LTU       Superstructure  tail=313 spanning 1386.3d past its 95% mark
                          IfcBeam×117, IfcMember×109, IfcColumn×57, IfcPlate×25, IfcSlab×5
                          latest: IfcBeam@day1714/bz10.8 of a 1941d programme
Hospital  MEP Rough-in    tail=1918 spanning 320.8d · IfcPipeSegment×885, IfcPipeFitting×652, IfcValve×227
Clinic    MEP Rough-in    tail=485 spanning 95.1d · IfcFlowFitting×245, IfcFlowSegment×232
```
**⚠ ROOT CAUSE NOT YET FOUND — and the obvious theory is DISPROVEN, recorded so nobody re-walks
it.** The natural hypothesis was that these are geometry outliers (a bogus Z making an element
permanently unsupported, hence pushed to the end). **It is false.** Hospital's entire model sits at
`center_z` 159.8–203.2 (a site-elevation offset; p50=181.5, p99=196.0), so the straggler's
`bz=195.9` is the TOP of the building, not bad data. LTU spans −45.6..17.1 (p50=8.1) and its
straggler beams at `bz≈10.8` are likewise in-range. The tails are real elements at plausible
positions. The remaining suspect is the push path itself — `_tierAuditRegate` / `_midairRepair`,
both later-only — where **one** bad support edge can drag an element hundreds of days and take its
phase window with it. That is the next measurement: for the named tail elements, log WHICH support
edge set their start.

**4. `max_crews` scaled to project size + JSON override — SPEC'D, not implemented.** Sourced and
non-invented (`sequence_rules.json` already carries `crew_size`/`max_crews` per trade: HVAC 2/2 ·
PLUMBER 2/2 · ELECTRICIAN 2/2 · STEEL_ERECTOR 4/3 · CONCRETE_GANG 6/3 · MASON 3/2 · CARPENTER 2/2 ·
ROOFER 3/1 · FINISHER 2/2 · LABORER 1/1). It fixes the OVERLOADED half (MEP at 128–174% occupancy)
and explicitly does **not** fill the empty structural windows. Deliberately sequenced last: it
changes every phase's elapsed length, so landing it before item 3's root cause is found would move
the very windows item 3 is trying to explain.

### §DAY_GAP LANE — RESOLVED TO ZERO, 2026-08-12

| # | item | state | evidence |
|---|---|---|---|
| 1 | §ZONE_INDEX | ✅ bim-ootb #1313 | W-ZONE 5/5, 267,274 elements, mismatch=0 |
| 2 | §TIER_SERIAL_BY_ZONE | ✅ bim-ootb #1314 | witness 57/0, programme −27..−47% |
| 3 | window derivation | ✅ folded into 2 | dead air gone from the film's opening |
| 4 | §CREW_DEMAND + §HR_COST | ✅ bim-ootb #1315 | W-CREW 4/4, premise disproven |

sw sequenced v1001 → v1002 → v1003.

**Item 2's ruling was DERIVED, not re-asked** (user: *"all guidance has been given in specs all
over. Do derive what is likely my response."*). §TIER_SERIAL's own header quotes the 2026-08-02
ruling — *"ARCH/STR ... the physical foundation. Separate unrelated disciplines can run parallel
thereafter IF CONSTRUCTION PRACTICE PERMITS"* — and practice permits walls on L1 while L7 frames.
Global was the cruder reading of the user's own sentence; per-zone is the faithful one.

**Items 2 and 3 were ONE fix**, as LTU predicted. Scoping the barrier per zone also bounds the
straggler tails, because a straggler in one zone no longer holds another zone's phase open.
Hospital's opening histogram — which IS the reported complaint — went
`[2228,0,0,915,0,4452,…]` → `[1715,3499,3916,3669,0,4336,…]`; LTU's five consecutive dead bands
`[514,4086,3541,4553,0,0,0,0,0,2,…]` → `[922,7248,7428,8260,8407,15525,…]`, none.
5D now lands with it: HR cost per building, LTU 2,696,098 over 15,822 person-days down to
Duplex 28,470 over 174.

**THREE OF MY OWN CLAIMS WERE DISPROVEN BY FINISHING THE MEASUREMENT. Recorded so no one re-walks
them:**
1. *"The cause is DURATION"* — WRONG. `getInstallSecs` already computes `28800/productivity`; p50
   0.022d ≈ 32 min is arithmetically right for 18 units/crew-day.
2. *"Every zero-start band is also zero-work"* — the evidence was a SAMPLING ARTEFACT (one instant
   per band against 0.015d elements). Re-measured by overlap; conclusion survived on 5 of 7
   exactly, but the number quoted was not evidence.
3. *"max_crews is a small-job list starving MEP"* — WRONG, and it was the whole basis of item 4.
   `§DAY_GAP_PHASE_OCC`'s occupancy is a single-crew-equivalent ratio; >100% just means >1 crew
   busy. Capacity is ~3,330 crew-days against 725.9 demanded. Worst real utilisation across all 7
   is PLUMBER at 31.0–92.8%. No trade is crew-bound. The autoscaler was built, measured as a
   no-op, and deleted rather than shipped.

Also caught, and the closest call of the lane: **the tier witness was silently testing nothing.**
It built its items without `storey`, so `_zoneOf` fell back to `'_ALL'` and the whole suite
exercised the DEGENERATE single-zone path — reporting 57/0 while proving zero about the change.
Found by diffing its `§TIER_COST` against the probe on the same code (JKR 110.1 vs 74.4). Any
future harness that consumes zoned items must carry the zone key or it is measuring the old world.

**Still open, small, and no longer in the film's way:** the residual dead run moved to the END
(Hospital 84–97%, LTU 94–99%) — `§DAY_GAP_TAIL` stragglers. Root cause unfound; the
geometry-outlier theory is disproven above. Next measurement is named: for the tail elements, log
WHICH support edge set their start (`_tierAuditRegate`/`_midairRepair`, both later-only).

### §DAY_GAP_TAIL_EDGE — the named measurement, RUN. 2026-08-12. NO SCHEDULE FIX WARRANTED.

The measurement above ("log WHICH support edge set their start") is done. Tool:
`scripts/probe_tail_edge.js` — it does not re-implement a gate; it slices the SHIPPED
`computeSchedule`/`_tier1Serialize`/`_tierAuditRegate`/`_twoTierRemap`/`_midairRepair` and patches
attribution-only recording into their mutation points. `--selfcheck` proves the instrumentation is
inert: **rawStartMismatch=0/122330 and pushPassMismatch=0/122330 on LTU** vs the unpatched modules.

**Final mover of each straggler's start (tail = starts past its phase's 95% mark, §DAY_GAP_TAIL_WHO's
own definition):**
```
LTU_AHouse  Superstructure  tail=312/6268 @1003.4d   MIDAIR 143(46%) · REGATE:bearing 139(45%) · T1SERIAL 30(10%)
Clinic      Superstructure  tail=31/960   @82.2d     MIDAIR  28(90%) · RAW:crew 2(6%) · REGATE:bearing 1(3%)
Hospital    MEP Rough-in    tail=1918/38362 @133.0d  TIER2SHIFT 1918(100%)
```

**1. "One bad edge drags many" — DISPROVEN.** LTU: **112 distinct driver elements for 312
stragglers**; the single most recurrent driver accounts for 30 (9.6%). There is no small edge set to
cut.

**2. Hospital's dead run — the biggest one (13% of film, 84–97%) — is NOT an edge at all.** 100% of
its tail is `_twoTierRemap`'s §TIER2_AFTER_TIER1 per-zone uniform shift: MEP waiting for its zone's
Tier-1 to complete. That is the user-confirmed contract, and it is item 2 of this lane — **⛔ BLOCKED
pending a user ruling, not a bug.** Nothing to fix here without that ruling.

**3. Clinic's tail is legitimate.** Its `_midairRepair` drivers are Architecture-phase
`IfcWallStandardCase` carrying Superstructure `IfcBeam` — the already-documented §TIER_DAG_WINS
wall-carried shape (support order wins over backbone serialization). Real construction order.

**4. One REAL defect found, MEASURED, and DELIBERATELY NOT FIXED — do not re-walk this.**
`_contactGraph` / `_midairRepair`'s carrier clause is bounded on the LOWER side only:
```
_contactGraph:4484 / _midairRepair:4690   S.bz >= T.tz - GAP                        && S.tz > T.tz + EPS
schedule_gate.js hangGate:259             S.base_z >= el.top_z - GAP && S.base_z <= el.top_z + GAP && ...
time_machine.js _tierAuditRegate:4090     S.bz >= T.tz - GAP && S.bz <= T.tz + GAP  && ...
```
Two of the four implementations of this one relation carry the upper bound; the two written in
#1303 do not (plus `witness_midair_zero.js`'s census, written in the same pass — so its
"independent census" was independent CODE, not an independent predicate). Consequence: **anything
XY-overlapping at ANY height above an element counts as the carrier it hangs from.** The worst LTU
straggler is exactly this — `IfcBeam 29OqYXvmL1o9` (Superstructure, top z=11.05) took its **only**
contact from `IfcFlowSegment 2befIFnbz0vO` (MEP Rough-in, base z=13.93 — **2.88 m clear above it,
not touching**) and was pushed **day 119.5 → 1181.4 (+1062.0 d)** to wait for that pipe. Model-wide
on LTU: 87 support-pool members gated on non-pool elements, 26,240 element-days of displacement.

**Adding the upper bound was implemented and measured. It is REJECTED on its own numbers:**
```
LTU tail 1003.4d → 988.3d (−1.5%)   Hospital worst phase moves MEP Rough-in → Architecture @237.2d
W-MZ-2 (midair==0)  still PASSES on all 7
W-MZ-4 orphans      Terminal 7→531 · Hospital 35→1386 · Duplex 1→11 · HHS 36→119 · Clinic 27→421
                    · LTU 865→2478 · JKR 1→32
W-MZ-8 trade        HHS 11→12 · Clinic 356→357 · LTU 1100→1177 (worse on 3 of 7)
```
The unbounded band is **load-bearing compensation for crude AABB contact**: `_contactGraph` is
pool-blind and has no §HANG_NEAREST fallback, so tightening it strands thousands of elements as
orphans (touching nothing) — a 3–40× blowup — and worsens the auditFloating trade, to buy 1.5% of
the tail. That is a design change with real regressions, not a narrow bug fix. Left alone, and the
asymmetry is now commented at all three sites so nobody "fixes" it uninformed.

**5. What DID ship (bim-ootb #NNNN, `fix/day-gap-tail`): `witness_midair_zero.js` was DEAD.**
It has thrown `ReferenceError: _zoneIndex is not defined` and exited before measuring a single
building **since #1313** — `_buildXrayElements` started calling `_zoneIndex()`/`_zoneOf()` and the
witness's slice list was never updated. Four PRs of this lane shipped while the witness that owns
`_midairRepair` certified nothing. Second latent defect in the same file: it sliced `_midairRepair`
**#0 of 2**, and declaration hoisting means the browser runs **#1** — it was judging a copy that
never executes (same class as this lane's own "the tier witness was silently testing nothing").
Both fixed; now slices ship-truth and logs `§MIDAIR_SLICE`. **38/0 pass, every W-MZ-1 baseline
identical to its documented value** (Terminal 161 · Hospital 165 · Duplex 19 · HHS 156 · Clinic 345
· LTU 4605 · JKR 110) — a pure repair, zero numeric drift. Added to `scripts/gate_4d.sh` (1m43s).

**Verdict: the §DAY_GAP_TAIL stragglers are legitimate, not a bug.** The tails are real elements at
real positions (geometry theory disproven above), driven by 112 distinct edges, and the largest one
is a user-confirmed contract that is already blocked on a ruling. There is no narrow schedule fix,
and none was invented. The `_midairRepair` duplicate definition (`:4517` delegating, `:4660`
inlined, last wins) remains a known low-priority defect — **the inlined copy is ship truth**; any
future edit must touch both or delete one, and `witness_midair_zero.js` now pins which is which.

**Order of work (do not reorder — each step de-risks the next):**
1. `§ZONE_INDEX` — extract the ONE banding derivation + fallback chain + memo. Pure refactor,
   equivalence-gated, zero schedule change. Closes GAP 5 and GAP 1/2 in one place.
2. `§TIER_SERIAL_BY_ZONE` — swap the global Tier-1 barrier for a zone-scoped one on top of (1).
   Expect 0.53×–0.73× programme, **not** a dead-air fix. Witness must re-run W-TS-1..6 + tier_serial
   + midair + gantt_lock; the "never before its support" guarantee is *strengthened* locally but the
   proof obligation is unchanged.
3. Window derivation from work content (rank 1) — the actual dead-air fix, and the largest piece.
4. `max_crews` scaled + JSON override — the overload half, the user's own idea.

---

## §BIM_USABILITY_REVIEW + §HOSTED_ZONE_SUSPECT (2026-08-12, session close)

User framing, and it reframes the whole lane: *"the 4D Gantt edit, JSON model is highly usable by
BIM people. That is the major purpose. What we doing on the fly is just a default useful fast poc
demo. As long users get to find this suite highly usable is all we after."* The generated 4D is the
DEMO; the editable Gantt + JSON is the PRODUCT. Rank future work that way.

**Scored review (verified by reading the shipped files, one score corrected below):**
- **9 — Data model.** Source of truth is IFC-native `schedules`/`tasks`/`task_elements` with the
  full planner column set (`wbs_parent, early/late dates, free_float, total_float, is_critical`).
  `task_elements` (task→guid) survives rename. A planner recognises this schema.
- **8 — CPM is real.** `schedule_author.js:1249 computeCpm` writes early/late dates, float and
  `is_critical` onto leaf tasks. Not a decorative schema.
- **8 — Import.** `foreign_schedule.js` reads P6 XER, PMXML and MS Project MSPDI, including
  `total_float_hr_cnt`/`driving_path_flag`.
- **8 — Export.** ⚠ **I FIRST SCORED THIS 2/10 AND WAS WRONG.** `schedule_editor_ui.js` already
  ships MS Project XML (`§SE_EXPORT_MSP`, :664) AND P6 PMXML/XER writers (`§X7`, :671) with
  round-trip witnesses. I graded it after grepping only `schedule_author.js` and `boq_charts.html`
  and never opening the editor UI. User: *"The export was done in a separate editor tab in TM
  panel. Is it hard to find things already done?"* — SAME failure mode as GAP 4 below: looked in
  the wrong place, reported an absence as fact. **Before claiming any capability is missing, grep
  `viewer/*_ui.js` and `viewer/*editor*.js` — the user-facing surfaces live there, not in the
  engine files.**
- **7 — JSON rules.** `sequence_rules.json` is Settings-editable and every override carries a
  `reason` with its measurement. One large file mixing rules + name-overrides + labour rates; a
  planner changing one productivity figure has to hunt.
- **6 — Persistence.** Staged only until Ctrl+S (`§CINEMA_PATH_STAGE ... Ctrl+S (Save Building)
  writes`). Silent data loss if the user doesn't know.

### §HOSTED_ZONE_SUSPECT — ⛔ OPEN REGRESSION, prime suspect is our own #1314
User: *"electrical outlets and hanging elements appearing bit early. Didnt happen before."*
Prime suspect **§TIER_SERIAL_BY_ZONE (#1314)**: it changed "Tier 2 waits for ALL Tier 1" to "Tier 2
waits for ITS ZONE's Tier 1". An outlet's zone comes from the §ZONE_INDEX **median-Z band**, not
from its host wall — so an outlet banded one storey off its wall now waits for the WRONG zone's
backbone and can precede its own host.
Already ruled out: W-TS-2 shows displayed floating <= generative on all 7 (LTU improved 334→328),
so no new BEARING violations. The untested predicate is HOSTED/hanging.
**Next measurement (not yet run):** per hosted element, start delta vs its own host wall's start.
**Named fix if confirmed:** a hosted element inherits its HOST's zone, not its own median-Z band.
User's own read was close — *"one whole phase Gantt set not measured before placing"* — and the
answer to *"why can't we just have a template"* is that `sequence_rules.json` IS that template and
it does work; it fixes WHEN electrical goes, but only geometry can say WHICH wall a given outlet
waits for, and IFC ships no host link for most of them.

### §AGENT_DISPATCH — how to work this lane with agents, token-wise (2026-08-12, user directive)
*"put to prompt it can launch well scoped agents that spend tokens wisely."* This lane is now big
enough that a fresh session should FAN OUT, not read everything itself. Scope each agent so it
returns a VERDICT, not a file dump.

**Dispatch these in parallel, one Agent each, each with its own §-log to read:**
1. **Measure-only agent** — run `scripts/probe_arch_start.js` (it already carries §DAY_GAP,
   §DAY_GAP_WIP, §DAY_GAP_DUR, §DAY_GAP_PHASE_OCC, §DAY_GAP_TAIL, §TIER_SERIAL_BY_ZONE,
   §CREW_AUTOSCALE) and return ONLY the changed numbers vs the ones recorded above. It must NOT
   read viewer source; the probe is the interface.
2. **Witness-runner agent** — run the named witness (`witness_zone_index`, `..._tier_serial_display`,
   `..._crew_demand`, `..._arch_area_weight`) and return `n/N + failing gate lines only`.
3. **Locator agent** (Explore) — for "does X already exist", grep `viewer/*_ui.js` and
   `viewer/*editor*.js` FIRST. The export mis-grade above happened because a session searched only
   engine files. Return file:line, not excerpts.

**Token rules that this session learned the hard way:**
- Never paste a full bake log into context — grep it (`grep -E "§DAY_GAP|§TIER"`). One Hospital
  bake log is tens of thousands of tokens and contains ~20 lines that matter.
- Never re-derive a number this file already records — cite the § section.
- One agent = one question with a pass/fail or a number as its answer. If the prompt cannot name
  what the answer looks like, the scope is wrong.
- Headless swiftshader CANNOT load Hospital/LTU (§6, 14.5 s/frame) — never dispatch a browser
  witness for those; use the node probe.

### §WORKING_STYLE — read before replying to anything in this lane (2026-08-12, user directive)
Verbatim: *"FOLLOW TERSE RULE! I HATE YOUR LANGUAGE WHICH WHOLE WORLD IS COMPLAINING."* ·
*"DO NOT ASK MORE when request is clear"* · *"maintain terse language, stop asking what is obvious,
user wants results that are already spec'd in full."*

- **Terse.** Verdict first, 1-3 lines. No preamble, no restating the question, no options menu.
  Scored lists, not prose.
- **Do not ask.** The guidance is already written down — in this file, in `CLAUDE.md`, in the
  memory feedback entries, and in the § headers of the code itself. **Derive the answer from the
  record and act.** This session asked three questions it could have answered by reading: the
  §TIER_SERIAL_BY_ZONE ruling was sitting in §TIER_SERIAL's own header (the 2026-08-02 "if
  construction practice permits" clause); the shadow target was stated plainly ("as strong as in
  TM"); the export question was answerable by opening one file. Each ask cost a round trip and the
  user's patience.
- **Ship what is spec'd.** If a spec section names the fix, build it — do not re-spec it, do not
  re-measure what is already recorded, do not end a message with "want me to take it?".
- **5% error margin is acceptable** (user ruling). Do not chase exactness past the point of
  usefulness; gate at 5% and move on.
- **Only stop for:** something genuinely destructive, or a fact that exists nowhere in the record
  and cannot be measured. Everything else: decide, do it, report the number.

### §HOSTED_BEFORE_HOST — MEASURED. The bug the user sees, that no witness owned (2026-08-12)
Answer to *"is the prompts/# going to do thorough specs / system check to see nothing is broken?"*
— **not on its own. A prompts file is a record, not a mechanism.** Two gaps closed here:

**1. `scripts/gate_4d.sh`** — ONE command running all four 4D witnesses plus the probe, printing a
single pass/fail and the shape numbers. Five changes shipped 2026-08-12, each with its own witness,
each green IN ISOLATION, and the user still hit a visible bug. Nothing ran them together. Run this
before and after any 4D change and diff the logs.

**2. The predicate nobody owned.** Every shipped witness checks BEARING support, class totals, or
zone serialization. None asked what a viewer asks: *did a hosted element appear before the thing it
hangs on?* Added as `§HOSTED_BEFORE_HOST` in the probe. First run:
```
Hospital  hosted=2877  hostMatched=2830  EARLY=1480 (52.3%)  worst=147.7d  IfcLightFixture@IfcCovering
Clinic    hosted=2742  hostMatched=2737  EARLY=660  (24.1%)  worst=87.9d   IfcFlowTerminal@IfcCovering
JKR       hosted=508   hostMatched=506   EARLY=30   (5.9%)   worst=29.8d   IfcAirTerminal@IfcCovering
```
**Half of Hospital's light fixtures/terminals appear before their ceiling, up to 147 days early.**
Host is INFERRED (IFC ships no host link for most): nearest wall/slab/covering whose bbox brackets
the hosted element's centre, coarse XY grid, O(n).

⚠ **PROVENANCE NOT ESTABLISHED.** 52% is too large to be purely #1314's zone change; this is likely
long-standing and #1314 only made it more visible. Do NOT assume it is a regression — run the probe
against a pre-#1313 export (`/tmp/vw`, see probe header) and compare EARLY% before blaming anything.
**Fix candidate, unproven:** hosted elements inherit their HOST's schedule floor, not their own
median-Z band's. `§HOSTED_BEFORE_HOST EARLY` is the number a real witness must assert at 0.

#### ✅ DONE (witness) — bim-ootb #1319, 2026-08-12. Provenance settled, both layers fixed.
**PROVENANCE: LONG-STANDING, not #1314.** Probe at `42539c9` (pre-#1313) vs `314185d`, EARLY%:
Terminal 25.2→25.6 · Hospital 50.3→52.3 · Duplex 9.6→8.7 · HHS 17.7→17.8 · Clinic 23.2→24.1 ·
LTU_AHouse 37.7→37.8 · JKR 5.7→5.9. **Max delta 2.0pp — the zone barrier exposed it, did not cause
it.** Do not re-litigate this; the fix stands on its own merits.

**ROOT CAUSE, one fact:** the host of essentially every offender is `IfcCovering` — a ceiling — and
`IfcCovering` is in **NO support pool** (`structGrid` = seq<=4 + promoted slabs, `wallGrid` = walls).
`geoGate`/`hangGate`/`wallGate`/`openingGate` each read one of those two, so a ceiling was invisible
to every gate. And `sequence_rules.json` puts MEP Final at seq **9** and Finishes at seq **10** — so a
lay-in fixture is scheduled before its own ceiling *by rule*, everywhere, not by accident.
`hangGate`'s §HANG_NEAREST fallback cannot catch it either: it is scoped to BIG elements, and
outlets/fixtures are exactly the small ones it leaves ungated.

**FIXED IN BOTH LAYERS THAT OWN THE ORDER** — the generative fix alone was NOT enough:
- `schedule_gate.js` `hostGate` + its DAG twin — hosted may not start before its host FINISHES.
- `time_machine.js` `_twoTierRemap` — §TIER2_AFTER_TIER1's per-zone shift is order-preserving WITHIN
  a zone but **not ACROSS** zones, and `_zoneOf` is the RAW storey, so a `"Level 3 Ceiling"` covering
  and the `"Level 3"` fixture in it get different shifts and re-invert. Measured on the already-fixed
  generative layer: JKR `gen=0 → remap=30`, HHS `gen=0 → remap=11`. **Any future display-layer shift
  keyed on zone has this hazard — it is not specific to Tier 2.**
- ⚠ ONE pairing, shared by gate + DAG + display (`ScheduleGate.hostPairs`). A placement-order grid and
  an element-order index break Manhattan ties differently — that alone left **125 of LTU's 5,466**
  past the gate. Do not re-split it.

**RESULT (display timeline):** Terminal/Hospital/Duplex/HHS/Clinic/JKR all **0.0%**;
LTU_AHouse **0.2%** (11/5466, attributed by the witness to `_midairRepair` pushing 11 coverings past
what they host — inside the 5% margin). §DAY_GAP dead air SHRANK where it moved (Hospital 13→11%,
Clinic 13→11%, Terminal 8→7%, LTU 3→2%); display programme +0..2.2%; §CREW_AUTOSCALE unchanged.
Witness `viewer/tests/witness_hosted_before_host.js` (4/4) is now in `gate_4d.sh` — gate pass=4 fail=0.

⛔ **FOUND IN PASSING, NOT FIXED (one-line, still open):** `viewer/tests/witness_midair_zero.js`
dies with `ReferenceError: _zoneIndex is not defined` — it slices `_buildXrayElements` but not
`_zoneIndex`/`_zoneIndexBuild`, which `_buildXrayElements` has required since #1313 landed. Its
static gates (W-MZ-5/6a/6b) still pass, so it looks alive; the per-building census never runs.
Found independently by a concurrent session the same day, which added it to `gate_4d.sh` — so the
gate now SHOWS the breakage, but nothing has fixed the slice yet and no PR is open for it. The fix
is the two `sliceFn` lines the probe and `witness_hosted_before_host.js` already carry.

---

## §TIER1_HANDOFF — "the ARCH is a gap after piling done" (2026-08-12, MEASURED; NOT a #1314 regression)

**User, verbatim:** *"maybe due to my insistence, the ARCH is a gap after piling done. make things
back to back as usual if so"* — with the explicit standing instruction *"better to follow the facts
and figures."* So it was measured before anything was touched. **Nothing was implemented for this
item; no schedule code changed.** The measurement is the deliverable, plus the one real cause it
found, which a concurrent session had already fixed 46 minutes earlier.

**Measurement added to the canonical probe**, not a new script:
`scripts/probe_arch_start.js` → `§TIER1_HANDOFF`, four lines per building on the DISPLAY timeline
(post `_twoTierRemap` + `_midairRepair`, the same items every other §-line in that probe reads):
`GLOBAL` / `GLOBAL_SER` (straggler-excluded, the population `_tier1Extents` actually sees) /
`PER_ZONE` (the predicate `_tier1Serialize` enforces) / `WINDOW`. Run:
`ONLY=Hospital VIEWER_DIR=<rev> BLD_DIR=~/bim-ootb/buildings node scripts/probe_arch_start.js`

**The two framings disagree, and only one is the film.** GLOBAL max-Substructure-end vs global
min-next-phase-start is NOT a gap across zones — the latest zone's piling routinely finishes after
the earliest zone's walls started, so it reads negative (overlap) on Duplex/Clinic/LTU/HHS. The
number that decides dead air is `WINDOW`: how much work is on screen between global last-Substructure
-end and global first-Architecture-start.

### VERDICT 1 — on current `main` (`1660c99`) there is NO piling→ARCH dead air.

| building | WINDOW after last Substructure | verdict |
|---|---|---|
| Hospital | 13.7d wide, **1151 Superstructure starts, 59.5 work-days, mean concurrency 4.36** | OCCUPIED |
| Clinic | none — ARCH starts *before* last Substructure ends (overlap 0.0d) | no window |
| LTU_AHouse | none — overlap 104.0d | no window |
| Duplex | none — overlap 0.2d | no window |
| HHS_Office_Federated | no Substructure phase at all | n/a |

Hospital PER_ZONE: 20 zones, 13 consecutive backbone pairs, **median gap 0.0d**, 4/13 pairs >0.5d,
worst `"Level 2 TOS" Supers→Archit 47.9d (n=401→162)`. That is a residual of the generative layer
(`_tier1Serialize` only ever pushes LATER — where a zone's ARCH naturally starts after that zone's
Superstructure ends, `d=0` and the natural gap survives by design), not of the barrier. It creates no
visible dead air: the film's only empty run is at 84–95% (`§DAY_GAP`), nowhere near piling.

### VERDICT 2 — PROVENANCE: today's changes CLOSED this gap ~21x. The opposite of the suspicion.

Same probe at `42539c9` (pre-#1313, this morning's earliest point), identical fixtures:

| | `42539c9` (pre-#1313) | `1660c99` (current) |
|---|---|---|
| Hospital WINDOW | **287.2d wide, mean concurrency 0.40** | 13.7d, concurrency 4.36 |
| Hospital ARCH first start | day 306.6 | day 33.1 |
| Hospital PER_ZONE gap med / max | 171.3d / 348.3d, 12/13 pairs gapped | **0.0d** / 47.9d, 4/13 |
| Clinic WINDOW | **97.5d wide, mean concurrency 0.33** | none (overlap) |
| Clinic PER_ZONE gap med / max | 4.3d / 109.4d | 0.0d / 8.8d |

**Mean concurrency 0.40 on a 63k-element Hospital means less than one element in progress at a time
for 287 days** — that is genuine dead air, and it is *precisely* the symptom the user described.
**#1314 §TIER_SERIAL_BY_ZONE is what removed it.** The user's insistence did not cause the gap; the
work done on that insistence is what fixed it.

### VERDICT 3 — the real defect: the fix could not REACH the user. `_GANTT_CACHE_VERSION` stuck at 11.

The gap the user is watching is real — it is the **`42539c9`-era schedule replaying out of IndexedDB**.
`_GANTT_CACHE_VERSION` was **11** at `bcec670` (§MIDAIR_REPAIR) and still **11** at `1660c99`, i.e.
un-bumped by every schedule-behaviour commit of the day:

| commit | PR | changed | bumped? |
|---|---|---|---|
| `475373b` | #1313 §ZONE_INDEX | median-Z zone banding | ✗ |
| `1a20932` | #1314 §TIER_SERIAL_BY_ZONE | **the display remap itself** | ✗ |
| `99babe7` | #1315 §CREW_DEMAND | crew caps → `computeSchedule` inputs | ✗ |
| `c972778` | #1319 §HOSTED_BEFORE_HOST | `hostGate` + a host push inside `_twoTierRemap` | ✗ |

The constant's own comment states the rule: *"MUST bump on every change to computeSchedule's gating
OR the display remap, or a building already materialized under an older version keeps replaying it
forever."* Both cache paths key on it — the `gantt:v11:<bld>` IDB JSON entry (`_cacheKey`) and the
`kernel_ops ELEMENT_PLACE` `_genVersion` stamp (`_kernelOpsSchedStale`). **A hard reset cannot clear
either** (IndexedDB, not HTTP cache), so a Hospital first materialized under v11 before #1314 replays
the 287-day gap against fully-deployed new code, indefinitely.

✅ **ALREADY FIXED — bim-ootb #1322 `6e1ca24`, 18:12 today, by a concurrent session** ("§GANTT_CACHE_VERSION
— bump for #1319's hostGate, missed on first landing"): v11→v12, sw v1007→v1008. It cites #1319 only,
but the eviction it performs is what also delivers #1313/#1314/#1315. **No PR was opened from this
lane — the one-line fix was already on `origin/main` before this measurement finished.** Next cold
open of Hospital on v1008 regenerates and the gap goes 287.2d → 13.7d.

**Gate baseline** (`VIEWER_DIR=/tmp/wt-tier1-gap/viewer`, `1660c99`, `/tmp/gate_4d_BASELINE.log`):
`witness_zone_index` 5/5 · `witness_tier_serial_display` pass=57 fail=0 · `witness_crew_demand` 4/4 ·
`witness_midair_zero` pass=38 fail=0 · `witness_hosted_before_host` 4/4 · `witness_arch_area_weight`
MISS (not on this branch, expected). **6 witnesses, 0 FAIL.** No "after" run — no schedule code was
changed by this lane.

### ⛔ OPEN, named not fixed: nothing witnesses the `_GANTT_CACHE_VERSION` bump.

Three misses in one day (#1286→#1287, #1319→#1322, and #1313/#1314/#1315 which were only ever evicted
as a side effect of #1322). `witness_kernel_ops_sched_version.js` tests the *predicate*
`_kernelOpsSchedStale`, never that the constant moved — so a missed bump is invisible to `gate_4d.sh`
and only ever surfaces as a user reporting a fixed bug as still-live. **The guard is a git-level
check, not a witness:** if a commit's diff touches `schedule_gate.js` gating, `computeSchedule`'s
call sites, `_twoTierRemap`/`_tier1Serialize`/`_midairRepair`, or `sequence_rules.json`, then
`_GANTT_CACHE_VERSION` must also change in that same diff. Cheapest home is a `gate_4d.sh` step
guarded on `VIEWER_DIR` being a git tree (it is skipped for the exported-revision runs).
✅ Built same day: `§CACHE_VERSION_GUARD` in `scripts/gate_4d.sh` (bim-compiler). First version only
diffed added function *declarations*, blind to a function being REWRITTEN in place — measured on
its own first real customer (M1's crew-clock rewrite) reporting `gating_changed=0`, which would have
waved a missing bump straight through. Widened: any non-comment added line in `schedule_gate.js`
counts as a gating change (that whole file IS the gating engine).

## §UNIVERSAL_HOST_BUFFER — NEXT DIRECTIVE, not yet built (2026-08-12, user's own proposal)
User, after `openingGate`/`hostGate` were explained as two separate class-specific fixes for the
same underlying shape of bug (ceiling not in any support pool, then a suspected wall-class gap on
HHS L3): *"why can't there be an envelope route in the end to simply boolean isPhysicallyHosted()?
... if it is false, then put in a buffer which dumps the stack once hosted."*

**This is the right generalization, and `§MIDAIR_REPAIR` already proves the shape works** — it is a
class-blind, pool-blind "has anything you touch appeared yet" repair pass, and it took floating
elements from 5,561 to 0 across all 7 buildings. What it does NOT do is find the CORRECT host
precisely — its bar is coarse (any contact counts), which is why `hostGate` (ceilings) and
`openingGate` (walls) still had to be hand-built separately, one class-family at a time, each time a
new "element X has no support pool" bug was found live.

**The directive**: replace the growing set of class-specific gates with ONE generic
`isPhysicallyHosted(el)` — geometric nearest-real-contact lookup across ALL classes/pools, no class
whitelist on either side (mirrors what `hostGate`'s own host-inference and `openingGate`'s
`wallGrid` lookup each already do narrowly) — and a buffer/queue per unresolved host: an element
with `isPhysicallyHosted(el) === false` holds until its real host is placed, then releases together
with everything else waiting on that same host. This retires the current pattern (discover one more
ungated class → build one more gate → repeat) in favour of one mechanism that covers classes nobody
has hit yet.

⛔ **Sequencing, not scope**: do NOT start this while `fix/m1-crew-day-clock` and
`fix/hhs-door-host-wall` are still in flight — both are actively rewriting the exact gate functions
(`computeSchedule`, `place()`, `openingGate`/`hostGate`) this generalization would replace. Build it
AFTER both land and merge to `main`, off the then-current gate code, not before.

## §CURTAIN_WALL_OPENING — HHS Level-3 floating doors, root-caused and FIXED (2026-08-12)
**User report:** HHS_Office_Federated Level 3 doors appear before their host wall exists. Sat on the
punch list as "not investigated… re-verify against a FRESH bake" (OPEN THREADS item 3, now ✅).

**First deliverable: the probe that was cited but never existed.** `openingGate`'s own header claims
"measured on all 7 shipped buildings (probe_door_wall.js)". No such file was ever committed. It now
exists — `bim-compiler/scripts/probe_door_wall.js` — and reports per STOREY, on both the generative
and the DISPLAY timeline, against three pools (`wallGrid` = what the gate sees today, `wallLike`,
`any`). Run: `VIEWER_DIR=… BLD_DIR=… node scripts/probe_door_wall.js` (`ONLY=`, `DETAIL=<pool>`).

**The finding, and it is NOT the predicate — it is the pool.** `openingGate` is correct: rawEARLY
**0.0% on all 7 buildings** against `wallGrid`. The defect is coverage. `place()` fills `wallGrid`
from `el.cls.indexOf('IfcWall') === 0`, and HHS's façade is a curtain wall, so **34 of 133 HHS
openings (25.6%) had ZERO candidate** and `openingGate` fell straight through to `baseMs` —
completely ungated from day 0. Same shape as §HOSTED_BEFORE_HOST's `IfcCovering` (a real class in no
pool), one layer over.

**The host classes are EXTRACTED, never guessed** — HHS's `element_name` column names them:
`IfcCurtainWall` = "Curtain Wall:Standard" (assembly), `IfcPlate` = "Systemelement:**Verglasung**"
(glazing), `IfcMember` = "Rechteckiger **Pfosten**:6 x 15 mit Deckprofil" (mullion). The offending
L3 doors are "Türelement 1-flg - Drehflügel - **Glas**". Checked and confirmed: the DBs carry **no**
`IfcRelAggregates`/`IfcRelFillsElement` (`spatial_structure` holds only `IfcBuildingStorey`/
`IfcSpace`; zero `IfcPlate`/`IfcMember` rows have a parent) — so the assembly exists ONLY as its
geometric parts, and `IfcCurtainWall` itself has **zero geometry rows** in HHS (pure container).
Gating on the assembly class alone would have been a no-op; the PARTS are what must be indexed.

**Why no other gate caught it, one fact:** `IfcMember` is seq 3 and `IfcPlate` seq 4, so both sit in
the STRUCTURE grid — where `geoGate` only tests bearing-below or contained-in-lower-half. A
full-height mullion beside a door starts at the SAME floor level, satisfying neither. A door cut into
a curtain wall is a SIDEWAYS relation — exactly what §DOOR_WINDOW_HOST_WALL was written for, missed
only because its pool is keyed on a class-name prefix.

**The fix** (`viewer/schedule_gate.js`): `cwGrid`, a SECOND INDEX over records that already exist
(same rec object as the structure grid ⇒ a §DEQ_REPAIR shift is seen through both, no copy to drift),
consulted by `openingGate` **only when the wall pool yields nothing**. Strict addition — an opening
gated today keeps its exact current start. No new threshold (reuses the existing EPS bracket). Cannot
cycle: `IfcMember`/`IfcPlate` are seq ≤4 so the repair loop never moves them, and the one seq>4 pool
member, `IfcCurtainWall`, is not an opening. New `§CURTAIN_WALL_OPENING cwGated/stillUngated/cwCells`
log line makes the pool auditable. `_GANTT_CACHE_VERSION` 12→13 + `sw.js` v1008→v1009 in the SAME diff.

**Before → after (`wallLike` pool, rawEARLY / worst; the number the fix must close):**
| building | before | after |
|---|---|---|
| **HHS_Office_Federated** | **30/133 (22.6%) worst 9.5d** | **0 (0.0%) worst 0.0d** |
| — HHS **Level 3** | **6/37 (16.2%) worst 9.5d** | **0/37 (0.0%) worst 0.0d** |
| — HHS Level 1 / Level 2 | 14/50 (28.0%) / 10/46 (21.7%) | 0 / 0 |
| Clinic | 10/312 (3.2%) worst 22.2d | 2 (0.6%) worst 16.1d |
| Hospital | 10/570 (1.8%) worst 187.6d | 5 (0.9%) worst 172.5d |
| Terminal / Duplex / LTU_AHouse / JKR | — | **byte-identical, zero change** |

`§CURTAIN_WALL_OPENING cwGated=` 34 HHS / 8 Clinic / 5 Hospital / **0** Terminal, Duplex, JKR.
`§DEQ_REPAIR shifted=` Terminal 44→44 (unchanged), HHS 2→32 (the newly-gated openings). A/B'd against
the pre-fix `schedule_gate.js`, so "unchanged" is measured, not assumed. `§SUPPORT_CYCLE` unchanged
everywhere — JKR's alarming `cycles=4564` is PRE-EXISTING and byte-identical before/after (verified,
not assumed); see the note at the end of the next section.

**`gate_4d.sh` before/after: `pass=6 fail=0 missing=1` → `pass=7 fail=0 missing=1`.** All 6 witnesses
identical verdicts; the 7th is `§CACHE_VERSION_GUARD` going `SKIP`→**`PASS gating_changed=32
version_bumped=1`** (it only SKIPped in the baseline because that tree WAS `origin/main` with nothing
to diff). `missing=1` is `witness_arch_area_weight`, absent from this revision — pre-existing, not
this change. **§-number drift, one building, explained not waved through:** Clinic's 8 newly-gated
openings shift its `§DAY_GAP` longest-empty-run *location* from 11%..22% to 88%..99% — the run
LENGTH is unchanged (11% both), `spanD` is unchanged (278.5→278.5), and MEP Rough-in occupancy
*improves* 88%→95%. Clinic simply has two empty runs of equal length and a small perturbation flips
which one is reported as the max. Not a regression; recorded so the next reader does not re-derive it.
Every other building's §-numbers are byte-identical.

## §DOOR_WINDOW_HOST_WALL_DISPLAY — ✅ FIXED (witness), bim-ootb `fix/door-window-host-display`
**CLOSED 2026-08-12, same day it was found. Do not re-measure the before-numbers below — they are the
pre-fix state, kept as provenance.** The fix is the display-layer twin this section itself predicted:
`ScheduleGate.openingPairs()` (one pairing at module scope, `openingGate`'s own pools + fallback
ORDER + its bracket predicate hoisted as `openingBrackets()`), honoured by `_twoTierRemap` right
beside the `hostPairs` repair — same shape as §HOSTED_BEFORE_HOST, deliberately not a second
mechanism. Later-only: an opening is pushed to its host's end, never pulled earlier.

| building | dispEARLY BEFORE | dispEARLY AFTER | attribution of the residual |
|---|---|---|---|
| LTU_AHouse | 366/1280 (28.5%) | **25/1280 (2.0%)** | gen=0 remap=0 → display=25 |
| Terminal | 61/371 (16.4%) | **0 (0.0%)** | — |
| JKR | 15/148 (10.1%) | **0 (0.0%)** | — |
| Hospital | 14/570 (2.5%) | **1/570 (0.2%)** | gen=0 remap=0 → display=1 |
| HHS / Clinic / Duplex | 0 (0.0%) | **0 (0.0%)** | — |

**Every residual is `remap=0 → display=N`** — i.e. `_midairRepair`, which runs AFTER the twin, moving
a host wall later than what it hosts. That attribution is not inferred, it is the new **`G-CWO-STAGE`**
gate printing gen/remap/display per building every run. Driving it to 0 means alternating the two
rules to a joint fixpoint, which `_midairRepair`'s own header records as **built, measured and
REJECTED** (4 rounds, 7,650 pushes, no convergence, 0.8s → 14.8s; one rule is keyed on a contact's
START, the other on a host's END). So the residual is accepted at the lane's standing 5% margin —
the same margin `G-HOST-DISPLAY` carries for the identical reason.

**`gate_4d.sh` A/B — baseline run against a PRISTINE EXPORT of `main`, not this tree, so the two logs
are a real A/B and not a self-comparison:** `pass=7 fail=0 missing=1` → **`pass=8 fail=0 missing=1`**
(`missing` = `witness_arch_area_weight`, pre-existing; the +1 pass is `§CACHE_VERSION_GUARD` going
`SKIP` (plain export can't diff) → **`PASS gating_changed=36 version_bumped=1`**). Every other witness
byte-identical: `zone_index 5/5`, `tier_serial_display 57/0`, `crew_demand 4/4`, `midair_zero 38/0`,
`hosted_before_host 4/4`, `kernel_ops_sched_version 12/0`; `curtain_wall_opening` **4/4 → 5/5**.
**Zero §-number drift outside `§DW_COVER`** — `§TIER_SERIAL_BY_ZONE`, `§DAY_GAP`,
`§DAY_GAP_PHASE_OCC`, `§CREW_AUTOSCALE`, `§HOSTED_BEFORE_HOST` are identical on all 7 buildings. The
change moves openings and nothing else. `probe_door_wall.js`'s independent `§DW_COVER wallGrid`
column reproduces the witness numbers exactly, and the unfiltered `any` pool (upper bound, never a
target) improves as a side effect: Terminal 42.3→34.0%, LTU 65.4→50.4%, JKR 64.2→58.1%,
Hospital 30.1→27.8%. **PR bim-ootb #1326.**

**`G-CWO-DISPLAY` PROMOTED report-only → BLOCKING** (`<= 5%` of `hostMatched`). It shipped
non-asserting for exactly one day so this fix could promote it rather than red-flag every run for an
unowned defect. `witness_curtain_wall_opening` is now **5/5** (was 4/4).
**`_GANTT_CACHE_VERSION` 14 → 15, `sw.js` v1010 → v1011** — `kernel_ops` is written from the DISPLAY
timeline, so a building materialized under v14 replays the un-repaired order forever regardless of
deployed code. `§CACHE_VERSION_GUARD` PASS is part of the after-run proof.

### The pre-fix measurement (provenance — do not redo)
Found by the same probe, 2026-08-12. **Separate defect, separate lane — deliberately NOT bundled into
the §CURTAIN_WALL_OPENING fix** (this lane's own gate exists because five changes landed in one day
and no witness owned the broken predicate). It does **not** affect HHS, so it is not the reported bug.

`openingGate` runs inside `computeSchedule`. `_twoTierRemap` + `_midairRepair` then rewrite the
DISPLAY timeline the movie actually plays — and **break the guarantee**. Measured, `wallGrid` pool,
raw → display:

| building | rawEARLY | dispEARLY | worst (display) pre-#1323 → post-#1323 |
|---|---|---|---|
| LTU_AHouse | 0 (0.0%) | **366/1280 (28.6%)** → 365 (28.5%) | 974.0d → **2922.7d** |
| Terminal | 0 (0.0%) | **61/371 (16.4%)** | 28.1d → **84.1d** |
| JKR | 0 (0.0%) | **15/148 (10.1%)** | 11.7d → 35.0d |
| Hospital | 0 (0.0%) | **14/565 (2.5%)** | 172.5d → **516.5d** |
| HHS / Clinic / Duplex | 0 | 0 | 0.0d |

⚠ The worst-day column roughly **TRIPLED** when this branch merged `origin/main` — that is
**#1323 §ARCH_START_TEMPO/M1's 8-hour crew day** stretching the whole programme ~3x, exactly as its
own note predicts, NOT a worsening of this defect: the dispEARLY **percentages are stable to within
0.1pp** across the merge. Quote the percentages, not the days, when tracking this thread.

4 of 7 buildings show doors on screen before their own host wall finishes, up to 974 days early.
§HOSTED_BEFORE_HOST got a display-layer twin (`_twoTierRemap` reads `ScheduleGate.hostPairs`);
§DOOR_WINDOW_HOST_WALL never did. **The likely fix is symmetric** — give the display repair the same
opening/host-wall pass, reusing `openingScan`'s pool now that both grids exist. Re-measure with
`probe_door_wall.js` (the `dispEARLY` column IS the acceptance number) before and after.
↳ That is exactly what shipped; the prediction held, and the twin needed no new threshold or class
list of its own. One correction to the sentence above for the next reader: the `hostPairs` twin lives
in **`_twoTierRemap`**, not `_midairRepair` — which is precisely why `_midairRepair` can still leave
the small residual both twins share.

**Also observed, unrelated and pre-existing (A/B-confirmed identical before this fix):** JKR reports
`§SUPPORT_CYCLE cycles=4564` on a 8,985-element model — over half the model is Kahn-leftover. Not
touched here; worth its own look given §TM_GEO_ORDER_CYCLES took Terminal 37,927→0.

### §CURTAIN_WALL_OPENING — POST-MERGE re-verification (the one that actually certifies it)
The before/after table above is from the pre-merge tree. `fix/hhs-door-host-wall` then synced with
`origin/main` (#1323 §ARCH_START_TEMPO/M1 + #1324), and **the 8-hour crew day moves every single
date**, so the pre-merge run certifies nothing on its own. Re-run in full on the merged tree:

**`gate_4d.sh` → `pass=8 fail=0 missing=1`** (`missing` = `witness_arch_area_weight`, pre-existing).
All 7 witnesses green including the new `witness_curtain_wall_opening` **§CWO_WITNESS 4/4**, and
**`§CACHE_VERSION_GUARD PASS gating_changed=32 version_bumped=1`**. HHS post-merge: `wallLike`
rawEARLY **0 (0.0%)**, dispEARLY **0 (0.0%)**, `cwGated=34 stillUngated=0`, `§DEQ_REPAIR shifted=32`
— identical to pre-merge, so the curtain-wall index is genuinely orthogonal to the crew clock.

**Merge conflicts, all KEEP-BOTH** (main changed the CLOCK, this branch changed the POOL): `place()`
kept main's `wallAt(prodAt(start)+dur)` advance *and* this branch's `prec` rec; the log block kept
both `§CREW_DAY` and `§CURTAIN_WALL_OPENING`. **`_GANTT_CACHE_VERSION`: both branches independently
claimed v13 — took the higher and went one beyond, landing as v14** (`sw.js` likewise v1009→v1010,
main having also taken v1009). Two independent gating changes on one day = two bumps, never a shared
one; the constant's whole purpose is that one cache entry maps to exactly one algorithm.

---

# §PHASE_WINDOW_IDLE — the idle inside a Gantt bar (2026-08-13)

User, in sequence: *"things are still rushed and not following its gantt bar length.. which gets idle
the rest of it"* · *"the rush to build at onset leaving the rest idle is a bug"* · *"long timeline is
OK, as long realistic but easy for user to edit the gantt chart."*

Scope note: this is NOT M1's clock compression and NOT the point-event durations. It is the size of a
phase's WINDOW against the size of the WORK inside it.

## A. Two measurement bugs came first — and they invalidated the numbers this lane was reasoning from

Both are fixed in `scripts/probe_arch_start.js`; both have their full argument in that file's header.

**§RULES_TABLE_SOURCE.** Every Node probe and every `viewer/tests/witness_*.js` loaded
`viewer/rates/sequence_rules.json` for `SEQUENCE_RULES` / `LABOR_RATES` / `SEQUENCE_DEFAULT` /
`NAME_OVERRIDES`. `viewer/rates.js:239` says the opposite in shipped source, in its own words:
*"viewer.html does NOT call initRateTemplate()/loadSequenceRules() (only mep_report.html/
boq_charts.html do), so this hardcoded copy, NOT the JSON, is what actually runs in the main
viewer/Time Machine/Author wizard."* Confirmed by grep: nothing on the viewer's load path calls it.

The two sources had drifted, so it was not a harmless equivalence. Complete diff, measured:
`SEQUENCE_DEFAULT` identical · `SEQUENCE_RULES` 58 keys, **zero** value differences ·
`NAME_OVERRIDES` 4 both, identical but for a prose `reason` field · `LABOR_RATES` — the ONLY
difference in the whole table is `ELECTRICIAN.productivity`, **15 class keys in rates.js vs 8 in the
JSON**. Missing from the JSON: `IfcSwitchingDevice`, `IfcSensor`, `IfcActuator`, `IfcFlowInstrument`,
`IfcDistributionControlElement`, `IfcProtectiveDeviceTrippingUnit`, `IfcUnitaryControlElement`, all
at productivity 10. Those classes fell through to `_installSecs`' no-match default in every Node run
and carried their real 2880 s in the browser. Hospital: span 1889.4d → 1926.4d, MEP Final occupancy
14.1% → 21.0%. `viewer/rates/sequence_rules.json` is re-synced to rates.js in this change (the file's
own header calls itself the "single shared source" and rates.js asks for the sync) — a data fix that
cannot touch the viewer's generated schedule, because the viewer never reads the file.

**§SERVED_BYTES.** `~/bim-ootb/buildings/Hospital_extracted.db` (264,642,560 B, Aug 3) is not the
object the viewer loads; the live viewer fetches the OCI copy (263,307,264 B, Jun 5). Same model —
identical class histogram, identical 63,182 scheduled elements, identical `totSecs=92,135,244`, ZERO
numerically-differing `element_transforms` rows — but the local file is a **newer re-extraction with
a finer storey taxonomy**: 21 storey names (`Level 3 TOS`, `Level 1 Ceiling`, …) against the served
copy's 9 (`Level 1`..`Level 7A`), differing on 7,365 elements. `storey` IS the zone key (`_zoneOf`),
and §TIER_SERIAL_BY_ZONE serializes per zone, so the entire remap changes: `tier1DagWins` 256→319,
`shiftDays` 917.2→935.7, **totalDays 1926.4 → 2014.7**.

**Resolution of the probe-vs-browser discrepancy, in one line:** live browser 2019.6 · corrected
probe on served bytes **2014.7** (`hostFixed=80 openFixed=13` vs live 79/13) · residual **0.24%**,
attributable to the browser's IndexedDB holding a slightly older vintage of the same object (raw
server bytes are cached at first load and never content-revalidated). **1889.4 was wrong on both
counts and must not be cited again.** Ruled out by measurement, each with a run: the runtime SQL
patch (`Hospital_extracted.db.sql` is 8 lines, `storey_walkable_raster` only), all 16 rate packs (all
land 1362–1668d, i.e. *below* baseline — no pack file carries `max_crews`, so merging one wipes all
10 crew caps to `MAX_CREWS_DEFAULT`), element ordering (cross-swapped both ways, unchanged), and code
version (worktree is exactly `0b97891`).

**Systemic corollary, worth more than this lane: re-extracting a building silently re-dates its whole
schedule.** 4.6% on the storey taxonomy alone, with geometry, element set and labour seconds
byte-identical. Any Node measurement compared against something a user saw must load the served bytes.

## B. Accurate occupancy — Hospital, served bytes, ship tables, REPAIR stage (`§STAGE_OCC`)

`phase% / zone-mean%` — the second number is the honest work-package unit; a phase bar is the UNION
of one bar per zone, so a phase reads "idle" either because its zones are staggered (every zone busy,
the union empty) or because the zone bars are themselves empty. Only the split tells them apart.

| phase | RAW | REMAP | REPAIR | window (REPAIR) |
|---|---|---|---|---|
| Substructure   | 300% / 300% | 158% / 158% | **158% / 158%** | 57d |
| Superstructure |  39% /  16% |  40% /  15% | **40% /  16%** | 869d |
| Architecture   |  34% /   9% |  26% /   7% | **23% /   6%** | 1303d |
| MEP Rough-in   | 278% /  92% | 145% /  67% | **145% /  61%** | 1510d |
| MEP Final      | 176% /  55% |  27% /  22% | **27% /  22%** | 784d |
| Finishes       |  49% /  28% |   8% /  28% | **8% /  28%** | 745d |

The stage bisect is the finding: **MEP Final and Finishes are compact generatively** (121d and 116d
windows, 176% and 49%) and the DISPLAY remap stretches them ~6.5x while adding not one work-day —
`_twoTierRemap` owns those two. **Architecture and Superstructure are already sparse in RAW**
(zone 9% / 16%, before any remap runs) — `computeSchedule`'s support gate owns those, and the remap
only inherits their spread. Two phases, two different layers; a single fix cannot own both.

## C. The idle's SHAPE — front / middle / trailing (`§ZONE_BAR_TAIL`)

Answering "is trimming each bar to its last real activity the fix?" — measured per zone bar, as the
width it would have if it ended at its own 95%-of-work point:

| phase | zone bars | Σ width | trimmed to 95%-work | occ before → after |
|---|---|---|---|---|
| MEP Final      | 5 |  956d | **310d (32%)** | 22.3% → **68.7%** |
| MEP Rough-in   | 7 | 3591d | 1751d (49%) | 60.9% → 124.9% |
| Superstructure | 8 | 2208d | 1402d (64%) | 15.9% → 25.0% |
| Architecture   | 8 | 4955d | 2765d (56%) |  6.1% → **10.9%** |
| Finishes       | 6 |  203d |  150d (74%) | 27.8% → 37.6% |

Read together with B, the answer is **three different shapes, and no single fix covers them**:
1. **MEP (both) — a real trailing tail.** `Level 3` MEP Final: 95% of a 485-day bar's work is done by
   **12%** of it, then 114 of 962 elements drag the remaining 88%. This is literally "rush at onset,
   idle the rest." Trimming recovers most of it (22.3% → 68.7%).
2. **Architecture / Superstructure — genuinely spread, not a tail.** Trimming buys 6.1% → 10.9%,
   i.e. nearly nothing. `Level 7A`: 282 elements, **0.7 work-days**, 720-day bar (0.1%).
3. **Finishes — pure zone STAGGERING.** Phase bar 8%, zone-mean 28%, individual zone bars 43–67%
   (`Level 5` 67.4%, `Level 2` 46.9%). The zone packages are dense and honest; the phase bar is the
   union of well-separated dense bursts. Trimming is the wrong instrument — drawing per-zone bars is
   the right one, and the viewer's mini-Gantt already groups `storey|phase`.

⚠ **Why the trim must not be applied blind, even where it scores best:** the elements past the 95%
mark are REAL scheduled elements — Architecture `Level 5` has **750 of 3497** out there, MEP Final
`Level 3` has 114 of 962. Trimming the DRAWN bar would put hundreds of genuinely-scheduled elements
outside their own bar, which is the same class of dishonesty as fabricating dates, pointed the other
way. `§ZONE_BAR_TAIL` therefore reports `tailN` next to the trim gain and never trims anything.

## D. The mechanism, and the ruling it is blocked on

`_twoTierRemap`'s §TIER2_AFTER_TIER1 barrier (`viewer/time_machine.js`) computes, per zone,
`d = t1EndZ[z] - t2MinZ[z]` and applies it to **every** Tier-2 element in that zone. `t2MinZ[z]` is
the EARLIEST Tier-2 start, so the shift is sized for the one element that needs it most and every
already-compliant element is pushed further for no reason. Because each zone's `d` differs (Hospital
`shiftDays` max 935.7), Tier-2 is **sheared** rather than shifted, and that is what turns MEP Final's
compact 121-day generative package into a 784-day display window.

The minimal edit that satisfies the barrier's own stated contract — *"within any zone no Tier-2
element starts before that zone's Tier-1 is complete"* — is a **per-element clamp**: push only when
`it.s < t1EndZ[z]`, and only to `t1EndZ[z]`. It is strictly less movement than today and cannot
violate the barrier.

⛔ **BLOCKED — the one question:** today's uniform shift is order-preserving within a zone *by
construction*, and its header says so deliberately; the clamp is not (it maps everything below the
barrier onto the barrier, so a carrier can land after its dependent). `_midairRepair` +
`witness_midair_zero` exist precisely to enforce that ordering afterwards and would have to carry it.
**Trading a by-construction guarantee for a repaired-after-the-fact one is a ruling, not a
derivation** — it must be asked, not assumed. Everything needed to decide is above.

Not proposed, deliberately: artificial pacing, spreading starts evenly (rejected as `§DAY_GAP_WIP`,
and the phase-vs-zone split above shows why it would still be wrong), and any change to
`schedule_author.js`'s authored WBS bars — those stay the user-editable product, untouched here.

---

# §TIER_REGATE_WORKLIST — the dedicated follow-up session SESSION 7 named (2026-08-14)

Picking up SESSION 7's own closing item verbatim: *"`_tierAuditRegate`'s full-array-rescan fixpoint
is the dominant cost of the ENTIRE 4D generation pipeline on large/complex buildings"* — 15,466ms of
Terminal's 19,773ms total, ~78–90% of whole-building 4D-gen wall time, NAMED and MEASURED, NOT fixed
last session (too large for a closing pass). Spec before code, per this file's own header.

## Step 1 (SESSION 7's own item) — is the 14.8s alternating-fixpoint number the same cost as the fresh 15.5s figure? NO — checked, not the same phenomenon.

No standalone log file for the 2026-08-13 `§STRICT_RESIDUAL_RESCUE` experiment exists on disk
(searched `~/bim-ootb`, `~/.npm/_logs`, home tree — nothing named for it; the 4-rounds/7,650-pushes/
0.8s→14.8s numbers live only as prose in this file, lines ~298–300 above). Reading that prose
directly settles it without needing the log:
- **Different mechanism.** The 14.8s figure is `_midairRepair`'s own header-documented ALTERNATING
  joint fixpoint — PASS 1 (the start-based contact-graph repair) re-run in a loop against
  `_tierAuditRegate` as a second rule, "4 rounds, 7,650 pushes" — a nested scheme that was **built,
  measured, and REJECTED**, never shipped (the fix worktree's `git status`/`git diff` were clean
  against `origin/main`, per SESSION 5's own note). SESSION 7's 15,466ms is `_tierAuditRegate` running
  inside a **plain, single `_twoTierRemap` call** (≤6 bounded iterations, no alternation with
  `_midairRepair` at all) — a cheaper, already-shipped code path.
- **Different building.** The 14.8s number's own text says *"Hospital still not fully clean"* — it
  was Hospital. SESSION 7's fresh per-building table (above) has Hospital's ENTIRE `_twoTierRemap` —
  `_tier1Serialize` + all its internal `_tierAuditRegate` calls, both dry-run and iterated — costing
  **2,624ms total**, two orders of magnitude below 14.8s. Terminal (where the 15,466ms figure comes
  from) was never measured by the 2026-08-13 experiment at all.
- **Verdict:** the 14.8s and 15.5s figures are coincidentally close in magnitude and share one
  function name, nothing more. Not the same cost surfacing twice. No further reading of that
  experiment is needed before starting the worklist rewrite below.

## Step 2 — why the candidate set is static, and what that buys

`_tierAuditRegate`'s `seFor(T)` (time_machine.js:4074-4115) decides, for a target `T`, which other
elements `S` are its qualifying supports (bearing pool, else hang pool, else the `§HANG_NEAREST`
big-sink fallback) and returns `max(S.e)` over that set. **Every branch condition is a function of
STATIC geometry only** — `bz`, `tz`, `x0/x1/y0/y1`, `cls`, `seq` — never of `s`/`e`. Re-read line by
line: the bearing test (`S.bz<T.bz-EPS && S.tz>=T.bz-GAP && xyOverlap`), the hang test (adds
`S.bz`/`S.tz` vs `T.tz` band checks + the two antisymmetry exclusions, all static), and the
nearest-band fallback (`nbA` = min static `S.bz` among static-XY-overlapping candidates above `T`,
then the final candidate set is bounded by `nbA+GAP`, itself static) — **the SET of qualifying `S`
for a given `T` never changes across sweeps, only the `S.e` values read from that fixed set do.**
`structGrid`/`wallGrid` membership is likewise static (`e.seq`/`e.cls` only). This is true across
ALL of `_twoTierRemap`'s calls into `_tierAuditRegate` too (the one `dryRun` call plus up to 6
iterated calls) — geometry never changes within one `_twoTierRemap` invocation, so grids AND
candidate sets can be built **once per `_twoTierRemap` call**, not up to 7 times as today.

Today's loop is `for(sweeps<64){ items.forEach(fullRescan) }` — O(sweeps × n × grid-scan), rescanning
every element's full candidate search every sweep even when nothing near it moved. The fix is a
**worklist/dirty-queue**: precompute each `T`'s fixed candidate list once (`_tierAuditIndex`), invert
it into `dependents[S.guid] = [T, …]` (who reads `S.e`), then only re-evaluate a `T` when one of its
own candidates was just pushed. Cost becomes O(n) for the unavoidable first pass (every element must
be checked once against its live neighbours) plus O(total pushes × candidates-per-push) after — no
further full-array rescans.

**Equivalence argument (must hold before this ships, verified empirically in Step 3, not merely
argued here):** the system is exactly a longest-path relaxation over an acyclic graph — the code's
own existing comments already invoke this for CONVERGENCE ("no cycle-chasing possible by
construction… the fixpoint exists and monotone pushes reach it"). The same DAG-confluence property
that guarantees convergence also guarantees the **fixpoint is unique regardless of processing
order** — a worklist that keeps re-relaxing until quiescent reaches the identical final `s`/`e` per
element as repeated full sweeps, just without redoing unaffected elements. Two details that must be
preserved exactly, not just "close enough": (a) the `-1ms` tolerance (`T.s < se-1`) — a node that's
already within 1ms of its constraint must NOT be re-pushed, matching today's exact predicate; (b)
`exempt` guids are skipped as targets (never evaluated, never pushed) but STILL participate as
candidates for others, unchanged from today.

## Step 3 — verification plan before touching the shipped file

1. New standalone probe (`bim-compiler/scripts/probe_tier_regate_worklist.js`, same slice-and-vm
   pattern as `probe_arch_start.js`) builds real `items` for all 7 buildings via
   `ScheduleGate.computeSchedule`, then runs OLD `_twoTierRemap` and a prototype worklist
   `_twoTierRemap` on independent clones, and diffs **every guid's final `.s`/`.e`** — byte-identical
   required, not just matching pass/fail counts (this file's own §DEQ_REPAIR precedent: "A/B'd
   against the pre-fix code, so 'unchanged' is measured, not assumed").
2. Wall-clock both paths per building, Terminal and LTU_AHouse are the ones that matter (48,428 and
   122,330 elements, the two SESSION 7 measured as `_twoTierRemap`-dominated).
3. Only once (1) is clean on all 7 buildings does the prototype move into `time_machine.js` proper —
   same two call sites inside `_twoTierRemap`, `_GANTT_CACHE_VERSION`/`sw.js CACHE_VERSION` bumped
   (this IS a gating-function rewrite, `§CACHE_VERSION_GUARD`'s own trigger condition).
4. Full `gate_4d.sh` A/B (before/after), plus `witness_midair_zero.js` and
   `witness_tier_serial_display.js` directly — these are the two witnesses this exact code area has
   broken before (§STRUCT_POOL_UNGATED, cited above).

## Step 4 — SHIPPED, bim-ootb PR #1348 (auto-merge armed), worktree `perf/tier-audit-regate-worklist`

**Design deviation from Step 2, decided during implementation, not assumed:** the plan above shared
one `_tierAuditIndex` across `_twoTierRemap`'s ~7 internal calls via an explicit param. Building that
required a SECOND top-level function name (`_tierAuditIndex`), and this codebase's witnesses/probes
slice `_tierAuditRegate` OUT of `time_machine.js` by function name into standalone vm contexts — a
real, already-observed fragility class in this exact file (§PHASE_OVERLAP_SUPPORT_GUARD's own header
names it: "re-indenting, rewording the log, or renaming variables would rot both"). **11+ files**
slice `_tierAuditRegate` this way (grepped both repos: `witness_midair_zero.js`,
`witness_tier_serial_display.js`, `witness_curtain_wall_opening.js`, `witness_hosted_before_host.js`,
`witness_kernel_ops_sched_version.js`, plus 6 bim-ootb/bim-compiler probes) — adding a second sliced
function name would have meant editing all of them in lockstep, forever, or silently breaking whichever
one someone forgets. **Kept single-function instead:** the candidate-index build stayed a closure
INSIDE `_tierAuditRegate` (matching the ORIGINAL code's own shape — `cellsOf`/`xyOverlap`/`seFor` were
already local closures, not top-level helpers), cached on `_tierAuditRegate._cache` — a `WeakMap`
keyed by the `items` array, hung off the function object itself. Any file that slices this ONE
function by name still gets working caching, zero edits needed on that file's end. Measured this
achieves the IDENTICAL speedup as the originally-planned shared-param version (verified via a
throwaway A/B harness before committing to the design — self-contained/rebuild-every-call would have
still been a real 2.6–3.6x win on Terminal/LTU_AHouse, but the WeakMap cache gets the full win with
zero extra file-touching, so there was no reason to accept the smaller number).

**Verification (all against the actual committed worktree, not a hand-copied prototype):**
`scripts/probe_tier_regate_worklist.js` was rewritten to diff `git show <OLD_REF>:time_machine.js`
against the real working-tree file directly (no hand-typed "new" source in the probe at all) —
byte-identical `.s`/`.e` per guid, all 7 buildings, confirmed twice (pre- and post-commit runs, same
result both times):

| building | old ms | new ms | speedup |
|---|---|---|---|
| Terminal | 12,087 | 1,904 | **6.3x** |
| LTU_AHouse | 35,828 | 4,365 | **8.2x** |
| Hospital | 5,127 | 824 | 6.2x |
| JKR | 813 | 145 | 5.6x |
| HHS_Office_Federated | 402 | 92 | 4.4x |
| Clinic | 525 | 156 | 3.4x |
| Duplex | 42 | 9 | 4.7x |

`witness_midair_zero.js` **38/0**, `witness_tier_serial_display.js` **57/0** — byte-identical to
SESSION 7's post-fix baseline, zero behavioral drift. `gate_4d.sh` **pass=8 fail=0 missing=1**
(`missing`=`witness_arch_area_weight`, pre-existing) matching the pre-change baseline exactly,
`§CACHE_VERSION_GUARD PASS gating_changed=0 version_bumped=1` — bumped `_GANTT_CACHE_VERSION` 18→19
and `sw.js` v1025→v1026 by hand per the project rule, since the algorithm changed even though output
is provably identical.

**Named, not fixed — a real gap in `§CACHE_VERSION_GUARD` itself, found by this PR triggering it:**
`gating_changed=0` on a change that unquestionably touched the gating engine (`_tierAuditRegate`'s
entire body was rewritten) is a FALSE NEGATIVE — the guard's heuristic for `time_machine.js` only
counts ADDED lines containing a function's SIGNATURE (`function _tierAuditRegate(` etc.), and this
change's signature lines are byte-identical text to before (only the body changed), so git diff shows
no such added line. **This is the exact blind spot `§GATE_GUARD_BODY` already named and fixed for
`schedule_gate.js`** ("declaration-line heuristic... blind to one being REWRITTEN... any NON-COMMENT
added line there is a gating change by definition") — but that fix was scoped to `schedule_gate.js`
only; `time_machine.js`'s half of the guard still has the same hole. Not fixed here (out of scope for
a perf session, `_GANTT_CACHE_VERSION` was bumped correctly by hand regardless) — concrete next step
for whoever touches `gate_4d.sh` next: extend `§GATE_GUARD_BODY`'s "any added non-comment line counts"
treatment to `time_machine.js`'s gating functions (`_tierAuditRegate`, `_twoTierRemap`,
`_midairRepair`, `_tier1Serialize`) the same way it already works for `schedule_gate.js`.

## §GATE_GUARD_BODY_TM — SHIPPED (2026-08-14, this session, picking up the item named above)

Built `scripts/tm_gating_body_diff.js`. `schedule_gate.js`'s fix treats ANY added non-comment line as
a gating change because that whole file IS the gating engine — `time_machine.js` is not (it also holds
camera/UI/other code), so the same file-wide rule would false-positive on every unrelated edit. This
script locates the four gating functions' own bodies by brace-matching (same `sliceFn` technique
`probe_tier_regate_worklist.js` uses) and only counts added non-comment lines inside those ranges.
Wired into `gate_4d.sh` right after the existing `schedule_gate.js` body check.

Verified both directions, not just the happy path:
- **True positive** — real PR #1348 diff (`14c042b...d6647f4`, the `_tierAuditRegate` body rewrite):
  old signature-only heuristic gives `gating_touched=0` (the exact false negative named above); this
  script gives `88`. Full guard simulation: `gating_touched=88 version_touched=1` → correctly PASS
  (would correctly FAIL if the version bump had been missed).
- **False positive control** — commit `6e1ca24` (`§GANTT_CACHE_VERSION`, a pure version-bump/comment
  edit that never touches a gating function's body): script gives `0`, confirming it does not fire on
  unrelated `time_machine.js` edits.

## §DAY37_HOSPITAL_HANGING — ARCHIVED (superseded: real driver found in §OG_HANG_BAND, below)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** A Day-37 Hospital floating-element report investigated but not fixed here; the actual driver was found one layer down in §OG_HANG_BAND (still live in this file, PR #1375) — read that instead. Full investigation trail: `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`.

## §CPE_DISCIPLINE_REVEAL topout gap — named in passing, unrelated to §DAY37_HOSPITAL_HANGING

While investigating the above, found (then ruled out as the cause of the Day-37 screenshot, since that
screenshot is plain Time Machine scrubbing with no Alt+C/MaxQ bake in view) a real, separate,
**unfixed** bug in `§CPE_DISCIPLINE_REVEAL` (`prompts/CINEMA_DISCIPLINE_REVEAL.md`, shipped 2026-08-14,
bim-ootb PR #1349/#1350/#1352): `§CPE_BUILDUP_TOPOUT`'s completion boundary (`cinema_maxq.js:163-167`,
buildup fraction reaches 1.0 only at `plan.beats.rise`) was never updated when the reveal round was
inserted into the beat sequence (`effects.js:6844-6845`, order is `dive → spin → out(tO) →
reveal(tV) → rise(tR)`, strictly `tO < tV < tR`). The entire reveal round plays before topout, while
buildup is still climbing toward 100% — so during an actual Reveal bake (Alt+C, MaxQ, Reveal checkbox
on), the building genuinely isn't finished yet and straggler elements can appear mid-air during the
round, on top of whatever `§DAY37_HOSPITAL_HANGING`/`§HANG_NEAREST` produces. Fix shape (not applied):
when reveal is on, topout boundary should be `plan.beats.out` instead of `plan.beats.rise`, so buildup
is 100% before the reveal round starts; leave non-reveal bakes (topout at `rise`) untouched.

## §GANTT_SHIFT_HOURS_DESYNC · §GANTT_SCHEDULE_STALE · §HOSPITAL_LIGHTING_STILL_FLOATING — ARCHIVED

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** Two ✅ SHIPPED fixes (§GANTT_SHIFT_HOURS_DESYNC = bars authored 8h/day while the canvas plays 24h/day, 2.93x gap, PR #1355; §GANTT_SCHEDULE_STALE = `activeSchedule` stale-detect + safe in-place regen, never touching captured/baselined schedules, PR #1359) plus the 4-session §HOSPITAL_LIGHTING_STILL_FLOATING hunt, whose real driver was NOT found until §OG_HANG_BAND immediately below — this file's own index marks that hunt SUPERSEDED, read §OG_HANG_BAND instead. Full narratives + the two dead ends ruled out with numbers: `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`.

## §OG_HANG_BAND — the real driver found, MEASURED, FIXED, SHIPPED (2026-08-15, bim-ootb PR #1375)

Third repair-layer attempt this session, tried AFTER the two ruled out above — but this one closes
most of the gap, not another dead end. **The upstream-classification hypothesis above (reclassify
`IfcBuildingElementProxy`'s phase/sequence) was checked against real geometry FIRST, per this
project's measure-don't-guess rule, and DISPROVEN before any code was touched**: a fresh probe
(`bim-ootb/scripts/probe_proxy_carrier_classes.js`, node-side, real `_contactGraph` over
`_buildScheduleElements`' real bboxes) found only 9/5729 Hospital proxies touch an MEP-only carrier —
4,244 touch BOTH structural and MEP carriers, 1,455 touch structural-only. The proxies overwhelmingly
already sit on real seq≤4 structural carriers (slabs, beams) — a phase/sequence reclass would not
have moved the needle, because the carrier discipline was never the mismatch.

**Root cause, found by tracing one real floating GUID end to end** (`bim-ootb/scripts/
probe_captured_floating.js`, a full node-side reproduction of the CAPTURED-path pipeline —
`_buildScheduleElements` → `computeSchedule` → `deriveZones` → §GANTT_TASK_WINDOW_FIDELITY per-task
rescale → `_ogSupportSweep` → `_contactGraph` census, every step sliced verbatim from the shipped
files, no DOM): `_ogSupportSweep`'s hang/carrier-above repair (the branch that fires when an element
has no bearing-below support, e.g. a ceiling-hung or embedded fixture) reused `_ogGAP=0.5m` — the
tolerance meant for near-zero PHYSICAL touching gaps (bearing) — as its Z-band SEARCH RADIUS for
hang too. But `_contactGraph` (the judge `_midairAudit`/the 🔓→🔒 lock gate reads) has NO such
restriction on the hang relation — by design, already measured and deliberately kept unbounded once
before (§DAY_GAP_TAIL, LTU beam/flowSegment case) because `_contactGraph` is "pool-blind... crude
AABB contact" and bounding IT strands elements as unrepairable orphans (a 3–40× blowup, measured and
rejected on its own numbers back then). So the JUDGE correctly accepts real hang carriers several
metres away (a ceiling-mounted fixture's true structural support sits up through a void), but the
REPAIR could only reach 0.5m — anything genuinely real but farther was invisible to
`_ogSupportSweep`, hence floating no matter how many sweeps ran.

**Measured the real distances before touching anything** (821 still-floating Hospital
`IfcBuildingElementProxy`, hang-classified): p25=1.05m p50=2.00m p90=3.75m max=10.62m, 812/821 (99%)
within 9.5m — **the exact same band this codebase already measured and cited once before for the
identical relation** (`§HANG_NEAREST`, "0.5–9.5m, Hospital ducts p50 1.22m"). Reused that constant,
not re-guessed a new one.

**The fix**: widen ONLY `_ogSupportSweep`'s hang-detection Z-band (query radius + accept-test) from
`_ogGAP` (0.5m) to a new `_ogHangGap` (9.5m) — bearing stays untouched at 0.5m, unrelated physics.
Same doctrine already used repeatedly in this exact function (§4D_LAYER_TRUTH, §GROUNDED_OVERRIDE_FIX,
§OG_BEARING_BOUND — "guard and judge must share one physics"), just not yet applied to this specific
asymmetry. Critically **not the same lever as the already-rejected judge-side bound**: that one
NARROWED what `_contactGraph` accepts (created orphans). This WIDENS what `_ogSupportSweep` can find
and repair — it can only ever fix MORE of what the judge already calls real, so it cannot create a
single new orphan by construction. Confirmed: `_contactGraph`'s own orphan/grounded counts are
byte-identical before/after on every building (Hospital orphans=35/grounded=811 unchanged).

**Measured, all 7 buildings, captured-path floating (post-repair, `_ogSupportSweep` on the per-task-
rescaled schedule — the same pipeline §AUDIT_FLOATING above measured 1510 against):**
```
              before  after   Δ        maxShiftDays before→after
Terminal      570     435    -135      1.4 → 39.2
Hospital      1581    611    -970      1.0 → 36.7   (the reported building, -61%)
Duplex        34      15     -19       1.3 → 2.0
HHS           198     139    -59       10.6 → 22.5
Clinic        431     401    -30       0.5 → 26.0
LTU_AHouse    1341    1319   -22       40.6 → 99.1
JKR           184     143    -41       1.1 → 16.9
TOTAL         4339    3063   -1276 (-29.4%)
```
Hospital's `IfcBuildingElementProxy` specifically: 1012→55 (-95%). `maxShiftDays` grew (more real
pushes now succeed) but stays well under the 100–307d range that made both prior repair-layer
attempts unacceptable — worst case is LTU at 99.1d, every other building under 40d, and this is a
push count/day figure only, not a Gantt-window-crossing desync (`_ogSupportSweep` still only pushes
LATER within the same bounded local search, no cross-zone fixpoint jump).

**Two other levers tried THIS session, ruled out with hard numbers, before landing on the above —
do not re-attempt either without new information:**
1. Repair BEFORE the per-task window is computed (run `_midairRepair`, the proven generative-path
   fixpoint, on the RAW schedule before `deriveZones`, so the window is built FROM corrected times
   instead of desynced from them after). Hypothesis: no display/Gantt desync is possible if the
   window comes after the fix. **Measured result: WORSE, not better — Hospital 1581→2406.** A
   handful of large pushes on the raw timeline distort that zone's own min/max span (one pushed
   element can stretch a zone's raw range by hundreds of days), which then distorts the per-task
   proportional rescale for the WHOLE zone, not just the pushed elements — creating new violations
   elsewhere. `totalDays` barely moved (delta=-8), so the distortion is local-but-severe, not global.
2. The `IfcBuildingElementProxy` phase/sequence reclassification named in the section above this one
   — disproven by direct measurement before any code was written (see the carrier-class probe above).

**Ship trail**: bim-ootb PR #1375. `_GANTT_CACHE_VERSION` 21→22, `sw.js` v1031→v1032.
`witness_gantt_og_grid_perf.js`'s O(n²) brute-force reference updated to match (was hardcoded to the
old 0.5m band). Witnesses: `witness_midair_zero.js` 38/0 (generative path, untouched — confirms no
cross-path regression), `witness_og_guard_bearing_bound.js` 9/9, `witness_gantt_og_grid_perf.js` 3/3,
`scripts/gate_4d.sh` 7/7 (1 pre-existing MISS, unrelated). `witness_gantt_lock_integrity.js`/
`witness_big_element_support_coverage.js`/`witness_door_window_host_wall.js` have pre-existing
failures (dead `_zoneIndex` slice, unrelated `openingGate` gap) — verified byte-identical on
unmodified `main` before concluding they're not caused by this change.

**⛔ Residual, real, NOT this session's scope — 3063/63415+... still float across the 7 buildings
after this fix.** Dominant remaining class on Hospital: `IfcFooting` (458, completely unmoved by this
fix — a footing is Substructure/seq1, normally a CARRIER not a dependent, so its floating is a
DIFFERENT relation than the hang-band gap this session closed; likely bearing-side, unexplored). Also
unexplored: whether the residual on LTU_AHouse (1341→1319, only -1.6%, the smallest relative
improvement of the 7) has its own dominant driver worth a separate probe pass. Reusable tooling for
whoever picks this up: `bim-ootb/scripts/probe_captured_floating.js` (the full captured-path
reproduction — extend its `floatingCensus`/edge-check sections rather than rewriting) and
`probe_proxy_carrier_classes.js` (pure-geometry carrier-class breakdown, no schedule needed).

**Not started**: consolidating `time_machine.js` and siblings (5000+ lines) — separate task, not part
of this floating-count chase (see `PROGRESS.md`).

## §TIME_MACHINE_CONSOLIDATION_SPEC — scoping only, no code, awaiting user go (2026-08-15)

User flagged `time_machine.js` + siblings (5000+ lines) should be "consolidated/split" — no target
shape given. This is a SPEC, not an implementation. No code touched, no worktree opened.

**Prior art check — the 2026-08-10 plan is NOT the same ask, and it already shipped.** The archived
`▶ NEXT SESSION — PLANNED, NOT STARTED (2026-08-10)` section
(`prompts/archive/4D_SCHEDULE_PERFECTION_full_history_2026-08-03_to_2026-08-12.md:2901`) planned a
narrow dedup — extract `_promoteRoofLoadPath()`, one ~40-line function duplicated in two call sites
— explicitly self-corrected in its own text to NOT be a structural split ("will NOT move
cycles=/floating="). **That already shipped**: PR #1272 (2026-08-10, MERGED) did exactly this, and a
second, separate dedup — `chore(4d): remove dead duplicate _midairRepair` — shipped later as PR
#1347 (`14c042b`). **`PROGRESS.md`'s "no work done on this yet" line is stale for the 2026-08-10 plan
specifically** — flag for correction, but the *new* 2026-08-15 ask ("5000+ lines... consolidated/
split") is a much bigger, different scope than either shipped dedup, so it's still correctly "not
started" for what the user is actually asking now.

**Current state.** `viewer/time_machine.js` is **9,016 lines** today (`main` @ `832dc1d`) — grown
from ~3,900 lines at the 2026-08-10 plan's time, i.e. **more than doubled since the last dedup**,
across **158 commits** touching this one file. Siblings by direct require-graph: `schedule_author.js`
(1,619 lines) and `schedule_gate.js` (1,080 lines) are required BY `time_machine.js` and vice versa;
17 other viewer files (`cinema_maxq.js`, `scene.js`, `dlod_nav.js`, `cpe_walk.js`, `tour.js`, `sw.js`,
etc.) require `time_machine.js` directly, and 13 files require `schedule_author.js`/`schedule_gate.js`
— real coupling, not a hypothetical blast radius.

**What's actually inside `time_machine.js` today** (by function-cluster, not guessed — read via
full-file function grep): it is one god-object bolting together at least 7 separable concerns:
1. **Particle FX** (spark/dust, ~703-1138) — camera-effect cosmetics, zero schedule logic.
2. **Scene/playback orchestration** (~20-700, ~2600-2713, ~3158-3412) — op-log → scene chain, DLOD
   box sync, play/pause/scrub.
3. **`renderAtTime()`** (~1193-2095, **~900 lines, one function**) — the per-frame reveal/frontier/
   highlight logic; also owns outline/highlight/sun-cycle helpers (~2167-2558).
4. **Classification/promotion** (~3412-3722, ~4960-5608 inside `injectGantt`) — `_promoteRoofLoadPath`
   (already deduped, #1272), `_buildXrayElements`'s own `matchNameOverride`/`matchRule`/
   `assignStoreyByZ`, and a **second, currently-live, un-deduped copy of the same three functions plus
   `getInstallSecs`** inside `injectGantt()` (~4960-5074).
5. **Repair/tier passes** (~3962-4786) — `_tierAuditRegate`, `_ogSupportSweep`, `_twoTierRemap`,
   `_contactGraph`/`_midairAudit`/`_midairRepair` — the exact functions the parallel floating-MEP fork
   is working with THIS session, in `/tmp/wt-materializezones-proxy` (not touched here).
6. **Gantt UI** (~5608-5608, ~5892-7822, **the single largest cluster, ~2,200+ lines**) — task index,
   variance/EVM (5D cost), drag/resize wiring, dashboard, S-curve, mini-Gantt drawing.
7. **Lifecycle** (~7822-9016) — cache, activate/deactivate/init, jump/refold.

**Real, current, three-way duplication found (not the already-fixed #1272 one):**
`matchRule`/`matchNameOverride`/`assignStoreyByZ` exist independently in THREE places —
`schedule_author.js:17/36/299` (canonical, generative path), `time_machine.js`'s `_buildXrayElements()`
(~3651-3722, ghost/x-ray display path), and `time_machine.js`'s `injectGantt()` (~4960-5074, captured-
schedule display path) — plus `getInstallSecs` duplicated between the latter two. **This is directly
relevant to the parallel floating-MEP fix**: if that fork changes `IfcBuildingElementProxy`
classification in `schedule_author.js` only, both `time_machine.js` copies keep the OLD classification
for the x-ray-ghost and captured-schedule display paths — a real silent-divergence risk, same shape as
the one #1272's PR description called out as "not just cosmetics."

**Candidate shapes:**

1. **RECOMMENDED FIRST — extract the classification trio+`getInstallSecs` into one shared module**
   (e.g. `viewer/schedule_classify.js`), used by `schedule_author.js` and both `time_machine.js` call
   sites. **Small**: ~150-250 lines moved, 3 call sites updated, mirrors the exact pattern of the two
   already-shipped, already-successful dedups (#1272, #1347) in this same file. Directly closes the
   silent-divergence risk named above. Risk: low — this codebase's witness convention
   (`viewer/tests/witness_tm_geo_order_cycles.js` and siblings) `slice`s named functions out of the
   source file by string/line range into a `vm` sandbox (see the archived plan, "Slice
   `_promoteRoofLoadPath` + `_buildXrayElements`") — moving a sliced function to a new file requires
   updating that witness's slice target, not just the call site; #1272 already did this once
   successfully, so it's a known, walked path, not a new risk.

2. **Full concern-based split** (7 modules mirroring the clusters above — `schedule_render.js`,
   `schedule_repair.js`, `gantt_ui.js`, etc.): what "consolidated/split" most literally means for a
   9,016-line file. **Large**: touches 17+ dependent files' require paths, and EVERY existing witness
   that slices a function out of `time_machine.js` by name/line (multiple — this is this codebase's
   standard 4D-witness pattern) needs its slice target updated or it silently tests stale code.
   Highest-value cluster to split first would be #6 (Gantt UI, ~2,200+ lines, mostly self-contained
   drawing/wiring code with the least cross-talk into scheduling logic) — but even that alone is a
   multi-day, multi-PR effort given the file's churn rate.

3. **No split — dedupe only, defer structural split indefinitely.** Lowest risk, matches this lane's
   actual track record (2 successful small dedups, 0 attempted big splits, 158 commits of ongoing
   churn on this exact file). Leaves the "5000+ lines, hard to navigate" complaint unaddressed as a
   file-size number, but every dedup so far has been the thing that turned out to matter (removed a
   real correctness risk, not just cosmetics).

**Recommendation (for the user to bless, not decided here): do #1 now, defer #2.** #1 is small,
directly de-risks the parallel floating-MEP work happening this exact session, and matches the two
precedents this lane already proved out. #2 is real but should NOT start while `time_machine.js` is
under this much concurrent churn (158 commits and counting, including this session's own
`materializeZones` fork) — a structural split started now would rebase-conflict against the very work
still landing in the file it's splitting. Sequence #2 (if wanted at all) after this lane's churn rate
drops, as its own dedicated session with a real go-ahead on which of the 7 clusters to start with.

**What consolidation would NOT fix — say this before anyone mistakes "split" for "solved":**
- The still-open `§TM_GEO_ORDER_CYCLES` bug (`schedule_gate.js`'s DAG, unrelated file).
- The 1,510/63,415 floating-MEP gap this session's parallel fork is chasing (repair-pass functions
  would move file, not change behavior, under either candidate).
- The unexplained `staged=0` (fresh sandbox) vs `staged=415` (user's live console) nondeterminism
  named 2026-08-15 under `§XRAY_STAGING_REMOVED` — likely iteration-order-dependent, structurally
  invisible either way a split is done.
- `renderAtTime()`'s own ~900-line single-function size (cluster #3) — none of the 3 candidates above
  touch it; it would need its own follow-up if "one function is too big" is also part of what the user
  means by "consolidated."

**Sizing: candidate #1 = SMALL (hours, 1 PR, low risk, 2 direct precedents). Candidate #2 = LARGE
(needs its own multi-session plan, blast radius across 17+ files + every function-slicing witness,
should not start during this lane's current churn window).**

## §SCHEDULE_CLASSIFY_DEDUP — candidate #1 IMPLEMENTED+SHIPPED, bim-ootb PR #1374 (2026-08-15)

User approved candidate #1 above ("Implement candidate #1 now"). Implemented, but **narrower than
the spec's literal ask** — worth reading before assuming the spec's "3-way duplication, move
~150-250 lines into a new `schedule_classify.js`" framing is still accurate for anything else in
this file:

**What the spec got right**: `matchNameOverride`/`matchRule` — real, live, byte-identical
algorithm duplicated in 3 places (`schedule_author.js:17/36` canonical, `_buildXrayElements`
~3651-3722, `injectGantt` ~4960-5074). This is the piece that closed a genuine silent-divergence
risk.

**What a closer read found the spec got wrong, before any code was written**: `assignStoreyByZ`
and `getInstallSecs` are NOT real 3-way duplicates.
- `assignStoreyByZ`: `_buildXrayElements` and `injectGantt` ALREADY both delegate to the shared
  `_zoneIndex()` (consolidated 2026-08-12, `§ZONE_INDEX`) — only `schedule_author.js` has its own
  separate implementation, and that's BY DESIGN (it's Node/DOM-free, computes storey-median-Z from
  its own fresh query rather than a browser-side cached index `_zoneIndex()` depends on). Forcing
  these together would risk a real behavior change (different data snapshot/filter), not a safe
  dedup — left alone.
- `getInstallSecs`: `injectGantt`'s copy already delegates to `window.ScheduleAuthor._installSecs`
  (the real canonical function, `§TM_DURATION_SYNC`, already wired 2026-08-04) — only its small
  wrapper (frag/lin lookup + a fallback-if-ScheduleAuthor-not-loaded branch) is separate, and that's
  legitimately per-call-site since `_buildXrayElements` never computes `installSecs` at all (doesn't
  need it — x-ray/support-check path only). Nothing to move.

**What shipped**: ONE shared pair, `_classifyNameOverride(cls, name, nameOverrides)` /
`_classifyRule(cls, name, rules, dflt, nameOverrides)`, added at module scope in `time_machine.js`
(next to `_promoteRoofLoadPath`, same "one shared function, two call sites" pattern that function
already established). Both delegate to `window.ScheduleAuthor.matchNameOverride`/`matchRule` when
loaded (always true past initial page load in production), with the old inline algorithm kept only
as a fallback — same convention this file already uses for `_installSecs`. `_buildXrayElements`'s
and `injectGantt`'s local `matchNameOverride(cls,name)`/`matchRule(cls,name)` wrappers keep their
exact names/signatures, bodies now one line each. **Zero edits to `schedule_author.js`** — it was
already the canonical, already-exported source; nothing there needed to move. This also means zero
merge-conflict surface against the parallel `materializeZones`/`IfcBuildingElementProxy` fix
landing separately this same session (see `§HOSPITAL_LIGHTING_STILL_FLOATING` above) — a real
benefit the spec's "new file" framing didn't anticipate.

**Verified, not asserted**: `witness_class_fallback_blackbox.js` rewritten — it used to slice TWO
independent closures out of `time_machine.js` and compare all 3 copies pairwise; now slices the ONE
shared pair and runs it twice (once with a real `window.ScheduleAuthor` present — the delegating
path production always takes — once without, to keep the fallback path honest too), both compared
against `schedule_author.js`'s own direct call. **321,509 elements across all 8 shipped buildings,
0 disagreements, 0 silent-fallback hits** (`BLD_DIR=~/bim-ootb/buildings BLDS=Hospital,Terminal,
LTU_AHouse,Duplex,Clinic,HHS_Office_Federated,JKR,TermRooms node witness_class_fallback_blackbox.js`).

**5 other witnesses slice `_buildXrayElements` out of `time_machine.js` by name and broke**
(`ReferenceError: _classifyRule is not defined`) until their slice list was updated the same way
PR #1272 already did once for `_promoteRoofLoadPath` — `witness_midair_zero.js` (38/38, matches
`main`'s 38/0 exactly), `witness_kernel_ops_sched_version.js` (12/12, matches),
`witness_tier_serial_display.js` (57/57, matches), `witness_curtain_wall_opening.js` (5/5,
byte-identical viaCurtainWall/noHostAtAll/gen/remap/display counts vs `main`),
`witness_hosted_before_host.js` (4/4, byte-identical G-HOST-MATCH counts vs `main`). All numbers
diffed against a fresh unmodified `main` run, not just "still green" — genuinely zero behavior
change, not merely zero regression-witness-triggered.

**While sweeping for slice-based witnesses, found 6 unrelated PRE-EXISTING dead ones** — fail
identically on unmodified `main` (not touched, not caused by this PR):
`witness_tm_geo_order_cycles.js`, `probe_bars_vs_ops.js`, `probe_midair_census.js`,
`probe_named_element_times.js`, `witness_big_element_support_coverage.js`,
`witness_gantt_lock_integrity.js` — all throw `ReferenceError: _zoneIndex is not defined`, the
exact same class of gap `§DAY_GAP_TAIL` (2026-08-12) already found and fixed in
`witness_midair_zero.js`/`witness_kernel_ops_sched_version.js` but never swept across the rest of
this file's siblings. Named here so it isn't rediscovered from scratch — NOT fixed this PR (out of
scope for a classify-dedup), a real standing debt for whoever next touches this cluster.

**No `_GANTT_CACHE_VERSION` bump** — `computeSchedule`'s gating and the display remap are
unchanged, which is the whole point of a pure refactor; the witness numbers above are the proof,
not an assumption.

`scripts/gate_4d.sh`: `pass=7 fail=0 missing=1` (the 1 missing, `witness_arch_area_weight.js`, is
absent from `main` too — pre-existing, unrelated). PR: bim-ootb #1374.

**Deferred, unchanged from the spec above**: candidate #2 (full 7-concern split, LARGE) — still
not started, still recommended to wait until this file's churn settles.

## §GANTT_WINDOW_FIDELITY_AND_SPREAD — post-#1375 re-measurement, real regression found+fixed (2026-08-15)

User, after §OG_HANG_BAND (#1375) shipped: **"Are they correlating exactly to TM Gantt chart
timeline? and spread evenly within each bar?"** — then **"these are the two main issues to chase for
days."** Standing multi-day item. This session: got real numbers for both, found and shipped one real
fix (bim-ootb PR #1376), and ruled a second candidate lever OUT as intentional design, not a bug.

### Q1 — window-fidelity correlation, re-measured per building, not assumed

§GANTT_TASK_WINDOW_FIDELITY (#1368) measured 97.87% (62063/63415) on Hospital at ship time. Extended
`bim-ootb/scripts/probe_captured_floating.js` with a direct in-window/out-of-window census (checking
BOTH the post-repair `s` and `e` against the element's own task's `[schedule_start, schedule_finish]`)
plus an overshoot-magnitude measurement, and ran it on all 7 buildings, before AND after §OG_HANG_BAND
(#1375), using an isolated `git worktree` at each commit for a true apples-to-apples A/B (not the
historical 97.87% figure, which predates #1372/#1375 and isn't directly comparable).

**Finding: §OG_HANG_BAND is CLEAN on 5/7 buildings (byte-identical violator sets, e.g. Hospital's 18
out-of-window elements — all pre-existing IfcBeam/IfcSlab bearing cases — unchanged count AND unchanged
byClass breakdown before/after), but REAL on two:**

| Building | fidelity before→after #1375 | violations before→after | max overshoot before→after |
|---|---|---|---|
| Hospital | 99.97%→99.97% | 18→18 (identical) | 0.28d→0.28d |
| Terminal | 98.79%→98.79% | 585→585 | 32.95d→32.95d (unchanged by #1375 itself) |
| Clinic | 99.98%→99.98% | 3→3 | 0.07d→0.07d |
| **Duplex** | **95.35%→82.22%** | **52→199** | 0.92d→1.06d (small magnitude) |
| **LTU_AHouse** | **99.99%→99.57%** | **16→526** | **0.78d→79.07d** |
| HHS | (not isolated pre/post; measured 88.97% post-#1375) | 754 | 4.45d |
| JKR | (not isolated pre/post; measured 94.36% post-#1375) | 507 | 12.43d |

LTU's 79-day overshoot is the same magnitude that sank the two ALREADY-rejected repair strategies
earlier this session (widened `_ogSupportSweep` pool → worse floating; `_midairRepair` swap → 100-300d
desync) — a real regression, not noise, even though it never showed up on Hospital (the building all of
#1375's own ship-time measurement was scoped to).

**Root cause, traced to source, not guessed**: `_ogSupportSweep` never received any per-task window
information at all — it only ever saw `T.s`/`T.e` and pushed unconditionally when a real carrier's
finish exceeded the target's start. §OG_HANG_BAND's widened 9.5m hang radius can now find a real carrier
far enough away — in TIME, not just space — that the honest push lands the target outside its own
authored Gantt window. The ORIGINAL 0.5m bearing push never did this on any measured building (pool is
narrower, findable carriers are always close by construction).

**Fix, bim-ootb PR #1376, MERGED**: `_ogSupportSweep(_allScheduled, taskWin)` now takes `materializeZones`'
per-task window (`_cap.win` at the real call site) and, for the HANG branch only (bearing untouched),
refuses to push a target past its own task's `schedule_finish`. When the real carrier is outside the
window, the element stays honestly floating — literal application of the user's own rule ("if it is not
in that single source of truth, it does not happen, yet") — rather than landing on a fabricated,
window-compliant date that isn't the real dependency.

**Measured, all 7 buildings, before → after the #1376 fix:**
```
floating        435→491(Terminal) 611→611(Hospital) 15→41(Duplex) 139→145(HHS)
                401→401(Clinic) 1319→1337(LTU) 143→154(JKR)   [+117/3180 total, +3.8%]
max overshoot   32.95→0.44(Terminal) 0.28→0.28(Hospital) 1.06→0.25(Duplex)
(days)          4.45→0.01(HHS) 0.07→0.07(Clinic) 79.07→0.78(LTU) 12.43→0.42(JKR)
fidelity        98.79→99.10%(Terminal) unchanged(Hospital) 82.22→97.23%(Duplex)
                88.97→99.94%(HHS) unchanged(Clinic) 99.57→99.99%(LTU) 94.36→99.62%(JKR)
```
Small, honest floating cost (+117, still visible/reported, never hidden) for eliminating every
multi-day Gantt desync across all 7 buildings — worst case drops from 79.1 days to 0.78 days. This is
the mirror image of the two originally-rejected repair strategies (they traded MORE floating-fixed for
worse desync); this fix trades a SMALL amount of floating back for eliminating the desync, consistent
with every prior ruling in this lane.

Witnesses: `witness_midair_zero.js` 38/38 (generative path untouched), `witness_og_guard_bearing_bound.js`
9/9 and `witness_gantt_og_grid_perf.js` 3/3 (both updated for the new `taskWin` sandbox param — the exact
slice-witness maintenance their own header comment warns any signature change requires),
`scripts/gate_4d.sh` 7/7. `_GANTT_CACHE_VERSION` 22→23, `sw.js` v1032→v1033.

### Q2 — "spread evenly within each bar?" Traced to source, ruled OUT as a bug (intentional design)

Built a fresh per-task normalized-position measurement (`(displayS - w.s)/(w.e - w.s)`, in [0,1]) —
never measured before. Aggregate Hospital result: **NOT uniform** — KS-vs-uniform=0.14 (n=63164, a large,
real deviation), histogram U-shaped (19-22% in each of the outer two of ten buckets, 5-8% in the middle
eight). Same shape before AND after #1375/#1376 — this is not caused by either fix.

**Traced to one concrete task, `TASK_Architecture_Level_4` (Hospital, n=4350)**: histogram is a hard
bimodal split — **1571 elements start day 0-12, ZERO start day 13-132 (a genuine 120-day silent gap),
2779 start day 133-135.** Confirmed this exists in the RAW `computeSchedule` output (pre-rescale,
pre-repair) — not an artifact of the per-task rescale or `_ogSupportSweep`. The split is exactly
class-clean: the day-0-12 cluster is 100% `IfcWall`/`WallStandardCase`/`Door`/`Stair`/`Railing`/
`BuildingElementProxy` (seq 5-6); the day-133-135 cluster is 100% `IfcMember`/`IfcPlate` (seq=7, likely
curtain-wall framing — same base_z range as the walls, 180.9-185.8m, so NOT a height-band effect).

**Root cause, read directly in `schedule_gate.js`'s `placeNonst`** (lines 745-763): `phaseTrade[ph][seq]`
where `ph = collapsePhase(el.storey)` — a trade-order gate keyed by STOREY ONLY, deliberately ignoring
`el.phase`. A seq=7 element waits for the LATEST finish of any seq<7 element **at the same storey,
across every discipline** (Architecture, MEP Rough-in, everything) — so Level-4's curtain-wall
members/plates wait not just for Level-4's own walls (finished by day 12) but for Level-4's MEP
rough-in and every other seq≤6 trade at that storey too, which on Hospital runs until ~day 133.

**This is documented, deliberate design, not a bug** — `schedule_gate.js:303-321`, the `§4D_BAND_MONOTONIC`
header, explicitly discusses this exact mechanism by name (`phaseTrade[ph][seq]`) and its own history:
a 2026-05-30 swap already removed a cruder band gate for floating beams over unfinished columns, which
in exchange "gave up floor-by-floor progression entirely... the user watched exactly that" — the
CURRENT `phaseTrade` behavior (storey-scoped, cross-discipline) is the settled, re-litigated compromise,
paired with the separate `bandTrade`/`§4D_BAND_MONOTONIC` mechanism for the cross-FLOOR constraint.
Loosening `phaseTrade` to be phase-scoped (i.e., let Architecture's seq=7 wait only on Architecture's
own seq≤6, ignoring MEP) is a plausible-sounding lever that was **NOT attempted** — it directly
contradicts this documented ruling and risks reproducing the exact regression band-monotonic was built
to fix. Given this project's own track record this session (two OTHER plausible-sounding levers already
tried and rejected with hard numbers), this one was named precisely and left alone rather than tested
blind against a function multiple other named witnesses (`§4D_WALLS_BEFORE_ROOF`, `§DEQ_V1`,
`§HOSTED_BEFORE_HOST`) depend on.

**Practical read**: a Gantt BAR spanning a real dependency-gated gap (early rough trades + a genuine
multi-week wait + late finish trades) is not visually distinguishable from a bug — the rectangle just
looks "empty in the middle." If the user wants the MOVIE/GANTT pacing to read as continuously busy
rather than accept this honest gap, the correct lever is almost certainly a DISPLAY-authoring one: split
a task into sub-bars at its own internal `phaseTrade` boundary (so the gap becomes a visible inter-task
transition, matching what it actually is) — NOT changing the underlying trade-sequencing gate. This is
very likely the SAME mechanism behind the already-named, still-open `§TIER2_AFTER_TIER1` "Zone
Tier1→Tier2 handoff dead-air" item (`project_cpm_4d_generator_lane.md` in memory: "Hospital's biggest
dead run, 11% of film, zero starts... no lever proven yet, needs new engineering") — this session's
finding gives it a MUCH more precise mechanism and a concrete worked example (exact GUIDs, exact days,
exact classes) than existed before, but does not itself close it. Reusable tooling for whoever picks
this up: `bim-ootb/scripts/probe_zone_edges.js` (zone/edge/class dump for a named phase+storey) and
`probe_task_collision.js` (confirms zone→task id mapping is 1:1, no collisions — ruled out as a
contributing cause).

**Not started**: splitting a `phaseTrade`-gated task into authored sub-bars at its own internal
boundary, or any other display-side fix for the visual "dead middle" read. Needs its own spec — this
pass was measurement + root-cause tracing, not display-authoring work.

## §GANTT_GAP_CLAMP_SPREAD — SHIPPED (2026-08-15, bim-ootb PR #1377, merged)

User rejected the two levers named above (sub-bar split, loosening `phaseTrade`) as "the wrong way...
can invite drift and impact." Directive: "It is a simple spread it evenly" → "U have a denominator
for a 4D time factor - divide by it! or shrink to it which is other way round" → "go to the source
of truth, trace what is happening. Refactor the code if need be."

**Three levers tried and rejected with hard numbers before landing on the shipped one — do not
re-attempt any of them:**
1. **Pure rank/count spread** — every gap set to `tSpan/N` by index, discarding real magnitude
   entirely. Fixed Q2 perfectly (Hospital KS 0.14→0.0117, the reported `TASK_Architecture_Level_4`
   task exactly uniform) but broke Q1 hard: window fidelity 99.97%→97.80%, max overshoot 0.28d→14.92d.
   A tiny per-element rank step compressed real, necessary minimum lead times between directly
   dependent elements — the exact intra-task-precedence risk this whole fix was flagged in advance
   to check for, confirmed real by measurement.
2. **Clamp each gap to `tSpan/N`, then MULTIPLICATIVELY restretch** the compressed timeline to refill
   the window. Converged to nearly the identical Q1 regression as #1 (97.78–97.93% across every
   threshold tried) — one common per-task stretch factor scales EVERY gap, including safe tiny real
   ones, reintroducing the same compression risk by a different mechanism.
3. **Clamp+ADDITIVE pad, first version** — grow gaps by a constant instead of a multiplier (correct
   mechanism), but the pad target was computed against `tSpan` (the whole window) instead of what the
   original unclamped per-gap formula actually produces — `tSpan` also budgets room for `sp.max`'s
   trailing duration (unrelated to inter-element gaps), so pad barely moved across clamp thresholds
   3–50 (Hospital stuck at 97.87–97.93%), dominated by that structural gap, not by anything clamping
   had removed. Confirmed by testing K→∞ (clamping disabled): the buggy version still didn't converge
   to the pristine 99.97% baseline, proving the bug was in the pad math, not the clamp threshold.

**Root fix — same additive mechanism as #3, target computed correctly**: `target` = the exact sum the
pre-existing per-gap value-based formula already produces (so zero clamping ⇒ byte-identical to the
untouched rescale — verified: K→∞ reproduces 99.97%/18 violations/0.28d exactly). Clamp threshold =
**this task's OWN median real gap × 500** (a per-task statistic, not one shared constant across every
task/building — a global `tSpan/N` share is often smaller than most REAL gaps too when N is in the
thousands, which is why #1/#2 clamped almost everything instead of just outliers). A percentile
self-clamp (P90/P95/P99 of the task's own gap distribution) was also tried as a threshold alternative
and was WORSE than median×K on Terminal specifically (Q1 97.77–98.16%, Q2 KS 0.28–0.30) — rejected.

**Measured, all 7 buildings, this exact shipped configuration:**
```
              fidelity before→after   violations before→after   spread KS before→after
Hospital      99.97%→99.97% (=)       18→18                     0.0773→0.0731
Duplex        97.23%→97.23% (=)       31→31                     0.0574→0.0574 (no clamp fired)
HHS           99.94%→99.94% (=)       4→4                       0.1242→0.0909
Clinic        99.98%→99.98% (=)       4→4                       0.1085→0.0707
JKR           99.62%→99.76% (better)  34→22                     0.0599→0.0490
LTU_AHouse    99.98%→99.94%           20→71                     0.1107→0.0261 (large spread gain)
Terminal      99.10%→99.10% (=)       436→436 (zero new cost)   0.0946→0.2823 (worse shape)
```
Hospital's reported task, `TASK_Architecture_Level_4`: histogram goes from the reported hard bimodal
split (1571 elements day 0-12, 120-day silent gap, 2779 elements day 133-135) to
`[436,436,436,434,434,435,435,434,435,435]` — near-perfectly uniform.

**Two real, bounded, NOT-hidden costs, named precisely rather than smoothed over:**
- **LTU_AHouse**: window fidelity cost (20→71 violations, still 99.94% of 122,330 elements) traded for
  a large spread gain (KS 0.1107→0.0261). Same honest-cost pattern already established this session
  (§OG_HANG_BAND's own +117 floating for closing the bigger 1510-floating gap).
- **Terminal**: zero new window-fidelity cost (violation count identical, 436→436) but its in-window
  spread SHAPE got measurably worse (KS 0.0946→0.2823). Root cause, traced: several Terminal tasks
  have real gap distributions that are themselves multi-modal at genuinely different scales (not one
  dominant outlier + a dense remainder, like Hospital's reported case) — a single task-wide
  median-based threshold isn't the right lever there. Terminal was already imperfectly spread
  pre-fix; this is a real but same-axis regression, not a new correctness class. Named for a future
  session — needs a per-cluster/local-outlier detector instead of one task-wide statistic, not
  chased further this pass.

**Ship trail**: bim-ootb PR #1377, MERGED, CI green (fast-checks + e2e-tests). Witnesses:
`witness_midair_zero.js` 38/38, `witness_og_guard_bearing_bound.js` 9/9,
`witness_gantt_og_grid_perf.js` 3/3, `scripts/gate_4d.sh` pass=7/fail=0 (1 pre-existing MISS,
`witness_arch_area_weight` not in this revision — unrelated). `_GANTT_CACHE_VERSION` 23→24, `sw.js`
`CACHE_VERSION` v1033→v1034. `scripts/probe_captured_floating.js` extended with the same
gap-clamp+pad logic (mirrors the shipped rescale exactly) plus a `GAP_CLAMP_K` env override, reusable
for whoever picks up Terminal's residual next.

## §CPM_GENERATOR_UPSTREAM_SPEC — scoping only, no code, awaiting user go (2026-08-15)

User, after the three patches above shipped: **"The 4D Schedule is our own generated scripting. Why
not fix it to sustain any constraints expected in general of a gantt schedule?"** — i.e. why does the
GENERATOR not just produce something already-compliant, instead of three bolt-on repairs. This is a
SPEC, read-only, no code touched, no worktree opened.

### The actual root cause, traced to source, not guessed

`computeSchedule` (`schedule_gate.js:273`) is ALREADY a real, mostly-compliant CPM engine — it is
**not** the thing missing constraints. It already has: real geometric support-DAG placement (`geoGate`/
`hangGate`/`wallGate`, including a real-carrier hang band already widened to 0.5–9.5m by §HANG_NEAREST
back on **2026-08-11** — four days before today's §OG_HANG_BAND had to re-discover the identical band
for a DIFFERENT copy of this logic, see below) and real labor-rate-driven per-element pacing
(`_installSecs`, `schedule_author.js:62` — every element's `installSecs` comes from `LABOR_RATES`
productivity × real length/area, already shipped, already used by `place()`'s serial crew-slot
placement). The raw output of `computeSchedule` is a single, globally-consistent, dependency-ordered,
realistically-paced timeline. **Compliance is not lost in generation — it is lost in two subsequent
display-authoring steps that both throw away information `computeSchedule` already computed:**

1. **`deriveZones` (`schedule_gate.js:1012`) rolls elements into Gantt TASKS keyed by `(phase, storey)`
   only** — `zid = (e.phase||'_UNPHASED') + '||' + storey`. A zone's `seq` field keeps only the
   MINIMUM seq present (`if (e.seq < z.seq) z.seq = e.seq`), purely for zone-to-zone edge ordering —
   the finer `phaseTrade[storey][seq]` precedence structure `computeSchedule` used internally (the
   thing §GANTT_WINDOW_FIDELITY_AND_SPREAD traced Hospital's bimodal `TASK_Architecture_Level_4` gap
   to) is discarded the moment elements get grouped into this one bar. **This is the actual source of
   Q2's clustering** — not a display bug, a grouping-granularity bug: the task boundary is coarser
   than the real precedence graph.
2. **§GANTT_TASK_WINDOW_FIDELITY's rescale (`time_machine.js:5642-5682`, PR #1368) then repositions
   every element INDEPENDENTLY per task** — grouped strictly by `item.task`, zero cross-task
   information. The code's OWN comment already names the consequence: *"a structural dependency that
   crosses two tasks with overlapping/conflicting authored windows can still show a real violation...
   pointing at the task AUTHORING."* `computeSchedule`'s real global ordering is correct; this
   independent per-task rescale is what can scramble it when a real carrier lives in a different task
   than its dependent — which is exactly what `_ogSupportSweep` then has to repair after the fact.
   **All three patches shipped today (§OG_HANG_BAND, §OG_HANG_WINDOW_BOUND, §GANTT_GAP_CLAMP_SPREAD)
   live entirely inside this one repair-and-rescale mechanism**, patching symptoms of step 2's
   information loss — none of them touch `computeSchedule`, `deriveZones`, or `materializeZones`.

**A third, previously unnamed finding**: `_ogSupportSweep`/`_contactGraph` (`time_machine.js:4216`/
`:4615`, the CAPTURED-path repair+judge) is explicitly, by its own header comment, *"the SAME
role-blind support predicate this file already uses for the generative path"* — i.e. a SEPARATE,
independently-maintained reimplementation of `hangGate`'s support logic, not shared code. Measured
drift between the two copies, real and dated: `hangGate`'s 0.5–9.5m hang band shipped 2026-08-11
(§HANG_NEAREST); `_ogSupportSweep`'s equivalent band was still 0.5m until today, 2026-08-15 — **four
days of silent divergence between two copies of the same physics**, caught only because this session
happened to chase the floating-count symptom hard enough to trace it. There are now at minimum THREE
independent implementations of "what is my real carrier": `hangGate` (generative), `_contactGraph`
(judge, deliberately unbounded), `_ogSupportSweep` (captured-path repair, just patched to match). This
is the same class of risk `§SCHEDULE_CLASSIFY_DEDUP` (earlier today, PR #1374) closed for the
classification trio — support-relation logic has the identical shape and has NOT been deduped.

### Blast radius, counted not guessed

**24 files** (`viewer/tests/*.js` + `scripts/probe_*.js`) directly reference
`materializeZones`/`deriveZones`/`computeSchedule`/`_ogSupportSweep`/`_cap.win`/`GANTT_TASK_WINDOW` —
every one is a potential baseline that would need re-deriving (not just diffing) under any change to
the generator's actual placement/grouping logic, the same discipline `§GANTT_GAP_CLAMP_SPREAD` already
required for the 4 witnesses its own smaller rescale change touched. A grouping-key or rescale-mechanism
change is a bigger version of the exact same maintenance burden already paid three times today, times
roughly 6x the file count.

**Risk relative to the three ALREADY-REJECTED bigger levers this session** (reclassifying
`IfcBuildingElementProxy`'s phase — disproven by direct measurement, the proxies already sit on real
structural carriers; loosening `phaseTrade` — avoided, prior history of "gave up floor-by-floor
progression entirely" when tried in this direction; swapping `_midairRepair` in as the primary
captured-path repair — caused a 100–300 day desync): a real generator-level fix is **structurally
different from all three**, not a bigger version of the same lever. None of those three touched
`deriveZones`'s grouping key or the rescale's per-task independence — they either changed a
classification input, loosened an existing gate, or swapped which repair function ran. A generator fix
changes what a "task" even IS, which is why it needs its own spec rather than being tried inline.

### Candidate scopes

1. **SMALLEST — fix `deriveZones`'s grouping key so a real internal `phaseTrade` break becomes a real
   task boundary automatically**, e.g. key zones by `(phase, storey, seqBand)` where `seqBand` is
   derived from the SAME `phaseTrade[storey][seq]` structure PASS B already computes, instead of
   `(phase, storey)` alone. **This is the same idea as the "split into sub-bars" lever the user already
   rejected once** ("the wrong way... can invite drift and impact") — the difference is this would be
   the GENERATOR's own grouping rule recognizing its own internal structure (so a genuinely separate
   trade cluster becomes a genuinely separate task, the way a real P6/MSP schedule would have two
   activities, not one with a hole in it), not a display-side bolt-on split layered after the fact. Given
   the prior rejection, this needs the user's explicit re-read before any code — flagging it precisely
   rather than assuming the earlier "no" still applies to a different mechanism achieving a related
   result.
2. **MEDIUM — make the rescale solve WITH cross-task context instead of independently per task**, so
   `computeSchedule`'s already-correct global ordering survives task authoring instead of needing
   `_ogSupportSweep` to repair what the rescale broke. This is the fix that directly targets the
   documented root cause (item 2 above) without changing what a "task" is. Would likely shrink or
   eliminate the need for §OG_HANG_WINDOW_BOUND's clamp (PR #1376) — the violations it guards against
   would no longer be created by the rescale in the first place.
3. **LARGEST — dedupe the three independent support-carrier implementations into one shared module**
   (mirroring `§SCHEDULE_CLASSIFY_DEDUP`'s already-proven pattern for the classification trio), so
   `hangGate`/`_contactGraph`/`_ogSupportSweep` read one physics definition instead of three
   independently-maintained copies that have already measurably drifted once. Fixes the ROOT CAUSE of
   why §OG_HANG_BAND was needed at all (a copy silently falling behind), not just today's instance of
   it — but is the biggest lift of the three: touches the generative path (`schedule_gate.js`) AND both
   captured-path functions, the largest share of the 24-file blast radius.

**Recommendation (for the user to bless, not decided here): #3 first, then #2.** #3 has the cleanest
precedent (this exact session already proved the dedupe pattern works, PR #1374, small and
zero-regression) and directly prevents this session's whole chase from recurring — the next drift
between the three carrier copies is now a "when," not an "if," given it already happened once measured
in four days. #2 is the structural fix for the rescale's independence bug specifically and is a natural
follow-on once there is one shared support definition to rescale against. #1 is deferred pending the
user's explicit re-read, since it resembles an already-rejected lever closely enough that assuming
consent would be wrong.

**What none of these candidates fix**: the still-open `§TIME_MACHINE_CONSOLIDATION_SPEC` structural
split (separate axis — file organization, not schedule correctness) and Terminal's own residual spread
shape (§GANTT_GAP_CLAMP_SPREAD's named, not-chased regression) — a generator-level fix changes WHERE
the pacing information comes from, not Terminal's specific multi-modal-gap shape, which would still
need its own per-cluster analysis regardless of which candidate above gets picked.

## §CARRIER_DEDUP_DERISK_STUDY — read-only analysis, no code (2026-08-15)

User: "#3, can we study further to derisk it?" Read all three implementations in full
(`schedule_gate.js`'s `hangGate` :460-510, `time_machine.js`'s `_contactGraph` :4615-4653 and
`_ogSupportSweep` :4216-4385) plus a fourth site the original scoping missed. Verdict up front: **the
divergence is real and bigger than "one number drifted" — a naive one-behavior merge is confirmed
unsafe, same risk class as candidate #2. A parameterized refactor is still low-risk, but the
parameterization has to encode three genuinely different predicate SHAPES, not just one bound value.**

### New, zero-risk finding first: a FOURTH copy, not three

`_midairRepair` (`time_machine.js:4722-4761`) contains a **byte-identical inlined duplicate** of
`_contactGraph`'s entire grid-build + contact-scan + grounded computation — same `cellsOf`, same grid
loop, same three-clause bearing/hang/embedded OR-predicate, same `grounded[i] = (lowest < T.bz - GAP) ?
0 : 1` line, differing only in writing to `stats.grounded`/`stats.orphans` instead of local
`groundedN`/`orphans`. This is accidental duplication, not a design choice — no comment anywhere
justifies re-deriving what `_contactGraph(items)` already returns. **Zero-risk to fix**: replace the
inline block with a call to `_contactGraph(items)`, verify `witness_midair_zero.js`'s `moved`/
`residual`/`orphans` counts stay byte-identical (they must, since the replaced code is character-for-
character the same predicate). Do this regardless of what happens with the 3-way question below — it's
the same shape as §SCHEDULE_CLASSIFY_DEDUP (PR #1374) with even less ambiguity (no divergence to reconcile
at all, unlike the classification trio which needed the 2-of-4 scope-down).

### The three-way divergence, precisely characterized (not just the known hang-band value)

All three share the same XY-overlap predicate — confirmed byte-identical: `schedule_gate.js:171`
`overlap()`, `_ogXY` (`time_machine.js:4277`), and `_contactGraph`'s inline check are the exact same
four-clause AABB test, word for word. The overlap test is not drifted. The Z-axis logic is where they
diverge, in THREE separate ways, not one:

1. **Predicate SHAPE differs, not just the bound.** `_contactGraph`'s hang clause
   (`S.bz >= T.tz - GAP && S.tz > T.tz + EPS`) is genuinely **one-sided-unbounded** — no upper cap on
   how far above S can sit, by design (§DAY_GAP_TAIL). `hangGate`'s PRIMARY test
   (`S.base_z >= el.top_z-GAP && S.base_z <= el.top_z+GAP...`) is a **tight two-sided band** (±0.5m,
   direct-mount only). `_ogSupportSweep`'s hang branch uses ANOTHER two-sided band, but **9.5m wide**
   (`_ogHangGap=9.5`, added today by §OG_HANG_BAND). Three different shapes, not one shared shape at
   three different widths.

2. **`hangGate`'s extended-reach fallback (§HANG_NEAREST, lines 481-508) is itself UNBOUNDED, not
   0.5-9.5m as the comment's own framing implies.** The code finds the NEAREST overlapping candidate
   above with `S.base_z > el.top_z + GAP && S.base_z < nb` — no upper distance cap anywhere in that
   loop. The "0.5-9.5m" figure in the §HANG_NEAREST comment (and reused today to size
   `_ogSupportSweep`'s `_ogHangGap`) is a MEASURED empirical range of where real carriers were found on
   shipped buildings, not an enforced search-radius parameter of `hangGate` itself. **This means
   today's §OG_HANG_BAND fix did not actually make `_ogSupportSweep` match `hangGate`'s behavior** — it
   introduced a third, new, explicitly-capped 9.5m behavior that exists nowhere else. A real carrier
   more than 9.5m away — one `hangGate` (unbounded fallback) and `_contactGraph` (unbounded judge)
   would both accept — is still unreachable by `_ogSupportSweep`'s repair. This is very likely a real
   piece of the 3063/3180 residual floating count named in §OG_HANG_BAND's own "not this session's
   scope" note, not just `IfcFooting`'s separate bearing-side gap.

3. **Eligibility restriction differs in the opposite direction.** `hangGate`'s fallback only fires for
   BIG elements (`bboxVol(el) > BIG_ELEMENT_VOL = 1.556m³`), non-pool, non-wall — deliberately, per its
   own comment ("widening ALL sinks would re-gate 48,904 elements... a Part-2-scale reorder, not this
   seam close"). `_ogSupportSweep`'s hang branch has **no size restriction at all** — every non-bearing
   seq>4 element is eligible. So relative to `hangGate`, `_ogSupportSweep` is simultaneously MORE
   permissive on eligibility (no BIG-only gate) and LESS permissive on reach (hard 9.5m cap vs
   unbounded). Neither is a superset or subset of the other.

### Deliberate vs accidental, per difference

- `_contactGraph` unbounded — **deliberate, documented, load-bearing** (§DAY_GAP_TAIL: bounding it
  caused a 3-40x orphan blowup, measured and rejected). Must never be capped by any unification.
- `hangGate`'s BIG-only fallback restriction — **deliberate, documented** (the 48,904-element Part-2
  note). Must be preserved as an explicit, still-BIG-only config for that call site.
- `hangGate`'s fallback being unbounded vs `_ogSupportSweep`'s hard 9.5m cap — **accidental, or at best
  an unexamined choice.** Today's fix cited hangGate's band as the reference and landed on a different
  number. Not a documented decision either way — worth a real conversation, not a silent pick, before
  any unification bakes one of the two in as canonical.
- `_ogSupportSweep`'s hang branch skipping the BIG-only gate — **no comment addresses this at all**,
  reads as unexamined rather than deliberate. Could be intentional (repair pass wants to close more
  gaps than the generator bothers gating) but nobody wrote that down.
- `_ogSupportSweep`'s two-tier bearing envelope logic (§OG_BEARING_BOUND) has no equivalent in
  `hangGate` — a fourth asymmetry, on the bearing axis rather than hang, not analyzed further here
  (out of scope for the hang-band question specifically).
- `_midairRepair`'s inline `_contactGraph` duplicate — **100% accidental**, plain unDRY code.

### Unification shape, and a concrete "what breaks if done naively" example

Confirms the parent session's proposed shape is necessary, not optional: one shared low-level scan
primitive (grid-build, XY-overlap, Z-relation test) parameterized per call site —
`{hangMode: 'unbounded'|'band'|'nearest-unbounded', hangBand, bigOnly, bigVol, bearingTiered}` — with
`_contactGraph` passing `{hangMode:'unbounded'}`, `hangGate` passing
`{hangMode:'band', hangBand:0.5}` for its primary test plus a SEPARATE
`{hangMode:'nearest-unbounded', bigOnly:true, bigVol:1.556}` call for its fallback, and
`_ogSupportSweep` passing `{hangMode:'band', hangBand:9.5, bigOnly:false, bearingTiered:true}`. This is
a refactor (shared scan code, three still-distinct configs), not a behavioral unification.

**Concrete break scenario for the naive version** (one shared behavior, not parameterized): take
today's shipped `_ogSupportSweep` config (9.5m band, all elements eligible) as the "unified" default and
apply it everywhere. `hangGate`'s generative path would then ALSO cap at 9.5m instead of its current
unbounded nearest-search — for any BIG element whose real carrier sits beyond 9.5m (a valid case:
`hangGate`'s own fallback exists precisely because SOME real carriers sit further than the direct-mount
band), the generative schedule would now compute a gate time using a WRONG, closer, non-real carrier
instead of the true one identified via unbounded search — a correctness regression in the GENERATIVE
path, not just the captured-path repair this session has been chasing. Conversely, if the "unified"
choice went the other way (adopt `hangGate`'s BIG-only restriction everywhere), `_ogSupportSweep` would
stop repairing small non-BIG floating elements it currently fixes — directly regressing today's
§OG_HANG_BAND numbers (Hospital's `IfcBuildingElementProxy` fix, 1012→55, almost certainly includes
small elements). Either naive choice breaks a currently-working population; there is no single
"correct" shared value to pick without the parameterization.

### Verification plan, per call site not cross-site

"Byte-identical" must be checked against each function's OWN pre-refactor baseline, never against the
other two (their outputs are supposed to differ — that's the whole point of the config split):
`hangGate` — identical `computeSchedule` output across all 7 buildings, byte-for-byte (it's a pure
function of geometry + config, so this is checkable directly). `_contactGraph` — orphans/grounded counts
unchanged per building (Hospital orphans=35/grounded=811, the baseline already cited this session).
`_ogSupportSweep` — `pushed` count and floating totals unchanged per building (Hospital 611, the
§OG_HANG_WINDOW_BOUND-era baseline). `_midairRepair`'s dedup (the zero-risk fourth-copy fix) —
`witness_midair_zero.js`'s per-building `moved`/`residual`/`orphans` numbers unchanged. Full suite:
`witness_midair_zero.js`, `witness_og_guard_bearing_bound.js`, `witness_gantt_og_grid_perf.js`,
`scripts/gate_4d.sh`, plus re-running `probe_captured_floating.js`/`probe_proxy_carrier_classes.js` for
the floating-count/carrier-class numbers already established as this session's baselines.

### Revised risk verdict

**Confirmed, not just suspected: candidate #3 done naively (one shared behavior) is in candidate #2's
risk class** — real correctness decisions hide inside it on at least two axes (hang search shape/reach,
BIG-only eligibility), not one. Done as a parameterized refactor with each site's current behavior kept
explicit and verified byte-identical against itself, it stays low-risk — but it is real, careful work on
three distinct configs, not a mechanical extraction like §SCHEDULE_CLASSIFY_DEDUP. **Recommend splitting
#3 into two separately-shippable steps**: (a) the `_midairRepair`/`_contactGraph` fourth-copy dedup —
genuinely zero-risk, ship first, alone; (b) the parameterized `hangGate`/`_ogSupportSweep`/
`_contactGraph` shared-primitive refactor — real work, needs the accidental-vs-deliberate table above
settled explicitly (in particular: should `_ogSupportSweep`'s hang reach be capped at all, given
`hangGate`'s own fallback isn't?) before code, not decided inside the refactor.

## §FLOATING_TIMING_ROOT_CAUSE — is it a late carrier or an early-scheduled element? (2026-08-15)

User: **"Hanging from ceiling sounds good, but MEP in the gantt chart schedule is quite late, thus it
does not arise when the ARCH/STR is way advancing."** Their point: if MEP genuinely runs late, a
hanging fixture's real support should almost always already be built by the time the fixture is
scheduled — so floating shouldn't happen much. Measured this directly, read-only, on Hospital's RAW
generative schedule (`computeSchedule`'s own output, before any of today's repair/rescale/clamp
patches touch it — the cleanest place to see the generator's own timing decisions).

**The user's premise is TRUE for real MEP.** Mean scheduled start day by phase: Substructure 5,
Superstructure 31, Architecture 116, **MEP Rough-in 164, MEP Final 287**, Finishes 322. Real,
correctly-classified MEP (ducts, pipes, valves, cable trays — anything with its own exact IFC type)
genuinely starts far later than structure and architecture, exactly as the user expects.

**But the equipment causing the floating isn't running on the MEP track at all — it's stuck on the
Architecture track.** All 5,729 `IfcBuildingElementProxy` elements on Hospital (boilers, VAV valves,
solar panels, sinks — real equipment the IFC export gave no exact type, confirmed by DB query earlier
this session) get `phase:'Architecture', sequence:5` from `viewer/rates.js`'s class-default table —
the SAME early time slot as walls and doors (mean day 116), not MEP's day 164-287. Checked which of
these proxies are genuinely MEP by name (the same name pattern `probe_proxy_carrier_classes.js`
already used: boiler/valve/chiller/pump/vav/duct/pipe/etc.) — **3,197 of 5,729 (56%) are real MEP
equipment wearing an Architecture time slot**, not a data artifact (the rest are mostly elevator cab/
door parts, which genuinely belong with Architecture).

**Of the 834 proxies still floating on Hospital's raw schedule, 712 (85%) are exactly this MEP-named
population.** This is a real, previously untested angle — this session's earlier §OG_HANG_BAND probe
(`probe_proxy_carrier_classes.js`) checked WHICH class of carrier a proxy geometrically touches and
found most touch a real structural carrier (disproving "the carrier relationship is MEP-only"); it
never checked WHEN that element itself gets scheduled relative to real MEP. Different question,
answered here for the first time: yes, misclassification is real and large, but not in the way first
guessed back then.

**Why it still floats even though its carrier is usually NOT on a later track.** Checked the real
physical carrier's own phase for all 834: only 13 (1.6%) sit in a genuinely later phase (MEP
Rough-in) — the dominant carrier phase is Superstructure (601, 72%, nominally EARLIER) and
Architecture (220, 26%, the SAME phase as the proxy). So this is not simply "the element jumped ahead
of a later trade." **Architecture's own day range is huge — day 29 to day 234 (p10-p90)** — because
each zone/storey gets its own local schedule, not one global block. A proxy can land on an early crew
slot inside that spread while its own specific real support, even nominally the same or an earlier
phase, is still sitting on a late crew slot inside ITS OWN spread. Real gaps confirm this isn't noise:
median 2.9 days, 90th percentile 8.0 days, worst case 244 days (38.6% are same-day ties under 1 day,
not counted as meaningful). **This is the same gap §CPM_GENERATOR_UPSTREAM_SPEC already named**: phase/
seq buckets approximate real dependency but there is no actual element-to-element dependency edge, so
two elements sharing a phase label are not guaranteed to be time-ordered correctly against each other.

**A real, additive, small fix this reveals — not named in any section above:** add one more
`SEQUENCE_NAME_OVERRIDES` entry in `viewer/rates.js`, same mechanism and same measured-not-guessed
discipline as the three already-shipped entries in that file (`foundation_pile_misclassified_slab`,
`slab_on_grade_substructure`, `furniture_generic_bucket`) — reclassify MEP-named
`IfcBuildingElementProxy` elements to `phase:'MEP Rough-in', sequence:7`, matching where their
correctly-typed siblings (`IfcValve`, `IfcEnergyConversionDevice`, `IfcFlowStorageDevice`, etc.)
already land in the SAME file. This directly targets 712/834 (85%) of Hospital's floating proxies —
the largest single lever found this session, bigger than any repair-layer patch shipped today, and it
fixes the SCHEDULING itself rather than repairing its symptom after the fact.

**What it would NOT fully close**: the remaining 122 non-MEP-named floating proxies (elevator parts,
etc.), and the deeper mechanism (finding #2 above — no real element-level dependency edge within a
phase) stays open regardless; §CPM_GENERATOR_UPSTREAM_SPEC's candidate #2 is still the complete fix
for that. This is a real, standalone, worthwhile lever on its own — not measured yet against the OTHER 6
buildings, and not yet checked for side effects (moving 3,197 elements to a later, busier MEP Rough-in
crew slot changes crew-demand/duration for that phase — needs the same before/after discipline as
every other change today: all 7 buildings, full witness suite, `_GANTT_CACHE_VERSION` bump, before
shipping). Not implemented this pass — read-only measurement only, per this project's Spec-First rule.

Scratch probe used (not committed, not part of the shipped `scripts/probe_*.js` set):
`/tmp/claude-1000/-home-red1-bim-compiler/dbe950eb-c3c3-4584-8435-fa75736178ac/scratchpad/
probe_mep_timing_root_cause.js` — reusable shape for whoever measures the other 6 buildings next.

## §MEP_PROXY_PHASE_RECLASS — implemented, measured on all 7 buildings, NOT SHIPPED (2026-08-15)

User: **"U are asked to fix it, not ask me back."** Built the fix named directly above — no more
asking, straight to implement + verify + ship or name why not. It does NOT ship: the classification
work itself is clean, but the FULL pipeline result is a net wash-to-regression, not the predicted win.

**Built exactly as scoped**: one new `SEQUENCE_NAME_OVERRIDES` entry in `viewer/rates.js` (mirrored
into `rates/sequence_rules.json` per §RULES_TABLE_SOURCE) reclassifying MEP-named
`IfcBuildingElementProxy` elements from the class default (Architecture/seq 5) to MEP Rough-in/seq 7,
matching where their correctly-typed siblings already land. **Pattern MEASURED before writing, per
this project's own rule** (same discipline as the furniture override's 327-false-positive catch):
`probe_proxy_carrier_classes.js`'s existing name pattern (`boiler|valve|chiller|pump|ahu|vav|fcu|coil|
tank|compressor|generator|transformer|panel|switchgear|duct|damper|diffuser|grille`) false-matched 39
"10_Stall Panel" bathroom partitions on Hospital via the bare word "panel" — narrowed to
`panelboard|control panel` plus an explicit `(?!.*stall)` guard. Checked clean (zero unexpected hits,
every matched name real MEP equipment) across all 7 buildings: Terminal 30, Hospital 2610, Duplex 0,
HHS 37, Clinic 28, LTU_AHouse 24, JKR 16.

**But the CAPTURED-path result (the full pipeline `probe_captured_floating.js` measures — zones →
per-task window rescale → `_ogSupportSweep` repair → floating census, i.e. what today's §OG_HANG_BAND/
§OG_HANG_WINDOW_BOUND/§GANTT_GAP_CLAMP_SPREAD numbers were all measured against) does NOT match the
raw-generative-schedule prediction:**
```
              floating before -> after   Δ
Terminal      303 -> 304                 +1
Hospital      601 -> 618                 +17 (worse, the reported building)
Duplex        13 -> 13                    0
HHS           44 -> 45                   +1
Clinic        208 -> 206                 -2
LTU_AHouse    488 -> 500                 +12 (worse)
JKR           214 -> 213                 -1
TOTAL         1871 -> 1899               +28 net WORSE, not the predicted ~700-element win
```
3 buildings worse (including the two largest, Hospital and LTU_AHouse), 2 slightly better, 1 unchanged,
1 flat. Confirmed not run-to-run noise: this probe is fully deterministic (Hospital's baseline run
repeated byte-identical, `total=601` both times, `byClass` identical).

**Root cause, traced via Hospital's own class breakdown, not guessed:**
```
before: {Column:14, Footing:463, Beam:76, BuildingElementProxy:44, PipeSegment:2, Slab:2}
after:  {Column:14, Footing:463, Beam:76, PipeSegment:9, PipeFitting:15, BuildingElementProxy:29,
         DuctSegment:2, Valve:8, Slab:2}
```
`IfcBuildingElementProxy` itself DID improve, exactly as predicted (44→29, -15). But moving ~2,610
elements into Hospital's MEP Rough-in zone/task disturbed OTHER, previously-correctly-placed real MEP
elements already living there — `IfcValve` (0→8), `IfcPipeFitting` (0→15), `IfcDuctSegment` (0→2), and
`IfcPipeSegment` (2→9) all newly started floating, a combined +32 that outweighs the proxy population's
own -15. This is the exact side effect the read-only study flagged as unmeasured ("moving 3,197
elements to a later, busier MEP Rough-in crew slot changes crew-demand/duration for that phase") —
confirmed real, and the direction (net worse) wasn't obvious from the raw-schedule reasoning alone.
Terminal and LTU_AHouse show the OPPOSITE micro-pattern (proxy itself gets WORSE, not better — Terminal
40→45, LTU 15→27, with no other class changing) — the per-building zone/window interaction is not even
consistent in direction, only in being real.

**This is the third time this session a change that was correctly reasoned about at ONE layer (a
carrier-search radius, a rescale mechanism, now a classification) produced a different, sometimes
opposite, result once measured through the FULL captured-path pipeline** — the same lesson
§CPM_GENERATOR_UPSTREAM_SPEC already named structurally (`deriveZones`'s coarse task grouping +
the per-task rescale's zero cross-task awareness): a fix applied at any single layer of this
pipeline can't be trusted without measuring it through the whole chain, because the chain has real,
non-obvious cross-population effects. This reclassification is not a display-layer patch like the
other three shipped today — it changes the GENERATIVE classification itself — yet it still shows the
identical failure shape. That is itself informative: the problem is structural (the zone/window/repair
architecture), not something any one well-aimed lever — repair radius, rescale mechanism, or now
classification — can fix in isolation.

**NOT SHIPPED.** `rates.js`/`sequence_rules.json` changes are real, clean, and correctly scoped at the
classification level — kept in the worktree (`/tmp/wt-mep-reclass`, branch
`fix/mep-proxy-phase-reclass`, uncommitted) as a starting point, but not committed or pushed, because
shipping a net +28-worse result on the metric this entire session has been chasing to zero would be
the same mistake as the two ALREADY-rejected repair-layer attempts, just one layer further upstream.
**What would need to be true before this can ship**: either the zone/task grouping needs to account
for a newly-arriving classification's effect on an existing zone's crew-demand/window BEFORE placing
it there (the real, structural fix — same direction as §CPM_GENERATOR_UPSTREAM_SPEC candidate #2), or
the reclassified population needs its own dedicated zone/task rather than merging into the existing
MEP Rough-in one. Neither attempted here — this pass stops at "measured, real, not a good trade,
named precisely" per this project's own rule for honest residuals.

Also fixed in passing, needed to even run the measurement: `probe_captured_floating.js` broke after
today's earlier §MIDAIR_REPAIR_CONTACTGRAPH_DEDUP (bim-ootb PR #1378) — `_midairRepair` now calls
`_contactGraph` instead of inlining it, so the probe's standalone function-slicing needed
`_contactGraph`'s source added alongside `_midairRepair`'s. Fixed in the worktree copy (uncommitted,
same reason as above) — whoever picks this up next should land this one-line probe fix regardless of
what happens with the reclassification itself, it's a real tooling gap, not tied to today's specific
finding.

### Continuation (2026-08-18) — own-phase zone split TRIED, MEASURED, does NOT fix the regression

Tried the fix this section's own "what would need to be true before this can ship" named as one of the
two candidates: give the reclassified population its **own distinct `phase` string** (`'MEP Rough-in —
Equipment'`, `sequence:7` unchanged) instead of sharing `'MEP Rough-in'`, so `deriveZones`'s
`zid = phase + '||' + storey` key (`schedule_gate.js` ~:1018 — `sequence` is not part of the key) puts
it in its own zone instead of merging into the same one as already-correctly-scheduled real MEP
siblings. Worktree/branch unchanged: `/tmp/wt-mep-reclass`, `fix/mep-proxy-phase-reclass`, still fully
uncommitted.

**Files changed** (bim-ootb):
- `viewer/rates.js` — `mep_proxy_phase_reclass` rule's `phase` → `'MEP Rough-in — Equipment'`
  (~:373); new `PHASE_COLORS` entry `'MEP Rough-in — Equipment':'#548235'` (~:426, a darker/olive
  RGB×0.75 shade of the existing `'MEP Rough-in':'#70AD47'`).
- `viewer/rates/sequence_rules.json` — mirrored `phase` change + reason addendum (~:65-68).
- `viewer/ghostglass.js` — `PHASE_HEX` entry `0x548235` (~:19-25), mirrors rates.js.
- `viewer/time_machine.js` — `PHASE_COLORS`/`PHASE_INK`/`PHASE_SHORT` entries (`'#188118'` / `'#ffffff'`
  / `'MEP-E'`, ~:5782-5820, hue-derived not eyeballed — see inline comment + witness below); the
  `_ROW_PHASE_ORDER` no-SEQUENCE_RULES fallback array (~:6194) and the dashboard `PHASE_ORDER` array
  (~:7565), both had the new phase inserted next to `'MEP Rough-in'` — found by grepping every
  `viewer/*.js` for the literal `'MEP Rough-in'` per this task's brief, beyond the 2 spots (`time_machine.js`
  `PHASE_ORDER`, `ghostglass.js` `PHASE_HEX`) the brief already named. Everywhere else that touches phase
  names (`schedule_gate.js`'s zone keying, `schedule_read_4d.js`/`boq_charts.html`'s `phaseOrder()`,
  `schedule_diff.js`'s P6-import matcher, `export_5d.js`'s VO-sheet `voPhase()`) is generic/derived from
  `SEQUENCE_RULES` or keys off `ifc_class` only — confirmed by reading each, none needed an edit.
- `viewer/tests/witness_tier_serial_display.js` — added to the test's own `TIER2` array (~:113) so its
  W-TS-5 concurrency check and §TIER_MOVIE count don't silently undercount the new phase. **Note:** this
  file was deleted from bim-ootb main entirely by PR #1426 (§S20 Part A, 2026-08-17) — this worktree's
  branch point (`4f8a5c5`) predates that PR, so the file still exists here but is already dead on current
  `origin/main` and not present in `gate_4d.sh`'s witness list. Edited for internal consistency of this
  worktree; irrelevant once synced to main.
- Colour choice was MEASURED, not eyeballed: a straight blend between the two existing MEP colours was
  tried first and rejected — they are only 36.7 dE apart (CIE76), so any point on that line is
  geometrically ≤18.4 dE from one of them, short of `witness_gantt_palette.js`'s 30 dE separability floor
  by construction. Grid-searched HSL space instead (hue shifted toward this palette's own MEP-Final hue,
  123° vs MEP-Rough-in's 148° — the two shipped MEP colours were never on the same hue either) for a
  value clearing every gate with real margin. Re-ran `witness_gantt_palette.js` after: **7/7 PASS**, min
  pairwise dE 33.2 (floor 30), min dE to a reserved status hue 60.9 (floor 40), worst label contrast
  5.01:1 (floor 3.0) — log: `/tmp/wt-mep-reclass/_logs/witness_gantt_palette.log`.

**The CAP-path measurement — the actual test of the hypothesis — says the split does NOT fix the
regression.** Real A/B on this exact worktree/codebase, `probe_captured_floating.js`, `§CAP_POST_REPAIR_FLOATING`,
all 7 buildings, `_extracted.db`, deterministic (Hospital re-run twice, byte-identical `677` both times).
"BEFORE" = this worktree exactly as handed off (rule already active, merged into `'MEP Rough-in'` — this
branch does not yet have PR #1382 §OG_HANG_UNBOUND, branched before it, hence these before-numbers equal
that PR's own pre-fix baseline coincidentally). "AFTER" = this session's own-phase split:
```
              merged(BEFORE) -> split(AFTER)   Δ
Terminal      545 -> 532                       -13  (better)
Hospital      643 -> 677                       +34  (WORSE — badly; the reported building)
Duplex         38 ->  38                         0
HHS           143 -> 148                        +5  (worse)
Clinic        413 -> 410                        -3  (better)
LTU_AHouse   1325 -> 1337                       +12  (worse — same magnitude as the ORIGINAL
                                                        rule-off-vs-merged regression, unresolved)
JKR           137 -> 137                         0
TOTAL        3244 -> 3279                       +35  net WORSE — MORE than the +28 this fix was
                                                        supposed to cure, not less
```
Only 2 of 7 buildings improved, 2 unchanged, 3 got worse — including Hospital, the building this whole
reclassification was chasing, whose regression roughly DOUBLED (+17 originally, +34 here). The explicit
success bar this task set ("no building should get WORSE than its current \[merged\] baseline") is
violated by Hospital, HHS, and LTU_AHouse.

**Why, traced via Hospital's own class breakdown (`§CAP_POST_REPAIR_BYCLASS`), not guessed:**
```
merged: {..., PipeSegment:4,  BuildingElementProxy:54, PipeFitting:18, DuctSegment:5,  Valve:0,  ...}
split:  {..., PipeSegment:13, BuildingElementProxy:42, PipeFitting:35, DuctSegment:15, Valve:12, ...}
```
The reclassified population itself DID improve exactly as hypothesized (BuildingElementProxy 54→42,
-12) — giving it its own zone genuinely helps ITS OWN floating count. But `IfcPipeSegment` (+9),
`IfcPipeFitting` (+17), `IfcDuctSegment` (+10) and `IfcValve` (0→12, newly floating) all got WORSE than
under the merged approach — a combined +48 that swamps the -12 win. `§CAP_ZONES` confirms the mechanism
is real, not noise: `n=35 edges=56` (merged) → `n=41 edges=67` (split) — splitting one populous zone
into two sequence-7 siblings adds zones AND cross-zone edges, and `materializeZones`' per-task window
rescale + `_ogSupportSweep` repair interact with that larger graph differently, not obviously "more
isolated". LTU_AHouse shows the opposite micro-pattern from Hospital (BuildingElementProxy itself got
WORSE, 25→37, everything else unchanged) — same as this section's original note that the per-building
zone/window interaction isn't even consistent in direction, only in being real.

Related, smaller finding: `scripts/gate_4d.sh` (`VIEWER_DIR=/tmp/wt-mep-reclass/viewer`) went from the
worktree's own baseline (`pass=6 fail=0 missing=1`, re-verified by stashing this session's edits and
re-running) to **`pass=5 fail=1 missing=1`** — `witness_midair_zero` W-MZ-8 LTU_AHouse's locked joint-
fixpoint TRADE audit constant moved `1561 → 1556` (a DIFFERENT metric than the CAP-path table above —
this is the RAW generative-schedule audit, pre-rescale — so "5 fewer" here is not in tension with
CAP-path LTU_AHouse showing +12 worse; they measure different points in the pipeline). Not touched —
`witness_midair_zero.js`'s locked constant is outside this task's file scope, and re-locking a baseline
for a fix that isn't shipping would be pointless. Logs: `/tmp/wt-mep-reclass/_logs/gate_4d.log`,
`/tmp/wt-mep-reclass/_logs/probe_before/*.log`, `/tmp/wt-mep-reclass/_logs/probe_after/*.log`.

**This is a FOURTH instance of the pattern this section already named**: a change correctly reasoned
about at one layer (classification → now zone identity) produces a different, sometimes opposite,
result once measured through the full captured-path pipeline. **NOT SHIPPED, same as the original
attempt, for essentially the same reason** — the zone/task-grouping + per-task-rescale architecture
itself doesn't isolate crew-demand the way splitting the phase key assumed it would. Code left
uncommitted in the worktree for review (per this task's explicit instruction — implement, measure,
report, don't silently drop it), but the recommendation is: do not ship this either. The two structural
candidates this section already named (upstream zone/window awareness before placing a new
classification, or — now falsified — its own dedicated zone) still leave only the first standing.
Whoever picks this up next should treat "give it its own zone" as a closed, measured-negative branch,
not retry it with a different phase string or sequence number without first explaining why THIS
measurement would come out differently.

## §OG_HANG_UNBOUND — SHIPPED (2026-08-15, bim-ootb PR #1382), the cap-reach decision made and closed

User: "U cannot ask me those questions as i only direct" / "u know the issues" — the still-open
`_ogSupportSweep` hang-reach-cap question from §CARRIER_DEDUP_DERISK_STUDY was decided directly, no
question asked back. **Decision: unbounded**, matching `hangGate`/`_contactGraph`. Reasoning: the 9.5m
cap (§OG_HANG_BAND) was only ever a proxy safety net against finding a bogus, too-far-in-time carrier.
§OG_HANG_WINDOW_BOUND (PR #1376, already shipped) independently guards that exact risk — it refuses
any push that would exit the target's own Gantt task window, by TIME not distance. With that guard
live, the distance cap only hides real carriers.

**Built as a proper two-tier structure, not a flat widen** — on reading `hangGate` in full
(`schedule_gate.js:460-510`), it is itself two-tier: a tight ±0.5m direct-mount band, then (only if
that finds nothing) an unbounded nearest-plane fallback. `_ogSupportSweep`'s hang branch had collapsed
both into one flat band since §OG_HANG_BAND. Restored the same shape: tier 1 = ±GAP band (the ORIGINAL
pre-§OG_HANG_BAND behavior), tier 2 = unbounded nearest-plane search (find the closest real carrier
above, take the latest finish among carriers co-planar with it) — same two-step shape as `hangGate`'s
own fallback, minus its BIG-only restriction (that exists there to bound cost on the full 48,904-
element generative pass; this repair only ever runs on the much smaller floating population).

**Measured, all 7 buildings, real baseline (unmodified main) vs this change:**
```
              floating before -> after   Δ
Terminal      545 -> 436                 -109
Hospital      643 -> 643                  0
Duplex         38 ->  19                 -19
HHS           143 -> 142                 -1
Clinic        413 -> 413                  0
LTU_AHouse   1325 -> 1302                -23
JKR           137 -> 135                 -2
TOTAL        3244 -> 3090                -154 (-4.7%)
```
**Window fidelity byte-identical on every building** — Terminal 99.10%, Hospital 99.97%, Duplex 97.23%,
HHS 99.94%, Clinic 99.98%, LTU 99.94%, JKR 99.76%, unchanged to the decimal. Confirms the design
reasoning exactly: the window-bound guard absorbs the risk, so a wider search can only find MORE real
repairs, never a new violation — the opposite failure shape from every rejected lever earlier today.

Two buildings (Hospital, Clinic) show zero change — the unbounded tier hasn't found anything new for
them specifically; not investigated further this pass, a real but small residual question for later.

Verified: `witness_midair_zero.js` 38/38, `witness_og_guard_bearing_bound.js` 9/9,
`witness_gantt_og_grid_perf.js` 3/3 (including a brute-force O(n²) cross-check on Duplex matching the
new two-tier logic exactly, 0 mismatches; Terminal perf 8.9s, faster than the 10.3s pre-change
baseline, well under the 15s ceiling), `witness_class_fallback_blackbox.js` 8/8, `gate_4d.sh`
pass=7/fail=0/missing=1 (pre-existing, unrelated). `_GANTT_CACHE_VERSION` 24→25, `sw.js`
`CACHE_VERSION` v1035→v1036.

**NOT part of this PR**: the full 3-way shared-scan-primitive merge (`hangGate`/`_contactGraph`/
`_ogSupportSweep` sharing one implementation — the other half of §CARRIER_DEDUP_DERISK_STUDY's
candidate #3). Reading `hangGate` directly revealed it's harder than the study characterized: it's a
closure tightly embedded in `computeSchedule`'s single-pass placement loop (shared mutable grid/
iteration state, returns a scalar latest-finish-time), while `_contactGraph`/`_ogSupportSweep` are
standalone post-hoc full-population scans returning per-element contact lists — a bigger structural
mismatch than "one shared primitive parameterized per site." This PR closes the actual behavioral gap
(the unbounded-vs-capped divergence, the real bug) without forcing that harder, riskier file-spanning
merge into the same change. Worktree `/tmp/wt-carrier-dedup-refactor`, branch
`refactor/carrier-dedup-unbounded-hang`, left in place.

## §CROSSTASK_JUDGE_PARITY — SPEC (2026-08-16, session start — user go: "Do solve the gantt chart
## items not constructed in order, hanging in mid air, not following as TimeMachine needle")

**Target**: the 3090 residual captured-path floating (the chase-to-zero metric), via the item-1
structural direction (§CPM_GENERATOR_UPSTREAM_SPEC candidate #2 territory) — but measured-first,
smallest-safe-lever-first, per this file's own repeated lesson (three levers correctly reasoned at one
layer, wrong through the full pipeline).

**Root-cause frame (from code read, not guessed)**: the judge (`_contactGraph`/`floatingCensus`) is
class-blind and pool-blind; the repair (`_ogSupportSweep`) pushes only past a NARROW carrier pool
(seq<=4 ∪ promoted slabs, walls for promoted slabs) and refuses window-exiting hang pushes. So three
distinct populations can never be repaired and sit in the 3090 forever:
 (a) elements whose only real contacts are OUTSIDE the repair pool (fitting on a proxy, tread on a
     stringer — the exact §MIDAIR_REPAIR (a)-population, but on the captured path);
 (b) window-refused hang repairs (honest floating today);
 (c) grounded seq<=4 carriers (IfcFooting) whose every contact merely STANDS ON THEM — the judge's
     carrier-above clause is geometrically identical for "S stands on T" and "T hangs from S", so a
     footing correctly built FIRST is counted floating. Census-artifact hypothesis, to be verified.

**Step 1 — residual decomposition probe (read-only, extend `probe_captured_floating.js`, do not
rewrite)**: classify every post-repair floating element on all 7 buildings along two axes:
 - reachability: first-contact start + own dur fits own task window (REACHABLE) vs not
   (WINDOW_BLOCKED) vs element already out of window (ALREADY_OUT);
 - role: GROUND_CARRIER (grounded && seq<=4 && ALL contacts stand on top: S.bz >= T.tz - GAP) vs rest;
 - pool: first contact's class inside vs outside `_ogSupportSweep`'s carrier pool.

**Step 2 — EXP4, window-bounded judge-parity pass (probe-side experiment before any shipped code)**:
after `_ogSupportSweep`, fixpoint-sweep the EXACT judge rule, window-bounded: for each floating T
(first-contact start `first` > T.s+1), push T.s -> first (dur preserved) ONLY if resulting T.e <= its
own task window end; never push elements already out-of-window further out. Monotone-later pushes,
bounded sweeps, terminates. This is §MIDAIR_REPAIR's already-blessed weakest rule ("an element may not
appear before the first element it physically touches appears") ported to the captured path WITH the
§OG_HANG_WINDOW_BOUND discipline the 2026-08-13 rejected swap lacked (that swap's failure was
exactly window-crossing desync; the window clamp removes that failure mode by construction).

**Accept criteria (all 7 buildings, full pipeline, §-logs saved and read)**: total floating strictly
down; window fidelity per building unchanged-or-better (guaranteed by the clamp, verify anyway);
maxShiftDays sane (no 100-300d class); no orphan/grounded count change (judge untouched). Ship =
`time_machine.js` insertion after `_ogSupportSweep(_allScheduled, _cap.win)` + witnesses + cache
bumps. The (c) footing/census-role question is NOT decided in this pass — measured and reported only;
weakening the judge needs its own explicit decision.

## §CROSSTASK_JUDGE_PARITY — BUILT + MEASURED + SHIPPED (2026-08-16, bim-ootb PR #1387)

Executed exactly per the SPEC above, same session. Worktree `/tmp/wt-crosstask-repair`, branch
`fix/gantt-crosstask-judge-parity`.

**Step 1 — residual decomposition, measured (probe extension, all 7 buildings, logs in this
session's scratchpad `cjp_*.log`):** the 3090 splits as REACHABLE 2437 / WINDOW_BLOCKED 653 /
ALREADY_OUT 0. groundCarrier (grounded seq<=4 carriers whose every contact merely stands on them —
the role-blind carrier-above clause) = 966 total, dominated by Hospital's 458 IfcFooting exactly as
item 3 predicted — they are REACHABLE, not census artifacts needing a judge change (the generative
path's own §GROUNDED_OVERRIDE_FIX doctrine already treats them as pushable, so parity pushes them
too — no judge weakening, question CLOSED without a rule change). First-contact pool: 1777 in-pool /
1313 out-of-pool — confirming the pool-mismatch hypothesis as a real driver (LTU: 951/1302 floating
had an out-of-pool first contact).

**Step 2 — `_cjpJudgeParity` shipped** (`time_machine.js`, called immediately after
`_ogSupportSweep(_allScheduled, _cap.win)`): §MIDAIR_REPAIR's weakest rule (push to first-contact
START, monotone-later, fixpoint ≤16 sweeps) with the §OG_HANG_WINDOW_BOUND clamp — push lands only
if the whole span stays inside the element's OWN task window; already-out elements never pushed
further; refused pushes stay honestly floating. Probe's §EXP4 now SLICES THE SHIPPED FUNCTION
(no fourth copy — §CARRIER_DEDUP_DERISK_STUDY's drift lesson applied).

**Measured, all 7 buildings, shipped slice, full captured pipeline:**
```
              floating before -> after     Δ
Terminal      436 -> 201                  -235
Hospital      643 ->  39                  -604
Duplex         19 ->   7                  -12
HHS           142 ->  36                  -106
Clinic        413 ->  72                  -341
LTU_AHouse   1302 -> 230                  -1072
JKR           135 ->  71                  -64
TOTAL        3090 -> 656                  -2434 (-78.8%)
```
**Window fidelity byte-identical on every building** (Terminal 99.10, Hospital 99.97, Duplex 97.23,
HHS 99.94, Clinic 99.98, LTU 99.94, JKR 99.76 — in/out counts unchanged to the element).
Orphans/grounded counts untouched on every building — the judge itself was never modified.
maxShiftDays largest: LTU 244.4, Hospital 193.4 — large but ALWAYS inside the element's own task
window by construction (wide Substructure windows), so the 100-300d failure of the rejected
2026-08-13 unbounded swap (window-CROSSING desync) is structurally impossible here.

**Witnesses:** NEW `witness_crosstask_judge_parity.js` 17/17 (W-CJP-1 wiring, W-CJP-2 strict
reduction, W-CJP-3 window safety both as moved-element invariant and in/out-count identity,
W-CJP-4 monotone, W-CJP-5 judge untouched, W-CJP-6 synthetic non-vacuousness + honest-residual).
`witness_midair_zero.js` 38/0, `witness_og_guard_bearing_bound.js` 9/9,
`witness_gantt_og_grid_perf.js` 3/3 (Terminal 9958ms < 15s ceiling),
`witness_class_fallback_blackbox.js` 8/8, `gate_4d.sh` pass=7 fail=0 missing=1 (pre-existing
witness_arch_area_weight MISS, unrelated). `_GANTT_CACHE_VERSION` 25→26, `sw.js` v1038→v1039,
`viewer.html` time_machine ?v=67→68. One-time cost of the pass at injectGantt: LTU (largest, 122k elements) ms=2366, Duplex ms=26 — contact-graph build dominates. Also landed: the probe's §MIDAIR_REPAIR_CONTACTGRAPH_DEDUP
slice fix (from /tmp/wt-mep-reclass, was uncommitted) + the §CJP decomposition instrumentation.

**Residual 656 = WINDOW_BLOCKED (653) + fixpoint stragglers (3)** — every one is a real cross-task
authoring conflict (the dependent's own task window closes before its first contact even starts).
That is exactly §CPM_GENERATOR_UPSTREAM_SPEC candidate #1/#2 territory (task grouping/window
authoring), now cleanly isolated: the repair layer is DONE — no further repair-side lever exists
that doesn't fabricate dates outside the single source of truth. Next lever for the chase-to-zero
is upstream window authoring, nothing else.

## §CHASE_TO_ZERO_WINDOW_AUTHORING — SPEC + EXP5 ARCHIVED (closed: resolved by §ZONE_DISPLAY_AUTHORING, kept below)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** The original spec and the EXP5 measurement run, whose two candidate levers were both REJECTED fleet-wide; the thread was then resolved a different way by §ZONE_DISPLAY_AUTHORING (PR #1390), which is retained in full immediately below. Rejected-candidate numbers: `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`.

### §CHASE_TO_ZERO_WINDOW_AUTHORING — RESOLVED VIA §ZONE_DISPLAY_AUTHORING (2026-08-16, bim-ootb PR #1390)

**The user's live Hospital log invalidated every prior probe model** — the probe fed the captured
rescale from computeSchedule's RAW times, but the browser feeds it kernel_ops timestamps carrying
the TWO-TIER DISPLAY timeline (§TIER_SERIAL 420d vs raw-window 334d on Hospital). Live tell:
browser §PHASE_OVERLAP_SUPPORT_GUARD pushed=4117 vs the raw-fed probe's 1152. Rebuilt the probe on
witness_midair_zero's display-timeline slice recipe (§EXP6 = browser-faithful today): REAL fleet
floating was **2741** (LTU 1617, Hospital 664) with 15,420 out-of-window — far worse than the
raw-fed model's 656/113. The user's "still lots of floating" was right; the probe was wrong. Also
answered from the same log: the "aborted" bake was a manual cancel of a 49-min ETA
(§MAXQ_START_REVISED 777→2230 frames × perFrameMs=1320 of per-frame §STILL_REFINE+§PHOTO_AO churn —
mp4 stops at frame ~105; separate lane, not chased here).

**EXP5 family verdicts (all measured, full pipeline):** EXP5a (bar-end extension fixpoint) —
rejected, extension chases its own rescale stretch, fidelity wrecked on 3 buildings (though LTU
converged to literal 0 — the hint that led onward). EXP5b (windows from midair-repaired RAW) —
rejected, EXP3's distortion persists under parity (Hospital 39→137 in the old model). EXP7 (windows
from the FULL display timeline) — floating 664→79 on Hospital but §EXP7 showed _ogSupportSweep
pushing 24,573 elements (1781 out of their bars): the sweep enforces the STRICT end-bar that
§MIDAIR_REPAIR's header deliberately does NOT enforce on the display timeline. EXP8 (display
windows + NO sweep + parity only) — the winner: fleet floating 2741→265 (-90%), out-of-window
15420→113 (-99.3%). Clinic is the one mixed cell (60→91 floating, all honest WINDOW_BLOCKED, its
fidelity improves 8→4) — named follow-up.

**Shipped (§ZONE_DISPLAY_AUTHORING):** materializeZones opts.displayRemap ← time_machine's new
_tmDisplayRemap (wraps the SAME _twoTierRemap+_midairRepair the kernel_ops path runs — one physics);
schedules.display_authored flag (guarded ALTER, named-column INSERTs); captured overlay skips
_ogSupportSweep iff display_authored=1 (imported/legacy keep it), _cjpJudgeParity always runs and
now logs floating=/windowBlocked= (live census — every session reports its own truth from now on);
inline rescale extracted as named _capWindowRescale (sliceable, kills future copies). All 3
materializeZones call sites wired. _GANTT_CACHE_VERSION 26→27, sw v1042, time_machine ?v=69,
schedule_author ?v=13. NEW witness_zone_display_authoring.js 14/14; full suite + gate_4d green
(same pre-existing MISS).

**Chase state after this ship: 265 fleet-wide (browser-faithful model), every one an honest
WINDOW_BLOCKED cross-task authoring conflict or fixpoint straggler. Next levers, in order:**
1. Clinic's +31 regression — why does display-window authoring strand MORE weak-bar floating there.
2. The remaining 265: mostly small per-building counts (27/63/3/11/91/43/27) — per-task decomposition
   via §CJP_DECOMP on the EXP8 pipeline, then either coverage rounding (floor/ceil day edges) or a
   per-task minimal end-nudge (NOT the rejected EXP5a global fixpoint — one bounded pass, measured).
3. Verify LIVE: user reloads (sw v1042), regenerates Hospital — §CROSSTASK_JUDGE_PARITY line now
   prints floating=N windowBlocked=M; compare against §EXP8's 63.

## ⛔ §STOREY_ORDER_REPORT — user report at session close (2026-08-16), NOT investigated. NEXT SESSION START HERE

User, closing the §ZONE_DISPLAY_AUTHORING session (verbatim): **"will put the prompt to a new
session to chase remaining 265. I noticed the storey by storey build up is not adhered to."**

Two open threads for the next session, in order:
1. **Storey-by-storey adherence** — corroborating evidence already exists: the aborted-bake frame at
   Day 17/387 showed a "Level 4 ≈ Hall/Corridor" gaze caption with L4 slabs visible while lower
   storeys were barely started. Suspects, most-likely first, none verified:
   (a) `_cjpJudgeParity` is storey-blind — its window-bounded pushes (maxShiftDays 47-193d) can move
       a LOWER-storey element later than upper-storey ones inside wide task windows;
   (b) §GANTT_GAP_CLAMP_SPREAD redistributes elements evenly inside each (phase,storey) bar, and
       bars for different storeys of the same phase OVERLAP — even a correct per-bar spread can
       interleave storeys in wall-clock time;
   (c) the two-tier DISPLAY timeline itself (now also the window-authoring source via
       §ZONE_DISPLAY_AUTHORING) — §TIER2_PER_ELEMENT_CLAMP is documented non-order-preserving;
   (d) §4D_BAND_MONOTONIC gates the RAW schedule per phase — check whether its ladder survives the
       display remap + overlay at all (a §-probe: per-storey p10/p50 start days on the FINAL overlay
       times, EXP8 pipeline, is the cheap first measurement — extend probe_captured_floating.js).
   The FUNDAMENTAL LAW applies: prove/disprove with per-storey start-time series from the probe (and
   the live §CROSSTASK_JUDGE_PARITY census line), never from the movie visually.
2. **The remaining 265** (§EXP8 fleet: Terminal 27, Hospital 63, Duplex 3, HHS 11, Clinic 91, LTU 43,
   JKR 27 — all honest WINDOW_BLOCKED) + Clinic's +31 anomaly — see the "next levers" list at the end
   of §CHASE_TO_ZERO_WINDOW_AUTHORING directly above. A storey-aware constraint inside
   `_cjpJudgeParity`/the window authoring may solve threads 1 AND 2 together — measure before building.

Live verification pending from the user: reload (sw v1043) → open Hospital → read
`§CROSSTASK_JUDGE_PARITY ... floating=N windowBlocked=M` (predicted ≈63) — first session-log census
since the line shipped in PR #1390.

## §STOREY_ORDER_REPORT MEASURED (2026-08-16, next session) — corruption localized to `_twoTierRemap`

Thread 1 of the handoff above, chased per its own named cheap-first-measurement: extended
`probe_captured_floating.js` with a reusable `storeyOrderReport()` helper (bim-ootb PR #1392,
diagnostic-only, no production code touched, auto-merge queued) — storeys ordered by REAL mean
`base_z` (never invented), p10/p50 start-day per storey, a monotonicity check across that real
elevation order. Run at 5 pipeline stages so the corrupting stage is directly locatable:
**RAW → POST_REMAP (`_twoTierRemap`) → DISPLAY (post `_midairRepair`) → PRE_PARITY (post
window-authoring+rescale) → FINAL (post `_cjpJudgeParity`)**.

**Fleet result — `_twoTierRemap` is the corrupting stage in every building measured** (collapsed-Level
granularity, `violations/pairs` — a p50 that goes backward vs the storey below it):

| Building | RAW | POST_REMAP | DISPLAY | PRE_PARITY | FINAL |
|---|---|---|---|---|---|
| Clinic | **0/6** (clean) | 2/6 (+86d) | 2/6 | 1/6 (-53d) | 1/6 |
| Hospital | 1/7 (tail only, 233d) | 3/7 (258d) | 3/7 | 3/7 (74d) | 3/7 |
| Terminal | 7/21 (106d) | 10/21 (99d) | 12/21 | 12/21 (95d) | 12/21 |
| LTU_AHouse | 10/17 (610d, messy building) | 9/17 (633d) | 8/17 | 9/17 (343d) | 9/17 |

Clinic is the cleanest signal: RAW is a **perfect 0 violations** — §4D_BAND_MONOTONIC's ladder genuinely
holds in the generative schedule. `_twoTierRemap` alone introduces the break (0→2). Window-authoring,
rescale, and `_cjpJudgeParity` (the stages the original 4 suspects (a)/(b) named) leave the violation
COUNT flat-to-improving on 3/4 buildings — they are not the primary cause. Suspect (d) (RAW ladder) is
mostly cleared too — RAW holds well on the simple towers (Clinic, Hospital-except-tail), only LTU's
already-irregular multi-level layout is messy at RAW itself.

**Mechanism, traced to individual elements on Hospital** (`§STOREY_ORDER_L1_DIAG`/`§STOREY_ORDER_L1_BYPHASE`):
Level 1's median start balloons from day 52 (RAW) to day 342 (post-remap), vaulting past every storey
above it. Cause: `_tier1Serialize` applies a **uniform per-zone shift** to Level 1's own Architecture
phase (+178d flat, all 1781 items) because Level 1's own Superstructure phase doesn't finish early
enough in the RAW schedule to satisfy the "ARCH/STR out of the way first, same floor" contract
(§TIER2_AFTER_TIER1's own documented rule — this part is working as designed). That shifted Architecture
end then becomes `t1EndZ['Level 1']`, and `§TIER2_PER_ELEMENT_CLAMP` clamps EVERY Tier-2 element in that
zone to start no earlier than it — which lands on **5145 of Level 1's 8693 elements (59%, mostly MEP
Rough-in)**, pushed +290–304d flat. MEP Rough-in dominates Level 1's population, so it drags the whole
storey's median past Levels 2–6.

**So the real question is one level deeper than any of the 4 original suspects: why does Level 1's OWN
Superstructure phase straggle late enough (relative to its own Architecture package's original start) to
trigger the Tier1Serialize shift in the first place?** That's a generative-schedule / crew-allocation
question inside `schedule_gate.js`'s `computeSchedule` (are Superstructure crews resource-shared across
ALL storeys such that Level 1's own structural package doesn't finish first even though it's the ground
floor?) — NOT a display-layer patch, and not attempted this session: it needs its own per-storey
Superstructure-completion-vs-crew-cap measurement before any fix, per Spec-First. Named as the next lever.

**Not yet touched:** thread 2 (the remaining 265, Clinic's +31) — still open, see the "next levers" list
above this block. The two threads may or may not share a fix; this session's measurement says the storey
thread's root is upstream in `_twoTierRemap`/`computeSchedule`, not in the window-authoring/parity layer
thread 2 lives in — treat them as separate until a shared cause is actually measured, not assumed.

## §TIER1_PER_ELEMENT_CLAMP EXP — ARCHIVED (closed: measured and REJECTED fleet-wide)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** A per-element clamp on the Tier-1 storey-order thread, built and measured then rejected across the fleet (the storey-order thread needs a THIRD mechanism, still named-not-built in §STOREY_ORDER_REPORT above). Cited elsewhere only as rejected-experiment precedent; measurements: `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`.

## §CJP_DAY_ROUNDING_TOL SHIPPED (2026-08-16, same session, user: "tackle the Thread 2") — fleet floating 265 → 133 (-49.8%)

**Built the named next step: per-task decomposition via a new `§CJP_DECOMP_EXP8` probe instrumentation**
(distinct from the older `§CJP_DECOMP` block, which runs on the superseded EXP1 raw-fed pipeline, not
EXP8) — for each still-floating element on the FINAL (post-`_cjpJudgeParity`) EXP8 overlay, names its
task, that task's window, and the exact gap (days by which pushing it to its real first-contact would
overrun the window's authored end).

**Finding: most of the "remaining 265" was never a real task-authoring conflict — it was sub-day rounding
noise.** A task window's end is already rounded to a whole day (`materializeZones`:
`Math.round((z.end-minStart)/86400000)`), but `_cjpJudgeParity`'s `WINDOW_BLOCKED` check compared that
rounded boundary against an element's exact-millisecond real end with ZERO tolerance. Clinic — the
"+31 anomaly" building — was the extreme case: **90% of its 91 residual (82 elements) had `avgGapDays`
under 1**, dominated by one group of 38 `IfcFooting`s (`TASK_Substructure_First_Floor`, avgGapDays=0.1,
maxGapDays=0.1) sitting on a 4-day window. Hospital was mixed: 5 near-zero-gap elements alongside a real
genuinely-undersized-window population (`TASK_Superstructure_Level_2`: n=19, avgGapDays=52.4 on an
11-day window — correctly still WINDOW_BLOCKED, not touched by this fix).

**Fix (`viewer/time_machine.js` `_cjpJudgeParity`):** allow a push whose result lands within ONE DAY past
the window's rounded end (`_CJP_DAY_TOL`) — the window's own rounding quantum, not an invented fudge
factor. Applied to both the push-eligibility check and the live-census `windowBlocked` label for
consistency. Genuinely undersized windows (gaps of many days) are completely unaffected.

**MEASURED fleet-wide (`probe_captured_floating.js` §EXP8_FINAL, all 7 buildings), zero regressions
anywhere:**

| Building | Before | After | Δ |
|---|---|---|---|
| Terminal | 27 | 18 | -9 |
| Hospital | 63 | 51 | -12 |
| Duplex | 3 | **0** | -3 (closed) |
| HHS_Office_Federated | 11 | **0** | -11 (closed) |
| Clinic | 91 | 9 | -82 |
| LTU_AHouse | 43 | 30 | -13 |
| JKR | 27 | 25 | -2 |
| **Total** | **265** | **133** | **-132 (-49.8%)** |

Best single fix of the whole chase-to-zero campaign so far by raw count, and the first with a completely
clean fleet result (every building improved, two closed outright).

**Trade-off, explicitly bounded and tested:** a pushed element can now land up to a day past its window's
exact edge (previously required to land byte-inside). This is NOT the same risk class as the 2026-08-13
unbounded `_midairRepair` swap that was REJECTED for 100-300d desync — it's bounded by construction to
the window's own rounding granularity. `viewer/tests/witness_crosstask_judge_parity.js` W-CJP-3's old
"in/out-window counts byte-identical" claim was updated to a bounded-desync claim (never more than 1 day
past window, asserted per-element) — same "not order-preserving, safety net still runs after" pattern
`§TIER2_PER_ELEMENT_CLAMP` already established elsewhere in this file. New synthetic W-CJP-6 cases test
the boundary directly (0.5d overrun IS pushed and lands exactly on the real gap, never more; 3d overrun
stays honestly WINDOW_BLOCKED). 30/30 + 20/20 assertions pass across Duplex/HHS/Clinic/Hospital/Terminal/
JKR. Shipped: bim-ootb PR #1395.

**Not yet closed:** 133 elements remain, now overwhelmingly the GENUINE case (real multi-day gaps against
real undersized windows — Hospital's Superstructure-per-level population is the clearest example). That's
the actual `§CPM_GENERATOR_UPSTREAM_SPEC`-territory problem the original handoff named — a per-task
minimal end-nudge (bounded single pass, not the rejected EXP5a global fixpoint) is still the next lever,
now on a much smaller, cleaner population with the rounding noise gone. Clinic's "+31 anomaly" is
resolved by this fix alone (91→9) — no longer needs separate investigation.

## ▶ NEXT SESSION START HERE (2026-08-16) — ARCHIVED (superseded: stale resume pointer)

> **ARCHIVED 2026-08-27 — moved out of this file, not deleted.** A resume pointer superseded by everything from §S63 onward (2026-08-22 → 2026-08-26) and by `prompts/4D_SCHEDULE_ARCHITECTURE_REDESIGN.md`; its own closing words already called its contents "settled history, not an active task list". Text: `prompts/archive/4D_SCHEDULE_PERFECTION_archived_2026-08-27.md`.

---

## §S63 — Terminal's floating tail 8 → 12: BISECTED, ISOLATED, MEASURED, RE-LOCKED (2026-08-22)

**Separate thread from the ▶ NEXT SESSION block above** (that one is the window-authoring lever; this
one is the `witness_tm_geo_order_cycles` drift `prompts/SCRIPT_LENGTH_REFACTOR_SEAMS.md` handed over).
Measurement session, no scheduler code changed. Shipped: **bim-ootb PR #1470** (tests + one baseline
JSON only, zero product-code lines — no `sw.js` bump applies).

### The question
`witness_tm_geo_order_cycles.js` locks Terminal's floating tail at 8 (`W-TMREPRO-5`, set 2026-08-10 by
#1276). The witness was DEAD 9+ days on a stale-slice crash; §S62 (#1459) revived it and it immediately
reported **12**, cycles=0. Either the lock was stale or something regressed. Nobody had checked.

### 1. Bisect — 18 runs, one variable
The witness itself was held at HEAD; only `viewer/{schedule_gate,time_machine}.js` +
`viewer/rates/sequence_rules.json` were swapped to each commit that ever touched `schedule_gate.js`
since the lock was set (`268a85f..HEAD`). Every run against the real `Terminal_extracted.db`, n=48428.

| range | floating |
|---|---|
| `268a85f` (#1276, lock set) → `2463ff1` (#1333) — 11 commits | **8**, constant |
| `a2c30ee` (#1345) → `HEAD` (`6ec0dcc`) — 7 commits | **12**, constant |

No gradual drift, no flapping: one step, at **`a2c30ee` = #1345 §STAIR_FLIGHT_GRID_VISIBILITY**.

### 2. Isolate — one file, not two
Over the `2463ff1` tree, swapping **only** `a2c30ee`'s `schedule_gate.js` gives **12**; swapping **only**
its `time_machine.js` gives **8**. The change is entirely inside `schedule_gate.js`.

### 3. What actually moved (numbers, not narrative)
The 4 added floaters are **all `IfcStairFlight`** (the original 8 are the same 8 thin promoted roof
slabs at `base_z=30.568`, unchanged). Taking flight `...UjZp` (`base_z 18.892 → top_z 20.864`):

- It has **zero bearing-below supports** in `auditFloating`'s pool, so it is audited on the **hang**
  path against the landing above it: `IfcSlab seq=4 @20.864` + 2× `IfcMember seq=3 @20.564`.
- On the **scheduler** side the same pair runs the *other way*. #1345 added `isStairFlight()` to the
  scheduler's support pool (now `supportPool()`, `schedule_gate.js:1246`), and `geoGate`'s `below`
  predicate has **no top-proximity bound** — so the flight, whose base is 1.7 m under them, is now a
  gating support *for* those carriers. Measured: carrier `...UjXu` starts day **1.1083**, which is
  exactly the flight's end day **1.1083**; its next candidate down ends day 0.3139.
- Pre-#1345 those carriers finished day **0.25** and the flight started day **1.15** — 0.89 d clear.
  Now the flight starts **0.01 d (~14 min)** before its audited carrier ends → flagged.

`auditFloating` was NOT changed by #1345 — its `structGrid` still admits `seq<=4` or promoted `IfcSlab`
only (`:1076`). #1345's own commit message says mirroring flights into it was tried and **reverted**
because it surfaced an unrelated `_twoTierRemap` weakness.

### 4. Would that mirror have fixed it? Measured: NO
Re-ran the reverted change (add `IfcStairFlight` to `auditFloating`'s `structGrid`): Terminal stays at
**floating=12, same composition**. It cannot help — the flights fail on the HANG path, and admitting
flights as *candidates* does not remove the members above from the hang scan.

### 5. Verdict + what shipped
**The lock was stale, and the +4 is an audit/scheduler asymmetry, not a physics regression** — one pair
of elements where the scheduler says "the member bears on the flight" and the audit says "the flight
hangs from the member", with a rounding-scale 0.01 d deficit. Re-locked, not absorbed:
`W-TMREPRO-5` now locks **12**, and a new `W-TMREPRO-5b` locks the **class composition**
(`IfcSlab:8,IfcStairFlight:4`) so a swap that keeps the count still reddens.

Proven red (3 perturbations, each restored): pre-#1345 `schedule_gate.js` → `got 8` / `IfcSlab:8`;
`isStairFlight → false` at HEAD → same; pre-fix `edgeContained` → `cycles=38254`, `floating=50`,
`IfcColumn:8,IfcMember:30,IfcSlab:8,IfcStairFlight:4` (all three assertions red at once).

Incidental find while proving `W-TMREPRO-4`: the lower-half `contained` rule exists **twice** —
`geoGate`'s inline clause (`:540`) and `edgeContained` (`:793`). Only the second feeds the reported
cycle count, so perturbing the first cannot redden `W-TMREPRO-4`. Not a defect today (they agree), but
it is the same duplicate-rule shape §S26.2 lifted `supportPool()` out of. Named, not chased.

### ⛔ OPEN (named here, deliberately NOT fixed in a measurement session)
**The scheduler/audit support asymmetry on stair flights.** `geoGate`'s `below` has no top-proximity
bound while `auditFloating`'s bearing test requires `S.top_z >= T.base_z - GAP`, so a tall element can
be a *scheduling* support for something it is not an *audit* support for — and simultaneously be
audited as hanging from it. The 4 flights are the measured instance. Any fix must be measured
fleet-wide (7 buildings) before it is trusted, and re-locking `W-TMREPRO-5`/`5b` is part of it.

---

## §S64 — the §S63 open item, studied fleet-wide: it is TWO defects, not one (2026-08-22)

**SHIPPED as bim-ootb PR #1472 (merged `d29acf0`) — C1 and C3 below are live; C2 stays rejected.**
Written as a study first; this line added on close. User steer this session: *"it must not
regress the fundamental basics already well laid for 4D generics. Allow 5% midair towards the end or
within well formed ARCH."* Both proposals below are **audit-only** — they change zero schedule times,
so no 4D generic can regress by construction. Probe: `scripts/probe_support_asymmetry.js` (new, reads
only). Logs: `scratchpad/s64/*.log`.

### Fleet baseline
462 floating across 7 buildings / 266,443 elements = **0.17%** — already an order of magnitude under
the 5% bar the user set. Midair (`W-MZ-2`, a different and stricter judge) is likewise under it
everywhere: Terminal 684/48,428 = 1.4%, Clinic 422/16,071 = 2.6%, Hospital 0.34%, Duplex/HHS/LTU/JKR 0.

### The decomposition (every floater attributed to a named predicate)

| class | n | share | what it is |
|---|---|---|---|
| **cycle fallback** | **350** | 76% | JKR + LTU_AHouse only. NOT an asymmetry. |
| **A3b** wall-above-bound | 73 | 16% | audit's `wallGrid` bearing is unbounded at the top; the gate's is not |
| **A1** `tPool` not mirrored | 17 | 4% | the §S63 instance, generalized |
| **A4** hangNearest/none | 13 | 3% | untriaged |
| **A2** hang carrier | 9 | 2% | untriaged |

### Finding 1 — the biggest class is not the audit at all, it is §SUPPORT_CYCLE
350 of the 462 are **scheduler self-contradictions**: the element starts before its OWN `geoGate`
`below` support ends, at final times. `computeSchedule`'s `§DEQ_REPAIR` fixpoint is supposed to make
that impossible. Measured membership, not inferred: **350 of 350 are in the `§SUPPORT_CYCLE` fallback
set** (JKR 80/80 of 4,564 cycles; LTU_AHouse 270/270 of 25,708). Kahn cannot order a cycle member, so
it falls back to seq order and `geoGate` cannot see a support that has not been placed yet. Every
building with `cycles=0` has **zero** self-contradictions (Terminal 0/12, Hospital, Duplex, HHS 0/9,
Clinic 0/1). This is upstream modelling geometry, already named and deliberately not resolved
(no-invent: a true geometric cycle is a MODELING fact). **Do not chase it in the audit.**

**REJECTED candidate C2** — extend the `§DEQ_REPAIR` loop to re-check PASS-A (`seq<=4`) too. Measured:
LTU_AHouse floating 360 → **1139**, JKR 80 → **159**, `§DEQ_REPAIR sweeps=16` (the cap — no fixpoint)
with 56,948 / 42,141 shifts, and 348/78 self-contradictions still standing. PASS-A elements chase each
other through `geoGate`'s unbounded `below` on a cycle-laden model and never converge. Do not retry it.

### Finding 2 — the real asymmetry is two lines in `auditFloating`, both audit-only

**C1 — `tPool` never mirrored `hangGate`'s `elPool`.** `hangGate` uses
`elPool = isPromotedSlab(el) || isStairFlight(el)` (`:611`); `auditFloating` still uses
`tPool = T.cls === 'IfcSlab' && T.seq > 4` (`:1106`) — whose own comment claims it "mirrors the
scheduler's hangGate pool rule, so audit and scheduler agree". It stopped mirroring at #1345. So a
stair flight is refused a hang-carrier by the scheduler and given one by the audit. Fix = add
`|| T.cls === 'IfcStairFlight'`. Measured fleet 462 → **435**.

**C3 — the audit's `wallGrid` bearing has no upper bound.** `wallGate` (`:684`) and the DAG's
`wallCarries` (`:797`) both require `S.top_z <= T.base_z + GAP` — the §TM_GEO_ORDER_CYCLES carry-at-top
rule. `auditFloating` offers `wallGrid` to a promoted slab with only `S.top_z >= T.base_z - GAP`, so a
wall whose crown rises metres past the slab's underside counts as audit-support the scheduler never
gated on (Terminal: `IfcWall` top 37.06 vs slab base 30.57; LTU: 10.80 vs 8.60). Fix = apply the same
bound in the audit's wall pool. Measured fleet 462 → **389**.

**C1 + C3 together: 462 → 362.** Per building: **Terminal 12 → 0**, Clinic 1 → 0, HHS 9 → 5,
LTU_AHouse 360 → 277, JKR 80 → 80, Hospital/Duplex 0 → 0. Everything left is the cycle residual (350)
plus A2/A4 (12).

### Non-regression, measured (this is the user's constraint, checked not assumed)
Zero schedule times change — both fixes are inside `auditFloating`, which no gate reads.
- `W-MZ-2` **midair unchanged on all 7** · `W-MZ-4` orphans unchanged · `W-ZDA-4a/4b` 18/0 green.
- `W-MZ-8 float_after_cpm` moves DOWN on 3: HHS 889→884, LTU_AHouse 5023→4998, JKR 1222→1212.
- `W-TMREPRO-5` Terminal 12 → **0** (and its composition empties).
- `W-BIGSUP-*-5` `unchecked` moves UP by exactly the elements that stopped getting a false carrier:
  Terminal 32→36, HHS 13→17, LTU_AHouse 611→626. **This is the honest trade**: a stair flight with no
  modelled support below it becomes a named `§SUPPORT_UNCHECKED` warn (warn-only, never a gate)
  instead of a false "floating" verdict. No gate is weakened; three baselines need re-locking with
  this as the named cause.

### ⛔ Still open after this study
- **A2 (9) and A4 (13)** — untriaged. HHS `IfcFlowSegment` ×4, LTU `IfcStair` ×5 / mixed ×13.
- **JKR + LTU_AHouse cycle counts** (4,564 / 25,708) — the real remaining cost, and an EXTRACTION /
  modelling question, not a scheduler one. Terminal proved cycles can go 37,927 → 0 with a geometry
  rule (§TM_GEO_ORDER_CYCLES); nobody has done that analysis for these two.

---

# 🏁 §MILESTONE — 4D SCHEDULE GENERATION + TIME MACHINE BUILDUP: SOLVED (2026-08-22)

**User's call, this session:** *"we also mark a strong line that the present 4D schedule generating
and build up in Time Machine is solved to 95%+ success"*, and the two failure modes named as gone:
> *"the 2 hellish situations are not happening anymore: 1. Gantt Chart overstacked, 2. midair,
> non-correlation between bars and needle movement."*

This block draws that line. **Scope is GENERATION + BUILDUP. The EDIT path is a separate feature and
is NOT covered by it** — see §S67 and `4D_GANTT_TM_REFACTOR.md`.

### The measured backing (95%+ was the bar; these are the actual numbers)
Fleet = 7 shipped buildings, 266,443 elements with real geometry, real DBs, shipped functions.

| judge | what it means | fleet | worst building |
|---|---|---|---|
| `auditFloating` | starts before a support FINISHES | **362 = 0.136%** → **99.86% clean** | LTU_AHouse 277/122,330 = 0.23% |
| `W-MZ-2` midair | appears before the first thing it TOUCHES | **1,324 = 0.50%** → **99.50% clean** | Clinic 422/16,071 = 2.6% |
| `§SUPPORT_CYCLE` | support DAG acyclic | **0 on 5 of 7** | JKR 4,564 · LTU_AHouse 25,708 |
| witness suite | `viewer/tests` headless | **green=40 known_red=4 new_red=0 flaky=0** | — |

Both judges clear the 5% bar by an order of magnitude, and clear it **per building**, not just on the
fleet average. Terminal — the LOD400 reference — is now **0 floating and 0 cycles**.

### The two named situations, and what actually closed each
1. **"Gantt Chart overstacked"** — closed by the row/band work: `deriveBandRanks` +
   `§4D_BAND_MONOTONIC`'s storey ladder, `deriveStoreyMergeMap` (§S18, storey bands merged from
   EXTRACTED `IfcBuildingStorey.Elevation`, never inferred from element Z), and the `gantt_model.js`
   extraction (#1446) that made bar grouping/trim/row-order one testable thing.
2. **"midair, non-correlation between bars and needle movement"** — closed by the physics chain, in
   order: `§GEOMETRIC_SUPPORT_ORDER` (order derived from a geometry DAG, `seq` demoted to tiebreak)
   → `§DEQ_V1` + the `§DEQ_REPAIR` fixpoint (no PASS-B element starts before its own gates)
   → `§MIDAIR_REPAIR` (5,561 → 0) → `§TM_GEO_ORDER_CYCLES` (Terminal 37,927 cycles → 0)
   → `§CROSSTASK_JUDGE_PARITY` + `§CJP_DAY_ROUNDING_TOL` (fleet floating −49.8%)
   → `§S57` `witness_bake_plays_schedule` (the film plays the REAL schedule, 16/16, numeric)
   → §S64 (the audit finally agrees with the gate it claims to mirror).

### What the residual 0.14% / 0.50% actually IS — not unknown, measured (§S64)
350 of the 362 floating are the **`§SUPPORT_CYCLE` fallback on JKR + LTU_AHouse**, 350/350 by
measured cycle-set membership. Kahn cannot order a cycle member, so it falls back to seq order and
`geoGate` cannot see a support not yet placed. That is **upstream modelling geometry in those two
source files**, already named by the engine and deliberately not resolved (no-invent: a true
geometric cycle is a MODELING fact, not a scheduler bug). The other 12 are A2/A4, untriaged.

**So the line is honest in both directions:** the engine is solved; two of seven source models carry
cyclic support geometry that no scheduler can order, and the engine says so out loud instead of
inventing an order.

### ⛔ What this milestone does NOT claim
- **Editing is not covered.** §S67 fixed a real redisplay bug on two edit gestures the same day this
  line was drawn. The edit path also does not run CPM, does not persist, and guards only 2 of 5 entry
  points against a live bake (`4D_GANTT_TM_REFACTOR.md` §S65).
- **JKR + LTU_AHouse cycle counts are open** and are the single biggest remaining 4D number. Terminal
  proved cycles can go 37,927 → 0 with a geometry rule; nobody has done that analysis for these two.
- 4 known-red witnesses remain in the suite, and the suite itself sees 44 of ~346 witness files (§S66).

---

# ⛔ REGRESSION FOUND + BISECTED (2026-08-24) — hell #1 ("Gantt Chart overstacked") is back, uncaught

User asked for a witness-only re-check of both named hells (no visual). Ran the three witnesses that
speak to them, fresh, on `bim-ootb` `main` HEAD:

| witness | hell | result |
|---|---|---|
| `viewer/tests/witness_midair_zero.js` (fleet, 7 buildings) | #2 non-correlation | **pass=49 fail=0** — every W-MZ-2 number matches this milestone's own table exactly (Terminal 684, Hospital 218, Clinic 422, rest 0) |
| `viewer/tests/witness_bake_plays_schedule.js` | #2 (needle IS the schedule) | **pass=16 fail=0**, Hospital + Clinic |
| `witness_4d_band_monotonic.js` (repo root) | #1 overstacked | **T2a fails: 0 → 14,267/43,000** non-structure cross-storey inversions (Hospital), still true after correcting a harness bug below |

**Why nobody caught it:** the witness still lived in the repo ROOT, never `git mv`'d into
`viewer/tests/` the way §S71 did for `witness_gantt_edit_coherence.js` — so per §S66 it "does not exist
as far as the suite runner is concerned." **Fixed as part of this finding**: `git mv`'d to
`viewer/tests/witness_4d_band_monotonic.js`, require paths re-pathed, registered in
`tests/run_witness_suite.js`'s `KNOWN_RED` (cause C) so it now shows up honestly as `known_red`, not a
silent gap. Confirmed via `--filter` that the suite discovers and correctly classifies it, and a full
`run_witness_suite.js` sweep afterward shows the other 44 files unaffected (see PROOF below).

**A second bug was caught and corrected before it became a false claim.** The witness's own
`computeSchedule()` call never passed `shiftHours`, silently taking the module's internal 8h/day
default — while the real product runs at 24h/day (`§SHIFT_HOURS`, user ruling "24hr is our default",
this file, 2026-08-13) — **the exact same trap already named and fixed once before as
`§GANTT_SHIFT_HOURS_DESYNC` (#1355, viewer/sw.js v1027)**, just never ported to this one witness. Under
the wrong 8h default the witness read `span 176d → 594d` (a false "3.4× blowup", T4 FAIL). Passing the
correct `shiftHours=24` (now the witness's default call) gives `span 176d → 198d` — **T4 now PASSES**,
1.12×, no blowup. **The span claim in the first version of this section was wrong and is retracted.**
T2a's inversions count is unaffected by shiftHours either way (ordering, not duration) and remains a
real, reproducible regression: **5/6, only T2a red.**

### Bisected — two commits, both real defect fixes, both reintroduce band inversions as a side effect
`fc58210..HEAD -- viewer/schedule_gate.js` is 24 commits. Ran the witness's own `inversions()` judge
against each historical `schedule_gate.js` in isolation (same Hospital elements, `shiftHours=24`
throughout — script: `bisect_band_regression.js`, not kept, ad-hoc):

| commit | change | T2a non-struct inversions | spanDays |
|---|---|---|---|
| `fc58210` | shipped baseline (#1129, this file's own §MILESTONE claim) | **0**/43,000 | 176.3 |
| `c972778` #1319 §HOSTED_BEFORE_HOST | hosted element inherits host's floor | **9,171**/43,000 | 201.8 |
| `a2c30ee` #1345 §STAIR_FLIGHT_GRID_VISIBILITY | stair flights become real geoGate/DAG supports | **14,267**/43,000 (= HEAD) | 198.3 |

No other commit in the 24 moved either number. **`a2c30ee` is independently implicated by a completely
different investigation for a different symptom** — `4D_SCHEDULE_PERFECTION.md` §S63 bisected Terminal's
`auditFloating` tail (8→12) to this exact same commit, for the same root mechanism (`isStairFlight()`
added to `supportPool()`, changing what `geoGate` treats as already-placed). Two independent judges,
two different metrics, two different buildings, same commit — strong corroboration this is a real,
mechanical side effect of that commit's `geoGate` change, not noise.

**Mechanism, consistent with `GANTT_ACCURACY.md` §ROOT CAUSE (written BEFORE the midair work landed):**
"the support invariant needs carriers placed first (z-major); the band gate needs lower ranks placed
first (rank-major); walls do both, so they demand conflicting sort orders" — and that section already
concludes **"no gate-only change can resolve this."** `§HOSTED_BEFORE_HOST` and
`§STAIR_FLIGHT_GRID_VISIBILITY` both extend the geometry-DAG support/host relationships the scheduler
reads, each fixing a real, separately-proven defect (hosted-before-host correctness, stair-flight
floating count) — and each, as an uninspected side effect, pulls more elements into z-major geometry
order at the expense of the rank-major band order this witness locks. This is the SAME structural
tension already named, now shown to also apply to fixes that landed AFTER the tension was written down.

**Scope note:** this is the GENERATION engine (`schedule_gate.js`), not the edit path — separate from
everything in `4D_GANTT_TM_REFACTOR.md`'s debug map. Per the other session's own note, it does not touch
the Gantt UI/TM cleanup work in flight elsewhere.

**Not fixed here, deliberately.** `GANTT_ACCURACY.md` already tried and rejected three designs for this
exact conflict, and both root-cause commits are real, wanted, already-proven fixes — reverting either
to "solve" T2a would reopen a different named defect (hosted-element floor inheritance /
`witness_tm_geo_order_cycles`'s stair-flight floating count). This needs the user's own design call, not
a session's guess. **Not attempted** so nothing currently green (midair=0, `auditFloating`, floating
counts) is put at risk chasing this.

### PROOF — full suite sweep after the witness move, nothing else disturbed
`node tests/run_witness_suite.js` (no filter), bim-ootb `main`, worktree `/tmp/wt-4d-band-regression`:
```
§SUITE_SUMMARY green=47 new_red=0 known_red=4 fixed=1 flaky=0 total=52
```
**`new_red=0`** — the relocation + `KNOWN_RED` registration cost nothing else. `known_red` stays at 4
(this witness's slot exactly replaces one drained the same run — see next line — net zero). Total rose
44→52 from unrelated witnesses other sessions added since the 2026-08-22 milestone count, not from this
change (this change added exactly one file). **Unrelated, noted not acted on:** the same run reports
`witness_gantt_lock_integrity.js` — a pre-existing `KNOWN_RED` entry, not one this session touched — now
passes (`FIXED ... Drain it from KNOWN_RED`). Not this session's fix and not drained here; likely the
other concurrently-running TM session's work, left for whoever actually fixed it to claim and clean up.

### Left for next pickup
1. **Done here:** witness relocated + `shiftHours` bug fixed + registered `KNOWN_RED` — cannot silently
   regress further uncaught.
2. **Open, needs the user:** which of `§HOSTED_BEFORE_HOST` / `§STAIR_FLIGHT_GRID_VISIBILITY`'s behavior
   to trade off against band-monotonicity, or whether a genuinely new design (not one of the 3 already
   rejected in `GANTT_ACCURACY.md`) exists. Not investigated further here.

---

## §S65 — THE PRESET TEMPLATE IS ITSELF WRONG, AND HAS NEVER HAD A WITNESS (2026-08-25)

**User directive that produced this section, verbatim:** *"we talked about before of the inbuilt preset
gantt chart template that will always be correct already having all the types and arranged proper
sequence - no zero minute stacking, no midair MEPs or beams. We just retrofit the metadata into it. U
said last session this is done. But i dont think so as none worked but got worse. First establish the
setting result or the source template be in the same JSON file. Then look at that file to be correct,
lock that, then populate as such, look at it again, lock before next ie presenting on TM panel"* — plus
*"WITNESS follows each inch of those"* and *"I have to reject all your conjecture as useless and do this
way strictly."*

**The staging is now the law for this lane. Do not skip a stage, do not present a downstream theory
before the current stage's file is locked by a witness:**

    STAGE 1  establish: template + setting result live in ONE JSON file
    STAGE 2  look at THAT FILE alone → correct? → LOCK (witness)
    STAGE 3  populate (retrofit building metadata into it) → look again → LOCK (witness)
    STAGE 4  only then present on the TM panel

### STAGE 1 — ESTABLISHED: they are NOT in one file. One missing call is the whole cause.
- `viewer.html:865` loads `rates.js?v=7` and **never calls `loadSequenceRules()`** → the EXECUTED table
  is the JS literal in `rates.js`, not the JSON. Already self-documented at `rates.js:107-110`
  (§RULES_TABLE_SOURCE): *"THIS TABLE, NOT THE JSON, IS WHAT THE VIEWER RUNS ... rates/sequence_rules.json
  is a MIRROR."*
- `loadSequenceRules()` has exactly ONE caller — `initRateTemplate()` (`rates.js:609`), used only by
  `mep_report.html` / `boq_charts.html`.
- The Settings-editor result key `json_sequence_rules` is read **only inside `loadSequenceRules()`**
  (`rates.js:546`) → **user settings edits never reach the 4D at all.**
- **The sync-load objection that would justify this does not exist:** all six viewer-side reads of
  `window.SEQUENCE_RULES` are at CALL time inside functions (`time_machine.js:3656/4408/5277/5657/
  6839/6881`), and `loadSequenceRules()` mutates the globals IN PLACE (`rates.js:558-573`).
  `find_erp_push.js:33` states the same property explicitly. Wiring the call is safe.
- **Content drift TODAY (measured, `probe_template_drift.js`): 0 functional, 1 doc-only** — the JSON
  carries a `reason` field per NAME_OVERRIDE that the JS literal omits. SEQUENCE_RULES 58/58 identical,
  LABOR_RATES 10/10 identical, SEQUENCE_DEFAULT identical.
- **Do NOT wire the JSON in yet.** Wiring it before STAGE 2 passes would promote an unverified table to
  single source. Order is: fix + lock the file, THEN unify.

### STAGE 2 — THE FILE IS NOT CORRECT. 7 defects, `verdict=NOT LOCKABLE`.
Measured by calling the REAL duration function (`ScheduleAuthor._installSecs`, `schedule_author.js:62-75`)
against every rule in the file — not a mirrored copy. Probe: `probe_template_correct.js`.

**Why nobody saw it: the failure mode is silent by construction.** `_installSecs` returns a bare `120`
(seconds) when the resource is missing OR the class has no productivity entry — three sites
(`schedule_author.js:64`, `:70`, `time_machine.js:4457`), **zero §-log, zero warn, at any of them**.
`§CLASS_UNMATCHED` warns about PHASE fallback only and says nothing about the duration collapse. On a
45-day axis a 120s element is a zero-width bar. That is the user's "zero minute stacking", at its source.
There is also **no witness anywhere on this file** — the closest, `witness_gantt_native_generate.js`,
tests generation output, never the template.

| # | Gate | Defect | Blast radius (measured) |
|---|------|--------|--------------------------|
| 1 | F-ZERO | `SEQUENCE_DEFAULT.resource = null` → 120s | EVERY class with no rule, EVERY building |
| 2 | C-ZERO | `IfcBuildingElementProxy` `resource: null` → 120s | HHS_Office_Federated's dominant class — the same one §GANTT_OPS_FIRST20 showed 18 identical entries of during the CRISIS |
| 3 | C-ZERO | `IfcSpace` `resource: null` → 120s | every building with spaces |
| 4 | E-ZERO | `glazed_curtainwall_facade` moves `IfcPlate`/`IfcMember` STEEL_ERECTOR(12/10) → **CARPENTER (has neither)** | Hospital 2211 IfcPlate + 7122 IfcMember, HHS 438 IfcPlate — the override fixes their PHASE and silently destroys their DURATION |
| 5 | E-ZERO | `furniture_generic_bucket` moves `IfcBuildingElementPart` MASON(15) → **FINISHER (has none)**; `IfcBuildingElementProxy` has none anywhere | every furniture-named proxy/part |
| 6 | (named) | `LABORER.productivity = {}` — empty map | any future rule pointing at it = 120s |
| 7 | D-OVERLAP | phase bands interleave: Architecture spans seq **5–8**, MEP Rough-in sits at **7** → `IfcRoof` (Architecture, seq 8) sequences AFTER all MEP rough-in | "midair MEP" visible in the template, before any geometry |

**Productivity coverage, measured across all 10 trades** (this is what makes 4/5 extractable and 2 not):
`IfcPlate`→STEEL_ERECTOR 12 · `IfcMember`→STEEL_ERECTOR 10 · `IfcBuildingElementPart`→MASON 15 ·
`IfcBuildingElementProxy`→**NONE anywhere** · `IfcSpace`→**NONE anywhere**.

### ⛔ BLOCKED — the ONE fact that cannot be extracted
Defects 1 and 2 need a productivity figure that exists nowhere in the rate table. **Question for the
user: what trade + daily productivity should a generic/unclassified element carry (`IfcBuildingElementProxy`,
and `SEQUENCE_DEFAULT` for any unmatched class)?** `LABORER` is the obvious trade slot but ships an empty
productivity map, so it needs a number too. Any value invented here would violate the Prime Directive.
Defects 3–7 are fixable without it (3 = same question if a space should have duration at all; 4/5 = the
value already exists under the class's canonical trade; 7 = a sequence-band decision).

### What STAGE 2's LOCK must be (the witness, not yet built)
A witness over the TEMPLATE FILE ALONE — no building, no geometry, no kernel_ops — asserting:
A shape (every rule has phase+sequence+resource) · B every resource resolves in LABOR_RATES · **C no rule
and no NAME_OVERRIDE lands on the 120s floor** · D phase bands do not interleave · E overrides valid +
their own classes keep a real duration · F `SEQUENCE_DEFAULT` yields a real duration. Red control: flip one
resource to `null` and prove C fails. This is the gate that has never existed; `probe_template_correct.js`
is its working prototype (all six gates implemented, currently 7 failures).

**Separate, and it must be fixed with the above: make the 120s floor LOUD.** A silent duration collapse at
three sites is what let this survive weeks of "fixes." Add a §-log at each site naming cls + resource.

### STAGE 3 — THE DRAWER. A bar's span was never derived from the schedule. (2026-08-25, PR #1528)

**User's framing, which was the correct diagnosis:** *"a human gantt chart maker will easily arrange
with zero such hell."* A human writes ~17 bars and assigns elements to them. The drawer did the
INVERSE — it computed each bar's outline as a Tukey fence over its MEMBER ELEMENTS
(`gantt_model.js buildTasks`). When a task's elements bunch (routine under the crew/CPM solve: one
storey's steel goes up in a burst inside a window sized for the whole storey), the fence collapses
onto the bunch and the bar becomes a sliver.

**The window was never unknown.** `buildTaskIndex()` already put `start`/`finish` on every entry of
`idx.tasks` (`time_machine.js:5295`); `buildTasks()` read only `.name`. The drawer computed a worse
answer than the one it was already holding.

**Measured — HHS_Office_Federated, 6839 ops, 17 bars, every one carrying a real `task_id`**
(`probe_bar_vs_task.js`, `§BVT_*`):

| bar | before | its own task | after |
|---|---|---|---|
| Superstructure — Roof Level | **0.6px** | 101.4px | 100.0% |
| Architecture — Roof Level | 0.6px | 58.0px | 100.0% |
| Architecture — Level 3 | 46.9px, start off **22.03d** | 202.9px | 100.0% |
| mean abs start / end error | **5.33d / 1.61d** | — | **0.00 / 0.00** |
| bars < 3px | 2 | — | **0** |

**⚠ THE LAYER LESSON, stated plainly so it is not re-learned a fourth time:** STAGE 2's template fix
moved 1217 zero-width ELEMENTS to 114 and changed these bars by EXACTLY NOTHING. #1520's clamp and
#1523's rescale are the same story. All three are element-layer; the bar's geometry was never derived
from the schedule at all. **Fixing a layer that does not feed the symptom cannot move the symptom, no
matter how real the defect you fixed was.**

**Fix:** an AUTHORED group (real task_id + parseable window) takes its span from that window.
Un-authored groups (`storey|phase`, cell) keep the Tukey rule byte-identically — no window to prefer.
Member envelope still returned as `opsStartTs`/`opsEndTs` for fill/progress (§TIER_DAG_WINS: counted,
never hidden). `computeDays()` gained an optional `taskWins` so the display axis covers every authored
window. New `§GANTT_BAR_SPAN_SOURCE` log line reports `spanFromTask` vs `spanFromOps` per rebuild.

**Witness:** `witness_gantt_bar_is_its_task.js` — 135 bars, 4 buildings, worst window error 0.000
days, `spanFromOps=0`. `HHS_Office_Federated` is a REQUIRED fixture (fails rather than reporting a
narrower run green — §CRISIS LESSON 2). Gates assert EQUALITY to the window, never "inside" it.

**⛔ STILL OPEN, and deliberately left RED rather than tuned away** — `no-hairline-bars-3px`: Clinic
ships 6+ zone tasks with exactly **1.00-day windows on a 156-day axis** (2.2px), including
`MEP Rough-in — Roof - Mech` with **139 elements** and `Substructure — TOF Footing` with 58. Cause is
UPSTREAM and predates this work: `schedule_author.js:517` floors a zone whose SOLVED span rounds below
a day at exactly one day, so a zone's window comes from the element solve's span and NEVER from its
work content. **This is the already-named §CPM_GENERATOR_UPSTREAM_SPEC / "window derivation from work
content" item — it is now the top remaining lever on this lane, and it is the last known source of
thin bars.** Registered in `KNOWN_RED` with the full cause.

### ⚠ PROCESS: auto-merge orphaned a commit TWICE in this one session
#1526 squash-merged the witness commit while the fix commit was still being written → fix orphaned,
re-landed as #1527. Then #1527 merged while the STAGE 3 commit was in flight → orphaned again,
re-landed as #1528. `CLAUDE.md` already names this (PR #138, 2026-06-05). **Working rule: create the
branch, push, and open the PR in ONE go, and never add a second commit to a branch that already has a
PR with auto-merge enabled — start the next commit off fresh `origin/main` instead.**

### §ZONE_WINDOW_COVERS_WORK — the last known source of thin bars, closed (2026-08-25, PR #1529)

**Found BY the STAGE 3 fix, not despite it.** Once bars were drawn at their real task windows, the
witness could ask a question that was previously unaskable: *is the window itself long enough for the
work it contains?* Measured across Duplex/Clinic/JKR/HHS_Office_Federated — 135 zone tasks, **5
windows shorter than their own members' crew-days**:

| task | crew-days | window | over | elements |
|---|---|---|---|---|
| JKR — MEP Final — 02 1st Floor Level | 1.744 | 1.00d | **74%** | 126 |
| Clinic — Finishes — Level 1 | 1.333 | 1.00d | 33% | 64 |
| JKR — MEP Rough-in — 03 Water Tank Floor | 3.405 | 3.00d | 14% | 404 |
| Clinic — Substructure — TOF Footing | 1.074 | 1.00d | 7% | 58 |
| HHS — MEP Rough-in — Level 2 | 9.508 | 9.00d | 6% | 976 |

**Now 0/135.** Cause: `schedule_author.js` derived a zone's window from the SOLVE'S SPAN alone, so a
zone whose elements happened to be solved into a tight cluster got a window shorter than its own
contents. Fix is a **FLOOR, not a re-derivation** — the solve's span still wins when larger, so the
130 already-honest zones and all dead-air/gap behaviour stay byte-identical. Crew-days come from the
elements' OWN `installSecs` over the same `max_crews` the solve used; nothing invented. Replacing the
span rule outright is still the separate `§CPM_GENERATOR_UPSTREAM_SPEC` item.

**⚠ THE GATE LESSON — a pixel threshold is not a truth test.** The first cut of this gate was
`no-hairline-bars-3px`, and it was measuring the wrong thing: of Clinic's 9 one-day windows, **7 were
HONEST work** (`MEP Rough-in — Roof - Mech` = 139 elements in 0.817 crew-days at 24h × 4 crews). A
genuine one-day task on a 156-day chart SHOULD be thin — P6 draws it thin. A pixel threshold flags
real work as a defect AND can be silenced by nudging the number. **Gate on the quantity that is
actually true or false about the artifact (crew-days vs window), never on how it looks at some
assumed canvas width.** This is the same law as "no visual on screen", one level down: a pixel gate is
a screenshot with extra steps.

**⚠ A WITNESS DEFECT, caught on this witness's first real run.** The generator re-derived each
element's trade from `SEQUENCE_RULES[cls]`, which IGNORES `NAME_OVERRIDES`, so it disagreed with the
engine about crew count and produced a phantom 6th red (JKR water-tank zone). It now reads the
element's own `installSecs`/`resource` — the exact values the engine uses. **A witness must consume
the producer's own output, never re-derive it** — this is the mirrored-predicate drift class
`witness_kit` exists to prevent, and it still happened, in a brand-new witness, written by someone who
had just finished documenting that exact failure mode.

**§S65 lane state:** STAGE 1 ✅ (established, one missing `loadSequenceRules()` call — the unification
itself is still NOT wired, see below) · STAGE 2 ✅ (template fixed + locked, 1217→114 zero-width
elements) · STAGE 3 ✅ (bar = its task window, 0.00-day error on 135 bars; zone windows cover their
work, 0/135 over-committed). **STAGE 4 (present on the TM panel) is deliberately NOT claimed — no
witness covers the rendered canvas, and per the user's standing law the screen is not evidence.**

**⛔ STILL OPEN on this lane, in priority order:**
1. **STAGE 1's unification was diagnosed but never wired.** `viewer.html:865` still never calls
   `loadSequenceRules()`, so the executed table is still the `rates.js` literal, `rates/
   sequence_rules.json` is still a hand-synced mirror, and the Settings-editor key
   `json_sequence_rules` still reaches nothing. `witness_sequence_template_lock.js`'s
   `mirror-matches-executed` gate keeps them honest, but the split remains.
2. **`§CPM_GENERATOR_UPSTREAM_SPEC`** — window derivation from work content as the RULE, not a floor.
3. The 114 remaining sub-120s elements (real productivity math, min 14s) — smaller, unexamined.

### §S65 CLOSE-OUT — the two process failures this session actually paid for (2026-08-25)

Both are worth more than any of the five fixes, because both are the mechanism by which "all green"
kept coexisting with a broken product.

**1. A FILTERED SUBSET IS NOT A REGRESSION RUN. This session shipped a real baseline break on it.**
PR #1527 was merged after `run_witness_suite.js --filter gantt` (green=17) and `--filter tm_`
(green=12). `witness_zone_display_authoring.js` matches NEITHER filter, and #1527 broke its locked
HHS floating baseline. Bisected green 18/18 at `bf62a7b`, red from #1527 on.
**Rule: a change to `rates.js` / `schedule_author.js` / `schedule_gate.js` / `gantt_model.js` — anything
in the solve or authoring path — requires the FULL headless suite before merge, never a `--filter`
subset. `--filter` is for iteration only.** The full sweep is ~20 min; the miss cost more.

**A/B, NOT ATTRIBUTION, once it was found.** #1527 changed two things that feed the solve, so both
were separated instead of blaming the obvious one:
| variant | HHS raw → display |
|---|---|
| before #1527 (old lock) | 894 → 1839 |
| **duration fixes only, sequences reverted** | **891 → 1815** (raw 3 BETTER) |
| full #1527 | **979** → 1815 |
| + #1529 zone-window floor | 977 → **1727** |
The DURATION fixes cost nothing — they improved both sides. The entire +88 raw regression is the two
SEQUENCE moves (`IfcRoof` 8→6, `glazed_curtainwall_facade` 7→6 — the user's weather-tight ruling),
and they leave the DISPLAY timeline byte-unchanged at 1815: the movie is unaffected, only the raw
generative audit moves. Re-locked to 977→1727 (PR #1530) with that A/B written INTO
`baselines/midair.json`, per its own "a re-lock is a data edit with a named cause" discipline.
**Net vs the old lock: raw +83, display −112.**

**2. NEVER MUTATE A WORKTREE A SUITE IS RUNNING IN.** The first full sweep returned `new_red=6` and
was entirely invalid: `rm -f node_modules` was run in that same worktree mid-sweep, which fails every
sql.js-dependent witness. Four of the six "reds" were that. Re-run clean: **green=55, new_red=1,
known_red=7, total=63** — the one new red (`witness_cpe_buildup_require_tm_first.js`) reproduces on
pristine `origin/main` and says so itself ("WITNESS IS BLIND — shipped source unexpectedly already
has this gate"), i.e. a stale red control whose fix shipped long ago. Not this lane's.

**3. Auto-merge orphaned a commit FOUR times in one session** (#1526→#1527, #1527→#1528,
#1528→#1529, #1529→#1530). Each time the PR squash-merged within ~1 minute while the next commit was
still being written. **Working rule: build the branch COMPLETE, then push and open the PR in one
step. Never add a commit to a branch that already has an open PR — start it off fresh `origin/main`.**

**Final state of §S65:** STAGE 1 ✅ diagnosed (unification NOT wired — see open item 1 above) ·
STAGE 2 ✅ · STAGE 3 ✅ · STAGE 4 NOT claimed (nothing witnesses the canvas; the screen is not
evidence). Five PRs: #1526 #1527 #1528 #1529 #1530.

---

# §S66 — THE CORE PROGRAMME TEMPLATE. START A NEW SESSION HERE. (2026-08-25)

## The correction that matters more than any fix in §S65
**The user asked for a core programme-template JSON MONTHS ago and was repeatedly told it existed.
It did not.** Scanned all 96 JSON files in `bim-ootb`: zero contain tasks, durations or dependencies.
**`4D_SCHEDULE_PERFECTION.md:1751` — this file — states "sequence_rules.json IS that template and it
does work". That sentence is FALSE and it is why every session since could report the template as
done.** `sequence_rules.json` is an `ifc_class → phase/sequence/trade` lookup. It answers *which phase
does this element belong to*. It cannot answer *what is the programme*. Do not repeat that claim.

**Shipped:** `viewer/rates/4D_template.json` (bim-ootb PR #1531) + `witness_4d_template.js`
(pass=10 fail=0). **Artifact and gate only — NO LOADER WIRED. Nothing consumes it yet.**

## PRIMAL ROLE — one sentence
**It is the only place in the 4D chain where a fact is AUTHORED rather than DERIVED from the layer
before it.**

Everything else is a derivation: template classification → element solve → zone windows → task
dates → dependency edges → CPM → drawn bars. Each layer takes the previous layer's output as its
input, so **every layer always agrees with its neighbour, nothing can ever be contradicted, and the
whole chain is 4.4× off the work it contains while reporting itself green.** That is not a bug in any
one link. It is the absence of an anchor. This file is the anchor.

## HOW IT DISSOLVES EACH HELL — mapped to the measured symptom, not to a theory
Every number below is from ONE live `HHS_Office_Federated` console log, 2026-08-25, v1089.

| measured symptom | why it happens now | what the template changes |
|---|---|---|
| `§CREW_DAY_CLOCK rawDays=185.2` vs `§GANTT_AXIS axisDays=42.0` — **4.4× contradiction inside one log** | duration = elapsed span of the geometry placement solve. The solve ORDERS elements; it never PRICES the work | `duration_rule.basis="work_content"` — `days = ceil(Σ installSecs / (shift × crews))`. The programme is as long as the work in it |
| `§GANTT_CPM_ANNOTATE critical=17 (100%) float=0..0` — every task critical, no critical PATH | `schedule_author.js` derives each FS lag from the dates it is meant to validate (`succ.start = pred.finish + lag EXACTLY`). Every edge tight by construction | `dependencies` are construction logic with no date, no start, no day number. Float becomes a DISCOVERED quantity; CPM can finally contradict the schedule |
| `§GANTT_ROW_ORDER phases=[Superstructure,Architecture,MEP Rough-in,MEP Final,Finishes]` — **no Substructure at all** | phases exist only if geometry produced elements for them. An absent phase is silently absent | template declares all 6 phases; `within_level` chain must reach every one. Absent is REPORTED (`_empty_ok` + its `_why`), never silent |
| 17 tasks for a 6880-element, 3-storey building | tasks = whatever `deriveZones` grouped, i.e. `(phase, storey)` | phases × real storeys, declared, with `replicate_per_level` explicit. The shape is authored, not emergent |
| `§CREW_DAY shift=24h/24h` — no week, no weekends | `SHIFT_HOURS` alone carried the calendar; nothing stated the week | `calendar` block states hours AND days_per_week AND holidays. 24/7 carried VERBATIM (standing 2026-08-13 ruling) — made visible and editable, deliberately NOT changed here |
| trades at 0.1–42% utilisation | crew caps never meet a duration derived from demand | duration derives from demand ÷ capacity, so utilisation becomes a real, checkable output |

## HOW THE OTHER JSON RELATES TO IT — two files, one set of phases, gated relationship
- **`sequence_rules.json` = the LOOKUP.** Per `ifc_class`: phase, sequence, trade, productivity, crew
  caps. Answers *what is this element and how fast does its trade work*.
- **`4D_template.json` = the SHAPE.** Phases, per-level replication, dependency logic,
  calendar, duration rule. Answers *what is the programme*.
- **The template DERIVES its phase set from the lookup and must never re-type it.** `phases[].sequence`
  = that phase's MIN sequence in `SEQUENCE_RULES`; `phases[].trades` = the union of its classes'
  resources. Gated by `phases-match-classification-order` + `trades-match-classification`.
  **This is not tidiness** — `gantt_model.js`'s own header records `_VAR_ORDER` as a THIRD stale copy
  of the phase order that PR #1165 missed, still reading MEP rough-in BEFORE the envelope.
- **The template must never carry a productivity number, a rate, or a class name.** Those live in the
  lookup, once. The template must never carry a date. Those come from instantiation.
- **One clock:** `calendar.hours_per_shift` must equal the executed `rates.js SHIFT_HOURS`. Gated
  (`calendar-matches-engine`) — `§GANTT_SHIFT_HOURS_DESYNC` was exactly two files disagreeing about
  the working day, and bars were authored 3× slower than the canvas played.

## ⛔ RESUME HERE — the next step, and why it is deliberately NOT done yet
**Instantiation: make `materializeZones` copy the template instead of inventing the shape.**
1. Read `4D_template.json`; for each phase, emit one task per real storey where
   `replicate_per_level`, one per building otherwise.
2. Duration per task from `duration_rule` (work content ÷ crew capacity), **not** from the solve span.
3. Write `task_sequences` from the template's `dependencies` — **never** from the emitted dates.
   Delete the `lagDays = sd.s - pd.e` derivation (`schedule_author.js`, search the comment "FS lag
   straight off the persisted day numbers"). That line is the tautology.
4. Let CPM run on real logic and report real float.

**This was NOT started in the same session on purpose.** It changes every number on every building.
Baselines must be **RE-DERIVED, not re-locked** — `baselines/midair.json` (`float_after_cpm`,
`zda_display_float`), `witness_midair_zero`, `witness_zone_display_authoring`,
`§CROSSTASK_JUDGE_PARITY`. Expect the programme to get LONGER (42 → order-of-186 days) and that is
the fix, not a regression: the current 42 is the contradiction.

**Also still open from §S65:** `viewer.html:865` still never calls `loadSequenceRules()`, so the
executed table remains the `rates.js` literal and Settings edits reach nothing (the
`mirror-matches-executed` gate keeps the two honest, but the split remains).

## ⚠ THE LAW, restated because it was broken by the session that documented it
**No visual. Ever.** Do not ask the user what they see, do not offer to have them look, do not treat
a screenshot as evidence — including a PIXEL THRESHOLD in a witness, which is a screenshot with extra
steps (see §ZONE_WINDOW_COVERS_WORK's gate lesson). Derive the defect from `§`-log values and numbers
computed from real state. This session asked "tell me what you see" after writing that rule down.

---

## §S66.1 — RENAMED `4D_template`, AND THREE REAL DEFECTS IN THE ANCHOR ITSELF (2026-08-25, review pass)

**User directive: "first rename programme_template to 4D_template to remove ambiguity."** Done —
bim-ootb PR #1532, rename only, no content/invariant/gate change. `viewer/rates/4D_template.json` ·
`viewer/tests/witness_4d_template.js` · `witness_kit/invariants/4d_template.js` ·
`witness_kit/schemas/4d_template.js`; `meta.id`→`4d_template`, storageKey→`json_4d_template`, log tag
`§PT_`→`§4DT_`, export `ProgrammePhaseRow`→`PhaseRow4D`. Re-run after rename:
`§WITNESS_4D_TEMPLATE pass=10 fail=0 ran=6`; suite discovery `green=1 new_red=0`. Zero stale refs
repo-wide (`grep -rn programme_template` → 0).

The name mattered: `sequence_rules.json` is ALSO called "the template" throughout §S65, and
`gantt_model.js` carries a third phase-order copy. Three things called "the template" is how §S65's
STAGE 1 confusion started.

### The §S66 write-up overclaims one thing. Corrected.
"The only place in the chain where a fact is AUTHORED rather than DERIVED" is **not true as written**,
and the file's own `provenance` field contradicts it: `phases[].id/name/sequence` and `phases[].trades`
are **EXTRACTED from `sequence_rules.json`** and gated against drift
(`phases-match-classification-order`, `trades-match-classification`). `sequence_rules.json` authors
plenty of facts of its own — productivity, `rate_per_day`, `crew_size`, `max_crews`, class→phase.

**What `4D_template.json` actually authors is exactly three things: `calendar`, `duration_rule`,
`dependencies`.** That is still the right claim to make — those three are precisely the anchor the
chain lacked — but state it as the three, not as "the only authored layer". The overclaim invites the
same rot §S66 was written to stop.

### ⛔ DEFECT 1 (real, in the shipped file) — the crew formula treats trades as fungible
`duration_rule.formula`: *"crews = sum of max_crews over the trades the activity's own elements
actually use"*, applied to `days = ceil(Σ installSecs / (hours_per_shift × 3600 × crews))`.

**Σ over trades is arithmetically wrong.** Work content is PER TRADE — an electrician's seconds cannot
be worked off by a plumber's crew. Duration is `max` over trades of (that trade's own secs ÷ that
trade's own capacity), never (all secs ÷ all capacity). Measured from `sequence_rules.json`
`LABOR_RATES` against the template's own declared trade lists:

| phase | declared trades | Σ max_crews (formula) | max max_crews (any one trade) | duration understated by up to |
|---|---|---|---|---|
| Substructure | CONCRETE_GANG | 3 | 3 | 1.00× |
| Superstructure | CONCRETE_GANG, STEEL_ERECTOR | 6 | 3 | **2.00×** |
| Architecture | CARPENTER, CONCRETE_GANG, MASON, ROOFER | 8 | 3 | **2.67×** |
| MEP Rough-in | ELECTRICIAN, HVAC_TECH, PLUMBER | 6 | 2 | **3.00×** |
| MEP Final | ELECTRICIAN, HVAC_TECH, PLUMBER | 6 | 2 | **3.00×** |
| Finishes | FINISHER | 2 | 2 | 1.00× |

`max_crews` DOES exist on all 10 trades (verified) so the formula is well-formed — it is the wrong
formula, not a dangling reference. **This is the same class of error the file exists to kill**: it
would replace HHS's 4.4× duration contradiction with a new understatement of up to 3× on the two MEP
phases, and it would do so with all 10 invariants green, because nothing gates the formula's
arithmetic — only that `basis === 'work_content'`.

**Fix (do this before instantiation, not after):** restate as
`days = ceil( max over trades t of ( Σ installSecs(t) / (hours_per_shift × 3600 × max_crews(t)) ) )`
and add an invariant that the formula's divisor is per-trade, not a sum.

### ⛔ DEFECT 2 (gate hole) — MIN-sequence ordering cannot see band interleave
`phasesMatchClassificationOrder` compares `phases[].sequence` to each phase's **MIN** sequence in
`SEQUENCE_RULES` and checks the mins strictly increase. Measured bands today:

`Substructure 1–1 · Superstructure 2–4 · Architecture 5–6 · MEP Rough-in 7–7 · MEP Final 9–9 · Finishes 10–11`

Clean right now — §S65 defect #7 (IfcRoof at seq 8, after all MEP rough-in) was fixed by PR #1527. But
**the gate would not catch its return.** Move any Architecture class back to seq 8 and Architecture's
min stays 5, the mins still increase, `pass=10 fail=0`. The exact defect §S65 named is invisible to the
witness written to prevent it.

**Fix:** gate `max(sequence of phase[i]) < min(sequence of phase[i+1])` — non-overlapping bands, not
just ordered mins.

### ⛔ DEFECT 3 (undefined at instantiation) — building-scope phase meets level-scope phase
`substructure` is `replicate_per_level: false` AND `_empty_ok: true`, and it is the head of the
`within_level` chain. Two things the file does not say:
1. **Which level's superstructure does the single Substructure activity precede?** The
   `substructure → superstructure` edge is declared `within_level`, but its predecessor has no level.
   Instantiation has no rule; it will invent one.
2. **When Substructure is dropped for empty population — HHS_Office_Federated, the file's own worked
   example — `superstructure` has no predecessor and the chain is broken.**
   `withinLevelChainCoversAllPhases` runs against the TEMPLATE, never against the instantiated graph,
   so the drop is unwitnessed. This is `§S66`'s own "absent must be REPORTED" requirement failing at
   the one moment it applies.

**Fix:** declare edge scope explicitly (`building→level` edges attach to level 1) and carry the
cover-invariant forward onto the instantiated task graph, not only the template.

### Verdict on §S66 as written
`8/10 — the diagnosis is right and the artifact is real · the primal-role claim overstates by one
notch · the duration formula it anchors on is arithmetically wrong (up to 3×) and ungated · band
interleave and instantiation-scope are both unguarded.` The RESUME step (instantiation) should NOT
start until Defect 1 is fixed — instantiation is what turns that formula into every number on every
building.

---

# §S67 — HHS OFFICE WALKED THROUGH THE MOTION, HOP BY HOP. ONE LIVE DEFECT FOUND AND STOPPED. (2026-08-25)

**User directive:** *"start implementing that very first file, review that its following 4D rules, then
slowly systematically apply HHS Office as a sample thru the motion and see how it begins to deviate and
stop it at its tracks."*

**Shipped:** bim-ootb PR #1532 (rename) + **PR #1533** (`4D_template` v1.1.0 + `§CREW_CAP_FINAL`).
Instrument kept: **`viewer/tests/probe_4d_motion.js`** — `node viewer/tests/probe_4d_motion.js [Building]`.
It is a PROBE, not a witness: it prints what the template declares beside what the engine produces at
each hop. The suite runner ignores `probe_*`.

## Do I agree the missing template was the grail? Yes, with one correction.
The template is the anchor, and building it is what made every number below findable — before it there
was no declared quantity for any layer to be measured against. But **the anchor alone is not the grail**:
a declaration nothing compares against is another file. The grail is anchor **+ a per-hop comparison**,
which is what the probe is. The first defect fell out within minutes of having both, after weeks of
downstream chasing.

**And the anchor as first written was itself wrong in three places** (§S66.1), which is the strongest
argument for the pairing: an unchecked anchor propagates its own error with every layer agreeing.

## THE MOTION — HHS_Office_Federated, 6839 elements, 4 storeys, 24h shift
| hop | what the template declares | what the engine produces | verdict |
|---|---|---|---|
| **0** classify | 6 phases exist | 6839 els, 4 storeys, **0** zero-minute floors, **0** unmatched classes | ✅ clean — PR #1527's §S65 fixes hold |
| **1** phases | all 6 declared, absence REPORTED | **Substructure = 0 elements.** Superstructure 1981 · Architecture 1422 · MEP Rough-in 2666 · MEP Final 727 · Finishes 43 | ⚠ absent, and silently so |
| **1** duration | per-trade work content | serial 182.5d · **Σcrews 40.1d · per-trade 69.8d** | ⛔ the shipped Σ form understates 1.74× |
| **2** solve | FS-serial chain ⇒ 69.8d | span **46.9d** | ⚠ engine overlaps phases; template says serial. Nothing reconciles them |
| **2b** capacity | no trade exceeds `max_crews`, ever | **CARPENTER peak 8 vs cap 2 (4.0×)**; 7 other trades exactly legal | ⛔ **LIVE DEFECT — fixed, below** |
| **3** zones | 6 phases × 4 levels = 20 tasks | **17** — MEP Final 3/4 levels, Finishes 2/4 | ⚠ silently short |
| **4** windows | window ≥ its own work | 0/17 over-committed (per-trade rule) | ✅ PR #1529 holds |
| **5** edges | 6 LOGIC edges, no dates | 25 edges, **25/25 lag == the observed gap between the two zones' own dates** | ⛔ 100% restatement, 0% logic — the tautology, confirmed |

**Correction to §S66's headline.** "rawDays=185.2 vs axisDays=42.0, a 4.4× contradiction" compares
unlike things: 182.5 is ONE crew doing everything serially, 46.9 is many trades in parallel. That is
not a contradiction on its own. **The real, defensible contradiction is HOP 2b**, and it is a physical
one, not an arithmetic framing.

## ⛔ THE LIVE DEFECT — §CREW_CAP_FINAL. The crew cap only bound PLACEMENT.
`schedule_gate.js` `claimCrew` enforces `LABOR_RATES[trade].max_crews` correctly — at the moment an
element is first placed. The **`§DEQ_REPAIR` sweep** then moves elements forward to satisfy geometry
gates by writing `o.start`/`o.end` **directly, never re-claiming a crew**. Its biggest shifter is
`hostGate`, whose entire population is hosted openings (`IfcDoor`/`IfcWindow` = **CARPENTER**), so they
pile onto the same instants.

**Measured on the FINAL emitted times (24h shift), and isolated by A/B with the repair loop disabled:**

| building | trade | cap | peak, repair ON | peak, repair OFF | span ON | span OFF |
|---|---|---|---|---|---|---|
| Terminal (48,428 els) | CARPENTER | 2 | **20 (10.0×)** | 2 | 131.6d | 131.6d |
| HHS_Office_Federated | CARPENTER | 2 | **8 (4.0×)** | 2 | 46.9d | 46.9d |
| Duplex | CARPENTER | 2 | **3 (1.5×)** | 2 | 9.9d | 9.9d |

Every other trade legal on every building. **The breach never shortened the programme** — identical
spans either way. It authored work no crew exists to do.

**Fix:** a crew re-pack over the CURRENT times, inside the SAME convergence loop as the geometry sweep,
so the two constraints settle together instead of one undoing the other. Both only ever push an element
later ⇒ monotone ⇒ terminates. `§CREW_CAP_FINAL crewRepacked=` 202 (Terminal) / 342 (HHS) / 20 (Duplex),
**spans unchanged**. Witness `viewer/tests/witness_4d_capacity_honoured.js` — red on all three before,
green on all three after.

**Why weeks of work missed it:** every existing witness reads zones, tasks, bars or dates. **Nothing
swept the emitted element times per trade.** The layer had no witness, exactly as §S65 found for the
template itself.

## The same Σ-crews error, three shipped sites
`4D_template.json` v1.0.0's formula was only the newest copy. Also fixed:
- `schedule_author.js` `§ZONE_WINDOW_COVERS_WORK` — `_wCrews` summed across trades.
- `witness_kit/generators/gantt_bars.js` `crewDaysOf` — same sum, so
  `witness_gantt_bar_is_its_task.js` was **measuring the lenient rule**. Under the strict per-trade
  rule it went 0/135 → **1/135**.
- That one red (Clinic "Superstructure — Roof - Main", 11% over) was a **harness bug, not a product
  bug**: the generator never passed `nameOverrides` to `materializeZones`, so windows were authored
  from UNOVERRIDDEN classification and measured against OVERRIDDEN elements. The browser is unaffected
  (`window.SEQUENCE_NAME_OVERRIDES` supplies it); node is not. Fixed → **0/136** under the strict rule,
  and Clinic gained a bar (32→33) because the classification finally matches production.
  *This is the second appearance of the drift the generator's own header already warns about — a
  mirrored predicate diverging from the real one, at a second call site.*

## Suite
`node tests/run_witness_suite.js` → **`green=57 new_red=1 known_red=7 total=65`**, both new witnesses
discovered and green. The one `new_red` (`witness_cpe_buildup_require_tm_first.js`) is **byte-identically
red with and without this change** — baselined by stashing the diff and re-running. Pre-existing and
unrelated (its own output: *"WITNESS IS BLIND — shipped source unexpectedly already has this gate"*).

⚠ **Harness note that cost a full false alarm:** a `/tmp/wt-*` worktree has **no `node_modules`**, so
5 witnesses died with `Cannot find module 'sql.js'` and the runner reported them as `new_red`.
`ln -s /home/red1/bim-ootb/node_modules node_modules` in the worktree before trusting any suite run
there. A crash is not a red.

## ⛔ RESUME HERE — three declared-vs-actual gaps remain OPEN, none of them started
The template now declares the right rules and the engine no longer breaches capacity. **Instantiation
is still not wired — nothing consumes `4D_template.json` at runtime.** In priority order:

1. **Phases/levels that silently vanish** (HOP 1 + HOP 3): Substructure absent entirely; MEP Final on
   3 of 4 levels; Finishes on 2 of 4. The template says absence must be REPORTED. Nothing reports it.
   Cheapest real win — a §-log at `deriveZones`, before any instantiation work.
2. **The tautological edges** (HOP 5): 25/25 lags are restatements of the dates they are meant to
   validate. Delete the `lagDays = sd.s - pd.e` derivation in `schedule_author.js` and write
   `task_sequences` from the template's `dependencies` instead. This is what makes CPM float real.
3. **Serial template vs overlapping engine** (HOP 2): 69.8d declared, 46.9d produced. Needs a user
   decision, not a guess — either the template declares the real overlaps (SS/lead edges, each with
   its `_why`) or the engine is made to honour the serial chain. **Do not pick one silently.**

---

# §S68 — WHY PHASE STACKING COULD NEVER BE REINED IN: THERE IS NO PHASE IN THE SOLVER (2026-08-25)

**User:** *"It is strange why all this while we cannot rein in phases stacking."*
**Answer, verified in code, not inferred:** because a phase has never been a thing the scheduler
constrains. It is not a tuning failure. There was nothing to tune.

## The proof — `schedule_gate.js` `placeNonst`, line 893-895
```js
var ph = collapsePhase(el.storey);          // ← el.STOREY, not el.phase
var pt = phaseTrade[ph] || {}, tg = baseMs, s;
for (s in pt) if (+s < el.seq && pt[s] > tg) tg = pt[s];
```
**`phaseTrade` is keyed by STOREY.** `collapsePhase()` (line 404) takes a *storey* and strips
`Ceiling`/`TOS`/`Soffit` suffixes off its name — it is a storey-name normaliser with a
phase-sounding name. Inside it, the second key is `el.seq`, a CLASS sequence number. So the only
thing in the engine named after a phase is `storey → seq → end`. There is no phase in it.

Every gate the solver actually applies:
| gate | what it constrains |
|---|---|
| `geoGate` / `wallGate` / `hangGate` / `openingGate` / `hostGate` | one ELEMENT vs the geometry below/around it |
| `claimCrew` | one TRADE's crew count |
| `bandGate` (§4D_BAND_MONOTONIC) | one TRADE across floors |
| `tg` via `phaseTrade` | lower `seq` on the SAME STOREY, incrementally |

**Not one of them says "MEP Rough-in on Level 2 waits for Architecture on Level 2".** And `tg` is a
running maximum over *elements placed so far*, so the first Architecture element on a storey meets a
nearly empty `phaseTrade` and starts immediately. `placeStruct` (PASS A) has no `tg` at all.

Then `deriveZones` (line 1190) **creates** the phases afterwards, by grouping already-placed
elements into `(phase, storey)` and taking each group's min-start/max-end. A phase bar is an
ENVELOPE over what the elements did. **An envelope cannot constrain what drew it.** That is the
loop, and it is the same loop §S67 HOP 5 measured from the other end: 25/25 zone edges are
restatements of the dates they are meant to validate.

## The symptom, measured (§HOP3B_PHASE_STACK, probe_4d_motion.js)
Same-level phase pairs that overlap, against a template that declares FS+0 (zero overlap):

| building | overlapping pairs | inverted start order | worst |
|---|---|---|---|
| HHS_Office_Federated | **10/29 (34%)** | 1 | Level 1 **Architecture sits entirely inside Superstructure, 13.4d** |
| Clinic | 13/65 (20%) | 3 | Second Floor Substructure vs Superstructure |
| Duplex | 7/38 (18%) | 3 | Level 2 Superstructure vs Architecture |
| Terminal | 18/109 (17%) | 1 | Aras 01 MEP Final vs Finishes 1.4d |

## Two reported causes that did NOT reproduce — checked, so they stop being suspects
- **"contaminated with MEP elements in there"** → `§HOP0B_CONTAMINATION` = **0 across all six
  buildings** (HHS/Duplex/Terminal/Clinic/JKR/LTU_AHouse). No MEP class sits in Substructure or
  Superstructure anywhere. The reclassifications that do occur (438 HHS, 469 Terminal, 699 Clinic)
  are all `IfcPlate` Superstructure→Architecture, the curtain-wall `NAME_OVERRIDE`, which is correct.
- **"HR 0 truly stacked"** → `§HOP2C_DAY0_STACK`: five of six buildings start structural-only. HHS
  is the lone exception and it is **2 Architecture elements out of 6839**. Real, but not the cause
  of what is being seen.

**The stacking is the phase-envelope problem above, not classification and not day 0.**

## The fix is the user's own ruling, and it is CHEAPER than today (§S66 RESUME step 2, now priced)
User: *"we make phases packed but sequential — user can then just drag them overlap if they want."*
Adopted as `4D_template.json` **v1.2.0** (PR #1534). Measured on HHS before adopting:

| plan | length | crew-legal? |
|---|---|---|
| packed+sequential, ladder on superstructure only (v1.1.0) | 41d | **NO** — PLUMBER 3.67 vs cap 2 (1.84×), HVAC_TECH 3.48 (1.74×) |
| **packed+sequential, ladder on EVERY level phase (v1.2.0)** | **49d** | **YES — zero breaches, every trade** |
| today's overlapping engine | 46.9d | only after the §CREW_CAP_FINAL repair |

**+4%. Two days.** The long-standing fear that serialising costs a much longer film is not supported
on this building. v1.2.0 declares §4D_BAND_MONOTONIC as programme logic for every level-scope phase
— a trade may not overtake ITSELF up the building; different trades still overlap across floors,
which is what a trade train is.

## Witness hardening (the user checks nothing visually — witness logs are the only channel)
The contract allows ONE `.redControl()`, which proves the witness can fail but **not that each gate
can**. Every gate added since v1.0.0 now carries a committed per-gate red control that injects that
gate's own real defect and asserts rejection. `§WITNESS_4D_TEMPLATE pass=29 fail=0` (was 15, was 10).

## ⛔ RESUME HERE
`4D_template.json` is now correct AND provably self-gating, and the engine no longer breaches crew
capacity. **Instantiation is still not wired — nothing reads the template at runtime.** The single
next step, which subsumes §S67's items 1-3:

> **Make `materializeZones` emit tasks FROM the template instead of grouping the solve.**
> Phases become first-class tasks with authored durations (`duration_rule`, per-trade) and authored
> FS+0 edges (`dependencies`, both ladders). The element solve then FILLS each task instead of
> defining it — which inverts today's `elements → phases` into `phases → elements` and is the only
> change that can make a phase constraint exist at all.

Everything else on the open list (silent absent phases, tautological edges, serial-vs-overlap) is
a consequence of that one inversion, not a separate job.

---

# §S69 — THE INVERSION IS BUILT AND TESTED ON HOSPITAL. NOT YET LIVE. (2026-08-25)

**User: "Proceed and test on Hospital."** Done — bim-ootb **PR #1535**, witness 11/11 on
Hospital + HHS_Office_Federated + Duplex.

`materializeZones(db, rules, {…, template})` now runs **phases → elements**: one task per
(phase × real level) the template declares, priced by `duration_rule` (per-trade work content),
placed by `dependencies` (FS+0 within a level + the §4D_BAND_MONOTONIC ladder across levels),
levelled against `capacity_rule`, with elements **assigned** to tasks instead of defining them.
`instantiateTemplate()` is pure and node-testable — no DB, no globals.

**⚠ OPT-IN, DARK.** No call site passes `opts.template`, so every existing path is byte-identical.
Suite: `green=58 new_red=1 known_red=7` (the +1 green is the new witness; the red is the same
pre-existing unrelated one baselined in §S67).

## Measured — legacy vs template, same DBs, 24h shift
| building | legacy | template | delta | levelling |
|---|---|---|---|---|
| **Hospital** (63,182 els, 8 levels) | 356d · 36 tasks · 58 edges | **318d · 35 · 55** | **−11%** | 7 tasks delayed, +81d |
| **Terminal** (48,428 els) | 132d · 73 · 107 | **96d · 71 · 98** | **−27%** | 11 tasks delayed, +226d |
| HHS_Office_Federated | 47d · 17 · 25 | 49d · 17 · 25 | +4% | none needed |
| Duplex | 10d · 19 · 27 | 12d · 18 · 26 | +20% (2 days) | none needed |

**Shorter on the two big buildings, two days longer on the two small ones** — and every quality
number moves one way only:

| gate | before | after |
|---|---|---|
| same-level phase overlap | HHS 10/29 (34%), Duplex 7/38, Terminal 18/109 | **0/65, 0/29, 0/33** |
| persisted lags | `lagDays = sd.s - pd.e` — 25/25 the answer restated as its own constraint | **every lag = 0, the template's declared value** |
| CPM float | 17/17 critical, float 0..0 | **slack exists on real edges** |
| absence | silent | **§TPL_PHASE_COVERAGE / §TPL_PHASE_ABSENT / §TPL_PHASE_GAP** |
| crew capacity | breached until the §CREW_CAP_FINAL repair | **legal by construction + levelling** |
| element loss | unchecked | **63,182 / 63,182 on Hospital, gated** |

## TWO REAL DEFECTS THE WITNESS CAUGHT IN MY OWN INSTANTIATOR — both fixed here
1. **Hospital breached PLUMBER: peak 3.26 vs cap 2.** The ladder stops a phase overtaking *itself*;
   it does **not** stop MEP Rough-in on level 5 and MEP Final on level 2 sharing one plumber pool.
   Fixed by applying `capacity_rule` as ordinary **delay-only resource levelling** in topological
   order. **HHS and Duplex never showed it — it takes 8 levels to expose.** This is the argument for
   testing on Hospital rather than the small buildings.
2. **A building-scope phase silently dropped elements.** Substructure emits its one task on the
   lowest level and my first cut *skipped its own cells on every other level* — 63,181 of 63,182
   elements assigned on Hospital. **Invisible in tasks, edges, days and phase coverage; only the
   element count caught it.** Now the building-scope task collects its elements from every level,
   gated by `every-element-lands-in-a-task`.

New §-logs: `§AUTHOR_TPL` · `§TPL_PHASE_COVERAGE` · `§TPL_PHASE_ABSENT` · `§TPL_PHASE_GAP` ·
`§TPL_CAPACITY_LEVEL` · `§TPL_ELEMENT_ORPHAN`.

## ⛔ RESUME HERE — ONE DECISION, THEN ONE WIRING JOB
**The decision (user's, not a session's):** flip the live generation path to the template.
Concretely: pass `template` at `time_machine.js:6858`, `:6900`, `:5287` and `schedule_author_ui.js:284`.
That changes every building's Gantt on the next generate — Hospital −11%, Terminal −27%,
HHS +4%, Duplex +2 days, and phases stop overlapping anywhere.

**The wiring that goes with it:** the viewer must actually LOAD `rates/4D_template.json`.
`viewer.html` never calls `loadSequenceRules()` (§S65 STAGE 1) — do **not** repeat that here.
Add a `load4DTemplate()` beside it and call it from `viewer.html`, or the file stays a document
nothing reads. `sw.js` `CACHE_VERSION` + `PRECACHE_ASSETS` must include the JSON in the same PR.

**Not yet examined, and it is the next real question after the flip:** the movie still plays the
element solve, while the bars now come from the template. Those are two timelines again — the exact
shape `§ZONE_DISPLAY_AUTHORING` was written for. Either remap elements into their task's window, or
measure the disagreement and decide. **Do not assume they agree; nothing has checked it yet.**

---

# §S70 — THE MOVIE vs THE BARS: MEASURED FIRST, THEN BOUND (2026-08-25)

**User: "go, measure the movie vs bars disagreement first."** Done, and the measurement changed the
plan: **§S69 alone was not shippable.** bim-ootb **PR #1536**, witness 7/7 on 71,140 played elements.

## The measurement — and why the legacy path looked fine
A legacy bar was an **envelope** over the element solve (`deriveZones` took each group's
min-start/max-end), so an element was inside its own bar **by construction**. §S69 makes the bar an
**independent statement** authored from `4D_template.json` — and the pair immediately went wrong.

| building | LEGACY inside its own bar | **§S69 TEMPLATE** inside its own bar |
|---|---|---|
| Hospital | 62,494/63,182 = **98.9%**, worst 0.5d | 34,438/63,182 = **54.5%**, worst **274.3d late** |
| Terminal | 46,125/48,428 = **95.2%**, worst 0.5d | 17,153/48,428 = **35.4%**, worst **123.9d late** |
| Duplex | 971/1,119 = **86.8%**, worst 0.5d | 210/1,119 = **18.8%**, **81.1% start BEFORE their bar** |
| HHS_Office_Federated | — | 4,169/6,839 = **61.0%**, 26.3% start before their bar |

The legacy 0.5d worst case is pure day-rounding. **Shipping §S69 on its own would have made the
user's reported hell — things appearing when no bar says they should — dramatically worse.**
This is the answer to "is the 4D_template a deal breaker": **the template is necessary and correct,
and the template ALONE is a regression.** Both halves or neither.

## The bind
Per task, an **order-preserving affine map** of that task's own solve envelope `[minStart, maxEnd]`
onto its authored window `[s, e]`. Monotone, so **every ordering the solve was expensive to win
survives untouched** — support-before-supported, host-before-hosted, §4D_BAND_MONOTONIC — because a
monotone map cannot swap two times. Relative widths survive (uniform scale per task). A degenerate
task (every member solved at one instant — the **"zero minute stacking"** shape reported by name) is
spread evenly across its window instead, which is the one case an affine map cannot handle.

Same seam `§ZONE_DISPLAY_AUTHORING` used, run the other way: that authored windows FROM the display
timeline; this authors the display timeline FROM the windows. Only one can be the source, and after
§S68 it is the template.

## After
**100.0% inside on all four buildings.** 0 early, 0 late, worst offset **0.0d**, movie span == bars
span exactly (1.00× on all four), **0 order inversions** vs the raw solve (0/63147, 0/48356, 0/6822,
0/1101). Better than the legacy path ever was, with the template's phase discipline on top.

## A REAL WITNESS BUG, caught on its first run
`remap-preserves-solve-order` FAILED. **Cause was the witness, not the remap:** task ids are
phase+storey derived, so `TASK_SUPERSTRUCTURE_LEVEL_1` exists in Hospital, HHS *and* Duplex, and
grouping on `taskId` alone pooled three buildings into one "task" and manufactured inversions.
Now keyed by `building|taskId`; `movieSpanEqualsBarsSpan` had the same collision and is per-building
too. **Worth recording as a pattern: a fleet witness that groups by an id derived from phase/storey
must key on the building as well.**

## WHAT "FLOAT EXISTS" MEANS — plain English
**Float = how many days a task can slip before it delays the whole job.** Zero float means "move
this by one day and the finish date moves with it" — that task is on the *critical path*.

Before, `schedule_author.js` wrote each edge's lag as `lagDays = sd.s - pd.e` — the gap it *observed*
between two tasks' dates, stored as the *rule* those tasks must obey. Every edge was therefore
exactly tight, so **every task had zero float and CPM reported 17 of 17 tasks critical**. That is not
a finding, it is a tautology: the constraint was copied from the answer, so it can never disagree
with it. A schedule where everything is critical tells you nothing about what to worry about.

Now the lags come from the template (all FS+0, declared), independent of the dates. Levels run in
parallel under the ladder while each level's own chain is packed, so **some tasks genuinely have
slack and some do not** — the critical path becomes a real, discovered subset instead of "everything".
That is what makes the Gantt worth reading: it can finally tell you *which* delay costs you the job.

## ⛔ RESUME HERE — one wiring job, unchanged from §S69, now with both halves ready
Still **dark**: no call site passes `opts.template`. To flip it live, in ONE PR:
1. Pass `template` (and use the returned `displaySchedule` as the movie timeline) at
   `time_machine.js:6858`, `:6900`, `:5287` and `schedule_author_ui.js:284`.
2. **Make `viewer.html` actually LOAD `rates/4D_template.json`.** `viewer.html` never calls
   `loadSequenceRules()` (§S65 STAGE 1) — do not repeat that. Add `load4DTemplate()` beside it and
   call it, or the file stays a document nothing reads.
3. `sw.js` `CACHE_VERSION` + `PRECACHE_ASSETS` must include the JSON in the same PR, or existing
   users never get it.

Fleet effect on flip: Hospital 356d→318d (−11%), Terminal 132d→96d (−27%), HHS 47→49, Duplex 10→12;
phase overlap → 0 everywhere; every element inside its own bar.

---

# §S71 — NO. THE WITNESSES DO NOT PROVE "IT ALL WORKS". HERE IS EXACTLY WHAT THEY PROVE. (2026-08-25)

**User: "are u saying your WITNESS logging is proving it is all working?"** No. That question was
right to ask, and asking it produced a red result within minutes. Scorecard, honestly:

## ✅ What IS proven — named layer, real data, committed witness
| witness | what it actually proves | scope |
|---|---|---|
| `witness_4d_template.js` 29/29 | the template FILE is self-consistent, derived from `sequence_rules.json`, and **each gate can fail** | a document, **not behaviour** |
| `witness_4d_capacity_honoured.js` 4/4 | no trade exceeds `max_crews` in the emitted element times | HHS · Duplex · Terminal |
| `witness_4d_template_instantiation.js` 11/11 | persisted task grid: 0 phase overlap · lags from the template · float exists · ladder holds · window covers work · grid crew-legal · **63,182/63,182 elements assigned** · absence reported | Hospital · HHS · Duplex |
| `witness_4d_movie_binds_bars.js` 7/7 | 71,140 played elements inside their own bar · order preserved · no zero-width · span match | Hospital · HHS · Duplex |
| `run_witness_suite.js` | `green=59 new_red=1 known_red=7` | fleet |

## ❌ What is NOT proven — and one of these just came back RED
1. **⛔ MIDAIR GOT WORSE. Measured this session (§S71 probe).** The user's own acceptance bar —
   *"all i want is not to see a single item hanging in midair that is all"* — judged by `census()`
   sliced verbatim out of `witness_midair_zero.js`:

   | building | RAW solve | **TEMPLATE+REMAP** | delta |
   |---|---|---|---|
   | **Terminal** | 226 (0.47%) | **456 (0.94%)** | **+230, doubled** |
   | Hospital | 139 (0.22%) | 159 (0.25%) | +20 |
   | Duplex | 17 (1.52%) | 21 (1.88%) | +4 |
   | HHS_Office_Federated | 147 (2.15%) | 150 (2.19%) | +3 |

   Worst on Terminal: `IfcLightFixture`/MEP Final starts **34.3 days before** the thing it touches.
   **Cause is structural, not incidental:** §S70's map is order-preserving *within* a task and says
   nothing *across* tasks, while the template moves whole tasks relative to each other. A support
   relation spanning two tasks — a fixture in MEP Final hanging off a ceiling in Architecture on
   another level — is honoured by the raw solve's geometry gates and **discarded** when each task is
   rescaled into its own window independently.
   **Baseline caveat, stated so nobody over-reads it:** the comparison above is against the RAW
   solve, *not* against what users see today. The live movie runs `_displayTimeline` →
   `CpmSchedule.run` → `_midairAudit`, which repairs midair to the W-MZ-2 locked baselines. **The
   template path bypasses that repair entirely — it currently has NO midair repair at all.** A
   live-vs-template comparison has not been run and must not be inferred from these numbers.

2. **None of it is live.** No call site passes `opts.template`. Every number above describes a code
   path no user reaches.
3. **The drawn bars are unchecked under the template.** `witness_gantt_bar_is_its_task.js`'s
   generator calls `materializeZones` *without* a template (verified: `witness_kit/generators/gantt_bars.js:77`),
   so it exercises the LEGACY path only. The hell was reported **visually** — bars overstacked. The
   DATA behind them is now clean; the DRAWING of that data has never been tested.
4. **Nothing has run in a browser.** All node. The viewer's real load path (fetching the JSON,
   ordering against generation, `sw.js` caching) is untested — and §S65 STAGE 1 is precisely that
   failure: a correct JSON that nothing ever loads.
5. **A witness cannot tell you the programme is RIGHT.** 24h shifts, six phases, FS+0, these trades
   — all *authored*. The gates prove self-consistency and physical legality on crew capacity. They
   cannot prove the plan matches how anyone actually builds.

## The honest summary
The witnesses prove **specific, named, layer-scoped claims** — and they are strong enough that they
caught **four real defects in my own work this session**: the PLUMBER cap breach on Hospital, the
building-scope phase silently dropping elements (63,181 of 63,182), the cross-building task-id
collision inside the witness itself, and now the midair regression. **That is what they are for.**
What they do not do is add up to "it works". Item 1 above is a live open defect and item 2 means
none of it has reached a user.

## ⛔ RESUME HERE — one design decision, and it is not a session's to make
Midair under the template needs one of:
- **(a) repair after the remap**, constrained to keep every element inside its own bar — may be
  infeasible where the support genuinely sits in a later task;
- **(b) feed cross-task support relations back into the template's dependency graph**, so a task
  cannot precede a task its members physically rest on;
- **(c) accept a bounded midair count** as the price of authored phases.

**(b) is the only one that fixes the cause rather than the symptom, and it changes what the template
means** — the template would stop being purely authored logic and start absorbing geometry. That is
the user's call, not a guess to make while wiring.

---

# §S72 — THE STOREY-ELEVATION INJECTION GAP, MEASURED (2026-08-26)

**User: "in deriving storey or elevation for buildings since you said Terminal doesn't? It injects
such metadata one time first time if absent."** Correct, and this file already carries the rule it
depends on — §S64's close-out names `deriveStoreyMergeMap` (§S18) as *"storey bands merged from
EXTRACTED `IfcBuildingStorey.Elevation`, never inferred from element Z"*. The Bar-model lane
(`prompts/4D_BAR_MODEL.md`) passed `storeyMergeMap = null` in every probe and never questioned it.

## What I got wrong, twice
1. Reported the elevations **ABSENT**. They are not: `spatial_structure` carries `center_z` on the
   storey rows — the storey entity's own extracted placement. I grepped for a column named
   `elevation`, did not find one, and stopped. `center_z` IS extracted data and qualifies.
2. Proposed **synthesising** elevations from element Z. Forbidden — this file's own §S64 line and
   §PATHS NOT TO TAKE #7 both rule it out. Withdrawn.

## Wired it as the code intends. It is a NO-OP, and the reason is the real finding.

| building | storey rows in `spatial_structure` | distinct element storey labels | merged by §S18 |
|---|---|---|---|
| **Terminal** | **6** | **23** | **0** |
| HHS_Office_Federated | 3 | 4 | 0 |
| **Hospital** | **0** — no `spatial_structure` table at all | 8 | cannot run |
| **Duplex** | **0** — no table | 4 | cannot run |

`deriveStoreyMergeMap` is correct. It has nothing to merge because **extraction never emitted a
storey row for 17 of Terminal's 23 storey names** — `GROUND FLOOR LEVEL`, `03 SECOND FLOOR LEVEL`,
`Ceiling Level 01/02/03/04`, `Aras Kedai`, `Aras Jalan`, `00 Aras Asas` … Terminal is FEDERATED: each
discipline file names the same six physical floors differently, and only the ARC file's six reached
`spatial_structure`.

**And 33,848 of Terminal's 48,428 elements (70%) carry `storey = 'Unknown'`**, reassigned at runtime
by `_buildScheduleElements`' `assignStoreyByZ` to the nearest real storey by median centre-Z.

## Why this is load-bearing for 4D, not a rooms-lane detail
Terminal is scheduled as **22 levels when it has 6 floors**. `prompts/4D_BAR_MODEL.md` §9.5 measured
level granularity as the exchange rate between midair and band monotonicity — Terminal at 22 bands
gives midair 336, at 6 bands **86**. The Bar model's one remaining regression against the shipping
engine (Terminal midair 513 vs 226) is very likely this and not the scheduler.

## The remedy is the one already written, not a new mechanism
`WalkerDoctrine.md` **§14** (auto-infuse if absent, label `≈`, never presented as real) + **§15**
(version-stamped, self-healing on compiler change). §14's own words: *"carry `spatial_structure`
through every strip/consolidate step, same as any other ARC table"* — for storeys as well as rooms.
The injection must emit an `IfcBuildingStorey` row, with its EXTRACTED elevation, for **every** storey
the elements reference — including the federated discipline files' own names.

**⛔ NOT BUILT. Do not schedule Terminal's granularity as settled until it is.** Two buildings of four
have no `spatial_structure` at all, so this is a fleet-wide extraction gap, not a Terminal quirk.
Cross-ref: `prompts/ROOM_INJECTION_CONSOLIDATED_REVIEW.md` (same mechanism, same doctrine) and
`prompts/4D_BAR_MODEL.md` §10.3 item 5 — which named "fix the extractor" without knowing the
elevations were already half-present.

## §S72.1 WHAT-IF MEASURED — the injection IS the Terminal fix, and it retires one adjustment

> ⚠ CORRECTED by §S72.2 below — this section's "EXTRACTED" label for Terminal's 6 storey rows is
> imprecise. §S72.2 found those rows are `room_walker.js`'s own COMPILED (injected) output, not real
> extracted `IfcBuildingStorey` data — Terminal has ZERO real extracted storeys. The midair numbers
> (513 → 48) and the fix direction are unaffected; only the word "extracted" is wrong here.

Simulated the post-injection world: Terminal's 23 element storey labels assigned to its 6 EXTRACTED
storey bands (band edges from `spatial_structure.center_z` — extracted placement, never an elevation
derived from element Z). **What-if only; the real path is the §14/§15 injection.**

| Terminal | levels | bars | midair | bandInv | levelCorrected | forced | span |
|---|---|---|---|---|---|---|---|
| current (22 labels) | 22 | 74 | **513** | 0 | 1,986 | 5,779 | 126d |
| **6 extracted storeys** | 6 | 31 | **48** | 28 | **0** | 1,703 | 105d |

**Midair 513 → 48 — 4.7× better than the shipping engine's 226, and 21 days shorter.** The Bar
model's only remaining regression is a data gap, not a scheduler gap, as §S72 suspected.

### ⚠ DRIFT FOUND IN MY OWN WORK — `correctLevelsByGeometry` is a symptom patch
It fired **1,986 times on Terminal and 0 times once the storeys are right**. It was compensating for
wrong storey labels, nothing more. On the real data it also COST midair (Terminal 336 → 513 when it
landed). **Demote it to a silent safety net or delete it** — do not carry it forward as if it models
something. `prompts/4D_BAR_MODEL.md` §8's delete list should gain it.

Still earning their place, unchanged by this: the contact gate (§BAR_CONTACT), ANY-OF vs ALL-OF
needs, `ceiling_link` (the upward edge), and the per-trade ladder (§BAND_BY_TRADE). `level_bands`
stays valid but stops being the primary control once levels are real.

`bandInv` rises 0 → 28. Small, and expected: 6 genuine floors give real adjacency to violate where 22
naming variants gave almost none. Judge it on real floors, not on label count.

## §S72.2 CORRECTION — the injector EXISTS, has already RUN, and skips one case (2026-08-26)

**User: "Room Injection as done under find panel needs source IFCs? Clarify. AFAIK, it's all
extracted from building DB."** Correct. I briefed a subagent to hunt for source IFCs — wrong premise,
and the agent died on an API error before acting on it. Nothing was built on it.

**`viewer/lib/room_walker.js` `writeRooms()` already injects storey rows**, from the DB alone:
`guid='STC_<name>'`, `object_type='COMPILED'`, `center_z = stZ[st]` (mean wall centre-Z for that
storey, `room_walker.js:1191`), idempotent on the `STC_` prefix, with its own `§APPROX` comment.
`rooms_meta` carries `ROOM_WALKER_V` — the §15 version stamp. Node-runnable (`module.exports`).

**This also settles the doctrine tension I raised in §S72.** §S64's *"never inferred from element Z"*
forbids SILENT inference. The shipped injector derives storey Z from wall centres and LABELS it
`COMPILED` — the `≈` convention of WalkerDoctrine §14. Labelled is sanctioned; silent is not.

### And it has already run on Terminal — all six storey rows are its output
```
STC_Aras_01 … STC_Aras_Bumbung   object_type = COMPILED
```
**Terminal has ZERO real extracted storeys.** What §S72 called "extracted elevations" is compiled
output. Ran the walker on a copy to confirm: 54 rooms compiled, 7 storeys in `stZ`, **6 rows written,
`deriveStoreyMergeMap` merged 0, 6 distinct bands** — unchanged.

### THE GAP IS ONE LINE, inside the existing injector
`room_walker.js` `writeRooms()`:
```js
if (!allrooms.some(function (r) { return r.storey === st; })) return;
```
A storey row is emitted **only where a room was compiled**. Terminal has 23 distinct
`elements_meta.storey` values; rooms compiled on 6; the other 17 (`GROUND FLOOR LEVEL`,
`Ceiling Level 01-04`, `Aras Kedai`, `Aras Jalan`, `00 Aras Asas` …) get no row, so §S18 has nothing
to merge and 4D schedules Terminal as 22 levels instead of 6.

**⛔ FIX — inside the existing mechanism, no new one:** emit a `COMPILED` storey row for EVERY
distinct `elements_meta.storey`, not only room-bearing ones. Same `STC_` prefix, same label, same
idempotency, same version stamp. `stZ` must widen correspondingly (it is currently built only from
storeys that have walls). Payoff already measured in §S72.1: **Terminal midair 513 → 48**, span
126 → 105d.

**⚠ Belongs to the ROOM lane's file, not this one** — `room_walker.js` is theirs. Cross-referenced
in `prompts/ROOM_INJECTION_CONSOLIDATED_REVIEW.md`; 4D is the consumer that exposed it.


### §SCHED_TASK_BUCKET_SPLIT_BRAIN (2026-09-12/13) — FIXED. A persisted schedule that no longer
### agreed with its own DB was replayed forever, and it held an 8,899 m² floor off the screen.
**Provenance.** Traced from `prompts/MEP_CLASH_REVEAL_MOVIE.md` §88, where Hospital's ground floor read
as bare earth. The RENDERING half stays there; the schedule half is this lane's. Shipped as
**§KERNEL_OPS_SCHED_AGREE (#1727)**.

**THE CAUSE — 39 self-contradictory ops out of 63,415, and 28 of them are one wall type.**
Comparing each op's OWN `phase` against its OWN `_task` bucket:
```
28   phase='Substructure'  vs  _task='Architecture_Envelope'   ← Level 1 "Basic Wall:Foundation - 375mm Concrete"
11   phase='Architecture'   vs  _task='Superstructure'
```
No judgement about which table is authoritative is needed — **the op contradicts itself**.
`rates.js`'s `foundation_wall_substructure` override ("a wall NAMED Foundation is substructure",
`sequence: 1`) reached `phase`/`seq`/`_cell` but NOT the task bucket, which came from the bare class
table (`IfcWallStandardCase → Architecture Envelope`). The support predicate reads the seq-1 answer,
so the wall counts as a structural carrier; the timing reads the Architecture-Envelope answer, so it
is poured **13.47 h after the slab it carries**. 20 of the 28 sit in-extent under that slab, so
`_buildXraySupportCache` staged it and §XRAY_STAGING_REMOVED correctly refused to draw an unsupported
floor. **The tables were right; only the cached answer was wrong.**

**WHY IT SURVIVED EVERY RUN.** `injectGantt()` sits behind `if (!_placeOps.length)` in
`_activateAsync`, so a shipped 4D DB never re-derives — **0 `§GANTT_SOURCE` lines in 18 Hospital bakes
and in four headful-GPU browser runs alike**. The only staleness gate was
`_genVersion !== _GANTT_CACHE_VERSION`, which asks *"which algorithm made these ops?"* and never *"are
they still true of this DB?"*. Hospital was the ONLY building where that equality held: Terminal and
JKR ship no `kernel_ops`, HHS's are stamped 38 against a current 39 so they are cleared and re-derived.
The ops were also on a different calendar from their own tasks (ops `2026-09-10..2027-07-17` vs tasks
`2026-01-01..2026-11-26`) while `schedules.display_authored=1` asserts the two are the same thing —
the signature of a `tasks` re-authoring that never invalidated the ops.

**BROWSER AND BAKE ARE THE SAME PATH — measured, not assumed.** Alt+C → `#cpe-ok` → `finish('ok')` →
`__maxqBake`, and `cli_silent_bake.js`, both call `tmHasExistingSchedule` → `tmActivateForBake` →
`activate` → `_activateAsync`. Four runs (cold profile, warm profile, Alt+C, plain TM open) all
produced `§TM_OPS_CHECK total=63415 place=63415`, `capActive=false`, `staged=544`, and bare earth for
13.47 h. ⚠ An earlier claim in this section that the browser rendered it correctly was NOT reproduced;
the one mechanism consistent with it is a profile that derived once and now holds
`§CACHE_PUT key=gantt:v39:Hospital` (correct ops) served via `§GANTT_CACHE_HIT`.

**THE FIX (#1727).** `_kernelOpsSchedStale` now also asks whether the ops still agree with the DB —
a `_task`-vs-`task_elements` clause and, when `display_authored=1`, an op-window-vs-task-window clause.
Chosen over bumping `_GANTT_CACHE_VERSION` by measurement: the version bump costs **650 ms → 7–8 s per
activate fleet-wide** and re-freezes at the next re-authoring, while the agreement test costs
**2.4–2.9 ms when it trips, 11.7–19.5 ms when the ops agree** (~1.8 % of a warm open) and makes the
decision a property of the DB. Freshly derived ops measure `noTask=0` and land inside the task window,
so there is no re-derive loop.

**MEASURED AFTER — browser cold, browser warm, and silent bake all agree:**
```
§KERNEL_OPS_SCHED_AGREE verdict=window → §KERNEL_OPS_SCHED_VERSION stale ... cleared 63415 ops
§GANTT_SOURCE captured tasks=41 covered=63415 pct=100
§TIME_MACHINE ON — 321 days, 1/10/2026 → 11/26/2026        (was 310 days from 2026-09-10)
§XRAY_EDGES staged=501/63415                                (was 544)
wall 3iM76qwej9Tf9ttHcbQrdG → TASK_Substructure_Level_1     11.8 days BEFORE the slab
map['0e8pm26Tv5vPrj6zU55MOH'] === undefined                 the slab leaves staging
```
and the Level 1 concrete deck is present in the bake's own frames.

**W-SCHED-COHERE — `viewer/tests/witness_schedule_coherence.js`.** Node, DB-only, no GPU, <1 s per
building. It lives here and NOT in `cli_silent_bake.js`: the bake PLAYS the timeline and must not
carry a second opinion about it (user: *"bake follows 4D timeline and not has extra script to it"*),
and an audit in the harness would have to re-type the phase/task semantics — the trap this section was
itself caught by. Gates: **G-SC-SELF** (own `phase` vs own `_task`; blocking against a `BASELINE`,
fails on an increase), **G-SC-TE** (reported, never blocking), **G-SC-CARRY** (per IfcSlab, in-extent
carriers finishing after it — the number that becomes an invisible floor).

| building | selfContradictory | slabsWithLateCarriers | lateCarriers | worst |
|---|---|---|---|---|
| `Hospital_silent` | 39 | 19 | 60 | 55.55 h |
| `HHS_Office_Federated_silent` | 8 | 5 | 6 | 0.38 h |
| `JKR_extracted` | **0** | **70** | **226** | **257.30 h** |

*(G-SC-CARRY reads the FROZEN rows in the file; it is not what the Time Machine now plays — the played
number is `§XRAY_EDGES staged=501`.)*

**⚠ STILL OPEN, AND NOT THIS FIX'S SHAPE — JKR.** 70 slabs with late carriers, 226 of them, worst
257.30 h, with **ZERO self-contradictory ops** and no `kernel_ops` to blame. G-SC-SELF and G-SC-CARRY
are independent conditions; fixing the task-bucket classifier does not touch JKR. Whatever puts a slab
ahead of its carriers there is unfound. Hospital's own 19 should be re-checked against it.

**⚠ ALSO OPEN — a pre-existing race the fix now REACHES.** `KernelOps.sealFrom` runs async per-row
UPDATEs that collide with `_writeScheduledChunked`'s prepared statement: `§GANTT_CACHE_ERR ... type=string
value=Statement closed`, 1 bake run in 4 on Hospital. Proven pre-existing (a control with the fix inert
still raced; HHS takes the same path today and survives only because its write is 10× smaller). Not
caused by #1727 — but #1727 routes Hospital down the derive path for the first time, so it turns a
latent race into a 1-in-4 failure on the largest model. `sealFrom` dates from `0a8ef10b`, 2026-06-08.
