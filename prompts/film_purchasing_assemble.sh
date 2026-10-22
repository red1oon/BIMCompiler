#!/bin/bash
# usage: film_purchasing_assemble.sh <take dir> <tsv> <out.mp4>   "Purchasing and Stock Replenishment": house title card + the recorded take (<take>/erp_film_purch.mp4 + erp_film.log from scripts/film_erp_purchasing.js)
#   + the black five-step process card at the back + English narration + subtitles. Work dir ~/Videos/purchasing_work. The TSV's r0 row is spoken over the title card (card = speech + 1.6 s), its p row over the process card (hold = speech + 2.0 s).
#   READ the printed POLY_TONE / DETAIL counts and the silence list.
set -e
L=en; TAKE=$1; TSV=$2; OUT=$3; W=~/Videos/purchasing_work; cd $W; mkdir -p $W/cards
python3 ~/bim-compiler/prompts/film_nc_title_card.py $W/cards/card_title.png "KERNEL ERP · TWIN OF iDEMPIERE" "Purchasing and" "Stock Replenishment" "buying, moving and topping up stock" > /dev/null
python3 ~/bim-compiler/prompts/film_depth_process_card.py $W/cards/card_proc.png en > /dev/null
rm -rf meas_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV measure meas_$L 900 > meas_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" meas_$L.log && break; sleep 3; done
D0=$(grep "POLY_DUR id=r0 " meas_$L.log | sed 's/.*dur=//'); DP=$(grep "POLY_DUR id=p " meas_$L.log | sed 's/.*dur=//')
CD=$(python3 -c "print(round($D0+1.6,2))"); PD=$(python3 -c "print(round($DP+2.0,2))"); VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $TAKE/erp_film_purch.mp4); TOT=$(python3 -c "print(round($VD+$CD+$PD,3))")
echo "r0 speech=$D0 card=$CD | video=$VD | process card speech=$DP hold=$PD | total=$TOT"
ffmpeg -v error -y -loop 1 -t $CD -i $W/cards/card_title.png -i $TAKE/erp_film_purch.mp4 -loop 1 -t $PD -i $W/cards/card_proc.png -filter_complex "[0:v]fps=24,scale=1920:1080,format=yuv420p[a];[1:v]fps=24,scale=1920:1080,format=yuv420p[b];[2:v]fps=24,scale=1920:1080,format=yuv420p[c];[a][b][c]concat=n=3:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 17 -preset medium silent_$L.mp4
python3 - <<PY
import re
CD=$CD; VD=$VD; out=[]
for l in open('$TAKE/erp_film.log').read().split('\n'):
    m=re.match(r'(§ERP_FILM_BEAT id=)(\S+)( t=)([\d.]+)(.*)',l)
    if m:
        if m.group(2)=='end': out.append(m.group(1)+'p'+m.group(3)+'%.2f'%(CD+VD+0.3)+m.group(5)); continue
        out.append(m.group(1)+m.group(2)+m.group(3)+('%.2f'%(float(m.group(4))+CD))+m.group(5))
out.insert(0,'§ERP_FILM_BEAT id=r0 t=0.30 lang=$L title card')
out.append('§ERP_FILM_BEAT id=end t=%.2f lang=$L'%(CD+VD+$PD))
open('beats_$L.log','w').write('\n'.join(out)+'\n')
PY
rm -rf fit_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats_$L.log fit_$L $TOT > fit_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" fit_$L.log && break; sleep 3; done
grep -E "POLY_TONE" fit_$L.log; echo DETAIL=$(grep -c "pick=DETAIL" fit_$L.log) of $(grep -c POLY_FIT fit_$L.log) SHORT=$(grep -c "pick=SHORT" fit_$L.log)
cd fit_$L; rm -f $OUT; FILM_SEC=$TOT python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent_$L.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent_$L.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
