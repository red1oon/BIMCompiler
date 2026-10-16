#!/bin/bash
# ⚠ DO NOT REMOVE — DXF2BIM MALAY film: take (Malay cards) + Malay narration (Edge TTS ms-MY Yasmin/Osman: the script text is sent to Microsoft)
# + Malay subtitles + ducked music bed, card beats re-cued to the frame where the card is visible (film_dxf2bim_resync.py). READ every printed line.
# usage: film_dxf2bim_assemble_ms.sh <take dir> <tsv> <out.mp4>
set -e
REC=$(readlink -f $1); TSV=$(readlink -f $2); OUT=$3; P=~/bim-compiler/prompts; W=$(dirname $REC); cd $W; T=$(basename $REC)
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $REC/film.mp4)
python3 film_dxf2bim_resync.py cue $T beats_$T.log
rm -rf fit_$T; for i in 1 2 3; do POLY_CREDIT='Suara: dijana AI (Microsoft Edge TTS, awan)  ·  Skrip diarahkan oleh red1' python3 $P/film_narration_poly.py $TSV beats_$T.log fit_$T $VD > fit_$T.log 2>&1; grep -q "lang=ms wrong=0 rc=0" fit_$T.log && break; sleep 3; done
grep -E "POLY_TONE" fit_$T.log; echo DETAIL=$(grep -c "pick=DETAIL" fit_$T.log) of $(grep -c POLY_FIT fit_$T.log) SHORT=$(grep -c "pick=SHORT" fit_$T.log) SKIP=$(grep -c "pick=SKIP" fit_$T.log)
grep -E "§NARR_FIT" fit_$T/fit_ms.log | grep -v -- "-> DETAIL" || true; echo tone WRONG=$(grep -c WRONG fit_$T/fit_ms.log)
sed -i -E '/^Style: (F|M)_/{s/,&H90000000,&H00000000,0,0,0,0,100,100,0,0,1,2\.6,0,2,/,\&H50101418,\&H00000000,0,0,0,0,100,100,0,0,3,10,0,2,/}' fit_$T/poly.ass; echo boxed styles: $(grep -c "0,0,3,10,0,2," fit_$T/poly.ass)
python3 film_dxf2bim_resync.py check $T fit_$T beats_$T.log
python3 $P/film_music_bed.py music_$T.wav $VD | tail -1
cd fit_$T; rm -f $OUT; MUSIC_WAV=$W/music_$T.wav FILM_SEC=$VD python3 $P/film_narration_mux.py poly $REC/film.mp4 $OUT | cut -c1-120; grep -i "fontselect" poly_mux.log | sort -u | head -3; cd ..
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 -select_streams v $OUT) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 -select_streams v $REC/film.mp4) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
echo "silences (-40 dB, >= 2 s):"; ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -o "silence_duration: [0-9.]*"
echo "black frames: $(ffmpeg -hide_banner -i $OUT -vf blackdetect=d=0.04:pix_th=0.10 -an -f null - 2>&1 | grep -c black_start || true)"
ffmpeg -hide_banner -i $REC/film.mp4 -vf "select='gt(scene,0.12)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | cut -d: -f2 > scene_$T.txt; python3 -c "
t=[float(x) for x in open('scene_$T.txt')]; print('hard changes n=',len(t),'closer than 1.5 s:',[(round(b-a,2),round(a,2)) for a,b in zip(t,t[1:]) if b-a<1.5])"
python3 - <<PY
import subprocess
rows=[l.split('\t') for l in open('fit_$T/poly_plan.tsv') if l.strip()]
iv=sorted((float(r[1]),float(r[1])+float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','fit_$T/'+r[2].strip()],capture_output=True,text=True).stdout)) for r in rows)
print('longest gap between lines', max((round(b[0]-a[1],2),round(a[1],1)) for a,b in zip(iv,iv[1:])))
PY
