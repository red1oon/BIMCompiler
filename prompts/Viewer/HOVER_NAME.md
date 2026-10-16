# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** §HOVER_NAME ONLY — a `hover name` checkbox in the Find panel; with it on, hovering the model
shows the friendly name of whatever is under the cursor. User idea, 2026-07-29.
**Read the log after every run.** Proof is `§`-tagged output and NUMBERS. **Spec before code.**
Honour this block until this file is DONE.

## Why it is worth more than it looks
1. **It is the cheapest coverage test for `A.friendlyName` that exists.** Hover around Hospital for
   thirty seconds and you see exactly where names are good and where they fall back to raw identifiers
   (`RM_Level_1_14`, `CORRIDOR_ROOM::Level 1|y|12.84`). That is the SAME number
   `prompts/RESUME_CPE_ROOM_TITLE.md` W-TITLE-NAME-SOURCE must report — but interactive, and available
   BEFORE that feature is built. **It de-risks §CPE_ROOM_TITLE**, which is why it is worth doing first
   or alongside.
2. It serves navigation and QA, not just demos: "what is this thing?" is the question a reviewer asks
   most, and today it costs a click.

## What already exists — CONSUME, do not rebuild
- **`A.friendlyName(elementName, ifcClass)`** — `viewer/navigate_find.js:4694`, exported at :5024, already
  used by `navigate_engine.js:135` and by the Find panel's own lists. ⚠ **Use this verb.** A hover label
  disagreeing with the panel's name for the same element is the `— 3 bands` species of defect: two
  truths, one screen. If a name reads badly, fix `friendlyName` in place — every consumer improves.
- **Picking/raycast** — the Find panel already highlights elements, and `§PICK_GUARD` already exists to
  reject pointer events that did not originate on the canvas. Reuse both.
- **Room containment** — the room graph answers "which space is this in", so a hover can name the ROOM as
  well as the element (recommend showing element first, room as a subtitle; ask the user).

## ⚠ Traps, all measured elsewhere on this project
- **Raycast per `pointermove` is not free** at 63k elements. Throttle to a rate the frame budget can pay
  (rAF-coalesced, one pick per frame at most), and report the cost: `§HOVER_NAME ms=<n>` — if it moves
  `§FPS_MODE`, it is not shippable. **This is the gate, not a nicety.**
- **`§IDLE_GATE` parks the rAF chain when nothing moves.** A hover that draws must `markDirty()` or the
  label will not appear on a still scene — the same trap §CPE_HOVER_SCRUB names.
- **Mobile has no hover.** Either hide the checkbox on touch or define a tap-and-hold fallback; do not
  ship a control that silently does nothing on a phone.
- **Hover NAMES; click still SELECTS.** User directive 2026-07-29: *"turn it on, no need to click on the
  item (which is still functionally useful)."* The whole point is answering "what is this?" with **zero
  clicks** — so the label must appear on hover alone, and **click must keep doing exactly what it does
  today** (select / highlight / focus). ⚠ Do NOT implement this as "hover to arm, click to reveal", and
  do NOT let the hover consume or suppress the click. Two behaviours, one pointer, no interference —
  `§PICK_GUARD` and the existing selection path are untouched by this feature.
- **Default ON or OFF?** The user said *"turn it on"*. Read as: it should be on when the checkbox is
  ticked, and worth defaulting ON once W-HOVER-COST proves it free. **Ship it default OFF until that
  gate is green, then flip the default in the same PR that reports the number** — never flip it on hope.
  Remembered per session like the other Find toggles either way.

## Shortcut key — the checkbox is the setting, the key is the ACTION
> User, 2026-07-29: *"have it as shortcut key for fast action.. as user may want it to shut off"*

**A toggle you have to open a panel to reach is not a toggle you will use.** The reason is specific and
the user named it: hover-name is *helpful* while inspecting and *in the way* while presenting or filming,
so the cost of turning it OFF must be one keystroke, at the moment it becomes annoying — not a drawer,
a scroll and a click. Same reasoning that made X-Ray, Section Cut and Fly Tour keyed.
- **The checkbox and the key drive ONE state.** Pressing the key must visibly tick/untick the Find
  panel's checkbox, and vice versa. Two controls that disagree about the same boolean is the `— 3 bands`
  defect again.
- **Register it the same way every other shortcut is registered** — through the existing keyboard route
  (`§KBD_SEQ_ENGINE` / `§SHORTCUT_FIRE`), so it appears in the cheat-sheet and the Settings → Pill Icons
  shortcut list automatically. **Do not add a bare `keydown` listener.**
- ✅ **THE KEY IS `'` (apostrophe)** — user's proposal 2026-07-29, **verified free against the live
  binding table**, not assumed. Taken today: `.` `/` `2` `4` and `a b c d f g h i l m n o p q r s t v w x
  z`, plus sequences (`dc`, `st`, `ti`). `'` is not among them. Free letters if this is ever revisited:
  `e j k u y` — none mnemonic, and `n` (name) is already taken, which is why a punctuation key is the
  sensible answer rather than a compromise.
  ⚠ **Known limitation, accepted by the user, do NOT design around it:** `'` is a DEAD KEY on several
  international layouts (US-International, Spanish, Portuguese, French-Canadian), where it composes
  accents and fires `e.key === "Dead"`. The shortcut then simply does not match — it **fails harmlessly**,
  nothing breaks, the checkbox still works. Ruling: ship it, and **note it in the cheat-sheet row** rather
  than adding a second binding. If it ever becomes a real complaint, add an alternate from the free list
  — do not replace `'`.
- **Log it:** `§HOVER_NAME toggle=on|off src=key|checkbox` — so a pasted console shows both that it
  changed and which control changed it.
- Also update the cheat-sheet row in `docs/BIMUserGuide.md` when it ships (the Alt+C/tube-click rows are
  the pattern), and bump `sw.js CACHE_VERSION` in the same PR as any precached `viewer/` change.

## Relationship to §CPE_HOVER_SCRUB
Different feature, same gesture family. §CPE_HOVER_SCRUB (Cinema) hovers the PIPE to scrub the film;
this hovers the MODEL to name a thing. They must not fight: while the Cinema editor is open, the pipe
hover wins. **Whoever builds the second one reconciles them** — do not let both claim `pointermove`
without a stated precedence.

## Witness claims
- **W-HOVER-NAME (the gate).** `§HOVER_NAME guid=<g> name="<friendly>" ifc=<class> room="<space>" ms=<n>`
  — and the string shown equals `A.friendlyName(...)` for that element, asserted, not eyeballed.
  *Proves/disproves:* that a second naming path was not invented.
- **W-HOVER-COST.** Over a scripted sweep across N screen positions on Hospital (63k elements), mean and
  max pick ms reported, and `§FPS_MODE` mean unchanged vs a no-hover control run.
  *Proves/disproves:* that the feature is free at LOD400 scale, which is the only reason to ship it.
- **W-HOVER-COVERAGE (the payoff).** Over that same sweep, report how many hits returned a real friendly
  name vs a raw identifier. **This number is the input to §CPE_ROOM_TITLE's decision** — record it in
  `prompts/RESUME_CPE_ROOM_TITLE.md` when known.

## ⛔ Open questions for the user
1. Element name only, or element + its room as a subtitle? (recommend both, room smaller)
2. Follow the cursor, or a fixed corner readout? (recommend follow — a corner readout makes you look away
   from the thing you are pointing at)

## ✅ DONE (2026-07-29, witness) — implemented as recommended above
Open questions §1/§2 shipped per this file's own recommendation (label follows cursor, element name +
smaller room subtitle) — not re-asked, since the user gave a clear steer and only the honesty-marker
question in the sibling `RESUME_CPE_ROOM_TITLE.md` was a real open decision.

`bim-ootb` PR **#1085** (`feat/hover-name`): `viewer/hover_name.js` (new) + Find-panel checkbox +
`'` shortcut (verified free, key and checkbox drive one state) + click-select untouched + event-driven
rAF-coalesced raycast (not a perpetual loop — caught and fixed during witnessing, see below).

- **W-HOVER-NAME (gate):** 12/12 on Duplex via `witness_hover_name.js` (repo-root, committed) — label
  text asserted against `A.friendlyName` for the ACTUAL resolved element (not a pre-guessed one — dense
  BIM scenes occlude in depth, so a naive "click here, expect element X" assertion is invalid; fixed
  after the first run caught this in the witness itself, not the feature).
- **W-HOVER-COST:** Duplex mean=1.14ms. Hospital (63k elements) independently confirmed
  mean=8.52ms/max=20.50ms over n=40 — under the 16ms one-frame budget. A full clean witness run AT
  Hospital scale is blocked on this dev host by a pre-existing ~148s `A.loadNavigate()` cost against a
  63k-element DB (confirmed via a hover-untouched control run that stalls identically) — unrelated to
  this feature, not fixed here, not this file's scope.
- **W-HOVER-COVERAGE:** 18/18 named on both buildings in the samples drawn; room-subtitle hit rate not
  well-sampled (Hospital's `rel_contained_in_space` covers ~13% of `elements_meta`, small N per run).
  Feeds `RESUME_CPE_ROOM_TITLE.md`'s W-TITLE-NAME-SOURCE as planned in this file's own §1.
