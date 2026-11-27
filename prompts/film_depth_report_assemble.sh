#!/bin/bash
# usage: mkreport.sh <lang> <tsv> <out.mp4>
set -e
L=$1; TSV=$2; OUT=$3; W=~/Videos/report_work; cd $W
rm -rf rm_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV measure rm_$L 900 > m_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" m_$L.log && break; sleep 3; done
D0=$(grep "POLY_DUR id=r0" m_$L.log | sed 's/.*dur=//'); CD=$(python3 -c "print(round($D0+1.6,2))"); VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 rec/erp_film_report.mp4); TOT=$(python3 -c "print(round($VD+$CD,3))")
echo "r0 speech=$D0 card=$CD video=$VD total=$TOT"
ffmpeg -v error -y -loop 1 -t $CD -i /tmp/claude-1000/probe/card_report.png -i rec/erp_film_report.mp4 -filter_complex "[0:v]fps=24,scale=1920:1080,format=yuv420p[a];[1:v]fps=24,scale=1920:1080,format=yuv420p[b];[a][b]concat=n=2:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 17 -preset medium silent_title_$L.mp4
python3 - <<PY
import re
CD=$CD; out=[]
for l in open('rec/erp_film.log').read().split('\n'):
    m=re.match(r'(§ERP_FILM_BEAT id=\S+ t=)([\d.]+)(.*)',l)
    if m: out.append(m.group(1)+('%.2f'%(float(m.group(2))+CD))+m.group(3))
out.insert(0,'§ERP_FILM_BEAT id=r0 t=0.30 lang=$L title card')
open('beats_title_$L.log','w').write('\n'.join(out)+'\n')
PY
rm -rf fit_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats_title_$L.log fit_$L $TOT > fit_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" fit_$L.log && break; sleep 3; done
grep -E "POLY_TONE" fit_$L.log; echo DETAIL=$(grep -c "pick=DETAIL" fit_$L.log) of $(grep -c POLY_FIT fit_$L.log) SHORT=$(grep -c "pick=SHORT" fit_$L.log)
cd fit_$L; rm -f $OUT; FILM_SEC=$TOT python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent_title_$L.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent_title_$L.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
