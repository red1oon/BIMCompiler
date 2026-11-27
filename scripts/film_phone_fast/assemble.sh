#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — Scope: assemble FILM-M1 "the phone, fast" from the recorded parts (MOBILE_PERF.md §FILM-M1 RECORDING SPEC R5).
# Read <work>/assemble.log after every run: §ASSEMBLE planned == counted frames, and every §M1_BEAT used is ok=true.
# Run: [FRAME=phone|trailer] assemble.sh <work> <out.mp4> [narration.wav]   (work holds A/ B/ C/ HQ/ S/ from record_phone.js; CPU only)
# FRAME=phone (default, rc2): real phone body, no opener scene. FRAME=trailer: the rc1 device (needs the trailer scripts' opener).
set -euo pipefail
D=$(cd "$(dirname "$0")" && pwd); T=$D/../film_citaglobal_trailer; W=$(cd "$1" && pwd); OUT=$2; NARR=${3:-}
FRAME=${FRAME:-phone}
cd "$W"
if [ "$FRAME" = trailer ]; then
  L=$(ls A/f/*.png | tail -1)
  printf '{"phone":"%s","phoneOut":"%s","phoneB":"%s","phoneBOut":"%s","hq":"%s","hqOut":"%s"}' \
    "$W/A/f/0000.png" "$W/$L" "$W/$(ls B/f/*.png | tail -1)" "$W/$(ls B/f/*.png | tail -1)" "$W/HQ/f/0000.png" "$W/HQ/f/0000.png" > stills.json
  rm -rf opener; FILM_ID=m1 node "$T/render_opener.js" "$W/opener" "$W/stills.json" > opener.run.out 2>&1; grep -E "FILM|FRAMES|ERRORS|BOX phone " opener/render_opener.log
fi
node "$D/render_stage.js" "$W" frame=$FRAME > stage.run.out 2>&1; cat stage/render_stage.log
ffmpeg -v error -y -framerate 30 -i stage/%05d.png -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 silent.mp4
if [ -n "$NARR" ]; then ffmpeg -v error -y -i silent.mp4 -i "$NARR" -map 0:v -map 1:a -c:v copy -af apad -c:a aac -b:a 160k -shortest "$OUT"; else cp silent.mp4 "$OUT"; fi
PL=$(ls stage/*.png | wc -l); GOT=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -select_streams v -of csv=p=0 "$OUT")
# beats_not_ok = beats USED by the film (stage/used_beats.json, frame=phone) whose recording logged ok=false; frame=trailer: every A/B/HQ beat as in rc1.
# beats_not_ok_any = every ok=false line in every recording log present (A B C HQ S) — dropped beats show up here, never in the film.
if [ "$FRAME" = trailer ]; then NOTOK=$(cat A/record.log B/record.log HQ/record.log | grep -c "§M1_BEAT .* ok=false" || true)
else NOTOK=$(python3 - <<'PY'
import json,os
used=json.load(open('stage/used_beats.json')); bad=0
for u in used:
    lg=('S/record.log' if u['src']=='S' else u['src']+'/record.log')
    t=open(lg).read() if os.path.exists(lg) else ''
    if ('§M1_BEAT id=%s ok=true'%u['beat']) not in t: bad+=1
print(bad)
PY
); fi
ANY=$(cat $(ls A/record.log B/record.log C/record.log HQ/record.log S/record.log 2>/dev/null) | grep -c "§M1_BEAT .* ok=false" || true)
echo "§ASSEMBLE out=$OUT planned=$PL counted=$GOT seconds=$(python3 -c "print(round($GOT/30,2))") beats_not_ok=$NOTOK beats_not_ok_any=$ANY (a not-ok beat is dropped, never shown) $([ "$PL" = "$GOT" ] && echo OK || echo MISMATCH)" | tee assemble.log
