# ⚠ DO NOT REMOVE — scope: NOTES ONLY, no code changes, no prompt-file fixes/merges/archiving.
This file is a snapshot survey answering "of the many `prompts/*.md` files that work in the Viewer
app space, which ones can impact each other, and which need better management?" It exists to be READ
before a future session decides to do a bigger cross-cutting Viewer sweep — not to be executed as a
task list. Nothing here has been fixed. If a finding below turns out stale by the time it's read,
that staleness is itself expected and instructive (see §Method's own caveat) — re-verify before acting.

# VIEWER PROMPTS — LANE OVERLAP AUDIT (2026-08-10)

**Origin:** user request, prompted by a "big elephants in the room" concern — that feature-by-feature
sessions (however individually high-quality) can lose sight of cross-cutting health: performance,
brittle/breakage-prone areas, redundant/overlapping wiring, memory usage. This audit is the
read-only, evidence-gathering half of that concern, scoped to one space (`bim-ootb/viewer/*`) as a
pilot. It does NOT cover the Modeller or ERP apps, or the Java compiler backend — see
`CODEBASE_QUALITY_AUDIT_2026-07-02.md` and `PROMPTS_ARCHIVE_AUDIT_2026-07-11.md` for prior, differently-scoped
audits (general code quality; prompts-archival hygiene) — this one is neither of those, it's specifically
about which *currently active* prompt lanes can collide with each other on the *same viewer source file*.

## Method (read before trusting any status label below)
A general-purpose agent listed every `.md` file in `bim-compiler/prompts/` (280 files) and
`bim-ootb/prompts/` (32 files, excluding its `Modeller/` subfolder), classified each as in/out of
Viewer scope, tried to read off a status (OPEN / CLOSED / UNCLEAR) from each file's own header/closing
markers, and grepped each file's body for real `viewer/*.js`/`*.html` filenames it mentions touching.
**175 files landed in scope** (155 bim-compiler + 20 bim-ootb).

**The file-touch data is mechanically solid** (grep matches on real filenames — verifiable, low
false-positive risk beyond the odd file named only as a passing example). **The OPEN/CLOSED status
data is NOT reliable on its own** — this was tested, not assumed. Three of the ~9 files the survey
flagged as "currently OPEN" on high-traffic hub files were spot-checked against their own full text
and git history:
- `RESUME_WORLD_HISTORY_DEDUP_RESTORE.md` — survey said OPEN; actual file says **"✅ DONE + CLOSED
  2026-06-27"** in its own status line. Misclassification, not staleness — the file was closed the
  whole time.
- `WORLD_HISTORY_BROKEN_RECALL.md` — genuinely reopened 2026-07-20, but its blocking fix
  (`HISTORY_KNOB_SIGNAL_TAP.md`'s back-arrow bug, `_applyingView`/`HIST_VIEWNAV` in
  `common/history_tap.js`) **merged the same day** (bim-ootb PR #924, `mergedAt=2026-07-20T15:33:43Z`,
  confirmed live in `origin/main` today). The file's own text says "on completion, archive this file" —
  that never happened. Three weeks of a stale-OPEN pointer, not a live risk.
- `CINEMA_FIND_TO_FILM.md` — genuinely still open, ends on an explicit `⛔ Open question for the user`
  blocking Phase A. This one's real.

**Takeaway or the doc's own credibility check:** treat every status label below as "worth a 30-second
grep before acting on it," not as verified ground truth — the same conclusion the broader audit is
making about the codebase applies recursively to the prompts describing it. The file-touch/hub-overlap
data is the trustworthy part of this doc; the open/closed labels are a starting point for a human or a
future session to re-check, not a final verdict.

## Shared-file hubs — where two or more prompts converge on the same viewer source
Ranked by how many *distinct* prompts have ever touched the file (a rough proxy for "this file is a
long-running hotspot, be careful editing it broadly," regardless of current open/closed status), with
the currently-plausible-OPEN or MIXED (partially-shipped, still-referenced) ones called out — these are
the ones actually worth checking before starting new work on the same file, not the closed history.

| viewer file | total distinct prompts | currently OPEN (unverified beyond the spot-checks above) | MIXED / living-reference |
|---|---|---|---|
| `viewer.html` | 58 | `MULTI_LANE_LAUNCH.md` (stale, 2026-07-07, likely dead — see below) | `MOBILE_PERF.md`, `HISTORY_KNOB_DIAL.md`, `VIEWER_SFX_AUDIO.md`, `RESUME_HR_BIM_ASSET.md`, `BIM_PROJECT_FINANCE_LANE.md` |
| `navigate_find.js` | 61 | `CPE_WALK_WEBXR_FINDPANEL.md` (touched 2026-08-08 — most recent file in the whole survey, genuinely active) | `MOBILE_PERF.md`, `CODEBASE_QUALITY_AUDIT_2026-07-02.md`, `RESUME_HR_BIM_ASSET.md` |
| `panels.js` | 43 | `OFFLINE_BUTTON_SURFACE.md` (looks genuinely open — has a live `▶ DEPLOY` plan, one `⛔ BLOCKED` design question), `RESUME_WORLD_HISTORY_DEDUP_RESTORE.md` (**mislabel — actually CLOSED**, see Method) | `MOBILE_PERF.md`, `HISTORY_KNOB_DIAL.md`, `VIEWER_SFX_AUDIO.md`, `RESUME_HR_BIM_ASSET.md` |
| `main.js` / `time_machine.js` | 43 each | `TM_STREAM_REBUILD_COALESCE.md` (confirmed genuinely open — "OPEN (filed 2026-07-20...)" in its own status line; also touches `streaming.js`, `dlod.js` — one coherent lane spanning 3 files, not 3 separate collisions) | `MOBILE_PERF.md`, `VIEWER_SFX_AUDIO.md` |
| `scene.js` | 37 | none confirmed | `MOBILE_PERF.md`, `HISTORY_KNOB_DIAL.md`, `CODEBASE_QUALITY_AUDIT_2026-07-02.md` (findings-only, not implementation) |
| `streaming.js` | 36 | `TM_STREAM_REBUILD_COALESCE.md` (same lane as above) | `MOBILE_PERF.md`, `RESUME_HR_BIM_ASSET.md` |
| `picking.js` | 19 | `CONNECT_SCENE_SPEC.md` (**scope question, see below**), `MULTI_LANE_LAUNCH.md` (stale) | `MOBILE_PERF.md`, `RESUME_HR_BIM_ASSET.md` |
| `universal_history.js` | 19 | `WORLD_HISTORY_BROKEN_RECALL.md` (**stale-open, blocking fix already merged**, see Method), `CONNECT_SCENE_SPEC.md` | `HISTORY_KNOB_DIAL.md` |
| `sfx.js` | 9 | none | `MOBILE_PERF.md`, `VIEWER_SFX_AUDIO.md` |
| `dlod.js` | 7 | `TM_STREAM_REBUILD_COALESCE.md` (same lane) | `MOBILE_PERF.md` |
| `nlp.js` | 4 | none | `CODEBASE_QUALITY_AUDIT_2026-07-02.md`, `RESUME_HR_BIM_ASSET.md` |

**Real, currently-live concurrency risk after verification: low.** Of everything the raw survey
flagged, only two items held up as genuinely open on a shared hub after a closer read:
`TM_STREAM_REBUILD_COALESCE.md` (one self-contained lane across `time_machine.js`/`streaming.js`/
`dlod.js` — internally coherent, not colliding with anything else) and `OFFLINE_BUTTON_SURFACE.md`
(small, scoped, on `panels.js`). `CPE_WALK_WEBXR_FINDPANEL.md` is the most recently active file in the
whole survey (2026-08-08) and sits on `navigate_find.js`, which 60 other prompts have historically
touched — worth a quick check before anyone else opens that file. `CINEMA_FIND_TO_FILM.md` is open
but blocked on a user decision, not mid-implementation.

`CONNECT_SCENE_SPEC.md` is flagged with a scope question rather than a risk level: its content is
about Modeller↔ERP feature-identity bridging (`viewer/modeller.html`, Bonsai selection), not the 3D
Viewer proper — it only landed "in scope" here because `viewer/modeller.html` lives under the same
`viewer/` directory as the actual Viewer app. Worth remembering for any future automated scope filter:
directory-based scoping isn't precise here, `viewer/` hosts more than one app.

`MULTI_LANE_LAUNCH.md` is a generic multi-agent orchestration methodology card from 2026-06-11
(mentions `viewer.html`/`panels.js`/`picking.js` as house-rule examples from whatever lanes it was
running then, not as an ongoing claim on those files) — almost certainly dead, a housekeeping
candidate for `PROMPTS_ARCHIVE_AUDIT_2026-07-11.md`'s process rather than a live concurrency risk.

## Mega-hub prompts (touch nearly everything — not sprawl, but high blast radius)
Two prompts recur across almost every hub in the table above, because they're genuinely cross-cutting
sweeps rather than poorly-scoped features:
- **`MOBILE_PERF.md`** — appears against 11+ of the files above. Legitimate scope (a perf sweep has to
  touch everything), but it's marked MIXED (has at least one recorded `⛔ BLOCKED` open item as of
  2026-07-28 per its own log) — any future broad perf work should read this file FIRST, since it may
  already be mid-thought on the same files.
- **`RESUME_HR_BIM_ASSET.md`** (bim-ootb copy) — similarly broad (viewer.html, panels.js,
  navigate_find.js, picking.js, streaming.js, nlp.js, ghostglass.js, schedule_editor.html). Same
  caution applies.

## Other findings from the survey, not risk-ranked but worth recording

**(a) The "local quick-access copy" convention (`feedback_specs_local_folder_quick_access.md`) has
silently drifted stale on exactly its two hottest files:**

| File | bim-compiler (canonical) | bim-ootb (local copy) | Drift |
|---|---|---|---|
| `CINEMA_PATH_EDITOR.md` | 8984 lines, full CPE spec | 17 lines — an unrelated single dated amendment fragment left under the same filename | Not a stale copy, a DIFFERENT document under the same name. A session reading only the bim-ootb copy gets almost nothing of the real spec. |
| `MOBILE_PERF.md` | 514 lines (includes a 2026-07-28 shipped item + the still-open blocked item) | 64 lines, cuts off early | Missing the newest shipped work and the still-open item — a session there doesn't know work is still pending. |

Other same-named pairs spot-checked (`HISTORY_SCRUB_FIX.md`, `UNIVERSAL_HISTORY.md`) were
byte-identical — the convention mostly works, it just broke on the two most actively-edited files,
which is the worst place for it to break silently.

**(b) Overlapping ownership cluster around the Teams/HBA overlay** — `RESUME_TEAMS_OVERLAY.md`,
`RESUME_TEAMS_UI_CONSISTENCY.md`, `RESUME_OVERLAY_PILL_ICONS.md`, `RESUME_HBA_MOBILE_CARD_STACK.md`,
`RESUME_HR_BIM_ASSET.md`, and `HBA_UNITCLASS_OUTLINE_AND_CAMERA_POV_FIX.md` (pointer into
`prompts/Viewer/HBA/`) all touch the same `panels.js` pill-registry surface and overlapping HBA
overlay code from five or six differently-named entry points. Not yet self-diagnosed by the project
the way History was — a candidate for the same "one canonical file, others point to it" treatment
*before* it produces the same class of bug World/History already did.

**(c) The project already knows how to do this correctly, when it tries:**
`WORLD_HISTORY_BROKEN_RECALL.md` is a deliberate 15-line pointer stub into
`RESUME_WORLD_HISTORY_DEDUP_RESTORE.md`'s real content ("read that section, not this stub") — a
working instance of the pattern (b) above needs. It just also happens to be the file that's now three
weeks overdue for its own stated archival step (its blocking fix merged 2026-07-20, it's still sitting
un-archived today). Good pattern, bad follow-through — a one-line fix if anyone picks it up (explicitly
NOT done here, per this file's own scope).

## What this doc recommends checking, not fixing
- Before starting any broad `panels.js`, `navigate_find.js`, or `universal_history.js` work: read
  `MOBILE_PERF.md`, `RESUME_HR_BIM_ASSET.md`, and whichever of the two currently-open items above
  (`OFFLINE_BUTTON_SURFACE.md`, `CPE_WALK_WEBXR_FINDPANEL.md`) touches the same file, first.
  Both are self-reported OPEN/MIXED and unverified beyond what's noted here.
- The bim-ootb local-copy drift on `CINEMA_PATH_EDITOR.md` and `MOBILE_PERF.md` (finding a) is a real,
  narrow, mechanical fix (re-`cp` the canonical over the stale local copy) whenever someone's next in
  that convention — flagging, not doing, per this file's scope.
- `WORLD_HISTORY_BROKEN_RECALL.md`'s own stated archival step is overdue — same, flagging not doing.
- The Teams/HBA cluster (finding b) is a heavier lift (would need someone to actually read all six
  files and decide the canonical one) — named here as a candidate, not attempted.

## Raw data
Full 175-row file-by-file table and the complete 28-file reverse-index (including the CLOSED-history
rows this doc's tables above omitted for length) are at
`/tmp/claude-1000/-home-red1-bim-compiler/901e58b5-79f5-4c78-bb44-6a351dfc1145/scratchpad/
viewer_prompts_survey_table.md` and `viewer_prompts_reverse_index.md` — session-scoped scratch paths,
not durable. Regenerate via the same method (list both `prompts/` folders, classify Viewer-scope,
grep each for real `viewer/*.js`/`*.html` filenames, build the reverse index) if this doc is read after
those paths are gone.
