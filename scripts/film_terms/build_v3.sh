#!/bin/bash
# ⚠ DO NOT REMOVE — rebuild the PUBLIC cut v3 of "Terms you can check" end to end (CPU only; CUDA hidden from TTS and Chrome runs --disable-gpu). READ every log under out_v3/ after a run; exit codes are not evidence. v1/v2 inputs (build.sh, out/, cards.js, ...) are untouched.
# Swap the two pending beats later:  G2=pass G3=1 ./build_v3.sh      (G2=pass needs gaps_49_1/g2_stranger.log to end in "§DE_VERDICT PASS"; G3=1 needs a §STAR-EDGE-V1 s:0 line in gaps_49_1/g3_scale_1000.log; each fails the resolve if absent.)
# GPU rule: refuse to start the browser steps while any process holds the GPU.
set -e; cd "$(dirname "$0")"; mkdir -p out_v3/work/fm out_v3/work/fit out_v3/rec out_v3/cap
OUTMP4="${OUTMP4:-$HOME/Videos/Terms_You_Can_Check_EN_v3_rc1.mp4}"; OUTTXT="${OUTMP4%.mp4}_narration.txt"
[ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4=" ; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py
export CUDA_VISIBLE_DEVICES=""
gpu() { local p; p=$(nvidia-smi --query-compute-apps=pid,process_name --format=csv,noheader 2>/dev/null || true); [ -z "$p" ] || { echo "§GPU_BUSY $p"; exit 6; }; }
node make_spec_v3.js && SPEC=facts.spec.v3.json RESOLVED_OUT=facts.resolved.v3.json node resolve.js > out_v3/resolve.log 2>&1
node tsv_v3.js measure out_v3/work > out_v3/tsv_measure.log 2>&1
gpu; [ -s out_v3/cap/objectives_snapshot.html ] || curl -sL https://red1oon.github.io/bim-ootb/erp/team_objectives.html -o out_v3/cap/objectives_snapshot.html
[ -s out_v3/cap/objectives_cap.png ] || node cap_objectives_v3.js > out_v3/cap.log 2>&1
node guard_v3.js > out_v3/guard_run.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out_v3/work/fm/ass_head.txt; (cd out_v3/work/fm && rm -f *.wav && FILM_SEC=300 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node beatmin.js out_v3/fit_measure.log out_v3/beatmin.json
gpu; rm -rf out_v3/rec; mkdir -p out_v3/rec; node record_v3.js out_v3/rec out_v3/beatmin.json > out_v3/record.log 2>&1
node tsv_v3.js build out_v3/work out_v3/rec/film.log > out_v3/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out_v3/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out_v3/rec/film_silent.mp4)
(cd out_v3/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 "$OUTMP4" | tee ../../mux.log)
awk -F'\t' 'BEGIN{print "Terms you can check: the last open promise (public cut v3 rc1) - English narration (F asks, M explains). Numbers are frozen facts; see scripts/film_terms/script_en_v3_public.md.\n"} {printf "[%s %.2fs]\n", $1, $2; n=split($6,a," \\| "); for(i=1;i<=n;i++) print a[i]; print ""}' out_v3/work/narration_en.tsv > "$OUTTXT"
