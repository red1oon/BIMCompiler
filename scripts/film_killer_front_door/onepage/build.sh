#!/bin/bash
# ⚠ DO NOT REMOVE — build film "PDF and Excel are killer apps — ONE PAGE" (prompts/FILM_KILLER_FRONT_DOOR.md, FILM v2), English only (owner 2026-11-27), CPU only (CUDA hidden from the voice, Chrome --disable-gpu, headless, never the owner's display). No paid call: the
# voice is the local Kokoro of the playbook. Nothing is uploaded anywhere. Modelled on scripts/film_cli_in_action/build.sh.
# facts (the REAL page driven, its § lines + the witnesses' verdicts) -> guard voice -> cards -> guard cards -> measure the voice -> beat lengths -> the silent picture -> fit the voice -> two-pass loudnorm mux -> the key sounds mixed in -> numeric film check.
# READ every log under $OD/; an exit code is not evidence. Usage: OOTB=<bim-ootb worktree at origin/main (read only)> WITD=<dir of the witness logs from witnesses.sh> [OUTMP4=…] ./build.sh        (SKIP_FACTS=1 keeps $OD/facts.json and $OD/shots/)
set -e; cd "$(dirname "$0")"
OD=out; export OUTD=$OD; mkdir -p $OD/work/fm $OD/work/fit
if [ "${FILM:-}" = 1 ]; then OUTMP4="${OUTMP4:-$HOME/Videos/PDF_and_Excel_are_killer_apps_ONE_PAGE_FILM1_EN_rc1.mp4}"; else OUTMP4="${OUTMP4:-$HOME/Videos/PDF_and_Excel_are_killer_apps_ONE_PAGE_EN_rc1.mp4}"; fi; [ -e "$OUTMP4" ] && { echo "§REFUSED $OUTMP4 exists (never overwritten); set OUTMP4="; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=../../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=../../film_replication_engine/film6/fit6/mux_two_pass.py; HEAD=../../../prompts/film_narration_ass_head.txt
export CUDA_VISIBLE_DEVICES=""; FTAG=en; FARG=1.15; KEYVOL="${KEYVOL:-0.8}"
for f in keys.py k2.py beatlen.js check_film.js record.js tsv.js; do cmp -s $f ../part3/$f && echo "§REUSED_UNCHANGED $f == part3/$f" || echo "§CHANGED $f differs from part3/$f"; done > $OD/reuse.log
[ -n "$SKIP_FACTS" ] || env -u DBUS_SESSION_BUS_ADDRESS node facts.js > $OD/facts.log 2>&1 || { echo "§FACTS_FAIL see $OD/facts.log"; exit 3; }
node check_ink.js $OD > $OD/ink.log 2>&1 || { echo "§INK_FAIL see $OD/ink.log"; exit 3; }; tail -2 $OD/ink.log
node links.js > $OD/links.log 2>&1 || { echo "§LINKS_FAIL see $OD/links.log"; exit 3; }
node credits.js > $OD/credits.log 2>&1 || { echo "§CREDITS_FAIL see $OD/credits.log"; exit 3; }
node guard.js voice > $OD/guard_voice.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard_voice.log"; exit 3; }
rm -rf $OD/cards; node cards.js $OD/cards > $OD/cards.log 2>&1; grep -q TOO-TALL $OD/cards.log && { echo "§CARD_TOO_TALL see $OD/cards.log"; exit 3; }
node guard.js cards > $OD/guard_cards.log 2>&1 || { echo "§GUARD_FAIL see $OD/guard_cards.log"; exit 3; }
node tsv.js measure $OD/work > $OD/tsv_measure.log 2>&1
cp $HEAD $OD/work/fm/ass_head.txt; (cd $OD/work/fm && rm -f *.wav && FILM_SEC=400 $PY ../../../$FIT ../narration_en.tsv m $FARG > ../../fit_measure.log 2>&1)
node ../../film_terms/beatmin.js $OD/fit_measure.log $OD/beatmin.json > $OD/beatmin.log 2>&1
node beatlen.js $OD/beatmin.json $OD/cards/plan.json $OD/beatlen.json > $OD/beatlen.log 2>&1
rm -rf $OD/rec; node record.js $OD/rec $OD/cards $OD/beatlen.json > $OD/record.log 2>&1
node tsv.js build $OD/work $OD/record.log $OD/cards/plan.json > $OD/tsv_build.log 2>&1
cp $HEAD $OD/work/fit/ass_head.txt; D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $OD/rec/film_silent.mp4)
rm -f $OD/work/film_voice.mp4
(cd $OD/work/fit && rm -f *.wav && FILM_SEC=$D $PY ../../../$FIT ../narration_en.tsv $FTAG $FARG > ../../fit.log 2>&1 && python3 ../../../../../film_neuro/ass_noverlap.py ${FTAG}.ass > ../../ass_noverlap.log && FILM_SEC=$D python3 ../../../$MUX $FTAG ../../rec/film_silent.mp4 ../film_voice.mp4 > ../../mux.log 2>&1)
$PY keys.py $OD/rec/keys.json $D $OD/work/keys.wav > $OD/keys.log 2>&1 || { echo "§KEYS_FAIL see $OD/keys.log"; exit 3; }
# the key sounds under the voice: the picture and the captions are copied as they are, only the sound is mixed (KEYVOL of their own 0.5 peak)
ffmpeg -y -v error -i $OD/work/film_voice.mp4 -i $OD/work/keys.wav -filter_complex "[1:a]volume=$KEYVOL[k];[0:a][k]amix=inputs=2:duration=first:normalize=0[a]" -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUTMP4" > $OD/keysmix.log 2>&1
echo "§KEYSMIX frames=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUTMP4") audio_s=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 "$OUTMP4") video_s=$D" >> $OD/keysmix.log
$PY k2.py $OD $OD/work/film_voice.mp4 "$OUTMP4" $OD/work/fit/$FTAG.ass > $OD/k2.log 2>&1; tail -3 $OD/k2.log
node check_film.js "$OUTMP4" $OD > $OD/film_check.log 2>&1; tail -4 $OD/film_check.log
node check_z.js $OD/cards > $OD/z.log 2>&1; tail -1 $OD/z.log; grep "§T_VERDICT" $OD/cards.log
echo "§BUILD_DONE $OUTMP4"
