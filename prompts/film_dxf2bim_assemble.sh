#!/bin/bash
# ⚠ DO NOT REMOVE — DXF2BIM English film: the recorded take + English narration (Kokoro, two voices) + burned subtitles + ducked music bed.
# usage: film_dxf2bim_assemble.sh <rec dir with film.mp4 + film.log> <tsv> <out.mp4>. READ the printed POLY_TONE / DETAIL counts and every witness line.
set -e
REC=$(readlink -f $1); TSV=$(readlink -f $2); OUT=$3; P=~/bim-compiler/prompts; W=$(dirname $REC); cd $W
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $REC/film.mp4)
cp $REC/film.mp4 silent_master.mp4
grep -E "§ERP_FILM_BEAT" $REC/film.log > beats.log
rm -rf fit; for i in 1 2 3; do POLY_CREDIT='Voices: AI-generated (Kokoro, local)  ·  Script directed by red1' python3 $P/film_narration_poly.py $TSV beats.log fit $VD > fit.log 2>&1; grep -q "lang=en wrong=0 rc=0" fit.log && break; sleep 2; done
grep -E "POLY_TONE" fit.log; echo DETAIL=$(grep -c "pick=DETAIL" fit.log) of $(grep -c POLY_FIT fit.log) SHORT=$(grep -c "pick=SHORT" fit.log) SKIP=$(grep -c "pick=SKIP" fit.log)
grep -E "§NARR_FIT" fit/fit_en.log | grep -v -- "-> DETAIL" || true
# subtitles sit on a translucent box (they cross white drawing sheets in chapter 2): BorderStyle 3, box = OutlineColour
sed -i -E '/^Style: (F|M)_/{s/,&H90000000,&H00000000,0,0,0,0,100,100,0,0,1,2\.6,0,2,/,\&H50101418,\&H00000000,0,0,0,0,100,100,0,0,3,10,0,2,/}' fit/poly.ass; grep -c "0,0,3,10,0,2," fit/poly.ass
python3 $P/film_music_bed.py music_bed.wav $VD | tail -1
cd fit; rm -f $OUT; MUSIC_WAV=$W/music_bed.wav MUSIC_STEM=$W/music_stem.wav FILM_SEC=$VD python3 $P/film_narration_mux.py poly ../silent_master.mp4 $OUT | cut -c1-120; cd ..
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 -select_streams v $OUT) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 -select_streams v silent_master.mp4) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
echo "silences (-40 dB, >= 2 s):"; ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
echo "black frames:"; ffmpeg -hide_banner -i $OUT -vf blackdetect=d=0.04:pix_th=0.10 -an -f null - 2>&1 | grep -c "black_start" || true
echo "hard screen changes (scene > 0.12):"; ffmpeg -hide_banner -i silent_master.mp4 -vf "select='gt(scene,0.12)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | cut -d: -f2 > scene_changes.txt; python3 -c "
t=[float(x) for x in open('scene_changes.txt')]; g=[(round(b-a,2),round(a,2),round(b,2)) for a,b in zip(t,t[1:]) if b-a<1.5]; print('n=',len(t),'closer than 1.5 s:',g)"
