#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — SCOPE: film "CH 0 · Immersive Software: the ERP field" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 2). Takes the VS Code stills: the REAL VS Code on a private virtual display (Xvfb, --disable-gpu, a temp profile)
# on the NEW tree, opened at each link the overlay's V key made in the real page (facts.json). Run facts.js first. Read out/shots.log after every run.
# Usage: shoot.sh <bim-ootb NEW tree>
set -u
NEW="$(cd "$1" && pwd)"; HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; OUT="$HERE/${OUTD:-out}"   # OUTD=out_zh for the Mandarin build
[ -s "$OUT/facts.json" ] || { echo "§FILM_SHOOT REFUSED: run facts.js first"; exit 2; }
rm -rf "$OUT/stills" "$OUT/shots.log" "$OUT"/done.* "$OUT"/*.req "$OUT/profile_v"; mkdir -p "$OUT/stills"
BIN="${VSCODE_BIN:-/snap/code/current/usr/share/code/code}"; DISP=":96"
Xvfb $DISP -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 & XPID=$!; sleep 2
echo "§FILM_TREE new=$(git -C "$NEW" rev-parse --short HEAD)" >> "$OUT/shots.log"
prof="$OUT/profile_v"; mkdir -p "$prof/user/User"
cat > "$prof/user/User/settings.json" <<JSON
{ "telemetry.telemetryLevel": "off", "update.mode": "none", "extensions.autoUpdate": false, "security.workspace.trust.enabled": false, "workbench.startupEditor": "none", "git.enabled": false,
  "window.zoomLevel": 1.8, "editor.minimap.enabled": false, "workbench.activityBar.location": "hidden", "editor.fontSize": 15, "workbench.tips.enabled": false, "window.commandCenter": false,
  "workbench.layoutControl.enabled": false, "chat.commandCenter.enabled": false, "chat.disableAIFeatures": true, "window.titleBarStyle": "native", "window.menuBarVisibility": "hidden",
  "breadcrumbs.enabled": false, "editor.stickyScroll.enabled": false, "editor.inlayHints.enabled": "off", "workbench.editor.showTabs": "single", "editor.codeLens": false, "editor.wordWrap": "off" }
JSON
( env -u ELECTRON_RUN_AS_NODE DISPLAY=$DISP FILM_OUT="$OUT" nice -n 19 timeout 600 "$BIN" --no-sandbox --disable-gpu --disable-workspace-trust --skip-welcome --skip-release-notes \
    --user-data-dir="$prof/user" --extensions-dir="$prof/ext" --extensionDevelopmentPath="$NEW/devtools/vscode/x0-navigator" --extensionTestsPath="$HERE/shots_suite.js" "$NEW" >/dev/null 2>&1 ) &
cpid=$!; n=0
while [ ! -f "$OUT/done.fix" ] && [ $n -lt 6000 ]; do
  if [ -f "$OUT/shoot.req" ]; then
    name="$(cat "$OUT/shoot.req")"
    geo="$(DISPLAY=$DISP xwininfo -root -tree 2>/dev/null | grep -E 'Visual Studio Code' | grep -oE '[0-9]+x[0-9]+\+[0-9]+\+[0-9]+' | sort -t x -k1 -n | tail -1)"
    DISPLAY=$DISP import -window root -crop "$geo" +repage "$OUT/stills/$name.png"
    echo "§FILM_STILL name=$name geometry=$geo bytes=$(stat -c %s "$OUT/stills/$name.png" 2>/dev/null)" >> "$OUT/shots.log"; rm -f "$OUT/shoot.req"
  fi
  sleep 0.1; n=$((n+1))
done
wait $cpid 2>/dev/null; kill $XPID 2>/dev/null; rm -rf "$prof"
echo "§FILM_SHOOT stills=$(ls "$OUT/stills" | wc -l) errors=$(grep -c FILM_ERROR "$OUT/shots.log")" | tee -a "$OUT/shots.log"
