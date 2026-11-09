#!/bin/bash
# # ⚠ DO NOT REMOVE — demo d6: the two inventories (the denominators) from their generators (W-FILM-NEURO2-CLI, §22.8). Read the evidence/ files after every run.
# Both generators are repo-side (not downloadable): run in a bim-ootb worktree at a PINNED main sha (default: the sha below), output to a temp file, never over the tracked inventory.
set -e; . "$(dirname "$0")/lib.sh"
WT="${OOTB_WT:-/tmp/wt-part2-ootb}"; SHA="${OOTB_SHA:-16b3c205ebd70668152312a59b4f0d4315d19243}"
[ "$(git -C "$WT" rev-parse HEAD)" = "$SHA" ] || { echo "§DEMO_FAIL $WT is not at pinned $SHA"; exit 4; }
[ -z "$(git -C "$WT" status --short)" ] || { echo "§DEMO_FAIL $WT is dirty"; exit 4; }
echo "$SHA" > "$EVID/d6_bim_ootb_sha.txt"
for g in viewer_actions erp_verbs; do
  ID="d6_$g"; : > "$EVID/$ID.files"; T="$(mktemp -d "${DEMO_TMP:-/tmp}/demo_${ID}_XXXXXX")"
  printf 'node scripts/gen_%s.js --out <tmp>/%s.md   (cwd = bim-ootb @ %s)\n' "$g" "$g" "$SHA" > "$EVID/$ID.cmd"
  ( cd "$WT" && node "scripts/gen_$g.js" --out "$T/$g.md" > "$EVID/$ID.stdout" 2> "$EVID/$ID.stderr"; echo $? > "$EVID/$ID.exit" ) || true
  echo "$(sha256sum "$T/$g.md" | cut -c1-16)  $(stat -c %s "$T/$g.md")  generated $g.md" >> "$EVID/$ID.files"
  cp "$T/$g.md" "$EVID/$ID.md"
  echo "§DEMO $ID exit=$(cat "$EVID/$ID.exit") $(head -1 "$EVID/$ID.stdout" | cut -c1-200)"
done
