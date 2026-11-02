#!/bin/bash
# Implementing prompts/FILM_VS_AI_SLOP.md §RESUME. English film: Kokoro (local CPU, deterministic) F=af_heart M=am_adam. Reuses build/film_vs_ai/cut/dur_override.json (picture waits for the voice).
# FIRST-TIME retime (no dur_override.json): rm override, build, probe (kokoro fit with 38 s rooms) -> detail_durs.txt, `FILM_PROBE=... scripts/film_vs_ai_retime.py plan`, build again, `retime.py tsv` — same pattern as film_vs_ai_run_lang.sh.
set -e
REPO=/home/red1/bim-compiler; W=$REPO/build/film_vs_ai/work; N=$W/narr_en; C=$REPO/build/film_vs_ai/cut; PY=$HOME/.local/share/film_narration/venv/bin/python
mkdir -p $N; cd $REPO
[ -f build/film_vs_ai/sfx.wav ] || $PY scripts/film_vs_ai_sfx.py build/film_vs_ai/cut build/film_vs_ai/sfx.wav
cp prompts/film_narration_ass_head_red.txt $N/ass_head.txt
unset FILM_LANG FILM_OUT FILM_TSV FILM_PROBE
python3 -I scripts/film_vs_ai_build.py > $C/b_en.log 2>&1
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $C/FilmVsAI_v0_silent_1920x1080_24fps.mp4)
cd $N; rm -f vsen_*; FILM_VOX_F=af_heart FILM_VOX_M=am_adam FILM_SEC=$DUR $PY $REPO/prompts/film_narration_fit_kokoro_v3.py $REPO/prompts/film_narration_vs_ai_dialogue_v1.tsv vsen 1.15 > fit.log 2>&1
echo "fit: DETAIL=$(grep -c -e '-> DETAIL' fit.log) SHORT=$(grep -c -e '-> SHORT' fit.log) SKIP=$(grep -c -e '-> SKIP' fit.log) WRONG=$(grep -c WRONG fit.log)"
NOSFX=$C/FilmVsAI_en_nosfx.mp4; rm -f $NOSFX
FILM_SEC=$DUR python3 $REPO/prompts/film_narration_mux.py vsen $C/FilmVsAI_v0_silent_1920x1080_24fps.mp4 $NOSFX > mux.log 2>&1
FINAL=$C/FilmVsAI_English_narrated_1920x1080_24fps_$(date +%F).mp4; rm -f $FINAL
ffmpeg -v error -y -i $NOSFX -i $REPO/build/film_vs_ai/sfx.wav -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k $FINAL
rm -f $NOSFX; echo EN_DONE $DUR $FINAL
