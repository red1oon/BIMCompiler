#!/bin/bash
# ⚠ DO NOT REMOVE — rebuild the DEVELOPER cut v4 of "How do we know what we said is true?" end to end (CPU only; CUDA hidden from TTS and Chrome runs --disable-gpu). READ every log under out_v4/ after a run; exit codes are not evidence. v1/v2/v3 inputs are untouched.
# Usage:  DRY=1 ./build_v4.sh                      resolve + narration TSV + guard only (no TTS, no browser, no GPU)
#         G2=pass G3=1 GC=1 ./build_v4.sh          the final build, after the fresh-copy run (G2), the 1,000-till run (G3) and the git-aware cache run (GC, build/scriptor/witness_cache/GREEN_git_full.log) have final logs; each switch fails the resolve if its log line is absent.
# Before a build: scripts/film_terms/repo_facts_v4.sh (refreshes repo_facts.log) and re-fetch out_v4/cap/developers_snapshot.html if the page changed (delete it to refresh).
# GPU rule: refuse to start the browser steps while any process holds the GPU.
set -e; cd "$(dirname "$0")"; mkdir -p out_v4/work/fm out_v4/work/fit out_v4/rec out_v4/cap
OUTMP4="${OUTMP4:-$HOME/Videos/How_Do_We_Know_What_We_Said_Is_True_EN_v4_rc1.mp4}"; OUTTXT="${OUTMP4%.mp4}_narration.txt"
[ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4=" ; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py
export CUDA_VISIBLE_DEVICES=""
gpu() { local p; p=$(nvidia-smi --query-compute-apps=pid,process_name --format=csv,noheader 2>/dev/null || true); [ -z "$p" ] || { echo "§GPU_BUSY $p"; exit 6; }; }
./repo_facts_v4.sh; node make_spec_v4.js && SPEC=facts.spec.v4.json RESOLVED_OUT=facts.resolved.v4.json node resolve.js > out_v4/resolve.log 2>&1
node tsv_v4.js measure out_v4/work > out_v4/tsv_measure.log 2>&1
[ -s out_v4/cap/developers_snapshot.html ] || curl -sL https://red1oon.github.io/bim-ootb/erp/team_developers.html -o out_v4/cap/developers_snapshot.html
node guard_v4.js > out_v4/guard_run.log 2>&1
[ -n "$DRY" ] && { echo "§DRY_RUN done: guard log out_v4/guard.log"; exit 0; }
cp ../../prompts/film_narration_ass_head.txt out_v4/work/fm/ass_head.txt; (cd out_v4/work/fm && rm -f *.wav && FILM_SEC=300 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node beatmin.js out_v4/fit_measure.log out_v4/beatmin.json
gpu; rm -rf out_v4/rec; mkdir -p out_v4/rec; node record_v4.js out_v4/rec out_v4/beatmin.json > out_v4/record.log 2>&1
node tsv_v4.js build out_v4/work out_v4/rec/film.log > out_v4/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out_v4/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out_v4/rec/film_silent.mp4)
(cd out_v4/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 "$OUTMP4" | tee ../../mux.log)
awk -F'\t' 'BEGIN{print "How do we know what we said is true? (developer cut v4 rc1) - English narration (F asks, M explains). Numbers are frozen facts; see scripts/film_terms/script_en_v4_dev.md.\n"} {printf "[%s %.2fs]\n", $1, $2; n=split($6,a," \\| "); for(i=1;i<=n;i++) print a[i]; print ""}' out_v4/work/narration_en.tsv > "$OUTTXT"
