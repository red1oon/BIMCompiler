#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — Scope: the no-shrink docs-publish seatbelt. Read build/docs_deploy.log after every run.
# Implements prompts/DOCS_DEPLOY_GUARD.md — Witness: W-DEPLOY-GUARD.
# Replaces bare `mkdocs gh-deploy` everywhere. A publish that would DELETE a live page, or SHRINK an
# html/asset by more than SHRINK_TOL%, ABORTS instead of overwriting gh-pages. Last-deploy-wins can no
# longer silently wipe live HTML from a stale/thin tree.
#
# SPEC (DOCS_DEPLOY_GUARD.md §"Build"):
#   1. become the superset: fetch + merge origin/master; on conflict ABORT (never auto-pick).
#   2. build the about-to-deploy tree.
#   3. materialize the current live tree (origin/gh-pages) as a path+size manifest.
#   4. GUARD (the falsifier): live-but-absent-in-new => ABORT(delete); new smaller than live by
#      >SHRINK_TOL% => ABORT(shrink). Print offending paths + old->new sizes. Exit non-zero.
#   5. only if guard passes: publish.
#   6. post-deploy: poll changed pages + a fixed canary set => all HTTP 200.
#
# Knobs (env):
#   SHRINK_TOL=5            percent a file may shrink before it counts as a wipe (default 5)
#   ALLOW_SHRINK=1 paths="a,b"   explicitly bless named paths that may shrink/disappear (intentional removal)
#   DRY_RUN=1              run steps 1-4 (+report) but never publish
#   GUARD_ONLY=1          run ONLY the guard comparison (steps 3-4) over injected dirs; no merge/build/deploy
#   GUARD_LIVE_DIR=DIR    test hook: use DIR as "live" instead of fetching gh-pages
#   GUARD_NEW_DIR=DIR     test hook: use DIR as the new build instead of `mkdocs build`
#   The GUARD_*_DIR hooks let W-DEPLOY-GUARD drive the REAL guard code against fixtures — no deploy, no net.
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG="$REPO/build/docs_deploy.log"
SHRINK_TOL="${SHRINK_TOL:-5}"
# Canaries = pages that MUST exist post-deploy. Keep only real BIMCompiler doc pages here.
# (RetailScaleStory + glassbowl removed 2026-06-20: they live on the bim-ootb site, not BIMCompiler —
#  they were never in this repo's docs/ nor on gh-pages, so they cried a false 404 every deploy.)
CANARIES="USER_GUIDE BIMUserGuide ModellerGuide ERPUserGuide MigrateComparisonPaper DistributedERP HolyGrail"
BASE_URL="${BASE_URL:-https://red1oon.github.io/BIMCompiler}"

mkdir -p "$REPO/build"
_log() { printf '%s %s\n' "$(date -u +%H:%M:%S 2>/dev/null || echo '--:--:--')" "$*" | tee -a "$LOG" ; }
_abort() { _log "§GUARD ABORT: $*"; _log "§GUARD result=ABORT — gh-pages NOT touched. Read $LOG."; exit 1; }

# --- manifest helpers: normalize both sides to "<size>\t<relpath>", sorted by path ----------------
# A manifest is the single source of truth the comparison runs on, so live-from-git and new-from-dir
# (and the test fixtures) all funnel through identical comparison logic.
_manifest_from_dir() {   # $1=dir
  local d="$1"
  ( cd "$d" 2>/dev/null && find . -type f -printf '%s\t%P\n' 2>/dev/null | sort -k2 )
}
_manifest_from_gitref() {  # $1=ref (e.g. origin/gh-pages) -> "<size>\t<relpath>"
  git -C "$REPO" ls-tree -r -l "$1" 2>/dev/null \
    | awk '{ size=$4; $1=$2=$3=$4=""; sub(/^ +/,""); print size "\t" $0 }' | sort -k2
}

# --- the falsifier: compare a LIVE manifest file against a NEW manifest file ----------------------
# echoes nothing on pass; on any violation prints offenders and returns 1. Honours ALLOW_SHRINK/paths.
_run_guard() {  # $1=live_manifest_file  $2=new_manifest_file
  local live="$1" new="$2" viol=0
  local allow=",${paths:-},"
  # index new manifest: path -> size
  declare -A NEW=()
  while IFS=$'\t' read -r sz path; do [ -n "$path" ] && NEW["$path"]="$sz"; done < "$new"
  while IFS=$'\t' read -r lsz lpath; do
    [ -z "$lpath" ] && continue
    local blessed=0
    [ "${ALLOW_SHRINK:-0}" = "1" ] && case "$allow" in *",$lpath,"*) blessed=1;; esac
    if [ -z "${NEW[$lpath]+x}" ]; then
      if [ "$blessed" = 1 ]; then _log "  (blessed deletion) $lpath"; continue; fi
      _log "  §GUARD-DELETE would DELETE live page: $lpath (was ${lsz}B, absent in new)"; viol=$((viol+1)); continue
    fi
    case "$lpath" in
      *.html|*.css|*.js|*.json|*.svg|*.png|*.xml)
        local nsz="${NEW[$lpath]}"
        # shrink violation: nsz < lsz * (100 - TOL) / 100   (integer math, avoids float deps)
        local floor=$(( lsz * (100 - SHRINK_TOL) / 100 ))
        if [ "$nsz" -lt "$floor" ]; then
          if [ "$blessed" = 1 ]; then _log "  (blessed shrink) $lpath ${lsz}B->${nsz}B"; continue; fi
          _log "  §GUARD-SHRINK would SHRINK $lpath: ${lsz}B -> ${nsz}B (floor=${floor}B at ${SHRINK_TOL}% tol)"
          viol=$((viol+1))
        fi
        ;;
    esac
  done < "$live"
  [ "$viol" -gt 0 ] && return 1 || return 0
}

# === build the two manifests, from real sources or test hooks ====================================
WORK="$(mktemp -d)"; PRINTED=""; trap 'rm -rf "$WORK"; for f in $PRINTED; do rm -f "$f"; done' EXIT   # PRINTED: the docs/<Name>.pdf step 2b wrote (untracked; gone after the publish)
LIVE_MAN="$WORK/live.man"; NEW_MAN="$WORK/new.man"

_log "§DEPLOY-START safe_gh_deploy SHRINK_TOL=${SHRINK_TOL}% GUARD_ONLY=${GUARD_ONLY:-0} DRY_RUN=${DRY_RUN:-0}"

if [ "${GUARD_ONLY:-0}" != "1" ]; then
  # Step 1 — become the superset (process half of the fix).
  _log "§STEP1 fetch + merge origin/master (become the superset)"
  git -C "$REPO" fetch origin -q || _abort "git fetch failed"
  if ! git -C "$REPO" merge --no-edit origin/master >>"$LOG" 2>&1; then
    _log "§STEP1 MERGE CONFLICT — conflicted files:"
    git -C "$REPO" diff --name-only --diff-filter=U | tee -a "$LOG" | sed 's/^/    /'
    git -C "$REPO" merge --abort 2>/dev/null
    _abort "merge conflict with origin/master — resolve by hand, NEVER auto-pick, then re-run"
  fi
fi

# Step 2 — the about-to-deploy tree.
if [ -n "${GUARD_NEW_DIR:-}" ]; then
  _log "§STEP2 new tree = injected GUARD_NEW_DIR=$GUARD_NEW_DIR"
  _manifest_from_dir "$GUARD_NEW_DIR" > "$NEW_MAN"
else
  # the language chooser needs its plugin (prompts/DOCS_I18N.md §6d); a missing plugin aborts here, before any comparison, never a half build
  python3 -c "import mkdocs_static_i18n" 2>/dev/null || _abort "mkdocs-static-i18n is not installed for this mkdocs: pip install --user mkdocs-static-i18n==1.3.1"
  _log "§STEP2 mkdocs build -> $WORK/site_new"
  ( cd "$REPO" && mkdocs build -q -d "$WORK/site_new" ) >>"$LOG" 2>&1 || _abort "mkdocs build failed"
  # Native `mkdocs gh-deploy` auto-creates .nojekyll on every publish (tells GitHub Pages not to
  # run Jekyll over the mkdocs output); a plain `mkdocs build` does not. Without it here, this guard
  # would abort EVERY future deploy as a false "would delete .nojekyll" — not a one-off content issue.
  touch "$WORK/site_new/.nojekyll"
  # Step 2b — printable guides (prompts/DOCS_DEPLOY_GUARD.md §"Printable guides"): every docs/<Name>.md that carries window.print()
  # gets ONE PDF made from this very build, checked (W-GUIDE-PRINT), written to docs/<Name>.pdf so step 5's rebuild publishes it at /<Name>.pdf.
  # A page byte-identical to the live one reuses the live PDF (no new blob on gh-pages). A FAIL aborts; no tools = rc 3 aborts unless ALLOW_NO_PDF=1
  # (and then the DELETE guard still refuses to drop a live PDF).
  for md in "$REPO"/docs/*.md; do
    grep -q 'window.print()' "$md" || continue
    name="$(basename "$md" .md)"; pdf="$REPO/docs/$name.pdf"; built="$WORK/site_new/$name/index.html"
    git -C "$REPO" ls-files --error-unmatch "docs/$name.pdf" >/dev/null 2>&1 && _abort "printable guide $name: docs/$name.pdf is a TRACKED file; step 2b will not overwrite it"
    [ -f "$built" ] || { _log "§STEP2b $name: not built, skipped"; continue; }
    if git -C "$REPO" cat-file -e "origin/gh-pages:$name.pdf" 2>/dev/null && git -C "$REPO" cat-file -e "origin/gh-pages:$name/index.html" 2>/dev/null \
       && [ "$(git -C "$REPO" show "origin/gh-pages:$name/index.html" | sha256sum)" = "$(sha256sum < "$built")" ]; then
      git -C "$REPO" show "origin/gh-pages:$name.pdf" > "$pdf"; PRINTED="$PRINTED $pdf"
      _log "§STEP2b $name: the page is unchanged since the live publish -> the live PDF is reused ($(wc -c < "$pdf")B)"
    else
      _log "§STEP2b $name: printing the built page to PDF and checking it (W-GUIDE-PRINT)"
      node "$REPO/scripts/guide/print_check.js" --site "$WORK/site_new" --page "$name" --out "$pdf" > "$WORK/print_$name.log" 2>&1; rc=$?
      grep '§PRINT' "$WORK/print_$name.log" | while IFS= read -r l; do _log "  $l"; done
      if [ "$rc" -ne 0 ]; then rm -f "$pdf"
        if [ "$rc" = 3 ] && [ "${ALLOW_NO_PDF:-0}" = "1" ]; then _log "§STEP2b $name: no PDF made (ALLOW_NO_PDF=1)"; continue; fi
        _abort "printable guide $name: the PDF check did not pass (rc=$rc, the §PRINT lines above)"
      fi
      PRINTED="$PRINTED $pdf"
    fi
    cp "$pdf" "$WORK/site_new/$name.pdf"
  done
  _manifest_from_dir "$WORK/site_new" > "$NEW_MAN"
fi

# Step 3 — the current live tree.
if [ -n "${GUARD_LIVE_DIR:-}" ]; then
  _log "§STEP3 live tree = injected GUARD_LIVE_DIR=$GUARD_LIVE_DIR"
  _manifest_from_dir "$GUARD_LIVE_DIR" > "$LIVE_MAN"
else
  _log "§STEP3 fetch origin/gh-pages live manifest"
  git -C "$REPO" fetch origin gh-pages -q 2>>"$LOG" || true
  if git -C "$REPO" rev-parse --verify -q origin/gh-pages >/dev/null; then
    _manifest_from_gitref origin/gh-pages > "$LIVE_MAN"
  else
    _log "§STEP3 no gh-pages yet — first deploy, guard has nothing to protect"
    : > "$LIVE_MAN"
  fi
fi

_log "§STEP4 GUARD: live=$(wc -l < "$LIVE_MAN") files, new=$(wc -l < "$NEW_MAN") files, tol=${SHRINK_TOL}%"
if _run_guard "$LIVE_MAN" "$NEW_MAN"; then
  _log "§GUARD result=PASS — new build is a superset (within tolerance). Safe to publish."
else
  _abort "publish would SHRINK the live site (see offenders above). Become the superset (git merge origin/master) or bless with ALLOW_SHRINK=1 paths=..."
fi

# guard-only / dry-run stop here, having proven the verdict without touching anything live.
if [ "${GUARD_ONLY:-0}" = "1" ]; then _log "§GUARD-ONLY done (no deploy)"; exit 0; fi
if [ "${DRY_RUN:-0}" = "1" ]; then _log "§DRY-RUN done — guard passed, deploy skipped"; exit 0; fi

# Step 5 — publish (guard passed).
_log "§STEP5 mkdocs gh-deploy (guard passed)"
( cd "$REPO" && mkdocs gh-deploy --force ) >>"$LOG" 2>&1 || _abort "mkdocs gh-deploy failed"

# Step 6 — post-deploy canary poll.
_log "§STEP6 canary poll @ $BASE_URL"
fail=0
for c in $CANARIES; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/$c/" 2>/dev/null || echo 000)
  [ "$code" = "200" ] && _log "  canary $c -> 200" || { _log "  §CANARY-FAIL $c -> $code"; fail=$((fail+1)); }
done
[ "$fail" -gt 0 ] && _log "§STEP6 WARNING $fail canary page(s) not 200 — investigate $LOG" || _log "§STEP6 all canaries 200"
# Step 6b — each printable guide's PDF, fetched back from the live site and compared to the one just made (Pages can take a few minutes)
for pdf in $PRINTED; do
  name="$(basename "$pdf" .pdf)"; want="$(sha256sum < "$pdf")"; got=""
  for i in $(seq 1 18); do got="$(curl -s "$BASE_URL/$name.pdf?cb=$RANDOM" | sha256sum)"; [ "$got" = "$want" ] && break; sleep 10; done
  [ "$got" = "$want" ] && _log "§STEP6b $name.pdf live == the checked PDF ($(wc -c < "$pdf")B)" || _log "§STEP6b WARNING $name.pdf live differs from the checked PDF after 3 min — fetch $BASE_URL/$name.pdf again"
done
_log "§DEPLOY-DONE published + canaries checked"
