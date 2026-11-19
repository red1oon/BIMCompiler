# ⚠ DO NOT REMOVE — Scope: make docs publishing un-wipeable. Read the log after every run.
# Prompt: DOCS_DEPLOY_GUARD — stop stale/thin-tree deploys from silently wiping live pages.
# Companion to (does not replace) prompts/DOCS_DEPLOY_POLICY.md + CLAUDE.md §"Docs deploy".

## The incident this prevents (root cause, plain)
`mkdocs gh-deploy` **rebuilds the whole site from ONE tree and force-replaces `gh-pages`** — it does not
merge, it overwrites. So **last-deploy-wins, totally**: whatever the deploying tree lacks disappears from the
live site, even though it's safe in git history.

Observed 2026-06-16: work (the MigrateComparisonPaper headline-popover + carrier animation + newer teasers)
lived only in a **feat branch**, never merged to `master`. A deploy was then run from a **worktree off
`master`** (a "clean superset of master" — but `master` was itself stale vs feat), so the live page reverted
to the older version. Nobody was editing the file at deploy time — it was simply **stale at the publish step**.

**The precise failure condition (both must hold):**
1. an edit lives in one tree and is **not merged into the tree that publishes**, AND
2. a **full-overwrite publish** runs from that other (stale/thin) tree.

A "who else is editing this file?" lock does NOT catch this — the file wasn't being edited, it was stale.
The only reliable checkpoint is **at publish time**.

## The fix — two parts (part 2 is the load-bearing one)
1. **Merge-before-publish (process).** Before any deploy: `git fetch origin && git merge origin/master` so
   the publishing tree is a **superset** of what's live (it can then only ADD, never DROP). Fragile alone —
   humans forget.
2. **No-shrink publish guard (the seatbelt — AUTOMATE THIS).** A wrapper that refuses to deploy a build that
   would make the live site smaller. It does not trust anyone to remember step 1; it blocks a thinning
   publish regardless of who runs it or how stale their tree is.

## Build: `scripts/safe_gh_deploy.sh` (replace bare `mkdocs gh-deploy` everywhere)
Behaviour (each step logs to `build/docs_deploy.log` — read it before concluding):
1. `git fetch origin -q`; `git merge --no-edit origin/master`. On conflict → **ABORT**, print the conflicted
   files, tell the human to resolve (never auto-pick). (Spec-first: this is the "become the superset" step.)
2. `mkdocs build -q -d /tmp/site_new` (the about-to-deploy tree).
3. Fetch current live: `git fetch origin gh-pages`; materialize its file list + sizes (e.g.
   `git ls-tree -r -l origin/gh-pages`).
4. **GUARD (the falsifier):** diff live vs new:
   - any path present in **live** but **absent** in new → **ABORT** (deletion).
   - any `*.html`/asset whose new size is **smaller than live by more than `SHRINK_TOL` (default 5%)** →
     **ABORT** (content wipe, e.g. the MCP case — same path, fewer bytes).
   - print the exact offending paths + old→new sizes. Exit non-zero. Do **not** deploy.
5. Only if the guard passes: `mkdocs gh-deploy` (or `ghp-import` of `/tmp/site_new`).
6. Post-deploy: poll the live URLs of the changed pages + a fixed canary set (MigrateComparisonPaper,
   DistributedERP, HolyGrail, ERP, RetailScaleStory, glassbowl, POS_WAN_SCALE_BENCH) → all must be HTTP 200.

`SHRINK_TOL` is an env knob; legitimate big deletions (rare) are done by re-running with
`ALLOW_SHRINK=1 paths="a,b"` naming exactly what may shrink — so an intentional removal is **explicit**,
never silent.

## Also
- Keep `docs.yml` **disarmed** for master auto-deploy (CLAUDE.md). The CI guard there only protects the CI
  path; the **manual CLI path is the gap this prompt closes**. Wire the SAME guard into both.
- Root-cause hygiene: **merge doc edits to `master` promptly** — don't let docs hang in a feat branch. One
  source of truth means no tree is ever stale enough to wipe.

## Witness (prove it, don't assert it) — W-DEPLOY-GUARD
- §GUARD-DELETE: build a /tmp site missing a page that exists live → run guard → MUST abort, naming the page.
- §GUARD-SHRINK: take a live page, truncate it >5% in the new build → guard MUST abort (the MCP scenario).
- §GUARD-PASS: a true superset build (live + one added page) → guard MUST allow.
- §GUARD-OVERRIDE: `ALLOW_SHRINK=1 paths=...` on a named shrink → allowed; an UNnamed shrink still aborts.
Each test names the issue it proves; a pass that can't tell whether the guard works is not a test.

## Acceptance
Bare `mkdocs gh-deploy` is no longer run by any session; all publishing goes through `safe_gh_deploy.sh`;
W-DEPLOY-GUARD is green; a deliberately stale tree **cannot** shrink the live site (it aborts with the list).

## Printable guides: the PDF is built at publish time, checked, then published with its page (2026-11-15)
**Owner (verbatim):** *"so the PDF print will always reflect what is latest in HTML and will have proper page breaks?"* · *"Yes"* (to a check after every publish) · *"But can't that be inbuilt or build time rather than compile to PDF each time?"*
**Why:** a browser's own print varies with the browser, paper size and scale, and nothing re-checked it after an edit. So every page whose source `docs/<Name>.md` carries `window.print()` (today: `CapexUATGuide.md`) gets ONE PDF made at publish time from the very tree being published, checked, and published beside it at `/<Name>.pdf`. The page links it (*Download the PDF*); the print button stays as a fallback.
**Build (in `safe_gh_deploy.sh`, step 2b, after `mkdocs build` and BEFORE the manifest):** `scripts/guide/print_check.js` prints the built page in headless Chrome (print media, A4), writes `docs/<Name>.pdf` (untracked, git-ignored, removed on exit: step 5's `mkdocs gh-deploy` rebuilds from `docs/`, so the file must be there) and copies it into `site_new`. If the built page is byte-identical to the live one and the live PDF exists, the live PDF is reused unchanged (no new 4-5 MB blob on `gh-pages` per deploy) and the check is not re-run. A check FAIL aborts the publish (`gh-pages` untouched); a machine without puppeteer or `pdftotext` cannot make the PDF, and the existing DELETE guard then refuses the publish (it would remove the live PDF): `ALLOW_NO_PDF=1` is the explicit way past.
**The check (W-GUIDE-PRINT, every `§PRINT` line in the deploy log; issue: *"the published PDF has a page break, a split or a cut-off the reader would trip on"*):** the page is printed twice, once clean (published) and once with invisible markers at the start and end of every table row, every `##` heading and the checklist sheet (`.uat-sheet`). P1 the sheet's start and end markers are on ONE page, the element before it ends on an earlier page and the one after starts on a later page. P2 every `##` heading outside the sheet is the first marker on its page. P3 every table row's start and end markers are on the same page (no split row). P4 every row's markers are present at all (a marker missing = the row or its last column cut off). P5 the clean and the marked prints have the same page count and the same first text line on every page (the markers move nothing). `PRINT_BREAK=1` removes the sheet's `break-after`: P1 must FAIL. 0 rows or 0 headings judged = INCONCLUSIVE, which also aborts.
**RESULT 2026-11-15 (W-GUIDE-PRINT 5/0 on CapexUATGuide; both break modes FAIL; W-DEPLOY-GUARD still PASS).** On the built guide: 31 pages, 225 table rows, 6 chapter headings: P1 the checklist sheet = page 2 alone (the element before ends on page 1, the one after starts on page 3), P2 every chapter heading starts its page, P3 no row split, P4 no row or last column cut off, P5 the published and the marked prints agree page by page. `PRINT_BREAK=1` -> P1 FAIL (the next element starts on page 2); `PRINT_BREAK=clip` (tables wider than the page) -> P4 FAIL on every cut row. In the deploy: `DRY_RUN=1` builds, prints, checks (PASS), guards (PASS) and removes `docs/CapexUATGuide.pdf` afterwards; `PRINT_BREAK=1 DRY_RUN=1` ABORTS with `gh-pages` untouched. **Two instrument faults found and fixed before trusting a FAIL** (both looked like a cut-off TD_PUMP row in chapter C): adjacent markers `QQ…QQQQ…QQ` were read as one (now `qq<ID>qq`, whose lowercase ends cannot join), and an end marker placed after a cell's last word overflowed the right edge and was itself clipped (now anchored inside the cell's bottom-right corner, so it goes missing only when the cell does). The row itself was intact (its text ends at x = 554 pt, inside the 562 pt edge).

### Printable guides, 2026-11-19 SPEC — a cover page, a page per section, page numbers, links that open (written before code)
**Owner (verbatim):** *"Go thru your PDF (https://red1oon.github.io/BIMCompiler/CapexUATGuide.pdf) again. Put in page break to each sub heading title. Also have page numbers Page # of ## (total). Put a proper credential and version box on the first page as cover. Run thru all the links are working."*
**Measured on the live PDF first (2026-11-19):** 32 pages, no page numbers, no cover; 35 link annotations, of which **9 point at the print server** (`http://127.0.0.1:40487/DeveloperGuide/#3-start-from-scratch…`, `…/CapexDashboardGuide/…`, `…/BIMUserGuide/…`, `…/DXF2BIMGuide/…`, `…/ModellerGuide/…`): dead for every reader of the PDF. Cause: `print_check.js` prints the page from a local server, and Chrome writes each relative link resolved against that origin. W-GUIDE-PRINT never looked at links (scope-blind for this defect).
**Change.**
1. **Links:** before printing, every link that resolves to the print server is rewritten to the same path under the site's public `site_url` (read from `mkdocs.yml`), anchor kept.
2. **Page numbers:** every page carries a footer *"<guide title> · Page i of N"* (Chrome's print footer, `displayHeaderFooter`; CSS `@page` margin boxes are not supported by Chrome).
3. **A page per section:** every `###` heading starts a new page, except one that directly follows its `##` chapter heading (it stays on the chapter's first page), and none inside the cover or the checklist sheet.
4. **Cover:** the guide's first page is a cover: the title and a document-control box (document, purpose, revision, status, issued by, for, where the latest copy lives) and the revision history, taken from `git log` of the guide; `.uat-cover`, alone on page 1. Contact data: only what the repo already publishes (the author's name and role); nothing private.
**New checks (W-GUIDE-PRINT, `§PRINT` lines; each names the issue):**
- **P2b** every `###` heading that is not right after its `##` is the first marker on its page (*a section starts mid-page*).
- **P6** the cover's start and end markers are both on page 1 and the next element starts on page 2 (*the cover shares a page*).
- **P7** every page of the published print reads *"Page i of N"* with its own i and the true N (*a page without its number, or a wrong total*).
- **P8** no link annotation in the published PDF points at the print server (`127.0.0.1` / `localhost`); every link into the site resolves to a page of the built site and, with a `#fragment`, to an element with that id there (*a dead link in the PDF*).
- **P9** every outside link answers HTTP 2xx/3xx (curl, 2 tries; a network error is INCONCLUSIVE for that link and printed, never PASS) (*a dead download*).
**Break switches (each must FAIL its check):** `PRINT_BREAK=links` keeps the print-server links (P8) · `PRINT_BREAK=footer` prints without the footer (P7) · `PRINT_BREAK=cover` drops the cover's break-after (P6) · `PRINT_BREAK=h3` drops the section breaks (P2b).
**The UAT dry-run proof is not disturbed:** this revision changes the cover and print style only; the 80 steps' text must parse identically to the revision the dry run proved (`guide.js` parse of both, compared), and the cover says the proof is for those steps.
**RESULT 2026-11-19 (W-GUIDE-PRINT 10/0 on CapexUATGuide, local build of this tree).** 39 pages (was 32), 240 table rows, 6 chapters, 16 sections judged: P1 the checklist sheet = page 3 alone · P2 every chapter starts a page · P2b every section not right after its chapter starts a page · P3 no row split · P4 nothing cut off · P5 the two prints agree · P6 the cover = page 1 alone (next element on page 2) · P7 every page reads "Page i of 39" · P8 0 links to the print server, 10 links into the site each open a built page and its #id, written under `https://red1oon.github.io/BIMCompiler/` · P9 13 outside links each answer 200. Break switches: `links` → P8 FAIL (`http://127.0.0.1:…/DeveloperGuide/#3-…`), `footer` → P7 FAIL (no number on any page), `cover` → P6 FAIL (next element on page 1), `h3` → P2b FAIL (A2, A3, A4 … mid-page); the old ones still fail: `1` → P1, `clip` → P4 (and now P5 too: the clipped prints paginate differently). The 80 steps parse identically to the revision the dry run proved (`§STEPS_SAME proved=80 new=80 identical=true`).


### Printable guides, 2026-11-20 SPEC: the order after the cover, a contents page, and no short table cut in two (written before code)
**Owner (2026-11-20, verbatim):** *"On page 2 of the PDF, put a title to it, 'What is this?'. After page 2, insert a table of contents. Before page 2, is the list of changes we dicussed. Also look thru the PDF to make better page breaks so that we don't have truncated halfway parts particularly tables."*
**Order (CapexUATGuide):**
1. The cover (one page, P6).
2. `## Changes since the signed UAT report`.
3. `## What is this?` (the intro that used to follow the cover).
4. `## Contents`: every `##` and `###` as a link to its anchor. The PDF keeps the links; there are no page numbers.
5. The checklist sheet (P1), then the chapters.
**Breaks (the guide's print CSS):** a table that fits on a page is kept whole (`break-inside: avoid` on the table); a longer table repeats its header row on each page (`thead` as `table-header-group`); a heading, and the paragraph just before a table, are kept with what follows (`break-after: avoid`).
**P10 (new, `scripts/guide/print_check.js`), named issue:** *"a table short enough for one page is cut across two pages"*.
- Each table's height is measured in print media at the printed text width (A4 210 mm − 2 × 12 mm = 186 mm ≈ 703 px).
- A table at most 90 % of the text height (297 − 2 × 14 mm = 269 mm ≈ 1,017 px) must have its first and last row markers on the same page.
- Tables taller than that may continue, and they are listed with their heights.
- `PRINT_BREAK=tables` removes the keep-whole rule: P10 must then FAIL on today's guide (the issue was real), else P10 is scope-blind.
**RESULT 2026-11-20 (logs read, `PRINT_NO_NET=1` for the local runs; the publish runs P9):**
- RED, the live PDF before the fix: `P10 FAIL nCut=4`. Cut were Pack In Application Dictionary (h 468 px, pp. 4–5), Shed Floor Plan (294, pp. 11–12), PLAN sheets (419, pp. 14–15) and TD_RIVERSIDE (669, pp. 28–29).
- GREEN, after the fix: `P10 PASS nCut=0`, 36 tables. 3 are taller than a page (B0.1 h 1427, B2.1 993, D1 1685) and continue with their header row repeated on each page (pdftotext pp. 17, 18, 24, 41, 42).
- The new build: 44 pages, P1–P8 PASS. The order is p2 Changes, p3 What is this?, p4 Contents, p5 Checklist.
- `PRINT_BREAK=tables`: P10 FAIL on the same 4 tables (not scope-blind).
