#!/usr/bin/env bash
# lane_check.sh — POST-HOC REPORT. Reports, never blocks. Ordered by IRREVERSIBILITY.
#
# ⚠ DO NOT REMOVE — Scope: surface what cannot be undone later. Read it; decide yourself.
#
# TWO RULINGS SHAPE THIS (user, 2026-08-19):
# 1. "rather they be late post script checking, and not too aggressive as it can prevent actual
#    work" — so it exits 0 ALWAYS. A guard that blocks creates pressure to satisfy the guard rather
#    than the intent: measured the same day, two sessions collided on §S38 and BOTH "fixed" it in
#    opposite directions, one nearly deleting the other's block. A pre-commit gate would have FORCED
#    that under time pressure. And a hook people learn to --no-verify past defeats every hook.
# 2. "priority to larger disasters rather than trivial ones that can easily be resolved down the
#    line" — so output is ranked. Everything under ⛔ is work that can be GONE. Everything under ·
#    is cosmetic and safe to leave for later. Do not re-order these.
set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)" || exit 0
F="${1:-prompts/4D_GANTT_TM_REFACTOR.md}"
echo "§LANE_CHECK $(basename "$(pwd)")  $(date +%H:%M)"
echo
echo "⛔ IRREVERSIBLE — work that can be permanently lost"

# A. content that existed at HEAD and is now in NEITHER the tree NOR any archive
if [ -f "$F" ] && git rev-parse --verify -q HEAD >/dev/null 2>&1; then
  t=$(mktemp -d)
  git show "HEAD:$F" 2>/dev/null | grep -E '^#{1,3} ' | sed 's/[[:space:]]*$//' | sort -u > "$t/old" || : > "$t/old"
  grep -E '^#{1,3} ' "$F" | sed 's/[[:space:]]*$//' | sort -u > "$t/new"
  cat prompts/archive/*.md 2>/dev/null | grep -E '^#{1,3} ' | sed 's/[[:space:]]*$//' | sort -u > "$t/arch" || : > "$t/arch"
  sort -u "$t/new" "$t/arch" > "$t/kept"
  lost=$(comm -23 "$t/old" "$t/kept"); n=$(printf '%s' "$lost" | grep -c . || true)
  if [ "$n" -gt 0 ]; then
    echo "   ⛔ $n heading(s) gone from $F and not archived — CONTENT LOSS:"
    echo "$lost" | head -8 | sed 's/^/        /'
    echo "        2026-08-19 near-miss: two headings shared a prefix, a span scan matched only the"
    echo "        first, a whole section vanished. Caught by this check, not by care."
  else echo "   ✓ no content lost from $F"; fi
  rm -rf "$t"
fi

# B. commits that exist on this disk only
b=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
if git rev-parse --verify -q "origin/$b" >/dev/null 2>&1; then
  a=$(git rev-list --count "origin/$b..HEAD" 2>/dev/null || echo 0)
  [ "$a" -gt 0 ] && echo "   ⛔ $a commit(s) on this disk ONLY (branch $b not pushed)" || echo "   ✓ all commits pushed"
else
  echo "   ⛔ branch $b has NO upstream — every commit on it is single-copy"
fi

# C. uncommitted work in sibling worktrees (a /tmp clear destroys it)
for r in "$(pwd)" "$HOME/bim-ootb"; do
  [ -d "$r/.git" ] || [ -f "$r/.git" ] || continue
  git -C "$r" worktree list 2>/dev/null | awk '{print $1}' | while read -r w; do
    [ -d "$w" ] || continue
    case "$w" in *.claude/worktrees/*) continue;; esac
    d=$(git -C "$w" status --short 2>/dev/null | wc -l)
    wb=$(git -C "$w" rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ "$d" -gt 0 ] && ! git -C "$w" rev-parse --verify -q "origin/$wb" >/dev/null 2>&1; then
      echo "   ⛔ $w [$wb] — $d uncommitted file(s), NO remote branch. /tmp clear = gone."
    fi
  done
done
echo
echo "·  DEFERRABLE — cosmetic, fix whenever, nothing at risk"
[ -f "$F" ] && { dup=$(grep -oE '^# §[A-Z0-9_]+' "$F" | sort | uniq -d)
  [ -n "$dup" ] && { echo "   · duplicate section id(s): $(echo "$dup" | tr '\n' ' ')"
                     echo "     (renumber YOURS, never someone else's — pull first)"; } || echo "   · section ids unique"
  grep -q 'ship-ready change (§S25_REVIEW.6)' "$F" && echo "   · §STATUS still calls §S25_REVIEW.6 ship-ready (§S33.2 killed it)"
  o=$(sed -n '/^# §S37/,/^# §S[0-9]/p' "$F" | grep -cE '^\| \*\*[A-D][0-9]\*\*' || true)
  [ "$o" -gt 0 ] && echo "   · §S37 ledger: $o item(s) measured and not yet a PR or a user decision"; }
echo
echo "§LANE_CHECK done — REPORT ONLY, exit 0. Nothing blocked."
exit 0
