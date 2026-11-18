#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — SCOPE: film 4 v4 "CH 0 · From an empty folder to a witnessed dev setup" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 4). Takes the VS Code stills the typed lines lead to: the REAL VS Code on a private virtual display (Xvfb :96,
# 1920x1080), opened on the DOWNLOAD that facts.js made with EXACTLY the arguments `node scripts/setup.js --open` printed in its §SETUP_NEXT line (setup's own extensions + user-data folders under <download>/.setup/, Code Facts installed there
# by setup.js): the owner's VS Code profile is not touched. shots_suite.js (the extension-host driver) performs each row of out/facts.json `vsc`. Run facts.js first. Read out/shots.log after every run.
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; OUT="$HERE/out"; CACHE="$HOME/.cache/film_dev_setup4"; WORK="$CACHE/dl/bim-ootb-main"
[ -s "$OUT/facts.json" ] && [ -d "$WORK/.setup/vscode-ext" ] || { echo "§FILM_SHOOT REFUSED: run facts.js first"; exit 2; }
# the arguments must be the ones setup.js printed (§SETUP_NEXT), else this is not the editor `--open` launches
NEXT="$(node -e "const F=require('$OUT/facts.json');console.log(JSON.parse(F.setup.next))")"
EXPECT="code \"--extensions-dir\" \"$WORK/.setup/vscode-ext\" \"--user-data-dir\" \"$WORK/.setup/vscode-user\" \"$WORK\""
[ "$NEXT" = "$EXPECT" ] || { echo "§FILM_SHOOT REFUSED: §SETUP_NEXT args differ: $NEXT"; exit 2; }

hashtree() { node -e "
const fs=require('fs'),path=require('path'),crypto=require('crypto');const W=process.argv[1];const h=crypto.createHash('sha1');let n=0;
(function w(p){for(const f of fs.readdirSync(path.join(W,p)).sort()){if(!p&&(f==='node_modules'||f==='.setup'))continue;const r=p?p+'/'+f:f,st=fs.lstatSync(path.join(W,r));if(st.isDirectory())w(r);else{n++;h.update(r+':'+st.size+':'+(st.size<5e6?crypto.createHash('sha1').update(fs.readFileSync(path.join(W,r))).digest('hex'):'')+';');}}})('');
console.log('§FILM_WS_HASH $1 '+h.digest('hex')+' files='+n);" "$WORK" >> "$OUT/shots.log"; }
rm -rf "$OUT/shots.log" "$OUT"/done.* "$OUT"/*.req; mkdir -p "$OUT/stills"; rm -f "$OUT"/stills/h_*.png "$OUT"/stills/b*_*.png "$OUT"/stills/s_[!o]*.png
BIN="${VSCODE_BIN:-/snap/code/current/usr/share/code/code}"; DISP=":96"
Xvfb $DISP -screen 0 1920x1080x24 -nolisten tcp >/dev/null 2>&1 & XPID=$!; sleep 2
hashtree before
# the editor's window state in the throwaway profile (presentation only): fill the 1920x1080 display, as facts.js seeded it before `--open`
node -e "const fs=require('fs'),p=process.argv[1]+'/.setup/vscode-user/User/globalStorage';fs.mkdirSync(p,{recursive:true});fs.writeFileSync(p+'/storage.json',JSON.stringify({windowsState:{lastActiveWindow:{folder:'file://'+process.argv[1],uiState:{mode:1,x:0,y:0,width:1920,height:1080}},openedWindows:[]}}));" "$WORK"
echo "§FILM_TREE work=$WORK commit=$(node -e "console.log(require('$OUT/facts.json').fetch.commit.slice(0,8))") setup_next_args_match=Y" >> "$OUT/shots.log"
( env -u ELECTRON_RUN_AS_NODE DISPLAY=$DISP FILM_OUT="$OUT" FILM_WORK="$WORK" CUDA_VISIBLE_DEVICES="" nice -n 19 ionice -c3 timeout 900 "$BIN" --no-sandbox --disable-gpu --disable-workspace-trust --skip-welcome --skip-release-notes \
    --extensions-dir="$WORK/.setup/vscode-ext" --user-data-dir="$WORK/.setup/vscode-user" --extensionDevelopmentPath="$HERE/dummy_ext" --extensionTestsPath="$HERE/shots_suite.js" "$WORK" >/dev/null 2>&1 ) &
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
wait $cpid 2>/dev/null; kill $XPID 2>/dev/null; pkill -9 -f -- "$WORK/.setup/vscode-user" 2>/dev/null
# the driver undid its edits: the download must hash exactly as it did before the driver ran
hashtree after
echo "§FILM_SHOOT stills=$(ls "$OUT/stills" | wc -l) errors=$(grep -c FILM_ERROR "$OUT/shots.log")" | tee -a "$OUT/shots.log"
