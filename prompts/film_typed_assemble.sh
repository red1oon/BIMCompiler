#!/bin/bash
# usage: film_typed_assemble.sh <id> <size> <text>     -> ~/Videos/typed_work/<id>_part.mp4  (typed-onto-paper card, narrated, key ticks; captions off - the page IS the text)
set -e
ID=$1; SIZE=$2; TXT=$3; L=en; W=~/Videos/typed_work; cd $W
printf '%s\ten\tred1 2026-10-14 typed-paper message (wording qualified in prompts/ERP_DEPTH_FILM.md §FILM-TYPED)\tF: %s\tF: %s\n' "$ID" "$TXT" "$TXT" > ${ID}.tsv
echo -e "$ID\ten\tx\tF: $TXT\tF: $TXT" > /dev/null
rm -rf rm_$ID; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py ${ID}.tsv measure rm_$ID 900 > m_$ID.log 2>&1; grep -q "lang=$L wrong=0 rc=0" m_$ID.log && break; sleep 3; done
SP=$(grep "POLY_DUR id=$ID " m_$ID.log | sed 's/.*dur=//')
START=0.8; TAIL=3.2; TOT=$(python3 -c "print(round($START+$SP+$TAIL,2))")
echo "speech=$SP total=$TOT"
python3 ~/bim-compiler/prompts/film_typed_paper_card.py "$TXT" $SP ${ID}_silent.mp4 ${ID}_ticks.wav $START $TAIL $SIZE | grep -E "TYPED|assert|Error"
printf "§ERP_FILM_BEAT id=$ID t=$START lang=$L\n§ERP_FILM_BEAT id=end t=$TOT lang=$L\n" > beats_$ID.log
rm -rf fit_$ID; for i in 1 2 3 4 5; do python3 ~/bim-compiler/prompts/film_narration_poly.py ${ID}.tsv beats_$ID.log fit_$ID $TOT > fit_$ID.log 2>&1; grep -q "lang=$L wrong=0 rc=0" fit_$ID.log && break; sleep 3; done
grep -E "POLY_TONE" fit_$ID.log
( cd fit_$ID; python3 - <<PY
s=open('poly.ass').read().split('\n'); s=[l for l in s if not l.startswith('Dialogue:')]; open('poly.ass','w').write('\n'.join(s)+'\n')
PY
rm -f ../${ID}_part.mp4; SFX_WAV=../${ID}_ticks.wav SFX_VOL=0.35 FILM_SEC=$TOT python3 ~/bim-compiler/prompts/film_narration_mux.py poly ../${ID}_silent.mp4 ../${ID}_part.mp4 | cut -c1-90 )
echo "$ID: dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 ${ID}_part.mp4) frames=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ${ID}_part.mp4 | head -1) silent=$(ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 ${ID}_silent.mp4 | head -1)"
ffmpeg -hide_banner -i ${ID}_part.mp4 -af ebur128 -f null - 2>&1 | grep -A1 "Integrated" | tail -1
