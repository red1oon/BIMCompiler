#!/bin/bash
# ⚠ DO NOT REMOVE — build "CLI for OOTB Kernel Trilogy, Part II" (NEURO_SYMBOLIC_ORDER_CONTRACT.md §22.8) end to end, English, CPU only (CUDA hidden from TTS, Chrome --disable-gpu).
# Same shape as ../film_network_erp/build.sh: resolve -> guard -> measure the voice -> beat lengths -> record the cards -> fit the voice to the picture -> two-pass loudnorm mux.
# READ every log under out/ after a run; exit codes are not evidence.   DRY=1 ./build.sh = resolve + guard + TSV only.
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit out/rec
export FILM_LANG=en
OUTMP4="${OUTMP4:-$HOME/Videos/CLI_Trilogy_Part2_EN_rc1.mp4}"; OUTTXT="${OUTMP4%.mp4}_narration.txt"
[ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py
export CUDA_VISIBLE_DEVICES=""
node resolve.js > out/resolve.log 2>&1 || { echo "§RESOLVE_FAIL see out/resolve.log"; exit 3; }
node guard.js > out/guard.log 2>&1 || { echo "§GUARD_FAIL see out/guard.log"; exit 3; }
node tsv.js measure out/work > out/tsv_measure.log 2>&1
[ -n "$DRY" ] && { echo "§DRY_RUN done: out/guard.log, out/work/narration_en.tsv"; exit 0; }
cp ../../prompts/film_narration_ass_head.txt out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js out/fit_measure.log out/beatmin.json > out/beatmin.log 2>&1 && node tsv.js holds out/beatmin.json >> out/beatmin.log 2>&1
rm -rf out/rec; mkdir -p out/rec; node record.js out/rec out/beatmin.json > out/record.log 2>&1
node tsv.js build out/work out/rec/film.log > out/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/rec/film_silent.mp4)
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && python3 ../../../ass_noverlap.py en.ass > ../../ass_noverlap.log && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 "$OUTMP4" | tee ../../mux.log)
awk -F'\t' 'BEGIN{print "CLI for OOTB Kernel Trilogy, Part II - narration (English). Every number is a resolved fact; see scripts/film_neuro2/script_en.md and facts.resolved.json.\n"} {printf "[%s %.2fs]\n", $1, $2; gsub(/ \| /,"\n",$6); print $6; print ""}' out/work/narration_en.tsv > "$OUTTXT"
echo "§BUILD_DONE $OUTMP4"
