# ⚠ DO NOT REMOVE
**Scope:** the top-right GitHub repo widget(s) in the public docs site header
(`https://red1oon.github.io/BIMCompiler/`) — `overrides/partials/header.html`,
`docs/javascripts/bim_compiler_source.js`, the `.md-header__source--stacked` /
`.md-source-totals` rules in `docs/stylesheets/custom.css`, and the
`extra_javascript` entry in `mkdocs.yml`. Read this before touching any of them
again — the failure modes below are non-obvious and will be re-invented from
scratch otherwise.

---

# §HEADER_STARS_WIDGET (2026-07-29)

## What's there and why
Two independent live repo widgets sit side by side in the header, styled identically:
- **bim-ootb** — the theme's own built-in `.md-source` widget (`repo_url:` in `mkdocs.yml`,
  zero custom code, has worked unmodified since the site existed).
- **bim-compiler** — a second widget added this session, visually matching the first
  (same git-alt icon, same `md-source__repository` / `md-source__facts` markup and CSS),
  fed by an independent fetch script.
- A small `Σ <stars>/<forks>` combined-totals span sits after both, computed client-side
  from the same two fetches — added without giving the row any more width than the two
  widgets already needed.

## Why the built-in widget can't just be duplicated (read this before "simplifying")
mkdocs-material's star/fork fetch for `.md-source` is a **module-level singleton**, not
a per-element fetch. Verified by reading the actual shipped bundle, not assumed:
```
var Os; function Ls(e){ return Os || (Os = H(()=>{...}).pipe(...,Z(1))) }
```
`getComponentElements("source")` maps **every** `data-md-component="source"` element on
the page through that one cached `Os`. A second such element pointed at a different repo
does not get its own fetch — it just redisplays the FIRST element's cached stats. There is
also a single shared `sessionStorage` key (`__source`), not keyed per repo. This is baked
into the vendored, unmodifiable theme JS (`material/templates/assets/javascripts/bundle.*.min.js`)
— there is no config flag around it.

**Consequence:** the bim-compiler widget is deliberately built WITHOUT
`data-md-component="source"`, so the theme's JS never touches it. Its own fetch lives in
`docs/javascripts/bim_compiler_source.js`, with its own `sessionStorage` cache keys
(`__source_bimcompiler`, `__source_bimootb_totals` — distinct from the theme's `__source`).
It reuses the theme's own CSS classes (`md-source`, `md-source__repository`,
`md-source__facts`, `md-source__fact--stars/--forks`) so it renders pixel-identical to the
built-in widget without needing any bespoke styling.

## The actual bug that mattered (not layout)
Last session's implementation (shields.io `<img>` badges, since removed) pointed at
`https://github.com/red1oon/bim-compiler` — **that repo does not exist.** This repo's real
GitHub name is `red1oon/BIMCompiler` (confirmed via `api.github.com/repos/red1oon/BIMCompiler`
— 7★ / 3⑂ at time of writing). The badges were silently rendering "repo not found" the whole
time; nobody had actually looked at the rendered text, only at "does *a* badge show up."
**Always read the literal rendered text, not just "did an element appear," when a live-data
widget is the thing being verified.**

There was a secondary, real layout defect on top of that (the badge sat on its own stacked
row via `flex-direction: column`, given a fixed `11.7rem` width from the theme's
`.md-header__source` rule) — fixed by widening `.md-header__source--stacked` to `width: auto`
and switching to `flex-direction: row`. But the row/column bug was never the reason it looked
broken; the wrong repo slug was.

## Files, exact roles
- `overrides/partials/header.html` — based on the theme's own `partials/header.html`
  (`material/templates/partials/header.html` in the installed package), with the second
  `<a class="md-source" id="bim-compiler-source">` block and the `#repo-totals` span added
  inside `{% if config.repo_url %}`.
- `docs/javascripts/bim_compiler_source.js` — fetches `red1oon/BIMCompiler` and
  `red1oon/bim-ootb` independently (client-side, on every page load, session-cached),
  renders the `md-source__facts` list into `#bim-compiler-repository`, and renders
  `Σ <stars>/<forks>` into `#repo-totals`.
- `docs/stylesheets/custom.css` — `.md-header__source--stacked` (row layout, `width: auto`
  overriding the theme's fixed `11.7rem`) and `.md-source-totals` (the totals span style).
- `mkdocs.yml` `extra_javascript` — must list `javascripts/bim_compiler_source.js` or the
  bim-compiler widget silently stays static text with no facts/totals (no error, just never
  fires — check this first if it "stops working").

## How this was verified (no browser tool used — see the §-log norm this project runs on)
Local `mkdocs build` to a scratch dir (same tool `scripts/safe_gh_deploy.sh` wraps), then:
1. `diff -rq` the full site output before/after each change — confirmed the ONLY files that
   differed were the header markup (propagates to every page, expected) and the new JS file.
2. `node --check` on the JS + a manual trace of the number-formatting function.
3. Read the literal rendered HTML (`grep`) for the exact anchor markup and ids.
4. Read the ACTUAL text a real GitHub API call would produce (`curl api.github.com/repos/...`)
   before trusting any "it shows a number" claim.
No screenshots, no Chrome automation — this is a static-content/layout question, not a
continuous/geometric one, but the same "read the real log/output, don't eyeball" discipline
applies per `docs/internal/WalkerDoctrine.md`-adjacent project law.

## Deploy record
- `1471fb641` — layout-only fix (row not column), while the repo slug was still wrong.
  Deployed → gh-pages `e717248da`.
- `e16e04f46` — the actual fix: correct repo slug (`BIMCompiler` not `bim-compiler`),
  independent-fetch widget replacing the shields.io badges, totals span added.
  Deployed via `scripts/safe_gh_deploy.sh`, guard PASSED (269 files, superset of live),
  all 7 canaries 200.
- Both deploys went through the standard `git merge origin/master` step inside
  `safe_gh_deploy.sh` step 1 (documented in `prompts/DOCS_DEPLOY_GUARD.md`) — this is
  expected, not a side effect specific to this change.

## If a future session is asked to touch this again
- Don't reach for shields.io images again — the independent-JS-fetch approach above is
  strictly better (matches the built-in widget's exact look, no extra network host).
- Don't try to give the built-in bim-ootb widget a second `data-md-component="source"`
  sibling — re-read §HEADER_STARS_WIDGET above, it will silently show wrong data, not error.
- If a THIRD repo ever needs a widget, follow the same pattern: own id, own fetch, own
  sessionStorage key, reuse `md-source__facts` CSS — don't invent a new visual style.
