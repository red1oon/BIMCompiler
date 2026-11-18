#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — SCOPE: film 4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4). Takes the VS Code stills: the REAL VS Code on a private virtual display (Xvfb, --disable-gpu)
# opened on WORK (the copy of the download that facts.js made), with X0 Navigator INSTALLED from the .vsix into the throwaway extensions folder (../ext) and a throwaway user-data folder (../user): the owner's VS Code profile is not touched.
# shots_suite.js performs each row of out/facts.json `vsc`. Run facts.js first. Read out/shots.log after every run.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; OUT="$HERE/out"; CACHE="$HOME/.cache/film_dev_setup"; WORK="$CACHE/work"; EXT="$CACHE/ext"; USR="$CACHE/user"
[ -s "$OUT/facts.json" ] && [ -d "$WORK" ] && [ -d "$EXT" ] || { echo "§FILM_SHOOT REFUSED: run facts.js first"; exit 2; }
rm -rf "$OUT/stills" "$OUT/shots.log" "$OUT"/done.* "$OUT"/*.req; mkdir -p "$OUT/stills" "$USR/User"
BIN="${VSCODE_BIN:-/snap/code/current/usr/share/code/code}"; DISP=":96"
Xvfb $DISP -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 & XPID=$!; sleep 2
echo "§FILM_TREE work=$WORK base_commit=$(cat "$CACHE/base_commit.txt" | cut -c1-8)" >> "$OUT/shots.log"
cat > "$USR/User/settings.json" <<JSON
{ "telemetry.telemetryLevel": "off", "update.mode": "none", "extensions.autoUpdate": false, "security.workspace.trust.enabled": false, "workbench.startupEditor": "none", "git.enabled": false,
  "window.zoomLevel": 1.8, "editor.minimap.enabled": false, "workbench.activityBar.location": "hidden", "editor.fontSize": 15, "workbench.tips.enabled": false, "window.commandCenter": false,
  "workbench.layoutControl.enabled": false, "chat.commandCenter.enabled": false, "chat.disableAIFeatures": true, "window.titleBarStyle": "native", "window.menuBarVisibility": "hidden",
  "breadcrumbs.enabled": false, "editor.stickyScroll.enabled": false, "editor.inlayHints.enabled": "off", "workbench.editor.showTabs": "single", "editor.codeLens": false, "editor.wordWrap": "off", "editor.hover.delay": 100,
  "terminal.integrated.gpuAcceleration": "off", "typescript.disableAutomaticTypeAcquisition": true, "files.autoSave": "off" }
JSON
( env -u ELECTRON_RUN_AS_NODE DISPLAY=$DISP FILM_OUT="$OUT" FILM_WORK="$WORK" CUDA_VISIBLE_DEVICES="" nice -n 19 ionice -c3 timeout 900 "$BIN" --no-sandbox --disable-gpu --disable-workspace-trust --skip-welcome --skip-release-notes \
    --user-data-dir="$USR" --extensions-dir="$EXT" --extensionDevelopmentPath="$HERE/dummy_ext" --extensionTestsPath="$HERE/shots_suite.js" "$WORK" >/dev/null 2>&1 ) &
cpid=$!; n=0
while [ ! -f "$OUT/done.fix" ] && [ $n -lt 9000 ]; do
  if [ -f "$OUT/shoot.req" ]; then
    name="$(cat "$OUT/shoot.req")"
    geo="$(DISPLAY=$DISP xwininfo -root -tree 2>/dev/null | grep -E 'Visual Studio Code' | grep -oE '[0-9]+x[0-9]+\+[0-9]+\+[0-9]+' | sort -t x -k1 -n | tail -1)"
    DISPLAY=$DISP import -window root -crop "$geo" +repage "$OUT/stills/$name.png"
    echo "§FILM_STILL name=$name geometry=$geo bytes=$(stat -c %s "$OUT/stills/$name.png" 2>/dev/null)" >> "$OUT/shots.log"; rm -f "$OUT/shoot.req"
  fi
  sleep 0.1; n=$((n+1))
done
wait $cpid 2>/dev/null; kill $XPID 2>/dev/null
git -C "$WORK" diff --name-only | sed 's/^/§FILM_WS_CHANGED /' >> "$OUT/shots.log"; git -C "$WORK" checkout -q -- . 2>/dev/null
echo "§FILM_SHOOT stills=$(ls "$OUT/stills" | wc -l) errors=$(grep -c FILM_ERROR "$OUT/shots.log")" | tee -a "$OUT/shots.log"
