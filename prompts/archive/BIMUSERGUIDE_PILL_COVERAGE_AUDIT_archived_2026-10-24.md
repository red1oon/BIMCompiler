> **ARCHIVED 2026-10-24 — STALE.** A one-off 2026-07-12 completeness pass; its "ground truth" id table no longer matches the live toolbar (Fly Tour moved Inspect → Navigate, Role View / Nav LOD / GI Preview added, Parts axis retired, JSON hub now 8 files, 📷 screenshot removed). Superseded by the measured, re-runnable crawl in `prompts/DOCS_GUIDE_REFRESH.md` (scripts `scripts/docs_capture_bim_user_guide_*.js`).

<!-- Copyright (c) 2025-2026 Redhuan D. Oon <red1org@gmail.com> · SPDX-License-Identifier: MIT -->
# BIMUSERGUIDE PILL COVERAGE AUDIT — fill the missing toolbar features (2026-07-12, dispatch to Agent)

```
# ⚠ DO NOT REMOVE
SCOPE: bim-compiler `docs/BIMUserGuide.md` + `docs/img/viewer/*` only — a completeness pass, not a
rewrite. User's own words (2026-07-12): "I see Viewer guide lots of missing ie on the whole pill
list of other features besides Time machine ERP which can link back to ERP guide." Read this whole
file, triage first (see Task 1), then execute. Read the log after every run. PUSH PAUSE LIFTED for
this repo — commit locally, verify on localhost, push, no PR needed for docs-only (same pattern as
every docs commit this session — direct push to `fable/meshdb-livewire`, no separate branch/PR
ceremony for pure docs changes, that convention has held all session).
```

## Ground truth — the real pill list vs what's documented (confirmed via source, don't re-derive)
`common/pill_builder.js` + `viewer/panels.js` (bim-ootb) define these `id:` actions — the full real
toolbar/drawer surface:
`audio, background, bbox, cam-pivot, cam-reset, camview, clash, clash_rules, corporate, docHist,
find, fly, fullscreen, grid_rules, hbaFM, help, home, initbubble, inspect, issues, json-editor,
measure, navigate, night, open, palette, precision, report, save, schedule, section, settings, sfx,
shadow, share, tm, walk, whwalk, worldhist, xray`

`docs/BIMUserGuide.md` currently documents, explicitly, only: X-Ray, Measure, Section-cut, Screenshot,
Storey filter, Discipline toggle, Deep-link URL, IndexedDB cache, City mode, Find panel (fully, just
added), FM/Operate lenses (cross-linked to `HRBIMAssetGuide.md`), Teams overlay (cross-linked to
`TeamsOverlayGuide.md`), and a mobile-only list. Roughly a dozen of ~40 real actions are covered.

## Task 1 — triage every undocumented id BEFORE writing anything (don't blindly document all 40)
For each id not already covered, read its `fn`/behavior in `panels.js`/`pill_builder.js` and sort
into exactly one bucket:
1. **Real user-facing feature, needs guide coverage** (most of these, likely): `tm` (Time Machine),
   `clash`/`clash_rules` (clash detection), `schedule`, `share`, `worldhist`/`docHist` (World/Doc
   History — note this project already has extensive History-lane work, check
   `project_whole_history_timeline.md`-style memory/prompts before writing from scratch), `walk`
   (indoor walkthrough — may already be covered under "Viewer Features" bullets, verify), `whwalk`,
   `save`/`open`, `night`/`shadow`/`background`/`palette` (visual/display options), `precision`,
   `issues`, `report`, `sfx` (sound), `inspect`, `cam-pivot`/`cam-reset`/`camview`, `home`,
   `fullscreen`.
2. **Already covered elsewhere, needs only a cross-link** (the user's own example): `tm` (Time
   Machine) — `docs/ERPUserGuide.md` already has full authoring/playback/What-if coverage (lines
   ~162-230+, confirmed this session). Do NOT re-document Time Machine in BIMUserGuide.md — add a
   short pointer sentence + link, same pattern already used for FM/Operate lenses and Teams overlay
   in this same doc (see how those two are handled — one paragraph + "Full walkthrough: [link]").
   Check EVERY id for this pattern before writing fresh prose — `worldhist`/`docHist` may also
   already be covered by history-lane docs elsewhere, check before assuming it needs new content.
3. **Internal/dev-only, out of scope for an end-user guide** — `json-editor`, `corporate`,
   `initbubble`, `grid_rules` look like dev/admin tooling by name alone, but VERIFY by reading what
   they actually do before excluding (don't guess from the id string) — a wrong exclusion silently
   drops a real feature, a wrong inclusion documents an internal tool as if it's for end users.
4. Report the full triage (id → bucket + one-line reason) as the FIRST thing committed, before any
   prose/screenshot work — so the scope is visible and reviewable before the bulk of the work happens.

## Task 2 — write + screenshot bucket-1 items, cross-link bucket-2 items
Same quality bar as every guide addition this session (see the Find panel section already in this
doc as the template): numbered step-by-step navigation (which pill, where, what it does), real
Playwright screenshots (`deviceScaleFactor:2`, tight clips, 0 console errors — not placeholders),
placed under `## Viewer Features` alongside the existing sub-sections. Group related small features
into one sub-section rather than one heading per pill where it reads better (e.g. `night`/`shadow`/
`background`/`palette` are all "display appearance" toggles — one "Display options" sub-section with
a small table, not four separate headings).

## Explicitly out of scope
- `docs/ModellerGuide.md` — separate doc, not this task (unless a bucket-3 review finds something
  that's genuinely Modeller-only mislabeled here, name it, don't silently move it).
- Rewriting any ALREADY-documented section (X-Ray, Measure, Section-cut, Find panel, etc.) — this is
  purely filling gaps, not a full-doc revision.
- Any code changes — this is docs-only, even if a triage step reveals a pill that seems broken or
  oddly named; name it as a finding, don't fix it here.

## DONE WHEN
Task 1's full triage table committed first (reviewable checkpoint). Every bucket-1 id has a real,
screenshotted section; every bucket-2 id has a one-sentence cross-link (no duplication); every
bucket-3 exclusion is justified with what was actually read, not guessed. Pushed to
`fable/meshdb-livewire` per this session's docs convention.

## Task 1 — full triage table (2026-07-12, Agent)

Read every id's real `fn`/behavior in `common/pill_builder.js` + `viewer/panels.js` (bim-ootb main,
verified fresh — `home`/`worldhist`/`docHist`/`walk` etc. all read directly, not guessed from the id
string) and cross-checked every candidate cross-link target actually exists and covers the topic
before citing it. Already-documented ids are listed too (no action) so the table is a complete audit,
not just the gap list.

| id | Bucket | Reason (what was actually read) |
|---|---|---|
| `find` | 0 already documented | Full Find panel section, just added — no action. |
| `xray` | 0 already documented | X-Ray bullet + Keyboard cheat-sheet — no action. |
| `measure` | 0 already documented | Measure tool bullet — no action. |
| `section` | 0 already documented | Section cut bullet — no action. |
| `fly` | 0 already documented | "Fly-tour — auto-orbits…" bullet — no action. |
| `fullscreen` | 0 already documented | 3D Navigation table + Toolbar table + Keyboard cheat-sheet (3 places) — no action. |
| `hbaFM` | 0 already documented | FM/Operate lenses section, cross-linked to `HRBIMAssetGuide.md` — no action. |
| `walk` | 0 already documented | `A.toggleWalkMode` (walk.js) is the real GPS/device-orientation blue-dot mode, genuinely `platform:'mobile'`-gated — matches the existing "GPS Walk Mode — blue dot tracks position" mobile-only bullet exactly. No action. |
| `issues` | 0 already documented *(finding, not fixed)* | "Issue log" is in the Mobile-only bullet list. Read `A.toggleIssues` (issues.js) — it has **no** platform gate in code, works identically on desktop. Existing placement is technically incomplete, but rewriting that list is explicitly out of scope for this pass — flagging only. |
| `tm` | 2 cross-link | `docs/ERPUserGuide.md` lines ~162-230+ already has full Time Machine authoring/playback/What-if coverage (confirmed this session, per dispatch). Adding a pointer paragraph, not new prose. |
| `clash` | 2 cross-link | `A.export4D5D`/clash flow already linked from `docs/BIMUserGuide.md`'s Further Reading table → `CLASH_DETECTION.md`. That table-row link exists but is never tied to the actual toolbar pill (key `c`, lives in the Inspect drawer) anywhere in the doc body — adding an in-context pointer sentence where the Inspect drawer is introduced, not new clash-detection prose. |
| `report` | 2 cross-link | `A.export4D5D` (tools.js) opens `boq_charts.html` — confirmed this is the same analytics the Further Reading table already links as `4D5DAnalysis.md`. Same treatment as `clash`: in-context pointer in the Inspect drawer section. |
| `worldhist` | 1 needs coverage | No end-user doc exists anywhere (checked `docs/*.md` for "World History"/"worldhist" — zero hits outside the Find panel section's own drawer-row listing, which only NAMES the row, never describes what tapping it does). The `prompts/HISTORY_*.md` files are dev implementation specs, not end-user docs — not a valid cross-link target. Real gap. |
| `docHist` | 1 needs coverage | Same as `worldhist` — named as a Navigate-drawer row in the Find panel section, never functionally described. Real gap. |
| `home` | 1 needs coverage | Same pattern — named as a drawer row, `fn` (panels.js ~1277) never described (returns to the front-door hub, PWA-aware). Real gap. |
| `save` / `open` | 1 needs coverage | `A.saveModelDb`/`A.openModelDb` — real native-dialog save/restore of the current session's `.db` (distinct from the Hub's building-open flow already covered in Quick Start). Never mentioned anywhere in the doc. Real gap. |
| `share` | 1 needs coverage | `A.quickShare` (share.js) — a real, distinct pill: native share sheet (photo attached) on mobile, a copy/share preview card on desktop, plus clash-aware sharing when a clash is open. More than the existing "Deep-link URL" bullet describes (that bullet only names the underlying URL mechanism, not this pill/UI). Real gap. |
| `navigate` | 0 already documented | The Find panel section already fully documents opening this drawer — no action beyond the grouped `worldhist`/`docHist`/`home` mini-section above (its OTHER rows). |
| `inspect` | 1 needs coverage | Drawer master, never documented as an entry point. Bundles `measure`/`clash`/`xray`/`section`/`tm`/`report`/`fly` (`_inspectDrawer` subIds, panels.js ~1529) — most already covered individually; this section documents the drawer itself + carries the `tm`/`clash`/`report` cross-link pointers. |
| `camview` | 1 needs coverage | Drawer master, never documented. Bundles `precision`/`cam-reset`/`cam-pivot` (panels.js ~1530). |
| `cam-reset` | 1 needs coverage | `window.resetCamOrbit` — real, undocumented. Folds into the `camview` section. |
| `cam-pivot` | 1 needs coverage | `window.toggleCamPivot` (Auto-Pivot) — real, undocumented. Folds into the `camview` section. |
| `precision` | 1 needs coverage | `window.togglePrecisionFine` (Caps Lock) — fine-movement camera mode, undocumented. Folds into the `camview` section. |
| `palette` | 1 needs coverage | `A.toggleSunglass` opens a real panel: 5 lighting sliders (Ambience/Sun/Exposure/Ambient/Hemisphere) — verified by reading `A._buildSunglassPanel` (panels.js ~290-377). Container for the grouped "Display options" section below. |
| `night` / `shadow` / `background` / `audio` | 1 needs coverage, **grouped** | Verified via `_extendVisualFxPanel` (panels.js ~1536-1554): these 4 are literally appended as rows INSIDE the same Palette panel opened by `palette` (not separate panels) — Night toggle, Shadow+Ground 4-state cycle (Off→Grass→Earth→Paved), Background (white/dark reverse), Sound FX on/off. One "Display options" sub-section, per the prompt's own grouping instruction — this is the concrete case it was pointing at. |
| `settings` | 1 needs coverage | `_openSettingsPanel` (panels.js ~1559) — real panel: Pill Icons customizer (show/hide/reorder the toolbar), 5D Rate Pack picker, Cache Info + clear, Reset Pill Icons, and the "Edit Project JSON" hub. Never documented. |
| `json-editor` | 1 needs coverage | The "Edit Project JSON" hub itself (`_buildJsonHub`, panels.js ~1976) — a real end-user-reachable panel (via Settings, no auth wall/flag), NOT a hidden dev tool. Folds into the `settings` section as one described feature (its own bullet list is the 6 entries below). |
| `corporate` | 1 needs coverage, minor | Verified via `_jsonRegistry` (panels.js ~1962): "Corporate / Branding" — edits `corporate.json` (site branding) through the same reachable Settings→JSON hub. Real, not internal-only by the letter of "who can reach it" — but the audience is a project admin, not a day-to-day viewer, so it gets one bullet inside the `settings` section, not its own screenshot/heading. |
| `grid_rules` | 1 needs coverage, minor | Same hub, "Grid Rules" — edits `grid_rules.json`. Same treatment as `corporate`. |
| `clash_rules` | 1 needs coverage, minor | Same hub, "Clash Rules" — edits `clash_rules.json` (tolerance/rules used by the Clash Matrix). Same treatment. |
| `initbubble` | 1 needs coverage, minor | Same hub, "ERP Globe Bubbles" — edits `initbubble.json`. Same treatment. |
| `sfx` | 1 needs coverage, minor | Same hub, "Sound Effects" — edits `sfx.json` (synthesized-audio parameters). **Distinct from `audio`** (the on/off toggle inside the Display-options Palette panel) — this is the JSON tuning file behind it. Same treatment. |
| `schedule` | 1 needs coverage, minor | Same hub, "4D Schedule (this building)" — a **read-only** projection of the captured Time Machine schedule as JSON (`source:'db'`, `readonly:true`). Same treatment; also gets a one-clause mention alongside the `tm` cross-link since it's the same underlying data. |
| `whwalk` | 1 needs coverage, minor/niche | `WHWalk.toggle` — real, but `pill:false`-gated until the loaded building carries locator-GUID bins (warehouse/logistics buildings only, e.g. GardenWorld). No existing warehouse/logistics guide doc exists in `docs/` to cross-link. One short paragraph, no screenshot — a real building with this data would be a separate side-quest disproportionate to one pill in a general viewer guide; noting the scoping choice here rather than silently skipping it. |
| `bbox` | 1 needs coverage, minor (not a new section) | `window.toggleGhostXray` — confirmed absorbed into the SAME `xray` key/button as a 3-state cycle (Off→X-Ray→Bbox→Off, panels.js ~1230-1239 comment: "Alt+X retired"). No separate UI entry point exists any more. One clarifying sentence added to the *existing* X-Ray bullet (a gap-fill, not the "rewriting an already-documented section" this task excludes) rather than a new heading. |
| `help` | 1 needs coverage, minor (not a new section) | `showCommandPalette` (F1) — opens the live pill/shortcut list. One line added to the Keyboard & Mouse Cheat-Sheet section, not a dedicated heading. |

**Bucket-3 (internal/dev-only, excluded) check:** every id the prompt flagged as a *guess* —
`json-editor`, `corporate`, `initbubble`, `grid_rules` — turned out, on actually reading the code, to
be reachable by any user through Settings with no auth wall or feature flag, i.e. genuinely bucket-1
(minor), not bucket-3. **There is no bucket-3 exclusion in this audit** — nothing was found to be
truly hidden/dev-only among the 40 real ids. Named here explicitly so the "wrong exclusion" failure
mode the prompt warned about is visibly not what happened.

**Scope note:** `docs/ModellerGuide.md` was not touched — every id above belongs to the Viewer's own
`panels.js`/`pill_builder.js` surface, not a Modeller-mislabeled one.
