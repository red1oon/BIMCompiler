#!/bin/bash
# usage: film_costing_assemble.sh <take dir> <tsv> <out.mp4>   "ERP Why iDempiere": title card (~/Videos/why_work/card_why_zh.png, made by film_nc_title_card.py) + the recorded take + English narration + subtitles.
# work dir ~/Videos/why_work: <take>/erp_film_why.mp4 + <take>/erp_film.log from scripts/film_erp_costing.js. The TSV's r0 row is spoken over the card (card = speech + 1.6 s). READ the printed POLY_TONE / DETAIL counts and the silence list.
set -e
TAKE=$1; TSV=$2; OUT=$3; W=~/Videos/why_work; cd $W
rm -rf meas_wz; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV measure meas_wz 900 > meas_wz.log 2>&1; grep -q "lang=zh wrong=0 rc=0" meas_wz.log && break; sleep 3; done
D0=$(grep "POLY_DUR id=r0" meas_wz.log | sed 's/.*dur=//'); CD=$(python3 -c "print(round($D0+1.6,2))"); VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $TAKE/erp_film_why.mp4); TOT=$(python3 -c "print(round($VD+$CD,3))")
echo "r0 speech=$D0 card=$CD video=$VD total=$TOT"
ffmpeg -v error -y -loop 1 -t $CD -i $W/card_why_zh.png -i $TAKE/erp_film_why.mp4 -filter_complex "[0:v]fps=24,scale=1920:1080,format=yuv420p[a];[1:v]fps=24,scale=1920:1080,format=yuv420p[b];[a][b]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 17 -preset medium silent_wz.mp4
python3 - <<PY
import re
CD=$CD; out=[]
for l in open('$TAKE/erp_film.log').read().split('\n'):
    m=re.match(r'(§ERP_FILM_BEAT id=\S+ t=)([\d.]+)(.*)',l)
    if m: out.append(m.group(1)+('%.2f'%(float(m.group(2))+CD))+m.group(3))
out.insert(0,'§ERP_FILM_BEAT id=r0 t=0.30 lang=zh title card')
open('beats_wz.log','w').write('\n'.join(out)+'\n')
PY
rm -rf fit_wz; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats_wz.log fit_wz $TOT > fit_wz.log 2>&1; grep -q "lang=zh wrong=0 rc=0" fit_wz.log && break; sleep 3; done
grep -E "POLY_TONE" fit_wz.log; echo DETAIL=$(grep -c "pick=DETAIL" fit_wz.log) of $(grep -c POLY_FIT fit_wz.log) SHORT=$(grep -c "pick=SHORT" fit_wz.log)
cd fit_wz; rm -f $OUT; FILM_SEC=$TOT python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent_wz.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent_wz.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
