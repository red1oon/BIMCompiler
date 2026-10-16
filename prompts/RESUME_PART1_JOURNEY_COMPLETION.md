<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# ⚠ DO NOT REMOVE — RESUME: close the Part 1 "whole sphere" journey (2 real items + 1 doc follow-up)

```
SCOPE: 2026-07-26 audit (prompts/ABOUT_BOX_CONSOLIDATE.md §PART 5) checked the full Part 1 user journey —
drop IFC → blank Viewer → merge → Modeller ARC-remodel → Find → ERP → Project Order → Time Machine
Budget-vs-Actual — leg by leg, against real code, not memory. 4 of 6 legs are real/live (spot-verified).
TWO real items are open, both precisely diagnosed, ready to implement without re-discovery. Work top to
bottom. Read the log after every run. Edit target = `~/bim-ootb` — HOOK-BLOCKED, work in a `/tmp/wt-*`
worktree (check `git worktree list` first, reuse if one already exists for this branch).
```

## Item 1 — fix the diff/variance trigger disconnect (Leg 3) — small, precise, do this first

**Root cause, exact, already found — no further diagnosis needed:**
`import_own.js`'s `openProject()` (~line 180) only opens the diff/variance view when:
```js
if (/revised/i.test(record.versions[vi].key || '')) {
```
But **nothing that creates a new version ever sets `key` to contain "revised."** Both merge-accept sites
push the dropped file's own filename verbatim:
- `import_own.js:384` (single-file accept path): `_rec.versions.push({ key: file.name, ... })`
- `import_own.js:701` (multi-file/merged accept path): `_rec.versions.push({ key: _newVersionKey, ... })`
  where `_newVersionKey = buildingName + '.ifc'`

So dropping a genuinely updated IFC and accepting the `_confirmVersionMerge()` popup (the real, e2e-witnessed
feature — `tests/witness_landing_version_merge_e2e.js`, `§E2E_RESULT pass=true`) does **not** reliably open
`viewer/diff.js`'s variance overlay — a real, Playwright-tested feature (`tests/specs/08-diff.spec.js`) that
sits idle because its trigger condition is never met by the code that's supposed to feed it. This ALSO
silently disables `diff.js`'s `› VO — fold to ERP amendment` button (only renders when `A.diffDb` is
populated) — so this one bug blocks both the visual variance overlay AND the Variation-Order-to-ERP path
for any building merged via drop-and-accept.

**The fix (as recommended, user confirmed "yes do this"):** don't rename anything to contain "revised" —
that's a filename-sniffing hack, not a real signal. Instead:
1. At both `versions.push(...)` sites (384, 701), when `_mergeTarget` is set (i.e. this push IS an accepted
   version-merge, not a brand-new project), stamp an explicit boolean/marker on the pushed version object —
   e.g. `isRevision: true` — instead of relying on the `key` string. This is a real signal set exactly once,
   at exactly the moment the code already knows "this is a merge-over-existing" (the `if (_mergeTarget)`
   branch already guards these lines — see the surrounding code, don't restructure it, just add the field).
2. Change `openProject()`'s trigger (~line 180) from `/revised/i.test(record.versions[vi].key || '')` to
   check the new marker instead: `record.versions[vi].isRevision`. Keep iterating from `vi = 1` as today
   (skip v0, the baseline) — only the trigger condition changes, not the loop structure.
3. **Do not touch** `_stripVersionSuffix()` (~line 432-444, the `/[_\-]revised$/i` pattern list) — that
   regex is for a DIFFERENT purpose (catalog-similarity DETECTION when deciding whether to show the merge
   popup at all) and is unrelated to this bug. Confirm you're editing the right regex before touching
   anything — there are two "revised" mentions in this file for two different reasons.

**Verify, don't assume fixed:**
- Re-run `tests/witness_landing_version_merge_e2e.js` first — it must still pass unchanged (this fix must
  not touch the merge/popup logic the witness proves, only what happens on RE-OPEN afterward).
- Extend it (or write a sibling witness) to additionally: after step 2's ACCEPT (SampleHouse_ARC → 
  SampleHouse_ARC_v2, merged), call `openProject()` on that record and assert the resulting viewer URL
  contains a `&diffdb=` param (today it would NOT — that's the bug; after the fix it MUST). This is the
  actual regression proof — a witness that doesn't touch this assertion doesn't prove the fix.
- Manually confirm `diff.js`'s variance overlay + `› VO` button actually render when that URL loads (real
  browser, per this project's whitebox-first discipline — `§`-log evidence, not a screenshot).

## Item 2 — build the blank-canvas first-touch entry (Leg 1) — real build, not a small fix

**Current state, precisely (don't re-derive):**
- Today's ONLY live multi-IFC-merge path is the LANDING PAGE: `index.html` → `import_own.js` →
  `#m-import-zone` (opened as a hub overlay from the landing page, not a blank canvas) → auto-opens a NEW
  TAB at `viewer/viewer.html?db=...` already populated. There is no "land directly in an empty Viewer/
  Modeller and drop your first IFC there" entry point.
- **Found and worth knowing before touching this:** `viewer/viewer.html` itself ALSO loads a drop-zone
  script (`<script src="import.js?v=3">`, i.e. `viewer/import.js`, which has its OWN independent
  `importMultiIFC` implementation and looks for `document.getElementById('import-zone')`) — but **no
  element with `id="import-zone"` exists anywhere in `viewer.html`'s markup**. Confirmed via grep, not
  assumed: `viewer/import.js`'s drop-zone wiring is DEAD CODE today — it runs, finds no host element, and
  silently no-ops. **Do not resurrect this orphaned path.** It is a second, independent, unmaintained
  implementation of the same feature `import_own.js` already does correctly and provably (e2e-witnessed).
  Building Leg 1 on top of the orphaned `viewer/import.js` would resurrect a stale, divergent code path
  instead of reusing the proven one — against this project's own reuse discipline.
- **Recommended shape:** reuse `import_own.js`'s proven `handleImportFiles`/`importMultiIFC`/
  `_confirmVersionMerge` logic as the SAME mechanism, just triggered from a new navigation entry rather than
  the landing hub. Two sub-decisions genuinely open, not decided here (per the original §10 spec in
  `prompts/Modeller/COMPETITIVE_FREECAD_INTEROP.md`):
  1. Viewer or Modeller as the destination — still open, needs a real decision before building.
  2. Whether the blank canvas is a NEW page/route, or `viewer.html`/`modeller.html` themselves gain a
     "nothing loaded" empty state that shows the (reused, not orphaned) import zone directly.
- Grounding for "DB" scope: already resolved 2026-07-26 — DB means our own compiled `.db` format only, not
  a third-party IFC-derived DB (that's the separate, still-not-built §4 "accept outside FreeCAD IFC" item —
  don't conflate the two).
- **No card/list UI** — same hard constraint as every other landing-flow item in this codebase
  (`LANDING_MULTIMERGE_SAVEOPEN_RESURRECT.md`'s "HARD CONSTRAINT", still binding here).

**DONE WHEN (both items):**
1. Item 1: fix landed, witness extended and green, live-verified the diff/VO button actually renders on a
   real accept-merge-then-reopen sequence (not just the trigger condition in isolation).
2. Item 2: the two open sub-decisions above are made (not defaulted silently), blank-canvas entry built
   reusing `import_own.js`'s proven logic, live-verified: land on the entry → drop 2+ IFCs → merged → open,
   with zero pre-loaded building beforehand.
3. Both changes pushed per this project's live push-permission state (`CLAUDE.md` §PUSH PAUSE — currently
   ON as of this writing; re-check it hasn't been re-paused before pushing).

## Item 3 — flag for a doc session, not this one: User Guide needs this journey step-by-step

**Not done here — noted per the user's explicit ask ("these should be properly given step by step in the
User guides").** Once Items 1 and 2 are actually live (don't document a flow that's still partially broken
or unbuilt), a follow-up doc session should add a step-by-step walkthrough of the full journey to
`docs/USER_GUIDE.md` (and cross-link from `docs/ERPUserGuide.md` for the Find→ERP→Project Order→Time
Machine half, which is already real/live today and could be documented independently of Items 1/2 if a doc
session wants to start there first):
1. Drop your own IFC(s) — including the multi-file "scoop and merge" gesture explicitly called out (a real,
   easy-to-miss capability today — `input.multiple=true`, one drop, not one-at-a-time).
2. Dropping a later, updated IFC of the same building — the version-merge popup, and (once Item 1 lands)
   the resulting variance/diff overlay.
3. Opening the merged/imported building in the Modeller for ARC-only editing (already real today — the
   Open panel's local-file picker, `.ifc`/`.db`, routes through the same ARC-extraction path as the curated
   sample buildings — this part needs NO code work, just documentation, and could be written up immediately).
4. Find panel → cost-on-selection → `› ERP` push → real `C_Project`/Phase/Task/Line in the ERP app.
5. A later model delta → `› VO` fold to a signed Variation Order (ERP amendment) — gated on Item 1's fix.
6. Time Machine's Budget-vs-Actual — real actuals folded from atomic `PP_Order_Cost` rows, not a hashed
   estimate; how to read the variance drill-down.
**Do not write this doc section before Items 1/2 are actually done** — per this project's own standing
rule against documenting aspirational behavior; steps 3/4/6 above are safe to document independently since
they're already real and unaffected by Items 1/2.

## Item 4 — clash "Fine Mesh" review: cross-session persistence + explicit trigger button

Full spec now lives in `prompts/BENCHMARK_AND_CLASH_RESOLUTION_LANE.md` §4/§4a (2026-07-26 addition) —
read it there, this is a pointer, not a duplicate. Two pieces, both build on the SAME existing §3/§4 depth
math (`three-mesh-bvh` `shapecast`/`closestPointToGeometry`, already measured real: 0.14ms/pair narrowphase
on a 122k-element building) — neither is built into the live viewer yet, only proven via standalone
`scripts/measure_*.js` witnesses:
1. **Persist the qualified verdict** — new `clash_verdicts(guid_a, guid_b, transform_hash, verdict, depth_mm,
   type, checked_at)` table, written on Save, so a future re-open starts pre-qualified instead of re-deriving
   every pair live. Keyed on transform hash too, not just the GUID pair, so a later move correctly invalidates.
2. **An explicit "Fine Mesh" button** — a second trigger into the exact same depth math + cache, for running
   the deep check over a filtered list/selection without flying the camera to each candidate individually.
Note this is a DIFFERENT subsystem from Item 1-3's Modeller/Viewer journey work — it's the Viewer's
clash-review panel (`measure.js`/`clash_matrix.js`), not the Modeller's live-editing conformity gate
(`sdg_gate.js`, separately tracked — see `prompts/CLASH_GATE_OBB_NARROWPHASE.md`, built+pushed, no PR opened
yet, a second real "close it out" item worth doing alongside this one).

## Item 5 — HHS_Office Human Asset overlay: Person has no click-through to ERP, redirect the "amiss" payslip ask

**Confirmed root cause (already researched, `prompts/Viewer/HBA/RESUME_HR_BIM_ASSET.md` §B, "Person — the one
HBA entity with no bidirectional click-through"):** every other HBA pane's row carries a real `open ↗`
deep-link into its native ERP window (Dashboard→`S_Resource` 236, Payslip→`HR_Movement` 53042, Leave→
`HR_Concept` 53036, Tenancy→`C_Subscription` 316, IoT→`C_Order` 143) — but **Presence (the actual clickable
staff avatar in the 3D scene) has none.** `hba_avatars.js` only produces a hover card (name/room/since-when),
no `erpLink()` call, no `AD_WINDOWS` entry for a person/employee record at all. That's almost certainly what
reads as "the payslip is amiss" — clicking a staff person doesn't get you anywhere near payroll/leave data,
unlike every sibling entity in the module.

**User's directed scope (2026-07-26, don't build wider than this):** do NOT try to render payslip content
inside the viewer overlay — keep that shape entirely on the ERP side, same `open ↗` deep-link pattern every
other pane already uses. In the Viewer, clicking a staff person hands off to the ERP side to handle it there.
**Scope the click-through to fire ONLY when the person's status is on-leave WITH an application** — not a
general always-on Presence→ERP link for every state. This is the "Forward (Presence → ERP)" half of §B's
own proposed next step, narrowed to the leave case specifically:
1. Resolve the clicked person's real ERP identity the same non-invent way Payslip/Dashboard already do
   (`MODELS.Official` join — check what it resolves to, `AD_User` or `C_BPartner`, don't assume).
2. Gate the click-through on: does this person have a leave record whose status is currently "on leave," AND
   does a leave APPLICATION exist for it (not just an accrual/balance — an actual submitted application row).
   Both conditions real, checked against the actual `leave.js` op-log shape — don't invent a status field
   that doesn't exist.
3. When gated true, the avatar's hover card / click gains an `open ↗` into the real leave window
   (`HR_Concept` 53036, matching Payslip's existing target — confirm this is also where a leave application
   itself lives, or if there's a more specific window for the application record itself).
4. When gated false (not on leave, or on leave but no application on file), no new UI — Presence stays
   exactly as it is today. This is additive, not a rework of the hover card for every person.

**Related, not this item's scope (flag, don't fold in):** `prompts/Viewer/HBA/RESUME_HR_BIM_ASSET.md` §C
(Leave should also mark the person unavailable as an `S_ResourceUnAvailable`, same as a room's maintenance
blackout) is a real, adjacent gap but a separate design question (3 open sub-questions of its own, un-scoped
here) — don't conflate the two just because both touch `leave.js`.

## Item 6 — IoT camera zoom→turnaround→POV: confirm the interaction model matches intent, harden the one flagged defect

**User's confirmed intent (2026-07-26):** click a camera device → 1st click zooms to show where the camera
is; click again → camera nears the device, turns around to assume the camera's own POV, and (once a real
feed is wired) live-feeds in. **Check this against what's actually built before assuming a gap** — per
`prompts/Viewer/HBA/RESUME_HR_BIM_ASSET.md` §2026-07-06b/c/d, most of this exists and is MERGED to main
(PR #674, #677, confirmed via `gh pr view` — both `MERGED`), but split across two different triggers, not
necessarily the single unified 2-click gesture on one device the user just described:
- The **sensor-bar** click (dashboard UI, not an in-scene device pick) is already a 2-state toggle: 1st =
  establishing shot, 2nd = fly to the nearest real CCTV camera's position + look at the sensor.
- The **CCTV tile** click (also dashboard UI) directly assumes that camera's own declared POV in one click
  (`hba_lens.js flyToFacing`, 6 real facing vectors computed via structural-mass-centroid direction since
  extraction rotation data was uniformly zero — a real, computed, non-guessed answer, not a shortcut).
- In-scene capture exists too (`captureFacingSnapshot`, PR #677) — an offscreen camera renders the REAL
  scene from the device's own eye/facing into the CCTV tile's thumbnail, throttled re-render, honest
  "IN-SCENE POV" vs "STUB READY" watermark depending on whether a real facing/engine is available.
**First step: verify live whether clicking the actual in-scene camera device (not a dashboard tile) already
follows this 2-click pattern, or whether that gesture only exists on the dashboard tiles today** — don't
assume a gap without checking, this module has a habit of already having built more than expected.

**The one already-flagged, not-yet-root-caused defect — likely candidate for "code has not handled well":**
PR #674's fix #3 (a DLOD-binding race: right after a camera move, an instanced/batched guid→mesh lookup can
transiently resolve to a stale/unwritten slot, silently landing at world origin instead of the real target)
was fixed to fail SAFELY (an honest no-op) but **not root-caused** — the doc's own words: "If a future
session sees this land as a felt UX gap (a CCTV tile click that 'does nothing' right after clicking a
different one), that mechanism is the place to dig — `viewer/hba_lens.js` `_zoneCentroid`." If the reported
"not handled well" is an intermittent no-op on the second click (fly-to-POV silently doesn't happen), START
HERE — it's a named, real, already-partially-diagnosed lead, not a fresh investigation.
**Do not treat live video feed as a bug** — "when actually setup as such" in the user's own words scopes
that to a future real-camera-integration ask, not something missing today; the in-scene RENDERED capture
(not a live network feed) is the honest current ceiling and is already built (PR #677).

## WATCHDOG NOTE
Full audit trail + evidence for every claim above lives in `prompts/ABOUT_BOX_CONSOLIDATE.md`
`§2026-07-26 AUDIT PART 5` (Items 1-3) and `prompts/Viewer/HBA/RESUME_HR_BIM_ASSET.md` (Items 5-6, sections
§B and §2026-07-06b/c/d respectively). Read the relevant one before starting if any of the reasoning above
needs fuller context (exact line numbers, spot-check results). Closing session's `# DONE` appendix needs a
`§` log line for every claim per this project's Watchdog Protocol — "verified" without a log line is not done.
