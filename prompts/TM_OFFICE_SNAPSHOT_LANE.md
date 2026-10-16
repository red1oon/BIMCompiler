# ⚠ DO NOT REMOVE — Scope & Working Rules
**Scope:** let a Time Machine (TM) state — a specific date/phase, camera view, cost/schedule summary —
land as an embeddable snapshot inside an ordinary **Word** or **Excel** document, carrying a deep-link
back to the live Viewer at that exact state. Nothing else — no new TM engine work, no P6/XML interop
(that's a SEPARATE lane, see §0 below).
**Read the log after every run.**
**Status:** SPEC SETTLED (2026-08-24), no code started. §3's embed-mechanics question is answered —
plain image + hyperlink, reuse `sitecam.js`'s existing canvas-capture + `share.js`'s existing `tm`
deep-link, no OOXML/OLE. A fresh session can go straight to build; §3 does not need re-litigating.
**Spec-first:** this file IS the spec.

---

## §0 — Not the P6/XML lane
A sibling thread this same session explored real-world scheduler interop (Primavera P6, MS Project) —
that's a DIFFERENT lane, already largely shipped (`viewer/foreign_schedule.js` XER/PMXML/MSPDI
readers+writers, PR #911; auto-bind-by-convention, PR #521) with one open gap (P6 calendar handling,
`XER_REAL_FIXTURE_PROOF.md`). That lane targets **professional users who own P6/MS Project already**.
**This lane targets the opposite end** — the long-tail, small/DIY user who has neither, per the
project's own stated positioning: *"the core product is 'drop an IFC, get a probable 4D/5D movie
right away' — most users return to their own tools (P6/MSP) after"* (`CPM_FLOAT_GAP.md:148`) and
*"the polishing is what attracts the long tail"* (user ruling, `feedback_schedule_accuracy_over_movie_polish.md`).
Don't conflate the two lanes when picking this up.

## §1 — Why (the user's framing, verbatim intent preserved)
A DIY/small-project user doesn't live in a live viewer session — they live in email, Word docs, Excel
sheets shared with a contractor or family member. The idea: let a TM snapshot **leave the browser** as
something that already fits into that world — a picture + a link, not a URL nobody without the app
open would know what to do with. Two riders on top of this same mechanism, named in a companion
brainstorm this session (not yet their own spec):
- **"What's happening on site today"** — a daily snapshot as the delivery vehicle, not just a live view.
- **Permit/inspection checkpoint flagging** — each required milestone (foundation, framing, rough-in)
  becomes a snapshot artifact, literal paperwork for an inspector, not just an in-app flag.
Both are OUT of scope here — this file is the **substrate** (the embeddable-snapshot mechanism) they'd
both ride on. Don't build #2/#3 without this landing first; don't let this lane balloon into building them.

## §2 — What already exists, reuse don't reinvent
`common/share.js`'s `buildShareUrl()` already captures TM state (`tm` param, alongside cam/tgt/pick/
storey/xray/clash) into a deep-link URL — confirmed live, `project_share_sheet.md`. **The link-back half
of this feature is not new** — the new part is (a) rendering a snapshot IMAGE of that state (not just a
link) and (b) packaging image+link into a Word/Excel-native embed, not a raw file download.

## §3 — Word vs Excel: SETTLED (2026-08-24) — plain image + link, no OOXML, no OLE
The user's own words: *"a reframed snapshot... in excel format that user embeds readily and adjust its
frame and display grid."* **Resolved: this describes Word's and Excel's OWN native picture handling,
not a custom format we need to build.**
- **Word:** a plain inserted picture already has drag-resize handles + text-wrap "frame" behavior
  out of the box. That IS "adjust its frame" — no OLE/ActiveX object needed (rejected: Windows-Word-only,
  heavy COM authoring, breaks across Word versions — wildly disproportionate to a DIY-user feature).
- **Excel:** a plain inserted picture Alt-drags to snap to the cell grid by default. That IS "adjust its
  display grid" — no live-cell-data embedded object needed (rejected: same OLE-class problem, and Excel
  add-in territory, not a spec-doc-sized feature).
- **One artifact serves both hosts:** a PNG image + the deep-link URL. Word and Excel both accept a
  pasted/inserted image identically, and both let a user add a hyperlink onto an inserted picture
  natively (Insert → Link). **No `.docx`/`.xlsx` generation, no OOXML authoring, at all.**

**What this actually is to build, now that §3 is settled — small:**
1. A snapshot-image renderer for the current TM state. **Don't build this from scratch** —
   `viewer/sitecam.js` already does canvas→image capture twice (`A.canvas.toDataURL('image/png')` :91,
   `mc.toBlob(resolve,'image/jpeg',0.92)` :445) for the existing photo/share feature. Reuse that pattern.
2. The deep-link — already done, `buildShareUrl()`'s `tm` param (§2).
3. A "Copy TM Snapshot" affordance (a pill/button) that puts BOTH the image (clipboard image write,
   `navigator.clipboard.write` with a `ClipboardItem`) and the link on the clipboard (or offers them as
   two explicit actions — Copy Image / Copy Link — if a combined clipboard write proves unreliable
   across browsers). User then just pastes into Word or Excel; Office does the rest.

## §4 — Scope boundaries
- **In:** a snapshot-image renderer for a given TM state (date/phase + camera) + the deep-link (reuse
  `buildShareUrl`) + a packaging/copy affordance the user can paste into Word or Excel.
- **Out (this pass):** the daily-checklist (#2) and permit-checkpoint (#3) features riding on this
  substrate; native `.docx`/`.xlsx` file generation unless §3's open questions land on "yes, we need
  real OOXML"; any P6/XML work (§0).

## §5 — Before writing code
§3 is settled — no need to re-confirm the embed mechanics. Still worth a quick check with the user
before starting: which TM state fields belong in the snapshot beyond the image+link (a cost number? a
phase name/date label baked into the image itself?) — that's a small styling call, not an architecture
one, and reasonable to make and show rather than ask first.
