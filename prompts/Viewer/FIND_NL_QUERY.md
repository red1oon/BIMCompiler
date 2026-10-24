# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** the Viewer's typed/voice natural-language QUERY layer behind the Find box — the gate, the decoder, the answer toast, and the chips.
Created 2026-10-24 because `VIEWER_PROMPTS_LANE_OVERLAP_AUDIT.md` lists `nlp.js` with owner **none**; the guide refresh
(`prompts/DOCS_GUIDE_REFRESH.md`) found two defects here with nowhere to record them. **Read the log after every run — exit code is not evidence.**
Spec before code; every claim below is a measured value or a `file:line`, none invented. Honour this block until the ⛔ items are ✅.

## Ownership map (who answers a typed query — read before changing any of it)
| Step | Owner | file:line (bim-ootb `viewer/`, checked 2026-10-24) |
|---|---|---|
| Is this text a query? (the GATE) | `NF._nlpRe` = `/^(count\|how many\|number of\|total\|cost\|show\|list\|what\|find\|search)\b/i` | `nf_isolate_drill.js:426` (a file named for isolate/drill) |
| Typing → hint, Enter → run | `_handleInput(text, explicit)`; live typing shows "Press Enter ↵" | `nf_panel_search.js:16-34` |
| Decode | `BimDecoder.decode` first, then regex `PATTERNS` fallback | `nlp.js:285-315`, `decoder.js` |
| Answer | `showToast(summary, table)` → `#nlp-toast` (green card, **Details**, **Show in 3D**) | `nlp.js:404` |
| Chips (count doors / total cost / show structure) | `buildChips()` → `_handleInput(ex, true)` | `nf_panel_search.js:39-54` |
| A SECOND query UI | `#nlp-bar` / `#nlp-input` / `#nlp-chips` / `#nlp-history` built by `nlp.js` itself | `nlp.js:477-563` |
**SPAGHETTI?** two query UIs and a gate living in an unrelated file; answers land in a toast while the Find panel's own `#find-results` stays empty.

## Measured on the published site (Duplex, 2026-10-24, clean runs; `scripts/docs_capture_bim_user_guide_a2.js`)
count doors 14 · how many beams 12 · number of windows 24 · total cost "$ 262,925 (RM 1,011,250)" (16 classes) · cost of structure "$ 4,460" (3) ·
cost of architecture "$ 71,847" (9) · show structure = list structure 19 · show mep 904 · show architecture 196 · what disciplines "1,119 — disciplines breakdown" (3) ·
total area / length of walls / volume of slabs → element counts labelled "no QTO dimensions in DB" · total floor area → "1,119 — storeys breakdown" (5) ·
find door = search door = list doors → "14 — show door" · `cost of mep` / `cost of electrical` / `show electrical` → "No results … Available: IfcBeam, …" (Duplex has no such discipline name — data, not a defect).

## ⛔ OPEN 1 — `floor <n> <class>`, `ground floor <class>`, `floor area` can never run from the Find box
`nlp.js:105-125` defines `^(?:floor|level)\s+(\S+)\s+(\w+)$` and `^ground\s+floor\s+(\w+)$`, and `nlp.js:190` defines `^floor\s+area$`; the no-match toast even says
`Try: "count doors" or "floor 1 walls"` (`nlp.js:314`) and the legacy placeholder lists `floor 1 walls`. But the Find panel forwards text to `A._nlpExecute` only when
`NF._nlpRe` matches, and that regex has no `floor`/`level`/`ground`. Measured (toast dismissed before each, Enter pressed): `floor 1 walls`, `floor 1 doors`, `floor 2 walls`,
`ground floor doors`, `ground floor walls`, `floor area` → **no toast, falls back to plain search ("Did you mean…", 0 matches)**.
**Fix shape (viewer code, own worktree):** add `floor|level|ground` to `_nlpRe`, or let any text that no search result claims fall through to `_nlpExecute` — pick ONE (no second gate).
**Witness to write:** for each of the six phrases above on Duplex, real keystrokes (see OPEN 2) + Enter → a `#nlp-toast` appears and `§NLP_DEC kind=…` is logged;
INCONCLUSIVE if no storey matched (do not pass on an empty population).

## ⛔ OPEN 2 — Space typed in the Find box is swallowed (blocks every multi-word query)
Owner of the key block is `Viewer/ROOM_CYCLE_HOME_SHORTCUTS.md` (⛔ section 2026-10-24, `scene.js:3550-3558`, `§KBD_ROUTE panel=find key=` per space). Listed here because
it makes this layer unusable from a physical keyboard: `count doors` arrives as `countdoors`. Chips, paste and voice are unaffected. The witness for OPEN 1 must use real keydowns,
not `input.value = …`, or it will pass over the defect (that is how the Ask capture and earlier witnesses missed it).

## Not yet checked (do not claim)
`cost of <discipline>` on a building that has ELEC (Terminal/Hospital) · voice input · the decoder's phrasing beyond the regex list · the legacy `#nlp-bar` (is it reachable at all?).
