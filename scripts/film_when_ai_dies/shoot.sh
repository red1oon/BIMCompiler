#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — SCOPE: film "When AI Dies" (prompts/FILM_WHEN_AI_DIES.md). Takes the VS Code stills: the REAL VS Code on a private virtual display (Xvfb :96, --disable-gpu, a temp profile with "chat.disableAIFeatures": true)
# on a CLEAN bim-ootb origin/main tree, X0 Navigator loaded from source, driven by shots_suite.js. Needs out/erp.json (erp_shot.js) and out/facts.json. READ out/shots.log after every run; the tree must end clean (§FILM_RESTORE).
# Usage: shoot.sh <bim-ootb tree> <bim-compiler tree>
set -u
NEW="$(cd "$1" && pwd)"; COMP="$(cd "${2:-$HOME/bim-compiler}" && pwd)"; HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; OUT="$HERE/out"
[ -s "$OUT/erp.json" ] || { echo "§FILM_SHOOT REFUSED: run erp_shot.js first"; exit 2; }
[ -z "$(git -C "$NEW" status --porcelain -uno)" ] || { echo "§FILM_SHOOT REFUSED: the tree is not clean"; exit 2; }
rm -rf "$OUT/stills" "$OUT/shots.log" "$OUT"/done.* "$OUT"/*.req "$OUT/profile_v"; mkdir -p "$OUT/stills"
BIN="${VSCODE_BIN:-/snap/code/current/usr/share/code/code}"; DISP=":96"
Xvfb $DISP -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 & XPID=$!; sleep 2
echo "§FILM_TREE new=$(git -C "$NEW" rev-parse --short HEAD)" >> "$OUT/shots.log"
prof="$OUT/profile_v"; mkdir -p "$prof/user/User"
export FILM_TREE="$NEW" FILM_SETTINGS="$prof/user/User/settings.json"
cat > "$prof/user/User/settings.json" <<JSON
{
  "chat.disableAIFeatures": true,
  "telemetry.telemetryLevel": "off",
  "update.mode": "none",
  "extensions.autoUpdate": false,
  "security.workspace.trust.enabled": false,
  "workbench.startupEditor": "none",
  "git.enabled": false,
  "window.zoomLevel": 1.6,
  "editor.minimap.enabled": false,
  "workbench.activityBar.location": "hidden",
  "editor.fontSize": 15,
  "workbench.tips.enabled": false,
  "window.commandCenter": false,
  "workbench.layoutControl.enabled": false,
  "chat.commandCenter.enabled": false,
  "window.titleBarStyle": "native",
  "window.menuBarVisibility": "hidden",
  "breadcrumbs.enabled": false,
  "editor.stickyScroll.enabled": false,
  "editor.inlayHints.enabled": "off",
  "workbench.editor.showTabs": "single",
  "editor.codeLens": true,
  "editor.wordWrap": "off",
  "editor.hover.delay": 200,
  "bimDevtools.compilerRoot": "$COMP",
  "bimDevtools.costBaseRef": "$(git -C "$NEW" rev-parse HEAD)",
  "bimDevtools.extraLogDirs": ["${FILM_LOGDIR:-$HOME/.cache/bim4d/LTU_AHouse/3379cbf0b211_4c8212a3a98b_meta}"]
}
JSON
( env -u ELECTRON_RUN_AS_NODE DISPLAY=$DISP FILM_OUT="$OUT" FILM_TREE="$NEW" FILM_SETTINGS="$prof/user/User/settings.json" nice -n 19 timeout 600 "$BIN" --no-sandbox --disable-gpu --disable-workspace-trust --skip-welcome --skip-release-notes \
    --user-data-dir="$prof/user" --extensions-dir="$prof/ext" --extensionDevelopmentPath="$NEW/devtools/vscode/x0-navigator" --extensionTestsPath="$HERE/shots_suite.js" "$NEW" >/dev/null 2>&1 ) &
cpid=$!; n=0
while [ ! -f "$OUT/done.fix" ] && [ $n -lt 12000 ]; do
  if [ -f "$OUT/shoot.req" ]; then
    name="$(cat "$OUT/shoot.req")"
    [ -n "${geo:-}" ] && [ "$name" != "before" ] || geo="$(DISPLAY=$DISP xwininfo -root -tree 2>/dev/null | grep -E 'Visual Studio Code' | grep -oE '[0-9]+x[0-9]+\+[0-9]+\+[0-9]+' | sort -t x -k1 -n | tail -1)"   # the window does not move: found once, at the first still
    DISPLAY=$DISP import -window root -crop "$geo" +repage "$OUT/stills/$name.png"
    echo "§FILM_STILL name=$name geometry=$geo bytes=$(stat -c %s "$OUT/stills/$name.png" 2>/dev/null)" >> "$OUT/shots.log"; rm -f "$OUT/shoot.req"
  fi
  sleep 0.02; n=$((n+1))
done
wait $cpid 2>/dev/null; kill $XPID 2>/dev/null; rm -rf "$prof"
git -C "$NEW" checkout -- . 2>/dev/null; echo "§FILM_TREE_AFTER clean=$([ -z "$(git -C "$NEW" status --porcelain -uno)" ] && echo Y || echo N)" >> "$OUT/shots.log"
echo "§FILM_SHOOT stills=$(ls "$OUT/stills" | wc -l) errors=$(grep -c FILM_ERROR "$OUT/shots.log")" | tee -a "$OUT/shots.log"
