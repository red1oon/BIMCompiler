#!/bin/bash
# ⚠ DO NOT REMOVE — build the film "UAT, hands on: where to click" (prompts/FILM_UAT_GUIDE.md §5) from recorded takes. CPU only, voice local (Kokoro), no paid call.
# usage: build.sh <takeDir> <workDir> <out.mp4>      (takes: node scenes.js <takeDir> <home> s1 … on the desktop of desk.sh)
# READ every log under <workDir>/ (§COMP_* §NARR_* §SOUNDS_* §FILM_CHECKS_*); an exit code is not evidence. The output is never overwritten and never pushed.
set -e; cd "$(dirname "$0")"; H=$(pwd)
TAKE=$(realpath "$1"); WK=$(realpath -m "$2"); OUT="$3"; [ -e "$OUT" ] && { echo "§REFUSED $OUT exists (never overwritten)"; exit 5; }
PY=~/.local/share/film_narration/venv/bin/python; FIT=$H/../film_replication_engine/film6/fit6/fit_kokoro_v3_k.py; MUX=$H/../film_replication_engine/film6/fit6/mux_two_pass.py
grep -q "§FILM_SCENES_VERDICT PASS" $TAKE/scenes.log && ! grep -q "§FILM_SCENES_VERDICT FAIL" $TAKE/scenes.log || { echo "§REFUSED the takes did not all pass: read $TAKE/scenes.log (a FAIL is a re-take, never cut around; a scene added to a take folder later (§5.12) must not leave a FAIL line)"; exit 4; }
export CUDA_VISIBLE_DEVICES=""; mkdir -p $WK/fm $WK/fit; cp ass_head.txt $WK/fm/; cp ass_head.txt $WK/fit/
$PY compose.py tsv $TAKE $WK > $WK/comp_tsv.log 2>&1 || { echo "§BUILD_FAIL compose tsv, see $WK/comp_tsv.log"; exit 3; }
(cd $WK/fm && rm -f *.wav && FILM_SEC=2000 $PY $FIT ../narration.tsv m 1.15 > ../fit_measure.log 2>&1)
$PY compose.py render $TAKE $WK $WK/fm > $WK/comp.log 2>&1 || { echo "§BUILD_FAIL compose render, see $WK/comp.log"; exit 3; }
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $WK/silent.mp4)
rm -f $WK/voice.mp4; (cd $WK/fit && rm -f *.wav && FILM_SEC=$D $PY $FIT ../narration.tsv en 1.15 > ../fit.log 2>&1 && FILM_SEC=$D python3 $MUX en ../silent.mp4 ../voice.mp4 > ../mux.log 2>&1)
$PY sounds.py $WK/sounds.json $D $WK/sounds.wav > $WK/sounds.log 2>&1 || { echo "§BUILD_FAIL sounds, see $WK/sounds.log"; exit 3; }
# the keys and clicks under the voice: picture and captions copied as they are, only the sound mixed
ffmpeg -y -v error -i $WK/voice.mp4 -i $WK/sounds.wav -filter_complex "[1:a]volume=0.8[k];[0:a][k]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]" -ar 48000 -map 0:v -c:v copy -map "[a]" -c:a aac -b:a 192k "$OUT"
# checks (numbers, not looks): frames = the picture's, loudness, the long silences, every line fitted
FR=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$OUT"); FR0=$(grep -o 'frames=[0-9]*' $WK/comp.log | tail -1 | cut -d= -f2)
LU=$(ffmpeg -nostats -i "$OUT" -filter_complex ebur128 -f null - 2>&1 | grep -E '^\s+I:' | tail -1 | awk '{print $2}')
SIL=$(ffmpeg -nostats -i "$OUT" -af silencedetect=noise=-40dB:d=4 -f null - 2>&1 | grep -o 'silence_duration: [0-9.]*' | awk '{printf "%s ", $2}')
NF=$(grep -c '§NARR_FIT' $WK/fit.log || true); ND=$(grep '§NARR_FIT' $WK/fit.log | grep -c -- '-> DETAIL' || true); NW=$(grep '§NARR_TONE' $WK/fit.log | grep -c WRONG || true)
echo "§FILM_CHECKS frames=$FR picture=$FR0 film_s=$D LUFS=$LU silences_ge4s=[$SIL] lines=$NF detail=$ND tone_wrong=$NW $(tail -2 $WK/sounds.log | head -1)" | tee $WK/checks.log
ok=1; [ "$FR" = "$FR0" ] || ok=0; [ "$NF" = "$ND" ] || ok=0; [ "$NW" = 0 ] || ok=0; grep -q 'SOUNDS_VERDICT PASS' $WK/sounds.log || ok=0
# §5.11: the §5.4 bars are gated, not only printed
MS=$(echo "$SIL" | tr ' ' '\n' | sort -g | tail -1); MS=${MS:-0}; BAD=""
awk -v m=$MS 'BEGIN{exit !(m <= 8.0)}' || BAD="$BAD silence_max=$MS>8.0"; awk -v l=$LU 'BEGIN{exit !(l >= -17 && l <= -15)}' || BAD="$BAD LUFS=${LU}_not_-16+-1"; if [ "${FILM_PLAN:-plan}" = plan ] || [ -n "$FILM_MAX_S" ]; then MX=${FILM_MAX_S:-300}; awk -v d=$D -v m=$MX 'BEGIN{exit !(d <= m)}' || BAD="$BAD film_s=$D>$MX"; else echo "§FILM_CHECKS_LENGTH measured film_s=$D (not gated: §5.15, Part II has no length target until the owner sets one; FILM_MAX_S gates it)" | tee -a $WK/checks.log; fi
[ -n "$BAD" ] && { ok=0; echo "§FILM_CHECKS_BARS FAIL$BAD" | tee -a $WK/checks.log; } || echo "§FILM_CHECKS_BARS PASS silence_max=$MS LUFS=$LU film_s=$D" | tee -a $WK/checks.log
echo "§FILM_CHECKS_VERDICT $([ $ok = 1 ] && echo PASS || echo FAIL) -> $OUT" | tee -a $WK/checks.log
