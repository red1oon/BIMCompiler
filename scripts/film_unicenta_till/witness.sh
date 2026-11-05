#!/bin/bash
# ⚠ DO NOT REMOVE — the WITNESS OF THE CUT for "uniCenta POS, reborn" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34 / §34.G; FILM_NARRATION.md PLAYBOOK steps 4-5). Numbers, not a look. READ $OUTD/witness.log; any FAIL or INCONCLUSIVE line means the cut is not accepted.
# usage: FILM_LANG=en|zh|ms ./witness.sh <final.mp4>   (silent picture = $OUTD/film_silent.mp4; fit log = $OUTD/fit.log; live facts = out/rec/film.log + out/rec_b3/film.log)
cd "$(dirname "$0")"; L_="${FILM_LANG:-en}"; export FILM_LANG="$L_"; [ "$L_" = en ] && OUTD=out || OUTD=out_$L_; F="$1"; S=$OUTD/film_silent.mp4; L=$OUTD/witness.log; : > $L; w() { echo "$@" | tee -a $L; }
PY=~/.local/share/film_narration/venv/bin/python
[ -s "$F" ] || { w "§WITNESS INCONCLUSIVE no final file"; exit 2; }; fail=0
a=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$F"); b=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $S)
[ "$a" = "$b" ] && w "§WITNESS frames PASS final=$a silent=$b" || { w "§WITNESS frames FAIL final=$a silent=$b"; fail=1; }
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"); w "§WITNESS length ${dur}s lang=$L_"
ffmpeg -hide_banner -i "$F" -af silencedetect=n=-40dB:d=4 -f null - 2>&1 | grep -o "silence_duration: [0-9.]*" | awk '{print $2}' | sort -n | tail -1 > /tmp/_sil_$L_.txt; m=$(cat /tmp/_sil_$L_.txt); m=${m:-0}
awk -v m=$m 'BEGIN{exit !(m<=7.0)}' && w "§WITNESS silence PASS longest>=4s gap=${m}s (bar 7 s; gaps under 4 s are not listed)" || { w "§WITNESS silence FAIL longest=${m}s > 7 s"; fail=1; }
li=$(ffmpeg -hide_banner -i "$F" -af ebur128 -f null - 2>&1 | grep -A12 "Summary" | grep " I:" | awk '{print $2}'); awk -v i="$li" 'BEGIN{exit !(i>=-17 && i<=-15)}' && w "§WITNESS loudness PASS I=${li} LUFS (target -16)" || { w "§WITNESS loudness FAIL I=${li}"; fail=1; }
ffmpeg -hide_banner -v error -i $S -vf "fps=2,crop=1920:230:0:850,signalstats,metadata=print:file=/tmp/_sz_$L_.txt" -f null - ; n=$(grep -c "YMIN" /tmp/_sz_$L_.txt); bad=$(awk -F= '/YMIN/{mn=$2} /YMAX/{ if ($2-mn>6 || $2>60) c++ } END{print c+0}' /tmp/_sz_$L_.txt)
[ "$n" -gt 0 ] && [ "$bad" = 0 ] && w "§WITNESS subtitle-zone PASS frames_checked=$n (2 fps) non-empty=$bad (crop 1920x230+0+850 of the silent picture: luma spread <=6 and max <=60 = the flat background, h264 noise only; any text or picture would exceed it)" || { w "§WITNESS subtitle-zone FAIL checked=$n non-empty=$bad"; fail=1; }
node guard.js > $OUTD/guard.log 2>&1 && w "§WITNESS numbers-guard PASS $(tail -1 $OUTD/guard.log) | $(grep 'G2\|C2\|C1\|C3' $OUTD/guard.log | cut -c1-70 | tr '\n' ' ')" || { w "§WITNESS numbers-guard FAIL"; fail=1; }
node livecheck.js out/rec/film.log out/rec_b1b/film.log out/rec_b3/film.log > $OUTD/livecheck.log 2>&1 && w "§WITNESS live-facts PASS $(tail -1 $OUTD/livecheck.log)" || { w "§WITNESS live-facts FAIL $(tail -1 $OUTD/livecheck.log)"; fail=1; }
nd=$(grep -c "^§NARR_FIT.* -> DETAIL" $OUTD/fit.log); nt=$(grep -c "^§NARR_FIT" $OUTD/fit.log); [ "$nd" = "$nt" ] && [ "$nt" -gt 0 ] && w "§WITNESS narr-fit PASS $nd/$nt DETAIL" || { w "§WITNESS narr-fit FAIL $nd/$nt DETAIL"; fail=1; }
tw=$(grep -c "§NARR_TONE.*WRONG" $OUTD/fit.log); tn=$(grep -c "§NARR_TONE" $OUTD/fit.log)
if [ "$L_" = zh ]; then w "§WITNESS narr-tone N/A zh is tonal (no pitch edit; the fitter reports no WRONG verdict, WRONG=$tw)"; else [ "$tn" -gt 0 ] && [ "$tw" = 0 ] && w "§WITNESS narr-tone PASS 0 WRONG of $tn" || { w "§WITNESS narr-tone FAIL wrong=$tw of $tn"; fail=1; }; fi
if [ "$L_" = zh ]; then LN=zh; ML=$OUTD/work/fit/zh_mux.log; fs=$(grep -m1 -i "fontselect" $ML | cut -c1-200); echo "$fs" | grep -qi "CJK" && w "§WITNESS zh-font PASS $fs" || { w "§WITNESS zh-font FAIL no CJK fontselect in $ML: $fs"; fail=1; }
  mx=$(python3 - <<PY
import re
m=0;n=0
for l in open("$OUTD/work/fit/zh.ass"):
    mm=re.match(r'^Dialogue: \d+,[^,]+,[^,]+,(F|M),[^,]*,\d+,\d+,\d+,[^,]*,(.*)$',l.rstrip('\n'))
    if mm: n+=1; m=max(m,len(mm.group(2)))
print(m,n)
PY
); set -- $mx; [ "$2" -gt 0 ] && [ "$1" -le 20 ] && w "§WITNESS zh-captions PASS longest_piece=$1 chars (<= 20) pieces=$2" || { w "§WITNESS zh-captions FAIL longest=$1 pieces=$2"; fail=1; }
fi
if [ "$L_" = ms ]; then ML=$OUTD/work/fit/ms_mux.log; fs=$(grep -m1 -i "fontselect" $ML | cut -c1-160); w "§WITNESS ms-font $fs"; fi
FILM_LANG=$L_ $PY acr_check.py $L_ $OUTD/work/fit > $OUTD/acr.log 2>&1; grep "§ACR" $OUTD/acr.log | tee -a $L | cut -c1-260; grep -q "§ACR_VERDICT.*FAIL\|Traceback" $OUTD/acr.log && { w "§WITNESS acronyms FAIL"; fail=1; } || w "§WITNESS acronyms $(grep '§ACR_VERDICT' $OUTD/acr.log | cut -c1-200)"
w "§WITNESS_VERDICT $([ $fail = 0 ] && echo PASS || echo FAIL)"; exit $fail
