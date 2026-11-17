#!/bin/bash
# ⚠ DO NOT REMOVE — build the film "Help that answers, in the Viewer", v3 = framed bigger (prompts/VOCAB_MESSAGE_CATALOG.md §17.1, §17.2, §17.3; copied from scripts/film_help_showcase/build.sh) end to end, English voice + English subtitles,
# CPU only (CUDA hidden from the voice, Chrome on the CPU). No paid call. The pictures and facts are made BEFORE by shots.js + facts.js (the real Viewer on a bim-ootb main tree, its § log, red1, the
# witness logs run on the same tree) -> guard -> cards -> measure the voice -> beat lengths (voice, or typing + hold) -> the silent picture -> fit the voice -> two-pass loudnorm mux -> key sounds -> K2 -> C.
# READ every log under out/; an exit code is not evidence. Usage: [OUTMP4=…] ./build.sh   (run `node shots.js <tree>` then the 3 witnesses on <tree> into out/, then `node facts.js <tree>` first)
set -e; cd "$(dirname "$0")"
OD=out; export OUTD=$OD; mkdir -p $OD/work/fm $OD/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/Help_that_answers_Viewer_EN_AFTER_$(date +%F)_v3.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""; FTAG=en; FARG=1.15; KEYVOL="${KEYVOL:-0.8}"
[ -s $OD/facts.json ] && [ -s $OD/shots.log ] && [ -d $OD/pages ] && grep -q "VERDICT PASS" $OD/facts.log || { echo "§FACTS_MISSING run shots.js, the witnesses and facts.js first"; exit 3; }
node guard.js > $OD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard.log"; exit 3; }
rm -rf $OD/cards; node cards.js $OD/cards > $OD/cards.log 2>&1; grep -q TOO-TALL $OD/cards.log && { echo "§CARD_TOO_TALL see $OD/cards.log"; exit 3; }
grep -q "§CARDS_FAIL\|§FRAME_BAR " $OD/cards.log && { echo "§FRAME_BAR_FAIL see $OD/cards.log"; exit 3; }
python3 framecheck.py $OD/cards > $OD/framecheck.log 2>&1 || { echo "§FRAMECHECK_FAIL see $OD/framecheck.log"; exit 3; }
python3 framecheck.py $OD/cards --falsifier > $OD/framecheck_falsifier.log 2>&1 && { echo "§FRAMECHECK_FALSIFIER_PASSED (the check cannot say NO) see $OD/framecheck_falsifier.log"; exit 3; }
python3 framecheck.py $OD/cards --v2 > $OD/framecheck_v2.log 2>&1 || { echo "§FRAMECHECK_V2_NOT_SEPARATED see $OD/framecheck_v2.log"; exit 3; }; tail -1 $OD/framecheck.log
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m $FARG > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec; node record.js $OD/rec $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG > ../../fit.log 2>&1 && python3 ../../../../film_neuro/ass_noverlap.py ${FTAG}.ass > ../../ass_noverlap.log && node ../../../written.js ${FTAG}.ass > ../../written.log && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/$FTAG.ass > $OD/k2.log 2>&1; tail -3 $OD/k2.log
python3 capcheck.py $OD/work/fit/$FTAG.ass $OD/rec/film_silent.mp4 "$OUTMP4" > $OD/capcheck.log 2>&1; tail -1 $OD/capcheck.log
echo "§BUILD_DONE $OUTMP4"
