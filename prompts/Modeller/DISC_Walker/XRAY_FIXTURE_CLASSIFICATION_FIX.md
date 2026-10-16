<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# X-RAY REVEAL — fixture/structure misclassification on SampleCastle (2026-07-13)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-ootb `modeller/modeller.html` — `_fixtureColorMap()` (~line 525) + `xrayReveal()` (~line 530).
Fixes which elements X-ray treats as a "glowing fixture" vs "near-transparent glass structure". Does NOT
touch disc_walker.js's placement logic, arc_editable.js's PALETTE colouring, or anything else — those are
correct as they are; this is purely about xrayReveal()'s own classification signal being wrong.
PRIMARY TEST BUILDING = SampleCastle (user's explicit instruction, 2026-07-13: "more challenging standard
and empty of any MEP and not the same source as DX" — SampleCastle is architecturally distinct from
Duplex, a better generalization test than reusing the same building every time). Duplex is regression-only
— it must not break, but do not tune the fix to Duplex's data and call it done. Read the log after every
run. Commit locally — the standing PUSH PAUSE applies (`CLAUDE.md` §⏸), do not push/PR without checking
whether it's been lifted.
```

## §GIVEN — measured, do not re-derive

- **G1 — the defect, live:** ran a real `discWalk('ELEC', {building:'SampleCastle'})` (325 fixtures placed,
  8/8 witness pass, not a refuse) then `window.__xrayReveal(true)`. Screenshot shows tall solid yellow
  spikes shooting up through the roof — these are SampleCastle's `IfcWall` elements (36 of them, per the
  Outliner), not fixtures. The roof/slab correctly went near-transparent glass. On Duplex, the same
  sequence (102 fixtures, `discWalk('ELEC',{building:'Duplex'})`) visually looks correct (walls read as
  ghosted, only small fixture dots glow) — but see G3, this may be Duplex-data luck, not a working
  classifier.
- **G2 — the classification code, exact:** `_fixtureColorMap()` (`modeller.html:525-529`) builds `{fid:
  color}` from every `GEOM_INSERT` op whose `parameters.color != null` — **no discipline check, no
  fixture-vs-structure check at all.** `xrayReveal()` (`modeller.html:530+`) then treats ANY mesh whose fid
  is in that map as a "glow" (opacity 0.97 + emissive, i.e. rendered near-opaque in its own color) and
  everything else as "glass" (opacity 0.06, near-transparent).
- **G3 — why structure elements are IN that map at all:** `arc_editable.js:191` stamps
  `params.color = colorFor(cls)` (the cosmetic PALETTE colour, `colorFor` at `arc_editable.js:25`) on
  **every** authored ARC element regardless of class — walls, slabs, roofs, doors, all of it — and
  `arc_editable.js:244` pushes each as `op_type: 'GEOM_INSERT'`. Walked MEP fixtures are ALSO committed as
  `GEOM_INSERT` (confirmed: `witness_e2e_walk.js`'s own W4 assertion checks `op_type` grew by
  `GEOM_INSERT` count) — so **op_type cannot distinguish "real ARC wall" from "walked ELEC fixture,"** and
  neither party's colour value is ever null. `_fixtureColorMap()`'s `!= null` filter therefore always
  matches BOTH. Not yet measured (do this first, §POC below): why this doesn't visibly break on Duplex —
  plausible explanation is Duplex's `IfcWall` PALETTE colour happens to be close enough to the "near-white
  ghosted" look that opacity 0.97 + its own colour is hard to tell apart from opacity 0.06 + white, purely
  by coincidence of that one building's PALETTE value, not because the classifier is actually discriminating
  correctly. Confirm or refute before assuming Duplex is a clean control.
- **G4 — the real, already-existing discriminator:** walked-discipline meshes carry `userData.dwDisc` (or
  `userData.dwAsm`) — set at render time (`modeller.html:3694,3719,3753` and others; grep `dwDisc` for the
  full set of call sites) and already used elsewhere in this file to reliably tell "this mesh came from a
  disc-walker" from "this mesh is an authored ARC element" (visibility toggles, disc-clear, disc-walk
  status queries all key off it today). This tag does not exist on ARC-seeded meshes. It is the correct
  signal `xrayReveal()` should use instead of "does the op have a colour."

## POC GATE (first, before touching xrayReveal() itself)

1. On SampleCastle post-walk, for a sample of ~10 wall fids and ~10 walked-ELEC fids, log
   `§XRAYPOC fid=<n> hasColorParam=<bool> hasDwDisc=<bool> class=<ifc_class or dwDisc value>`. Confirm
   walls all have `hasColorParam=true, hasDwDisc=false` and fixtures all have `hasDwDisc=true` — this is
   the fix's whole premise, verify it numerically before rewriting the classifier.
2. Repeat on Duplex — log the SAME numbers, and additionally log each wall's actual resolved PALETTE
   colour hex next to its rendered appearance, to settle G3 (coincidence vs correct classification) rather
   than guessing.
3. If either measurement contradicts G2-G4 above, STOP and report the numbers — do not proceed to
   implementation on an unconfirmed premise.

## Implementation (after the gate passes)

- `_fixtureColorMap()` (or its caller in `xrayReveal()`) gains a `mesh.userData.dwDisc != null` check —
  only meshes carrying a real walked-discipline tag are eligible for the "glow" treatment; everything else
  (every authored ARC element, regardless of whether its op happens to carry a colour) goes to "glass."
  This is a narrowing of an existing over-broad filter, not new architecture.
- Keep the existing fixture colour source (`_fixtureColorMap()`'s `parameters.color` lookup) for the
  glow colour itself once an element passes the `dwDisc` gate — only the ELIGIBILITY test changes.
- No change to `arc_editable.js`'s PALETTE stamping — that colour is legitimately used elsewhere
  (cosmetic rendering) and is correct as-is; the bug is xrayReveal() over-trusting its presence as a
  fixture signal, not the stamping itself.

## WITNESS PLAN

- **W-XRAY-POC**: the gate numbers above, both buildings.
- **W-XRAY-SC-LIVE** (primary, per user instruction): real `discWalk('ELEC',{building:'SampleCastle'})` →
  `xrayReveal(true)` → assert via `g.children` that every mesh with `opacity≈0.97` (glow) has
  `userData.dwDisc` set, and every mesh without it has `opacity≈0.06` (glass) — no screenshot judgment
  needed, a real in-scene assertion. THEN take the guide-quality screenshot as human-eyeballed
  confirmation (per this project's own "log proves the numbers, eyes confirm the frame" standard) —
  no more yellow spikes through the roof.
- **W-XRAY-DUPLEX-REGRESSION**: same assertion on Duplex — confirm it still looks correct (or, if G3's
  "coincidence" theory is confirmed, confirm it now looks correct FOR THE RIGHT REASON, not by luck).
- Append a dated `# DONE` with quoted §-lines to THIS file; commit here too.

## DONE WHEN

Gate numbers confirm G2-G4; `xrayReveal()` keys glow-eligibility off `dwDisc`/`dwAsm`, not colour
presence; W-XRAY-SC-LIVE shows a clean SampleCastle X-ray (structure ghosted, only real walked fixtures
glow, no spikes); Duplex regression-checked; both witnesses green. Once done, the ModellerGuide.md
`walk-fixtures.png` X-ray demo can be redone on SampleCastle (325 fixtures across 7 storeys — the dramatic
depiction originally asked for) instead of Duplex — that guide-image swap is a natural follow-up once this
lands, not part of this spec's own DONE bar.

# DONE (2026-07-13)

**Premise revised mid-session, with user sign-off, before implementing.** POC gate confirmed G2/G3 exactly
(walls: `hasColorParam=true, hasDwDisc=false, class=IfcWall`, identical PALETTE fallback hex `0xb9c4cf` on
both buildings — the "coincidence" in G3 is scale, not colour: 879 walls on SampleCastle vs 57 on Duplex,
not a colour difference). But G4's premise didn't hold as written: walked ELEC fixtures render as
`InstancedMesh` buckets nested one level inside a `dwRoot` marker group (`modeller.html:3684-3697`), NOT
direct children of `g` — `xrayReveal()`'s original `g.children.forEach` never visited them at all, and they
carry no `userData.featureId`, so `dwDisc` alone (as originally specced) would have (a) not reached DiscWalker
fixtures, and (b) broken an existing, currently-passing internal regression control
(`?routewalk=xray`/`bonsai_xray_reveal_live.js`, `BUILDING_SH_STD` via `placeAssembly`+`autoRouteMEP`, 23
individually-placed fixtures that carry NO `dwDisc` — they're a third, separate fixture-placement path).

Root-caused instead via the signed op-log's own data (already present, no invention): every DiscWalker
placement commits with `parameters._dw: {disc, ifc, ...}` (`modeller.html:3945/3958`) and every
`autoRouteMEP` fixture commits with `parameters._rw: {fixture:true, disc, ...}` (`modeller.html:3010`) —
both real fixture-placing paths self-tag in the signed log; ARC-seeded structure (`arc_editable.js:191`) and
raw `placeAssembly` leaves carry neither. Implemented:
- `_fixtureColorMap()` eligibility test changed from bare `parameters.color != null` to
  `parameters._dw != null || (parameters._rw && parameters._rw.fixture === true)` (still requires `color`
  present too) — narrows to true fixture ops regardless of discipline/placement path.
- `xrayReveal()` gained a second pass over `dwRoot.children` (previously unreached) — every InstancedMesh
  bucket with `userData.dwDisc != null` now gets glow treatment using its own current material colour
  (buckets are already one colour per discipline, no per-instance featureId to key through).

**Witnesses (`modeller/tests/`, all puppeteer, real headless Chrome via SwiftShader):**
- `witness_xray_poc.js` — POC gate, both buildings, `§XRAYPOC` lines confirm G2/G3 numerically.
- `witness_xray_sc_duplex.js` — `W-XRAY-SC-LIVE` + `W-XRAY-DUPLEX-REGRESSION`, both **PASS**:
  `§XRAY-ASSERT SampleCastle structureGlassOK=3225 structureLeaked=0 fixtureGlowOK=325/325 bucketGlow=4/4`
  `§XRAY-RESTORE SampleCastle matchedPreXrayState=3550/3550`
  `§XRAY-ASSERT Duplex structureGlassOK=196 structureLeaked=0 fixtureGlowOK=102/102 bucketGlow=6/6`
  `§XRAY-RESTORE Duplex matchedPreXrayState=298/298`
  Restore assertion compares exact pre-xray material state (transparent/opacity/colour) per mesh rather than
  assuming universal opacity — SampleCastle has real transparent glazing (`arc_editable.js` §MAT-PARITY),
  so "restored" means "matches its own prior state," not "opaque."
  Also verified directly: the 8 tallest meshes in SampleCastle's scene (5+ m walls) are each
  `opacity=0.06, color=0xaabbcc, depthTest=true` post-reveal — zero leakage, checked at the material level,
  not just aggregate counts.
- The pre-existing external `bonsai_xray_reveal_live.js` (`?routewalk=xray` control) fails on unmodified
  `origin/main` HEAD too (`git stash` confirmed) — a stale/broken serving-path bug in that test file itself,
  unrelated to this fix. Not fixed here (out of scope); a corrected-serving-root variant
  (`witness_xray_regression_sh.js`) was written but hit the same pre-existing in-app crash
  (`TypeError: Cannot read properties of null (reading 'exec')` inside the `routewalk=xray` self-test path,
  reproducible on unmodified HEAD, unrelated to this fix) — not chased further, flagged here for whoever
  picks up `bonsai_xray_reveal_live.js` next.

**Two things found outside this spec's scope, filed separately, not fixed here (user directive: "look into
it separately," don't block this fix):**
1. `prompts/Modeller/DISC_Walker/DW_FIXTURE_DOUBLE_RENDER_FINDING.md` (bim-ootb repo) — every DiscWalker
   fixture folds BOTH as an individual top-level mesh (standard op-log fold, own featureId) AND as an
   instance inside its discipline's `InstancedMesh` bucket, both `visible:true`, likely same position.
   Confirmed pre-existing (unmodified HEAD). Not investigated further — visual impact unmeasured.
2. Alpha-accumulation: SampleCastle's guide screenshot still reads visually dense despite 100%-correct glass
   classification, because ~3225 stacked semi-transparent (6%) structural surfaces compound
   (`1-(0.94)^N`) to 70-85%+ visual opacity at typical overlap depths — a rendering-tuning question, not a
   misclassification. Noted in the same finding file's "related observation" section.

**Guide-image swap** (`walk-fixtures.png` → SampleCastle) intentionally NOT done — named in DONE WHEN as a
follow-up, not part of this bar, and the alpha-accumulation finding above means the swap should probably
wait for that visual-tuning question to be resolved first or the "dramatic" demo will look muddier than
intended.

**Commits:** local only in `/tmp/wt-xray-fixture-fix` (branch `fix/xray-fixture-classification`,
bim-ootb) — standing PUSH PAUSE (`CLAUDE.md` §⏸) applies, not pushed/PR'd. This file (bim-compiler) has no
equivalent lock; committed directly in the primary checkout.

# DONE (2026-07-18) — merged, both follow-ups also closed

This branch merged into bim-ootb `main` as part of PR #846 (`fix(modeller): X-ray reveal — correct
glass/glow classification + depth-adaptive opacity`), combined with a genuinely new fix for the
alpha-accumulation follow-up named above (item 2): `_xrayMeasureStackDepth()` measures the real stacking
depth via a 6×6 grid of top-down raycasts through the actual structure mesh set, then solves for the glass
opacity that keeps cumulative composited opacity at a fixed 35% target — Duplex (depth 22) 0.06→0.019,
SampleCastle (depth 48) 0.06→0.015. `witness_xray_poc.js` and `witness_xray_sc_duplex.js` both PASS on the
combined fix.

Item 1 (`DW_FIXTURE_DOUBLE_RENDER_FINDING.md`'s double-render) is ALSO now fixed, separately, as bim-ootb
PR #851 — see that file's own `# DONE 2026-07-18` for the account (a naive `.visible=false` fix broke
click-to-identify, `witness_e2e_instpick.js` caught it before merge; the real fix keeps the individual
fold-copy raycastable but invisible-to-rendering via `opacity:0`).

**Guide-image swap done too** — `docs/ModellerGuide.md`'s `walk-fixtures.png` (bim-compiler) now shows the
real SampleCastle X-ray walk, captured fresh against the fully-fixed code (both this fix and #851). Also
added two new close-ups (`duplex-fixture-lod400-closeup.png`, `samplecastle-fixture-honestbox-closeup.png`)
showing the real-mesh-vs-honest-box distinction directly, replacing a stale "always a box stand-in" claim
the guide had carried since before the LIVEWIRE real-mesh mechanism existed.

Not touched, named so it isn't lost: `witness_e2e_instpick.js`'s P2/P2b/P3 (click-to-identify) are broken
independent of all of the above — confirmed via `git stash` to pristine `origin/main`, identical failure
before any of this session's changes. Real, pre-existing, unrelated bug, still open.
