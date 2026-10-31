#!/bin/bash
# ⚠ DO NOT REMOVE — rebuild "Terms you can check" EN v2 end to end (CPU only). READ every log under out/ after a run; exit codes are not evidence. Needs out/cap_panels.log + out/cap/*.png from `cd out && node ../cap_panels.js > cap_panels.log` (real panels, ~8 min).
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit out/rec
OUTMP4="${OUTMP4:-$HOME/Videos/Terms_You_Can_Check_EN_v2.mp4}"
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py
node make_spec.js && node resolve.js > out/resolve.log 2>&1
node tsv.js measure out/work > out/tsv_measure.log 2>&1 && node guard.js > out/guard.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=300 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node beatmin.js out/fit_measure.log out/beatmin.json
rm -rf out/rec; mkdir -p out/rec; node record.js out/rec out/beatmin.json > out/record.log 2>&1
node tsv.js build out/work out/rec/film.log > out/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/rec/film_silent.mp4)
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 "$OUTMP4" | tee ../../mux.log)
