#!/bin/bash
# ⚠ DO NOT REMOVE — build "Network ERP without an Apps and Database server!" (TEAMWORK §45.15) end to end, CPU only (CUDA hidden from TTS, Chrome --disable-gpu).
# Same shape as ../film_terms/build_v4.sh: resolve -> guard -> measure the voice -> beat lengths -> record the cards -> fit the voice to the picture -> two-pass loudnorm mux.
# READ every log under out/ after a run; exit codes are not evidence.   DRY=1 ./build.sh = resolve + guard + TSV only.
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit out/rec
OUTMP4="${OUTMP4:-$HOME/Videos/Network_ERP_without_an_Apps_and_Database_server_EN_rc1.mp4}"; OUTTXT="${OUTMP4%.mp4}_narration.txt"
[ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py
export CUDA_VISIBLE_DEVICES=""
# GPU rule (from build_v4.sh): refuse while any process holds the GPU. This build never uses the GPU (Chrome --disable-gpu, CUDA hidden); CPU_ONLY_OK=1 lets it
#   record beside a user's open browser, and LOGS the GPU state it ran beside (out/gpu_state.log) — an explicit, visible override, never a silent one.
gpu() { local p; p=$(nvidia-smi --query-compute-apps=pid,process_name --format=csv,noheader 2>/dev/null || true); [ -z "$p" ] && return 0
  if [ "$CPU_ONLY_OK" = 1 ]; then { echo "§GPU_BESIDE (override CPU_ONLY_OK=1; this build uses no GPU)"; nvidia-smi --query-gpu=memory.used,memory.total,utilization.gpu --format=csv,noheader; echo "$p" | cut -c1-120; } > out/gpu_state.log; return 0; fi
  echo "§GPU_BUSY $p"; exit 6; }
node resolve.js > out/resolve.log 2>&1
node guard.js > out/guard.log 2>&1 || { echo "§GUARD_FAIL see out/guard.log"; exit 3; }
node tsv.js measure out/work > out/tsv_measure.log 2>&1
[ -n "$DRY" ] && { echo "§DRY_RUN done: out/guard.log, out/work/narration_en.tsv"; exit 0; }
cp ../../prompts/film_narration_ass_head.txt out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=300 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js out/fit_measure.log out/beatmin.json > out/beatmin.log 2>&1 && node tsv.js holds out/beatmin.json >> out/beatmin.log 2>&1
gpu; rm -rf out/rec; mkdir -p out/rec; node record.js out/rec out/beatmin.json > out/record.log 2>&1
node tsv.js build out/work out/rec/film.log > out/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/rec/film_silent.mp4)
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 "$OUTMP4" | tee ../../mux.log)
awk -F'\t' 'BEGIN{print "Network ERP without an Apps and Database server! (rc1) - English narration. Every number is a frozen fact; see scripts/film_network_erp/script_en.md and facts.resolved.json.\n"} {printf "[%s %.2fs]\n", $1, $2; sub(/^M: /,"",$6); print $6; print ""}' out/work/narration_en.tsv > "$OUTTXT"
echo "§BUILD_DONE $OUTMP4"
