#!/bin/bash
# §STACK_SIZE — dev side vs deployed side of bim-ootb, from tracked files at one commit (DeveloperGuide §0.1 diagram). Usage: scripts/code_arch/size_stack.sh <bim-ootb tree>. Read the log: every number in the diagram is one line here.
cd "$1" || exit 1
echo "§STACK_SIZE commit=$(git rev-parse --short HEAD) date=$(date +%F)"
T=$(mktemp); git ls-files > $T
TEST_RE='(^|/)(tests?|witness|witness_kit)/|(^|/)witness_[^/]*\.js$|(^|/)test_[^/]*\.js$'
DEV_RE='^(scripts|devtools|types|\.vscode|\.github|prompts|docs|internal)/'
VEND_RE='(^|/)(lib|node_modules|vendor)/|\.min\.js$|sql-wasm'
stat_set() { # name, file list on stdin
  local n=0 l=0 b=0 f
  while IFS= read -r f; do [ -f "$f" ] || continue; n=$((n+1)); b=$((b+$(stat -c %s "$f"))); case "$f" in *.js|*.mjs|*.html|*.css) l=$((l+$(wc -l < "$f")));; esac; done
  echo "§STACK_SIZE set=$1 files=$n lines=$l MB=$(awk "BEGIN{printf \"%.1f\", $b/1048576}")"
}
grep -E '\.(js|mjs)$' $T | grep -vE "$TEST_RE" | grep -vE "$DEV_RE" | grep -vE "$VEND_RE" > $T.app
stat_set app_js < $T.app
grep -E '\.html$' $T | grep -vE "$TEST_RE|$DEV_RE" | stat_set app_html
grep -E '\.(js|mjs)$' $T | grep -E "$VEND_RE" | grep -vE "$TEST_RE" | stat_set vendored_js
grep -E "$TEST_RE" $T | grep -E '\.(js|mjs)$' | stat_set witness_js
grep -E '(^|/)witness_[^/]*\.js$' $T | grep -vE '^(scripts|devtools)/' | wc -l | sed 's/^/§STACK_SIZE witness_named_files=/'
grep -E '^devtools/' $T | stat_set devtools
grep -E '^scripts/' $T | grep -E '\.(js|mjs|sh|py)$' | stat_set scripts
grep -E '\.db$' $T | stat_set tracked_db
stat_set whole_tree < $T
echo "§STACK_SIZE app_lines_with_section_sign=$(xargs grep -h '§' < $T.app 2>/dev/null | wc -l)"
for sw in viewer/sw.js erp/sw.js modeller/sw.js; do echo "§STACK_SIZE precache sw=$sw entries=$(node -e "const s=require('fs').readFileSync('$sw','utf8');const m=s.match(/PRECACHE_ASSETS\s*=\s*\[([\s\S]*?)\];/);console.log(m?(m[1].replace(/\/\/.*$/gm,'').match(/'[^']+'|\"[^\"]+\"/g)||[]).length:'?')") version=$(grep -oE "CACHE_VERSION = '[^']+'" $sw | head -1 | cut -d\' -f2)"; done
echo "§STACK_SIZE precache_entries_pointing_at_tests=$(grep -hoE "'[^']*(tests/|witness_)[^']*\.js'" viewer/sw.js erp/sw.js modeller/sw.js | wc -l)"
rm -f $T $T.app
