#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — SCOPE: film 3 (prompts/FILM_IDE_ERP_DEBUG.md). Takes the VS Code stills. The REAL VS Code on a private virtual display (Xvfb, --disable-gpu, temp profile) on the OLD tree. Before it opens, the witness is run
# for real on that tree and its log is stamped (before.log); while it is open, the suite types the fix, then asks this script to run the witness again (after.log). Read out/shots.log after every run.
# Usage: shoot.sh <bim-ootb at the OLD commit (the fix is typed into it, then restored)> <bim-ootb at the NEW commit (read only)> <bim-compiler root>
set -u
OLD="$(cd "$1" && pwd)"; NEW="$(cd "$2" && pwd)"; COMP="$(cd "$3" && pwd)"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; OUT="$HERE/out"
STEPS="${FILM_STEPS:-all}"   # all | a comma list (f = the F12 stills only): a partial run keeps the other stills and the log
if [ "$STEPS" = all ]; then rm -rf "$OUT/stills" "$OUT/shots.log"; fi; rm -rf "$OUT"/done.* "$OUT"/*.req "$OUT/profile_fix"; mkdir -p "$OUT/stills"; rm -rf "$OLD/logs"
BIN="${VSCODE_BIN:-/snap/code/current/usr/share/code/code}"; DISP=":97"
git -C "$OLD" status --short | grep -q . && { echo "§FILM_SHOOT REFUSED: the OLD tree is not clean"; exit 2; }
Xvfb $DISP -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 & XPID=$!; sleep 2
PLAN="$(node "$HERE/plan.js" "$OLD" "$NEW")" || { echo "§FILM_PLAN FAIL"; kill $XPID; exit 1; }
echo "§FILM_PLAN commits old=$(git -C "$OLD" rev-parse --short HEAD) new=$(git -C "$NEW" rev-parse --short HEAD) $PLAN" >> "$OUT/shots.log"
CMD='node erp/tests/witness_replay_clock.js'
reallog() {  # $1 = before|after : a stamped log of a real run of the witness on the OLD tree as it is now
  mkdir -p "$OLD/logs"; local st run; st="$(cd "$OLD" && node scripts/log_stamp.js "$CMD")"; run="$(cd "$OLD" && $CMD < /dev/null 2>&1)"
  printf '%s\n%s\n' "$st" "$run" > "$OLD/logs/witness_replay_clock.log"; cp "$OLD/logs/witness_replay_clock.log" "$OUT/$1.log"
  echo "§FILM_REAL_LOG $1 $(grep -E 'REPLAY_CLOCK_SESSION_DAY|§WITNESS_REPLAY_CLOCK' "$OUT/$1.log" | sed 's/ (information.*//' | tr '\n' '|')" >> "$OUT/shots.log"
}
if [ "$STEPS" = all ]; then reallog before; fi
prof="$OUT/profile_fix"; mkdir -p "$prof/user/User"
cat > "$prof/user/User/settings.json" <<JSON
{ "bimDevtools.compilerRoot": "$COMP", "bimDevtools.extraLogDirs": [], "telemetry.telemetryLevel": "off", "update.mode": "none", "extensions.autoUpdate": false,
  "security.workspace.trust.enabled": false, "workbench.startupEditor": "none", "git.enabled": false, "window.zoomLevel": 1.8,
  "editor.minimap.enabled": false, "workbench.activityBar.location": "hidden", "editor.fontSize": 15, "workbench.tips.enabled": false,
  "window.commandCenter": false, "workbench.layoutControl.enabled": false, "chat.commandCenter.enabled": false, "chat.disableAIFeatures": true,
  "window.titleBarStyle": "native", "window.menuBarVisibility": "hidden", "breadcrumbs.enabled": false, "editor.stickyScroll.enabled": false,
  "editor.inlayHints.enabled": "off", "editor.hover.delay": 100, "terminal.integrated.gpuAcceleration": "off", "workbench.editor.showTabs": "single",
  "editor.autoClosingBrackets": "never", "editor.autoClosingQuotes": "never", "editor.autoClosingOvertype": "never", "editor.autoSurround": "never", "editor.quickSuggestions": false,
  "editor.suggestOnTriggerCharacters": false, "editor.acceptSuggestionOnEnter": "off", "editor.parameterHints.enabled": false, "editor.wordBasedSuggestions": "off", "editor.formatOnType": false, "editor.codeLens": true, "editor.wordWrap": "off" }
JSON
( env -u ELECTRON_RUN_AS_NODE DISPLAY=$DISP FILM_OUT="$OUT" FILM_PLAN="$PLAN" FILM_STEPS="$STEPS" timeout 1500 "$BIN" --no-sandbox --disable-gpu \
    --disable-workspace-trust --skip-welcome --skip-release-notes --user-data-dir="$prof/user" --extensions-dir="$prof/ext" \
    --extensionDevelopmentPath="$OLD/devtools/vscode/x0-navigator" --extensionTestsPath="$HERE/shots_suite.js" "$OLD" >/dev/null 2>&1 ) &
cpid=$!; n=0
while [ ! -f "$OUT/done.fix" ] && [ $n -lt 15000 ]; do
  if [ -f "$OUT/shoot.req" ]; then
    name="$(cat "$OUT/shoot.req")"
    geo="$(DISPLAY=$DISP xwininfo -root -tree 2>/dev/null | grep -E 'Visual Studio Code' | grep -oE '[0-9]+x[0-9]+\+[0-9]+\+[0-9]+' | sort -t x -k1 -n | tail -1)"
    DISPLAY=$DISP import -window root -crop "$geo" +repage "$OUT/stills/$name.png"
    echo "§FILM_STILL name=$name geometry=$geo bytes=$(stat -c %s "$OUT/stills/$name.png" 2>/dev/null)" >> "$OUT/shots.log"; rm -f "$OUT/shoot.req"
  fi
  if [ -f "$OUT/run_after.req" ]; then reallog after; rm -f "$OUT/run_after.req"; fi
  sleep 0.1; n=$((n+1))
done
wait $cpid 2>/dev/null; kill $XPID 2>/dev/null
git -C "$OLD" status --short | sed 's/^/§FILM_WS_CHANGED /' >> "$OUT/shots.log"
git -C "$OLD" diff --stat | tail -1 | sed 's/^/§FILM_DIFF /' >> "$OUT/shots.log"
git -C "$OLD" diff > "$OUT/typed_fix.diff"; git -C "$OLD" checkout -q -- . 2>/dev/null; rm -rf "$OLD/logs" "$prof"
echo "§FILM_SHOOT stills=$(ls "$OUT/stills" | wc -l) errors=$(grep -c FILM_ERROR "$OUT/shots.log")" | tee -a "$OUT/shots.log"
