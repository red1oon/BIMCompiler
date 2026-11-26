#!/usr/bin/env bash
# ⚠ DO NOT REMOVE — Scope: assemble the CitaGlobal trailer (silent) from the rendered parts. Spec: CitaGlobal_Pitch_Report.md §13.
# Read assemble.log after every run: §ASSEMBLE planned == counted frames.
# Run: assemble.sh <workDir> <out.mp4>   (workDir holds p1/ clash cam, p2/, hq/hq_part.mp4, hq_first.png, hq_last.png)
set -euo pipefail
D=$(cd "$(dirname "$0")" && pwd); C=$1; OUT=$2; cd "$C"
node "$D/render_phone1.js" p1/out p1/clash p1/cam > p1/run.out 2>&1; cat p1/out/render_phone1.log
N1=$(ls p1/out/*.png | wc -l); N2=$(ls p2/*.png | wc -l); NH=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 hq/hq_part.mp4)
printf '{"phone":"%s","phoneOut":"%s","phoneB":"%s","phoneBOut":"%s","hq":"%s","hqOut":"%s"}' \
  "$C/p1/out/0000.png" "$C/p1/out/$(printf %04d $((N1-1))).png" "$C/p2/0001.png" "$C/p2/$(printf %04d $N2).png" "$C/hq_first.png" "$C/hq_last.png" > stills.json
rm -rf opener; node "$D/render_opener.js" "$C/opener" "$C/stills.json" > render_run.out 2>&1; grep -E "FRAMES|ERRORS" opener/render_opener.log
for p in intro swap send outro; do ffmpeg -v error -y -framerate 30 -i opener/$p/%04d.png -c:v libx264 -crf 18 -pix_fmt yuv420p -r 30 $p.mp4; done
read X Y WD HT < <(python3 -c "import json;b=json.load(open('opener/boxes.json'))['phone'];print(b['x'],b['y'],b['w'],b['h'])")
LI=$(ls opener/intro | tail -1); LS=$(ls opener/swap | tail -1)
ffmpeg -v error -y -loop 1 -framerate 30 -i opener/intro/$LI -framerate 30 -i p1/out/%04d.png -filter_complex "[0:v][1:v]overlay=$X:$Y:shortest=1,format=yuv420p" -frames:v $N1 -r 30 -c:v libx264 -crf 18 phoneA_seg.mp4
ffmpeg -v error -y -loop 1 -framerate 30 -i opener/swap/$LS -framerate 30 -start_number 1 -i p2/%04d.png -filter_complex "[0:v][1:v]overlay=$X:$Y:shortest=1,format=yuv420p" -frames:v $N2 -r 30 -c:v libx264 -crf 18 phoneB_seg.mp4
cp hq/hq_part.mp4 hq_seg.mp4
printf "file '%s'\n" intro.mp4 phoneA_seg.mp4 swap.mp4 phoneB_seg.mp4 send.mp4 hq_seg.mp4 outro.mp4 > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -c copy "$OUT"
PL=$(( $(ls opener/intro|grep -c png) + N1 + $(ls opener/swap|grep -c png) + N2 + $(ls opener/send|grep -c png) + NH + $(ls opener/outro|grep -c png) ))
GOT=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$OUT")
echo "§ASSEMBLE out=$OUT planned=$PL counted=$GOT seconds=$(python3 -c "print(round($GOT/30,2))") $([ "$PL" = "$GOT" ] && echo OK || echo MISMATCH)" | tee assemble.log
