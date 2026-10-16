#!/bin/bash
# usage: [L=zh|th] film_mfg_part2_assemble.sh <tsv> <out.mp4>   (L default en: take/ ; other languages: take_<L>/ recorded with BEAT_MIN from that language's measure)   Manufacturing Part II (friendly-ops lens): the recorded take + English narration + subtitles (cards are recorded in the take).
# Copied from film_gap2_assemble.sh. Work dir ~/Videos/mfg_part2_narr_work: $TK/mfg_part2_raw.mp4 + $TK/erp_film.log from bim-ootb erp/tests/film_mfg_part2.js (BEAT_MIN = film_narration_poly.py measure + 1 s).
# READ the printed POLY_TONE / DETAIL counts, the loudness, the silence list and the scene-change check (none closer than 1.5 s).
set -e
TSV=$1; OUT=$2; L=${L:-en}; W=~/Videos/mfg_part2_narr_work; cd $W
TK=take; [ "$L" != en ] && TK=take_$L
VD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $TK/mfg_part2_raw.mp4)
cp $TK/mfg_part2_raw.mp4 silent_$L.mp4
grep -E "§ERP_FILM_BEAT" $TK/erp_film.log > beats_$L.log
rm -rf fit_$L; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py $TSV beats_$L.log fit_$L $VD > fit_$L.log 2>&1; grep -q "lang=$L wrong=0 rc=0" fit_$L.log && break; sleep 3; done
grep -E "POLY_TONE" fit_$L.log; echo DETAIL=$(grep -c "pick=DETAIL" fit_$L.log) of $(grep -c POLY_FIT fit_$L.log) SHORT=$(grep -c "pick=SHORT" fit_$L.log)
cd fit_$L; rm -f $OUT; FILM_SEC=$VD python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../silent_$L.mp4 $OUT | cut -c1-100
echo frames: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 $OUT | head -1) master: $(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ../silent_$L.mp4 | head -1) dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OUT)
ffmpeg -hide_banner -i $OUT -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
ffmpeg -hide_banner -i $OUT -af silencedetect=n=-40dB:d=2 -f null - 2>&1 | grep -E "silence_duration" | sed 's/.*silence_end: \([0-9.]*\) | silence_duration: \([0-9.]*\)/end=\1 dur=\2/'
ffmpeg -hide_banner -i ../silent_$L.mp4 -vf "select='gt(scene,0.12)',showinfo" -f null - 2>&1 | grep -oP 'pts_time:\K[0-9.]+' | python3 -c "
import sys; t=[float(x) for x in sys.stdin]; g=[(round(t[i],2),round(t[i+1]-t[i],2)) for i in range(len(t)-1) if t[i+1]-t[i]<1.5]
print('§SCENE_CHANGES n=%d closerThan1.5s=%d %s' % (len(t), len(g), g))"
