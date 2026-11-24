#!/bin/bash
# ⚠ DO NOT REMOVE — build film v3 "Help that checks before you complete" (prompts/VOCAB_MESSAGE_CATALOG.md §19.22; copied from scripts/film_ctxhelp_derived/build.sh §19.20) end to end, English voice + English subtitles, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call. No server is asked anything.
# the pictures and facts are made BEFORE by shots.js + facts.js (the real ERP page on bim-ootb main, its § log, the witness logs) -> guard -> cards -> measure the voice -> beat lengths (voice, or typing + hold) -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in.
# READ every log under $OD/; an exit code is not evidence. Usage: [OUTMP4=…] ./build.sh   (run, in this order and reading each log: `node seed_make.js <tree>`, `node shots.js <tree>`, `node legacy_shot.js <tree>` (applies, shoots, removes), `./pilot_witness.sh <tree>` (STOP if not 1/0/0), `./witnesses.sh <tree>` (W-CTXHELP-OVERLAY/-DERIVED/-LEGACY, the derived red run; W-HELP-PEEK into out/witness_help_peek.log), `node facts.js <tree>`)
set -e; cd "$(dirname "$0")"
FILM_LANG="${FILM_LANG:-en}"; export FILM_LANG; OD=out; [ "$FILM_LANG" = en ] || OD=out_$FILM_LANG; export OUTD=$OD   # one out folder per language (the lower frame is captured in that language)
mkdir -p $OD/work/fm $OD/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/Help_that_checks_before_you_complete_EN_AFTER_$(date +%F)_v3.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""
FTAG=en; FARG=1.15; [ "$FILM_LANG" = en ] || { FIT=../../prompts/film_narration_fit_edge.py; FTAG=$FILM_LANG; FARG=$FILM_LANG; }   # zh / th: the narration text goes to Microsoft Edge TTS (free, cached by text); English stays the local Kokoro
[ "$FILM_LANG" = th ] && { fc-list | grep -qi "Noto Sans Thai" && echo "§FONT Noto Sans Thai present" > $OD/font.log || { echo "§FONT_FAIL no Noto Sans Thai"; exit 3; }; }
KEYVOL="${KEYVOL:-0.8}"
[ -s $OD/facts.json ] && [ -s $OD/shots.log ] && [ -d $OD/pages ] && grep -q "VERDICT PASS" $OD/facts.log || { echo "§FACTS_MISSING run shots.js and facts.js first"; exit 3; }
node guard.js > $OD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard.log"; exit 3; }
rm -rf $OD/cards; node cards.js $OD/cards > $OD/cards.log 2>&1; grep -q TOO-TALL $OD/cards.log && { echo "§CARD_TOO_TALL see $OD/cards.log"; exit 3; }
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m $FARG > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec; node record.js $OD/rec $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
# zh: split -> gloss (one event per piece, English second line); another non-English cut (de): gloss -> ass_noverlap (its turns are written one line long, no split) -> ass_noverlap (overlapping events are stacked by libass for their whole life; the English path already trims them)
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG > ../../fit.log 2>&1 && { if [ "$FILM_LANG" = zh ]; then cp zh.ass zh_raw.ass && python3 ../../../../../prompts/film_zh_caption_split.py zh_raw.ass zh.ass > ../../caption_split.log && node ../../../gloss.js zh.ass > ../../gloss.log && python3 ../../../../film_neuro/ass_noverlap.py zh.ass > ../../ass_noverlap.log; elif [ "$FILM_LANG" != en ]; then node ../../../gloss.js ${FTAG}.ass > ../../gloss.log && python3 ../../../../film_neuro/ass_noverlap.py ${FTAG}.ass > ../../ass_noverlap.log; else python3 ../../../../film_neuro/ass_noverlap.py ${FTAG}.ass > ../../ass_noverlap.log; fi; node ../../../written.js ${FTAG}.ass > ../../written.log; } && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
# the key sounds under the voice: the picture and the captions are copied as they are, only the sound is mixed (KEYVOL of their own 0.5 peak)
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/$FTAG.ass > $OD/k2.log 2>&1; cat $OD/k2.log | tail -3
python3 capcheck.py $OD/work/fit/$FTAG.ass $OD/rec/film_silent.mp4 "$OUTMP4" > $OD/capcheck.log 2>&1; tail -1 $OD/capcheck.log   # check C: the captions stay in the bottom 170 px
echo "§BUILD_DONE $OUTMP4"
