#!/bin/bash
# ⚠ DO NOT REMOVE — build film 5 "CH 0 · One list writes every page" (prompts/FILM_IMMERSIVE_SOFTWARE.md FILM 5; copied from scripts/film_dev_setup/build.sh) end to end, English only, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call. The only network use: the prior-art pages and the guide link (fetch_prior.sh), one plain GET each.
# the facts are made BEFORE by facts.js (the typed commands run for real in the two throwaway bim-ootb worktrees) -> fetch the prior-art pages + check the guide link (§FILM_GUIDE) -> cards -> guard -> measure the voice -> beat lengths (voice, or typing + hold) -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in -> flow check, strip check on the encoded file.
# READ every log under $OD/; an exit code is not evidence. Usage: [OUTMP4=…] ./build.sh   (run `node facts.js` first). Never overwrites: an existing output name gets a _v2, _v3 … suffix.
set -e; cd "$(dirname "$0")"
FILM_LANG="${FILM_LANG:-en}"; export FILM_LANG; OD=out; [ "$FILM_LANG" = en ] || OD=out_$FILM_LANG; export OUTD=$OD   # one out folder per language (the lower frame is captured in that language)
mkdir -p $OD/work/fm $OD/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/One_List_CH0_EN_AFTER_$(date +%F).mp4}"; n=2; B="${OUTMP4%.mp4}"; while [ -e "$OUTMP4" ]; do OUTMP4="${B}_v$n.mp4"; n=$((n+1)); done; echo "§OUTPUT $OUTMP4 (never overwritten)"
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""
FTAG=en; FARG=1.15; [ "$FILM_LANG" = en ] || { FIT=../../prompts/film_narration_fit_edge.py; FTAG=$FILM_LANG; FARG=$FILM_LANG; }   # zh / th: the narration text goes to Microsoft Edge TTS (free, cached by text); English stays the local Kokoro
[ "$FILM_LANG" = th ] && { fc-list | grep -qi "Noto Sans Thai" && echo "§FONT Noto Sans Thai present" > $OD/font.log || { echo "§FONT_FAIL no Noto Sans Thai"; exit 3; }; }
KEYVOL="${KEYVOL:-0.8}"
[ -s $OD/facts.json ] && grep -q "§FACTS VERDICT PASS" $OD/facts.log || { echo "§FACTS_MISSING run facts.js first (it must print §FACTS VERDICT PASS)"; exit 3; }
./fetch_prior.sh > $OD/prior.log 2>&1 || { echo "§PRIOR_FAIL see $OD/prior.log"; exit 3; }; grep "§FILM_GUIDE" $OD/prior.log; grep -q "§FILM_GUIDE .* http=200 anchor=Y" $OD/prior.log || { echo "§GUIDE_FAIL the guide link is not live with its anchor (see $OD/prior.log)"; exit 3; }
rm -rf $OD/cards; node cards.js $OD/cards > $OD/cards.log 2>&1 || { echo "§CARDS_FAIL see $OD/cards.log"; exit 3; }; grep -q TOO-TALL $OD/cards.log && { echo "§CARD_TOO_TALL see $OD/cards.log"; exit 3; }; grep -q "FONT_FAIL" $OD/cards.log && { echo "§FONT_FAIL see $OD/cards.log"; exit 3; }; grep -q CUE_FAIL $OD/cards.log && { echo "§CUE_FAIL see $OD/cards.log"; exit 3; }; grep -q STRIP_FAIL $OD/cards.log && { echo "§STRIP_FAIL see $OD/cards.log"; exit 3; }
node guard.js > $OD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard.log"; exit 3; }   # after the cards and the prior-art fetch (checks D, C, S, T, P read the cards' own log and the fetched copies)
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m $FARG > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec; node record.js $OD/rec $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG > ../../fit.log 2>&1 && { if [ "$FILM_LANG" = zh ]; then cp zh.ass zh_raw.ass && python3 ../../../../../prompts/film_zh_caption_split.py zh_raw.ass zh.ass > ../../caption_split.log; else python3 ../../../../film_neuro/ass_noverlap.py ${FTAG}.ass > ../../ass_noverlap.log; fi; } && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
# the key sounds under the voice: the picture and the captions are copied as they are, only the sound is mixed (KEYVOL of their own 0.5 peak)
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/$FTAG.ass > $OD/k2.log 2>&1; cat $OD/k2.log | tail -3
node flowcheck.js $OD > $OD/flow.log 2>&1; tail -1 $OD/flow.log
CUE_C=$(grep -o "beat=close t=[0-9.]*" $OD/record.log | cut -d= -f3); DUR=$(grep -o "dur=[0-9.]*" $OD/record.log | tail -1 | cut -d= -f2)
python3 stripcheck.py "$OUTMP4" "0:4.0,${CUE_C}:$(python3 -c "print(max(0,${DUR}-0.2))")" > $OD/stripvideo.log 2>&1 || echo "§STRIP_VIDEO_FAIL see $OD/stripvideo.log"; tail -1 $OD/stripvideo.log   # check S on the ENCODED FILE (the cover and the last card carry no strip)
echo "§FILM_FILE frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") dur_s=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUTMP4") size=$(stat -c %s "$OUTMP4")" | tee -a $OD/stripvideo.log
echo "§BUILD_DONE $OUTMP4"
