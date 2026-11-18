#!/bin/bash
# ⚠ DO NOT REMOVE — build the film "Vibe coding, honestly" (prompts/FILM_VIBE_CODING_LEDGER.md; copied from scripts/film_when_ai_dies/build.sh) end to end, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call. English = local Kokoro.
# the evidence is made BEFORE by facts.js (every typed line run on its pinned tree) -> cards -> guard -> measure the voice -> beat lengths -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in.
# READ every log under out/; an exit code is not evidence. Usage: [OUTMP4=...] ./build.sh
set -e; cd "$(dirname "$0")"
FILM_LANG="${FILM_LANG:-en}"; export FILM_LANG; OD=out; [ "$FILM_LANG" = en ] || OD=out_$FILM_LANG; export OUTD=$OD; mkdir -p $OD/work/fm $OD/work/fit   # one out folder per language; the facts (out/facts.json) are shared
OUTMP4="${OUTMP4:-$HOME/Videos/Vibe_Coding_Honestly_$(echo $FILM_LANG | tr a-z A-Z)_AFTER_$(date +%F)_v1.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""; KEYVOL="${KEYVOL:-0.8}"
FTAG=en; FARG=1.15; FCAP=""; [ "$FILM_LANG" = zh ] && { FIT=../../prompts/film_narration_fit_edge.py; FTAG=zh; FARG=zh; FCAP="../narration_cap.tsv"; export CAP_NATIVE=1; fc-list | grep -qi "Noto Sans CJK SC" || { echo "§FONT_FAIL no Noto Sans CJK SC"; exit 3; }; }   # zh: the text goes to Microsoft Edge TTS (free, cached by text); the voice says A-I / E-R-P / P-H-P, the captions keep AI / ERP / PHP
[ -s out/facts.json ] || { echo "§FACTS_MISSING run facts.js first"; exit 3; }
[ "${SKIP_CARDS:-0}" = 1 ] && [ -s $OD/cards/plan.json ] || { rm -rf $OD/cards; nice -n 19 node cards.js $OD/cards > $OD/cards.log 2>&1; }
grep -q TOO-TALL $OD/cards.log && { echo "§CARD_TOO_TALL see $OD/cards.log"; exit 3; }
node guard.js $OD/cards > $OD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard.log"; exit 3; }; grep '§FILM_GUARD' $OD/guard.log
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=900 $PY ../../../$FIT ../narration_en.tsv m $FARG $FCAP > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec; nice -n 19 node record.js $OD/rec $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG $FCAP > ../../fit.log 2>&1 && { if [ "$FILM_LANG" = zh ]; then cp zh.ass zh_raw.ass && python3 ../../../../../prompts/film_zh_caption_split.py zh_raw.ass zh.ass > ../../caption_split.log; else python3 ../../../../film_neuro/ass_noverlap.py en.ass > ../../ass_noverlap.log; fi; } && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/$FTAG.ass > $OD/k2.log 2>&1; tail -3 $OD/k2.log
echo "§BUILD_DONE $OUTMP4"
