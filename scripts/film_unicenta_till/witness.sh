#!/bin/bash
# ⚠ DO NOT REMOVE — the WITNESS OF THE CUT for "uniCenta POS, reborn" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34; FILM_NARRATION.md PLAYBOOK steps 4-5). Numbers, not a look. READ out/witness.log; any FAIL or INCONCLUSIVE line means the cut is not accepted.
# usage: ./witness.sh <final.mp4>      (silent picture = out/film_silent.mp4; fit log = out/fit.log; live facts = out/rec/film.log)
cd "$(dirname "$0")"; F="$1"; S=out/film_silent.mp4; L=out/witness.log; : > $L; w() { echo "$@" | tee -a $L; }
[ -s "$F" ] || { w "§WITNESS INCONCLUSIVE no final file"; exit 2; }; fail=0
a=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$F"); b=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 $S)
[ "$a" = "$b" ] && w "§WITNESS frames PASS final=$a silent=$b" || { w "§WITNESS frames FAIL final=$a silent=$b"; fail=1; }
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F"); w "§WITNESS length ${dur}s"
ffmpeg -hide_banner -i "$F" -af silencedetect=n=-40dB:d=4 -f null - 2>&1 | grep -o "silence_duration: [0-9.]*" | awk '{print $2}' | sort -n | tail -1 > /tmp/_sil.txt; m=$(cat /tmp/_sil.txt); m=${m:-0}
awk -v m=$m 'BEGIN{exit !(m<=7.0)}' && w "§WITNESS silence PASS longest>=4s gap=${m}s (bar 7 s; gaps under 4 s are not listed)" || { w "§WITNESS silence FAIL longest=${m}s > 7 s"; fail=1; }
li=$(ffmpeg -hide_banner -i "$F" -af ebur128 -f null - 2>&1 | grep -A12 "Summary" | grep " I:" | awk '{print $2}'); awk -v i="$li" 'BEGIN{exit !(i>=-17 && i<=-15)}' && w "§WITNESS loudness PASS I=${li} LUFS (target -16)" || { w "§WITNESS loudness FAIL I=${li}"; fail=1; }
ffmpeg -hide_banner -v error -i $S -vf "fps=2,crop=1920:230:0:850,signalstats,metadata=print:file=/tmp/_sz.txt" -f null - ; n=$(grep -c "YMIN" /tmp/_sz.txt); bad=$(awk -F= '/YMIN/{mn=$2} /YMAX/{ if ($2-mn>6 || $2>60) c++ } END{print c+0}' /tmp/_sz.txt)
[ "$n" -gt 0 ] && [ "$bad" = 0 ] && w "§WITNESS subtitle-zone PASS frames_checked=$n (2 fps) non-empty=$bad (crop 1920x230+0+850 of the silent picture: luma spread <=6 and max <=60 = the flat background, h264 noise only; any text or picture would exceed it)" || { w "§WITNESS subtitle-zone FAIL checked=$n non-empty=$bad"; fail=1; }
node guard.js > out/guard.log 2>&1 && w "§WITNESS numbers-guard PASS $(tail -1 out/guard.log)" || { w "§WITNESS numbers-guard FAIL"; fail=1; }
node livecheck.js out/rec/film.log > out/livecheck.log 2>&1 && w "§WITNESS live-facts PASS $(tail -1 out/livecheck.log)" || { w "§WITNESS live-facts FAIL $(tail -1 out/livecheck.log)"; fail=1; }
nd=$(grep -c "^§NARR_FIT.* -> DETAIL" out/fit.log); nt=$(grep -c "^§NARR_FIT" out/fit.log); [ "$nd" = "$nt" ] && [ "$nt" -gt 0 ] && w "§WITNESS narr-fit PASS $nd/$nt DETAIL" || { w "§WITNESS narr-fit FAIL $nd/$nt DETAIL"; fail=1; }
tw=$(grep -c "§NARR_TONE.*WRONG" out/fit.log); tn=$(grep -c "§NARR_TONE" out/fit.log); [ "$tn" -gt 0 ] && [ "$tw" = 0 ] && w "§WITNESS narr-tone PASS 0 WRONG of $tn" || { w "§WITNESS narr-tone FAIL wrong=$tw of $tn"; fail=1; }
w "§WITNESS_VERDICT $([ $fail = 0 ] && echo PASS || echo FAIL)"; exit $fail
