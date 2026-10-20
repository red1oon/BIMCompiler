#!/bin/bash
# assemble.sh <EN|TH> : single long film = intro card + film 1 + part 2 card + film 2 + comparison card + closing card (whole narrated segments, ffmpeg concat; no re-encode when parameters match)
L=$1; l=$(echo $L | tr A-Z a-z); V=~/Videos/NinjaExcelReport_film; D=$V/series_$l
[ "$L" = EN ] && F1=$V/NinjaExcelReport_EN_narrated.mp4 || F1=$V/NinjaExcelReport_TH_narrated.mp4
LIST=$V/full_$l.txt; : > $LIST
for f in $D/card_intro_$L.mp4 $F1 $D/card_part2_$L.mp4 $D/film2_$L.mp4 $D/card_compare_$L.mp4 $D/card_closing_$L.mp4; do echo "file '$f'" >> $LIST; done
OUT=$V/NinjaExcelReport_FULL_$L.mp4; rm -f $OUT
ffmpeg -v error -y -f concat -safe 0 -i $LIST -c copy $OUT && echo "assembled $OUT"
sum=0; for f in $(sed "s/file '\(.*\)'/\1/" $LIST); do n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $f); sum=$((sum+n)); done
out=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $OUT)
echo "§FULL_$L frames sum=$sum out=$out $( [ $sum = $out ] && echo OK || echo MISMATCH) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)"
echo "§FULL_$L gaps>=4s:"; ffmpeg -v info -i $OUT -af silencedetect=n=-40dB:d=4 -f null - 2>&1 | grep -E "silence_end" | sed 's/.*silence_end: //' | tr '\n' ';'; echo
echo "§FULL_$L LUFS: $(ffmpeg -v info -i $OUT -af ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | tr -s ' ')"
