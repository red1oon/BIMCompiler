#!/bin/bash
# Implementing prompts/FILM_VS_AI_SLOP.md §RESUME. Build one language of the "I vs AI" film: ms (Malay) or zh (Mandarin), Edge TTS. ~12 min, CPU only, needs network (Edge voices; text only).
# usage: scripts/film_vs_ai_run_lang.sh <ms|zh>   -> build/film_vs_ai/cut_<L>/FilmVsAI_<L>_narrated_1920x1080_24fps_<date>.mp4
# Order matters: base timeline rebuilt FIRST so the retime plan is not polluted by an earlier dur_override.json (learned 2026-11-02).
set -e
L=$1; REPO=/home/red1/bim-compiler; W=$REPO/build/film_vs_ai/work; N=$W/narr_$L; C=$REPO/build/film_vs_ai/cut_$L; PY=$HOME/.local/share/film_narration/venv/bin/python
mkdir -p $C $N; cd $REPO
[ -f build/film_vs_ai/sfx.wav ] || $PY scripts/film_vs_ai_sfx.py build/film_vs_ai/cut build/film_vs_ai/sfx.wav
cp prompts/film_narration_ass_head_red.txt $N/ass_head.txt
export FILM_OUT=$C FILM_LANG=$L FILM_TSV=$REPO/prompts/film_narration_vs_ai_dialogue_v1_$L.tsv FILM_PROBE=$N/detail_durs.txt
rm -f $C/dur_override.json
python3 -I scripts/film_vs_ai_build.py > $C/b_base.log 2>&1
python3 - <<PY
rows=[l.rstrip('\n').split('\t') for l in open('$FILM_TSV')]
out=open('$N/probe.tsv','w')
for i,r in enumerate(rows): r[1]=str(i*40.0); r[2]=str(i*40.0+38); out.write('\t'.join(r)+'\n')
PY
cd $N; rm -f probe_*.wav; FILM_SEC=1600 $PY $REPO/scripts/film_vs_ai_fit_edge_pron.py probe.tsv probe $L > probe.log 2>&1
grep "§NARR_FIT" probe.log | sed -E 's/§NARR_FIT ([A-Za-z0-9]+) cue=[0-9.]+ room=[0-9.]+ dur=([0-9.]+) -> ([A-Z]+).*/\1 \2 \3/' > detail_durs.txt
[ -s detail_durs.txt ] || { echo "PROBE EMPTY - read $N/probe.log"; exit 1; }
cd $REPO
python3 -I scripts/film_vs_ai_retime.py plan > $C/retime_plan.log
python3 -I scripts/film_vs_ai_build.py > $C/b_final.log 2>&1
python3 -I scripts/film_vs_ai_retime.py tsv
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $C/FilmVsAI_v0_silent_1920x1080_24fps.mp4)
cd $N; rm -f vs${L}_*; FILM_SEC=$DUR $PY $REPO/scripts/film_vs_ai_fit_edge_pron.py $FILM_TSV vs$L $L > fit.log 2>&1
echo "fit: DETAIL=$(grep -c -e '-> DETAIL' fit.log) SHORT=$(grep -c -e '-> SHORT' fit.log) SKIP=$(grep -c -e '-> SKIP' fit.log) WRONG=$(grep -c WRONG fit.log)"
NOSFX=$C/FilmVsAI_${L}_nosfx.mp4; rm -f $NOSFX
FILM_SEC=$DUR python3 $REPO/prompts/film_narration_mux.py vs$L $C/FilmVsAI_v0_silent_1920x1080_24fps.mp4 $NOSFX > mux.log 2>&1
FINAL=$C/FilmVsAI_${L}_narrated_1920x1080_24fps_$(date +%F).mp4; rm -f $FINAL
ffmpeg -v error -y -i $NOSFX -i $REPO/build/film_vs_ai/sfx.wav -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k $FINAL
rm -f $NOSFX; echo ${L}_DONE $DUR $FINAL
