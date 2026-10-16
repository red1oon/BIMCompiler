#!/bin/bash
# usage: film_changes1_assemble.sh <tsv> <out.mp4>   "Closing the gap" chapter: the recorded take + English narration + subtitles, NO title card (cards are added in post).
# work dir ~/Videos/changes_work: gap2/erp_film_gap2.mp4 + gap2/erp_film.log from scripts/film_erp_gap2.js. READ the printed POLY_TONE / DETAIL counts and the silence list.
set -e
TSV=$1; OUT=$2; W=~/Videos/changes_work; cd $W
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 gap2/erp_film_gap2.mp4)
cp gap2/erp_film_gap2.mp4 silentg2_en.mp4
grep -E "§ERP_FILM_BEAT" gap2/erp_film.log > beatsg2_en.log
rm -rf fitg2_en; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beatsg2_en.log fitg2_en $VD > fitg2_en.log 2>&1; grep -q "lang=en wrong=0 rc=0" fitg2_en.log && break; sleep 3; done
grep -E "POLY_TONE" fitg2_en.log; echo DETAIL=$(grep -c "pick=DETAIL" fitg2_en.log) of $(grep -c POLY_FIT fitg2_en.log) SHORT=$(grep -c "pick=SHORT" fitg2_en.log)
cd fitg2_en; rm -f $OUT; FILM_SEC=$VD python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silentg2_en.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silentg2_en.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
