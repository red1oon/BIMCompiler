#!/bin/bash
# ⚠ DO NOT REMOVE — build "uniCenta POS, reborn: the SQLite WASM till" (prompts/POS_PLUGIN_LOCAL_FIRST.md §34) end to end, CPU only (CUDA hidden from TTS, Chrome --disable-gpu).
# resolve (every number from a named § log) -> guard -> cards -> voice measure -> beat lengths -> record -> assemble -> fit (Kokoro EN) -> [mux + witnesses of the cut].  READ every log under out/ after a run; exit codes are not evidence.
# MODE=A (Phase A): stops after the narration fit on dry-run timings, NO final mux.   MODE=B: record for real and mux to $OUTMP4 (never overwritten).  ROOT = the bim-ootb worktree served to the browser.
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit out/rec out/cards; MODE="${MODE:-A}"; export ROOT="${ROOT:-/tmp/wt-film-ootb}" CUDA_VISIBLE_DEVICES=""
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py
OUTMP4="${OUTMP4:-$HOME/Videos/UnicentaPOS_SQLiteWASM_narrated_EN_AFTER_$(date +%F)_v1.mp4}"
[ "$MODE" = B ] && [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
node resolve.js > out/resolve.log 2>&1 || { echo "§RESOLVE_FAIL see out/resolve.log"; exit 3; }
node guard.js > out/guard.log 2>&1 || { echo "§GUARD_FAIL see out/guard.log"; exit 3; }
node cards.js render out/cards > out/cards.log 2>&1; grep -q NOT-EMPTY out/cards.log && { echo "§CARD_SUBTITLE_ZONE_NOT_EMPTY"; exit 3; }
node tsv.js measure out/work > out/tsv_measure.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js out/fit_measure.log out/beatmin.json > out/beatmin.log 2>&1
if { [ "$MODE" = B ] || [ -n "$RECORD" ]; } && [ -z "$SKIPREC" ]; then rm -rf out/rec; mkdir -p out/rec; [ -z "$FAST" ] || export FAST; node record.js out/rec out/beatmin.json > out/record.log 2>&1; fi
if [ -n "$PARTIAL" ] || [ "$MODE" = A ]; then export PARTIAL=1; fi
node assemble.js out out/beatmin.json > out/assemble.log 2>&1 || { echo "§ASSEMBLE_FAIL see out/assemble.log"; exit 4; }
F=out/film_silent.mp4; [ -e $F ] || F=out/film_partial.mp4
node tsv.js build out/work out/timeline.json > out/tsv_build.log 2>&1
cp ../../prompts/film_narration_ass_head.txt out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $F)
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1)
grep -c "^§NARR_FIT.* -> DETAIL" out/fit.log | sed 's/^/§FIT_DETAIL_ROWS /'; grep "^§NARR_FIT" out/fit.log | grep -v "> DETAIL" | sed 's/^/§FIT_NOT_DETAIL /' || true
grep -c "§NARR_TONE.*WRONG" out/fit.log | sed 's/^/§TONE_WRONG /' || true
[ "$MODE" = A ] && { echo "§PHASE_A_DONE fit on dry-run timings; no mux"; exit 0; }
[ "$F" = out/film_silent.mp4 ] || { echo "§MUX_REFUSED the film has holes (out/assemble.log)"; exit 6; }
(cd out/work/fit && FILM_SEC=$D python3 ../../../$MUX en ../../../$F "$OUTMP4" | tee ../../mux.log)
echo "§BUILD_DONE $OUTMP4"
