#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — SCOPE: the film "Editing Real Code 2" (prompts/CODE_ARCHITECTURE_DESIGN.md §F.18). Takes the stills.
# Runs the REAL VS Code twice on a private virtual display (Xvfb, --disable-gpu, temp profile): OLD = the tree and the add-on
# as they were before bim-ootb #2974, NEW = today's. shots_suite.js drives the editor. Read out/shots.log after every run.
# Usage: shoot.sh <bim-ootb worktree at the OLD commit> <bim-ootb worktree at the NEW commit (one file in it gets edited)> <bim-compiler root>
set -u
OLD="$(cd "$1" && pwd)"; NEW="$(cd "$2" && pwd)"; COMP="$(cd "$3" && pwd)"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$HERE/out"; rm -rf "$OUT/stills" "$OUT/shots.log" "$OUT"/done.* "$OUT/shoot.req" "$OUT/appsurf"; mkdir -p "$OUT/stills"
rm -rf "$NEW/logs" "$OLD/logs"
BIN="${VSCODE_BIN:-/snap/code/current/usr/share/code/code}"
DISP=":97"
Xvfb $DISP -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 & XPID=$!
sleep 2
PLAN="$(node "$HERE/plan.js" "$OLD" "$NEW" "$OUT")" || { echo "§FILM_PLAN FAIL"; kill $XPID; exit 1; }
echo "§FILM_PLAN commits old=$(git -C "$OLD" rev-parse --short HEAD) new=$(git -C "$NEW" rev-parse --short HEAD) $PLAN" >> "$OUT/shots.log"
run() {  # $1=mode  $2=workspace
  local prof="$OUT/profile_$1"; rm -rf "$prof"; mkdir -p "$prof/user/User"
  cat > "$prof/user/User/settings.json" <<JSON
{ "bimDevtools.compilerRoot": "$COMP", "bimDevtools.extraLogDirs": [], "telemetry.telemetryLevel": "off", "update.mode": "none", "extensions.autoUpdate": false,
  "security.workspace.trust.enabled": false, "workbench.startupEditor": "none", "git.enabled": false, "window.zoomLevel": 1.8,
  "editor.minimap.enabled": false, "workbench.activityBar.location": "hidden", "editor.fontSize": 15, "workbench.tips.enabled": false,
  "window.commandCenter": false, "workbench.layoutControl.enabled": false, "chat.commandCenter.enabled": false, "chat.disableAIFeatures": true,
  "window.titleBarStyle": "native", "window.menuBarVisibility": "hidden", "breadcrumbs.enabled": false, "editor.stickyScroll.enabled": false,
  "editor.inlayHints.enabled": "off", "editor.hover.delay": 100, "terminal.integrated.gpuAcceleration": "off", "search.useIgnoreFiles": true,
  "typescript.disableAutomaticTypeAcquisition": true, "editor.wordWrap": "off", "workbench.editor.showTabs": "single", "editor.codeLens": true }
JSON
  ( env -u ELECTRON_RUN_AS_NODE DISPLAY=$DISP FILM_OUT="$OUT" FILM_MODE="$1" FILM_PLAN="$PLAN" timeout 300 "$BIN" --no-sandbox --disable-gpu \
      --disable-workspace-trust --skip-welcome --skip-release-notes --user-data-dir="$prof/user" --extensions-dir="$prof/ext" \
      --extensionDevelopmentPath="$2/devtools/vscode/x0-navigator" --extensionTestsPath="$HERE/shots_suite.js" "$2" >/dev/null 2>&1 ) &
  local cpid=$! n=0
  while [ ! -f "$OUT/done.$1" ] && [ $n -lt 3000 ]; do
    if [ -f "$OUT/shoot.req" ]; then
      name="$(cat "$OUT/shoot.req")"
      geo="$(DISPLAY=$DISP xwininfo -root -tree 2>/dev/null | grep -E 'Visual Studio Code' | grep -oE '[0-9]+x[0-9]+\+[0-9]+\+[0-9]+' | sort -t x -k1 -n | tail -1)"
      DISPLAY=$DISP import -window root -crop "$geo" +repage "$OUT/stills/$name.png"
      echo "§FILM_STILL name=$name geometry=$geo bytes=$(stat -c %s "$OUT/stills/$name.png" 2>/dev/null)" >> "$OUT/shots.log"
      rm -f "$OUT/shoot.req"
    fi
    sleep 0.1; n=$((n+1))
  done
  wait $cpid 2>/dev/null
  rm -rf "$prof"
}
run old "$OLD"
run new "$NEW"
kill $XPID 2>/dev/null
git -C "$NEW" status --short | sed 's/^/§FILM_WS_CHANGED /' >> "$OUT/shots.log"
git -C "$NEW" checkout -q -- . 2>/dev/null; rm -rf "$NEW/logs" "$OLD/logs"
# the facts server an assistant would talk to: the real server, the real protocol, no model
DEADF="$(node -e 'console.log(JSON.parse(process.argv[1]).dead.field)' "$PLAN")"; UNSF="$(node -e 'console.log(JSON.parse(process.argv[1]).unsure.field)' "$PLAN")"
node "$HERE/mcp_ask.js" "$NEW" "$COMP" "$DEADF" "$UNSF" >> "$OUT/shots.log" 2>&1
echo "§FILM_SHOOT stills=$(ls "$OUT/stills" | wc -l) errors=$(grep -c FILM_ERROR "$OUT/shots.log")" | tee -a "$OUT/shots.log"
