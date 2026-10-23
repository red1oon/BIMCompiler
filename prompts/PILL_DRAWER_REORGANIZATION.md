# BUILD SPEC — FINALIZED 2026-07-05, ready to implement — real pill drawers

```
# ⚠ DO NOT REMOVE
SCOPE: DEPENDS on prompts/SCALE_AND_UX_SWEEP.md §3 item 6 (duplicate pill-registration audit) —
already re-verified clean for every id this spec touches (clash/bbox/screenshot/cam-reset/cam-pivot
are each registered exactly once, all already `pill:false`, confirmed via grep on bim-ootb main
2026-07-05 — no duplicate-id or duplicate-state landmine found for this spec's scope).
Everything below is CONFIRMED by the user across a live design dialogue 2026-07-05 (superseding
ALL earlier drafts of this file). Do not re-litigate; implement as written. Read the log after every run.
```

## FINAL DRAWER MAP (4 real drawers)

1. **Visual FX** — master = existing Palette icon (`id:'palette'`, unchanged, already correct
   click-only-opens behavior, keeps key `p`). Absorbs, no longer separate top-level icons:
   - Night (`id:'night'`, key `n`, moon icon) — fires directly, same as today, just relocated inside.
   - **Shadow becomes a single 4-state cycle button** (see §SHADOW-GROUND MERGE below) — replaces
     both the old boolean Shadow toggle AND the 4 separate Ground text-buttons (None/Grass/Earth/Paved).
   - Reverse-background-for-print (`id:'background'`, key `b`, `toggleBackground()`).
   - **Audio** (`id:'audio'`, key `v`, Sound FX) — CONFIRMED IN per user 2026-07-05 (an earlier
     resolution of this file wrongly said "leave standalone" — that was a misread of the user's
     annoyance at the *uncertainty*, not agreement to exclude it. Audio IS in Visual FX.)

2. **Camera/View** — NEW master icon = the Camera glyph, freed by deleting Screenshot (see
   §DELETIONS). Absorbs:
   - Feather/Fine precision-drag (`id:'precision'`) — becomes a sub-item, fires `togglePrecisionFine`
     on its own click only (no more dual-fire: today Feather's click ALSO fires Fine directly AND
     long-press reveals Reset/Pivot — that dual behavior does NOT carry over, per §MASTER-ICON BEHAVIOR).
   - Reset Camera (`id:'cam-reset'`, already `pill:false` today, was long-press-chip-only).
   - Pivot / Auto-Pivot (`id:'cam-pivot'`, already `pill:false` today, was long-press-chip-only).
   - No keyboard shortcut assigned to the new master yet — tap/click-only unless the user asks
     for one later. Sub-items keep their existing keys (Feather=Caps Lock) firing directly.

3. **Navigate** — NEW master icon = **Sailboat** (Lucide `sailboat`, confirmed by user — NOT Eye,
   NOT Mailbox, NOT Compass). Absorbs:
   - Find (`id:'find'`, key `f`)
   - World History (`id:'worldhist'`, key `w`) — its OWN internal tap/long-press behavior (overlay
     vs Z-timeline+bomb drawer) is UNCHANGED, leave exactly as-is per explicit user instruction.
   - Home (`id:'home'`)
   - Walk (`id:'walk'`, `platform:'mobile'` only) — moves into this group on mobile; still never
     appears on desktop.
   - No keyboard shortcut for the Sailboat master itself — tap/click-only.

4. **Inspect** — NEW master icon = **HardHat** (Lucide `hard-hat`). Absorbs:
   - Measure (`id:'measure'`, key `m`) — keeps its own long-press→Clash chip-reveal UNCHANGED
     (Clash is already `pill:false`, already hold-chip-only; just relocates wholesale as one row).
   - X-Ray (`id:'xray'`, key `Alt+Z`) — **icon changes from Eye to Bone** (frees Eye; Bone is a
     better metaphor anyway — X-ray reveals bones). Keeps its own long-press→Bbox(Alt+X) chip-reveal
     UNCHANGED, same reasoning as Measure/Clash — user explicitly said "leave AltZ/X alone."
   - Section Cut (`id:'section'`, key `x`)
   - Time Machine (`id:'tm'`, key `t`)
   - 4D/5D Report (`id:'report'`, key `4`)
   - Fly Tour (`id:'fly'`, key `l`) — user moved this in from its own slot.
   - No keyboard shortcut for the HardHat master — tap/click-only.

## NOT drawers — stay exactly as individual top-level icons (just visually grouped/ordered)
- **Document** (label only, no master, no behavior change): Save (`Ctrl+S`), Open (`Ctrl+O`).
  User's own reasoning: these are single-shot, high-frequency actions — burying them behind a
  drawer tap adds friction to the two most-used actions, unlike the mode-toggle items above.
- Share, Settings, Help — untouched, standalone, same as today.

## §MASTER-ICON BEHAVIOR (applies to ALL 4 drawers, genuinely new rule, unchanged from earlier draft)
A drawer's master icon **only opens/closes the drawer** — it never itself fires a feature, even if
the absorbed action it replaces used to fire on click (Feather is the concrete example: today its
click fires Fine directly AND long-press reveals Reset/Pivot; that dual behavior must NOT carry
over to Camera/View's master). Palette needs no behavior change (its click already just opens a
panel, no dual-fire problem there).

## §INTERACTION MODEL — no more long-press for the 4 drawer masters
CONFIRMED 2026-07-05: tap the master → drawer/panel opens and **stays open until an explicit '✕'
close** (not click-outside-dismiss, not long-press-then-auto-collapse). Reuse
`viewer/hba_mobile_stack.js`'s existing collapsed/expanded visual vocabulary for the open/close
animation, but the CLOSE trigger is the explicit ✕, per this spec (not hba_mobile_stack's tap-to-
collapse). This applies to the 4 master icons ONLY — it does NOT apply to the NESTED long-press
chip-reveals already living inside Measure (→Clash) and X-Ray (→Bbox), which the user explicitly
said to leave alone; those keep their existing long-press-chip behavior, just relocated as rows
inside the Inspect drawer. World History's own tap/long-press behavior is also explicitly UNCHANGED.

## §SHADOW-GROUND MERGE — new behavior, confirmed 2026-07-05
Today: Shadow (`tools.js:640`, `A.toggleShadow`, boolean `A._shadowOn`, renderer.shadowMap on/off)
and Ground material (`panels.js:307-334`, `_buildGroundButtons`, 4 separate text buttons None/Grass/
Earth/Paved, `A.setGroundTexture(key)`) are TWO INDEPENDENT pieces of state, in different files.
**NEW: merge into ONE 4-state cycle button** living on the Ground row inside the Visual FX panel:
- **OFF** = Ground=None + Shadow off (matches today's shadow-off + no-ground-texture default)
- **ON-1** = Ground=Grass + Shadow on
- **ON-2** = Ground=Earth + Shadow on
- **ON-3** = Ground=Paved + Shadow on
- Repeated presses of the (cloud-icon) button cycle OFF→ON-1→ON-2→ON-3→OFF.
- Also apply the user's separate visual-quality ask here: the button/swatch should show an actual
  small cut-out of the current ground texture/color (a real thumbnail), not an abstract icon or
  text label, "so user knows their color/texture right away instead of trying to process mentally."
- Moon (Night) can sit ordered before Shadow/Ground in the panel layout if that reads better
  spatially — labels are removed, order is a layout call, not a locked requirement.

## §DELETIONS — confirmed dead, remove entirely (not just hide further)
- `id:'screenshot'` (`panels.js:1193`, already `pill:false`, was a long-press-chip off Background)
  — redundant with the OS's native Print Screen. Delete the action AND its hold-chip wiring at
  `panels.js:1191`. This frees the Camera glyph for Camera/View's new master (see #2 above).
- `id:'record'` (`panels.js:1204`, already `pill:false`, key `r`) — no longer in use, delete.
- `id:'2d'` (`panels.js:1200`, already `pill:false`, key `2`) — no longer in use, delete.
- None of these three were ever visible on the top-level rail (`pill:false`), so their removal
  doesn't change the visible rail count — it's dead-code/dead-shortcut cleanup, not a rail change.

## §NEW ICONS — sourced from Lucide (the ONLY icon set this codebase uses, `panels.js:7`,
ISC-licensed, style-consistent: 24×24 viewBox, `fill:none`, `stroke:currentColor`, `stroke-width:2`).
Deliberately NOT Flaticon — different visual style (usually filled/colored) and the free tier
typically requires attribution this codebase carries nowhere today. All 3 pulled live from
`unpkg.com/lucide-static` 2026-07-05 and confirmed real (not memory-guessed):

```
bone:     { svg: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z" />' }
hardHat:  { svg: '<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" /><path d="M14 6a6 6 0 0 1 6 6v3" /><path d="M4 15v-3a6 6 0 0 1 6-6" /><rect x="2" y="15" width="20" height="4" rx="1" />' }
sailboat: { svg: '<path d="M10 2v15" /><path d="M7 22a4 4 0 0 1-4-4 1 1 0 0 1 1-1h16a1 1 0 0 1 1 1 4 4 0 0 1-4 4z" /><path d="M9.159 2.46a1 1 0 0 1 1.521-.193l9.977 8.98A1 1 0 0 1 20 13H4a1 1 0 0 1-.824-1.567z" />' }
```
X-Ray's existing `eye` glyph is freed (no longer used anywhere) once X-Ray switches to `bone`.

## FINAL RAIL ORDER
Document(Save, Open) → Navigate(drawer) → Inspect(drawer) → Visual FX(drawer) → Camera/View(drawer)
→ Share → Settings, Help.

## ICON COUNT — the actual win
Today: 20 standalone top-level rail icons (desktop). After this spec: **9** — Save, Open, Share,
Settings, Help (5 unchanged) + 4 drawer masters (Palette, Camera, Sailboat, HardHat). Verify this
count live, don't just eyeball it (§DONE WHEN below).

## PARKED — explicitly OUT OF SCOPE for this spec, tracked as a separate future item
User floated (2026-07-05): expand Save to cover IFC/BCF/DB, expand Open to accept DB/IFC/BCF,
deprecate the Buildings-landing "Drop IFC" flow in favor of Open, and decide same-name-reimport
semantics (merge vs. variant). Checked the code: Save/Open today are DB-only
(`scene.js:508`/`scene.js:550`), IFC import is a fully separate path (`import.js`), and there is
NO existing same-name merge/variant logic anywhere (existing tests explicitly `deleteProject()`
first to avoid collision). This is a real architecture decision (touches the signed op-log/kernel
chain, `kernel_ops.js`, `§KRN_CHAIN` — merge vs. fork has real integrity implications) — deserves
its own spec pass, NOT a decision folded into this drawer reorg. Do not implement any part of it
here; do not silently pick merge-or-variant. Revisit only when the user opens it explicitly.

## STEPS
1. Work in a fresh `/tmp/wt-*` worktree off `bim-ootb` main (never edit `~/bim-ootb` directly —
   PreToolUse hook blocks it). `git -C ~/bim-ootb fetch origin && git worktree add /tmp/wt-pill-drawers
   -b lane/pill-drawers origin/main`.
2. Add `bone`/`hardHat`/`sailboat` to the `ICONS` registry in `viewer/panels.js` (paths above).
3. Build ONE reusable drawer-panel mechanism (new small module or extend `common/pill_builder.js`):
   master button → toggles a panel open/closed only (§MASTER-ICON BEHAVIOR), panel renders a list
   of the group's sub-actions each with its own real icon/`fn`/`isActive` (reuse as-is, don't
   reinvent state), explicit ✕ closes (§INTERACTION MODEL). Palette's EXISTING sunglass panel is
   the template to extend for Visual FX (it already opens/closes correctly) — Camera/View,
   Navigate, Inspect need this NEW mechanism since no panel exists for them yet.
4. Migrate Visual FX first (extend the existing Palette panel with Night/Shadow-Ground-merge/
   Reverse-bg/Audio rows) — most fully specified, reuses an existing open panel.
5. Build Camera/View, Navigate, Inspect panels + their new master icons, remove the absorbed
   actions' standalone rail registration (set `pill:false` or delete the top-level entry, keep the
   `fn`/`isActive`/keyboard-shortcut wiring intact).
6. Implement §SHADOW-GROUND MERGE (new cycle function, replaces `toggleShadow` + the 4 Ground
   buttons with one function + one visual-thumbnail button).
7. Implement §DELETIONS (screenshot, record, 2d — full removal, not just hiding).
8. Reorder `_actions` to §FINAL RAIL ORDER.
9. Live-verify (headless browser, real page load, real clicks — not just code reading):
   - Rail visible icon count = 9.
   - Each of the 4 masters: click opens, click again or ✕ closes, NEVER fires a sub-action itself.
   - Every absorbed sub-action still fires correctly and its `isActive` still reflects real state
     inside its new panel.
   - Every original keyboard shortcut (`h`→now the merged shadow-ground cycle, `n`, `p`, `v`, `m`,
     `c`, `Alt+Z`, `Alt+X`, `x`, `t`, `4`, `l`, `f`, `w`, Caps Lock, `a`, `q`, `Ctrl+S`, `Ctrl+O`,
     `/`) still fires its underlying function directly, drawer-open-state notwithstanding.
   - Measure→Clash and X-Ray→Bbox long-press chip-reveals still work, unchanged, now inside Inspect.
   - World History tap/long-press unchanged.
   - 0 console errors.
   - § log line per claim above — this is the evidence, not a screenshot alone.

## DONE WHEN
1. All 4 drawers live: Visual FX (Palette-hosted), Camera/View, Navigate (Sailboat), Inspect
   (HardHat) — each master click-only-opens, ✕-closes, no dual-fire.
2. Shadow-Ground merge live: one 4-state cycle button, real texture-swatch thumbnail, replaces the
   old boolean Shadow + 4 separate Ground buttons.
3. Screenshot/Record/2D fully deleted (code + hold-chip wiring), no dead references left.
4. Rail visible icon count verified = 9 (not eyeballed — counted from the live DOM).
5. Every keyboard shortcut verified still firing its function directly, live.
6. Document (Save/Open), Share, Settings, Help, World History, Measure→Clash, X-Ray→Bbox all
   confirmed UNCHANGED from today's behavior (regression check, not just "didn't touch the code").
7. § log evidence for every claim in STEPS §9, not screenshots alone.
8. Save/Open format-expansion idea explicitly NOT touched, left parked per the note above.

---

## ▶ 2026-07-06 — REOPENED: user not satisfied with landed behavior, 3 items to review/fix

**User's own framing:** what was asked and what landed don't fully match — review pill behavior properly,
don't just re-confirm it shipped.

### Item 1 — Master icon should DE-highlight when its panel is closed via ✕
**Real lead found (checked `origin/main`, not guessed):** `_buildMasterDrawer()`'s panel `onClose` handler
(`viewer/panels.js` ~line 1394) does **only** `console.log('§DRAWER_CLOSE id=' + masterId)` — it never
triggers a re-sync of the master pill's own highlight state. Compare to `toggle()`'s "opening" path, which
explicitly re-syncs sub-row states (`rows.forEach(r => r._sync())`) but has no equivalent for the MASTER
icon itself, on either open or close. Likely fix: find whatever function actually repaints pill highlight
state (probably in `common/pill_builder.js` or wherever `isActive()` gets periodically re-checked) and call
it from `onClose` too — right now, closing via ✕ is a different code path than clicking the pill itself, and
only the latter seems to trigger a repaint.

### Item 2 — Space bar to accept/trigger the Tab/Arrow-focused item — NOT YET BUILT, a real feature ask
**Checked:** no `tabindex`, no Space-bar handling, and no arrow-key navigation exists anywhere in the drawer
row code (`viewer/panels.js`) — the only Arrow-key handling found in the file is for an unrelated list-nav
feature (cursor movement in some other list, not the drawers). This is a genuine NEW keyboard-accessibility
feature, not a bug — Tab-into-a-panel, Arrow-through-its-rows, and Space/Enter-to-activate the focused row
would need real building (tabindex on rows, a keydown handler per open drawer panel, visual focus ring).
Confirm with the user this is wanted as a real feature (not just this one question) before building — scope
it as its own small piece, verify no conflict with existing single-key shortcuts (`h`/`n`/`f`/etc. currently
fire directly without needing focus).

### Item 3 — Shadow+Ground cloud-icon cycle "not working at all"
**Real candidate causes found (not fixed, needs live browser confirmation — don't guess which one, verify):**
1. `_buildShadowGroundRow()`'s `cloudBtn` click handler (`panels.js` ~line 1351) does
   `if (act && act.fn) act.fn(); else if (typeof window.toggleShadow === 'function') window.toggleShadow();`
   — but `toggleShadow` is ONLY ever assigned as `A.toggleShadow` (`tools.js` ~line 674), **never** as
   `window.toggleShadow`. If `_actionById('shadow')` (`act`) is ever null/stale at click time for any reason
   (registration-order issue), the fallback silently does nothing — no error, matching "not working at all."
   Check first: log `act` at click time, confirm it's non-null and `act.fn` really calls `A.toggleShadow`.
2. `A.setGroundTexture` (`tools.js` ~line 155) is called at the end of every `toggleShadow()` cycle, but its
   own body is async (`A._loadGroundConfig().then(A._applyGroundTexture)`) — if `_loadGroundConfig()` ever
   rejects or hangs (e.g. `ground_config.json` fetch failure), the cycle-state (`_shadowGroundKey`) and the
   swatch border (`_paint()`, synchronous) would still update correctly while the ACTUAL 3D ground texture
   never visually changes — which would look exactly like "selection not working" even though the button
   itself is firing. Check the console for `§GROUND_MAP load FAIL` or a `_loadGroundConfig` rejection.
3. Confirm `A.ground` (the ground mesh) actually exists for whatever building was tested — some extractions
   may not have one.
**Live-test order:** open devtools console, click the cloud icon once, check for `§SHADOW_GROUND cycle=...`
and `§SHADOW_GROUND_SWATCH key=...` log lines (both should fire if `toggleShadow` ran at all) — their
presence/absence immediately narrows which of the 3 candidates above is the real cause.

## ✅ 2026-07-06 — REOPENED items CLOSED, bim-ootb PR #673 (`lane/pill-drawer-followup-fixes`)

All 3 items live-verified via `node viewer/tests/witness_pill_drawer_followup_2026-07-06.js`
(real Playwright/chromium, real `HHS_Office_Federated` building, real pointer clicks + real
keyboard Space press) — ALL PASS, 0 console errors.

- **Item 1 (master de-highlight):** confirmed the diagnosis was right —
  `_buildMasterDrawer`'s `onClose` only did `console.log`, never re-synced pill highlights.
  Fixed: calls `_syncPillHighlights()`, matching the existing Palette/Settings `onClose` pattern.
- **Item 2 (Space-to-activate):** did NOT need the new tabindex/keydown/arrow-nav infra the
  original note worried about — drawer rows are already real `<button>` elements (native Tab
  already reached them). The only gap: the row only listened for `pointerup`, not the synthetic
  `click` the browser fires for Space/Enter on a focused button. Added a `click` listener gated
  on `event.detail===0` (keyboard-only clicks; real pointer clicks always have `detail>=1`) so
  Space/Enter now fires without double-firing on real mouse clicks. No PanelNav/arrow-traversal
  built — out of scope, Tab+Space alone satisfied the literal ask.
- **Item 3 (Shadow+Ground "not working"):** real root cause was CSS, not the candidates listed —
  viewer.html's shared rule `.bim-drawer-row .bim-drawer-row-icon { pointer-events:none }` (meant
  to let clicks on a purely-decorative icon span pass through to its parent row `<button>`) also
  matched the shadow-ground row's `cloudBtn`, which is the ONE real interactive control in that
  row — silently eating every click on it. Gave it a distinct class. Also hardened the `shadow`
  action's `fn` to call `A.toggleShadow()` directly instead of a bare `toggleShadow` identifier
  (the originally-suspected cause — turned out `window.toggleShadow` WAS correctly exported by
  `main.js`, so that candidate wasn't the live blocker, but the direct call removes the
  indirection regardless).

Bonus (user ask, same session): Help panel (F1) footer — "Documentation" text link replaced with
a lightbulb icon → real live Viewer User Guide (`red1oon.github.io/BIMCompiler/BIMUserGuide/`,
confirmed reachable via fetch); "Report Bug" text replaced with a bare (?) icon, `title=` tooltip
on hover. Both icon-only now, per request.

## WATCHDOG NOTE
This spec had THREE rounds of user correction during design dialogue (2026-07-05): (1) the original
mapping was incomplete, (2) Camera/View's grouping and Palette's exact members shifted, (3) Audio's
Visual-FX membership was wrongly resolved as "excluded" at one point when the user always meant it
included, and Navigate/Inspect went from "just ordering labels" to "real drawers" mid-dialogue.
**Implement exactly what's written above — it is the reconciled, final state — do not re-derive
from any earlier draft, an earlier commit of this file, or assumptions about what "usually" goes
together.** If anything above seems to conflict with the live code once you start, that's a
signal to re-check with the user, not to silently pick the reading that seems more sensible.

## ✅ 2026-07-06 — Alt-Z/X X-Ray↔Bbox "still comes on" below 50k — CLOSED, same PR #673 (commit `3f81202`)

Reassigned back mid-session by Watchdog (after being parked below). Live-diagnosed on
`HHS_Office_Federated` across 4 separate repro attempts (real Playwright clicks + real Alt+Z
keypresses, not just code reading):

- **Candidate A (auto-engage on every pick) — confirmed NOT the bug.** The auto X-Ray-dim that
  fires on every pick/Find-zoom/history-restore already reset correctly on deselect/click-outside,
  proven via a real pick → re-click-same-spot-to-deselect → re-pick → click-empty-space cycle, all
  4 steps toggling `xrayOn` exactly as expected.
- **Candidate B (manual Alt+Z cycle stuck) — confirmed NOT the bug either.** Off→X-Ray→Bbox→Off
  cycles cleanly every time in isolation.
- **The real gap, found on a 3rd repro round:** a MANUALLY-toggled Alt+Z mode (X-Ray or Bbox/ghost)
  only ever exited via another explicit Alt+Z press — by old, deliberate design
  (`_highlightLensReset`'s comment: "the depth lens must not disturb the manual x-ray"). Clicking
  outside the model, or deselecting, left it running forever. Confirmed with the user via a
  clarifying question: **"Originally only Alt-Z happens during Find selected item, zooming to it.
  But it got too slow for >50k so we switch to Alt-x. Both should shake out of their states upon
  click outside or select again to deselect item."** — i.e. this was always the intended contract,
  never fully implemented for the manual-toggle case.
- **Bonus finding while fixing:** while Bbox/ghost mode is active, the real solids are hidden and
  replaced by one merged ghost-box mesh — so almost every click lands on THAT mesh (no resolvable
  guid) rather than a real element or true empty space, and the old code returned early without
  ever reaching a clear/shake-out path. "Click outside" was effectively impossible to trigger while
  Bbox mode was on, since the ghost mesh covers most of the screen.

**Fix, scoped narrowly (not touching the shared `_highlightLensReset` helper's OTHER unrelated
callers — room/phase/material lens switches keep their old manual-toggle-preserving behavior):**
`A.clearFocusElement` (`viewer/navigate_find.js`) now force-exits `A.xrayOn`/`ghostXrayOn` after its
existing reset call; `viewer/picking.js`'s "no guid resolved" branch now also calls
`A.clearFocusElement()`, treating a guid-less hit (the ghost-mesh case) as equivalent to "clicked
outside." Live-verified: manual Bbox + click-outside shakes out, manual X-Ray + click-outside
shakes out, clicking the ghost mesh itself shakes out, original auto-engage-on-pick cycle
unchanged. 0 console errors. Witness: `viewer/tests/witness_shakeout_2026-07-06.js`.

The groundwork below (candidates A/B) is kept for the record — candidate A's "more likely" call
turned out to be wrong; worth remembering that live testing overturned a code-reading-only guess.

**User report, verbatim intent:** "the alt-x bbxes repair before is still not solved. It still comes
on for below 50k elements building ie HHS Office." — i.e. whatever the prior fix was meant to stop,
it's still happening on a building well under the 50k-element line (HHS_Office_Federated — PR #672's
own commit message cites "~6830 elements" for live-verification, presumably this same building).

**This session only read code — did NOT open the building live — so this is a lead, not a diagnosis.
Two distinct real code paths both touch "X-Ray/Bbox"; a fresh session must find out which one the
user is actually hitting before fixing either. Do not guess-fix both.**

**Candidate A — `focusElement()` auto-engages full X-Ray on every pick/Find-zoom/history-restore**
(`viewer/navigate_find.js:3461-3487`). PR #672 (`5e70e9b`/`7408ada`, "fix(viewer): >50k selection uses
cheap filter instead of heavy X-Ray") added `_bigBuilding = A.activeBuildingTotal > 50000`: ABOVE
50k → obscure the rest via cheap `filterByGuids` (visibility-only). Its own commit message says BELOW
50k is **"unchanged"** — meaning the pre-existing behaviour (`A.toggleXray()` auto-fires + rest dimmed
to 0.1 on EVERY selection, no manual key needed) still fires exactly as before on HHS_Office. If the
user's original ask was ever "don't auto-turn-on X-Ray/dimming just from picking something," #672 only
ever fixed the >50k case — the <50k case was never touched. This reads as the more likely candidate.

**Candidate B — the manual Alt+Z 3-state cycle itself** (`A.cycleXrayBboxMode`, `viewer/tools.js:235-253`;
Bbox = `toggleMergedGhost`, `viewer/navigate_find.js:900-916`, the wireframe-box "envelope ghost"). This
is a pure keypress/click toggle with **zero size branching** — it should behave identically at any
scale. If the user means Bbox mode itself won't turn off, renders wrong, or is stuck ON for
HHS_Office specifically (not "turns on when I didn't ask"), the bug is here instead.

**DONE WHEN:** open `HHS_Office_Federated` live, get the user's EXACT repro (click one element with
nothing else pressed? press Alt+Z once/twice/three times? does dimming appear with no input at all?),
then watch console for these 4 tags — they cover both candidates and will show which path actually
fires: `§FOCUS_ELEM ... xray=on/off` (candidate A), `§XRAY on=...` and `§XRAY_CYCLE ...` (both
candidates, A fires plain `§XRAY`/no cycle tag, B fires `§XRAY_CYCLE`), `§GHOST_XRAY visible=...`
(candidate B, Bbox specifically). Fix only the confirmed path — do not touch both on a guess, and do
not reuse the >50k cheap-filter branch for <50k without confirming that's actually what the user wants
(it may instead be "never auto-engage anything below 50k, only on explicit Alt+Z").

**Adjacent-but-separate ask from the same round — ✅ DONE, same PR #673 (commit `d11263c`).** Moved
the "Z" per-page timeline out of the W-pill's long-press-only drawer (`_worldHistDrawer`,
`viewer/panels.js`) into its own always-visible row (new `docHist` action) inside the Navigate
drawer, right next to `worldhist`. Bomb (`_clearHistoryWithWarning`, dangerous/irreversible) stays
long-press-only, unchanged. The existing `z` keyboard shortcut (scene.js `_shortcuts`, unchanged) is
now surfaced via the row's own label for the first time. Live-verified (Playwright): row exists +
labeled "Page History · z", click opens/closes the real `#universal-hist-btns` bar, long-press
mini-drawer now holds only the bomb. **User explicitly said to SKIP the "is it properly pushed"
investigation this round** ("ignore tshooting if worldhistory is merged.. just focus on the icons
arrangement") — whether the per-page timeline visibly populates during ordinary browsing is still an
open question, deliberately not chased here.

## 🔍 2026-07-06 — NEW: pill rail flickers off-then-on on the FIRST touch (research only, not live-confirmed)

**User report:** "there is a habit of when first touch of the pill list, it flicker off and on." Pasted a real
console log excerpt (not requested by me — the user proactively grabbed it, a good sign this is genuinely
hard to eyeball). The relevant lines, in order, with nothing else pill-related between them:

```
§PILL open=false
§KRN_CHAIN sealed=18 ...
§KRN_PERSIST url=...
§RENDER_LOOP start total=7
§IDLE_GATE wake / park
§PILL_SYNC synced=6
§PILL open=true
```

**Traced the code (not yet live-verified — this is a lead, not a diagnosis):** `#mobile-trigger`
(`viewer.html:548`) has exactly ONE handler — a plain `onclick="toggleMobilePill();..."` — and
`toggleMobilePill` is just an alias for `common/pill_builder.js`'s own `_toggle()` (`panels.js:2017`,
`window.toggleMobilePill = _mainPill.toggle`). No duplicate `addEventListener` binding was found on the
trigger anywhere (grepped `pill_builder.js`, `panels.js`, `wh_walk.js`) — so a classic "two listeners on one
button" double-fire was RULED OUT as the mechanism, not confirmed as the cause. `§PILL_SYNC synced=6` is
expected INSIDE a normal open (`_toggle()`'s `if (_pillOpen) {...; _sync(); ...}` branch, `pill_builder.js:304-306`)
— that part of the sequence is NOT evidence of a second, separate process.

**What's still unexplained:** the pasted excerpt shows `open=false` then, ~2 render-loop cycles later (roughly
the time between two animation frames), `open=true` — two flips with NO intervening `§PILL action=` or
`§KBD_ROUTE` line, i.e. nothing logged that looks like a second deliberate tap. Either (a) `_toggle()` really
did fire twice from one physical touch (mechanism not yet found — check for a duplicate touch-emulated 'click'
firing after a 'pointerup' already handled the same physical tap, the same double-fire shape already fixed once
in `measure.js:1539-1540`'s `pointerup`+`click` pair — `pill_builder.js` itself only binds `pointerup` per
button, but the TRIGGER's binding is a raw HTML `onclick`, a different code path, not yet audited the same way),
or (b) the pasted log excerpt simply started mid-stream and an earlier `open=true`/`open=false` pair scrolled
past before the paste began, making this look like a flicker when it's actually two unrelated real taps. **(b)
cannot be ruled out from a log excerpt alone.**

**DONE WHEN:** live-reproduce on a fresh page load with devtools open — do ONE single physical tap/click on the
`#mobile-trigger` (real touch on a touch device is the priority repro, since "first touch" phrasing suggests
touchscreen, not mouse), count exactly how many `§PILL open=` lines print and how many `_toggle()` calls have
distinct stack traces (add a temporary `console.trace()` inside `_toggle()` if needed) for that ONE tap. If
it's genuinely 2 calls per 1 tap, that's the real bug (find the second binding); if it's 1 call per tap and the
visual "flicker" is a CSS/animation artifact instead (e.g. `_layoutRail()`'s transitionDelay staging, or the
360ms roll-in/out timing racing the `pill-revealing` class), that's a different, CSS-side fix.

## ⚠ 2026-07-06 — CROSS-REF: `common/pill_builder.js` changed underneath this open flicker item, PR #682 merged (`01d8932`)

Full write-up owned by `Viewer/HBA/RESUME_HR_BIM_ASSET.md §2026-07-06d` (Human-Asset pill desync fix) — pointer only, not
duplicated here per one-owner-per-fact. Flagging here because it touches the SAME file and SAME `_sync()`
mechanism as the still-open flicker item directly above:

`common/pill_builder.js` gained a `MutationObserver` on `document.body` (`§PILL-AUTOSYNC`) that now calls
`_sync()` on the next animation frame after ANY DOM node add/remove, app-wide — not just on a deliberate pill
tap. This is a NEW source of `§PILL_SYNC`/highlight-recompute activity that did not exist when the flicker
repro above was written. Before running that repro again: re-verify the "2 calls per 1 tap" vs. "1 call, CSS
artifact" split fresh against POST-#682 code — the observer could itself now be firing an extra resync around
first paint/first panel mount that reads like a second `_toggle()` in a log excerpt, without actually being one.
Do not assume the old trace/repro plan still isolates the same variables untouched.

**Cross-surface blast-radius check (2026-07-06, self-initiated — PR #682's own commit message only names
viewer/HBA, but `pill_builder.js` is the ONE canonical builder loaded by all 6 surfaces: erp.html,
idempiere.html, glassbowl.html, glassbowl_gravity.html, index.html, viewer.html — see this module's own
header).** Ran `erp/tests/witness_pill_canonical.js` fresh against post-#682 `origin/main` (not trusting the
PR's own scope claim): **36/36 checks, `ALL PASS`, 0 fails** — W1 single-source integrity confirmed statically
on all 6 surfaces, W2/W3/W4 (open/close decree, hover labels, icon-map) live-reverified in a real headless
browser on `erp.html`/`idempiere.html`/`glassbowl.html`, all unaffected by the new observer. Pre-existing gap,
NOT introduced by #682: `glassbowl_gravity.html` and `index.html` have no live pill-behavior witness at all —
this witness's own scope note limits W2-W4 to the 3 surfaces above.

## ▶ 2026-10-24 — AS SHIPPED, measured on the live viewer (Duplex; `prompts/DOCS_GUIDE_REFRESH.md`) — supersedes the FINAL DRAWER MAP above where they differ
Rail (top → bottom): 4D Window, Help, Settings, Share, Camera / View, Palette, Inspect, Navigate, Open, Save — behind the ⋯ trigger.
Drawer panels are persistent `.bim-panel`s (`navigate-drawer-panel`, `inspect-drawer-panel`, `camview-drawer-panel`); they close by tapping the
master pill again — **Escape does not close them** and two can be open at once.
| Drawer | Rows as shipped |
|---|---|
| Navigate | Find / Navigate f · **Role View r** · World History w · Page History z · Home · **Fly Tour l** · **Nav LOD (large bldgs) o** (Walk = mobile only) |
| Inspect | Measure m · Clash Matrix c · X-Ray / Bbox (Alt+Z, 3-state) · Section Cut x · Time Machine t · 4D / 5D 4 — **6 rows; Fly Tour left it** |
| Camera / View | Precision (Caps Lock) · Reset Camera a · Auto-Pivot q · **GI Preview (AO) Alt+G** |
| Palette | 5 sliders (tooltips: Color Studio, Sun intensity, Exposure, Ambient, Hemisphere) · icon row Still Refine Alt+S / Populate Alt+P / Cinema Orbit Alt+C · Night n · Shadow + Ground h (Off → Earth → Grass → Paved) · Background b · Sound FX v |
| Settings | Pill Icons · Edit Project JSON (**8** files: + Road Standards, Civil Labels) · 5D Rate Pack · Cache Info |
The 📷 Screenshot action no longer exists (`panels.js:1491`, §DELETIONS) and the old Clear / ☆☾ / ✈ buttons are gone — `docs/BIMUserGuide.md` was
rewritten to match (2026-10-24).
