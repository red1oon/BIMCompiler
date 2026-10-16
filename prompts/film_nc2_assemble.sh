#!/bin/bash
# usage: film_nc2_assemble.sh <tsv> <out.mp4>   (English chapter 2: title card + recording rec2/erp_film_nc.mp4 + the black five-step process card, narrated)
set -e
L=en; TSV=$1; OUT=$2; W=~/Videos/newclient_work; cd $W
python3 ~/bim-compiler/prompts/film_nc_title_card.py /tmp/claude-1000/probe/card_nc2.png "NEW CLIENT IN DEPTH" "Setup rules" "a rate, a payment term, a role" "each rule measured on legacy iDempiere first" > /dev/null
python3 ~/bim-compiler/prompts/film_depth_process_card.py /tmp/claude-1000/probe/card_proc.png en > /dev/null
rm -rf rm2_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV measure rm2_$L 900 > m2_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" m2_$L.log && break; sleep 3; done
D0=$(grep "POLY_DUR id=r0 " m2_$L.log | sed 's/.*dur=//'); DP=$(grep "POLY_DUR id=p " m2_$L.log | sed 's/.*dur=//')
CD=$(python3 -c "print(round($D0+1.6,2))"); PD=$(python3 -c "print(round($DP+2.0,2))"); VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 rec2/erp_film_nc.mp4); TOT=$(python3 -c "print(round($VD+$CD+$PD,3))")
echo "r0 speech=$D0 card=$CD | video=$VD | process card speech=$DP hold=$PD | total=$TOT"
ffmpeg -v error -y -loop 1 -t $CD -i /tmp/claude-1000/probe/card_nc2.png -i rec2/erp_film_nc.mp4 -loop 1 -t $PD -i /tmp/claude-1000/probe/card_proc.png -filter_complex "[0:v]fps=24,scale=1920:1080,format=yuv420p[a];[1:v]fps=24,scale=1920:1080,format=yuv420p[b];[2:v]fps=24,scale=1920:1080,format=yuv420p[c];[a][b][c]concat=n=3:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 17 -preset medium silent2_$L.mp4
python3 - <<PY
import re
CD=$CD; VD=$VD; out=[]
for l in open('rec2/erp_film.log').read().split('\n'):
    m=re.match(r'(§ERP_FILM_BEAT id=)(\S+)( t=)([\d.]+)(.*)',l)
    if m:
        if m.group(2)=='end': out.append(m.group(1)+'p'+m.group(3)+'%.2f'%(CD+VD+0.3)+m.group(5)); continue
        out.append(m.group(1)+m.group(2)+m.group(3)+('%.2f'%(float(m.group(4))+CD))+m.group(5))
out.insert(0,'§ERP_FILM_BEAT id=r0 t=0.30 lang=$L title card')
out.append('§ERP_FILM_BEAT id=end t=%.2f lang=$L'%(CD+VD+$PD))
open('beats2_$L.log','w').write('\n'.join(out)+'\n')
PY
rm -rf fit2_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats2_$L.log fit2_$L $TOT > fit2_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" fit2_$L.log && break; sleep 3; done
grep -E "POLY_TONE" fit2_$L.log; echo DETAIL=$(grep -c "pick=DETAIL" fit2_$L.log) of $(grep -c POLY_FIT fit2_$L.log) SHORT=$(grep -c "pick=SHORT" fit2_$L.log)
cd fit2_$L; rm -f $OUT; FILM_SEC=$TOT python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent2_$L.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent2_$L.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
