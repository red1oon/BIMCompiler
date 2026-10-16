# ⚠ DO NOT REMOVE — Scope & Protocol
**Scope:** SPEC ONLY. No code in this document, no code produced by writing it, no file
moves/deletes/merges performed by this document. Every design/plan section below is marked
PROPOSAL. **Log Mandate:** any witness run against this spec writes a `.log` file and the log is
READ before any pass/fail conclusion — exit code alone is never evidence (CLAUDE.md, Universal
Session Protocol). Honour this block until every item in §Requirements is `✅ DONE (witness)` or
`⛔ BLOCKED: <one question>`.

---

## §Goal

**User's architectural directive, quoted:** collapse the duplication to ONE shared source. Bubble
ERP (glassbowl) and the iDempiere UI are **two client LENSES over the same underlying engine** —
explicitly analogous to how iDempiere itself separates its model/base packages (`org.compiere.model`
— `PO`, `MTable`, business-logic validators) from its ZK webui package (`org.adempiere.webui` — grid
panels, forms, the ZK-specific rendering tree). iDempiere never forks `PO.save()` per UI; the model
layer is singular and every presentation layer (Swing client historically, ZK web client today,
any future REST/mobile client) is a thin adapter on top of it. **The end state for `crud_overlay.js`
is the same shape: ONE engine module + thin per-lens adapters, not three forked files.**

This document specs the collapse only. It does not spec the `_sidePersist` whole-blob-`put()` fix —
that is `ERP_OPLOG_APPEND_ONLY_FIX.md`'s job, and §Interaction with the oplog fix below states the
ordering rationale for doing this collapse first.

---

## §Evidence

All citations verified directly against the three files in this session (2026-07-20), not
re-quoted from the briefing without checking. Every line number below states which file it is.

### The 3-copy table

| Copy | Lines | `_sidePersist` | `_serializeCommit` | Role |
|---|---|---|---|---|
| `/home/red1/bim-ootb/erp/crud_overlay.js` | 2493 | 1632 | 1725 (exists — comment "run a signed commit EXCLUSIVELY", line 1719) | **LIVE deploy source.** Loaded by `erp/idempiere.html:603` (`crud_overlay.js?v=20`) AND `erp/glassbowl.html:880` (`crud_overlay.js?v=6`). |
| `/home/red1/bim-compiler/build/erp/crud_overlay.js` | 1841 | 1081 | absent | Loaded by `build/erp/glassbowl.html:858`; precached by `build/erp/sw.js:14`, `CACHE_VERSION='glassbowl-offline-v9'` (`build/erp/sw.js:7`). **Required by 6 Node witnesses** (below). Froze 2026-07-03 per `ERP_OPLOG_APPEND_ONLY_FIX.md` §FILE PROVENANCE. |
| `/home/red1/bim-compiler/docs/crud_overlay.js` | 627 | 446 | absent | Loaded by `docs/glassbowl.html:856`; precached by `docs/sw.js:14`, `CACHE_VERSION='glassbowl-offline-v8'` (`docs/sw.js:7`). **Confirmed PUBLISHED on `gh-pages`**: `git ls-tree origin/gh-pages` lists `crud_overlay.js`, `glassbowl.html`, `glassbowl_data.db`, `glassbowl_gravity.html`. Header (verified, docs/crud_overlay.js:3-9): *"CRUD 'ring of fire' overlay … E2 dry-run … it attaches to glassbowl's **bubbles** BY KEY … E2 is DRY-RUN: it logs the op it WOULD apply"* — the original bubble-era fossil, frozen 2026-06-02 per the oplog-fix spec. |

The identical defective mechanism is confirmed byte-identical in structure (not text-identical line
numbers) in all three: `SIDE_DBNAME='glassbowl_kernel_ops', SIDE_STORE='log',
SIDE_KEY='kernel_ops.db'` declared at bim-ootb:1619 / build:1068 / docs:433, and the unconditional
`.objectStore(SIDE_STORE).put(buf, SIDE_KEY)` at bim-ootb:1639 / build:1088 / docs:453. All three
also share `.get(SIDE_KEY)` hydration reads at bim-ootb:1664 / build:1113 / docs:478.

All three files are already **IIFE-wrapped** — `(function (global) { 'use strict'; …
})(typeof window !== 'undefined' ? window : this);` — confirmed by direct read of the open/close of
each. This matters for §Target Architecture: the project's browser-engine rule
(`feedback_browser_iife_wrap_engines.md`) is already satisfied by the existing pattern; the collapse
must preserve it, not introduce it fresh.

### The superset finding — verified, with one correction

**Top-level `function` declarations, counted directly (`grep -oE '^\s*function [A-Za-z_$][A-Za-z0-9_$]*'`):**
bim-ootb = **154**, bim-compiler/build = **125**. (The briefing's "160 vs 125" — the 125 is exact,
the 160 does not check out against this counting method; reported as found, not corrected to match
the briefing.)

**Set difference, verified:**
- Functions in `build` but not in `ootb`: exactly **one** — `go`. Confirmed nested/local: `build/erp/crud_overlay.js:681`, `function go()` declared INSIDE `enable()` (which itself starts a few lines above, ~672), called at `enable()`'s own body (`if (STORE) { go(); return; } … .then(function (j) { STORE = j; go(); })`). Not a top-level API function, not an export difference. **Briefing claim confirmed exactly.**
- Functions in `ootb` but not in `build`: **30**, not 35 as the briefing stated. The briefing's own
  named list, however, is verified **complete and correct** — every one of the 30 names it lists
  (`copyInline createInline editCell editInline ignoreInline renderInline _inlineConfirmDelete
  _inlineContentDirty _inlineDirty _inlineVerbBar _refreshInlineDirty _ensureHostCallouts
  fireCreateCallout hostCreate hostDelete hostProcess hostUpdate _seedDocNoPreview _previewDocNo
  _serializeCommit _ensureStore _recordFromOplog foldCrudSpec registerFolded hasEntry mapRefType
  mapRefDisplayType _docCtx _docTypeSeqId _installAllModelVal`) appears in the diff and nothing else
  does. **Correction: the count is 30, the classification list is accurate as given.**
- `bubble` reference count: **12 in each file**, confirmed (`grep -c bubble`) — briefing claim
  confirmed exactly.

**Net: the superset finding holds.** bim-ootb's copy is a strict superset in the sense that matters
(every bim-compiler function name, minus one purely-local helper, is present in bim-ootb; bim-ootb
adds 30 more, cleanly classifiable into LENS vs ENGINE groups below). The one-engine/two-lens shape
the user wants already exists de facto in the bim-ootb file — the collapse is primarily deletion +
repointing of the other two copies, not a rewrite of bim-ootb.

### The 6 Node witnesses (verified exact lines)

| Witness | Require line |
|---|---|
| `scripts/poc_crud_ownergate.js` | `:36` `var CORE = require(path.join(__dirname, '..', 'build', 'erp', 'crud_overlay.js'));` |
| `scripts/poc_crud_group.js` | `:35` same pattern, comment `// REAL op shape + buildDocActionGroup` |
| `scripts/poc_so_complete_ui.js` | `:45` same pattern, comment `// REAL overlay core` |
| `scripts/poc_docaction_full.js` | `:37` same pattern |
| `scripts/test_crud_overlay.js` | `:13` `var CORE = require(path.join(ERP, 'crud_overlay.js'));` (`ERP` resolves into `build/erp` — verify at load if the collapse changes `ERP`'s definition) |
| `scripts/test_crud_writeloop_overlay.js` | `:20` `var CORE = require('../build/erp/crud_overlay.js');` |

All 6 point at `build/erp/crud_overlay.js` (the 1841-line copy), none at bim-ootb's.

### Function classification (from the briefing, verified present as a set — see above)

- **LENS (iDempiere in-place inline-CRUD UI)**: `copyInline createInline editCell editInline
  ignoreInline renderInline _inlineConfirmDelete _inlineContentDirty _inlineDirty _inlineVerbBar
  _refreshInlineDirty _ensureHostCallouts fireCreateCallout hostCreate hostDelete hostProcess
  hostUpdate _seedDocNoPreview _previewDocNo`
- **ENGINE**: `_serializeCommit _ensureStore _recordFromOplog foldCrudSpec registerFolded hasEntry
  mapRefType mapRefDisplayType _docCtx _docTypeSeqId _installAllModelVal`

`_serializeCommit` (bim-ootb:1725) is ENGINE code — "run a signed commit EXCLUSIVELY" — that exists
ONLY in bim-ootb. The forks (`build/`, `docs/`) are missing this commit-serialization mutex
entirely, which is engine drift, not lens drift.

---

## §Target Architecture (PROPOSAL)

⚠ Nothing below exists in the tree today. Proposal only.

**Shape:** one browser-loadable engine module (the collapsed file, still a single IIFE-wrapped
`.js`, still `require()`-able by Node for the witnesses — the current dual-consumption pattern is
correct and is kept, not replaced with an ESM split) exposing a stable public surface (the existing
`window.__crud`/`CORE`-style export), plus each lens supplying its OWN mounting/rendering code that
calls into that surface. This mirrors iDempiere's `org.compiere.model` (engine: `PO`, validators,
persistence) vs `org.adempiere.webui` (lens: ZK panels) split — the model package has zero knowledge
of ZK; ZK panels call into the model, never the reverse.

### What belongs to the ENGINE (DOM-agnostic, lens-independent)

- Op building/composition, the `CORE.gateOp` owner+CAS gate (`crud_overlay.js:425-437` per
  `ERP_OPLOG_APPEND_ONLY_FIX.md` citations), `_gateCtxFor`/`_gateForOwnedWrite`.
- Sealing (`commitGroup`, `_serializeCommit` — bim-ootb:1725, the commit mutex named above).
- Sidecar persistence (`_sidePersist`, `withSidecar`, the `SIDE`/IndexedDB read-write layer —
  currently the buggy whole-blob mechanism `ERP_OPLOG_APPEND_ONLY_FIX.md` targets separately).
- AD/dictionary folding: `foldCrudSpec`, `registerFolded`, `hasEntry`, `mapRefType`,
  `mapRefDisplayType`, `_docCtx`, `_docTypeSeqId`, `_installAllModelVal`, `_recordFromOplog`,
  `_ensureStore` — all ENGINE-classified above, all bim-ootb-only today.
- `sessionActor()`, `CORE.tipValues()`, `kernelDb()` and other already-published read APIs the PoC
  witnesses call via `page.evaluate()` (`ERP_MULTIUSER_CONCURRENCY_POC.md` §Test Harness) — these
  must remain engine-side and lens-agnostic since both Playwright witnesses and both lenses depend
  on them existing with stable names.

### What belongs to a LENS (DOM mounting, per-surface rendering)

- iDempiere in-place-edit lens: `copyInline createInline editCell editInline ignoreInline
  renderInline _inlineConfirmDelete _inlineContentDirty _inlineDirty _inlineVerbBar
  _refreshInlineDirty _ensureHostCallouts fireCreateCallout hostCreate hostDelete hostProcess
  hostUpdate _seedDocNoPreview _previewDocNo` — all LENS-classified above, all bim-ootb-only today,
  all DOM-touching (host adapter pattern already named in `idempiere.html:2842`'s comment: *"host
  adapter for the SHARED crud_overlay.js (no fork)"* — i.e. the host-adapter SEAM this section
  formalizes is already a named intention in the live file's own comments, not a new idea).
- Glassbowl ring/bubble lens: the `hots`/`buildHots`/`loop`/ring-drawing code, `enable`/`disable`
  (whose local `go()` is the one bim-compiler-only function — confirms it is lens-local plumbing,
  not an engine API), the `bubble`-referencing code common to all three copies (12 refs each).

### The registration seam (PROPOSAL — shape only, no implementation)

A lens registers itself with the engine rather than the engine special-casing lens identity. Concrete
shape to design in implementation, not decided here: either (a) each lens's `<script>` tag loads
AFTER the engine and calls an explicit `CORE.registerLens({...})`/`CORE.mount(hostEl, opts)` entry
point, or (b) the engine exposes its API on `window.__crud`/`CORE` unconditionally (as today) and
each lens file is simply a separate `<script>` that only reads that global and does DOM work — no
engine-side registration needed at all if the engine truly never reaches into lens DOM. Given that
`idempiere.html:2842`'s existing comment already frames the iDempiere side as a "host adapter,"
option (b) is closer to today's actual structure and is the lighter lift — this section names both
so the implementation pass makes the choice deliberately rather than by default.

**DOM-agnosticism check:** for the engine module to be truly lens-independent, it must not reference
`document`/`window.APP.actor`'s DOM origin, ring/bubble class names, or `#idmp-*` element ids
anywhere in the ENGINE-classified functions above. This is a verifiable static property (grep for
`document.` / `getElementById` / `querySelector` inside the engine-classified function bodies after
the split) and should be a collapse-step gate, not assumed.

**IIFE-wrap rule stays satisfied automatically** if the collapsed engine file keeps the exact
`(function (global) { 'use strict'; … })(typeof window !== 'undefined' ? window : this);` wrapper
all three copies already use — `feedback_browser_iife_wrap_engines.md`'s burn case was about a
MISSING wrapper causing global leakage across separately-loaded files; since each lens is its own
separate `<script>` file too, each lens file must ALSO be its own IIFE if it declares any top-level
helper names, or it inherits the exact clobber risk the memory documents (e.g. two lens files both
declaring a local `today()` or `entryFor()` — both names exist in the current `build` file's
diff-invisible interior and must not leak once split out).

---

## §Collapse Plan (PROPOSAL — ordered, reversible)

**Single source recommendation: `/home/red1/bim-ootb/erp/crud_overlay.js`.** Justification (from
§Evidence, not asserted fresh): it is the strict functional superset (154 vs 125 top-level
functions, only one non-API name absent — `go`, a local), it is the ONLY copy carrying
`_serializeCommit`'s commit mutex, and it is already the file `ERP_OPLOG_APPEND_ONLY_FIX.md` commits
to implementing against ("This spec must be implemented against the bim-ootb copy"). Collapsing onto
anything else would mean re-adding 30 functions to a lesser file; collapsing onto bim-ootb means
deleting/repointing two files that lag behind it.

Each step names its own verification — no step is "done" without one.

1. **Freeze a byte-identical snapshot of all three files** (e.g. `git show`/copy to the scratchpad,
   not committed) before any edit, so every later step has a known-good rollback target.
   *Verification:* three file hashes recorded.
2. **Confirm DOM-agnosticism of the bim-ootb ENGINE-classified functions** (§Target Architecture
   check above) — a static grep pass, not an assumption. If any ENGINE function touches
   `document`/DOM, that function is either reclassified to LENS or refactored to accept a
   DOM-callback parameter (refactor detail deferred to implementation, not specced here).
   *Verification:* grep output attached to the implementation PR, zero DOM-touching lines inside the
   engine-classified function bodies (or each hit explicitly justified).
3. **Repoint the 6 Node witnesses** (§Evidence table) from `build/erp/crud_overlay.js` to the
   collapsed source's new resting place (the exact target path is an implementation decision — e.g.
   promote bim-ootb's file into `bim-compiler`'s tree as the new canonical `build/erp/crud_overlay.js`
   content via the SQL/patch-and-loader convention CLAUDE.md mandates for DB content — NOT applicable
   here since this is source code, not a DB; a plain file-content sync, git-tracked, is the correct
   mechanism, unlike the DB rule). *Verification:* `node scripts/poc_crud_ownergate.js` and the other
   5 witnesses each individually exit 0 with unchanged G-line output, run and logged per witness
   (Log Mandate).
4. **Repoint `build/erp/glassbowl.html:858`** to load the same collapsed content (either literally
   the same file via a relative path across repos — not possible, these are two separate git repos —
   or a synced copy kept byte-identical by the collapse tooling; this cross-repo mechanics question
   is named, not resolved, in §Risk/Blast Radius below). *Verification:* manual load of
   `build/erp/glassbowl.html` in a browser, `§CRUD layer mounted` console line observed, a real
   signed CRUD write succeeds (`§CRUD-PERSIST … sealed=1 verifyChain=ok`).
5. **Repoint `docs/glassbowl.html:856`** the same way, replacing the 627-line 2026-06-02 bubble-era
   fossil content. **Do NOT do this step until the ⛔ open question below (is gh-pages Glassbowl still
   meant to be reachable) is answered** — collapsing here means either fixing-and-republishing or
   deliberately deciding to unpublish instead; this spec does not choose. *Verification (if
   fix-and-republish is chosen):* `scripts/safe_gh_deploy.sh` run (never bare `mkdocs gh-deploy`),
   no-shrink seatbelt passes, live `gh-pages` URL smoke-tested post-deploy per
   `DOCS_DEPLOY_POLICY.md`.
6. **Update BOTH `sw.js` precache lists** (`build/erp/sw.js:14`, `docs/sw.js:14` — both currently
   list `'crud_overlay.js'` unconditionally, content-agnostic, so no line CHANGE is needed there
   purely for the collapse) but **bump `CACHE_VERSION` in both** since the underlying file content
   changes: `build/erp/sw.js:7` is currently `'glassbowl-offline-v9'`, `docs/sw.js:7` is currently
   `'glassbowl-offline-v8'` — each bumps independently to its own next version (v10, v9 respectively;
   they are NOT required to match each other, they are two separate deploy surfaces with
   independent history). **This is the CLAUDE.md-flagged conflict magnet** — if another concurrent
   session also bumps either `CACHE_VERSION` or `PRECACHE_ASSETS` before this lands, resolve by
   keeping BOTH precache additions and taking the HIGHER `CACHE_VERSION`, never dropping either
   session's hunk. *Verification:* offline-reload smoke test (per existing SW conventions,
   `feedback_sw_update_toast.md`) shows the new cache version active and `crud_overlay.js` served
   from the new cache entry, byte-matching the collapsed source.
7. **Delete (or reduce to a thin re-export stub) the two now-superseded copies** —
   `build/erp/crud_overlay.js` and `docs/crud_overlay.js` — only AFTER steps 3-6 all verify green.
   *Verification:* `git diff --stat` shows the deletion; re-run all 6 Node witnesses one more time
   post-deletion to confirm nothing silently still pointed at the old path; re-load both lenses in a
   browser one more time.
8. **Session closeout:** update `PROGRESS.md`/`MEMORY.md` per CLAUDE.md housekeeping rules (a
   separate, deliberate pass — not a byproduct of this collapse task, per
   `feedback_prompt_file_organization.md` rule 0 already cited in this project's doctrine).

---

## §Risk / Blast Radius

- **Two separate git repos, one collapse.** `bim-ootb` and `bim-compiler` are independent
  repositories with independent histories — there is no git-native way to keep a file
  byte-identical across both except a manual sync step (copy + commit in each repo separately) or a
  build-time fetch. This spec does NOT invent that mechanism; it is a real open engineering question
  for the implementation pass, named here so it is not silently assumed solved by "collapse to one
  file."
- **`gh-pages` is a third deploy surface with its own guard rails** (`DOCS_DEPLOY_POLICY.md`,
  `DOCS_DEPLOY_GUARD.md`, `scripts/safe_gh_deploy.sh`'s no-shrink seatbelt). A collapse step that
  touches `docs/crud_overlay.js`/`docs/glassbowl.html` risks tripping the seatbelt (file
  shrink/deletion) if not done via the sanctioned script — CLAUDE.md is explicit: **never bare
  `mkdocs gh-deploy`**, it can silently wipe live pages.
- **Two `sw.js` precache lists, independent `CACHE_VERSION` histories** (`v9` vs `v8` today) — a
  known conflict magnet per CLAUDE.md's own standing guidance, worsened here because the collapse
  itself is exactly the kind of "any change to glassbowl.html / the bundle" event both files'
  header comments (`build/erp/sw.js:6`, `docs/sw.js:6`) say must bump `CACHE_VERSION`.
- **6 Node witness scripts** are a hard regression floor — any repoint that breaks even one silently
  removes engine coverage that currently protects `poc_crud_ownergate.js`'s G1-G5
  owner-gate/CAS proofs (cited by `ERP_OPLOG_APPEND_ONLY_FIX.md` as the S6 regression floor for the
  separate oplog fix too — breaking these here would ALSO stall that fix).
- **Two live UI surfaces in production** (`erp/idempiere.html`, `erp/glassbowl.html` in bim-ootb) —
  this is the file CLAUDE.md's PUSH PAUSE section already flags as currently pushable-to-live; a bad
  collapse step reaching bim-ootb's live tree is a production-facing risk, not a dev-only one.
- **Rollback story per step:**
  - Steps 1-2 (snapshot, static analysis): no tree changes, nothing to roll back.
  - Step 3 (witness repoint): revert the `require()` path changes; the 6 scripts are the only files
    touched, a single `git diff`/`git checkout` reverts cleanly.
  - Step 4 (build/erp/glassbowl.html repoint): revert to the frozen 1841-line snapshot from step 1.
  - Step 5 (gh-pages repoint): `safe_gh_deploy.sh`'s own soft-abort is the first line of defense (it
    refuses to shrink/delete); if a bad version DOES publish, `gh-pages` is a normal git branch —
    revertable via a follow-up deploy of the prior good tree, not a destructive-only operation.
  - Step 6 (sw.js bump): revert `CACHE_VERSION`/`PRECACHE_ASSETS` diffs; a bumped-then-reverted
    version number is harmless (SW clients simply see one extra no-op activate cycle).
  - Step 7 (delete old copies): the highest-risk step, ordered LAST and gated on all prior
    verifications passing specifically so it is the one step with the least need for rollback (if
    steps 3-6 are all green, the old copies are provably unreferenced before deletion).

---

## §Interaction with the oplog fix

`ERP_OPLOG_APPEND_ONLY_FIX.md` specs the remedy for a CONFIRMED silent-data-loss bug
(`_sidePersist`'s unconditional whole-blob `put()`) present, byte-identically, in all three copies
(§Evidence above). That spec's own §FILE PROVENANCE section left this exact question ⛔ BLOCKED:
*"does the fix land in all three copies, or does the duplication get collapsed first?"*

**Ordering rationale, per the user's explicit directive this session: collapse FIRST.** Reasons,
stated plainly:
1. The user's instruction was to collapse the duplication — that is the primary ask this document
   answers, not a side-effect of the oplog fix.
2. Writing the oplog fix (a nontrivial change: new IndexedDB object store, `navigator.locks`
   cross-tab mutex, migration path, `crud_ops.json` key rename — `ERP_OPLOG_APPEND_ONLY_FIX.md`
   §Design/§Migration/§Lease vs Version) against THREE divergent files means either doing that work
   three times (guaranteed further drift the moment any one copy is patched slightly differently) or
   doing it once and manually back-porting twice (the same drift risk, one step removed).
3. Collapsing first means the oplog fix's own implementation pass touches exactly ONE file, and its
   own witnesses (`W-OPLOG-APPEND`, `W-COMMIT-LOCK`, etc.) exercise that one file directly — no
   ambiguity about "which copy did this witness actually run against," the exact confusion
   `ERP_OPLOG_APPEND_ONLY_FIX.md` itself had to correct once already (its "Correction to a
   correction" section, over a line-number mislabel between bim-ootb and bim-compiler).
4. This collapse spec explicitly does NOT implement the oplog fix's design — §Requirements below is
   scoped to file-structure only. The oplog fix's own C-numbered/F-numbered requirements remain that
   document's, to be picked up as the next task once this collapse's requirements are `✅`.

---

## §Requirements

Numbered, single, falsifiable statements.

- **C1.** Exactly one `.js` source file contains the full ENGINE + all LENS code (bim-ootb's current
  154-function superset, or its collapse-time successor) — no second or third file independently
  defines `_sidePersist`, `gateOp`, `commitGroup`, or any other ENGINE-classified function.
- **C2.** `build/erp/glassbowl.html` and `docs/glassbowl.html` both load byte-identical
  `crud_overlay.js` content to `erp/glassbowl.html`/`erp/idempiere.html` (bim-ootb) — verified by
  content hash, not by eyeballing line counts.
- **C3.** All 6 Node witness scripts (§Evidence table) `require()` the collapsed source (whatever
  path it resolves to post-collapse) and pass unmodified — same G-line/assertion output as before
  the collapse.
- **C4.** Neither lens (glassbowl ring/bubble UI, iDempiere in-place-edit UI) loses any
  LENS-classified function's user-visible behavior — every function named in §Evidence's LENS list
  is reachable and exercised post-collapse exactly as it was pre-collapse.
- **C5.** `build/erp/sw.js` and `docs/sw.js` each carry a bumped `CACHE_VERSION` relative to their
  pre-collapse value (`v9`→higher, `v8`→higher respectively), and both still precache
  `crud_overlay.js` (`build/erp/sw.js:14`, `docs/sw.js:14`).
- **C6.** The collapsed engine file remains IIFE-wrapped exactly as all three current copies are
  (`(function (global) {...})(typeof window !== 'undefined' ? window : this);`), and any newly
  split-out lens file that declares top-level helper names is ALSO independently IIFE-wrapped, per
  `feedback_browser_iife_wrap_engines.md`.
- **C7.** No ENGINE-classified function (§Target Architecture list) references `document`,
  `getElementById`, `querySelector`, or any DOM API — a static, grep-verifiable property.
- **C8.** The two now-superseded copies (`build/erp/crud_overlay.js` original 1841-line content,
  `docs/crud_overlay.js` original 627-line content) are deleted or reduced to a stub ONLY after C1-C7
  are each independently witnessed — never as a combined single step.
- **C9.** `gh-pages`'s published `crud_overlay.js` is either (a) updated to the collapsed content via
  `scripts/safe_gh_deploy.sh` with the no-shrink seatbelt passing, or (b) left untouched pending the
  ⛔ open question below being answered — this spec does not choose between (a)/(b) unilaterally.

---

## §Witnesses

Each witness script: `⚠ DO NOT REMOVE` header naming the issue it proves/disproves (CLAUDE.md
"Tests expose issues"), full output → a `.log` file, log read before any pass/fail claim (Log
Mandate), `🟢`/`🔴` `verdict()` per assertion, `process.exit(fails ? 1 : 0)`.

| Req | Witness | `§` tags + expected values |
|---|---|---|
| C1 | `W-ONE-SOURCE` | static: `grep -rn "function _sidePersist" <all tracked crud_overlay.js paths>` returns exactly ONE match repo-wide (per repo) — assert count=1, not 2 or 3 |
| C2 | `W-LENS-CONTENT-HASH` | `§COLLAPSE-HASH file=<path> sha256=<hash>` for all copies loaded by an `.html` — assert all hashes equal |
| C3 | `W-WITNESS-FLOOR` | re-run each of the 6 scripts individually: `node scripts/poc_crud_ownergate.js`, `poc_crud_group.js`, `poc_so_complete_ui.js`, `poc_docaction_full.js`, `test_crud_overlay.js`, `test_crud_writeloop_overlay.js` — all exit 0, each logged separately, G-line/assertion text diffed against pre-collapse baseline captured in step 1's snapshot |
| C4 | `W-LENS-NO-REGRESSION` | for glassbowl: drive `createInline`/`editInline`/`hostCreate` (or their glassbowl-lens equivalents) via real `page.click`/`page.fill`, confirm `§CRUD-PERSIST … sealed=1 verifyChain=ok`; for idempiere: same for `editCell`/`hostUpdate`/`hostProcess` — a full LENS-function-name coverage checklist (all 18 LENS names) run at least once each, `§LENS-COVERAGE fn=<name> exercised=true` per name, assert zero `false` |
| C5 | `W-SW-VERSION-BUMP` | `§SW-VERSION file=build/erp/sw.js version=<new>` and `§SW-VERSION file=docs/sw.js version=<new>` — assert each strictly greater than its pre-collapse value (`v9`, `v8`) |
| C6 | `W-IIFE-WRAP` | static: grep each shipped `.js` engine/lens file's first and last non-blank lines match the `(function (global) {` / `})(typeof window !== 'undefined' ? window : this);` (or equivalent) pattern — assert present in every file that declares a top-level name |
| C7 | `W-ENGINE-DOM-FREE` | static: `grep -n "document\.\|getElementById\|querySelector"` restricted to the byte ranges of the 11 ENGINE-classified + pre-existing engine functions — assert zero hits, or each hit individually annotated and justified in the PR |
| C8 | `W-DELETE-ORDER` | `git log` shows C1-C7's witness commits predate the deletion commit — a chronology assertion, not a behavioral one |
| C9 | `W-GHPAGES-DECISION` | either `§GHPAGES-DEPLOY seatbelt=pass version=<new>` (path a) or `§GHPAGES-DEFERRED reason=open-question` (path b) — exactly one of the two must be logged, never neither |

---

## §Open Questions

- ⛔ BLOCKED (carried forward verbatim from `ERP_OPLOG_APPEND_ONLY_FIX.md` §FILE PROVENANCE, still
  unanswered): **is the gh-pages-published Glassbowl surface still intended to be user-reachable at
  all?** If yes, C9 path (a) applies — fix the collapsed content and republish via
  `scripts/safe_gh_deploy.sh` with its no-shrink seatbelt, giving it its own witness (none exists
  today for this surface specifically). If it is a 2026-06-02 bubble-era demo relic, C9 path (b)
  applies — unpublish deliberately rather than fix. `gh-pages` publishing is guard-railed
  (`prompts/DOCS_DEPLOY_POLICY.md`, `scripts/safe_gh_deploy.sh`'s no-shrink seatbelt; **never** bare
  `mkdocs gh-deploy` — CLAUDE.md is explicit this can silently wipe the whole live site) and removing
  a live page deliberately trips that seatbelt (by design, recoverable via `ALLOW_SHRINK=1
  paths=...`, never a hard lock). This document does not resolve it — needs the same user call the
  oplog-fix spec already left open.
- ⛔ BLOCKED: **what is the cross-repo sync mechanism for keeping bim-ootb's and bim-compiler's
  copies byte-identical going forward** (§Risk / Blast Radius, first bullet)? Two independent git
  repos cannot share a single tracked file natively. Candidates not evaluated here: (a) bim-compiler
  treats bim-ootb as the sole source of truth and its own `build/erp/crud_overlay.js` becomes a
  committed synced COPY, refreshed by a small script on every bim-ootb change; (b) a git submodule;
  (c) the 6 witnesses and `build/erp/glassbowl.html` are repointed to read from a path OUTSIDE
  bim-compiler entirely (a sibling checkout), which reintroduces exactly the LFS/worktree-hygiene
  hazards CLAUDE.md already warns about for cross-repo checkouts. Needs a decision before step 3 of
  §Collapse Plan can be executed as more than "delete the file and hope."
- ⛔ BLOCKED: **does the registration-seam choice (§Target Architecture's option (a)
  `CORE.registerLens()` vs option (b) implicit-global-read) matter for anything beyond style**, e.g.
  does either option change how `page.evaluate()`-based witnesses in
  `ERP_MULTIUSER_CONCURRENCY_POC.md` reach `window.__crud.kernelDb()`/`core.tipValues()`? Not
  evaluated here — an implementation-time decision, not a collapse-blocking one, but named so it
  isn't silently defaulted without a moment's consideration.
