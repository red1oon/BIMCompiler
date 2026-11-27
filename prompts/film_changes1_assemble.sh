#!/bin/bash
# usage: film_changes1_assemble.sh <tsv> <out.mp4>   RAW cut of the "new changes" film: the recorded take + English narration + subtitles, NO title card (cards are added in post).
# work dir ~/Videos/changes_work: rec1/erp_film_changes1.mp4 + rec1/erp_film.log from scripts/film_erp_changes1.js. READ the printed POLY_TONE / DETAIL counts and the silence list.
set -e
TSV=$1; OUT=$2; W=~/Videos/changes_work; cd $W
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 rec1/erp_film_changes1.mp4)
cp rec1/erp_film_changes1.mp4 silent1_en.mp4
grep -E "§ERP_FILM_BEAT" rec1/erp_film.log > beats1_en.log
rm -rf fit1_en; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats1_en.log fit1_en $VD > fit1_en.log 2>&1; grep -q "lang=en wrong=0 rc=0" fit1_en.log && break; sleep 3; done
grep -E "POLY_TONE" fit1_en.log; echo DETAIL=$(grep -c "pick=DETAIL" fit1_en.log) of $(grep -c POLY_FIT fit1_en.log) SHORT=$(grep -c "pick=SHORT" fit1_en.log)
cd fit1_en; rm -f $OUT; FILM_SEC=$VD python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent1_en.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent1_en.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
