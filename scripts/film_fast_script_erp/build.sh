#!/bin/bash
# ⚠ DO NOT REMOVE — build "Fast Script ERP" (prompts/FILM_COMMAND_LINE_ERP.md "CH fast-script-erp"; cloned from film_red1_shell) end to end, English, CPU only (CUDA hidden from the voice, Chrome --disable-gpu). No paid call.
# record the real `red1` shell in a pty (rec.py) -> facts + checks -> guard -> stills (one full-frame terminal) -> measure the voice -> beat lengths -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in -> K2.
# READ every log under out/; an exit code is not evidence. Usage: [OOTB=/tmp/wt-film-fse-ootb] [OUTMP4=…] ./build.sh        (SKIP_REC=1 keeps out/rec/ and builds from that recording)
set -e; cd "$(dirname "$0")"
FILM_LANG="${FILM_LANG:-en}"; export FILM_LANG; OD=out; [ "$FILM_LANG" = en ] || OD=out_$FILM_LANG; export OUTD=$OD   # zh: the SAME recording (out/rec, copied to out_zh/rec: the shell's text is English), only the voice, the captions and the title/end cards change
mkdir -p $OD/work/fm $OD/work/fit
OUTMP4="${OUTMP4:-$HOME/Videos/Fast_Script_ERP_$(echo $FILM_LANG | tr a-z A-Z)_rc2.mp4}"; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""
FTAG=en; FARG=1.15; [ "$FILM_LANG" = en ] || { FIT=../../prompts/film_narration_fit_edge.py; FTAG=$FILM_LANG; FARG=$FILM_LANG; }   # zh: the narration text goes to Microsoft Edge TTS (free, cached by text, as the earlier Mandarin films); English stays the local Kokoro
[ "$FILM_LANG" = th ] && { fc-list | grep -qi "Noto Sans Thai" && echo "§FONT Noto Sans Thai present" > $OD/font.log || { echo "§FONT_FAIL no Noto Sans Thai"; exit 3; }; export FIT_MAXSPEED=1.0; }   # Thai: NO speed-up (the playbook: fit by shortening the translation)
[ "$FILM_LANG" = en ] || { [ -d out/rec ] || { echo "§ZH_NEEDS out/rec (the English recording)"; exit 3; }; mkdir -p $OD; rm -rf $OD/rec; cp -r out/rec $OD/rec; SKIP_REC=1; }
# a step that comes back empty/late under load is RE-RECORDED, never shipped: up to 3 recordings, each must pass facts.js (the logs of failed attempts are kept in out/attempts/)
mkdir -p $OD/attempts; export OOTB="${OOTB:-/tmp/wt-film-fse-ootb}"
if [ -z "$SKIP_REC" ]; then ok=0; for A in 1 2 3; do rm -rf $OD/rec; $PY rec.py $OD/rec > $OD/rec.log 2>&1 && node facts.js > $OD/facts.log 2>&1 && { ok=1; break; }; echo "§REC_RETRY attempt $A did not pass"; cp $OD/rec.log $OD/attempts/rec.$A.log; cp $OD/facts.log $OD/attempts/facts.$A.log 2>/dev/null; cp $OD/rec/red1.err $OD/attempts/red1.$A.err 2>/dev/null; done; [ $ok = 1 ] || { echo "§REC_FAIL three recordings did not pass; see $OD/attempts"; exit 3; }; fi
node facts.js > $OD/facts.log 2>&1 || { echo "§FACTS_FAIL see $OD/facts.log"; exit 3; }
node guard.js > $OD/guard.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard.log"; exit 3; }
rm -rf $OD/cards; node cards.js $OD/cards > $OD/cards.log 2>&1 || { echo "§CARDS_FAIL see $OD/cards.log"; exit 3; }
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m $FARG > ../../fit_measure.log 2>&1)
node ../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec_video; node record.js $OD/rec_video $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec_video/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG > ../../fit.log 2>&1 && { if [ "$FILM_LANG" = zh ]; then cp zh.ass zh_raw.ass && python3 ../../../../../prompts/film_zh_caption_split.py zh_raw.ass zh.ass > ../../caption_split.log; else python3 ../../../../film_neuro/ass_noverlap.py $FTAG.ass > ../../ass_noverlap.log; fi; } && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec_video/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec_video/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
# the key sounds under the voice: the picture and the captions are copied as they are, only the sound is mixed (KEYVOL of their own 0.5 peak)
KEYVOL="${KEYVOL:-0.8}"
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/$FTAG.ass > $OD/k2.log 2>&1; tail -3 $OD/k2.log
echo "§BUILD_DONE $OUTMP4"
