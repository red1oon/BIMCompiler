#!/bin/bash
# ⚠ DO NOT REMOVE — build "Remember The Name - red1" (prompts/CLI_ERP_IVR.md §22.13; prompts/FILM_COMMAND_LINE_ERP.md "CH red1") end to end, English, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call.
# record the real `red1` shell in a pty (rec.py) -> facts + checks -> guard -> stills (one full-frame terminal) -> measure the voice -> beat lengths -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in -> K2.
# READ every log under out/; an exit code is not evidence. Usage: [OOTB=~/bim-ootb] [OUTMP4=…] ./build.sh        (SKIP_REC=1 keeps out/rec/ and builds from that recording)
set -e; cd "$(dirname "$0")"; OD=out; export OUTD=$OD
mkdir -p $OD/work/fm $OD/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/Remember_The_Name_red1_EN_rc1.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""
[ -n "$SKIP_REC" ] || { rm -rf $OD/rec; $PY rec.py $OD/rec > $OD/rec.log 2>&1 || { echo "§REC_FAIL see $OD/rec.log"; exit 3; }; }
node facts.js > $OD/facts.log 2>&1 || { echo "§FACTS_FAIL see $OD/facts.log"; exit 3; }
node guard.js > $OD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard.log"; exit 3; }
rm -rf $OD/cards; node cards.js $OD/cards > $OD/cards.log 2>&1 || { echo "§CARDS_FAIL see $OD/cards.log"; exit 3; }
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m 1.15 > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec_video; node record.js $OD/rec_video $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec_video/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv en 1.15 > ../../fit.log 2>&1 && python3 ../../../../film_neuro/ass_noverlap.py en.ass > ../../ass_noverlap.log && FILM_SEC=$D python3 ../../../$MUX en ../../rec_video/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec_video/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
# the key sounds under the voice: the picture and the captions are copied as they are, only the sound is mixed (KEYVOL of their own 0.5 peak)
KEYVOL="${KEYVOL:-0.8}"
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/en.ass > $OD/k2.log 2>&1; tail -3 $OD/k2.log
echo "§BUILD_DONE $OUTMP4"
