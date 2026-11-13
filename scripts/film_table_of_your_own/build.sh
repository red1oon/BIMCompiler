#!/bin/bash
# ⚠ DO NOT REMOVE — build "A table of your own, in one line" (prompts/FILM_COMMAND_LINE_ERP.md, FOLLOW-UP FILM) end to end, English, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call. The legacy server is not asked anything.
# facts (real runs) -> guard -> cards -> measure the voice -> beat lengths -> the silent picture -> fit the voice to it -> two-pass loudnorm mux. READ every log under out/; an exit code is not evidence.
# Usage: OOTB=<bim-ootb checkout at main> [OUTMP4=…] ./build.sh        (SKIP_FACTS=1 keeps out/facts.json)
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/Command_Line_ERP_Part2_A_Table_Of_Your_Own_EN_rc1.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""
[ -n "$SKIP_FACTS" ] || node facts.js > out/facts.log 2>&1 || { echo "§FACTS_FAIL see out/facts.log"; exit 3; }
node guard.js > out/guard.log 2>&1 || { echo "§GUARD_FAIL see out/guard.log"; exit 3; }
rm -rf out/cards; node cards.js out/cards > out/cards.log 2>&1; grep -q TOO-TALL out/cards.log && { echo "§CARD_TOO_TALL see out/cards.log"; exit 3; }
node tsv.js measure out/work > out/tsv_measure.log 2>&1
cp $HEAD out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js out/fit_measure.log out/beatmin.json > out/beatmin.log 2>&1
rm -rf out/rec; node record.js out/rec out/cards out/beatmin.json > out/record.log 2>&1
node tsv.js build out/work out/record.log > out/tsv_build.log 2>&1
cp $HEAD out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/rec/film_silent.mp4)
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && python3 ../../../../film_neuro/ass_noverlap.py en.ass > ../../ass_noverlap.log && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 "$OUTMP4" > ../../mux.log 2>&1)
echo "§BUILD_DONE $OUTMP4"
