#!/bin/bash
# ⚠ DO NOT REMOVE — build "CLI in Action" (prompts/FILM_COMMAND_LINE_ERP.md, CH 0) end to end, English, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call. The legacy server is not asked anything.
# facts (real lines + the real ERP page on their data) -> guard -> cards -> measure the voice -> beat lengths (voice, or typing + hold) -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in.
# READ every log under out/; an exit code is not evidence. Usage: OOTB=<bim-ootb checkout at main, with #2998> [OUTMP4=…] ./build.sh        (SKIP_FACTS=1 keeps out/facts.json and out/erp/)
set -e; cd "$(dirname "$0")"; mkdir -p out/work/fm out/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/Command_Line_ERP_CH0_CLI_In_Action_EN_rc1.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""
[ -n "$SKIP_FACTS" ] || node facts.js > out/facts.log 2>&1 || { echo "§FACTS_FAIL see out/facts.log"; exit 3; }
node guard.js > out/guard.log 2>&1 || { echo "§GUARD_FAIL see out/guard.log"; exit 3; }
rm -rf out/cards; node cards.js out/cards > out/cards.log 2>&1; grep -q TOO-TALL out/cards.log && { echo "§CARD_TOO_TALL see out/cards.log"; exit 3; }
node tsv.js measure out/work > out/tsv_measure.log 2>&1
cp $HEAD out/work/fm/ass_head.txt; (cd out/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js out/fit_measure.log out/beatmin.json > out/beatmin.log 2>&1
node beatlen.js out/beatmin.json out/cards/plan.json out/beatlen.json > out/beatlen.log 2>&1
rm -rf out/rec; node record.js out/rec out/cards out/beatlen.json > out/record.log 2>&1
node tsv.js build out/work out/record.log > out/tsv_build.log 2>&1
cp $HEAD out/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/rec/film_silent.mp4)
rm -f out/work/film_voice.mp4
(cd out/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && python3 ../../../../film_neuro/ass_noverlap.py en.ass > ../../ass_noverlap.log && FILM_SEC=$D python3 ../../../$MUX en ../../rec/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py out/rec/keys.json $D out/work/keys.wav > out/keys.log 2>&1 || { echo "§KEYS_FAIL see out/keys.log"; exit 3; }
# the key sounds under the voice: the picture and the captions are copied as they are, only the sound is mixed (keys 9 dB below their own peak)
ffmpeg -y -v error -i out/work/film_voice.mp4 -i out/work/keys.wav -filter_complex "[1:a]volume=0.35[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > out/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> out/keysmix.log
echo "§BUILD_DONE $OUTMP4"
