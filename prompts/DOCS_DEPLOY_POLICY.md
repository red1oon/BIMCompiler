# ⚠ DO NOT REMOVE — Docs deploy policy (authored 2026-06-16, after the 2nd GH-Pages wipe)

**Scope:** how docs publish to https://red1oon.github.io/BIMCompiler/ . Read this before touching
`mkdocs.yml`, `.github/workflows/docs.yml`, or running any `gh-deploy`. Read the deploy log after every run.

## TL;DR for every session — code, commit, forget
1. Do your work on your branch. **Commit normally.** You do NOT need to be a git admin.
2. To publish docs: run **`mkdocs gh-deploy`** from **your working branch** (the full tree you're standing on).
3. That's it. Forget the rest — the guard below has your back.

## What changed and why (the landmine)
`docs.yml` USED to auto-run `mkdocs gh-deploy --force` on every push to `master`. `gh-deploy --force`
**rebuilds the whole site and force-pushes `gh-pages`** — it is total replacement, not a patch. Because
real doc work lives on a long-lived `feat/*` branch and `master` had gone stale, a routine master push
force-published a THIN site and **WIPED live pages** (migrate_status_panel.html, glassbowl*.html, …). Twice.

## The rules now (do not undo these)
- **`master` is reconciled to the live superset** (2026-06-16, commit `21f7bbd2`) and is the truthful trunk.
- **`docs.yml` is DISARMED**: `workflow_dispatch` only (no auto-fire on master push) + a **no-deletion guard**
  step that ABORTS the deploy if the build would remove any page currently live on `gh-pages`.
- **Deploy docs ONLY from a full working branch** via `mkdocs gh-deploy`. Never from a partial/thin checkout.
- **Do NOT re-arm `docs.yml` auto-deploy on master push.** If you think you need it, you don't — the manual
  path + guard is the policy. (Re-arming is only safe if master is kept continuously equal to what's live.)
- **If the guard ABORTS your deploy:** that is the safety net working. It means your branch is missing pages
  that are live. Fix: `git fetch origin master && git merge origin/master` (or rebase onto the trunk) so your
  tree is the superset, then re-run `mkdocs gh-deploy`. **Never** work around it with `--force` from a thin tree.

## Why a worktree didn't contain the blast
Worktrees isolate your working-dir + checked-out branch. They do NOT isolate the **deploy target**:
`gh-pages` is a force-pushed shared branch, so any deploy's blast radius is the WHOLE site regardless of
which files you touched. The fix is the guard, not the worktree.

See memory `feedback_docs_deploy_landmine.md`.

## ⚠ Known guard trip (2026-09-27): `glassbowl_data.db` is live but not in git
`glassbowl.html` / `glassbowl_gravity.html` load `glassbowl_data.db` (94,208 B). It was untracked by the 2026-09-01 LFS cleanup
(`0daef3b36`, *.db untracked — binary DBs are banned from git), so ANY deploy from a fresh worktree/clone aborts with
`§GUARD-DELETE would DELETE live page: glassbowl_data.db`. **Do NOT bless it with ALLOW_SHRINK** — that would break the live
glassbowl pages. Fix used 2026-09-27: copy the local, byte-identical file into the deploy tree first (it is gitignored, never
committed): `cp ~/bim-compiler/docs/glassbowl_data.db <worktree>/docs/` (sha256 prefix `efed6b5b8e4b195e` == live), then
`scripts/safe_gh_deploy.sh` → guard PASS 292/292. If the local copy is ever missing, fetch it from the live site first:
`curl -o docs/glassbowl_data.db https://red1oon.github.io/BIMCompiler/glassbowl_data.db`.
