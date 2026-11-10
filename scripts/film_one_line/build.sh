#!/bin/bash
# ⚠ DO NOT REMOVE — build "One line" (prompts/NEURO_SYMBOLIC_ORDER_CONTRACT.md §24) end to end, English, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call.
# facts (real runs) -> guard -> cards -> measure the voice -> beat lengths -> the silent picture -> fit the voice to it -> two-pass loudnorm mux. READ every log under out/; an exit code is not evidence.
# Usage: OOTB=<bim-ootb checkout at main> [OUTMP4=…] ./build.sh        (SKIP_FACTS=1 keeps out/facts.json)
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit
export FILM_LANG="${FILM_LANG:-en}"; LUP=$(echo $FILM_LANG | tr a-z A-Z)
OUTMP4="${OUTMP4:-$HOME/Videos/One_Line_${LUP}_rc1.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
FTAG=en; FARG=1.15; [ "$FILM_LANG" = zh ] && { FIT=../../prompts/film_narration_fit_edge.py; FTAG=zh; FARG=zh; }   # zh: the script text is sent to Microsoft Edge TTS (free; cached by text)
export CUDA_VISIBLE_DEVICES=""
[ -n "$SKIP_FACTS" ] || node facts.js > out/facts.log 2>&1 || { echo "§FACTS_FAIL see out/facts.log"; exit 3; }
node guard.js > out/guard.log 2>&1 || { echo "§GUARD_FAIL see out/guard.log"; exit 3; }
node cards.js out/cards > out/cards.log 2>&1; grep -q TOO-TALL out/cards.log && { echo "§CARD_TOO_TALL see out/cards.log"; exit 3; }
node tsv.js measure out/work > out/tsv_measure.log 2>&1
cp $HEAD out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m $FARG > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js out/fit_measure.log out/beatmin.json > out/beatmin.log 2>&1
rm -rf out/rec; node record.js out/rec out/cards out/beatmin.json > out/record.log 2>&1
node tsv.js build out/work out/record.log > out/tsv_build.log 2>&1
cp $HEAD out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/rec/film_silent.mp4)
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG > ../../fit.log 2>&1 && { if [ "$FILM_LANG" = zh ]; then cp zh.ass zh_raw.ass && python3 ../../../../../prompts/film_zh_caption_split.py zh_raw.ass zh.ass > ../../caption_split.log; else python3 ../../../../film_neuro/ass_noverlap.py en.ass > ../../ass_noverlap.log; fi; } && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec/film_silent.mp4 "$OUTMP4" > ../../mux.log 2>&1)
echo "§BUILD_DONE $OUTMP4"
