#!/bin/bash
# usage: film_habits_assemble.sh <take dir> <tsv> <out.mp4>   "Same habits, no server": the recorded take + English narration + subtitles, NO title card.
# work dir ~/Videos/habits_work: <take>/erp_film_habits.mp4 + <take>/erp_film.log from scripts/film_erp_habits.js. READ the printed POLY_TONE / DETAIL counts and the silence list.
set -e
TAKE=$1; TSV=$2; OUT=$3; W=~/Videos/habits_work; cd $W
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $TAKE/erp_film_habits.mp4)
cp $TAKE/erp_film_habits.mp4 silent_en.mp4
grep -E "§ERP_FILM_BEAT" $TAKE/erp_film.log > beats_en.log
rm -rf fit_en; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats_en.log fit_en $VD > fit_en.log 2>&1; grep -q "lang=en wrong=0 rc=0" fit_en.log && break; sleep 3; done
grep -E "POLY_TONE" fit_en.log; echo DETAIL=$(grep -c "pick=DETAIL" fit_en.log) of $(grep -c POLY_FIT fit_en.log) SHORT=$(grep -c "pick=SHORT" fit_en.log)
cd fit_en; rm -f $OUT; FILM_SEC=$VD python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent_en.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent_en.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
